import { scrapeIdealista } from './idealista-scraper';
import { scrapeFotocasa } from './fotocasa-scraper';
import { scrapePisosCom } from './pisoscom-scraper';
import { ScrapedProperty } from './idealista-scraper';
import prisma from '@/lib/db/prisma';

export * from './idealista-scraper';
export * from './fotocasa-scraper';
export * from './pisoscom-scraper';

/**
 * Ejecuta todos los scrapers en paralelo
 */
export async function scrapeAllPortals(maxPagesPerZone: number = 2): Promise<{
  total: number;
  saved: number;
  errors: number;
  properties: ScrapedProperty[];
}> {
  console.log('🚀 Iniciando scraping de todos los portales...');

  const results = await Promise.allSettled([
    scrapeIdealista(maxPagesPerZone),
    scrapeFotocasa(maxPagesPerZone),
    scrapePisosCom(maxPagesPerZone),
  ]);

  const allProperties: ScrapedProperty[] = [];
  let errors = 0;

  results.forEach((result, index) => {
    const portalName = ['Idealista', 'Fotocasa', 'Pisos.com'][index];

    if (result.status === 'fulfilled') {
      console.log(`✅ ${portalName}: ${result.value.length} propiedades`);
      allProperties.push(...result.value);
    } else {
      console.error(`❌ ${portalName}: Error`, result.reason);
      errors++;
    }
  });

  // Guardar propiedades en base de datos
  const saved = await savePropertiesToDatabase(allProperties);

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

  for (const property of properties) {
    try {
      // Verificar si la propiedad ya existe
      const existing = await prisma.property.findUnique({
        where: { url: property.url },
      });

      if (existing) {
        // Actualizar si ha cambiado el precio
        if (existing.price !== property.price) {
          await prisma.property.update({
            where: { id: existing.id },
            data: {
              price: property.price,
              pricePerM2: property.pricePerM2,
              score: property.score,
              scoreDetails: property.scoreDetails as any,
              updatedAt: new Date(),
            },
          });

          // Guardar historial de precio
          await prisma.propertyHistory.create({
            data: {
              propertyId: existing.id,
              price: property.price,
              pricePerM2: property.pricePerM2,
              status: existing.status,
            },
          });
        }
      } else {
        // Crear nueva propiedad
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
      }
    } catch (error) {
      console.error(`Error guardando propiedad ${property.url}:`, error);
    }
  }

  return savedCount;
}
