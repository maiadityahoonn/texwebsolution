"use client";

import React from "react";
import { Search, Calendar } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quotations, proposals, agreements by title, client..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}

      {/* Date Filter Toolbar */}
      {viewMode !== "reports" && (
        isCurrentViewLoading ? (
          <DateFilterSkeleton />
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-neutral-400">
              <Calendar className="w-4 h-4" />
              <span>Date Filter</span>
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    dateFilter === value
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400"
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
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  aria-label="Select exact date"
                />
              )}
              {dateFilter === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                  <input
                    type="date"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
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
