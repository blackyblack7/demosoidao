"use client"

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, User, Camera, Copy, AlertCircle, Trash2, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { adminUpdateTeacher, adminDeleteTeacher } from '@/app/actions/personnel';
import AddressFields from './AddressFields';

interface EditTeacherFormProps {
  teacher: any;
  departments: any[];
  divisions: any[];
  adminGroups: any[];
  metadata: {
    prefixes: any[];
    positions: any[];
    standings: any[];
  };
}

export default function EditTeacherForm({ teacher, departments, divisions, adminGroups, metadata }: EditTeacherFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // States for Address - Initialize with teacher data
  const [addressData, setAddressData] = useState<any>({
    houseNumber: teacher.houseNumber || '',
    moo: teacher.moo || '',
    subDistrict: teacher.subDistrict || '',
    district: teacher.district || '',
    province: teacher.province || '',
    zipCode: teacher.zipCode || '',
    currentHouseNumber: teacher.currentHouseNumber || '',
    currentMoo: teacher.currentMoo || '',
    currentSubDistrict: teacher.currentSubDistrict || '',
    currentDistrict: teacher.currentDistrict || '',
    currentProvince: teacher.currentProvince || '',
    currentZipCode: teacher.currentZipCode || '',
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(teacher.profileImage || null);

  const [selectedPositionId, setSelectedPositionId] = useState<string>(teacher.positionId?.toString() || "");
  const [selectedStandingId, setSelectedStandingId] = useState<string>(teacher.academicStandingId?.toString() || "");

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const posId = e.target.value;
    setSelectedPositionId(posId);
    
    const pos = metadata.positions.find(p => p.id.toString() === posId);
    if (!pos) return;

    // Auto-standing suggestion logic
    if (pos.name.includes('ชำนาญการพิเศษ')) {
      const s = metadata.standings.find(st => st.name.includes('ชำนาญการพิเศษ'));
      if (s) setSelectedStandingId(s.id.toString());
    } else if (pos.name.includes('ชำนาญการ')) {
      const s = metadata.standings.find(st => st.name.includes('ชำนาญการ'));
      if (s) setSelectedStandingId(s.id.toString());
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddressData((prev: any) => ({ ...prev, [field]: value }));
  };

  const copyToCurrent = () => {
    setAddressData((prev: any) => ({
      ...prev,
      currentHouseNumber: prev.houseNumber,
      currentMoo: prev.moo,
      currentSubDistrict: prev.subDistrict,
      currentDistrict: prev.district,
      currentProvince: prev.province,
      currentZipCode: prev.zipCode,
    }));
  };

  async function clientAction(formData: FormData) {
    setIsPending(true);
    setError(null);
    
    const result = await adminUpdateTeacher(teacher.id, formData);
    
    if ('success' in result) {
      router.push("/management/personnel/teachers");
      router.refresh();
    } else {
      setError((result as any).error || "เกิดข้อผิดพลาด");
      setIsPending(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleDelete() {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลบุคลากรท่านนี้?')) {
      setIsPending(true);
      const result = await adminDeleteTeacher(teacher.id);
      if ('success' in result) {
        router.push("/management/personnel/teachers");
        router.refresh();
      } else {
        setError((result as any).error || "เกิดข้อผิดพลาดในการลบ");
        setIsPending(false);
      }
    }
  }

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-white">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <User size={28} />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight">แก้ไขข้อมูลบุคลากร</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Edit Personnel Profile</span>
          </div>
        </h1>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={isPending}
            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-50" 
            title="ลบข้อมูล"
          >
            <Trash2 size={24} />
          </button>
          <Link href="/management/personnel/teachers" className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-all">
            <X size={28} />
          </Link>
        </div>
      </div>

      <form ref={formRef} action={clientAction} className={`p-8 space-y-10 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Profile Image & Basic Info Wrapper */}
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-48 h-48 rounded-[3rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-400">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={80} className="opacity-20" />
                )}
              </div>
              <label className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95">
                <Camera size={20} />
                <input type="file" name="profileImage" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">อัปเดตรูปถ่ายหน้าตรง</p>
          </div>

          <div className="flex-1 space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">ข้อมูลงชื่อเข้าใช้</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Username (รหัสพนักงาน) [เปลี่ยนไม่ได้]</label>
                  <input readOnly disabled type="text" name="username" defaultValue={teacher.username} className="w-full p-3 bg-slate-100 border-none rounded-2xl outline-none cursor-not-allowed opacity-70" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Password (ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="••••••••" 
                      className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 pr-12" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">ข้อมูลส่วนตัว</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">คำนำหน้า</label>
                  <select required name="prefixId" defaultValue={teacher.prefixId || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="">เลือก...</option>
                    {metadata.prefixes.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">ชื่อ</label>
                  <input required type="text" name="firstName" defaultValue={teacher.firstName} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">นามสกุล</label>
                  <input required type="text" name="lastName" defaultValue={teacher.lastName} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">ชื่อเล่น</label>
                  <input type="text" name="nickName" defaultValue={teacher.nickName || ''} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-indigo-600" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">วันเกิด</label>
                  <input type="date" name="dateOfBirth" defaultValue={teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split('T')[0] : ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">น้ำหนัก (กก.)</label>
                  <input type="number" step="0.1" name="weight" defaultValue={teacher.weight ? Number(teacher.weight) : ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" placeholder="0.0" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">ส่วนสูง (ซม.)</label>
                  <input type="number" step="0.1" name="height" defaultValue={teacher.height ? Number(teacher.height) : ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" placeholder="0.0" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">กรุ๊ปเลือด</label>
                  <select name="bloodGroup" defaultValue={teacher.bloodGroup || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="">ไม่ระบุ</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="O">O</option>
                    <option value="AB">AB</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">ข้อมูลอื่นๆ</label>
                  <input type="text" name="otherInfo" defaultValue={teacher.otherInfo || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" placeholder="ระบุเพิ่มเติม..." />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Address Sections */}
        <section className="space-y-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">ข้อมูลที่อยู่</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AddressFields 
              title="ที่อยู่ตามทะเบียนบ้าน" 
              prefix="" 
              values={addressData} 
              onChange={handleAddressChange} 
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">ที่อยู่ปัจจุบัน</h4>
                <button 
                  type="button" 
                  onClick={copyToCurrent}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-all hover:bg-indigo-100 border border-indigo-100"
                >
                  <Copy size={14} />
                  ใช้ที่อยู่เดียวกับทะเบียนบ้าน
                </button>
              </div>
              <AddressFields 
                title="ที่อยู่ปัจจุบันสำหรับติดต่อ" 
                prefix="current" 
                values={addressData} 
                onChange={handleAddressChange} 
              />
            </div>
          </div>
        </section>

        {/* Other Info Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6 border-t border-slate-100">
          <section className="space-y-4">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">ตำแหน่งและสังกัด</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase">กลุ่มสาระการเรียนรู้</label>
                <select name="departmentId" defaultValue={teacher.departmentId || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none">
                  <option value="">เลือกกลุ่มสาระ...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">ตำแหน่งหลัก</label>
                  <select 
                    name="positionId" 
                    value={selectedPositionId}
                    onChange={handlePositionChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700 shadow-sm"
                  >
                    <option value="">-- เลือกตำแหน่ง --</option>
                    {metadata.positions.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium px-1">* ตำแหน่งตามจ้างงานจริง</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">วิทยฐานะ (Academic Standing)</label>
                  <select 
                    name="academicStandingId" 
                    value={selectedStandingId}
                    onChange={(e) => setSelectedStandingId(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-indigo-600 shadow-sm"
                  >
                    <option value="">-- เลือกวิทยฐานะ --</option>
                    {metadata.standings.map(std => (
                      <option key={std.id} value={std.id}>{std.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium px-1">* สำหรับข้าราชการครู</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">งาน (แบ่งตามกลุ่มบริหาร)</label>
                <div className="bg-slate-50 p-4 rounded-[2rem] max-h-[400px] overflow-y-auto border border-slate-100 space-y-6">
                  {adminGroups.map((group: any) => {
                    const groupDivs = divisions.filter((d: any) => d.groupId === group.id);
                    return (
                      <div key={group.id} className="space-y-2">
                        <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50/50 rounded-lg group/header">
                          <input 
                            type="checkbox" 
                            name="adminGroupIds" 
                            value={group.id} 
                            id={`group-${group.id}`}
                            defaultChecked={teacher.adminGroups?.some((g: any) => g.id === group.id)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                          />
                          <label htmlFor={`group-${group.id}`} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest cursor-pointer">
                            {group.groupName}
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1 ml-4 pl-4 border-l-2 border-indigo-50">
                          {groupDivs.length > 0 ? (
                            groupDivs.map((div: any) => (
                              <label key={div.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                                <input 
                                  type="checkbox" 
                                  name="divisionIds" 
                                  value={div.id} 
                                  defaultChecked={teacher.divisions.some((d: any) => d.id === div.id)}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                                />
                                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">{div.divisionName}</span>
                              </label>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-400 italic px-2">ไม่มีฝ่ายงานย่อย</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">การศึกษาและการติดต่อ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">เลขบัตรประชาชน</label>
                  <input type="text" name="nationalId" maxLength={13} defaultValue={teacher.nationalId || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">วุฒิการศึกษา</label>
                  <input type="text" name="qualification" defaultValue={teacher.qualification || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">วิชาเอก</label>
                  <input type="text" name="major" defaultValue={teacher.major || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none" />
                </div>
                <div className="pt-4 md:col-span-2 border-t border-slate-50 flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">เบอร์โทรศัพท์</label>
                    <input type="text" name="phoneNumber" defaultValue={teacher.phoneNumber || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Line ID</label>
                    <input type="text" name="lineId" defaultValue={teacher.lineId || ""} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all"
          >
            ยกเลิก
          </button>
          <button 
            type="submit"
            disabled={isPending}
            className="px-16 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> บันทึกการแก้ไข</>}
          </button>
        </div>
      </form>
    </div>
  );
}
