"use client";

import { Settings, X, Check } from "lucide-react";

export default function MeetingSettingsModal({
  show,
  onClose,
  defaultMeetLink,
  setDefaultMeetLink,
  onSave,
}) {
  if (!show) return null;

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-2 min-[360px]:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-3.5 min-[360px]:px-6 py-3 min-[360px]:py-4.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-gray-50 via-slate-50 to-transparent dark:from-slate-900/40 dark:via-transparent dark:to-transparent">
          <div className="flex items-center gap-2.5 min-[360px]:gap-3 min-w-0">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-2xl bg-gray-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-md shrink-0">
              <Settings className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm min-[360px]:text-base text-gray-900 dark:text-white truncate">Meeting Settings</h3>
              <p className="text-[11px] min-[360px]:text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate">Default Google Meet link used in pipeline meetings.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 min-[360px]:p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer shrink-0" aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3.5 min-[360px]:p-6 space-y-3 text-xs">
          <label className="block font-semibold text-gray-700 dark:text-neutral-200">Default Google Meet Link</label>
          <input
            type="url"
            required
            value={defaultMeetLink || ""}
            onChange={(e) => setDefaultMeetLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition shadow-2xs font-medium"
          />
          <p className="text-[11px] text-gray-500 dark:text-neutral-400">
            This link is automatically applied to all sales meetings and shown in the meetings table.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 min-[360px]:gap-3 px-3.5 min-[360px]:px-6 py-3 min-[360px]:py-4 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712]">
          <button
            type="button"
            onClick={() => setDefaultMeetLink("https://meet.google.com/new")}
            className="flex-1 sm:flex-initial text-center justify-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer whitespace-nowrap min-w-0"
          >
            <span className="truncate">Reset Default</span>
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 sm:flex-initial text-center justify-center px-3 min-[360px]:px-5 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-w-0"
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Save & Sync to All Meetings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
