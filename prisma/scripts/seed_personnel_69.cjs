const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ─── Thai Month Mapping ──────────────────────────────────────────────────────
const THAI_MONTHS = {
  'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4,
  'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8,
  'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12
};

// ─── Department Mapping (CSV value → DB departmentName) ──────────────────────
const DEPT_MAP = {
  'ภาษาไทย': 'ภาษาไทย',
  'คณิตศาสตร์': 'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี': 'วิทยาศาสตร์และเทคโนโลยี',
  'สังคมศึกษา': 'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'ภาษาต่างประเทศ': 'ภาษาต่างประเทศ',
  'สุขศึกษาและพลศึกษา': 'สุขศึกษาและพลศึกษา',
  'การงานอาชีพ': 'การงานอาชีพ',
  'ดนตรี นาฎศิลป์ ศิลปะ': 'ศิลปะ',
  'ผู้บริหาร': null,
  'สายสนับสนุน': null,
};

// ─── Parse Thai Prefix from Full Name ────────────────────────────────────────
const PREFIXES = ['นางสาว', 'นาง', 'นาย', 'ว่าที่ร้อยตรี'];

function parseName(fullName) {
  fullName = fullName.trim().replace(/\s+/g, ' ');
  let prefix = '';
  let rest = fullName;

  for (const p of PREFIXES) {
    if (fullName.startsWith(p)) {
      prefix = p;
      rest = fullName.slice(p.length).trim();
      break;
    }
  }

  const parts = rest.split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';

  return { prefix, firstName, lastName };
}

// ─── Parse Position + Academic Standing ──────────────────────────────────────
function parsePosition(posStr) {
  if (!posStr) return { position: null, academicStanding: null };

  const cleaned = posStr.trim();

  // Format: "ครู/ชำนาญการพิเศษ" or "ผู้อำนวยการ/ ชำนาญการพิเศษ"
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/').map(s => s.trim());
    return {
      position: parts[0] || null,
      academicStanding: parts[1] || null,
    };
  }

  return { position: cleaned, academicStanding: null };
}

// ─── Parse Thai Date of Birth → JS Date + Password String ────────────────────
function parseDOB(dobStr) {
  if (!dobStr || !dobStr.trim()) return { date: null, passwordPlain: null };

  const cleaned = dobStr.trim();
  // Format: "20 มิถุนายน 2525"
  const parts = cleaned.split(/\s+/);
  if (parts.length !== 3) return { date: null, passwordPlain: null };

  const day = parseInt(parts[0], 10);
  const month = THAI_MONTHS[parts[1]];
  const yearBE = parseInt(parts[2], 10);

  if (!day || !month || !yearBE) return { date: null, passwordPlain: null };

  const yearCE = yearBE - 543;
  const date = new Date(yearCE, month - 1, day);

  // Password: ddMMyyyy (Buddhist Era)
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const passwordPlain = `${dd}${mm}${yearBE}`;

  return { date, passwordPlain };
}

// ─── Parse National ID (handle commas in quoted fields) ──────────────────────
function cleanNationalId(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9]/g, '');
  if (cleaned.length === 13) return cleaned;
  return null;
}

// ─── Parse Phone Number ──────────────────────────────────────────────────────
function cleanPhone(raw) {
  if (!raw) return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;
  return cleaned;
}

// ─── Parse CSV (handles quoted fields with commas) ───────────────────────────
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  fields.push(current.trim());
  return fields;
}

// ─── Personnel Category Mapping ──────────────────────────────────────────────
function getPersonnelCategory(posStr) {
  if (!posStr) return 'ครู';
  const p = posStr.trim();
  if (p.includes('ผู้อำนวยการ') || p.includes('รองผู้อำนวยการ')) return 'ผู้บริหาร';
  if (p.includes('อัตราจ้าง') || p.includes('วิกฤต') || p.includes('พี่เลี้ยง')) return 'ลูกจ้างชั่วคราว';
  if (p.includes('พนักงานราชการ')) return 'พนักงานราชการ';
  if (p.includes('ธุรการ')) return 'ลูกจ้างชั่วคราว';
  return 'ครู';
}

