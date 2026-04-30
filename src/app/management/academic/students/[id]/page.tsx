import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Save, X, GraduationCap, Trash2 } from "lucide-react";
import { adminUpdateStudent, adminDeleteStudent } from "@/app/actions/students";
import { getStudentMetadataOptions } from "@/app/actions/metadata";

interface EditStudentProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: EditStudentProps) {
  const { id } = await params;
  const hasAccess = await checkAdminAccess("กลุ่มบริหารงานวิชาการ");
  if (!hasAccess) redirect("/sdservice");

  const studentId = parseInt(id);
  if (isNaN(studentId)) notFound();

  const activeTerm = await prisma.academicYear.findFirst({ where: { isActive: true } });
  
  const metadata = await getStudentMetadataOptions();
  
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      termData: {
        where: { termId: activeTerm?.id }
      }
    }
  });

  if (!student) notFound();
  const currentTerm = student.termData[0] || {};

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await adminUpdateStudent(studentId, formData);
    if ('success' in result) {
      redirect("/management/academic/students");
    }
  }

  async function handleDelete() {
    'use server'
    const result = await adminDeleteStudent(studentId);
    if ('success' in result) {
      redirect("/management/academic/students");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/sdservice" className="hover:text-blue-600 transition-colors">SD Service</Link>
          <ChevronRight size={14} />
          <Link href="/management/academic/students" className="hover:text-blue-600 transition-colors">จัดการนักเรียน</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">แก้ไขข้อมูล: {student.firstNameTh}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <GraduationCap size={24} />
              </div>
              แก้ไขข้อมูลนักเรียน
            </h1>
            <div className="flex items-center gap-4">
              <form action={handleDelete}>
                <button type="submit" className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="ลบข้อมูล">
                  <Trash2 size={24} />
                </button>
              </form>
              <Link href="/management/academic/students" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </Link>
            </div>
          </div>

          <form action={handleSubmit} className="p-8 space-y-8">
            {/* Core Info */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">ข้อมูลพื้นฐาน</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">เลขประจำตัวนักเรียน</label>
                  <input required type="text" name="studentCode" defaultValue={student.studentCode} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">เลขบัตรประชาชน</label>
                  <input required type="text" name="nationalId" maxLength={13} defaultValue={student.nationalId} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">คำนำหน้า</label>
                  <select required name="prefixId" defaultValue={student.prefixId || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="">เลือก...</option>
                    {metadata.prefixes.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">ชื่อ (ไทย)</label>
                  <input required type="text" name="firstNameTh" defaultValue={student.firstNameTh} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">นามสกุล (ไทย)</label>
                  <input required type="text" name="lastNameTh" defaultValue={student.lastNameTh} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">เพศ</label>
                  <select name="genderId" defaultValue={student.genderId || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="">ไม่ระบุ</option>
                    {metadata.genders.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">วัน/เดือน/ปี เกิด</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    defaultValue={student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ""} 
                    className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">กลุ่มเป้าหมายพิเศษ / เด็กด้อยโอกาส</label>
                  <select name="disadvantagedTypeId" defaultValue={student.disadvantagedTypeId || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="">ปกติ (ไม่มีกลุ่มพิเศษ)</option>
                    {metadata.disadvantagedTypes.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Academic Info */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">การเรียนปัจจุบัน ({activeTerm?.semester}/{activeTerm?.year})</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">ระดับชั้น</label>
                  <input required type="text" name="gradeLevel" defaultValue={currentTerm.gradeLevel || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">ห้องเรียน</label>
                  <input required type="number" name="roomNumber" defaultValue={currentTerm.roomNumber || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">เลขที่</label>
                  <input type="number" name="studentNumber" defaultValue={currentTerm.studentNumber || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">สถานะ</label>
                  <select name="statusId" defaultValue={currentTerm.statusId || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-indigo-700">
                    <option value="">เลือก...</option>
                    {metadata.statuses.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
               <Link 
                href="/management/academic/students"
                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
               >
                 ยกเลิก
               </Link>
               <button 
                type="submit"
                className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
               >
                 <Save size={20} />
                 บันทึกการแก้ไข
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
