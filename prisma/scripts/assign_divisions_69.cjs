const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ─── Parse CSV (handles quoted fields with commas) ───────────────────────────
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { fields.push(current.trim()); current = ''; }
    else { current += c; }
  }
  fields.push(current.trim());
  return fields;
}

// ─── Parse Thai name prefix ──────────────────────────────────────────────────
const PREFIXES = ['นางสาว', 'นาง', 'นาย', 'ว่าที่ร้อยตรี'];
function parseName(fullName) {
  fullName = fullName.trim().replace(/\s+/g, ' ');
  let prefix = '', rest = fullName;
  for (const p of PREFIXES) {
    if (fullName.startsWith(p)) { prefix = p; rest = fullName.slice(p.length).trim(); break; }
  }
  const parts = rest.split(/\s+/);
  return { prefix, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
}

// ─── Map CSV "กลุ่มบริหารงานหลัก" → AdminGroup key ─────────────────────────
const GROUP_MAP = {
  'กลุ่มบริหารงานวิชาการ': 'กลุ่มบริหารงานวิชาการ',
  'รองผู้อำนวยการกลุ่มบริหารงานวิชาการ': 'กลุ่มบริหารงานวิชาการ',
  'กลุ่มบริหารงานบุคคล': 'กลุ่มบริหารงานบุคคล',
  'กลุ่มบริหารงานงบประมาณและแผน': 'กลุ่มบริหารงานงบประมาณและทรัพย์สิน',
  'กลุ่มบริหารงานทั่วไป': 'กลุ่มบริหารงานทั่วไป',
  'รองผู้อำนวยการกลุ่มบริหารงานทั่วไป': 'กลุ่มบริหารงานทั่วไป',
  'รองผู้อำนวยการกลุ่มบริหารงาน': null, // จันทร์เพ็ญ - multi-group, handle separately
  'ผู้อำนวยการสถานศึกษา': null, // Director - all groups
  'งานธุรการ': 'กลุ่มบริหารงานทั่วไป',
};

// ─── Map CSV "งานย่อย" → AdminDivision name in DB ────────────────────────────
const DIV_MAP = {
  'งานกิจการนักเรียน': 'งานกิจการนักเรียน',
  'งานพัสดุ': 'งานพัสดุและสินทรัพย์',
  'งานอาคารสถานที่': 'งานอาคารสถานที่และสภาพแวดล้อม',
  'งานโสต': 'งานโสตทัศนศึกษา',
  'งานประชาสัมพันธ์': 'งานประชาสัมพันธ์และประสานงานชุมชน',
  'งานพยาบาล': 'งานบริการและส่งเสริมสุขภาพนักเรียน',
  'งานการเงิน': 'งานการเงิน',
  'งานนโยบายและแผน': 'งานแผนและงบประมาณ',
  'งานห้องสมุด': null, // No matching division? We'll handle below.
  'งานธุรการ': 'งานธุรการและสารบรรณกลาง',
};

// ═════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   🏢 Assign Divisions to Personnel from CSV');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Read CSV
  const csvPath = path.join(__dirname, '..', 'data', 'personnel_soidaowittaya_separated_dept.csv');
  const rawCSV = fs.readFileSync(csvPath, 'utf-8');
  const lines = rawCSV.split('\n').filter(l => l.trim());
  const dataLines = lines.slice(1);

  console.log(`📄 ${dataLines.length} records in CSV\n`);

  // 2. Load groups & divisions from DB
  const allGroups = await prisma.adminGroup.findMany({ include: { divisions: true } });
  const groupByName = {};
  const divByName = {};

  for (const g of allGroups) {
    groupByName[g.groupName] = g;
    for (const d of g.divisions) {
      divByName[d.divisionName] = d;
    }
  }

  console.log('📦 Loaded groups:', Object.keys(groupByName).join(', '));
  console.log('📦 Loaded divisions:', Object.keys(divByName).length, 'total\n');

  // 3. Process each row
  let assigned = 0;
  let skippedNoDivision = 0;
  let skippedNotFound = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const fields = parseCSVLine(dataLines[i]);
    if (fields.length < 9) continue;

    const [_num, rawName, _pos, _dob, _phone, rawNationalId, rawGroup, rawSubDiv, _dept] = fields;
    const { firstName, lastName } = parseName(rawName);

    if (!firstName || !lastName) continue;

    // Clean national ID
    const nationalIdDigits = rawNationalId ? rawNationalId.replace(/[^0-9]/g, '') : '';
    const nationalId = nationalIdDigits.length === 13 ? nationalIdDigits : null;

    // Find the teacher in DB
    let teacher = null;
    if (nationalId) {
      teacher = await prisma.teacher.findUnique({ where: { nationalId } });
    }
    if (!teacher) {
      teacher = await prisma.teacher.findFirst({ where: { firstName, lastName } });
    }
    if (!teacher) {
      console.log(`  ❌ Row ${i + 2}: Teacher not found: ${firstName} ${lastName}`);
      skippedNotFound++;
      continue;
    }

    // Determine which divisions to connect
    const divisionIdsToConnect = [];

    const groupNameRaw = rawGroup || '';
    const subDivRaw = rawSubDiv || '';

    // Map group name
    const mappedGroupName = GROUP_MAP[groupNameRaw] || null;

    if (subDivRaw && subDivRaw !== '-') {
      // Has a specific sub-division → find that division
      const mappedDivName = DIV_MAP[subDivRaw];
      if (mappedDivName && divByName[mappedDivName]) {
        divisionIdsToConnect.push(divByName[mappedDivName].id);
      } else {
        // Try direct match
        if (divByName[subDivRaw]) {
          divisionIdsToConnect.push(divByName[subDivRaw].id);
        } else {
          console.log(`  ⚠️  Row ${i + 2}: Division not found in DB for sub-div "${subDivRaw}" (teacher: ${firstName} ${lastName})`);
        }
      }
    }

    // If no specific sub-division, still link to the group's "general" first division if applicable
    // For teachers who only have a group but no sub-division, we don't force a division link

    // Special case: ผู้อำนวยการ - connect to ALL groups' first division? Skip for now.
    // Special case: รองผอ.จันทร์เพ็ญ - งบประมาณ + บุคคล
    if (groupNameRaw === 'รองผู้อำนวยการกลุ่มบริหารงาน' && subDivRaw.includes('งบประมาณ')) {
      // Connect to budget and personnel groups
      // Already handled by executives script
    }

    if (divisionIdsToConnect.length === 0) {
      skippedNoDivision++;
      console.log(`  ➖ ${firstName} ${lastName}: No sub-division to assign (group: ${groupNameRaw || '-'})`);
      continue;
    }

    // Get current divisions
    const currentTeacher = await prisma.teacher.findUnique({
      where: { id: teacher.id },
      include: { divisions: { select: { id: true } } }
    });

    const currentDivIds = new Set(currentTeacher.divisions.map(d => d.id));
    const newDivIds = divisionIdsToConnect.filter(id => !currentDivIds.has(id));

    if (newDivIds.length === 0) {
      console.log(`  ✔️  ${firstName} ${lastName}: Already assigned to correct divisions`);
      assigned++;
      continue;
    }

    // Connect new divisions (additive, don't remove existing ones)
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        divisions: {
          connect: newDivIds.map(id => ({ id }))
        }
      }
    });

    const divNames = newDivIds.map(id => {
      for (const [name, div] of Object.entries(divByName)) {
        if (div.id === id) return name;
      }
      return `id:${id}`;
    });

    console.log(`  ✅ ${firstName} ${lastName}: Connected to → ${divNames.join(', ')}`);
    assigned++;
  }

  // 4. Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`   ✅ Assigned:       ${assigned}`);
  console.log(`   ➖ No sub-div:     ${skippedNoDivision}`);
  console.log(`   ❌ Not found:      ${skippedNotFound}`);
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .catch(e => { console.error('Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
