const XLSX = require('xlsx');

function readHeaders(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\n--- Headers for ${filePath} ---`);
    for(let i = 0; i < Math.min(15, data.length); i++) {
        console.log(`Row ${i + 1}: `, data[i]);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

readHeaders('c:/project/soidao/prisma/data/ใบรายชื่อนักเรียน SGS ม.1.xls');
