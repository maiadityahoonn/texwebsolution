"use client";

import React from "react";
import FollowUpsTable from "./FollowUpsTable";
import ResponsiveTableContainer from "../shared/ResponsiveTableContainer";
import { TablePageSkeleton, TableSkeleton } from "../shared/CrmSkeletons";
import { formatStatusLabel, getLatestNoteSnippet, getFollowUpWhatsappMessage } from "../shared/meetingUtils";

const SCOPE_TABS = [
  { id: "all", label: "All Follow-ups", shortLabel: "All" },
  { id: "leads", label: "Lead Inquiries", shortLabel: "Leads" },
  { id: "pipeline", label: "Pipeline Deals", shortLabel: "Pipeline" },
];

export default function FollowUpsView({
  isFollowUpsLoading = false,
  paginatedFollowUps = [],
  filteredFollowUps = [],
  leads = [],
  clients = [],
  deals = [],
  setSelectedLead = () => {},
  openStageModal = () => {},
  openRescheduleModal = () => {},
  onDeleteFollowUp = () => {},
  pagination = null,
  followUpScope = "all",
  setFollowUpScope = () => {},
}) {
  if (isFollowUpsLoading && filteredFollowUps.length === 0 && paginatedFollowUps.length === 0) {
    return <TablePageSkeleton columns={6} rows={8} toolbar={false} />;
  }

  return (
    <div className="space-y-3.5">
      {/* Scope Segmented Tabs: 320px responsive, clean labels without count numbers */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 p-1 rounded-xl sm:rounded-2xl bg-gray-100/90 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 shadow-2xs w-full sm:w-auto">
          {SCOPE_TABS.map((tab) => {
            const isActive = followUpScope === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFollowUpScope(tab.id)}
                className={`flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none text-center whitespace-nowrap active:scale-95 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold"
                    : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="inline min-[420px]:hidden">{tab.shortLabel}</span>
                <span className="hidden min-[420px]:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <FollowUpsTable
        isFollowUpsLoading={isFollowUpsLoading}
        paginatedFollowUps={paginatedFollowUps}
        filteredFollowUps={filteredFollowUps}
        leads={leads}
        clients={clients}
        deals={deals}
        setSelectedLead={setSelectedLead}
        ResponsiveTableContainer={ResponsiveTableContainer}
        TableSkeleton={TableSkeleton}
        formatStatusLabel={formatStatusLabel}
        getLatestNoteSnippet={getLatestNoteSnippet}
        getFollowUpWhatsappMessage={getFollowUpWhatsappMessage}
        openStageModal={openStageModal}
        openRescheduleModal={openRescheduleModal}
        onDeleteFollowUp={onDeleteFollowUp}
        pagination={pagination}
        followUpScope={followUpScope}
      />
    </div>
  );
}
