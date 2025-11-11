const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchAll() {
  const all = await prisma.soldProperty.findMany({
    where: { dataSource: 'gilmar' },
    select: {
      id: true,
      url: true,
      title: true,
      address: true,
      notes: true,
      zone: true
    }
  });

  console.log(`Total propiedades Gilmar en BD: ${all.length}\n`);
  console.log('Buscando "Guindalera" (cualquier variación)...\n');

  const matches = [];

  for (const prop of all) {
    const titleLower = (prop.title || '').toLowerCase();
    const urlLower = (prop.url || '').toLowerCase();
    const addressLower = (prop.address || '').toLowerCase();
    const notesLower = (prop.notes || '').toLowerCase();

    const allText = titleLower + ' ' + urlLower + ' ' + addressLower + ' ' + notesLower;

    if (allText.includes('guindalera')) {
      const ref = prop.url.match(/referencia-(\d+)/);
      matches.push({
        ref: ref ? ref[1] : 'N/A',
        title: prop.title,
        zone: prop.zone,
        id: prop.id
      });
    }
  }

  console.log(`Propiedades encontradas con 'Guindalera': ${matches.length}\n`);

  matches.forEach((m, i) => {
    console.log(`${i+1}. Ref: ${m.ref}`);
    console.log(`   Título: ${m.title}`);
    console.log(`   Zona: ${m.zone}`);
    console.log('');
  });

  // Actualizar las que no tienen zona GUINDALERA
  const toUpdate = matches.filter(m => m.zone !== 'GUINDALERA');

  if (toUpdate.length > 0) {
    console.log(`\nActualizando ${toUpdate.length} propiedades a zona GUINDALERA...\n`);
    for (const m of toUpdate) {
      await prisma.soldProperty.update({
        where: { id: m.id },
        data: { zone: 'GUINDALERA' }
      });
      console.log(`✅ Ref ${m.ref} actualizada`);
    }
  } else {
    console.log('✅ Todas las propiedades de Guindalera ya tienen la zona correcta');
  }

  await prisma.$disconnect();
}

searchAll().catch(console.error);
