import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight, AlertTriangle } from "lucide-react";
import PromotionForm from "./_components/PromotionForm";

export default async function PromotionPage() {
  const hasAccess = await checkAdminAccess("กลุ่มบริหารงานวิชาการ");
  if (!hasAccess) redirect("/sdservice");

  // Fetch all academic years to populate dropdowns
  const terms = await prisma.academicYear.findMany({
    orderBy: [
      { year: 'desc' },
      { semester: 'desc' }
    ]
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/sdservice" className="hover:text-blue-600 transition-colors">SD Service</Link>
          <ChevronRight size={14} />
          <Link href="/management/academic/students" className="hover:text-blue-600 transition-colors">จัดการนักเรียน</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">เลื่อนชั้นอัตโนมัติ</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <ArrowRight size={24} />
              </div>
              ระบบเลื่อนชั้นอัตโนมัติ (Bulk Promotion)
            </h1>
            <p className="text-slate-500 mt-2">
              คัดลอกรายชื่อนักเรียนที่มีสถานะ &quot;กำลังศึกษา&quot; ไปยังปีการศึกษาใหม่ โดยจะปรับระดับชั้นขึ้น 1 ปีอัตโนมัติ (และคงห้องเรียนเดิมไว้)
            </p>
          </div>

          <div className="p-8">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl flex gap-3 items-start mb-8 text-sm leading-relaxed">
              <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold mb-1">เงื่อนไขการทำงาน:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>ระบบจะย้ายนักเรียนจาก <b>ม.1 → ม.2</b>, <b>ม.2 → ม.3</b>, <b>ม.4 → ม.5</b>, <b>ม.5 → ม.6</b></li>
                  <li>นักเรียนชั้น <b>ม.3 และ ม.6 จะถูกปรับสถานะเป็น &quot;จบการศึกษา&quot;</b> และไม่ถูกคัดลอกไปยังเทอมใหม่</li>
                  <li>หากนักเรียนมีรายชื่ออยู่ในเทอมปลายทางแล้ว ระบบจะข้ามไปไม่สร้างซ้ำ</li>
                </ul>
              </div>
            </div>

            <PromotionForm terms={terms} />
          </div>
        </div>
      </div>
    </div>
  );
}
