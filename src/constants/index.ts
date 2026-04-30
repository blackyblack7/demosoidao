/**
 * Application-wide constants for Soidao Wittaya School.
 * Centralizes magic strings to prevent typos and inconsistency.
 */

// ─── Admin Groups (ตรงกับ AdminGroup.groupKey ใน DB) ──────────────────────────
export const GROUP_KEYS = {
  ACADEMIC:  'กลุ่มบริหารงานวิชาการ',
  PERSONNEL: 'กลุ่มบริหารงานบุคคล',
  BUDGET:    'กลุ่มบริหารงานงบประมาณและทรัพย์สิน',
  GENERAL:   'กลุ่มบริหารงานทั่วไป',
} as const;

// ─── Division Names (ตรงกับ AdminDivision.divisionName ใน DB) ─────────────────
export const DIVISION_NAMES = {
  STUDENT_AFFAIRS: 'งานกิจการนักเรียน',
  PERSONNEL_WORK:  'งานบุคลากร',
  AUDIO_VISUAL:    'งานโสตทัศนศึกษา',
  BUILDINGS:       'งานอาคารสถานที่และสภาพแวดล้อม',
  FINANCE:         'งานการเงิน',
  SUPPLIES:        'งานพัสดุและสินทรัพย์',
  PLANNING:        'งานแผนและงบประมาณ',
  NETWORKING:      'งานประสานงานและพัฒนาเครือข่ายการศึกษา',
  PR:              'งานประชาสัมพันธ์และประสานงานชุมชน',
  HEALTH:          'งานบริการและส่งเสริมสุขภาพนักเรียน',
  BANK:            'งานธนาคารโรงเรียน',
  OFFICE:          'งานธุรการและสารบรรณกลาง',
} as const;

// Note: TEACHER_POSITIONS and TEACHER_ACADEMIC_STANDINGS are now managed via DB (Prefix, TeacherPosition, AcademicStanding tables)

// ─── Teacher Leave Types (ตรงกับ TeacherLeave.leaveType ใน DB) ────────────────
export const TEACHER_LEAVE_TYPE_LABELS: Record<string, string> = {
  SICK:      'ลาป่วย',
  PERSONAL:  'ลากิจ',
  VACATION:  'ลาพักผ่อน',
  MATERNITY: 'ลาคลอด',
  RELIGIOUS: 'ลาบวช',
  MILITARY:  'ลารับราชการทหาร',
  OTHER:     'ลาอื่นๆ',
};

// ─── Leave Status Labels ──────────────────────────────────────────────────────
export const TEACHER_LEAVE_STATUS_LABELS: Record<string, string> = {
  PENDING:          'รอตรวจสอบสถิติ',
  VERIFIED:         'ตรวจสอบสถิติแล้ว',
  HEAD_APPROVED:    'หัวหน้าอนุมัติแล้ว',
  DEPUTY_APPROVED:  'รองผู้อำนวยการอนุมัติแล้ว',
  APPROVED:         'ผู้อำนวยการอนุมัติแล้ว',
  DENIED:           'ไม่อนุมัติ',
};

export const STUDENT_LEAVE_STATUS_LABELS: Record<string, string> = {
  PENDING:   'รอการอนุมัติ',
  APPROVED:  'อนุมัติแล้ว',
  DENIED:    'ไม่อนุมัติ',
  DEPARTED:  'ออกนอกโรงเรียนแล้ว',
  RETURNED:  'กลับมาแล้ว',
};

// ─── Auth / Cookie ────────────────────────────────────────────────────────────
export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
export const JWT_ALGORITHM = 'HS256' as const;
export const JWT_EXPIRY = '1d';

// ─── Upload ───────────────────────────────────────────────────────────────────
export const UPLOAD_MAX_WIDTH = 1200;
export const UPLOAD_WEBP_QUALITY = 80;
export const UPLOAD_BASE_PATH = '/uploads';
