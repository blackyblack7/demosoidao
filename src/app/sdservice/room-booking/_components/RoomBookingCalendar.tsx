"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Building2, Calendar } from "lucide-react";
import { format, getDaysInMonth, startOfMonth, getDay, startOfDay, endOfDay, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Booking {
  id: number;
  title: string;
  statusRef?: { key: string };
  startTime: string;
  endTime: string;
  bookingOrg: string;
  room: { name: string; imageUrl: string | null };
  requester: { prefixRef: { name: string } | null; firstName: string; lastName: string };
}

interface Props {
  bookings: Booking[];
  year: number;
  month: number;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; card: string; bar: string }> = {
  PENDING:         { label: "รอโสตฯ",     bg: "bg-amber-400",   text: "text-white",  card: "bg-amber-50 border-amber-200 text-amber-800",       bar: "bg-amber-400" },
  AV_APPROVED:     { label: "รอ รอง ผอ.", bg: "bg-blue-500",    text: "text-white",  card: "bg-blue-50 border-blue-200 text-blue-800",         bar: "bg-blue-500" },
  DEPUTY_APPROVED: { label: "รอ ผอ.",     bg: "bg-indigo-500",  text: "text-white",  card: "bg-indigo-50 border-indigo-200 text-indigo-800",    bar: "bg-indigo-500" },
  APPROVED:        { label: "อนุมัติ",    bg: "bg-emerald-500", text: "text-white",  card: "bg-emerald-50 border-emerald-200 text-emerald-800", bar: "bg-emerald-500" },
  DENIED:          { label: "ไม่อนุมัติ", bg: "bg-red-300",     text: "text-white",  card: "bg-red-50 border-red-200 text-red-400 opacity-60",  bar: "bg-red-300" },
};

function clampDay(d: Date, year: number, month: number, dim: number): number {
  if (d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() + 1 < month)) return 1;
  if (d.getFullYear() > year || (d.getFullYear() === year && d.getMonth() + 1 > month)) return dim;
  return d.getDate();
}

function isMultiDay(b: Booking): boolean {
  return !isSameDay(new Date(b.startTime), new Date(b.endTime));
}

function shortRoom(name: string) {
  return name.replace("ห้องโสตทัศนศึกษา", "โสตฯ").replace("หอประชุม", "หอประชุม");
}

interface BarSeg {
  booking: Booking;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
  lane: number;
}

