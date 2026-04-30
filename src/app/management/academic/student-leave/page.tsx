import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { QrCode, Search, History, ArrowRight, ShieldCheck, ChevronRight, GraduationCap } from "lucide-react";
import { LeaveStatusBadge } from "@/components/leave/LeaveStatusBadge";
import DashboardRefresher from "@/components/leave/DashboardRefresher";
import DateNavigator from "@/components/leave/DateNavigator";
import { format, startOfDay, endOfDay, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { DIVISION_NAMES } from "@/constants";

export default async function StudentLeaveManagementPage({
  searchParams
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateStr } = await searchParams;
  const session = await getSession();

  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const teacherData = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true }
  });

  const isStudentAffairs = teacherData?.divisions.some(div => div.divisionName === DIVISION_NAMES.STUDENT_AFFAIRS) || teacherData?.isAdmin;

  if (!isStudentAffairs) {
    redirect("/access-denied");
  }

  const targetDate = dateStr ? parseISO(dateStr) : new Date();
  const dateStart = startOfDay(targetDate);
  const dateEnd = endOfDay(targetDate);

  let requests = await prisma.leaveRequest.findMany({
    where: { 
      createdAt: {
        gte: dateStart,
        lte: dateEnd
      }
    },
    include: { 
      student: {
        include: {
          prefixRef: true,
          termData: {
            orderBy: { id: 'desc' },
            take: 1,
          }
        }
      },
      headApprovedBy: true,
    },
    orderBy: { createdAt: "desc" }
  });

  // Specialized Sorting: Actionable status first
  requests = [...requests].sort((a, b) => {
    const getPriority = (status: string) => {
      if (status === 'PENDING') return 0;
      return 1;
    };

    const prioA = getPriority(a.status);
    const prioB = getPriority(b.status);
    
    if (prioA !== prioB) return prioA - prioB;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <DashboardRefresher interval={10000} />
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/management" className="hover:text-blue-600 transition-colors">Management</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">จัดการการออกนอกโรงเรียน</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 text-blue-600 rounded-2xl">
                <ShieldCheck size={32} />
              </div>
              จัดการการออกนอกโรงเรียน
            </h1>
            <p className="text-slate-500 mt-2 font-medium">ตรวจสอบและอนุมัติคำขออนุญาตออกนอกบริเวณโรงเรียนของนักเรียน</p>
          </div>
          
          <div className="flex items-center gap-4">
            <DateNavigator currentDate={targetDate} />
          </div>
        </div>

        {/* Stats Summary (Optional but good for admin) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">คำขอทั้งหมดวันนี้</p>
                <p className="text-3xl font-black text-slate-800">{requests.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">รอการอนุมัติ</p>
                <p className="text-3xl font-black text-amber-600">{requests.filter(r => r.status === 'PENDING').length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">ออกนอกโรงเรียนแล้ว</p>
                <p className="text-3xl font-black text-emerald-600">{requests.filter(r => r.status === 'DEPARTED').length}</p>
            </div>
        </div>

        {/* Request List */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History size={20} className="text-blue-500" />
              รายการคำขอประจำวัน
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {format(targetDate, "d MMMM yyyy", { locale: th })}
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.id} className="p-8 hover:bg-slate-50/80 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <LeaveStatusBadge status={req.status} />
                        <span className="text-sm text-slate-400 font-medium">
                          {format(req.createdAt, "HH:mm 'น.'", { locale: th })}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {req.student ? `[${req.student.prefixRef?.name || ''}${req.student.firstNameTh} ${req.student.lastNameTh}] ` : ""}{req.reason}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <p>ชั้น: {req.student?.termData?.[0]?.gradeLevel}/{req.student?.termData?.[0]?.roomNumber}</p>
                        <p>เวลาออก: {format(req.startDate, "HH:mm 'น.'", { locale: th })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            href={`/v/${req.id}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                        >
                            <QrCode size={18} />
                            ตรวจสอบ
                            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                  <History size={40} className="text-slate-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">ไม่มีรายการคำขอในวันนี้</h4>
                <p className="text-slate-500">เปลี่ยนวันที่เพื่อตรวจสอบรายการย้อนหลัง</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
