const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const demoProperties = [
  // GUINDALERA - Propiedades reformadas
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-001',
    url: 'https://clikalia.es/demo/001',
    title: 'Piso reformado Guindalera, 3 habitaciones',
    address: 'Calle Francisco Silvela, 95',
    zone: 'GUINDALERA',
    city: 'Madrid',
    latitude: 40.4342,
    longitude: -3.6628,
    salePrice: 570000,
    salePricePerM2: 4750,
    surface: 120,
    rooms: 3,
    bathrooms: 2,
    floor: 4,
    isExterior: true,
    hasLift: true,
    buildYear: 1975,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'alta',
    saleDate: new Date('2024-10-15'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property - Reforma integral alta calidad',
  },
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-002',
    url: 'https://clikalia.es/demo/002',
    title: 'Luminoso piso reformado López de Hoyos',
    address: 'Calle López de Hoyos, 155',
    zone: 'GUINDALERA',
    city: 'Madrid',
    latitude: 40.4355,
    longitude: -3.6645,
    salePrice: 625000,
    salePricePerM2: 4808,
    surface: 130,
    rooms: 3,
    bathrooms: 2,
    floor: 5,
    isExterior: true,
    hasLift: true,
    buildYear: 1978,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'media',
    saleDate: new Date('2024-10-20'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property - Reforma calidad media',
  },
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-003',
    url: 'https://clikalia.es/demo/003',
    title: 'Piso exterior reformado',
    address: 'Avenida de América, 18',
    zone: 'GUINDALERA',
    city: 'Madrid',
    latitude: 40.4325,
    longitude: -3.6655,
    salePrice: 495000,
    salePricePerM2: 4500,
    surface: 110,
    rooms: 2,
    bathrooms: 2,
    floor: 3,
    isExterior: true,
    hasLift: true,
    buildYear: 1972,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'media',
    saleDate: new Date('2024-10-25'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property',
  },
  // DELICIAS
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-004',
    url: 'https://clikalia.es/demo/004',
    title: 'Piso reformado Delicias',
    address: 'Calle Palos de la Frontera, 50',
    zone: 'DELICIAS',
    city: 'Madrid',
    latitude: 40.3998,
    longitude: -3.6948,
    salePrice: 450000,
    salePricePerM2: 3750,
    surface: 120,
    rooms: 3,
    bathrooms: 2,
    floor: 4,
    isExterior: true,
    hasLift: true,
    buildYear: 1970,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'media',
    saleDate: new Date('2024-10-18'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property',
  },
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-005',
    url: 'https://clikalia.es/demo/005',
    title: 'Piso completamente reformado Delicias',
    address: 'Calle Embajadores, 215',
    zone: 'DELICIAS',
    city: 'Madrid',
    latitude: 40.4005,
    longitude: -3.6955,
    salePrice: 540000,
    salePricePerM2: 4050,
    surface: 133,
    rooms: 3,
    bathrooms: 2,
    floor: 3,
    isExterior: true,
    hasLift: true,
    buildYear: 1974,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'alta',
    saleDate: new Date('2024-10-28'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property - Alta calidad',
  },
  // PACIFICO
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-006',
    url: 'https://clikalia.es/demo/006',
    title: 'Piso reformado Pacífico',
    address: 'Calle Doctor Esquerdo, 60',
    zone: 'PACIFICO',
    city: 'Madrid',
    latitude: 40.4105,
    longitude: -3.6715,
    salePrice: 575000,
    salePricePerM2: 4600,
    surface: 125,
    rooms: 3,
    bathrooms: 2,
    floor: 4,
    isExterior: true,
    hasLift: true,
    buildYear: 1976,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'alta',
    saleDate: new Date('2024-10-10'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property',
  },
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-007',
    url: 'https://clikalia.es/demo/007',
    title: 'Piso exterior reformado O\'Donnell',
    address: 'Calle O\'Donnell, 40',
    zone: 'PACIFICO',
    city: 'Madrid',
    latitude: 40.4085,
    longitude: -3.6735,
    salePrice: 490000,
    salePricePerM2: 4455,
    surface: 110,
    rooms: 2,
    bathrooms: 2,
    floor: 3,
    isExterior: true,
    hasLift: true,
    buildYear: 1975,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'media',
    saleDate: new Date('2024-10-22'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property',
  },
  // PROSPERIDAD
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-008',
    url: 'https://clikalia.es/demo/008',
    title: 'Piso reformado Prosperidad',
    address: 'Calle López de Hoyos, 285',
    zone: 'PROSPERIDAD',
    city: 'Madrid',
    latitude: 40.4435,
    longitude: -3.6785,
    salePrice: 610000,
    salePricePerM2: 4766,
    surface: 128,
    rooms: 3,
    bathrooms: 2,
    floor: 5,
    isExterior: true,
    hasLift: true,
    buildYear: 1973,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'alta',
    saleDate: new Date('2024-10-14'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property',
  },
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-009',
    url: 'https://clikalia.es/demo/009',
    title: 'Luminoso piso reformado María de Molina',
    address: 'Calle María de Molina, 55',
    zone: 'PROSPERIDAD',
    city: 'Madrid',
    latitude: 40.4445,
    longitude: -3.6765,
    salePrice: 735000,
    salePricePerM2: 4900,
    surface: 150,
    rooms: 4,
    bathrooms: 2,
    floor: 4,
    isExterior: true,
    hasLift: true,
    buildYear: 1978,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'alta',
    saleDate: new Date('2024-10-05'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property - Gran superficie',
  },
  // RETIRO
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-010',
    url: 'https://clikalia.es/demo/010',
    title: 'Piso reformado Retiro',
    address: 'Calle Conde de Peñalver, 25',
    zone: 'RETIRO',
    city: 'Madrid',
    latitude: 40.4145,
    longitude: -3.6850,
    salePrice: 690000,
    salePricePerM2: 5520,
    surface: 125,
    rooms: 3,
    bathrooms: 2,
    floor: 4,
    isExterior: true,
    hasLift: true,
    buildYear: 1975,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'alta',
    saleDate: new Date('2024-10-12'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property - Zona premium',
  },
  // ARGUELLES
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-011',
    url: 'https://clikalia.es/demo/011',
    title: 'Piso reformado Argüelles',
    address: 'Calle Gaztambide, 20',
    zone: 'ARGUELLES',
    city: 'Madrid',
    latitude: 40.4300,
    longitude: -3.7200,
    salePrice: 640000,
    salePricePerM2: 5120,
    surface: 125,
    rooms: 3,
    bathrooms: 2,
    floor: 5,
    isExterior: true,
    hasLift: true,
    buildYear: 1974,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'alta',
    saleDate: new Date('2024-10-19'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property',
  },
  {
    portal: 'IDEALISTA',
    externalId: 'clikalia-demo-012',
    url: 'https://clikalia.es/demo/012',
    title: 'Amplio piso reformado Vallehermoso',
    address: 'Calle Vallehermoso, 85',
    zone: 'ARGUELLES',
    city: 'Madrid',
    latitude: 40.4315,
    longitude: -3.7175,
    salePrice: 795000,
    salePricePerM2: 5300,
    surface: 150,
    rooms: 4,
    bathrooms: 3,
    floor: 4,
    isExterior: true,
    hasLift: true,
    buildYear: 1976,
    condition: 'reformado',
    wasReformed: true,
    reformQuality: 'alta',
    saleDate: new Date('2024-10-24'),
    dataSource: 'clikalia',
    reliability: 9,
    notes: 'Demo property - Lujo',
  },
];

