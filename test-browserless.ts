import { chromium } from 'playwright';

async function testBrowserless() {
  console.log('🧪 Testing Browserless connection...');

  const browserlessToken = '2TJSu1kZte34uC253704651f30475397b1996475a3d890f02';

  try {
    console.log('Connecting to Browserless with stealth mode...');
    const browser = await chromium.connectOverCDP(
      `wss://production-sfo.browserless.io?token=${browserlessToken}&stealth`
    );

    console.log('✅ Connected to Browserless!');

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'es-ES',
    });

    const page = await context.newPage();

    console.log('Navigating to Pisos.com...');
    await page.goto('https://www.pisos.com/venta/pisos-madrid/?ordenadoPor=fecha-publicacion-desc&superficieMin=120', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded!');

    // Intentar encontrar propiedades
    const title = await page.title();
    console.log('Page title:', title);

    // Buscar elementos de propiedad en Pisos.com
    const items = await page.$$('.ad-preview');
    console.log(`Found ${items.length} property items`);

    if (items.length > 0) {
      console.log('✅ Properties found! Extracting first one...');

      const firstItem = items[0];
      const priceText = await firstItem.$eval('.ad-preview__price', (el: any) => el.textContent?.trim()).catch(() => 'N/A');
      const titleText = await firstItem.$eval('.ad-preview__title', (el: any) => el.textContent?.trim()).catch(() => 'N/A');

      console.log('  Price:', priceText);
      console.log('  Title:', titleText);
    } else {
      console.log('❌ No properties found - checking page content...');
      const bodyText = await page.evaluate(() => document.body.textContent);
      console.log('Page content preview:', bodyText?.substring(0, 500));
    }

    await browser.close();
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

testBrowserless().catch(console.error);
