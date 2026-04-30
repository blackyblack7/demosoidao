"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Mock API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 bg-[var(--surface)] rounded-[2.5rem] border border-[var(--text-secondary)]/20 text-center space-y-4"
      >
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold font-heading">ขอบคุณที่ติดต่อเรา!</h3>
        <p className="text-[var(--text-secondary)]">เราได้รับข้อความของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-6 text-[var(--accent)] font-medium hover:underline"
        >
          ส่งข้อความอื่น
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-[var(--surface)] p-8 md:p-12 rounded-[2.5rem] border border-[var(--text-secondary)]/20 shadow-2xl">
      <h3 className="text-2xl font-bold font-heading mb-8">ส่งข้อความหาเรา</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[var(--text-secondary)]">
              ชื่อ-นามสกุล
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="สมชาย ใจดี"
              className="w-full bg-[var(--background)] border border-[var(--text-secondary)]/20 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="example@gmail.com"
              className="w-full bg-[var(--background)] border border-[var(--text-secondary)]/20 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-[var(--text-secondary)]">
            หัวข้อ
          </label>
          <input
            id="subject"
            type="text"
            required
            placeholder="ติดต่อสอบถามเรื่อง..."
            className="w-full bg-[var(--background)] border border-[var(--text-secondary)]/20 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-[var(--text-secondary)]">
            ข้อความ
          </label>
          <textarea
            id="message"
            required
            rows={5}
            placeholder="พิมพ์ข้อความของคุณที่นี่..."
            className="w-full bg-[var(--background)] border border-[var(--text-secondary)]/20 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-colors resize-none"
          ></textarea>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full group flex items-center justify-center gap-2 bg-[var(--foreground)] text-[var(--background)] py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>ส่งข้อความ</span>
              <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
