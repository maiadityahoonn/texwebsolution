"use client";

import { Pencil, Briefcase, IndianRupee, FileText, Layers, Calendar, XCircle, MessageSquare, Check, X } from "lucide-react";

export default function EditDealModal({
  deal,
  onClose,
  onSubmit,
  form,
  setForm,
}) {
  if (!deal) return null;

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
        <div className="flex items-center justify-between px-3.5 min-[360px]:px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-orange-50/70 via-amber-50/25 to-transparent dark:from-orange-950/25 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-2.5 min-[360px]:gap-3">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <Pencil className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Edit Deal Details</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Update pipeline stages, value, service, and closing details</p>
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
        <div className="p-3.5 min-[360px]:p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
          {/* Deal Title */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <Briefcase className="w-3.5 h-3.5 text-orange-500" />
              <span>Deal Title</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form?.title || ""}
              onChange={(e) => setForm({ ...(form || {}), title: e.target.value })}
              placeholder="e.g. Acme Corp - E-Commerce Platform"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
            />
          </div>

          {/* Deal Value & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                <span>Deal Value (₹)</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={form?.deal_value || ""}
                onChange={(e) => setForm({ ...(form || {}), deal_value: e.target.value })}
                placeholder="100000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-mono font-bold text-gray-900 dark:text-white transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Service Required</span>
              </label>
              <select
                value={form?.service || "Web Development"}
                onChange={(e) => setForm({ ...(form || {}), service: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white font-medium transition shadow-2xs"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="E-Commerce Development">E-Commerce Development</option>
                <option value="Custom CRM / ERP">Custom CRM / ERP</option>
                <option value="SEO & Digital Marketing">SEO & Digital Marketing</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="AI Automation">AI Automation</option>
                <option value="Full Stack Solution">Full Stack Solution</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Pipeline Stage & Expected Close Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pipeline Stage</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={form?.pipeline_stage || "contacted"}
                onChange={(e) => setForm({ ...(form || {}), pipeline_stage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white font-semibold transition shadow-2xs"
              >
                <option value="contacted">Contacted</option>
                <option value="qualified">Meeting / Qualified</option>
                <option value="proposal">Quotation / Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Expected Close Date</span>
              </label>
              <input
                type="date"
                value={form?.expected_close_date || ""}
                onChange={(e) => setForm({ ...(form || {}), expected_close_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Loss Reason (if stage is closed_lost) */}
          {form?.pipeline_stage === "closed_lost" && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                <XCircle className="w-3.5 h-3.5" />
                <span>Loss Reason / Root Cause</span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={form?.loss_reason || ""}
                onChange={(e) => setForm({ ...(form || {}), loss_reason: e.target.value })}
                placeholder="e.g. Budget out of range, chosen competitor, requirements dropped..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-gray-900 dark:text-white transition shadow-2xs text-xs resize-y"
              />
            </div>
          )}

          {/* Notes & Strategy */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
              <span>Deal Notes / Strategy</span>
            </label>
            <textarea
              rows={3}
              value={form?.notes || ""}
              onChange={(e) => setForm({ ...(form || {}), notes: e.target.value })}
              placeholder="Key deliverables, client expectations, scope details..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-normal text-xs resize-y"
            />
          </div>
        </div>

        {/* Footer Buttons */}
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
            className="flex-1 sm:flex-initial text-center justify-center px-3 min-[360px]:px-5 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span className="truncate">Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
