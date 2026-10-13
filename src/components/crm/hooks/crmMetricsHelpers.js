"use client";

import { CLOSED_PIPELINE_STAGES } from "../shared/leadUtils";

export function calculateAggregateStats({
  leads = [],
  deals = [],
  leadSummary = null,
  dateFilter = "all",
  dateFilteredLeadsForStats = [],
  dateFilteredPipelineDealsForStats = [],
}) {
  const leadsForStats = dateFilter === "all" ? leads : dateFilteredLeadsForStats;
  const dealsForStats = dateFilter === "all" ? deals : dateFilteredPipelineDealsForStats;
  const total =
    dateFilter === "all"
      ? (leadSummary?.total ?? leads.length)
      : dateFilteredLeadsForStats.length;
  const newCount = leadsForStats.filter((l) => l.status === "New" && !dealsForStats.some((d) => d.lead_id === l.id)).length;

  const wonDealLeadIds = new Set(
    dealsForStats
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_won")
      .map((d) => d.lead_id)
      .filter(Boolean)
  );
  const activePipelineLeadIds = new Set(
    dealsForStats
      .filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage))
      .map((d) => d.lead_id)
      .filter(Boolean)
  );
  const lostDealLeadIds = new Set(
    dealsForStats
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_lost")
      .map((d) => d.lead_id)
      .filter(Boolean)
  );

  const convertedCount =
    leadsForStats.filter((l) => {
      if (wonDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return l.status === "Converted" || l.status === "Closed Won";
    }).length + dealsForStats.filter((d) => (d.pipeline_stage || d.stage) === "closed_won" && !d.lead_id).length;

  const lostCount =
    leadsForStats.filter((l) => {
      if (lostDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
      return l.status === "Lost";
    }).length + dealsForStats.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost" && !d.lead_id).length;

  const lostDealsCount = dealsForStats.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").length;
  const rate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;
  const totalPipelineValue = dealsForStats
    .filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage))
    .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);
  const wonValue = dealsForStats
    .filter((d) => (d.pipeline_stage || d.stage) === "closed_won")
    .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);
  const lostValue = dealsForStats
    .filter((d) => (d.pipeline_stage || d.stage) === "closed_lost")
    .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);

  return { total, newCount, convertedCount, lostCount, lostDealsCount, rate, totalPipelineValue, wonValue, lostValue };
}

export function calculateLeadSummaryMetrics({
  dateFilter = "all",
  dateFilteredLeadsForStats = [],
  deals = [],
  leadPagination = null,
  leadSummary = null,
}) {
  const totalLeads =
    dateFilter === "all"
      ? (leadSummary?.total ?? (leadPagination?.count || dateFilteredLeadsForStats.length))
      : dateFilteredLeadsForStats.length;

  const wonDealLeadIds = new Set(
    deals
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_won")
      .map((d) => d.lead_id)
      .filter(Boolean)
  );
  const activePipelineLeadIds = new Set(
    deals
      .filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage))
      .map((d) => d.lead_id)
      .filter(Boolean)
  );
  const lostDealLeadIds = new Set(
    deals
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_lost")
      .map((d) => d.lead_id)
      .filter(Boolean)
  );

  let convertedCount = dateFilteredLeadsForStats.filter((l) => {
    if (wonDealLeadIds.has(l.id)) return true;
    if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
    return l.status === "Converted" || l.status === "Closed Won";
  }).length;

  let lostCount = dateFilteredLeadsForStats.filter((l) => {
    if (lostDealLeadIds.has(l.id)) return true;
    if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
    return l.status === "Lost";
  }).length;

  let pipelineCount = dateFilteredLeadsForStats.filter((l) => {
    if (activePipelineLeadIds.has(l.id)) return true;
    if (wonDealLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
    return ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(
      l.status
    );
  }).length;

  let activeCount = Math.max(0, totalLeads - pipelineCount - convertedCount - lostCount);

  const hasSummaryBreakdown =
    typeof leadSummary?.active === "number" &&
    typeof leadSummary?.lost === "number" &&
    typeof leadSummary?.pipeline === "number";

  if (dateFilter === "all" && hasSummaryBreakdown && dateFilteredLeadsForStats.length < totalLeads) {
    convertedCount = leadSummary.converted ?? convertedCount;
    lostCount = leadSummary.lost ?? lostCount;
    pipelineCount = leadSummary.pipeline ?? pipelineCount;
    activeCount = leadSummary.active ?? Math.max(0, totalLeads - pipelineCount - convertedCount - lostCount);
  }

  const convRateNumber = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;
  const convRateDisplay = convRateNumber % 1 === 0 ? `${convRateNumber}%` : `${convRateNumber.toFixed(1)}%`;
  const decidedTotal = convertedCount + lostCount;
  const winRateNumber = decidedTotal > 0 ? (convertedCount / decidedTotal) * 100 : 0;
  const winRateDisplay = winRateNumber % 1 === 0 ? `${winRateNumber}%` : `${winRateNumber.toFixed(1)}%`;

  return {
    totalLeads,
    activeCount,
    pipelineCount,
    convertedCount,
    lostCount,
    decidedTotal,
    convRateNumber,
    convRateDisplay,
    winRateNumber,
    winRateDisplay,
  };
}
