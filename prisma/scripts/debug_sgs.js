const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'c:/project/soidao/prisma/data/SGS m1all.xls';

try {
    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('Total Rows:', rows.length);
    console.log('--- Row 1 ---');
    console.log(JSON.stringify(rows[0]));
    console.log('--- Row 2 ---');
    console.log(JSON.stringify(rows[1]));
    console.log('--- Row 3 ---');
    console.log(JSON.stringify(rows[2]));
    console.log('--- Row 10 ---');
    console.log(JSON.stringify(rows[9]));
    console.log('--- Row 11 ---');
    console.log(JSON.stringify(rows[10]));
    console.log('--- Row 12 ---');
    console.log(JSON.stringify(rows[11]));

} catch (e) {
    console.error(e);
}
