/**
 * Scraper completo de Gilmar Madrid
 * Extrae TODAS las propiedades disponibles en Madrid CAPITAL
 *
 * IMPORTANTE:
 * - Las propiedades de Gilmar NO están necesariamente reformadas
 * - El parser detecta si están reformadas basándose en la descripción
 * - Para validación adicional de reforma, se puede revisar las fotos manualmente después
 */

import { chromium } from 'playwright';
import { parsePropertyURL } from './improved-url-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScraperResult {
  totalFound: number;
  totalProcessed: number;
  saved: number;
  skipped: number;
  errors: number;
  properties: any[];
}

/**
 * Scraper principal que obtiene TODAS las propiedades de Gilmar en Madrid
 */
export async function scrapeAllGilmarMadrid(options: {
  maxProperties?: number;
  maxPages?: number;
}): Promise<ScraperResult> {
  const { maxProperties = 200, maxPages = 20 } = options;

  console.log('🚀 Iniciando scraping completo de Gilmar Madrid...');
  console.log(`   Máximo de propiedades: ${maxProperties}`);
  console.log(`   Máximo de páginas: ${maxPages}\n`);

  const browser = await chromium.launch({
    headless: true, // Cambia a false para depurar visualmente
    timeout: 60000
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  const allPropertyUrls: string[] = [];
  const result: ScraperResult = {
    totalFound: 0,
    totalProcessed: 0,
    saved: 0,
    skipped: 0,
    errors: 0,
    properties: [],
  };

  try {
    // Paso 1: Obtener todas las URLs de propiedades
    console.log('📄 Fase 1: Recopilando URLs de propiedades...\n');

    const listingUrl = `https://www.gilmar.es/comprar-viviendas/madrid/salamanca/guindalera/`;
    console.log(`   URL: ${listingUrl}`);

    try {
      await page.goto(listingUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      console.log('      ⏳ Esperando que carguen las propiedades con AJAX...');

      // Esperar a que aparezcan las propiedades (cargan con AJAX)
      try {
        await page.waitForSelector('a[href*="/inmueble/"]', { timeout: 15000 });
        console.log('      ✓ Propiedades iniciales cargadas!');
      } catch {
        console.log('      ⚠️  Timeout esperando propiedades iniciales');
      }

      let currentPageNum = 1;
      let hasMorePages = true;

      while (hasMorePages && currentPageNum <= maxPages && allPropertyUrls.length < maxProperties) {
        console.log(`      📄 Procesando página ${currentPageNum}...`);

        // Hacer scroll para asegurar que todas las propiedades de esta página estén visibles
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);

        // Extraer URLs de propiedades de la página actual
        const pagePropertyLinks = await page.evaluate(() => {
          const links: string[] = [];
          document.querySelectorAll('a[href*="/inmueble/"]').forEach((link) => {
            links.push((link as HTMLAnchorElement).href);
          });
          return Array.from(new Set(links));
        });

        const newUrls = pagePropertyLinks.filter(url => !allPropertyUrls.includes(url));
        allPropertyUrls.push(...newUrls);

        console.log(`      ✓ Página ${currentPageNum}: ${newUrls.length} propiedades nuevas (total: ${allPropertyUrls.length})`);

        // Buscar el botón de la siguiente página
        const hasNextPage = await page.evaluate((pageNum) => {
          const nextPageNumber = pageNum + 1;

          // Estrategia 1: Buscar el link con el número de la siguiente página
          const links = Array.from(document.querySelectorAll('a'));
          const nextNumberLink = links.find(link => {
            const text = link.textContent?.trim();
            return text === String(nextPageNumber);
          });

          if (nextNumberLink) {
            console.log(`Clickeando en página ${nextPageNumber}`);
            (nextNumberLink as HTMLElement).click();
            return true;
          }

          // Estrategia 2: Buscar flecha "siguiente" (>)
          const nextArrowLink = links.find(link => {
            const text = link.textContent?.trim();
            return text === '>' || text === '›' || text === '»';
          });

          if (nextArrowLink) {
            console.log('Clickeando en flecha siguiente');
            (nextArrowLink as HTMLElement).click();
            return true;
          }

          // Estrategia 3: Buscar por clase .next o rel="next"
          const nextLink = document.querySelector('a.next') ||
                          document.querySelector('a[rel="next"]');

          if (nextLink) {
            console.log('Clickeando en link next');
            (nextLink as HTMLElement).click();
            return true;
          }

          return false;
        }, currentPageNum);

        if (!hasNextPage) {
          console.log('      ℹ No hay más páginas');
          hasMorePages = false;
          break;
        }

        // Esperar a que cargue la siguiente página
        await page.waitForTimeout(3000);

        // Esperar a que las propiedades cambien
        try {
          await page.waitForFunction(
            (oldCount) => {
              const currentCount = document.querySelectorAll('a[href*="/inmueble/"]').length;
              return currentCount !== oldCount;
            },
            { timeout: 10000 },
            pagePropertyLinks.length
          );
        } catch {
          console.log('      ⚠️  Timeout esperando que cargue la siguiente página');
        }

        currentPageNum++;
      }

      // DEBUG: Tomar screenshot final
      await page.screenshot({ path: `debug-gilmar-final.png`, fullPage: true });
      console.log(`      📸 Screenshot guardado: debug-gilmar-final.png`);

    } catch (error: any) {
      console.error(`      ✗ Error cargando propiedades:`, error.message);
    }

    result.totalFound = allPropertyUrls.length;
    console.log(`\n✅ Total de URLs recopiladas: ${allPropertyUrls.length}\n`);

    await browser.close();

    // Paso 2: Procesar cada URL de propiedad
    console.log('🏠 Fase 2: Extrayendo datos de cada propiedad...\n');

    const propertiesToProcess = allPropertyUrls.slice(0, maxProperties);

    for (let i = 0; i < propertiesToProcess.length; i++) {
      const url = propertiesToProcess[i];
      const progress = `[${i + 1}/${propertiesToProcess.length}]`;

      try {
        console.log(`${progress} Procesando: ${url.split('/').pop()}`);

        // Usar nuestro parser mejorado
        const propertyData = await parsePropertyURL(url);

        if (!propertyData || !propertyData.price || !propertyData.surface) {
          console.log(`   ⚠️  Datos incompletos, saltando...`);
          result.errors++;
          continue;
        }

        // FILTRO IMPORTANTE: Solo propiedades de Guindalera
        const urlLower = url.toLowerCase();
        let addressLower = (propertyData.address || '').toLowerCase();
        const titleLower = (propertyData.title || '').toLowerCase();

        const isGuindalera = urlLower.includes('guindalera') ||
                            addressLower.includes('guindalera') ||
                            titleLower.includes('guindalera');

        if (!isGuindalera) {
          console.log(`   ⏭️  No es Guindalera (${propertyData.address}), saltando...`);
          result.skipped++;
          continue;
        }

        // FILTRO: Solo Madrid capital, no municipios alrededor
        // Verificar que la ciudad sea "Madrid" y no otros municipios
        const isNotMadridCapital =
          addressLower.includes('pozuelo') ||
          addressLower.includes('majadahonda') ||
          addressLower.includes('las rozas') ||
          addressLower.includes('alcobendas') ||
          addressLower.includes('boadilla') ||
          addressLower.includes('getafe') ||
          addressLower.includes('leganés') ||
          addressLower.includes('móstoles') ||
          addressLower.includes('alcorcón') ||
          addressLower.includes('fuenlabrada') ||
          addressLower.includes('torrejón');

        if (isNotMadridCapital) {
          console.log(`   ⏭️  No es Madrid capital (${propertyData.address}), saltando...`);
          result.skipped++;
          continue;
        }

        result.totalProcessed++;

        // Detectar zona desde la URL
        let detectedZone = 'OTROS';
        if (url.toLowerCase().includes('guindalera')) {
          detectedZone = 'GUINDALERA';
        } else if (addressLower.includes('guindalera') || titleLower.includes('guindalera')) {
          detectedZone = 'GUINDALERA';
        }

        // Verificar si ya existe en la BD
        const existing = await prisma.soldProperty.findFirst({
          where: {
            OR: [
              { url: url },
              {
                AND: [
                  { address: propertyData.address },
                  { salePrice: propertyData.price },
                ],
              },
            ],
          },
        });

        if (existing) {
          console.log(`   ⏭️  Ya existe en BD, saltando...`);
          result.skipped++;
          continue;
        }

        // Guardar en la base de datos
        const saved = await prisma.soldProperty.create({
          data: {
            portal: 'IDEALISTA', // Gilmar usa IDEALISTA en el enum
            externalId: `gilmar-${Date.now()}-${i}`,
            url: url,
            title: propertyData.title || 'Propiedad Gilmar',
            address: propertyData.address || 'Madrid',
            zone: detectedZone,
            city: 'Madrid',
            latitude: propertyData.latitude || 40.4168,
            longitude: propertyData.longitude || -3.7038,
            salePrice: propertyData.price,
            salePricePerM2: propertyData.pricePerM2,
            surface: propertyData.surface,
            rooms: propertyData.rooms,
            bathrooms: propertyData.bathrooms,
            floor: propertyData.floor,
            isExterior: propertyData.isExterior,
            hasLift: propertyData.hasLift,
            buildYear: propertyData.buildYear,
            condition: propertyData.condition,
            wasReformed: propertyData.wasReformed, // Detectado automáticamente, puede requerir validación manual con fotos
            reformQuality: propertyData.reformQuality,
            saleDate: new Date(),
            dataSource: 'gilmar',
            reliability: 8, // Alta fiabilidad
            notes: 'Scrapeado automáticamente de Gilmar - Madrid capital. Estado de reforma detectado del texto.',
          },
        });

        result.saved++;
        result.properties.push(saved);

        const reformStatus = propertyData.wasReformed
          ? `✅ REFORMADO (${propertyData.reformQuality})`
          : '⚠️  NECESITA CLASIFICACIÓN';

        console.log(`   ${reformStatus}: ${propertyData.pricePerM2}€/m² - ${propertyData.address}`);
        console.log(`      Ver fotos: ${url}`);

        // Delay entre propiedades
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      } catch (error: any) {
        console.error(`   ❌ Error:`, error.message);
        result.errors++;
      }
    }

    // Paso 3: Actualizar estadísticas por zona
    console.log('\n📊 Fase 3: Actualizando estadísticas por zona...\n');
    await updateAllZoneStatistics();

    console.log('\n✅ Scraping completado!\n');
    console.log('📊 Resumen:');
    console.log(`   URLs encontradas: ${result.totalFound}`);
    console.log(`   Propiedades procesadas: ${result.totalProcessed}`);
    console.log(`   Guardadas en BD: ${result.saved}`);
    console.log(`   Duplicadas (saltadas): ${result.skipped}`);
    console.log(`   Errores: ${result.errors}`);

  } catch (error: any) {
    console.error('❌ Error general en el scraping:', error);
    throw error;
  }

  return result;
}

/**
 * Actualiza las estadísticas de todas las zonas
 */
async function updateAllZoneStatistics() {
  const zones = ['GUINDALERA', 'DELICIAS', 'PACIFICO', 'PROSPERIDAD', 'RETIRO', 'ARGUELLES', 'OTROS'];

  for (const zoneName of zones) {
    try {
      const properties = await prisma.soldProperty.findMany({
        where: { zone: zoneName },
      });

      if (properties.length === 0) continue;

      const reformed = properties.filter(p => p.wasReformed);
      const unreformed = properties.filter(p => !p.wasReformed);

      const avgReformedPrice = reformed.length > 0
        ? Math.round(reformed.reduce((sum, p) => sum + p.salePricePerM2, 0) / reformed.length)
        : null;

      const avgUnreformedPrice = unreformed.length > 0
        ? Math.round(unreformed.reduce((sum, p) => sum + p.salePricePerM2, 0) / unreformed.length)
        : null;

      const avgPrice = Math.round(
        properties.reduce((sum, p) => sum + p.salePricePerM2, 0) / properties.length
      );

      await prisma.marketZone.upsert({
        where: { name: zoneName },
        update: {
          avgPricePerM2: avgPrice,
          avgReformedPricePerM2: avgReformedPrice,
          avgUnreformedPricePerM2: avgUnreformedPrice,
          propertiesCount: properties.length,
          soldCount: properties.length,
          lastUpdated: new Date(),
        },
        create: {
          name: zoneName,
          displayName: zoneName.charAt(0) + zoneName.slice(1).toLowerCase(),
          centerLatitude: properties[0].latitude,
          centerLongitude: properties[0].longitude,
          radius: 1000,
          avgPricePerM2: avgPrice,
          minPricePerM2: Math.min(...properties.map(p => p.salePricePerM2)),
          maxPricePerM2: Math.max(...properties.map(p => p.salePricePerM2)),
          avgReformedPricePerM2: avgReformedPrice,
          avgUnreformedPricePerM2: avgUnreformedPrice,
          propertiesCount: properties.length,
          soldCount: properties.length,
        },
      });

      console.log(`   ✓ ${zoneName}: ${properties.length} propiedades (${avgReformedPrice}€/m² reformadas)`);
    } catch (error) {
      console.error(`   ✗ Error actualizando ${zoneName}:`, error);
    }
  }
}
