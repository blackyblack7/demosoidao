"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2, AlertCircle, CheckCircle, X, Monitor, Projector, Volume2, Mic, Save } from "lucide-react";
import { deleteRoomBooking, updateRoomBooking } from "@/app/actions/room-booking";

interface Room { id: number; name: string }

interface Booking {
  id: number;
  title: string;
  purpose: string;
  bookingOrg: string;
  roomId: number;
  startTime: string;
  endTime: string;
  equipLedScreen: boolean;
  equipProjector: boolean;
  equipSound: boolean;
  equipMicCount: number;
  equipNotes: string | null;
}

interface Props {
  booking: Booking;
  rooms: Room[];
}

const EQUIPMENT = [
  { key: "equipLedScreen", icon: Monitor,   label: "หน้าจอ LED" },
  { key: "equipProjector", icon: Projector, label: "Projector" },
  { key: "equipSound",     icon: Volume2,   label: "เครื่องเสียง" },
];

// Format datetime for input value
function toLocalDatetime(isoStr: string) {
  const d = new Date(isoStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingEditDeletePanel({ booking, rooms }: Props) {
  const [isPendingDel, startDel] = useTransition();
  const [isPendingEdit, startEdit] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Edit form state
  const [equip, setEquip] = useState({
    equipLedScreen: booking.equipLedScreen,
    equipProjector: booking.equipProjector,
    equipSound: booking.equipSound,
  });
  const [micCount, setMicCount] = useState(booking.equipMicCount);

  function handleDelete() {
    startDel(async () => {
      const res = await deleteRoomBooking(booking.id);
      if ("error" in res) setError(res.error);
    });
  }

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (equip.equipLedScreen) formData.set("equipLedScreen", "on");
    if (equip.equipProjector) formData.set("equipProjector", "on");
    if (equip.equipSound)     formData.set("equipSound", "on");
    formData.set("equipMicCount", String(micCount));

    startEdit(async () => {
      const res = await updateRoomBooking(booking.id, formData);
      if ("error" in res) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => { setShowEditModal(false); setSuccess(false); }, 800);
      }
    });
  }

  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setShowEditModal(true); setError(null); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl font-bold text-sm hover:bg-violet-100 transition-all active:scale-95"
        >
          <Pencil size={14} />
          แก้ไข
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-all active:scale-95"
        >
          <Trash2 size={14} />
          ลบ
        </button>
      </div>

      {/* ─── Delete Confirm Modal ─── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800">ยืนยันการลบ?</h3>
              <p className="text-slate-500 text-sm mt-2">คำขอจอง <span className="font-bold text-slate-700">"{booking.title}"</span> จะถูกลบออกจากระบบถาวร</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm mb-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={isPendingDel}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isPendingDel ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between z-10">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Pencil size={20} className="text-violet-500" />
                แก้ไขคำขอจอง #{booking.id.toString().padStart(4, "0")}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-8 space-y-6">
              {/* Room */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ห้อง</label>
                <select
                  name="roomId"
                  defaultValue={booking.roomId}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-violet-400 transition-colors"
                >
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อกิจกรรม</label>
                <input
                  name="title"
                  required
                  defaultValue={booking.title}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-violet-400 transition-colors"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">วัตถุประสงค์</label>
                <textarea
                  name="purpose"
                  required
                  rows={2}
                  defaultValue={booking.purpose}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-violet-400 transition-colors resize-none"
                />
              </div>

              {/* Booking Org */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">จองในนาม</label>
                <input
                  name="bookingOrg"
                  required
                  defaultValue={booking.bookingOrg}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-violet-400 transition-colors"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">เวลาเริ่มต้น</label>
                  <input
                    name="startTime"
                    type="datetime-local"
                    required
                    defaultValue={toLocalDatetime(booking.startTime)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-violet-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">เวลาสิ้นสุด</label>
                  <input
                    name="endTime"
                    type="datetime-local"
                    required
                    defaultValue={toLocalDatetime(booking.endTime)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-violet-400 transition-colors"
                  />
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">อุปกรณ์</label>
                <div className="flex flex-wrap gap-3">
                  {EQUIPMENT.map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEquip(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all ${
                        equip[key as keyof typeof equip]
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-200"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                      {equip[key as keyof typeof equip] && <CheckCircle size={14} className="text-violet-500" />}
                    </button>
                  ))}
                  {/* Mic counter */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all ${micCount > 0 ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-slate-50"}`}>
                    <Mic size={16} className={micCount > 0 ? "text-violet-600" : "text-slate-500"} />
                    <span className="text-sm font-bold text-slate-700">ไมค์</span>
                    <button type="button" onClick={() => setMicCount(Math.max(0, micCount - 1))} className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-black text-slate-600 text-xs transition-colors">−</button>
                    <span className="w-5 text-center font-black text-slate-800">{micCount}</span>
                    <button type="button" onClick={() => setMicCount(micCount + 1)} className="w-6 h-6 rounded-lg bg-violet-600 hover:bg-violet-700 flex items-center justify-center font-black text-white text-xs transition-colors">+</button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">หมายเหตุ</label>
                <textarea
                  name="equipNotes"
                  rows={2}
                  defaultValue={booking.equipNotes || ""}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-violet-400 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isPendingEdit || success}
                  className="flex-1 py-3.5 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {success ? (
                    <><CheckCircle size={16} /> บันทึกแล้ว!</>
                  ) : isPendingEdit ? (
                    <><Loader2 size={16} className="animate-spin" /> กำลังบันทึก...</>
                  ) : (
                    <><Save size={16} /> บันทึกการแก้ไข</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
