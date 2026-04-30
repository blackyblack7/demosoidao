const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const years = await prisma.academicYear.findMany({
    orderBy: { id: 'desc' }
  });
  console.log(JSON.stringify(years, null, 2));
}

run().finally(() => prisma.$disconnect());
