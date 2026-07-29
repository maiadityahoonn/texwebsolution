"use client";

export default function CommonMarquee() {
  const MARQUEE_ITEMS = [
    "AI Automation & Bots",
    "Custom Web & Mobile Apps",
    "Prebuilt SaaS Software",
    "Digital Marketing & Reels",
    "Video Shooting & Editing",
    "Brand Identity & Growth"
  ];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-6 sm:py-8 flex items-center shadow-inner group select-none">
      <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
            {MARQUEE_ITEMS.map((item, idx) => (
              <span key={idx} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-red-300/60 font-normal">•</span>
              </span>
            ))}
          </span>
        ))}
      </div>
      <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
            {MARQUEE_ITEMS.map((item, idx) => (
              <span key={idx} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-red-300/60 font-normal">•</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
