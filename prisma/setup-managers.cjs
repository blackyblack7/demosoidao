const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Setting up Administrative Users ---');

  const managers = [
    {
      username: 'manager1',
      password: 'sdmanager1',
      prefix: 'นาง',
      firstName: 'นฤมล',
      lastName: 'กงกุล',
      position: 'ผู้อำนวยการโรงเรียน',
      email: 'manager1@soidao.ac.th',
      isAdmin: true,
      divisionIds: [] // Director oversees all
    },
    {
      username: 'manager2',
      password: 'sdmanager2',
      prefix: 'นางสาว',
      firstName: 'โสภา',
      lastName: 'พุมมา',
      position: 'รองผู้อำนวยการกลุ่มบริหารงานวิชาการ',
      email: 'manager2@soidao.ac.th',
      isAdmin: true,
      groupIds: [1] // วิชาการ
    },
    {
      username: 'manager3',
      password: 'sdmanager3',
      prefix: 'นาง',
      firstName: 'สุดาวรรณ',
      lastName: 'เที่ยงธรรม',
      position: 'รองผู้อำนวยการกลุ่มบริหารงานทั่วไป',
      email: 'manager3@soidao.ac.th',
      isAdmin: true,
      groupIds: [4] // ทั่วไป
    },
    {
      username: 'manager4',
      password: 'sdmanager4',
      prefix: 'นาง',
      firstName: 'จันทร์เพ็ญ',
      lastName: 'อินทร์อ่อน',
      position: 'รองผู้อำนวยการกลุ่มบริหารงานงบประมาณและสินทรัพย์ และงานบุคคล',
      email: 'manager4@soidao.ac.th',
      isAdmin: true,
      groupIds: [2, 3] // บุคคล, งบประมาณ
    }
  ];

  // Get all divisions for each group to link them
  const allDivisions = await prisma.adminDivision.findMany();

  for (const m of managers) {
    const hashedPassword = await bcrypt.hash(m.password, 10);
    
    // Determine divisions to connect
    let connectDivisions = [];
    if (m.groupIds) {
      connectDivisions = allDivisions
        .filter(div => m.groupIds.includes(div.groupId))
        .map(div => ({ id: div.id }));
    }

    const { groupIds, divisionIds, ...userData } = m;

    const teacher = await prisma.teacher.upsert({
      where: { username: m.username },
      update: {
        password: hashedPassword,
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
