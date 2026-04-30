"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const director = {
  name: "นางนฤมล กงกุล",
  position: "ผู้อำนวยการโรงเรียนสอยดาววิทยา",
  image: "/ทำเนียบผู้บริหาร/นางนฤมล กงกุล.png",
};

const deputies: { name: string; position: string; group: string | string[]; image: string }[] = [
  {
    name: "นางสาวโสภา พุมมา",
    position: "รองผู้อำนวยการโรงเรียน",
    group: "กลุ่มบริหารงานวิชาการ",
    image: "/ทำเนียบผู้บริหาร/นางสาวโสภา พุมมา.png",
  },
  {
    name: "นางจันเพ็ญ อินทร์อ่อน",
    position: "รองผู้อำนวยการโรงเรียน",
    group: ["กลุ่มบริหารงานบุคคล", "กลุ่มบริหารงานงบประมาณและสินทรัพย์"],
    image: "/ทำเนียบผู้บริหาร/นางจันเพ็ญ อินทร์อ่อน.png",
  },
  {
    name: "นางสุดาวรรณ เที่ยงธรรม",
    position: "รองผู้อำนวยการโรงเรียน",
    group: "กลุ่มบริหารงานทั่วไป",
    image: "/ทำเนียบผู้บริหาร/นางสุดาวรรณ เที่ยงธรรม.png",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export default function ExecutivesPage() {
  return (
    <main className="flex flex-col w-full min-h-screen pt-20 bg-[var(--background)]">
      {/* ── Hero Header ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--surface)] border-b border-[var(--foreground)]/8 py-20 px-6 text-center">
        {/* Soft gradient orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-[var(--accent-secondary)]/10 blur-3xl" />

        <motion.span
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] bg-[var(--accent)]/10 px-5 py-2 rounded-full border border-[var(--accent)]/20 mb-6"
        >
          Board of Executives
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black font-heading tracking-tight text-[var(--foreground)] mb-4"
        >
          ทำเนียบผู้บริหาร
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto"
        >
          คณะผู้บริหารโรงเรียนสอยดาววิทยา มุ่งมั่นพัฒนาการศึกษาและส่งเสริมศักยภาพผู้เรียนอย่างเต็มรูปแบบ
        </motion.p>
      </section>

      {/* ── Director (Featured) ───────────────────────────────── */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-[var(--surface)] border border-[var(--foreground)]/8 flex flex-col md:flex-row"
          >
            {/* Accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/60 to-transparent hidden md:block rounded-l-[2rem]" />

            {/* Photo */}
            <div className="relative w-full md:w-[340px] flex-shrink-0 aspect-[3/4] md:aspect-auto md:h-auto min-h-[340px] overflow-hidden bg-[var(--foreground)]/5">
              <Image
                src={director.image}
                alt={director.name}
                fill
                className="object-cover object-top"
                priority
              />
              {/* Bottom fade so name area blends */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent md:hidden" />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-center px-10 py-12 md:pl-14 md:pr-12 gap-6">
              {/* Badge */}
              <span className="self-start bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                ผู้อำนวยการโรงเรียน
              </span>

              <div>
                <h2 className="text-3xl md:text-4xl font-black font-heading text-[var(--foreground)] mb-2 leading-tight">
                  {director.name}
                </h2>
                <p className="text-[var(--text-secondary)] text-base md:text-lg font-medium">
                  {director.position}
                </p>
              </div>

              <div className="flex gap-8 flex-wrap">
                <div>
                  <p className="text-[var(--text-secondary)] text-xs uppercase tracking-widest mb-1">โรงเรียน</p>
                  <p className="text-[var(--foreground)] text-sm font-semibold">สอยดาววิทยา</p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-xs uppercase tracking-widest mb-1">สังกัด</p>
                  <p className="text-[var(--foreground)] text-sm font-semibold">สพม.จันทบุรี ตราด</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Deputy Directors ─────────────────────────────────── */}
      <section className="px-6 pb-28 bg-[var(--background)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-12 justify-center">
            <div className="h-px flex-1 bg-[var(--foreground)]/10 max-w-[80px]" />
            <h2 className="text-lg font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">
              รองผู้อำนวยการ
            </h2>
            <div className="h-px flex-1 bg-[var(--foreground)]/10 max-w-[80px]" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {deputies.map((exec) => (
              <motion.div
                key={exec.name}
                variants={itemVariants}
                className="group flex flex-col bg-[var(--surface)] rounded-[1.75rem] overflow-hidden border border-[var(--foreground)]/8 shadow-md hover:shadow-xl hover:border-[var(--accent)]/30 hover:-translate-y-1.5 transition-all duration-500"
              >
                {/* Photo */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-[var(--foreground)]/5">
                  <Image
                    src={exec.image}
                    alt={exec.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)]/90 via-[var(--surface)]/10 to-transparent" />
                </div>

                {/* Info */}
                <div className="px-7 py-7 text-center border-t border-[var(--foreground)]/6">
                  <div className="w-8 h-1 rounded-full bg-[var(--accent)] mx-auto mb-4 opacity-60 group-hover:opacity-100 group-hover:w-14 transition-all duration-500" />
                  <h3 className="text-lg font-bold font-heading text-[var(--foreground)] mb-1.5 group-hover:text-[var(--accent)] transition-colors duration-300">
                    {exec.name}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm font-medium mb-3">
                    {exec.position}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(Array.isArray(exec.group) ? exec.group : [exec.group]).map((g) => (
                      <span key={g} className="inline-block bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold px-3 py-1 rounded-full border border-[var(--accent)]/20">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
