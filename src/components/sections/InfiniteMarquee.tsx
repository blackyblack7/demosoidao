export function InfiniteMarquee() {
  const items = [
    "Smart Minds เรียนดี",
    "Strong Bodies กีฬาเด่น",
    "Real-World Skills เน้นทักษะชีวิต",
    "โรงเรียนสอยดาววิทยา",
    "Soidao Chantaburi Thailand",
    "World Class Standard School",
  ];

  const all = [...items, ...items]; // double for seamless loop

  return (
    <div className="w-full bg-[var(--accent)] text-white py-3.5 overflow-hidden flex items-center border-y border-white/10 select-none">
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ willChange: "transform" }}
      >
        {all.map((text, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="mx-6 font-body text-sm md:text-base font-semibold uppercase tracking-widest">
              {text}
            </span>
            <span className="text-white/40 text-xs">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
