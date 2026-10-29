"use client";

import React from "react";
import {
  Pencil,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getLatestLinkedDoc, getDocStatusBadge } from "./pipelineHelpers";
import PipelineDealActions from "./PipelineDealActions";

export default function PipelineDealCard({
  deal,
  col,
  leads = [],
  clients = [],
  followUps = [],
  salesMeetings = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  setDraggedDealId = () => {},
  setSelectedDeal = () => {},
  setDealModalTab = () => {},
  handleOpenEditDeal = () => {},
  handleDealStageChange = () => {},
  openPipelineFollowUpModal = () => {},
  openDealMeetingModal = () => {},
  openCommercialModal = () => {},
  sendDealDocWhatsApp = () => {},
  openInvoiceModal = () => {},
  onNavigateSection = () => {},
}) {
  const lead = leads.find((item) => item.id === deal.lead_id);
  const client = clients.find((item) => item.id === deal.client_id);
  const contact = lead || client;
  const dealLeadName = lead?.name?.toLowerCase().trim();
  const dealTitlePrefix = deal.title?.split(" - ")[0]?.toLowerCase().trim();

  const allDealFollowUps = followUps.filter((item) => {
    const matchId =
      String(item.deal_id || "") === String(deal.id) ||
      (deal.lead_id && String(item.lead_id || "") === String(deal.lead_id));
    const matchName =
      (dealLeadName && dealLeadName.length > 2 && item.title?.toLowerCase().includes(dealLeadName)) ||
      (dealTitlePrefix && dealTitlePrefix.length > 2 && item.title?.toLowerCase().includes(dealTitlePrefix));
    return matchId || matchName;
  });

  const dealFollowUps = allDealFollowUps
    .filter((item) => item.status === "pending" || item.status === "scheduled")
    .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime());
  const nextFollowUp = dealFollowUps[0];

  const allDealMeetings = salesMeetings.filter((item) => {
    const matchId =
      String(item.deal_id || "") === String(deal.id) ||
      (deal.lead_id && String(item.lead_id || "") === String(deal.lead_id));
    const matchName =
      (dealLeadName && dealLeadName.length > 2 && item.title?.toLowerCase().includes(dealLeadName)) ||
      (dealTitlePrefix && dealTitlePrefix.length > 2 && item.title?.toLowerCase().includes(dealTitlePrefix));
    return matchId || matchName;
  });

  const nextMeeting = allDealMeetings
    .filter((item) => !["cancelled", "completed"].includes(item.status))
    .sort(
      (a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime()
    )[0];

  const latestQuotation = getLatestLinkedDoc([...proposals, ...quotations], deal);
  const latestAgreement = getLatestLinkedDoc(agreements, deal);
  const latestInvoice = getLatestLinkedDoc(invoices, deal);
  const docBadges = [
    getDocStatusBadge("Quotation", latestQuotation),
    getDocStatusBadge("Agreement", latestAgreement),
    getDocStatusBadge("Invoice", latestInvoice),
  ].filter(Boolean);
  const clientName = contact?.name || deal.title?.split(" - ")[0] || deal.title || "Deal";
  const serviceName =
    deal.service || lead?.service || deal.title?.split(" - ")[1] || "Tech Development";
  const dealInitials =
    clientName
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "DL";

  const meetingDateStr = nextMeeting?.scheduled_at
    ? new Date(nextMeeting.scheduled_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }) +
      ", " +
      new Date(nextMeeting.scheduled_at).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const followUpDateStr = nextFollowUp?.due_at
    ? new Date(nextFollowUp.due_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }) +
      ", " +
      new Date(nextFollowUp.due_at).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div
      draggable
      onDragStart={() => setDraggedDealId(deal.id)}
      onDragEnd={() => setDraggedDealId(null)}
      onClick={() => {
        setSelectedDeal(deal);
        setDealModalTab("overview");
      }}
      className="group relative p-2 min-[360px]:p-2.5 rounded-xl bg-white dark:bg-[#1a1711] border border-gray-200/90 dark:border-[#382f20] hover:border-orange-500/80 hover:shadow-md transition-all duration-150 space-y-1.5 min-[360px]:space-y-2 cursor-pointer select-none"
    >
      {/* 1. Header: Avatar + Client Name + Value + Edit button */}
      <div className="flex items-center justify-between gap-1.5 min-[360px]:gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 text-white text-[9px] font-black flex items-center justify-center shrink-0 uppercase tracking-tighter shadow-2xs">
            {dealInitials}
          </span>
          <span
            className="font-bold text-xs text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition"
            title={clientName}
          >
            {clientName}
          </span>
          {deal._optimistic && (
            <span className="text-[8px] font-bold text-amber-600 animate-pulse shrink-0">●</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] min-[360px]:text-[11px] font-black tracking-tight shrink-0 ${
              col.id === "closed_won"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40"
                : "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/40"
            }`}
          >
            ₹{(Number(deal.deal_value) || 0).toLocaleString("en-IN")}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditDeal(deal);
            }}
            className="p-1 rounded-md text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Edit Deal Details"
            aria-label="Edit Deal Details"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Service & Stage */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="min-w-0 flex-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-300 truncate"
          title={serviceName}
        >
          {serviceName}
        </span>
        {!["closed_won", "closed_lost"].includes(col.id) && (
          <select
            value={deal.pipeline_stage || "contacted"}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              event.stopPropagation();
              handleDealStageChange(deal, event.target.value, col.id);
            }}
            className="w-[94px] shrink-0 text-[9px] font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-1 py-1 text-gray-700 dark:text-neutral-300"
            title="Change pipeline stage"
            aria-label="Change pipeline stage"
          >
            <option value="contacted">Contacted</option>
            <option value="qualified">Meeting</option>
            <option value="proposal">Quotation</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Won</option>
            <option value="closed_lost">Lost</option>
          </select>
        )}
      </div>
      {docBadges.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {docBadges.map((badge) => (
            <span
              key={badge.label}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize shrink-0 ${badge.tone}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* 3. Action / Status Highlight (Single Compact Row) */}
      {col.id === "closed_won" ? (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="truncate">Won · Client & Project Active</span>
        </div>
      ) : col.id === "closed_lost" ? (
        <div
          className="flex items-start gap-1.5 text-[10px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-200/40"
          title={deal.loss_reason}
        >
          <XCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
          <span className="break-words">{deal.loss_reason || "Deal dropped"}</span>
        </div>
      ) : (
        <div className="space-y-1">
          {meetingDateStr && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDeal(deal);
                setDealModalTab("meetings");
              }}
              title={`Meeting: ${nextMeeting?.title || "Sales Meeting"} (${meetingDateStr})`}
              className="flex items-center justify-between gap-1 text-[9.5px] min-[360px]:text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 px-1.5 min-[360px]:px-2 py-1 rounded-lg border border-blue-200/50 dark:border-blue-900/40 min-w-0 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                <Video className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="font-bold shrink-0">Meet:</span>
                <span className="truncate font-semibold">{meetingDateStr}</span>
              </div>
              {nextMeeting?.scheduled_at &&
                new Date(nextMeeting.scheduled_at).toDateString() === new Date().toDateString() && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] min-[360px]:text-[8.5px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/40 shrink-0">
                    Today
                  </span>
                )}
            </div>
          )}
          {followUpDateStr && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDeal(deal);
                setDealModalTab("followups");
              }}
              title={`Follow-up: ${nextFollowUp?.title || "Follow-up"} (${followUpDateStr})`}
              className="flex items-center justify-between gap-1 text-[9.5px] min-[360px]:text-[10px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 px-1.5 min-[360px]:px-2 py-1 rounded-lg border border-amber-200/50 dark:border-amber-900/40 min-w-0 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="font-bold shrink-0">
                  <span className="hidden min-[340px]:inline">Follow-up:</span>
                  <span className="min-[340px]:hidden">Flw:</span>
                </span>
                <span className="truncate font-semibold">{followUpDateStr}</span>
              </div>
              {new Date(nextFollowUp.due_at).getTime() < Date.now() ? (
                <span className="px-1.5 py-0.5 rounded text-[8px] min-[360px]:text-[8.5px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50 shrink-0">
                  Overdue
                </span>
              ) : new Date(nextFollowUp.due_at).toDateString() === new Date().toDateString() ? (
                <span className="px-1.5 py-0.5 rounded text-[8px] min-[360px]:text-[8.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                  Today
                </span>
              ) : null}
            </div>
          )}
        </div>
      )}

      <PipelineDealActions
        deal={deal}
        col={col}
        lead={contact}
        serviceName={serviceName}
        nextFollowUp={nextFollowUp}
        nextMeeting={nextMeeting}
        handleDealStageChange={handleDealStageChange}
        openPipelineFollowUpModal={openPipelineFollowUpModal}
        openDealMeetingModal={openDealMeetingModal}
        openCommercialModal={openCommercialModal}
        openInvoiceModal={openInvoiceModal}
        onNavigateSection={onNavigateSection}
      />
    </div>
  );
}
