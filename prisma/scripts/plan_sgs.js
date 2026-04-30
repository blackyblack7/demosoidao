const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');

async function importSGS(filePath) {
    const buffer = require('fs').readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const activeTerm = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!activeTerm) throw new Error('No active term');

    // Extract Grade from Row 3
    const headerRow = rows[2] || [];
    const headerText = headerRow.join(" ");
    const gradeMatch = headerText.match(/ชั้น\s+(ม\.\d+)/);
    const defaultGrade = gradeMatch ? gradeMatch[1] : "ไม่ระบุ";

    let studentBuffer = [];
    let processedCount = 0;

    for (let i = 10; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const rowText = row.join(" ");
        
        // Check if this row is a room footer
        const roomMatch = rowText.match(/ห้องที่\s+(\d+)/);
        if (roomMatch) {
            const roomNumber = parseInt(roomMatch[1]);
            console.log(`Processing ${studentBuffer.length} students for Room ${roomNumber}`);
            
            for (const s of studentBuffer) {
                const nameData = parseName(s.fullName);
                let gender = "ไม่ระบุ";
                if (["เด็กชาย", "นาย"].includes(nameData.prefix)) gender = "ชาย";
                if (["เด็กหญิง", "นางสาว", "นาง"].includes(nameData.prefix)) gender = "หญิง";

                const student = await prisma.student.upsert({
                    where: { studentCode: s.studentCode },
                    update: {
                        prefix: nameData.prefix,
                        firstNameTh: nameData.firstName,
                        lastNameTh: nameData.lastName,
                        gender: gender,
                    },
                    create: {
                        studentCode: s.studentCode,
                        nationalId: `SGS-${s.studentCode}`,
                        prefix: nameData.prefix,
                        firstNameTh: nameData.firstName,
                        lastNameTh: nameData.lastName,
                        gender: gender,
                    }
                });

                await prisma.studentTermData.upsert({
                    where: {
                        id: (await prisma.studentTermData.findFirst({
                            where: { studentId: student.id, termId: activeTerm.id }
                        }))?.id || -1
                    },
                    update: {
                        gradeLevel: defaultGrade,
                        roomNumber: roomNumber,
                        studentNumber: s.studentNumber,
                    },
                    create: {
                        studentId: student.id,
                        termId: activeTerm.id,
                        gradeLevel: defaultGrade,
                        roomNumber: roomNumber,
                        studentNumber: s.studentNumber,
                    }
                });
                processedCount++;
            }
            studentBuffer = []; // Clear buffer after processing a room
            continue;
        }

        // Check if it's a student row (has student code in column 4)
        const studentCode = row[4] ? String(row[4]).trim() : null;
        const fullName = row[7] ? String(row[7]).trim() : null;
        const studentNumber = row[1] ? parseInt(String(row[1])) : null;

        if (studentCode && fullName && !isNaN(studentNumber)) {
            studentBuffer.push({ studentCode, fullName, studentNumber });
        }
    }

    return processedCount;
}

function parseName(fullName) {
    const prefixes = ['เด็กชาย', 'เด็กหญิง', 'นางสาว', 'นาย', 'นาง'];
    let prefix = '';
    let remaining = fullName;
    for (const p of prefixes) {
        if (fullName.startsWith(p)) {
            prefix = p;
            remaining = fullName.substring(p.length).trim();
            break;
        }
    }
    const parts = remaining.split(/\s+/);
    return { prefix, firstName: parts[0], lastName: parts.slice(1).join(' ') };
}
