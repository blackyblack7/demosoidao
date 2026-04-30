'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';
import { DIVISION_NAMES } from '@/constants';
import { handleActionError } from '@/lib/errors';

export async function submitLeaveRequest(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return { error: "เฉพาะนักเรียนเท่านั้นที่มีสิทธิ์แจ้งขอออกนอกโรงเรียน" };
  }

  const leaveTypeId = formData.get("leaveTypeId") ? parseInt(formData.get("leaveTypeId") as string) : null;
  const reason = formData.get("reason") as string;
  const departureDate = formData.get("departureDate") as string;
  const departureTime = formData.get("departureTime") as string;
  const returnTime = formData.get("returnTime") as string;

  if (!reason || !departureDate || !departureTime) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const depDateTime = new Date(`${departureDate}T${departureTime}`);
  let retDateTime = null;
  if (returnTime) {
    retDateTime = new Date(`${departureDate}T${returnTime}`);
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: session.userId },
      include: {
        prefixRef: true,
        termData: { orderBy: { id: 'desc' }, take: 1 }
      }
    });

    if (!student || student.termData.length === 0) {
      return { error: "ไม่พบข้อมูลปีการศึกษาของนักเรียน กรุณาติดต่อฝ่ายทะเบียน" };
    }

    const request = await prisma.leaveRequest.create({
      data: {
        studentId: session.userId,
        reason,
        startDate: depDateTime,
        endDate: retDateTime || depDateTime,
        leaveTypeId,
        status: "PENDING",
        termId: student.termData[0].termId
      }
    });

    // Notify Student Affairs Staff
    const staff = await prisma.teacher.findMany({
      where: {
        divisions: {
          some: { divisionName: DIVISION_NAMES.STUDENT_AFFAIRS }
        }
      }
    });

    const studentName = `${student.prefixRef?.name || ''}${student.firstNameTh} ${student.lastNameTh}`;

    for (const s of staff) {
      await createNotification(
        s.id,
        "มีคำขอออกนอกโรงเรียนใหม่",
        `${studentName} ได้ส่งคำขอออกนอกโรงเรียน รอการยืนยันขั้นต้น`,
        `/v/${request.id}`
      );
    }

    revalidatePath('/sdservice/student-leave');
    return { success: true, id: request.id };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveLeaveRequest(id: number) {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') {
    return { error: "ไม่มีสิทธิ์ดำเนินการ" };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true, positionRef: true }
  });

  if (!teacher) return { error: "ไม่พบข้อมูลครู" };

  const request = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!request) return { error: "ไม่พบรายการ" };

  // Only งานกิจการนักเรียน or Admin can approve
  const isStudentAffairs = teacher.divisions.some(div => div.divisionName === DIVISION_NAMES.STUDENT_AFFAIRS) || teacher.isAdmin;
  if (!isStudentAffairs) return { error: "เฉพาะงานกิจการนักเรียนเท่านั้นที่สามารถอนุมัติได้" };
  if (request.status !== "PENDING") return { error: "รายการนี้ถูกดำเนินการไปแล้ว" };

  try {
    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        headApprovedById: teacher.id,
      }
    });
    revalidatePath('/sdservice/student-leave');
    revalidatePath(`/v/${request.id}`);
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}



export async function denyLeaveRequest(id: number, reason: string) {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true, positionRef: true }
  });

  if (!teacher) return { error: "ไม่พบข้อมูล" };

  const isLevelApprover = teacher.isAdmin || 
    teacher.divisions.some(div => div.divisionName === DIVISION_NAMES.STUDENT_AFFAIRS) ||
    (teacher.positionRef?.level ?? 0) >= 8;

  if (!isLevelApprover) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  try {
    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "DENIED",
        // Not saving denialReason since it's missing from DB schema: denialReason: reason
      }
    });
    
    revalidatePath('/sdservice/student-leave');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markStudentDeparted(id: number) {
  // Public action but we could track who clicked it if logged in
  const session = await getSession();
  
  try {
    const request = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!request) return { error: "ไม่พบรายการ" };
    if (request.status !== "APPROVED") return { error: "รายการยังไม่ได้รับการอนุมัติ" };

    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "DEPARTED",
        securityById: session?.role === 'TEACHER' ? session.userId : null,
        // departedAt: new Date() - departedAt doesn't exist either!
      }
    });

    revalidatePath(`/v/${id}`);
    return { success: true };
  } catch (error) {
    return { error: "เกิดข้อผิดพลาด" };
  }
}

export async function markStudentReturned(id: number) {
  const session = await getSession();
  
  try {
    const request = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!request) return { error: "ไม่พบรายการ" };
    if (request.status !== "DEPARTED") return { error: "นักเรียนยังไม่ได้ออกนอกโรงเรียน" };

    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "RETURNED",
        // returnedAt: new Date() - doesn't exist
      }
    });

    revalidatePath(`/v/${id}`);
    return { success: true };
  } catch (error) {
    return { error: "เกิดข้อผิดพลาด" };
  }
}
