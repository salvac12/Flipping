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
 * Detecta el portal inmobiliario desde una URL
 */
export function detectPortal(url: string): ParsedProperty['portal'] {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('idealista.com')) return 'IDEALISTA';
  if (urlLower.includes('fotocasa.es')) return 'FOTOCASA';
  if (urlLower.includes('pisos.com')) return 'PISOS_COM';
  if (urlLower.includes('clikalia.es') || urlLower.includes('clikalia.com')) return 'CLIKALIA';

  return 'UNKNOWN';
}

/**
 * Parser genérico que detecta el portal y extrae información
 */
export async function parsePropertyURL(url: string): Promise<ParsedProperty | null> {
  const portal = detectPortal(url);

  console.log(`🔍 Parsing URL from ${portal}: ${url}`);

  try {
    switch (portal) {
      case 'IDEALISTA':
        return await parseIdealistaURL(url);
      case 'FOTOCASA':
        return await parseFotocasaURL(url);
      case 'PISOS_COM':
        return await parsePisosComURL(url);
      case 'CLIKALIA':
        return await parseClikaLiaURL(url);
      default:
        return await parseGenericURL(url);
    }
  } catch (error) {
    console.error(`Error parsing URL: ${error}`);
    return null;
  }
}

/**
 * Parser específico para Idealista
 */
