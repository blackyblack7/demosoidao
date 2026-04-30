"use client";

import { useState, useRef } from "react";
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  IdCard, 
  Users, 
  ShieldCheck,
  Activity,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Camera,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { updateProfile, uploadProfileImage } from "@/app/actions/user";
import { useRouter, useSearchParams } from "next/navigation";

interface ProfileContentProps {
  userData: any;
  role: string;
}

export default function ProfileContent({ userData, role }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const isTeacher = role === "TEACHER";
  const name = isTeacher 
    ? `${userData.prefix}${userData.firstName} ${userData.lastName}`
    : `${userData.prefix}${userData.firstNameTh} ${userData.lastNameTh}`;

  async function handleSave(formData: FormData) {
    setIsSaving(true);
    const result = await updateProfile(formData);
    setIsSaving(false);
    
    if ('success' in result) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert((result as any).error);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadProfileImage(formData);
    setIsUploading(false);

    if ('success' in result) {
      router.refresh();
    } else {
      alert((result as any).error);
    }
  }

  const latestTerm = userData.termData?.[0] || {};
  const currentAddress = userData.addresses?.[0] || {};

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[var(--accent)] transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-[var(--accent)]/10 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="font-medium">กลับหน้าหลัก</span>
          </Link>

          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl shadow-sm border border-blue-100 font-bold hover:bg-blue-50 transition-all"
            >
              <Edit2 size={18} />
              แก้ไขข้อมูล
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-500 rounded-xl shadow-sm border border-slate-200 font-bold hover:bg-slate-50 transition-all"
              >
                <X size={18} />
                ยกเลิก
              </button>
            </div>
          )}
        </div>

        {errorParam === "address_required" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-3 text-amber-800 font-bold shadow-sm animate-pulse">
            <div className="p-2 bg-amber-200 rounded-full">
              <MapPin size={20} className="text-amber-800" />
            </div>
            <span>กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วนก่อนการดำเนินการลาบุคลากร</span>
          </div>
        )}

        <form action={handleSave}>
          {/* Header Profile Card */}
          <div className="relative mb-8 pt-16">
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl -z-10 shadow-lg overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/30 rounded-full -ml-10 -mb-10 blur-2xl" />
              </div>
            </div>
            
            <div className="glass p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-end gap-8 shadow-xl border border-white/50 backdrop-blur-2xl">
              <div className="relative group">
                <div 
                  className={`w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white p-2 overflow-hidden ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`}
                  onClick={() => isEditing && fileInputRef.current?.click()}
                >
                  <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                    {userData.profileImage ? (
                      <Image 
                        src={userData.profileImage} 
                        alt={name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <User size={80} className="text-slate-300" />
                    )}
                    
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={32} />
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                      </div>
                    )}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <ShieldCheck size={14} />
                  {isTeacher ? 'บุคลากรทางการศึกษา' : 'นักเรียน'}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">{name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <IdCard size={18} className="text-[var(--accent)]" />
                    <span>{isTeacher ? userData.username : userData.studentCode}</span>
                  </div>
                  {isTeacher && (
                    <div className="flex flex-col gap-2">
                      {Object.entries(
                        userData.divisions?.reduce((acc: any, div: any) => {
                          const groupName = div.group?.groupName || "อื่นๆ";
                          if (!acc[groupName]) acc[groupName] = [];
                          acc[groupName].push(div.divisionName);
                          return acc;
                        }, {}) || {}
                      ).map(([groupName, divisions]: [string, any]) => (
                        <div key={groupName} className="flex items-center gap-1.5 font-bold">
                          <Briefcase size={14} className="text-[var(--accent)]" />
                          <span className="text-[10px] text-slate-400 uppercase">{groupName}:</span>
                          <div className="flex flex-wrap gap-1">
                            {divisions.map((divName: string) => (
                              <span key={divName} className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500">
                                {divName}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isTeacher && latestTerm && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={18} className="text-[var(--accent)]" />
                      <span>ชั้น {latestTerm.gradeLevel}/{latestTerm.roomNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  บันทึกข้อมูล
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="glass p-6 rounded-3xl shadow-sm border border-white/40">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" />
                  ข้อมูลพื้นฐาน
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">เลขประจำตัวประชาชน</span>
                    <span className="font-medium text-slate-700">{userData.nationalId || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">อีเมล</span>
                    {isEditing && isTeacher ? (
                      <input type="email" name="email" defaultValue={userData.email || ""} className="p-1 border rounded text-sm bg-white" />
                    ) : (
                      <span className="font-medium text-slate-700">{userData.email || '-'}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">เบอร์โทรศัพท์</span>
                    {isEditing && isTeacher ? (
                      <input type="text" name="phoneNumber" defaultValue={userData.phoneNumber || ""} className="p-1 border rounded text-sm bg-white" />
                    ) : (
                      <span className="font-medium text-slate-700">{userData.phoneNumber || '-'}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Line ID</span>
                    {isEditing && isTeacher ? (
                      <input type="text" name="lineId" defaultValue={userData.lineId || ""} className="p-1 border rounded text-sm bg-white" />
                    ) : (
                      <span className="font-medium text-slate-700">{userData.lineId || '-'}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">วันเกิด</span>
                    <span className="font-medium text-slate-700">
                      {userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('th-TH', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      }) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {!isTeacher && (
                <div className="glass p-6 rounded-3xl shadow-sm border border-white/40 bg-gradient-to-br from-white to-blue-50/50">
                  <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <Activity size={20} className="text-cyan-500" />
                    สัดส่วนและร่างกาย
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/80 p-4 rounded-2xl border border-blue-100 flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 mb-1">ส่วนสูง (ซม.)</span>
                      {isEditing ? (
                        <input 
                          type="number" 
                          name="height"
                          step="0.1"
                          defaultValue={latestTerm.height || ""}
                          className="w-full text-center text-xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-200 outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">{latestTerm.height || '-'}</span>
                      )}
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-blue-100 flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 mb-1">น้ำหนัก (กก.)</span>
                      {isEditing ? (
                        <input 
                          type="number" 
                          name="weight"
                          step="0.1"
                          defaultValue={latestTerm.weight || ""}
                          className="w-full text-center text-xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-200 outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">{latestTerm.weight || '-'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass p-8 rounded-3xl shadow-sm border border-white/40">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <GraduationCap size={22} className="text-indigo-600" />
                  {isTeacher ? 'ข้อมูลการทำงานและตำแหน่ง' : 'ข้อมูลการเรียน'}
                </h3>
                
                {isTeacher ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">ตำแหน่ง</p>
                      <p className="text-lg text-slate-700 font-semibold">{userData.position || 'ครู'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">วิทยฐานะ</p>
                      <p className="text-lg text-slate-700 font-semibold">{userData.academicStanding || 'ไม่มี'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">วุฒิการศึกษา</p>
                      {isEditing ? (
                        <input type="text" name="qualification" defaultValue={userData.qualification || ""} className="w-full text-lg font-semibold text-slate-700 bg-white border rounded p-1" />
                      ) : (
                        <p className="text-lg text-slate-700 font-semibold">{userData.qualification || '-'}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">วิชาเอก</p>
                      {isEditing ? (
                        <input type="text" name="major" defaultValue={userData.major || ""} className="w-full text-lg font-semibold text-slate-700 bg-white border rounded p-1" />
                      ) : (
                        <p className="text-lg text-slate-700 font-semibold">{userData.major || '-'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-4 pt-2 border-t border-slate-100">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">การจัดหมวดหมู่กลุ่มบริหารและฝ่ายงาน</p>
                      <div className="space-y-3">
                        {Object.entries(
                          userData.divisions?.reduce((acc: any, div: any) => {
                            const groupName = div.group?.groupName || "อื่นๆ";
                            if (!acc[groupName]) acc[groupName] = [];
                            acc[groupName].push(div.divisionName);
                            return acc;
                          }, {}) || {}
                        ).map(([groupName, divisions]: [string, any]) => (
                          <div key={groupName} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-indigo-500 uppercase mb-2 ml-1">{groupName}</p>
                            <div className="flex flex-wrap gap-2">
                              {divisions.map((divName: string) => (
                                <span key={divName} className="px-3 py-1 bg-white text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                                  {divName}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">ระดับชั้น</p>
                      <p className="text-lg text-slate-700 font-semibold">{latestTerm.gradeLevel || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">ห้องเรียน</p>
                      <p className="text-lg text-slate-700 font-semibold">{latestTerm.roomNumber || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">รหัสนักเรียน</p>
                      <p className="text-lg text-slate-700 font-semibold">{userData.studentCode || '-'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Address Section */}
              <div className="glass p-8 rounded-3xl shadow-sm border border-white/40">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <MapPin size={22} className="text-red-500" />
                  ที่อยู่ปัจจุบัน
                </h3>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">บ้านเลขที่ / ซอย / ถนน</label>
                      <input 
                        type="text" 
                        name="houseNumber" 
                        defaultValue={isTeacher ? userData.houseNumber : currentAddress.houseNumber} 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">หมู่ที่</label>
                      <input 
                        type="text" 
                        name="moo" 
                        defaultValue={isTeacher ? userData.moo : currentAddress.moo} 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">ตำบล</label>
                      <input 
                        type="text" 
                        name="subDistrict" 
                        defaultValue={isTeacher ? userData.subDistrict : currentAddress.subDistrict} 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">อำเภอ</label>
                      <input 
                        type="text" 
                        name="district" 
                        defaultValue={isTeacher ? userData.district : currentAddress.district} 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">จังหวัด</label>
                      <input 
                        type="text" 
                        name="province" 
                        defaultValue={isTeacher ? userData.province : currentAddress.province} 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">รหัสไปรษณีย์</label>
                      <input 
                        type="text" 
                        name="zipCode" 
                        defaultValue={isTeacher ? userData.zipCode : currentAddress.zipCode} 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="p-3 bg-red-50 text-red-500 rounded-2xl h-fit">
                      <MapPin size={24} />
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {(isTeacher ? userData.houseNumber : currentAddress.houseNumber) ? (
                        <>
                          {isTeacher ? userData.houseNumber : currentAddress.houseNumber} หมู่ {isTeacher ? userData.moo : currentAddress.moo} 
                          ต.{isTeacher ? userData.subDistrict : currentAddress.subDistrict} อ.{isTeacher ? userData.district : currentAddress.district} 
                          จ.{isTeacher ? userData.province : currentAddress.province} {isTeacher ? userData.zipCode : currentAddress.zipCode}
                        </>
                      ) : 'ไม่พบข้อมูลที่อยู่'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
