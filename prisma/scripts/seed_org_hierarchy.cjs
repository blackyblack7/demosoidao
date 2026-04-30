const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAndMigrate() {
  console.log('--- Seeding Groups ---');
  const groups = [
    "กลุ่มบริหารงานวิชาการ",
    "กลุ่มบริหารงานบุคคล",
    "กลุ่มบริหารงานงบประมาณและทรัพย์สิน",
    "กลุ่มบริหารงานทั่วไป"
  ];

  for (const groupName of groups) {
    await prisma.adminGroup.upsert({
      where: { groupName },
      update: {},
      create: { groupName }
    });
    console.log(`Group: ${groupName} ensured.`);
  }

  const generalGroup = await prisma.adminGroup.findFirst({
    where: { groupName: "กลุ่มบริหารงานทั่วไป" }
  });

  if (generalGroup) {
    console.log('--- Migrating Divisions ---');
    // Link existing divisions to generalGroup
    // IDs are 1, 2, 3 based on my previous check
    await prisma.adminDivision.updateMany({
      where: { id: { in: [1, 2, 3] } },
      data: { groupId: generalGroup.id }
    });
    console.log('Divisions 1, 2, 3 linked to "กลุ่มบริหารงานทั่วไป" group.');
    
    // Rename Division 1 to avoid confusion if needed, but the user might want to keep it.
    // Let's just keep it as is for now.
  }

  console.log('✅ Seeding and Migration complete!');
}

seedAndMigrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