async function parseIdealistaURL(url: string): Promise<ParsedProperty | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('h1.main-info__title-main').text().trim() || $('h1').first().text().trim();

    const priceText = $('.info-data-price span').first().text().trim();
    const price = parseInt(priceText.replace(/[^\d]/g, ''));

    const detailsText = $('.info-features').text();
    const surfaceMatch = detailsText.match(/(\d+)\s*m[²2]/);
    const roomsMatch = detailsText.match(/(\d+)\s*hab/);
    const bathroomsMatch = detailsText.match(/(\d+)\s*baño/);
    const floorMatch = detailsText.match(/(\d+)º\s*planta/);

    const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : 0;
    const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;
    const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : undefined;
    const floor = floorMatch ? parseInt(floorMatch[1]) : undefined;

    const address = $('.main-info__title-minor').text().trim();

    const fullText = $('body').text().toLowerCase();
    const wasReformed = fullText.includes('reformado') || fullText.includes('renovado');
    const isExterior = fullText.includes('exterior');
    const hasLift = fullText.includes('ascensor');

    const description = $('.comment').text().trim();

    // Intentar extraer coordenadas
    let latitude: number | undefined;
    let longitude: number | undefined;

    const scriptTags = $('script');
    scriptTags.each((_, element) => {
      const scriptContent = $(element).html() || '';
      const latMatch = scriptContent.match(/latitude["\s:]+(-?\d+\.\d+)/);
      const lonMatch = scriptContent.match(/longitude["\s:]+(-?\d+\.\d+)/);

      if (latMatch) latitude = parseFloat(latMatch[1]);
      if (lonMatch) longitude = parseFloat(lonMatch[1]);
    });

    if (!price || !surface) {
      throw new Error('Missing essential data (price or surface)');
    }

    return {
      portal: 'IDEALISTA',
      url,
      title,
      price,
      surface,
      pricePerM2: Math.round(price / surface),
      address,
      rooms,
      bathrooms,
      floor,
      isExterior,
      hasLift,
      wasReformed,
      condition: wasReformed ? 'reformado' : 'buen estado',
      reformQuality: wasReformed ? 'media' : undefined,
      description,
      latitude,
      longitude,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Parser específico para Fotocasa
 */
async function parseFotocasaURL(url: string): Promise<ParsedProperty | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const priceText = $('.detail-info-price').text().trim();
    const price = parseInt(priceText.replace(/[^\d]/g, ''));

    const surface = parseInt($('[data-testid="surface"]').text().replace(/[^\d]/g, '')) || 0;
    const rooms = parseInt($('[data-testid="rooms"]').text().replace(/[^\d]/g, '')) || undefined;
    const bathrooms = parseInt($('[data-testid="bathrooms"]').text().replace(/[^\d]/g, '')) || undefined;

    const address = $('.address').text().trim();

    const fullText = $('body').text().toLowerCase();
    const wasReformed = fullText.includes('reformado') || fullText.includes('renovado');
    const isExterior = fullText.includes('exterior');
    const hasLift = fullText.includes('ascensor');

    const description = $('.description').text().trim();

    if (!price || !surface) {
      throw new Error('Missing essential data');
    }

    return {
      portal: 'FOTOCASA',
      url,
      title,
      price,
      surface,
      pricePerM2: Math.round(price / surface),
      address,
      rooms,
      bathrooms,
      isExterior,
      hasLift,
      wasReformed,
      condition: wasReformed ? 'reformado' : 'buen estado',
      description,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Parser específico para Pisos.com
 */
async function parsePisosComURL(url: string): Promise<ParsedProperty | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const priceText = $('.price').text().trim();
    const price = parseInt(priceText.replace(/[^\d]/g, ''));

    const surface = parseInt($('.surface').text().replace(/[^\d]/g, '')) || 0;
    const rooms = parseInt($('.rooms').text().replace(/[^\d]/g, '')) || undefined;

    const address = $('.address').text().trim();

    const fullText = $('body').text().toLowerCase();
    const wasReformed = fullText.includes('reformado') || fullText.includes('renovado');
    const isExterior = fullText.includes('exterior');
    const hasLift = fullText.includes('ascensor');

    if (!price || !surface) {
      throw new Error('Missing essential data');
    }

    return {
      portal: 'PISOS_COM',
      url,
      title,
      price,
      surface,
      pricePerM2: Math.round(price / surface),
      address,
      rooms,
      isExterior,
      hasLift,
      wasReformed,
      condition: wasReformed ? 'reformado' : 'buen estado',
    };
  } finally {
    await browser.close();
  }
}

/**
 * Parser específico para Clikalia
 */
async function parseClikaLiaURL(url: string): Promise<ParsedProperty | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();

    const priceText = $('[data-testid="price"]').text().trim() || $('.price').text().trim();
    const price = parseInt(priceText.replace(/[^\d]/g, ''));

    const details = $('.property-details').text();
    const surfaceMatch = details.match(/(\d+)\s*m[²2]/);
    const roomsMatch = details.match(/(\d+)\s*hab/);
    const bathroomsMatch = details.match(/(\d+)\s*baño/);

    const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : 0;
    const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;
    const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : undefined;

    const address = $('[data-testid="address"]').text().trim() || $('.address').text().trim();

    const fullText = $('body').text().toLowerCase();
    // Clikalia mayormente vende propiedades reformadas
    const wasReformed = fullText.includes('reformado') || fullText.includes('renovado') || true;
    const isExterior = fullText.includes('exterior');
    const hasLift = fullText.includes('ascensor');

    const description = $('.description').text().trim();

    if (!price || !surface) {
      throw new Error('Missing essential data');
    }

    return {
      portal: 'CLIKALIA',
      url,
      title,
      price,
      surface,
      pricePerM2: Math.round(price / surface),
      address,
      rooms,
      bathrooms,
      isExterior,
      hasLift,
      wasReformed,
      condition: 'reformado',
      reformQuality: 'media',
      description,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Parser genérico para portales desconocidos
 */
async function parseGenericURL(url: string): Promise<ParsedProperty | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const fullText = $('body').text();

    // Buscar precio con patrones comunes
    const priceMatch = fullText.match(/(\d{1,3}(?:[.,]\d{3})*)\s*€/) ||
                      fullText.match(/€\s*(\d{1,3}(?:[.,]\d{3})*)/);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/[.,]/g, '')) : 0;

    // Buscar superficie
    const surfaceMatch = fullText.match(/(\d+)\s*m[²2]/);
    const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : 0;

    // Buscar habitaciones
    const roomsMatch = fullText.match(/(\d+)\s*(hab|habitacion|dormitorio)/i);
    const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;

    const fullTextLower = fullText.toLowerCase();
    const wasReformed = fullTextLower.includes('reformado') || fullTextLower.includes('renovado');
    const isExterior = fullTextLower.includes('exterior');
    const hasLift = fullTextLower.includes('ascensor');

    if (!price || !surface) {
      throw new Error('Could not extract essential data from unknown portal');
    }

    return {
      portal: 'UNKNOWN',
      url,
      title,
      price,
      surface,
      pricePerM2: Math.round(price / surface),
      address: 'Dirección no disponible',
      rooms,
      isExterior,
      hasLift,
      wasReformed,
      condition: wasReformed ? 'reformado' : 'buen estado',
    };
  } finally {
    await browser.close();
  }
}
