"use client";

import { ArrowDownAZ, Search, X } from "lucide-react";

export default function LeadFilters({
  query,
  setQuery,
  leadSortOrder,
  setLeadSortOrder,
  leadAlphabetFilter,
  setLeadAlphabetFilter,
  setLeadPage,
}) {
  return (
    <div className="p-2.5 min-[360px]:p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs space-y-2.5 sm:space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads alphabetically by name, phone, email, service..."
            className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-1 shrink-0 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl text-[11px] sm:text-xs font-semibold overflow-x-auto no-scrollbar">
          <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-neutral-400 px-1 sm:px-1.5 flex items-center gap-1 select-none shrink-0">
            <ArrowDownAZ className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Sort:</span>
          </span>
          <button
            type="button"
            onClick={() => setLeadSortOrder("asc")}
            className={`px-1.5 min-[360px]:px-2 sm:px-2.5 py-1 rounded-lg transition select-none cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
              leadSortOrder === "asc"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Sort Alphabetically A to Z"
          >
            <span className="truncate">A to Z</span>
          </button>
          <button
            type="button"
            onClick={() => setLeadSortOrder("desc")}
            className={`px-1.5 min-[360px]:px-2 sm:px-2.5 py-1 rounded-lg transition select-none cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
              leadSortOrder === "desc"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Sort Alphabetically Z to A"
          >
            <span className="truncate">Z to A</span>
          </button>
          <button
            type="button"
            onClick={() => setLeadSortOrder("default")}
            className={`px-1.5 sm:px-2 py-1 rounded-lg transition select-none cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
              leadSortOrder === "default"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Default order (Newest first)"
          >
            <span className="truncate">Default</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100 dark:border-[#2e2619]">
        <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider shrink-0 mr-1 select-none">
          A-Z:
        </span>
        {["all", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"].map((char) => {
          const isSelected = leadAlphabetFilter === char;

          return (
            <button
              key={char}
              type="button"
              onClick={() => {
                setLeadAlphabetFilter(isSelected && char !== "all" ? "all" : char);
                setLeadPage(1);
              }}
              className={`min-w-[24px] sm:min-w-[26px] h-6.5 sm:h-7 px-1 sm:px-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold shrink-0 transition flex items-center justify-center gap-0.5 select-none ${
                isSelected
                  ? "bg-orange-600 text-white shadow-2xs scale-105 cursor-pointer"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 cursor-pointer"
              }`}
              title={
                char === "all"
                  ? "Show all leads"
                  : `Filter leads starting with "${char}"`
              }
            >
              <span>{char === "all" ? "All" : char}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
