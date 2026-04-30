const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateDivisions() {
  console.log('--- Migrating Teacher Divisions ---');
  
  const teachers = await prisma.teacher.findMany({
    where: { divisionId: { not: null } }
  });

  console.log(`Found ${teachers.length} teachers to migrate.`);

  for (const teacher of teachers) {
    console.log(`Migrating ${teacher.firstName} ${teacher.lastName}...`);
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        divisions: {
          connect: { id: teacher.divisionId }
        }
      }
    });
  }

  console.log('✅ Migration complete!');
}

migrateDivisions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
