const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDepts() {
  const depts = [
    "ภาษาไทย",
    "คณิตศาสตร์",
    "วิทยาศาสตร์และเทคโนโลยี",
    "สังคมศึกษา ศาสนา และวัฒนธรรม",
    "ภาษาต่างประเทศ",
    "ศิลปะ",
    "การงานอาชีพ",
    "สุขศึกษาและพลศึกษา"
  ];

  console.log('--- Seeding Academic Departments ---');
  for (const name of depts) {
    await prisma.academicDepartment.upsert({
      where: { id: -1, departmentName: name }, // Tricky without unique name, I'll use findFirst
      update: {},
      create: { departmentName: name },
      where: { id: 0 } 
    });
  }
}

// Safer seeding logic
async function safeSeed() {
  const depts = [
    "ภาษาไทย",
    "คณิตศาสตร์",
    "วิทยาศาสตร์และเทคโนโลยี",
    "สังคมศึกษา ศาสนา และวัฒนธรรม",
    "ภาษาต่างประเทศ",
    "ศิลปะ",
    "การงานอาชีพ",
    "สุขศึกษาและพลศึกษา"
  ];

  for (const name of depts) {
    const existing = await prisma.academicDepartment.findFirst({
      where: { departmentName: name }
    });
    if (!existing) {
      await prisma.academicDepartment.create({
        data: { departmentName: name }
      });
      console.log(`Created: ${name}`);
    } else {
      console.log(`Exists: ${name}`);
    }
  }
}

safeSeed().finally(() => prisma.$disconnect());
