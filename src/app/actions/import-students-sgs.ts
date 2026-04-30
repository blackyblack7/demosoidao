"use server";

import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";
import * as XLSX from 'xlsx';
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { GROUP_KEYS } from "@/constants";

function parseName(fullName: string) {
  if (!fullName) return null;
  const parts = fullName.split(/\s{2,}|\t/);
  let firstPart = parts[0] ? parts[0].trim() : '';
  let lastName = parts[1] ? parts[1].trim() : '';

  if (!lastName) {
      const parts2 = fullName.split(/\s+/);
      firstPart = parts2[0] ? parts2[0].trim() : '';
      lastName = parts2.slice(1).join(' ').trim();
  }

  const prefixes = ['เด็กชาย', 'เด็กหญิง', 'นางสาว', 'นาย', 'นาง'];
  let prefix = '';
  let firstName = firstPart;

  for (const p of prefixes) {
    if (firstPart.startsWith(p)) {
      prefix = p;
      firstName = firstPart.substring(p.length).trim();
      break;
    }
  }

  return { prefix, firstName, lastName };
}

export async function importSGSAction(formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.ACADEMIC);
  if (!hasAccess) {
    return { success: false, error: "ไม่มีสิทธิ์เข้าถึง" };
  }

  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: "ไม่พบไฟล์ที่อัปโหลด" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

    const activeTerm = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!activeTerm) {
      return { success: false, error: "ต้องกำหนดปีการศึกษาที่ใช้งานก่อน" };
    }

    // Extract Grade and Room from Row 3 (Index 2)
    const headerRow = rows[2] || [];
    const headerText = headerRow.join(" ");
    const match = headerText.match(/ชั้น\s+(ม\.\d+)\s+ห้องที่\s+(\d+)/);
    
    let defaultGrade = "";
    let defaultRoom = 1;

    if (match) {
      defaultGrade = match[1];
      defaultRoom = parseInt(match[2]);
    }

    // Check footer for room if room is 0 or not found
    if (defaultRoom === 0) {
      const footerRows = rows.slice(-10); // Check last 10 rows
      for (const row of footerRows) {
        const rowText = row.join(" ");
        const footerMatch = rowText.match(/ห้องที่\s+(\d+)/);
        if (footerMatch) {
          defaultRoom = parseInt(footerMatch[1]);
          break;
        }
      }
    }

    if (!defaultGrade) {
       return { success: false, error: "ไม่สามารถอ่านข้อมูล ชั้น จากไฟล์ SGS ได้ กรุณาตรวจสอบรูปแบบไฟล์" };
    }

    const dataRows = rows.slice(10); // Data starts at Row 11
    
    let processed = 0;
    let errors = 0;
    let studentBuffer: any[] = [];

    for (const row of dataRows) {
      if (!row || row.length === 0) continue;

      const rowText = row.join(" ");
      
      // Check if this row is a room footer (e.g., "ห้องที่ 1 รวม 40 คน")
      const roomMatch = rowText.match(/ห้องที่\s+(\d+)/);
      if (roomMatch) {
        const roomNumber = parseInt(roomMatch[1]);
        
        // Process all students in current buffer with this room number
        for (const s of studentBuffer) {
          try {
            const nameData = parseName(s.fullName);
            if (!nameData || !nameData.firstName) continue;

            // Auto-detect gender
            let genderName = "ไม่ระบุ";
            if (["เด็กชาย", "นาย"].includes(nameData.prefix)) genderName = "ชาย";
            if (["เด็กหญิง", "นางสาว", "นาง"].includes(nameData.prefix)) genderName = "หญิง";

            const [prefixRec, genderRec] = await Promise.all([
              prisma.prefix.upsert({
                where: { name: nameData.prefix || "ไม่ระบุ" },
                update: {},
                create: { name: nameData.prefix || "ไม่ระบุ" }
              }),
              prisma.gender.upsert({
                where: { name: genderName },
                update: {},
                create: { name: genderName }
              })
            ]);

            // Set default password: Sdw<studentCode>c
            const defaultPassword = `Sdw${s.studentCode}c`;
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            const student = await prisma.student.upsert({
              where: { studentCode: s.studentCode },
              update: {
                prefixId: prefixRec.id,
                firstNameTh: nameData.firstName,
                lastNameTh: nameData.lastName,
                genderId: genderRec.id,
                password: hashedPassword,
              },
              create: {
                studentCode: s.studentCode,
                nationalId: `SGS-${s.studentCode}`,
                prefixId: prefixRec.id,
                firstNameTh: nameData.firstName,
                lastNameTh: nameData.lastName,
                genderId: genderRec.id,
                password: hashedPassword,
              }
            });

            // Upsert term data
            const existingTermData = await prisma.studentTermData.findFirst({
              where: { studentId: student.id, termId: activeTerm.id }
            });

            if (existingTermData) {
              await prisma.studentTermData.update({
                where: { id: existingTermData.id },
                data: {
                  studentNumber: s.studentNumber,
                  gradeLevel: defaultGrade,
                  roomNumber: roomNumber
                }
              });
            } else {
              await prisma.studentTermData.create({
                data: {
                  studentId: student.id,
                  termId: activeTerm.id,
                  studentNumber: s.studentNumber,
                  gradeLevel: defaultGrade,
                  roomNumber: roomNumber
                }
              });
            }
            processed++;
          } catch (err) {
            console.error("Error processing student:", err);
            errors++;
          }
        }
        studentBuffer = []; // Clear buffer after processing a section
        continue;
      }

      // Collect student rows
      const studentNumberRaw = row[1];
      const studentCodeRaw = row[4];
      const fullNameRaw = row[7];

      if (studentCodeRaw && fullNameRaw) {
        const studentCode = String(studentCodeRaw).trim();
        const fullName = String(fullNameRaw).trim();
        const studentNumber = parseInt(String(studentNumberRaw));

        if (studentCode && fullName && !isNaN(studentNumber)) {
          studentBuffer.push({ studentCode, fullName, studentNumber });
        }
      }
    }

    revalidatePath("/management/academic/students");
    return { 
      success: true, 
      message: `นำเข้าข้อมูลสำเร็จ ${processed} รายการ (เกิดข้อผิดพลาด ${errors} รายการ)` 
    };

  } catch (error: any) {
    console.error("Import SGS error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการประมวลผลไฟล์" };
  }
}
