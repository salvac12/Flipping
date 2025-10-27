import { chromium, Browser, Page } from 'playwright';
import { calculatePropertyScore } from '../scoring/property-scorer';
import { ScrapedProperty } from './idealista-scraper';

export class PisosComScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'es-ES',
    });

    this.page = await context.newPage();
  }

  private buildSearchUrl(): string {
    const baseUrl = 'https://www.pisos.com/venta/pisos-madrid';

    const params = new URLSearchParams({
      ordenadoPor: 'fecha-publicacion-desc',
      superficieMin: '120',
    });

    return `${baseUrl}/?${params.toString()}`;
  }

  async scrapeZone(zoneName: string, maxPages: number = 2): Promise<ScrapedProperty[]> {
    if (!this.page) await this.init();

    const properties: ScrapedProperty[] = [];
    const searchUrl = this.buildSearchUrl();

    try {
      console.log(`Scrapeando Pisos.com - Zona: ${zoneName}`);
      await this.page!.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

      await this.page!.waitForSelector('.ad-preview', { timeout: 10000 }).catch(() => {});

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`  Página ${pageNum}/${maxPages}`);

        const cards = await this.page!.$$('.ad-preview');

        for (const card of cards) {
          try {
            const url = await card.$eval('a', (el: any) => el.href).catch(() => '');
            if (!url) continue;

            const priceText = await card.$eval('.ad-preview__price', (el: any) => el.textContent?.trim() || '').catch(() => '');
            const price = this.parsePrice(priceText);
            if (!price) continue;

            const detailsText = await card.textContent();
            const m2Match = detailsText?.match(/(\d+)\s*m²/);
            const m2 = m2Match ? parseInt(m2Match[1]) : 0;
            if (m2 < 120) continue;

            const title = await card.$eval('.ad-preview__title', (el: any) => el.textContent?.trim() || '').catch(() => '');

            const property: Partial<ScrapedProperty> = {
              url,
              portal: 'PISOS_COM',
              title,
              price,
              m2,
              pricePerM2: price / m2,
              address: title,
              zone: zoneName,
              city: 'Madrid',
              isExterior: true,
              needsReform: true,
              images: [],
            };

            const scoring = calculatePropertyScore(property as any);

            properties.push({
              ...property,
              score: scoring.totalScore,
              scoreDetails: scoring,
            } as ScrapedProperty);

            await this.randomDelay(500, 1000);
          } catch (error) {
            console.error('Error procesando card de Pisos.com:', error);
          }
        }

        const nextButton = await this.page!.$('.pagination__next');
        if (nextButton && pageNum < maxPages) {
          await nextButton.click();
          await this.page!.waitForTimeout(2000);
        } else {
          break;
        }
      }

      console.log(`  Total propiedades: ${properties.length}`);
    } catch (error) {
      console.error(`Error scrapeando Pisos.com:`, error);
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
    const properties = await this.scrapeZone('MADRID', maxPagesPerZone);
    await this.close();
    return properties;
  }
}

export async function scrapePisosCom(maxPagesPerZone: number = 2): Promise<ScrapedProperty[]> {
  const scraper = new PisosComScraper();
  try {
    return await scraper.scrapeAllZones(maxPagesPerZone);
  } finally {
    await scraper.close();
  }
}
