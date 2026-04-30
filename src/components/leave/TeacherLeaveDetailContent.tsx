'use client'

import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MapPin, Phone, CheckCircle2, ShieldCheck, Printer } from "lucide-react";
import { LeaveStatusBadge } from "@/components/leave/LeaveStatusBadge";
import { PrintButton } from "@/app/sdservice/teacher-leave/[token]/_components/PrintButton";

interface TeacherLeaveDetailContentProps {
  request: any;
  isPersonnelStaff: boolean;
  isManager: boolean;
  handleAction: (formData: FormData) => Promise<void>;
  theme?: 'light' | 'dark';
}

export function TeacherLeaveDetailContent({ 
  request, 
  isPersonnelStaff, 
  isManager, 
  handleAction,
  theme = 'light'
}: TeacherLeaveDetailContentProps) {
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        <div className={`${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-white'} rounded-[2.5rem] p-8 md:p-12 shadow-2xl border no-print`}>
          <div className="flex justify-between items-start mb-8">
            <LeaveStatusBadge status={request.status} />
            {/* <PrintButton /> */}
          </div>

          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>บันทึกข้อความขออนุมัติลา</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">บันทึกที่ บค.1.01 • ปีงบประมาณ 2567</p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">ประเภทการลา</p>
                <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>ลา{request.leaveType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">จำนวนวันลา</p>
                <p className="text-lg font-bold text-indigo-400">{Number(request.totalDays)} วัน</p>
              </div>
            </div>

            <div className={`p-6 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3 text-center">กำหนดระยะเวลา</p>
              <div className={`flex items-center justify-center gap-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-center">
                  <p className="text-sm font-black">{format(new Date(request.startDate), "d MMMM yyyy", { locale: th })}</p>
                </div>
                <div className="h-px w-8 bg-slate-700" />
                <div className="text-center">
                  <p className="text-sm font-black">{format(new Date(request.endDate), "d MMMM yyyy", { locale: th })}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">เหตุผลการลา</p>
              <p className={`${isDark ? 'text-slate-300 bg-slate-900/30 border-slate-700' : 'text-slate-600 bg-slate-50/50 border-slate-200'} leading-relaxed font-medium p-4 rounded-xl border border-dashed`}>{request.reason}</p>
            </div>

            <div className={`grid grid-cols-2 gap-6 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'} rounded-xl flex items-center justify-center`}><MapPin size={18} /></div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase">สถานที่ติดต่อ</p>
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{request.teacher.currentHouseNumber || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'} rounded-xl flex items-center justify-center`}><Phone size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">เบอร์โทรศัพท์</p>
                  <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{request.teacher.phoneNumber || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Verification Visual */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-[2.5rem] p-8 shadow-xl border`}>
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 px-1">ข้อมูลสถิติประจำตัว</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">ลาสะสมในปีนี้ (วัน)</p>
              {isPersonnelStaff && request.status === 'PENDING' ? (
                <input 
                  type="number" 
                  name="previousLeavesCount" 
                  defaultValue={request.previousLeavesCount || 0}
                  form="approval-form"
                  className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} font-bold`}
                />
              ) : (
                <p className={`text-2xl font-black ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{request.previousLeavesCount || 0} วัน</p>
              )}
            </div>
            <div className={`p-6 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">ข้อมูลการลาครั้งสุดท้าย</p>
              {isPersonnelStaff && request.status === 'PENDING' ? (
                <input 
                  type="text" 
                  name="lastLeaveInfo" 
                  defaultValue={request.lastLeaveInfo || '-'}
                  form="approval-form"
                  className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} font-bold text-sm`}
                />
              ) : (
                <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {request.lastLeaveInfo || 'ไม่มีประวัติ'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Approval Chain */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/10 overflow-hidden relative border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          
          <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-8 relative z-10">บันทึกขั้นตอนอนุมัติ</h3>
          
          <div className="space-y-8 relative z-10">
            {/* Stage 1: Personnel */}
            <div className={`flex gap-4 ${request.staffVerifiedById ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${request.staffVerifiedById ? 'border-indigo-400 bg-indigo-400 text-white' : 'border-slate-700'}`}>
                {request.staffVerifiedById ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />}
              </div>
              <div>
                <p className="text-[9px] font-black text-indigo-300 uppercase">1. ตรวจสอบสถิติ (งานบุคคล)</p>
                <p className="text-xs font-bold mt-1 line-clamp-1">
                    {request.staffVerifiedBy ? `${request.staffVerifiedBy.prefix || ''}${request.staffVerifiedBy.firstName} ${request.staffVerifiedBy.lastName}` : 'รอการตรวจสอบ'}
                </p>
              </div>
            </div>

            {/* Stages 2-4 */}
            {[
              { label: '2. หัวหน้ากลุ่มบริหารงานบุคคล', ver: request.headApprovedById, person: request.headApprovedBy },
              { label: '3. รองผู้อำนวยการโรงเรียน', ver: request.deputyApprovedById, person: request.deputyApprovedBy },
              { label: '4. ผู้อำนวยการโรงเรียน', ver: request.directorApprovedById, person: request.directorApprovedBy },
            ].map((s, idx) => (
              <div key={idx} className={`flex gap-4 ${s.ver ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${s.ver ? 'border-indigo-400 bg-indigo-400 text-white' : 'border-slate-700'}`}>
                  {s.ver ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />}
                </div>
                <div>
                  <p className="text-[9px] font-black text-indigo-300 uppercase">{s.label}</p>
                  <p className="text-xs font-bold mt-1">
                    {s.person ? `${s.person.prefix || ''}${s.person.firstName} ${s.person.lastName}` : 'รอการพิจารณา'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Card */}
        {(isPersonnelStaff || isManager) && (request.status !== 'APPROVED' && request.status !== 'DENIED') && (
          <div className={`${isDark ? 'bg-slate-800 border-rose-900/30' : 'bg-white border-rose-100'} rounded-[2rem] p-6 shadow-xl border relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-1 bg-rose-500 h-full" />
            <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'} mb-4`}>ดำเนินการทางธุรการ</h3>
            
            <form action={handleAction} id="approval-form" className="space-y-4">
              <div className={`${isDark ? 'bg-rose-900/20 border-rose-900/30' : 'bg-rose-50 border-rose-100'} p-4 rounded-2xl mb-4 flex items-start gap-3 border`}>
                <ShieldCheck className="text-rose-500 shrink-0" size={18} />
                <p className={`text-[10px] font-bold ${isDark ? 'text-rose-300' : 'text-rose-700'} leading-relaxed uppercase`}>การดำเนินการในขั้นตอนนี้จะถูกบันทึกรหัสผู้ใช้งานและวันเวลาที่กระทำจริงลงในระบบ</p>
              </div>
              
              <button name="decision" value="VERIFY" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                <CheckCircle2 size={18} />
                ยืนยัน / อนุมัติขั้นถัดไป
              </button>
              
              <div className={`pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <textarea 
                  name="reason" 
                  placeholder="ระบุเหตุผล (กรณีไม่อนุมัติ)..." 
                  className={`w-full p-3 ${isDark ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-100'} border rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20 transition-all mb-3`}
                />
                <button name="decision" value="DENY" className={`w-full py-3 ${isDark ? 'bg-rose-900/20 text-rose-400 border-rose-900/30' : 'bg-rose-50 text-rose-500 border-rose-100'} rounded-xl font-bold border hover:bg-rose-500 hover:text-white transition-all`}>
                  ระงับคำขอ / ไม่อนุมัติ
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
