import { chromium as playwrightChromium } from 'playwright';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'playwright';
import { MADRID_ZONES } from '../utils/zones';
import { calculatePropertyScore } from '../scoring/property-scorer';
import { getBrowserlessUnblockSession } from './browserless-unblock';

// Aplicar plugin stealth para evitar detección de bots
chromium.use(stealth());

// User-Agents reales de diferentes navegadores y sistemas operativos
const REAL_USER_AGENTS = [
  // Chrome Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  // Chrome macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  // Firefox Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  // Safari macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

// Función para obtener User-Agent aleatorio
function getRandomUserAgent(): string {
  return REAL_USER_AGENTS[Math.floor(Math.random() * REAL_USER_AGENTS.length)];
}

// Función para delay aleatorio (simular comportamiento humano)
function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

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
  private usedUnblockAPI: boolean = false;

  /**
   * Inicializa el navegador con configuración anti-detección + stealth
   */
  async init() {
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
      console.log('☁️  Idealista: Usando @sparticuz/chromium + stealth para Vercel...');
      const chromiumPkg = await import('@sparticuz/chromium');

      // playwright-extra con stealth + chromium de Vercel
      this.browser = await chromium.launch({
        headless: true,
        executablePath: await chromiumPkg.default.executablePath(),
        args: [
          ...chromiumPkg.default.args,
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--disable-gpu',
        ],
      }) as unknown as Browser;
    } else {
      console.log('💻 Idealista: Usando Playwright-extra + stealth local...');

      // Usar el Chromium descargado manualmente
      const chromiumPath = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1194/chrome-mac/Chromium.app/Contents/MacOS/Chromium';

      // Configurar proxy si está disponible
      const launchOptions: any = {
        headless: true,
        executablePath: chromiumPath,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--disable-gpu',
        ],
      };

      // Añadir proxy si está configurado
      if (process.env.PROXY_SERVER) {
        console.log(`  🌐 Usando proxy: ${process.env.PROXY_SERVER}`);
        launchOptions.proxy = {
          server: process.env.PROXY_SERVER,
          username: process.env.PROXY_USERNAME,
          password: process.env.PROXY_PASSWORD,
        };
      }

      this.browser = await chromium.launch(launchOptions) as unknown as Browser;
    }

    // User-Agent aleatorio para cada sesión
    const userAgent = getRandomUserAgent();
    console.log(`  🎭 User-Agent: ${userAgent.substring(0, 50)}...`);

    const context = await this.browser.newContext({
      userAgent,
      viewport: { width: 1920, height: 1080 },
      locale: 'es-ES',
      timezoneId: 'Europe/Madrid',
      ignoreHTTPSErrors: true, // Ignorar errores SSL del proxy
      // Headers adicionales más realistas
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
    });

    // Evitar detección de automation (stealth ya hace esto, pero reforzamos)
    await context.addInitScript(() => {
      // @ts-ignore
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      // @ts-ignore
      window.navigator.chrome = { runtime: {} };
    });

    this.page = await context.newPage();
  }

  /**
   * Construye la URL de búsqueda para Idealista
   */
  private buildSearchUrl(zone: string): string {
    const baseUrl = 'https://www.idealista.com/venta-viviendas/madrid-madrid';

    // Parámetros simplificados - sin filtros restrictivos que puedan dar 0 resultados
    const params = new URLSearchParams({
      ordenado: 'fecha-publicacion-desc', // Más recientes primero
    });

    // Buscar en toda Madrid sin zona específica (más resultados)
    return `${baseUrl}/?${params.toString()}`;
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

      // Si usamos Unblock API, la página ya está cargada
      if (!this.usedUnblockAPI) {
        // TÉCNICA 1: Simular venir de Google (Referer realista)
        console.log(`  🌐 Paso 1: Navegando primero a Google (simular búsqueda real)...`);
        await this.page!.goto('https://www.google.com', { waitUntil: 'networkidle', timeout: 60000 });
        await randomDelay(1000, 2000);

        // TÉCNICA 2: Navegar a Idealista con Referer de Google
        console.log(`  📡 Paso 2: Navegando a Idealista desde Google: ${searchUrl.substring(0, 60)}...`);
        await this.page!.goto(searchUrl, {
          waitUntil: 'networkidle',
          timeout: 90000,
          referer: 'https://www.google.com/'
        });

        // TÉCNICA 3: Comportamiento humano - Delays aleatorios
        console.log(`  ⏱️  Paso 3: Esperando carga completa (simular lectura)...`);
        await randomDelay(2000, 4000);

        // TÉCNICA 4: Scrolling simulado (humanos hacen scroll antes de interactuar)
        console.log(`  📜 Paso 4: Simulando scrolling humano...`);
        await this.page!.evaluate(async () => {
          // Scroll gradual hacia abajo
          const distance = 100;
          const delay = 100;
          for (let i = 0; i < 5; i++) {
            window.scrollBy(0, distance);
            await new Promise(r => setTimeout(r, delay));
          }
          // Pequeño scroll hacia arriba (comportamiento natural)
          window.scrollBy(0, -200);
        });

        await randomDelay(1000, 2000);
      } else {
        console.log('ℹ️ Usando sesión Unblock existente, página ya cargada');
        this.usedUnblockAPI = false; // Reset para siguientes zonas
      }

      // DEBUG: Verificar qué recibimos
      const pageTitle = await this.page!.title();
      console.log(`  📄 Título de página: ${pageTitle}`);

      const bodyText = await this.page!.$eval('body', (el: any) => el.textContent?.substring(0, 200) || '');
      console.log(`  📝 Contenido: ${bodyText.substring(0, 100)}...`);

      // Esperar a que carguen las propiedades
      await this.page!.waitForSelector('.item-info-container', { timeout: 15000 }).catch(() => {
        console.log('  ⚠️  Selector .item-info-container no encontrado');
      });

      // OPTIMIZACIÓN: Solo procesar primera página y máximo 10 propiedades
      const maxProperties = 10;
      console.log(`  Procesando primera página (límite: ${maxProperties} propiedades)`);

      // Extraer propiedades de la página actual
      const cards = await this.page!.$$('.item-info-container');
      const cardsToProcess = Math.min(cards.length, maxProperties);
      console.log(`  Encontradas ${cards.length} cards, procesando ${cardsToProcess}`);

      for (let i = 0; i < cardsToProcess; i++) {
        const card = cards[i];
        try {
          // TÉCNICA 5: Delay entre cada propiedad (simular lectura humana)
          if (i > 0) {
            await randomDelay(500, 1500);
          }

          const property = await this.extractPropertyFromCard(card);

          if (property && property.price && property.m2) {
            // OPTIMIZACIÓN: No visitar páginas individuales, trabajar solo con datos del listado
            // Calcular scoring con los datos disponibles
            const scoring = calculatePropertyScore({
              ...property,
              zone: zoneName,
            } as any);

            const fullProperty: ScrapedProperty = {
              ...property,
              zone: zoneName,
              hasLift: false, // Por defecto
              images: [],
              score: scoring.totalScore,
              scoreDetails: scoring,
            } as ScrapedProperty;

            properties.push(fullProperty);
            console.log(`  ✅ ${i + 1}/${cardsToProcess}: ${property.title?.substring(0, 40)}... - ${property.price}€ - ${property.m2}m²`);
          } else {
            console.log(`  ⏭️  ${i + 1}/${cardsToProcess}: Saltada (datos incompletos o < 120m²)`);
          }

          // Si alcanzamos el límite, detener
          if (properties.length >= maxProperties) {
            console.log(`  ⚠️  Límite de ${maxProperties} propiedades alcanzado`);
            break;
          }
        } catch (error) {
          console.error(`  ❌ Error procesando card ${i + 1}:`, error);
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

    // Solo procesar primera zona (suficiente para obtener 10 propiedades de toda Madrid)
    const zonesToScrape = Object.keys(MADRID_ZONES).slice(0, 1);

    for (const zoneName of zonesToScrape) {
      const properties = await this.scrapeZone(zoneName, maxPagesPerZone);
      allProperties.push(...properties);

      // Si alcanzamos suficientes propiedades, detener
      if (allProperties.length >= 10) {
        console.log(`  ⚠️  Límite de 10 propiedades alcanzado`);
        break;
      }
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
