"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, BookOpen, Briefcase, GraduationCap, Award, ChevronDown, Star, Crown, Shield } from "lucide-react";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  nickName?: string;
  profileImage?: string;
  qualification?: string;
  major?: string;
  isAdmin?: boolean;
  prefixRef?: { name: string };
  positionRef?: { name: string; level: number };
  academicStandingRef?: { name: string };
  department?: { id: number; departmentName: string };
  divisions: { id: number; divisionName: string; group?: { id: number; groupName: string } }[];
  adminGroups: { id: number; groupName: string }[];
}

interface Department { 
  id: number; 
  departmentName: string;
  headId?: number;
  head?: { id: number; firstName: string; lastName: string; prefixRef?: { name: string }; positionRef?: { name: string; level: number }; profileImage?: string };
}

interface AdminGroup {
  id: number;
  groupName: string;
  headId?: number;
  head?: { id: number; firstName: string; lastName: string; prefixRef?: { name: string }; positionRef?: { name: string; level: number }; profileImage?: string };
  divisions: { 
    id: number; 
    divisionName: string; 
    headId?: number; 
    head?: { id: number; firstName: string; lastName: string; prefixRef?: { name: string }; positionRef?: { name: string; level: number }; profileImage?: string };
  }[];
}

interface Props { teachers: Teacher[]; departments: Department[]; adminGroups: AdminGroup[] }

const deptColors: Record<string, { bg: string }> = {
  "ภาษาไทย": { bg: "from-rose-600 to-pink-700" },
  "คณิตศาสตร์": { bg: "from-blue-600 to-indigo-700" },
  "วิทยาศาสตร์และเทคโนโลยี": { bg: "from-emerald-600 to-teal-700" },
  "สังคมศึกษา ศาสนา และวัฒนธรรม": { bg: "from-amber-600 to-orange-700" },
  "ภาษาต่างประเทศ": { bg: "from-violet-600 to-purple-700" },
  "ศิลปะ": { bg: "from-pink-600 to-fuchsia-700" },
  "การงานอาชีพ": { bg: "from-cyan-600 to-sky-700" },
  "สุขศึกษาและพลศึกษา": { bg: "from-lime-600 to-green-700" },
};
const defaultDeptColor = { bg: "from-slate-600 to-slate-700" };

const groupColors: Record<string, { bg: string }> = {
  "กลุ่มบริหารงานวิชาการ": { bg: "from-sky-600 to-blue-800" },
  "กลุ่มบริหารงานบุคคล": { bg: "from-indigo-600 to-violet-800" },
  "กลุ่มบริหารงานงบประมาณและทรัพย์สิน": { bg: "from-amber-600 to-orange-800" },
  "กลุ่มบริหารงานทั่วไป": { bg: "from-emerald-600 to-teal-800" },
};
const defaultGroupColor = { bg: "from-slate-600 to-slate-800" };

/* ── Card Components ── */

