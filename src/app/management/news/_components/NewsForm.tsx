'use client';

import { useState, useTransition } from 'react';
import { 
  Save, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Images,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { adminCreateNews, adminUpdateNews } from '@/app/actions/news';

interface NewsFormProps {
  initialData?: any;
  metadata: {
    categories: any[];
  };
}

export default function NewsForm({ initialData, metadata }: NewsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.thumbnail || null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.gallery || []);

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    // ตรวจสอบขนาดไฟล์รวม (ไม่เกิน 300MB)
    const thumbnail = formData.get("thumbnail") as File;
    const gallery = formData.getAll("galleryImages") as File[];
    let totalSize = 0;
    if (thumbnail && thumbnail.size > 0) totalSize += thumbnail.size;
    gallery.forEach(file => {
      if (file && file.size > 0) totalSize += file.size;
    });

    if (totalSize > 300 * 1024 * 1024) {
      setError("ขนาดไฟล์รวมทั้งหมดเกิน 300MB กรุณาเลือกรูปภาพที่เล็กลงหรือลดจำนวนรูปลงครับ");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    startTransition(async () => {
      const result = initialData 
        ? await adminUpdateNews(initialData.id, formData)
        : await adminCreateNews(formData);

      if ('success' in result) {
        window.location.href = "/management/news";
      } else {
        setError((result as any).error || "เกิดข้อผิดพลาด");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setGalleryPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
      {/* Form Header */}
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
        <div className="flex items-center gap-4">
          <Link 
            href="/management/news"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">
            {initialData ? "แก้ไขข่าวสาร" : "เขียนข่าวประชาสัมพันธ์ใหม่"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
           {initialData?.published && (
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-tighter">
                <CheckCircle2 size={14} /> Live
             </div>
           )}
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
           <AlertCircle size={20} />
           {error}
        </div>
      )}

      <form action={handleSubmit} className={`p-8 space-y-8 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">หัวข้อข่าวสาร</label>
              <input 
                required 
                type="text" 
                name="title" 
                defaultValue={initialData?.title}
                placeholder="ระบุหัวข้อข่าวที่น่าสนใจ..." 
                className="w-full p-4 bg-slate-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 text-xl font-bold text-slate-800 placeholder:text-slate-300 transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">เนื้อหาข่าวสาร</label>
              <textarea 
                required 
                name="content" 
                defaultValue={initialData?.content}
                rows={15}
                placeholder="เขียนรายละเอียดข่าวสารที่นี่..." 
                className="w-full p-6 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-700 leading-relaxed transition-all resize-none min-h-[400px]" 
              />
            </div>

            {/* Photo Gallery Upload */}
            <div className="space-y-4">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                 <Images size={16} /> คลังรูปภาพเพิ่มเติม (Gallery)
               </label>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryPreviews.slice(0, 8).map((src, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                       <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:bg-slate-100 transition-all cursor-pointer group">
                     <PlusIcon size={24} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">อัปโหลดเพิ่ม</p>
                     <input 
                      type="file" 
                      name="galleryImages" 
                      multiple 
                      accept="image/*" 
                      onChange={handleGalleryChange}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide italic">* แนะนำให้อัปโหลดพร้อมกัน 4-5 รูป (รองรับ .jpg, .png แปรงเป็น .webp อัตโนมัติ)</p>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">รูปภาพหน้าปก (Thumbnail)</label>
              <div className="relative group aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center transition-all hover:bg-slate-100 hover:border-indigo-300">
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-xs font-bold uppercase tracking-widest">คลิกเพื่อเปลี่ยนรูป</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <ImageIcon size={48} strokeWidth={1} />
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest">อัปโหลดรูปปก</p>
                  </div>
                )}
                <input 
                  type="file" 
                  name="thumbnail" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>

            {/* Google Drive Link */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <LinkIcon size={14} className="text-indigo-500" /> ลิงก์จาก Google Drive
              </label>
              <input 
                type="url" 
                name="driveLink" 
                defaultValue={initialData?.driveLink}
                placeholder="https://drive.google.com/..." 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-indigo-600 transition-all" 
              />
              <p className="text-[9px] text-slate-400 ml-2">สำหรับให้คนกดเข้าไปดูรูปภาพต้นฉบับทั้งหมด</p>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">หมวดหมู่</label>
              <select 
                name="categoryId" 
                defaultValue={initialData?.categoryId || ""}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 transition-all appearance-none"
              >
                <option value="">เลือกหมวดหมู่...</option>
                {metadata.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Status & Options */}
            <div className="bg-slate-50 p-6 rounded-[2rem] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">การเผยแพร่</p>
                  <p className="text-[10px] text-slate-500 mt-1">แสดงผลบนหน้าเว็บไซต์ทันที</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="published" 
                    value="true"
                    defaultChecked={initialData?.published}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col gap-3">
              <button 
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {initialData ? "บันทึกการแก้ไข" : "บันทึกและเผยแพร่"}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

function PlusIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
