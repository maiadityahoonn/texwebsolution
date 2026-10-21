"use client";

import React, { useState, useMemo } from "react";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import DashboardFollowUpItem from "./DashboardFollowUpItem";
import DashboardMeetingItem from "./DashboardMeetingItem";

export default function DashboardTodaySchedule({
  metrics,
  leads = [],
  clients = [],
  deals = [],
  setSelectedLead = () => {},
  dateFilter = "all",
  onNavigateSection = () => {},
  openRescheduleModal = () => {},
  openStageModal = () => {},
  openSalesMeetingRescheduleModal = () => {},
}) {
  const [activeTab, setActiveTab] = useState("followups");

  const { filteredFollowUps = [], filteredMeetings = [] } = metrics;

  // Filter & sort follow-ups according to datewise current schedule
  const displayFollowUps = useMemo(() => {
    const list = [...filteredFollowUps];
    if (dateFilter === "all") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStartTime = todayStart.getTime();

      const activeList = list.filter(
        (item) => item.status === "pending" || item.status === "scheduled" || item.status === "in_discussion"
      );

      // Current today & upcoming items first
      const currentAndUpcoming = activeList
        .filter((item) => new Date(item.due_at || 0).getTime() >= todayStartTime)
        .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime());

      // Then any past due active items
      const pastDue = activeList
        .filter((item) => new Date(item.due_at || 0).getTime() < todayStartTime)
        .sort((a, b) => new Date(b.due_at || 0).getTime() - new Date(a.due_at || 0).getTime());

      return [...currentAndUpcoming, ...pastDue].slice(0, 6);
    }

    // Specific date filter: chronological order
    return list
      .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime())
      .slice(0, 6);
  }, [filteredFollowUps, dateFilter]);

  // Filter & sort meetings according to datewise current schedule
  const displayMeetings = useMemo(() => {
    const list = [...filteredMeetings];
    if (dateFilter === "all") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStartTime = todayStart.getTime();

      const scheduledList = list.filter(
        (item) => item.status === "scheduled" || item.status === "rescheduled"
      );

      const currentAndUpcoming = scheduledList
        .filter((item) => new Date(item.scheduled_at || 0).getTime() >= todayStartTime)
        .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime());

      const past = list
        .filter((item) => new Date(item.scheduled_at || 0).getTime() < todayStartTime)
        .sort((a, b) => new Date(b.scheduled_at || 0).getTime() - new Date(a.scheduled_at || 0).getTime());

      return [...currentAndUpcoming, ...past].slice(0, 6);
    }

    return list
      .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())
      .slice(0, 6);
  }, [filteredMeetings, dateFilter]);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3.5 sm:p-5 shadow-2xs h-full flex flex-col justify-between">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Priority Outreach & Schedule</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Current scheduled calls, follow-ups, and client meetings
            </p>
          </div>

          {/* Tab Switcher without count numbers */}
          <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-[#252018] self-start sm:self-auto shrink-0 max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("followups")}
              className={`px-2 min-[360px]:px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
                activeTab === "followups"
                  ? "bg-white dark:bg-[#18150f] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-neutral-400"
              }`}
            >
              <span className="truncate">Follow-ups</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("meetings")}
              className={`px-2 min-[360px]:px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
                activeTab === "meetings"
                  ? "bg-white dark:bg-[#18150f] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-neutral-400"
              }`}
            >
              <span className="truncate">Meetings</span>
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 min-h-0">
          {activeTab === "followups" ? (
            displayFollowUps.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center rounded-xl bg-gray-50/50 dark:bg-[#211d14] border border-dashed border-gray-200 dark:border-[#3a3020]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <div className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                  No scheduled follow-ups
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  No active follow-ups scheduled for this date range.
                </p>
              </div>
            ) : (
              displayFollowUps.map((item) => (
                <DashboardFollowUpItem
                  key={item.id}
                  item={item}
                  leads={leads}
                  clients={clients}
                  deals={deals}
                  setSelectedLead={setSelectedLead}
                  openStageModal={openStageModal}
                  openRescheduleModal={openRescheduleModal}
                />
              ))
            )
          ) : displayMeetings.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center rounded-xl bg-gray-50/50 dark:bg-[#211d14] border border-dashed border-gray-200 dark:border-[#3a3020]">
              <CheckCircle2 className="w-8 h-8 text-indigo-500 mx-auto mb-2 opacity-80" />
              <div className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                No scheduled meetings
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                No client discovery or demo calls scheduled for this date filter.
              </p>
            </div>
          ) : (
            displayMeetings.map((item) => (
              <DashboardMeetingItem
                key={item.id}
                item={item}
                leads={leads}
                clients={clients}
                deals={deals}
                setSelectedLead={setSelectedLead}
                openStageModal={openStageModal}
                openSalesMeetingRescheduleModal={openSalesMeetingRescheduleModal}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer Navigation Link */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100 dark:border-[#2a2215] flex flex-col min-[440px]:flex-row items-start min-[440px]:items-center justify-between gap-1.5 text-xs shrink-0">
        <span className="text-gray-500 dark:text-neutral-400 font-medium text-[10.5px] sm:text-[11px]">
          Showing top {activeTab === "followups" ? displayFollowUps.length : displayMeetings.length} priority items
        </span>
        <button
          type="button"
          onClick={() =>
            onNavigateSection(
              activeTab === "followups" ? "sales_followups" : "sales_meetings",
              { dateFilter }
            )
          }
          className="inline-flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition cursor-pointer text-xs max-w-full min-w-0 whitespace-nowrap"
        >
          <span className="truncate">Open Full {activeTab === "followups" ? "Follow-ups" : "Meetings"} (Datewise)</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
}
