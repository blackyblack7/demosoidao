"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { bulkPromoteStudents } from "@/app/actions/promotion";
import { motion, AnimatePresence } from "framer-motion";

interface Term {
  id: number;
  semester: number;
  year: number;
  isActive: boolean;
}

export default function PromotionForm({ terms }: { terms: Term[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const activeTerm = terms.find(t => t.isActive);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await bulkPromoteStudents(formData);
      setResult({
        success: response.success,
        message: response.message || response.error || "เกิดข้อผิดพลาด"
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการเลื่อนชั้น"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end relative">
        
        {/* Decorative arrow between fields on desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 w-12 h-12 bg-white rounded-full items-center justify-center z-10 text-slate-300">
          <ArrowRight size={24} />
        </div>

        <div className="space-y-3 relative z-0 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <label className="text-sm font-bold text-slate-700 block uppercase tracking-wide">
            ดึงรายชื่อจากเทอมต้นทาง
          </label>
          <select 
            name="fromTermId" 
            required 
            defaultValue={activeTerm?.id || ""}
            className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          >
            <option value="" disabled>-- เลือกปีการศึกษาต้นทาง --</option>
            {terms.map(t => (
              <option key={t.id} value={t.id}>
                ภาคเรียนที่ {t.semester}/{t.year} {t.isActive ? "(ปัจจุบัน)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 relative z-0 p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
          <label className="text-sm font-bold text-emerald-700 block uppercase tracking-wide">
            เลื่อนชั้นไปยังเทอมปลายทาง
          </label>
          <select 
            name="toTermId" 
            required 
            defaultValue=""
            className="w-full p-4 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow font-bold text-emerald-800"
          >
            <option value="" disabled>-- เลือกปีการศึกษาใหม่ --</option>
            {terms.map(t => (
              <option key={t.id} value={t.id}>
                ภาคเรียนที่ {t.semester}/{t.year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl flex items-center gap-4 text-sm font-medium ${
              result.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {result.success ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
            <span className="text-base">{result.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              กำลังประมวลผล...
            </>
          ) : (
            <>
              <ArrowRight size={20} />
              ยืนยันการเลื่อนชั้น
            </>
          )}
        </button>
      </div>
    </form>
  );
}
