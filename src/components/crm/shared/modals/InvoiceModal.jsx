"use client";

import { DollarSign, X } from "lucide-react";
import WhatsAppIcon from "../WhatsAppIcon";

export default function InvoiceModal({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  deal,
  onMilestoneChange,
}) {
  if (!show) return null;

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
        className="w-full max-w-xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-purple-50/70 via-indigo-50/25 to-transparent dark:from-purple-950/25 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Generate Sales Invoice</h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Create and issue an official tax invoice linked to this pipeline deal</p>
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
          {/* Linked Deal Context Card */}
          {deal && (
            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Linked Deal</div>
                <div className="font-bold text-xs text-gray-900 dark:text-white">
                  {deal?.title || deal?.client_name || "Client Deal"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400">Deal Value</div>
                <div className="font-black text-xs text-purple-700 dark:text-purple-300">
                  ₹{Number(deal?.deal_value || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Invoice Number *</label>
              <input
                type="text"
                required
                value={form?.invoice_number || ""}
                onChange={(e) => setForm({ ...(form || {}), invoice_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Milestone Stage</label>
              <select
                value={form?.milestone_type || "advance"}
                onChange={(e) => onMilestoneChange?.(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <option value="advance">Advance (40%)</option>
                <option value="milestone">Sprint Milestone (30%)</option>
                <option value="final">Final Delivery (30%)</option>
                <option value="full">Full Payment (100%)</option>
                <option value="monthly_retainer">Monthly Retainer</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Invoice Title / Description *</label>
              <input
                type="text"
                required
                value={form?.title || ""}
                onChange={(e) => setForm({ ...(form || {}), title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Subtotal (Excl. Tax) ₹ *</label>
              <input
                type="number"
                required
                value={form?.amount ?? ""}
                onChange={(e) => setForm({ ...(form || {}), amount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Due Date</label>
              <input
                type="date"
                value={form?.due_date || ""}
                onChange={(e) => setForm({ ...(form || {}), due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              />
            </div>

            {/* Tax & Total Calculation Summary */}
            <div className="sm:col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200/70 dark:border-slate-700/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-neutral-400">
                <span>Subtotal Amount:</span>
                <span className="font-mono font-semibold">₹{(Number(form?.amount) || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-neutral-400">
                <span>GST (18% Standard):</span>
                <span className="font-mono font-semibold">₹{Math.round((Number(form?.amount) || 0) * 0.18).toLocaleString("en-IN")}</span>
              </div>
              <div className="pt-1.5 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                <span>Total Invoiced (Inc. Tax):</span>
                <span className="font-mono text-sm text-purple-600 dark:text-purple-400">
                  ₹{Math.round((Number(form?.amount) || 0) * 1.18).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Notes & Payment Terms</label>
              <textarea
                rows={2}
                value={form?.notes || ""}
                onChange={(e) => setForm({ ...(form || {}), notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            <span>Issue Invoice</span>
          </button>
          <button
            type="button"
            onClick={(e) => onSubmit(e, true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Issue & WhatsApp</span>
          </button>
        </div>
      </form>
    </div>
  );
}
