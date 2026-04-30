import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users, GraduationCap, BookOpen, FileText, History,
  Settings, Calendar, Newspaper, ShieldCheck, Briefcase, ArrowRight, Lock, Bell, Monitor
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GROUP_KEYS } from "@/constants";

export default async function ManagementHubPage() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { divisions: { include: { group: true } } }
  });

  if (!teacher) redirect("/login");

  const isAdmin = teacher.isAdmin;
  const groupKeys = teacher.divisions.map(d => d.group?.groupKey).filter(Boolean);

  const isPersonnel = isAdmin || groupKeys.includes(GROUP_KEYS.PERSONNEL);
  const isAcademic = isAdmin || groupKeys.includes(GROUP_KEYS.ACADEMIC);
  const isGeneral = isAdmin || groupKeys.includes(GROUP_KEYS.GENERAL);
  const isBudget = isAdmin || groupKeys.includes(GROUP_KEYS.BUDGET);
  const isStudentAffairs = isAdmin || teacher.divisions.some(div => div.divisionName === "งานกิจการนักเรียน");
  const isAudioVisual   = isAdmin || teacher.divisions.some(div => div.divisionName === "งานโสตทัศนศึกษา");
  const isSuperAdmin = session.userId === 1 || isAdmin;

  interface ManageItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
    group: string;
    allowed: boolean;
  }

  const items: ManageItem[] = [
    // Personnel Group
    {
      title: "จัดการบุคลากร",
      description: "เพิ่ม แก้ไข ลบ ข้อมูลบุคลากรและตำแหน่งหน้าที่",
      icon: <Users size={28} />,
      href: "/management/personnel/teachers",
      color: "bg-blue-600",
      group: "กลุ่มบริหารงานบุคคล",
      allowed: isPersonnel
    },
    {
      title: "จัดการการลาบุคลากร",
      description: "ตรวจสอบ อนุมัติ และแก้ไขประวัติการลาของบุคลากร",
      icon: <Briefcase size={28} />,
      href: "/management/personnel/leave",
      color: "bg-indigo-600",
      group: "กลุ่มบริหารงานบุคคล",
      allowed: isPersonnel
    },
    // General Group
    {
      title: "จัดการข่าวประชาสัมพันธ์",
      description: "เขียน แก้ไข และเผยแพร่ข่าวสารของโรงเรียน",
      icon: <Newspaper size={28} />,
      href: "/management/news",
      color: "bg-rose-600",
      group: "กลุ่มบริหารงานทั่วไป",
      allowed: isGeneral
    },
    {
      title: "จัดการประกาศโรงเรียน",
      description: "เพิ่ม ลบ แก้ไข ประกาศสำคัญ และลิงก์เอกสารต่างๆ",
      icon: <Bell size={28} />,
      href: "/management/announcements",
      color: "bg-indigo-600",
      group: "กลุ่มบริหารงานทั่วไป",
      allowed: isGeneral
    },
    {
      title: "จัดการ Popup หน้าเว็บ",
      description: "ตั้งค่ารูปภาพและลิงก์ Popup สำหรับแจ้งเตือนเมื่อเข้าเว็บ",
      icon: <Monitor size={28} />,
      href: "/management/popup",
      color: "bg-blue-500",
      group: "กลุ่มบริหารงานทั่วไป",
      allowed: isGeneral
    },
    // Academic Group
    {
      title: "จัดการนักเรียน",
      description: "จัดการทะเบียนประวัติ ชั้นเรียน และสถานะนักเรียน",
      icon: <GraduationCap size={28} />,
      href: "/management/academic/students",
      color: "bg-emerald-600",
      group: "กลุ่มบริหารงานวิชาการ",
      allowed: isAcademic
    },
    {
      title: "จัดการการออกนอกโรงเรียน",
      description: "ตรวจสอบและอนุมัติคำขออนุญาตออกนอกบริเวณโรงเรียนของนักเรียน",
      icon: <ShieldCheck size={28} />,
      href: "/management/academic/student-leave",
      color: "bg-blue-500",
      group: "งานกิจการนักเรียน",
      allowed: isStudentAffairs
    },
    {
      title: "จัดการการจองห้องโสตฯ",
      description: "ตรวจสอบและอนุมัติคำขอจองห้องโสตทัศนศึกษาและอุปกรณ์ของบุคลากร",
      icon: <Monitor size={28} />,
      href: "/management/academic/room-booking",
      color: "bg-violet-600",
      group: "งานโสตทัศนศึกษา",
      allowed: isAudioVisual
    },
    // Super Admin
    {
      title: "ตั้งค่าปีการศึกษา",
      description: "สลับเทอมและปีการศึกษาปัจจุบันสำหรับทั้งระบบ",
      icon: <Calendar size={28} />,
      href: "/management/academic/years",
      color: "bg-amber-600",
      group: "ผู้ดูแลระบบ",
      allowed: isSuperAdmin
    },
    {
      title: "บันทึกกิจกรรมระบบ",
      description: "ตรวจสอบประวัติการใช้งาน (Audit Logs)",
      icon: <History size={28} />,
      href: "/management/logs",
      color: "bg-slate-800",
      group: "ผู้ดูแลระบบ",
      allowed: isSuperAdmin
    },
    {
      title: "จัดการสถานะระบบ",
      description: "เปิด/ปิด โหมดซ่อมบำรุงสำหรับแอปพลิเคชันต่างๆ",
      icon: <Settings size={28} />,
      href: "/management/systems",
      color: "bg-amber-600",
      group: "ผู้ดูแลระบบ",
      allowed: isSuperAdmin
    }
  ];

  // Filter only what this user is allowed to access
  const allowedItems = items.filter(i => i.allowed);
  const lockedItems = items.filter(i => !i.allowed);

  if (allowedItems.length === 0) {
    redirect("/sdservice");
  }

  // Group allowed items
  const groupedItems = allowedItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, ManageItem[]>);

  return (
    <div className="min-h-screen bg-slate-900 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider mb-4">
            <Settings size={14} />
            Management Hub
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">
            สอยดาว<span className="text-blue-400">แอดมิน</span> (Admin)
          </h1>
          <p className="text-slate-400 text-lg">
            ยินดีต้อนรับ <span className="text-white font-bold">{session.name}</span> — เข้าถึงระบบบริหารจัดการตามสิทธิ์หน้าที่ของท่าน
          </p>
        </div>

        {/* Grouped Cards */}
        <div className="space-y-12">
          {Object.entries(groupedItems).map(([groupName, groupItems]) => (
            <div key={groupName}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-black text-white/40 uppercase tracking-widest">{groupName}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="group relative flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 overflow-hidden"
                  >
                    <div className={`absolute -right-8 -top-8 w-32 h-32 ${item.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700 blur-xl`} />
                    <div className={`p-4 ${item.color} text-white rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed flex-1">{item.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <span>เปิดจัดการ</span>
                      <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Locked Items (visible but not accessible) */}
        {lockedItems.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs font-black text-white/20 uppercase tracking-widest">ระบบที่ไม่มีสิทธิ์เข้าถึง</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl p-8 opacity-40 cursor-not-allowed overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-slate-700 text-slate-500 rounded-2xl w-fit">
                      {item.icon}
                    </div>
                    <Lock size={16} className="text-slate-600 mt-1" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-500 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                  <p className="mt-6 text-xs text-slate-600 font-bold">{item.group}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to Service Hub */}
        <div className="mt-16 text-center">
          <Link
            href="/sdservice"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10"
          >
            ← กลับไปยัง SD Service Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
