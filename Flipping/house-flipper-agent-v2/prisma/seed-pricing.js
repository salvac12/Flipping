const { PrismaClient, ReformType, ReformQuality } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding pricing data...');

  // 1. Crear datos de costes de reforma
  console.log('📊 Creating reform costs...');

  const reformCosts = [
    // REFORMA INTEGRAL - BASIC
    {
      name: 'Reforma integral básica - Madrid',
      zone: null,
      reformType: 'INTEGRAL',
      quality: 'BASIC',
      costPerM2: 600,
      minCost: 50000,
      maxCost: null,
      includesItems: [
        'demolición',
        'electricidad básica',
        'fontanería básica',
        'alicatado baño y cocina',
        'pintura',
        'suelos laminados',
        'puertas básicas',
        'sanitarios estándar',
      ],
      excludesItems: ['muebles', 'electrodomésticos', 'aire acondicionado', 'diseño'],
      source: 'estimate',
      year: 2025,
      isActive: true,
      notes: 'Calidad básica funcional. Materiales estándar.',
    },

    // REFORMA INTEGRAL - MEDIUM
    {
      name: 'Reforma integral media - Madrid',
      zone: null,
      reformType: 'INTEGRAL',
      quality: 'MEDIUM',
      costPerM2: 800,
      minCost: 80000,
      maxCost: null,
      includesItems: [
        'demolición',
        'electricidad completa',
        'fontanería completa',
        'alicatado calidad media',
        'pintura plástica',
        'suelos porcelánicos',
        'puertas calidad media',
        'sanitarios calidad media',
        'muebles de cocina básicos',
        'falso techo con focos',
      ],
      excludesItems: ['electrodomésticos gama alta', 'domótica', 'diseño personalizado'],
      source: 'estimate',
      year: 2025,
      isActive: true,
      notes: 'Calidad media-alta. Acabados decentes para reventa.',
    },

    // REFORMA INTEGRAL - HIGH
    {
      name: 'Reforma integral alta - Madrid',
      zone: null,
      reformType: 'INTEGRAL',
      quality: 'HIGH',
      costPerM2: 1100,
      minCost: 120000,
      maxCost: null,
      includesItems: [
        'demolición',
        'electricidad completa',
        'fontanería completa',
        'alicatado alta calidad',
        'pintura alta calidad',
        'suelos porcelánicos alta gama',
        'carpintería a medida',
        'sanitarios Roca/Duravit',
        'cocina equipada calidad',
        'aire acondicionado',
        'domótica básica',
        'iluminación LED diseño',
      ],
      excludesItems: ['mobiliario', 'decoración'],
      source: 'estimate',
      year: 2025,
      isActive: true,
      notes: 'Alta calidad. Ideal para zona premium o venta rápida.',
    },

    // REFORMA INTEGRAL - LUXURY
    {
      name: 'Reforma integral lujo - Madrid',
      zone: null,
      reformType: 'INTEGRAL',
      quality: 'LUXURY',
      costPerM2: 1500,
      minCost: 180000,
      maxCost: null,
      includesItems: [
        'demolición',
        'instalaciones completas',
        'materiales premium',
        'acabados de lujo',
        'cocina alta gama',
        'baños diseño',
        'domótica completa',
        'aire acondicionado centralizado',
        'suelo radiante',
        'carpintería a medida premium',
        'iluminación diseñador',
      ],
      excludesItems: [],
      source: 'estimate',
      year: 2025,
      isActive: true,
      notes: 'Máxima calidad. Para zonas prime (Salamanca, Chamberí).',
    },

    // REFORMA PARCIAL - BASIC
    {
      name: 'Reforma baño y cocina básica',
      zone: null,
      reformType: 'PARTIAL',
      quality: 'BASIC',
      costPerM2: 300,
      minCost: 15000,
      maxCost: 30000,
      includesItems: [
        'reforma baño completa',
        'reforma cocina completa',
        'alicatado',
        'sanitarios básicos',
        'muebles cocina básicos',
      ],
      excludesItems: ['pintura resto vivienda', 'suelos resto vivienda', 'electricidad general'],
      source: 'estimate',
      year: 2025,
      isActive: true,
      notes: 'Solo baño y cocina. Resto vivienda sin tocar.',
    },

    // REFORMA COSMÉTICA - BASIC
    {
      name: 'Reforma cosmética - pintura y suelos',
      zone: null,
      reformType: 'COSMETIC',
      quality: 'BASIC',
      costPerM2: 150,
      minCost: 8000,
      maxCost: 20000,
      includesItems: ['pintura completa', 'suelos laminados', 'pequeñas reparaciones'],
      excludesItems: ['baños', 'cocina', 'instalaciones'],
      source: 'estimate',
      year: 2025,
      isActive: true,
      notes: 'Solo estética. Para propiedades en buen estado estructural.',
    },

    // REFORMA COSMÉTICA - MEDIUM
    {
      name: 'Reforma cosmética calidad media',
      zone: null,
      reformType: 'COSMETIC',
      quality: 'MEDIUM',
      costPerM2: 250,
      minCost: 15000,
      maxCost: 35000,
      includesItems: [
        'pintura alta calidad',
        'suelos porcelánicos',
        'cambio puertas',
        'iluminación',
        'pequeñas mejoras',
      ],
      excludesItems: ['baños completos', 'cocina completa'],
      source: 'estimate',
      year: 2025,
      isActive: true,
      notes: 'Actualización estética de calidad sin obras mayores.',
    },

    // REFORMA ESTRUCTURAL
    {
      name: 'Reforma estructural',
      zone: null,
      reformType: 'STRUCTURAL',
      quality: 'BASIC',
      costPerM2: 400,
      minCost: 40000,
      maxCost: null,
      includesItems: [
        'refuerzo estructural',
        'vigas metálicas',
        'muros de carga',
        'proyecto técnico',
        'licencia obras',
      ],
      excludesItems: ['acabados', 'instalaciones', 'decoración'],
      source: 'estimate',
      year: 2025,
      isActive: true,
      notes: 'Solo estructura. Requiere proyecto de arquitecto e ingeniero.',
    },
  ];

  for (const cost of reformCosts) {
    const id = `${cost.reformType}_${cost.quality}_${cost.zone || 'GENERAL'}`;
    try {
      await prisma.reformCost.upsert({
        where: { id },
        update: cost,
        create: { ...cost, id },
      });
    } catch (error) {
      console.log(`Creating ${id} without upsert...`);
      await prisma.reformCost.create({ data: { ...cost, id } }).catch(() => {});
    }
  }

  console.log(`✅ Created ${reformCosts.length} reform cost entries`);

  // 2. Crear zonas de mercado con precios actualizados
  console.log('🗺️  Creating market zones...');

  const marketZones = [
    {
      name: 'GUINDALERA',
      displayName: 'Guindalera',
      centerLatitude: 40.4408,
      centerLongitude: -3.6711,
      radius: 800,
      avgPricePerM2: 4500,
      minPricePerM2: 3500,
      maxPricePerM2: 5800,
      avgReformedPricePerM2: 5200,
      avgUnreformedPricePerM2: 3800,
      propertiesCount: 0,
      soldCount: 0,
      avgDaysOnMarket: 45,
      priceGrowth3m: 2.3,
      priceGrowth6m: 4.5,
      priceGrowth12m: 8.2,
      isActive: true,
    },
    {
      name: 'DELICIAS',
      displayName: 'Delicias',
      centerLatitude: 40.3987,
      centerLongitude: -3.6935,
      radius: 1000,
      avgPricePerM2: 3800,
      minPricePerM2: 2900,
      maxPricePerM2: 5000,
      avgReformedPricePerM2: 4600,
      avgUnreformedPricePerM2: 3200,
      propertiesCount: 0,
      soldCount: 0,
      avgDaysOnMarket: 52,
      priceGrowth3m: 1.8,
      priceGrowth6m: 3.2,
      priceGrowth12m: 6.5,
      isActive: true,
    },
    {
      name: 'PACIFICO',
      displayName: 'Pacífico',
      centerLatitude: 40.4025,
      centerLongitude: -3.6704,
      radius: 900,
      avgPricePerM2: 4200,
      minPricePerM2: 3300,
      maxPricePerM2: 5500,
      avgReformedPricePerM2: 4900,
      avgUnreformedPricePerM2: 3600,
      propertiesCount: 0,
      soldCount: 0,
      avgDaysOnMarket: 48,
      priceGrowth3m: 2.1,
      priceGrowth6m: 4.0,
      priceGrowth12m: 7.8,
      isActive: true,
    },
    {
      name: 'PROSPERIDAD',
      displayName: 'Prosperidad',
      centerLatitude: 40.4519,
      centerLongitude: -3.6701,
      radius: 850,
      avgPricePerM2: 4600,
      minPricePerM2: 3600,
      maxPricePerM2: 6000,
      avgReformedPricePerM2: 5400,
      avgUnreformedPricePerM2: 3900,
      propertiesCount: 0,
      soldCount: 0,
      avgDaysOnMarket: 42,
      priceGrowth3m: 2.5,
      priceGrowth6m: 5.1,
      priceGrowth12m: 9.2,
      isActive: true,
    },
    {
      name: 'RETIRO',
      displayName: 'Retiro',
      centerLatitude: 40.4144,
      centerLongitude: -3.6839,
      radius: 1200,
      avgPricePerM2: 5500,
      minPricePerM2: 4200,
      maxPricePerM2: 7500,
      avgReformedPricePerM2: 6500,
      avgUnreformedPricePerM2: 4800,
      propertiesCount: 0,
      soldCount: 0,
      avgDaysOnMarket: 38,
      priceGrowth3m: 3.2,
      priceGrowth6m: 6.5,
      priceGrowth12m: 11.8,
      isActive: true,
    },
    {
      name: 'ARGUELLES',
      displayName: 'Argüelles',
      centerLatitude: 40.4289,
      centerLongitude: -3.7184,
      radius: 900,
      avgPricePerM2: 5000,
      minPricePerM2: 3800,
      maxPricePerM2: 6800,
      avgReformedPricePerM2: 5900,
      avgUnreformedPricePerM2: 4300,
      propertiesCount: 0,
      soldCount: 0,
      avgDaysOnMarket: 40,
      priceGrowth3m: 2.8,
      priceGrowth6m: 5.5,
      priceGrowth12m: 10.2,
      isActive: true,
    },
  ];

  for (const zone of marketZones) {
    await prisma.marketZone.upsert({
      where: { name: zone.name },
      update: zone,
      create: zone,
    });
  }

  console.log(`✅ Created ${marketZones.length} market zones`);

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
