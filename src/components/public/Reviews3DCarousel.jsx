"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Zap, Star, ArrowUpRight, Quote } from "lucide-react";

export default function Reviews3DCarousel({
  badge = "Client Reviews",
  heading = "Real Success Stories & Client Feedback",
  subheading = "See how leading brands and founders scale their operations with our high-impact campaigns.",
  reviewsList = [],
  tagIcon: TagIcon = Sparkles
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

  const total = reviewsList.length;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Automatic slide on all screens (desktop, tablet, mobile), pauses on hover/touch
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(handleNext, 4000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext, total]);

  // Finger Swipe Handlers for smooth mobile/touch gestures
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
      x: custom * (isDesktop ? 430 : 190),
      scale: isDesktop ? 0.82 : 0.85,
      opacity: 0.6,
      filter: "blur(3.5px)",
      zIndex: 15,
    }),
    hidden: (custom) => ({
      x: 520 * custom,
      scale: 0.55,
      opacity: 0,
      filter: "blur(8px)",
      zIndex: 0,
    }),
  };

  if (!total) return null;

  return (
    <section className="py-10 sm:py-14 text-center w-full overflow-hidden bg-gradient-to-b from-white via-red-50/20 to-white font-[Matter] relative">
      {/* Background Tech Grid & Ambient Glow Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444408_1px,transparent_1px),linear-gradient(to_bottom,#ef444408_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-red-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Badge Header */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 min-[360px]:px-4 min-[360px]:py-1.5 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-[11px] min-[360px]:text-xs sm:text-sm font-[Matter] mb-2.5 sm:mb-3 max-w-[92%]">
        <Sparkles className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-red-600 animate-pulse shrink-0" />
        <span className="truncate">{badge}</span>
      </div>

      {/* Main Heading */}
      <h2 className="text-xl min-[360px]:text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center bg-gradient-to-r from-gray-900 via-gray-800 to-red-600 bg-clip-text text-transparent my-1 px-3 leading-tight pb-1">
        {heading}
      </h2>

      {subheading && (
        <p className="mt-1.5 sm:mt-2 text-xs min-[360px]:text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto px-4 mb-5 sm:mb-8">
          {subheading}
        </p>
      )}

      {/* 3D Stack Carousel Frame */}
      <div 
        className="relative flex flex-col items-center justify-center min-h-[225px] min-[360px]:min-h-[230px] sm:min-h-[235px] select-none touch-pan-y"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative flex items-center justify-center h-[210px] min-[360px]:h-[215px] sm:h-[220px] w-full max-w-[1400px]">
          <AnimatePresence initial={false} mode="popLayout">
            {reviewsList.map((item, index) => {
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
                width = isDesktop ? 440 : 295;
                height = isDesktop ? 205 : 200;
              } else if (position === "sideNear") {
                width = isDesktop ? 370 : 260;
                height = isDesktop ? 185 : 180;
              } else {
                width = 340;
                height = 180;
              }

              return (
                <motion.div
                  key={item.id || index}
                  custom={offset}
                  variants={cardVariants}
                  initial="hidden"
                  animate={position}
                  exit="hidden"
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragStart={() => setIsPaused(true)}
                  onDragEnd={(e, info) => {
                    setIsPaused(false);
                    if (info.offset.x > 35) handlePrev();
                    else if (info.offset.x < -35) handleNext();
                  }}
                  className="absolute max-w-[calc(100vw-1rem)] min-[360px]:max-w-[calc(100vw-1.5rem)] p-[2px] rounded-[20px] sm:rounded-[24px] bg-gradient-to-b from-red-500/40 via-rose-300/30 to-amber-200/40 shadow-xl cursor-pointer text-left overflow-hidden select-none"
                  style={{ width, height }}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="bg-white/95 backdrop-blur-2xl rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3 flex flex-col justify-between h-full w-full relative">
                    
                    {/* Background Decorative Quote Watermark */}
                    <Quote className="absolute right-2 top-2 sm:right-3 sm:top-3 w-7 h-7 sm:w-9 sm:h-9 text-red-500/5 pointer-events-none" />

                    <div>
                      {/* Top Bar: Solution Tag & ROI Metric Badge (Stacked Vertically) */}
                      <div className="flex flex-col items-start gap-0.5 mb-1 min-w-0 w-full">
                        <span className="inline-flex items-center gap-1 min-w-0 max-w-full px-1.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[9.5px] sm:text-[10px] font-semibold font-[Matter]">
                          <TagIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                          <span className="truncate whitespace-nowrap">{item.solution}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 min-w-0 max-w-full px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[9px] sm:text-[9.5px] font-bold font-mono">
                          <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-600 fill-emerald-600 shrink-0" />
                          <span className="truncate whitespace-nowrap">{item.roi}</span>
                        </span>
                      </div>

                      {/* Rating Stars & Verified Check */}
                      <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
                        <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 stroke-amber-400" />
                          ))}
                        </div>
                        <span className="text-[9px] sm:text-[9.5px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span className="truncate">Verified Client</span>
                        </span>
                      </div>

                      {/* Review Quote Text - Full text visible, ultra-compact */}
                      <p className="text-gray-700 text-[10.5px] sm:text-[11.5px] leading-snug font-light font-poppins relative z-10">
                        &quot;{item.quote}&quot;
                      </p>
                    </div>

                    {/* Client Profile Footer */}
                    <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between gap-1.5 mt-auto min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                        <Image width={100} height={100}
                          src={item.image}
                          alt={item.name}
                          className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full object-cover border-2 border-red-500/30 shadow-md shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-[11px] sm:text-[11.5px] leading-tight truncate">
                            {item.name}
                          </h4>
                          <p className="text-[9.5px] sm:text-[10px] text-gray-500 font-light truncate">
                            {item.role}
                          </p>
                        </div>
                      </div>

                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 shadow-sm shrink-0">
                        <ArrowUpRight className="w-3 h-3" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dot Indicators (Clean, Automatic & Fingers Swipe) */}
        <div className="flex items-center justify-center gap-1.5 min-[360px]:gap-2.5 mt-2 sm:mt-5 z-20 flex-wrap px-2">
          {reviewsList.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 min-[360px]:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === activeIndex 
                  ? "w-6 min-[360px]:w-8 bg-red-600 shadow-sm shadow-red-600/30" 
                  : "w-2.5 min-[360px]:w-3 bg-gray-200 hover:bg-gray-300"
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
