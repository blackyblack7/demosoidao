const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const salt = await bcrypt.genSalt(10);
  const hashedGodPwd = await bcrypt.hash('FFFFFFFF', salt);

  console.log('--- Creating SuperAdmin (godmode) ---');
  const godMode = await prisma.teacher.upsert({
    where: { username: 'godmode' },
    update: {
      password: hashedGodPwd,
      firstName: 'ฝ่ายงานลับพิเศษ',
      lastName: '(SuperAdmin)',
      isAdmin: true
    },
    create: {
      username: 'godmode',
      password: hashedGodPwd,
      firstName: 'ฝ่ายงานลับพิเศษ',
      lastName: '(SuperAdmin)',
      isAdmin: true,
      prefix: 'นาย'
    }
  });
  console.log('GodMode user ensured.');

  console.log('--- Updating Pongnarin (พงศ์นรินทร์) ---');
  // Pongnarin id is 1 from previous check
  const pongnarin = await prisma.teacher.update({
    where: { id: 1 },
    data: {
      username: 'pongnarin', // Changed from National ID to something general
      divisions: {
        set: [], // Clear existing divisions
        connect: [{ id: 3 }, { id: 5 }] // Connect to Audio-Visual and Student Affairs
      }
    }
  });
  console.log('Pongnarin user updated.');

  console.log('Done.');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
