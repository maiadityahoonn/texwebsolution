"use client";

import { TrendingUp, Briefcase, IndianRupee, Layers, FileText, Video, Users, MessageSquare, Plus, X } from "lucide-react";
import SearchableLeadSelect from "../SearchableLeadSelect";
import SplitDateTimeField from "../SplitDateTimeField";
import DurationSelectField from "../DurationSelectField";

export default function AddDealModal({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  leads = [],
}) {
  if (!show) return null;

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-2 min-[360px]:p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xl max-h-[85vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 min-[360px]:px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-emerald-50/70 via-teal-50/25 to-transparent dark:from-emerald-950/25 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-2.5 min-[360px]:gap-3">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
              <TrendingUp className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">New Sales Pipeline Deal</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Add an active commercial opportunity with value forecast</p>
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

        {/* Form Content Body */}
        <div className="p-3.5 min-[360px]:p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
              <span>Deal Title</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form?.title || ""}
              onChange={(e) => setForm({ ...(form || {}), title: e.target.value })}
              placeholder="e.g. Acme Corp - E-Commerce Website & Portal"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                <span>Average Deal Value (INR)</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={form?.deal_value || ""}
                  onChange={(e) => setForm({ ...(form || {}), deal_value: e.target.value })}
                  placeholder="100000"
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 font-mono font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pipeline Stage</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Contacted</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Service</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form?.service || ""}
                onChange={(e) => setForm({ ...(form || {}), service: e.target.value })}
                required
                placeholder="e.g. Web Development"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <DurationSelectField
                label="Meeting Duration"
                value={form?.duration_minutes || 60}
                onChange={(value) => setForm({ ...(form || {}), duration_minutes: value })}
              />
            </div>
          </div>

          {/* Meeting Schedule */}
          <div>
            <SplitDateTimeField
              label="Meeting Schedule"
              value={form?.meeting_scheduled_at || ""}
              onChange={(value) => setForm({ ...(form || {}), meeting_scheduled_at: value })}
              reminderValue={form?.reminder_before_minutes}
              onReminderChange={(value) => setForm({ ...(form || {}), reminder_before_minutes: value })}
            />
          </div>

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
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-mono text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <Users className="w-3.5 h-3.5 text-orange-500" />
              <span>Linked Lead</span>
              <span className="text-red-500">*</span>
            </label>
            {form?.lead_id ? (
              <div className="px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-semibold flex items-center justify-between">
                <span className="truncate">{leads.find((l) => l.id === form.lead_id)?.name || "Selected lead"}</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...(form || {}), lead_id: "" })}
                  className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <SearchableLeadSelect
                leads={leads}
                value={form?.lead_id || ""}
                onChange={(selId, matchedLead) => {
                  setForm({
                    ...(form || {}),
                    lead_id: selId,
                    title: form?.title || (matchedLead ? `${matchedLead.name} - ${matchedLead.service || "Project"}` : ""),
                    service: matchedLead?.service || form?.service,
                  });
                }}
                placeholder="Search lead by name, phone..."
              />
            )}
            {!form?.lead_id && (
              <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                Every pipeline deal must be connected to a lead.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
              <span>Deal Notes / Strategy</span>
            </label>
            <textarea
              rows={2}
              value={form?.notes || ""}
              onChange={(e) => setForm({ ...(form || {}), notes: e.target.value })}
              placeholder="Key deliverables, client expectations, stakeholders involved..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-normal text-xs resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 min-[360px]:gap-2.5 px-3 min-[360px]:px-5 py-2.5 min-[360px]:py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial text-center justify-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer whitespace-nowrap min-w-0"
          >
            <span className="truncate">Cancel</span>
          </button>
          <button
            type="submit"
            disabled={!form?.lead_id}
            className="flex-1 sm:flex-initial text-center justify-center px-3 min-[360px]:px-5 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Create Pipeline Deal</span>
          </button>
        </div>
      </form>
    </div>
  );
}
