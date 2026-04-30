const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const groups = await p.adminGroup.findMany({ include: { divisions: true } });
  for (const g of groups) {
    console.log(`\n[${g.id}] ${g.groupName} (key: ${g.groupKey})`);
    for (const d of g.divisions) {
      console.log(`  - [${d.id}] ${d.divisionName}`);
    }
  }
}

main().finally(() => p.$disconnect());
