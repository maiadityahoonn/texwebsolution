"use client";

import { CLOSED_PIPELINE_STAGES } from "../shared/leadUtils";

export function formatINR(val = 0) {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

export function normalizePipelineStage(stage) {
  if (!stage) return "contacted";
  const s = String(stage).toLowerCase().trim();
  if (s === "qualified" || s === "meeting" || s === "meeting_scheduled") return "qualified";
  if (s === "proposal" || s === "quotation" || s === "proposal_sent") return "proposal";
  if (s === "negotiation") return "negotiation";
  if (s === "closed_won" || s === "won") return "closed_won";
  if (s === "closed_lost" || s === "lost") return "closed_lost";
  if (s === "contacted" || s === "discovery") return "contacted";
  return s;
}

export function computeDashboardMetrics({
  leads = [],
  deals = [],
  followUps = [],
  salesMeetings = [],
  dateFilter = "all",
  matchesDateFilter = () => true,
}) {
  const filteredLeads = leads.filter((lead) => matchesDateFilter(lead, "created_at"));

  const filteredDeals = deals.filter(
    (deal) =>
      dateFilter === "all" ||
      matchesDateFilter(deal, "created_at") ||
      matchesDateFilter(deal, "updated_at")
  );

  const filteredFollowUps = followUps.filter((item) => matchesDateFilter(item, "due_at"));
  const filteredMeetings = salesMeetings.filter((item) => matchesDateFilter(item, "scheduled_at"));

  const now = Date.now();
  const todayStr = new Date().toDateString();

  // Deals breakdown with normalized stages
  const openDeals = filteredDeals.filter((d) => {
    const stage = normalizePipelineStage(d.pipeline_stage || d.stage);
    return !CLOSED_PIPELINE_STAGES.includes(stage);
  });
  const wonDeals = filteredDeals.filter(
    (d) => normalizePipelineStage(d.pipeline_stage || d.stage) === "closed_won"
  );
  const lostDeals = filteredDeals.filter(
    (d) => normalizePipelineStage(d.pipeline_stage || d.stage) === "closed_lost"
  );

  const activePipelineValue = openDeals.reduce(
    (sum, d) => sum + (Number(d.deal_value || d.value) || 0),
    0
  );
  const wonRevenue = wonDeals.reduce(
    (sum, d) => sum + (Number(d.deal_value || d.value) || 0),
    0
  );
  const lostValue = lostDeals.reduce(
    (sum, d) => sum + (Number(d.deal_value || d.value) || 0),
    0
  );

  const decidedCount = wonDeals.length + lostDeals.length;
  const winRate = decidedCount > 0 ? (wonDeals.length / decidedCount) * 100 : 0;
  const winRateDisplay = winRate % 1 === 0 ? `${winRate}%` : `${winRate.toFixed(1)}%`;

  // Follow-ups breakdown
  const pendingFollowUps = filteredFollowUps.filter((item) => item.status === "pending");
  const overdueFollowUps = pendingFollowUps.filter(
    (item) => item.due_at && new Date(item.due_at).getTime() < now
  );
  const todayFollowUps = pendingFollowUps.filter(
    (item) => item.due_at && new Date(item.due_at).toDateString() === todayStr
  );
  const completedFollowUps = filteredFollowUps.filter((item) => item.status === "done");

  // Meetings breakdown
  const scheduledMeetings = filteredMeetings.filter((item) => item.status === "scheduled");
  const todayMeetings = scheduledMeetings.filter(
    (item) => item.scheduled_at && new Date(item.scheduled_at).toDateString() === todayStr
  );
  const completedMeetings = filteredMeetings.filter((item) => item.status === "completed");

  // Leads breakdown
  const newLeads = filteredLeads.filter(
    (l) => !l.status || ["New", "active", "inquiry"].includes(l.status?.toLowerCase())
  );
  const convertedLeads = filteredLeads.filter(
    (l) => ["converted", "closed won"].includes(l.status?.toLowerCase())
  );

  // Pipeline Stages Funnel (Keys matching actual database stage IDs: contacted, qualified, proposal, negotiation, closed_won)
  const STAGES_CONFIG = [
    { key: "contacted", label: "Contacted / Discovery", tone: "bg-blue-500", textTone: "text-blue-600" },
    { key: "qualified", label: "Meeting Scheduled", tone: "bg-indigo-500", textTone: "text-indigo-600" },
    { key: "proposal", label: "Proposal / Quotation", tone: "bg-purple-500", textTone: "text-purple-600" },
    { key: "negotiation", label: "Negotiation", tone: "bg-amber-500", textTone: "text-orange-600" },
    { key: "closed_won", label: "Closed Won", tone: "bg-emerald-500", textTone: "text-emerald-600" },
  ];

  const activeAndWonDeals = filteredDeals.filter(
    (d) => normalizePipelineStage(d.pipeline_stage || d.stage) !== "closed_lost"
  );
  const totalDealsForFunnel = Math.max(activeAndWonDeals.length, 1);
  const stageStats = STAGES_CONFIG.map((stage) => {
    const stageDeals = filteredDeals.filter(
      (d) => normalizePipelineStage(d.pipeline_stage || d.stage) === stage.key
    );
    const stageValue = stageDeals.reduce(
      (sum, d) => sum + (Number(d.deal_value || d.value) || 0),
      0
    );
    const count = stageDeals.length;
    const percentage = Math.round((count / totalDealsForFunnel) * 100);
    return {
      ...stage,
      count,
      value: stageValue,
      percentage,
    };
  });

  // Source Breakdown
  const sourceMap = new Map();
  const leadsById = new Map(filteredLeads.map((lead) => [lead.id, lead]));
  filteredLeads.forEach((lead) => {
    const rawSource = lead.source || lead.lead_source || "Website Inbound";
    const src = rawSource.trim();
    if (!sourceMap.has(src)) {
      sourceMap.set(src, { source: src, leads: 0, won: 0, value: 0 });
    }
    const row = sourceMap.get(src);
    row.leads += 1;
  });

  wonDeals.forEach((deal) => {
    const linkedLead = leadsById.get(deal.lead_id);
    const rawSource = linkedLead?.source || linkedLead?.lead_source || deal.source || "Direct / Client";
    const src = String(rawSource).trim() || "Direct / Client";
    const row = sourceMap.get(src) || { source: src, leads: 0, won: 0, value: 0 };
    if (!linkedLead) {
      row.leads += 1;
    }
    row.won += 1;
    row.value += Number(deal.deal_value || deal.value) || 0;
    sourceMap.set(src, row);
  });

  const sourceRows = Array.from(sourceMap.values()).sort((a, b) => b.leads - a.leads);

  return {
    filteredLeads,
    filteredDeals,
    filteredFollowUps,
    filteredMeetings,
    openDeals,
    wonDeals,
    lostDeals,
    activePipelineValue,
    wonRevenue,
    lostValue,
    winRate,
    winRateDisplay,
    decidedCount,
    pendingFollowUps,
    overdueFollowUps,
    todayFollowUps,
    completedFollowUps,
    scheduledMeetings,
    todayMeetings,
    completedMeetings,
    newLeads,
    convertedLeads,
    stageStats,
    sourceRows,
  };
}
