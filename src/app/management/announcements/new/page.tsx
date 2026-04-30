import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnnouncementForm from "../_components/AnnouncementForm";

export default async function NewAnnouncementPage() {
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) redirect("/access-denied");

  const category = await prisma.newsCategory.findUnique({
    where: { name: 'ประกาศ' }
  });

  if (!category) {
    // This should ideally not happen if we ran the script, but just in case
    return <div className="pt-28 text-center">Announcement category not found. Please contact administrator.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-2xl mx-auto px-4">
        <AnnouncementForm announcementCategoryId={category.id} />
      </div>
    </div>
  );
}
