const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDivisions() {
  const teacherName = "พงศ์นรินทร์";
  const newDivisions = ["ฝ่ายโสตทัศนศึกษา", "ฝ่ายกิจการนักเรียน"];

  const teacher = await prisma.teacher.findFirst({
    where: { firstName: teacherName }
  });

  if (!teacher) {
    console.error("Teacher not found!");
    return;
  }

  console.log(`Found teacher: ${teacher.firstName} ${teacher.lastName} (ID: ${teacher.id})`);

  for (const divName of newDivisions) {
    const division = await prisma.adminDivision.upsert({
      where: { id: -1, divisionName: divName }, // Since id is autoincrement, we use a non-existent id to force match by data if possible, but actually we should use findFirst or unique field.
      // AdminDivision doesn't have a unique constraint on divisionName in the schema I saw? Let's check.
      update: {},
      create: { divisionName: divName },
      where: { id: 0 } // This is a bit tricky with upsert for non-unique fields.
    });
    // Wait, let's just find or create manually.
  }
}

// Rewriting more safely
async function safeAdd() {
  const teacher = await prisma.teacher.findFirst({ where: { firstName: "พงศ์นรินทร์" } });
  if (!teacher) return;

  const divNames = ["ฝ่ายโสตทัศนศึกษา", "ฝ่ายกิจการนักเรียน"];
  
  for (const name of divNames) {
    let div = await prisma.adminDivision.findFirst({ where: { divisionName: name } });
    if (!div) {
      div = await prisma.adminDivision.create({ data: { divisionName: name } });
      console.log(`Created division: ${name}`);
    }

    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        divisions: {
          connect: { id: div.id }
        }
      }
    });
    console.log(`Connected ${teacher.firstName} to ${name}`);
  }
}

safeAdd().finally(() => prisma.$disconnect());
