"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({
  label = "records",
  start = 0,
  end = 0,
  total = 0,
  page = 1,
  pageCount = 1,
  setPage,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-2.5 sm:px-4 py-2.5 sm:py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#211d14]/60 text-[11px] sm:text-xs">
      <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
        <span>Showing</span>
        <span className="font-bold text-gray-800 dark:text-white">{start}</span>
        <span>to</span>
        <span className="font-bold text-gray-800 dark:text-white">{end}</span>
        <span>of</span>
        <span className="font-bold text-gray-800 dark:text-white">{total}</span>
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-neutral-400 whitespace-nowrap">
          Page {page} of {pageCount}
        </span>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page <= 1}
            className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: pageCount }, (_, index) => index + 1)
            .filter((pageNumber) => {
              if (pageCount <= 5) return true;
              if (pageNumber === 1 || pageNumber === pageCount) return true;
              return Math.abs(pageNumber - page) <= 1;
            })
            .reduce((acc, pageNumber, index, pages) => {
              if (index > 0 && pageNumber - pages[index - 1] > 1) {
                acc.push("...");
              }
              acc.push(pageNumber);
              return acc;
            }, [])
            .map((item, index) =>
              item === "..." ? (
                <span key={`ellipsis-${index}`} className="px-0.5 sm:px-1 text-gray-400 font-bold select-none text-xs">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${item}`}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`min-w-[24px] sm:min-w-[28px] h-6.5 sm:h-7 px-1.5 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                    page === item
                      ? "bg-orange-600 text-white shadow-2xs"
                      : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {item}
                </button>
              )
            )}

          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
            disabled={page >= pageCount}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
