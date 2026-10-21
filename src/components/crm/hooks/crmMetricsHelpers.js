"use client";

import { CLOSED_PIPELINE_STAGES } from "../shared/leadUtils";
import { getLeadComputedCategory } from "./crmLeadFilterHelpers";

export function calculateAggregateStats({
  leads = [],
  deals = [],
  leadSummary = null,
  leadPagination = null,
  dateFilter = "all",
  dateFilteredLeadsForStats = [],
  dateFilteredPipelineDealsForStats = [],
}) {
  const serverTotal = leadSummary?.total ?? (leadPagination?.count || 0);
  const leadsForStats = dateFilter === "all" ? (dateFilteredLeadsForStats.length > 0 ? dateFilteredLeadsForStats : leads) : dateFilteredLeadsForStats;
  const dealsForStats = dateFilter === "all" ? deals : dateFilteredPipelineDealsForStats;
  const total =
    dateFilter === "all"
      ? (serverTotal > dateFilteredLeadsForStats.length ? serverTotal : (dateFilteredLeadsForStats.length || serverTotal || leads.length))
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

  let convertedCount =
    leadsForStats.filter((l) => {
      if (wonDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return l.status === "Converted" || l.status === "Closed Won";
    }).length + dealsForStats.filter((d) => (d.pipeline_stage || d.stage) === "closed_won" && !d.lead_id).length;

  let lostCount =
    leadsForStats.filter((l) => {
      if (lostDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
      return l.status === "Lost";
    }).length + dealsForStats.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost" && !d.lead_id).length;

  if (dateFilter === "all" && leadSummary?.total > dateFilteredLeadsForStats.length) {
    if (typeof leadSummary.converted === "number") convertedCount = leadSummary.converted;
    if (typeof leadSummary.lost === "number") lostCount = leadSummary.lost;
  }

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
  const serverTotal = leadSummary?.total ?? (leadPagination?.count || 0);
  const hasSummaryBreakdown =
    typeof leadSummary?.active === "number" &&
    typeof leadSummary?.lost === "number" &&
    typeof leadSummary?.pipeline === "number";

  const useServerSummary = hasSummaryBreakdown;

  let totalLeads = useServerSummary ? serverTotal : (dateFilteredLeadsForStats.length || serverTotal);

  let activeCount = 0;
  let pipelineCount = 0;
  let convertedCount = 0;
  let lostCount = 0;

  if (useServerSummary) {
    totalLeads = serverTotal;
    convertedCount = leadSummary.converted || 0;
    lostCount = leadSummary.lost || 0;
    pipelineCount = leadSummary.pipeline || 0;
    activeCount = leadSummary.active ?? Math.max(0, totalLeads - pipelineCount - convertedCount - lostCount);
  } else {
    dateFilteredLeadsForStats.forEach((lead) => {
      const cat = getLeadComputedCategory(lead, deals);
      if (cat === "converted") convertedCount++;
      else if (cat === "lost") lostCount++;
      else if (cat === "pipeline") pipelineCount++;
      else activeCount++;
    });
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
