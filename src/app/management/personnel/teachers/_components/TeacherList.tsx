"use client"

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Edit, 
  Trash2, 
  Briefcase,
  UserX,
  Filter,
  X
} from 'lucide-react';
import { adminDeleteTeacher } from '@/app/actions/personnel';

interface TeacherListProps {
  initialTeachers: any[];
  departments: any[];
  groups: any[];
}

export default function TeacherList({ initialTeachers, departments, groups }: TeacherListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const hasActiveFilters = selectedDeptId || selectedGroupId;

  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter(t => {
      // Text search
      const searchStr = `${t.prefix}${t.firstName} ${t.lastName} ${t.username} ${t.department?.departmentName || ''}`.toLowerCase();
      if (!searchStr.includes(searchTerm.toLowerCase())) return false;

      // Department filter
      if (selectedDeptId) {
        if (!t.departmentId || t.departmentId.toString() !== selectedDeptId) return false;
      }

      // Admin group filter — check direct adminGroups relationship
      if (selectedGroupId) {
        const hasGroup = t.adminGroups?.some((g: any) => 
          g.id?.toString() === selectedGroupId
        );
        if (!hasGroup) return false;
      }

      return true;
    });
  }, [searchTerm, selectedDeptId, selectedGroupId, initialTeachers]);

  function clearFilters() {
    setSelectedDeptId('');
    setSelectedGroupId('');
    setSearchTerm('');
  }

  async function handleDelete(id: number, name: string) {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${name}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
      startTransition(async () => {
        const result = await adminDeleteTeacher(id);
        if ('error' in result) {
          alert((result as any).error);
        }
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, นามสกุล, หรือ Username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className={`px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold text-sm transition-all cursor-pointer min-w-[160px] ${
                selectedDeptId 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'bg-slate-50 text-slate-500'
              }`}
            >
              <option value="">กลุ่มสาระทั้งหมด</option>
              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
              ))}
            </select>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className={`px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold text-sm transition-all cursor-pointer min-w-[180px] ${
                selectedGroupId 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'bg-slate-50 text-slate-500'
              }`}
            >
              <option value="">กลุ่มบริหารทั้งหมด</option>
              {groups.map((g: any) => (
                <option key={g.id} value={g.id}>{g.groupName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 px-1">
            <Filter size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-400">กำลังกรอง:</span>
            {selectedDeptId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl">
                {departments.find((d: any) => d.id.toString() === selectedDeptId)?.departmentName}
                <button onClick={() => setSelectedDeptId('')} className="hover:text-blue-900 transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedGroupId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl">
                {groups.find((g: any) => g.id.toString() === selectedGroupId)?.groupName}
                <button onClick={() => setSelectedGroupId('')} className="hover:text-indigo-900 transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors ml-2"
            >
              ล้างทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Table/List View */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">บุคลากร</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">ตำแหน่ง/วิทยฐานะ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">งาน/กลุ่มสาระ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-100/50">
                          {teacher.profileImage ? (
                            <img src={teacher.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            teacher.firstName[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-2">
                            {teacher.prefix}{teacher.firstName} {teacher.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">@{teacher.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-700">{teacher.position || 'ครู'}</p>
                      {teacher.academicStanding && teacher.academicStanding !== 'ไม่มีวิทยฐานะ' && (
                        <p className="text-xs text-indigo-600 font-bold">วิทยฐานะ{teacher.academicStanding}</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {teacher.divisions?.map((div: any) => (
                          <span key={div.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                            <Briefcase size={10} />
                            {div.divisionName}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {teacher.department?.departmentName || 'ไม่ระบุกลุ่มสาระ'}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/management/personnel/teachers/${teacher.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(teacher.id, `${teacher.firstName} ${teacher.lastName}`)}
                          disabled={isPending}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <UserX size={48} className="opacity-20" />
                      <div>
                        <p className="font-bold text-slate-500">ไม่พบข้อมูลบุคลากร</p>
                        <p className="text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Stats */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            พบข้อมูลบุคลากร <span className="text-blue-600 font-bold">{filteredTeachers.length}</span> จากทั้งหมด {initialTeachers.length} ท่าน
          </p>
        </div>
      </div>
    </div>
  );
}
