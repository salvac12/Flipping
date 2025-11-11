import { chromium, Browser, Page } from 'playwright';
import { calculatePropertyScore } from '../scoring/property-scorer';
import { ScrapedProperty } from './idealista-scraper';
import { getBrowserlessUnblockSession } from './browserless-unblock';

export class PisosComScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private usedUnblockAPI: boolean = false;

  async init() {
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
      console.log('☁️  Pisos.com: Usando @sparticuz/chromium para Vercel...');
      const chromiumPkg = await import('@sparticuz/chromium');

      this.browser = await chromium.launch({
        headless: true,
        executablePath: await chromiumPkg.default.executablePath(),
        args: [
          ...chromiumPkg.default.args,
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--disable-gpu',
        ],
      });
    } else {
      console.log('💻 Pisos.com: Usando Playwright local...');
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--disable-gpu',
        ],
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

      // Si usamos Unblock API, la página ya está cargada
      if (!this.usedUnblockAPI) {
        await this.page!.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      } else {
        console.log('ℹ️ Usando sesión Unblock existente, página ya cargada');
        this.usedUnblockAPI = false; // Reset para siguientes zonas
      }

      await this.page!.waitForSelector('.ad-preview', { timeout: 5000 }).catch(() => {});

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`  Página ${pageNum}/${maxPages}`);

        // Verificar que la página sigue abierta
        if (!this.page || this.page.isClosed()) {
          console.error('❌ Página cerrada prematuramente');
          break;
        }

        const cards = await this.page.$$('.ad-preview');
        console.log(`  Encontradas ${cards.length} cards en página ${pageNum}`);

        // TEMPORAL: Limitar a 10 propiedades máximo para evitar timeout
        const maxProperties = 10;
        const cardsToProcess = Math.min(cards.length, maxProperties - properties.length);
        console.log(`  Procesando ${cardsToProcess} cards (límite temporal: ${maxProperties})`);

        for (let i = 0; i < cardsToProcess; i++) {
          const card = cards[i];
          try {
            // Verificar que la página sigue abierta antes de cada operación
            if (!this.page || this.page.isClosed()) {
              console.error('❌ Página cerrada durante extracción');
              break;
            }

            // Intentar múltiples selectores para obtener la URL correcta
            let url = '';
            try {
              // Intentar selector principal del título/imagen
              url = await card.$eval('a.ad-preview__title', (el: any) => el.href).catch(() => '');
              if (!url) {
                // Fallback: cualquier enlace que contenga /comprar/ o /venta/
                const links = await card.$$eval('a', (elements: any[]) =>
                  elements.map(el => el.href).filter(href =>
                    href && (href.includes('/comprar/') || href.includes('/venta/')) && !href.endsWith('#')
                  )
                );
                url = links[0] || '';
              }
            } catch (e) {
              console.error(`  Error extrayendo URL: ${e}`);
            }

            if (!url || url.endsWith('#') || !url.includes('pisos.com')) {
              console.log(`  Card ${i + 1}: URL inválida (${url}), saltando`);
              continue;
            }

            console.log(`  Card ${i + 1}: URL extraída: ${url.substring(0, 80)}`);

            const priceText = await card.$eval('.ad-preview__price', (el: any) => el.textContent?.trim() || '').catch(() => '');
            const price = this.parsePrice(priceText);
            if (!price) {
              console.log(`  Card ${i + 1}: Sin precio válido, saltando`);
              continue;
            }

            const detailsText = await card.textContent();
            const m2Match = detailsText?.match(/(\d+)\s*m²/);
            const m2 = m2Match ? parseInt(m2Match[1]) : 0;
            if (m2 < 120) {
              console.log(`  Card ${i + 1}: ${m2}m² < 120m², saltando`);
              continue;
            }

            const title = await card.$eval('.ad-preview__title', (el: any) => el.textContent?.trim() || '').catch(() => 'Sin título');

            const property: Partial<ScrapedProperty> = {
              url,
              portal: 'PISOS_COM',
              title,
              price,
              m2,
              pricePerM2: Math.round(price / m2),
              address: title,
              zone: zoneName,
              city: 'Madrid',
              isExterior: true,
              hasLift: false,
              needsReform: true,
              images: [],
            };

            const scoring = calculatePropertyScore(property as any);

            properties.push({
              ...property,
              score: scoring.totalScore,
              scoreDetails: scoring,
            } as ScrapedProperty);

            console.log(`  ✅ Card ${i + 1}: ${title.substring(0, 40)}... - ${price}€ - ${m2}m²`);

            // Sin delay - estamos scrapeando de una sola página cargada en memoria
          } catch (error) {
            console.error(`  ❌ Error procesando card ${i + 1}:`, error);
            // Continuar con la siguiente card
          }
        }

        // Si alcanzamos el límite, detener
        if (properties.length >= maxProperties) {
          console.log(`  ⚠️  Límite de ${maxProperties} propiedades alcanzado`);
          break;
        }

        // No intentar navegar a la siguiente página por ahora
        break; // Solo primera página para evitar timeouts
      }

      console.log(`  ✅ Total propiedades extraídas: ${properties.length}`);
    } catch (error) {
      console.error(`❌ Error scrapeando Pisos.com:`, error);
    }

    return properties;
  }

  private parsePrice(text: string): number {
    const cleanText = text.replace(/[€.\s]/g, '').replace(',', '.');
    return parseFloat(cleanText) || 0;
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
    // Solo primera página para evitar timeouts
    const properties = await this.scrapeZone('MADRID', 1);
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
