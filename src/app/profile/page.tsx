import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { userId, role } = session;

  let userData: any = null;

  if (role === "TEACHER") {
    userData = await prisma.teacher.findUnique({
      where: { id: userId },
      include: {
        department: true,
        divisions: {
          include: { group: true }
        },
        extraDuties: true,
        homerooms: {
          include: { term: true }
        }
      }
    });
  } else if (role === "STUDENT") {
    userData = await prisma.student.findUnique({
      where: { id: userId },
      include: {
        termData: {
          orderBy: { id: 'desc' },
          take: 1
        },
        parents: true,
        addresses: {
          where: { addressTypeRef: { name: "ที่อยู่ปัจจุบัน" } },
          take: 1
        }
      }
    });
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 glass rounded-3xl">
          <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูลผู้ใช้</h1>
          <a href="/" className="text-blue-600 hover:underline">กลับหน้าหลัก</a>
        </div>
      </div>
    );
  }

  return <ProfileContent userData={userData} role={role} />;
}
