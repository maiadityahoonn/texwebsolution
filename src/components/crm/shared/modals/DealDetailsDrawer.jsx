"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Target,
  Users,
  Video,
  Clock,
  History,
  Plus,
  Check,
  Pencil,
} from "lucide-react";
import { parseNotesHistory, getMeetingFullNotes, formatStatusLabel } from "../meetingUtils";
import { getLeadDisplayNotes } from "../leadUtils";
import DealDetailsTabs from "./deal-details/DealDetailsTabs";
import DealFollowUpsTab from "./deal-details/DealFollowUpsTab";
import DealLeadHistoryTab from "./deal-details/DealLeadHistoryTab";
import DealMeetingsTab from "./deal-details/DealMeetingsTab";
import DealOverviewTab from "./deal-details/DealOverviewTab";
import DealTimelineTab from "./deal-details/DealTimelineTab";

export default function DealDetailsDrawer({
  selectedDeal,
  setSelectedDeal,
  leads = [],
  clients = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  salesMeetings = [],
  followUps = [],
  isDark = false,
  handleOpenEditDeal,
  handleDealStageChange,
  openDealMeetingModal,
  openDealFollowUpModal,
  handleWhatsAppClick,
  sendDealDocWhatsApp,
  openCommercialModal,
  openInvoiceModal,
  setSelectedLead,
  openStageModal,
}) {
  const [dealModalTab, setDealModalTab] = useState("overview");

  useEffect(() => {
    setDealModalTab("overview");
  }, [selectedDeal?.id]);

  if (!selectedDeal) return null;

  const lead = leads.find((l) => l.id === selectedDeal.lead_id);
  const client = clients.find((c) => c.id === selectedDeal.client_id);
  const contactName = client?.name || lead?.name || selectedDeal.title?.split(" - ")[0] || "Client";
  const contactPhone = lead?.phone || client?.phone || "";
  const contactEmail = lead?.email || client?.email || "";
  const contactCompany = client?.company_name || lead?.company_name || "";
  const dealStage = selectedDeal.pipeline_stage || selectedDeal.stage || "contacted";
  const isLost = dealStage === "closed_lost";
  const isWon = dealStage === "closed_won";
  const dealValue = Number(selectedDeal.deal_value || selectedDeal.value || 0);

  const dealProposals = [...proposals, ...quotations].filter(
    (p) => p.deal_id === selectedDeal.id || (selectedDeal.lead_id && p.lead_id === selectedDeal.lead_id)
  );
  const dealAgreements = agreements.filter(
    (a) => a.deal_id === selectedDeal.id || (selectedDeal.client_id && a.client_id === selectedDeal.client_id)
  );
  const dealInvoices = invoices.filter(
    (i) => i.deal_id === selectedDeal.id || (selectedDeal.client_id && i.client_id === selectedDeal.client_id)
  );
  const dealMeetings = salesMeetings.filter(
    (m) => m.deal_id === selectedDeal.id || (selectedDeal.lead_id && m.lead_id === selectedDeal.lead_id)
  );
  const dealFollowUps = followUps.filter(
    (f) => f.deal_id === selectedDeal.id || (selectedDeal.lead_id && f.lead_id === selectedDeal.lead_id)
  );

  const sortedDealMeetings = [...dealMeetings].sort(
    (a, b) => new Date(b.scheduled_at || 0).getTime() - new Date(a.scheduled_at || 0).getTime()
  );
  const sortedDealFollowUps = [...dealFollowUps].sort(
    (a, b) => new Date(b.due_at || 0).getTime() - new Date(a.due_at || 0).getTime()
  );

  const upcomingMeeting = dealMeetings
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())[0];
  const upcomingFollowUp = dealFollowUps
    .filter((f) => f.status === "pending")
    .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime())[0];

  // Construct A to Z Chronological Events
  const rawTimelineEvents = [];
  if (lead) {
    rawTimelineEvents.push({
      type: "lead_created",
      title: `Lead Captured: ${lead.name}`,
      description: `Source: ${lead.source || "Website"} · Service: ${lead.service || "Tech Development"}${lead.notes ? ` · Note: ${getLeadDisplayNotes(lead)}` : ""}`,
      time: lead.created_at
        ? new Date(lead.created_at).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "Lead",
      timestamp: new Date(lead.created_at || 0).getTime(),
    });
  }

  rawTimelineEvents.push({
    type: "project",
    title: `Deal Created in Pipeline`,
    description: `Stage: ${dealStage.replace("_", " ")} · Value: ₹${dealValue.toLocaleString("en-IN")}${selectedDeal.service ? ` · ${selectedDeal.service}` : ""}`,
    time: selectedDeal.created_at
      ? new Date(selectedDeal.created_at).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "Deal",
    timestamp: new Date(selectedDeal.created_at || 0).getTime(),
  });

  dealMeetings.forEach((m) => {
    rawTimelineEvents.push({
      type: m.status === "completed" ? "completed" : "meeting",
      title: `Meeting: ${m.title} [${formatStatusLabel(m.status)}]`,
      description: `Scheduled: ${new Date(m.scheduled_at).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}${m.agenda ? ` · Agenda: ${m.agenda}` : ""}`,
      time: new Date(m.scheduled_at).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      timestamp: new Date(m.scheduled_at || 0).getTime(),
    });

    const mHistory = parseNotesHistory(getMeetingFullNotes(m));
    mHistory.forEach((entry, idx) => {
      if (entry.note && !entry.note.toLowerCase().includes("no agenda or notes logged")) {
        rawTimelineEvents.push({
          type:
            entry.stage?.toLowerCase().includes("conducted") || entry.stage?.toLowerCase().includes("completed")
              ? "completed"
              : "meeting",
          title: `Meeting Update · ${entry.stage || formatStatusLabel(m.status)}`,
          description: entry.note,
          time: entry.timestamp || "Update",
          timestamp: new Date(m.updated_at || m.scheduled_at || 0).getTime() + (idx + 1) * 1000,
        });
      }
    });
  });

  dealFollowUps.forEach((f) => {
    rawTimelineEvents.push({
      type: f.status === "done" ? "completed" : "call",
      title: `Follow-up: ${f.title} [${formatStatusLabel(f.status)}]`,
      description: `Via ${f.channel || "Phone"} · Priority: ${f.priority || "Medium"} · Due: ${
        f.due_at
          ? new Date(f.due_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "No date"
      }`,
      time: f.due_at
        ? new Date(f.due_at).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "Follow-up",
      timestamp: new Date(f.due_at || f.created_at || 0).getTime(),
    });

    const fHistory = parseNotesHistory(f.notes);
    fHistory.forEach((entry, idx) => {
      if (entry.note) {
        rawTimelineEvents.push({
          type:
            entry.stage?.toLowerCase().includes("done") || entry.stage?.toLowerCase().includes("completed")
              ? "completed"
              : "chat",
          title: `Follow-up Update · ${entry.stage || formatStatusLabel(f.status)}`,
          description: entry.note,
          time: entry.timestamp || "Update",
          timestamp: new Date(f.updated_at || f.due_at || 0).getTime() + (idx + 1) * 1000,
        });
      }
    });
  });

  dealProposals.forEach((p) => {
    rawTimelineEvents.push({
      type: "quotation",
      title: `Quotation: ${p.title || p.quotation_number || "Quotation"}`,
      description: `Amount: ₹${(Number(p.total || p.amount) || 0).toLocaleString("en-IN")} · Status: ${p.status || "sent"}`,
      time: p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN") : "Doc",
      timestamp: new Date(p.created_at || 0).getTime(),
    });
  });

  dealAgreements.forEach((a) => {
    rawTimelineEvents.push({
      type: "project",
      title: `Agreement: ${a.title || a.agreement_number || "Agreement"}`,
      description: `Amount: ₹${(Number(a.amount) || 0).toLocaleString("en-IN")} · Status: ${a.status || "active"}`,
      time: a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "Doc",
      timestamp: new Date(a.created_at || 0).getTime(),
    });
  });

  dealInvoices.forEach((inv) => {
    rawTimelineEvents.push({
      type: "payment",
      title: `Invoice: ${inv.title || inv.invoice_number || "Invoice"}`,
      description: `Amount: ₹${(Number(inv.total_amount || inv.amount) || 0).toLocaleString("en-IN")} · Status: ${inv.status || "unpaid"}`,
      time: inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN") : "Doc",
      timestamp: new Date(inv.created_at || 0).getTime(),
    });
  });

  if (isWon) {
    rawTimelineEvents.push({
      type: "completed",
      title: `Deal Closed Won!`,
      description: `Converted successfully with value ₹${dealValue.toLocaleString("en-IN")}`,
      time: selectedDeal.updated_at ? new Date(selectedDeal.updated_at).toLocaleString("en-IN") : "Won",
      timestamp: new Date(selectedDeal.updated_at || Date.now()).getTime(),
    });
  }
  if (isLost) {
    rawTimelineEvents.push({
      type: "alert",
      title: `Deal Closed Lost`,
      description: `Reason: ${selectedDeal.loss_reason || "Marked as lost"}`,
      time: selectedDeal.updated_at ? new Date(selectedDeal.updated_at).toLocaleString("en-IN") : "Lost",
      timestamp: new Date(selectedDeal.updated_at || Date.now()).getTime(),
    });
  }

  const dealTimelineEvents = rawTimelineEvents.sort((a, b) => b.timestamp - a.timestamp);

  const STAGES = [
    { id: "contacted", label: "Contacted" },
    { id: "qualified", label: "Meeting" },
    { id: "proposal", label: "Quotation" },
    { id: "negotiation", label: "Negotiation" },
    { id: "closed_won", label: "Won" },
  ];
  const currentStageIndex = isLost ? -1 : STAGES.findIndex((s) => s.id === dealStage);

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedDeal(null);
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-1.5 min-[360px]:p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
    >
      <div className="w-full max-w-3xl h-[88vh] max-h-[88vh] min-[360px]:h-[85vh] min-[360px]:max-h-[85vh] rounded-2xl min-[360px]:rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] p-2.5 min-[360px]:p-4 sm:p-5 pb-2.5 min-[360px]:pb-3.5 shrink-0 bg-gray-50/50 dark:bg-[#1f1a13]/50 gap-2">
          <div className="flex items-center gap-2 min-[360px]:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 min-[360px]:w-10 min-[360px]:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-xs min-[360px]:text-sm flex items-center justify-center shrink-0 shadow-sm">
              {contactName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-[360px]:gap-2 flex-wrap">
                <h3 className="font-bold text-xs min-[360px]:text-sm sm:text-base text-gray-900 dark:text-white truncate max-w-[130px] min-[360px]:max-w-[200px] sm:max-w-none" title={selectedDeal.title}>
                  {selectedDeal.title}
                </h3>
                <span
                  className={`px-1.5 min-[360px]:px-2 py-0.5 rounded-full text-[9px] min-[360px]:text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                    isWon
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : isLost
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                      : "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                  }`}
                >
                  {dealStage.replace("_", " ")}
                </span>
              </div>
              <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate">
                Pipeline Deal · Created{" "}
                {new Date(selectedDeal.created_at || Date.now()).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 min-[360px]:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenEditDeal(selectedDeal)}
              className="p-1.5 rounded-lg text-gray-600 dark:text-neutral-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold cursor-pointer border border-gray-200/80 dark:border-slate-700 shrink-0"
              title="Edit Deal"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedDeal(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
            </button>
          </div>
        </div>

        <DealDetailsTabs
          activeTab={dealModalTab}
          onChange={setDealModalTab}
          tabs={[
            { id: "overview", label: "Overview", icon: Target },
            { id: "lead", label: "Lead History", icon: Users, badge: lead ? lead.source || "Linked" : null },
            { id: "meetings", label: "Meetings", icon: Video, count: dealMeetings.length },
            { id: "followups", label: "Follow-ups", icon: Clock, count: dealFollowUps.length },
            { id: "timeline", label: "A to Z Timeline", icon: History, count: dealTimelineEvents.length },
          ]}
        />

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-2.5 min-[360px]:p-4 sm:p-5 space-y-3 min-[360px]:space-y-4 text-xs no-scrollbar">
          {/* TAB 1: OVERVIEW */}
          {dealModalTab === "overview" && (
            <DealOverviewTab
              selectedDeal={selectedDeal}
              lead={lead}
              client={client}
              contactName={contactName}
              contactCompany={contactCompany}
              contactPhone={contactPhone}
              contactEmail={contactEmail}
              dealStage={dealStage}
              dealValue={dealValue}
              stages={STAGES}
              currentStageIndex={currentStageIndex}
              isWon={isWon}
              isLost={isLost}
              dealMeetings={dealMeetings}
              dealFollowUps={dealFollowUps}
              upcomingMeeting={upcomingMeeting}
              upcomingFollowUp={upcomingFollowUp}
              dealProposals={dealProposals}
              dealAgreements={dealAgreements}
              dealInvoices={dealInvoices}
              onTabChange={setDealModalTab}
              handleDealStageChange={handleDealStageChange}
              handleWhatsAppClick={handleWhatsAppClick}
              sendDealDocWhatsApp={sendDealDocWhatsApp}
              openDealMeetingModal={openDealMeetingModal}
              openDealFollowUpModal={openDealFollowUpModal}
              openCommercialModal={openCommercialModal}
              openInvoiceModal={openInvoiceModal}
            />
          )}
          {/* TAB 2: LEAD HISTORY */}
          {dealModalTab === "lead" && (
            <DealLeadHistoryTab lead={lead} selectedDeal={selectedDeal} setSelectedLead={setSelectedLead} />
          )}
          {/* TAB 3: A TO Z MEETINGS */}
          {dealModalTab === "meetings" && (
            <DealMeetingsTab
              selectedDeal={selectedDeal}
              lead={lead}
              dealMeetings={dealMeetings}
              sortedDealMeetings={sortedDealMeetings}
              openDealMeetingModal={openDealMeetingModal}
              openStageModal={openStageModal}
            />
          )}
          {/* TAB 4: A TO Z FOLLOW-UPS */}
          {dealModalTab === "followups" && (
            <DealFollowUpsTab
              selectedDeal={selectedDeal}
              lead={lead}
              dealFollowUps={dealFollowUps}
              sortedDealFollowUps={sortedDealFollowUps}
              openDealFollowUpModal={openDealFollowUpModal}
              openStageModal={openStageModal}
            />
          )}
          {/* TAB 5: A TO Z TIMELINE */}
          {dealModalTab === "timeline" && (
            <DealTimelineTab dealTimelineEvents={dealTimelineEvents} isDark={isDark} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-1.5 min-[360px]:gap-2 p-2.5 min-[360px]:p-3.5 sm:p-4 border-t border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] shrink-0 flex-wrap sm:flex-nowrap min-w-0">
          <button
            type="button"
            onClick={() => handleOpenEditDeal(selectedDeal)}
            className="px-2.5 min-[360px]:px-4 py-1.5 min-[360px]:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 min-w-0 whitespace-nowrap"
          >
            <Pencil className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Edit Deal</span>
          </button>
          <div className="flex items-center gap-1.5 min-[360px]:gap-2 shrink-0 ml-auto min-w-0">
            {dealModalTab !== "overview" && (
              <button
                type="button"
                onClick={() => setDealModalTab("overview")}
                className="px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0 min-w-0 whitespace-nowrap"
              >
                <span className="truncate">← Overview</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedDeal(null)}
              className="px-2.5 min-[360px]:px-4 py-1.5 min-[360px]:py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0 min-w-0 whitespace-nowrap"
            >
              <span className="truncate">Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
