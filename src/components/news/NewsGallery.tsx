'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ImageIcon, Clock, Maximize2 } from 'lucide-react';

interface NewsGalleryProps {
  images: string[];
}

export default function NewsGallery({ images }: NewsGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="space-y-10 pt-20 border-t border-slate-100 font-body">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
            <ImageIcon size={24} />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">คลังภาพบรรยากาศ</h3>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm font-black uppercase tracking-widest">
          {images.length} Images <Clock size={14} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            onClick={() => setSelectedImage(i)}
            className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group cursor-pointer relative"
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 z-10 flex items-center justify-center">
               <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500">
                  <Maximize2 size={24} />
               </div>
            </div>
            <img 
              src={img} 
              alt="" 
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
            />
            <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 translate-y-4 group-hover:translate-y-0 text-white text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
              คลิกเพื่อขยายรูป
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-3 bg-white/5 rounded-full hover:bg-white/10 z-[110]"
            >
              <X size={32} />
            </button>

            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-3 bg-white/5 rounded-full hover:bg-white/10 z-[110]"
                >
                  <ChevronLeft size={40} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-3 bg-white/5 rounded-full hover:bg-white/10 z-[110]"
                >
                  <ChevronRight size={40} />
                </button>
              </>
            )}

            <motion.div
              layoutId={`gallery-image-${selectedImage}`}
              key={selectedImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-full max-h-[85vh] aspect-auto group"
            >
               <img 
                src={images[selectedImage]} 
                alt="" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
               />
               
               {/* Metadata / Index */}
               <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs font-black uppercase tracking-[0.4em] whitespace-nowrap">
                  Image {selectedImage + 1} of {images.length}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
