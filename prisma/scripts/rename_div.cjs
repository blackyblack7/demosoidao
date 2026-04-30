const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function renameDiv() {
  await prisma.adminDivision.update({
    where: { id: 16 },
    data: { divisionName: "ฝ่ายอาคารสถานที่" }
  });
  console.log("Renamed 'งานอาคารสถานที่' to 'ฝ่ายอาคารสถานที่' successfully.");
}

renameDiv().finally(() => prisma.$disconnect());
