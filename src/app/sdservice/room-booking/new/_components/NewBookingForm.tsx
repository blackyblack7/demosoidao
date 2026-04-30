"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor, Projector, Volume2, Mic, CheckCircle, ChevronDown,
  CalendarDays, Clock, Building2, Users, Loader2, AlertCircle, Pencil
} from "lucide-react";
import { submitRoomBooking } from "@/app/actions/room-booking";

interface Room {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  capacity: number | null;
}

interface Props {
  rooms: Room[];
  orgOptions: string[];
}

const EQUIPMENT = [
  { key: "equipLedScreen", icon: Monitor,    label: "หน้าจอ LED",    description: "จอ LED ขนาดใหญ่" },
  { key: "equipProjector", icon: Projector,  label: "Projector",     description: "โปรเจกเตอร์พร้อมจอรับภาพ" },
  { key: "equipSound",     icon: Volume2,    label: "เครื่องเสียง",  description: "ระบบเสียงครบชุด" },
];

export default function NewBookingForm({ rooms, orgOptions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<Record<string, boolean>>({});
  const [micCount, setMicCount] = useState(0);
  const [orgMode, setOrgMode] = useState<"select" | "custom">("select");
  const [selectedOrg, setSelectedOrg] = useState(orgOptions[0] || "");
  const [customOrg, setCustomOrg] = useState("");

  // Today formatted for min date
  const todayStr = new Date().toISOString().slice(0, 16);

  function toggleEquip(key: string) {
    setEquipment((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!selectedRoom) { setError("กรุณาเลือกห้อง"); return; }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Inject selected room id
    formData.set("roomId", String(selectedRoom));

    // Inject booking org
    const orgValue = orgMode === "custom" ? customOrg : selectedOrg;
    if (!orgValue.trim()) { setError("กรุณาระบุชื่อหน่วยงาน/กลุ่มสาระที่จอง"); return; }
    formData.set("bookingOrg", orgValue.trim());

    // Inject equipment
    for (const eq of EQUIPMENT) {
      if (equipment[eq.key]) formData.set(eq.key, "on");
    }
    formData.set("equipMicCount", String(micCount));

    startTransition(async () => {
      const result = await submitRoomBooking(formData);
      if ("error" in result) {
        setError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      } else {
        router.push("/sdservice/room-booking");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ─── Step 1: Select Room ─── */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Building2 size={20} className="text-violet-500" />
          เลือกห้อง
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelectedRoom(room.id)}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all text-left group ${
                selectedRoom === room.id
                  ? "border-violet-500 shadow-lg shadow-violet-100"
                  : "border-slate-100 hover:border-violet-200"
              }`}
            >
              {room.imageUrl && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-bold text-slate-800">{room.name}</p>
                {room.capacity && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Users size={12} /> รองรับ {room.capacity} คน
                  </p>
                )}
                {room.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{room.description}</p>
                )}
              </div>
              {selectedRoom === room.id && (
                <div className="absolute top-3 right-3 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle size={16} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Step 2: Event Details ─── */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays size={20} className="text-violet-500" />
          รายละเอียดกิจกรรม
        </h2>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            ชื่อกิจกรรม / หัวข้อ <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="เช่น การประชุมครูประจำเดือน"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            วัตถุประสงค์ <span className="text-red-500">*</span>
          </label>
          <textarea
            name="purpose"
            required
            rows={3}
            placeholder="อธิบายวัตถุประสงค์การใช้ห้องโดยย่อ"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Booking Org */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            จองในนาม <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setOrgMode("select")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                orgMode === "select"
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ChevronDown size={14} />
              เลือกจากรายการ
            </button>
            <button
              type="button"
              onClick={() => setOrgMode("custom")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                orgMode === "custom"
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Pencil size={14} />
              กรอกเอง
            </button>
          </div>

          {orgMode === "select" ? (
            orgOptions.length > 0 ? (
              <div className="space-y-2">
                {orgOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedOrg(opt)}
                    className={`w-full text-left px-5 py-3 rounded-2xl border-2 font-medium text-sm transition-all ${
                      selectedOrg === opt
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-slate-100 bg-slate-50 text-slate-700 hover:border-violet-200"
                    }`}
                  >
                    {opt}
                    {selectedOrg === opt && (
                      <CheckCircle size={14} className="inline ml-2 text-violet-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">ไม่พบกลุ่มสาระหรือฝ่ายงานในโปรไฟล์ของคุณ กรุณากรอกเอง</p>
            )
          ) : (
            <input
              value={customOrg}
              onChange={(e) => setCustomOrg(e.target.value)}
              placeholder="เช่น กลุ่มสาระวิทยาศาสตร์ / ฝ่ายวิชาการ"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Clock size={14} className="inline mr-1 text-violet-500" />
              เวลาเริ่มต้น <span className="text-red-500">*</span>
            </label>
            <input
              name="startTime"
              type="datetime-local"
              required
              min={todayStr}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Clock size={14} className="inline mr-1 text-violet-500" />
              เวลาสิ้นสุด <span className="text-red-500">*</span>
            </label>
            <input
              name="endTime"
              type="datetime-local"
              required
              min={todayStr}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ─── Step 3: Equipment ─── */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Monitor size={20} className="text-violet-500" />
          ขออุปกรณ์เพิ่มเติม
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EQUIPMENT.map(({ key, icon: Icon, label, description }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleEquip(key)}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                equipment[key]
                  ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-100"
                  : "border-slate-100 bg-slate-50 hover:border-violet-200"
              }`}
            >
              <div className={`p-3 rounded-2xl ${equipment[key] ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                <Icon size={24} />
              </div>
              <div className="text-center">
                <p className={`font-bold text-sm ${equipment[key] ? "text-violet-700" : "text-slate-700"}`}>
                  {label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
              </div>
              {equipment[key] && (
                <CheckCircle size={18} className="text-violet-600" />
              )}
            </button>
          ))}
        </div>

        {/* Microphone */}
        <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
          micCount > 0 ? "border-violet-500 bg-violet-50" : "border-slate-100 bg-slate-50"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${micCount > 0 ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500"}`}>
              <Mic size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800">ไมโครโฟน</p>
              <p className="text-xs text-slate-400">ระบุจำนวนที่ต้องการ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMicCount(Math.max(0, micCount - 1))}
              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-black text-slate-600 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center font-black text-lg text-slate-800">{micCount}</span>
            <button
              type="button"
              onClick={() => setMicCount(micCount + 1)}
              className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center font-black text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            หมายเหตุเพิ่มเติม (อุปกรณ์อื่นๆ)
          </label>
          <textarea
            name="equipNotes"
            rows={2}
            placeholder="เช่น ต้องการคอมพิวเตอร์สำหรับนำเสนองาน"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors resize-none"
          />
        </div>
      </section>

      {/* Error near submit */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-bold">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-violet-200 hover:bg-violet-700 hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isPending ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            กำลังส่งคำขอ...
          </>
        ) : (
          <>
            <CheckCircle size={22} />
            ยื่นคำขอจองห้อง
          </>
        )}
      </button>
    </form>
  );
}
