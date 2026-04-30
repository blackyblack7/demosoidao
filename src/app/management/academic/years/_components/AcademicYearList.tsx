'use client'

import { useState, useTransition } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { adminCreateAcademicYear, adminSetActiveYear, adminDeleteAcademicYear } from '@/app/actions/academic';

interface AcademicYearListProps {
  initialYears: any[];
}

export default function AcademicYearList({ initialYears }: AcademicYearListProps) {
  const [isPending, startTransition] = useTransition();
  const [semester, setSemester] = useState('1');
  const [year, setYear] = useState(new Date().getFullYear() + 543); // Default to current BE year

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('semester', semester);
    formData.append('year', year.toString());

    startTransition(async () => {
      const result = await adminCreateAcademicYear(formData);
      if ('error' in result) alert((result as any).error);
    });
  }

  async function handleSetActive(id: number) {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการสลับปีการศึกษาที่เปิดใช้งาน? การดำเนินการนี้จะส่งผลต่อการดึงข้อมูลทั้งระบบทันที')) {
      startTransition(async () => {
        const result = await adminSetActiveYear(id);
        if ('error' in result) alert((result as any).error);
      });
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('ยืนยันการลบปีการศึกษา?')) {
      startTransition(async () => {
        const result = await adminDeleteAcademicYear(id);
        if ('error' in result) alert((result as any).error);
      });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left: Form to Add */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 sticky top-32">
          <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <Plus className="text-blue-600" size={24} />
            เพิ่มปีการศึกษาใหม่
          </h2>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">ภาคเรียน / เทอม</label>
              <select 
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
              >
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
                <option value="3">ภาคเรียนที่ 3 (ฤดูร้อน)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">ปีการศึกษา (พ.ศ.)</label>
              <input 
                type="number" 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
              />
            </div>
            <button 
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
              เพิ่มข้อมูล
            </button>
          </form>

          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
             <AlertCircle className="text-amber-500 shrink-0" size={20} />
             <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                คำเตือน: การเปลี่ยนปีการศึกษาที่เปิดใช้งานจะเปลี่ยนบริบทของระบบจัดการนักเรียน ตารางสอน และผลการเรียนทันที กรุณาตรวจสอบให้แน่ใจก่อนสลับเทอม
             </p>
          </div>
        </div>
      </div>

      {/* Right: List of Years */}
      <div className="lg:col-span-2 space-y-4">
        {initialYears.map((y) => (
          <div 
            key={y.id} 
            className={`bg-white p-6 rounded-3xl border transition-all flex items-center justify-between shadow-sm ${
              y.isActive ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${y.isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Calendar size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  ภาคเรียนที่ {y.semester} / {y.year}
                </h3>
                {y.isActive ? (
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase mt-1">
                     <CheckCircle2 size={14} />
                     กำลังเปิดใช้งาน
                   </span>
                ) : (
                   <span className="text-xs text-slate-400 font-bold mt-1 block">ยังไม่ได้ใช้งาน</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!y.isActive && (
                <>
                  <button 
                    onClick={() => handleSetActive(y.id)}
                    disabled={isPending}
                    className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                  >
                    เปิดใช้งาน
                  </button>
                  <button 
                    onClick={() => handleDelete(y.id)}
                    disabled={isPending}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {initialYears.length === 0 && (
          <div className="bg-white p-20 rounded-3xl border border-slate-100 text-center text-slate-400">
             <Calendar size={48} className="mx-auto mb-4 opacity-20" />
             <p className="font-bold">ยังไม่มีข้อมูลปีการศึกษาในระบบ</p>
          </div>
        )}
      </div>
    </div>
  );
}
