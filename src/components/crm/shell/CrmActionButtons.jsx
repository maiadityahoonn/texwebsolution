"use client";

import { Layers, Plus, RefreshCw, Settings } from "lucide-react";

export default function CrmActionButtons({
  viewMode,
  commercialScope,
  isRefreshing,
  refreshStatus,
  onRefresh,
  onAddLead,
  onAddDeal,
  onMetaImport,
  onFollowUp,
  onMeeting,
  onMeetingSettings,
  onCommercial,
  onInvoice,
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
      {viewMode === "leads" && (
        <>
          <button
            type="button"
            onClick={onAddLead}
            className="h-7.5 sm:h-8.5 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Lead"
            aria-label="Add Lead"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span><span className="hidden sm:inline">+ Add </span>Lead</span>
          </button>
          <button
            type="button"
            onClick={onAddDeal}
            className="h-7.5 sm:h-8.5 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Deal"
            aria-label="Add Deal"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span><span className="hidden sm:inline">+ Add </span>Deal</span>
          </button>
          <button
            type="button"
            onClick={onMetaImport}
            className="hidden md:inline-flex h-8.5 px-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
            title="Sync Meta/Instagram Inquiries"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
            <span>Meta Leads</span>
          </button>
        </>
      )}

      {viewMode === "pipeline" && (
        <>
          <button
            type="button"
            onClick={onAddDeal}
            className="h-7.5 sm:h-8.5 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Deal"
            aria-label="Add Deal"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span><span className="hidden sm:inline">+ Add </span>Deal</span>
          </button>
          <button
            type="button"
            onClick={onAddLead}
            className="h-7.5 sm:h-8.5 px-2 sm:px-3 rounded-lg sm:rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Lead"
            aria-label="Add Lead"
          >
            <Plus className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
            <span><span className="hidden sm:inline">+ Add </span>Lead</span>
          </button>
        </>
      )}

      {viewMode === "followups" && (
        <button
          type="button"
          onClick={onFollowUp}
          className="h-7.5 sm:h-8.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
          title="Schedule Follow-up"
          aria-label="Schedule Follow-up"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Follow-up</span>
        </button>
      )}

      {viewMode === "sales_meetings" && (
        <>
          <button
            type="button"
            onClick={onMeeting}
            className="h-7.5 sm:h-8.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            title="Schedule Meeting"
            aria-label="Schedule Meeting"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Meeting</span>
          </button>
          <button
            type="button"
            onClick={onMeetingSettings}
            className="hidden md:flex h-8.5 w-8.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-all shadow-2xs active:scale-95 cursor-pointer items-center justify-center"
            title="Meeting Link Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </>
      )}

      {viewMode === "commercials" && (
        <button
          type="button"
          onClick={onCommercial}
          className={`h-7.5 sm:h-8.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs text-white inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
            commercialScope === "agreement"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          }`}
          title={commercialScope === "agreement" ? "New Agreement" : "New Quotation"}
          aria-label={commercialScope === "agreement" ? "New Agreement" : "New Quotation"}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{commercialScope === "agreement" ? "Agreement" : "Quote"}</span>
        </button>
      )}

      {viewMode === "invoices" && (
        <button
          type="button"
          onClick={onInvoice}
          className="h-7.5 sm:h-8.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
          title="Create Invoice"
          aria-label="Create Invoice"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Invoice</span>
        </button>
      )}

      {viewMode === "clients" && (
        <button
          type="button"
          onClick={onAddDeal}
          className="h-7.5 sm:h-8.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
          title="Add Deal"
          aria-label="Add Deal"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Deal</span>
        </button>
      )}

      {viewMode === "dashboard" && (
        <>
          <button
            type="button"
            onClick={onAddLead}
            className="h-7.5 sm:h-8.5 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Lead"
            aria-label="Add Lead"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span><span className="hidden sm:inline">+ Add </span>Lead</span>
          </button>
          <button
            type="button"
            onClick={onAddDeal}
            className="h-7.5 sm:h-8.5 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] sm:text-xs inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Deal"
            aria-label="Add Deal"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span><span className="hidden sm:inline">+ Add </span>Deal</span>
          </button>
        </>
      )}

      <button
        type="button"
        disabled={isRefreshing}
        onClick={onRefresh}
        className="hidden md:inline-flex h-9 px-3 rounded-xl border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-neutral-200 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-70 items-center justify-center gap-1.5 whitespace-nowrap"
        title={refreshStatus || "Refresh Data"}
        aria-label={refreshStatus || "Refresh Data"}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-600" : ""}`} />
        <span className="hidden xl:inline text-xs font-bold whitespace-nowrap">{refreshStatus || "Refresh"}</span>
      </button>
    </div>
  );
}
