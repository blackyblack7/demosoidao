import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, History, ArrowRight, Calendar, Info, Clock } from "lucide-react";
import { LeaveStatusBadge } from "@/components/leave/LeaveStatusBadge";
import { ServiceBackButton } from "@/components/layout/ServiceBackButton";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { getTeacherLeaveStats, getFiscalYear } from "@/app/actions/teacher-leave";

export default async function TeacherLeaveDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') {
    redirect("/login");
  }

  const currentFiscalYear = await getFiscalYear();
  const { totals, lastLeave } = await getTeacherLeaveStats(session.userId, currentFiscalYear);

  const leaves = await prisma.teacherLeave.findMany({
    where: { teacherId: session.userId },
    include: { leaveTypeRef: true },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const leaveTypes = [
    { key: 'SICK', label: 'ลาป่วย', color: 'rose' },
    { key: 'PERSONAL', label: 'ลากิจส่วนตัว', color: 'amber' },
    { key: 'VACATION', label: 'ลาพักผ่อน', color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-5xl mx-auto px-4">
        <ServiceBackButton />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
              ระบบการลา <span className="text-indigo-600">บุคลากร</span>
            </h1>
            <p className="text-slate-500 font-medium">จัดการคำขอลาและตรวจสอบสถิติการลาประจำปีงบประมาณ {currentFiscalYear}</p>
          </div>
          
          <Link 
            href="/sdservice/teacher-leave/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transform transition-all active:scale-95 text-center justify-center"
          >
            <Plus size={20} />
            เขียนใบลาใหม่ (บค.1.01)
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {leaveTypes.map((type) => (
            <div key={type.key} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${type.color}-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{type.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black text-${type.color}-600`}>
                    {totals[type.key as keyof typeof totals] || 0}
                  </span>
                  <span className="text-sm font-bold text-slate-400">วัน</span>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${type.color}-500 rounded-full`} 
                    style={{ width: `${Math.min((totals[type.key as keyof typeof totals] / 30) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last Leave & Info Info */}
        {lastLeave && (
          <div className="mb-12 bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-md">
                <Clock size={40} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-black mb-2 text-indigo-100">การลาครั้งล่าสุด</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-300" />
                    <span className="font-bold">{format(lastLeave.startDate, "d MMM yy", { locale: th })} - {format(lastLeave.endDate, "d MMM yy", { locale: th })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-indigo-300" />
                    <span className="font-bold">ประเภท: {lastLeave.leaveTypeRef?.name || ''} ({Number(lastLeave.totalDays)} วัน)</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm text-sm font-bold">
                นับตามปีงบประมาณ {currentFiscalYear}
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History size={20} className="text-indigo-500" />
              ประวัติการเสนอลา
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest underline decoration-indigo-200 decoration-2">บค. 1.01 Digital Records</span>
          </div>

          <div className="divide-y divide-slate-50">
            {leaves.length > 0 ? (
              leaves.map((req) => (
                <div key={req.id} className="p-8 hover:bg-slate-50/80 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <LeaveStatusBadge status={req.status} />
                        <span className="text-xs font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                          FY{"2567"}
                        </span>
                        <span className="text-sm text-slate-400 font-medium">
                          ยื่นเมื่อ: {format(req.createdAt, "d MMM yyyy", { locale: th })}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        ลา{req.leaveTypeRef?.name || ''} ({Number(req.totalDays)} วัน)
                      </h4>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        สาเหตุ: {req.reason}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                        <Calendar size={12} />
                        ช่วงเวลา: {format(req.startDate, "d MMM yyyy", { locale: th })} ถึง {format(req.endDate, "d MMM yyyy", { locale: th })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/sdservice/teacher-leave/${req.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                      >
                        <FileText size={18} />
                        ดูรายละเอียด
                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6 text-slate-400">
                  <FileText size={40} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">ยังไม่มีประวัติการเสนอลา</h4>
                <p className="text-slate-500">คุณยังไม่ได้ยื่นแบบฟอร์ม บค.1.01 ในปีงบประมาณนี้</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
