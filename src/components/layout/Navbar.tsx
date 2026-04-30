"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, LogIn, LogOut, User, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

interface SessionUser {
  name: string;
  role: string;
  isAdmin?: boolean;
  hasManagementAccess?: boolean;
}

interface NavbarProps {
  session?: SessionUser | null;
}

export function Navbar({ session }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    {
      label: "กลุ่มบริหารงาน",
      dropdown: [
        { href: "https://sites.google.com/soidao.ac.th/soidao-general/", label: "กลุ่มบริหารงานทั่วไป" },
        { href: "https://sites.google.com/soidao.ac.th/personnel-management?usp=sharing", label: "กลุ่มบริหารงานบุคคล" },
        { href: "https://sites.google.com/soidao.ac.th/budgetsoidao?usp=sharing", label: "กลุ่มบริหารงานงบประมาณและทรัพย์สิน" },
        { href: "https://sites.google.com/soidao.ac.th/sdvijjakarn/home", label: "กลุ่มบริหารงานวิชาการ" },
      ]
    },
    {
      label: "กลุ่มสาระการเรียนรู้",
      dropdown: [
        { href: "https://sites.google.com/soidao.ac.th/saodaothai/home", label: "ภาษาไทย" },
        { href: "https://sites.google.com/soidao.ac.th/mathsoidao/home", label: "คณิตศาสตร์" },
        { href: "https://sites.google.com/soidao.ac.th/sciencesoidao/home", label: "วิทยาศาสตร์และเทคโนโลยี" },
        { href: "https://sites.google.com/soidao.ac.th/social-soidao/home", label: "สังคมศึกษา ศาสนา และวัฒนธรรม" },
        { href: "https://sites.google.com/soidao.ac.th/foreignlanguagesdepartment/home", label: "ภาษาต่างประเทศ" },
        { href: "https://sites.google.com/soidao.ac.th/artsd?usp=sharing", label: "ศิลปะ" },
        { href: "https://sites.google.com/soidao.ac.th/careersoidao/home", label: "การงานอาชีพ" },
        { href: "https://www.facebook.com/profile.php?id=100088282996793", label: "สุขศึกษาและพลศึกษา" },
      ]
    },
    {
      label: "ข้อมูลพื้นฐานโรงเรียน",
      dropdown: [
        { href: "/about", label: "เกี่ยวกับโรงเรียน" },
        { href: "/executives", label: "ทำเนียบผู้บริหาร" },
        { href: "/personnel", label: "ทำเนียบบุคลากร" },
      ]
    },
    {
      label: "ประชาสัมพันธ์",
      dropdown: [
        { href: "/news/announcements", label: "ประกาศจากทางโรงเรียน" },
        { href: "/news", label: "ข่าวประชาสัมพันธ์ทั้งหมด" },
        { href: "https://www.facebook.com/Soidaowittayaschool", label: "Facebook โรงเรียนสอยดาววิทยา" },
        { href: "https://www.facebook.com/profile.php?id=100093490810815", label: "Facebook สภานักเรียน" },
        { href: "https://www.instagram.com/sd.council_/", label: "Instagram สภานักเรียน" },
        { href: "https://www.facebook.com/tobenumberonesoidaowittaya/?rdid=StDLyEbqZeFPH8x1", label: "Facebook To be Number One" },
      ]
    },
    {
      label: "E-Service",
      dropdown: [
        { href: "/e-service", label: "ศูนย์บริการออนไลน์ (E-Service Hub)" },
        { href: "https://sgs.bopp-obec.info/", label: "SGS (ตรวจสอบผลการเรียน)" },
        { href: "https://sec17.ksom2.net/money/index_desktop.php", label: "e-Money (พิมพ์สลิปเงินเดือน)" },
        { href: "https://script.google.com/macros/s/AKfycbxKnNY6xcxjKeAags028lQIbT1aBrTaIKw4a02CIkKQjf8iY1bkXs3dFshf5w8_kChA-Q/exec", label: "ตรวจสอบค่าบำรุงการศึกษา" },
        { href: "https://www.ita.soidao.ac.th/ita2568", label: "ITA" },
        { href: "https://www.sesact.go.th/", label: "สพม.จันทบุรี ตราด (SESACT)" },
        { href: "https://www.psschool.in.th/", label: "PS School" },
      ]
    },
    ...(session?.role === 'TEACHER' ? [
      {
        label: "SD Service Hub",
        dropdown: [
          { href: "/sdservice", label: "สอยดาวแอพพลิเคชั่น (Application)" },
          ...(session.hasManagementAccess ? [
            { href: "/management", label: "สอยดาวแอดมิน (Admin)" }
          ] : [])
        ]
      }
    ] : [
      { href: "/sdservice", label: "SD Service" }
    ]),
  ];

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Soidao School Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                  priority
                />
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="text-sm font-medium hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button className="text-sm font-medium hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                      {link.label}
                      {link.dropdown && <ChevronDown size={16} className={`transition-transform duration-300 ${openDropdown === link.label ? 'rotate-180' : ''}`} />}
                    </button>
                  )}

                  {link.dropdown && (
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-80 glass bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--foreground)]/10 rounded-2xl shadow-xl overflow-hidden"
                        >
                          <div className="py-2 flex flex-col">
                            {link.dropdown.map((dropItem) => (
                              <Link
                                key={dropItem.label}
                                href={dropItem.href}
                                className="px-4 py-2 text-sm hover:bg-[var(--foreground)]/5 hover:text-[var(--accent)] transition-colors"
                                {...(dropItem.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                              >
                                {dropItem.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}

              {/* Auth Button - Desktop */}
              {session ? (
                <div className="flex items-center gap-4">
                  {session.role === 'TEACHER' && <NotificationBell />}
                  <div className="relative"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}>
                    <button className="flex items-center gap-2 text-sm font-medium bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] px-3 py-2 rounded-xl transition-all">
                      <User size={16} />
                      <span className="max-w-[120px] truncate">{session.name}</span>
                      <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-2 w-48 glass bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--foreground)]/10 rounded-2xl shadow-xl overflow-hidden"
                        >
                          <div className="py-2 flex flex-col">
                            <div className="px-4 py-2 text-xs text-[var(--foreground)]/50 border-b border-[var(--foreground)]/10">
                              {session.role === 'TEACHER' ? 'ครู/บุคลากร' : session.role}
                            </div>
                            <Link
                              href="/profile"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-[var(--foreground)]/5 transition-colors"
                            >
                              <User size={14} />
                              ข้อมูลส่วนตัว
                            </Link>
                            <Link
                              href="/profile"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-[var(--foreground)]/5 transition-colors"
                            >
                              <Settings size={14} />
                              เปลี่ยนรหัสผ่าน
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50/10 transition-colors"
                            >
                              <LogOut size={14} />
                              ออกจากระบบ
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm font-medium bg-[var(--accent)] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-md"
                >
                  <LogIn size={16} />
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 -mr-2 text-[var(--foreground)]"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[var(--background)] flex flex-col items-center space-y-6 md:hidden pt-24 pb-8 overflow-y-auto"
          >
            {navLinks.map((link) => (
              <div key={link.label} className="flex flex-col items-center w-full px-4 text-center">
                {link.href ? (
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-bold hover:text-[var(--accent)] transition-colors"
                    {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                    className="text-xl font-bold hover:text-[var(--accent)] transition-colors flex items-center gap-2"
                  >
                    {link.label}
                    {link.dropdown && <ChevronDown size={20} className={`transition-transform duration-300 ${openDropdown === link.label ? 'rotate-180' : ''}`} />}
                  </button>
                )}

                {link.dropdown && (
                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center mt-4 space-y-4 overflow-hidden w-full"
                      >
                        {link.dropdown.map((dropItem) => (
                          <Link
                            key={dropItem.label}
                            href={dropItem.href}
                            onClick={() => setIsOpen(false)}
                            className="text-base text-[var(--foreground)]/80 hover:text-[var(--accent)] transition-colors px-2 text-center"
                            {...(dropItem.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            {dropItem.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}

            {/* Auth Button - Mobile */}
            <div className="w-full px-8 pt-4 border-t border-[var(--foreground)]/10">
              {session ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-base font-medium text-[var(--accent)]">
                      <User size={18} />
                      <span>{session.name}</span>
                    </div>
                    {session.role === 'TEACHER' && <NotificationBell />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500/10 text-blue-600 rounded-xl font-medium hover:bg-blue-500/20 transition-colors"
                    >
                      <User size={16} />
                      ข้อมูลส่วนตัว
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-slate-500/10 text-slate-600 rounded-xl font-medium hover:bg-slate-500/20 transition-colors"
                    >
                      <Settings size={16} />
                      เปลี่ยนรหัสผ่าน
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut size={16} />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all"
                >
                  <LogIn size={16} />
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
