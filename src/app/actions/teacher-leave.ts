'use server'

import { prisma } from '@/lib/prisma';
import { getSession, checkAdminAccess } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';
import { GROUP_KEYS, DIVISION_NAMES } from '@/constants';
import { handleActionError } from '@/lib/errors';

// Helper to determine Fiscal Year (Thai Fiscal Year starts Oct 1st)
export async function getFiscalYear(date: Date = new Date()): Promise<number> {
  const month = date.getMonth(); // 0-indexed (0 = Jan, 9 = Oct)
  const year = date.getFullYear() + 543; // Buddhist Year
  return month >= 9 ? year + 1 : year;
}

export async function getTeacherLeaveStats(teacherId: number, fiscalYear: number) {
  const startDate = new Date(fiscalYear - 544, 9, 1); // Oct 1st of previous year - 1
  const endDate = new Date(fiscalYear - 543, 8, 30, 23, 59, 59); // Sept 30th

  const leaves = await prisma.teacherLeave.findMany({
    where: {
      teacherId,
      status: "APPROVED",
      startDate: { gte: startDate, lte: endDate }
    },
    include: { leaveTypeRef: true }
  });

  const totals = {
    SICK: 0,
    PERSONAL: 0,
    VACATION: 0,
    MATERNITY: 0,
    RELIGIOUS: 0,
    MILITARY: 0,
    OTHER: 0
  };

  leaves.forEach(l => {
    // Try to use leaveTypeRef name if available, fallback to string field
    const typeName = l.leaveTypeRef?.name || '';
    
    if (typeName.includes('ป่วย')) totals.SICK += Number(l.totalDays);
    else if (typeName.includes('กิจ')) totals.PERSONAL += Number(l.totalDays);
    else if (typeName.includes('พักผ่อน')) totals.VACATION += Number(l.totalDays);
    else if (typeName.includes('คลอด')) totals.MATERNITY += Number(l.totalDays);
    else if (typeName.includes('อุปสมบท')) totals.RELIGIOUS += Number(l.totalDays);
    else totals.OTHER += Number(l.totalDays);
  });

  // Get matching last leave info
  const lastLeave = await prisma.teacherLeave.findFirst({
    where: { teacherId, status: "APPROVED" },
    include: { leaveTypeRef: true },
    orderBy: { startDate: 'desc' }
  });

  return { totals, lastLeave };
}

