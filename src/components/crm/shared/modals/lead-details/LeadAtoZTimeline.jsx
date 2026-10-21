"use client";

import React, { useMemo } from "react";
import ActivityTimeline from "@/components/crm/shared/ActivityTimeline";
import { parseNotesHistory, getMeetingFullNotes, formatStatusLabel } from "@/components/crm/shared/meetingUtils";
import { getLeadDisplayNotes } from "@/components/crm/shared/leadUtils";
import { History, Sparkles } from "lucide-react";

export default function LeadAtoZTimeline({
  lead,
  deal = null,
  meetings = [],
  followUps = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  isDark = false,
}) {
  const timelineEvents = useMemo(() => {
    if (!lead) return [];
    const events = [];

    // 1. Lead Captured / Created Event
    events.push({
      type: "lead_created",
      title: `Lead Captured: ${lead.name}`,
      description: `Captured via ${lead.source || "Website"} inquiry · Service: ${lead.service || "Tech Development"}${
        lead.budget ? ` · Budget: ₹${lead.budget}` : ""
      }${lead.notes ? ` · Initial Note: ${getLeadDisplayNotes(lead)}` : ""}`,
      time: lead.created_at
        ? new Date(lead.created_at).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "Lead Captured",
      timestamp: new Date(lead.created_at || 0).getTime(),
    });

    // 2. Linked Deal in Pipeline Event
    if (deal) {
      const stageName = (deal.pipeline_stage || deal.stage || "contacted").replace(/_/g, " ");
      const dealVal = Number(deal.deal_value || deal.value || 0);
      events.push({
        type: "project",
        title: `Moved to Sales Pipeline`,
        description: `Deal: ${deal.title} · Stage: ${stageName}${dealVal > 0 ? ` · Value: ₹${dealVal.toLocaleString("en-IN")}` : ""}`,
        time: deal.created_at
          ? new Date(deal.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "Pipeline",
        timestamp: new Date(deal.created_at || lead.created_at || 0).getTime() + 1000,
      });
    }

    // 3. Sales Meetings Events (Scheduled, Rescheduled, Conducted, Notes)
    meetings.forEach((m) => {
      const isCompleted = m.status === "completed";
      events.push({
        type: isCompleted ? "completed" : "meeting",
        title: `Meeting: ${m.title} [${formatStatusLabel(m.status)}]`,
        description: `Scheduled: ${new Date(m.scheduled_at).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })} (${m.duration_minutes || 30} mins)${m.agenda ? ` · Agenda: ${m.agenda}` : ""}`,
        time: new Date(m.scheduled_at || m.created_at || 0).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        timestamp: new Date(m.scheduled_at || m.created_at || 0).getTime(),
      });

      // Parse meeting discussion notes and outcome updates
      const mHistory = parseNotesHistory(getMeetingFullNotes(m));
      mHistory.forEach((entry, idx) => {
        if (entry.note && !entry.note.toLowerCase().includes("no agenda or notes logged")) {
          events.push({
            type: entry.stage?.toLowerCase().includes("completed") ? "completed" : "meeting",
            title: `Meeting Outcome · ${entry.stage || formatStatusLabel(m.status)}`,
            description: entry.note,
            time: entry.timestamp || "Outcome Note",
            timestamp: new Date(m.updated_at || m.scheduled_at || 0).getTime() + (idx + 1) * 1000,
          });
        }
      });
    });

    // 4. Sales Follow-ups Events (Scheduled, Done, Notes History)
    followUps.forEach((f) => {
      const isDone = f.status === "done";
      events.push({
        type: isDone ? "completed" : "call",
        title: `Follow-up: ${f.title} [${formatStatusLabel(f.status)}]`,
        description: `Via ${f.channel || "Phone"}${f.priority ? ` · Priority: ${f.priority}` : ""} · Due: ${
          f.due_at
            ? new Date(f.due_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "Pending"
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

      // Parse individual timestamped notes / history updates
      const fHistory = parseNotesHistory(f.notes);
      fHistory.forEach((entry, idx) => {
        if (entry.note) {
          events.push({
            type: entry.stage?.toLowerCase().includes("done") || entry.stage?.toLowerCase().includes("completed") ? "completed" : "chat",
            title: `Follow-up Update · ${entry.stage || formatStatusLabel(f.status)}`,
            description: entry.note,
            time: entry.timestamp || "Update Note",
            timestamp: new Date(f.updated_at || f.due_at || 0).getTime() + (idx + 1) * 1000,
          });
        }
      });
    });

    // Helper to check if a document or activity strictly belongs to this lead or its linked deal
    const matchesLeadOrDeal = (item) => {
      if (!item) return false;
      const leadIdStr = lead?.id != null ? String(lead.id) : null;
      const dealIdStr = deal?.id != null ? String(deal.id) : null;
      const leadClientIdStr = lead?.client_id != null ? String(lead.client_id) : null;
      const dealClientIdStr = deal?.client_id != null ? String(deal.client_id) : null;

      // 1. Direct lead_id match
      if (leadIdStr && item.lead_id != null && String(item.lead_id) === leadIdStr) return true;

      // 2. Deal ID match (if this lead has a linked deal in the sales pipeline)
      if (dealIdStr && item.deal_id != null && String(item.deal_id) === dealIdStr) return true;

      // 3. Client ID match (if lead or deal is converted/linked to a client)
      if (leadClientIdStr && item.client_id != null && String(item.client_id) === leadClientIdStr) return true;
      if (dealClientIdStr && item.client_id != null && String(item.client_id) === dealClientIdStr) return true;

      return false;
    };

    // 5. Commercial Documents (Quotations, Proposals, Agreements, Invoices) strictly isolated to this lead/deal
    const linkedQuotations = [...proposals, ...quotations].filter(matchesLeadOrDeal);
    const linkedAgreements = agreements.filter(matchesLeadOrDeal);
    const linkedInvoices = invoices.filter(matchesLeadOrDeal);

    linkedQuotations.forEach((q) => {
      events.push({
        type: "quotation",
        title: `Quotation: ${q.title || q.quotation_number || "Quotation"}`,
        description: `Amount: ₹${(Number(q.total || q.amount) || 0).toLocaleString("en-IN")} · Status: ${q.status || "sent"}`,
        time: q.created_at ? new Date(q.created_at).toLocaleDateString("en-IN") : "Doc",
        timestamp: new Date(q.created_at || 0).getTime(),
      });
    });

    linkedAgreements.forEach((a) => {
      events.push({
        type: "project",
        title: `Agreement: ${a.title || a.agreement_number || "Agreement"}`,
        description: `Amount: ₹${(Number(a.amount) || 0).toLocaleString("en-IN")} · Status: ${a.status || "active"}`,
        time: a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "Agreement",
        timestamp: new Date(a.created_at || 0).getTime(),
      });
    });

    linkedInvoices.forEach((inv) => {
      events.push({
        type: "payment",
        title: `Invoice: ${inv.title || inv.invoice_number || "Invoice"}`,
        description: `Amount: ₹${(Number(inv.total_amount || inv.amount) || 0).toLocaleString("en-IN")} · Status: ${inv.status || "unpaid"}`,
        time: inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN") : "Invoice",
        timestamp: new Date(inv.created_at || 0).getTime(),
      });
    });

    // 6. Lead Outcome: Won or Lost
    if (lead.status === "Converted" || lead.status === "Closed Won" || deal?.pipeline_stage === "closed_won") {
      events.push({
        type: "completed",
        title: "Deal Closed Won!",
        description: "Client successfully converted into active project client.",
        time: lead.updated_at ? new Date(lead.updated_at).toLocaleString("en-IN") : "Closed Won",
        timestamp: new Date(lead.updated_at || Date.now()).getTime() + 5000,
      });
    } else if (lead.status === "Lost" || deal?.pipeline_stage === "closed_lost") {
      events.push({
        type: "alert",
        title: "Lead Marked Lost",
        description: `Reason: ${lead.loss_reason || deal?.loss_reason || "Opportunity dropped"}`,
        time: lead.updated_at ? new Date(lead.updated_at).toLocaleString("en-IN") : "Closed Lost",
        timestamp: new Date(lead.updated_at || Date.now()).getTime() + 5000,
      });
    }

    // Sort in reverse chronological order (latest event first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [lead, deal, meetings, followUps, proposals, quotations, agreements, invoices]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>A to Z Activity Timeline</span>
        </h4>
        <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[10px] font-bold border border-orange-200/50">
          {timelineEvents.length} Activities
        </span>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-[#3a3020] bg-gray-50/50 dark:bg-[#18150f]/60 p-3 sm:p-4">
        <ActivityTimeline events={timelineEvents} isDark={isDark} />
      </div>
    </div>
  );
}
