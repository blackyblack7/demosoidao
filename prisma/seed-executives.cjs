const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Setting up Executive Users ---');

  const managers = [
    {
      username: 'manager0',
      password: '12345678',
      prefix: 'นาง',
      firstName: 'นฤมล',
      lastName: 'กุงกุล',
      position: 'ผู้อำนวยการโรงเรียน',
      isAdmin: true,
      groupIds: [1, 2, 3, 4] // Director sees all
    },
    {
      username: 'manager1',
      password: '12345678',
      prefix: 'นาง',
      firstName: 'สุดาวรรณ',
      lastName: 'เที่ยงธรรม',
      position: 'รองผู้อำนวยการโรงเรียนกลุ่มบริหารงานทั่วไป',
      isAdmin: true,
      groupIds: [4] // ทั่วไป
    },
    {
      username: 'manager2',
      password: '12345678',
      prefix: 'นาง',
      firstName: 'จันทร์เพ็ญ',
      lastName: 'อินทร์อ่อน',
      position: 'รองผู้อำนวยการโรงเรียนกลุ่มบริหารงานบุคคล',
      isAdmin: true,
      groupIds: [2] // บุคคล
    },
    {
      username: 'manager3',
      password: '12345678',
      prefix: 'นางสาว',
      firstName: 'โสภา',
      lastName: 'พุมมา',
      position: 'รองผู้อำนวยการโรงเรียนกลุ่มบริหารงานวิชาการ',
      isAdmin: true,
      groupIds: [1] // วิชาการ
    }
  ];

  // Get all divisions to link them based on groups
  const allDivisions = await prisma.adminDivision.findMany();

  for (const m of managers) {
    const hashedPassword = await bcrypt.hash(m.password, 10);
    
    // Determine divisions to connect based on groupIds
    const connectDivisions = allDivisions
      .filter(div => m.groupIds.includes(div.groupId))
      .map(div => ({ id: div.id }));

    const { groupIds, ...userData } = m;

    const teacher = await prisma.teacher.upsert({
      where: { username: m.username },
      update: {
        password: hashedPassword,
        prefix: m.prefix,
        firstName: m.firstName,
        lastName: m.lastName,
        position: m.position,
        isAdmin: true,
        divisions: {
          set: connectDivisions
        }
      },
      create: {
        ...userData,
        password: hashedPassword,
        divisions: {
          connect: connectDivisions
        }
      }
    });

    console.log(`✅ Set up: ${teacher.prefix}${teacher.firstName} ${teacher.lastName} (${teacher.username})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
