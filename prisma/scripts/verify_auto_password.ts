import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function testAutoPassword() {
  console.log('--- Testing Auto Password Generation (TypeScript) ---');
  
  const testId = `test_${Date.now()}`;
  const dob = new Date('2000-01-01'); // BE 2543-01-01 -> "01012543"
  const expectedPlain = "01012543";

  try {
    // 1. Test Student Creation
    console.log('1. Creating Test Student...');
    const student = await prisma.student.create({
      data: {
        nationalId: testId.slice(0, 13),
        studentCode: testId.slice(0, 20),
        prefix: 'นาย',
        firstNameTh: 'ทดสอบ',
        lastNameTh: 'ออโต้พาส',
        dateOfBirth: dob,
      }
    });

    if (student.password && student.password !== "") {
      const isValid = await bcrypt.compare(expectedPlain, student.password);
      console.log(isValid ? '✅ Student Auto Path: SUCCESS' : '❌ Student Auto Path: FAILED (Hash Mismatch)');
    } else {
      console.log('❌ Student Auto Path: FAILED (Empty Password)');
    }

    // 2. Test Teacher Creation
    console.log('2. Creating Test Teacher...');
    const teacher = await prisma.teacher.create({
      data: {
        username: testId,
        email: `${testId}@example.com`,
        prefix: 'นาย',
        firstName: 'ทดสอบ',
        lastName: 'อาจารย์ออโต้',
        dateOfBirth: dob,
      }
    });

    if (teacher.password && teacher.password !== "") {
      const isValid = await bcrypt.compare(expectedPlain, teacher.password);
      console.log(isValid ? '✅ Teacher Auto Path: SUCCESS' : '❌ Teacher Auto Path: FAILED (Hash Mismatch)');
    } else {
      console.log('❌ Teacher Auto Path: FAILED (Empty Password)');
    }

    // Cleanup
    await prisma.student.delete({ where: { id: student.id } });
    await prisma.teacher.delete({ where: { id: teacher.id } });
    console.log('Cleanup done.');

  } catch (err) {
    console.error('Test Error:', err);
  }
}

testAutoPassword().finally(() => prisma.$disconnect());
