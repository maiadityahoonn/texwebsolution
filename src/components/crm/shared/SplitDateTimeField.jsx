"use client";

import { Calendar, Clock } from "lucide-react";
import {
  DEFAULT_REMINDER_MINUTES,
  REMINDER_OPTIONS,
  TIME_HOUR_OPTIONS,
  TIME_MINUTE_OPTIONS,
  datePart,
  timeParts12,
  combineDateTimeParts,
  combineTime12Parts,
} from "./dateTimeUtils";

export default function SplitDateTimeField({
  label = "Schedule",
  value,
  onChange,
  required = false,
  reminderValue,
  onReminderChange,
  showReminder = true,
  className = "",
}) {
  const selectedTime = timeParts12(value);
  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 dark:bg-[#1a1712]/70 border border-gray-200/80 dark:border-[#3a3020] space-y-3 ${className}`}>
      {label ? (
        <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-neutral-200 text-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Date Field */}
        <div className="sm:col-span-5 space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Date {required ? "*" : ""}
          </span>
          <input
            type="date"
            required={required}
            value={datePart(value)}
            onChange={(e) => onChange?.(combineDateTimeParts(value, "date", e.target.value))}
            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-xs font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs"
          />
        </div>

        {/* Time Field */}
        <div className="sm:col-span-7 space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Time (12-Hour) {required ? "*" : ""}
          </span>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,72px)] gap-1.5 items-center h-10">
            <select
              required={required}
              value={selectedTime.hour}
              onChange={(e) => onChange?.(combineTime12Parts(value, { hour: e.target.value }))}
              aria-label="Hour"
              className="w-full h-full px-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-center font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
            >
              {TIME_HOUR_OPTIONS.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <span className="text-gray-400 dark:text-neutral-500 font-black text-xs shrink-0">:</span>
            <select
              required={required}
              value={selectedTime.minute}
              onChange={(e) => onChange?.(combineTime12Parts(value, { minute: e.target.value }))}
              aria-label="Minute"
              className="w-full h-full px-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-center font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
            >
              {TIME_MINUTE_OPTIONS.map((minute) => (
                <option key={minute} value={minute}>{minute}</option>
              ))}
            </select>
            <select
              required={required}
              value={selectedTime.meridiem}
              onChange={(e) => onChange?.(combineTime12Parts(value, { meridiem: e.target.value }))}
              aria-label="AM or PM"
              className="w-full h-full px-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs text-center focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      {showReminder ? (
        <div className="space-y-1.5 pt-0.5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <Clock className="w-3 h-3 text-emerald-500" />
            <span>Reminder Notification</span>
          </span>
          <select
            value={Number(reminderValue ?? DEFAULT_REMINDER_MINUTES)}
            onChange={(e) => onReminderChange?.(Number(e.target.value))}
            className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
          >
            {REMINDER_OPTIONS.map(([minutes, labelText]) => (
              <option key={minutes} value={minutes}>{labelText}</option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
