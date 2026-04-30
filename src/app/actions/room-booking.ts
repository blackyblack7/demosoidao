'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';
import { DIVISION_NAMES } from '@/constants';
import { handleActionError } from '@/lib/errors';

// ─── Seed Rooms (run once) ─────────────────────────────────────────────────
export async function ensureRoomsSeeded() {
  const count = await prisma.room.count();
  if (count > 0) return;

  const rooms = [
    { name: 'หอประชุม', description: 'หอประชุมโรงเรียนสอยดาววิทยา', imageUrl: '/AudioVisualRoom/หอประชุม.jpg', capacity: 500 },
    { name: 'ห้องโสตทัศนศึกษา 1', description: 'ห้องโสตฯ 1 สำหรับการประชุมขนาดเล็ก', imageUrl: '/AudioVisualRoom/ห้องโสตทัศนศึกษา 1.jpg', capacity: 30 },
    { name: 'ห้องโสตทัศนศึกษา 2', description: 'ห้องโสตฯ 2 สำหรับการอบรม', imageUrl: '/AudioVisualRoom/ห้องโสตทัศนศึกษา 2.jpg', capacity: 50 },
    { name: 'ห้องโสตทัศนศึกษา 3', description: 'ห้องโสตฯ 3 สำหรับการนำเสนองาน', imageUrl: '/AudioVisualRoom/ห้องโสตทัศนศึกษา 3.jpg', capacity: 40 },
  ];

  await prisma.room.createMany({ data: rooms });
}

// ─── Get rooms ─────────────────────────────────────────────────────────────
export async function getRooms() {
  await ensureRoomsSeeded();
  return prisma.room.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } });
}

// ─── Get bookings for calendar ─────────────────────────────────────────────
export async function getBookingsByMonth(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  // Fetch bookings that overlap this month (start before month-end AND end after month-start)
  return prisma.roomBooking.findMany({
    where: {
      startTime: { lte: end },
      endTime: { gte: start },
      statusRef: { key: { not: 'DENIED' } },
    },
    include: {
      room: true,
      requester: { select: { prefixRef: { select: { name: true } }, firstName: true, lastName: true } },
      statusRef: true,
    },
    orderBy: { startTime: 'asc' },
  });
}

// ─── Submit booking ─────────────────────────────────────────────────────────
export async function submitRoomBooking(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') return { error: 'สิทธิ์การเข้าใช้งานไม่ถูกต้อง' };

  const roomId     = parseInt(formData.get('roomId') as string);
  const title      = formData.get('title') as string;
  const purpose    = formData.get('purpose') as string;
  const bookingOrg = formData.get('bookingOrg') as string;
  const startTime  = new Date(formData.get('startTime') as string);
  const endTime    = new Date(formData.get('endTime') as string);

  if (!title || !purpose || !bookingOrg || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
  }
  if (startTime >= endTime) return { error: 'เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น' };

  // Check for overlapping bookings
  const conflict = await prisma.roomBooking.findFirst({
    where: {
      roomId,
      statusRef: { key: { notIn: ['DENIED'] } },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    },
  });
  if (conflict) return { error: 'ห้องนี้ถูกจองไว้แล้วในช่วงเวลาดังกล่าว' };

  const equipLedScreen = formData.get('equipLedScreen') === 'on';
  const equipProjector = formData.get('equipProjector') === 'on';
  const equipSound     = formData.get('equipSound') === 'on';
  const equipMicCount  = parseInt(formData.get('equipMicCount') as string) || 0;
  const equipNotes     = formData.get('equipNotes') as string || null;

  try {
    const status = await prisma.bookingStatus.findUnique({ where: { key: 'PENDING' } });
    const booking = await prisma.roomBooking.create({
      data: {
        roomId, requesterId: session.userId,
        title, purpose, bookingOrg,
        startTime, endTime,
        equipLedScreen, equipProjector, equipSound, equipMicCount, equipNotes,
        statusId: status?.id,
      },
    });

    // Notify AV staff
    const avStaff = await prisma.teacher.findMany({
      where: { divisions: { some: { divisionName: DIVISION_NAMES.AUDIO_VISUAL } } },
    });
    for (const staff of avStaff) {
      await createNotification(
        staff.id,
        'คำขอจองห้องใหม่',
        `${session.name} ขอจอง ${booking.title} รอการพิจารณา`,
        `/management/academic/room-booking?status=pending`
      );
    }

    revalidatePath('/sdservice/room-booking');
    return { success: true, id: booking.id };
  } catch (error) {
    return handleActionError(error);
  }
}

