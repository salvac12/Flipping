import prisma from './lib/db/prisma';

async function testDatabase() {
  try {
    console.log('🔍 Conectando a la base de datos...');

    // Contar todas las propiedades
    const total = await prisma.property.count();
    console.log(`✅ Total de propiedades: ${total}`);

    // Obtener algunas propiedades de muestra
    const properties = await prisma.property.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        m2: true,
        score: true,
        status: true,
        portal: true,
        zone: true,
        createdAt: true,
      },
    });

    console.log('\n📊 Primeras 10 propiedades:');
    console.table(properties.map(p => ({
      title: p.title?.substring(0, 40),
      price: p.price,
      m2: p.m2,
      score: p.score,
      status: p.status,
      portal: p.portal,
      zone: p.zone,
    })));

    // Estadísticas por status
    const byStatus = await prisma.property.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('\n📈 Por estado:');
    byStatus.forEach(s => {
      console.log(`  ${s.status}: ${s._count}`);
    });

    // Estadísticas por score
    const scores = await prisma.property.findMany({
      select: { score: true },
    });

    const scoreRanges = {
      '0': scores.filter(s => s.score === 0).length,
      '1-20': scores.filter(s => s.score > 0 && s.score <= 20).length,
      '21-40': scores.filter(s => s.score > 20 && s.score <= 40).length,
      '41-60': scores.filter(s => s.score > 40 && s.score <= 60).length,
      '61-80': scores.filter(s => s.score > 60 && s.score <= 80).length,
      '81-100': scores.filter(s => s.score > 80 && s.score <= 100).length,
    };

    console.log('\n🎯 Distribución de scores:');
    Object.entries(scoreRanges).forEach(([range, count]) => {
      console.log(`  Score ${range}: ${count}`);
    });

    const avgScore = scores.length > 0
      ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(2)
      : 0;
    console.log(`\n📊 Score promedio: ${avgScore}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
