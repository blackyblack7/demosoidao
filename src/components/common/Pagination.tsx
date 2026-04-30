'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isPending = false
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-2 py-4 ${isPending ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-300`}>
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 transition-all shadow-sm hover:shadow-md"
        title="หน้าแรก"
      >
        <ChevronsLeft size={18} />
      </button>

      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 transition-all shadow-sm hover:shadow-md"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Pages */}
      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-100 shadow-inner">
        {getPageNumbers().map((p, idx) => (
          <div key={idx} className="relative">
            {p === '...' ? (
              <span className="px-3 text-slate-400 font-bold select-none italic text-xs">...</span>
            ) : (
              <button
                onClick={() => onPageChange(p as number)}
                className={`relative z-10 px-4 py-2 rounded-xl text-sm font-black transition-all duration-300 ${
                  currentPage === p 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'
                }`}
              >
                {p}
                {currentPage === p && (
                  <motion.div
                    layoutId="activePage"
                    className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-lg shadow-blue-200"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 transition-all shadow-sm hover:shadow-md"
      >
        <ChevronRight size={18} />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 transition-all shadow-sm hover:shadow-md"
        title="หน้าสุดท้าย"
      >
        <ChevronsRight size={18} />
      </button>
    </div>
  );
}
