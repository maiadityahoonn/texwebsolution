"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function DealDetailsTabs({ tabs = [], activeTab, onChange }) {
  const scrollerRef = useRef(null);

  function scrollTabs(direction) {
    scrollerRef.current?.scrollBy({
      left: direction * 220,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative w-full min-w-0 border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#1a1711] shrink-0 overflow-hidden">
      <button
        type="button"
        onClick={() => scrollTabs(-1)}
        className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-1 text-gray-500 shadow-sm hover:text-orange-600 dark:border-slate-700 dark:bg-[#18150f]/95 dark:text-neutral-300 sm:flex"
        aria-label="Scroll tabs left"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <div
        ref={scrollerRef}
        className="flex min-w-0 max-w-full touch-pan-x snap-x items-center gap-1 min-[360px]:gap-1.5 overflow-x-scroll overflow-y-hidden scroll-smooth overscroll-x-contain px-1.5 min-[360px]:px-4 py-1.5 min-[360px]:py-2 pb-2.5 no-scrollbar sm:px-9"
        onWheel={(event) => {
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.currentTarget.scrollLeft += event.deltaY;
          }
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`snap-start px-2.5 min-[360px]:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 min-[360px]:gap-1.5 shrink-0 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white dark:bg-[#252017] text-orange-600 dark:text-orange-400 shadow-xs border border-orange-200/70 dark:border-orange-900/50"
                  : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] min-[360px]:text-[10px] font-extrabold ${
                    isActive
                      ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"
                      : "bg-gray-200/80 dark:bg-slate-800 text-gray-600 dark:text-neutral-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 capitalize truncate max-w-[80px]">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => scrollTabs(1)}
        className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-1 text-gray-500 shadow-sm hover:text-orange-600 dark:border-slate-700 dark:bg-[#18150f]/95 dark:text-neutral-300 sm:flex"
        aria-label="Scroll tabs right"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
