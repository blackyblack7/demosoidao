'use server'

import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { GROUP_KEYS } from '@/constants';
import { logActivity } from '@/lib/logger';

export async function createDivision(formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const divisionName = formData.get("divisionName") as string;
  const groupId = parseInt(formData.get("groupId") as string);
  const headId = formData.get("headId") ? parseInt(formData.get("headId") as string) : null;

  if (!divisionName || isNaN(groupId)) {
    return { error: "ข้อมูลไม่ครบถ้วน" };
  }

  try {
    const division = await prisma.adminDivision.create({
      data: {
        divisionName,
        groupId,
        headId: isNaN(headId as number) ? null : headId
      }
    });

    await logActivity("CREATE_DIVISION", "งานบุคคล", `เพิ่มฝ่ายงาน: ${divisionName}`);
    revalidatePath('/management/personnel/divisions');
    revalidatePath('/management/personnel/teachers'); // Refresh forms that use divisions
    return { success: true, data: division };
  } catch (error: any) {
    return { error: error.message || "เกิดข้อผิดพลาดในการสร้างฝ่ายงาน" };
  }
}

export async function updateDivision(id: number, formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const divisionName = formData.get("divisionName") as string;
  const groupId = parseInt(formData.get("groupId") as string);
  const headId = formData.get("headId") ? parseInt(formData.get("headId") as string) : null;

  try {
    const division = await prisma.adminDivision.update({
      where: { id },
      data: {
        divisionName,
        groupId: isNaN(groupId) ? undefined : groupId,
        headId: isNaN(headId as number) ? null : headId
      }
    });

    await logActivity("UPDATE_DIVISION", "งานบุคคล", `แก้ไขฝ่ายงาน ID: ${id} เป็น ${divisionName}`);
    revalidatePath('/management/personnel/divisions');
    revalidatePath('/management/personnel/teachers');
    return { success: true, data: division };
  } catch (error: any) {
    return { error: error.message || "เกิดข้อผิดพลาดในการแก้ไข" };
  }
}

export async function deleteDivision(id: number) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  try {
    // Check if any teachers are assigned to this division
    const teacherCount = await prisma.teacher.count({
      where: {
        divisions: {
          some: { id }
        }
      }
    });

    if (teacherCount > 0) {
      return { error: `ไม่สามารถลบได้ เนื่องจากมีบุคลากร ${teacherCount} ท่านสังกัดอยู่ในงานนี้` };
    }

    await prisma.adminDivision.delete({
      where: { id }
    });

    await logActivity("DELETE_DIVISION", "งานบุคคล", `ลบฝ่ายงาน ID: ${id}`);
    revalidatePath('/management/personnel/divisions');
    revalidatePath('/management/personnel/teachers');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "เกิดข้อผิดพลาดในการลบ" };
  }
}

export async function updateAdminGroup(id: number, formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const headId = formData.get("headId") ? parseInt(formData.get("headId") as string) : null;

  try {
    await prisma.adminGroup.update({
      where: { id },
      data: {
        headId: isNaN(headId as number) ? null : headId
      }
    });

    revalidatePath('/management/personnel/divisions');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "เกิดข้อผิดพลาดในการแก้ไขกลุ่มบริหาร" };
  }
}
