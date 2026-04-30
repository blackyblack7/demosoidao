const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const userId = 1; // พงศ์นรินทร์
  const targetGroupName = "กลุ่มบริหารงานบุคคล";

  const teacher = await prisma.teacher.findUnique({
    where: { id: userId },
    include: {
      divisions: {
        include: { group: true }
      }
    }
  });

  console.log('Teacher Admin Status:', teacher.isAdmin);
  console.log('Divisions:', teacher.divisions.map(d => d.group?.groupName));
  const hasAccessByAdmin = teacher?.isAdmin === true;
  const hasAccessByDiv = teacher?.divisions.some(div => div.group?.groupName === targetGroupName);
  
  console.log('Has Access by Admin:', hasAccessByAdmin);
  console.log('Has Access by Div:', hasAccessByDiv);
  console.log('Total Has Access:', hasAccessByAdmin || hasAccessByDiv);
}

run().finally(() => prisma.$disconnect());
