import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServiceHub from "./_components/ServiceHub";

export default async function SDServicePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { role, name } = session;
  const isTeacher = role === "TEACHER";

  const teacherData = isTeacher ? await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: true }
  }) : null;

  const isStudentAffairs = teacherData?.divisions.some(div => div.divisionName === "งานกิจการนักเรียน") || teacherData?.isAdmin;

  const systemStatuses = await prisma.systemService.findMany();
  const maintenanceStatuses = systemStatuses.reduce((acc, s) => {
    acc[s.serviceKey] = s.isUnderMaintenance;
    return acc;
  }, {} as Record<string, boolean>);

  const teacherServices = [
    {
      key: "teacher-leave",
      title: "ระบบการลาบุคลากร (บค.1.01)",
      description: "ยื่นใบลา ตรวจสอบสถิติการลาประจำปีงบประมาณ และติดตามสถานะการอนุมัติ",
      iconName: "Briefcase",
      href: "/sdservice/teacher-leave",
      color: "bg-indigo-600"
    },
    {
      key: "room-booking",
      title: "จองห้องโสตทัศนศึกษา",
      description: "จองห้องประชุม หอประชุม และขออุปกรณ์โสตทัศนศึกษาสำหรับกิจกรรมต่างๆ",
      iconName: "Monitor",
      href: "/sdservice/room-booking",
      color: "bg-violet-600"
    },
    {
      key: "sgs",
      title: "SGS (ครู)",
      description: "ระบบบันทึกคะแนนและผลการเรียนนักเรียนมัธยมศึกษา",
      iconName: "ClipboardCheck",
      href: "https://sgs.bopp-obec.info/",
      color: "bg-blue-500"
    }
  ];

  const studentServices = [
    {
      key: "sgs",
      title: "SGS (นักเรียน)",
      description: "ระบบตรวจสอบผลการเรียนและคะแนนเก็บรายวิชา",
      iconName: "GraduationCap",
      href: "https://sgs.bopp-obec.info/",
      color: "bg-blue-600"
    },
    {
      key: "timetable",
      title: "ตารางเรียนออนไลน์",
      description: "เช็คตารางเรียนรายวันและรายสัปดาห์ของชั้นเรียนตนเอง",
      iconName: "Calendar",
      href: "#",
      color: "bg-indigo-600"
    },
    {
      key: "student-leave",
      title: "ขออนุญาตออกนอกโรงเรียน",
      description: "แจ้งขออนุญาตออกนอกบริเวณโรงเรียนและรับ QR Code เพื่อความปลอดภัย",
      iconName: "QrCode",
      href: "/sdservice/student-leave",
      color: "bg-indigo-600"
    },
    {
      key: "student-council",
      title: "กิจกรรม/สภานักเรียน",
      description: "ติดตามข่าวสารกิจกรรมและข้อมูลสภานักเรียน",
      iconName: "Users",
      href: "#",
      color: "bg-rose-600"
    },
    {
      key: "contact",
      title: "ติดต่อสอบถาม",
      description: "ช่องทางสอบถามข้อมูลเบื้องต้นกับงานทะเบียนและแนะแนว",
      iconName: "MessageSquare",
      href: "#",
      color: "bg-amber-600"
    }
  ];

  const services = isTeacher ? teacherServices : studentServices;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            Soidao Service Hub
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
                SD <span className="text-blue-600">Service</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl">
                ยินดีต้อนรับคุณ <span className="font-bold text-slate-700">{name}</span> เข้าสู่ศูนย์รวมแอปพลิเคชันและบริการออนไลน์ของโรงเรียนสอยดาววิทยา
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid (Client Component) */}
        <ServiceHub 
          services={JSON.parse(JSON.stringify(services))} 
          maintenanceStatuses={JSON.parse(JSON.stringify(maintenanceStatuses))} 
          userName={name} 
        />
      </div>
    </div>
  );
}
