import { chromium, Browser, Page } from 'playwright';
import { calculatePropertyScore } from '../scoring/property-scorer';
import { ScrapedProperty } from './idealista-scraper';
import { getBrowserlessUnblockSession } from './browserless-unblock';

export class FotocasaScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private usedUnblockAPI: boolean = false;

  async init() {
    // Usar Browserless en producción, Playwright local en desarrollo
    const browserlessToken = process.env.BROWSERLESS_API_KEY;

    if (browserlessToken) {
      // Usar conexión estándar (Unblock API desactivado temporalmente)
      console.log('🌐 Fotocasa: Conectando a Browserless (estándar)...');
      this.browser = await chromium.connectOverCDP(
        `wss://production-sfo.browserless.io?token=${browserlessToken}`
      );
    } else {
      console.log('💻 Fotocasa: Usando Playwright local...');
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      });
    }

    const context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'es-ES',
    });

    this.page = await context.newPage();
  }

  private buildSearchUrl(zone: string): string {
    // URL base de búsqueda para Fotocasa Madrid
    const baseUrl = 'https://www.fotocasa.es/es/comprar/viviendas/madrid-capital/todas-las-zonas/l';

    const params = new URLSearchParams({
      minSurface: '120',
      sortType: 'publicationDate', // Ordenar por fecha
      propertyStateIds: '3', // Para reformar
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async scrapeZone(zoneName: string, maxPages: number = 2): Promise<ScrapedProperty[]> {
    if (!this.page) await this.init();

    const properties: ScrapedProperty[] = [];
    const searchUrl = this.buildSearchUrl(zoneName);

    try {
      console.log(`Scrapeando Fotocasa - Zona: ${zoneName}`);

      // Si usamos Unblock API, la página ya está cargada
      if (!this.usedUnblockAPI) {
        await this.page!.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      } else {
        console.log('ℹ️ Usando sesión Unblock existente, página ya cargada');
        this.usedUnblockAPI = false; // Reset para siguientes zonas
      }

      // Esperar a que carguen las propiedades
      await this.page!.waitForSelector('article.re-CardPackMinimal', { timeout: 10000 }).catch(() => {});

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`  Página ${pageNum}/${maxPages}`);

        const cards = await this.page!.$$('article.re-CardPackMinimal');

        for (const card of cards) {
          try {
            // Extraer URL
            const url = await card.$eval('a', (el: any) => el.href).catch(() => '');
            if (!url) continue;

            // Extraer precio
            const priceText = await card.$eval('.re-CardPrice', (el: any) => el.textContent?.trim() || '').catch(() => '');
            const price = this.parsePrice(priceText);
            if (!price) continue;

            // Extraer superficie
            const detailsText = await card.textContent();
            const m2Match = detailsText?.match(/(\d+)\s*m²/);
            const m2 = m2Match ? parseInt(m2Match[1]) : 0;
            if (m2 < 120) continue;

            // Datos básicos
            const title = await card.$eval('span.re-CardTitle', (el: any) => el.textContent?.trim() || '').catch(() => '');

            const property: Partial<ScrapedProperty> = {
              url,
              portal: 'FOTOCASA',
              title,
              price,
              m2,
              pricePerM2: price / m2,
              address: title,
              zone: zoneName,
              city: 'Madrid',
              isExterior: true, // Asumir exterior por filtros
              needsReform: true,
              images: [],
            };

            // Calcular scoring básico
            const scoring = calculatePropertyScore(property as any);

            properties.push({
              ...property,
              score: scoring.totalScore,
              scoreDetails: scoring,
            } as ScrapedProperty);

            await this.randomDelay(500, 1000);
          } catch (error) {
            console.error('Error procesando card de Fotocasa:', error);
          }
        }

        // Intentar ir a siguiente página
        const nextButton = await this.page!.$('[data-testid="pagination-next"]');
        if (nextButton && pageNum < maxPages) {
          await nextButton.click();
          await this.page!.waitForTimeout(2000);
        } else {
          break;
        }
      }

      console.log(`  Total propiedades: ${properties.length}`);
    } catch (error) {
      console.error(`Error scrapeando Fotocasa en zona ${zoneName}:`, error);
    }

    return properties;
  }

  private parsePrice(text: string): number {
    const cleanText = text.replace(/[€.\s]/g, '').replace(',', '.');
    return parseFloat(cleanText) || 0;
  }

  private async randomDelay(min: number, max: number) {
    const delay = Math.random() * (max - min) + min;
    await this.page!.waitForTimeout(delay);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async scrapeAllZones(maxPagesPerZone: number = 2): Promise<ScrapedProperty[]> {
    await this.init();
    const allProperties: ScrapedProperty[] = [];

    // Scrape general de Madrid, filtrando por zonas después
    const properties = await this.scrapeZone('MADRID', maxPagesPerZone);
    allProperties.push(...properties);

    await this.close();
    return allProperties;
  }
}

export async function scrapeFotocasa(maxPagesPerZone: number = 2): Promise<ScrapedProperty[]> {
  const scraper = new FotocasaScraper();
  try {
    return await scraper.scrapeAllZones(maxPagesPerZone);
  } finally {
    await scraper.close();
  }
}
