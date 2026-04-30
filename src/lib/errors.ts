/**
 * Centralized error handling for Server Actions.
 * Use handleActionError() in every catch block instead of
 * duplicating `error.message` extraction with `any` casts.
 */

import type { ActionResult } from '@/types';

/**
 * Converts an unknown error into a standardized ActionResult error.
 * Prevents accidentally leaking internal stack traces in production.
 */
export function handleActionError(error: unknown): { error: string } {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Action Error]', error);
  }

  if (error instanceof Error) {
    // Prisma unique constraint violations
    if (error.message.includes('Unique constraint')) {
      return { error: 'ข้อมูลนี้มีอยู่ในระบบแล้ว' };
    }
    // Prisma record not found
    if (error.message.includes('Record to update not found')) {
      return { error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' };
    }
    return { error: error.message };
  }

  return { error: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง' };
}

/**
 * Guards: throws if session is null/undefined.
 * Use at the top of server actions that require authentication.
 */
export class UnauthorizedError extends Error {
  constructor(message = 'กรุณาเข้าสู่ระบบก่อนดำเนินการ') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'ไม่มีสิทธิ์ดำเนินการนี้') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(resource = 'ข้อมูล') {
    super(`ไม่พบ${resource}ที่ต้องการ`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
