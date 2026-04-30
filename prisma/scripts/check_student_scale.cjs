const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkScale() {
  const count = await prisma.student.count();
  const sample = await prisma.student.findFirst({
    include: { termData: true }
  });
  console.log('Scale:', {
    count,
    sample: sample ? { id: sample.id, termDataCount: sample.termData.length } : 'no data'
  });
}

checkScale().finally(() => prisma.$disconnect());
