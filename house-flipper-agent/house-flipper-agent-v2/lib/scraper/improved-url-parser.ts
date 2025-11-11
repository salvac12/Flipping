import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

export interface ParsedProperty {
  portal: 'IDEALISTA' | 'FOTOCASA' | 'PISOS_COM' | 'CLIKALIA' | 'UNKNOWN';
  url: string;
  title: string;
  price: number;
  surface: number;
  pricePerM2: number;
  address: string;
  zone?: string;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior: boolean;
  hasLift: boolean;
  buildYear?: number;
  condition?: string;
  wasReformed: boolean;
  reformQuality?: string;
  description?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
}

/**
 * Detecta el portal desde la URL
 */
export function detectPortal(url: string): ParsedProperty['portal'] {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('idealista.com')) return 'IDEALISTA';
  if (urlLower.includes('fotocasa.es')) return 'FOTOCASA';
  if (urlLower.includes('pisos.com')) return 'PISOS_COM';
  if (urlLower.includes('clikalia')) return 'CLIKALIA';
  if (urlLower.includes('gilmar.es')) return 'IDEALISTA'; // Gilmar usa IDEALISTA en enum

  return 'UNKNOWN';
}

/**
 * Parser mejorado con múltiples estrategias de extracción
 */
export async function parsePropertyURL(url: string): Promise<ParsedProperty | null> {
  const portal = detectPortal(url);

  console.log(`🔍 Parsing URL from ${portal}: ${url}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    // Navegar a la página
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Esperar un poco para que cargue el contenido dinámico
    await page.waitForTimeout(3000);

    const html = await page.content();
    const $ = cheerio.load(html);

    // Parser específico para Gilmar
    if (url.includes('gilmar.es')) {
      const gilmarData = extractFromGilmar($);
      if (gilmarData && gilmarData.price && gilmarData.surface) {
        return buildPropertyObject(portal, url, gilmarData);
      }
    }

    // Parser específico para Clikalia
    if (portal === 'CLIKALIA') {
      const clikaData = extractFromClikalia($);
      if (clikaData && clikaData.price && clikaData.surface) {
        return buildPropertyObject(portal, url, clikaData);
      }
    }

    // Estrategia 1: Buscar JSON-LD (usado por muchos sitios)
    let data = extractFromJSONLD($);

    // Estrategia 2: Buscar en meta tags
    if (!data || !data.price) {
      data = { ...data, ...extractFromMetaTags($) };
    }

    // Estrategia 3: Buscar en el HTML usando selectores generales
    if (!data || !data.price) {
      data = { ...data, ...extractFromHTML($, portal) };
    }

    // Estrategia 4: Buscar en texto plano
    if (!data || !data.price) {
      data = { ...data, ...extractFromText($) };
    }

    // Validar que tenemos los datos mínimos
    if (!data || !data.price || !data.surface) {
      console.error('❌ Could not extract price or surface');
      console.log('Extracted data:', data);
      return null;
    }

    return buildPropertyObject(portal, url, data);

  } catch (error: any) {
    console.error('❌ Error parsing URL:', error.message);
    return null;
  } finally {
    await browser.close();
  }
}

/**
 * Extrae datos de JSON-LD
 */
function extractFromJSONLD($: cheerio.CheerioAPI): Partial<ParsedProperty> {
  const data: any = {};

  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const json = JSON.parse($(element).html() || '{}');

      if (json['@type'] === 'Apartment' || json['@type'] === 'SingleFamilyResidence') {
        if (json.offers?.price) data.price = parseFloat(json.offers.price);
        if (json.name) data.title = json.name;
        if (json.address?.streetAddress) data.address = json.address.streetAddress;
        if (json.floorSize) data.surface = parseFloat(json.floorSize);
        if (json.numberOfRooms) data.rooms = parseInt(json.numberOfRooms);
        if (json.geo?.latitude) data.latitude = parseFloat(json.geo.latitude);
        if (json.geo?.longitude) data.longitude = parseFloat(json.geo.longitude);
      }
    } catch (e) {
      // Ignorar errores de parsing JSON
    }
  });

  return data;
}

/**
 * Extrae datos de meta tags
 */
function extractFromMetaTags($: cheerio.CheerioAPI): Partial<ParsedProperty> {
  const data: any = {};

  // Precio
  const priceContent = $('meta[property="og:price:amount"]').attr('content') ||
                      $('meta[property="product:price:amount"]').attr('content');
  if (priceContent) data.price = parseFloat(priceContent.replace(/[^\d.]/g, ''));

  // Título
  const titleContent = $('meta[property="og:title"]').attr('content');
  if (titleContent) data.title = titleContent;

  // Descripción
  const descContent = $('meta[property="og:description"]').attr('content');
  if (descContent) data.description = descContent;

  return data;
}

/**
 * Extrae datos del HTML usando selectores comunes
 */
function extractFromHTML($: cheerio.CheerioAPI, portal: string): Partial<ParsedProperty> {
  const data: any = {};
  const fullText = $('body').text();

  // Título - probar múltiples selectores
  data.title = $('h1').first().text().trim() ||
               $('[data-test="heading"]').text().trim() ||
               $('.property-title').text().trim() ||
               '';

  // Precio - buscar en selectores comunes
  let priceText = $('.price').first().text() ||
                  $('.info-data-price').text() ||
                  $('[data-test="price"]').text() ||
                  '';

  // Si no encontró precio, buscar en el texto
  if (!priceText) {
    const priceMatch = fullText.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€/);
    if (priceMatch) priceText = priceMatch[1];
  }

  if (priceText) {
    data.price = parseFloat(priceText.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''));
  }

  // Superficie
  const surfaceMatch = fullText.match(/(\d+)\s*m[²2]/);
  if (surfaceMatch) data.surface = parseInt(surfaceMatch[1]);

  // Habitaciones
  const roomsMatch = fullText.match(/(\d+)\s*(?:hab|dormitorio|habitacion)/i);
  if (roomsMatch) data.rooms = parseInt(roomsMatch[1]);

  // Baños
  const bathsMatch = fullText.match(/(\d+)\s*baño/i);
  if (bathsMatch) data.bathrooms = parseInt(bathsMatch[1]);

  // Planta
  const floorMatch = fullText.match(/(\d+)[ºª]?\s*planta/i);
  if (floorMatch) data.floor = parseInt(floorMatch[1]);

  // Dirección
  data.address = $('.address').first().text().trim() ||
                 $('.main-info__title-minor').text().trim() ||
                 $('[data-test="address"]').text().trim() ||
                 '';

  // Características booleanas
  const textLower = fullText.toLowerCase();
  data.wasReformed = textLower.includes('reformado') || textLower.includes('renovado') || textLower.includes('reformada');
  data.isExterior = textLower.includes('exterior');
  data.hasLift = textLower.includes('ascensor');

  // Calidad de reforma
  if (data.wasReformed) {
    if (textLower.includes('reforma integral') || textLower.includes('totalmente reformado')) {
      data.reformQuality = 'alta';
    } else if (textLower.includes('parcialmente reformado')) {
      data.reformQuality = 'media';
    } else {
      data.reformQuality = 'media';
    }
  }

  // Año de construcción
  const yearMatch = fullText.match(/(?:construido|año|building)\s*(?:en\s*)?(\d{4})/i);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year > 1800 && year <= new Date().getFullYear()) {
      data.buildYear = year;
    }
  }

  return data;
}

/**
 * Extrae datos buscando patrones en el texto completo
 */
function extractFromText($: cheerio.CheerioAPI): Partial<ParsedProperty> {
  const data: any = {};
  const fullText = $('body').text();

  // Buscar precio con formato europeo
  const prices = fullText.match(/(\d{1,3}(?:\.\d{3})*)\s*€/g);
  if (prices && prices.length > 0) {
    // Tomar el precio más alto (generalmente es el de venta)
    const maxPrice = Math.max(...prices.map(p => parseFloat(p.replace(/\./g, '').replace('€', ''))));
    if (maxPrice > 10000) { // Filtrar precios muy bajos
      data.price = maxPrice;
    }
  }

  return data;
}

/**
 * Parser específico optimizado para Gilmar
 * Extrae datos de propiedades de Gilmar.es usando JSON-LD y selectores específicos
 */
function extractFromGilmar($: cheerio.CheerioAPI): Partial<ParsedProperty> {
  const data: any = {};

  console.log('🏠 Extracting from Gilmar...');

  // Gilmar usa JSON-LD muy completo
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const json = JSON.parse($(element).html() || '{}');

      if (json['@type'] === 'Apartment' || json['@type'] === 'SingleFamilyResidence') {
        // Precio
        if (json.offers?.price) {
          data.price = parseFloat(json.offers.price);
        }

        // Superficie
        if (json.floorSize) {
          data.surface = parseFloat(json.floorSize);
        }

        // Habitaciones
        if (json.numberOfRooms) {
          data.rooms = parseInt(json.numberOfRooms);
        }

        // Baños
        if (json.numberOfBathroomsTotal) {
          data.bathrooms = parseInt(json.numberOfBathroomsTotal);
        }

        // Dirección
        if (json.address?.streetAddress) {
          data.address = json.address.streetAddress;
        }

        // Coordenadas
        if (json.geo?.latitude) {
          data.latitude = parseFloat(json.geo.latitude);
        }
        if (json.geo?.longitude) {
          data.longitude = parseFloat(json.geo.longitude);
        }

        // Título
        if (json.name) {
          data.title = json.name;
        }
      }
    } catch (e) {
      // Ignorar errores de parsing JSON
    }
  });

  const fullText = $('body').text();
  const textLower = fullText.toLowerCase();

  // Extraer referencia
  const refMatch = fullText.match(/Ref\.\s*(\d+)/i);
  if (refMatch) {
    data.reference = refMatch[1];
  }

  // Planta - buscar en el texto
  const floorMatch = fullText.match(/(\d+)[ªº]?\s*planta/i);
  if (floorMatch) {
    data.floor = parseInt(floorMatch[1]);
  }

  // Año de construcción
  const yearMatch = fullText.match(/construido en (\d{4})/i);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year > 1800 && year <= new Date().getFullYear()) {
      data.buildYear = year;
    }
  }

  // Características booleanas
  data.hasLift = textLower.includes('ascensor');
  data.isExterior = textLower.includes('exterior');

  // Estado de reforma
  data.wasReformed = textLower.includes('reformado') ||
                     textLower.includes('reformada') ||
                     textLower.includes('renovado') ||
                     textLower.includes('renovada');

  if (data.wasReformed) {
    if (textLower.includes('reforma integral') || textLower.includes('totalmente reformado')) {
      data.reformQuality = 'alta';
    } else if (textLower.includes('parcialmente reformado')) {
      data.reformQuality = 'media';
    } else {
      data.reformQuality = 'media';
    }
  }

  // Condición del inmueble
  if (textLower.includes('muy bien conservado') || textLower.includes('buen estado')) {
    data.condition = 'buen estado';
  } else if (textLower.includes('a reformar') || textLower.includes('necesita reforma')) {
    data.condition = 'a reformar';
  } else if (data.wasReformed) {
    data.condition = 'reformado';
  }

  // Zona - extraer de la URL o del título
  if (data.address) {
    const addressLower = data.address.toLowerCase();
    if (addressLower.includes('guindalera')) data.zone = 'GUINDALERA';
    else if (addressLower.includes('delicias')) data.zone = 'DELICIAS';
    else if (addressLower.includes('pacifico') || addressLower.includes('pacífico')) data.zone = 'PACIFICO';
    else if (addressLower.includes('prosperidad')) data.zone = 'PROSPERIDAD';
    else if (addressLower.includes('retiro')) data.zone = 'RETIRO';
    else if (addressLower.includes('arguelles') || addressLower.includes('argüelles')) data.zone = 'ARGUELLES';
  }

  console.log('✅ Gilmar extraído:', {
    precio: data.price,
    superficie: data.surface,
    precioM2: data.price && data.surface ? Math.round(data.price / data.surface) : 'N/A',
    habitaciones: data.rooms,
    baños: data.bathrooms,
    planta: data.floor,
    dirección: data.address,
    reformado: data.wasReformed,
  });

  return data;
}

/**
 * Parser específico optimizado para Clikalia
 * IMPORTANTE: Clikalia vende SOLO propiedades reformadas de alta calidad
 * Sus precios son referencias fiables para precio/m² de reformados
 */
function extractFromClikalia($: cheerio.CheerioAPI): Partial<ParsedProperty> {
  const data: any = {};

  console.log('🏠 Extracting from Clikalia (propiedades reformadas)...');

  // LIMPIAR el HTML de ruido de marketing
  // Eliminar elementos de marketing antes de procesar
  $('button, .cta, [class*="offer"], [class*="visit"], [class*="save"]').remove();

  const fullText = $('body').text();
  const cleanText = fullText
    .replace(/Ahorras un \d+[.,]\d+%/gi, '')
    .replace(/Agenda una visita/gi, '')
    .replace(/¡Haz una oferta!/gi, '')
    .replace(/Descripción Ficha técnica Localización/gi, '')
    .replace(/Sobre la propiedad/gi, '')
    .replace(/¡SOMOS PROPIETARIOS!/gi, '')
    .replace(/Disfruta de todas las ventajas de comprar directamente a la propiedad/gi, '')
    .replace(/Clikalia presenta este piso ubicad[ao] en el barrio de \w+/gi, '');

  // PRECIO - Buscar el precio de venta (no el tachado)
  // Clikalia muestra: "750.000 € 785.000 €" (precio rebajado y original)
  // Queremos el PRIMER precio (el de venta actual)
  const pricesInText = cleanText.match(/(\d{1,3}(?:\.\d{3})*)\s*€/g);
  if (pricesInText && pricesInText.length > 0) {
    // Primer precio es el de venta actual
    const firstPrice = pricesInText[0];
    data.price = parseFloat(firstPrice.replace(/\./g, '').replace('€', '').trim());
  }

  // DIRECCIÓN - Buscar "Calle XXX" o dirección específica
  const addressMatch = cleanText.match(/(?:Calle|Avenida|Avda|Paseo|Plaza)\s+[A-Za-zÁ-ú\s]+\d*/i);
  if (addressMatch) {
    data.address = addressMatch[0].trim();
  } else {
    // Fallback: buscar cualquier mención de calle
    const streetMatch = cleanText.match(/([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚa-záéíóú]+)*)\s*\d+\s*m/);
    if (streetMatch) {
      data.address = streetMatch[1].trim();
    }
  }

  // Zona - Clikalia menciona el barrio
  const zoneMatch = cleanText.match(/(?:barrio de|zona de)\s+(\w+)/i);
  if (zoneMatch) {
    const zoneName = zoneMatch[1].toUpperCase();
    // Mapear a nuestras zonas conocidas
    data.zone = zoneName;
  }

  // SUPERFICIE - "97 m²"
  const surfaceMatch = cleanText.match(/(\d+)\s*m[²2]/);
  if (surfaceMatch) {
    data.surface = parseInt(surfaceMatch[1]);
  }

  // HABITACIONES - "3 hab."
  const roomsMatch = cleanText.match(/(\d+)\s*hab/i);
  if (roomsMatch) {
    data.rooms = parseInt(roomsMatch[1]);
  }

  // BAÑOS - "2 baños"
  const bathsMatch = cleanText.match(/(\d+)\s*baño/i);
  if (bathsMatch) {
    data.bathrooms = parseInt(bathsMatch[1]);
  }

  // PLANTA - "4ª Planta" (RELEVANTE para estimación)
  const floorMatch = cleanText.match(/(\d+)[ªº]\s*[Pp]lanta/);
  if (floorMatch) {
    data.floor = parseInt(floorMatch[1]);
  }

  // Características básicas
  const textLower = cleanText.toLowerCase();

  data.hasLift = textLower.includes('ascensor');
  data.isExterior = textLower.includes('exterior');

  // IMPORTANTE: Clikalia = SIEMPRE reformado alta calidad
  data.wasReformed = true;
  data.reformQuality = 'alta';
  data.condition = 'reformado';

  // Título limpio para la BD
  data.title = `Piso reformado ${data.rooms || 'X'} hab - ${data.address || 'Clikalia'}`;

  console.log('✅ Clikalia extraído (reformado alta calidad):', {
    precio: data.price,
    superficie: data.surface,
    precioM2: data.price && data.surface ? Math.round(data.price / data.surface) : 'N/A',
    habitaciones: data.rooms,
    planta: data.floor,
    dirección: data.address,
  });

  return data;
}

/**
 * Construye el objeto final de propiedad
 */
function buildPropertyObject(portal: ParsedProperty['portal'], url: string, data: any): ParsedProperty {
  const property: ParsedProperty = {
    portal,
    url,
    title: data.title || 'Propiedad sin título',
    price: data.price,
    surface: data.surface,
    pricePerM2: Math.round(data.price / data.surface),
    address: data.address || 'Dirección no disponible',
    zone: data.zone,
    rooms: data.rooms,
    bathrooms: data.bathrooms,
    floor: data.floor,
    isExterior: data.isExterior || false,
    hasLift: data.hasLift || false,
    buildYear: data.buildYear,
    condition: data.condition,
    wasReformed: data.wasReformed || false,
    reformQuality: data.reformQuality,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
  };

  console.log('✅ Successfully parsed property:', {
    portal: property.portal,
    price: property.price,
    surface: property.surface,
    address: property.address,
    rooms: property.rooms,
    floor: property.floor,
  });

  return property;
}
