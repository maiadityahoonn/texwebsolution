"use client";

import { IndianRupee, Clock } from "lucide-react";
import { BUDGET_OPTIONS, TIMELINE_OPTIONS } from "@/components/public/landing/quoteFormConstants";

export default function AddLeadBudgetTimeline({
  currentBudget,
  isCustomBudget,
  customBudget,
  currentTimeline,
  onBudgetSelect,
  onCustomBudgetToggle,
  onCustomBudgetChange,
  onTimelineSelect,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
      {/* Budget Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-neutral-200 text-xs font-[Matter]">
            <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
            <span>Estimated Budget</span>
          </label>
          <span className="text-[10px] text-gray-400 dark:text-neutral-500">From Get Quote</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {BUDGET_OPTIONS.map((bgt) => {
            const isSelected = !isCustomBudget && currentBudget === bgt;
            return (
              <button
                key={bgt}
                type="button"
                onClick={() => onBudgetSelect(bgt)}
                className={`px-2 py-2 rounded-xl text-center text-[11px] font-semibold transition border cursor-pointer min-w-0 ${
                  isSelected
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-200 shadow-2xs font-bold"
                    : "bg-gray-50/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate block">{bgt}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Budget Toggle */}
        {isCustomBudget ? (
          <input
            type="text"
            autoFocus
            placeholder="e.g. ₹50,000 or $1,200..."
            value={customBudget}
            onChange={(e) => onCustomBudgetChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-amber-300 dark:border-amber-900/60 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden text-gray-900 dark:text-white text-xs font-medium transition"
          />
        ) : (
          <button
            type="button"
            onClick={onCustomBudgetToggle}
            className="text-[10.5px] font-semibold text-amber-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            + Enter custom negotiated amount
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-neutral-200 text-xs font-[Matter]">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Delivery Timeline</span>
          </label>
          <span className="text-[10px] text-gray-400 dark:text-neutral-500">Urgency</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {TIMELINE_OPTIONS.map((tml) => {
            const isSelected = currentTimeline === tml;
            return (
              <button
                key={tml}
                type="button"
                onClick={() => onTimelineSelect(tml)}
                className={`px-2 py-2 rounded-xl text-center text-[11px] font-semibold transition border cursor-pointer min-w-0 ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-2xs font-bold"
                    : "bg-gray-50/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate block">{tml}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
