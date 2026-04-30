import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import AnnouncementForm from "../_components/AnnouncementForm";

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) redirect("/access-denied");

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const announcement = await prisma.blogPost.findUnique({
    where: { id }
  });

  if (!announcement) notFound();

  const category = await prisma.newsCategory.findUnique({
    where: { name: 'ประกาศ' }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-2xl mx-auto px-4">
        <AnnouncementForm 
          initialData={announcement} 
          announcementCategoryId={category?.id || 0} 
        />
      </div>
    </div>
  );
}
