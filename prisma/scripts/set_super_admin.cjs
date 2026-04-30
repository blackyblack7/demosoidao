const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setSuperAdmin() {
  const teacher = await prisma.teacher.findFirst({
    where: { firstName: "พงศ์นรินทร์" }
  });

  if (!teacher) {
    console.error("Teacher not found!");
    return;
  }

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { isAdmin: true }
  });

  console.log(`Set ${teacher.firstName} ${teacher.lastName} as Super Admin.`);
}

setSuperAdmin().finally(() => prisma.$disconnect());
