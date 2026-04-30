"use client"

import { useState } from 'react';
import { Settings, ShieldAlert, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toggleServiceMaintenance } from '@/app/actions/systems';

interface SystemStatusManagerProps {
  initialStatuses: any[];
}

const SERVICE_LIST = [
  { key: 'teacher-leave', name: 'ระบบการลาบุคลากร (บค.1.01)' },
  { key: 'student-leave', name: 'ระบบขออนุญาตออกนอกโรงเรียน' },
  { key: 'sgs', name: 'SGS (ครู/นักเรียน)' },
  { key: 'emoney', name: 'e-Money' },
  { key: 'timetable', name: 'ตารางเรียนออนไลน์' },
  { key: 'classroom', name: 'Google Classroom' },
  { key: 'library', name: 'Digital Library' },
  { key: 'student-council', name: 'กิจกรรม/สภานักเรียน' },
  { key: 'contact', name: 'ติดต่อสอบถาม' },
];

export default function SystemStatusManager({ initialStatuses }: SystemStatusManagerProps) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(serviceKey: string, currentStatus: boolean) {
    setLoadingKey(serviceKey);
    setError(null);

    const result = await toggleServiceMaintenance(serviceKey, !currentStatus);

    if (result.success) {
      // Update local state
      setStatuses((prev: any[]) => {
        const exists = prev.find(s => s.serviceKey === serviceKey);
        if (exists) {
          return prev.map(s => s.serviceKey === serviceKey ? { ...s, isUnderMaintenance: !currentStatus } : s);
        } else {
          return [...prev, { serviceKey, isUnderMaintenance: !currentStatus }];
        }
      });
    } else {
      setError(result.error || "เกิดข้อผิดพลาด");
    }
    setLoadingKey(null);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 font-bold text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICE_LIST.map((service) => {
          const statusEntry = statuses.find(s => s.serviceKey === service.key);
          const isMaintenance = statusEntry?.isUnderMaintenance || false;
          const isActive = !isMaintenance;
          const isLoading = loadingKey === service.key;

          return (
            <div 
              key={service.key}
              className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${
                !isActive 
                ? "bg-amber-500/5 border-amber-500/10" 
                : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${!isActive ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                  {!isActive ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div>
                  <h3 className={`font-bold leading-tight ${!isActive ? "text-amber-500/80" : "text-white"}`}>
                    {service.name}
                  </h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${!isActive ? "text-amber-500" : "text-emerald-500"}`}>
                    {!isActive ? "Maintenance Mode" : "System Active"}
                  </p>
                </div>
              </div>

              <button
                disabled={isLoading}
                onClick={() => handleToggle(service.key, isMaintenance)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                  isActive ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <span className="sr-only">Toggle Status</span>
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-7" : "translate-x-1"
                  } flex items-center justify-center`}
                >
                  {isLoading && <Loader2 size={12} className="animate-spin text-slate-900" />}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
