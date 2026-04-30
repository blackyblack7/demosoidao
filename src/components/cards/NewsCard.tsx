'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface NewsCardProps {
  news: any;
  index: number;
}

export default function NewsCard({ news, index }: NewsCardProps) {
  return (
    <motion.div
      className="group bg-[var(--surface)] rounded-[2rem] overflow-hidden border border-[var(--text-secondary)]/10 shadow-sm hover:shadow-xl hover:shadow-[var(--accent)]/10 transition-all duration-500 transform hover:-translate-y-2 relative"
    >
      {/* Visual background hint */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-y-1/2 translate-x-1/2" />

      <Link href={`/news/${news.slug}`} className="block relative aspect-[16/10] overflow-hidden m-3 rounded-[1.5rem]">
        {news.thumbnail ? (
          <img
            src={news.thumbnail}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 flex items-center justify-center text-white">
            <span className="text-5xl opacity-50 bg-white/20 p-6 rounded-full backdrop-blur-sm">📰</span>
          </div>
        )}

        {/* Category Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[10px] font-black text-[var(--accent)] rounded-full uppercase tracking-[0.2em] shadow-lg border border-white/20">
            {news.category}
          </span>
          {new Date().getTime() - new Date(news.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000 && (
            <span className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg border border-rose-400 animate-pulse">
              NEW
            </span>
          )}
        </div>

        {/* Date Overlay */}
        <div className="absolute bottom-4 right-4 group-hover:bottom-6 transition-all duration-500">
          <div className="px-4 py-2 bg-black/80 backdrop-blur-xl text-white rounded-xl flex items-center gap-2 border border-white/10 shadow-2xl">
            <Clock size={12} className="text-[var(--accent)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none pt-0.5">
              {format(new Date(news.createdAt), 'd MMM yy', { locale: th })}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-6 pt-3 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
            <User size={12} className="text-[var(--accent)]" />
          </div>
          <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            {news.author.prefix}{news.author.firstName}
          </span>
        </div>

        <Link href={`/news/${news.slug}`}>
          <h3 className="text-xl font-heading font-bold text-[var(--foreground)] line-clamp-2 leading-[1.25] tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300">
            {news.title}
          </h3>
        </Link>

        <p className="text-[var(--text-secondary)] text-sm line-clamp-2 leading-relaxed font-body opacity-90">
          {news.excerpt}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <Link
            href={`/news/${news.slug}`}
            className="inline-flex items-center gap-3 text-sm font-heading font-bold text-[var(--foreground)] group/btn transition-colors hover:text-[var(--accent)]"
          >
            อ่านบทความนี้
            <motion.div
              whileHover={{ x: 5 }}
              className="w-9 h-9 rounded-xl bg-[var(--background)] flex items-center justify-center group-hover/btn:bg-[var(--accent)] group-hover/btn:text-white transition-all duration-300 shadow-sm"
            >
              <ArrowRight size={15} />
            </motion.div>
          </Link>

          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)]/30 group-hover:bg-[var(--accent)] group-hover:scale-150 transition-all duration-500" />
        </div>
      </div>
    </motion.div>
  );
}
