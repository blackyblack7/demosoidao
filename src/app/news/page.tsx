import { prisma } from "@/lib/prisma";
import { ChevronRight, Newspaper, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { getSession } from "@/lib/auth";
import * as motion from "framer-motion/client";
import NewsArchiveList from "@/components/news/NewsArchiveList";
import { getNewsPaginated } from "@/app/actions/news";

export const metadata = {
  title: "คลังข่าวสารล่าสุด | โรงเรียนสอยดาววิทยา",
  description: "ศูนย์รวมข่าวสาร กิจกรรม และประกาศอย่างเป็นทางการจากโรงเรียนสอยดาววิทยา ทันเหตุการณ์ทุกความเคลื่อนไหว",
};

export default async function NewsArchivePage() {
  const session = await getSession();
  
  // Initial load: 30 items
  const res = await getNewsPaginated({ page: 1, limit: 30 });

  // Categories for filtering
  const categories = ["ทั้งหมด", "สาระน่ารู้", "กิจกรรม", "วิชาการ", "กีฬา"];

  return (
    <main className="min-h-screen bg-slate-50/30 pb-32 pt-32 font-body">
      <Navbar session={session ? { name: session.name, role: session.role } : null} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header Section */}
        <div className="relative mb-20">
           {/* Background abstraction */}
           <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
           
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
              <div className="space-y-6 max-w-2xl">
                <nav className="flex text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 items-center gap-3">
                  <a href="/" className="hover:text-indigo-600 transition-colors">Home</a>
                  <ChevronRight size={10} />
                  <span className="text-indigo-600">Newsroom</span>
                </nav>
                
                <div className="space-y-4">
                  <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-[-0.05em] leading-[0.85]">
                    The Latest <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 underline decoration-indigo-200 decoration-8 underline-offset-[12px]">Updates.</span>
                  </h1>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg pt-4">
                    ศูนย์รวมข้อมูลข่าวสารอย่างเป็นทางการของ <span className="text-slate-900 font-black">โรงเรียนสอยดาววิทยา</span> ติดตามกิจกรรมยามเช้าไปจนถึงความสำเร็จระดับประเทศ
                  </p>
                </div>
              </div>

              {/* Decorative Newspaper Icon with Badge */}
              <div className="hidden lg:block relative shrink-0">
                  <motion.div 
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-56 h-56 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center border border-slate-100 relative group"
                  >
                     <Newspaper size={80} strokeWidth={1} className="text-slate-200 group-hover:text-indigo-500 transition-colors duration-500" />
                     <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-200 border-4 border-white rotate-12">
                        <Sparkles size={32} className="text-white" />
                     </div>
                  </motion.div>
              </div>
           </div>
        </div>

        {/* Client-side List with Pagination & Filtering */}
        <NewsArchiveList 
          initialNews={res.items} 
          initialHasMore={res.hasMore} 
          categories={categories}
        />
      </div>
    </main>
  );
}
