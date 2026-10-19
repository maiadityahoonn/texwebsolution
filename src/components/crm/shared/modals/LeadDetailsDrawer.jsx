"use client";

import { useMemo } from "react";
import { X, Phone, Mail, AlertCircle, Video, Clock, Pencil, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import ActivityTimeline from "@/components/crm/shared/ActivityTimeline";
import WhatsAppIcon from "../WhatsAppIcon";
import {
  getLeadBudget,
  getLeadFullBudget,
  getLeadLocation,
  getLeadLossReason,
  getLeadDisplayNotes,
  getLeadFormAnswers,
  getLeadMetaAttribution,
} from "../leadUtils";
import { formatStatusLabel, getLatestMeetingSnippet, getLatestNoteSnippet } from "../meetingUtils";

export default function LeadDetailsDrawer({
  selectedLead,
  onClose,
  deals = [],
  salesMeetings = [],
  followUps = [],
  isDark = false,
  onOpenEdit,
  onWhatsAppClick,
  onReopenLead,
  onOpenLeadFollowUp,
  onOpenSalesMeeting,
  onDeleteLead,
  currentUser = null,
  currentProfile = null,
  defaultMeetLink = "https://meet.google.com/new",
}) {
  const selectedLeadDeal = useMemo(() => {
    if (!selectedLead) return null;
    return deals.find((d) => d.lead_id === selectedLead.id) || null;
  }, [selectedLead, deals]);

  const selectedLeadIsLost = useMemo(() => {
    if (!selectedLead) return false;
    return selectedLead.status === "Lost" || selectedLeadDeal?.pipeline_stage === "closed_lost";
  }, [selectedLead, selectedLeadDeal]);

  const selectedLeadLossReason = useMemo(() => {
    if (!selectedLead) return null;
    return getLeadLossReason(selectedLead, selectedLeadDeal);
  }, [selectedLead, selectedLeadDeal]);

  const selectedLeadMetaAttribution = useMemo(() => {
    if (!selectedLead) return null;
    return getLeadMetaAttribution(selectedLead);
  }, [selectedLead]);

  const selectedLeadActivity = useMemo(() => {
    if (!selectedLead) return { meetings: [], followUps: [] };
    const meetings = salesMeetings.filter((m) => m.lead_id === selectedLead.id);
    const flw = followUps.filter((f) => f.lead_id === selectedLead.id);
    return { meetings, followUps: flw };
  }, [selectedLead, salesMeetings, followUps]);

  if (!selectedLead) return null;

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg h-[min(82vh,760px)] max-h-[82vh] rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 pb-3 shrink-0">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">{selectedLead.name}</h3>
            <span className="text-xs text-gray-500 dark:text-neutral-400">Lead Details & Timeline</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="crm-modal-scroll flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 no-scrollbar">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-gray-400 text-[10px] block">Phone Number</span>
              {selectedLead.phone ? (
                <a
                  href={`tel:${selectedLead.phone.replace(/[^0-9+]/g, "")}`}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline font-mono inline-flex items-center gap-1.5 mt-0.5 cursor-pointer"
                  title={`Click to call ${selectedLead.phone}`}
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedLead.phone}</span>
                </a>
              ) : (
                <span className="font-semibold text-gray-400 font-mono">N/A</span>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-gray-400 text-[10px] block">Email Address</span>
              {selectedLead.email ? (
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate inline-flex items-center gap-1.5 mt-0.5 max-w-full cursor-pointer"
                  title={`Click to email ${selectedLead.email}`}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{selectedLead.email}</span>
                </a>
              ) : (
                <span className="font-semibold text-gray-400">N/A</span>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-gray-400 text-[10px] block">Service Required</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {selectedLead.service || "Web Development"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-gray-400 text-[10px] block">Budget Range</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400" title={getLeadFullBudget(selectedLead)}>
                {getLeadBudget(selectedLead)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-gray-400 text-[10px] block">City & State</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {getLeadLocation(selectedLead)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-gray-400 text-[10px] block">Lead Source</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {selectedLead.source || "Website"}
              </span>
            </div>
          </div>

          {selectedLeadMetaAttribution && (
            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-purple-700 dark:text-purple-300 font-bold uppercase text-[10.5px] tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Meta Ads Campaign Attribution
                </span>
                {selectedLeadMetaAttribution.Campaign && (
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">
                    {selectedLeadMetaAttribution.Campaign}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(selectedLeadMetaAttribution).map(([k, v]) => (
                  <div key={k} className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-purple-100/60 dark:border-purple-900/30">
                    <span className="text-[10px] text-gray-400 block font-semibold">{k}</span>
                    <span className="text-[11px] font-bold text-gray-800 dark:text-white truncate block font-mono" title={v}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs">
            <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-2">
              Form Answers
            </span>
            {getLeadFormAnswers(selectedLead).length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40">
                {getLeadFormAnswers(selectedLead).map((answer) => (
                  <div
                    key={answer.label}
                    className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-1 sm:gap-3 px-3 py-2 border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                  >
                    <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold break-all" title={answer.label}>
                      {answer.label}
                    </span>
                    <span
                      className="font-semibold text-gray-800 dark:text-white break-words font-mono"
                      title={answer.value}
                    >
                      {answer.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="font-semibold text-gray-800 dark:text-white">-</span>
            )}
          </div>

          {getLeadDisplayNotes(selectedLead) && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs">
              <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-1">
                Inquiry Notes
              </span>
              <p className="text-gray-700 dark:text-neutral-300">{getLeadDisplayNotes(selectedLead)}</p>
            </div>
          )}

          {selectedLeadIsLost && (
            <div className="p-3.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="uppercase text-[10.5px] tracking-wide">Lead Lost Reason</span>
              </div>
              <div className="bg-white/90 dark:bg-[#211d14]/80 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                <p className="text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">
                  {selectedLeadLossReason || "No specific reason was provided when marking this lead as lost."}
                </p>
              </div>
            </div>
          )}

          {(selectedLeadActivity.meetings.length > 0 || selectedLeadActivity.followUps.length > 0) && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Linked Engagements ({selectedLeadActivity.meetings.length + selectedLeadActivity.followUps.length})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenLeadFollowUp?.(selectedLead);
                      onClose();
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    + Follow-up
                  </button>
                  <span className="text-gray-300">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSalesMeeting?.(selectedLead);
                      onClose();
                    }}
                    className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                  >
                    + Meeting
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedLeadActivity.meetings.slice(0, 2).map((m) => (
                  <div
                    key={m.id}
                    title={`Stage: ${m.status === "no_show" ? "No Show" : formatStatusLabel(m.status)}${getLatestMeetingSnippet(m) ? ` - ${getLatestMeetingSnippet(m)}` : ""}`}
                    className="p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-blue-900 dark:text-blue-200 truncate flex items-center gap-1">
                        <Video className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{m.title}</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shrink-0">
                        {m.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center justify-between">
                      <span>{new Date(m.scheduled_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      {m.meeting_link && (
                        <a
                          href={m.meeting_link.startsWith("http") ? m.meeting_link : `https://${m.meeting_link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-600 hover:underline"
                        >
                          Join
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {selectedLeadActivity.followUps.slice(0, 2).map((f) => (
                  <div
                    key={f.id}
                    title={`Stage: ${formatStatusLabel(f.status)}${getLatestNoteSnippet(f.notes) ? ` - ${getLatestNoteSnippet(f.notes)}` : ""}`}
                    className="p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-amber-900 dark:text-amber-200 truncate flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{f.title}</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
                        {f.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center justify-between">
                      <span>{new Date(f.due_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="capitalize font-semibold text-gray-600 dark:text-neutral-300">{f.channel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
              Activity History
            </h4>
            <ActivityTimeline
              isDark={isDark}
              events={[
                {
                  type: "lead_created",
                  title: "Lead Captured",
                  description: `Captured via ${selectedLead.source || "Website"} inquiry form.`,
                  time: new Date(selectedLead.created_at || Date.now()).toLocaleDateString(),
                },
                ...selectedLeadActivity.meetings.map((item) => ({
                  type: "meeting",
                  title: `Meeting: ${item.title}`,
                  description: `${item.status || "scheduled"} - ${item.outcome || item.agenda || "Sales meeting"}`,
                  time: new Date(item.scheduled_at || item.created_at || Date.now()).toLocaleString("en-IN"),
                })),
                ...selectedLeadActivity.followUps.map((item) => ({
                  type: "followup",
                  title: `Follow-up: ${item.title}`,
                  description: `${item.status || "pending"} - ${item.notes || item.channel || "Sales follow-up"}`,
                  time: new Date(item.completed_at || item.due_at || item.created_at || Date.now()).toLocaleString("en-IN"),
                })),
              ]}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenEdit?.(selectedLead);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Edit Lead Details"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Lead</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete lead "${selectedLead.name}"? This action cannot be undone.`)) {
                  onDeleteLead?.(selectedLead.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition flex items-center gap-1.5 cursor-pointer"
              title="Delete Junk / Faltu Lead"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Lead</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedLead.phone && (
              <button
                type="button"
                onClick={() => onWhatsAppClick?.(selectedLead)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer"
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            )}

            {selectedLeadIsLost && (
              <button
                type="button"
                onClick={() => onReopenLead?.(selectedLead, selectedLeadDeal)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Restore Lead back to Active"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Lead to Active</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
