"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, Check, RotateCcw } from "lucide-react";

export default function CrmDateFilterDropdown({
  dateFilter = "all",
  setDateFilter = () => {},
  selectedDate = "",
  setSelectedDate = () => {},
  customDateRange = { from: "", to: "" },
  setCustomDateRange = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Only close if not clicking inside the portaled mobile modal
        const mobileModal = document.getElementById("crm-date-filter-mobile-modal");
        if (mobileModal && mobileModal.contains(event.target)) {
          return;
        }
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const isFiltered = dateFilter !== "all";

  const getActiveFilterLabel = () => {
    switch (dateFilter) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "date":
        return selectedDate
          ? new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : "Date";
      case "custom":
        return customDateRange.from ? "Custom" : "Range";
      default:
        return "All";
    }
  };

  const handleSelectPreset = (value) => {
    setDateFilter(value);
    if (value !== "date" && value !== "custom") {
      setIsOpen(false);
    }
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setDateFilter("all");
    setSelectedDate("");
    setCustomDateRange({ from: "", to: "" });
    setIsOpen(false);
  };

  const popoverBody = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
          <Calendar className="w-3.5 h-3.5 text-orange-500" />
          <span>Date Filter</span>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[10.5px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          ["all", "All Time"],
          ["today", "Today"],
          ["yesterday", "Yesterday"],
          ["date", "Exact Date"],
          ["custom", "Custom Range"],
        ].map(([value, label], idx) => {
          const isSelected = dateFilter === value;
          const isWide = idx === 4;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleSelectPreset(value)}
              className={`h-8 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border cursor-pointer whitespace-nowrap min-w-0 ${
                isWide ? "col-span-2 min-[360px]:col-span-2" : "col-span-1"
              } ${
                isSelected
                  ? "bg-orange-600 text-white border-orange-600 shadow-2xs"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 border-gray-200/80 dark:border-slate-700/80 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 shrink-0" />}
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Exact Date Input */}
      {dateFilter === "date" && (
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1">
          <label className="text-[10.5px] font-bold text-gray-600 dark:text-neutral-400 block">
            Choose Specific Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            aria-label="Select exact date"
          />
        </div>
      )}

      {/* Custom Date Range Inputs */}
      {dateFilter === "custom" && (
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
          <label className="text-[10.5px] font-bold text-gray-600 dark:text-neutral-400 block">
            Select Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-gray-400 block mb-0.5">From</span>
              <input
                type="date"
                value={customDateRange.from}
                onChange={(e) =>
                  setCustomDateRange({ ...customDateRange, from: e.target.value })
                }
                className="w-full px-2 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block mb-0.5">To</span>
              <input
                type="date"
                value={customDateRange.to}
                onChange={(e) =>
                  setCustomDateRange({ ...customDateRange, to: e.target.value })
                }
                className="w-full px-2 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Close Button */}
      <div className="pt-1 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold cursor-pointer transition shadow-2xs"
        >
          Done
        </button>
      </div>
    </>
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Date Filter Trigger Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative h-7.5 sm:h-8.5 w-7.5 sm:w-8.5 rounded-lg sm:rounded-xl border flex items-center justify-center cursor-pointer transition shadow-2xs active:scale-95 shrink-0 ${
          isFiltered
            ? "border-orange-500/80 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20"
            : "border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
        }`}
        title={isFiltered ? `Date Filter Active (${getActiveFilterLabel()})` : "Filter by Date"}
        aria-label="Filter by Date"
        aria-expanded={isOpen}
      >
        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2] shrink-0" />
        {isFiltered && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-[#111113]" />
        )}
      </button>

      {/* Desktop Popover (inline, anchored right below button) */}
      {isOpen && (
        <div className="hidden sm:block absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-2xl p-3.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 text-xs">
          {popoverBody}
        </div>
      )}

      {/* Mobile Portal Popover (Portaled directly to document.body with z-[99999] so NO card or header can EVER overlap it) */}
      {isOpen && isMounted && typeof document !== "undefined"
        ? createPortal(
            <div
              id="crm-date-filter-mobile-modal"
              className="fixed inset-0 z-[99999] sm:hidden flex items-start justify-center pt-24 px-3"
            >
              {/* Mobile Backdrop */}
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              {/* Mobile Centered Card */}
              <div className="relative z-10 w-full max-w-[340px] rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-2xl p-3.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 text-xs">
                {popoverBody}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
