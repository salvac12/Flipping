import { chromium, Browser, Page } from 'playwright';
import { MADRID_ZONES } from '../utils/zones';
import { calculatePropertyScore } from '../scoring/property-scorer';

export interface ScrapedProperty {
  url: string;
  portal: 'IDEALISTA' | 'FOTOCASA' | 'PISOS_COM';
  title: string;
  price: number;
  m2: number;
  pricePerM2: number;
  address: string;
  zone: string;
  city: string;
  latitude?: number;
  longitude?: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior: boolean;
  hasLift: boolean;
  buildYear?: number;
  condition?: string;
  needsReform: boolean;
  images: string[];
  description?: string;
  score: number;
  scoreDetails: any;
}

export class IdealistaScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Inicializa el navegador con configuración anti-detección
   */
  async init() {
    // Usar Browserless en producción, Playwright local en desarrollo
    const browserlessToken = process.env.BROWSERLESS_API_KEY;

    if (browserlessToken) {
      // Conectar a Browserless (cloud browser)
      console.log('🌐 Conectando a Browserless...');
      this.browser = await chromium.connectOverCDP(
        `wss://production-sfo.browserless.io?token=${browserlessToken}`
      );
    } else {
      // Fallback a Playwright local (solo desarrollo)
      console.log('💻 Usando Playwright local...');
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
    }

    const context = await this.browser.newContext({
      userAgent:
        process.env.USER_AGENT ||
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'es-ES',
      timezoneId: 'Europe/Madrid',
    });

    // Evitar detección de automation
    await context.addInitScript(() => {
      // @ts-ignore
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    this.page = await context.newPage();
  }

  /**
   * Construye la URL de búsqueda para Idealista
   */
  private buildSearchUrl(zone: string): string {
    const baseUrl = 'https://www.idealista.com/venta-viviendas/madrid-madrid';

    // Parámetros de búsqueda específicos
    const params = new URLSearchParams({
      ordenado: 'fecha-publicacion-desc', // Más recientes primero
      operacion: 'venta',
      estado: 'reformar', // Para reformar
      superficieMinima: '120', // Mínimo 120m2
      'solo-planta-exterior': 'true', // Solo exteriores
    });

    // Agregar zona específica en la URL
    const zoneUrl = zone.toLowerCase().replace('_', '-').replace(' ', '-');
    return `${baseUrl}/${zoneUrl}?${params.toString()}`;
  }

  /**
   * Extrae datos de una propiedad desde su tarjeta en el listado
   */
  private async extractPropertyFromCard(card: any): Promise<Partial<ScrapedProperty> | null> {
    try {
      // Extraer URL
      const urlElement = await card.$('a.item-link');
      const relativeUrl = await urlElement?.getAttribute('href');
      if (!relativeUrl) return null;
      const url = `https://www.idealista.com${relativeUrl}`;

      // Extraer precio
      const priceText = await card.$eval(
        '.item-price',
        (el: any) => el.textContent?.trim() || ''
      ).catch(() => '');
      const price = this.parsePrice(priceText);
      if (!price) return null;

      // Extraer superficie
      const detailsText = await card.$eval(
        '.item-detail-char',
        (el: any) => el.textContent || ''
      ).catch(() => '');
      const m2 = this.parseM2(detailsText);
      if (!m2 || m2 < 120) return null; // Filtro mínimo

      // Extraer dirección y zona
      const address = await card.$eval(
        '.item-link',
        (el: any) => el.textContent?.trim() || ''
      ).catch(() => 'Dirección no disponible');

      // Extraer número de habitaciones
      const rooms = this.parseRooms(detailsText);

      // Extraer planta
      const floor = this.parseFloor(detailsText);

      // Verificar si es exterior (en Idealista suele estar en detalles)
      const isExterior = detailsText.toLowerCase().includes('exterior');

      // Determinar si necesita reforma
      const needsReform =
        detailsText.toLowerCase().includes('reformar') ||
        detailsText.toLowerCase().includes('reforma');

      return {
        url,
        portal: 'IDEALISTA',
        title: address,
        price,
        m2,
        pricePerM2: price / m2,
        address,
        zone: '',
        city: 'Madrid',
        rooms,
        floor,
        isExterior,
        needsReform,
        images: [],
      };
    } catch (error) {
      console.error('Error extrayendo propiedad:', error);
      return null;
    }
  }

  /**
   * Escrape propiedades de una zona específica
   */
  async scrapeZone(zoneName: string, maxPages: number = 3): Promise<ScrapedProperty[]> {
    if (!this.page) {
      await this.init();
    }

    const properties: ScrapedProperty[] = [];
    const searchUrl = this.buildSearchUrl(zoneName);

    try {
      console.log(`Scrapeando Idealista - Zona: ${zoneName}`);
      await this.page!.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

      // Esperar a que carguen las propiedades
      await this.page!.waitForSelector('.item-info-container', { timeout: 10000 });

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`  Página ${pageNum}/${maxPages}`);

        // Extraer propiedades de la página actual
        const cards = await this.page!.$$('.item-info-container');

        for (const card of cards) {
          const property = await this.extractPropertyFromCard(card);

          if (property && property.price && property.m2) {
            // Obtener más detalles visitando la página individual
            const fullProperty = await this.scrapePropertyDetails(property as any);

            if (fullProperty) {
              properties.push(fullProperty);
            }
          }

          // Delay aleatorio para parecer humano
          await this.randomDelay(500, 1500);
        }

        // Ir a la siguiente página
        const nextButton = await this.page!.$('.next');
        if (nextButton && pageNum < maxPages) {
          await nextButton.click();
          await this.page!.waitForTimeout(2000);
          await this.page!.waitForSelector('.item-info-container', { timeout: 10000 });
        } else {
          break;
        }
      }

      console.log(`  Total propiedades encontradas: ${properties.length}`);
    } catch (error) {
      console.error(`Error scrapeando zona ${zoneName}:`, error);
    }

    return properties;
  }

  /**
   * Obtiene detalles completos de una propiedad específica
   */
  private async scrapePropertyDetails(
    property: Partial<ScrapedProperty>
  ): Promise<ScrapedProperty | null> {
    try {
      await this.page!.goto(property.url!, { waitUntil: 'networkidle', timeout: 30000 });

      // Extraer imágenes
      const images = await this.page!.$$eval(
        '.detail-image-gallery img',
        (imgs: any[]) => imgs.map((img) => img.src).filter((src) => src)
      ).catch(() => []);

      // Extraer descripción
      const description = await this.page!.$eval(
        '.comment',
        (el: any) => el.textContent?.trim() || ''
      ).catch(() => '');

      // Extraer características adicionales
      const detailsElements = await this.page!.$$('.details-property-feature-one');
      const details: Record<string, string> = {};

      for (const detail of detailsElements) {
        const label = await detail.$eval(
          '.details-property-feature-label',
          (el: any) => el.textContent?.trim() || ''
        ).catch(() => '');

        const value = await detail.$eval(
          '.details-property-feature-value',
          (el: any) => el.textContent?.trim() || ''
        ).catch(() => '');

        if (label && value) {
          details[label.toLowerCase()] = value;
        }
      }

      // Parsear detalles adicionales
      const floor = this.parseFloorFromDetails(details);
      const buildYear = this.parseBuildYear(details);
      const hasLift = details['ascensor']?.toLowerCase() === 'sí';
      const condition = details['estado'];
      const isExterior = details['exterior']?.toLowerCase() === 'sí' || property.isExterior;

      // Intentar extraer coordenadas del mapa
      const { latitude, longitude } = await this.extractCoordinates();

      // Determinar zona basada en coordenadas
      const zone = this.determineZone(latitude, longitude);

      // Calcular scoring
      const scoringData = {
        ...property,
        floor,
        buildYear,
        isExterior: isExterior || false,
        needsReform: property.needsReform || false,
        latitude,
        longitude,
        zone,
      };

      const scoring = calculatePropertyScore(scoringData as any);

      const fullProperty: ScrapedProperty = {
        url: property.url!,
        portal: 'IDEALISTA',
        title: property.title || '',
        price: property.price || 0,
        m2: property.m2 || 0,
        pricePerM2: property.pricePerM2 || 0,
        address: property.address || '',
        zone: zone || '',
        city: 'Madrid',
        latitude,
        longitude,
        rooms: property.rooms,
        bathrooms: this.parseBathrooms(details),
        floor,
        isExterior: isExterior || false,
        hasLift: hasLift || false,
        buildYear,
        condition,
        needsReform: property.needsReform || false,
        images: images.slice(0, 10), // Limitar a 10 imágenes
        description,
        score: scoring.totalScore,
        scoreDetails: scoring,
      };

      return fullProperty;
    } catch (error) {
      console.error('Error obteniendo detalles de propiedad:', error);
      return null;
    }
  }

  /**
   * Extrae coordenadas del mapa de Idealista
   */
  private async extractCoordinates(): Promise<{ latitude?: number; longitude?: number }> {
    try {
      const mapData = await this.page!.evaluate(() => {
        // Idealista suele tener las coordenadas en un script
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
          const content = script.textContent || '';
          if (content.includes('latitude') && content.includes('longitude')) {
            const latMatch = content.match(/latitude["\s:]+([0-9.]+)/);
            const lngMatch = content.match(/longitude["\s:]+(-?[0-9.]+)/);

            if (latMatch && lngMatch) {
              return {
                latitude: parseFloat(latMatch[1]),
                longitude: parseFloat(lngMatch[1]),
              };
            }
          }
        }
        return {};
      });

      return mapData;
    } catch (error) {
      return {};
    }
  }

  /**
   * Determina la zona basada en coordenadas
   */
  private determineZone(latitude?: number, longitude?: number): string {
    if (!latitude || !longitude) return '';

    for (const [zoneName, zone] of Object.entries(MADRID_ZONES)) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        zone.latitude,
        zone.longitude
      );

      if (distance <= zone.radius) {
        return zoneName;
      }
    }

    return '';
  }

  /**
   * Calcula distancia entre dos coordenadas (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Métodos de parseo

  private parsePrice(text: string): number {
    const cleanText = text.replace(/[€.\s]/g, '').replace(',', '.');
    return parseFloat(cleanText) || 0;
  }

  private parseM2(text: string): number {
    const match = text.match(/(\d+)\s*m²/);
    return match ? parseInt(match[1]) : 0;
  }

  private parseRooms(text: string): number | undefined {
    const match = text.match(/(\d+)\s*hab/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseFloor(text: string): number | undefined {
    const match = text.match(/(\d+)º/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseFloorFromDetails(details: Record<string, string>): number | undefined {
    const floorText = details['planta'] || '';
    const match = floorText.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseBuildYear(details: Record<string, string>): number | undefined {
    const yearText = details['año de construcción'] || details['año construcción'] || '';
    const match = yearText.match(/(\d{4})/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseBathrooms(details: Record<string, string>): number | undefined {
    const bathText = details['baños'] || '';
    const match = bathText.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private async randomDelay(min: number, max: number) {
    const delay = Math.random() * (max - min) + min;
    await this.page!.waitForTimeout(delay);
  }

  /**
   * Cierra el navegador
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Escrape todas las zonas prioritarias
   */
  async scrapeAllZones(maxPagesPerZone: number = 2): Promise<ScrapedProperty[]> {
    await this.init();

    const allProperties: ScrapedProperty[] = [];

    for (const zoneName of Object.keys(MADRID_ZONES)) {
      const properties = await this.scrapeZone(zoneName, maxPagesPerZone);
      allProperties.push(...properties);

      // Delay entre zonas para evitar rate limiting
      await this.randomDelay(3000, 6000);
    }

    await this.close();

    return allProperties;
  }
}

/**
 * Función helper para ejecutar el scraper
 */
export async function scrapeIdealista(maxPagesPerZone: number = 2): Promise<ScrapedProperty[]> {
  const scraper = new IdealistaScraper();

  try {
    const properties = await scraper.scrapeAllZones(maxPagesPerZone);
    return properties;
  } catch (error) {
    console.error('Error en scraping de Idealista:', error);
    throw error;
  } finally {
    await scraper.close();
  }
}
