"use client";

import { Users } from "lucide-react";
import { formatStatusLabel, parseNotesHistory } from "../../meetingUtils";
import {
  getLeadBudget,
  getLeadDisplayNotes,
  getLeadFormAnswers,
  getLeadLocation,
  getLeadLossReason,
} from "../../leadUtils";

export default function DealLeadHistoryTab({ lead, selectedDeal, setSelectedLead }) {
  if (!lead) {
    return (
      <div className="space-y-4">
        <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-center space-y-2">
          <Users className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto" />
          <h4 className="font-bold text-sm text-gray-800 dark:text-white">Direct Pipeline Deal</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            This deal was created directly in the Sales Pipeline without being mapped from an inbound website inquiry
            lead.
          </p>
        </div>
      </div>
    );
  }

  const formAnswers = getLeadFormAnswers(lead);
  const displayNotes = getLeadDisplayNotes(lead);
  const lossReason = getLeadLossReason(lead, selectedDeal);

  return (
    <div className="space-y-3 min-[360px]:space-y-4">
      <div className="p-2.5 min-[360px]:p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-[360px]:gap-2 flex-wrap">
            <span className="font-bold text-xs min-[360px]:text-sm text-gray-900 dark:text-white truncate">{lead.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
              {formatStatusLabel(lead.status)}
            </span>
          </div>
          <p className="text-[10px] min-[360px]:text-[11px] text-gray-500 dark:text-neutral-400">
            Captured on{" "}
            {new Date(lead.created_at || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedLead(lead)}
          className="px-2.5 py-1 rounded-lg text-[10px] min-[360px]:text-[11px] font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-2xs hover:bg-blue-50 cursor-pointer whitespace-nowrap shrink-0 min-w-0"
        >
          <span className="truncate">Open Lead Modal</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-[360px]:gap-2.5">
        <div className="p-2 min-[360px]:p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
          <span className="text-gray-400 text-[10px] block font-semibold uppercase">Source</span>
          <span className="font-bold text-gray-800 dark:text-white mt-0.5 block truncate text-xs min-[360px]:text-sm">{lead.source || "Website"}</span>
        </div>
        <div className="p-2 min-[360px]:p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
          <span className="text-gray-400 text-[10px] block font-semibold uppercase">Phone</span>
          <span className="font-bold text-gray-800 dark:text-white mt-0.5 block font-mono truncate text-xs min-[360px]:text-sm">
            {lead.phone || "N/A"}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
          <span className="text-gray-400 text-[10px] block font-semibold uppercase">Email</span>
          <span className="font-bold text-gray-800 dark:text-white mt-0.5 block truncate" title={lead.email}>
            {lead.email || "N/A"}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
          <span className="text-gray-400 text-[10px] block font-semibold uppercase">Location</span>
          <span className="font-bold text-gray-800 dark:text-white mt-0.5 block">{getLeadLocation(lead)}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
          <span className="text-gray-400 text-[10px] block font-semibold uppercase">Budget Range</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {getLeadBudget(lead)}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
          <span className="text-gray-400 text-[10px] block font-semibold uppercase">Service</span>
          <span className="font-bold text-gray-800 dark:text-white mt-0.5 block truncate">
            {lead.service || "Web Development"}
          </span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs space-y-2">
        <span className="text-gray-500 dark:text-neutral-400 text-[10.5px] block font-bold uppercase tracking-wider">
          Inquiry Form Questionnaire Answers
        </span>
        {formAnswers.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200/80 dark:border-slate-700 bg-white dark:bg-slate-900/50">
            {formAnswers.map((answer) => (
              <div
                key={answer.label}
                className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-1 sm:gap-3 px-3 py-2 border-b border-gray-100 dark:border-slate-800 last:border-b-0"
              >
                <span
                  className="text-[10px] sm:text-[11px] text-gray-500 dark:text-neutral-400 font-bold break-words"
                  title={answer.label}
                >
                  {answer.label}
                </span>
                <span className="font-semibold text-gray-800 dark:text-white break-words font-mono" title={answer.value}>
                  {answer.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 italic">No custom form answers provided.</span>
        )}
      </div>

      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs space-y-2.5">
        <span className="text-gray-500 dark:text-neutral-400 text-[10.5px] block font-bold uppercase tracking-wider">
          Lead Notes & Historical Audit
        </span>
        {displayNotes ? (
          <div className="space-y-2">
            {parseNotesHistory(displayNotes).map((item, index) => (
              <div
                key={item.id || index}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700/60 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{item.timestamp}</span>
                  {item.stage && (
                    <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-800 font-bold text-gray-600 dark:text-neutral-300">
                      {item.stage}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-medium">
                  {item.note || item.raw}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 italic">No notes logged for this lead yet.</span>
        )}
      </div>

      {lossReason && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300">
          <span className="font-bold text-[11px] block uppercase">Lead Loss Reason</span>
          <p className="mt-1 font-semibold">{lossReason}</p>
        </div>
      )}
    </div>
  );
}
