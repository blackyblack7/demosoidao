const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncDivisions() {
  const generalGroupName = 'กลุ่มบริหารงานทั่วไป';
  
  // Find the group
  const group = await prisma.adminGroup.findUnique({
    where: { groupName: generalGroupName }
  });

  if (!group) {
    console.error(`Group not found: ${generalGroupName}`);
    process.exit(1);
  }

  const divisions = [
    'งานโสตทัศนศึกษา',
    'งานอาคารสถานที่',
    'งานกิจการนักเรียน'
  ];

  console.log(`Syncing divisions for ${generalGroupName}...`);

  for (const divName of divisions) {
    await prisma.adminDivision.upsert({
      where: { divisionName: divName }, // Assumes divisionName is unique or we handle it
      update: { groupId: group.id },
      create: { 
        divisionName: divName,
        groupId: group.id
      }
    });
    console.log(`Ensured: ${divName}`);
  }

  console.log('Done.');
  process.exit(0);
}

// Note: If divisionName is not unique in schema, we might need a different approach.
// Let's check schema again. 
// model AdminDivision {
//   id           Int         @id @default(autoincrement())
//   divisionName String      @db.VarChar(100)
//   ...
// }
// It doesn't have @unique. I'll use findFirst/create instead to be safe if not unique.

async function safeSync() {
    const generalGroupName = 'กลุ่มบริหารงานทั่วไป';
    const group = await prisma.adminGroup.findUnique({ where: { groupName: generalGroupName } });
    if (!group) return;

    const divisions = ['งานโสตทัศนศึกษา', 'งานอาคารสถานที่', 'งานกิจการนักเรียน'];
    for (const name of divisions) {
        const existing = await prisma.adminDivision.findFirst({ where: { divisionName: name } });
        if (existing) {
            await prisma.adminDivision.update({
                where: { id: existing.id },
                data: { groupId: group.id }
            });
        } else {
            await prisma.adminDivision.create({
                data: { divisionName: name, groupId: group.id }
            });
        }
        console.log(`Synced: ${name}`);
    }
}

safeSync().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
