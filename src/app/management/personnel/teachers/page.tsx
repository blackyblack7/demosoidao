import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import TeacherList from "./_components/TeacherList";

export default async function PersonnelManagementPage() {
  const hasAccess = await checkAdminAccess("กลุ่มบริหารงานบุคคล");

  if (!hasAccess) {
    redirect("/access-denied");
  }

  const [teachers, departments, groups] = await Promise.all([
    prisma.teacher.findMany({
      where: {
        // Hide superadmins and executives (ผอ./รอง ผอ.) from personnel management
        isAdmin: false,
        OR: [
          { positionRef: null },
          { positionRef: { level: { lt: 8 } } },
        ],
      },
      include: {
        divisions: {
          include: { group: true }
        },
        department: true,
        positionRef: true,
        adminGroups: true,
      },
      orderBy: { firstName: 'asc' }
    }),
    prisma.academicDepartment.findMany({ orderBy: { departmentName: 'asc' } }),
    prisma.adminGroup.findMany({ orderBy: { groupName: 'asc' } }),
  ]);

  const serialized = {
    teachers: JSON.parse(JSON.stringify(teachers)),
    departments: JSON.parse(JSON.stringify(departments)),
    groups: JSON.parse(JSON.stringify(groups)),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <span className="hover:text-blue-600 transition-colors">SD Service</span>
          <span>&gt;</span>
          <span className="text-slate-800">จัดการบุคลากร</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 text-blue-600 rounded-2xl">
                {/* Icon removed */}
              </div>
              จัดการข้อมูลบุคลากร
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              ระบบส่วนกลางสำหรับดูแลและจัดการฐานข้อมูลบุคลากรทางการศึกษาทั้งหมด
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/management/personnel/divisions"
              className="inline-flex items-center gap-2 px-6 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all"
            >
              จัดการฝ่ายงาน
            </Link>
            <Link 
              href="/management/personnel/teachers/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1"
            >
              เพิ่มบุคลากรใหม่
            </Link>
          </div>
        </div>

        {/* Interactive Teacher List */}
        <TeacherList 
          initialTeachers={serialized.teachers} 
          departments={serialized.departments}
          groups={serialized.groups}
        />

      </div>
    </div>
  );
}
