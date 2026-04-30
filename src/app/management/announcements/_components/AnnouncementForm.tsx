'use client';

import { useState, useTransition } from 'react';
import { 
  Save, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { adminCreateNews, adminUpdateNews } from '@/app/actions/news';

interface AnnouncementFormProps {
  initialData?: any;
  announcementCategoryId: number;
}

export default function AnnouncementForm({ initialData, announcementCategoryId }: AnnouncementFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    
    // Set fixed category and placeholder content since BlogPost requires it
    formData.set("categoryId", announcementCategoryId.toString());
    if (!formData.get("content")) {
      formData.set("content", "ประกาศโรงเรียนสอยดาววิทยา");
    }
    formData.set("published", formData.get("published") === "on" ? "true" : "false");

    startTransition(async () => {
      const result = initialData 
        ? await adminUpdateNews(initialData.id, formData)
        : await adminCreateNews(formData);

      if ('success' in result) {
        window.location.href = "/management/announcements";
      } else {
        setError((result as any).error || "เกิดข้อผิดพลาด");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
        <div className="flex items-center gap-4">
          <Link 
            href="/management/announcements"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">
            {initialData ? "แก้ไขประกาศ" : "เพิ่มประกาศใหม่"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
           <AlertCircle size={20} />
           {error}
        </div>
      )}

      <form action={handleSubmit} className={`p-8 space-y-8 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">หัวข้อประกาศ</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                <Bell size={20} />
              </div>
              <input 
                required 
                type="text" 
                name="title" 
                defaultValue={initialData?.title}
                placeholder="ระบุหัวข้อประกาศ..." 
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold text-slate-800 placeholder:text-slate-300 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
              <LinkIcon size={14} className="text-indigo-500" /> ลิงก์เอกสาร (Google Drive / PDF)
            </label>
            <input 
              required
              type="url" 
              name="driveLink" 
              defaultValue={initialData?.driveLink}
              placeholder="https://drive.google.com/..." 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-indigo-600 transition-all" 
            />
            <p className="text-[10px] text-slate-400 ml-2 italic">* วางลิงก์ไฟล์เอกสารเพื่อให้คนกดเข้าไปดูได้ทันที</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">การเผยแพร่</p>
              <p className="text-[10px] text-slate-500 mt-1">แสดงผลบนหน้าเว็บไซต์ทันที</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="published" 
                defaultChecked={initialData ? initialData.published : true}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {initialData ? "บันทึกการแก้ไข" : "บันทึกและประกาศ"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
