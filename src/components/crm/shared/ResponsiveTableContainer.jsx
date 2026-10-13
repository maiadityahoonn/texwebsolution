"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ResponsiveTableContainer({ children, className = "" }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasMoved: false });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const overflowing = maxScroll > 6;
    setIsOverflowing(overflowing);
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(overflowing && scrollLeft < maxScroll - 6);
    setScrollProgress(maxScroll > 0 ? Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)) : 0);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const scrollByAmount = (amount) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const target = e.target;
    if (target.closest("button, a, input, select, textarea, [role='button']")) return;
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.isDown) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5;
    if (Math.abs(walk) > 3) {
      dragState.current.hasMoved = true;
      e.preventDefault();
    }
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    dragState.current.isDown = false;
    setIsDragging(false);
  };

  return (
    <div className="relative group/table-wrapper">
      {/* Top Quick Scroll Bar */}
      {isOverflowing && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-orange-50/90 dark:from-[#251e13] dark:via-[#1f190e] dark:to-[#251e13] border-b border-orange-200/50 dark:border-[#3a3020] text-xs select-none">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-orange-950 dark:text-orange-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="truncate">Horizontal scroll: swipe, drag or use arrows</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Visual Mini Progress Bar */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-orange-700 dark:text-orange-300 font-mono">
              <div className="w-16 h-1.5 bg-orange-200/70 dark:bg-[#3a3020] rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-150 rounded-full"
                  style={{ width: `${Math.max(15, scrollProgress)}%` }}
                />
              </div>
            </div>

            {/* Quick Scroll Left / Right Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollByAmount(-280)}
                disabled={!canScrollLeft}
                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-orange-200/70 dark:border-slate-700 text-gray-700 dark:text-neutral-200 hover:bg-orange-100 dark:hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                title="Scroll table left"
                aria-label="Scroll table left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount(280)}
                disabled={!canScrollRight}
                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-orange-200/70 dark:border-slate-700 text-gray-700 dark:text-neutral-200 hover:bg-orange-100 dark:hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                title="Scroll table right"
                aria-label="Scroll table right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Side Edge Scroll Buttons */}
      {isOverflowing && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-280)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-[#211d14]/95 text-gray-800 dark:text-white shadow-md border border-gray-200/80 dark:border-[#3a3020] flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-85 hover:opacity-100 cursor-pointer"
          title="Scroll Left"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {isOverflowing && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(280)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-[#211d14]/95 text-gray-800 dark:text-white shadow-md border border-gray-200/80 dark:border-[#3a3020] flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-85 hover:opacity-100 cursor-pointer"
          title="Scroll Right"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* The Scrollable Viewport */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`overflow-x-auto table-scroll ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"} ${className}`}
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}
