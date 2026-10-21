import {
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Phone,
  AlertCircle,
  Video,
  Target,
  FileText,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { CLOSED_PIPELINE_STAGES, getLeadNextAction } from "../shared/leadUtils";
import {
  isMeetingActive,
  isMeetingCompleted,
  isMeetingNoShow,
  isMeetingOverdue,
  isFollowUpActive,
  isFollowUpCompleted,
  isFollowUpMissed,
  isFollowUpOverdue,
  isFollowUpUpcomingPending,
} from "../shared/meetingUtils";

export function buildPageStatusCards({
  viewMode,
  leadSummaryMetrics,
  dateFilteredPipelineDealsForStats,
  dateFilteredFollowUpsForStats,
  dateFilteredMeetingsForStats,
  proposals = [],
  quotations = [],
  agreements = [],
  dealSummary = null,
  followUpSummary = null,
  meetingSummary = null,
  commercialSummary = null,
  dateFilter = "all",
  followUpScope = "all",
}) {
  if (viewMode === "reports") return [];
  if (viewMode === "leads") {
    const { totalLeads, activeCount, pipelineCount, convertedCount, lostCount } = leadSummaryMetrics;
    return [
      { id: "total_leads", label: "Total Leads", value: totalLeads, sub: "All captured inbound leads", icon: Users, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30", filterKey: "all", helpText: "All captured inbound inquiries across all channels." },
      { id: "active_inquiries", label: "Active Inquiries", value: activeCount, sub: "New inquiries to qualify", icon: HelpCircle, tone: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30", filterKey: "active", helpText: "Inbound leads waiting to be qualified into sales pipeline." },
      { id: "pipeline", label: "In Pipeline", value: pipelineCount, sub: "Active in deal stages", icon: TrendingUp, tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30", filterKey: "pipeline", helpText: "Leads currently in contacted, meeting, proposal, or negotiation stages." },
      { id: "converted", label: "Converted (Won)", value: convertedCount, sub: "Turned into paying clients", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30", filterKey: "converted", helpText: "Leads successfully converted to closed won deals / client accounts." },
      { id: "lost", label: "Lost Leads", value: lostCount, sub: "Dropped / marked lost", icon: XCircle, tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30", filterKey: "lost", helpText: "Leads that dropped off or were marked lost." },
    ];
  }

  if (viewMode === "pipeline") {
    const useServerSummary =
      dateFilter === "all" &&
      dealSummary &&
      typeof dealSummary.total === "number" &&
      (dealSummary.total > dateFilteredPipelineDealsForStats.length || dateFilteredPipelineDealsForStats.length === 0);

    let totalDealsCount = dateFilteredPipelineDealsForStats.length;
    let openCount = 0;
    let wonCount = 0;
    let lostCount = 0;
    let totalValue = 0;
    let activeValue = 0;
    let wonValue = 0;
    let lostValue = 0;
    let winRateDisplay = "0%";

    if (useServerSummary) {
      totalDealsCount = dealSummary.total || 0;
      openCount = dealSummary.active || 0;
      wonCount = dealSummary.won || 0;
      lostCount = dealSummary.lost || 0;
      totalValue = dealSummary.totalValue || 0;
      activeValue = dealSummary.activeValue || 0;
      wonValue = dealSummary.wonValue || 0;
      lostValue = dealSummary.lostValue || 0;
      winRateDisplay = dealSummary.winRate || "0%";
    } else {
      const openDeals = dateFilteredPipelineDealsForStats.filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage));
      const wonDeals = dateFilteredPipelineDealsForStats.filter((d) => (d.pipeline_stage || d.stage) === "closed_won");
      const lostDeals = dateFilteredPipelineDealsForStats.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost");
      openCount = openDeals.length;
      wonCount = wonDeals.length;
      lostCount = lostDeals.length;
      const decidedCount = wonCount + lostCount;
      activeValue = openDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      lostValue = lostDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      totalValue = dateFilteredPipelineDealsForStats.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      const winRateNumber = decidedCount > 0 ? (wonCount / decidedCount) * 100 : 0;
      winRateDisplay = winRateNumber % 1 === 0 ? `${winRateNumber}%` : `${winRateNumber.toFixed(1)}%`;
    }

    const decidedTotal = wonCount + lostCount;

    return [
      { id: "pipeline_value", label: "Total Pipeline Value", value: `₹${totalValue.toLocaleString("en-IN")}`, sub: `${totalDealsCount} total deals managed`, badge: `${openCount} in progress`, icon: DollarSign, tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30", filterKey: "all", helpText: "Total monetary value across all deals in the sales pipeline." },
      { id: "active_deals", label: "Active Deals", value: openCount, sub: `₹${activeValue.toLocaleString("en-IN")} in active stages`, badge: "In Progress", icon: TrendingUp, tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30", filterKey: "active", helpText: "Open deals currently in Contacted, Meeting, Quotation, or Negotiation stages." },
      { id: "closed_won", label: "Closed Won", value: wonCount, sub: `₹${wonValue.toLocaleString("en-IN")} revenue booked`, badge: "Won Deals", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30", filterKey: "won", helpText: "Deals successfully won and converted into paying clients." },
      { id: "closed_lost", label: "Closed Lost", value: lostCount, sub: `₹${lostValue.toLocaleString("en-IN")} dropped value`, badge: "Drop-offs", icon: XCircle, tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30", filterKey: "lost", helpText: "Deals marked lost with recorded drop-off reasons." },
      { id: "deal_win_rate", label: "Deal Win Rate", value: winRateDisplay, sub: decidedTotal > 0 ? `(${wonCount} Won · ${decidedTotal} Decided)` : "No closed deals yet", badge: decidedTotal > 0 ? `${wonCount}W / ${lostCount}L` : "0 Decided", icon: Target, tone: "text-purple-600 bg-purple-50 dark:bg-purple-950/30", filterKey: "won", helpText: "Win rate calculated as (Closed Won / (Closed Won + Closed Lost)) × 100." },
    ];
  }

  if (viewMode === "commercials") {
    const useServerSummary =
      commercialSummary &&
      typeof commercialSummary.quotations === "number" &&
      ((commercialSummary.quotations + commercialSummary.agreements + commercialSummary.proposals) > (proposals.length + quotations.length + agreements.length));

    let quotationCount = proposals.length + quotations.length;
    let agreementCount = agreements.length;
    let sentCount = [...proposals, ...quotations, ...agreements].filter((item) => ["sent", "accepted", "signed"].includes(item.status)).length;
    let approvedCount = [...proposals, ...quotations, ...agreements].filter((item) => ["accepted", "signed"].includes(item.status)).length;

    if (useServerSummary) {
      quotationCount = (commercialSummary.quotations || 0) + (commercialSummary.proposals || 0);
      agreementCount = commercialSummary.agreements || 0;
      sentCount = (commercialSummary.paidInvoices || 0) + (commercialSummary.pendingInvoices || 0);
      approvedCount = commercialSummary.paidInvoices || 0;
    }

    return [
      { label: "Quotations", value: quotationCount, sub: "Proposal/quotation docs", icon: FileText, tone: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
      { label: "Agreements", value: agreementCount, sub: "Client agreement docs", icon: CheckCircle2, tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" },
      { label: "Sent", value: sentCount, sub: "Shared with client", icon: ExternalLink, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
      { label: "Approved", value: approvedCount, sub: "Accepted or signed", icon: ShieldAlert, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
    ];
  }

  if (viewMode === "followups") {
    const isScoped = followUpScope && followUpScope !== "all";
    const useServerSummary =
      !isScoped &&
      dateFilter === "all" &&
      followUpSummary &&
      typeof followUpSummary.total === "number" &&
      (followUpSummary.total > dateFilteredFollowUpsForStats.length || dateFilteredFollowUpsForStats.length === 0);

    let activeCount = 0;
    let overdueCount = 0;
    let pendingUpcoming = 0;
    let completedCount = 0;
    let missedCount = 0;

    if (useServerSummary) {
      activeCount = followUpSummary.active || 0;
      overdueCount = followUpSummary.overdue || 0;
      pendingUpcoming = followUpSummary.pending || 0;
      completedCount = followUpSummary.completed || 0;
      missedCount = followUpSummary.missed || 0;
    } else {
      const now = Date.now();
      const allFollowUps = dateFilteredFollowUpsForStats.filter((item) => {
        if (followUpScope === "leads") return Boolean(item.lead_id && !item.deal_id);
        if (followUpScope === "pipeline") return Boolean(item.deal_id);
        return true;
      });
      activeCount = allFollowUps.filter((item) => isFollowUpActive(item.status)).length;
      overdueCount = allFollowUps.filter((item) => isFollowUpOverdue(item, now)).length;
      pendingUpcoming = allFollowUps.filter((item) => isFollowUpUpcomingPending(item, now)).length;
      completedCount = allFollowUps.filter((item) => isFollowUpCompleted(item.status)).length;
      missedCount = allFollowUps.filter((item) => isFollowUpMissed(item.status)).length;
    }

    const scopeLabel =
      followUpScope === "leads" ? "Lead Follow-ups" : followUpScope === "pipeline" ? "Deal Follow-ups" : "Follow-ups";

    return [
      {
        id: "active_followups",
        label: `Active ${scopeLabel}`,
        value: activeCount,
        sub: overdueCount > 0 ? `${overdueCount} overdue · ${pendingUpcoming} upcoming` : "All open scheduled tasks",
        badge: overdueCount > 0 ? "Urgent" : "Active",
        icon: Phone,
        tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
        filterKey: "all",
        helpText: "Active follow-ups shown in the list (completed are archived in database & timeline).",
      },
      {
        id: "pending_followups",
        label: "Upcoming Pending",
        value: pendingUpcoming,
        sub: "Upcoming actions required",
        badge: "Open",
        icon: Calendar,
        tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
        filterKey: "pending",
        helpText: "Open follow-ups scheduled for today or future dates.",
      },
      {
        id: "overdue_followups",
        label: "Overdue",
        value: overdueCount,
        sub: "Past due action required",
        badge: overdueCount > 0 ? "Urgent" : null,
        icon: AlertCircle,
        tone: "text-red-600 bg-red-50 dark:bg-red-950/30",
        filterKey: "overdue",
        helpText: "Pending follow-ups whose due date has passed.",
      },
      {
        id: "completed_followups",
        label: "Completed (Saved)",
        value: completedCount,
        sub: "Stored safely in DB timeline",
        badge: "DB Archive",
        icon: CheckCircle2,
        tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
        filterKey: "done",
        helpText: "Follow-ups marked done. Safely preserved in database and lead A-Z timelines.",
      },
      {
        id: "missed_followups",
        label: "Missed",
        value: missedCount,
        sub: "Needs reschedule",
        icon: XCircle,
        tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
        filterKey: "missed",
        helpText: "Follow-ups marked as missed or requiring rescheduling.",
      },
    ];
  }

  if (viewMode === "sales_meetings") {
    const useServerSummary =
      dateFilter === "all" &&
      meetingSummary &&
      typeof meetingSummary.total === "number" &&
      (meetingSummary.total > dateFilteredMeetingsForStats.length || dateFilteredMeetingsForStats.length === 0);

    let activeCount = 0;
    let overdueCount = 0;
    let todayCount = 0;
    let completedCount = 0;
    let noShowCount = 0;

    if (useServerSummary) {
      activeCount = meetingSummary.active || 0;
      overdueCount = meetingSummary.overdue || 0;
      todayCount = meetingSummary.today || 0;
      completedCount = meetingSummary.completed || 0;
      noShowCount = meetingSummary.no_show || 0;
    } else {
      const now = Date.now();
      const allMeetings = dateFilteredMeetingsForStats;
      const todayStr = new Date().toDateString();
      activeCount = allMeetings.filter((item) => isMeetingActive(item.status)).length;
      overdueCount = allMeetings.filter((item) => isMeetingOverdue(item, now)).length;
      todayCount = allMeetings.filter(
        (item) => isMeetingActive(item.status) && item.scheduled_at && new Date(item.scheduled_at).toDateString() === todayStr
      ).length;
      completedCount = allMeetings.filter((item) => isMeetingCompleted(item.status)).length;
      noShowCount = allMeetings.filter((item) => isMeetingNoShow(item.status)).length;
    }

    return [
      {
        id: "active_meetings",
        label: "Upcoming Meetings",
        value: activeCount,
        sub: overdueCount > 0 ? `${overdueCount} passed · ${todayCount} today` : "Active pipeline calls",
        badge: overdueCount > 0 ? "Urgent" : todayCount > 0 ? `${todayCount} Today` : "Upcoming",
        icon: Video,
        tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
        filterKey: "all",
        helpText: "Active client discovery, demo, and quotation meetings scheduled.",
      },
      {
        id: "scheduled_meetings",
        label: "Scheduled Today",
        value: todayCount,
        sub: "Meetings scheduled for today",
        badge: "Today",
        icon: Calendar,
        tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
        filterKey: "today",
        helpText: "Meetings scheduled to be conducted today.",
      },
      {
        id: "overdue_meetings",
        label: "Passed / Overdue",
        value: overdueCount,
        sub: "Scheduled time has passed",
        badge: overdueCount > 0 ? "Urgent" : null,
        icon: AlertCircle,
        tone: "text-red-600 bg-red-50 dark:bg-red-950/30",
        filterKey: "overdue",
        helpText: "Active meetings whose scheduled time has passed without completion or no-show.",
      },
      {
        id: "completed_meetings",
        label: "Completed (Saved)",
        value: completedCount,
        sub: "Stored safely in DB timeline",
        badge: "DB Archive",
        icon: CheckCircle2,
        tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
        filterKey: "completed",
        helpText: "Conducted meetings safely saved in database and client timelines.",
      },
      {
        id: "no_show_meetings",
        label: "No Show / Missed",
        value: noShowCount,
        sub: "Client missed or cancelled",
        badge: noShowCount > 0 ? "Reschedule" : null,
        icon: XCircle,
        tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
        filterKey: "no_show",
        helpText: "Meetings where client did not attend or cancelled; follow up to reschedule.",
      },
    ];
  }

  return [];
}

export function buildAiInsights({ leads, deals, followUps, salesMeetings }) {
  const openLeads = leads.filter(
    (lead) => !["Converted", "Lost"].includes(lead.status) && !deals.some((deal) => deal.lead_id === lead.id)
  );
  const rankedLeads = openLeads
    .map((lead) => ({ lead, action: getLeadNextAction(lead, followUps, salesMeetings) }))
    .slice(0, 3);
  const overdueFollowUps = followUps.filter(
    (item) => item.status === "pending" && new Date(item.due_at).getTime() < Date.now()
  ).length;
  const staleDeals = deals.filter(
    (deal) =>
      !["closed_won", "closed_lost"].includes(deal.pipeline_stage) &&
      new Date(deal.updated_at || deal.created_at || Date.now()).getTime() < Date.now() - 7 * 86400000
  );
  const warmStaleDeals = deals.filter(
    (deal) =>
      !["closed_won", "closed_lost"].includes(deal.pipeline_stage) &&
      new Date(deal.updated_at || deal.created_at || Date.now()).getTime() < Date.now() - 3 * 86400000
  );
  return { rankedLeads, overdueFollowUps, staleDeals: staleDeals.length, staleDealsList: staleDeals, warmStaleDeals };
}

export function buildSalesReport({ leads, deals, followUps, leadSummary, dateFilter, matchesDateFilter }) {
  const completedFollowUps = followUps.filter((item) => item.status === "done" && matchesDateFilter(item, "completed_at")).length;
  const missedFollowUps = followUps.filter((item) => item.status === "missed" && matchesDateFilter(item, "updated_at")).length;
  const overdueFollowUps = followUps.filter((item) => item.status === "pending" && new Date(item.due_at).getTime() < Date.now()).length;
  const wonDeals = deals.filter((deal) => (deal.pipeline_stage || deal.stage) === "closed_won" && matchesDateFilter(deal, "updated_at")).length;
  const activeLeads = leads.filter((lead) => matchesDateFilter(lead, "created_at")).length;
  const totalBaseLeads = dateFilter === "all" ? Math.max(activeLeads, leadSummary?.total || 0) : activeLeads;
  const sourceMap = new Map();
  leads.forEach((lead) => {
    const source = lead.source || "Unknown";
    const row = sourceMap.get(source) || { source, leads: 0, won: 0, lost: 0, value: 0 };
    row.leads += 1;
    if (lead.status === "Lost") row.lost += 1;
    sourceMap.set(source, row);
  });
  deals.forEach((deal) => {
    const lead = leads.find((item) => item.id === deal.lead_id);
    const source = lead?.source || "Direct / Client";
    const row = sourceMap.get(source) || { source, leads: 0, won: 0, lost: 0, value: 0 };
    if ((deal.pipeline_stage || deal.stage) === "closed_won") {
      row.won += 1;
      row.value += Number(deal.deal_value || deal.value) || 0;
    }
    if ((deal.pipeline_stage || deal.stage) === "closed_lost") row.lost += 1;
    sourceMap.set(source, row);
  });
  return {
    completedFollowUps,
    missedFollowUps,
    overdueFollowUps,
    conversionRate: totalBaseLeads > 0 ? Math.round((wonDeals / totalBaseLeads) * 100) : 0,
    sourceRows: Array.from(sourceMap.values()).sort((a, b) => b.value - a.value).slice(0, 5),
  };
}
