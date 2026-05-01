import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { 
  User, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  LogOut,
  LogIn
} from "lucide-react";
import { LeaveStatusBadge } from "@/components/leave/LeaveStatusBadge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { 
  approveLeaveRequest, 
  denyLeaveRequest, 
  markStudentDeparted,
  markStudentReturned
} from "@/app/actions/student-leave";
import { ServiceBackButton } from "@/components/layout/ServiceBackButton";

export default async function PublicVerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const request = await prisma.leaveRequest.findUnique({
    where: { 
      id: parseInt(token, 10),
      createdAt: { gte: twentyFourHoursAgo }
    },
    include: {
      student: {
        include: {
          prefixRef: true,
          termData: {
            where: { term: { isActive: true } },
            take: 1
          }
        }
      },
      headApprovedBy: { include: { prefixRef: true } },
      deputyApprovedBy: { include: { prefixRef: true } },
      directorApprovedBy: { include: { prefixRef: true } }
    }
  });

  if (!request) {
    notFound();
  }

  const session = await getSession();
  
  if (!session) {
    redirect(`/login?callbackUrl=/v/${token}`);
  }

  const teacher = session?.role === "TEACHER" ? await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true, positionRef: true }
  }) : null;

  const isStudentAffairs = teacher?.divisions.some(div => div.divisionName === "งานกิจการนักเรียน") || teacher?.isAdmin;
  const isDeputy = (teacher?.positionRef?.level ?? 0) === 8;
  const isDirector = (teacher?.positionRef?.level ?? 0) === 10;

  const termData = request.student.termData[0];

  // Actions
  async function handleApprove() {
    'use server'
    await approveLeaveRequest(request!.id);
  }

  async function handleDeny(formData: FormData) {
    'use server'
    const reason = formData.get("denialReason") as string;
    await denyLeaveRequest(request!.id, reason);
  }

  async function handleDepart() {
    'use server'
    await markStudentDeparted(request!.id);
  }

  async function handleReturn() {
    'use server'
    await markStudentReturned(request!.id);
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 pt-12 md:pt-24 font-sans">
      <div className="max-w-xl mx-auto px-4">
        {session && <ServiceBackButton />}
        {/* Verification Status Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
            <ShieldCheck size={18} />
            Official Verification
          </div>
          <h1 className="text-3xl font-black text-white mb-2">ตรวจสอบหลักฐานการขอออก</h1>
          <p className="text-slate-400">ระบบตรวจสอบข้อมูลนักเรียน โรงเรียนสอยดาววิทยา</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden">
          {/* Student Info Section */}
          <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-200 border-4 border-white shadow-xl overflow-hidden mx-auto">
                {request.student.profileImage ? (
                  <img src={request.student.profileImage} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={60} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-blue-600">
                <CheckCircle size={24} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">
              {request.student.prefixRef?.name || ''}{request.student.firstNameTh} {request.student.lastNameTh}
            </h2>
            <p className="text-blue-600 font-bold mb-4">
              รหัสนักเรียน: {request.student.studentCode}
            </p>
            {termData && (
              <div className="inline-flex gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold shadow-sm">
                <span>ชั้น {termData.gradeLevel}</span>
                <span className="text-slate-300">|</span>
                <span>ห้อง {termData.roomNumber}</span>
              </div>
            )}
          </div>

          {/* Leave Details */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">สถานะปัจจุบัน</span>
              <LeaveStatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-wider mb-3">
                  <AlertTriangle size={14} className="text-amber-500" />
                  เหตุผลการขออนุญาต
                </div>
                <p className="text-lg font-bold text-slate-800 leading-relaxed">
                  {request.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">
                    <Clock size={14} className="text-blue-500" />
                    เวลาออก
                  </div>
                  <p className="text-xl font-black text-slate-800">
                    {format(request.startDate, "HH:mm 'น.'", { locale: th })}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    {format(request.startDate, "d MMM yyyy", { locale: th })}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">
                    <MapPin size={14} className="text-emerald-500" />
                    เวลากลับ
                  </div>
                  <p className="text-xl font-black text-slate-800">
                    {request.endDate ? format(request.endDate, "HH:mm 'น.'", { locale: th }) : "ไม่ระบุ"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    {request.endDate ? format(request.endDate, "d MMM yyyy", { locale: th }) : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Info Visualization (Simplified) */}
            {request.status !== "PENDING" && request.status !== "DENIED" && (
              <div className="space-y-3 p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 px-1">ผู้ตรวจสอบข้อมูล</p>
                
                <div className="flex items-center gap-3 p-3 bg-white shadow-sm border border-emerald-100 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">งานกิจการนักเรียน</p>
                    <p className="text-sm font-bold text-slate-700">
                      {request.headApprovedBy ? `${request.headApprovedBy.prefixRef?.name || ''}${request.headApprovedBy.firstName} ${request.headApprovedBy.lastName}` : 'อนุมัติเรียบร้อยแล้ว'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons for Authorized Personnel */}
            <div className="pt-4 space-y-4">
              {/* Teacher Actions */}
              {/* Approval Buttons */}
              {teacher && (
                <>
                  {/* Single Step Approval for Student Affairs */}
                  {request.status === "PENDING" && isStudentAffairs && (
                    <div className="flex flex-col gap-3">
                      <form action={handleApprove}>
                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                          อนุมัติคำขอออกนอกโรงเรียน (Approve)
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Denial Option */}
                  {request.status === "PENDING" && isStudentAffairs && (
                    <form action={handleDeny} className="pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">หรือปฏิเสธพร้อมระบุเหตุผล</p>
                      <input 
                        type="text" 
                        name="denialReason" 
                        required
                        placeholder="ระบุเหตุผลการปฏิเสธ..." 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 text-sm outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 transition-all"
                      />
                      <button 
                        type="submit"
                        className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                      >
                        ปฏิเสธการขออนุญาต (Deny)
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* Security Actions (Publicly clickable for now as requested, but we can add a check) */}
              {request.status === "APPROVED" && (
                <form action={handleDepart}>
                  <button className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transform transition-all flex items-center justify-center gap-3">
                    <LogOut size={24} />
                    ยืนยันการปล่อยตัวนักเรียน
                  </button>
                </form>
              )}

              {request.status === "DEPARTED" && (
                request.endDate ? (
                  <form action={handleReturn}>
                    <button className="w-full py-5 bg-slate-800 text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-slate-300 hover:bg-slate-900 hover:scale-[1.02] transform transition-all flex items-center justify-center gap-3">
                      <LogIn size={24} />
                      ยืนยันการกลับเข้าโรงเรียน
                    </button>
                  </form>
                ) : (
                  <div className="text-center p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full text-blue-600 mb-4">
                      <CheckCircle size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-blue-800">ออกนอกโรงเรียนเรียบร้อยแล้ว</h4>
                    <p className="text-blue-600/70 text-sm font-medium">ไม่มีกำหนดการกลับ ระบบสิ้นสุดกระบวนการตรวจสอบ</p>
                  </div>
                )
              )}

              {request.status === "DENIED" && (
                <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                  <p className="text-rose-600 font-bold flex items-center gap-2 mb-2">
                    <XCircle size={18} />
                    คำขอถูกปฏิเสธ
                  </p>
                  <p className="text-rose-800 font-medium">ไม่ผ่านการพิจารณา</p>
                </div>
              )}

              {request.status === "RETURNED" && (
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full text-slate-400 mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">เสร็จสิ้นกระบวนการ</h4>
                  <p className="text-slate-500 text-sm">นักเรียนกลับเข้าสถานศึกษาเรียบร้อยแล้ว</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
          Powered by Soidao School IT System
        </p>
      </div>
    </div>
  );
}
