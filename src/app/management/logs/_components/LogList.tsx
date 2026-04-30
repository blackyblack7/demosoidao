'use client'

import { 
  Search, 
  Clock, 
  User, 
  Activity,
  FileText,
  Filter,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '@/components/common/Pagination';

interface LogListProps {
  logs: any[];
  total: number;
  currentPage: number;
  pages: number;
  modules: string[];
  currentFilters: {
    module: string;
    q: string;
  }
}

export default function LogList({ 
  logs, 
  total, 
  currentPage, 
  pages, 
  modules,
  currentFilters 
}: LogListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(currentFilters.q);
  const [selectedModule, setSelectedModule] = useState(currentFilters.module);

  function updateFilters(newParams: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (newParams.page === undefined) params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function getActionColor(action: string) {
    if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (action.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
        <form 
          className="flex-1 w-full space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            updateFilters({ q: searchTerm });
          }}
        >
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">ค้นหาจากรายละเอียดหรือผู้ทำ</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="กด Enter เพื่อค้นหา..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
        </form>
        
        <div className="w-full md:w-64 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">ฝ่ายงาน / ระบบ</label>
          <select 
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              updateFilters({ module: e.target.value });
            }}
            className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700"
          >
            <option value="">ทั้งหมด</option>
            {modules.map(m => (
               <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => {
            setSearchTerm('');
            setSelectedModule('');
            updateFilters({ q: null, module: null, page: 1 });
          }}
          className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"
          title="ล้างตัวกรอง"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">วัน-เวลา</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ผู้กระทำ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">กิจกรรม</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">รายละเอียด</th>
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
                          {logs.length > 0 ? (
                            logs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 w-48">
                                  <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    <Clock size={14} className="text-slate-300" />
                                    {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm:ss', { locale: th })}
                                  </div>
                                </td>
                                <td className="px-6 py-5 w-64">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                      <User size={16} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800">
                                        {log.actor ? `${log.actor.prefix}${log.actor.firstName} ${log.actor.lastName}` : 'System'}
                                      </p>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        {log.module}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5 w-32">
                                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getActionColor(log.action)}`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex items-start gap-3">
                                    <FileText size={14} className="mt-0.5 text-slate-200 group-hover:text-blue-400 transition-colors" />
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                      {log.details || '-'}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                                <Activity size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="font-bold">ไม่พบบันทึกกิจกรรมตามเงื่อนไข</p>
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
        
        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-0.5 shrink-0">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Summary</p>
            <p className="text-sm text-slate-600 font-bold">
              แสดง {logs.length} จากทั้งหมด {total} บันทึก
            </p>
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={pages}
            onPageChange={(p) => updateFilters({ page: p })}
          />
        </div>
      </div>
    </div>
  );
}
