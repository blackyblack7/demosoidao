const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteRedundant() {
  await prisma.adminDivision.delete({
    where: { id: 1 }
  });
  console.log("Deleted 'กลุ่มบริหารงานทั่วไป' division successfully.");
}

deleteRedundant().finally(() => prisma.$disconnect());
