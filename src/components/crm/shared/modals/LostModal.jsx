"use client";

import { XCircle, X } from "lucide-react";
import { STAGE_LOSS_REASONS } from "../leadUtils";

export default function LostModal({
  show,
  target,
  onClose,
  onSubmit,
  form,
  setForm,
}) {
  if (!show || !target) return null;

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-rose-50/70 via-red-50/25 to-transparent dark:from-rose-950/25 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                Mark as Closed Lost
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate max-w-xs sm:max-w-sm">
                Target: <span className="font-semibold text-gray-800 dark:text-slate-200">{target.item?.name || target.item?.title}</span> ({target.type === "deal" ? "Pipeline Deal" : "Inbound Lead"})
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
          {/* 1. Stage where deal was lost */}
          <div>
            <label className="block font-bold mb-1.5 text-gray-700 dark:text-neutral-300">
              Where was this deal lost? (Drop-Off Stage) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "contacted", label: "Contact", desc: "First Call / Outreach" },
                { id: "meeting", label: "Meeting", desc: "Post Discovery / Demo" },
                { id: "proposal", label: "Quotation", desc: "Quotation Sent" },
                { id: "negotiation", label: "Negotiation", desc: "Final Terms" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    const newStage = st.id;
                    const newReasons = STAGE_LOSS_REASONS[newStage] || STAGE_LOSS_REASONS.contacted;
                    setForm({
                      ...(form || {}),
                      stage: newStage,
                      reason: newReasons[0],
                    });
                  }}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                    form?.stage === st.id
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold shadow-2xs"
                      : "border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="text-xs font-bold">{st.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Primary Loss Reason */}
          <div>
            <label className="block font-bold mb-1 text-gray-700 dark:text-neutral-300">
              Primary Loss Reason *
            </label>
            <select
              value={form?.reason || ""}
              onChange={(e) => setForm({ ...(form || {}), reason: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition shadow-2xs"
            >
              {(STAGE_LOSS_REASONS[form?.stage || "contacted"] || STAGE_LOSS_REASONS.contacted).map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Competitor & Re-Nurture Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold mb-1 text-gray-700 dark:text-neutral-300">
                Competitor Name (Optional)
              </label>
              <input
                type="text"
                value={form?.competitor_name || ""}
                onChange={(e) => setForm({ ...(form || {}), competitor_name: e.target.value })}
                placeholder="e.g. Local Agency / Wix / Freelancer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-gray-900 dark:text-white transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700 dark:text-neutral-300">
                Re-Nurture Cadence
              </label>
              <select
                value={form?.re_nurture_days || "30"}
                onChange={(e) => setForm({ ...(form || {}), re_nurture_days: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-gray-900 dark:text-white font-medium transition shadow-2xs"
              >
                <option value="30">Re-engage after 30 days</option>
                <option value="60">Re-engage after 60 days (Quarterly)</option>
                <option value="90">Re-engage after 90 days (New Budget)</option>
                <option value="none">Do Not Nurture (Spam / Unqualified)</option>
              </select>
            </div>
          </div>

          {/* 4. Notes & Feedback */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-neutral-300">
              Loss Notes & Context
            </label>
            <textarea
              rows={3}
              value={form?.notes || ""}
              onChange={(e) => setForm({ ...(form || {}), notes: e.target.value })}
              placeholder="Why did they decline? What budget did they expect? Any key objections raised?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-gray-900 dark:text-white transition shadow-2xs text-xs resize-y font-normal"
            />
          </div>
        </div>

        {/* Footer Buttons */}
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
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md shadow-rose-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Confirm & Mark as Lost</span>
          </button>
        </div>
      </form>
    </div>
  );
}
