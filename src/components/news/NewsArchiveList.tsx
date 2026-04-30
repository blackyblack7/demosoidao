'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Newspaper, SearchX, Loader2, Filter } from 'lucide-react';
import NewsCard from '@/components/cards/NewsCard';
import { getNewsPaginated } from '@/app/actions/news';
import Pagination from '@/components/common/Pagination';

interface NewsArchiveListProps {
  initialNews: any[];
  initialHasMore: boolean;
  categories: string[];
}

export default function NewsArchiveList({ initialNews, initialHasMore, categories }: NewsArchiveListProps) {
  const [items, setItems] = useState(initialNews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // We need to get total pages from action
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");

  // Modified action call to get total count/pages if possible
  // For now, we'll estimate or update the action.
  // Actually, I'll update the action to return totalPages first.

  const fetchNews = async (newPage: number, cat: string, q: string) => {
    startTransition(async () => {
      const res = await getNewsPaginated({ 
        page: newPage, 
        limit: 12, 
        category: cat === "ทั้งหมด" ? undefined : cat, 
        search: q 
      });
      setItems(res.items);
      setHasMore(res.hasMore);
      // If action doesn't return totalPages, we might need to fix it.
      // Assuming a standard count for now, or I will fix news.ts action.
      setPage(newPage);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews(1, selectedCategory, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm]);

  return (
    <div className="space-y-12">
      {/* Filter bar & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-100 pb-10">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-2">
             {categories.map((cat) => (
               <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                }`}
               >
                 {cat}
               </button>
             ))}
          </div>

          <div className="relative w-full md:w-96">
             <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเรื่องราวที่น่าสนใจ..." 
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none pl-14 shadow-sm"
             />
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             {isPending && (
               <div className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-600">
                 <Loader2 size={16} className="animate-spin" />
               </div>
             )}
          </div>
      </div>

      {/* Grid Display */}
      <div className="min-h-[600px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${searchTerm}-${page}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {items.map((item, index) => (
                  <NewsCard key={item.id} news={item} index={index % 12} />
                ))}
              </div>
            ) : (
              !isPending && (
                <div className="py-32 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10 flex flex-col items-center gap-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                        <SearchX size={40} className="text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">No Content Found</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">ไม่พบข่าวสารในหมวดหมู่ที่เลือก</h3>
                      </div>
                      <button 
                        onClick={() => { setSelectedCategory("ทั้งหมด"); setSearchTerm(""); }}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all font-body"
                      >
                        ดูข่าวทั้งหมด
                      </button>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Footer */}
      {(hasMore || page > 1) && (
        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col items-center gap-6">
           <Pagination 
            currentPage={page}
            totalPages={hasMore ? page + 1 : page} // Simple estimation if totalPages is unknown
            onPageChange={(p) => fetchNews(p, selectedCategory, searchTerm)}
            isPending={isPending}
           />
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
             End of list
           </p>
        </div>
      )}
    </div>
  );
}
