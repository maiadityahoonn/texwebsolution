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
  if (viewMode !== "commercials") return null;

  return (
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
  );
}
