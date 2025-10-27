import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface UnblockResponse {
  browserWSEndpoint: string;
  cookies: any[];
  url: string;
}

/**
 * Usa la API de Browserless Unblock para bypasear protecciones anti-bot
 * y obtener un WebSocket endpoint listo para scraping
 */
export async function getBrowserlessUnblockSession(
  url: string,
  browserlessToken: string
): Promise<{ browser: Browser; page: Page; context: BrowserContext }> {
  console.log(`🔓 Usando Browserless Unblock API para: ${url}`);

  // Llamar a la API de Unblock
  const unblockUrl = `https://production-sfo.browserless.io/unblock?token=${browserlessToken}`;

  const response = await fetch(unblockUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      browserWSEndpoint: true,
      cookies: true,
      ttl: 180000, // 3 minutos de sesión
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unblock API error (${response.status}): ${errorText}`);
  }

  const data: UnblockResponse = await response.json();

  console.log(`✅ Unblock API exitoso, conectando a WebSocket...`);

  // Conectar a través del WebSocket endpoint proporcionado
  const browser = await chromium.connectOverCDP(data.browserWSEndpoint);

  // Obtener el contexto y página existente
  const contexts = browser.contexts();
  if (contexts.length === 0) {
    throw new Error('No browser context found');
  }

  const context = contexts[0];
  const pages = context.pages();

  if (pages.length === 0) {
    throw new Error('No page found in context');
  }

  const page = pages[0];

  // Aplicar las cookies obtenidas
  if (data.cookies && data.cookies.length > 0) {
    await context.addCookies(data.cookies);
    console.log(`🍪 ${data.cookies.length} cookies aplicadas`);
  }

  console.log(`🌐 Sesión lista para scraping`);

  return { browser, page, context };
}

/**
 * Conexión estándar a Browserless (fallback sin Unblock)
 */
export async function getBrowserlessStandardSession(
  browserlessToken: string
): Promise<{ browser: Browser; page: Page; context: BrowserContext }> {
  console.log('🌐 Conectando a Browserless (modo estándar)...');

  const browser = await chromium.connectOverCDP(
    `wss://production-sfo.browserless.io?token=${browserlessToken}`
  );

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  });

  const page = await context.newPage();

  return { browser, page, context };
}
