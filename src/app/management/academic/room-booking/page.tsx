import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Monitor, CalendarDays, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { DIVISION_NAMES } from "@/constants";
import BookingStatusBadge from "@/app/sdservice/room-booking/_components/BookingStatusBadge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import RoomBookingApproveButton from "./_components/RoomBookingApproveButton";
import BookingEditDeletePanel from "./_components/BookingEditDeletePanel";
import RealtimeSync from "@/components/utils/RealtimeSync";

export default async function RoomBookingManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
    include: { positionRef: true, divisions: true },
  });
  if (!teacher) redirect("/login");

  const isAVStaff   = teacher.divisions.some(d => d.divisionName === DIVISION_NAMES.AUDIO_VISUAL) || teacher.isAdmin;
  const isDeputy    = (teacher.positionRef?.level ?? 0) >= 8 || teacher.isAdmin;
  const isDirector  = teacher.positionRef?.level === 10 || teacher.isAdmin;

  const canApprove = isAVStaff || isDeputy || isDirector;
  if (!canApprove) redirect("/access-denied");

  const sp = await searchParams;
  const filterStatus = sp.status || "all";

  const statusMap: Record<string, string | undefined> = {
    pending:  "PENDING",
    av:       "AV_APPROVED",
    deputy:   "DEPUTY_APPROVED",
    approved: "APPROVED",
    denied:   "DENIED",
  };

  const [bookings, rooms] = await Promise.all([
    prisma.roomBooking.findMany({
      where: filterStatus !== "all" && statusMap[filterStatus]
        ? { statusRef: { key: statusMap[filterStatus] } }
        : undefined,
      include: {
        room: true,
        requester: { select: { prefixRef: { select: { name: true } }, firstName: true, lastName: true } },
        avApprovedBy: { select: { prefixRef: { select: { name: true } }, firstName: true } },
        deputyApprovedBy: { select: { prefixRef: { select: { name: true } }, firstName: true } },
        directorApprovedBy: { select: { prefixRef: { select: { name: true } }, firstName: true } },
        deniedBy: { select: { prefixRef: { select: { name: true } }, firstName: true } },
        statusRef: true,
      },
      orderBy: [{ statusId: "asc" }, { startTime: "asc" }],
    }),
    prisma.room.findMany({ where: { isActive: true }, orderBy: { id: "asc" } }),
  ]);

  const tabs = [
    { key: "all", label: "ทั้งหมด" },
    { key: "pending", label: "รอโสตฯ" },
    { key: "av", label: "รอ รอง ผอ." },
    { key: "deputy", label: "รอ ผอ." },
    { key: "approved", label: "อนุมัติแล้ว" },
    { key: "denied", label: "ไม่อนุมัติ" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <RealtimeSync intervalMs={30000} label="AdminRoomBooking" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/management" className="hover:text-violet-600 transition-colors">Management</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">จัดการการจองห้องโสตฯ</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-violet-600/10 text-violet-600 rounded-2xl">
              <Monitor size={32} />
            </div>
            จัดการการจองห้องโสตทัศนศึกษา
          </h1>
          <p className="text-slate-500 mt-2 font-medium">ตรวจสอบ แก้ไข และอนุมัติคำขอจองห้องของบุคลากร</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "รอโสตฯ พิจารณา", count: bookings.filter((b: any) => b.statusRef?.key === "PENDING").length, color: "text-amber-600 bg-amber-50" },
            { label: "ผ่านโสตฯ แล้ว",  count: bookings.filter((b: any) => b.statusRef?.key === "AV_APPROVED").length, color: "text-blue-600 bg-blue-50" },
            { label: "ผ่านรอง ผอ. แล้ว", count: bookings.filter((b: any) => b.statusRef?.key === "DEPUTY_APPROVED").length, color: "text-indigo-600 bg-indigo-50" },
            { label: "อนุมัติแล้ว",    count: bookings.filter((b: any) => b.statusRef?.key === "APPROVED").length, color: "text-emerald-600 bg-emerald-50" },
          ].map((s: any) => (
            <div key={s.label} className={`p-5 rounded-3xl ${s.color} border border-current/10`}>
              <p className="text-xs font-bold opacity-70 mb-1">{s.label}</p>
              <p className="text-3xl font-black">{s.count}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map((t: any) => (
            <Link
              key={t.key}
              href={`/management/academic/room-booking?status=${t.key}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filterStatus === t.key
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-violet-50"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {bookings.length > 0 ? (
              bookings.map((b: any) => {
                const canActNow =
                  (isAVStaff   && b.statusRef?.key === "PENDING") ||
                  (isDeputy    && b.statusRef?.key === "AV_APPROVED") ||
                  (isDirector  && b.statusRef?.key === "DEPUTY_APPROVED");

                return (
                  <div key={b.id} className="p-8 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <BookingStatusBadge status={b.statusRef?.key || "PENDING"} />
                          <span className="text-xs font-bold text-slate-400">#{b.id.toString().padStart(4, "0")}</span>
                        </div>

                        <h4 className="text-xl font-bold text-slate-800">{b.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2">{b.purpose}</p>

                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500 pt-1">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-violet-400" />
                            {b.room.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-violet-400" />
                            {format(b.startTime, "d MMM HH:mm", { locale: th })} – {format(b.endTime, "HH:mm 'น.'", { locale: th })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-violet-400" />
                            {b.requester.prefixRef?.name || ''}{b.requester.firstName} • {b.bookingOrg}
                          </span>
                        </div>

                        {/* Equipment */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {b.equipLedScreen  && <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">LED Screen</span>}
                          {b.equipProjector  && <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Projector</span>}
                          {b.equipSound      && <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">เครื่องเสียง</span>}
                          {b.equipMicCount > 0 && <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">ไมค์ {b.equipMicCount} ตัว</span>}
                        </div>

                        {/* Approval trail */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {b.avApprovedBy && (
                            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                              <CheckCircle size={11} /> โสตฯ: {b.avApprovedBy.prefixRef?.name || ''}{b.avApprovedBy.firstName}
                            </span>
                          )}
                          {b.deputyApprovedBy && (
                            <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                              <CheckCircle size={11} /> รอง ผอ.: {b.deputyApprovedBy.prefixRef?.name || ''}{b.deputyApprovedBy.firstName}
                            </span>
                          )}
                          {b.directorApprovedBy && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                              <CheckCircle size={11} /> ผอ.: {b.directorApprovedBy.prefixRef?.name || ''}{b.directorApprovedBy.firstName}
                            </span>
                          )}
                          {b.deniedBy && (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                              <XCircle size={11} /> ปฏิเสธโดย: {b.deniedBy.prefixRef?.name || ''}{b.deniedBy.firstName}
                              {b.deniedReason && ` — ${b.deniedReason}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons Column */}
                      <div className="flex flex-col gap-3 justify-start">
                        {/* Approve / Deny — only when it's the correct stage */}
                        {canActNow && (
                          <div className="flex flex-col gap-2">
                            <RoomBookingApproveButton bookingId={b.id} decision="APPROVE" />
                            <RoomBookingApproveButton bookingId={b.id} decision="DENY" />
                          </div>
                        )}

                        {/* Edit / Delete — AV staff only */}
                        {isAVStaff && (
                          <BookingEditDeletePanel
                            booking={{
                              id: b.id,
                              title: b.title,
                              purpose: b.purpose,
                              bookingOrg: b.bookingOrg,
                              roomId: b.roomId,
                              startTime: b.startTime.toISOString(),
                              endTime: b.endTime.toISOString(),
                              equipLedScreen: b.equipLedScreen,
                              equipProjector: b.equipProjector,
                              equipSound: b.equipSound,
                              equipMicCount: b.equipMicCount,
                              equipNotes: b.equipNotes,
                            }}
                            rooms={rooms.map((r: any) => ({ id: r.id, name: r.name }))}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-50 rounded-full mb-6">
                  <Monitor size={40} className="text-violet-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">ไม่มีรายการ</h4>
                <p className="text-slate-500">ไม่พบคำขอจองห้องในสถานะที่เลือก</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
