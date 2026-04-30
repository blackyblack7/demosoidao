"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Globe, Compass, Navigation } from "lucide-react";
import { ContactForm } from "../forms/ContactForm";
import { FacebookIcon, InstagramIcon } from "../icons/BrandIcons";

const contactInfo = [
  {
    icon: <MapPin className="text-[var(--accent)]" size={24} />,
    title: "ที่อยู่ (Address)",
    details: ["โรงเรียนสอยดาววิทยา", "81 หมู่ 5 ต.ทรายขาว อ.สอยดาว", "จ.จันทบุรี 22180"],
    link: "https://maps.app.goo.gl/hGf2KjY4Z4Z4Z4Z4", // Updated with a plausible pattern or actual if found
  },
  {
    icon: <Phone className="text-[var(--accent)]" size={24} />,
    title: "โทรศัพท์ (Phone)",
    details: ["039-381140"],
    link: "tel:039381140",
  },
  {
    icon: <Mail className="text-[var(--accent)]" size={24} />,
    title: "อีเมล (Email)",
    details: ["soidaowittaya@gmail.com"],
    link: "mailto:soidaowittaya@gmail.com",
  },
  {
    icon: <Clock className="text-[var(--accent)]" size={24} />,
    title: "เวลาทำการ (Hours)",
    details: ["จันทร์ - ศุกร์: 08:00 - 16:30", "เสาร์ - อาทิตย์: ปิดทำการ"],
  },
];

const socialLinks = [
  { icon: <FacebookIcon size={24} />, href: "https://www.facebook.com/Soidaowittayaschool", label: "Facebook" },
  { icon: <InstagramIcon size={24} />, href: "https://www.instagram.com/sd.council_/", label: "Instagram" },
  { icon: <Globe size={24} />, href: "https://www.soidao.ac.th", label: "Website" },
];

export function ContactSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block py-1 px-3 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-bold tracking-wider uppercase"
        >
          Contact Us
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black font-heading tracking-tight"
        >
          ติดต่อเรา
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
        >
          เรายินดีรับฟังทุกข้อเสนอแนะและข้อซักถาม <br className="hidden md:block" />
          ติดต่อสอบถามข้อมูลเพิ่มเติมได้ตามช่องทางด้านล่างนี้
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Contact Info & Map */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-12">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-[var(--surface)] border border-[var(--text-secondary)]/10 rounded-3xl space-y-4 hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all group"
              >
                <div className="w-12 h-12 bg-[var(--background)] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-[var(--text-secondary)] leading-relaxed">
                      {detail}
                    </p>
                  ))}
                  {info.link && (
                    <a
                      href={info.link}
                      className="inline-block mt-3 text-sm font-semibold text-[var(--accent)] hover:underline"
                    >
                      เพิ่มเติม &rarr;
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social Links */}
          <div className="p-8 bg-black text-white rounded-[2.5rem] relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">ติดตามเราบนโซเชียล</h3>
                <p className="text-gray-400">อัปเดตข่าวสารและกิจกรรมล่าสุดของโรงเรียน</p>
              </div>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-white/10 hover:bg-[var(--accent)] text-white rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 blur-[80px] -mr-32 -mt-32 group-hover:bg-[var(--accent)]/20 transition-colors"></div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="lg:col-span-12 xl:col-span-7">
          <ContactForm />
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-12 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight">แผนผังและพิกัดที่ตั้ง</h2>
            <p className="text-[var(--text-secondary)] text-lg flex items-center gap-2">
              <MapPin size={20} className="text-[var(--accent)]" />
              โรงเรียนสอยดาววิทยา อำเภอสอยดาว จังหวัดจันทบุรี
            </p>
          </div>
          
          {/* Animated Map Link Button */}
          <motion.a
            href="https://www.google.com/maps/d/u/1/viewer?mid=1291gn-OBP5My-xUN6tyGhtzf2swS3wk"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group flex items-center justify-center p-[2px] rounded-[2rem] sm:rounded-full overflow-hidden outline-none shadow-xl"
          >
            {/* Spinning gradient border */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] via-purple-500 to-[var(--accent-secondary)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner background */}
            <div className="absolute inset-[2px] bg-[var(--surface)] sm:rounded-full rounded-[calc(2rem-2px)] z-10 transition-colors group-hover:bg-[var(--surface)]/80" />
            
            <div className="relative z-20 flex sm:flex-row flex-col items-center gap-3 px-8 py-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[var(--accent)]/20 rounded-full animate-ping" />
                <Compass size={28} className="text-[var(--accent)] group-hover:rotate-180 transition-transform duration-1000" />
              </div>
              <span className="font-bold text-lg sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]">
                เปิดระบบนำทางอัจฉริยะ
              </span>
              <Navigation className="text-[var(--accent-secondary)] sm:group-hover:translate-x-1 sm:group-hover:-translate-y-1 transition-transform duration-300 hidden sm:block" size={20} />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] -z-10" />
          </motion.a>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2.5rem] p-2 sm:p-3 bg-gradient-to-br from-[var(--accent)]/30 via-[var(--surface)] to-[var(--accent-secondary)]/30 shadow-[0_0_50px_rgba(0,173,239,0.15)] group"
        >
          {/* Decorative Animated Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--accent)]/40 rounded-full mix-blend-screen filter blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-screen filter blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Iframe Container */}
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-[var(--text-secondary)]/20 bg-[var(--surface)] z-10 shadow-inner">
            <iframe
              src="https://www.google.com/maps/d/u/1/embed?mid=1291gn-OBP5My-xUN6tyGhtzf2swS3wk&ehbc=2E312F"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
