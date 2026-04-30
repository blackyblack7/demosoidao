require('dotenv').config();
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Map Thai prefix to gender-correct form
function resolvePrefix(prefixTh) {
  const p = (prefixTh || '').trim();
  if (p === 'เด็กชาย') return 'เด็กชาย';
  if (p === 'เด็กหญิง') return 'เด็กหญิง';
  if (p === 'นาย') return 'นาย';
  if (p === 'นาง') return 'นาง';
  if (p === 'นางสาว') return 'นางสาว';
  return p;
}

// Parse Thai date "DD/MM/YYYY" or Excel serial to JS Date
function parseThaiDate(val) {
  if (!val) return null;
  if (typeof val === 'number') {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(val);
    return new Date(d.y, d.m - 1, d.d);
  }
  const str = String(val).trim();
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  // y is Buddhist Era (พ.ศ.), subtract 543
  return new Date(y - 543, m - 1, d);
}

// Parse grade "ม.1" → "ม.1" keep as-is
function parseGrade(gradeStr) {
  return String(gradeStr || '').trim();
}

async function main() {
  const wb = XLSX.readFile('assets/2568-3-student.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Row 0 = date header, Row 1 = column headers, Row 2+ = data
  const headers = rows[1];
  const dataRows = rows.slice(2).filter(r => r && r.length > 2);

  console.log(`Found ${dataRows.length} student rows`);

  // Upsert AcademicYear term for semester 3/2568 (active)
  const term = await prisma.academicYear.upsert({
    where: { id: 1 },
    update: { isActive: true },
    create: { semester: 3, year: 2568, isActive: true },
  });

  console.log(`Using AcademicYear: ปีการศึกษา ${term.year}/${term.semester}`);

  // Get or create prefixes/genders for mapping
  const prefixes = await prisma.prefix.findMany();
  const genders = await prisma.gender.findMany();
  
  let created = 0;
  let skipped = 0;
  
  const getPrefixId = async (name) => {
    let p = prefixes.find(x => x.name === name);
    if (!p) {
      p = await prisma.prefix.create({ data: { name } });
      prefixes.push(p);
    }
    return p.id;
  };

  const getGenderId = async (name) => {
    let g = genders.find(x => x.name === name);
    if (!g) {
      g = await prisma.gender.create({ data: { name } });
      genders.push(g);
    }
    return g.id;
  };

  for (const row of dataRows) {
    const nationalId = String(row[2] || '').trim();
    const studentCode = String(row[5] || '').trim();
    const gradeLevel = parseGrade(row[3]);
    const roomNumber = parseInt(row[4]) || 1;
    const genderName = row[6] === 'ช' ? 'ชาย' : row[6] === 'ญ' ? 'หญิง' : String(row[6] || '');
    const prefixName = resolvePrefix(row[7]);
    
    const prefixId = await getPrefixId(prefixName);
    const genderId = await getGenderId(genderName);

    const firstName = String(row[8] || '').trim();
    const lastName = String(row[9] || '').trim();
    const birthDate = parseThaiDate(row[10]);
    const weight = parseFloat(row[12]) || null;
    const height = parseFloat(row[13]) || null;
    const disadvantagedType = String(row[34] || '').trim() === '-' ? null : String(row[34] || '').trim();

    const houseNumber = String(row[18] || '').trim();
    const moo = String(row[19] || '').trim() === '-' ? null : String(row[19] || '').trim();
    const subDistrict = String(row[21] || '').trim();
    const district = String(row[22] || '').trim();
    const province = String(row[23] || '').trim();

    // Guardian
    const guardianFirstName = String(row[24] || '').trim();
    const guardianLastName = String(row[25] || '').trim();
    const guardianRelation = String(row[27] || '').trim();

    // Father
    const fatherFirstName = String(row[28] || '').trim();
    const fatherLastName = String(row[29] || '').trim();

    // Mother
    const motherFirstName = String(row[31] || '').trim();
    const motherLastName = String(row[32] || '').trim();

    if (!nationalId || !firstName || !lastName) {
      skipped++;
      continue;
    }

    try {
      await prisma.student.upsert({
        where: { nationalId },
        update: {
          prefixId,
          prefix: prefixName,
          genderId,
          gender: genderName,
        },
        create: {
          nationalId,
          studentCode,
          prefixId,
          prefix: prefixName,
          firstNameTh: firstName,
          lastNameTh: lastName,
          genderId,
          gender: genderName,
          disadvantagedType,
          termData: {
            create: {
              gradeLevel,
              roomNumber,
              weight: weight ? weight : undefined,
              height: height ? height : undefined,
              termId: term.id,
            },
          },
          addresses: {
            create: {
              addressType: 'ที่อยู่ปัจจุบัน',
              houseNumber,
              moo,
              subDistrict,
              district,
              province,
              zipCode: '',
            },
          },
          parents: {
            create: [
              // Guardian (ผู้ปกครอง)
              ...(guardianFirstName && guardianRelation ? [{
                relationship: guardianRelation,
                prefix: '',
                firstName: guardianFirstName,
                lastName: guardianLastName,
              }] : []),
              // Father (บิดา) - only if different from guardian
              ...(fatherFirstName && fatherFirstName !== guardianFirstName ? [{
                relationship: 'บิดา',
                prefix: 'นาย',
                firstName: fatherFirstName,
                lastName: fatherLastName,
              }] : []),
              // Mother (มารดา) - only if different from guardian
              ...(motherFirstName && motherFirstName !== guardianFirstName ? [{
                relationship: 'มารดา',
                prefix: 'นาง',
                firstName: motherFirstName,
                lastName: motherLastName,
              }] : []),
            ],
          },
        },
      });
      created++;
    } catch (e) {
      console.error(`Error on student ${nationalId} ${firstName}:`, e.message);
      skipped++;
    }
  }

  console.log(`✅ Done! Created: ${created}, Skipped/Error: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
