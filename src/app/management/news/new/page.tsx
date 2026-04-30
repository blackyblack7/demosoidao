import { checkAdminAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewsForm from "../_components/NewsForm";
import { getNewsMetadataOptions } from "@/app/actions/metadata";

export default async function NewNewsPage() {
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) redirect("/access-denied");

  const metadata = await getNewsMetadataOptions();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewsForm metadata={metadata} />
      </div>
    </div>
  );
}
