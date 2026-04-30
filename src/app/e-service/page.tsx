import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  GraduationCap, 
  BookOpen, 
  Library, 
  Globe, 
  FileCheck, 
  ChevronRight,
  ExternalLink,
  Info,
  Wallet
} from 'lucide-react';

const publicServices = [
  {
    title: "SGS (ตรวจสอบผลการเรียน)",
    description: "ระบบตรวจสอบผลการเรียนและคะแนนเก็บรายวิชาสำหรับนักเรียนและผู้ปกครอง",
    icon: <GraduationCap className="w-8 h-8" />,
    href: "https://sgs.bopp-obec.info/",
    color: "from-blue-500 to-blue-700",
    external: true
  },
  {
    title: "e-Money (พิมพ์สลิปเงินเดือน)",
    description: "ระบบพิมพ์สลิปเงินเดือนสำหรับข้าราชการครูและบุคลากรทางการศึกษา สพม.จันทบุรี ตราด",
    icon: <Wallet className="w-8 h-8" />,
    href: "https://sec17.ksom2.net/money/index_desktop.php",
    color: "from-amber-500 to-amber-700",
    external: true
  },
  {
    title: "ITA (การประเมินความโปร่งใส)",
    description: "การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ",
    icon: <FileCheck className="w-8 h-8" />,
    href: "https://www.ita.soidao.ac.th/ita2568",
    color: "from-amber-500 to-amber-700",
    external: true
  },
  {
    title: "สพม.จันทบุรี ตราด (SESACT)",
    description: "สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาจันทบุรี ตราด",
    imageUrl: "/สพม จบตร.webp",
    href: "https://www.sesact.go.th/",
    color: "from-indigo-500 to-indigo-700",
    external: true
  },
  {
    title: "PS School",
    description: "ระบบบริหารจัดการสถานศึกษาและสารสนเทศโรงเรียนสอยดาววิทยา",
    imageUrl: "/PS school.webp",
    href: "https://www.psschool.in.th/",
    color: "from-rose-500 to-rose-700",
    external: true
  },
  {
    title: "ตรวจสอบค่าบำรุงการศึกษา",
    description: "ระบบตรวจสอบข้อมูลการชำระเงินค่าบำรุงการศึกษาสำหรับนักเรียนและผู้ปกครอง",
    icon: <Wallet className="w-8 h-8" />,
    href: "https://script.google.com/macros/s/AKfycbxKnNY6xcxjKeAags028lQIbT1aBrTaIKw4a02CIkKQjf8iY1bkXs3dFshf5w8_kChA-Q/exec",
    color: "from-emerald-500 to-emerald-700",
    external: true
  }
];

export default function EServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            E-<span className="text-blue-600">Service</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            ศูนย์รวมบริการออนไลน์และแหล่งเรียนรู้สำหรับนักเรียน ผู้ปกครอง และบุคคลทั่วไป 
            เข้าถึงข้อมูลสำคัญของโรงเรียนสอยดาววิทยาได้สะดวกรวดเร็ว
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicServices.map((service, index) => (
            <Link 
              key={index}
              href={service.href}
              target={service.external ? "_blank" : "_self"}
              rel={service.external ? "noopener noreferrer" : ""}
              className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 border border-slate-100 flex flex-col h-full overflow-hidden transform hover:-translate-y-2"
            >
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-bl-full`} />
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-500 overflow-hidden`}>
                {('imageUrl' in service) ? (
                  <Image 
                    src={service.imageUrl as string} 
                    alt={service.title} 
                    width={64} 
                    height={64} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (service as any).icon
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                {service.title}
                {service.external && <ExternalLink size={16} className="text-slate-300" />}
              </h3>
              
              <p className="text-slate-500 leading-relaxed mb-8 flex-grow">
                {service.description}
              </p>

              <div className="flex items-center text-blue-600 font-bold text-sm gap-2 mt-auto">
                เข้าสู่บริการ
                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Notice Section */}
        <div className="mt-20 bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-6 max-w-3xl">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                <Info size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">บริการสำหรับบุคลากรภายใน</h2>
                <p className="text-blue-50 text-lg leading-relaxed">
                  สำหรับคุณครูและบุคลากรที่ต้องการเข้าใช้งานระบบบริหารจัดการภายในโรงเรียน (บค.1.01, ระบบจองห้อง, ระบบลา) 
                  กรุณาเข้าสู่ระบบผ่านปุ่ม "เข้าสู่ระบบ" ที่เมนูมุมขวาบนเพื่อใช้งาน SD Service Hub
                </p>
              </div>
            </div>
            <Link 
              href="/login" 
              className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black shadow-xl hover:bg-blue-50 transition-all flex-shrink-0"
            >
              เข้าสู่ระบบบุคลากร
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
