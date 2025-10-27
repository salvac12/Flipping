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
  console.log('🚀 Iniciando scraping de todos los portales (secuencial)...');

  const allProperties: ScrapedProperty[] = [];
  let errors = 0;

  // Ejecutar secuencialmente para reducir consumo de minutos
  const portals = [
    { name: 'Pisos.com', fn: scrapePisosCom },
    { name: 'Fotocasa', fn: scrapeFotocasa },
    { name: 'Idealista', fn: scrapeIdealista },
  ];

  for (const portal of portals) {
    try {
      console.log(`\n📍 Iniciando ${portal.name}...`);
      const properties = await portal.fn(maxPagesPerZone);
      console.log(`✅ ${portal.name}: ${properties.length} propiedades`);
      allProperties.push(...properties);
    } catch (error) {
      console.error(`❌ ${portal.name}: Error`, error);
      errors++;
    }
  }

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

  console.log(`\n💾 Guardando ${properties.length} propiedades en base de datos...`);

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    try {
      // Verificar si la propiedad ya existe
      const existing = await prisma.property.findUnique({
        where: { url: property.url },
      });

      if (existing) {
        console.log(`  ${i + 1}/${properties.length}: Ya existe (${property.title.substring(0, 30)}...)`);
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
          console.log(`    ✅ Precio actualizado: ${existing.price} → ${property.price}`);
        }
      } else {
        // Crear nueva propiedad
        const created = await prisma.property.create({
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

        console.log(`  ${i + 1}/${properties.length}: ✅ NUEVA - ${property.title.substring(0, 30)}... (ID: ${created.id})`);
        savedCount++;
      }
    } catch (error) {
      console.error(`  ${i + 1}/${properties.length}: ❌ Error guardando ${property.url}:`, error);
      console.error(`    Detalles:`, JSON.stringify(property, null, 2));
    }
  }

  console.log(`\n💾 Guardado completado: ${savedCount} nuevas de ${properties.length} total\n`);

  return savedCount;
}
