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
  totalLettersCount,
  leadLetterCounts,
}) {
  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

        <div className="flex items-center gap-1.5 shrink-0 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <span className="text-[11px] text-gray-500 dark:text-neutral-400 px-1.5 flex items-center gap-1 select-none">
            <ArrowDownAZ className="w-3.5 h-3.5 text-orange-500" />
            <span>Sort:</span>
          </span>
          <button
            type="button"
            onClick={() => setLeadSortOrder("asc")}
            className={`px-2.5 py-1 rounded-lg transition select-none cursor-pointer ${
              leadSortOrder === "asc"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Sort Alphabetically A to Z"
          >
            A to Z
          </button>
          <button
            type="button"
            onClick={() => setLeadSortOrder("desc")}
            className={`px-2.5 py-1 rounded-lg transition select-none cursor-pointer ${
              leadSortOrder === "desc"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Sort Alphabetically Z to A"
          >
            Z to A
          </button>
          <button
            type="button"
            onClick={() => setLeadSortOrder("default")}
            className={`px-2 py-1 rounded-lg transition select-none cursor-pointer ${
              leadSortOrder === "default"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Default order (Newest first)"
          >
            Default
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100 dark:border-[#2e2619]">
        <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider shrink-0 mr-1 select-none">
          A-Z:
        </span>
        {["all", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"].map((char) => {
          const isSelected = leadAlphabetFilter === char;
          const count = char === "all" ? totalLettersCount : leadLetterCounts[char] || 0;
          const hasLeads = count > 0;

          return (
            <button
              key={char}
              type="button"
              onClick={() => {
                setLeadAlphabetFilter(isSelected && char !== "all" ? "all" : char);
                setLeadPage(1);
              }}
              disabled={char !== "all" && !hasLeads}
              className={`min-w-[26px] h-7 px-1.5 rounded-lg text-[11px] font-bold shrink-0 transition flex items-center justify-center gap-0.5 select-none ${
                isSelected
                  ? "bg-orange-600 text-white shadow-2xs scale-105 cursor-pointer"
                  : hasLeads
                  ? "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 cursor-pointer"
                  : "text-gray-300 dark:text-neutral-600 cursor-not-allowed opacity-35"
              }`}
              title={
                char === "all"
                  ? `All leads (${totalLettersCount})`
                  : hasLeads
                  ? `${count} lead(s) starting with "${char}"`
                  : `No leads starting with "${char}"`
              }
            >
              <span>{char === "all" ? "All" : char}</span>
              {isSelected && char !== "all" && (
                <span className="text-[9px] opacity-90">({count})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
