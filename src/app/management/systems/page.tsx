import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings, ShieldAlert, ChevronRight } from "lucide-react";
import SystemStatusManager from "./_components/SystemStatusManager";

export default async function SystemManagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId }
  });

  if (!teacher || !teacher.isAdmin) redirect("/access-denied");

  const statuses = await prisma.systemService.findMany();

  return (
    <div className="min-h-screen bg-slate-900 pb-20 pt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/management" className="hover:text-blue-400 transition-colors">Management Hub</Link>
          <ChevronRight size={14} />
          <span className="text-white font-bold">จัดการสถานะระบบ</span>
        </nav>

        <div className="flex items-center gap-6 mb-12">
          <div className="p-4 bg-amber-500 text-white rounded-[2rem] shadow-2xl shadow-amber-500/20">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">จัดการสถานะระบบ</h1>
            <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-sm">System Maintenance Control</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-amber-400">
            <ShieldAlert size={24} className="shrink-0" />
            <p className="text-sm font-bold leading-relaxed">
              คำเตือน: การเปิดโหมดซ่อมบำรุงจะเป็นการแสดงสถานะ "Maintenance" ในหน้า Service Hub สำหรับผู้ใช้งานทั่วไป 
              แต่ระบบจะยังคงทำงานและเข้าถึงได้ตามปกติ
            </p>
          </div>

          <SystemStatusManager initialStatuses={JSON.parse(JSON.stringify(statuses))} />
        </div>
      </div>
    </div>
  );
}
