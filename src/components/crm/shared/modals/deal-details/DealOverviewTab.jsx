"use client";

import { XCircle } from "lucide-react";
import DealCommercialDocuments from "./DealCommercialDocuments";
import DealContactCard from "./DealContactCard";
import DealEngagementHighlights from "./DealEngagementHighlights";
import DealPipelineProgress from "./DealPipelineProgress";

export default function DealOverviewTab({
  selectedDeal,
  lead,
  client,
  contactName,
  contactCompany,
  contactPhone,
  contactEmail,
  dealStage,
  dealValue,
  stages = [],
  currentStageIndex = -1,
  isWon = false,
  isLost = false,
  dealMeetings = [],
  dealFollowUps = [],
  upcomingMeeting = null,
  upcomingFollowUp = null,
  dealProposals = [],
  dealAgreements = [],
  dealInvoices = [],
  onTabChange,
  handleDealStageChange,
  handleWhatsAppClick,
  sendDealDocWhatsApp,
  openDealMeetingModal,
  openDealFollowUpModal,
  openCommercialModal,
  openInvoiceModal,
}) {
  return (
    <div className="space-y-3 min-[360px]:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-[360px]:gap-2.5">
        <div className="p-2.5 min-[360px]:p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
          <span className="text-gray-500 dark:text-neutral-400 text-[10px] block font-semibold uppercase">
            Deal Value
          </span>
          <span className="font-extrabold text-xs min-[360px]:text-sm sm:text-base text-orange-600 dark:text-orange-400 font-mono mt-0.5 block truncate">
            ₹{dealValue.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="p-2.5 min-[360px]:p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50">
          <span className="text-gray-500 dark:text-neutral-400 text-[10px] block font-semibold uppercase">
            Service
          </span>
          <span className="font-bold text-gray-800 dark:text-white mt-0.5 block truncate text-xs min-[360px]:text-sm" title={selectedDeal.service}>
            {selectedDeal.service || "Tech Development"}
          </span>
        </div>
        <div className="p-2.5 min-[360px]:p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50">
          <span className="text-gray-500 dark:text-neutral-400 text-[10px] block font-semibold uppercase">
            Current Stage
          </span>
          <span className="font-bold text-gray-800 dark:text-white capitalize mt-0.5 block truncate text-xs min-[360px]:text-sm">
            {dealStage.replace("_", " ")}
          </span>
        </div>
        <div className="p-2.5 min-[360px]:p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50">
          <span className="text-gray-500 dark:text-neutral-400 text-[10px] block font-semibold uppercase">
            Expected Close
          </span>
          <span className="font-bold text-gray-800 dark:text-white mt-0.5 block truncate text-xs min-[360px]:text-sm">
            {selectedDeal.expected_close_date
              ? new Date(selectedDeal.expected_close_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Open"}
          </span>
        </div>
      </div>

      <DealPipelineProgress
        stages={stages}
        currentStageIndex={currentStageIndex}
        isWon={isWon}
        isLost={isLost}
      />

      {isLost && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200 text-xs">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Closed Lost Reason</span>
            </div>
            <button
              type="button"
              onClick={() => handleDealStageChange(selectedDeal, "contacted", "closed_lost")}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap shrink-0 min-w-0"
            >
              <span className="truncate">Re-open Deal</span>
            </button>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-[#201713]/80 p-2.5 rounded-lg border border-rose-200/60 font-medium">
            {selectedDeal.loss_reason || "No specific loss reason recorded for this deal."}
          </p>
        </div>
      )}

      <DealEngagementHighlights
        selectedDeal={selectedDeal}
        lead={lead}
        dealMeetings={dealMeetings}
        dealFollowUps={dealFollowUps}
        upcomingMeeting={upcomingMeeting}
        upcomingFollowUp={upcomingFollowUp}
        onTabChange={onTabChange}
        openDealMeetingModal={openDealMeetingModal}
        openDealFollowUpModal={openDealFollowUpModal}
      />

      <DealContactCard
        selectedDeal={selectedDeal}
        lead={lead}
        client={client}
        contactName={contactName}
        contactCompany={contactCompany}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
        handleWhatsAppClick={handleWhatsAppClick}
        sendDealDocWhatsApp={sendDealDocWhatsApp}
      />

      {selectedDeal.notes && (
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
          <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-1">
            Deal Notes & Requirements
          </span>
          <p className="text-gray-700 dark:text-neutral-300 whitespace-pre-wrap font-medium">{selectedDeal.notes}</p>
        </div>
      )}

      <DealCommercialDocuments
        selectedDeal={selectedDeal}
        dealProposals={dealProposals}
        dealAgreements={dealAgreements}
        dealInvoices={dealInvoices}
        openCommercialModal={openCommercialModal}
        openInvoiceModal={openInvoiceModal}
      />
    </div>
  );
}
