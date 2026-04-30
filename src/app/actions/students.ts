'use server'

import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { GROUP_KEYS } from '@/constants';

export async function adminImportStudentsFromExcel(formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.ACADEMIC);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const file = formData.get("file") as File;
  if (!file) return { error: "ไม่พบไฟล์ที่อัปโหลด" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // 1. Parse Metadata (Row 3 - index 2)
    // Format: "รายชื่อนักเรียน ปีการศึกษา 2568 ภาคเรียนที่ 2  ชั้น ม.1  ห้องที่ 0"
    const metaRow = rows[2]?.find(cell => cell && typeof cell === 'string' && cell.includes('ปีการศึกษา'));
    if (!metaRow) return { error: "รูปแบบไฟล์ไม่ถูกต้อง (ไม่พบข้อมูลปีการศึกษา/ชั้นเรียนในแถวที่ 3)" };

    const yearMatch = metaRow.match(/ปีการศึกษา\s+(\d+)/);
    const semMatch = metaRow.match(/ภาคเรียนที่\s+(\d+)/);
    const gradeMatch = metaRow.match(/ชั้น\s+([ก-๙\w.]+)/);
    const roomMatch = metaRow.match(/ห้องที่\s+(\d+)/);

    const year = yearMatch ? parseInt(yearMatch[1]) : null;
    const semester = semMatch ? parseInt(semMatch[1]) : null;
    const gradeLevel = gradeMatch ? gradeMatch[1] : null;
    const roomNumber = roomMatch ? parseInt(roomMatch[1]) : 0;

    if (!year || !semester) return { error: "ไม่สามารถระบุปีการศึกษาหรือภาคเรียนจากไฟล์ได้" };

    // Find Academic Year in DB
    const academicYear = await prisma.academicYear.findFirst({
      where: { semester, year }
    });

    if (!academicYear) return { error: `ไม่พบปีการศึกษา ${semester}/${year} ในระบบ กรุณาเพิ่มปีการศึกษาก่อน` };

    // 2. Parse Students (Starting row 10 - index 9)
    let importedCount = 0;
    const studentRows = rows.slice(9);

    for (const row of studentRows) {
      if (!row || row.length < 5) continue;
      
      const studentCode = row[4]?.toString().trim(); // เลขประจำตัว
      const fullName = row[7]?.toString().trim(); // ชื่อ-นามสกุล

      if (!studentCode || !fullName) continue;

      // Parse Prefix/Name/LastName
      let prefix = "";
      let remainingName = fullName;
      const prefixes = ["เด็กชาย", "เด็กหญิง", "นาย", "นางสาว"];
      
      for (const p of prefixes) {
        if (fullName.startsWith(p)) {
          prefix = p;
          remainingName = fullName.substring(p.length).trim();
          break;
        }
      }

      const nameParts = remainingName.split(/\s+/);
      const firstNameTh = nameParts[0] || "";
      const lastNameTh = nameParts.slice(1).join(" ") || "";

      // Set default password: Sdw<studentCode>c
      const defaultPassword = `Sdw${studentCode}c`;
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const prefixRecord = await prisma.prefix.upsert({
        where: { name: prefix || "ไม่ระบุ" },
        update: {},
        create: { name: prefix || "ไม่ระบุ" }
      });

      // Upsert Student
      const student = await prisma.student.upsert({
        where: { studentCode },
        update: {
          prefixId: prefixRecord.id,
          firstNameTh,
          lastNameTh,
          password: hashedPassword,
        },
        create: {
          studentCode,
          nationalId: `TEMP-${studentCode}`,
          prefixId: prefixRecord.id,
          firstNameTh,
          lastNameTh,
          password: hashedPassword,
        }
      });

      // Upsert Term Data
      await prisma.studentTermData.upsert({
        where: {
          // Note: We don't have a unique constraint on studentId + termId in our schema currently
          // but we should probably find and update or create.
          id: (await prisma.studentTermData.findFirst({
            where: { studentId: student.id, termId: academicYear.id }
          }))?.id || -1
        },
        update: {
          gradeLevel: gradeLevel || "ไม่ระบุ",
          roomNumber,
          studentNumber: parseInt(row[1]) || null
        },
        create: {
          studentId: student.id,
          termId: academicYear.id,
          gradeLevel: gradeLevel || "ไม่ระบุ",
          roomNumber,
          studentNumber: parseInt(row[1]) || null
        }
      });

      importedCount++;
    }

    await logActivity("IMPORT_STUDENTS", "งานวิชาการ", `นำเข้านักเรียนจาก Excel สำเร็จ: ${importedCount} คน (${gradeLevel}/${roomNumber})`);
    revalidatePath('/management/academic/students');
    
    return { success: true, count: importedCount, meta: { year, semester, gradeLevel, roomNumber } };
  } catch (error: any) {
    console.error('Import Error:', error);
    return { error: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล: " + error.message };
  }
}

