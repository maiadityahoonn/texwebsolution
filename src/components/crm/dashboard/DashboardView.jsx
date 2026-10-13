"use client";

import React, { useMemo } from "react";
import DashboardStatsCards from "./DashboardStatsCards";
import DashboardPipelineFunnel from "./DashboardPipelineFunnel";
import DashboardTodaySchedule from "./DashboardTodaySchedule";
import DashboardRecentLeads from "./DashboardRecentLeads";
import DashboardSourceBreakdown from "./DashboardSourceBreakdown";
import DashboardQuickNav from "./DashboardQuickNav";
import { computeDashboardMetrics } from "./dashboardUtils";
import { ReportsSkeleton } from "../shared/CrmSkeletons";

export default function DashboardView({
  isReportsLoading = false,
  leads = [],
  clients = [],
  deals = [],
  followUps = [],
  salesMeetings = [],
  dateFilter = "all",
  setDateFilter = () => {},
  selectedDate = "",
  customDateRange = { from: "", to: "" },
  matchesDateFilter = () => true,
  openAddDealModal = () => {},
  openLeadFollowUpModal = () => {},
  openLostModal = () => {},
  openStageModal = () => {},
  openRescheduleModal = () => {},
  openSalesMeetingRescheduleModal = () => {},
  setSelectedLead = () => {},
  setSelectedDeal = () => {},
  onOpenDirectWhatsapp = () => {},
  onNavigateSection = () => {},
  onRefresh = () => {},
}) {
  const metrics = useMemo(
    () =>
      computeDashboardMetrics({
        leads,
        deals,
        followUps,
        salesMeetings,
        dateFilter,
        matchesDateFilter,
      }),
    [leads, deals, followUps, salesMeetings, dateFilter, matchesDateFilter]
  );

  if (isReportsLoading && leads.length === 0 && deals.length === 0) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-4 pb-8">

      {/* 6 Real-time KPI Stats Cards with Datewise Links */}
      <DashboardStatsCards
        metrics={metrics}
        dateFilter={dateFilter}
        onNavigateSection={onNavigateSection}
      />

      {/* Mid Section: Pipeline Funnel + Priority Schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
        <DashboardPipelineFunnel
          metrics={metrics}
          dateFilter={dateFilter}
          onNavigateSection={onNavigateSection}
        />
        <DashboardTodaySchedule
          metrics={metrics}
          leads={leads}
          clients={clients}
          deals={deals}
          setSelectedLead={setSelectedLead}
          dateFilter={dateFilter}
          onNavigateSection={onNavigateSection}
          onOpenDirectWhatsapp={onOpenDirectWhatsapp}
          openRescheduleModal={openRescheduleModal}
          openStageModal={openStageModal}
          openSalesMeetingRescheduleModal={openSalesMeetingRescheduleModal}
        />
      </div>

      {/* Bottom Section: Recent Leads Feed + Lead Source Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DashboardRecentLeads
          metrics={metrics}
          dateFilter={dateFilter}
          onNavigateSection={onNavigateSection}
          onOpenDirectWhatsapp={onOpenDirectWhatsapp}
          openAddDealModal={openAddDealModal}
          setSelectedLead={setSelectedLead}
        />
        <DashboardSourceBreakdown
          metrics={metrics}
          dateFilter={dateFilter}
          onNavigateSection={onNavigateSection}
        />
      </div>

      {/* Quick Navigation Hub with Realtime Datewise Links */}
      <DashboardQuickNav
        metrics={metrics}
        dateFilter={dateFilter}
        onNavigateSection={onNavigateSection}
      />
    </div>
  );
}
