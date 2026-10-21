"use client";

import { useState, useEffect, useCallback } from "react";

function getFollowUpServerStatus(status) {
  if (!status || status === "all") return "actionable";
  if (status === "all_with_completed") return "";
  return status;
}

function getMeetingServerStatus(status) {
  if (!status || status === "all") return "active";
  if (status === "all_with_completed") return "";
  if (["pending", "scheduled"].includes(status)) return "active";
  if (status === "done") return "completed";
  if (["missed", "cancelled"].includes(status)) return "no_show";
  return status;
}

export function useCrmServerSync({
  viewMode,
  dateFilter,
  selectedDate,
  customDateRange,
  statusFilter = "all",
  query = "",
  leadPage = 1,
  leadsPerPage = 10,
  leadAlphabetFilter = "all",
  leadSortOrder = "default",
  followUpPage = 1,
  followUpPageSize = 10,
  followUpScope = "all",
  meetingPage = 1,
  meetingPageSize = 50,
  getLeadServerDateRange,
  getServerDateRange,
  onFetchLeadsPage,
  onFetchDealsPage,
  onFetchFollowUpsPage,
  onFetchMeetingsPage,
  onRefresh,
  onRefreshLeadSummary,
  onRefreshDealSummary,
  onRefreshFollowUpSummary,
  onRefreshMeetingSummary,
  onRefreshCommercialSummary,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState("");

  // Server Fetch Triggers
  useEffect(() => {
    if (!onFetchLeadsPage || viewMode !== "leads") return;
    const timer = setTimeout(() => {
      const range = getLeadServerDateRange();
      onFetchLeadsPage({
        page: leadPage,
        pageSize: leadsPerPage,
        search: query,
        status: statusFilter,
        alphabet: leadAlphabetFilter,
        sort: leadSortOrder === "asc" ? "a-z" : leadSortOrder === "desc" ? "z-a" : leadSortOrder,
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, leadAlphabetFilter, leadPage, leadSortOrder, leadsPerPage, onFetchLeadsPage, query, selectedDate, statusFilter, viewMode]);

  useEffect(() => {
    if (!onFetchDealsPage || viewMode !== "pipeline") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchDealsPage({
        page: 1,
        pageSize: 500,
        search: "",
        stage: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, onFetchDealsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (!onFetchFollowUpsPage || viewMode !== "followups") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchFollowUpsPage({
        page: followUpPage,
        pageSize: followUpPageSize,
        search: query,
        status: getFollowUpServerStatus(statusFilter),
        scope: followUpScope,
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, followUpPage, followUpPageSize, followUpScope, onFetchFollowUpsPage, query, selectedDate, statusFilter, viewMode]);

  useEffect(() => {
    if (!onFetchMeetingsPage || viewMode !== "sales_meetings") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchMeetingsPage({
        page: meetingPage,
        pageSize: meetingPageSize,
        search: query,
        status: getMeetingServerStatus(statusFilter),
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, meetingPage, meetingPageSize, onFetchMeetingsPage, query, selectedDate, statusFilter, viewMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (viewMode === "leads") {
        onRefreshLeadSummary?.(getLeadServerDateRange());
      } else if (viewMode === "pipeline") {
        onRefreshDealSummary?.(getServerDateRange());
      } else if (viewMode === "followups") {
        onRefreshFollowUpSummary?.({ ...getServerDateRange(), scope: followUpScope });
      } else if (viewMode === "sales_meetings") {
        onRefreshMeetingSummary?.(getServerDateRange());
      }
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, followUpScope, onRefreshDealSummary, onRefreshFollowUpSummary, onRefreshLeadSummary, onRefreshMeetingSummary, selectedDate, viewMode]);

  useEffect(() => {
    if (viewMode !== "dashboard") return;
    const timer = setTimeout(() => {
      const leadRange = getLeadServerDateRange();
      const genericRange = getServerDateRange();
      onFetchLeadsPage?.({ page: 1, pageSize: 500, search: "", ...leadRange });
      onFetchDealsPage?.({ page: 1, pageSize: 500, search: "", stage: "", ...genericRange });
      onFetchFollowUpsPage?.({ page: 1, pageSize: 500, search: "", ...genericRange });
      onFetchMeetingsPage?.({ page: 1, pageSize: 100, search: "", status: "", ...genericRange });
      onRefreshLeadSummary?.(leadRange);
      onRefreshDealSummary?.(genericRange);
      onRefreshFollowUpSummary?.(genericRange);
      onRefreshMeetingSummary?.(genericRange);
      onRefreshCommercialSummary?.();
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, onFetchDealsPage, onFetchFollowUpsPage, onFetchLeadsPage, onFetchMeetingsPage, onRefreshCommercialSummary, onRefreshDealSummary, onRefreshFollowUpSummary, onRefreshLeadSummary, onRefreshMeetingSummary, selectedDate, viewMode]);

  const handleRefreshClick = useCallback(async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      setRefreshStatus("Refreshing...");
      const range = viewMode === "leads" ? getLeadServerDateRange() : getServerDateRange();
      if (viewMode === "leads") {
        await Promise.all([
          onFetchLeadsPage?.({
            page: leadPage,
            pageSize: leadsPerPage,
            search: query,
            status: statusFilter,
            alphabet: leadAlphabetFilter,
            sort: leadSortOrder === "asc" ? "a-z" : leadSortOrder === "desc" ? "z-a" : leadSortOrder,
            force: true,
            ...range,
          }),
          onRefreshLeadSummary?.(range),
        ]);
      } else if (viewMode === "pipeline") {
        await Promise.all([
          onFetchDealsPage?.({
            page: 1,
            pageSize: 500,
            search: "",
            stage: "",
            force: true,
            ...range,
          }),
          onRefreshDealSummary?.(range),
        ]);
      } else if (viewMode === "followups") {
        await Promise.all([
          onFetchFollowUpsPage?.({
            page: followUpPage,
            pageSize: followUpPageSize,
            search: query,
            status: getFollowUpServerStatus(statusFilter),
            scope: followUpScope,
            force: true,
            ...range,
          }),
          onRefreshFollowUpSummary?.({ ...range, scope: followUpScope }),
        ]);
      } else if (viewMode === "sales_meetings") {
        await Promise.all([
          onFetchMeetingsPage?.({
            page: meetingPage,
            pageSize: meetingPageSize,
            search: query,
            status: getMeetingServerStatus(statusFilter),
            force: true,
            ...range,
          }),
          onRefreshMeetingSummary?.(range),
        ]);
      } else if (viewMode === "commercials") {
        await Promise.all([
          onRefresh?.("commercials", { force: true, ...range }),
          onRefreshCommercialSummary?.(),
        ]);
      } else if (viewMode === "dashboard") {
        const leadRange = getLeadServerDateRange();
        const genericRange = getServerDateRange();
        await Promise.all([
          onFetchLeadsPage?.({ page: 1, pageSize: 500, search: "", force: true, ...leadRange }),
          onFetchDealsPage?.({ page: 1, pageSize: 500, search: "", stage: "", force: true, ...genericRange }),
          onFetchFollowUpsPage?.({ page: 1, pageSize: 500, search: "", force: true, ...genericRange }),
          onFetchMeetingsPage?.({ page: 1, pageSize: 100, search: "", status: "", force: true, ...genericRange }),
          onRefreshLeadSummary?.(leadRange),
          onRefreshDealSummary?.(genericRange),
          onRefreshFollowUpSummary?.(genericRange),
          onRefreshMeetingSummary?.(genericRange),
          onRefreshCommercialSummary?.(),
        ]);
      } else {
        await onRefresh?.(viewMode, { force: true, ...range });
      }

      setRefreshStatus("Updated!");
      setTimeout(() => setRefreshStatus(""), 2000);
    } catch (err) {
      console.error("Refresh failed:", err);
      setRefreshStatus("Error");
      setTimeout(() => setRefreshStatus(""), 2000);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    getLeadServerDateRange,
    getServerDateRange,
    followUpPage,
    followUpPageSize,
    followUpScope,
    isRefreshing,
    leadAlphabetFilter,
    leadPage,
    leadSortOrder,
    leadsPerPage,
    meetingPage,
    meetingPageSize,
    onFetchDealsPage,
    onFetchFollowUpsPage,
    onFetchLeadsPage,
    onFetchMeetingsPage,
    onRefresh,
    onRefreshCommercialSummary,
    onRefreshDealSummary,
    onRefreshFollowUpSummary,
    onRefreshLeadSummary,
    onRefreshMeetingSummary,
    query,
    statusFilter,
    viewMode,
  ]);

  return {
    isRefreshing,
    refreshStatus,
    handleRefreshClick,
  };
}
