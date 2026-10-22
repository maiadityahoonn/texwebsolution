import { CLOSED_DEAL_STAGES } from "@/services/crm/leadCategoryFilters";

export function findDealForRelationship(payload = {}, deals = []) {
  if (payload?.deal_id) {
    return deals.find((deal) => String(deal.id) === String(payload.deal_id)) || null;
  }
  if (!payload?.lead_id) return null;
  const linkedDeals = deals.filter((deal) => String(deal.lead_id || "") === String(payload.lead_id));
  return linkedDeals.find((deal) => !CLOSED_DEAL_STAGES.has(deal.pipeline_stage || deal.stage || ""))
    || linkedDeals[0]
    || null;
}

export function normalizeEngagementRelationship(payload = {}, deals = []) {
  const deal = findDealForRelationship(payload, deals);
  return {
    ...payload,
    lead_id: payload.lead_id || deal?.lead_id || null,
    deal_id: payload.deal_id || deal?.id || null,
  };
}

export function normalizeDocumentRelationship(payload = {}, deals = []) {
  const deal = findDealForRelationship(payload, deals);
  return {
    ...payload,
    deal_id: payload.deal_id || deal?.id || null,
    lead_id: payload.lead_id || deal?.lead_id || null,
  };
}
