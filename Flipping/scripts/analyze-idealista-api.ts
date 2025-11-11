/**
 * Script para analizar APIs internas de Idealista
 * Captura todas las llamadas de red y documenta endpoints útiles
 *
 * Uso: npx tsx scripts/analyze-idealista-api.ts
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
  timestamp: string;
}

interface CapturedResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  contentType: string;
  bodySize: number;
  preview?: string; // Primeros 500 caracteres de la respuesta
}

interface AnalysisResult {
  targetUrl: string;
  timestamp: string;
  totalRequests: number;
  apiRequests: CapturedRequest[];
  apiResponses: CapturedResponse[];
  cookies: any[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  recommendations: string[];
}

async function analyzeIdealistaAPI() {
  console.log('🔍 Iniciando análisis de APIs internas de Idealista\n');

  const apiRequests: CapturedRequest[] = [];
  const apiResponses: CapturedResponse[] = [];
  let cookies: any[] = [];
  let totalRequests = 0;

  // Configurar navegador sin stealth primero para ver comportamiento normal
  const browser = await chromium.launch({
    headless: false, // Visible para debugging
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  });

  const page = await context.newPage();

  // Capturar todas las peticiones
  page.on('request', (request) => {
    totalRequests++;
    const url = request.url();

    // Filtrar solo APIs (JSON, XHR, Fetch)
    const isAPI =
      url.includes('/api/') ||
      url.includes('.json') ||
      request.resourceType() === 'xhr' ||
      request.resourceType() === 'fetch';

    if (isAPI) {
      const headers: Record<string, string> = {};
      const requestHeaders = request.headers();
      Object.keys(requestHeaders).forEach(key => {
        headers[key] = requestHeaders[key];
      });

      apiRequests.push({
        url,
        method: request.method(),
        headers,
        postData: request.postData() || undefined,
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 API Request: ${request.method()} ${url.substring(0, 100)}`);
    }
  });

  // Capturar todas las respuestas
  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    // Filtrar respuestas JSON o APIs
    const isJSONResponse = contentType.includes('application/json');
    const isAPIResponse =
      url.includes('/api/') ||
      url.includes('.json') ||
      isJSONResponse;

    if (isAPIResponse) {
      try {
        const headers: Record<string, string> = {};
        const responseHeaders = response.headers();
        Object.keys(responseHeaders).forEach(key => {
          headers[key] = responseHeaders[key];
        });

        let preview = '';
        try {
          const body = await response.text();
          preview = body.substring(0, 500);

          // Intentar parsear como JSON para verificar si contiene datos de propiedades
          if (isJSONResponse) {
            const json = JSON.parse(body);
            const hasPropertyData =
              json.elementList ||
              json.properties ||
              json.items ||
              json.results ||
              (Array.isArray(json) && json.length > 0);

            if (hasPropertyData) {
              console.log(`✨ ENDPOINT IMPORTANTE: ${url}`);
              console.log(`   Contiene datos de propiedades: ${JSON.stringify(json).substring(0, 200)}...\n`);
            }
          }
        } catch (e) {
          preview = '[No pudo capturar body]';
        }

        apiResponses.push({
          url,
          status: response.status(),
          headers,
          contentType,
          bodySize: parseInt(headers['content-length'] || '0'),
          preview,
        });

        console.log(`✅ API Response: ${response.status()} ${url.substring(0, 100)}`);
      } catch (error) {
        console.error(`❌ Error capturando respuesta de ${url}:`, error);
      }
    }
  });

  try {
    // PASO 1: Navegar a página principal de Idealista
    console.log('📍 Paso 1: Navegando a Idealista...');
    await page.goto('https://www.idealista.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    // PASO 2: Navegar a búsqueda de Madrid
    console.log('\n📍 Paso 2: Navegando a búsqueda de propiedades en Madrid...');
    const searchUrl = 'https://www.idealista.com/venta-viviendas/madrid-madrid/';
    await page.goto(searchUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    // PASO 3: Scroll para cargar más datos (lazy loading)
    console.log('\n📍 Paso 3: Haciendo scroll para detectar lazy loading...');
    await page.evaluate(async () => {
      for (let i = 0; i < 3; i++) {
        window.scrollBy(0, window.innerHeight);
        await new Promise(r => setTimeout(r, 1000));
      }
    });
    await page.waitForTimeout(2000);

    // PASO 4: Interactuar con filtros (puede disparar más APIs)
    console.log('\n📍 Paso 4: Intentando interactuar con filtros...');
    try {
      // Buscar botones/selectores de filtros comunes
      const filterButton = await page.$('[data-testid="filters-button"]').catch(() => null);
      if (filterButton) {
        await filterButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('   No se encontraron filtros interactivos');
    }

    // PASO 5: Capturar cookies finales
    console.log('\n📍 Paso 5: Capturando cookies y storage...');
    cookies = await context.cookies();

    // Capturar localStorage y sessionStorage
    const storage = await page.evaluate(() => {
      const local: Record<string, string> = {};
      const session: Record<string, string> = {};

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) local[key] = localStorage.getItem(key) || '';
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) session[key] = sessionStorage.getItem(key) || '';
      }

      return { local, session };
    });

    console.log('\n📊 ANÁLISIS COMPLETADO\n');
    console.log(`Total de requests: ${totalRequests}`);
    console.log(`API requests capturadas: ${apiRequests.length}`);
    console.log(`API responses capturadas: ${apiResponses.length}`);
    console.log(`Cookies: ${cookies.length}`);

    // Generar recomendaciones
    const recommendations: string[] = [];

    // Buscar endpoints con datos de propiedades
    const propertyEndpoints = apiRequests.filter(req =>
      req.url.includes('property') ||
      req.url.includes('listing') ||
      req.url.includes('search') ||
      req.url.includes('element')
    );

    if (propertyEndpoints.length > 0) {
      recommendations.push(`✅ Se encontraron ${propertyEndpoints.length} endpoints relacionados con propiedades`);
      propertyEndpoints.forEach(ep => {
        recommendations.push(`   - ${ep.method} ${ep.url}`);
      });
    } else {
      recommendations.push('⚠️ No se detectaron endpoints obvios de propiedades. Puede que usen GraphQL o websockets.');
    }

    // Buscar tokens en headers o cookies
    const hasAuthTokens = apiRequests.some(req =>
      req.headers['authorization'] ||
      req.headers['x-api-key'] ||
      req.headers['x-csrf-token']
    );

    if (hasAuthTokens) {
      recommendations.push('🔐 Se detectaron tokens de autorización en las requests. Necesitarás copiar estos headers.');
    }

    // Verificar DataDome
    const hasDataDome = cookies.some(c => c.name.toLowerCase().includes('datadome'));
    if (hasDataDome) {
      recommendations.push('🛡️ DataDome detectado en cookies. Necesitarás gestionar estas cookies.');
    }

    // Crear resultado del análisis
    const result: AnalysisResult = {
      targetUrl: searchUrl,
      timestamp: new Date().toISOString(),
      totalRequests,
      apiRequests,
      apiResponses,
      cookies,
      localStorage: storage.local,
      sessionStorage: storage.session,
      recommendations,
    };

    // Guardar resultado en archivo JSON
    const outputPath = path.join(__dirname, 'idealista-api-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Análisis guardado en: ${outputPath}`);

    // Mostrar recomendaciones
    console.log('\n📋 RECOMENDACIONES:\n');
    recommendations.forEach(rec => console.log(rec));

    // Crear archivo markdown más legible
    const mdPath = path.join(__dirname, 'idealista-api-analysis.md');
    const mdContent = generateMarkdownReport(result);
    fs.writeFileSync(mdPath, mdContent);
    console.log(`\n📄 Reporte legible guardado en: ${mdPath}`);

  } catch (error) {
    console.error('\n❌ Error durante el análisis:', error);
  } finally {
    await browser.close();
  }
}

function generateMarkdownReport(result: AnalysisResult): string {
  let md = `# Análisis de APIs Internas de Idealista\n\n`;
  md += `**Fecha:** ${result.timestamp}\n`;
  md += `**URL analizada:** ${result.targetUrl}\n`;
  md += `**Total de requests:** ${result.totalRequests}\n\n`;

  md += `## 📡 Endpoints de API Detectados (${result.apiRequests.length})\n\n`;

  // Agrupar por tipo
  const getRequests = result.apiRequests.filter(r => r.method === 'GET');
  const postRequests = result.apiRequests.filter(r => r.method === 'POST');
  const otherRequests = result.apiRequests.filter(r => r.method !== 'GET' && r.method !== 'POST');

  if (getRequests.length > 0) {
    md += `### GET Requests (${getRequests.length})\n\n`;
    getRequests.forEach((req, i) => {
      md += `${i + 1}. **${req.url}**\n`;
      md += `   - Headers importantes:\n`;
      Object.keys(req.headers)
        .filter(h => h.toLowerCase().includes('auth') || h.toLowerCase().includes('token') || h.toLowerCase().includes('csrf'))
        .forEach(h => {
          md += `     - \`${h}: ${req.headers[h]}\`\n`;
        });
      md += `\n`;
    });
  }

  if (postRequests.length > 0) {
    md += `### POST Requests (${postRequests.length})\n\n`;
    postRequests.forEach((req, i) => {
      md += `${i + 1}. **${req.url}**\n`;
      if (req.postData) {
        md += `   - Body: \`${req.postData.substring(0, 200)}...\`\n`;
      }
      md += `\n`;
    });
  }

  md += `## 🍪 Cookies (${result.cookies.length})\n\n`;
  result.cookies.forEach(cookie => {
    md += `- **${cookie.name}**: ${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}\n`;
    if (cookie.name.toLowerCase().includes('datadome')) {
      md += `  ⚠️ **Cookie de DataDome detectada**\n`;
    }
  });

  md += `\n## 💾 LocalStorage\n\n`;
  const localKeys = Object.keys(result.localStorage);
  if (localKeys.length > 0) {
    localKeys.forEach(key => {
      md += `- **${key}**: ${result.localStorage[key].substring(0, 100)}...\n`;
    });
  } else {
    md += `Sin datos en localStorage\n`;
  }

  md += `\n## 📋 Recomendaciones\n\n`;
  result.recommendations.forEach(rec => {
    md += `${rec}\n\n`;
  });

  return md;
}

// Ejecutar análisis
analyzeIdealistaAPI().catch(console.error);
