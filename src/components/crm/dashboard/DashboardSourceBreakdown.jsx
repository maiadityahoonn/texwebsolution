"use client";

import React from "react";
import { PieChart, ArrowRight, DollarSign } from "lucide-react";
import { formatINR } from "./dashboardUtils";

export default function DashboardSourceBreakdown({
  metrics,
  dateFilter = "all",
  onNavigateSection = () => {},
}) {
  const { sourceRows, filteredLeads } = metrics;
  const totalLeads = Math.max(filteredLeads.length, 1);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            <PieChart className="w-4 h-4 text-emerald-500" />
            <span>Lead Source ROI & Quality</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
            Acquisition channels performance for selected date filter
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateSection("sales_reports", { dateFilter })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition cursor-pointer self-start sm:self-auto"
        >
          <span>Reports Breakdown</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {sourceRows.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-gray-50/50 dark:bg-[#211d14] border border-dashed border-gray-200 dark:border-[#3a3020]">
          <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
          <div className="text-xs font-bold text-gray-700 dark:text-neutral-300">
            No source metrics available
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Inbound channels will appear here once inquiries are logged.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sourceRows.map((row) => {
            const percentage = Math.round((row.leads / totalLeads) * 100);

            return (
              <div
                key={row.source}
                className="p-3 rounded-xl bg-gray-50/60 dark:bg-[#1f1a12] border border-gray-100 dark:border-[#32291a]"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                    {row.source}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-semibold">{row.leads} leads</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {row.won} won
                    </span>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                      {formatINR(row.value)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
