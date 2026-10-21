"use client";

import { useState, useEffect, useCallback } from "react";

export function useCrmServerSync({
  viewMode,
  dateFilter,
  selectedDate,
  customDateRange,
  statusFilter = "all",
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
        page: 1,
        pageSize: 500,
        search: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, onFetchLeadsPage, selectedDate, viewMode]);

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
        page: 1,
        pageSize: 500,
        search: "",
        status: statusFilter !== "all" ? statusFilter : "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, onFetchFollowUpsPage, selectedDate, statusFilter, viewMode]);

  useEffect(() => {
    if (!onFetchMeetingsPage || viewMode !== "sales_meetings") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchMeetingsPage({
        page: 1,
        pageSize: 200,
        search: "",
        status: statusFilter !== "all" ? statusFilter : "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, onFetchMeetingsPage, selectedDate, statusFilter, viewMode]);

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
            page: 1,
            pageSize: 500,
            search: "",
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
            page: 1,
            pageSize: 500,
            search: "",
            force: true,
            ...range,
          }),
          onRefreshFollowUpSummary?.(range),
        ]);
      } else if (viewMode === "sales_meetings") {
        await Promise.all([
          onFetchMeetingsPage?.({
            page: 1,
            pageSize: 200,
            search: "",
            status: "",
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
    isRefreshing,
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
    viewMode,
  ]);

  return {
    isRefreshing,
    refreshStatus,
    handleRefreshClick,
  };
}
