'use client';

import { motion } from 'framer-motion';
import { FacebookIcon } from '@/components/icons/BrandIcons';
import { ExternalLink } from 'lucide-react';

export default function FacebookEmbed() {
  return (
    <section className="py-24 bg-[var(--foreground)] text-[var(--background)] relative overflow-hidden font-body">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Accent glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent-secondary)]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Text Content */}
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#1877F2] text-white rounded-full shadow-xl"
            >
              <FacebookIcon size={18} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Official Facebook Page</span>
            </motion.div>

            <div className="space-y-5">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-heading font-extrabold text-[var(--background)] leading-[0.95]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                ติดตามความเคลื่อนไหว
                <br />
                <span className="text-[var(--accent)]">ผ่านโซเชียลมีเดีย</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-[var(--background)]/60 font-normal max-w-md leading-relaxed"
              >
                เกาะติดทุกข่าวสาร กิจกรรม และภาพบรรยากาศน่าประทับใจจาก
                <span className="text-[var(--background)] font-bold"> เพจทางการของโรงเรียนสอยดาววิทยา</span>
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: "Live", label: "อัปเดตสถานการณ์สด", highlight: true },
                { value: "Media", label: "คลังภาพและวิดีโอ", highlight: false },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-5 rounded-2xl border ${stat.highlight
                    ? "border-[var(--accent)]/30 bg-[var(--accent)]/10"
                    : "border-white/10 bg-white/5"
                    }`}
                >
                  <p className={`text-2xl font-heading font-black mb-1 ${stat.highlight ? "text-[var(--accent)]" : "text-[var(--background)]"}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-[var(--background)]/50 font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            <motion.a
              href="https://www.facebook.com/Soidaowittayaschool"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 text-sm font-heading font-bold text-[var(--accent)] hover:underline"
            >
              <FacebookIcon size={16} />
              เยี่ยมชมเพจทางการ
              <ExternalLink size={14} />
            </motion.a>
          </div>

          {/* Facebook Embed Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.21, 0.45, 0.32, 0.9] }}
            className="w-full lg:w-[500px] shrink-0"
          >
            <div className="bg-white/5 p-3 rounded-[2rem] border border-white/10 overflow-hidden backdrop-blur-sm">
              {/* Fake Browser Header */}
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 bg-white/10 rounded-full h-5 mx-2 flex items-center px-3">
                  <span className="text-[9px] text-white/30 truncate">facebook.com/Soidaowittayaschool</span>
                </div>
              </div>

              {/* Responsive Iframe Container */}
              <div className="rounded-2xl overflow-hidden min-h-[500px] bg-white/5">
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FSoidaowittayaschool&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                  width="100%"
                  height="500"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