function TeacherCard({ teacher, mode }: { teacher: Teacher; mode: "dept" | "group" }) {
  const prefix = teacher.prefixRef?.name || "";
  const position = teacher.positionRef?.name || "ครู";
  const standing = teacher.academicStandingRef?.name;
  const hasStanding = standing && standing !== "ไม่มีวิทยฐานะ";

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-slate-200 transition-all duration-500 overflow-hidden hover:-translate-y-1">
      <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-slate-100 to-slate-50 overflow-hidden">
        {teacher.profileImage ? (
          <Image src={teacher.profileImage} alt={`${prefix}${teacher.firstName}`} fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Users size={56} className="text-slate-200" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-base leading-tight drop-shadow-lg">{prefix}{teacher.firstName}</p>
          <p className="text-white/80 text-sm font-medium drop-shadow-lg">{teacher.lastName}</p>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{position}</p>
        {mode === "dept" ? (
          <div className="space-y-1.5">
            {teacher.qualification && (
              <div className="flex items-start gap-1.5">
                <GraduationCap size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-600 leading-tight">{teacher.qualification}</span>
              </div>
            )}
            {teacher.major && (
              <div className="flex items-start gap-1.5">
                <BookOpen size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-600 leading-tight">{teacher.major}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {hasStanding && (
              <div className="flex items-start gap-1.5">
                <Award size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-600 leading-tight">วิทยฐานะ{standing}</span>
              </div>
            )}
            {teacher.divisions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {teacher.divisions.map((d) => (
                  <span key={d.id} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{d.divisionName}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Large featured card for executives */
function ExecutiveCard({ teacher, role, accent }: { teacher: Teacher; role: string; accent: string }) {
  const prefix = teacher.prefixRef?.name || "";
  return (
    <div className={`relative bg-white rounded-3xl shadow-lg border-2 ${accent} overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
      <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-slate-100 to-slate-50 overflow-hidden">
        {teacher.profileImage ? (
          <Image src={teacher.profileImage} alt={`${prefix}${teacher.firstName}`} fill
            className="object-cover object-top" sizes="300px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Users size={64} className="text-slate-200" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>
      <div className="p-5 text-center flex flex-col justify-between" style={{ minHeight: '120px' }}>
        <div className="space-y-1">
          <p className="text-base font-black text-slate-800 leading-tight">{prefix}{teacher.firstName} {teacher.lastName}</p>
          <p className="text-xs font-bold text-slate-500">{teacher.positionRef?.name || "ครู"}</p>
        </div>
        <div className="mt-2">
          <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${accent.replace("border-", "bg-").replace("/40", "/10")} text-slate-700`}>
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Section Components ── */

function DepartmentSection({ dept, teachers }: { dept: Department; teachers: Teacher[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const colors = deptColors[dept.departmentName] || defaultDeptColor;
  
  // Separate head from other teachers
  const headTeacher = teachers.find(t => t.id === dept.headId);
  const otherTeachers = teachers.filter(t => t.id !== dept.headId);

  return (
    <section className="scroll-mt-28">
      <button onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gradient-to-r ${colors.bg} rounded-2xl p-6 md:p-8 flex items-center justify-between text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><BookOpen size={24} /></div>
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-bold">{dept.departmentName}</h2>
            <p className="text-white/70 text-sm mt-1">{teachers.length} คน</p>
          </div>
        </div>
        <ChevronDown size={24} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="mt-6 space-y-8 animate-fade-up">
          {/* Department Head */}
          {headTeacher && (
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-3 justify-center mb-4">
                <Star size={16} className={colors.bg.includes('slate') ? 'text-slate-500' : 'text-blue-500'} />
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">หัวหน้ากลุ่มสาระฯ</h3>
                <Star size={16} className={colors.bg.includes('slate') ? 'text-slate-500' : 'text-blue-500'} />
              </div>
              <div className="w-56">
                <ExecutiveCard 
                  teacher={headTeacher} 
                  role={`หัวหน้ากลุ่มสาระฯ`} 
                  accent={colors.bg.includes('slate') ? "border-slate-400/40" : "border-blue-400/40"} 
                />
              </div>
            </div>
          )}
          
          {/* Other Teachers */}
          {otherTeachers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {otherTeachers.map((t) => <TeacherCard key={t.id} teacher={t} mode="dept" />)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AdminGroupSection({ group, teachers, allDivisions }: { group: AdminGroup; teachers: Teacher[]; allDivisions: { id: number; divisionName: string }[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const colors = groupColors[group.groupName] || defaultGroupColor;
  return (
    <section className="scroll-mt-28">
      <button onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gradient-to-r ${colors.bg} rounded-2xl p-6 md:p-8 flex items-center justify-between text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Briefcase size={24} /></div>
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-bold">{group.groupName}</h2>
            <p className="text-white/70 text-sm mt-1">{teachers.length} คน · {allDivisions.length} ฝ่ายงาน</p>
          </div>
        </div>
        <ChevronDown size={24} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mt-6 animate-fade-up">
          {teachers.map((t) => <TeacherCard key={t.id} teacher={t} mode="group" />)}
        </div>
      )}
    </section>
  );
}

/* ── Main Component ── */

export default function PersonnelContent({ teachers, departments, adminGroups }: Props) {
  const [viewMode, setViewMode] = useState<"dept" | "group">("dept");

  // Filter out the super-admin system account
  const allTeachers = teachers.filter((t) => !t.isAdmin);

  const getSortWeight = (t: Teacher) => {
    const posLevel = t.positionRef?.level ?? 5;
    
    let standingWeight = 1;
    const sName = t.academicStandingRef?.name || "";
    if (sName.includes("เชี่ยวชาญพิเศษ")) standingWeight = 5;
    else if (sName.includes("เชี่ยวชาญ")) standingWeight = 4;
    else if (sName.includes("ชำนาญการพิเศษ")) standingWeight = 3;
    else if (sName.includes("ชำนาญการ")) standingWeight = 2;

    let posSpecificWeight = 0;
    const posName = t.positionRef?.name || "";
    if (posName === "ครูผู้ช่วย") posSpecificWeight = 4;
    if (posName === "พนักงานราชการ") posSpecificWeight = 3;
    if (posName === "ครูอัตราจ้าง") posSpecificWeight = 2;
    if (posName === "ธุรการ") posSpecificWeight = 1;

    return posLevel * 1000 + standingWeight * 100 + posSpecificWeight * 10;
  };

  const sortedTeachers = [...allTeachers].sort((a, b) => {
    const weightA = getSortWeight(a);
    const weightB = getSortWeight(b);
    if (weightA !== weightB) return weightB - weightA;
    return a.firstName.localeCompare(b.firstName, "th");
  });

  // Collect Group Heads & Division Heads dynamically
  const groupHeadsData: { teacher: Teacher, role: string }[] = [];
  const groupHeadIds = new Set<number>();

  adminGroups.forEach(group => {
    if (group.headId) {
      const headTeacher = sortedTeachers.find(t => t.id === group.headId);
      if (headTeacher && (headTeacher.positionRef?.level ?? 0) < 8) {
        if (!groupHeadIds.has(headTeacher.id)) {
          groupHeadsData.push({ teacher: headTeacher, role: `หัวหน้า${group.groupName}` });
          groupHeadIds.add(headTeacher.id);
        }
      }
    }
    // Also include division heads (like การเงิน, พัสดุ)
    group.divisions.forEach(div => {
      if (div.headId) {
        const headTeacher = sortedTeachers.find(t => t.id === div.headId);
        if (headTeacher && (headTeacher.positionRef?.level ?? 0) < 8) {
          if (!groupHeadIds.has(headTeacher.id)) {
            groupHeadsData.push({ teacher: headTeacher, role: `หัวหน้า${div.divisionName}` });
            groupHeadIds.add(headTeacher.id);
          }
        }
      }
    });
  });

  // Separate executives for admin group view
  const director = sortedTeachers.find((t) => (t.positionRef?.level ?? 0) >= 10);
  const deputies = sortedTeachers.filter((t) => (t.positionRef?.level ?? 0) === 8);
  
  const executiveIds = new Set([
    ...(director ? [director.id] : []),
    ...deputies.map((d) => d.id),
    ...Array.from(groupHeadIds),
  ]);

  // Regular staff (non-executive) for admin group sections
  const regularStaff = sortedTeachers.filter((t) => !executiveIds.has(t.id));

  // Department view (shows everyone)
  const departmentOrder = [
    "ภาษาไทย",
    "คณิตศาสตร์",
    "วิทยาศาสตร์และเทคโนโลยี",
    "สังคมศึกษา ศาสนา และวัฒนธรรม",
    "ภาษาต่างประเทศ",
    "ศิลปะ",
    "การงานอาชีพ",
    "สุขศึกษาและพลศึกษา",
    "แนะแนว"
  ];

  const byDepartment = departments.map((dept) => ({
    dept,
    teachers: sortedTeachers.filter((t) => t.department?.id === dept.id),
  })).filter((g) => g.teachers.length > 0)
    .sort((a, b) => {
      let indexA = departmentOrder.indexOf(a.dept.departmentName);
      let indexB = departmentOrder.indexOf(b.dept.departmentName);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });
  const noDept = sortedTeachers.filter((t) => !t.department);

  // Admin group view (regular staff only)
  const byAdminGroup = adminGroups.map((group) => ({
    group,
    teachers: regularStaff.filter((t) =>
      t.divisions.some((d) => d.group?.id === group.id) ||
      t.adminGroups.some((ag) => ag.id === group.id)
    ),
  })).filter((g) => g.teachers.length > 0);
  const noGroup = regularStaff.filter(
    (t) => t.divisions.length === 0 && t.adminGroups.length === 0
  );

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20">
      {/* Hero */}
      <section className="relative pt-28 pb-16 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-[var(--background)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-blue-300 bg-blue-500/10 px-5 py-2 rounded-full border border-blue-400/20 mb-6">Our Team</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            บุคลากร<span className="text-blue-400">โรงเรียนสอยดาววิทยา</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            ทำเนียบครูและบุคลากรทางการศึกษา แบ่งตามกลุ่มสาระการเรียนรู้และกลุ่มบริหารงาน
          </p>
          <div className="flex justify-center gap-8 mb-10">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{allTeachers.length}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">บุคลากรทั้งหมด</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-black text-white">{departments.length}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">กลุ่มสาระ</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-black text-white">{adminGroups.length}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">กลุ่มบริหาร</p>
            </div>
          </div>
          <div className="inline-flex bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/10">
            <button onClick={() => setViewMode("dept")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === "dept" ? "bg-white text-slate-900 shadow-lg" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
              <BookOpen size={18} /> กลุ่มสาระการเรียนรู้
            </button>
            <button onClick={() => setViewMode("group")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === "group" ? "bg-white text-slate-900 shadow-lg" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
              <Briefcase size={18} /> กลุ่มบริหารงาน
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-10">
        {viewMode === "dept" ? (
          <>
            {byDepartment.map(({ dept, teachers: ts }) => (
              <DepartmentSection key={dept.id} dept={dept} teachers={ts} />
            ))}
          </>
        ) : (
          <>
            {/* ── Executive Hierarchy ── */}

            {/* Director */}
            {director && (
              <section className="text-center space-y-4">
                <div className="flex items-center gap-3 justify-center mb-2">
                  <Crown size={20} className="text-amber-500" />
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">ผู้อำนวยการโรงเรียน</h2>
                  <Crown size={20} className="text-amber-500" />
                </div>
                <div className="flex justify-center">
                  <div className="w-52">
                    <ExecutiveCard teacher={director} role="ผู้อำนวยการ" accent="border-amber-400/40" />
                  </div>
                </div>
              </section>
            )}

            {/* Deputy Directors */}
            {deputies.length > 0 && (
              <section className="text-center space-y-4 pt-4">
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-px flex-1 max-w-[60px] bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-indigo-500" />
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">รองผู้อำนวยการ</h2>
                  </div>
                  <div className="h-px flex-1 max-w-[60px] bg-slate-200" />
                </div>
                <div className="flex justify-center gap-6 flex-wrap">
                  {deputies.map((t) => (
                    <div key={t.id} className="w-48">
                      <ExecutiveCard teacher={t} role="รองผู้อำนวยการ" accent="border-indigo-400/40" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Group Heads (non-deputy) */}
            {groupHeadsData.length > 0 && (
              <section className="text-center space-y-4 pt-4">
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-px flex-1 max-w-[60px] bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Star size={18} className="text-emerald-500" />
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">หัวหน้ากลุ่มบริหาร</h2>
                  </div>
                  <div className="h-px flex-1 max-w-[60px] bg-slate-200" />
                </div>
                <div className="flex justify-center gap-6 flex-wrap">
                  {groupHeadsData.map(({ teacher, role }, index) => (
                    <div key={`${teacher.id}-${index}`} className="w-48">
                      <ExecutiveCard teacher={teacher} role={role} accent="border-emerald-400/40" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 pt-8 pb-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">บุคลากรแบ่งตามกลุ่มบริหารงาน</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Regular staff by admin group */}
            {byAdminGroup.map(({ group, teachers: ts }) => (
              <AdminGroupSection key={group.id} group={group} teachers={ts} allDivisions={group.divisions} />
            ))}
          </>
        )}
      </div>
    </main>
  );
}
