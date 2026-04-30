import { checkAdminAccess } from "@/lib/auth";
// Force refresh
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GROUP_KEYS } from "@/constants";
import DivisionManager from "./_components/DivisionManager";

export default async function DivisionsManagementPage() {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
  if (!hasAccess) redirect("/sdservice");

  const groups = await prisma.adminGroup.findMany({
    include: {
      head: true,
      divisions: {
        orderBy: { divisionName: 'asc' },
        include: {
          head: true,
          _count: {
            select: { teachers: true }
          }
        }
      }
    },
    orderBy: { id: 'asc' }
  });

  const teachers = await prisma.teacher.findMany({
    where: { isAdmin: false },
    orderBy: { firstName: 'asc' }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/sdservice" className="hover:text-blue-600 transition-colors">SD Service</Link>
          <span>&gt;</span>
          <Link href="/management/personnel/teachers" className="hover:text-blue-600 transition-colors">จัดการบุคลากร</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-bold">จัดการฝ่ายงาน</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200">
              {/* Icon removed for debugging */}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 leading-none">จัดการฝ่ายงาน</h1>
              <p className="text-slate-500 font-bold mt-2 text-sm uppercase tracking-widest">Division Management</p>
            </div>
          </div>
        </div>

        <DivisionManager 
          initialGroups={JSON.parse(JSON.stringify(groups))} 
          teachers={JSON.parse(JSON.stringify(teachers))} 
        />
      </div>
    </div>
  );
}
