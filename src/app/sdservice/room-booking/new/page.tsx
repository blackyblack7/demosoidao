import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRooms } from "@/app/actions/room-booking";
import { ServiceBackButton } from "@/components/layout/ServiceBackButton";
import NewBookingForm from "./_components/NewBookingForm";

export default async function NewBookingPage() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") redirect("/login");

  const [rooms, teacher] = await Promise.all([
    getRooms(),
    prisma.teacher.findUnique({
      where: { id: session.userId },
      include: {
        department: true,
        divisions: true,
      },
    }),
  ]);

  // Build org options from teacher data
  const orgOptions: string[] = [];
  if (teacher?.department?.departmentName) {
    orgOptions.push(teacher.department.departmentName);
  }
  for (const div of teacher?.divisions || []) {
    orgOptions.push(div.divisionName);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-3xl mx-auto px-4">
        <ServiceBackButton />

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
            จองห้อง<span className="text-violet-600">ใหม่</span>
          </h1>
          <p className="text-slate-500 font-medium">
            กรอกรายละเอียดเพื่อยื่นคำขอจองห้องโสตทัศนศึกษา
          </p>
        </div>

        <NewBookingForm
          rooms={JSON.parse(JSON.stringify(rooms))}
          orgOptions={orgOptions}
        />
      </div>
    </div>
  );
}
