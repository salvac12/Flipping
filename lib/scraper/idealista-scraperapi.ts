import * as cheerio from 'cheerio';
import { calculatePropertyScore } from '../scoring/property-scorer';
import { ScrapedProperty } from './idealista-scraper';
import { MADRID_ZONES } from '../utils/zones';

/**
 * Scraper de Idealista usando ScraperAPI (sin Playwright)
 * Funciona en Vercel sin problemas de Chrome/binarios
 */
export class IdealistaScraperAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SCRAPERAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  SCRAPERAPI_KEY no configurada - scraper no funcionará');
    }
  }

  /**
   * Construye URL con ScraperAPI
   */
  private buildScraperAPIUrl(targetUrl: string): string {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      url: targetUrl,
      render: 'true', // Ejecutar JavaScript
      country_code: 'es', // Usar proxy español
    });

    return `http://api.scraperapi.com/?${params.toString()}`;
  }

  /**
   * Construye la URL de búsqueda de Idealista
   */
  private buildSearchUrl(zone: string): string {
    const baseUrl = 'https://www.idealista.com/venta-viviendas/madrid-madrid';

    const params = new URLSearchParams({
      ordenado: 'fecha-publicacion-desc',
      operacion: 'venta',
      superficieMinima: '120',
    });

    const zoneUrl = zone.toLowerCase().replace('_', '-').replace(' ', '-');
    return `${baseUrl}/${zoneUrl}?${params.toString()}`;
  }

  /**
   * Extrae propiedades del HTML usando Cheerio
   */
  private extractPropertiesFromHTML(html: string, zoneName: string): ScrapedProperty[] {
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    // Selector de tarjetas de propiedades en Idealista
    $('.item-info-container').each((index, element) => {
      try {
        if (properties.length >= 10) return false; // Máximo 10

        const $card = $(element);

        // URL
        const relativeUrl = $card.find('a.item-link').attr('href');
        if (!relativeUrl) return;
        const url = `https://www.idealista.com${relativeUrl}`;

        // Precio
        const priceText = $card.find('.item-price').text().trim();
        const price = this.parsePrice(priceText);
        if (!price) return;

        // Superficie
        const detailsText = $card.find('.item-detail').text();
        const m2Match = detailsText.match(/(\d+)\s*m²/);
        const m2 = m2Match ? parseInt(m2Match[1]) : 0;
        if (m2 < 120) return;

        // Título/Dirección
        const title = $card.find('.item-link').text().trim() || 'Sin título';

        // Habitaciones
        const roomsMatch = detailsText.match(/(\d+)\s*hab/);
        const rooms = roomsMatch ? parseInt(roomsMatch[1]) : undefined;

        // Planta
        const floorMatch = detailsText.match(/(\d+)ª\s*planta/i);
        const floor = floorMatch ? parseInt(floorMatch[1]) : undefined;

        // Características
        const isExterior = detailsText.toLowerCase().includes('exterior');
        const needsReform = detailsText.toLowerCase().includes('reforma');

        // Calcular scoring
        const propertyData = {
          url,
          portal: 'IDEALISTA' as const,
          title,
          price,
          m2,
          pricePerM2: Math.round(price / m2),
          address: title,
          zone: zoneName,
          city: 'Madrid',
          rooms,
          floor,
          isExterior,
          hasLift: false,
          needsReform,
          images: [],
        };

        const scoring = calculatePropertyScore(propertyData as any);

        properties.push({
          ...propertyData,
          score: scoring.totalScore,
          scoreDetails: scoring,
        } as ScrapedProperty);

        console.log(`  ✅ ${properties.length}/10: ${title.substring(0, 40)}... - ${price}€ - ${m2}m²`);
      } catch (error) {
        console.error(`  ❌ Error procesando propiedad ${index}:`, error);
      }
    });

    return properties;
  }

  /**
   * Parsea precio desde texto
   */
  private parsePrice(text: string): number {
    const cleanText = text.replace(/[€.\s]/g, '').replace(',', '.');
    return parseFloat(cleanText) || 0;
  }

  /**
   * Scrape una zona específica
   */
  async scrapeZone(zoneName: string): Promise<ScrapedProperty[]> {
    if (!this.apiKey) {
      console.error('❌ SCRAPERAPI_KEY no configurada');
      return [];
    }

    try {
      console.log(`🔍 Scrapeando Idealista (ScraperAPI) - Zona: ${zoneName}`);

      const targetUrl = this.buildSearchUrl(zoneName);
      const scraperUrl = this.buildScraperAPIUrl(targetUrl);

      console.log(`  📡 Solicitando: ${targetUrl.substring(0, 60)}...`);

      const response = await fetch(scraperUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        },
      });

      if (!response.ok) {
        throw new Error(`ScraperAPI error: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      console.log(`  ✅ HTML recibido: ${html.length} caracteres`);

      const properties = this.extractPropertiesFromHTML(html, zoneName);
      console.log(`  ✅ Total propiedades extraídas: ${properties.length}`);

      return properties;
    } catch (error) {
      console.error(`❌ Error scrapeando zona ${zoneName}:`, error);
      return [];
    }
  }

  /**
   * Scrape todas las zonas prioritarias
   */
  async scrapeAllZones(maxPagesPerZone: number = 1): Promise<ScrapedProperty[]> {
    const allProperties: ScrapedProperty[] = [];

    // Solo procesar primeras 2 zonas para no gastar muchos requests
    const zonesToScrape = Object.keys(MADRID_ZONES).slice(0, 2);

    for (const zoneName of zonesToScrape) {
      const properties = await this.scrapeZone(zoneName);
      allProperties.push(...properties);

      // Límite total de 10 propiedades
      if (allProperties.length >= 10) {
        console.log(`  ⚠️  Límite de 10 propiedades alcanzado`);
        break;
      }
    }

    return allProperties;
  }
}

/**
 * Función helper para usar en el scraper principal
 */
export async function scrapeIdealistaWithScraperAPI(maxPagesPerZone: number = 1): Promise<ScrapedProperty[]> {
  const scraper = new IdealistaScraperAPI();
  return await scraper.scrapeAllZones(maxPagesPerZone);
}
