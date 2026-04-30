import { prisma } from './prisma';
import { getSession } from './auth';
import { getActiveAcademicYear } from './academic';

export async function logActivity(
  action: string,
  module: string,
  details: string | null = null
) {
  try {
    const session = await getSession();
    const activeYear = await getActiveAcademicYear();

    if (!session) {
      console.warn('Logging activity without an active session.');
    }

    await prisma.auditLog.create({
      data: {
        action,
        module,
        details,
        actorId: session?.userId || null,
        academicYearId: activeYear?.id || null,
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
