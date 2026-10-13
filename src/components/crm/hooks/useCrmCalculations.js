"use client";

import { useMemo, useCallback } from "react";
import { CLOSED_PIPELINE_STAGES } from "../shared/leadUtils";
import { buildAiInsights, buildPageStatusCards, buildSalesReport } from "./crmDerivedMetrics";
import { matchesDateFilter as matchesDateFilterUtil, getLeadServerDateRange as getLeadServerDateRangeUtil } from "./crmDateFilterUtils";
import { dedupeLeads, calculateLeadLetterCounts, filterLeadsList } from "./crmLeadFilterHelpers";
import { calculateAggregateStats, calculateLeadSummaryMetrics } from "./crmMetricsHelpers";

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
  isLoading = false,
  viewMode = "leads",
  commercialScope = "all",
  query = "",
  statusFilter = "active",
  leadAlphabetFilter = "all",
  leadSortOrder = "default",
  leadPage = 1,
  leadsPerPage = 10,
  pipelinePage = 1,
  pipelinePageSize = 20,
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

  const leadTotalForPagination = filteredLeads.length;
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
    return followUps.filter((item) => {
      if (!matchesDateFilter(item, "due_at")) return false;
      const isOverdue = item.status === "pending" && item.due_at && new Date(item.due_at).getTime() < now;
      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "pending" || statusFilter === "active"
          ? item.status === "pending" && !isOverdue
          : statusFilter === "overdue"
          ? isOverdue
          : statusFilter === "done" || statusFilter === "completed"
          ? item.status === "done"
          : statusFilter === "missed"
          ? item.status === "missed"
          : true;
      return matchStatus;
    });
  }, [followUps, matchesDateFilter, statusFilter]);

  const filteredSalesMeetings = useMemo(() => {
    const todayStr = new Date().toDateString();
    return salesMeetings.filter((item) => {
      if (!matchesDateFilter(item, "scheduled_at")) return false;
      const isToday = Boolean(item.scheduled_at && new Date(item.scheduled_at).toDateString() === todayStr);
      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "scheduled" || statusFilter === "pending" || statusFilter === "active"
          ? item.status === "scheduled"
          : statusFilter === "today"
          ? isToday
          : statusFilter === "completed" || statusFilter === "done"
          ? item.status === "completed"
          : statusFilter === "no_show" || statusFilter === "cancelled" || statusFilter === "missed"
          ? ["no_show", "cancelled"].includes(item.status)
          : true;
      return matchStatus;
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
    return allPipelineDeals.filter((deal) => {
      const stage = deal.pipeline_stage || deal.stage || "contacted";
      if (dateFilter !== "all" && !matchesDateFilter(deal, "created_at") && !matchesDateFilter(deal, "updated_at"))
        return false;
      if (statusFilter === "lost") return stage === "closed_lost";
      if (statusFilter === "won" || statusFilter === "converted") return stage === "closed_won";
      if (statusFilter === "active") return !CLOSED_PIPELINE_STAGES.includes(stage);
      if (stage === "closed_lost") return false;
      return true;
    });
  }, [allPipelineDeals, dateFilter, matchesDateFilter, statusFilter]);

  const pipelineTotal = visiblePipelineDeals.length;
  const pipelinePageCount = Math.max(1, Math.ceil(pipelineTotal / pipelinePageSize));
  const safePipelinePage = Math.min(Math.max(1, pipelinePage), pipelinePageCount);
  const paginatedPipelineDeals = useMemo(() => {
    const start = (safePipelinePage - 1) * pipelinePageSize;
    return visiblePipelineDeals.slice(start, start + pipelinePageSize);
  }, [visiblePipelineDeals, pipelinePageSize, safePipelinePage]);

  const followUpTotal = filteredFollowUps.length;
  const followUpPageCount = Math.max(1, Math.ceil(followUpTotal / followUpPageSize));
  const safeFollowUpPage = Math.min(Math.max(1, followUpPage), followUpPageCount);
  const paginatedFollowUps = useMemo(() => {
    const start = (safeFollowUpPage - 1) * followUpPageSize;
    return filteredFollowUps.slice(start, start + followUpPageSize);
  }, [filteredFollowUps, followUpPageSize, safeFollowUpPage]);

  const meetingTotal = meetingPagination?.count ?? filteredSalesMeetings.length;
  const meetingBasePageCount = Math.max(
    1,
    Math.ceil(Math.max(meetingTotal, filteredSalesMeetings.length) / meetingPageSize)
  );
  const safeMeetingPage = onFetchMeetingsPage ? Math.max(1, meetingPage) : Math.min(meetingPage, meetingBasePageCount);
  const meetingPageCount = Math.max(
    safeMeetingPage,
    meetingBasePageCount,
    onFetchMeetingsPage && filteredSalesMeetings.length >= meetingPageSize ? safeMeetingPage + 1 : 1
  );
  const paginatedSalesMeetings = useMemo(() => {
    if (onFetchMeetingsPage) return filteredSalesMeetings;
    const start = (safeMeetingPage - 1) * meetingPageSize;
    return filteredSalesMeetings.slice(start, start + meetingPageSize);
  }, [filteredSalesMeetings, meetingPageSize, onFetchMeetingsPage, safeMeetingPage]);

  const isLeadsLoading = Boolean(leadPagination?.loading || (isLoading && leads.length === 0));
  const isPipelineLoading = Boolean(dealPagination?.loading || (isLoading && deals.length === 0));
  const isFollowUpsLoading = Boolean(followUpPagination?.loading || (isLoading && followUps.length === 0));
  const isMeetingsLoading = Boolean(meetingPagination?.loading || (isLoading && salesMeetings.length === 0));
  const isReportsLoading = Boolean(isLoading && leads.length === 0 && deals.length === 0 && followUps.length === 0);
  const isCommercialsLoading = Boolean(
    isLoading && proposals.length === 0 && quotations.length === 0 && agreements.length === 0
  );

  const dateFilteredLeadsForStats = useMemo(() => {
    return leads.filter((lead) => matchesDateFilter(lead, "created_at"));
  }, [leads, matchesDateFilter]);

  const dateFilteredPipelineDealsForStats = useMemo(() => {
    return allPipelineDeals.filter(
      (deal) => dateFilter === "all" || matchesDateFilter(deal, "created_at") || matchesDateFilter(deal, "updated_at")
    );
  }, [allPipelineDeals, dateFilter, matchesDateFilter]);

  const dateFilteredFollowUpsForStats = useMemo(() => {
    return followUps.filter((item) => matchesDateFilter(item, "due_at"));
  }, [followUps, matchesDateFilter]);

  const dateFilteredMeetingsForStats = useMemo(() => {
    return salesMeetings.filter((item) => matchesDateFilter(item, "scheduled_at"));
  }, [matchesDateFilter, salesMeetings]);

  const stats = useMemo(
    () =>
      calculateAggregateStats({
        leads,
        deals,
        leadSummary,
        dateFilter,
        dateFilteredLeadsForStats,
        dateFilteredPipelineDealsForStats,
      }),
    [dateFilter, dateFilteredLeadsForStats, dateFilteredPipelineDealsForStats, deals, leadSummary, leads]
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
      }),
    [
      agreements,
      dateFilteredFollowUpsForStats,
      dateFilteredMeetingsForStats,
      dateFilteredPipelineDealsForStats,
      leadSummaryMetrics,
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
    safePipelinePage,
    pipelinePageCount,
    paginatedPipelineDeals,
    pipelineTotal,
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
