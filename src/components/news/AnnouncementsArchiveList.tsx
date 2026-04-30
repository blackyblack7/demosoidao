'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, SearchX, Loader2, ExternalLink, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { getAnnouncementsPaginated } from '@/app/actions/news';
import Pagination from '@/components/common/Pagination';

interface AnnouncementsArchiveListProps {
  initialItems: any[];
  initialHasMore: boolean;
  initialTotal: number;
}

export default function AnnouncementsArchiveList({ 
  initialItems, 
  initialHasMore,
  initialTotal 
}: AnnouncementsArchiveListProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 20;

  const fetchAnnouncements = async (newPage: number, q: string) => {
    startTransition(async () => {
      const res = await getAnnouncementsPaginated({
        page: newPage,
        limit,
        search: q,
      });
      setItems(res.items);
      setHasMore(res.hasMore);
      setTotal(res.total);
      setPage(newPage);
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Debounce fetch on search
    const timer = setTimeout(() => {
      fetchAnnouncements(1, value);
    }, 400);
    return () => clearTimeout(timer);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-amber-100 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
            <Bell size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              ประกาศทั้งหมด <span className="text-amber-600">{total}</span> ฉบับ
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official School Announcements</p>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ค้นหาประกาศ..."
            className="w-full bg-white border border-amber-100 rounded-2xl py-4 px-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all outline-none pl-14 shadow-sm"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-400" size={20} />
          {isPending && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-600">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div className="min-h-[400px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchTerm}-${page}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item, i) => {
                  const isNew = new Date().getTime() - new Date(item.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.4 }}
                    >
                      <Link
                        href={item.driveLink || `/news/${item.slug}`}
                        target={item.driveLink ? "_blank" : "_self"}
                        className="group flex items-center justify-between p-6 md:p-8 bg-white hover:bg-amber-50/50 rounded-[2rem] border border-slate-100 hover:border-amber-200 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-amber-500/5"
                      >
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center text-amber-600 group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white transition-all duration-500 shadow-inner">
                              <Bell size={24} className="md:w-7 md:h-7" />
                            </div>
                            {isNew && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-[3px] border-white animate-ping" />
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 min-w-0">
                            <span className="font-heading font-bold text-lg md:text-xl text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 leading-tight">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar size={12} />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                  {format(new Date(item.createdAt), 'd MMM yyyy', { locale: th })}
                                </span>
                              </div>
                              {item.driveLink && (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-blue-100">
                                  <ExternalLink size={9} /> เอกสาร
                                </span>
                              )}
                              {isNew && (
                                <span className="px-2.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-400 group-hover:text-amber-600 transition-all shrink-0 ml-4">
                          <span className="text-sm font-bold hidden md:block opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            {item.driveLink ? "เปิดเอกสาร" : "อ่านรายละเอียด"}
                          </span>
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              !isPending && (
                <div className="py-32 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center">
                      <SearchX size={40} className="text-amber-200" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">No Results</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">ไม่พบประกาศที่ค้นหา</h3>
                    </div>
                    <button
                      onClick={() => { setSearchTerm(""); fetchAnnouncements(1, ""); }}
                      className="px-8 py-3 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all font-body"
                    >
                      ดูประกาศทั้งหมด
                    </button>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-20 pt-10 border-t border-amber-100 flex flex-col items-center gap-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchAnnouncements(p, searchTerm)}
            isPending={isPending}
          />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            หน้า {page} จาก {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
