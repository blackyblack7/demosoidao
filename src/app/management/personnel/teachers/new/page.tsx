import { checkAdminAccess } from "@/lib/auth";
// Force refresh
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, X, User } from "lucide-react";
import CreateTeacherForm from "../_components/CreateTeacherForm";
import { getTeacherMetadataOptions } from "@/app/actions/metadata";

export default async function NewTeacherPage() {
  const hasAccess = await checkAdminAccess("กลุ่มบริหารงานบุคคล");
  if (!hasAccess) redirect("/sdservice");

  const metadata = await getTeacherMetadataOptions();
  const departments = await prisma.academicDepartment.findMany({ orderBy: { departmentName: 'asc' } });
  const divisions = await prisma.adminDivision.findMany({ 
    include: { group: true },
    orderBy: { divisionName: 'asc' } 
  });
  const adminGroups = await prisma.adminGroup.findMany({ orderBy: { groupName: 'asc' } });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/sdservice" className="hover:text-blue-600 transition-colors">SD Service</Link>
          <ChevronRight size={14} />
          <Link href="/management/personnel/teachers" className="hover:text-blue-600 transition-colors">จัดการบุคลากร</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-bold">ลงทะเบียนบุคลากรใหม่</span>
        </nav>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-white">
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                <User size={28} />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">ลงทะเบียนบุคลากรใหม่</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Registration</span>
              </div>
            </h1>
            <Link href="/management/personnel/teachers" className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-all">
              <X size={28} />
            </Link>
          </div>

          <CreateTeacherForm 
            departments={JSON.parse(JSON.stringify(departments))} 
            divisions={JSON.parse(JSON.stringify(divisions))} 
            adminGroups={JSON.parse(JSON.stringify(adminGroups))}
            metadata={metadata}
          />
        </div>
      </div>
    </div>
  );
}
