/**
 * Role-Based Access Control (RBAC) library.
 * Replaces ad-hoc permission checks scattered across server actions.
 *
 * Usage:
 *   const session = await requireAuth();
 *   const session = await requireRole(['TEACHER']);
 *   await requireDivision('งานกิจการนักเรียน');
 *   await requireGroupAdmin('กลุ่มบริหารงานบุคคล');
 */

import { getSession } from './auth';
import { prisma } from './prisma';
import { ForbiddenError, UnauthorizedError } from './errors';
import type { Role, SessionPayload } from '@/types';

/**
 * Require any authenticated user.
 * Throws UnauthorizedError if not logged in.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session as SessionPayload;
}

/**
 * Require user with a specific role.
 * Throws UnauthorizedError if not logged in, ForbiddenError if wrong role.
 */
export async function requireRole(roles: Role[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!roles.includes(session.role as Role)) {
    throw new ForbiddenError(`เฉพาะ ${roles.join(' หรือ ')} เท่านั้นที่มีสิทธิ์`);
  }
  return session;
}

/**
 * Require teacher who belongs to a specific AdminDivision.
 * Throws ForbiddenError if not in division (unless isAdmin === true).
 */
export async function requireDivision(divisionName: string): Promise<SessionPayload> {
  const session = await requireRole(['TEACHER']);

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
    select: {
      isAdmin: true,
      divisions: { select: { divisionName: true } },
    },
  });

  if (!teacher) throw new ForbiddenError();
  if (teacher.isAdmin) return session; // Super Admin bypasses division check

  const inDivision = teacher.divisions.some(d => d.divisionName === divisionName);
  if (!inDivision) {
    throw new ForbiddenError(`เฉพาะสมาชิก "${divisionName}" เท่านั้นที่มีสิทธิ์`);
  }

  return session;
}

/**
 * Require teacher who is an admin of a specific AdminGroup (by groupKey).
 * This replaces the unsafe session.name.includes() pattern.
 */
export async function requireGroupAdmin(groupKey: string): Promise<SessionPayload> {
  const session = await requireRole(['TEACHER']);

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
    select: {
      isAdmin: true,
      divisions: {
        select: {
          group: { select: { groupKey: true } },
        },
      },
    },
  });

  if (!teacher) throw new ForbiddenError();
  if (teacher.isAdmin) return session; // Super Admin bypasses

  const inGroup = teacher.divisions.some(d => d.group?.groupKey === groupKey);
  if (!inGroup) {
    throw new ForbiddenError(`เฉพาะผู้ดูแล "${groupKey}" เท่านั้นที่มีสิทธิ์`);
  }

  return session;
}

/**
 * Require teacher who is a Super Admin (isAdmin === true).
 */
export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await requireRole(['TEACHER']);

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
    select: { isAdmin: true },
  });

  if (session.userId !== 1 && !teacher?.isAdmin) {
    throw new ForbiddenError('เฉพาะ Super Admin เท่านั้นที่มีสิทธิ์');
  }

  return session;
}
