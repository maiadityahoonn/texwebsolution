"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LeadPagination({
  leadPageStart,
  leadPageEnd,
  leadTotalForPagination,
  leadsPerPage,
  setLeadsPerPage,
  setLeadPage,
  safeLeadPage,
  leadPageCount,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#211d14]/60 text-xs">
      <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
        <span>Showing</span>
        <span className="font-bold text-gray-800 dark:text-white">{leadPageStart}</span>
        <span>to</span>
        <span className="font-bold text-gray-800 dark:text-white">{leadPageEnd}</span>
        <span>of</span>
        <span className="font-bold text-gray-800 dark:text-white">{leadTotalForPagination}</span>
        <span>leads</span>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
          <span className="hidden xs:inline">Rows per page:</span>
          <select
            value={leadsPerPage}
            onChange={(e) => {
              setLeadsPerPage(Number(e.target.value));
              setLeadPage(1);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
            aria-label="Leads per page"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLeadPage((page) => Math.max(1, page - 1))}
            disabled={safeLeadPage <= 1}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: leadPageCount }, (_, index) => index + 1)
            .filter((page) => {
              if (leadPageCount <= 5) return true;
              if (page === 1 || page === leadPageCount) return true;
              return Math.abs(page - safeLeadPage) <= 1;
            })
            .reduce((acc, page, index, pages) => {
              if (index > 0 && page - pages[index - 1] > 1) {
                acc.push("...");
              }
              acc.push(page);
              return acc;
            }, [])
            .map((item, index) =>
              item === "..." ? (
                <span key={`ellipsis-${index}`} className="px-1 text-gray-400 font-bold select-none">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${item}`}
                  type="button"
                  onClick={() => setLeadPage(item)}
                  className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition ${
                    safeLeadPage === item
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
            onClick={() => setLeadPage((page) => Math.min(leadPageCount, page + 1))}
            disabled={safeLeadPage >= leadPageCount}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
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
