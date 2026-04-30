import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronRight,
  Settings,
  Calendar
} from "lucide-react";
import AcademicYearList from "./_components/AcademicYearList";

export default async function AcademicYearsPage() {
  // Strict check for Super Admin or those with access to system settings
  const session = await (await import('@/lib/auth')).getSession();
  if (!session || (session.userId !== 1 && !session.isAdmin)) {
    redirect("/access-denied");
  }

  const years = await prisma.academicYear.findMany({
    orderBy: [
      { year: 'desc' },
      { semester: 'desc' }
    ]
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/sdservice" className="hover:text-blue-600 transition-colors">SD Service</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">ตั้งค่าปีการศึกษา</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100">
                <Settings size={32} />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  ตั้งค่าปีการศึกษา (System settings)
                </h1>
                <p className="text-slate-500 mt-1 font-medium">
                  กำหนดบริบทของระบบทะเบียนและระบบสารสนเทศทั้งหมด
                </p>
             </div>
          </div>
        </div>

        {/* List & Form */}
        <AcademicYearList initialYears={years} />

      </div>
    </div>
  );
}
