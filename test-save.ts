import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simular una propiedad como las que retorna el scraper
const testProperty = {
  url: `https://www.pisos.com/test-${Date.now()}`,
  portal: 'PISOS_COM' as const,
  title: 'Piso en venta en Madrid',
  price: 300000,
  m2: 120,
  pricePerM2: 2500,
  address: 'Calle Test 123',
  zone: 'MADRID',
  city: 'Madrid',
  isExterior: true,
  hasLift: false,
  needsReform: true,
  images: [],
  score: 50,
  scoreDetails: { location: 10, size: 15, price: 15, condition: 5, features: 5 },
};

async function testSave() {
  try {
    console.log('Probando guardado de propiedad...');

    const created = await prisma.property.create({
      data: {
        url: testProperty.url,
        portal: testProperty.portal,
        title: testProperty.title,
        price: testProperty.price,
        m2: testProperty.m2,
        pricePerM2: testProperty.pricePerM2,
        address: testProperty.address,
        zone: testProperty.zone,
        city: testProperty.city,
        isExterior: testProperty.isExterior,
        hasLift: testProperty.hasLift,
        needsReform: testProperty.needsReform,
        images: testProperty.images,
        score: testProperty.score,
        scoreDetails: testProperty.scoreDetails as any,
      },
    });

    console.log('✅ Propiedad guardada exitosamente:', created.id);

    // Limpiar
    await prisma.property.delete({ where: { id: created.id } });
    console.log('✅ Propiedad de prueba eliminada');

  } catch (error) {
    console.error('❌ Error guardando propiedad:', error);
    console.error('Detalles del error:', JSON.stringify(error, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

testSave();
