'use server'

import { cookies } from 'next/headers';
import { encrypt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/constants';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export async function login(prevState: unknown, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'กรุณากรอก Username และ Password' };
  }

  // ─── Try Teacher first ────────────────────────────────────────────────────
  const teacher = await prisma.teacher.findFirst({
    where: {
      OR: [{ username }, { nationalId: username }],
    },
    include: {
      divisions: true,
      positionRef: true,
      prefixRef: true,
    }
  });

  if (teacher) {
    // Guard: password may be null for accounts created without setting one
    if (!teacher.password) {
      return { error: 'บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ' };
    }

    const isValid = await bcrypt.compare(password, teacher.password);
    if (!isValid) return { error: 'รหัสผ่านไม่ถูกต้อง' };

    const isExecutive = (teacher.positionRef?.level ?? 0) >= 8;
    const hasManagementAccess = teacher.isAdmin || isExecutive || (teacher.divisions.length > 0);

    const displayName = teacher.prefixRef 
      ? `${teacher.prefixRef.name}${teacher.firstName} ${teacher.lastName}`
      : `${teacher.firstName} ${teacher.lastName}`;

    const token = await encrypt({
      userId: teacher.id,
      nationalId: teacher.nationalId ?? '',
      role: 'TEACHER',
      name: displayName,
      isAdmin: teacher.isAdmin,
      hasManagementAccess,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true };
  }

  // ─── Try Student (login with nationalId or studentCode) ──────────────────
  const student = await prisma.student.findFirst({
    where: {
      OR: [{ nationalId: username }, { studentCode: username }],
    },
    include: {
      prefixRef: true,
      termData: {
        orderBy: { id: 'desc' },
        take: 1,
      },
    },
  });

  if (!student) return { error: 'ไม่พบผู้ใช้นี้ในระบบ' };

  const defaultPassword = `Sdw${student.studentCode}c`;
  let isValid = false;

  if (student.password) {
    isValid = await bcrypt.compare(password, student.password);
  }

  // Fallback to default password if not valid or not set
  if (!isValid && password === defaultPassword) {
    isValid = true;
  }

  if (!isValid) return { error: 'รหัสผ่านไม่ถูกต้อง' };

  const latestTerm = student.termData[0];
  const token = await encrypt({
    userId: student.id,
    nationalId: student.nationalId,
    role: 'STUDENT',
    name: `${student.prefixRef?.name || ''}${student.firstNameTh} ${student.lastNameTh}`,
    gradeLevel: latestTerm?.gradeLevel,
    roomNumber: latestTerm?.roomNumber,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
