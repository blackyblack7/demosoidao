import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { approveTeacherLeave } from "@/app/actions/teacher-leave";
import { TeacherLeavePrintable } from "@/components/leave/TeacherLeavePrintable";
import { TeacherLeaveDetailContent } from "@/components/leave/TeacherLeaveDetailContent";

export default async function AdminLeaveDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const request = await prisma.teacherLeave.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      teacher: true,
      staffVerifiedBy: true,
      headApprovedBy: true,
      deputyApprovedBy: true,
      directorApprovedBy: true
    }
  });

  if (!request) notFound();

  // Get logged in teacher's details to check roles
  const currentUser = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true, positionRef: true }
  });

  if (!currentUser) redirect("/login");

  // Role Checks - Stricter for Admin page
  const isPersonnelStaff = currentUser.divisions.some(div => div.divisionName.includes("บุคคล")) || currentUser.isAdmin;
  if (!isPersonnelStaff) redirect("/access-denied");

  const isManager = (currentUser.positionRef?.level ?? 0) >= 8 || currentUser.isAdmin;

  async function handleAction(formData: FormData) {
    'use server';
    const decision = formData.get("decision") as any;
    const reason = formData.get("reason") as string;
    await approveTeacherLeave(request!.id, decision, reason);
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 pt-28">
      <div className="max-w-5xl mx-auto px-4">
        {/* Admin Navigation */}
        <div className="mb-8 flex items-center justify-between">
            <Link 
                href="/management/personnel/leave"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
            >
                <ChevronLeft size={20} />
                กลับสู่หน้าจัดการการลา
            </Link>
            <div className="text-right">
                <h1 className="text-xl font-bold text-white">รายละเอียดใบลา</h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Admin Management View</p>
            </div>
        </div>

        <TeacherLeaveDetailContent 
          request={request}
          isPersonnelStaff={isPersonnelStaff}
          isManager={isManager}
          handleAction={handleAction}
          theme="dark"
        />

        {/* Hidden Printable Component */}
        {/* <TeacherLeavePrintable request={request} /> */}
      </div>
    </div>
  );
}
