/**
 * Analiza el HTML de Idealista para encontrar datos JSON embebidos
 * Muchos sitios modernos embeben datos en <script> tags para evitar APIs
 *
 * Uso: npx tsx scripts/analyze-idealista-html.ts
 */

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface EmbeddedDataSource {
  type: 'script-json' | 'script-variable' | 'json-ld' | 'data-attribute' | 'window-object';
  selector?: string;
  variableName?: string;
  content: string;
  hasPropertyData: boolean;
  propertyCount?: number;
  sampleData?: any;
}

async function analyzeIdealistaHTML() {
  console.log('🔍 Analizando HTML de Idealista para datos embebidos\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  });

  const page = await context.newPage();
  const embeddedDataSources: EmbeddedDataSource[] = [];

  try {
    // Navegar a búsqueda de Madrid
    console.log('📍 Navegando a Idealista Madrid...');
    const searchUrl = 'https://www.idealista.com/venta-viviendas/madrid-madrid/';
    await page.goto(searchUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('⏱️  Esperando carga completa...');
    await page.waitForTimeout(3000);

    // Obtener el HTML completo
    const html = await page.content();
    console.log(`📄 HTML recibido: ${html.length} caracteres\n`);

    // Guardar HTML para debugging
    const htmlPath = path.join(__dirname, 'idealista-page.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`💾 HTML guardado en: ${htmlPath}\n`);

    // Analizar con Cheerio
    const $ = cheerio.load(html);

    // TÉCNICA 1: Buscar JSON-LD (Schema.org markup)
    console.log('🔍 Buscando JSON-LD...');
    $('script[type="application/ld+json"]').each((i, elem) => {
      try {
        const content = $(elem).html();
        if (content) {
          const json = JSON.parse(content);
          const hasPropertyData = json['@type'] === 'Product' ||
                                  json['@type'] === 'RealEstateListing' ||
                                  Array.isArray(json) ||
                                  json.itemListElement;

          if (hasPropertyData) {
            console.log(`  ✨ JSON-LD encontrado (tipo: ${json['@type']})`);
            embeddedDataSources.push({
              type: 'json-ld',
              selector: 'script[type="application/ld+json"]',
              content: content,
              hasPropertyData: true,
              sampleData: json
            });
          }
        }
      } catch (e) {
        // No es JSON válido
      }
    });

    // TÉCNICA 2: Buscar variables JavaScript con datos
    console.log('\n🔍 Buscando variables JavaScript con datos...');
    const scriptPatterns = [
      /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
      /window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});/,
      /window\.dataLayer\s*=\s*(\[[\s\S]*?\]);/,
      /const\s+PROPERTIES\s*=\s*(\[[\s\S]*?\]);/,
      /var\s+properties\s*=\s*(\[[\s\S]*?\]);/,
      /window\.IDEALISTA_DATA\s*=\s*(\{[\s\S]*?\});/,
      /window\.REACT_APP_INITIAL_STATE\s*=\s*(\{[\s\S]*?\});/,
    ];

    $('script:not([src])').each((i, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent) {
        for (const pattern of scriptPatterns) {
          const match = scriptContent.match(pattern);
          if (match && match[1]) {
            try {
              // Intentar parsear el JSON
              const jsonStr = match[1];
              const json = JSON.parse(jsonStr);

              console.log(`  ✨ Variable JavaScript encontrada: ${pattern.source.split('\\s')[0]}`);
              console.log(`     Tamaño: ${jsonStr.length} caracteres`);

              // Verificar si contiene datos de propiedades
              const hasPropertyData = checkForPropertyData(json);

              if (hasPropertyData) {
                console.log(`     🎯 CONTIENE DATOS DE PROPIEDADES`);
                embeddedDataSources.push({
                  type: 'script-variable',
                  variableName: pattern.source.split('\\s')[0],
                  content: jsonStr,
                  hasPropertyData: true,
                  sampleData: json
                });
              }
            } catch (e) {
              // No es JSON válido o tiene sintaxis especial
            }
          }
        }
      }
    });

    // TÉCNICA 3: Buscar objetos window.* usando evaluación de página
    console.log('\n🔍 Buscando objetos en window...');
    const windowObjects = await page.evaluate(() => {
      const objects: any[] = [];
      const suspectKeys = [
        '__INITIAL_STATE__',
        '__PRELOADED_STATE__',
        '__NEXT_DATA__',
        'IDEALISTA_DATA',
        'REACT_APP_INITIAL_STATE',
        'dataLayer',
        'utag_data',
      ];

      for (const key of suspectKeys) {
        try {
          if ((window as any)[key]) {
            const value = (window as any)[key];
            objects.push({
              key,
              value: JSON.stringify(value),
              type: typeof value
            });
          }
        } catch (e) {
          // No accesible
        }
      }

      return objects;
    });

    windowObjects.forEach(obj => {
      try {
        const json = JSON.parse(obj.value);
        const hasPropertyData = checkForPropertyData(json);

        console.log(`  ✨ Objeto window.${obj.key} encontrado`);
        console.log(`     Tamaño: ${obj.value.length} caracteres`);

        if (hasPropertyData) {
          console.log(`     🎯 CONTIENE DATOS DE PROPIEDADES`);
          embeddedDataSources.push({
            type: 'window-object',
            variableName: `window.${obj.key}`,
            content: obj.value,
            hasPropertyData: true,
            sampleData: json
          });
        }
      } catch (e) {
        // No es JSON
      }
    });

    // TÉCNICA 4: Buscar data attributes en elementos HTML
    console.log('\n🔍 Buscando data-* attributes con JSON...');
    const dataAttributes = ['data-props', 'data-properties', 'data-items', 'data-listing', 'data-state'];

    dataAttributes.forEach(attr => {
      $(`[${attr}]`).each((i, elem) => {
        const data = $(elem).attr(attr);
        if (data && data.startsWith('{') || data && data.startsWith('[')) {
          try {
            const json = JSON.parse(data);
            const hasPropertyData = checkForPropertyData(json);

            if (hasPropertyData) {
              console.log(`  ✨ Data attribute encontrado: ${attr}`);
              console.log(`     🎯 CONTIENE DATOS DE PROPIEDADES`);
              embeddedDataSources.push({
                type: 'data-attribute',
                selector: `[${attr}]`,
                content: data,
                hasPropertyData: true,
                sampleData: json
              });
            }
          } catch (e) {
            // No es JSON válido
          }
        }
      });
    });

    // TÉCNICA 5: Extraer propiedades del DOM mismo
    console.log('\n🔍 Analizando estructura DOM de propiedades...');
    const propertiesFromDOM = await page.evaluate(() => {
      const properties = [];

      // Selectores comunes de tarjetas de propiedades
      const cardSelectors = [
        '.item-info-container',
        '[data-element-id]',
        '.property-card',
        '.listing-item'
      ];

      for (const selector of cardSelectors) {
        const cards = document.querySelectorAll(selector);
        if (cards.length > 0) {
          console.log(`Encontradas ${cards.length} cards con selector: ${selector}`);

          // Extraer datos de las primeras 3 tarjetas como muestra
          for (let i = 0; i < Math.min(3, cards.length); i++) {
            const card = cards[i];
            properties.push({
              selector,
              index: i,
              html: card.outerHTML.substring(0, 500),
              dataAttributes: Array.from(card.attributes)
                .filter(attr => attr.name.startsWith('data-'))
                .map(attr => ({ name: attr.name, value: attr.value }))
            });
          }

          break; // Solo procesar el primer selector que funcione
        }
      }

      return properties;
    });

    if (propertiesFromDOM.length > 0) {
      console.log(`  ✨ Encontradas ${propertiesFromDOM.length} propiedades en DOM`);
      console.log(`     Selector funcionando: ${propertiesFromDOM[0].selector}`);

      // Guardar muestra de HTML
      const samplePath = path.join(__dirname, 'idealista-property-sample.html');
      fs.writeFileSync(
        samplePath,
        propertiesFromDOM.map(p => p.html).join('\n\n---\n\n')
      );
      console.log(`     💾 Muestra guardada en: ${samplePath}`);

      // Buscar data attributes interesantes
      propertiesFromDOM.forEach(prop => {
        if (prop.dataAttributes && prop.dataAttributes.length > 0) {
          console.log(`\n     Data attributes en propiedad ${prop.index}:`);
          prop.dataAttributes.forEach((attr: any) => {
            console.log(`       - ${attr.name}: ${attr.value.substring(0, 100)}...`);
          });
        }
      });
    }

    // RESUMEN
    console.log('\n\n📊 RESUMEN DEL ANÁLISIS\n');
    console.log(`Total de fuentes de datos embebidos encontradas: ${embeddedDataSources.length}`);
    console.log(`Propiedades encontradas en DOM: ${propertiesFromDOM.length > 0 ? 'SÍ' : 'NO'}\n`);

    if (embeddedDataSources.length > 0) {
      console.log('✅ FUENTES DE DATOS ENCONTRADAS:\n');
      embeddedDataSources.forEach((source, i) => {
        console.log(`${i + 1}. Tipo: ${source.type}`);
        if (source.variableName) {
          console.log(`   Variable: ${source.variableName}`);
        }
        if (source.selector) {
          console.log(`   Selector: ${source.selector}`);
        }
        console.log(`   Tamaño: ${source.content.length} caracteres`);
        console.log(`   Tiene datos de propiedades: ${source.hasPropertyData ? '✅ SÍ' : '❌ NO'}\n`);
      });
    } else {
      console.log('⚠️  No se encontraron fuentes de datos JSON embebidos evidentes.');
      console.log('    Idealista probablemente usa:');
      console.log('    1. Server-side rendering puro (datos en HTML)');
      console.log('    2. APIs protegidas por DataDome');
      console.log('    3. Hydration desde HTML parseado en cliente\n');
    }

    // RECOMENDACIONES
    console.log('📋 RECOMENDACIONES:\n');

    if (embeddedDataSources.some(s => s.hasPropertyData)) {
      console.log('✅ ESTRATEGIA RECOMENDADA: Extraer datos de fuentes embebidas');
      console.log('   - Usar Playwright para cargar página');
      console.log('   - Extraer JSON de script tags o window objects');
      console.log('   - Parsear JSON directamente (bypasea DataDome)\n');
    } else if (propertiesFromDOM.length > 0) {
      console.log('✅ ESTRATEGIA RECOMENDADA: Scraping del DOM');
      console.log(`   - Selector funcionando: ${propertiesFromDOM[0].selector}`);
      console.log('   - Extraer datos directamente de los elementos HTML');
      console.log('   - Usar Cheerio o Playwright para parseo\n');
    } else {
      console.log('⚠️  ESTRATEGIA RECOMENDADA: Enfoque híbrido');
      console.log('   - Mejorar el scraper Playwright actual');
      console.log('   - Agregar mejor gestión de cookies DataDome');
      console.log('   - Considerar servicios pagos (ScraperAPI) como fallback\n');
    }

    // Guardar resultado completo
    const result = {
      timestamp: new Date().toISOString(),
      url: searchUrl,
      htmlSize: html.length,
      embeddedDataSources,
      domPropertiesFound: propertiesFromDOM.length,
      domPropertySample: propertiesFromDOM.length > 0 ? propertiesFromDOM[0] : null
    };

    const outputPath = path.join(__dirname, 'idealista-html-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`💾 Análisis completo guardado en: ${outputPath}\n`);

  } catch (error) {
    console.error('\n❌ Error durante el análisis:', error);
  } finally {
    await browser.close();
  }
}

/**
 * Verifica si un objeto JSON contiene datos de propiedades
 */
function checkForPropertyData(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;

  const propertyKeys = [
    'properties', 'items', 'listings', 'results', 'elementList',
    'price', 'priceInfo', 'size', 'rooms', 'address', 'location',
    'propertyCode', 'propertyId', 'adId'
  ];

  // Búsqueda recursiva
  const search = (o: any, depth: number = 0): boolean => {
    if (depth > 3) return false; // Limitar profundidad

    if (Array.isArray(o)) {
      return o.length > 0 && o.some(item => search(item, depth + 1));
    }

    if (typeof o === 'object' && o !== null) {
      // Verificar si tiene claves relacionadas con propiedades
      const keys = Object.keys(o);
      const hasPropertyKeys = keys.some(key =>
        propertyKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase()))
      );

      if (hasPropertyKeys) return true;

      // Buscar en hijos
      return keys.some(key => search(o[key], depth + 1));
    }

    return false;
  };

  return search(obj);
}

// Ejecutar análisis
analyzeIdealistaHTML().catch(console.error);
