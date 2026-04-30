const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const teacher = await prisma.teacher.findFirst({
    where: { firstName: 'พงศ์นรินทร์' },
    include: {
      divisions: {
        include: { group: true }
      }
    }
  });
  console.log(JSON.stringify(teacher, null, 2));
}

run().finally(() => prisma.$disconnect());
