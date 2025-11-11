import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.property.count();
  console.log(`Total propiedades: ${count}`);

  if (count > 0) {
    const properties = await prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        price: true,
        m2: true,
        score: true,
        portal: true,
      }
    });

    console.log('\nÚltimas 5:');
    properties.forEach(p => {
      console.log(`- ${p.title.substring(0, 50)} | ${p.price}€ | ${p.m2}m² | Score: ${p.score}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
