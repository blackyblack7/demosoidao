import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, CalendarDays, Clock, History } from "lucide-react";
import { ServiceBackButton } from "@/components/layout/ServiceBackButton";
import { getRooms, getBookingsByMonth } from "@/app/actions/room-booking";
import { prisma } from "@/lib/prisma";
import RoomBookingCalendar from "./_components/RoomBookingCalendar";
import BookingStatusBadge from "@/app/sdservice/room-booking/_components/BookingStatusBadge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import RealtimeSync from "@/components/utils/RealtimeSync";

export default async function RoomBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") redirect("/login");

  const sp = await searchParams;
  const now = new Date();
  const year = parseInt(sp.year || String(now.getFullYear()));
  const month = parseInt(sp.month || String(now.getMonth() + 1));

  const [bookings, myBookings] = await Promise.all([
    getBookingsByMonth(year, month),
    prisma.roomBooking.findMany({
      where: { requesterId: session.userId },
      include: { room: true, statusRef: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <RealtimeSync intervalMs={60000} label="UserRoomBooking" />
      <div className="max-w-7xl mx-auto px-4">
        <ServiceBackButton />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
              จองห้อง{" "}
              <span className="text-violet-600">โสตทัศนศึกษา</span>
            </h1>
            <p className="text-slate-500 font-medium">
              จองห้องและอุปกรณ์สำหรับกิจกรรม การประชุม และการอบรม
            </p>
          </div>
          <Link
            href="/sdservice/room-booking/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] transform transition-all active:scale-95"
          >
            <Plus size={20} />
            จองห้องใหม่
          </Link>
        </div>

        {/* Calendar */}
        <div className="mb-12">
          <RoomBookingCalendar
            bookings={JSON.parse(JSON.stringify(bookings))}
            year={year}
            month={month}
          />
        </div>

        {/* My Bookings History */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History size={20} className="text-violet-500" />
              รายการจองของฉัน
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              My Bookings
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {myBookings.length > 0 ? (
              myBookings.map((b: any) => (
                <div
                  key={b.id}
                  className="p-8 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookingStatusBadge status={b.statusRef?.key || "PENDING"} />
                        <span className="text-sm text-slate-400 font-medium">
                          {format(b.createdAt, "d MMM yyyy", { locale: th })}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 group-hover:text-violet-600 transition-colors">
                        {b.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          {b.room.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {format(b.startTime, "d MMM HH:mm", { locale: th })} -{" "}
                          {format(b.endTime, "HH:mm 'น.'", { locale: th })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        จองในนาม: {b.bookingOrg}
                      </p>
                    </div>

                    {/* Approval chain visual */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {[
                        { label: "โสต", done: ["AV_APPROVED", "DEPUTY_APPROVED", "APPROVED"].includes(b.statusRef?.key || "") },
                        { label: "รอง ผอ.", done: ["DEPUTY_APPROVED", "APPROVED"].includes(b.statusRef?.key || "") },
                        { label: "ผอ.", done: b.statusRef?.key === "APPROVED" },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-1">
                          {i > 0 && <div className="w-4 h-px bg-slate-200" />}
                          <div
                            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl ${
                              b.statusRef?.key === "DENIED"
                                ? "bg-red-50"
                                : step.done
                                ? "bg-emerald-50"
                                : "bg-slate-50"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                b.statusRef?.key === "DENIED"
                                  ? "bg-red-400"
                                  : step.done
                                  ? "bg-emerald-500"
                                  : "bg-slate-300"
                              }`}
                            />
                            <span
                              className={`text-[9px] font-bold ${
                                b.statusRef?.key === "DENIED"
                                  ? "text-red-500"
                                  : step.done
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-50 rounded-full mb-6">
                  <CalendarDays size={40} className="text-violet-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                  ยังไม่มีรายการจอง
                </h4>
                <p className="text-slate-500">
                  กดปุ่ม "จองห้องใหม่" เพื่อเริ่มต้น
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
