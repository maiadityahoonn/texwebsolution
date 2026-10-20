"use client";

import { StatusCardsSkeleton } from "../shared/CrmSkeletons";

function isCardFilterActive({ viewMode, statusFilter, filterKey }) {
  if (!["leads", "pipeline", "followups", "sales_meetings"].includes(viewMode) || !filterKey) return false;
  return (
    (filterKey === "all" && (statusFilter === "all" || !statusFilter)) ||
    (filterKey === "scheduled" && ["scheduled", "pending", "active"].includes(statusFilter)) ||
    (filterKey === "today" && statusFilter === "today") ||
    (filterKey === "completed" && ["completed", "done"].includes(statusFilter)) ||
    (filterKey === "no_show" && ["no_show", "cancelled", "missed"].includes(statusFilter)) ||
    (filterKey === "pending" && ["pending", "active"].includes(statusFilter)) ||
    (filterKey === "overdue" && statusFilter === "overdue") ||
    (filterKey === "done" && ["done", "completed"].includes(statusFilter)) ||
    (filterKey === "missed" && statusFilter === "missed") ||
    (filterKey === "active" && statusFilter === "active") ||
    (filterKey === "pipeline" && statusFilter === "pipeline") ||
    (filterKey === "converted" && ["converted", "won"].includes(statusFilter)) ||
    (filterKey === "lost" && statusFilter === "lost")
  );
}

export default function CrmStatusCards({
  pageStatusCards = [],
  isLoading = false,
  viewMode = "leads",
  statusFilter = "all",
  setStatusFilter = () => {},
  setLeadPage = () => {},
  setPipelinePage = () => {},
  setFollowUpPage = () => {},
  setMeetingPage = () => {},
}) {
  if (isLoading && (pageStatusCards.length === 0 || pageStatusCards.every((c) => !c.value || c.value === 0))) {
    return <StatusCardsSkeleton cards={pageStatusCards.length || 4} />;
  }

  if (pageStatusCards.length === 0) return null;

  return (
    <div
      className={`grid gap-3 ${
        pageStatusCards.length === 6
          ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6"
          : pageStatusCards.length === 5
          ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
          : "grid-cols-2 lg:grid-cols-4"
      }`}
    >
      {pageStatusCards.map((card) => {
        const Icon = card.icon;
        const isClickable = Boolean(
          card.filterKey && ["leads", "pipeline", "followups", "sales_meetings"].includes(viewMode)
        );
        const isFilterActive = isCardFilterActive({ viewMode, statusFilter, filterKey: card.filterKey });

        return (
          <div
            key={card.label}
            onClick={() => {
              if (isClickable && card.filterKey) {
                setStatusFilter(card.filterKey);
                setLeadPage(1);
                setPipelinePage(1);
                setFollowUpPage(1);
                setMeetingPage(1);
              }
            }}
            className={`p-4 rounded-2xl bg-white dark:bg-[#18150f] border shadow-2xs min-w-0 transition-all ${
              isFilterActive
                ? "border-orange-500 ring-2 ring-orange-500/20 shadow-md bg-orange-50/20 dark:bg-orange-950/20"
                : "border-gray-100 dark:border-[#3a3020]"
            } ${isClickable ? "cursor-pointer hover:border-orange-300 dark:hover:border-orange-900/40" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500 dark:text-neutral-400 text-xs font-medium truncate">{card.label}</span>
              <div className={`p-2 rounded-xl shrink-0 ${card.tone || "bg-gray-100 text-gray-600"}`}>
                {Icon && <Icon className="w-4 h-4" />}
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-2 truncate text-gray-900 dark:text-white">
              {card.value}
            </div>
            {card.sub && <div className="text-[11px] text-gray-400 mt-1 truncate">{card.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
