"use client";

import React from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  PhoneCall,
  Calendar,
  Target,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "./dashboardUtils";

export default function DashboardStatsCards({
  metrics,
  dateFilter = "all",
  onNavigateSection = () => {},
}) {
  const cards = [
    {
      id: "leads",
      label: "Total Inbound Leads",
      value: metrics.filteredLeads.length,
      sub: `${metrics.newLeads.length} new awaiting action`,
      badge: dateFilter !== "all" ? `${dateFilter.toUpperCase()}` : "All",
      icon: Users,
      tone: "text-blue-600 dark:text-blue-400",
      bgTone: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30",
      accentBorder: "hover:border-blue-500/50 hover:shadow-blue-500/5",
      linkText: "View Leads",
      action: () => onNavigateSection("crm", { dateFilter }),
    },
    {
      id: "pipeline",
      label: "Active Pipeline Value",
      value: formatINR(metrics.activePipelineValue),
      sub: `${metrics.openDeals.length} deals in active stages`,
      badge: "Pipeline",
      icon: TrendingUp,
      tone: "text-amber-600 dark:text-amber-400",
      bgTone: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30",
      accentBorder: "hover:border-amber-500/50 hover:shadow-amber-500/5",
      linkText: "View Pipeline",
      action: () => onNavigateSection("pipeline", { dateFilter }),
    },
    {
      id: "won_revenue",
      label: "Closed Won Revenue",
      value: formatINR(metrics.wonRevenue),
      sub: `${metrics.wonDeals.length} deals won & converted`,
      badge: "Booked",
      icon: DollarSign,
      tone: "text-emerald-600 dark:text-emerald-400",
      bgTone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30",
      accentBorder: "hover:border-emerald-500/50 hover:shadow-emerald-500/5",
      linkText: "View Won",
      action: () => onNavigateSection("pipeline", { dateFilter, status: "won" }),
    },
    {
      id: "followups",
      label: "Active Follow-ups",
      value: metrics.pendingFollowUps.length,
      sub:
        metrics.overdueFollowUps.length > 0
          ? `${metrics.overdueFollowUps.length} overdue · ${metrics.todayFollowUps.length} today`
          : `${metrics.todayFollowUps.length} scheduled today · ${metrics.completedFollowUps.length} done in DB`,
      badge: metrics.overdueFollowUps.length > 0 ? "Urgent" : "Active",
      badgeTone:
        metrics.overdueFollowUps.length > 0
          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
          : "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
      icon: PhoneCall,
      tone: "text-teal-600 dark:text-teal-400",
      bgTone: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-900/30",
      accentBorder: "hover:border-teal-500/50 hover:shadow-teal-500/5",
      linkText: "View Follow-ups",
      action: () => onNavigateSection("sales_followups", { dateFilter }),
    },
    {
      id: "meetings",
      label: "Upcoming Meetings",
      value: metrics.scheduledMeetings.length,
      sub: `${metrics.todayMeetings.length} today · ${metrics.completedMeetings.length} completed in DB`,
      badge: metrics.todayMeetings.length > 0 ? `${metrics.todayMeetings.length} Today` : "Calls",
      icon: Calendar,
      tone: "text-indigo-600 dark:text-indigo-400",
      bgTone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30",
      accentBorder: "hover:border-indigo-500/50 hover:shadow-indigo-500/5",
      linkText: "View Meetings",
      action: () => onNavigateSection("sales_meetings", { dateFilter }),
    },
    {
      id: "win_rate",
      label: "Deal Win Rate",
      value: metrics.winRateDisplay,
      sub: `${metrics.wonDeals.length} Won · ${metrics.lostDeals.length} Lost`,
      badge: "Closed",
      icon: Target,
      tone: "text-purple-600 dark:text-purple-400",
      bgTone: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30",
      accentBorder: "hover:border-purple-500/50 hover:shadow-purple-500/5",
      linkText: "View Reports",
      action: () => onNavigateSection("sales_reports", { dateFilter }),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.action}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.action();
              }
            }}
            className={`group p-2.5 min-[360px]:p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer touch-manipulation select-none active:scale-[0.98] ${card.accentBorder}`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                <span className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-neutral-400 truncate">
                  {card.label}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border shrink-0 ${card.bgTone}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div className="text-base min-[360px]:text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate">
                {card.value}
              </div>

              <p className="text-[9px] min-[360px]:text-[10px] sm:text-[11px] text-gray-500 dark:text-neutral-400 font-medium mt-0.5 sm:mt-1 truncate">
                {card.sub}
              </p>
            </div>

            <div className="mt-2 pt-2 min-[360px]:mt-3 min-[360px]:pt-2.5 border-t border-gray-100 dark:border-[#2a2215] flex items-center justify-between gap-1 sm:gap-1.5 min-w-0 flex-nowrap whitespace-nowrap overflow-hidden text-[10px] sm:text-[11px]">
              <span
                title={card.badge}
                className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold whitespace-nowrap truncate min-w-0 max-w-[45%] shrink ${
                  card.badgeTone || "bg-gray-100 dark:bg-[#252018] text-gray-600 dark:text-neutral-300"
                }`}
              >
                {card.badge}
              </span>

              <div className="flex items-center gap-0.5 font-bold text-gray-500 group-hover:text-orange-600 dark:text-neutral-400 dark:group-hover:text-orange-400 transition-colors whitespace-nowrap truncate shrink min-w-0">
                <span className="truncate whitespace-nowrap">{card.linkText}</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
