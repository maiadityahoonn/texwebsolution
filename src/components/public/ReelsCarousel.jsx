"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "@/components/public/AnimatedCounter";

const REELS = [
  { id: "1", link: "https://www.instagram.com/p/DbXz0UhM4lp/?hl=en", imageUrl: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/thumbnails/tb-1.png" },
  { id: "2", link: "https://www.instagram.com/reel/DbvdBmVsVNb/?hl=en", imageUrl: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/thumbnails/tb-6.png" },
  { id: "3", link: "https://www.instagram.com/reel/DblNVbZNpat/?hl=en", imageUrl: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/thumbnails/tb-3.png" },
  { id: "4", link: "https://www.instagram.com/reel/DbqaViXzNYp/?hl=en", imageUrl: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/thumbnails/tb-4.png" },
  { id: "5", link: "https://www.instagram.com/reel/Db3UaiGMUdm/?hl=en", imageUrl: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/thumbnails/tb-5.png" },
  { id: "6", link: "https://www.instagram.com/p/DQrhivDE7du/?hl=en", imageUrl: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/thumbnails/tb-2.png" },
];

export default function ReelsCarousel({
  badge = "Social Presence",
  audienceCount = 90,
  reelsList = REELS
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

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

  // Autoplay everywhere, pauses on hover or touch
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(handleNext, 3500);
    return () => clearInterval(interval);
  }, [isPaused, handleNext, total]);

  // Touch Swipe Handlers for Finger Swipe
  const handleTouchStart = (e) => {
    setIsPaused(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 35) {
      handleNext();
    } else if (distance < -35) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

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
    <section className="py-8 sm:py-10 text-center w-full overflow-hidden bg-white font-[Matter]">
      <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
        {badge}
      </div>
      <h2
        className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-2 px-3 leading-tight pb-1"
        style={{ fontFamily: "Matter" }}
      >
        Trusted by <AnimatedCounter target={audienceCount} suffix="k+" /> People
      </h2>
      <p className="text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto px-4 mb-3 sm:mb-4 leading-relaxed">
        Watch our latest viral videos, client project breakdowns, and modern tech workflows.
      </p>

      <div 
        className="relative flex flex-col items-center justify-center select-none touch-pan-y"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 3D Stack Slider Frame (Exact height to fit 9:16 cards without extra gaps) */}
        <div className="relative flex items-center justify-center h-[430px] lg:h-[570px] w-full max-w-[1400px]">
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

              // Exact 9:16 aspect ratio (1080x1920)
              let width = isDesktop ? 320 : 240;
              let height = isDesktop ? 568 : 427;

              return (
                <motion.div
                  key={reel.id}
                  custom={offset}
                  variants={cardVariants}
                  initial="hidden"
                  animate={position}
                  exit="hidden"
                  transition={{ type: "spring", stiffness: 90, damping: 20 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragStart={() => setIsPaused(true)}
                  onDragEnd={(e, info) => {
                    setIsPaused(false);
                    if (info.offset.x > 35) handlePrev();
                    else if (info.offset.x < -35) handleNext();
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
                    <Image width={800} height={600}
                      src={reel.imageUrl}
                      alt="Instagram Reel"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 pointer-events-none"
                    />
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dot Indicators (Clean, Automatic & Fingers Swipe) */}
        <div className="flex items-center justify-center gap-2.5 mt-4 sm:mt-5 z-20">
          {reelsList.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === activeIndex ? "w-8 bg-red-600 shadow-sm shadow-red-600/30" : "w-3 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
