import { scrapeIdealista } from './idealista-scraper';
import { scrapeFotocasa } from './fotocasa-scraper';
import { scrapePisosCom } from './pisoscom-scraper';
import { scrapeIdealistaWithScraperAPI } from './idealista-scraperapi';
import { ScrapedProperty } from './idealista-scraper';
import prisma from '@/lib/db/prisma';

export * from './idealista-scraper';
export * from './fotocasa-scraper';
export * from './pisoscom-scraper';
export * from './idealista-scraperapi';

/**
 * Ejecuta todos los scrapers en paralelo
 */
export async function scrapeAllPortals(maxPagesPerZone: number = 2): Promise<{
  total: number;
  saved: number;
  errors: number;
  properties: ScrapedProperty[];
}> {
  console.log('🚀 Iniciando scraping de todos los portales (secuencial)...');

  const allProperties: ScrapedProperty[] = [];
  let errors = 0;
  let saved = 0;

  // Usando @sparticuz/chromium - funciona en Vercel con Playwright
  const portals = [
    { name: 'Idealista', fn: scrapeIdealista }, // ✅ Playwright + @sparticuz/chromium
    { name: 'Pisos.com', fn: scrapePisosCom }, // ✅ Playwright + @sparticuz/chromium
    // { name: 'Fotocasa', fn: scrapeFotocasa }, // ❌ Deshabilitado: no encuentra propiedades
  ];

  for (const portal of portals) {
    try {
      console.log(`\n📍 Iniciando ${portal.name}...`);
      const startTime = Date.now();
      const properties = await portal.fn(maxPagesPerZone);
      const scrapingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ ${portal.name}: ${properties.length} propiedades (${scrapingTime}s)`);
      allProperties.push(...properties);

      // Guardar inmediatamente después de cada portal para evitar pérdida por timeout
      if (properties.length > 0) {
        console.log(`💾 Guardando ${properties.length} propiedades de ${portal.name}...`);
        const saveStartTime = Date.now();
        const portalSaved = await savePropertiesToDatabase(properties);
        const saveTime = ((Date.now() - saveStartTime) / 1000).toFixed(1);
        saved += portalSaved;
        console.log(`✅ Guardadas ${portalSaved} propiedades de ${portal.name} (${saveTime}s)`);
      }
    } catch (error) {
      console.error(`❌ ${portal.name}: Error`, error);
      errors++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`  Total scrapeadas: ${allProperties.length}`);
  console.log(`  Guardadas en DB: ${saved}`);
  console.log(`  Errores: ${errors}`);

  return {
    total: allProperties.length,
    saved,
    errors,
    properties: allProperties,
  };
}

/**
 * Guarda las propiedades scrapeadas en la base de datos
 */
export async function savePropertiesToDatabase(
  properties: ScrapedProperty[]
): Promise<number> {
  let savedCount = 0;

  console.log(`\n💾 Guardando ${properties.length} propiedades en base de datos...`);

  // Obtener todas las URLs existentes en una sola query
  const urls = properties.map(p => p.url);
  const existingProperties = await prisma.property.findMany({
    where: { url: { in: urls } },
    select: { id: true, url: true, price: true, status: true },
  });

  const existingMap = new Map(existingProperties.map(p => [p.url, p]));
  console.log(`  Propiedades existentes: ${existingProperties.length}`);

  // Separar propiedades nuevas y existentes
  const newProperties: ScrapedProperty[] = [];
  const toUpdate: Array<{ existing: typeof existingProperties[0], new: ScrapedProperty }> = [];

  for (const property of properties) {
    const existing = existingMap.get(property.url);
    if (existing) {
      if (existing.price !== property.price) {
        toUpdate.push({ existing, new: property });
      }
    } else {
      newProperties.push(property);
    }
  }

  console.log(`  Nuevas a crear: ${newProperties.length}, A actualizar: ${toUpdate.length}`);

  // Crear propiedades nuevas en batch
  if (newProperties.length > 0) {
    try {
      const created = await prisma.property.createMany({
        data: newProperties.map(property => ({
          url: property.url,
          portal: property.portal,
          title: property.title,
          price: property.price,
          m2: property.m2,
          pricePerM2: property.pricePerM2,
          address: property.address,
          zone: property.zone,
          city: property.city,
          latitude: property.latitude,
          longitude: property.longitude,
          rooms: property.rooms,
          bathrooms: property.bathrooms,
          floor: property.floor,
          isExterior: property.isExterior,
          hasLift: property.hasLift,
          buildYear: property.buildYear,
          condition: property.condition,
          needsReform: property.needsReform,
          images: property.images,
          description: property.description,
          score: property.score,
          scoreDetails: property.scoreDetails as any,
        })),
        skipDuplicates: true,
      });
      savedCount = created.count;
      console.log(`  ✅ Creadas ${created.count} propiedades nuevas`);
    } catch (error) {
      console.error(`  ❌ Error en createMany:`, error);
      // Fallback: crear una por una si falla el batch
      for (const property of newProperties) {
        try {
          await prisma.property.create({
            data: {
              url: property.url,
              portal: property.portal,
              title: property.title,
              price: property.price,
              m2: property.m2,
              pricePerM2: property.pricePerM2,
              address: property.address,
              zone: property.zone,
              city: property.city,
              latitude: property.latitude,
              longitude: property.longitude,
              rooms: property.rooms,
              bathrooms: property.bathrooms,
              floor: property.floor,
              isExterior: property.isExterior,
              hasLift: property.hasLift,
              buildYear: property.buildYear,
              condition: property.condition,
              needsReform: property.needsReform,
              images: property.images,
              description: property.description,
              score: property.score,
              scoreDetails: property.scoreDetails as any,
            },
          });
          savedCount++;
        } catch (err) {
          console.error(`  ❌ Error guardando ${property.url}:`, err);
        }
      }
    }
  }

  // Actualizar precios (estas operaciones son más rápidas)
  for (const { existing, new: property } of toUpdate) {
    try {
      await prisma.$transaction([
        prisma.property.update({
          where: { id: existing.id },
          data: {
            price: property.price,
            pricePerM2: property.pricePerM2,
            score: property.score,
            scoreDetails: property.scoreDetails as any,
            updatedAt: new Date(),
          },
        }),
        prisma.propertyHistory.create({
          data: {
            propertyId: existing.id,
            price: property.price,
            pricePerM2: property.pricePerM2,
            status: existing.status,
          },
        }),
      ]);
      console.log(`  ✅ Precio actualizado: ${existing.price} → ${property.price}`);
    } catch (error) {
      console.error(`  ❌ Error actualizando ${property.url}:`, error);
    }
  }

  console.log(`\n💾 Guardado completado: ${savedCount} nuevas de ${properties.length} total\n`);

  return savedCount;
}