// ═════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   📋 Seed Personnel from CSV — ปีการศึกษา 2569');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Read CSV
  const csvPath = path.join(__dirname, '..', 'data', 'personnel_soidaowittaya.csv');
  const rawCSV = fs.readFileSync(csvPath, 'utf-8');
  const lines = rawCSV.split('\n').filter(l => l.trim());
  const dataLines = lines.slice(1); // skip header

  console.log(`📄 Found ${dataLines.length} records in CSV\n`);

  // 2. Ensure lookup tables are populated
  console.log('📦 Ensuring lookup tables...');

  // Prefixes
  for (const name of ['นาย', 'นาง', 'นางสาว', 'ว่าที่ร้อยตรี']) {
    await prisma.prefix.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Positions
  const positionNames = [
    'ผู้อำนวยการ', 'รองผู้อำนวยการ', 'ครู', 'ครูผู้ช่วย',
    'ครูอัตราจ้าง', 'พนักงานราชการ', 'ธุรการ', 'ครูวิกฤต',
    'ครูพี่เลี้ยงเด็กเรียนร่วม', 'ครูแนะแนว', 'ครูบรรณารักษ์'
  ];
  for (const name of positionNames) {
    const level = name.includes('ผู้อำนวยการ') ? 10
      : name.includes('รองผู้อำนวยการ') ? 8
      : name.includes('ครู') ? 5
      : 3;
    await prisma.teacherPosition.upsert({ where: { name }, update: {}, create: { name, level } });
  }

  // Academic Standings
  for (const name of ['ชำนาญการ', 'ชำนาญการพิเศษ', '- (ไม่มี)']) {
    await prisma.academicStanding.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Personnel Categories
  for (const name of ['ครู', 'ผู้บริหาร', 'พนักงานราชการ', 'ลูกจ้างชั่วคราว', 'ข้าราชการครู']) {
    await prisma.personnelCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Departments
  const deptEntries = [
    'ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์และเทคโนโลยี',
    'สังคมศึกษา ศาสนา และวัฒนธรรม', 'ภาษาต่างประเทศ',
    'สุขศึกษาและพลศึกษา', 'การงานอาชีพ', 'ศิลปะ'
  ];
  for (const deptName of deptEntries) {
    const existing = await prisma.academicDepartment.findFirst({ where: { departmentName: deptName } });
    if (!existing) {
      await prisma.academicDepartment.create({ data: { departmentName: deptName } });
    }
  }

  // 3. Load lookup maps
  const prefixes = await prisma.prefix.findMany();
  const positions = await prisma.teacherPosition.findMany();
  const standings = await prisma.academicStanding.findMany();
  const categories = await prisma.personnelCategory.findMany();
  const departments = await prisma.academicDepartment.findMany();

  const prefixMap = Object.fromEntries(prefixes.map(p => [p.name, p.id]));
  const posMap = Object.fromEntries(positions.map(p => [p.name, p.id]));
  const standMap = Object.fromEntries(standings.map(s => [s.name, s.id]));
  const catMap = Object.fromEntries(categories.map(c => [c.name, c.id]));
  const deptMap = Object.fromEntries(departments.map(d => [d.departmentName, d.id]));

  console.log('  ✅ Lookup tables ready\n');

  // 4. Process each row
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const fields = parseCSVLine(dataLines[i]);
    if (fields.length < 8) {
      console.log(`  ⚠️  Row ${i + 2}: Skipping (insufficient columns): ${fields.join(' | ')}`);
      skipped++;
      continue;
    }

    const [_num, rawName, rawPosition, rawDOB, rawPhone, rawNationalId, rawDivision, rawDept] = fields;

    // Parse name
    const { prefix, firstName, lastName } = parseName(rawName);
    if (!firstName || !lastName) {
      console.log(`  ⚠️  Row ${i + 2}: Skipping (bad name): "${rawName}"`);
      skipped++;
      continue;
    }

    // Parse position + academic standing
    const { position, academicStanding } = parsePosition(rawPosition);

    // Handle composite positions like "ครูแนะแนว/ครูผู้ช่วย"
    let effectivePosition = position;
    if (position && position.includes('ครูแนะแนว')) effectivePosition = 'ครูแนะแนว';
    if (position && position.includes('ครูบรรณารักษ์')) effectivePosition = 'ครูบรรณารักษ์';

    // Parse DOB
    const { date: dateOfBirth, passwordPlain } = parseDOB(rawDOB);

    // National ID
    const nationalId = cleanNationalId(rawNationalId);

    // Phone
    const phoneNumber = cleanPhone(rawPhone);

    // Username: nationalId or firstName+lastName
    const username = nationalId || `${firstName}.${lastName}`.replace(/\s/g, '');

    // Department mapping
    const deptKey = rawDept ? rawDept.trim() : null;
    const mappedDeptName = deptKey ? DEPT_MAP[deptKey] : null;
    const departmentId = mappedDeptName ? deptMap[mappedDeptName] || null : null;

    // Personnel category
    const personnelCat = getPersonnelCategory(rawPosition);

    // Hash password
    let hashedPassword = null;
    if (passwordPlain) {
      hashedPassword = await bcrypt.hash(passwordPlain, 10);
    }

    // Build the data
    const data = {
      prefix: prefix || null,
      firstName,
      lastName,
      phoneNumber: phoneNumber || undefined,
      position: effectivePosition || null,
      academicStanding: academicStanding || null,
      personnelCategory: personnelCat,
      departmentId: departmentId || undefined,
      // Lookup IDs
      prefixId: prefix ? prefixMap[prefix] || undefined : undefined,
      positionId: effectivePosition ? posMap[effectivePosition] || undefined : undefined,
      academicStandingId: academicStanding ? standMap[academicStanding] || undefined : undefined,
      personnelCategoryId: personnelCat ? catMap[personnelCat] || undefined : undefined,
    };

    if (dateOfBirth) data.dateOfBirth = dateOfBirth;
    if (nationalId) data.nationalId = nationalId;

    try {
      // Try to find existing teacher by nationalId or firstName+lastName combo
      let existing = null;

      if (nationalId) {
        existing = await prisma.teacher.findUnique({ where: { nationalId } });
      }

      if (!existing) {
        // Try by firstName + lastName
        existing = await prisma.teacher.findFirst({
          where: { firstName, lastName }
        });
      }

      if (existing) {
        // Update existing — merge in new data (don't overwrite password if already set)
        const updateData = { ...data };
        delete updateData.nationalId; // Can't update unique in update

        // Only set password if not already set
        if (!existing.password && hashedPassword) {
          updateData.password = hashedPassword;
        }

        // If nationalId not set yet, set it
        if (nationalId && !existing.nationalId) {
          updateData.nationalId = nationalId;
        }

        await prisma.teacher.update({
          where: { id: existing.id },
          data: updateData,
        });

        console.log(`  🔄 Updated: ${prefix}${firstName} ${lastName} (ID: ${existing.id})`);
        updated++;
      } else {
        // Create new teacher
        const createData = {
          ...data,
          username,
          password: hashedPassword,
        };

        const teacher = await prisma.teacher.create({ data: createData });
        console.log(`  ✅ Created: ${prefix}${firstName} ${lastName} (ID: ${teacher.id}, user: ${username})`);
        created++;
      }
    } catch (err) {
      console.error(`  ❌ Row ${i + 2}: Error for "${prefix}${firstName} ${lastName}": ${err.message}`);
      skipped++;
    }
  }

  // 5. Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   📊 Total:   ${created + updated + skipped}`);
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .catch(e => {
    console.error('Fatal Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
