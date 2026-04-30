const XLSX = require('xlsx');

function checkFullRow(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`\n--- Check full row 11 for ${filePath} ---`);
    console.log(JSON.stringify(data[10], null, 2));
    console.log(`\n--- Check full row 3 ---`);
    console.log(JSON.stringify(data[2], null, 2));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

checkFullRow('c:/project/soidao/prisma/data/ใบรายชื่อนักเรียน SGS ม.1.xls');
