import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import EditTeacherForm from "../_components/EditTeacherForm";
import { getTeacherMetadataOptions } from "@/app/actions/metadata";

interface EditTeacherProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeacherPage({ params }: EditTeacherProps) {
  const { id } = await params;
  
  // Use robust check that always checks DB for the most current status
  const hasAccess = await checkAdminAccess("กลุ่มบริหารงานบุคคล")
  if (!hasAccess) redirect("/access-denied");

  const teacherId = parseInt(id);
  if (isNaN(teacherId)) notFound();

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      divisions: {
        include: { group: true }
      },
      adminGroups: true,
      positionRef: true,
    }
  });

  // Block SuperAdmin and executives (ผอ./รอง ผอ. — level >= 8)
  if (!teacher || teacher.isAdmin || (teacher.positionRef && teacher.positionRef.level >= 8)) notFound();

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
          <span className="text-slate-800 font-bold tracking-tight">แก้ไขข้อมูล: {teacher.firstName}</span>
        </nav>

        <EditTeacherForm 
           teacher={JSON.parse(JSON.stringify(teacher))} 
           departments={JSON.parse(JSON.stringify(departments))} 
           divisions={JSON.parse(JSON.stringify(divisions))} 
           adminGroups={JSON.parse(JSON.stringify(adminGroups))}
           metadata={metadata}
        />
      </div>
    </div>
  );
}
