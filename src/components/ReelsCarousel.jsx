"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REELS = [
  { id: "1", title: "AI Agent Automation & Workflows", link: "https://www.instagram.com/p/DbXz0UhM4lp/?hl=en", imageUrl: "/thumbnails/tb-1.webp" },
  { id: "2", title: "Build Websites with AI Tools", link: "https://www.instagram.com/p/DQrhivDE7du/?hl=en", imageUrl: "/thumbnails/tb-2.webp" },
  { id: "3", title: "Premium Website Development", link: "https://www.instagram.com/p/DQzLqtwE4AR/?hl=en", imageUrl: "/thumbnails/tb-3.webp" },
  { id: "4", title: "API Keys & Custom Integrations", link: "https://www.instagram.com/p/DQo42SYE5Qe/?hl=en", imageUrl: "/thumbnails/tb-4.webp" },
  { id: "5", title: "AI Image Upscaling Tech", link: "https://www.instagram.com/p/DSnkxarjPuQ/?hl=en", imageUrl: "/thumbnails/tb-5.webp" },
  { id: "6", title: "Google Gen AI & Modern Tools", link: "https://www.instagram.com/p/DSsM5DDDMxW/?hl=en", imageUrl: "/thumbnails/tb-6.webp" },
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
    center: { x: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 50 },
    sideNear: (custom) => ({
      x: custom * (isDesktop ? 360 : 200),
      scale: isDesktop ? 0.85 : 0.9,
      opacity: 0.7,
      filter: "blur(3.5px)",
      zIndex: 40,
    }),
    hidden: (custom) => ({
      x: 400 * custom,
      scale: 0.6,
      opacity: 0,
      filter: "blur(8px)",
      zIndex: 0,
    }),
  };

  return (
    <section className="py-12 text-center w-full overflow-hidden bg-white">
      <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
        {badge}
      </div>
      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent my-2 px-3 leading-tight pb-1"
        style={{ fontFamily: "Matter" }}
      >
        {heading}
      </h2>

      <div className="relative flex flex-col items-center justify-center mt-4">
        {/* 3D Stack Slider Frame */}
        <div className="relative flex items-center justify-center h-[440px] sm:h-[480px] w-full max-w-[1400px]">
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

              let width, height;
              if (position === "center") {
                width = isDesktop ? 320 : 230;
                height = isDesktop ? 440 : 370;
              } else if (position === "sideNear") {
                width = isDesktop ? 260 : 200;
                height = isDesktop ? 370 : 320;
              } else {
                width = 260;
                height = 370;
              }

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
                  className="absolute max-w-[calc(100vw-2rem)] rounded-[28px] overflow-hidden shadow-2xl bg-black cursor-pointer"
                  style={{ width, height }}
                >
                  <a
                    href={reel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex flex-col justify-between w-full h-full p-5 rounded-[28px] border border-white/15 hover:border-red-500/60 transition-all duration-300 group overflow-hidden bg-black shadow-xl"
                  >
                    {/* Real Video Thumbnail Image Cover */}
                    <img
                      src={reel.imageUrl}
                      alt={reel.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500 z-0 pointer-events-none"
                    />

                    {/* Gradient Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 z-0 pointer-events-none" />

                    {/* Top Bar Header */}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-md">
                          <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-white/90 tracking-wide drop-shadow">REEL</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-red-600/90 shadow-md backdrop-blur-sm px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        INSTAGRAM
                      </span>
                    </div>

                    {/* Center Play Button Icon */}
                    <div className="flex flex-col items-center justify-center my-auto z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:scale-110 transition-transform duration-300 border-2 border-white/30">
                        <svg className="w-7 h-7 text-white fill-current ml-1" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom Title & CTA */}
                    <div className="text-left z-10 space-y-2">
                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 drop-shadow-md group-hover:text-red-400 transition-colors">
                        {reel.title}
                      </h3>
                      <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs text-white/90 font-medium">
                        <span>Play Reel</span>
                        <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform">↗</span>
                      </div>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Carousel Navigation Buttons & Indicators */}
        <div className="flex items-center justify-center gap-6 mt-3 lg:mt-8 z-50">
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
