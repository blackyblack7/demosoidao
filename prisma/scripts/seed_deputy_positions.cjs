/**
 * Seed Deputy Director (รองผู้อำนวยการ) positions for all admin groups
 * This ensures complete coverage of administrative positions.
 * 
 * Positions added:
 *   - รองผู้อำนวยการกลุ่มบริหารงานวิชาการ
 *   - รองผู้อำนวยการกลุ่มบริหารงานบุคคล
 *   - รองผู้อำนวยการกลุ่มบริหารงานงบประมาณและทรัพย์สิน
 *   - รองผู้อำนวยการกลุ่มบริหารงานทั่วไป
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Deputy Director Positions ---');

  const deputyPositions = [
    { name: 'รองผู้อำนวยการกลุ่มบริหารงานวิชาการ', level: 8 },
    { name: 'รองผู้อำนวยการกลุ่มบริหารงานบุคคล', level: 8 },
    { name: 'รองผู้อำนวยการกลุ่มบริหารงานงบประมาณและทรัพย์สิน', level: 8 },
    { name: 'รองผู้อำนวยการกลุ่มบริหารงานทั่วไป', level: 8 },
  ];

  for (const pos of deputyPositions) {
    const result = await prisma.teacherPosition.upsert({
      where: { name: pos.name },
      update: { level: pos.level },
      create: { name: pos.name, level: pos.level },
    });
    console.log(`  ✓ ${result.name} (ID: ${result.id})`);
  }

  // Also ensure the base positions exist
  const basePositions = [
    { name: 'ผู้อำนวยการโรงเรียน', level: 10 },
    { name: 'รองผู้อำนวยการโรงเรียน', level: 8 },
    { name: 'ครู', level: 5 },
    { name: 'ครูผู้ช่วย', level: 4 },
    { name: 'ครูอัตราจ้าง', level: 3 },
    { name: 'พนักงานราชการ', level: 3 },
    { name: 'ลูกจ้างประจำ', level: 2 },
    { name: 'ลูกจ้างชั่วคราว', level: 1 },
    { name: 'เจ้าหน้าที่', level: 2 },
  ];

  for (const pos of basePositions) {
    const result = await prisma.teacherPosition.upsert({
      where: { name: pos.name },
      update: { level: pos.level },
      create: { name: pos.name, level: pos.level },
    });
    console.log(`  ✓ ${result.name} (ID: ${result.id})`);
  }

  console.log('\n--- Done! ---');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
