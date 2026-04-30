const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncGroups() {
  const groups = [
    { key: 'ACADEMIC',  name: 'กลุ่มบริหารงานวิชาการ' },
    { key: 'PERSONNEL', name: 'กลุ่มบริหารงานบุคคล' },
    { key: 'BUDGET',    name: 'กลุ่มบริหารงานงบประมาณและทรัพย์สิน' },
    { key: 'GENERAL',   'name': 'กลุ่มบริหารงานทั่วไป' },
  ];

  console.log('Syncing Admin Groups...');

  for (const group of groups) {
    // We try to find by a partial match or old name if we know it, 
    // but the safest is to upsert if we use 'name' as unique or just update the one that looks like it.
    // In our schema, groupKey is likely the unique identifier if it exists.
    
    // Let's check what the unique field is. 
    // Usually it's id, but groupKey might be unique too.
    
    const existing = await prisma.adminGroup.findFirst({
        where: {
            OR: [
                { groupKey: group.name }, // Old name was the key
                { groupKey: group.name.replace('และทรัพย์สิน', '') }, // Try without suffix
                { groupKey: group.name.replace('งาน', '') } // Try without 'งาน'
            ]
        }
    });

    if (existing) {
        await prisma.adminGroup.update({
            where: { id: existing.id },
            data: { 
                groupKey: group.name,
                groupName: group.name
            }
        });
        console.log(`Updated: ${existing.groupKey} -> ${group.name}`);
    } else {
        await prisma.adminGroup.upsert({
            where: { groupName: group.name },
            update: { groupKey: group.name },
            create: { 
                groupKey: group.name,
                groupName: group.name
            }
        });
        console.log(`Ensured: ${group.name}`);
    }
  }

  console.log('Done.');
  process.exit(0);
}

syncGroups().catch(e => {
  console.error(e);
  process.exit(1);
});
