'use client'

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer"
      title="พิมพ์ใบลา"
    >
      <Printer size={20} />
    </button>
  );
}
