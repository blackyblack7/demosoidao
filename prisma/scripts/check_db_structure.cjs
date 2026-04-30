const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.adminGroup.findMany({ include: { divisions: true } });
  console.log('--- Groups and Divisions ---');
  console.log(JSON.stringify(groups, null, 2));

  const depts = await prisma.academicDepartment.findMany();
  console.log('--- Academic Departments ---');
  console.log(JSON.stringify(depts, null, 2));
}

main().finally(() => prisma.$disconnect());
