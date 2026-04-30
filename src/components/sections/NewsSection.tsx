'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import NewsCard from '@/components/cards/NewsCard';
import { getLatestNews, getLatestAnnouncements } from '@/app/actions/news';

export default function NewsSection() {
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const announcementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [news, ann] = await Promise.all([
          getLatestNews(8),
          getLatestAnnouncements(10)
        ]);
        setLatestNews(news);
        setAnnouncements(ann);
      } catch (error) {
        console.error("Error loading news data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Update scroll indicator states
  const updateScrollIndicators = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    const maxScroll = el.scrollWidth - el.clientWidth;
    setScrollProgress(maxScroll > 0 ? (el.scrollLeft / maxScroll) * 100 : 0);
  }, []);

  // Mouse wheel → horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Only hijack if there's horizontal overflow
      if (el.scrollWidth <= el.clientWidth) return;

      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;

      // Allow normal page scroll if we're at the edge and scrolling further
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;

      e.preventDefault();
      el.scrollBy({ left: e.deltaY * 2.5, behavior: 'smooth' });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', updateScrollIndicators, { passive: true });
    // Initial check
    updateScrollIndicators();

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', updateScrollIndicators);
    };
  }, [isLoading, latestNews, updateScrollIndicators]);

  // Announcements: smart wheel passthrough at edges
  useEffect(() => {
    const el = announcementsRef.current;
    if (!el) return;

    const handleAnnouncementsWheel = (e: WheelEvent) => {
      // Only hijack if there's vertical overflow
      if (el.scrollHeight <= el.clientHeight) return;

      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - 1;

      // Allow normal page scroll if we're at the edge and scrolling further
      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) return;

      e.preventDefault();
      el.scrollBy({ top: e.deltaY, behavior: 'smooth' });
    };

    el.addEventListener('wheel', handleAnnouncementsWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleAnnouncementsWheel);
    };
  }, [isLoading, announcements]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -420 : 420;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!isLoading && latestNews.length === 0 && announcements.length === 0) return null;

  return (
    <section className="py-24 bg-[var(--background)] overflow-hidden relative font-body">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[var(--accent)]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--accent-secondary)]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* News Part (ประชาสัมพันธ์) */}
        {latestNews.length > 0 && (
          <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--foreground)] text-[var(--background)] rounded-full"
                >
                  <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Latest Activity</span>
                </motion.div>

                <div className="space-y-3">
                  <h2 className="font-heading font-extrabold text-[var(--foreground)] tracking-tight leading-[0.95]"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
                    ข่าวสารและกิจกรรม
                    <br />
                    <span className="text-[var(--accent)]">ประชาสัมพันธ์</span>
                  </h2>
                  <p className="text-lg text-[var(--text-secondary)] font-normal max-w-2xl leading-relaxed">
                    ข่าวสารล่าสุดและภาพกิจกรรมจากโรงเรียนสอยดาววิทยา
                    <span className="hidden md:inline text-sm ml-2 opacity-60">— เลื่อน scroll เพื่อดูข่าวเพิ่มเติม</span>
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 shrink-0"
              >
                {/* Navigation arrows */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => scrollByAmount('left')}
                    disabled={!canScrollLeft}
                    className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--text-secondary)]/10 flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] disabled:opacity-30 disabled:hover:bg-[var(--surface)] disabled:hover:text-[var(--foreground)] disabled:hover:border-[var(--text-secondary)]/10 transition-all duration-300 shadow-sm"
                    aria-label="เลื่อนข่าวไปทางซ้าย"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollByAmount('right')}
                    disabled={!canScrollRight}
                    className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--text-secondary)]/10 flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] disabled:opacity-30 disabled:hover:bg-[var(--surface)] disabled:hover:text-[var(--foreground)] disabled:hover:border-[var(--text-secondary)]/10 transition-all duration-300 shadow-sm"
                    aria-label="เลื่อนข่าวไปทางขวา"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <Link
                  href="/news"
                  className="group flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-white rounded-full font-heading font-bold hover:bg-[var(--accent)]/90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[var(--accent)]/20"
                >
                  ดูคลังข่าวทั้งหมด
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* News Scrolling Area — mouse wheel scrolls horizontally */}
            <div className="relative group/scroll">
              <div
                ref={scrollRef}
                className="flex overflow-x-auto pb-10 gap-8 no-scrollbar snap-x snap-mandatory scroll-smooth"
              >
                <AnimatePresence>
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <div key={i} className="min-w-[320px] md:min-w-[400px] aspect-video bg-[var(--surface)] rounded-[2rem] animate-pulse border border-[var(--text-secondary)]/10" />
                    ))
                  ) : (
                    latestNews.map((news, index) => (
                      <motion.div
                        key={news.id}
                        className="min-w-[320px] md:min-w-[400px] max-w-[450px] flex-shrink-0 snap-start"
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.7,
                          delay: index * 0.1,
                          ease: [0.21, 0.45, 0.32, 0.9]
                        }}
                      >
                        <NewsCard news={news} index={index} />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Left fade gradient */}
              <div
                className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none hidden md:block transition-opacity duration-300"
                style={{ opacity: canScrollLeft ? 1 : 0 }}
              />
              {/* Right fade gradient */}
              <div
                className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none hidden md:block transition-opacity duration-300"
                style={{ opacity: canScrollRight ? 1 : 0 }}
              />

              {/* Scroll progress indicator */}
              <div className="hidden md:flex justify-center mt-4">
                <div className="w-40 h-1 bg-[var(--text-secondary)]/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--accent)] rounded-full"
                    animate={{ width: `${scrollProgress}%` }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Part (ประกาศ) - Restoring the "Old Graphic" Bell Cards style */}
        {announcements.length > 0 && (
          <div id="announcements" className="pt-20 border-t border-[var(--text-secondary)]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-5">
                <div className="w-1.5 h-10 bg-[var(--accent)] rounded-full" />
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-[var(--foreground)]">ประกาศโรงเรียนสอยดาววิทยา</h2>
              </div>
              <Link
                href="/news/announcements"
                className="group flex items-center gap-2 px-6 py-3 bg-[var(--surface)] text-[var(--foreground)] rounded-full font-heading font-bold text-sm border border-[var(--text-secondary)]/15 hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 transition-all"
              >
                ดูประกาศทั้งหมด
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div
              ref={announcementsRef}
              className="max-h-[550px] overflow-y-auto pr-2 space-y-5 no-scrollbar custom-scrollbar"
            >
              {isLoading ? (
                [1, 2].map(i => (
                  <div key={i} className="h-24 bg-[var(--surface)] rounded-3xl animate-pulse border border-[var(--text-secondary)]/10" />
                ))
              ) : (
                announcements.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link 
                      href={item.driveLink || `/news/${item.slug}`} 
                      target={item.driveLink ? "_blank" : "_self"}
                      className="group flex items-center justify-between p-6 md:p-8 bg-[var(--surface)] hover:bg-[var(--accent)]/5 rounded-[2.5rem] border border-[var(--text-secondary)]/10 hover:border-[var(--accent)]/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[var(--accent)]/5"
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-500 shadow-inner">
                            <Bell size={24} className="md:w-8 md:h-8" />
                          </div>
                          {new Date().getTime() - new Date(item.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-4 border-[var(--surface)] animate-ping" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-heading font-bold text-lg md:text-2xl text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-1 leading-tight">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">Official Announcement</span>
                            {new Date().getTime() - new Date(item.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000 && (
                              <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest animate-pulse">New</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-all">
                        <span className="text-sm font-bold hidden md:block opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          {item.driveLink ? "เปิดเอกสาร" : "อ่านรายละเอียด"}
                        </span>
                        <div className="w-12 h-12 rounded-2xl bg-[var(--background)] flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-300 shadow-sm">
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-10 md:hidden">
          <Link
            href="/news"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[var(--surface)] text-[var(--foreground)] rounded-full font-heading font-bold border border-[var(--text-secondary)]/15 hover:border-[var(--accent)]/30 transition-all"
          >
            ดูข่าวทั้งหมด
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
