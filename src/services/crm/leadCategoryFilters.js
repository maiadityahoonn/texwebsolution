const DIRECT_PIPELINE_STATUSES = [
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "In Pipeline",
  "Negotiation",
  "In Progress",
];

const DIRECT_CONVERTED_STATUSES = ["Converted", "Closed Won"];
const DIRECT_LOST_STATUSES = ["Lost"];
export const NON_ACTIVE_LEAD_STATUSES = [
  ...DIRECT_PIPELINE_STATUSES,
  ...DIRECT_CONVERTED_STATUSES,
  ...DIRECT_LOST_STATUSES,
  "Archived",
];
export const TERMINAL_LEAD_STATUSES = new Set([
  ...DIRECT_CONVERTED_STATUSES,
  ...DIRECT_LOST_STATUSES,
  "Archived",
]);

export const CLOSED_DEAL_STAGES = new Set(["closed_won", "closed_lost", "lost", "abandoned", "dropped"]);

export function isActiveDealStage(stage = "") {
  return !CLOSED_DEAL_STAGES.has(stage);
}

export function buildActiveEngagementScopes(leads = [], deals = []) {
  const activeDealIds = new Set();
  const activeDealLeadIds = new Set();
  const allDealLeadIds = new Set();
  const terminalLeadIds = new Set(
    leads.filter((lead) => lead?.id && TERMINAL_LEAD_STATUSES.has(lead.status)).map((lead) => lead.id)
  );

  deals.forEach((deal) => {
    if (deal?.lead_id) allDealLeadIds.add(deal.lead_id);
    if (
      !deal?.id ||
      terminalLeadIds.has(deal.lead_id) ||
      !isActiveDealStage(deal.pipeline_stage || deal.stage || "")
    ) return;
    activeDealIds.add(deal.id);
    if (deal?.lead_id) activeDealLeadIds.add(deal.lead_id);
  });

  const activeLeadIds = new Set(
    leads
      .filter((lead) => (
        lead?.id &&
        !allDealLeadIds.has(lead.id) &&
        !NON_ACTIVE_LEAD_STATUSES.includes(lead.status)
      ))
      .map((lead) => lead.id)
  );

  return { activeDealIds, activeDealLeadIds, activeLeadIds };
}

function toPostgrestInList(values = []) {
  return `(${values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(",")})`;
}

export function buildLeadDealScopes(deals = []) {
  const all = new Set();
  const active = new Set();
  const won = new Set();
  const lost = new Set();

  deals.forEach((deal) => {
    const leadId = deal?.lead_id;
    if (!leadId) return;
    const stage = deal.pipeline_stage || deal.stage || "";
    all.add(leadId);
    if (stage === "closed_won") won.add(leadId);
    else if (stage === "closed_lost") lost.add(leadId);
    else if (!CLOSED_DEAL_STAGES.has(stage)) active.add(leadId);
  });

  // A lead must appear in one card only. Closed outcomes take priority over an
  // accidentally retained older active deal.
  won.forEach((leadId) => {
    lost.delete(leadId);
    active.delete(leadId);
  });
  lost.forEach((leadId) => active.delete(leadId));

  return { all: [...all], active: [...active], won: [...won], lost: [...lost] };
}

function directStatusClause(statuses, allDealLeadIds) {
  const statusClause = `status.in.${toPostgrestInList(statuses)}`;
  if (allDealLeadIds.length === 0) return statusClause;
  return `and(${statusClause},id.not.in.${toPostgrestInList(allDealLeadIds)})`;
}

export function applyLeadCategoryFilter(query, category, scopes) {
  const allDealLeadIds = scopes?.all || [];

  if (category === "active") {
    if (allDealLeadIds.length > 0) query = query.not("id", "in", toPostgrestInList(allDealLeadIds));
    return query.or(`status.is.null,status.not.in.${toPostgrestInList(NON_ACTIVE_LEAD_STATUSES)}`);
  }

  const categoryConfig = {
    pipeline: { dealIds: scopes?.active || [], statuses: DIRECT_PIPELINE_STATUSES },
    converted: { dealIds: scopes?.won || [], statuses: DIRECT_CONVERTED_STATUSES },
    lost: { dealIds: scopes?.lost || [], statuses: DIRECT_LOST_STATUSES },
  }[category];

  if (!categoryConfig) return query;
  const clauses = [directStatusClause(categoryConfig.statuses, allDealLeadIds)];
  if (categoryConfig.dealIds.length > 0) {
    clauses.unshift(`id.in.${toPostgrestInList(categoryConfig.dealIds)}`);
  }
  return query.or(clauses.join(","));
}
