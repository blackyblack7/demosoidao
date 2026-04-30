const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEducation() {
  const teacher = await prisma.teacher.findFirst({
    where: { firstName: "พงศ์นรินทร์" }
  });

  if (!teacher) {
    console.error("Teacher not found!");
    return;
  }

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: {
      qualification: "ครุศาสตรบัณฑิต",
      major: "คอมพิวเตอร์ศึกษา"
    }
  });

  console.log(`Updated education for ${teacher.firstName} ${teacher.lastName}`);
}

updateEducation().finally(() => prisma.$disconnect());
