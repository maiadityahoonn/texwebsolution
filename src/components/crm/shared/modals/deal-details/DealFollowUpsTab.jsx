"use client";

import { Check, Clock, History, Plus } from "lucide-react";
import { formatStatusLabel, parseNotesHistory } from "../../meetingUtils";

export default function DealFollowUpsTab({
  selectedDeal,
  lead,
  dealFollowUps = [],
  sortedDealFollowUps = [],
  openDealFollowUpModal,
  openStageModal,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>All Follow-ups ({dealFollowUps.length})</span>
        </span>
        <button
          type="button"
          onClick={() => openDealFollowUpModal(selectedDeal, lead)}
          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap shrink-0 min-w-0"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Add Follow-up</span>
        </button>
      </div>

      {sortedDealFollowUps.length === 0 ? (
        <div className="p-6 min-[360px]:p-8 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-center space-y-3">
          <Clock className="w-8 h-8 text-amber-300 dark:text-amber-900/60 mx-auto" />
          <div>
            <h4 className="font-bold text-sm text-gray-800 dark:text-white">No Follow-ups Recorded</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Stay on top of prospect conversion with scheduled touchpoints.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openDealFollowUpModal(selectedDeal, lead)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0 min-w-0"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Add First Follow-up</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 min-[360px]:space-y-3">
          {sortedDealFollowUps.map((followUp) => {
            const followUpHistory = parseNotesHistory(followUp.notes);
            const isFollowUpPending = followUp.status === "pending";
            const isFollowUpDone = followUp.status === "done";

            return (
              <div
                key={followUp.id}
                className={`p-2.5 min-[360px]:p-3.5 rounded-xl min-[360px]:rounded-2xl border transition-all space-y-2.5 min-[360px]:space-y-3 ${
                  isFollowUpPending
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40"
                    : isFollowUpDone
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40"
                    : "bg-gray-50/60 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/60"
                }`}
              >
                <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 min-[360px]:gap-2 flex-wrap">
                      <span className="font-bold text-xs min-[360px]:text-sm text-gray-900 dark:text-white truncate">{followUp.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                          isFollowUpPending
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                            : isFollowUpDone
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                            : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        {formatStatusLabel(followUp.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] min-[360px]:text-[11px] text-gray-500 dark:text-neutral-400 flex-wrap">
                      <span className="font-semibold text-gray-700 dark:text-neutral-300">
                        Due:{" "}
                        {followUp.due_at
                          ? new Date(followUp.due_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "No due date"}
                      </span>
                      <span>·</span>
                      <span className="capitalize">{followUp.channel || "Phone"}</span>
                      {followUp.priority && (
                        <>
                          <span>·</span>
                          <span className="capitalize font-semibold text-orange-600">
                            {followUp.priority} priority
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    {isFollowUpPending && (
                      <button
                        type="button"
                        onClick={() => openStageModal(followUp, "followup", "done")}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap shrink-0 min-w-0"
                      >
                        <Check className="w-3 h-3 shrink-0" />
                        <span className="truncate">Mark Done</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openStageModal(followUp, "followup")}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-slate-700 hover:text-orange-600 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 min-w-0"
                      title="Update Status & Add Notes History"
                    >
                      <History className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="truncate">Stage & Notes</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
                    Follow-up Notes & Updates History ({followUpHistory.length})
                  </span>
                  {followUpHistory.length > 0 ? (
                    <div className="space-y-1.5">
                      {followUpHistory.map((entry, index) => (
                        <div
                          key={entry.id || index}
                          className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 text-xs flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {entry.timestamp}
                              </span>
                              {entry.stage && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold uppercase text-[9px]">
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
                    <span className="text-[11px] text-gray-400 italic">No notes logged for this follow-up yet.</span>
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
