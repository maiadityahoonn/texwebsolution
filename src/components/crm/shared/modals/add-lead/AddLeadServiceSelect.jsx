"use client";

import { Briefcase, CheckCircle2 } from "lucide-react";
import { SERVICE_OPTIONS } from "@/components/public/landing/quoteFormConstants";

export default function AddLeadServiceSelect({
  currentService,
  isCustomService,
  customService,
  onServiceSelect,
  onCustomServiceToggle,
  onCustomServiceChange,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-neutral-200 text-xs font-[Matter]">
          <Briefcase className="w-3.5 h-3.5 text-red-500" />
          <span>Service Required</span>
          <span className="text-red-500">*</span>
        </label>
        <span className="text-[10px] text-gray-400 dark:text-neutral-500">Pick standard or custom</span>
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-1.5 min-[360px]:gap-2">
        {SERVICE_OPTIONS.map((srv) => {
          const isSelected = !isCustomService && currentService === srv;
          return (
            <button
              key={srv}
              type="button"
              onClick={() => onServiceSelect(srv)}
              className={`px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition border flex items-center justify-between gap-1.5 cursor-pointer min-w-0 ${
                isSelected
                  ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 shadow-2xs font-bold"
                  : "bg-gray-50/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="truncate">{srv}</span>
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onCustomServiceToggle}
          className={`px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition border flex items-center justify-between gap-1.5 cursor-pointer min-w-0 ${
            isCustomService
              ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 shadow-2xs font-bold"
              : "bg-gray-50/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
        >
          <span className="truncate">Custom / Other...</span>
          {isCustomService && <CheckCircle2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />}
        </button>
      </div>

      {isCustomService && (
        <input
          type="text"
          autoFocus
          placeholder="Type custom service name..."
          value={customService}
          onChange={(e) => onCustomServiceChange(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-red-300 dark:border-red-900/60 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 text-gray-900 dark:text-white text-xs font-medium transition"
        />
      )}
    </div>
  );
}
