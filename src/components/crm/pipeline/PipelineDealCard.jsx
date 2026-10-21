"use client";

import React from "react";
import {
  Pencil,
  Clock,
  Video,
  FileText,
  DollarSign,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import WhatsAppIcon from "../shared/WhatsAppIcon";
import { getLatestLinkedDoc, getDocStatusBadge } from "./pipelineHelpers";

export default function PipelineDealCard({
  deal,
  col,
  leads = [],
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
  openMeetingWhatsApp = () => {},
  openCommercialModal = () => {},
  sendDealDocWhatsApp = () => {},
  openInvoiceModal = () => {},
  onNavigateSection = () => {},
}) {
  const dealFollowUps = followUps
    .filter(
      (item) =>
        (item.deal_id === deal.id || (deal.lead_id && item.lead_id === deal.lead_id)) &&
        item.status === "pending"
    )
    .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime());
  const nextFollowUp = dealFollowUps[0];
  const nextMeeting = salesMeetings
    .filter(
      (item) =>
        (item.deal_id === deal.id || (deal.lead_id && item.lead_id === deal.lead_id)) &&
        item.status === "scheduled"
    )
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

  const lead = leads.find((item) => item.id === deal.lead_id);
  const clientName = lead?.name || deal.title?.split(" - ")[0] || deal.title || "Deal";
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

  const isMetaLead = Boolean(
    lead?.source?.toLowerCase().includes("meta") ||
      lead?.source?.toLowerCase().includes("instagram") ||
      deal.notes?.toLowerCase().includes("meta") ||
      deal.notes?.toLowerCase().includes("instagram")
  );
  const isInstagram = Boolean(
    lead?.source?.toLowerCase().includes("instagram") ||
      deal.notes?.toLowerCase().includes("instagram")
  );

  const isDefaultNote =
    !deal.notes ||
    ["converted lead", "created from lead"].some((kw) => deal.notes.toLowerCase().includes(kw));
  const customNotes = !isDefaultNote ? deal.notes : null;

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

      {/* 2. Service & Badges */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-300 truncate max-w-[110px] min-[360px]:max-w-[140px]">
          {serviceName}
        </span>
        {isMetaLead && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-200/50 shrink-0">
            {isInstagram ? "IG" : "Meta"}
          </span>
        )}
        {docBadges.map((badge) => (
          <span
            key={badge.label}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize shrink-0 ${badge.tone}`}
          >
            {badge.label}
          </span>
        ))}
      </div>

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
          {!meetingDateStr && !followUpDateStr && customNotes && (
            <div className="text-[10px] text-gray-500 dark:text-neutral-400 px-1 italic whitespace-pre-line break-words">
              {customNotes}
            </div>
          )}
        </div>
      )}

      {/* 4. Action Toolbar */}
      <div className="pt-1.5 border-t border-gray-100 dark:border-[#2e2619] space-y-1.5">
        {col.id !== "closed_won" && col.id !== "closed_lost" ? (
          <>
            <div className="flex items-center justify-between gap-1 min-w-0">
              <select
                value={deal.pipeline_stage || "contacted"}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  handleDealStageChange(deal, e.target.value, col.id);
                }}
                className="text-[9px] min-[360px]:text-[9.5px] font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-1 py-0.5 text-gray-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer max-w-[70px] min-[360px]:max-w-[76px] shrink truncate"
              >
                <option value="contacted">Contacted</option>
                <option value="qualified">Meeting</option>
                <option value="proposal">Quotation</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Won</option>
                <option value="closed_lost">Lost</option>
              </select>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPipelineFollowUpModal(deal);
                  }}
                  className="p-1 rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200/40 shrink-0 transition cursor-pointer"
                  title="Add Follow-up"
                >
                  <Clock className="w-3 h-3 shrink-0" />
                </button>

                {col.id === "contacted" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMeetingWhatsApp(deal);
                    }}
                    className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                    title="Send WhatsApp confirmation"
                  >
                    <WhatsAppIcon className="w-3 h-3 shrink-0" />
                  </button>
                )}

                {col.id === "proposal" && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCommercialModal("proposal", deal);
                      }}
                      className="p-1 rounded-md text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 border border-orange-200/40 shrink-0 transition cursor-pointer"
                      title="Open Quotation"
                    >
                      <FileText className="w-3 h-3 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendDealDocWhatsApp(deal);
                      }}
                      className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                      title="Share Quotation on WhatsApp"
                    >
                      <WhatsAppIcon className="w-3 h-3 shrink-0" />
                    </button>
                  </>
                )}

                {col.id === "negotiation" && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCommercialModal("agreement", deal);
                      }}
                      className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200/40 shrink-0 transition cursor-pointer"
                      title="Create / Open Agreement"
                    >
                      <FileText className="w-3 h-3 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInvoiceModal(deal);
                      }}
                      className="p-1 rounded-md text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200/40 shrink-0 transition cursor-pointer"
                      title="Generate / Open Invoice"
                    >
                      <DollarSign className="w-3 h-3 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendDealDocWhatsApp(deal);
                      }}
                      className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                      title="Share Agreement / Invoice on WhatsApp"
                    >
                      <WhatsAppIcon className="w-3 h-3 shrink-0" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : col.id === "closed_won" ? (
          <div className="w-full flex items-center justify-between text-[10px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              <span>Client Active</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateSection?.("projects");
              }}
              className="text-[9.5px] font-bold text-gray-500 hover:text-emerald-600 dark:text-neutral-400 flex items-center gap-0.5 transition cursor-pointer whitespace-nowrap shrink-0 min-w-0"
            >
              <span className="truncate">View Project</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between text-[10px]">
            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
              <XCircle className="w-3 h-3 shrink-0" />
              <span>Closed Lost</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDealStageChange(deal, "contacted", col.id);
              }}
              className="text-[9.5px] font-bold text-blue-600 hover:underline transition cursor-pointer whitespace-nowrap shrink-0 min-w-0"
            >
              <span className="truncate">Re-open</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
