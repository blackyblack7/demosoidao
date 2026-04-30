'use client'

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Edit, 
  Trash2, 
  UserX,
  Filter,
  GraduationCap,
  Loader2,
  FileUp
} from 'lucide-react';
import { adminDeleteStudent } from '@/app/actions/students';
import Pagination from '@/components/common/Pagination';

interface StudentListProps {
  students: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  grades: string[];
  rooms: number[];
  currentFilters: {
    q: string;
    grade: string;
    room: string;
  };
}

export default function StudentList({ 
  students, 
  totalCount, 
  currentPage, 
  pageSize, 
  grades, 
  rooms,
  currentFilters 
}: StudentListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(currentFilters.q);

  useEffect(() => {
    setSearchValue(currentFilters.q);
  }, [currentFilters.q]);

  function updateParams(newParams: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    if (newParams.page === undefined) {
      params.delete('page');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    if (searchValue === currentFilters.q) return;
    const timeoutId = setTimeout(() => {
      updateParams({ q: searchValue, page: 1 });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);



  async function handleDelete(id: number, name: string) {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ "${name}"?`)) {
      startTransition(async () => {
        const result = await adminDeleteStudent(id);
        if (!('success' in result)) {
          alert((result as any).error);
        }
      });
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-end relative overflow-hidden">
        {isPending && (
           <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden">
             <div className="h-full bg-blue-600 animate-progress origin-left" />
           </div>
        )}

        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">ค้นหาข้อมูล</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, นามสกุล, เลขประจำตัว..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-48 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">ระดับชั้น</label>
          <select 
            value={currentFilters.grade}
            onChange={(e) => updateParams({ grade: e.target.value, page: 1 })}
            className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700"
          >
            <option value="">ทั้งหมด</option>
            {grades.map(g => (
               <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="w-full lg:w-32 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">ห้อง</label>
          <select 
            value={currentFilters.room}
            onChange={(e) => updateParams({ room: e.target.value, page: 1 })}
            className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700"
          >
            <option value="">ทั้งหมด</option>
            {rooms.map(r => (
               <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => { setSearchValue(''); updateParams({ q: null, grade: null, room: null, page: 1 }); }}
          className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"
          title="ล้างตัวกรอง"
        >
          <Filter size={20} />
        </button>


      </div>

      {/* Table View */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">นักเรียน</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">ชั้น/ห้อง</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">สถานะ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 relative">
              <AnimatePresence mode="wait">
                <motion.tr
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="contents"
                >
                  <td colSpan={4} className="p-0">
                    <div className="min-h-[400px]">
                      <table className="w-full border-collapse">
                        <tbody className="divide-y divide-slate-50">
                          {students.length > 0 ? (
                            students.map((student) => {
                              const currentTerm = student.termData[0] || {};
                              return (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-100/50 group-hover:scale-105 transition-transform">
                                        {student.profileImage ? (
                                          <img src={student.profileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <GraduationCap size={24} className="opacity-40" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800">{student.prefixRef?.name || ''}{student.firstNameTh} {student.lastNameTh}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เลขประจำตัว: {student.studentCode}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-bold">
                                      {currentTerm.gradeLevel || '-'}/{currentTerm.roomNumber || '-'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                      currentTerm.status === 'กำลังศึกษา' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                    } border`}>
                                      {currentTerm.status || 'ไม่มีข้อมูล'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Link 
                                        href={`/management/academic/students/${student.id}`}
                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                      >
                                        <Edit size={18} />
                                      </Link>
                                      <button 
                                        onClick={() => handleDelete(student.id, `${student.firstNameTh} ${student.lastNameTh}`)}
                                        disabled={isPending}
                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-24 text-center">
                                <UserX size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="font-bold text-slate-400">ไม่พบข้อมูลนักเรียนสายชั้นนี้</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </motion.tr>
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Pagination & Status */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Summary</p>
            <p className="text-sm text-slate-600 font-bold">
              พบข้อมูลนักเรียน <span className="text-blue-600">{totalCount}</span> รายการ
            </p>
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ page: p })}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
}
