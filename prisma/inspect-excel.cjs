const XLSX = require('xlsx');

const wb = XLSX.readFile('assets/2568-3-student.xlsx');
console.log('Sheet names:', wb.SheetNames);

const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Print first 5 rows
data.slice(0, 10).forEach((row, i) => {
  console.log(`Row ${i}:`, row);
});
