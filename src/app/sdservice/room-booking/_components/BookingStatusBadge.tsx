"use client";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING:         { label: "รอฝ่ายโสตพิจารณา",    className: "bg-amber-100 text-amber-700 border border-amber-200" },
  AV_APPROVED:     { label: "ฝ่ายโสตอนุมัติแล้ว",  className: "bg-blue-100 text-blue-700 border border-blue-200" },
  DEPUTY_APPROVED: { label: "รอง ผอ. อนุมัติแล้ว", className: "bg-indigo-100 text-indigo-700 border border-indigo-200" },
  APPROVED:        { label: "อนุมัติแล้ว",           className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  DENIED:          { label: "ไม่อนุมัติ",            className: "bg-red-100 text-red-600 border border-red-200" },
};

export default function BookingStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, className: "bg-slate-100 text-slate-600 border border-slate-200" };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}
