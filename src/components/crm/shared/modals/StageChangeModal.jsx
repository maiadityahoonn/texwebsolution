"use client";

import { History, X, FileText, Clock, Copy, Check } from "lucide-react";
import { FOLLOWUP_STAGES, MEETING_STAGES, formatStatusLabel, parseNotesHistory, getMeetingFullNotes } from "../meetingUtils";

export default function StageChangeModal({
  target,
  onClose,
  status,
  setStatus,
  note,
  setNote,
  onSave,
  leads = [],
  clients = [],
}) {
  if (!target || !target.item) return null;

  const lead = leads.find((l) => l.id === target.item?.lead_id);
  const client = clients.find((c) => c.id === target.item?.client_id);
  const contact = lead || client;
  const contactPhone = client?.phone || lead?.phone || "";

  const fallbackDate = target.item?.updated_at || target.item?.scheduled_at || target.item?.due_at || target.item?.created_at;
  const hist = target.type === "meeting"
    ? parseNotesHistory(getMeetingFullNotes(target.item), fallbackDate)
    : parseNotesHistory(target.item?.notes, fallbackDate);

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-2 min-[360px]:p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
    >
      <div className="w-full max-w-xl rounded-2xl min-[360px]:rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[92dvh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 min-[360px]:px-4.5 sm:px-5 py-3 min-[360px]:py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-orange-50/70 via-amber-50/30 to-transparent dark:from-orange-950/20 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-2 min-[360px]:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 min-[360px]:w-9.5 min-[360px]:h-9.5 rounded-xl min-[360px]:rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <History className="w-4 h-4 min-[360px]:w-4.5 min-[360px]:h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] min-[360px]:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 whitespace-nowrap shrink-0">
                  {target.type === "meeting" ? "Meeting Stage" : "Follow-up Stage"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] min-[360px]:text-[10px] font-bold uppercase whitespace-nowrap shrink-0 ${
                  ["done", "completed"].includes(target.item?.status)
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : target.item?.status === "missed"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                }`}>
                  Current: {formatStatusLabel(target.item?.status)}
                </span>
              </div>
              <h3 className="font-bold text-sm min-[360px]:text-base sm:text-lg text-gray-900 dark:text-white truncate mt-0.5">
                {target.item?.title || "Stage Update"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div
          data-modal-scroll="true"
          className="crm-modal-scroll p-3 min-[360px]:p-4 sm:p-5 space-y-3 min-[360px]:space-y-3.5 overflow-y-auto flex-1 text-xs no-scrollbar overscroll-contain"
        >
          {/* Linked Account Card */}
          <div className="p-2.5 min-[360px]:p-3.5 rounded-xl min-[360px]:rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/70 dark:border-slate-700/60 flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                {contact?.name?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 dark:text-white truncate">{contact?.name || "Unlinked Contact"}</div>
                <div className="text-[11px] text-gray-500 font-mono truncate">{contactPhone || contact?.email || "No contact info"}</div>
              </div>
            </div>
            <div className="flex items-center justify-between min-[480px]:flex-col min-[480px]:items-end min-[480px]:text-right gap-1 pt-2 min-[480px]:pt-0 border-t border-gray-200/60 dark:border-slate-700/60 min-[480px]:border-0 text-[10px] min-[360px]:text-[11px] text-gray-500 shrink-0">
              <div className="font-semibold text-gray-700 dark:text-neutral-300">
                {target.type === "meeting"
                  ? (target.item.scheduled_at ? new Date(target.item.scheduled_at).toLocaleString("en-IN") : "-")
                  : (target.item.due_at ? new Date(target.item.due_at).toLocaleString("en-IN") : "-")}
              </div>
              <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700/60 font-medium text-gray-600 dark:text-neutral-300">
                {target.type === "meeting" ? `Duration: ${target.item.duration_minutes || 30}m` : `Channel: ${target.item.channel || "General"}`}
              </span>
            </div>
          </div>

          {/* Stage Update Section */}
          <div className="p-3 min-[360px]:p-4 rounded-xl min-[360px]:rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-200/70 dark:border-orange-950/50 space-y-3 min-[360px]:space-y-3.5 shadow-2xs">
            <div>
              <label className="block font-bold text-gray-900 dark:text-white mb-2 text-xs min-[360px]:text-sm">
                Select New Stage / Status
              </label>
              <div className="grid grid-cols-2 min-[440px]:grid-cols-3 gap-1.5 min-[360px]:gap-2">
                {(target.type === "meeting" ? MEETING_STAGES : FOLLOWUP_STAGES).map((stage) => {
                  const isSelected = status === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setStatus(stage.id)}
                      className={`h-9 min-[360px]:h-9.5 px-2 min-[360px]:px-2.5 py-1.5 rounded-xl font-bold text-[11px] min-[360px]:text-xs transition border cursor-pointer whitespace-nowrap min-w-0 flex items-center justify-center text-center ${
                        isSelected
                          ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                          : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="truncate">{stage.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Field */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5 flex-wrap">
                <FileText className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="min-w-0">
                  {["done", "completed"].includes(status)
                    ? "Done Note / Outcome"
                    : "Update Note / Discussion Remarks"}
                </span>
                {["done", "completed"].includes(status) && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Done History
                  </span>
                )}
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  ["done", "completed"].includes(status)
                    ? "Describe completion details (e.g. Client agreed on quotation, advance payment scheduled...)"
                    : "Add update note (e.g. Spoke with Rahul, sent company deck, follow-up scheduled...)"
                }
                className={`w-full px-3 py-2 min-[360px]:px-3.5 min-[360px]:py-2.5 rounded-xl border text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 transition resize-y ${
                  ["done", "completed"].includes(status)
                    ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500/30 focus:border-emerald-500"
                    : "bg-gray-50/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 focus:ring-orange-500/30 focus:border-orange-500"
                }`}
              />
              {/* Quick note preset chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  "Call Busy / No Answer",
                  "Client asked to call later",
                  "Quotation / Portfolio Sent",
                  "Discussed Requirements",
                  "Discussion in Progress",
                  "Advance / Payment Scheduled",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setNote((prev) => (prev ? `${prev}. ${chip}` : chip));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-orange-950/40 text-[10px] text-gray-600 dark:text-neutral-300 hover:text-orange-600 transition border border-gray-200/60 dark:border-slate-700/60 cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
              <p className="text-[10px] min-[360px]:text-[11px] text-gray-500 dark:text-neutral-400 leading-normal">
                {["done", "completed"].includes(status)
                  ? "This note will be permanently logged in the history timeline so you remember why & how it was completed."
                  : "Timestamp, selected stage, and this note will be appended into the history timeline."}
              </p>
            </div>
          </div>

          {/* Lifecycle Timeline & History Notes */}
          <div className="space-y-2.5 min-[360px]:space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 min-[360px]:gap-2 min-w-0">
                <Clock className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-orange-600 shrink-0" />
                <span className="font-bold text-gray-900 dark:text-white text-xs min-[360px]:text-sm truncate">
                  Lifecycle Timeline & Discussion Notes
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[10px] font-bold shrink-0">
                {hist.length + 1} events
              </span>
            </div>

            {/* Lifecycle Milestones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-0.5">
                <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{target.type === "meeting" ? "Meeting Scheduled" : "Follow-up Scheduled"}</span>
                </div>
                <div className="text-[10px] text-gray-600 dark:text-neutral-400">
                  Target: {target.type === "meeting"
                    ? (target.item.scheduled_at ? new Date(target.item.scheduled_at).toLocaleString("en-IN") : "-")
                    : (target.item.due_at ? new Date(target.item.due_at).toLocaleString("en-IN") : "-")}
                </div>
                {target.item.created_at && (
                  <div className="text-[9.5px] text-gray-400">
                    Created: {new Date(target.item.created_at).toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              {["done", "completed"].includes(target.item.status) || target.item.completed_at ? (
                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-0.5">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed</span>
                  </div>
                  <div className="text-[10px] text-gray-600 dark:text-neutral-400">
                    {target.item.completed_at ? new Date(target.item.completed_at).toLocaleString("en-IN") : "Successfully closed"}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-0.5">
                  <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Status: {formatStatusLabel(target.item.status)}</span>
                  </div>
                  <div className="text-[10px] text-gray-600 dark:text-neutral-400">
                    Active touchpoint in sales rhythm.
                  </div>
                </div>
              )}
            </div>

            {hist.length === 0 ? (
              <div className="p-4 min-[360px]:p-6 text-center rounded-xl min-[360px]:rounded-2xl bg-gray-50/60 dark:bg-slate-800/30 border border-dashed border-gray-200 dark:border-slate-700 text-gray-400 text-xs">
                No previous notes or discussion logs found yet. Add notes above to record timeline.
              </div>
            ) : (
              <div className="space-y-2 min-[360px]:space-y-2.5 max-h-48 min-[360px]:max-h-60 overflow-y-auto pr-1">
                {hist.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="p-2.5 min-[360px]:p-3 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200/80 dark:border-slate-700/80 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] min-[360px]:text-[11px]">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="font-bold text-gray-800 dark:text-neutral-200">
                          {entry.timestamp}
                        </span>
                        {entry.stage && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold text-[9px] min-[360px]:text-[10px] uppercase whitespace-nowrap">
                            {entry.stage}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(entry.note || entry.raw);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 transition cursor-pointer p-1"
                        title="Copy note"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      {entry.note || entry.raw}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-3 min-[360px]:px-5 py-2.5 min-[360px]:py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial h-9 min-[360px]:h-10 px-3 min-[360px]:px-4 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer whitespace-nowrap min-w-0 flex items-center justify-center text-center"
          >
            <span className="truncate">Cancel</span>
          </button>
          {["done", "completed"].includes(status) && (
            <button
              type="button"
              onClick={() => onSave(null, true)}
              className="flex-1 sm:flex-initial h-9 min-[360px]:h-10 px-2 min-[360px]:px-3.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer whitespace-nowrap min-w-0 flex items-center justify-center text-center shrink-0"
            >
              <span className="truncate">Quick Done</span>
            </button>
          )}
          <button
            type="button"
            onClick={(e) => onSave(e, false)}
            className={`flex-1 sm:flex-initial h-9 min-[360px]:h-10 px-3 min-[360px]:px-5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0 shrink-0 ${
              ["done", "completed"].includes(status)
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
                : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/25"
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {["done", "completed"].includes(status)
                ? "Save & Mark Done"
                : "Save Stage & Note"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
