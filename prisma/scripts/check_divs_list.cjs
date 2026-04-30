const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listDivs() {
  const divs = await prisma.adminDivision.findMany({
    include: { group: true },
    orderBy: { groupId: 'asc' }
  });
  console.log(JSON.stringify(divs, null, 2));
}

listDivs().finally(() => prisma.$disconnect());
