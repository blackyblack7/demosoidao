import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Database...')

  // Clean existing specific data if needed (optional)
  // await prisma.teacherExtraDuty.deleteMany()
  // await prisma.teacher.deleteMany()
  // await prisma.academicDepartment.deleteMany()
  // await prisma.adminDivision.deleteMany()

  // 1. Create Admin Groups with Standardized Keys
  const groupPersonnel = await prisma.adminGroup.upsert({
    where: { groupKey: 'PERSONNEL' },
    update: {},
    create: { groupName: 'กลุ่มบริหารงานบุคคล', groupKey: 'PERSONNEL' }
  });

  const groupAcademic = await prisma.adminGroup.upsert({
    where: { groupKey: 'ACADEMIC' },
    update: {},
    create: { groupName: 'กลุ่มบริหารงานวิชาการ', groupKey: 'ACADEMIC' }
  });

  const groupGeneral = await prisma.adminGroup.upsert({
    where: { groupKey: 'GENERAL' },
    update: {},
    create: { groupName: 'กลุ่มบริหารงานทั่วไป', groupKey: 'GENERAL' }
  });

  const groupBudget = await prisma.adminGroup.upsert({
    where: { groupKey: 'BUDGET' },
    update: {},
    create: { groupName: 'กลุ่มบริหารงานงบประมาณและทรัพย์สิน', groupKey: 'BUDGET' }
  });

  // 2. Create Academic Department
  const deptSci = await prisma.academicDepartment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      departmentName: 'กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี',
    },
  })

  // 3. Create initial division within groups
  const adminDiv = await prisma.adminDivision.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      divisionName: 'ฝ่ายโสตทัศนศึกษา',
      groupId: groupGeneral.id
    },
  })

  // Resolve Prefix and Category IDs
  const prefixMr = await prisma.prefix.upsert({
    where: { name: 'นาย' },
    update: {},
    create: { name: 'นาย' }
  });
  const catTeacher = await prisma.personnelCategory.upsert({
    where: { name: 'ครู' },
    update: {},
    create: { name: 'ครู' }
  });

  // 3. Hash Password (วดป เกิด: 04122541)
  const hashedPassword = await bcrypt.hash('04122541', 10)

  // 4. Create Teacher
  const teacher = await prisma.teacher.create({
    data: {
      nationalId: '1499900292337',
      username: '1499900292337',
      password: hashedPassword,
      dateOfBirth: new Date('1998-12-04'), // 04-12-2541 (2541 - 543 = 1998)
      prefixId: prefixMr.id,
      firstName: 'พงศ์นรินทร์',
      lastName: 'ปากหวาน',
      email: 'fgovernor7@gmail.com',
      isAdmin: true, 
      personnelCategoryId: catTeacher.id,
      departmentId: deptSci.id,
      divisions: { connect: [{ id: adminDiv.id }] },
      extraDuties: {
        create: [
          {
            roleTitle: 'ฝ่ายโสตทัศนศึกษา',
            academicYear: 2567, // ปีปัจจุบันที่เข้าถึง
          },
          {
            roleTitle: 'ฝ่ายกิจการนักเรียน',
            academicYear: 2567,
          },
        ],
      },
    },
  })

  console.log('Seeded Teacher:', teacher.firstName, teacher.lastName)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
