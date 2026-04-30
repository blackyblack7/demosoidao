'use client'

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export function ServiceBackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/sdservice');
    // We can also force a refresh to ensure latest data on dashboard
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  return (
    <button 
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all active:scale-95 group mb-6"
    >
      <Home size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
      <span>กลับหน้า Dashboard</span>
    </button>
  );
}
