"use client";

import React from "react";
import { Search, Calendar, RotateCcw } from "lucide-react";
import { DateFilterSkeleton } from "../shared/CrmSkeletons";

export default function CrmDateFilterBar({
  viewMode = "leads",
  query = "",
  setQuery = () => {},
  dateFilter = "all",
  setDateFilter = () => {},
  selectedDate = "",
  setSelectedDate = () => {},
  customDateRange = { from: "", to: "" },
  setCustomDateRange = () => {},
  isCurrentViewLoading = false,
}) {
  return (
    <>
      {/* Commercials Search Toolbar */}
      {viewMode === "commercials" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quotations, proposals, agreements by title, client..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {/* Date Filter Toolbar (Desktop, Laptop & Tablet: hidden on mobile app view) */}
      {viewMode !== "reports" && (
        isCurrentViewLoading ? (
          <div className="hidden md:block">
            <DateFilterSkeleton />
          </div>
        ) : (
          <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-neutral-400">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Date Filter</span>
              {dateFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter("all");
                    setSelectedDate("");
                    setCustomDateRange({ from: "", to: "" });
                  }}
                  className="ml-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                ["all", "All"],
                ["today", "Today"],
                ["yesterday", "Yesterday"],
                ["date", "Date"],
                ["custom", "Custom"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDateFilter(value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
                    dateFilter === value
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
              {dateFilter === "date" && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  aria-label="Select exact date"
                />
              )}
              {dateFilter === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    aria-label="From date"
                  />
                  <span className="text-xs text-gray-400">to</span>
                  <input
                    type="date"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    aria-label="To date"
                  />
                </div>
              )}
            </div>
          </div>
        )
      )}
    </>
  );
}
