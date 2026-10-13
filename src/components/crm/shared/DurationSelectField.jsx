"use client";

import { Clock } from "lucide-react";
import { DURATION_OPTIONS } from "./dateTimeUtils";

export default function DurationSelectField({ label = null, value, onChange, className = "" }) {
  return (
    <div className={className}>
      {label ? (
        <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200 mb-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{label}</span>
        </label>
      ) : null}
      <select
        value={Number(value || 60)}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer text-xs"
      >
        {DURATION_OPTIONS.map(([minutes, labelText]) => (
          <option key={minutes} value={minutes}>{labelText}</option>
        ))}
      </select>
    </div>
  );
}
