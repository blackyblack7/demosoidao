"use server";

import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";
import { GROUP_KEYS } from "@/constants";

export async function bulkPromoteStudents(formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.ACADEMIC);
  if (!hasAccess) return { success: false, error: "ไม่มีสิทธิ์ดำเนินการ" };

  const fromTermId = parseInt(formData.get("fromTermId") as string);
  const toTermId = parseInt(formData.get("toTermId") as string);

  if (isNaN(fromTermId) || isNaN(toTermId)) {
    return { success: false, error: "กรุณาระบุปีการศึกษาต้นทางและปลายทางให้ถูกต้อง" };
  }

  if (fromTermId === toTermId) {
    return { success: false, error: "ปีการศึกษาต้นทางและปลายทางต้องไม่เป็นปีเดียวกัน" };
  }

  try {
    // 0. Get Status IDs
    const [studyingStatus, graduatedStatus] = await Promise.all([
      prisma.studentStatus.upsert({
        where: { name: "กำลังศึกษา" },
        update: {},
        create: { name: "กำลังศึกษา" }
      }),
      prisma.studentStatus.upsert({
        where: { name: "จบการศึกษา" },
        update: {},
        create: { name: "จบการศึกษา" }
      })
    ]);

    // 1. ดึงข้อมูลนักเรียนทั้งหมดในเทอมต้นทางที่มีสถานะ "กำลังศึกษา"
    const currentStudents = await prisma.studentTermData.findMany({
      where: {
        termId: fromTermId,
        statusId: studyingStatus.id,
      }
    });

    if (currentStudents.length === 0) {
      return { success: false, error: "ไม่พบข้อมูลนักเรียนที่กำลังศึกษาในเทอมต้นทางที่เลือก" };
    }

    let promotedCount = 0;
    let graduatedCount = 0;
    let skippedCount = 0;

    for (const student of currentStudents) {
      let nextGradeLevel = student.gradeLevel;
      let shouldPromote = true;

      // ลอจิกการเลื่อนชั้น (ขยับ ม.1->ม.2, ม.4->ม.5 ฯลฯ)
      const gradeMatch = student.gradeLevel.match(/ม\.(\d+)/);
      if (gradeMatch) {
        const currentYear = parseInt(gradeMatch[1]);
        if (currentYear === 3 || currentYear === 6) {
          // จบการศึกษา ม.3 และ ม.6 -> ไม่ออโต้โปรโมท (ต้องมารายงานตัวใหม่หรือพ้นสภาพ)
          shouldPromote = false;
          graduatedCount++;
          
          // Optionally: Update their old term status to "จบการศึกษา"
          await prisma.studentTermData.update({
             where: { id: student.id },
             data: { statusId: graduatedStatus.id }
          });
        } else {
          nextGradeLevel = `ม.${currentYear + 1}`;
        }
      }

      if (shouldPromote) {
        // ตรวจสอบว่ามีข้อมูลในเทอมปลายทางแล้วหรือยัง
        const existingInTarget = await prisma.studentTermData.findFirst({
          where: {
            studentId: student.studentId,
            termId: toTermId
          }
        });

        if (!existingInTarget) {
          await prisma.studentTermData.create({
            data: {
              studentId: student.studentId,
              termId: toTermId,
              gradeLevel: nextGradeLevel,
              roomNumber: student.roomNumber, // ห้องเดิมตามที่ User แจ้ง
              studentNumber: student.studentNumber,
              statusId: studyingStatus.id
            }
          });
          promotedCount++;
        } else {
          skippedCount++; // มีข้อมูลอยู่แล้ว
        }
      }
    }

    await logActivity(
      "BULK_PROMOTE", 
      "งานวิชาการ", 
      `เลื่อนชั้นนักเรียนจากเทอม ${fromTermId} ไป ${toTermId} สำเร็จ ${promotedCount} คน (จบการศึกษา ${graduatedCount} คน)`
    );

    revalidatePath("/management/academic/students");
    
    return { 
      success: true, 
      message: `เลื่อนชั้นสำเร็จ ${promotedCount} คน | จบการศึกษา ม.3/ม.6: ${graduatedCount} คน | ข้าม(มีข้อมูลแล้ว): ${skippedCount} คน` 
    };

  } catch (error: any) {
    console.error("Promotion Error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการเลื่อนชั้น: " + error.message };
  }
}
