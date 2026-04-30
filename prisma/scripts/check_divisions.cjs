const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teachers = await prisma.teacher.findMany({
    where: { divisionId: { not: null } },
    include: { division: true }
  });
  console.log(`Teachers with division: ${teachers.length}`);
  teachers.forEach(t => {
    console.log(`- ${t.firstName} ${t.lastName}: ${t.division.divisionName}`);
  });
}

main().finally(() => prisma.$disconnect());
