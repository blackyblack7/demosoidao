import { checkAdminAccess } from "@/lib/auth";
import { getSitePopup } from "@/app/actions/popup";
import { redirect } from "next/navigation";
import PopupManager from "./_components/PopupManager";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "จัดการ Popup หน้าเว็บ - ระบบสารสนเทศ",
};

export default async function PopupManagementPage() {
  const hasAccess = await checkAdminAccess("กลุ่มบริหารงานทั่วไป");
  
  if (!hasAccess) {
    redirect("/access-denied");
  }

  const popup = await getSitePopup();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/management" className="hover:text-blue-600 transition-colors">Admin Dashboard</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-bold tracking-tight">จัดการ Popup แจ้งเตือน</span>
        </nav>

        <PopupManager popup={popup} />
      </div>
    </div>
  );
}
