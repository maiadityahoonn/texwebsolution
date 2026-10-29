"use client";

import {
  Layers,
  Plus,
  UserPlus,
  Video,
  Settings,
  RefreshCw,
} from "lucide-react";
import CrmDateFilterDropdown from "./CrmDateFilterDropdown";

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
  dateFilter,
  setDateFilter,
  selectedDate,
  setSelectedDate,
  customDateRange,
  setCustomDateRange,
}) {
  return (
    <div className="flex items-center justify-end gap-1 min-[360px]:gap-1.5 sm:gap-2 shrink-0 flex-nowrap min-w-0 ml-auto">
      {/* Date Filter Dropdown (Mobile App View Only: on desktop/laptop/tablet full toolbar is shown) */}
      {dateFilter !== undefined && (
        <div className="md:hidden">
          <CrmDateFilterDropdown
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
          />
        </div>
      )}

      {/* Leads View Actions */}
      {viewMode === "leads" && (
        <>
          <button
            type="button"
            onClick={onAddLead}
            className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Lead"
            aria-label="Add Lead"
          >
            <UserPlus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span className="hidden md:inline">Add Lead</span>
          </button>
          <button
            type="button"
            onClick={onAddDeal}
            className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Deal"
            aria-label="Add Deal"
          >
            <Plus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span className="hidden md:inline">Add Deal</span>
          </button>
          <button
            type="button"
            onClick={onMetaImport}
            className="h-9 min-w-[36px] sm:min-w-[36px] md:min-w-0 px-2 sm:px-2.5 md:px-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
            title="Sync Meta/Instagram Leads"
            aria-label="Sync Meta Leads"
          >
            <Layers className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.2] text-blue-500 shrink-0" />
            <span className="hidden md:inline">Meta Leads</span>
          </button>
        </>
      )}

      {/* Pipeline View Actions */}
      {viewMode === "pipeline" && (
        <>
          <button
            type="button"
            onClick={onAddDeal}
            className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Deal"
            aria-label="Add Deal"
          >
            <Plus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span className="hidden md:inline">Add Deal</span>
          </button>
          <button
            type="button"
            onClick={onAddLead}
            className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Lead"
            aria-label="Add Lead"
          >
            <UserPlus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] text-rose-500 shrink-0" />
            <span className="hidden md:inline">Add Lead</span>
          </button>
        </>
      )}

      {/* Follow-ups View Actions */}
      {viewMode === "followups" && (
        <button
          type="button"
          onClick={onFollowUp}
          className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
          title="Schedule Follow-up"
          aria-label="Schedule Follow-up"
        >
          <Plus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
          <span className="hidden md:inline">Schedule Follow-up</span>
        </button>
      )}

      {/* Sales Meetings View Actions */}
      {viewMode === "sales_meetings" && (
        <>
          <button
            type="button"
            onClick={onMeeting}
            className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
            title="Schedule Meeting"
            aria-label="Schedule Meeting"
          >
            <Video className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.3] shrink-0 md:hidden" />
            <Plus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0 hidden md:inline-block" />
            <span className="hidden md:inline">Schedule Meeting</span>
          </button>
          <button
            type="button"
            onClick={onMeetingSettings}
            className="h-9 w-9 sm:w-9 md:w-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 inline-flex items-center justify-center transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0"
            title="Meeting Link Settings"
            aria-label="Meeting Link Settings"
          >
            <Settings className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.2] shrink-0" />
          </button>
        </>
      )}

      {/* Commercials View Actions */}
      {viewMode === "commercials" && (
        <button
          type="button"
          onClick={onCommercial}
          className={`h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap ${
            commercialScope === "agreement"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          }`}
          title={commercialScope === "agreement" ? "New Agreement" : "New Quotation"}
          aria-label={commercialScope === "agreement" ? "New Agreement" : "New Quotation"}
        >
          <Plus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
          <span className="hidden md:inline">{commercialScope === "agreement" ? "New Agreement" : "New Quotation"}</span>
        </button>
      )}

      {/* Invoices View Actions */}
      {viewMode === "invoices" && (
        <button
          type="button"
          onClick={onInvoice}
          className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
          title="Create Invoice"
          aria-label="Create Invoice"
        >
          <Plus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
          <span className="hidden md:inline">Create Invoice</span>
        </button>
      )}

      {/* Clients View Actions */}
      {viewMode === "clients" && (
        <button
          type="button"
          onClick={onAddDeal}
          className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
          title="Add Deal"
          aria-label="Add Deal"
        >
          <Plus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
          <span className="hidden md:inline">Add Deal</span>
        </button>
      )}

      {/* Dashboard View Actions */}
      {viewMode === "dashboard" && (
        <>
          <button
            type="button"
            onClick={onAddLead}
            className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Lead"
            aria-label="Add Lead"
          >
            <UserPlus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span className="hidden md:inline">Add Lead</span>
          </button>
          <button
            type="button"
            onClick={onAddDeal}
            className="h-9 min-w-[38px] sm:min-w-[38px] md:min-w-0 px-2.5 sm:px-2.5 md:px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white inline-flex items-center justify-center md:gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-90 active:opacity-85 touch-manipulation select-none cursor-pointer shrink-0 whitespace-nowrap"
            title="Add Deal"
            aria-label="Add Deal"
          >
            <Plus className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span className="hidden md:inline">Add Deal</span>
          </button>
        </>
      )}

      {/* Refresh Action Button (Hidden on mobile; mobile uses pull-to-refresh gesture) */}
      <button
        type="button"
        disabled={isRefreshing}
        onClick={onRefresh}
        className="hidden md:inline-flex h-9 px-3 rounded-xl border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-neutral-200 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-70 items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        title={refreshStatus || "Refresh CRM Data"}
        aria-label={refreshStatus || "Refresh CRM Data"}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-600" : ""}`} />
        <span className="hidden xl:inline text-xs font-bold whitespace-nowrap">{refreshStatus || "Refresh"}</span>
      </button>
    </div>
  );
}
