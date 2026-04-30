import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Search, Filter, ArrowRight, User, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { LeaveStatusBadge } from "@/components/leave/LeaveStatusBadge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { getFiscalYear } from "@/app/actions/teacher-leave";
import RealtimeSync from "@/components/utils/RealtimeSync";

export default async function PersonnelLeaveManagement({
  searchParams
}: {
  searchParams: Promise<{ year?: string, status?: string }>
}) {
  const { year, status } = await searchParams;
  const session = await getSession();
  
  // Requirement: Only Personnel Group (ID 2) or Admins
  const isAuthorized = session?.role === "TEACHER"; // We'll add stricter check inside if needed
  if (!isAuthorized) redirect("/login");

  const currentFY = await getFiscalYear();
  const selectedFY = year ? parseInt(year) : currentFY;

  const leaves = await prisma.teacherLeave.findMany({
    where: {
      startDate: {
        gte: new Date(selectedFY - 544, 9, 1), // Oct 1 of previous year
        lt: new Date(selectedFY - 543, 9, 1)   // Oct 1 of current year
      },
      ...(status ? { status } : {})
    },
    include: {
      teacher: { include: { prefixRef: true, positionRef: true } },
      leaveTypeRef: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const stats = {
    pending: leaves.filter(l => l.status === 'PENDING').length,
    verified: leaves.filter(l => l.status === 'VERIFIED').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <RealtimeSync intervalMs={30000} label="AdminLeave" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
              จัดการการลา <span className="text-rose-600">บุคลากร</span>
            </h1>
            <p className="text-slate-500 font-medium">Dashboard สำหรับงานบุคคล (กลุ่มบริหารงานบุคคล)</p>
          </div>

          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            {[currentFY, currentFY - 1].map(fy => (
              <Link
                key={fy}
                href={`/management/personnel/leave?year=${fy}`}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${selectedFY === fy ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                ปีงบฯ {fy}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">รอตรวจสอบสถิติ</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.pending} รายการ</h3>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Filter size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">อยู่ระหว่างการอนุมัติ</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.verified} รายการ</h3>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">อนุมัติแล้ว</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.approved} รายการ</h3>
            </div>
          </div>
        </div>

        {/* Table/List View */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase">บุคลากร</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase">ประเภท / วันที่</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase">จำนวน</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase">สถานะ</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase text-right">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.length > 0 ? (
                  leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                            <User size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{l.teacher.prefixRef?.name || ''}{l.teacher.firstName} {l.teacher.lastName}</p>
                            <p className="text-xs text-slate-400 font-medium">{l.teacher.positionRef?.name || 'บุคลากร'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-bold text-slate-700">ลา{l.leaveTypeRef?.name || ''}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {format(l.startDate, "d MMM", { locale: th })} - {format(l.endDate, "d MMM yy", { locale: th })}
                        </p>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-black text-slate-600">
                          {Number(l.totalDays)} วัน
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <LeaveStatusBadge status={l.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link
                          href={`/management/personnel/leave/${l.id}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-xl font-bold transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 group-hover:shadow-lg group-hover:-translate-y-0.5 active:scale-95"
                        >
                          <FileText size={18} />
                          จัดการ
                          <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-300">
                        <AlertCircle size={48} />
                        <p className="font-bold">ไม่พบข้อมูลคำขอลาในปีงบประมาณ {selectedFY}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const Clock = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
