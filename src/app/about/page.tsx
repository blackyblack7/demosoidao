"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { MapPin, ArrowRight, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function AboutPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.15;
    const tryPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay blocked — wait for user interaction
        const resume = () => {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
          window.removeEventListener('click', resume);
        };
        window.addEventListener('click', resume);
      }
    };
    tryPlay();
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
      setIsMuted(false);
    } else {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
    }
  };

  return (
    <main className="flex flex-col w-full min-h-screen pt-20">
      {/* Background Music */}
      <audio ref={audioRef} src="/SDmusic.weba" loop preload="auto" />

      {/* Floating Music Button */}
      <motion.button
        onClick={toggleMute}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--foreground)]/10 text-[var(--foreground)] px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:border-[var(--accent)]/40 transition-all duration-300 group"
        title={isMuted || !isPlaying ? "เปิดเพลง" : "ปิดเสียง"}
      >
        <span className="relative flex h-3 w-3">
          {isPlaying && !isMuted && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-60"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying && !isMuted ? 'bg-[var(--accent)]' : 'bg-[var(--text-secondary)]'}`}></span>
        </span>
        {isMuted || !isPlaying
          ? <VolumeX size={18} className="text-[var(--text-secondary)]" />
          : <Volume2 size={18} className="text-[var(--accent)]" />
        }
        <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">
          {isMuted || !isPlaying ? "เปิดเพลง" : "กดเพื่อปิดเพลง"}
        </span>
      </motion.button>
      
      {/* Hero & Video Section */}
      <section className="relative w-full min-h-screen py-32 flex flex-col items-center justify-center overflow-visible">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src="/about/IMG_1622.JPG"
            alt="Soidao Wittaya School Background"
            fill
            className="object-cover opacity-60 dark:opacity-40 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/70 to-[var(--background)]"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block py-1 px-4 rounded-full bg-[var(--surface)]/80 backdrop-blur-md border border-[var(--text-secondary)]/30 text-sm font-medium mb-6 text-[var(--accent)] drop-shadow-sm"
          >
            About Us
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8 font-heading text-[var(--foreground)] drop-shadow-md"
          >
            รู้จักเรา โรงเรียนสอยดาววิทยา
          </motion.h1>
          
          {/* ปรับสีฟอนต์และเพิ่มพื้นหลังโปร่งแสงให้อ่านง่ายขึ้น */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full mb-12"
          >
            {[
              { keyword: "เรียนดี", sub: "วิชาการแข็งแกร่ง เต็มศักยภาพ", icon: "📚", color: "from-blue-500/20 to-blue-600/10 border-blue-400/30 text-blue-300" },
              { keyword: "กีฬาเด่น", sub: "สุขภาพแข็งแรง จิตใจเข้มแข็ง", icon: "🏆", color: "from-amber-500/20 to-amber-600/10 border-amber-400/30 text-amber-300" },
              { keyword: "เน้นทักษะชีวิต", sub: "พร้อมรับโลกแห่งการเปลี่ยนแปลง", icon: "🌱", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-400/30 text-emerald-300" },
            ].map((item, i) => (
              <motion.div
                key={item.keyword}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.15 }}
                className={`flex flex-col items-center gap-3 bg-gradient-to-b ${item.color} backdrop-blur-md p-6 rounded-2xl border text-center`}
              >
                <span className="text-3xl">{item.icon}</span>
                <p className={`text-2xl font-black font-heading tracking-tight`}>{item.keyword}</p>
                <p className="text-[var(--foreground)]/70 text-sm leading-relaxed">{item.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          <iframe 
            width="100%" 
            height="auto"
            style={{ aspectRatio: "16/9", borderRadius: "1.5rem", maxWidth: "896px" }}
            src="https://www.youtube.com/embed/LHeEu86W9wQ" 
            title="Soidao Wittaya Video Presentation" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        </div>
      </section>



      {/* History Section */}
      <section className="py-20 md:py-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="order-2 lg:order-1 space-y-6"
            >
              <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-8">
                ประวัติและความเป็นมา
              </motion.h2>
              
              <div className="space-y-6 text-[var(--text-secondary)] text-lg leading-relaxed">
                <motion.p variants={fadeIn}>
                  โรงเรียนสอยดาววิทยา เป็นโรงเรียนระดับมัธยมศึกษาแห่งแรกของตำบลทรายขาว อำเภอโป่งน้ำร้อน จังหวัดจันทบุรี ก่อตั้งขึ้นตามเจตนารมณ์ของประชาชนและผู้ปกครอง โดยแต่งตั้งคณะกรรมการเพื่อขออนุญาตจัดตั้งโรงเรียนมัธยมต้นขึ้น
                </motion.p>
                <motion.p variants={fadeIn}>
                  <strong className="text-[var(--foreground)]">คุณโกศล เกษมศานติ์</strong> คหบดีชาวจันทบุรีได้มีจิตศรัทธาบริจาคที่ดินให้เป็นสถานที่ก่อสร้างโรงเรียนในปัจจุบัน นอกจากนี้ชุมชนได้ร่วมระดมทุนทรัพย์ร่วมสร้างอาคารเรียนชั่วคราว ต่อมาจึงได้รับการตั้งชื่ออาคารเรียนถาวรหลังแรกว่า "อาคารเกษมศานติ์" และคุณโกศลยังได้บริจาคที่ดินเพิ่มจนมีพื้นที่ทั้งหมดกว่า 71 ไร่ ในปัจจุบัน
                </motion.p>
                <motion.p variants={fadeIn}>
                   ในวันที่ 22 พฤษภาคม พ.ศ. 2521 ได้เปิดทำการสอนในชื่อ "โรงเรียนทรายขาววิทยา" และได้รับการประกาศเปลี่ยนชื่อเป็น <strong>"โรงเรียนสอยดาววิทยา"</strong> อย่างเป็นทางการเมื่อ 16 ธันวาคม พ.ศ. 2529 ตลอดเวลาที่ผ่านมา โรงเรียนได้พัฒนาทั้งด้านคุณภาพการศึกษาและชื่อเสียงอย่างต่อเนื่อง เพื่อเป็นสถาบันการศึกษาอันภาคภูมิใจของชุมชน
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 grid grid-cols-2 gap-4 h-[500px] lg:h-[600px] relative"
            >
              <div className="flex flex-col gap-4 h-full">
                <div className="relative w-full flex-grow rounded-3xl overflow-hidden shadow-lg border border-[var(--text-secondary)]/10 hover:scale-[1.02] transition-transform duration-300">
                  <Image 
                    src="/about/img20250521_10320801.jpg" 
                    alt="School History Photo 1" 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="relative w-full h-1/3 rounded-3xl overflow-hidden shadow-lg border border-[var(--text-secondary)]/10 hover:scale-[1.02] transition-transform duration-300">
                  <Image 
                    src="/about/img20250521_10332515.jpg" 
                    alt="School History Photo 2" 
                    fill 
                    className="object-cover" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 h-full pt-12">
                <div className="relative w-full flex-grow rounded-3xl overflow-hidden shadow-lg border border-[var(--text-secondary)]/10 hover:scale-[1.02] transition-transform duration-300">
                  <Image 
                    src="/about/IMG_1365.JPG" 
                    alt="School Campus" 
                    fill 
                    className="object-cover" 
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA / Location Section */}
      <section className="py-20 px-6 bg-[var(--surface)] text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-6">
            <MapPin className="text-[var(--accent)]" size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">ที่ตั้งของเรา</h2>
          <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-xl">
            4668+5F9 ตำบล ทรายขาว อำเภอ สอยดาว จันทบุรี 22180
          </p>

          <div className="w-full max-w-5xl aspect-[21/9] md:aspect-[21/7] rounded-3xl overflow-hidden shadow-xl border border-[var(--text-secondary)]/20 mb-8 bg-gray-100">
            <iframe 
              src="https://maps.google.com/maps?q=โรงเรียนสอยดาววิทยา&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>

          <Link
            href="https://maps.app.goo.gl/PnUQxWgLFf8uJk9HA"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center space-x-2 bg-[var(--foreground)] text-[var(--background)] px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform"
          >
            <span>นำทางด้วย Google Maps</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
