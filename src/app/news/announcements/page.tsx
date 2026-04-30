import { ChevronRight, Bell, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { getSession } from "@/lib/auth";
import * as motion from "framer-motion/client";
import AnnouncementsArchiveList from "@/components/news/AnnouncementsArchiveList";
import { getAnnouncementsPaginated } from "@/app/actions/news";

export const metadata = {
  title: "ประกาศโรงเรียนสอยดาววิทยา | รวมประกาศทั้งหมด",
  description: "ศูนย์รวมประกาศอย่างเป็นทางการจากโรงเรียนสอยดาววิทยา ติดตามประกาศสำคัญ เอกสาร และข้อมูลข่าวสารจากทางโรงเรียน",
};

export default async function AnnouncementsArchivePage() {
  const session = await getSession();

  // Initial load: 20 items
  const res = await getAnnouncementsPaginated({ page: 1, limit: 20 });

  return (
    <main className="min-h-screen bg-amber-50/20 pb-32 pt-32 font-body">
      <Navbar session={session ? { name: session.name, role: session.role } : null} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="relative mb-20">
          {/* Background glow */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -top-10 right-20 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
            <div className="space-y-6 max-w-2xl">
              <nav className="flex text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 items-center gap-3">
                <a href="/" className="hover:text-amber-600 transition-colors">Home</a>
                <ChevronRight size={10} />
                <a href="/news" className="hover:text-amber-600 transition-colors">Newsroom</a>
                <ChevronRight size={10} />
                <span className="text-amber-600">Announcements</span>
              </nav>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-[-0.05em] leading-[0.85]">
                  ประกาศ
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 underline decoration-amber-200 decoration-8 underline-offset-[12px]">
                    โรงเรียน.
                  </span>
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg pt-4">
                  รวมประกาศอย่างเป็นทางการจาก{" "}
                  <span className="text-slate-900 font-black">โรงเรียนสอยดาววิทยา</span>{" "}
                  ติดตามข้อมูลสำคัญ เอกสาร และข่าวประชาสัมพันธ์จากทุกฝ่ายงาน
                </p>
              </div>
            </div>

            {/* Decorative Bell Icon */}
            <div className="hidden lg:block relative shrink-0">
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                className="w-56 h-56 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center border border-amber-100 relative group"
              >
                <Bell size={80} strokeWidth={1} className="text-amber-200 group-hover:text-amber-500 transition-colors duration-500" />
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-200 border-4 border-white rotate-12">
                  <Sparkles size={32} className="text-white" />
                </div>
                {/* Notification dot */}
                <div className="absolute top-6 right-8 w-4 h-4 bg-rose-500 rounded-full animate-ping" />
                <div className="absolute top-6 right-8 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Client-side List with Pagination & Search */}
        <AnnouncementsArchiveList
          initialItems={res.items}
          initialHasMore={res.hasMore}
          initialTotal={res.total}
        />
      </div>
    </main>
  );
}
