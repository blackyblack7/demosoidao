const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndSeed() {
  const years = await prisma.academicYear.findMany();
  if (years.length === 0) {
    await prisma.academicYear.create({
      data: {
        semester: 1,
        year: 2568,
        isActive: true
      }
    });
    console.log("Created active academic year: 1/2568");
  } else {
    console.log("Existing academic years:", JSON.stringify(years, null, 2));
  }
}

checkAndSeed().finally(() => prisma.$disconnect());
