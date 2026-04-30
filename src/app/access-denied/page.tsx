import Link from 'next/link';
import { CloudRain, Home, Frown, Waves } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decor: Sad Blue Glow */}
      <div className="absolute bottom-0 left-0 w-full h-[600px] bg-blue-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Rain Effect using CSS Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')]" />

      <div className="max-w-md w-full text-center space-y-12 relative z-10">
        <div className="relative inline-block group">
           <div className="absolute -inset-4 bg-blue-600 rounded-full blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
           <div className="relative p-10 bg-slate-900/50 rounded-full border border-blue-900/30 flex flex-col items-center justify-center backdrop-blur-sm gap-2">
             <CloudRain size={48} className="text-blue-400 animate-bounce" />
             <Frown size={60} className="text-slate-500" />
           </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-blue-100/80 tracking-tight lowercase italic">
             คนไม่มีสิทธิ์...
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-slate-700" />
            <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.4em]">
               HUGO - SIBLOR
            </p>
            <div className="h-px w-8 bg-slate-700" />
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[40px] border border-blue-900/20 shadow-2xl space-y-8 relative overflow-hidden">
           {/* Melancholy waves decor */}
           <Waves className="absolute bottom-0 left-0 w-full opacity-5 text-blue-400" size={120} />
           
           <div className="space-y-4">
              <p className="text-slate-300 font-medium leading-relaxed italic text-lg">
                "ก็แค่คนเดินดิน... คนธรรมดา... <br/>
                ไม่มีสิทธิ์คลิก... ไม่มีสิทธิ์แก้ ข้อมูลใด..."
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                ไม่คู่ควรจะเข้าหน้าของ Admin อย่างเธอ <br/>
                เจียมตัวและเตรียมใจ ยอมรับความจริงแล้วกลับไปหน้าหลักเถอะครับ
              </p>
           </div>

           <Link 
            href="/"
            className="flex items-center justify-center gap-3 w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 border border-slate-700/50 shadow-xl group"
           >
             <Home size={20} className="opacity-60 group-hover:opacity-100 transition-opacity" />
             กลับไปที่ทางของเรา (หน้าหลัก)
           </Link>
        </div>

        <div className="flex flex-col items-center gap-2 opacity-30">
           <div className="flex gap-1">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
             ))}
           </div>
           <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              403 Forbidden - Melancholy Edition
           </p>
        </div>
      </div>
    </div>
  );
}
