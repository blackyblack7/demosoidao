import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Send, Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { submitLeaveRequest } from "@/app/actions/student-leave";
import { ServiceBackButton } from "@/components/layout/ServiceBackButton";
import { getStudentMetadataOptions } from "@/app/actions/metadata";

export default async function NewLeaveRequestPage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const metadata = await getStudentMetadataOptions();

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await submitLeaveRequest(formData);
    if ('success' in result) {
      redirect("/sdservice/student-leave");
    } else {
      console.error((result as any).error);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-3xl mx-auto px-4">
        <ServiceBackButton />
        <Link 
          href="/sdservice/student-leave"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">กลับหน้าจัดการ</span>
        </Link>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-extrabold mb-2">แจ้งขอออกนอกโรงเรียน</h1>
            <p className="text-blue-100 opacity-90">กรุณากรอกข้อมูลเหตุผลและเวลาที่ต้องการออกนอกโรงเรียนให้ชัดเจน</p>
          </div>

          <form action={handleSubmit} className="p-8 space-y-8">
            <div>
              <label className="flex items-center gap-2 text-slate-700 font-bold mb-3">
                <FileText size={18} className="text-blue-500" />
                ประเภทการลา / เหตุผล
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select name="leaveTypeId" required className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-700 font-bold">
                    <option value="">เลือกประเภทการลา...</option>
                    {metadata.leaveTypes
                      .filter(t => t.name === "ลาป่วย" || t.name === "ลากิจ")
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                 <textarea
                  name="reason"
                  required
                  placeholder="ระบุเหตุผล เช่น ติดต่อนุธุระกับทางอำเภอ..."
                  className="w-full h-20 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-bold mb-3">
                  <Calendar size={18} className="text-blue-500" />
                  วันที่ต้องการออก
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={today}
                  readOnly
                  className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              {/* Departure Time */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-bold mb-3">
                  <Clock size={18} className="text-blue-500" />
                  เวลาที่ต้องการออก
                </label>
                <input
                  type="time"
                  name="departureTime"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Return Time */}
            <div>
              <label className="flex items-center gap-2 text-slate-700 font-bold mb-3">
                <Clock size={18} className="text-emerald-500" />
                เวลาที่คาดว่าจะกลับ (ถ้ามี)
              </label>
              <input
                type="time"
                name="returnTime"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-slate-700 font-medium"
              />
              <p className="mt-2 text-xs text-slate-400 italic font-medium">* หากเป็นการลาทั้งวัน ไม่จำเป็นต้องระบุเวลากลับ</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.02] transform transition-all flex items-center justify-center gap-3"
              >
                <Send size={20} />
                ส่งคำขอและสร้าง QR Code
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
