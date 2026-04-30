const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function standardizeTerminology() {
  const divisions = await prisma.adminDivision.findMany();
  
  for (const div of divisions) {
    if (div.divisionName.startsWith("ฝ่าย")) {
      const newName = div.divisionName.replace("ฝ่าย", "งาน");
      await prisma.adminDivision.update({
        where: { id: div.id },
        data: { divisionName: newName }
      });
      console.log(`Renamed: ${div.divisionName} -> ${newName}`);
    }
  }
}

standardizeTerminology().finally(() => prisma.$disconnect());
