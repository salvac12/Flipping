import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { PrismaClient, Portal } from '@prisma/client';

const prisma = new PrismaClient();

export interface ClikaLiaProperty {
  externalId: string;
  url: string;
  title: string;
  address: string;
  zone: string;
  city: string;
  latitude: number;
  longitude: number;
  price: number;
  pricePerM2: number;
  originalPrice?: number;
  surface: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior: boolean;
  hasLift: boolean;
  buildYear?: number;
  condition: string;
  wasReformed: boolean;
  reformQuality?: string;
  images?: string[];
  description?: string;
}

/**
 * Scraper específico para Clikalia
 * Clikalia es una inmobiliaria que vende principalmente propiedades reformadas
 */
export async function scrapeClikaLia(options: {
  zones?: string[];
  maxProperties?: number;
  onlyReformed?: boolean;
}): Promise<ClikaLiaProperty[]> {
  const { zones = [], maxProperties = 50, onlyReformed = true } = options;

  console.log('🔍 Starting Clikalia scraper...');
  console.log(`   Options: zones=${zones.join(',') || 'all'}, max=${maxProperties}, reformed=${onlyReformed}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  const properties: ClikaLiaProperty[] = [];

  try {
    // Construir URL con filtros
    let url = 'https://clikalia.es/comprar/madrid';

    const params = new URLSearchParams();
    if (onlyReformed) {
      params.append('conditionStatus', 'RENOVATED');
    }
    if (zones.length > 0) {
      // Clikalia usa nombres de zona específicos, mapear si es necesario
      params.append('neighborhoods', zones.join(','));
    }

    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    console.log(`📄 Fetching: ${fullUrl}`);

    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });

    // Esperar a que carguen las propiedades
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 }).catch(() => {
      console.log('⚠️  No property cards found');
    });

    // Extraer datos de la página
    const html = await page.content();
    const $ = cheerio.load(html);

    // Buscar el JSON embebido con datos de propiedades
    const scriptTags = $('script[type="application/json"]');
    let propertiesData: any[] = [];

    scriptTags.each((_, element) => {
      const scriptContent = $(element).html();
      if (scriptContent) {
        try {
          const jsonData = JSON.parse(scriptContent);

          // Buscar propiedades en el JSON (estructura puede variar)
          if (jsonData.props?.pageProps?.properties) {
            propertiesData = jsonData.props.pageProps.properties;
          } else if (jsonData.properties) {
            propertiesData = jsonData.properties;
          } else if (Array.isArray(jsonData)) {
            propertiesData = jsonData;
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    });

    // Si no encontramos JSON, parsear HTML directamente
    if (propertiesData.length === 0) {
      console.log('📋 Parsing properties from HTML...');

      $('[data-testid="property-card"]').each((idx, element) => {
        if (properties.length >= maxProperties) return false;

        try {
          const $card = $(element);

          // Extraer datos del HTML
          const urlPath = $card.find('a').first().attr('href') || '';
          const url = urlPath.startsWith('http') ? urlPath : `https://clikalia.es${urlPath}`;
          const externalId = urlPath.match(/[-](\d+)$/)?.[1] || `clikalia-${idx}`;

          const title = $card.find('[data-testid="property-title"]').text().trim() ||
                       $card.find('h3, h2').first().text().trim();

          const priceText = $card.find('[data-testid="property-price"]').text().trim() ||
                           $card.find('.price').text().trim();
          const price = parseInt(priceText.replace(/[^\d]/g, ''));

          const detailsText = $card.text();
          const surfaceMatch = detailsText.match(/(\d+)\s*m[²2]/);
          const roomsMatch = detailsText.match(/(\d+)\s*(hab|dorm)/i);
          const bathroomsMatch = detailsMatch.match(/(\d+)\s*baño/i);

          const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : 0;
          const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;
          const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : undefined;

          const address = $card.find('[data-testid="property-address"]').text().trim() ||
                         $card.find('.address').text().trim() || title;

          // Determinar estado de reforma
          const cardText = $card.text().toLowerCase();
          const wasReformed = cardText.includes('reformado') ||
                            cardText.includes('renovado') ||
                            onlyReformed; // Si filtramos por reformados, asumimos que lo están

          if (!price || !surface || surface < 40) {
            return; // Skip invalid entries
          }

          const property: ClikaLiaProperty = {
            externalId,
            url,
            title,
            address,
            zone: extractZoneFromAddress(address),
            city: 'Madrid',
            latitude: 40.4168 + (Math.random() - 0.5) * 0.1, // Geocoding dummy, mejorar después
            longitude: -3.7038 + (Math.random() - 0.5) * 0.1,
            price,
            pricePerM2: Math.round(price / surface),
            surface,
            rooms,
            bathrooms,
            isExterior: cardText.includes('exterior'),
            hasLift: cardText.includes('ascensor'),
            condition: wasReformed ? 'reformado' : 'buen estado',
            wasReformed,
            reformQuality: wasReformed ? 'media' : undefined,
          };

          properties.push(property);
        } catch (error) {
          console.error('Error parsing property card:', error);
        }
      });
    } else {
      // Procesar datos del JSON
      console.log(`📊 Found ${propertiesData.length} properties in JSON data`);

      for (const propData of propertiesData.slice(0, maxProperties)) {
        try {
          const property: ClikaLiaProperty = {
            externalId: propData.id || propData.propertyId || propData.reference,
            url: propData.url || `https://clikalia.es/comprar/inmueble/${propData.slug || propData.id}`,
            title: propData.title || propData.name || propData.address,
            address: propData.address || propData.location?.address || '',
            zone: propData.neighborhood || propData.zone || extractZoneFromAddress(propData.address || ''),
            city: propData.city || 'Madrid',
            latitude: propData.latitude || propData.location?.latitude || 40.4168,
            longitude: propData.longitude || propData.location?.longitude || -3.7038,
            price: propData.price || propData.currentPrice || 0,
            pricePerM2: propData.pricePerM2 || Math.round(propData.price / propData.surface),
            originalPrice: propData.originalPrice || propData.previousPrice,
            surface: propData.surface || propData.size || propData.builtArea || 0,
            rooms: propData.rooms || propData.bedrooms,
            bathrooms: propData.bathrooms,
            floor: propData.floor,
            isExterior: propData.exterior || propData.isExterior || false,
            hasLift: propData.hasLift || propData.elevator || false,
            buildYear: propData.buildYear || propData.yearBuilt,
            condition: propData.condition || (propData.renovated ? 'reformado' : 'buen estado'),
            wasReformed: propData.renovated || propData.reformed || propData.condition === 'reformado' || onlyReformed,
            reformQuality: propData.renovated ? 'media' : undefined,
            images: propData.images || propData.photos || [],
            description: propData.description,
          };

          if (property.price > 0 && property.surface > 0) {
            properties.push(property);
          }
        } catch (error) {
          console.error('Error processing property data:', error);
        }
      }
    }

    console.log(`✅ Scraped ${properties.length} properties from Clikalia`);
  } catch (error) {
    console.error('Error scraping Clikalia:', error);
  } finally {
    await browser.close();
  }

  return properties;
}