export async function submitTeacherLeaveRequest(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') return { error: "สิทธิ์การเข้าใช้งานไม่ถูกต้อง" };

  const leaveTypeId = formData.get("leaveTypeId") ? parseInt(formData.get("leaveTypeId") as string) : null;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const totalDays = parseInt(formData.get("totalDays") as string, 10);
  const reason = formData.get("reason") as string;

  const fiscalYear = await getFiscalYear(startDate);

  try {
    // Automated Stats
    const stats = await getTeacherLeaveStats(session.userId, fiscalYear);
    
    const request = await prisma.teacherLeave.create({
      data: {
        teacherId: session.userId,
        leaveTypeId,
        startDate,
        endDate,
        totalDays,
        reason,
        status: "PENDING"
      }
    });

    // Notify Personnel Staff
    const personnelStaff = await prisma.teacher.findMany({
      where: {
        divisions: { some: { group: { groupKey: GROUP_KEYS.PERSONNEL } } }
      }
    });

    for (const staff of personnelStaff) {
      await createNotification(
        staff.id,
        "คำขอลาบุคลากรใหม่",
        `มีคำขอลาจาก ${session.name} รอการตรวจสอบสถิติ`,
        `/management/personnel/leave/${request.id}`
      );
    }

    revalidatePath('/sdservice/teacher-leave');
    return { success: true, id: request.id };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveTeacherLeave(id: number, decision: "VERIFY" | "APPROVE" | "DENY", reason?: string, formData?: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const request = await prisma.teacherLeave.findUnique({
    where: { id },
    include: { teacher: true, leaveTypeRef: true }
  });

  if (!request) return { error: "ไม่พบรายการ" };

  let nextStatus = request.status;
  let updateData: any = {};

  if (decision === "DENY") {
    nextStatus = "DENIED";
    updateData = {
      status: nextStatus,
      deniedById: session.userId,
    };
  } else {
    // Multi-stage Approval logic
    if (request.status === "PENDING") {
      // Step 1: Personnel Staff verify statistics
      const isPersonnel = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
      if (!isPersonnel) return { error: "เฉพาะเจ้าหน้าที่งานบุคคลเท่านั้นที่สามารถตรวจสอบสถิติได้" };
      
      const previousLeavesCount = formData?.get("previousLeavesCount") ? parseInt(formData.get("previousLeavesCount") as string) : 0;
      const lastLeaveInfo = formData?.get("lastLeaveInfo") as string;

      nextStatus = "VERIFIED";
      updateData = {
        status: nextStatus,
        staffVerifiedById: session.userId,
        previousLeavesCount,
        lastLeaveInfo
      };
    } else if (request.status === "VERIFIED") {
      // Step 2: Head of Personnel Administration
      // Find who is the head of the personnel group
      const personnelDivs = await prisma.adminDivision.findMany({
        where: { group: { groupKey: GROUP_KEYS.PERSONNEL } },
        select: { headId: true }
      });
      const headIds = personnelDivs.map(d => d.headId).filter(Boolean);
      
      const isHeadOfPersonnel = headIds.includes(session.userId) || session.isAdmin;
      if (!isHeadOfPersonnel) return { error: "เฉพาะหัวหน้ากลุ่มบริหารงานบุคคลเท่านั้นที่สามารถพิจารณาขั้นตอนนี้ได้" };
      
      nextStatus = "HEAD_APPROVED";
      updateData = {
        status: nextStatus,
        headApprovedById: session.userId,
      };
    } else if (request.status === "HEAD_APPROVED") {
      // Step 3: Deputy Director
      const currentUser = await prisma.teacher.findUnique({ 
        where: { id: session.userId },
        include: { positionRef: true }
      });
      const isDeputy = (currentUser?.positionRef?.level ?? 0) >= 8 || session.isAdmin;
      
      if (!isDeputy) return { error: "เฉพาะรองผู้อำนวยการเท่านั้นที่สามารถตรวจสอบขั้นตอนนี้ได้" };
      
      nextStatus = "DEPUTY_APPROVED";
      updateData = {
        status: nextStatus,
        deputyApprovedById: session.userId,
      };
    } else if (request.status === "DEPUTY_APPROVED") {
      // Step 4: Director
      const currentUser = await prisma.teacher.findUnique({ 
        where: { id: session.userId },
        include: { positionRef: true }
      });
      const isDirector = (currentUser?.positionRef?.level === 10) || session.isAdmin;
      
      if (!isDirector) return { error: "เฉพาะผู้อำนวยการเท่านั้นที่สามารถอนุมัติขั้นสุดท้ายได้" };
      
      nextStatus = "APPROVED";
      updateData = {
        status: nextStatus,
        directorApprovedById: session.userId,
      };
    }
  }

  try {
    await prisma.teacherLeave.update({
      where: { id },
      data: updateData
    });

    // --- NOTIFICATIONS FOR NEXT STEPS ---
    const adminLink = `/management/personnel/leave/${request.id}`;
    const userLink = `/sdservice/teacher-leave/${request.id}`;

    if (decision === "DENY") {
      // Notify Applicant
      await createNotification(
        request.teacherId,
        "ใบลาถูกปฏิเสธ",
        `คำขอลาประเภท ${request.leaveTypeRef?.name || ''} ถูกปฏิเสธเหตุผล: ${reason || 'ไม่ได้ระบุ'}`,
        userLink
      );
    } else {
      if (nextStatus === "VERIFIED") {
        // Notify Head of Divisions
        const applicantWithDivs = await prisma.teacher.findUnique({
          where: { id: request.teacherId },
          include: { divisions: { include: { head: true } } }
        });
        
        const heads = applicantWithDivs?.divisions
          .map(d => d.head)
          .filter((h): h is NonNullable<typeof h> => h !== null) || [];

        for (const head of heads) {
          await createNotification(
            head.id,
            "คำขอลาพิจารณา (หัวหน้าฝ่าย)",
            `คำขอลาของ ${request.teacher.firstName} ได้รับการตรวจสอบสถิติแล้ว โปรดพิจารณา`,
            adminLink
          );
        }
      } else if (nextStatus === "HEAD_APPROVED") {
        // Notify Deputy Directors
        const deputies = await prisma.teacher.findMany({
          where: {
            divisions: { some: { group: { groupKey: GROUP_KEYS.PERSONNEL } } }
          }
        });
        for (const dep of deputies) {
          await createNotification(
            dep.id,
            "คำขอลาตรวจสอบ (รอง ผอ.)",
            `คำขอลาของ ${request.teacher.firstName} ผ่านการพิจารณาจากหัวหน้าฝ่ายแล้ว`,
            adminLink
          );
        }
      } else if (nextStatus === "DEPUTY_APPROVED") {
        // Notify Director (Admin users)
        const admins = await prisma.teacher.findMany({ where: { isAdmin: true } });
        for (const admin of admins) {
          await createNotification(
            admin.id,
            "คำขอลาอนุมัติ (ผู้อำนวยการ)",
            `คำขอลาของ ${request.teacher.firstName} รอการอนุมัติขั้นสุดท้าย`,
            adminLink
          );
        }
      } else if (nextStatus === "APPROVED") {
        // Notify Applicant
        await createNotification(
          request.teacherId,
          "ใบลาได้รับการอนุมัติแล้ว",
          `คำขอลาประเภท ${request.leaveTypeRef?.name || ''} ได้รับการอนุมัติครบทุกขั้นตอนแล้ว`,
          userLink
        );
      }
    }

    revalidatePath('/sdservice/teacher-leave');
    revalidatePath('/management/personnel/leave');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
