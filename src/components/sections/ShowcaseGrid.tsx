"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const portfolios = [
  {
    id: 1,
    project_name: "The Future City Model",
    student_name: "John Doe",
    tags: ["Architecture", "3D Design"],
    image: "https://images.unsplash.com/photo-1517042571746-86d1a938ea5f?q=80&w=1964&auto=format&fit=crop",
    size: "large"
  },
  {
    id: 2,
    project_name: "AI & Robotics Workshop",
    student_name: "Tech Club",
    tags: ["Robotics", "Programming"],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
    size: "medium"
  },
  {
    id: 3,
    project_name: "Annual Art Exhibition",
    student_name: "Creative Arts Dept.",
    tags: ["Painting", "Sculpture"],
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop",
    size: "small"
  },
  {
    id: 4,
    project_name: "Renewable Energy Research",
    student_name: "Sarah Jenkins",
    tags: ["Science", "Sustainability"],
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2070&auto=format&fit=crop",
    size: "medium"
  },
  {
    id: 5,
    project_name: "Cultural Dance Festival",
    student_name: "Student Life",
    tags: ["Culture", "Performance"],
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop",
    size: "large"
  }
];

export function ShowcaseGrid() {
  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black font-heading mb-4 text-balance">
            Student <span className="text-[var(--accent)]">Excellence</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl font-body">
            Discover the amazing projects and initiatives led by our talented students across various disciplines.
          </p>
        </div>

        {/* Masonry-style Grid using CSS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
          {portfolios.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl group ${
                item.size === 'large' ? 'md:col-span-2 md:row-span-2' : 
                item.size === 'medium' ? 'md:row-span-2' : 
                'row-span-1'
              }`}
            >
              {/* Image with 1.05x hover scale */}
              <div className="absolute inset-0 w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                {/* Note: In a real app we'd use next/image here, but an img tag works for the Unsplash placeholders to bypass next.config domains requirement */}
                <img 
                  src={item.image} 
                  alt={item.project_name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

              {/* Content Box */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <div className="flex gap-2 mb-3 max-w-full overflow-hidden">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold font-heading leading-tight mb-1">
                    {item.project_name}
                  </h3>
                  <p className="text-white/70 text-sm font-medium">
                    By {item.student_name}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
