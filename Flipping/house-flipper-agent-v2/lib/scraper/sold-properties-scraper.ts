import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { PrismaClient, Portal } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Scraper de propiedades vendidas en Idealista
 *
 * NOTA: Idealista requiere cuenta premium para ver "vendidos"
 * Alternativas:
 * 1. Usar ScraperAPI/Bright Data con cookies de sesión premium
 * 2. Usar Idealista Data API (oficial, ~50€/mes)
 * 3. Scraping de otras fuentes (Fotocasa, etc.)
 */

interface SoldPropertyData {
  portal: Portal;
  externalId?: string;
  url: string;
  title: string;
  address: string;
  zone: string;
  latitude: number;
  longitude: number;
  salePrice: number;
  salePricePerM2: number;
  listingPrice?: number;
  surface: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior: boolean;
  hasLift: boolean;
  buildYear?: number;
  condition?: string;
  wasReformed: boolean;
  reformQuality?: string;
  listingDate?: Date;
  saleDate: Date;
  daysOnMarket?: number;
  dataSource: string;
  reliability: number;
  notes?: string;
}

/**
 * MÉTODO 1: Scraping de Idealista "Vendidos"
 * Requiere cuenta premium o proxy con sesión
 */
export async function scrapeIdealistaSoldProperties(
  zone: string = 'guindalera',
  maxPages: number = 3
): Promise<SoldPropertyData[]> {
  console.log(`🔍 Scraping Idealista sold properties in ${zone}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  const soldProperties: SoldPropertyData[] = [];

  try {
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://www.idealista.com/venta-viviendas/madrid-madrid/${zone}/con-vendidos/pagina-${pageNum}.htm`;
      console.log(`📄 Scraping page ${pageNum}: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Esperar a que cargue el contenido
      await page.waitForSelector('.item-info-container', { timeout: 10000 }).catch(() => {
        console.log('⚠️  No se encontraron propiedades vendidas (puede requerir cuenta premium)');
      });

      const html = await page.content();
      const $ = cheerio.load(html);

      // Parsear propiedades
      $('.item').each((_, element) => {
        try {
          const $item = $(element);

          // Verificar si es una propiedad vendida
          const isSold = $item.find('.item-sold-label').length > 0;
          if (!isSold) return;

          // Extraer datos básicos
          const title = $item.find('.item-link').text().trim();
          const url = 'https://www.idealista.com' + $item.find('.item-link').attr('href');
          const externalId = url.match(/\/inmueble\/(\d+)\//)?.[1];

          // Precio
          const priceText = $item.find('.item-price').text().trim();
          const salePrice = parseInt(priceText.replace(/[^\d]/g, ''));

          // Características
          const detailsText = $item.find('.item-detail-char').text();
          const surfaceMatch = detailsText.match(/(\d+)\s*m²/);
          const roomsMatch = detailsText.match(/(\d+)\s*hab/);
          const bathroomsMatch = detailsText.match(/(\d+)\s*baño/);
          const floorMatch = detailsText.match(/(\d+)º\s*planta/);

          const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : 0;
          const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;
          const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : undefined;
          const floor = floorMatch ? parseInt(floorMatch[1]) : undefined;

          // Ubicación
          const address = $item.find('.item-location').text().trim();

          // Condiciones
          const features = $item.find('.item-tags').text().toLowerCase();
          const isExterior = features.includes('exterior');
          const hasLift = features.includes('ascensor');
          const wasReformed = features.includes('reformado') || features.includes('reforma');

          // Verificar datos mínimos
          if (!title || !salePrice || !surface || surface < 50) {
            return; // Skip invalid entries
          }

          const salePricePerM2 = Math.round(salePrice / surface);

          // NOTA: Idealista no siempre muestra coordenadas en listado
          // Necesitarías entrar a cada propiedad o usar API de geocoding

          const soldProperty: SoldPropertyData = {
            portal: Portal.IDEALISTA,
            externalId,
            url,
            title,
            address,
            zone: zone.toUpperCase(),
            // Coordenadas dummy - en producción usar geocoding API
            latitude: 40.43 + Math.random() * 0.01,
            longitude: -3.67 + Math.random() * 0.01,
            salePrice,
            salePricePerM2,
            surface,
            rooms,
            bathrooms,
            floor,
            isExterior,
            hasLift,
            wasReformed,
            condition: wasReformed ? 'reformado' : undefined,
            reformQuality: wasReformed ? 'media' : undefined,
            saleDate: new Date(), // En producción extraer fecha real
            dataSource: 'scraped',
            reliability: 6, // Medio-bajo sin verificar detalles
            notes: 'Scraped from Idealista sold listings',
          };

          soldProperties.push(soldProperty);
        } catch (error) {
          console.error('Error parsing property:', error);
        }
      });

      // Delay entre páginas
      await page.waitForTimeout(2000 + Math.random() * 2000);
    }
  } catch (error) {
    console.error('Error scraping Idealista:', error);
  } finally {
    await browser.close();
  }

  console.log(`✅ Found ${soldProperties.length} sold properties`);
  return soldProperties;
}

/**
 * MÉTODO 2: Usar API de Idealista Data (RECOMENDADO)
 * Requiere suscripción a Idealista Data
 */
export async function fetchFromIdealistaDataAPI(
  zone: string,
  apiKey: string
): Promise<SoldPropertyData[]> {
  console.log(`📊 Fetching from Idealista Data API for ${zone}...`);

  // Endpoint de ejemplo (verificar documentación oficial)
  const endpoint = `https://api.idealista.com/3.5/es/search`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        operation: 'sale',
        propertyType: 'homes',
        center: '40.4335,-3.6625', // Coordenadas de la zona
        distance: '2000', // 2km radio
        maxItems: '50',
        sold: 'true', // Solo vendidas
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transformar datos de API a nuestro formato
    const soldProperties: SoldPropertyData[] = data.elementList.map((property: any) => ({
      portal: Portal.IDEALISTA,
      externalId: property.propertyCode,
      url: property.url,
      title: property.description || property.address,
      address: property.address,
      zone: zone.toUpperCase(),
      latitude: property.latitude,
      longitude: property.longitude,
      salePrice: property.price,
      salePricePerM2: Math.round(property.price / property.size),
      surface: property.size,
      rooms: property.rooms,
      bathrooms: property.bathrooms,
      floor: property.floor,
      isExterior: property.exterior || false,
      hasLift: property.hasLift || false,
      wasReformed: property.detailedType?.subTypology === 'reformed',
      condition: property.detailedType?.subTypology,
      saleDate: new Date(property.lastUpdate),
      dataSource: 'api',
      reliability: 10, // Máxima fiabilidad (datos oficiales)
      notes: 'Fetched from Idealista Data API',
    }));

    console.log(`✅ Fetched ${soldProperties.length} sold properties from API`);
    return soldProperties;
  } catch (error) {
    console.error('Error fetching from Idealista Data API:', error);
    return [];
  }
}

/**
 * MÉTODO 3: Scraping de Fotocasa vendidas
 */
export async function scrapeFotocasaSoldProperties(
  zone: string,
  maxPages: number = 3
): Promise<SoldPropertyData[]> {
  console.log(`🔍 Scraping Fotocasa sold properties in ${zone}...`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const soldProperties: SoldPropertyData[] = [];

  try {
    const url = `https://www.fotocasa.es/es/comprar/viviendas/madrid-capital/vendidas/l`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const html = await page.content();
    const $ = cheerio.load(html);

    // Fotocasa tiene estructura similar
    // Adaptar selectores según estructura actual del sitio

    console.log('⚠️  Fotocasa scraper pendiente de implementar selectores específicos');
  } catch (error) {
    console.error('Error scraping Fotocasa:', error);
  } finally {
    await browser.close();
  }

  return soldProperties;
}

/**
 * Guarda propiedades vendidas en la base de datos
 */
export async function saveSoldProperties(properties: SoldPropertyData[]) {
  console.log(`💾 Saving ${properties.length} sold properties to database...`);

  let saved = 0;
  let skipped = 0;

  for (const property of properties) {
    try {
      // Verificar si ya existe
      const existing = await prisma.soldProperty.findUnique({
        where: {
          portal_externalId: {
            portal: property.portal,
            externalId: property.externalId || 'unknown',
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.soldProperty.create({
        data: property,
      });

      saved++;
    } catch (error: any) {
      console.error(`Error saving property ${property.title}:`, error.message);
    }
  }

  console.log(`✅ Saved ${saved} new properties, skipped ${skipped} duplicates`);
  return { saved, skipped };
}

/**
 * Función principal para ejecutar scraping
 */
export async function runSoldPropertiesScraper(options: {
  zones?: string[];
  maxPages?: number;
  useAPI?: boolean;
  apiKey?: string;
}) {
  const { zones = ['guindalera', 'delicias', 'pacifico'], maxPages = 3, useAPI = false, apiKey } = options;

  console.log('\n🚀 Starting sold properties scraper...\n');

  const allProperties: SoldPropertyData[] = [];

  for (const zone of zones) {
    if (useAPI && apiKey) {
      // Método preferido: usar API oficial
      const properties = await fetchFromIdealistaDataAPI(zone, apiKey);
      allProperties.push(...properties);
    } else {
      // Método alternativo: scraping
      const properties = await scrapeIdealistaSoldProperties(zone, maxPages);
      allProperties.push(...properties);
    }

    // Delay entre zonas
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // Guardar en BD
  await saveSoldProperties(allProperties);

  console.log('\n✨ Scraping completed!\n');
  return allProperties;
}
