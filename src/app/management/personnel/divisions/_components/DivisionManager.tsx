"use client"

import { useState } from 'react';
import { Plus, Edit2, Trash2, Folder, Layers, AlertCircle, Loader2, Save, X, User } from 'lucide-react';
import { createDivision, updateDivision, deleteDivision, updateAdminGroup } from '@/app/actions/divisions';
import { motion, AnimatePresence } from 'framer-motion';

interface DivisionManagerProps {
  initialGroups: any[];
  teachers: any[];
}

export default function DivisionManager({ initialGroups, teachers }: DivisionManagerProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<any>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = (division: any = null) => {
    setEditingDivision(division);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDivision(null);
    setError(null);
  };

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const result = editingDivision 
      ? await updateDivision(editingDivision.id, formData)
      : await createDivision(formData);

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || "เกิดข้อผิดพลาด");
      setIsPending(false);
    }
  }

  async function handleGroupSubmit(formData: FormData) {
    if (!editingGroup) return;
    setIsPending(true);
    setError(null);

    const result = await updateAdminGroup(editingGroup.id, formData);

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || "เกิดข้อผิดพลาด");
      setIsPending(false);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบฝ่ายงานนี้?')) {
      setIsPending(true);
      const result = await deleteDivision(id);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error);
        setIsPending(false);
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* List of Groups and Divisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {initialGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Folder size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 leading-tight">{group.groupName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">หัวหน้ากลุ่ม:</span>
                    <button 
                      onClick={() => { setEditingGroup(group); setIsGroupModalOpen(true); }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded transition-all"
                    >
                      {group.head ? `${group.head.prefix}${group.head.firstName} ${group.head.lastName}` : "ยังไม่ได้ระบุ"}
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => openModal({ groupId: group.id })}
                className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl transition-all"
              >
                <Plus size={14} /> เพิ่มงาน
              </button>
            </div>
            
            <div className="p-4 flex-1">
              {group.divisions.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold text-sm italic">
                  ยังไม่มีฝ่ายงานในกลุ่มนี้
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {group.divisions.map((div: any) => (
                    <div key={div.id} className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                        <div>
                          <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{div.divisionName}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              {div._count.teachers} บุคลากร
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold">
                              <User size={10} />
                              {div.head ? `${div.head.prefix}${div.head.firstName} ${div.head.lastName}` : "ไม่มีหัวหน้า"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(div)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(div.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={closeModal}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <div 
            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                  <Layers size={20} />
                </div>
                {editingDivision?.id ? "แก้ไขฝ่ายงาน" : "เพิ่มฝ่ายงานใหม่"}
              </h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-800 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>

            <form action={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อฝ่ายงาน</label>
                  <input 
                    required
                    type="text" 
                    name="divisionName" 
                    defaultValue={editingDivision?.divisionName || ""}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                    placeholder="เช่น งานทะเบียน"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">กลุ่มบริหารงาน</label>
                  <select 
                    name="groupId" 
                    defaultValue={editingDivision?.groupId || ""}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                  >
                    {initialGroups.map(group => (
                      <option key={group.id} value={group.id}>{group.groupName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">หัวหน้าฝ่ายงาน</label>
                  <select 
                    name="headId" 
                    defaultValue={editingDivision?.headId || ""}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                  >
                    <option value="">-- ไม่ระบุหัวหน้า --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.prefix}{teacher.firstName} {teacher.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {editingDivision?.id ? "บันทึกการแก้ไข" : "เพิ่มฝ่ายงาน"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Head Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setIsGroupModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <div 
            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                  <Folder size={20} />
                </div>
                ตั้งค่าหัวหน้ากลุ่ม: {editingGroup?.groupName}
              </h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>

            <form action={handleGroupSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">หัวหน้ากลุ่มบริหารงาน</label>
                  <select 
                    name="headId" 
                    defaultValue={editingGroup?.headId || ""}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold"
                  >
                    <option value="">-- ไม่ระบุหัวหน้า --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.prefix}{teacher.firstName} {teacher.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> บันทึกหัวหน้ากลุ่ม</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
