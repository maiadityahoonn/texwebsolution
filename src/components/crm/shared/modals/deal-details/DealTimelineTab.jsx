"use client";

import ActivityTimeline from "@/components/crm/shared/ActivityTimeline";
import { History } from "lucide-react";

export default function DealTimelineTab({ dealTimelineEvents = [], isDark = false }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
          <History className="w-4 h-4 text-orange-500" />
          <span>Complete Deal Journey</span>
        </span>
        <span className="text-[10px] text-gray-400 font-bold">{dealTimelineEvents.length} Events</span>
      </div>
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
        <ActivityTimeline events={dealTimelineEvents} isDark={isDark} />
      </div>
    </div>
  );
}
