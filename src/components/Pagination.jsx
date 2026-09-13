"use client";

import React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  if (currentPage > 3) {
    pages.push("...");
  }
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) {
    pages.push("...");
  }
  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 20, 50, 100],
  itemName = "records",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="bg-transparent dark:bg-transparent px-3 py-2 border-t border-gray-200/70 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 dark:text-slate-400 gap-2 font-sans">
      {/* Left: Total Records & Rows per page */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Total {itemName}:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-transparent dark:bg-transparent border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold text-xs shadow-none">
            {totalItems}
          </span>
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 dark:text-slate-400 text-xs font-medium">Per page:</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                if (onRowsPerPageChange) onRowsPerPageChange(Number(e.target.value));
                if (onPageChange) onPageChange(1);
              }}
              className="pl-2.5 pr-7 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs font-bold text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition cursor-pointer appearance-none shadow-none"
            >
              {rowsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Showing X - Y of Z */}
        {totalItems > 0 && (
          <span className="text-gray-400 dark:text-slate-500 text-[11px] hidden sm:inline">
            Showing <span className="font-semibold text-gray-700 dark:text-slate-300">{startIndex + 1}</span>–<span className="font-semibold text-gray-700 dark:text-slate-300">{endIndex}</span> of <span className="font-semibold text-gray-700 dark:text-slate-300">{totalItems}</span>
          </span>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(1)}
          disabled={safePage <= 1}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-gray-600 dark:text-slate-300 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-none cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Prev Page */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-gray-600 dark:text-slate-300 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-none cursor-pointer flex items-center gap-1 text-xs font-semibold"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, pIdx) => {
            if (p === "...") {
              return (
                <span key={`dots-${pIdx}`} className="px-1 text-gray-400 font-mono text-xs">
                  ...
                </span>
              );
            }
            const isActive = p === safePage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange && onPageChange(p)}
                disabled={isActive}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs"
                    : "border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-gray-700 dark:text-slate-300 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 shadow-none"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage >= totalPages}
          className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-gray-600 dark:text-slate-300 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-none cursor-pointer flex items-center gap-1 text-xs font-semibold"
          title="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(totalPages)}
          disabled={safePage >= totalPages}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-gray-600 dark:text-slate-300 hover:bg-gray-100/60 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-none cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
