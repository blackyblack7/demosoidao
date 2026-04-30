require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...')

  // 1. Create Academic Department
  const deptSci = await prisma.academicDepartment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      departmentName: 'กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี',
    },
  });

  // 2. Create Admin Division
  const adminDiv = await prisma.adminDivision.upsert({
    where: { id: 1 },
    update: {},
    create: {
      divisionName: 'กลุ่มบริหารงานทั่วไป',
    },
  });

  // 3. Hash Password (วดป เกิด: 04122541)
  const hashedPassword = await bcrypt.hash('04122541', 10);

  // 4. Create Teacher
  const teacher = await prisma.teacher.upsert({
    where: { username: '1499900292337' },
    update: {},
    create: {
      nationalId: '1499900292337',
      username: '1499900292337',
      password: hashedPassword,
      dateOfBirth: new Date('1998-12-04'),
      prefix: 'นาย',
      firstName: 'พงศ์นรินทร์',
      lastName: 'ปากหวาน',
      email: 'fgovernor7@gmail.com',
      departmentId: deptSci.id,
      divisionId: adminDiv.id,
      extraDuties: {
        create: [
          { roleTitle: 'ฝ่ายโสตทัศนศึกษา', academicYear: 2567 },
          { roleTitle: 'ฝ่ายกิจการนักเรียน', academicYear: 2567 },
        ],
      },
    },
  });

  console.log('✅ Seeded Teacher:', teacher.firstName, teacher.lastName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
