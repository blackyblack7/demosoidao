"use client"

import { 
  Briefcase, 
  ShieldCheck, 
  ClipboardCheck, 
  Wallet, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  FileText, 
  QrCode, 
  Users, 
  MessageSquare,
  Monitor,
  ExternalLink,
  ShieldAlert,
  History,
  ArrowRight
} from "lucide-react";

interface ServiceItem {
  key: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  color: string;
}

interface ServiceHubProps {
  services: ServiceItem[];
  maintenanceStatuses: Record<string, boolean>;
  userName: string;
}

const ICON_MAP: Record<string, any> = {
  'Briefcase': Briefcase,
  'ShieldCheck': ShieldCheck,
  'ClipboardCheck': ClipboardCheck,
  'Wallet': Wallet,
  'GraduationCap': GraduationCap,
  'Calendar': Calendar,
  'BookOpen': BookOpen,
  'FileText': FileText,
  'QrCode': QrCode,
  'Users': Users,
  'MessageSquare': MessageSquare,
  'Monitor': Monitor,
};

export default function ServiceHub({ services, maintenanceStatuses, userName }: ServiceHubProps) {
  // Sort: Items under development (href: "#") move to the end
  const sortedServices = [...services].sort((a, b) => {
    if (a.href === "#" && b.href !== "#") return 1;
    if (a.href !== "#" && b.href === "#") return -1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedServices.map((service, index) => {
        const isUnderDevelopment = service.href === "#";
        const isMaintenance = maintenanceStatuses[service.key] || false;
        const IconComponent = ICON_MAP[service.iconName] || Briefcase;

        return (
          <div
            key={index}
            className={`group relative flex flex-col bg-white rounded-3xl p-8 shadow-sm transition-all duration-500 border border-slate-100 overflow-hidden ${
              isUnderDevelopment || isMaintenance
                ? "grayscale opacity-60 border-slate-200"
                : "hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${service.color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`} />

            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 ${isMaintenance ? "bg-slate-400" : service.color} text-white rounded-2xl shadow-lg transition-transform ${(!isUnderDevelopment && !isMaintenance) && "group-hover:rotate-12"}`}>
                <IconComponent size={28} />
              </div>
              {!isUnderDevelopment && (
                <a
                  href={service.href}
                  {...(service.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`p-2 rounded-full border border-slate-100 text-slate-300 transition-colors ${!isMaintenance && "group-hover:text-blue-500 group-hover:border-blue-100"}`}
                >
                  <ExternalLink size={20} />
                </a>
              )}
              {(isUnderDevelopment || isMaintenance) && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${isMaintenance ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                  {isMaintenance ? "Maintenance" : "Inactive"}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className={`text-xl font-bold transition-colors mb-2 ${isUnderDevelopment || isMaintenance ? "text-slate-400" : "text-slate-800 group-hover:text-blue-600"}`}>
                {service.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {service.description}
              </p>
            </div>

            {isUnderDevelopment ? (
              <div className="mt-8 flex items-center gap-2 text-slate-400 font-bold text-sm">
                <History size={16} />
                <span>ระบบกำลังพัฒนา</span>
              </div>
            ) : isMaintenance ? (
              <div className="mt-8 flex items-center gap-2 text-amber-500 font-bold text-sm">
                <ShieldAlert size={16} />
                <span>Maintenance Time</span>
              </div>
            ) : (
              <a
                href={service.href}
                {...(service.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm"
              >
                <span>เปิดใช้งานแอป</span>
                <ArrowRight size={16} className="transform translate-x-0 group-hover:translate-x-2 transition-transform" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
