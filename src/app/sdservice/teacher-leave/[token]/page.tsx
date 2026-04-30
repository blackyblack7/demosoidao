import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ServiceBackButton } from "@/components/layout/ServiceBackButton";
import { approveTeacherLeave } from "@/app/actions/teacher-leave";
import { TeacherLeavePrintable } from "@/components/leave/TeacherLeavePrintable";
import { TeacherLeaveDetailContent } from "@/components/leave/TeacherLeaveDetailContent";

export default async function TeacherLeaveDetailPage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const request = await prisma.teacherLeave.findUnique({
    where: { id: parseInt(token, 10) },
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

  // Role Checks
  const isPersonnelStaff = currentUser.divisions.some(div => div.divisionName.includes("บุคคล")) || currentUser.isAdmin;
  const isManager = (currentUser.positionRef?.level ?? 0) >= 8 || currentUser.isAdmin;

  async function handleAction(formData: FormData) {
    'use server';
    const decision = formData.get("decision") as any;
    const reason = formData.get("reason") as string;
    await approveTeacherLeave(request!.id, decision, reason);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-4xl mx-auto px-4">
        <ServiceBackButton />

        <TeacherLeaveDetailContent 
          request={request}
          isPersonnelStaff={isPersonnelStaff}
          isManager={isManager}
          handleAction={handleAction}
          theme="light"
        />

        {/* Hidden Printable Component */}
        {/* <TeacherLeavePrintable request={request} /> */}
      </div>
    </div>
  );
}
