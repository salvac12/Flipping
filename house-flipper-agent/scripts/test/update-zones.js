const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateZones() {
  console.log('🔄 Actualizando zonas de propiedades Gilmar (búsqueda exhaustiva)...\n');

  // Obtener todas las propiedades de Gilmar con todos los campos de texto
  const properties = await prisma.soldProperty.findMany({
    where: {
      dataSource: 'gilmar'
    },
    select: {
      id: true,
      url: true,
      address: true,
      title: true,
      notes: true,
      zone: true
    }
  });

  const total = properties.length;
  console.log(`📊 Total de propiedades Gilmar encontradas: ${total}\n`);

  let updatedToGuindalera = 0;
  let alreadyGuindalera = 0;

  for (const property of properties) {
    const urlLower = (property.url || '').toLowerCase();
    const addressLower = (property.address || '').toLowerCase();
    const titleLower = (property.title || '').toLowerCase();
    const notesLower = (property.notes || '').toLowerCase();

    // Buscar "guindalera" en cualquier campo de texto
    const isGuindalera =
      urlLower.includes('guindalera') ||
      addressLower.includes('guindalera') ||
      titleLower.includes('guindalera') ||
      notesLower.includes('guindalera');

    if (isGuindalera) {
      if (property.zone === 'GUINDALERA') {
        console.log(`ℹ️  Ya estaba en GUINDALERA: ${property.url.split('/').pop()}`);
        alreadyGuindalera++;
      } else {
        await prisma.soldProperty.update({
          where: { id: property.id },
          data: { zone: 'GUINDALERA' }
        });

        console.log(`✅ Actualizado a GUINDALERA: ${property.url.split('/').pop()}`);
        console.log(`   URL: ${property.url}`);
        updatedToGuindalera++;
      }
    }
  }

  console.log(`\n✅ Proceso completado!`);
  console.log(`   Ya estaban en GUINDALERA: ${alreadyGuindalera}`);
  console.log(`   Actualizadas a GUINDALERA: ${updatedToGuindalera}`);
  console.log(`   Total GUINDALERA: ${alreadyGuindalera + updatedToGuindalera}`);
  console.log(`   Propiedades OTROS: ${total - alreadyGuindalera - updatedToGuindalera}`);

  await prisma.$disconnect();
}

updateZones().catch(console.error);
