"use client";

import { useState, useEffect, useCallback } from "react";

export function useCrmServerSync({
  viewMode,
  dateFilter,
  selectedDate,
  customDateRange,
  meetingPage,
  meetingPageSize,
  getLeadServerDateRange,
  getServerDateRange,
  onFetchLeadsPage,
  onFetchDealsPage,
  onFetchFollowUpsPage,
  onFetchMeetingsPage,
  onRefresh,
  onRefreshLeadSummary,
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
        pageSize: 200,
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
        pageSize: 200,
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
        pageSize: 100,
        search: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, onFetchFollowUpsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (!onFetchMeetingsPage || viewMode !== "sales_meetings") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchMeetingsPage({
        page: meetingPage,
        pageSize: meetingPageSize,
        search: "",
        status: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, meetingPage, meetingPageSize, onFetchMeetingsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (viewMode !== "dashboard") return;
    const timer = setTimeout(() => {
      const leadRange = getLeadServerDateRange();
      const genericRange = getServerDateRange();
      onFetchLeadsPage?.({ page: 1, pageSize: 200, search: "", ...leadRange });
      onFetchDealsPage?.({ page: 1, pageSize: 100, search: "", stage: "", ...genericRange });
      onFetchFollowUpsPage?.({ page: 1, pageSize: 100, search: "", ...genericRange });
      onFetchMeetingsPage?.({ page: 1, pageSize: 100, search: "", status: "", ...genericRange });
      onRefreshLeadSummary?.(leadRange);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from, customDateRange?.to, dateFilter, onFetchDealsPage, onFetchFollowUpsPage, onFetchLeadsPage, onFetchMeetingsPage, onRefreshLeadSummary, selectedDate, viewMode]);

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
            pageSize: 200,
            search: "",
            force: true,
            ...range,
          }),
          onRefreshLeadSummary?.(range),
        ]);
      } else if (viewMode === "pipeline") {
        await onFetchDealsPage?.({
          page: 1,
          pageSize: 200,
          search: "",
          stage: "",
          force: true,
          ...range,
        });
      } else if (viewMode === "followups") {
        await onFetchFollowUpsPage?.({
          page: 1,
          pageSize: 100,
          search: "",
          force: true,
          ...range,
        });
      } else if (viewMode === "sales_meetings") {
        await onFetchMeetingsPage?.({
          page: meetingPage,
          pageSize: meetingPageSize,
          search: "",
          status: "",
          force: true,
          ...range,
        });
      } else if (viewMode === "dashboard") {
        const leadRange = getLeadServerDateRange();
        const genericRange = getServerDateRange();
        await Promise.all([
          onFetchLeadsPage?.({ page: 1, pageSize: 200, search: "", force: true, ...leadRange }),
          onFetchDealsPage?.({ page: 1, pageSize: 100, search: "", stage: "", force: true, ...genericRange }),
          onFetchFollowUpsPage?.({ page: 1, pageSize: 100, search: "", force: true, ...genericRange }),
          onFetchMeetingsPage?.({ page: 1, pageSize: 100, search: "", status: "", force: true, ...genericRange }),
          onRefreshLeadSummary?.(leadRange),
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
    meetingPage,
    meetingPageSize,
    onFetchDealsPage,
    onFetchFollowUpsPage,
    onFetchLeadsPage,
    onFetchMeetingsPage,
    onRefresh,
    onRefreshLeadSummary,
    viewMode,
  ]);

  return {
    isRefreshing,
    refreshStatus,
    handleRefreshClick,
  };
}
