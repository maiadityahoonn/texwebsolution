"use client";

import { CLOSED_PIPELINE_STAGES } from "../shared/leadUtils";
import {
  extractFirstEmail,
  extractFirstPhone,
  getLeadMetaId,
  getLeadSearchBlob,
  normalizeLeadEmail,
  normalizeLeadName,
  normalizeLeadPhone,
} from "./crmCalculationUtils";

export function getLeadDuplicateKeyForRow(lead) {
  const metaId = getLeadMetaId(lead);
  if (metaId) return `meta:${metaId}`;
  const blob = getLeadSearchBlob(lead);
  const phone = normalizeLeadPhone(lead?.phone || lead?.mobile) || extractFirstPhone(blob);
  if (phone) return `phone:${phone}`;
  const email = normalizeLeadEmail(lead?.email) || extractFirstEmail(blob);
  if (email) return `email:${email}`;
  const name = normalizeLeadName(lead?.name || lead?.full_name || lead?.raw_metadata?.name || lead?.raw_metadata?.["पूरा_नाम"]);
  const city = normalizeLeadName(lead?.city || lead?.raw_metadata?.city);
  const state = normalizeLeadName(lead?.state || lead?.raw_metadata?.state);
  const service = normalizeLeadName(lead?.service || lead?.raw_metadata?.service);
  if (name && (city || state || service)) return `profile:${name}:${city}:${state}:${service}`;
  return `row:${lead?.id || Math.random()}`;
}

export function dedupeLeads(leads = []) {
  const sorted = [...leads].sort((a, b) => {
    const aTime = new Date(a?.created_at || a?.updated_at || 0).getTime();
    const bTime = new Date(b?.created_at || b?.updated_at || 0).getTime();
    return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  });
  const seen = new Set();
  return sorted.filter((lead) => {
    const key = getLeadDuplicateKeyForRow(lead);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getLeadComputedCategory(lead, deals = []) {
  const linkedDeal = deals.find((deal) => deal.lead_id === lead.id);
  const isInPipeline = Boolean(
    linkedDeal && !CLOSED_PIPELINE_STAGES.includes(linkedDeal.pipeline_stage || linkedDeal.stage)
  );
  const hasWonDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_won");
  const hasLostDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_lost");

  const isConverted = hasWonDeal || (!linkedDeal && (lead.status === "Converted" || lead.status === "Closed Won"));
  if (isConverted) return "converted";

  const isLost = hasLostDeal || (!linkedDeal && lead.status === "Lost");
  if (isLost) return "lost";

  const isPipelineLead =
    isInPipeline ||
    (!linkedDeal &&
      ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(lead.status));
  if (isPipelineLead) return "pipeline";

  return "active";
}

export function matchesLeadStatusFilter(category, statusFilter) {
  if (statusFilter === "all" || !statusFilter) return true;
  if (statusFilter === "active") return category === "active";
  if (statusFilter === "pipeline") return category === "pipeline";
  if (statusFilter === "converted" || statusFilter === "won") return category === "converted";
  if (statusFilter === "lost") return category === "lost";
  return true;
}

export function calculateLeadLetterCounts({
  dedupedLeads = [],
  deals = [],
  statusFilter = "active",
  matchesDateFilterFn,
}) {
  const counts = {};
  dedupedLeads.forEach((lead) => {
    const category = getLeadComputedCategory(lead, deals);
    const matchStatus = matchesLeadStatusFilter(category, statusFilter);
    const matchDate = matchesDateFilterFn(lead);

    if (matchStatus && matchDate) {
      const first = (lead.name || "").trim().toUpperCase().charAt(0);
      if (/[A-Z]/.test(first)) {
        counts[first] = (counts[first] || 0) + 1;
      } else if (first) {
        counts["#"] = (counts["#"] || 0) + 1;
      }
    }
  });
  return counts;
}

export function filterLeadsList({
  dedupedLeads = [],
  deals = [],
  query = "",
  statusFilter = "active",
  leadAlphabetFilter = "all",
  leadSortOrder = "default",
  matchesDateFilterFn,
}) {
  const q = query.trim().toLowerCase();
  const result = dedupedLeads.filter((lead) => {
    const category = getLeadComputedCategory(lead, deals);
    const matchStatus = matchesLeadStatusFilter(category, statusFilter);

    const matchDate = matchesDateFilterFn(lead);
    const matchQuery =
      !q ||
      [lead.name, lead.phone, lead.email, lead.service, lead.source, lead.city, lead.state].some((val) =>
        String(val || "").toLowerCase().includes(q)
      );

    const firstChar = (lead.name || "").trim().toUpperCase().charAt(0);
    const matchAlphabet =
      leadAlphabetFilter === "all"
        ? true
        : leadAlphabetFilter === "#"
        ? !/[A-Z]/.test(firstChar)
        : firstChar === leadAlphabetFilter;

    return matchStatus && matchQuery && matchDate && matchAlphabet;
  });

  if (leadSortOrder === "asc" || (leadSortOrder === "default" && leadAlphabetFilter !== "all")) {
    result.sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
    );
  } else if (leadSortOrder === "desc") {
    result.sort((a, b) =>
      String(b.name || "").localeCompare(String(a.name || ""), undefined, { sensitivity: "base" })
    );
  }

  return result;
}
