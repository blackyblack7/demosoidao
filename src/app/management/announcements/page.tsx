import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Bell, 
  Plus, 
  ChevronRight
} from "lucide-react";
import AnnouncementsList from "./_components/AnnouncementsList";

export default async function AnnouncementsManagementPage() {
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) redirect("/access-denied");

  const announcements = await prisma.blogPost.findMany({
    where: {
      categoryRef: { name: 'ประกาศ' }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/sdservice" className="hover:text-blue-600 transition-colors">SD Service</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">จัดการประกาศโรงเรียน</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 text-indigo-600 rounded-2xl">
                <Bell size={32} />
              </div>
              จัดการประกาศโรงเรียน
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              เพิ่ม แก้ไข และลบประกาศสำคัญของโรงเรียนสอยดาววิทยา
            </p>
          </div>
          
          <Link 
            href="/management/announcements/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
          >
            <Plus size={20} />
            เพิ่มประกาศใหม่
          </Link>
        </div>

        <AnnouncementsList initialAnnouncements={announcements} />
      </div>
    </div>
  );
}
