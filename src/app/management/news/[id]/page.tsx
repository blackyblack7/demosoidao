import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import NewsForm from "../_components/NewsForm";
import { getNewsMetadataOptions } from "@/app/actions/metadata";

interface EditNewsProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: EditNewsProps) {
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) redirect("/access-denied");

  const { id } = await params;
  const newsId = parseInt(id);
  if (isNaN(newsId)) notFound();

  const newsItem = await prisma.blogPost.findUnique({
    where: { id: newsId }
  });

  if (!newsItem) notFound();

  const metadata = await getNewsMetadataOptions();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewsForm initialData={newsItem} metadata={metadata} />
      </div>
    </div>
  );
}
