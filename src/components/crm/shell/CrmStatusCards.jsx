"use client";

import { StatusCardsSkeleton } from "../shared/CrmSkeletons";

function isCardFilterActive({ viewMode, statusFilter, filterKey }) {
  if (!["leads", "pipeline", "followups", "sales_meetings"].includes(viewMode) || !filterKey) return false;
  if (viewMode === "pipeline") {
    return filterKey === "all"
      ? statusFilter === "all" || !statusFilter
      : filterKey === statusFilter;
  }
  return (
    (filterKey === "all" && (statusFilter === "all" || !statusFilter)) ||
    (filterKey === "scheduled" && ["scheduled", "pending", "active"].includes(statusFilter)) ||
    (filterKey === "today" && statusFilter === "today") ||
    (filterKey === "completed" && ["completed", "done"].includes(statusFilter)) ||
    (filterKey === "pending" && ["pending", "active"].includes(statusFilter)) ||
    (filterKey === "overdue" && ["overdue", "passed"].includes(statusFilter)) ||
    (filterKey === "done" && ["done", "completed"].includes(statusFilter)) ||
    (filterKey === "missed" && statusFilter === "missed") ||
    (filterKey === "active" && statusFilter === "active") ||
    (filterKey === "pipeline" && statusFilter === "pipeline") ||
    (filterKey === "converted" && ["converted", "won"].includes(statusFilter)) ||
    (filterKey === "lost" && statusFilter === "lost")
  );
}

const STATUS_CARD_VIEWS = ["leads", "pipeline", "followups", "sales_meetings", "commercials"];

export default function CrmStatusCards({
  pageStatusCards = [],
  isLoading = false,
  viewMode = "leads",
  statusFilter = "all",
  setStatusFilter = () => {},
  setLeadPage = () => {},
  setFollowUpPage = () => {},
  setMeetingPage = () => {},
}) {
  // Never render status cards (or their skeletons) for views that do not support status cards
  if (!STATUS_CARD_VIEWS.includes(viewMode) || !Array.isArray(pageStatusCards) || pageStatusCards.length === 0) {
    return null;
  }

  // Only render skeleton if this specific view's status cards are loading and have no values yet
  if (isLoading && pageStatusCards.every((c) => !c.value || c.value === 0)) {
    return <StatusCardsSkeleton cards={pageStatusCards.length || 4} />;
  }

  return (
    <div
      className={`grid gap-2 sm:gap-3 ${
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
                setFollowUpPage(1);
                setMeetingPage(1);
              }
            }}
            className={`p-2.5 min-[360px]:p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#18150f] border shadow-2xs min-w-0 transition-all select-none ${
              isFilterActive
                ? "border-orange-500 ring-2 ring-orange-500/20 shadow-md bg-orange-50/20 dark:bg-orange-950/20"
                : "border-gray-100 dark:border-[#3a3020]"
            } ${isClickable ? "cursor-pointer touch-manipulation active:scale-[0.98] hover:border-orange-300 dark:hover:border-orange-900/40" : ""}`}
          >
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-gray-500 dark:text-neutral-400 text-[11px] sm:text-xs font-medium truncate">{card.label}</span>
              <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${card.tone || "bg-gray-100 text-gray-600"}`}>
                {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
            </div>
            <div className="text-base min-[360px]:text-lg sm:text-2xl font-bold mt-1.5 sm:mt-2 truncate text-gray-900 dark:text-white">
              {card.value}
            </div>
            {card.sub && <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1 truncate">{card.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
