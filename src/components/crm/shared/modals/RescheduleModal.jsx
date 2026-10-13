"use client";

import { RotateCcw, Video, FileText, X } from "lucide-react";
import SplitDateTimeField from "../SplitDateTimeField";

export default function RescheduleModal({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  rescheduleTarget,
  salesMeetingRescheduleTarget,
}) {
  if (!show || (!rescheduleTarget && !salesMeetingRescheduleTarget)) return null;

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-amber-50/60 via-orange-50/20 to-transparent dark:from-amber-950/25 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                {salesMeetingRescheduleTarget ? "Reschedule Meeting" : "Reschedule Follow-up"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate max-w-xs">
                {(salesMeetingRescheduleTarget || rescheduleTarget)?.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
          <div>
            <SplitDateTimeField
              label={salesMeetingRescheduleTarget ? "New Meeting Schedule" : "New Due Schedule"}
              required
              value={form?.due_at || ""}
              onChange={(value) => setForm({ ...(form || {}), due_at: value })}
              reminderValue={form?.reminder_before_minutes}
              onReminderChange={(value) => setForm({ ...(form || {}), reminder_before_minutes: value })}
            />
          </div>

          {salesMeetingRescheduleTarget && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <Video className="w-3.5 h-3.5 text-blue-500" />
                <span>Google Meet Link</span>
              </label>
              <input
                type="url"
                value={form?.meeting_link || ""}
                onChange={(e) => setForm({ ...(form || {}), meeting_link: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-2xs font-medium"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Reschedule Notes / Reason</span>
            </label>
            <textarea
              rows={3}
              value={form?.notes || ""}
              onChange={(e) => setForm({ ...(form || {}), notes: e.target.value })}
              placeholder="e.g. Client requested a different time slot due to meeting conflict..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-2xs font-normal text-xs resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Confirm Reschedule</span>
          </button>
        </div>
      </form>
    </div>
  );
}
