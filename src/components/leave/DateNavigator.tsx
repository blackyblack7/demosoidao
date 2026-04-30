'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, subDays, startOfToday } from 'date-fns';
import { th } from 'date-fns/locale';

export default function DateNavigator({ currentDate }: { currentDate: Date }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    router.push(`?${params.toString()}`);
  };

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(startOfToday(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigateToDate(subDays(currentDate, 1))}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
          title="วันก่อนหน้า"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex items-center gap-3 px-6 py-2 bg-slate-50 rounded-xl">
          <Calendar size={18} className="text-blue-500" />
          <span className="font-bold text-slate-700 min-w-[120px] text-center">
            {format(currentDate, 'd MMM yyyy', { locale: th })}
          </span>
        </div>

        <button
          onClick={() => navigateToDate(addDays(currentDate, 1))}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
          title="วันถัดไป"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {!isToday && (
        <button
          onClick={() => navigateToDate(startOfToday())}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
        >
          กลับมาวันนี้
        </button>
      )}
    </div>
  );
}
