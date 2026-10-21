"use client";

import React from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Target,
  AlertCircle,
} from "lucide-react";
import { ReportsSkeleton } from "../shared/CrmSkeletons";

export default function ReportsView({
  isReportsLoading = false,
  stats = {
    total: 0,
    newCount: 0,
    rate: 0,
    convertedCount: 0,
    totalPipelineValue: 0,
    wonValue: 0,
    lostCount: 0,
    lostDealsCount: 0,
  },
  salesReport = {
    conversionRate: 0,
    completedFollowUps: 0,
    missedFollowUps: 0,
    overdueFollowUps: 0,
    sourceRows: [],
  },
  aiInsights = {
    overdueFollowUps: 0,
    staleDeals: 0,
    rankedLeads: [],
    warmStaleDeals: [],
  },
  openAddDealModal = () => {},
  openLostModal = () => {},
}) {
  const overdueFollowUpsCount = Array.isArray(aiInsights?.overdueFollowUps)
    ? aiInsights.overdueFollowUps.length
    : typeof aiInsights?.overdueFollowUps === "number"
    ? aiInsights.overdueFollowUps
    : 0;

  const staleDealsCount = Array.isArray(aiInsights?.staleDeals)
    ? aiInsights.staleDeals.length
    : typeof aiInsights?.staleDeals === "number"
    ? aiInsights.staleDeals
    : 0;

  if (isReportsLoading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-[11px] sm:text-xs">
            <span className="truncate">Captured Leads</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
          </div>
          <div className="text-base min-[360px]:text-lg sm:text-2xl font-bold mt-1.5 sm:mt-2 truncate">{stats.total}</div>
          <div className="text-[10px] sm:text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1 font-medium truncate">
            {stats.newCount} New awaiting action
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-[11px] sm:text-xs">
            <span className="truncate">Conversion Rate</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-base min-[360px]:text-lg sm:text-2xl font-bold mt-1.5 sm:mt-2 truncate">{stats.rate}%</div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-medium truncate">
            {stats.convertedCount} Converted clients
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-[11px] sm:text-xs">
            <span className="truncate">Pipeline Value</span>
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-base min-[360px]:text-lg sm:text-2xl font-bold mt-1.5 sm:mt-2 truncate">
            ₹{stats.totalPipelineValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1 truncate">Across open proposals</div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-[11px] sm:text-xs">
            <span className="truncate">Won Revenue</span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-base min-[360px]:text-lg sm:text-2xl font-bold mt-1.5 sm:mt-2 truncate">
            ₹{stats.wonValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-medium truncate">
            In project execution
          </div>
        </div>
      </div>

      {/* Sales Report + Lead Source ROI */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Sales Report</div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Follow-up performance and conversion for selected date filter.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black">
              {salesReport.conversionRate}% conversion
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["Completed", salesReport.completedFollowUps, "text-emerald-600"],
              ["Missed", salesReport.missedFollowUps, "text-red-600"],
              ["Overdue", salesReport.overdueFollowUps, "text-amber-600"],
              ["Conversion", `${salesReport.conversionRate}%`, "text-blue-600"],
            ].map(([label, value, tone]) => (
              <div
                key={label}
                className="rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] p-2.5 sm:p-3"
              >
                <div className={`text-base sm:text-lg font-black ${tone}`}>{value}</div>
                <div className="text-[10.5px] sm:text-[11px] text-gray-500 dark:text-neutral-400 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Lead Source ROI</div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Meta, Google, referral, and direct source quality.
              </p>
            </div>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </div>
          <div className="space-y-2">
            {salesReport.sourceRows.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-neutral-400">No source data available.</div>
            ) : (
              salesReport.sourceRows.map((row) => (
                <div
                  key={row.source}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-1.5 sm:gap-2 items-center text-[11px] sm:text-xs rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] px-2.5 sm:px-3 py-1.5 sm:py-2"
                >
                  <div className="font-bold text-gray-900 dark:text-white truncate">{row.source}</div>
                  <div className="text-gray-500">{row.leads} leads</div>
                  <div className="text-emerald-600 font-bold">{row.won} won</div>
                  <div className="font-mono text-orange-600 font-bold">₹{row.value.toLocaleString("en-IN")}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Priority & Next Actions */}
      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <Target className="w-4 h-4 text-orange-500" />
              Sales Priority & Next Actions
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Priority, risk, and next action from lead data, meetings, and follow-ups.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600">
              {overdueFollowUpsCount} overdue
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
              {staleDealsCount} stale deals
            </span>
            {(stats.lostCount > 0 || stats.lostDealsCount > 0) && (
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">
                {stats.lostCount + stats.lostDealsCount} drop-offs logged
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiInsights.rankedLeads.length === 0 ? (
            <div className="md:col-span-3 text-xs text-gray-500 dark:text-neutral-400">
              No active lead needs action right now.
            </div>
          ) : (
            aiInsights.rankedLeads.map(({ lead, action }) => (
              <div
                key={lead.id}
                className="rounded-xl border border-gray-100 dark:border-[#3a3020] bg-gray-50 dark:bg-[#211d14] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{lead.name}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">{action}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openAddDealModal("contacted", lead)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-600 text-white cursor-pointer"
                  >
                    Pipeline
                  </button>
                  <button
                    onClick={() => openLostModal({ type: "lead", item: lead })}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-600 cursor-pointer"
                  >
                    Lost
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {aiInsights.warmStaleDeals.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Stale Deal Alerts</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {aiInsights.warmStaleDeals.slice(0, 4).map((deal) => {
                const ageDays = Math.floor(
                  (Date.now() - new Date(deal.updated_at || deal.created_at || Date.now()).getTime()) / 86400000
                );
                return (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white dark:bg-[#211d14] px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{deal.title}</div>
                      <div className="text-gray-500">
                        {deal.pipeline_stage || "pipeline"} - {ageDays} days idle
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-black ${
                        ageDays >= 7 ? "bg-red-50 text-red-600" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {ageDays >= 7 ? "7d+" : "3d+"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
