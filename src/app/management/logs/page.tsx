import { checkAdminAccess, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronRight,
  ShieldAlert,
  History
} from "lucide-react";
import LogList from "./_components/LogList";
import { getPaginatedLogs, getLogModules } from "@/app/actions/logs";

interface Props {
  searchParams: {
    page?: string;
    module?: string;
    q?: string;
  }
}

export default async function AuditLogsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const hasAccess = await checkAdminAccess("ADMIN_CONTROL"); 
  
  const session = await getSession();
  if (!session || (session.userId !== 1 && !session.isAdmin)) {
    redirect("/access-denied");
  }

  const page = parseInt(sp.page || "1");
  const module = sp.module || "";
  const query = sp.q || "";
  const pageSize = 50;

  const { items, total, pages } = await getPaginatedLogs({
    page,
    limit: pageSize,
    module: module || undefined,
    query: query || undefined,
  });

  const modules = await getLogModules();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm font-medium text-slate-500 items-center gap-2">
          <Link href="/sdservice" className="hover:text-blue-600 transition-colors">SD Service</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">ตรวจสอบบันทึกกิจกรรมระบบ</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-800 text-white rounded-3xl shadow-xl">
              <History size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                บันทึกกิจกรรมระบบ (Audit logs)
              </h1>
              <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-500" />
                แสดงหน้าที่ {page} จากทั้งหมด {pages} หน้า (ทั้งหมด {total} รายการ)
              </p>
            </div>
          </div>
        </div>

        {/* List */}
        <LogList 
          logs={items} 
          total={total} 
          currentPage={page} 
          pages={pages}
          modules={modules}
          currentFilters={{ module, q: query }}
        />

      </div>
    </div>
  );
}
