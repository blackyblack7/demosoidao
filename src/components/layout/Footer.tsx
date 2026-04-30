import Link from "next/link";
import Image from "next/image";
import { Globe, Phone, Mail, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "../icons/BrandIcons";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--text-secondary)]/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">

          {/* Brand & Address */}
          <div className="md:col-span-5">
            <Link href="/" className="mb-5 block">
              <Image
                src="/logo.png"
                alt="Soidao School Logo"
                width={56}
                height={56}
                className="object-contain"
              />
            </Link>
            <div className="text-[var(--text-secondary)] mb-6 space-y-1">
              <p className="font-heading font-bold text-[var(--foreground)] text-base">โรงเรียนสอยดาววิทยา</p>
              <p className="text-sm">Soidao Wittaya School</p>
              <p className="text-sm italic text-[var(--text-secondary)]/70 mt-2">
                "Smart Minds | Strong Bodies | Real-World Skills"
              </p>
            </div>

            {/* Social links */}
            <div className="flex flex-wrap gap-2">
              {[
                { href: "https://www.soidao.ac.th", icon: <Globe size={18} />, label: "Website" },
                { href: "https://www.facebook.com/Soidaowittayaschool", icon: <FacebookIcon size={18} />, label: "Facebook" },
                { href: "https://www.instagram.com/sd.council_/", icon: <InstagramIcon size={18} />, label: "Instagram" },
                { href: "tel:039381140", icon: <Phone size={18} />, label: "Phone" },
                { href: "mailto:soidaowittaya@gmail.com", icon: <Mail size={18} />, label: "Email" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={item.label}
                  className="w-10 h-10 rounded-xl bg-[var(--background)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="font-heading font-bold text-[var(--foreground)] mb-5 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "เกี่ยวกับโรงเรียน" },
                { href: "https://sites.google.com/view/reg-soidaowittaya/home?authuser=0", label: "รับสมัครนักเรียน", external: true },
                { href: "/news", label: "ข่าวประชาสัมพันธ์" },
                { href: "/sdservice", label: "SD Service Hub" },
                { href: "/contact", label: "ติดต่อเรา" },
                { href: "https://www.ita.soidao.ac.th/ita2568", label: "ITA 2568", external: true },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4">
            <h3 className="font-heading font-bold text-[var(--foreground)] mb-5 text-sm uppercase tracking-wider">ติดต่อเรา</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  81 หมู่ 5 ต.ทรายขาว อ.สอยดาว<br />จ.จันทบุรี 22180
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[var(--accent)] shrink-0" />
                <a href="tel:039381140" className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
                  039-381140
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[var(--accent)] shrink-0" />
                <a href="mailto:soidaowittaya@gmail.com" className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
                  soidaowittaya@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe size={16} className="text-[var(--accent)] shrink-0" />
                <a href="https://www.soidao.ac.th" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
                  www.soidao.ac.th
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--text-secondary)]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[var(--text-secondary)] text-xs">
            &copy; {currentYear} โรงเรียนสอยดาววิทยา · Soidao Wittaya School. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <span className="text-[var(--text-secondary)]/50 font-heading">Powered by <span className="text-[var(--accent)]">SD Tech</span></span>
            <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
