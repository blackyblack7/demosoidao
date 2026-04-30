'use client'

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Inbox, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '@/app/actions/notifications';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

// Extract link embedded in message (e.g. "some text | Link: /path")
function extractLink(message: string): { text: string; link: string | null } {
  const pipeIdx = message.lastIndexOf(' | Link: ');
  if (pipeIdx !== -1) {
    const text = message.slice(0, pipeIdx).trim();
    const link = message.slice(pipeIdx + 9).trim().split(/\s/)[0];
    return { text, link: link || null };
  }
  return { text: message, link: null };
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    // Only fetch if tab is visible
    if (document.visibilityState !== 'visible') return;
    
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (err) {
      console.error("[NotificationBell] Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Smart polling: every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    
    // Sync immediately when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeletingId(id);
    await deleteNotification(id);
    setDeletingId(null);
    fetchNotifications();
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
    fetchNotifications();
  };

  // Click on the entire notification card → mark as read + navigate if link
  const handleNotifClick = async (notif: any, link: string | null) => {
    if (!notif.isRead) await markAsRead(notif.id);
    fetchNotifications();
    setIsOpen(false);
    if (link) router.push(link);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[60]"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">แจ้งเตือน</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recent Activity</p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Check size={10} />
                    อ่านทั้งหมด
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="text-[10px] font-black text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={10} />
                    ลบทั้งหมด
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-50">
              {notifications.length > 0 ? (
                notifications.map((notif) => {
                  const { text, link } = extractLink(notif.message);
                  const isClickable = !!link;
                  const isDeleting = deletingId === notif.id;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif, link)}
                      className={`p-4 transition-all relative group ${
                        isDeleting ? 'opacity-0 scale-95' : 'opacity-100'
                      } ${!notif.isRead ? 'bg-blue-50/40' : 'hover:bg-slate-50'} ${
                        isClickable ? 'cursor-pointer hover:bg-blue-50/60' : ''
                      }`}
                    >
                      {/* Unread indicator bar */}
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
                      )}

                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          !notif.isRead ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                        } ${isClickable ? 'group-hover:bg-violet-100 group-hover:text-violet-600' : ''}`}>
                          <Bell size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-bold truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                              {notif.title}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[10px] text-slate-400 font-medium">
                                {format(new Date(notif.createdAt), 'HH:mm', { locale: th })}
                              </span>
                              {/* Delete button — always visible on hover */}
                              <button
                                onClick={(e) => handleDelete(e, notif.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
                                title="ลบแจ้งเตือนนี้"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {text}
                          </p>

                          {/* Navigation cue */}
                          {isClickable && (
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-[10px] font-black text-blue-500 flex items-center gap-1 group-hover:text-violet-600 transition-colors">
                                <ArrowRight size={10} />
                                คลิกเพื่อดูรายละเอียด
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                    <Inbox size={32} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-400">ยังไม่มีการแจ้งเตือน</h4>
                  <p className="text-xs text-slate-300 mt-1">แจ้งเตือนใหม่จะปรากฏที่นี่</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black text-slate-400 hover:text-slate-600"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
