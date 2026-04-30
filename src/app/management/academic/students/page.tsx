import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  UserPlus, 
  ChevronRight,
  GraduationCap
} from "lucide-react";
import StudentList from "./_components/StudentList";
import { ImportSGSButton } from "./_components/ImportSGSButton";

interface Props {
  searchParams: {
    q?: string;
    grade?: string;
    room?: string;
    page?: string;
  }
}

export default async function StudentManagementPage({ searchParams }: Props) {
  const hasAccess = await checkAdminAccess("กลุ่มบริหารงานวิชาการ");
  if (!hasAccess) redirect("/access-denied");

  const sp = await searchParams;
  const query = sp.q || "";
  const grade = sp.grade || "";
  const room = sp.room || "";
  const page = parseInt(sp.page || "1");
  const pageSize = 40;

  const activeTerm = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!activeTerm) {
    return <div className="p-20 text-center">ต้องกําหนดปีการศึกษาที่ใช้งานก่อน</div>;
  }

  // Build Filter for StudentTermData
  const whereClause: any = {
    termId: activeTerm.id,
    ...(grade ? { gradeLevel: grade } : {}),
    ...(room ? { roomNumber: parseInt(room) } : {}),
  };

  if (query) {
    whereClause.student = {
      OR: [
        { firstNameTh: { contains: query } },
        { lastNameTh: { contains: query } },
        { studentCode: { contains: query } },
        { nationalId: { contains: query } },
        { prefixRef: { name: { contains: query } } },
      ]
    };
  }

  // Fetch Data using StudentTermData as base for better sorting
  const [termDataRaw, totalCount] = await Promise.all([
    prisma.studentTermData.findMany({
      where: whereClause,
      include: { 
        student: {
          include: { prefixRef: true }
        } 
      },
      orderBy: [
        { gradeLevel: 'asc' },
        { roomNumber: 'asc' },
        { student: { studentCode: 'asc' } }
      ],
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.studentTermData.count({ where: whereClause })
  ]);

  // Reshape data to match the expected Student format for Client Components
  const students = termDataRaw.map(td => ({
    ...td.student,
    termData: [{
      ...td,
      weight: td.weight ? Number(td.weight) : null,
      height: td.height ? Number(td.height) : null,
    }]
  }));

  // Fetch unique grades and rooms for filters (optimized)
  const [allGrades, allRooms] = await Promise.all([
    prisma.studentTermData.findMany({
      where: { termId: activeTerm.id },
      select: { gradeLevel: true },
      distinct: ['gradeLevel'],
      orderBy: { gradeLevel: 'asc' }
    }),
    prisma.studentTermData.findMany({
      where: { termId: activeTerm.id },
      select: { roomNumber: true },
      distinct: ['roomNumber'],
      orderBy: { roomNumber: 'asc' }
    })
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/sdservice" className="hover:text-blue-600 transition-colors">SD Service</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">จัดการข้อมูลนักเรียน</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 text-indigo-600 rounded-2xl">
                <GraduationCap size={32} />
              </div>
              ระบบจัดการข้อมูลนักเรียน
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              แสดงหน้าที่ {page} จากทั้งหมด {Math.ceil(totalCount / pageSize)} หน้า (ปีการศึกษา {activeTerm.semester}/{activeTerm.year})
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/management/academic/students/promotion"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all transform hover:-translate-y-1"
            >
              เลื่อนชั้นอัตโนมัติ
            </Link>
            <ImportSGSButton />
            <Link 
              href="/management/academic/students/new"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
            >
              <UserPlus size={20} />
              เพิ่มนักเรียนใหม่
            </Link>
          </div>
        </div>

        {/* Interactive Student List */}
        <StudentList 
          students={students} 
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          grades={allGrades.map(g => g.gradeLevel)}
          rooms={allRooms.map(r => r.roomNumber)}
          currentFilters={{ q: query, grade, room }}
        />

      </div>
    </div>
  );
}
