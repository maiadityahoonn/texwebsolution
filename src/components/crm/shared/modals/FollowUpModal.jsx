"use client";

import { Phone, FileText, Users, MessageSquare, Briefcase, CheckCircle2, X } from "lucide-react";
import SearchableLeadSelect from "../SearchableLeadSelect";
import SplitDateTimeField from "../SplitDateTimeField";
import { findDealForRelationship } from "../crmRelationshipUtils";

export default function FollowUpModal({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  leads = [],
  deals = [],
}) {
  if (!show) return null;

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-2 min-[360px]:p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xl max-h-[85vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 min-[360px]:px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-blue-50/60 via-indigo-50/20 to-transparent dark:from-blue-950/25 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-2.5 min-[360px]:gap-3">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <Phone className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Create Sales Follow-up</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Schedule timely follow-up & track prospect responses</p>
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

        {/* Form Fields */}
        <div className="p-3.5 min-[360px]:p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Title</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form?.title || ""}
              onChange={(e) => setForm({ ...(form || {}), title: e.target.value })}
              placeholder="e.g. Follow up for quotation approval"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <Users className="w-3.5 h-3.5 text-orange-500" />
                <span>Lead</span>
                <span className="text-red-500">*</span>
              </label>
              <SearchableLeadSelect
                leads={leads}
                value={form?.lead_id || ""}
                onChange={(leadId, lead) => {
                  const linkedDeal = findDealForRelationship({ lead_id: leadId }, deals);
                  setForm({
                    ...(form || {}),
                    lead_id: leadId,
                    deal_id: linkedDeal?.id || "",
                    title: form?.title === "Follow up for quotation approval" || !form?.title
                      ? (lead ? `Follow up: ${lead.name}` : (form?.title || ""))
                      : form?.title,
                  });
                }}
                placeholder="Search by name, phone..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Channel</span>
              </label>
              <select
                value={form?.channel || "whatsapp"}
                onChange={(e) => setForm({ ...(form || {}), channel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs cursor-pointer"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
                <option value="meeting">In-Person / Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {form?.deal_id && (
            <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Linked Pipeline Deal (Read Only)</span>
              </div>
              <div className="font-semibold text-gray-800 dark:text-neutral-200 text-xs">
                {deals.find((deal) => deal.id === form.deal_id)?.title || "Selected pipeline deal"}
              </div>
            </div>
          )}

          <div>
            <SplitDateTimeField
              label="Due Schedule"
              required
              value={form?.due_at || ""}
              onChange={(value) => setForm({ ...(form || {}), due_at: value })}
              reminderValue={form?.reminder_before_minutes}
              onReminderChange={(value) => setForm({ ...(form || {}), reminder_before_minutes: value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Notes & Action Plan</span>
            </label>
            <textarea
              rows={3}
              value={form?.notes || ""}
              onChange={(e) => setForm({ ...(form || {}), notes: e.target.value })}
              placeholder="e.g. Call client to discuss revised quotation, milestone breakdown, and timeline confirmation..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs font-normal text-xs resize-y"
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
            disabled={!form?.lead_id && !form?.deal_id}
            className="flex-1 sm:flex-initial text-center justify-center px-3 min-[360px]:px-5 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Save Follow-up</span>
          </button>
        </div>
      </form>
    </div>
  );
}
