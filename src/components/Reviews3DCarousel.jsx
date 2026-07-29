"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Zap, Star, ArrowUpRight, ArrowLeft, ArrowRight, Quote } from "lucide-react";

export default function Reviews3DCarousel({
  badge = "Client Reviews",
  heading = "Real Success Stories & Client Feedback",
  subheading = "See how leading brands and founders scale their operations with our high-impact campaigns.",
  reviewsList = [],
  tagIcon: TagIcon = Sparkles
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

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

  useEffect(() => {
    if (isDesktop || total <= 1) return;
    const interval = setInterval(handleNext, 4500);
    return () => clearInterval(interval);
  }, [isDesktop, handleNext, total]);

  const cardVariants = {
    center: { x: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 50 },
    sideNear: (custom) => ({
      x: custom * (isDesktop ? 430 : 230),
      scale: isDesktop ? 0.82 : 0.85,
      opacity: 0.6,
      filter: "blur(3.5px)",
      zIndex: 40,
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
    <section className="py-16 sm:py-20 text-center w-full overflow-hidden bg-gradient-to-b from-white via-red-50/20 to-white font-[Matter] relative">
      {/* Background Tech Grid & Ambient Glow Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444408_1px,transparent_1px),linear-gradient(to_bottom,#ef444408_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-red-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Badge Header */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
        <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
        {badge}
      </div>

      {/* Main Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 via-gray-800 to-red-600 bg-clip-text text-transparent my-2 px-3 leading-tight pb-1">
        {heading}
      </h2>

      {subheading && (
        <p className="mt-3 text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto px-4 mb-10">
          {subheading}
        </p>
      )}

      {/* 3D Stack Carousel Frame */}
      <div className="relative flex flex-col items-center justify-center min-h-[520px]">
        <div className="relative flex items-center justify-center h-[490px] sm:h-[510px] w-full max-w-[1400px]">
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
                width = isDesktop ? 440 : 310;
                height = isDesktop ? 470 : 450;
              } else if (position === "sideNear") {
                width = isDesktop ? 370 : 270;
                height = isDesktop ? 420 : 400;
              } else {
                width = 340;
                height = 400;
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
                  drag={!isDesktop && "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 50) handlePrev();
                    else if (info.offset.x < -50) handleNext();
                  }}
                  className="absolute p-[2px] rounded-[32px] bg-gradient-to-b from-red-500/40 via-rose-300/30 to-amber-200/40 shadow-2xl cursor-pointer text-left overflow-hidden select-none"
                  style={{ width, height }}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="bg-white/95 backdrop-blur-2xl rounded-[30px] p-6 sm:p-8 flex flex-col justify-between h-full w-full relative">
                    
                    {/* Background Decorative Quote Watermark */}
                    <Quote className="absolute right-4 top-4 w-20 h-20 text-red-500/5 pointer-events-none" />

                    <div>
                      {/* Top Bar: Solution Tag & ROI Metric Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-semibold font-[Matter]">
                          <TagIcon className="w-3.5 h-3.5" />
                          {item.solution}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold font-mono">
                          <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          {item.roi}
                        </span>
                      </div>

                      {/* Rating Stars & Verified Check */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Client
                        </span>
                      </div>

                      {/* Review Quote Text */}
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-light font-poppins mb-4 relative z-10 line-clamp-6">
                        "{item.quote}"
                      </p>
                    </div>

                    {/* Client Profile Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-red-500/30 shadow-md shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500 font-light mt-0.5">
                            {item.role}
                          </p>
                        </div>
                      </div>

                      <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600 shadow-sm">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Carousel Controls & Dot Indicators */}
        <div className="flex items-center justify-center gap-6 mt-4 sm:mt-8 z-50">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-600 flex items-center justify-center shadow-md transition-all transform hover:scale-105 active:scale-95"
            aria-label="Previous Review"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex justify-center gap-2.5">
            {reviewsList.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${index === activeIndex ? "w-8 bg-red-600 shadow-sm shadow-red-600/30" : "w-3 bg-gray-200 hover:bg-gray-300"
                  }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-600 flex items-center justify-center shadow-md transition-all transform hover:scale-105 active:scale-95"
            aria-label="Next Review"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
