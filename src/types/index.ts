/**
 * Shared TypeScript types for Soidao Wittaya School application.
 * Import these instead of repeating inline types or using `any`.
 */

// ─── Roles ────────────────────────────────────────────────────────────────────
export type Role = 'TEACHER' | 'STUDENT';

// ─── Session ──────────────────────────────────────────────────────────────────
export interface SessionPayload {
  userId: number;
  nationalId: string;
  role: Role;
  name: string;
  isAdmin?: boolean;
  hasManagementAccess?: boolean;
  gradeLevel?: string;
  roomNumber?: number;
}

// ─── Server Action Results ────────────────────────────────────────────────────
export type ActionResult<T = any> = {
  success?: boolean;
  error?: string;
  data?: T;
  [key: string]: any;
};

export type ActionResultWithToken = ActionResult;
export type ActionResultWithId   = ActionResult;

// ─── Leave Status ─────────────────────────────────────────────────────────────
export type StudentLeaveStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DENIED'
  | 'DEPARTED'
  | 'RETURNED';

export type TeacherLeaveStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'HEAD_APPROVED'
  | 'DEPUTY_APPROVED'
  | 'APPROVED'
  | 'DENIED';

// ─── Leave Types ──────────────────────────────────────────────────────────────
export type TeacherLeaveType =
  | 'SICK'
  | 'PERSONAL'
  | 'VACATION'
  | 'MATERNITY'
  | 'RELIGIOUS'
  | 'MILITARY'
  | 'OTHER';
