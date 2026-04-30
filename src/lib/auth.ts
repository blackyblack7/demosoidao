import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/types';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  JWT_ALGORITHM,
  JWT_EXPIRY,
} from '@/constants';

// Throw at module load time so misconfiguration is caught immediately
const secretEnv = process.env.JWT_SECRET;
if (!secretEnv && process.env.NODE_ENV === 'production') {
  throw new Error('[auth] JWT_SECRET environment variable is not set. Server cannot start safely.');
}
const secretKey = secretEnv ?? 'soidao_dev_secret_DO_NOT_USE_IN_PROD';
const key = new TextEncoder().encode(secretKey);

// Re-export so callers don't need to import from @/types separately
export type { SessionPayload };

export async function encrypt(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: [JWT_ALGORITHM],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * @deprecated Prefer `requireGroupAdmin(groupKey)` from `@/lib/rbac` for new code.
 * Kept for backward compatibility with existing server actions.
 */
export async function checkAdminAccess(targetGroupKey?: string): Promise<boolean> {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') return false;

  const { prisma } = await import('@/lib/prisma');
  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: {
      positionRef: true,
      divisions: {
        include: { group: true },
      },
    },
  });

  if (!teacher) return false;
  
  // Primary check: isAdmin flag or Executive Level (Level 10 = Director/Deputy)
  if (teacher.isAdmin || (teacher.positionRef?.level ?? 0) >= 10) return true;

  if (targetGroupKey) {
    return teacher.divisions.some(div => div.group?.groupKey === targetGroupKey);
  }

  return false;
}