export async function adminCreateStudent(formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.ACADEMIC);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const nationalId = formData.get("nationalId") as string;
  const studentCode = formData.get("studentCode") as string;
  const prefixId = formData.get("prefixId") ? parseInt(formData.get("prefixId") as string) : null;
  const firstNameTh = formData.get("firstNameTh") as string;
  const lastNameTh = formData.get("lastNameTh") as string;
  const genderId = formData.get("genderId") ? parseInt(formData.get("genderId") as string) : null;
  const birthdayVal = formData.get("dateOfBirth") as string;
  const gradeLevel = formData.get("gradeLevel") as string;
  const roomNumber = parseInt(formData.get("roomNumber") as string);
  const studentNumber = parseInt(formData.get("studentNumber") as string);
  const statusId = formData.get("statusId") ? parseInt(formData.get("statusId") as string) : null;

  try {
    const activeTerm = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!activeTerm) return { error: "ไม่พบปีการศึกษาที่เปิดใช้งาน" };

    // Set default password: Sdw<studentCode>c
    const defaultPassword = `Sdw${studentCode}c`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.student.create({
      data: {
        nationalId,
        studentCode,
        prefixId,
        firstNameTh,
        lastNameTh,
        genderId,
        password: hashedPassword,
        dateOfBirth: birthdayVal ? new Date(birthdayVal) : null,
        termData: {
          create: {
            gradeLevel,
            roomNumber,
            studentNumber: isNaN(studentNumber) ? null : studentNumber,
            termId: activeTerm.id,
            statusId: statusId
          }
        }
      }
    });

    await logActivity("CREATE_STUDENT", "งานวิชาการ", `เพิ่มนักเรียน: ${firstNameTh} ${lastNameTh} (${studentCode})`);
    revalidatePath('/management/academic/students');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลนักเรียน" };
  }
}

export async function adminUpdateStudent(id: number, formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.ACADEMIC);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const nationalId = formData.get("nationalId") as string;
  const studentCode = formData.get("studentCode") as string;
  const prefixId = formData.get("prefixId") ? parseInt(formData.get("prefixId") as string) : null;
  const firstNameTh = formData.get("firstNameTh") as string;
  const lastNameTh = formData.get("lastNameTh") as string;
  const genderId = formData.get("genderId") ? parseInt(formData.get("genderId") as string) : null;
  const birthdayVal = formData.get("dateOfBirth") as string;
  const gradeLevel = formData.get("gradeLevel") as string;
  const roomNumber = parseInt(formData.get("roomNumber") as string);
  const studentNumber = parseInt(formData.get("studentNumber") as string);
  const statusId = formData.get("statusId") ? parseInt(formData.get("statusId") as string) : null;

  try {
    const activeTerm = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!activeTerm) return { error: "ไม่พบปีการศึกษาที่เปิดใช้งาน" };

    await prisma.student.update({
      where: { id },
      data: {
        nationalId,
        studentCode,
        prefixId,
        firstNameTh,
        lastNameTh,
        genderId,
        dateOfBirth: birthdayVal ? new Date(birthdayVal) : null,
      }
    });

    // Update term data for active term
    const termData = await prisma.studentTermData.findFirst({
      where: { studentId: id, termId: activeTerm.id }
    });

    if (termData) {
      await prisma.studentTermData.update({
        where: { id: termData.id },
        data: {
          gradeLevel,
          roomNumber,
          studentNumber: isNaN(studentNumber) ? null : studentNumber,
          statusId,
        }
      });
    } else {
      await prisma.studentTermData.create({
        data: {
          studentId: id,
          termId: activeTerm.id,
          gradeLevel,
          roomNumber,
          studentNumber: isNaN(studentNumber) ? null : studentNumber,
          statusId,
        }
      });
    }

    await logActivity("UPDATE_STUDENT", "งานวิชาการ", `แก้ไขนักเรียน ID: ${id} (${firstNameTh} ${lastNameTh})`);
    revalidatePath('/management/academic/students');
    revalidatePath(`/management/academic/students/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
  }
}

export async function adminDeleteStudent(id: number) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.ACADEMIC);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  try {
    await prisma.student.delete({
      where: { id }
    });
    await logActivity("DELETE_STUDENT", "งานวิชาการ", `ลบนักเรียน ID: ${id}`);
    revalidatePath('/management/academic/students');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "ไม่สามารถลบข้อมูลนักเรียนได้" };
  }
}