// ─── Approve / Deny booking ─────────────────────────────────────────────────
export async function approveRoomBooking(
  id: number,
  decision: 'APPROVE' | 'DENY',
  deniedReason?: string
) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const booking = await prisma.roomBooking.findUnique({
    where: { id },
    include: { requester: true, room: true, statusRef: true },
  });
  if (!booking) return { error: 'ไม่พบรายการ' };

  const currentUser = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { positionRef: true, divisions: true },
  });
  if (!currentUser) return { error: 'Unauthorized' };

  const isAVStaff = currentUser.divisions.some(d => d.divisionName === DIVISION_NAMES.AUDIO_VISUAL) || currentUser.isAdmin;
  const isDeputy  = (currentUser.positionRef?.level ?? 0) >= 8 || currentUser.isAdmin;
  const isDirector = (currentUser.positionRef?.level === 10) || currentUser.isAdmin;

  let updateData: any = {};
  let nextStatusKey = booking.statusRef?.key;

  if (decision === 'DENY') {
    const status = await prisma.bookingStatus.findUnique({ where: { key: 'DENIED' } });
    updateData = { statusId: status?.id, deniedById: session.userId, deniedReason: deniedReason || '' };
    nextStatusKey = 'DENIED';
  } else {
    if (booking.statusRef?.key === 'PENDING') {
      if (!isAVStaff) return { error: 'เฉพาะเจ้าหน้าที่ฝ่ายโสตทัศนศึกษาเท่านั้น' };
      const status = await prisma.bookingStatus.findUnique({ where: { key: 'AV_APPROVED' } });
      updateData = { statusId: status?.id, avApprovedById: session.userId, avApprovedAt: new Date() };
      nextStatusKey = 'AV_APPROVED';
    } else if (booking.statusRef?.key === 'AV_APPROVED') {
      if (!isDeputy) return { error: 'เฉพาะรองผู้อำนวยการเท่านั้น' };
      const status = await prisma.bookingStatus.findUnique({ where: { key: 'DEPUTY_APPROVED' } });
      updateData = { statusId: status?.id, deputyApprovedById: session.userId, deputyApprovedAt: new Date() };
      nextStatusKey = 'DEPUTY_APPROVED';
    } else if (booking.statusRef?.key === 'DEPUTY_APPROVED') {
      if (!isDirector) return { error: 'เฉพาะผู้อำนวยการเท่านั้น' };
      const status = await prisma.bookingStatus.findUnique({ where: { key: 'APPROVED' } });
      updateData = { statusId: status?.id, directorApprovedById: session.userId, directorApprovedAt: new Date() };
      nextStatusKey = 'APPROVED';
    } else {
      return { error: 'สถานะไม่ถูกต้องสำหรับการอนุมัติ' };
    }
  }

  try {
    await prisma.roomBooking.update({ where: { id }, data: updateData });

    const bookingLink = `/sdservice/room-booking`;
    const adminLink   = `/management/academic/room-booking`;

    if (nextStatusKey === 'DENIED') {
      await createNotification(booking.requesterId, 'คำขอจองห้องถูกปฏิเสธ', `คำขอจอง "${booking.title}" ถูกปฏิเสธ: ${deniedReason}`, bookingLink);
    } else if (nextStatusKey === 'AV_APPROVED') {
      // Notify deputy directors
      const deputies = await prisma.teacher.findMany({ where: { positionRef: { level: { gte: 8 } } } });
      for (const d of deputies) {
        await createNotification(d.id, 'คำขอจองห้องรออนุมัติ (รอง ผอ.)', `คำขอจอง "${booking.title}" ผ่านฝ่ายโสตฯ แล้ว`, adminLink);
      }
    } else if (nextStatusKey === 'DEPUTY_APPROVED') {
      // Notify director
      const directors = await prisma.teacher.findMany({ where: { positionRef: { level: 10 } } });
      for (const d of directors) {
        await createNotification(d.id, 'คำขอจองห้องรออนุมัติ (ผอ.)', `คำขอจอง "${booking.title}" รอการอนุมัติสุดท้าย`, adminLink);
      }
    } else if (nextStatusKey === 'APPROVED') {
      await createNotification(booking.requesterId, 'คำขอจองห้องได้รับการอนุมัติแล้ว', `คำขอจอง "${booking.title}" ได้รับการอนุมัติครบแล้ว`, bookingLink);
    }

    revalidatePath('/sdservice/room-booking');
    revalidatePath('/management/academic/room-booking');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

// ─── Cancel booking (by requester) ─────────────────────────────────────────
export async function cancelRoomBooking(id: number) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const booking = await prisma.roomBooking.findUnique({ where: { id }, include: { statusRef: true } });
  if (!booking) return { error: 'ไม่พบรายการ' };
  if (booking.requesterId !== session.userId && !session.isAdmin) return { error: 'ไม่มีสิทธิ์ยกเลิก' };
  if (booking.statusRef?.key === 'APPROVED') return { error: 'ไม่สามารถยกเลิกคำขอที่อนุมัติแล้ว' };

  try {
    const status = await prisma.bookingStatus.findUnique({ where: { key: 'DENIED' } });
    await prisma.roomBooking.update({ where: { id }, data: { statusId: status?.id, deniedReason: 'ยกเลิกโดยผู้จอง' } });
    revalidatePath('/sdservice/room-booking');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
// ─── Delete booking (AV staff or admin) ────────────────────────────────────
export async function deleteRoomBooking(id: number) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const currentUser = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true },
  });
  if (!currentUser) return { error: 'Unauthorized' };

  const isAVStaff = currentUser.divisions.some(d => d.divisionName === DIVISION_NAMES.AUDIO_VISUAL) || currentUser.isAdmin;
  if (!isAVStaff) return { error: 'เฉพาะเจ้าหน้าที่ฝ่ายโสตทัศนศึกษาเท่านั้น' };

  try {
    await prisma.roomBooking.delete({ where: { id } });
    revalidatePath('/management/academic/room-booking');
    revalidatePath('/sdservice/room-booking');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

// ─── Update booking details (AV staff or admin) ─────────────────────────────
export async function updateRoomBooking(id: number, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const currentUser = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true },
  });
  if (!currentUser) return { error: 'Unauthorized' };

  const isAVStaff = currentUser.divisions.some(d => d.divisionName === DIVISION_NAMES.AUDIO_VISUAL) || currentUser.isAdmin;
  if (!isAVStaff) return { error: 'เฉพาะเจ้าหน้าที่ฝ่ายโสตทัศนศึกษาเท่านั้น' };

  const title      = formData.get('title') as string;
  const purpose    = formData.get('purpose') as string;
  const bookingOrg = formData.get('bookingOrg') as string;
  const roomId     = parseInt(formData.get('roomId') as string);
  const startTime  = new Date(formData.get('startTime') as string);
  const endTime    = new Date(formData.get('endTime') as string);
  const equipLedScreen = formData.get('equipLedScreen') === 'on';
  const equipProjector = formData.get('equipProjector') === 'on';
  const equipSound     = formData.get('equipSound') === 'on';
  const equipMicCount  = parseInt(formData.get('equipMicCount') as string) || 0;
  const equipNotes     = (formData.get('equipNotes') as string) || null;

  if (!title || !purpose || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
  }
  if (startTime >= endTime) return { error: 'เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น' };

  // Check conflict (exclude self)
  const conflict = await prisma.roomBooking.findFirst({
    where: {
      id: { not: id },
      roomId,
      statusRef: { key: { notIn: ['DENIED'] } },
      OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
    },
  });
  if (conflict) return { error: 'ห้องนี้ถูกจองไว้แล้วในช่วงเวลาดังกล่าว' };

  try {
    await prisma.roomBooking.update({
      where: { id },
      data: { title, purpose, bookingOrg, roomId, startTime, endTime, equipLedScreen, equipProjector, equipSound, equipMicCount, equipNotes },
    });
    revalidatePath('/management/academic/room-booking');
    revalidatePath('/sdservice/room-booking');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
