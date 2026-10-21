"use client";

import { CheckCircle2, Clock, ExternalLink, Video } from "lucide-react";

export default function DealEngagementHighlights({
  selectedDeal,
  lead,
  dealMeetings = [],
  dealFollowUps = [],
  upcomingMeeting = null,
  upcomingFollowUp = null,
  onTabChange,
  openDealMeetingModal,
  openDealFollowUpModal,
}) {
  const lastCompletedMeeting = dealMeetings.find((m) => m.status === "completed");
  const lastCompletedFollowUp = dealFollowUps.find((f) => f.status === "done" || f.status === "completed");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-[360px]:gap-2.5">
      <div className="p-2.5 min-[360px]:p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1 truncate">
            <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">Upcoming Meeting</span>
          </span>
          <button
            type="button"
            onClick={() => onTabChange("meetings")}
            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
          >
            History ({dealMeetings.length}) →
          </button>
        </div>
        {upcomingMeeting ? (
          <div>
            <span className="font-bold text-gray-900 dark:text-white block truncate text-xs min-[360px]:text-sm">{upcomingMeeting.title}</span>
            <span className="text-[10px] min-[360px]:text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
              {new Date(upcomingMeeting.scheduled_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            {upcomingMeeting.meeting_link && (
              <a
                href={
                  upcomingMeeting.meeting_link.startsWith("http")
                    ? upcomingMeeting.meeting_link
                    : `https://${upcomingMeeting.meeting_link}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline mt-1"
              >
                Join Google Meet <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        ) : lastCompletedMeeting ? (
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-xs gap-1.5">
              <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Conducted: {lastCompletedMeeting.title}</span>
              </span>
              <button
                type="button"
                onClick={() => openDealMeetingModal(selectedDeal, lead)}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0 whitespace-nowrap"
              >
                + Next Meet
              </button>
            </div>
            <span className="text-[9.5px] text-gray-400 block truncate">No open meeting · Notes saved in DB</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-gray-500 pt-1 text-xs">
            <span>No upcoming meeting</span>
            <button
              type="button"
              onClick={() => openDealMeetingModal(selectedDeal, lead)}
              className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              + Schedule
            </button>
          </div>
        )}
      </div>

      <div className="p-2.5 min-[360px]:p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1 truncate">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Upcoming Follow-up</span>
          </span>
          <button
            type="button"
            onClick={() => onTabChange("followups")}
            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer shrink-0"
          >
            History ({dealFollowUps.length}) →
          </button>
        </div>
        {upcomingFollowUp ? (
          <div>
            <span className="font-bold text-gray-900 dark:text-white block truncate">{upcomingFollowUp.title}</span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold block">
              {new Date(upcomingFollowUp.due_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            <span className="text-[10px] text-gray-500 capitalize">Via {upcomingFollowUp.channel || "Phone"}</span>
          </div>
        ) : lastCompletedFollowUp ? (
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-xs gap-1.5">
              <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Done: {lastCompletedFollowUp.title}</span>
              </span>
              <button
                type="button"
                onClick={() => openDealFollowUpModal(selectedDeal, lead)}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer shrink-0 whitespace-nowrap"
              >
                + Next Flw
              </button>
            </div>
            <span className="text-[9.5px] text-gray-400 block truncate">No open task · Notes saved in DB</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-gray-500 pt-1">
            <span>No upcoming follow-up</span>
            <button
              type="button"
              onClick={() => openDealFollowUpModal(selectedDeal, lead)}
              className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
            >
              + Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
