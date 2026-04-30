require('dotenv').config();
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseThaiDate(val) {
  if (!val) return null;
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    return new Date(d.y, d.m - 1, d.d);
  }
  const str = String(val).trim();
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  // y is Buddhist Era (พ.ศ.)
  return new Date(y - 543, m - 1, d);
}

// Password = DDMMYYYY in พ.ศ. (same as in Excel column)
function makePlainPassword(val) {
  if (!val) return null;
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    // Convert back to BE year
    const beYear = d.y + 543;
    return String(d.d).padStart(2, '0') + String(d.m).padStart(2, '0') + String(beYear);
  }
  const str = String(val).trim();
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  // y is already BE (พ.ศ.)
  return String(d).padStart(2, '0') + String(m).padStart(2, '0') + String(y);
}

async function main() {
  const wb = XLSX.readFile('assets/2568-3-student.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const dataRows = rows.slice(2).filter(r => r && r.length > 2);

  console.log(`Processing ${dataRows.length} students...`);

  let updated = 0;
  let errors = 0;

  for (const row of dataRows) {
    const nationalId = String(row[2] || '').trim();
    const birthDateRaw = row[10];
    const plainPassword = makePlainPassword(birthDateRaw);
    const dateOfBirth = parseThaiDate(birthDateRaw);

    if (!nationalId || !plainPassword) continue;

    try {
      const hashed = await bcrypt.hash(plainPassword, 10);
      await prisma.student.update({
        where: { nationalId },
        data: { password: hashed, dateOfBirth },
      });
      updated++;
      if (updated % 100 === 0) console.log(`  Updated ${updated}...`);
    } catch (e) {
      console.error(`Error on ${nationalId}:`, e.message);
      errors++;
    }
  }

  console.log(`\n✅ Done! Updated: ${updated}, Errors: ${errors}`);
  console.log('ตัวอย่างเช่น นักเรียนเกิด 26/06/2555 → รหัสผ่าน: 26062555');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
