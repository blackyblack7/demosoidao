import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ServiceBackButton } from "@/components/layout/ServiceBackButton";
import LeaveRequestForm from "./_components/LeaveRequestForm";
import { getTeacherLeaveStats, getFiscalYear } from "@/app/actions/teacher-leave";
import { getTeacherLeaveMetadataOptions } from "@/app/actions/metadata";

export default async function NewTeacherLeavePage() {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') {
    redirect("/login");
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId }
  });

  if (!teacher) redirect("/login");

  // Check for required address info
  const hasAddress = teacher.houseNumber && teacher.subDistrict && teacher.district && teacher.province && teacher.zipCode;
  
  if (!hasAddress) {
    // Redirect to profile with a message (handled via query param if needed, or just let them see the empty fields)
    redirect("/profile?error=address_required");
  }

  const currentFiscalYear = await getFiscalYear();
  const stats = await getTeacherLeaveStats(session.userId, currentFiscalYear);
  const metadata = await getTeacherLeaveMetadataOptions();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-3xl mx-auto px-4">
        <ServiceBackButton />
        
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
            เขียนใบลา <span className="text-indigo-600">บค.1.01</span>
          </h1>
          <p className="text-slate-500 font-medium">บันทึกข้อความขออนุมัติลาข้าราชการครูและบุคลากรทางการศึกษา</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/60 border border-white">
          <LeaveRequestForm 
            teacher={teacher} 
            stats={stats} 
            fiscalYear={currentFiscalYear} 
            leaveTypes={metadata.leaveTypes}
          />
        </div>
      </div>
    </div>
  );
}
