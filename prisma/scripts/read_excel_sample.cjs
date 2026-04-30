const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'assets', 'ใบรายชื่อนักเรียน (3).xls');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('Sheet Name:', sheetName);
  console.log('Rows 5-20:');
  console.log(JSON.stringify(data.slice(5, 20), null, 2));
} catch (error) {
  console.error('Error reading excel:', error.message);
}