/**
 * Extrae el nombre de la zona de una dirección
 */
function extractZoneFromAddress(address: string): string {
  const addressLower = address.toLowerCase();

  const zoneKeywords: Record<string, string[]> = {
    'GUINDALERA': ['guindalera', 'francisco silvela', 'lopez de hoyos'],
    'DELICIAS': ['delicias', 'palos de la frontera', 'embajadores'],
    'PACIFICO': ['pacifico', 'pacífico', 'doctor esquerdo', 'o\'donnell'],
    'PROSPERIDAD': ['prosperidad', 'maria de molina', 'avenida america'],
    'RETIRO': ['retiro', 'conde de peñalver', 'alcala'],
    'ARGUELLES': ['arguelles', 'argüelles', 'gaztambide', 'vallehermoso', 'guzman el bueno'],
  };

  for (const [zone, keywords] of Object.entries(zoneKeywords)) {
    if (keywords.some(keyword => addressLower.includes(keyword))) {
      return zone;
    }
  }

  return 'OTROS';
}

/**
 * Guarda propiedades de Clikalia en la base de datos como comparables
 */
export async function saveClikaLiaProperties(properties: ClikaLiaProperty[]) {
  console.log(`💾 Saving ${properties.length} Clikalia properties...`);

  let saved = 0;
  let skipped = 0;
  let errors = 0;

  for (const property of properties) {
    try {
      // Verificar si ya existe
      const existing = await prisma.soldProperty.findFirst({
        where: {
          portal: Portal.IDEALISTA, // Usamos IDEALISTA como portal genérico por ahora
          externalId: `clikalia-${property.externalId}`,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Guardar como propiedad vendida (aunque esté en venta, sirve como comparable)
      await prisma.soldProperty.create({
        data: {
          portal: Portal.IDEALISTA,
          externalId: `clikalia-${property.externalId}`,
          url: property.url,
          title: property.title,
          address: property.address,
          zone: property.zone,
          city: property.city,
          latitude: property.latitude,
          longitude: property.longitude,
          salePrice: property.price,
          salePricePerM2: property.pricePerM2,
          listingPrice: property.originalPrice,
          surface: property.surface,
          rooms: property.rooms,
          bathrooms: property.bathrooms,
          floor: property.floor,
          isExterior: property.isExterior,
          hasLift: property.hasLift,
          buildYear: property.buildYear,
          condition: property.condition,
          wasReformed: property.wasReformed,
          reformQuality: property.reformQuality,
          saleDate: new Date(), // Fecha actual (son propiedades activas usadas como comparables)
          dataSource: 'clikalia',
          reliability: 9, // Alta fiabilidad (Clikalia es fuente profesional)
          notes: `Scraped from Clikalia. Reformed properties from professional seller.`,
        },
      });

      saved++;
    } catch (error: any) {
      console.error(`Error saving property ${property.title}:`, error.message);
      errors++;
    }
  }

  console.log(`✅ Saved: ${saved} | Skipped: ${skipped} | Errors: ${errors}`);
  return { saved, skipped, errors };
}

/**
 * Scrape y guarda propiedades de Clikalia en un solo paso
 */
export async function runClikaLiaScraper(options?: {
  zones?: string[];
  maxProperties?: number;
  onlyReformed?: boolean;
}) {
  console.log('\n🚀 Running Clikalia scraper...\n');

  const properties = await scrapeClikaLia(options || {});
  const result = await saveClikaLiaProperties(properties);

  console.log('\n✨ Clikalia scraping completed!\n');
  return { properties, ...result };
}
