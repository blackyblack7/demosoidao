"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative h-screen w-full flex items-end overflow-hidden -mt-20">
      {/* Background Video — full bleed */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/background.webm" type="video/webm" />
        </video>
        {/* Gradient: dark bottom-left, transparent top-right */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Diagonal accent line — left edge */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent opacity-70 hidden lg:block" />

      {/* Main Content — bottom-left anchored */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pb-20 lg:pb-28">
        <div className="max-w-3xl">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              โรงเรียนสอยดาววิทยา · จันทบุรี
            </span>
          </motion.div>

          {/* H1 — large, dramatic */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.21, 0.45, 0.32, 0.9] }}
            className="font-heading font-extrabold text-white leading-[1.0] mb-6"
            style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
          >
            {[
              { text: "Smart Minds", colorClass: "text-[var(--accent)]", barColor: "bg-[var(--accent)]", nowrap: false },
              { text: "Strong Bodies", colorClass: "text-white", barColor: "bg-white", nowrap: false },
              { text: "Real-World Skills", colorClass: "text-[var(--accent-secondary)]", barColor: "bg-[var(--accent-secondary)]", nowrap: true },
            ].map(({ text, colorClass, barColor, nowrap }) => (
              <motion.span
                key={text}
                className={`block ${colorClass} relative group/line cursor-default select-none ${nowrap ? "whitespace-nowrap" : ""}`}
                whileHover={{ x: 18, transition: { type: "spring", stiffness: 350, damping: 22 } }}
              >
                {/* Left accent bar — slides in on hover */}
                <span
                  className={`absolute -left-7 top-1/2 -translate-y-1/2 h-[0.12em] w-0 ${barColor} rounded-full opacity-0
                    group-hover/line:w-5 group-hover/line:opacity-100 transition-all duration-300 ease-out hidden lg:block`}
                />

                {text}

                {/* Bottom underline — grows left to right on hover */}
                <span
                  className={`absolute bottom-2 left-0 h-[3px] w-0 ${barColor} rounded-full opacity-60
                    group-hover/line:w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]`}
                />
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-white/75 text-lg md:text-xl font-body font-normal max-w-3xl mb-10 leading-relaxed"
          >
            "เรียนดี กีฬาเด่น เน้นทักษะชีวิต"
            <br className="hidden md:block" />
            <span className="md:whitespace-nowrap">
              โรงเรียนสอยดาววิทยา สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาจันทบุรี ตราด
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="https://sites.google.com/view/reg-soidaowittaya/home?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 bg-[var(--accent)] text-white px-8 py-4 rounded-full font-heading font-bold text-base hover:bg-[var(--accent)]/90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[var(--accent)]/30"
            >
              สมัครเรียน
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-heading font-semibold text-base border border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 active:scale-95 transition-all duration-300"
            >
              เกี่ยวกับโรงเรียน
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — bottom center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50"
      >
        <span className="text-[10px] font-heading tracking-[0.2em] uppercase">Scroll</span>
        <ChevronDown size={18} className="animate-bounce" />
      </motion.div>
    </section>
  );
}