async function main() {
  console.log('\n🏠 Añadiendo comparables de demostración (simulando Clikalia)...\n');

  let added = 0;
  let skipped = 0;

  for (const prop of demoProperties) {
    try {
      const existing = await prisma.soldProperty.findUnique({
        where: {
          portal_externalId: {
            portal: prop.portal,
            externalId: prop.externalId,
          },
        },
      });

      if (existing) {
        console.log(`⏭️  Saltando: ${prop.title} (ya existe)`);
        skipped++;
        continue;
      }

      await prisma.soldProperty.create({ data: prop });
      console.log(`✅ Añadido: ${prop.title} - ${prop.zone} - ${prop.salePricePerM2}€/m²`);
      added++;
    } catch (error) {
      console.error(`❌ Error: ${prop.title} - ${error.message}`);
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Añadidos: ${added}`);
  console.log(`   Saltados: ${skipped}`);

  console.log(`\n📈 Actualizando estadísticas de zonas...`);

  const zones = ['GUINDALERA', 'DELICIAS', 'PACIFICO', 'PROSPERIDAD', 'RETIRO', 'ARGUELLES'];

  for (const zoneName of zones) {
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

    const diff = avgReformedPrice && avgUnreformedPrice
      ? Math.round(((avgReformedPrice - avgUnreformedPrice) / avgUnreformedPrice) * 100)
      : 0;

    console.log(`   ${zoneName}:`);
    console.log(`      - Reformadas: ${avgReformedPrice ? avgReformedPrice.toLocaleString() + '€/m²' : 'N/A'}`);
    console.log(`      - Sin reformar: ${avgUnreformedPrice ? avgUnreformedPrice.toLocaleString() + '€/m²' : 'N/A'}`);
    if (diff > 0) {
      console.log(`      - Diferencia: +${diff}% por reforma`);
    }
  }

  console.log('\n✨ ¡Comparables de demostración añadidos!\n');

  await prisma.$disconnect();
}

main();
