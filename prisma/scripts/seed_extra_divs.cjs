const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMoreDivs() {
  const groups = await prisma.adminGroup.findMany();
  const groupMap = groups.reduce((acc, g) => {
    acc[g.groupName] = g.id;
    return acc;
  }, {});

  const data = [
    { name: "งานทะเบียน", group: "กลุ่มบริหารงานวิชาการ" },
    { name: "งานวัดผล", group: "กลุ่มบริหารงานวิชาการ" },
    { name: "งานแนะแนว", group: "กลุ่มบริหารงานวิชาการ" },
    { name: "งานห้องสมุด", group: "กลุ่มบริหารงานวิชาการ" },
    { name: "งานหลักสูตร", group: "กลุ่มบริหารงานวิชาการ" },
    
    { name: "งานวางแผนอัตรากำลัง", group: "กลุ่มบริหารงานบุคคล" },
    { name: "งานวินัยรักษาความสงบ", group: "กลุ่มบริหารงานบุคคล" },
    { name: "งานส่งเสริมสวัสดิการ", group: "กลุ่มบริหารงานบุคคล" },
    
    { name: "งานการเงินและบัญชี", group: "กลุ่มบริหารงานงบประมาณและทรัพย์สิน" },
    { name: "งานพัสดุ", group: "กลุ่มบริหารงานงบประมาณและทรัพย์สิน" },
    { name: "งานแผนงานและสารสนเทศ", group: "กลุ่มบริหารงานงบประมาณและทรัพย์สิน" },
    
    { name: "งานประชาสัมพันธ์", group: "กลุ่มบริหารงานทั่วไป" },
    { name: "งานอาคารสถานที่", group: "กลุ่มบริหารงานทั่วไป" },
    { name: "งานอนามัยโรงเรียน", group: "กลุ่มบริหารงานทั่วไป" },
  ];

  for (const item of data) {
    const groupId = groupMap[item.group];
    if (groupId) {
      await prisma.adminDivision.upsert({
        where: { id: 0 }, // Placeholder for dummy where
        create: {
          divisionName: item.name,
          groupId: groupId
        },
        update: {},
        // Using check to avoid duplicates by name
      });
      console.log(`Checking/Adding: ${item.name} -> ${item.group}`);
      
      // Real check since id:0 upsert is weird for non-existent record
      const exist = await prisma.adminDivision.findFirst({
        where: { divisionName: item.name, groupId: groupId }
      });
      if (!exist) {
        await prisma.adminDivision.create({
          data: {
            divisionName: item.name,
            groupId: groupId
          }
        });
      }
    }
  }
}

seedMoreDivs().finally(() => prisma.$disconnect());
