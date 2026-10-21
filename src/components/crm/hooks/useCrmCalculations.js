"use client";

import { useMemo, useCallback } from "react";
import { CLOSED_PIPELINE_STAGES } from "../shared/leadUtils";
import { buildAiInsights, buildPageStatusCards, buildSalesReport } from "./crmDerivedMetrics";
import { matchesDateFilter as matchesDateFilterUtil, getLeadServerDateRange as getLeadServerDateRangeUtil } from "./crmDateFilterUtils";
import { dedupeLeads, calculateLeadLetterCounts, filterLeadsList } from "./crmLeadFilterHelpers";
import { calculateAggregateStats, calculateLeadSummaryMetrics } from "./crmMetricsHelpers";
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

export function useCrmCalculations({
  leads = [],
  deals = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  followUps = [],
  salesMeetings = [],
  leadSummary = null,
  leadPagination = null,
  dealPagination = null,
  followUpPagination = null,
  meetingPagination = null,
  dealSummary = null,
  followUpSummary = null,
  meetingSummary = null,
  commercialSummary = null,
  isLoading = false,
  viewMode = "leads",
  commercialScope = "all",
  followUpScope = "all",
  query = "",
  statusFilter = "active",
  leadAlphabetFilter = "all",
  leadSortOrder = "default",
  leadPage = 1,
  leadsPerPage = 10,
  followUpPage = 1,
  followUpPageSize = 10,
  meetingPage = 1,
  meetingPageSize = 50,
  dateFilter = "all",
  selectedDate = "",
  customDateRange = { from: "", to: "" },
  clients = [],
  onFetchMeetingsPage = null,
}) {
  const matchesDateFilter = useCallback(
    (item, field = "created_at") =>
      matchesDateFilterUtil(item, field, { dateFilter, selectedDate, customDateRange }),
    [dateFilter, selectedDate, customDateRange]
  );

  const getLeadServerDateRange = useCallback(
    () => getLeadServerDateRangeUtil({ dateFilter, selectedDate, customDateRange }),
    [dateFilter, selectedDate, customDateRange]
  );

  const getServerDateRange = useCallback(() => getLeadServerDateRange(), [getLeadServerDateRange]);

  const dedupedLeads = useMemo(() => dedupeLeads(leads), [leads]);

  const leadLetterCounts = useMemo(
    () =>
      calculateLeadLetterCounts({
        dedupedLeads,
        deals,
        statusFilter,
        matchesDateFilterFn: matchesDateFilter,
      }),
    [dedupedLeads, deals, matchesDateFilter, statusFilter]
  );

  const totalLettersCount = useMemo(() => {
    return Object.values(leadLetterCounts).reduce((a, b) => a + b, 0);
  }, [leadLetterCounts]);

  const filteredLeads = useMemo(
    () =>
      filterLeadsList({
        dedupedLeads,
        deals,
        query,
        statusFilter,
        leadAlphabetFilter,
        leadSortOrder,
        matchesDateFilterFn: matchesDateFilter,
      }),
    [dedupedLeads, deals, query, statusFilter, leadAlphabetFilter, leadSortOrder, matchesDateFilter]
  );

  const leadTotalForPagination = useMemo(() => {
    if (dateFilter !== "all" || query || leadAlphabetFilter !== "all") {
      return filteredLeads.length;
    }
    if (statusFilter === "all") {
      const total = leadSummary?.total ?? leadPagination?.count ?? 0;
      return total > filteredLeads.length ? total : filteredLeads.length;
    }
    const statusTotalMap = {
      active: leadSummary?.active,
      pipeline: leadSummary?.pipeline,
      converted: leadSummary?.converted,
      lost: leadSummary?.lost,
    };
    const expectedServerCount = statusTotalMap[statusFilter];
    if (typeof expectedServerCount === "number" && expectedServerCount > filteredLeads.length) {
      return expectedServerCount;
    }
    return filteredLeads.length;
  }, [dateFilter, query, leadAlphabetFilter, statusFilter, leadSummary, leadPagination?.count, filteredLeads.length]);
  const leadPageCount = Math.max(1, Math.ceil(leadTotalForPagination / leadsPerPage));
  const safeLeadPage = Math.min(Math.max(1, leadPage), leadPageCount);
  const paginatedLeads = useMemo(() => {
    const start = (safeLeadPage - 1) * leadsPerPage;
    return filteredLeads.slice(start, start + leadsPerPage);
  }, [filteredLeads, leadsPerPage, safeLeadPage]);

  const commercialDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = [
      ...proposals.map((item) => ({ ...item, docType: "proposal_quote" })),
      ...quotations.map((item) => ({ ...item, docType: "proposal_quote" })),
      ...agreements.map((item) => ({ ...item, docType: "agreement" })),
      ...invoices.map((item) => ({ ...item, docType: "invoice" })),
    ];
    return rows.filter((item) => {
      if (commercialScope === "proposal_quote" && item.docType !== "proposal_quote") return false;
      if (commercialScope === "agreement" && item.docType !== "agreement") return false;
      if (commercialScope === "invoice" && item.docType !== "invoice") return false;
      if (viewMode === "invoices" && item.docType !== "invoice") return false;
      if (viewMode === "payments" && item.docType !== "invoice") return false;
      if (viewMode === "commercials" && commercialScope === "all" && item.docType === "invoice") return false;
      if (!matchesDateFilter(item, item.docType === "agreement" ? "start_date" : item.docType === "invoice" ? "due_date" : "created_at")) return false;
      const client = clients.find((c) => c.id === item.client_id);
      return (
        !q ||
        [item.title, item.quotation_number, item.agreement_number, item.invoice_number, item.status, client?.name, client?.company_name].some(
          (value) => String(value || "").toLowerCase().includes(q)
        )
      );
    });
  }, [agreements, clients, commercialScope, invoices, matchesDateFilter, proposals, query, quotations, viewMode]);

  const filteredFollowUps = useMemo(() => {
    const now = Date.now();
    return followUps
      .filter((item) => {
        if (followUpScope === "leads" && (!item.lead_id || item.deal_id)) {
          return false;
        }
        if (followUpScope === "pipeline" && !item.deal_id) {
          return false;
        }

        if (dateFilter !== "all") {
          const matchesDue = matchesDateFilter(item, "due_at");
          const matchesCreated = matchesDateFilter(item, "created_at");
          if (!matchesDue && !matchesCreated) return false;
        }

        if (statusFilter === "done" || statusFilter === "completed") {
          return isFollowUpCompleted(item.status);
        }
        if (statusFilter === "overdue") {
          return isFollowUpOverdue(item, now);
        }
        if (statusFilter === "missed") {
          return isFollowUpMissed(item.status);
        }
        if (statusFilter === "pending" || statusFilter === "active") {
          return isFollowUpUpcomingPending(item, now);
        }
        if (statusFilter === "all_with_completed") {
          return true;
        }

        // Default 'all' or empty: Show actionable active follow-ups (pending & overdue), strictly exclude completed & missed
        return isFollowUpActive(item.status);
      })
      .sort((a, b) => {
        const nowMs = Date.now();
        const aOverdue = isFollowUpOverdue(a, nowMs) ? 1 : 0;
        const bOverdue = isFollowUpOverdue(b, nowMs) ? 1 : 0;
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;

        const aDue = new Date(a.due_at || 0).getTime();
        const bDue = new Date(b.due_at || 0).getTime();
        if (aDue && bDue && Math.abs(aDue - bDue) > 1000) {
          return aDue - bDue;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [followUps, matchesDateFilter, statusFilter, dateFilter, followUpScope]);

  const filteredSalesMeetings = useMemo(() => {
    const now = Date.now();
    const todayStr = new Date().toDateString();
    return salesMeetings
      .filter((item) => {
        if (!matchesDateFilter(item, "scheduled_at")) return false;
        const isToday = Boolean(
          isMeetingActive(item.status) &&
          item.scheduled_at &&
          new Date(item.scheduled_at).toDateString() === todayStr
        );

        if (statusFilter === "completed" || statusFilter === "done") {
          return isMeetingCompleted(item.status);
        }
        if (statusFilter === "no_show" || statusFilter === "cancelled" || statusFilter === "missed") {
          return isMeetingNoShow(item.status);
        }
        if (statusFilter === "overdue" || statusFilter === "passed") {
          return isMeetingOverdue(item, now);
        }
        if (statusFilter === "today") {
          return isToday;
        }
        if (statusFilter === "scheduled" || statusFilter === "pending" || statusFilter === "active") {
          return isMeetingActive(item.status);
        }
        if (statusFilter === "all_with_completed") {
          return true;
        }

        // Default 'all' or empty: Show upcoming active meetings, strictly exclude completed and no_show
        return isMeetingActive(item.status);
      })
      .sort((a, b) => {
        const nowMs = Date.now();
        const aOverdue = isMeetingOverdue(a, nowMs) ? 1 : 0;
        const bOverdue = isMeetingOverdue(b, nowMs) ? 1 : 0;
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;

        const aSched = isMeetingActive(a.status) ? 1 : 0;
        const bSched = isMeetingActive(b.status) ? 1 : 0;
        if (aSched !== bSched) return bSched - aSched;

        const aTime = new Date(a.scheduled_at || 0).getTime();
        const bTime = new Date(b.scheduled_at || 0).getTime();
        if (aTime && bTime && Math.abs(aTime - bTime) > 1000) {
          return aTime - bTime;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [matchesDateFilter, salesMeetings, statusFilter]);

  const allPipelineDeals = useMemo(() => {
    const existingDealLeadIds = new Set(deals.map((d) => d.lead_id).filter(Boolean));
    const list = [...deals];
    leads.forEach((l) => {
      const isLeadWon = l.status === "Converted" || l.status === "Closed Won";
      if (isLeadWon && !existingDealLeadIds.has(l.id)) {
        list.push({
          id: `lead-converted-${l.id}`,
          title: l.name ? `${l.name} - ${l.service || "Tech Development"}` : "Converted Lead",
          lead_id: l.id,
          pipeline_stage: "closed_won",
          stage: "closed_won",
          deal_value: Number(l.deal_value || l.budget || 0) || 50000,
          currency: "INR",
          service: l.service || "Tech Development",
          created_at: l.created_at,
          updated_at: l.updated_at || l.created_at,
          notes: l.notes || `Converted from lead: ${l.name}`,
        });
      }
    });
    return list;
  }, [deals, leads]);

  const visiblePipelineDeals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allPipelineDeals.filter((deal) => {
      const stage = deal.pipeline_stage || deal.stage || "contacted";
      if (dateFilter !== "all" && !matchesDateFilter(deal, "created_at") && !matchesDateFilter(deal, "updated_at"))
        return false;
      if (normalizedQuery) {
        const linkedLead = dedupedLeads.find((lead) => String(lead.id) === String(deal.lead_id));
        const searchableValues = [
          deal.title,
          deal.service,
          deal.notes,
          deal.loss_reason,
          linkedLead?.name,
          linkedLead?.phone,
          linkedLead?.email,
          linkedLead?.city,
          linkedLead?.state,
        ];
        if (!searchableValues.some((value) => String(value || "").toLowerCase().includes(normalizedQuery))) {
          return false;
        }
      }
      if (statusFilter === "lost") return stage === "closed_lost";
      if (statusFilter === "won" || statusFilter === "converted") return stage === "closed_won";
      if (statusFilter === "active") return !CLOSED_PIPELINE_STAGES.includes(stage);
      return true;
    });
  }, [allPipelineDeals, dateFilter, dedupedLeads, matchesDateFilter, query, statusFilter]);

  const followUpTotal = useMemo(() => {
    if (dateFilter !== "all" || query || (followUpScope && followUpScope !== "all")) {
      return filteredFollowUps.length;
    }
    if (statusFilter === "all") {
      const total = followUpSummary?.total ?? followUpPagination?.count ?? 0;
      return total > filteredFollowUps.length ? total : filteredFollowUps.length;
    }
    const statusTotalMap = {
      pending: followUpSummary?.active,
      active: followUpSummary?.active,
      overdue: followUpSummary?.overdue,
      done: followUpSummary?.completed,
      completed: followUpSummary?.completed,
      missed: followUpSummary?.missed,
    };
    const expected = statusTotalMap[statusFilter];
    if (typeof expected === "number" && expected > filteredFollowUps.length) {
      return expected;
    }
    return filteredFollowUps.length;
  }, [dateFilter, query, statusFilter, followUpSummary, followUpPagination?.count, filteredFollowUps.length, followUpScope]);
  const followUpPageCount = Math.max(1, Math.ceil(followUpTotal / followUpPageSize));
  const safeFollowUpPage = Math.min(Math.max(1, followUpPage), followUpPageCount);
  const paginatedFollowUps = useMemo(() => {
    const start = (safeFollowUpPage - 1) * followUpPageSize;
    return filteredFollowUps.slice(start, start + followUpPageSize);
  }, [filteredFollowUps, followUpPageSize, safeFollowUpPage]);

  const meetingTotal = useMemo(() => {
    if (dateFilter !== "all" || query) {
      return filteredSalesMeetings.length;
    }
    if (statusFilter === "all") {
      const total = meetingSummary?.total ?? meetingPagination?.count ?? 0;
      return total > filteredSalesMeetings.length ? total : filteredSalesMeetings.length;
    }
    const statusTotalMap = {
      active: meetingSummary?.active,
      scheduled: meetingSummary?.active,
      today: meetingSummary?.today,
      overdue: meetingSummary?.overdue,
      completed: meetingSummary?.completed,
      no_show: meetingSummary?.no_show,
    };
    const expected = statusTotalMap[statusFilter];
    if (typeof expected === "number" && expected > filteredSalesMeetings.length) {
      return expected;
    }
    return filteredSalesMeetings.length;
  }, [dateFilter, query, statusFilter, meetingSummary, meetingPagination?.count, filteredSalesMeetings.length]);
  const meetingPageCount = Math.max(1, Math.ceil(meetingTotal / meetingPageSize));
  const safeMeetingPage = Math.min(Math.max(1, meetingPage), meetingPageCount);
  const paginatedSalesMeetings = useMemo(() => {
    const start = (safeMeetingPage - 1) * meetingPageSize;
    return filteredSalesMeetings.slice(start, start + meetingPageSize);
  }, [filteredSalesMeetings, meetingPageSize, safeMeetingPage]);

  const isLeadsLoading = Boolean(leadPagination?.loading || (isLoading && leads.length === 0));
  const isPipelineLoading = Boolean(dealPagination?.loading || (isLoading && deals.length === 0));
  const isFollowUpsLoading = Boolean(followUpPagination?.loading || (isLoading && followUps.length === 0));
  const isMeetingsLoading = Boolean(meetingPagination?.loading || (isLoading && salesMeetings.length === 0));
  const isReportsLoading = Boolean(isLoading && leads.length === 0 && deals.length === 0 && followUps.length === 0);
  const isCommercialsLoading = Boolean(
    isLoading && proposals.length === 0 && quotations.length === 0 && agreements.length === 0
  );

  const dateFilteredLeadsForStats = useMemo(() => {
    return dedupedLeads.filter((lead) => matchesDateFilter(lead, "created_at"));
  }, [dedupedLeads, matchesDateFilter]);

  const dateFilteredPipelineDealsForStats = useMemo(() => {
    return allPipelineDeals.filter(
      (deal) => dateFilter === "all" || matchesDateFilter(deal, "created_at") || matchesDateFilter(deal, "updated_at")
    );
  }, [allPipelineDeals, dateFilter, matchesDateFilter]);

  const dateFilteredFollowUpsForStats = useMemo(() => {
    return followUps.filter(
      (item) => dateFilter === "all" || matchesDateFilter(item, "due_at") || matchesDateFilter(item, "created_at")
    );
  }, [dateFilter, followUps, matchesDateFilter]);

  const dateFilteredMeetingsForStats = useMemo(() => {
    return salesMeetings.filter((item) => matchesDateFilter(item, "scheduled_at"));
  }, [matchesDateFilter, salesMeetings]);

  const stats = useMemo(
    () =>
      calculateAggregateStats({
        leads: dedupedLeads,
        deals,
        leadSummary,
        leadPagination,
        dateFilter,
        dateFilteredLeadsForStats,
        dateFilteredPipelineDealsForStats,
      }),
    [dateFilter, dateFilteredLeadsForStats, dateFilteredPipelineDealsForStats, deals, leadSummary, leadPagination, dedupedLeads]
  );

  const leadSummaryMetrics = useMemo(
    () =>
      calculateLeadSummaryMetrics({
        dateFilter,
        dateFilteredLeadsForStats,
        deals,
        leadPagination,
        leadSummary,
      }),
    [dateFilter, dateFilteredLeadsForStats, deals, leadPagination, leadSummary]
  );

  const pageStatusCards = useMemo(
    () =>
      buildPageStatusCards({
        viewMode,
        leadSummaryMetrics,
        dateFilteredPipelineDealsForStats,
        dateFilteredFollowUpsForStats,
        dateFilteredMeetingsForStats,
        proposals,
        quotations,
        agreements,
        dealSummary,
        followUpSummary,
        meetingSummary,
        commercialSummary,
        dateFilter,
        followUpScope,
      }),
    [
      agreements,
      commercialSummary,
      dateFilter,
      dateFilteredFollowUpsForStats,
      dateFilteredMeetingsForStats,
      dateFilteredPipelineDealsForStats,
      dealSummary,
      followUpSummary,
      followUpScope,
      leadSummaryMetrics,
      meetingSummary,
      proposals,
      quotations,
      viewMode,
    ]
  );

  const aiInsights = useMemo(
    () =>
      buildAiInsights({
        leads,
        deals,
        followUps,
        salesMeetings,
      }),
    [deals, followUps, leads, salesMeetings]
  );

  const salesReport = useMemo(
    () =>
      buildSalesReport({
        leads,
        deals,
        followUps,
        leadSummary,
        dateFilter,
        matchesDateFilter,
      }),
    [dateFilter, deals, followUps, leadSummary, leads, matchesDateFilter]
  );

  return {
    matchesDateFilter,
    getLeadServerDateRange,
    getServerDateRange,
    leadLetterCounts,
    totalLettersCount,
    filteredLeads,
    safeLeadPage,
    leadPageCount,
    paginatedLeads,
    leadTotalForPagination,
    stats,
    commercialDocs,
    filteredFollowUps,
    safeFollowUpPage,
    followUpPageCount,
    paginatedFollowUps,
    followUpTotal,
    filteredSalesMeetings,
    safeMeetingPage,
    meetingPageCount,
    paginatedSalesMeetings,
    meetingTotal,
    allPipelineDeals,
    visiblePipelineDeals,
    isLeadsLoading,
    isPipelineLoading,
    isFollowUpsLoading,
    isMeetingsLoading,
    isReportsLoading,
    isCommercialsLoading,
    leadSummaryMetrics,
    pageStatusCards,
    aiInsights,
    salesReport,
  };
}
