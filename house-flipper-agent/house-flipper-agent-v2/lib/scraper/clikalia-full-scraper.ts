/**
 * Scraper completo de Clikalia Madrid
 * Extrae TODAS las propiedades disponibles en Madrid
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
 * Scraper principal que obtiene TODAS las propiedades de Clikalia en Madrid
 */
export async function scrapeAllClikaLiaMadrid(options: {
  maxProperties?: number;
  maxPages?: number;
}): Promise<ScraperResult> {
  const { maxProperties = 200, maxPages = 20 } = options;

  console.log('🚀 Iniciando scraping completo de Clikalia Madrid...');
  console.log(`   Máximo de propiedades: ${maxProperties}`);
  console.log(`   Máximo de páginas: ${maxPages}\n`);

  const browser = await chromium.launch({
    headless: true,
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

    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages && currentPage <= maxPages && allPropertyUrls.length < maxProperties) {
      const listingUrl = `https://clikalia.es/comprar/madrid?page=${currentPage}`;
      console.log(`   Página ${currentPage}: ${listingUrl}`);

      try {
        await page.goto(listingUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Extraer URLs de propiedades de esta página
        // Intentar múltiples selectores
        const propertyLinks = await page.evaluate(() => {
          const links: string[] = [];

          // Selector 1: Links con /comprar/inmueble/
          document.querySelectorAll('a[href*="/comprar/inmueble/"]').forEach((link) => {
            links.push((link as HTMLAnchorElement).href);
          });

          // Selector 2: Links con /comprar/ que tienen estructura de propiedad individual
          if (links.length === 0) {
            document.querySelectorAll('a[href*="/comprar/"]').forEach((link) => {
              const href = (link as HTMLAnchorElement).href;
              if (href.match(/\/comprar\/[^/]+\/[^/]+$/)) {
                links.push(href);
              }
            });
          }

          // Selector 3: Cualquier link que contenga "madrid" y números
          if (links.length === 0) {
            document.querySelectorAll('a[href*="madrid"]').forEach((link) => {
              const href = (link as HTMLAnchorElement).href;
              if (href.match(/madrid\/[\w-]+-\d+/)) {
                links.push(href);
              }
            });
          }

          return Array.from(new Set(links)); // Eliminar duplicados
        });

        // Filtrar duplicados
        const newUrls = propertyLinks.filter(url => !allPropertyUrls.includes(url));
        allPropertyUrls.push(...newUrls);

        console.log(`      ✓ Encontradas ${newUrls.length} propiedades (total: ${allPropertyUrls.length})`);

        // Si no encontramos propiedades, probablemente no hay más páginas
        if (newUrls.length === 0) {
          hasMorePages = false;
          console.log('      ℹ No hay más propiedades en esta página');
        }

        currentPage++;

        // Delay entre páginas para no sobrecargar el servidor
        await page.waitForTimeout(1000 + Math.random() * 1000);

      } catch (error: any) {
        console.error(`      ✗ Error en página ${currentPage}:`, error.message);
        hasMorePages = false;
      }
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

        result.totalProcessed++;

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
            portal: 'IDEALISTA', // Clikalia no está en el enum, usar IDEALISTA
            externalId: `clikalia-${Date.now()}-${i}`,
            url: url,
            title: propertyData.title,
            address: propertyData.address || 'Madrid',
            zone: propertyData.zone || 'OTROS',
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
            condition: 'reformado',
            wasReformed: true, // Clikalia siempre reformado
            reformQuality: 'alta', // Clikalia alta calidad
            saleDate: new Date(),
            dataSource: 'clikalia',
            reliability: 9, // Alta fiabilidad
            notes: 'Scrapeado automáticamente de Clikalia - Reforma alta calidad',
          },
        });

        result.saved++;
        result.properties.push(saved);

        console.log(`   ✅ Guardado: ${propertyData.pricePerM2}€/m² - ${propertyData.address}`);

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
