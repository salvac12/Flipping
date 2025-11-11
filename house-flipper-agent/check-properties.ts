import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Consultando propiedades en la base de datos...\n');

  // Contar propiedades
  const total = await prisma.property.count();
  console.log(`✅ Total de propiedades: ${total}\n`);

  // Últimas 10 propiedades (más recientes)
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      title: true,
      price: true,
      m2: true,
      pricePerM2: true,
      zone: true,
      score: true,
      portal: true,
      createdAt: true,
      url: true,
    },
  });

  console.log('🏠 Últimas 10 propiedades scraped:\n');

  properties.forEach((prop, index) => {
    const priceFormatted = new Intl.NumberFormat('es-ES').format(prop.price);
    const pricePerM2Formatted = new Intl.NumberFormat('es-ES').format(prop.pricePerM2);
    const createdAt = new Date(prop.createdAt).toLocaleString('es-ES');

    console.log(`${index + 1}. ${prop.title.substring(0, 60)}...`);
    console.log(`   💰 Precio: ${priceFormatted}€ | 📐 ${prop.m2}m² | 📊 ${pricePerM2Formatted}€/m²`);
    console.log(`   🏷️  Portal: ${prop.portal} | ⭐ Score: ${prop.score.toFixed(1)} | 📍 ${prop.zone || 'Sin zona'}`);
    console.log(`   🕐 Scraped: ${createdAt}`);
    console.log(`   🔗 ${prop.url}`);
    console.log('');
  });

  // Estadísticas
  const stats = await prisma.property.aggregate({
    _avg: {
      price: true,
      m2: true,
      pricePerM2: true,
      score: true,
    },
    _min: {
      price: true,
    },
    _max: {
      price: true,
    },
  });

  console.log('📈 Estadísticas:');
  console.log(`   💰 Precio promedio: ${new Intl.NumberFormat('es-ES').format(stats._avg.price || 0)}€`);
  console.log(`   💰 Precio mínimo: ${new Intl.NumberFormat('es-ES').format(stats._min.price || 0)}€`);
  console.log(`   💰 Precio máximo: ${new Intl.NumberFormat('es-ES').format(stats._max.price || 0)}€`);
  console.log(`   📐 Superficie promedio: ${stats._avg.m2?.toFixed(0) || 0}m²`);
  console.log(`   📊 Precio/m² promedio: ${new Intl.NumberFormat('es-ES').format(stats._avg.pricePerM2 || 0)}€/m²`);
  console.log(`   ⭐ Score promedio: ${stats._avg.score?.toFixed(1) || 0}/100`);

  await prisma.$disconnect();
}

main();
