import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, QrCode, Search, History, ArrowRight, ShieldCheck, CheckCircle, ExternalLink } from "lucide-react";
import { LeaveStatusBadge } from "@/components/leave/LeaveStatusBadge";
import DashboardRefresher from "@/components/leave/DashboardRefresher";
import { ServiceBackButton } from "@/components/layout/ServiceBackButton";
import { format, startOfDay, endOfDay } from "date-fns";
import { th } from "date-fns/locale";
import { DIVISION_NAMES } from "@/constants";

export default async function StudentLeaveDashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const isTeacher = session.role === "TEACHER";
  
  // If teacher, check if they are student affairs to show the redirect banner
  const teacherData = isTeacher ? await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true }
  }) : null;

  const isStudentAffairs = teacherData?.divisions.some(div => div.divisionName === DIVISION_NAMES.STUDENT_AFFAIRS) || teacherData?.isAdmin;

  const requests = await prisma.leaveRequest.findMany({
    where: { 
      studentId: session.userId,
      createdAt: {
        gte: startOfDay(new Date()),
        lte: endOfDay(new Date())
      }
    },
    include: {
      headApprovedBy: { include: { prefixRef: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const activeRequest = requests.length > 0 ? requests[0] : null;

  const studentAffairsTeachers = await prisma.teacher.findMany({
    where: {
      divisions: {
        some: {
          divisionName: DIVISION_NAMES.STUDENT_AFFAIRS
        }
      }
    },
    select: {
      prefixRef: { select: { name: true } },
      firstName: true,
      lastName: true,
      profileImage: true,
    }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <DashboardRefresher interval={10000} />
      <div className="max-w-4xl mx-auto px-4">
        <ServiceBackButton />
        
        {isStudentAffairs && (
          <div className="mb-8 p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-lg text-white">สำหรับครูงานกิจการนักเรียน</p>
                <p className="text-blue-100 text-sm">ระบบจัดการย้ายไปอยู่ที่หน้า Admin แล้ว</p>
              </div>
            </div>
            <Link 
              href="/management/academic/student-leave"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              ไปยังหน้าจัดการ
              <ExternalLink size={16} />
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
              ระบบเช็ค <span className="text-blue-600">การออกนอกโรงเรียน</span>
            </h1>
            <p className="text-slate-500 font-medium">จัดการคำขออนุญาตออกนอกบริเวณโรงเรียนด้วยระบบ QR Code</p>
          </div>
          
          {!isTeacher && (
            <Link 
              href="/sdservice/student-leave/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transform transition-all active:scale-95"
            >
              <Plus size={20} />
              สร้างคำขอใหม่
            </Link>
          )}
        </div>

        {/* Active Scan / Pass Section */}
        {activeRequest && (
          <div className="mb-12">
            {activeRequest.status === 'PENDING' ? (
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-100 border border-blue-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border-4 border-dashed border-blue-100 shadow-inner group">
                    <div className="bg-white p-4 rounded-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || ''}/v/${activeRequest.id}`)}`}
                        alt="Leave Request QR Code"
                        className="w-48 h-48 md:w-56 md:h-56"
                      />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="mb-4">
                      <LeaveStatusBadge status={activeRequest.status} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">แสดง QR Code นี้กับ <br /><span className="text-blue-600 underline decoration-blue-200 underline-offset-8">ครูงานกิจการนักเรียน</span></h2>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600 font-medium">
                        <Search size={18} className="text-blue-500" />
                        <span>เหตุผล: {activeRequest.reason}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600 font-medium">
                        <History size={18} className="text-blue-500" />
                        <span>เวลาออก: {format(activeRequest.startDate, "HH:mm 'น.'", { locale: th })}</span>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">รายชื่อครูที่สามารถอนุมัติได้ในขณะนี้</p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {studentAffairsTeachers.slice(0, 3).map((t, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                            <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                              {t.profileImage && <img src={t.profileImage} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{t.prefixRef?.name || ''}{t.firstName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (activeRequest.status === 'APPROVED' || activeRequest.status === 'DEPARTED') ? (
              /* Digital Gate Pass Graphic */
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-200 border-4 border-white/20 relative overflow-hidden text-white group">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                  {/* Pass Icon / Seal */}
                  <div className="relative">
                    <div className="w-40 h-40 md:w-48 md:h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl animate-pulse">
                      <ShieldCheck size={80} strokeWidth={1.5} className="text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white text-emerald-600 p-3 rounded-2xl shadow-lg rotate-12">
                      <CheckCircle size={24} />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <img src="/logo.png" alt="School Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          Digital Gate Pass
                        </div>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">ได้รับอนุญาตแล้ว</h2>
                      <p className="text-emerald-50/80 font-medium text-lg">นักเรียนสามารถแสดงหน้านี้ต่อ <span className="text-white font-bold underline underline-offset-4 decoration-emerald-300">"น้ายาม"</span> เพื่ออนุญาตออก</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-[10px] font-bold text-emerald-200/60 uppercase tracking-widest mb-1">เหตุผลการออก</p>
                        <p className="text-sm font-bold">{activeRequest.reason}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-200/60 uppercase tracking-widest mb-1">วันที่อนุญาต</p>
                        <p className="text-sm font-bold">{format(activeRequest.startDate, "d MMMM yyyy", { locale: th })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-200/60 uppercase tracking-widest mb-1">เวลาที่อนุญาต</p>
                        <p className="text-sm font-bold">{format(activeRequest.startDate, "HH:mm 'น.'", { locale: th })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-200/60 uppercase tracking-widest mb-1">อนุญาตโดย</p>
                        <p className="text-sm font-bold">
                           {activeRequest.headApprovedBy ? `${activeRequest.headApprovedBy.prefixRef?.name || ''}${activeRequest.headApprovedBy.firstName}` : "ครูงานกิจการนักเรียน"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                             <QrCode size={20} />
                          </div>
                          <div>
                             <p className="text-[9px] font-bold text-emerald-100/70 uppercase">Security Token</p>
                             <p className="text-xs font-mono font-bold tracking-wider">{activeRequest.id.toString().padStart(6, '0')}</p>
                          </div>
                       </div>
                       <Link 
                          href={`/v/${activeRequest.id}`}
                          className="px-4 py-2 bg-white text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-50 transition-colors"
                       >
                          ตรวจสอบข้อมูล
                       </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* History Section */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History size={20} className="text-blue-500" />
              ประวัติการขออนุญาต
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</span>
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
                          {format(req.createdAt, "d MMM yyyy", { locale: th })}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {req.reason}
                      </h4>
                      <p className="text-sm text-slate-500">
                        กำหนดการ: {format(req.startDate, "d MMMM yyyy HH:mm 'น.'", { locale: th })}
                      </p>
                    </div>
                    
                    <Link 
                      href={`/v/${req.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                    >
                      <QrCode size={18} />
                      รายละเอียด
                      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                  <History size={40} className="text-slate-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">ยังไม่มีประวัติการขออนุญาต</h4>
                {!isTeacher && <p className="text-slate-500">กดปุ่มสร้างคำขอใหม่ด้านบนเพื่อบันทึกรายการ</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
