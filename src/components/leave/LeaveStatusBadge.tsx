'use client'

import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  LogIn, 
  AlertCircle 
} from 'lucide-react';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'DEPARTED' | 'RETURNED' | 'CANCELLED';

export function LeaveStatusBadge({ status }: { status: LeaveStatus | string }) {
  const configs: Record<string, { label: string, icon: any, color: string, bg: string }> = {
    'PENDING': { 
      label: 'รอการยืนยันขั้นต้น', 
      icon: <Clock size={14} />, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    'HEAD_APPROVED': { 
      label: 'รอกลุ่มบริหารงานตรวจสอบ', 
      icon: <Clock size={14} />, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    'DEPUTY_APPROVED': { 
      label: 'รอผู้อำนวยการอนุมัติ', 
      icon: <Clock size={14} />, 
      color: 'text-violet-600', 
      bg: 'bg-violet-50' 
    },
    'APPROVED': { 
      label: 'อนุมัติเรียบร้อย', 
      icon: <CheckCircle2 size={14} />, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    'DENIED': { 
      label: 'ไม่อนุมัติ', 
      icon: <XCircle size={14} />, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50' 
    },
    'DEPARTED': { 
      label: 'ออกนอกโรงเรียนแล้ว', 
      icon: <LogOut size={14} />, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    'RETURNED': { 
      label: 'กลับเข้าโรงเรียนแล้ว', 
      icon: <LogIn size={14} />, 
      color: 'text-slate-600', 
      bg: 'bg-slate-50' 
    },
    'CANCELLED': { 
      label: 'ยกเลิก', 
      icon: <AlertCircle size={14} />, 
      color: 'text-slate-400', 
      bg: 'bg-slate-100' 
    }
  };

  const config = configs[status] || configs['PENDING'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
