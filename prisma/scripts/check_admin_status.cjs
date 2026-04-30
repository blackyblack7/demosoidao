const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
  const teacher = await prisma.teacher.findFirst({
    where: { firstName: "พงศ์นรินทร์" }
  });
  console.log('Teacher info:', JSON.stringify({
    id: teacher.id,
    firstName: teacher.firstName,
    isAdmin: teacher.isAdmin
  }, null, 2));
}

checkStatus().finally(() => prisma.$disconnect());