export default function RoomBookingCalendar({ bookings, year, month }: Props) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const dim = getDaysInMonth(new Date(year, month - 1, 1));
  const fdow = getDay(startOfMonth(new Date(year, month - 1, 1)));
  const totalCells = fdow + dim;
  const totalWeeks = Math.ceil(totalCells / 7);

  const handleNav = (dir: -1 | 1) => {
    let m = month + dir, y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    router.push(`/sdservice/room-booking?year=${y}&month=${m}`);
  };

  const singleDay = bookings.filter(b => !isMultiDay(b));
  const multiDay  = bookings.filter(b => isMultiDay(b));

  const getSingle = (day: number) =>
    singleDay.filter(b => {
      const d = new Date(b.startTime);
      return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
    });

  const getAllForDay = (day: number) => {
    const ds = startOfDay(new Date(year, month - 1, day));
    const de = endOfDay(new Date(year, month - 1, day));
    return bookings.filter(b => new Date(b.startTime) <= de && new Date(b.endTime) >= ds);
  };

  // Build multi-day bar segments per week
  const weekBars = useMemo(() => {
    const result: BarSeg[][] = [];
    for (let w = 0; w < totalWeeks; w++) {
      const segs: BarSeg[] = [];
      const wStart = w * 7, wEnd = wStart + 6;
      for (const b of multiDay) {
        const bs = fdow + clampDay(new Date(b.startTime), year, month, dim) - 1;
        const be = fdow + clampDay(new Date(b.endTime), year, month, dim) - 1;
        if (bs > wEnd || be < wStart) continue;
        const ss = Math.max(bs, wStart), se = Math.min(be, wEnd);
        segs.push({
          booking: b, startCol: (ss % 7) + 1, span: se - ss + 1,
          isStart: ss === bs, isEnd: se === be, lane: 0,
        });
      }
      segs.sort((a, b) => a.startCol - b.startCol || b.span - a.span);
      const lanes: number[][] = [];
      for (const s of segs) {
        let l = 0;
        while (true) {
          if (!lanes[l]) { lanes[l] = []; break; }
          if (!lanes[l].some(end => end >= s.startCol)) break;
          l++;
        }
        s.lane = l;
        lanes[l] = lanes[l] || [];
        lanes[l].push(s.startCol + s.span - 1);
      }
      result.push(segs);
    }
    return result;
  }, [bookings, year, month, dim, fdow, totalWeeks, multiDay]);

  const maxLanes = weekBars.map(s => s.length > 0 ? Math.max(...s.map(x => x.lane)) + 1 : 0);

  const selectedBookings = selectedDay ? getAllForDay(selectedDay) : [];
  const weekDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 md:px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <CalendarDays size={28} className="text-violet-600" />
          ปฏิทินการจองห้อง
        </h3>
        <div className="flex items-center gap-4">
          <button onClick={() => handleNav(-1)} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <ChevronLeft size={24} />
          </button>
          <span className="text-xl font-black text-slate-800 min-w-[180px] text-center">
            {format(new Date(year, month - 1), "MMMM yyyy", { locale: th })}
          </span>
          <button onClick={() => handleNav(1)} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-black text-slate-400 uppercase py-3 tracking-widest">{d.substring(0, 3)}</div>
          ))}
        </div>

        {/* Week rows */}
        <div className="border-t border-slate-100">
          {Array.from({ length: totalWeeks }).map((_, wi) => {
            const bars = weekBars[wi];
            const lanes = maxLanes[wi];
            const barH = lanes > 0 ? lanes * 28 + 8 : 10; 

            return (
              <div key={wi} className="border-b border-slate-100 group">
                {/* Day numbers */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: 7 }).map((_, ci) => {
                    const cell = wi * 7 + ci;
                    const day = cell - fdow + 1;
                    const valid = day >= 1 && day <= dim;
                    if (!valid) return <div key={ci} className="h-12 border-r border-slate-50 last:border-r-0" />;

                    const isToday = new Date().getDate() === day && new Date().getMonth() + 1 === month && new Date().getFullYear() === year;
                    const isSel = selectedDay === day;
                    const hasAny = getAllForDay(day).length > 0;

                    return (
                      <button
                        key={ci}
                        onClick={() => setSelectedDay(isSel ? null : day)}
                        className={`h-12 flex items-center justify-center border-r border-slate-50 last:border-r-0 transition-all relative ${
                          isSel ? "bg-violet-600" : isToday ? "bg-violet-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className={`text-base font-black w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                          isSel
                            ? "bg-white text-violet-600 shadow-lg"
                            : isToday
                            ? "bg-violet-600 text-white shadow-md"
                            : "text-slate-700 group-hover:scale-110"
                        }`}>
                          {day}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Single-day booking pills */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: 7 }).map((_, ci) => {
                    const cell = wi * 7 + ci;
                    const day = cell - fdow + 1;
                    const valid = day >= 1 && day <= dim;
                    if (!valid) return <div key={ci} className="min-h-[4px] border-r border-slate-50 last:border-r-0" />;

                    const pills = getSingle(day);
                    const isSel = selectedDay === day;

                    return (
                      <div
                        key={ci}
                        className={`px-1.5 pb-2 border-r border-slate-50 last:border-r-0 min-h-[10px] ${isSel ? "bg-violet-600/5" : ""}`}
                      >
                        {pills.map(b => {
                          const cfg = STATUS_CONFIG[b.statusRef?.key || "PENDING"] || STATUS_CONFIG.PENDING;
                          return (
                            <div
                              key={b.id}
                              className={`w-full px-2 py-1 rounded-lg text-[10px] font-black truncate mb-1 shadow-sm border ${cfg.bg} ${cfg.text} border-white/20`}
                            >
                              {format(new Date(b.startTime), "HH:mm")} {shortRoom(b.room.name)}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Multi-day bars */}
                {lanes > 0 && (
                  <div className="relative px-0.5" style={{ height: barH }}>
                    {bars.map((seg, i) => {
                      const cfg = STATUS_CONFIG[seg.booking.statusRef?.key || "PENDING"] || STATUS_CONFIG.PENDING;
                      const leftPct = ((seg.startCol - 1) / 7) * 100;
                      const widthPct = (seg.span / 7) * 100;
                      return (
                        <div
                          key={`${seg.booking.id}-${wi}-${i}`}
                          className={`absolute flex items-center gap-2 px-3 text-[11px] font-black truncate cursor-pointer hover:brightness-105 hover:scale-[1.01] transition-all shadow-sm ${cfg.bg} ${cfg.text} ${
                            seg.isStart ? "rounded-l-xl ml-1" : ""
                          } ${seg.isEnd ? "rounded-r-xl mr-1" : ""}`}
                          style={{
                            left: `${leftPct}%`,
                            width: `calc(${widthPct}% - ${seg.isStart && seg.isEnd ? 8 : seg.isStart || seg.isEnd ? 4 : 0}px)`,
                            top: seg.lane * 28 + 4,
                            height: 24,
                          }}
                          onClick={() => setSelectedDay(clampDay(new Date(seg.booking.startTime), year, month, dim))}
                        >
                          {seg.isStart ? (
                            <span className="truncate flex items-center gap-2">
                              <Building2 size={12} className="opacity-80" />
                              {shortRoom(seg.booking.room.name)}: {seg.booking.title}
                            </span>
                          ) : (
                            <span className="truncate opacity-80 flex items-center gap-1">
                              ↳ {seg.booking.title}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 px-2 pt-6 border-t border-slate-100">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-lg shadow-sm ${cfg.bg}`} />
              <span className="text-sm text-slate-600 font-bold">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="border-t border-slate-200 px-8 md:px-12 py-10 bg-slate-50/50">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-200">
                <CalendarDays size={20} />
              </div>
              รายละเอียดการจองวันที่ {selectedDay} {format(new Date(year, month - 1), "MMMM yyyy", { locale: th })}
            </h4>
            <button onClick={() => setSelectedDay(null)} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">ปิดหน้านี้</button>
          </div>
          
          {selectedBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedBookings.map(b => {
                const cfg = STATUS_CONFIG[b.statusRef?.key || "PENDING"] || STATUS_CONFIG.PENDING;
                const multi = isMultiDay(b);
                return (
                  <div key={b.id} className={`flex flex-col overflow-hidden rounded-[2.5rem] border-2 bg-white shadow-2xl shadow-slate-200/50 transition-all hover:scale-[1.01] ${cfg.card.split(' ')[1]}`}>
                    {/* Room Image */}
                    {b.room.imageUrl && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={b.room.imageUrl}
                          alt={b.room.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-6">
                           <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/30 uppercase tracking-widest">
                             {b.room.name}
                           </span>
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <span className={`text-[11px] font-black px-4 py-2 rounded-full border shadow-sm ${cfg.card}`}>
                          {cfg.label}
                        </span>
                        {multi && (
                          <span className="text-[11px] font-black px-4 py-2 rounded-full bg-violet-600 text-white shadow-lg">
                            จองต่อเนื่องหลายวัน
                          </span>
                        )}
                      </div>
                      
                      <h5 className="text-2xl font-black text-slate-800 mb-6 leading-tight">{b.title}</h5>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                          <div className="p-2.5 bg-white rounded-2xl shadow-sm text-violet-600">
                             <Calendar size={20} />
                          </div>
                          <div className="flex-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ระยะเวลาจอง</p>
                             <div className="flex flex-col gap-1">
                               <div className="flex items-center justify-between">
                                 <span className="text-sm font-bold text-slate-700">เริ่มต้น:</span>
                                 <span className="text-sm font-black text-violet-600">{format(new Date(b.startTime), "d MMM yyyy 'เวลา' HH:mm 'น.'", { locale: th })}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                 <span className="text-sm font-bold text-slate-700">สิ้นสุด:</span>
                                 <span className="text-sm font-black text-violet-600">{format(new Date(b.endTime), "d MMM yyyy 'เวลา' HH:mm 'น.'", { locale: th })}</span>
                               </div>
                             </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                              <Building2 size={18} className="text-violet-500" />
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">สถานที่</p>
                                <p className="text-xs font-black text-slate-700 truncate">{b.room.name}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-violet-600 font-black text-sm">
                                {b.requester.firstName[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ผู้รับผิดชอบ</p>
                                <p className="text-xs font-black text-slate-700 truncate">{b.requester.firstName}</p>
                              </div>
                           </div>
                        </div>

                        <div className="p-4 bg-violet-600/5 rounded-3xl border border-violet-100">
                           <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1">หน่วยงาน / กลุ่มสาระฯ</p>
                           <p className="text-sm font-bold text-violet-900">{b.bookingOrg}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
               <p className="text-lg font-bold text-slate-400">ไม่มีการจองในวันนี้</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
