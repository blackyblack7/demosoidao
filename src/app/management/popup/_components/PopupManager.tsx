"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Image as ImageIcon, Link as LinkIcon, ToggleLeft, ToggleRight, Loader2, AlertCircle } from "lucide-react";
import { updateSitePopup } from "@/app/actions/popup";

interface PopupManagerProps {
  popup: any;
}

export default function PopupManager({ popup }: PopupManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [isActive, setIsActive] = useState(popup?.isActive ?? false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(popup?.imageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append("isActive", isActive.toString());
    formData.append("keepExistingImage", (!imageFile && popup?.imageUrl) ? "true" : "false");

    const result = await updateSitePopup(formData);

    if (result.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "เกิดข้อผิดพลาด");
    }

    setIsPending(false);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden max-w-4xl mx-auto">
      <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-white flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
            <ImageIcon size={28} />
          </div>
          ตั้งค่า Popup แจ้งเตือนหน้าเว็บ
        </h2>
        
        <button 
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle size={20} />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle size={20} />
            <p className="font-bold text-sm">บันทึกข้อมูลเรียบร้อยแล้ว!</p>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ImageIcon size={18} className="text-blue-500" />
            รูปภาพ Popup (สัดส่วนแนะนำ 16:9 หรือแนวนอน)
          </label>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-full max-w-lg aspect-video bg-slate-100 rounded-3xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors group flex-shrink-0">
              {previewUrl ? (
                <Image src={previewUrl} alt="Popup Preview" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-sm font-bold">คลิกเพื่ออัปโหลด</span>
                </div>
              )}
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ImageIcon size={32} className="text-white mb-2" />
                <span className="text-white font-bold text-sm">เปลี่ยนรูปภาพ</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-sm text-slate-500 bg-slate-50 p-6 rounded-3xl w-full">
              <h4 className="font-bold text-slate-700">คำแนะนำการอัปโหลด:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>ขนาดไฟล์ไม่เกิน 5MB</li>
                <li>แนะนำรูปทรงแนวนอนสัดส่วน 16:9 เพื่อง่ายต่อการแสดงผลบนหน้าจอต่างๆ</li>
                <li>ควรอ่านง่าย ไม่ใส่ตัวหนังสือเยอะเกินไป</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <LinkIcon size={18} className="text-blue-500" />
            ลิงก์ปลายทางเมื่อคลิกรูปภาพ (ถ้ามี)
          </label>
          <input 
            type="url" 
            name="linkUrl" 
            defaultValue={popup?.linkUrl || ""}
            placeholder="https://example.com"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
          <button 
            type="submit"
            disabled={isPending}
            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> บันทึกการตั้งค่า</>}
          </button>
        </div>
      </form>
    </div>
  );
}
