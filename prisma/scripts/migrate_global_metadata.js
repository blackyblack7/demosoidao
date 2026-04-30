const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Global Metadata Migration (Phase 2) ---');

  // 1. Populate Genders
  console.log('Populating Gender table...');
  const genderNames = ['ชาย', 'หญิง'];
  for (const name of genderNames) {
    await prisma.gender.upsert({ where: { name }, update: {}, create: { name } });
  }
  const genders = await prisma.gender.findMany();
  const genderMap = Object.fromEntries(genders.map(g => [g.name, g.id]));

  // 2. Populate Student Statuses
  console.log('Populating StudentStatus table...');
  const termData = await prisma.studentTermData.findMany({ select: { status: true } });
  const uniqueStatuses = [...new Set(termData.map(td => td.status).filter(Boolean))];
  const defaultStatuses = ['กำลังศึกษา', 'สำเร็จการศึกษา', 'พ้นสภาพ', 'พักการเรียน', 'จำหน่ายออก'];
  const allStatuses = [...new Set([...defaultStatuses, ...uniqueStatuses])];
  for (const name of allStatuses) {
    await prisma.studentStatus.upsert({ where: { name }, update: {}, create: { name } });
  }
  const statuses = await prisma.studentStatus.findMany();
  const statusMap = Object.fromEntries(statuses.map(s => [s.name, s.id]));

  // 3. Populate Teacher Leave Types
  console.log('Populating TeacherLeaveType table...');
  const tLeaves = await prisma.teacherLeave.findMany({ select: { leaveType: true } });
  const uniqueTLeaveTypes = [...new Set(tLeaves.map(l => l.leaveType).filter(Boolean))];
  const defaultTLeaveTypes = ['ลาป่วย', 'ลากิจ', 'ลาพักผ่อน', 'ลาคลอด', 'ลาอุปสมบท'];
  const allTLeaveTypes = [...new Set([...defaultTLeaveTypes, ...uniqueTLeaveTypes])];
  for (const name of allTLeaveTypes) {
    await prisma.teacherLeaveType.upsert({ where: { name }, update: {}, create: { name } });
  }
  const tLeaveTypes = await prisma.teacherLeaveType.findMany();
  const tLeaveMap = Object.fromEntries(tLeaveTypes.map(t => [t.name, t.id]));

  // 4. Populate Student Leave Types
  console.log('Populating StudentLeaveType table...');
  const sLeaves = await prisma.leaveRequest.findMany({ select: { type: true } });
  const uniqueSLeaveTypes = [...new Set(sLeaves.map(l => l.type).filter(Boolean))];
  const defaultSLeaveTypes = ['ลาป่วย', 'ลากิจ', 'ลาไปต่างประเทศ', 'ลาพักการเรียน'];
  const allSLeaveTypes = [...new Set([...defaultSLeaveTypes, ...uniqueSLeaveTypes])];
  for (const name of allSLeaveTypes) {
    await prisma.studentLeaveType.upsert({ where: { name }, update: {}, create: { name } });
  }
  const sLeaveTypes = await prisma.studentLeaveType.findMany();
  const sLeaveMap = Object.fromEntries(sLeaveTypes.map(s => [s.name, s.id]));

  // 5. Populate News Categories
  console.log('Populating NewsCategory table...');
  const posts = await prisma.blogPost.findMany({ select: { category: true } });
  const uniqueCats = [...new Set(posts.map(p => p.category).filter(Boolean))];
  const defaultCats = ['ข่าวประชาสัมพันธ์', 'ข่าววิชาการ', 'ข่าวรับสมัครนักเรียน', 'ข่าวกิจกรรม'];
  const allCats = [...new Set([...defaultCats, ...uniqueCats])];
  for (const name of allCats) {
    await prisma.newsCategory.upsert({ where: { name }, update: {}, create: { name } });
  }
  const newsCats = await prisma.newsCategory.findMany();
  const newsCatMap = Object.fromEntries(newsCats.map(c => [c.name, c.id]));

  // --- Mapping Data ---

  // Teachers (Gender)
  console.log('Mapping Teachers (Gender)...');
  // Since we don't have gender on teachers yet, we might skip or use prefix to infer?
  // Let's skip for now unless we add gender to Teacher creation form.

  // Students (Gender, Prefix)
  console.log('Mapping Students...');
  const students = await prisma.student.findMany();
  const prefixes = await prisma.prefix.findMany();
  const prefixMap = Object.fromEntries(prefixes.map(p => [p.name, p.id]));

  for (const student of students) {
    const updateData = {};
    if (student.prefix && prefixMap[student.prefix]) updateData.prefixId = prefixMap[student.prefix];
    if (student.gender && genderMap[student.gender]) updateData.genderId = genderMap[student.gender];
    
    if (Object.keys(updateData).length > 0) {
      await prisma.student.update({ where: { id: student.id }, data: updateData });
    }
  }

  // StudentTermData (Status)
  console.log('Mapping Student Statuses...');
  const termDataRecords = await prisma.studentTermData.findMany();
  for (const record of termDataRecords) {
    if (record.status && statusMap[record.status]) {
      await prisma.studentTermData.update({ where: { id: record.id }, data: { statusId: statusMap[record.status] } });
    }
  }

  // TeacherLeave (Type)
  console.log('Mapping Teacher Leaves...');
  const teacherLeaveRecords = await prisma.teacherLeave.findMany();
  for (const record of teacherLeaveRecords) {
    if (record.leaveType && tLeaveMap[record.leaveType]) {
      await prisma.teacherLeave.update({ where: { id: record.id }, data: { leaveTypeId: tLeaveMap[record.leaveType] } });
    }
  }

  // LeaveRequest (Student Type)
  console.log('Mapping Student Leaves...');
  const studentLeaveRecords = await prisma.leaveRequest.findMany();
  for (const record of studentLeaveRecords) {
    if (record.type && sLeaveMap[record.type]) {
      await prisma.leaveRequest.update({ where: { id: record.id }, data: { leaveTypeId: sLeaveMap[record.type] } });
    }
  }

  // BlogPosts (Category)
  console.log('Mapping Blog Categories...');
  const blogRecords = await prisma.blogPost.findMany();
  for (const record of blogRecords) {
    if (record.category && newsCatMap[record.category]) {
      await prisma.blogPost.update({ where: { id: record.id }, data: { categoryId: newsCatMap[record.category] } });
    }
  }

  console.log('--- Global Migration Complete ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
