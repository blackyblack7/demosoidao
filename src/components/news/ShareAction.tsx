'use client';

import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareActionProps {
  title: string;
  text?: string;
}

export default function ShareAction({ title, text }: ShareActionProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || `อ่านข่าวสารล่าสุดจากโรงเรียนสอยดาววิทยา: ${title}`,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={handleShare}
        className="group flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-indigo-600 transition-all duration-500 shadow-xl shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
      >
        <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
        {copied ? 'คัดลอกลิงก์แล้ว!' : 'แชร์ข่าวสารนี้'}
      </button>
      
      {/* Visual Feedback for Clipboard */}
      <div className={`flex items-center gap-2 text-indigo-600 font-bold text-sm transition-all duration-300 ${copied ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
          <Check size={16} />
        </div>
        Copied
      </div>
    </div>
  );
}
