'use server'

import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/logger';
import { handleActionError } from '@/lib/errors';

export async function adminCreateAcademicYear(formData: FormData) {
  const hasAccess = await checkAdminAccess(); // Default admin check (Super Admin based)
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const semester = parseInt(formData.get("semester") as string);
  const year = parseInt(formData.get("year") as string);

  if (isNaN(semester) || isNaN(year)) return { error: "ข้อมูลไม่ถูกต้อง" };

  try {
    await prisma.academicYear.create({
      data: {
        semester,
        year,
        isActive: false
      }
    });

    await logActivity("CREATE_ACADEMIC_YEAR", "ระบบกลาง", `เพิ่มปีการศึกษาใหม่: ${semester}/${year}`);
    revalidatePath('/management/academic/years');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function adminSetActiveYear(id: number) {
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  try {
    // 1. Deactivate all
    await prisma.academicYear.updateMany({
      data: { isActive: false }
    });

    // 2. Activate target
    const updated = await prisma.academicYear.update({
      where: { id },
      data: { isActive: true }
    });

    await logActivity("SET_ACTIVE_YEAR", "ระบบกลาง", `เปลี่ยนปีการศึกษาเปิดใช้งานเป็น: ${updated.semester}/${updated.year}`);
    
    revalidatePath('/management/academic/years');
    revalidatePath('/'); // Revalidate main routes that might use this
    revalidatePath('/sdservice');
    
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function adminDeleteAcademicYear(id: number) {
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  try {
    const year = await prisma.academicYear.findUnique({
       where: { id },
       include: {
         studentTermData: { take: 1 },
         homeroomAssignments: { take: 1 },
         enrollments: { take: 1 }
       }
    });

    if (year?.studentTermData.length || year?.homeroomAssignments.length || year?.enrollments.length) {
      return { error: "ไม่สามารถลบปีการศึกษาที่มีข้อมูลนักเรียนหรือการเรียนลงทะเบียนอยู่ได้" };
    }

    if (year?.isActive) {
      return { error: "ไม่สามารถลบปีการศึกษาที่กำลังเปิดใช้งานอยู่ได้" };
    }

    await prisma.academicYear.delete({ where: { id } });
    await logActivity("DELETE_ACADEMIC_YEAR", "ระบบกลาง", `ลบปีการศึกษา ID: ${id}`);
    
    revalidatePath('/management/academic/years');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
