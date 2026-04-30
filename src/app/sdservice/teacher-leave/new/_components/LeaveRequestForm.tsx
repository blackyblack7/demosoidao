'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Phone, MapPin, AlignLeft, Send, Loader2, AlertCircle, Info } from 'lucide-react';
import { submitTeacherLeaveRequest } from '@/app/actions/teacher-leave';
import { format, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';

interface Props {
  teacher: any;
  stats: any;
  fiscalYear: number;
  leaveTypes: any[];
}

export default function LeaveRequestForm({ teacher, stats, fiscalYear, leaveTypes }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Construct initial address from teacher's profile
  const initialAddress = [
    teacher.houseNumber ? `บ้านเลขที่ ${teacher.houseNumber}` : '',
    teacher.moo ? `หมู่ที่ ${teacher.moo}` : '',
    teacher.subDistrict ? `ต.${teacher.subDistrict}` : '',
    teacher.district ? `อ.${teacher.district}` : '',
    teacher.province ? `จ.${teacher.province}` : '',
    teacher.zipCode || '',
  ].filter(Boolean).join(' ');

  const [formData, setFormData] = useState({
    leaveTypeId: leaveTypes[0]?.id.toString() || '',
    startDate: '',
    endDate: '',
    totalDays: '',
    reason: '',
    contactAddress: initialAddress,
    contactPhone: teacher.phoneNumber || '',
  });

  // Automatically calculate total days (simplified: includes weekends for now, we can refine if requested)
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = differenceInDays(end, start) + 1;
      if (days > 0) {
        setFormData(prev => ({ ...prev, totalDays: days.toString() }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    const result = await submitTeacherLeaveRequest(data);

    if ('error' in result) {
      setError((result as any).error);
      setLoading(false);
    } else {
      router.push('/sdservice/teacher-leave');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-shake">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Leave Type Selection */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">ประเภทการเสนอลา</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {leaveTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setFormData({ ...formData, leaveTypeId: type.id.toString() })}
              className={`p-4 rounded-2xl border-2 font-bold transition-all text-sm ${
                formData.leaveTypeId === type.id.toString()
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100 translate-y-[-2px]'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">ตั้งแต่วันที่</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">ถึงวันที่</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Statistics Display */}
        <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100">
          <h4 className="text-xs font-black text-indigo-900 mb-4 flex items-center gap-2">
            <Info size={14} />
            สถิติการลาประจำปีงบประมาณ {fiscalYear}
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">รวมวันลาครั้งนี้:</span>
              <span className="font-bold text-indigo-600">{formData.totalDays || '0'} วัน</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">ลาสะสม ({leaveTypes.find(t => t.id.toString() === formData.leaveTypeId)?.name}):</span>
              <span className="font-bold text-slate-700">
                {(() => {
                  const typeName = leaveTypes.find(t => t.id.toString() === formData.leaveTypeId)?.name || '';
                  if (typeName.includes('ป่วย')) return stats.totals.SICK;
                  if (typeName.includes('กิจ')) return stats.totals.PERSONAL;
                  if (typeName.includes('พักผ่อน')) return stats.totals.VACATION;
                  if (typeName.includes('คลอด')) return stats.totals.MATERNITY;
                  if (typeName.includes('อุปสมบท')) return stats.totals.RELIGIOUS;
                  return stats.totals.OTHER;
                })()} วัน
              </span>
            </div>
            {stats.lastLeave && (
              <div className="pt-4 mt-4 border-t border-indigo-100/50">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">ข้อมูลการลาล่าสุด</p>
                <p className="text-xs font-bold text-slate-600">
                  {format(new Date(stats.lastLeave.startDate), "d MMM yy", { locale: th })} ({Number(stats.lastLeave.totalDays)} วัน)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">เนื่องจาก / เหตุผลการลา</label>
          <div className="relative">
            <AlignLeft className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea
              required
              rows={3}
              placeholder="ระบุเหตุผลในการลา..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">สถานที่ติดต่อได้ระหว่างลา</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="บ้านเลขที่, ถนน..."
                value={formData.contactAddress}
                onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">เบอร์โทรศัพท์ที่ติดต่อได้</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="tel"
                placeholder="0xx-xxx-xxxx"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 hover:bg-slate-800 hover:shadow-2xl transition-all disabled:opacity-50 disabled:scale-95 flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Send size={24} />
              ส่งใบลาแบบดิจิทัล
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6">
          Digital Memorandum บค.1.01 • Soidao Wittaya School
        </p>
      </div>
    </form>
  );
}
