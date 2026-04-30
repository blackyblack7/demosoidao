'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createNotification(userId: number, title: string, message: string, link?: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message: link ? `${message} | Link: ${link}` : message,
        type: "SYSTEM"
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { error: 'Failed to create notification' };
  }
}

export async function getNotifications() {
  const session = await getSession();
  if (!session) return [];

  try {
    return await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function markAsRead(id: number) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.notification.update({
      where: { id, userId: session.userId },
      data: { isRead: true }
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update notification' };
  }
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true }
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update notifications' };
  }
}

export async function deleteNotification(id: number) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.notification.delete({
      where: { id, userId: session.userId }
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete notification' };
  }
}

export async function deleteAllNotifications() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.notification.deleteMany({
      where: { userId: session.userId }
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete notifications' };
  }
}
