import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, Eye, ArrowLeft, Share2, ImageIcon, ExternalLink, Clock, Tag } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import * as motion from "framer-motion/client";
import { getSession } from "@/lib/auth";
import NewsGallery from "@/components/news/NewsGallery";
import ShareAction from "@/components/news/ShareAction";

async function trackView(id: number) {
  // DB does not have viewCount column yet
}

interface NewsDetailProps {
  params: any;
}

export async function generateMetadata({ params }: any) {
  const p = await params;
  const rawSlug = p?.slug || "";
  const decodedSlug = decodeURIComponent(rawSlug);

  const news = await prisma.blogPost.findFirst({
    where: {
      OR: [
        { slug: rawSlug },
        { slug: decodedSlug }
      ]
    }
  });

  if (!news) return { title: "ไม่พบข้อมูล | โรงเรียนสอยดาววิทยา" };
  
  const siteName = "โรงเรียนสอยดาววิทยา";
  const newsUrl = `https://soidao.ac.th/news/${news.slug}`; // Update with real domain if different

  return {
    title: `${news.title} | ข่าวสารสอยดาววิทยา`,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt || '',
      url: newsUrl,
      siteName: siteName,
      images: news.thumbnail ? [
        {
          url: news.thumbnail,
          width: 1200,
          height: 630,
        }
      ] : [],
      locale: 'th_TH',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: news.excerpt || '',
      images: news.thumbnail ? [news.thumbnail] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const p = await params;
  const rawSlug = p?.slug;
  if (!rawSlug) notFound();

  const decodedSlug = decodeURIComponent(rawSlug);
  
  const news = await prisma.blogPost.findFirst({
    where: {
      OR: [
        { slug: rawSlug },
        { slug: decodedSlug }
      ]
    },
    include: {
      author: {
        select: { firstName: true, lastName: true, prefixRef: { select: { name: true } }, profileImage: true }
      },
      categoryRef: true
    }
  });

  const session = await getSession();

  if (!news || (!news.published && !session?.isAdmin)) {
    notFound();
  }

  await trackView(news.id);

  const gallery = (news.gallery as string[]) || [];

  return (
    <main className="min-h-screen bg-white pb-32 pt-32 font-body text-slate-800">
      <Navbar session={session ? { name: session.name, role: session.role } : null} />
      
      {/* Immersive Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Headline & Metadata */}
          <div className="lg:col-span-12 space-y-10">
            <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <ChevronRight size={10} />
              <Link href="/news" className="hover:text-indigo-600 transition-colors">Newsroom</Link>
              <ChevronRight size={10} />
              <span className="text-slate-900 truncate max-w-[200px]">{news.categoryRef?.name || ''}</span>
            </nav>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Dynamic Font Size based on text length */}
              <h1 className={`font-black text-slate-900 leading-[1.05] tracking-[-0.04em] text-balance
                ${news.title.length < 40 
                  ? "text-6xl md:text-8xl lg:text-9xl" 
                  : news.title.length < 80 
                    ? "text-5xl md:text-7xl lg:text-8xl" 
                    : "text-4xl md:text-6xl lg:text-7xl"
                }
              `}>
                {news.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8 py-6 border-y border-slate-100 mt-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-100">
                      <img 
                        src={news.author.profileImage || `https://ui-avatars.com/api/?name=${news.author.firstName}`} 
                        alt="" 
                        className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all"
                      />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-700 leading-none">{news.author.prefixRef?.name || ''}{news.author.firstName} {news.author.lastName}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">ผู้เผยแพร่ข้อมูล</p>
                   </div>
                </div>

                <div className="h-6 w-px bg-slate-100 hidden md:block" />
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-400">
                      <Calendar size={14} />
                    </div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                       {format(new Date(news.createdAt), 'd MMMM yyyy', { locale: th })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-slate-400">
                      <Eye size={14} />
                    </div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                       {/* no viewCount data */}
                       New
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-16">
            
            {/* Featured Hero Thumbnail */}
            {news.thumbnail && (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="group aspect-[16/9] w-full rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </motion.div>
            )}

            {/* Article Body with Refined Thai Spacing */}
            <div className="prose prose-2xl prose-slate max-w-none text-slate-700 leading-[1.85] font-medium whitespace-pre-wrap font-body selection:bg-indigo-100 selection:text-indigo-900 tracking-normal antialiased">
              <style dangerouslySetInnerHTML={{ __html: `
                .prose p { margin-bottom: 2.2em; text-align: justify; text-justify: inter-word; }
                .prose h2 { font-weight: 900; letter-spacing: -0.02em; color: #0f172a; margin-top: 2.5em; margin-bottom: 1em; line-height: 1.2; }
                .prose blockquote { border-left-color: #4f46e5; border-left-width: 8px; border-radius: 1.5rem; background: #f8fafc; padding: 2.5rem; font-style: normal; color: #475569; position: relative; overflow: hidden; }
                .prose blockquote::after { content: '"'; position: absolute; top: 0rem; right: 2rem; font-size: 8rem; color: #4f46e5; opacity: 0.05; font-family: sans-serif; }
              `}} />
              {news.content}
            </div>

            {/* Premium Functional News Gallery */}
            {gallery.length > 0 && (
              <NewsGallery images={gallery} />
            )}
            
            {/* Google Drive Link Upgrade */}
            {news.driveLink && (
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="bg-indigo-600 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] relative overflow-hidden group"
              >
                 {/* Glowing Abstract circles */}
                 <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                 
                 <div className="flex items-center gap-8 relative z-10">
                    <div className="w-24 h-24 bg-white rounded-[2.2rem] flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                       <GoogleDriveIcon size={56} />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-3xl font-black tracking-tight leading-none text-white">ดาวน์โหลดภาพกิจกรรม</h4>
                       <div className={`text-indigo-100/70 font-medium leading-[1.3] text-balance
                          ${news.title.length < 40 
                            ? "text-lg md:text-2xl" 
                            : news.title.length < 80 
                              ? "text-base md:text-xl" 
                              : "text-sm md:text-lg"
                          }
                       `}>
                          {news.title}
                       </div>
                    </div>
                 </div>

                 <Link 
                  href={news.driveLink}
                  target="_blank"
                  className="px-12 py-5 bg-white text-indigo-600 rounded-[2rem] font-black shadow-xl hover:bg-slate-50 transition-all active:scale-95 group/link flex items-center gap-3 shrink-0 relative z-10"
                 >
                   เปิดคลังภาพ
                   <ExternalLink size={20} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                 </Link>
              </motion.div>
            )}

            {/* Footer Back Button & Share */}
            <div className="pt-20 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6">
                <Link 
                  href="/news"
                  className="group flex items-center gap-4 px-10 py-5 bg-slate-50 text-slate-500 rounded-[2rem] font-black hover:bg-slate-900 hover:text-white transition-all duration-500 border border-slate-100"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform duration-500" />
                  ย้อนกลับสู่คลังข่าว
                </Link>
                
                {/* Functional Share Action */}
                <ShareAction title={news.title} text={news.excerpt || ''} />
            </div>

          </article>

          {/* Sidebar Area: Metadata & More */}
          <aside className="lg:col-span-4 space-y-12 lg:sticky lg:top-32">
             
             {/* Tags Card */}
             <div className="bg-slate-50 p-10 rounded-[3.5rem] space-y-8 border border-slate-100/50">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={12} className="text-indigo-600" /> หมวดหมู่ข่าว
                  </h4>
                  <div className="flex flex-wrap gap-2">
                      <span className="px-5 py-2 bg-white text-slate-900 text-xs font-black rounded-xl border border-slate-100 shadow-sm uppercase tracking-widest">{news.categoryRef?.name || ''}</span>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-slate-200/50 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">โรงเรียนสอยดาววิทยา</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    แหล่งรวบรวมข้อมูลอย่างเป็นทางการ เพื่อความโปร่งใสและสื่อสารกับชุมชนได้อย่างรวดเร็ว
                  </p>
                </div>
             </div>

             {/* Application CTA (Now Functional) */}
             <div className="aspect-[4/5] bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3.5rem] p-10 overflow-hidden relative shadow-2xl flex flex-col justify-between group">
                {/* Decorative pulse background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[100px]" />
                
                <div className="space-y-4 relative z-10">
                   <div className="w-12 h-1 bg-indigo-500 rounded-full" />
                   <h4 className="text-2xl font-black text-white leading-tight tracking-tight">เข้าร่วมเป็นส่วนหนึ่งกับ <br />สอยดาววิทยา</h4>
                </div>
                <div className="space-y-6 relative z-10">
                  <p className="text-sm text-indigo-100/70 font-medium leading-relaxed">สัมผัสประสบการณ์การเรียนรู้ที่เน้นทักษะชีวิตและนวัตกรรมใหม่ เตรียมความพร้อมสู่อนาคตที่มั่นคงที่นี่</p>
                  
                  {/* Pointing to official site admissions linked from home page */}
                  <Link 
                    href="https://sites.google.com/view/reg-soidaowittaya/home?authuser=0"
                    target="_blank"
                    className="flex items-center justify-center w-full py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
                  >
                    ดูข้อมูลการรับสมัคร
                  </Link>
                </div>
             </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

function GoogleDriveIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 87.3 78" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.6 66.85L17.4 48H70.1L59.3 66.85H6.6Z" fill="#0066DA" />
      <path d="M29.8 29.45L16.2 53.05L0 25.1L13.6 1.5L29.8 29.45Z" fill="#00AC47" />
      <path d="M19.65 1.5L43.65 1.5L57.25 25.1L33.25 25.1L19.65 1.5Z" fill="#FFC107" />
      <path d="M57.25 25.1L81.25 1.5L87.25 11.9L63.25 35.5L57.25 25.1Z" fill="#EA4335" />
      <path d="M70.1 48L63.25 35.5L87.25 11.9L87.25 66.85L70.1 48Z" fill="#00832D" />
      <path d="M70.1 48L57.25 25.1L33.25 25.1L59.3 66.85L70.1 48Z" fill="#2684FC" />
    </svg>
  );
}
