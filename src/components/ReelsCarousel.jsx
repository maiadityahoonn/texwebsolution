"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REELS = [
  { id: "1", link: "https://www.instagram.com/p/DbXz0UhM4lp/?hl=en", imageUrl: "/thumbnails/tb-1.webp" },
  { id: "2", link: "https://www.instagram.com/p/DQrhivDE7du/?hl=en", imageUrl: "/thumbnails/tb-2.webp" },
  { id: "3", link: "https://www.instagram.com/p/DQzLqtwE4AR/?hl=en", imageUrl: "/thumbnails/tb-3.webp" },
  { id: "4", link: "https://www.instagram.com/p/DQo42SYE5Qe/?hl=en", imageUrl: "/thumbnails/tb-4.webp" },
  { id: "5", link: "https://www.instagram.com/p/DSnkxarjPuQ/?hl=en", imageUrl: "/thumbnails/tb-5.webp" },
  { id: "6", link: "https://www.instagram.com/p/DSsM5DDDMxW/?hl=en", imageUrl: "/thumbnails/tb-6.webp" },
];

export default function ReelsCarousel({
  badge = "Social Presence",
  heading = "Trusted by 90k+ People",
  reelsList = REELS
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const total = reelsList.length;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    if (isDesktop || total <= 1) return;
    const interval = setInterval(handleNext, 3500);
    return () => clearInterval(interval);
  }, [isDesktop, handleNext, total]);

  const cardVariants = {
    center: { x: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 25 },
    sideNear: (custom) => ({
      x: custom * (isDesktop ? 360 : 210),
      scale: isDesktop ? 0.85 : 0.88,
      opacity: 0.65,
      filter: "blur(2.5px)",
      zIndex: 15,
    }),
    hidden: (custom) => ({
      x: 420 * custom,
      scale: 0.6,
      opacity: 0,
      filter: "blur(6px)",
      zIndex: 0,
    }),
  };

  return (
    <section className="py-10 sm:py-12 text-center w-full overflow-hidden bg-white font-[Matter]">
      <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
        {badge}
      </div>
      <h2
        className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-3 px-3 leading-tight pb-1"
        style={{ fontFamily: "Matter" }}
      >
        {heading}
      </h2>
      <p className="text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto px-4 mb-8 sm:mb-10 leading-relaxed">
        Watch our latest viral videos, client project breakdowns, and modern tech workflows.
      </p>

      <div className="relative flex flex-col items-center justify-center">
        {/* 3D Stack Slider Frame */}
        <div className="relative flex items-center justify-center h-[460px] sm:h-[500px] w-full max-w-[1400px]">
          <AnimatePresence initial={false} mode="popLayout">
            {reelsList.map((reel, index) => {
              let offset = ((index - activeIndex) % total + total) % total;
              if (offset > total / 2) {
                offset -= total;
              }
              const absOffset = Math.abs(offset);

              let position = "hidden";
              if (offset === 0) {
                position = "center";
              } else if (absOffset === 1) {
                position = "sideNear";
              }

              let width = isDesktop ? 320 : 240;
              let height = isDesktop ? 460 : 390;

              return (
                <motion.div
                  key={reel.id}
                  custom={offset}
                  variants={cardVariants}
                  initial="hidden"
                  animate={position}
                  exit="hidden"
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                  drag={!isDesktop && "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 50) handlePrev();
                    else if (info.offset.x < -50) handleNext();
                  }}
                  className="absolute max-w-[calc(100vw-2rem)] rounded-[26px] overflow-hidden shadow-2xl bg-black cursor-pointer"
                  style={{ width, height }}
                >
                  <a
                    href={reel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center w-full h-full rounded-[26px] overflow-hidden group cursor-pointer border border-white/20 hover:border-red-500/80 transition-all duration-300"
                  >
                    {/* Clean Video Thumbnail */}
                    <img
                      src={reel.imageUrl}
                      alt="Instagram Reel"
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                    />

                    {/* Subtle Overlay Vignette */}
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors duration-300 pointer-events-none" />

                    {/* Glowing Center Play Button */}
                    <div className="relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] group-hover:scale-115 group-hover:shadow-[0_0_45px_rgba(239,68,68,0.7)] transition-all duration-300 border-2 border-white/60">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-current ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Carousel Controls & Dot Indicators */}
        <div className="flex items-center justify-center gap-6 mt-3 lg:mt-8 z-20">
          <button
            onClick={handlePrev}
            className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition shadow-sm font-semibold"
            aria-label="Previous"
          >
            ←
          </button>
          <div className="flex justify-center gap-3">
            {reelsList.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${index === activeIndex ? "w-8 bg-red-600" : "w-3 bg-gray-300 hover:bg-gray-400"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition shadow-sm font-semibold"
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
