const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Teacher Metadata Migration ---');

  // 1. Get all unique values from current Teacher table
  const teachers = await prisma.teacher.findMany({
    select: {
      id: true,
      prefix: true,
      position: true,
      academicStanding: true,
      personnelCategory: true
    }
  });

  const uniquePrefixes = [...new Set(teachers.map(t => t.prefix).filter(Boolean))];
  const uniquePositions = [...new Set(teachers.map(t => t.position).filter(Boolean))];
  const uniqueStandings = [...new Set(teachers.map(t => t.academicStanding).filter(Boolean))];
  const uniqueCategories = [...new Set(teachers.map(t => t.personnelCategory).filter(Boolean))];

  // Ensure some defaults exist
  const defaultPrefixes = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ว่าที่ร้อยตรี'];
  const defaultPositions = ['ผู้อำนวยการโรงเรียน', 'รองผู้อำนวยการโรงเรียน', 'ครู', 'ครูอัตราจ้าง', 'พนักงานราชการ'];
  const defaultStandings = ['- (ไม่มี)', 'ชำนาญการ', 'ชำนาญการพิเศษ', 'เชี่ยวชาญ', 'เชี่ยวชาญพิเศษ'];
  const defaultCategories = ['ข้าราชการครู', 'พนักงานราชการ', 'ลูกจ้างประจำ', 'ลูกจ้างชั่วคราว'];

  const allPrefixes = [...new Set([...defaultPrefixes, ...uniquePrefixes])];
  const allPositions = [...new Set([...defaultPositions, ...uniquePositions])];
  const allStandings = [...new Set([...defaultStandings, ...uniqueStandings])];
  const allCategories = [...new Set([...defaultCategories, ...uniqueCategories])];

  console.log(`Processing: ${allPrefixes.length} Prefixes, ${allPositions.length} Positions, ${allStandings.length} Standings, ${allCategories.length} Categories`);

  // 2. Populate Lookup Tables
  console.log('Populating Prefix table...');
  for (const name of allPrefixes) {
    await prisma.prefix.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log('Populating TeacherPosition table...');
  for (const name of allPositions) {
    let level = 0;
    if (name.includes('ผู้อำนวยการโรงเรียน')) level = 10;
    else if (name.includes('รองผู้อำนวยการ')) level = 8;
    else if (name.includes('ครู')) level = 5;

    await prisma.teacherPosition.upsert({ where: { name }, update: { level }, create: { name, level } });
  }

  console.log('Populating AcademicStanding table...');
  for (const name of allStandings) {
    await prisma.academicStanding.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log('Populating PersonnelCategory table...');
  for (const name of allCategories) {
    await prisma.personnelCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  // 3. Map Teachers to IDs
  console.log('Mapping teachers to new IDs...');
  const prefixes = await prisma.prefix.findMany();
  const positions = await prisma.teacherPosition.findMany();
  const standings = await prisma.academicStanding.findMany();
  const categories = await prisma.personnelCategory.findMany();

  const prefixMap = Object.fromEntries(prefixes.map(p => [p.name, p.id]));
  const posMap = Object.fromEntries(positions.map(p => [p.name, p.id]));
  const standMap = Object.fromEntries(standings.map(s => [s.name, s.id]));
  const catMap = Object.fromEntries(categories.map(c => [c.name, c.id]));

  let updatedCount = 0;
  for (const teacher of teachers) {
    const updateData = {};
    if (teacher.prefix && prefixMap[teacher.prefix]) updateData.prefixId = prefixMap[teacher.prefix];
    if (teacher.position && posMap[teacher.position]) updateData.positionId = posMap[teacher.position];
    if (teacher.academicStanding && standMap[teacher.academicStanding]) updateData.academicStandingId = standMap[teacher.academicStanding];
    if (teacher.personnelCategory && catMap[teacher.personnelCategory]) updateData.personnelCategoryId = catMap[teacher.personnelCategory];

    if (Object.keys(updateData).length > 0) {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: updateData
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} teachers.`);
  console.log('--- Migration Complete ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
