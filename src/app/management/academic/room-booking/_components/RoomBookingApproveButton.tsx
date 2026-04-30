"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { approveRoomBooking } from "@/app/actions/room-booking";

interface Props {
  bookingId: number;
  decision: "APPROVE" | "DENY";
}

export default function RoomBookingApproveButton({ bookingId, decision }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDenyReason, setShowDenyReason] = useState(false);
  const [denyReason, setDenyReason] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveRoomBooking(bookingId, "APPROVE");
      if ("error" in result) setError(result.error);
    });
  }

  function handleDeny() {
    if (!showDenyReason) {
      setShowDenyReason(true);
      return;
    }
    startTransition(async () => {
      const result = await approveRoomBooking(bookingId, "DENY", denyReason);
      if ("error" in result) setError(result.error);
      else setShowDenyReason(false);
    });
  }

  if (error) {
    return (
      <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold max-w-[180px]">
        {error}
      </div>
    );
  }

  if (decision === "APPROVE") {
    return (
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-60 shadow-md shadow-emerald-200"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        อนุมัติ
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {showDenyReason && (
        <input
          value={denyReason}
          onChange={(e) => setDenyReason(e.target.value)}
          placeholder="ระบุเหตุผลที่ปฏิเสธ..."
          className="px-3 py-2 border border-red-200 rounded-xl text-xs bg-red-50 text-red-700 placeholder-red-300 focus:outline-none focus:border-red-400 w-full"
        />
      )}
      <button
        onClick={handleDeny}
        disabled={isPending}
        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-all active:scale-95 disabled:opacity-60"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
        {showDenyReason ? "ยืนยันปฏิเสธ" : "ปฏิเสธ"}
      </button>
    </div>
  );
}
