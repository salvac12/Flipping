const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAllGuindalera() {
  const all = await prisma.soldProperty.findMany({
    where: { dataSource: 'gilmar' },
    select: { id: true, url: true, title: true, zone: true }
  });

  console.log('Buscando propiedades con "Guindalera" en el título:\n');

  let count = 0;
  const toUpdate = [];

  for (const prop of all) {
    const titleLower = (prop.title || '').toLowerCase();
    const urlLower = (prop.url || '').toLowerCase();

    if (titleLower.includes('guindalera') || urlLower.includes('guindalera')) {
      count++;
      const ref = prop.url.match(/referencia-(\d+)/);
      console.log(`${count}. Ref: ${ref ? ref[1] : 'N/A'}`);
      console.log(`   Título: ${prop.title}`);
      console.log(`   Zona actual: ${prop.zone}`);
      console.log('');

      if (prop.zone !== 'GUINDALERA') {
        toUpdate.push(prop.id);
      }
    }
  }

  console.log(`\nTotal encontradas con 'Guindalera': ${count}`);
  console.log(`Necesitan actualizar zona: ${toUpdate.length}`);

  if (toUpdate.length > 0) {
    console.log('\nActualizando zonas...');
    for (const id of toUpdate) {
      await prisma.soldProperty.update({
        where: { id },
        data: { zone: 'GUINDALERA' }
      });
    }
    console.log(`✅ ${toUpdate.length} propiedades actualizadas a GUINDALERA`);
  }

  await prisma.$disconnect();
}

findAllGuindalera().catch(console.error);
