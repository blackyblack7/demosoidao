'use client';

import { useState, useTransition } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Newspaper
} from 'lucide-react';
import Link from 'next/link';
import { adminDeleteNews } from '@/app/actions/news';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface NewsListProps {
  initialNews: any[];
}

export default function NewsList({ initialNews }: NewsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [news, setNews] = useState(initialNews);
  const [isPending, startTransition] = useTransition();

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข่าว "${title}"?`)) {
      startTransition(async () => {
        const result = await adminDeleteNews(id);
        if ('success' in result) {
          setNews(news.filter(n => n.id !== id));
        } else {
          alert((result as any).error);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 transition-colors">
          <Search size={20} className="text-slate-400 group-focus-within:text-indigo-600" />
        </div>
        <input
          type="text"
          placeholder="ค้นหาชื่อข่าว หรือหมวดหมู่..."
          className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">ข้อมูลข่าว</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">หมวดหมู่</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">ผู้แต่ง / วันที่</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Newspaper size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                             <Eye size={12} /> ข่าวสาร
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-black rounded-lg uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                          <User size={14} className="text-slate-400" />
                          {item.author.prefix}{item.author.firstName}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar size={14} />
                          {format(new Date(item.createdAt), 'd MMM yyyy', { locale: th })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {item.published ? (
                        <div className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle2 size={14} /> เผยแพร่แล้ว
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-slate-400 font-bold text-xs bg-slate-100 px-2 py-1 rounded-full">
                          <XCircle size={14} /> ฉบับร่าง
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/news/${item.slug}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="ดูหน้าจริง"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link 
                          href={`/management/news/${item.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="แก้ไข"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={isPending}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">ไม่พบข่าวที่ค้นหา</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
