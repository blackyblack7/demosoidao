'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/logger';

export async function toggleServiceMaintenance(serviceKey: string, isMaintenance: boolean) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'TEACHER') {
      return { error: "ไม่มีสิทธิ์ดำเนินการ" };
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: session.userId }
    });

    if (!teacher || !teacher.isAdmin) {
      return { error: "ไม่มีสิทธิ์ดำเนินการเฉพาะผู้ดูแลระบบเท่านั้น" };
    }
    
    await prisma.systemService.upsert({
      where: { serviceKey },
      update: { isUnderMaintenance: isMaintenance },
      create: { 
        serviceKey, 
        name: serviceKey, 
        isUnderMaintenance: isMaintenance 
      }
    });

    await logActivity(
      "TOGGLE_MAINTENANCE", 
      "ระบบส่วนกลาง", 
      `${isMaintenance ? 'เปิด' : 'ปิด'}โหมดซ่อมบำรุงสำหรับ: ${serviceKey}`
    );

    revalidatePath('/sdservice');
    revalidatePath('/management/systems');
    
    return { success: true };
  } catch (error: any) {
    console.error('[toggleServiceMaintenance] Error:', error);
    return { error: error.message || "เกิดข้อผิดพลาดภายในระบบ" };
  }
}

export async function getServiceStatuses() {
  try {
    return await prisma.systemService.findMany();
  } catch (error) {
    console.error('[getServiceStatuses] Error:', error);
    return [];
  }
}
