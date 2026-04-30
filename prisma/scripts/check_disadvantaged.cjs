const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const studentCount = await prisma.student.count();
  const disadvantaged = await prisma.student.findMany({
    where: {
      AND: [
        { disadvantagedType: { not: null } },
        { disadvantagedType: { not: "" } },
        { disadvantagedType: { not: "-" } }
      ]
    },
    take: 5
  });

  console.log(`Total Students: ${studentCount}`);
  console.log('Students with disadvantagedType:', JSON.stringify(disadvantaged, null, 2));
}

main().finally(() => prisma.$disconnect());
