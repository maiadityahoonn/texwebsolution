"use client";

import { History, Plus, Video } from "lucide-react";
import { formatStatusLabel, getMeetingFullNotes, parseNotesHistory } from "../../meetingUtils";

export default function DealMeetingsTab({
  selectedDeal,
  lead,
  dealMeetings = [],
  sortedDealMeetings = [],
  openDealMeetingModal,
  openStageModal,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
          <Video className="w-4 h-4 text-blue-500 shrink-0" />
          <span>All Sales Meetings ({dealMeetings.length})</span>
        </span>
        <button
          type="button"
          onClick={() => openDealMeetingModal(selectedDeal, lead)}
          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap shrink-0 min-w-0"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Schedule Meeting</span>
        </button>
      </div>

      {sortedDealMeetings.length === 0 ? (
        <div className="p-6 min-[360px]:p-8 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-center space-y-3">
          <Video className="w-8 h-8 text-blue-300 dark:text-blue-900/60 mx-auto" />
          <div>
            <h4 className="font-bold text-sm text-gray-800 dark:text-white">No Meetings Scheduled</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Schedule a discovery call or product demonstration for this deal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openDealMeetingModal(selectedDeal, lead)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0 min-w-0"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Schedule First Meeting</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 min-[360px]:space-y-3">
          {sortedDealMeetings.map((meeting) => {
            const meetingHistory = parseNotesHistory(getMeetingFullNotes(meeting));
            const isMeetingScheduled = meeting.status === "scheduled";
            const isMeetingDone = meeting.status === "completed";

            return (
              <div
                key={meeting.id}
                className={`p-2.5 min-[360px]:p-3.5 rounded-xl min-[360px]:rounded-2xl border transition-all space-y-2.5 min-[360px]:space-y-3 ${
                  isMeetingScheduled
                    ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40"
                    : isMeetingDone
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40"
                    : "bg-gray-50/60 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/60"
                }`}
              >
                <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 min-[360px]:gap-2 flex-wrap">
                      <span className="font-bold text-xs min-[360px]:text-sm text-gray-900 dark:text-white truncate">{meeting.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                          isMeetingScheduled
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                            : isMeetingDone
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                            : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        {formatStatusLabel(meeting.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] min-[360px]:text-[11px] text-gray-500 dark:text-neutral-400 flex-wrap">
                      <span className="font-semibold text-gray-700 dark:text-neutral-300">
                        {new Date(meeting.scheduled_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                      <span>·</span>
                      <span>{meeting.duration_minutes || 30} mins</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    {meeting.meeting_link && (
                      <a
                        href={
                          meeting.meeting_link.startsWith("http")
                            ? meeting.meeting_link
                            : `https://${meeting.meeting_link}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-2xs whitespace-nowrap shrink-0 min-w-0"
                      >
                        <Video className="w-3 h-3 shrink-0" />
                        <span className="truncate">Join Meet</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openStageModal(meeting, "meeting")}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-slate-700 hover:text-orange-600 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 min-w-0"
                      title="Update Status & Add Notes History"
                    >
                      <History className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="truncate">Stage & Notes</span>
                    </button>
                  </div>
                </div>

                {(meeting.agenda || meeting.next_action) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/70 dark:bg-slate-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                    {meeting.agenda && (
                      <div>
                        <span className="text-gray-400 text-[10px] block font-semibold uppercase">Agenda</span>
                        <span className="text-gray-800 dark:text-neutral-200 font-medium">{meeting.agenda}</span>
                      </div>
                    )}
                    {meeting.next_action && (
                      <div>
                        <span className="text-gray-400 text-[10px] block font-semibold uppercase">Next Action</span>
                        <span className="text-gray-800 dark:text-neutral-200 font-medium">{meeting.next_action}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
                    Meeting Notes & Updates History ({meetingHistory.length})
                  </span>
                  {meetingHistory.length > 0 ? (
                    <div className="space-y-1.5">
                      {meetingHistory.map((entry, index) => (
                        <div
                          key={entry.id || index}
                          className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 text-xs flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {entry.timestamp}
                              </span>
                              {entry.stage && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold uppercase text-[9px]">
                                  {entry.stage}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 dark:text-neutral-200 whitespace-pre-line font-medium mt-0.5">
                              {entry.note || entry.raw}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">
                      No historical outcome or discussion logged yet.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
