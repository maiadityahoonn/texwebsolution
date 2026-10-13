"use client";

import React from "react";
import { ArrowRight, Layers } from "lucide-react";
import { formatINR, normalizePipelineStage } from "./dashboardUtils";

export default function DashboardPipelineFunnel({
  metrics,
  dateFilter = "all",
  onNavigateSection = () => {},
}) {
  const {
    stageStats,
    activePipelineValue,
    wonRevenue,
    openDeals = [],
    wonDeals = [],
    winRateDisplay = "0%",
    decidedCount = 0,
    filteredDeals = [],
  } = metrics;

  // Active in-flight deals (excluding lost and won deals)
  const activeCount = openDeals.length;
  const avgDealValue = activeCount > 0 ? Math.round(activePipelineValue / activeCount) : 0;

  // Hot negotiation pipeline
  const negotiationDeals = filteredDeals.filter(
    (d) => normalizePipelineStage(d.pipeline_stage || d.stage) === "negotiation"
  );
  const negotiationValue = negotiationDeals.reduce(
    (sum, d) => sum + (Number(d.deal_value || d.value) || 0),
    0
  );

  // Strictly filter out "closed_lost" from funnel stage bars
  const displayStages = stageStats.filter((stage) => stage.key !== "closed_lost");

  return (
    <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 shadow-2xs h-full flex flex-col justify-between">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Sales Pipeline Stage Funnel</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Real-time active pipeline flow ({activeCount} active in-flight deals)
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateSection("pipeline", { dateFilter })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition cursor-pointer self-start sm:self-auto"
          >
            <span>Open Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Sleek KPI Stats Cards (Compact height) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 shrink-0">
          {/* 1. Active Pipeline Value */}
          <div className="py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl bg-gray-50/80 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] flex flex-col justify-between">
            <div className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-neutral-400">
              Active Pipeline Value
            </div>
            <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white mt-0.5">
              {formatINR(activePipelineValue)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">
              In-flight active deals
            </div>
          </div>

          {/* 2. Active Deals Count (Excluding Lost) */}
          <div className="py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 flex flex-col justify-between">
            <div className="text-[10px] sm:text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
              Active Deals Velocity
            </div>
            <div className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-300 mt-0.5">
              {activeCount} {activeCount === 1 ? "Deal Active" : "Deals Active"}
            </div>
            <div className="text-[9px] sm:text-[10px] text-indigo-500/80 dark:text-indigo-400/80 mt-0.5">
              Excluding lost deals
            </div>
          </div>

          {/* 3. Closed Won Revenue */}
          <div className="py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-between">
            <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Closed Won Booked
            </div>
            <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
              {formatINR(wonRevenue)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              {wonDeals.length} {wonDeals.length === 1 ? "deal won" : "deals won"}
            </div>
          </div>

          {/* 4. Avg Active Deal Size */}
          <div className="py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/30 flex flex-col justify-between">
            <div className="text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Avg Active Deal Size
            </div>
            <div className="text-sm sm:text-base font-black text-amber-700 dark:text-amber-300 mt-0.5">
              {formatINR(avgDealValue)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
              Per open opportunity
            </div>
          </div>

          {/* 5. In Negotiation Hot Value */}
          <div className="py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-100/60 dark:border-orange-900/30 flex flex-col justify-between">
            <div className="text-[10px] sm:text-[11px] font-semibold text-orange-700 dark:text-orange-400">
              In Negotiation (Hot)
            </div>
            <div className="text-sm sm:text-base font-black text-orange-700 dark:text-orange-300 mt-0.5">
              {formatINR(negotiationValue)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-orange-600/80 dark:text-orange-400/80 mt-0.5">
              {negotiationDeals.length} near close
            </div>
          </div>

          {/* 6. Win Rate */}
          <div className="py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/30 flex flex-col justify-between">
            <div className="text-[10px] sm:text-[11px] font-semibold text-purple-700 dark:text-purple-400">
              Pipeline Win Rate
            </div>
            <div className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-300 mt-0.5">
              {winRateDisplay}
            </div>
            <div className="text-[9px] sm:text-[10px] text-purple-600/80 dark:text-purple-400/80 mt-0.5">
              {wonDeals.length} won / {decidedCount} decided
            </div>
          </div>
        </div>

        {/* Stage Bars (Excluding Closed Lost) */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          {displayStages.map((stage) => {
            return (
              <div
                key={stage.key}
                onClick={() => onNavigateSection("pipeline", { stage: stage.key, dateFilter })}
                className="group p-2.5 sm:p-3 rounded-xl bg-gray-50/60 dark:bg-[#1f1a12] border border-gray-100 dark:border-[#32291a] hover:border-orange-300 dark:hover:border-orange-800/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.tone}`} />
                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                      {stage.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-neutral-400 font-semibold">
                      {stage.count} {stage.count === 1 ? "deal" : "deals"}
                    </span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {formatINR(stage.value)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stage.tone}`}
                    style={{ width: `${Math.max(stage.percentage, stage.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
