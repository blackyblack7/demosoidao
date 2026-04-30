"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

interface WelcomePopupProps {
  popup: {
    isActive: boolean;
    imageUrl: string;
    linkUrl: string | null;
  } | null;
}

export default function WelcomePopup({ popup }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup is active and has an image
    if (popup && popup.isActive && popup.imageUrl) {
      // Check if it's already been shown in this session
      const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");
      if (!hasSeenPopup) {
        // Add a slight delay for better UX
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [popup]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  const handleLinkClick = () => {
    // Also mark as seen when clicked
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div 
        className="absolute inset-0" 
        onClick={handleClose} 
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-4xl bg-transparent animate-in zoom-in-95 duration-500">
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 md:-top-6 md:-right-6 z-10 w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-100 hover:scale-110 transition-all border border-slate-200"
          aria-label="Close popup"
        >
          <X size={24} />
        </button>

        <div className="relative w-full aspect-video max-h-[80vh] bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-4 border-white/10">
          {popup.linkUrl ? (
            <Link href={popup.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              <Image 
                src={popup.imageUrl} 
                alt="Welcome to Soidao School" 
                fill 
                className="object-cover md:object-contain hover:scale-105 transition-transform duration-700" 
                sizes="(max-width: 768px) 100vw, 800px"
                priority
              />
            </Link>
          ) : (
            <Image 
              src={popup.imageUrl} 
              alt="Welcome to Soidao School" 
              fill 
              className="object-cover md:object-contain" 
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          )}
        </div>
      </div>
    </div>
  );
}
