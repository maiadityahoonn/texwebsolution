"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Video,
  XCircle,
  Trash2,
} from "lucide-react";
import { getLeadFullBudget } from "../shared/leadUtils";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function LeadTableRow({
  lead,
  highlightParam = "",
  deals = [],
  salesMeetings = [],
  followUps = [],
  pipelineStages = [],
  closedPipelineStages = ["closed_won", "closed_lost"],
  getLeadBudget = () => "-",
  getLeadLossReason = () => "",
  setSelectedLead = () => {},
  setViewMode = () => {},
  setStatusFilter = () => {},
  handleWhatsAppClick = () => {},
  handleReopenLead = () => {},
  openAddDealModal = () => {},
  openLeadFollowUpModal = () => {},
  openRescheduleModal = () => {},
  openLostModal = () => {},
  handleOpenEdit = () => {},
  handleDelete = () => {},
}) {
  const budget = getLeadBudget(lead);
  const linkedDeal = deals.find((deal) => deal.lead_id === lead.id);
  const closedStages = Array.isArray(closedPipelineStages) ? closedPipelineStages : ["closed_won", "closed_lost"];
  const stageOptions = Array.isArray(pipelineStages) ? pipelineStages : [];
  const hasWonDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_won");
  const hasLostDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_lost");
  const isInPipeline = Boolean(linkedDeal && !closedStages.includes(linkedDeal.pipeline_stage || linkedDeal.stage));
  const isConverted = hasWonDeal || (!linkedDeal && (lead.status === "Converted" || lead.status === "Closed Won"));
  const isLost = hasLostDeal || (!linkedDeal && lead.status === "Lost");
  const lossReason = isLost ? getLeadLossReason(lead, linkedDeal) : null;
  const stageLabel = linkedDeal
    ? (stageOptions.find((stage) => stage.id === (linkedDeal.pipeline_stage || linkedDeal.stage))?.label || "Pipeline")
    : null;
  const nextLeadMeeting = salesMeetings
    .filter((meeting) => (meeting.lead_id === lead.id || (linkedDeal && meeting.deal_id === linkedDeal.id)) && !["cancelled", "completed", "no_show"].includes(meeting.status))
    .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())[0];
  const nextLeadFollowUp = followUps
    .filter((followUp) => (followUp.lead_id === lead.id || (linkedDeal && followUp.deal_id === linkedDeal.id)) && followUp.status === "pending")
    .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime())[0];

  const isHighlighted = highlightParam && (
    String(lead.id) === String(highlightParam) ||
    (linkedDeal && String(linkedDeal.id) === String(highlightParam)) ||
    (highlightParam.length > 3 && lead.name?.toLowerCase().includes(highlightParam.toLowerCase()))
  );

  return (
    <tr
      id={`lead-${lead.id}`}
      data-lead-id={lead.id}
      className={`transition-all duration-500 group ${
        isHighlighted
          ? "bg-amber-100/90 dark:bg-amber-950/50 ring-2 ring-orange-500 shadow-lg scale-[1.008] z-10 relative"
          : "hover:bg-gray-50/60 dark:hover:bg-slate-800/40"
      }`}
    >
      <td className="py-3.5 px-4 min-w-[220px]">
        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedLead(lead)}
            className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition text-left cursor-pointer"
            title="Click to view Lead details & timeline"
          >
            {lead.name}
          </button>
          {isConverted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              <span>Won in Pipeline</span>
            </span>
          )}
          {!isConverted && !isLost && linkedDeal && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 shrink-0">
              <TrendingUp className="w-2.5 h-2.5 text-amber-500" />
              <span>Pipeline: {stageLabel}</span>
            </span>
          )}
          {isLost && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 shrink-0">
              <XCircle className="w-2.5 h-2.5 text-rose-500" />
              <span>Lost</span>
            </span>
          )}
          {nextLeadMeeting && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setViewMode("sales_meetings");
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 shrink-0 cursor-pointer hover:bg-blue-100 transition whitespace-nowrap min-w-0 max-w-[130px] min-[360px]:max-w-none"
              title={`Scheduled Meeting: ${nextLeadMeeting.title} (${new Date(nextLeadMeeting.scheduled_at).toLocaleString("en-IN")})`}
            >
              <Video className="w-2.5 h-2.5 text-blue-500 shrink-0" />
              <span className="truncate">Meet: {new Date(nextLeadMeeting.scheduled_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
            </button>
          )}
          {nextLeadFollowUp && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openRescheduleModal(nextLeadFollowUp);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50 shrink-0 cursor-pointer hover:bg-amber-100 transition whitespace-nowrap min-w-0 max-w-[150px] min-[360px]:max-w-none"
              title={`Pending Follow-up: ${nextLeadFollowUp.title} (${new Date(nextLeadFollowUp.due_at).toLocaleString("en-IN")})`}
            >
              <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span className="truncate">
                <span className="hidden min-[360px]:inline">Follow-up: </span>
                <span className="min-[360px]:hidden">Flw: </span>
                {new Date(nextLeadFollowUp.due_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </span>
            </button>
          )}
          {lead.source?.toLowerCase().includes("meta") && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-pink-500" />
              <span>{lead.source.includes("Instagram") ? "Instagram" : "Meta"}</span>
            </span>
          )}
        </div>
        <div className="text-[10.5px] text-gray-400 mt-0.5">
          {new Date(lead.created_at || Date.now()).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </div>

        {isLost && (
          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-200/60 dark:border-rose-900/40 max-w-sm">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-bold text-[10px] uppercase text-rose-800 dark:text-rose-200 block mb-0.5">Lost Reason:</span>
              <span className="whitespace-pre-line break-words text-rose-700 dark:text-rose-300 font-medium" title={lossReason || "Not specified"}>
                {lossReason || "No specific reason provided"}
              </span>
            </div>
          </div>
        )}
      </td>

      <td className="py-3.5 px-4 min-w-[210px]">
        {lead.phone && (
          <a
            href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}
            className="group/phone inline-flex items-center gap-1.5 font-mono text-gray-800 dark:text-slate-200 font-medium whitespace-nowrap hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
            title={`Click to call ${lead.phone}`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500 group-hover/phone:scale-110 transition shrink-0" />
            <span className="group-hover/phone:underline">{lead.phone}</span>
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="group/email flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            title={`Click to email ${lead.email}`}
          >
            <Mail className="w-3 h-3 text-gray-400 group-hover/email:text-blue-500 group-hover/email:scale-110 transition shrink-0" />
            <span className="truncate max-w-[190px] group-hover/email:underline" title={lead.email}>{lead.email}</span>
          </a>
        )}
      </td>

      <td className="py-3.5 px-3 min-w-[160px]">
        <span
          className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] leading-snug font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-neutral-200 align-middle whitespace-normal break-words"
          title={lead.service || "General Inquiry"}
        >
          {lead.service ? lead.service.replace(/_/g, " ") : "General Inquiry"}
        </span>
      </td>

      <td className="py-3.5 px-3 min-w-[130px] whitespace-nowrap">
        {budget !== "-" ? (
          <span
            className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] leading-snug font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 align-middle whitespace-nowrap"
            title={getLeadFullBudget(lead)}
          >
            {budget}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>

      <td className="py-3.5 px-4 text-right min-w-[250px] whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 shrink-0 whitespace-nowrap">
          {lead.phone && (
            <button
              onClick={() => handleWhatsAppClick(lead)}
              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
              title="Chat on WhatsApp"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {isLost && (
            <button
              onClick={() => handleReopenLead(lead, linkedDeal)}
              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/40 transition shrink-0 cursor-pointer"
              title="Restore / Re-activate Lead back to Active"
              aria-label="Restore / Re-activate Lead back to Active"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {isConverted ? (
            <button
              onClick={() => {
                setViewMode("pipeline");
                setStatusFilter("all");
              }}
              className="p-1.5 rounded-lg shrink-0 transition text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
              title="Won in Pipeline (Click to view)"
              aria-label="Won in Pipeline"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          ) : isInPipeline && !isLost ? (
            <button
              onClick={() => {
                setViewMode("pipeline");
                setStatusFilter("all");
              }}
              className="p-1.5 rounded-lg shrink-0 transition text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
              title={`In Pipeline (${stageLabel || "Active"}) - Click to view`}
              aria-label="In Pipeline"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => openAddDealModal("contacted", lead)}
              className="p-1.5 rounded-lg text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition shrink-0 cursor-pointer"
              title={isLost ? "Reopen & Convert to Pipeline Deal" : "Move to Pipeline"}
              aria-label={isLost ? "Reopen & Convert to Pipeline Deal" : "Move to Pipeline"}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => (
              nextLeadFollowUp
                ? openRescheduleModal(nextLeadFollowUp)
                : openLeadFollowUpModal(lead)
            )}
            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition shrink-0 cursor-pointer"
            title={nextLeadFollowUp ? "Reschedule Follow-up" : isLost ? "Schedule Re-nurture Follow-up" : "Assign Follow-up"}
            aria-label={nextLeadFollowUp ? "Reschedule Follow-up" : isLost ? "Schedule Re-nurture Follow-up" : "Assign Follow-up"}
          >
            {nextLeadFollowUp
              ? <Clock className="w-3.5 h-3.5" />
              : <Calendar className="w-3.5 h-3.5" />}
          </button>

          {!isLost && !isConverted && (
            <button
              onClick={() => openLostModal({ type: "lead", item: lead })}
              className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
              title="Mark Lead as Lost"
              aria-label="Mark Lead as Lost"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => handleOpenEdit(lead)}
            className="p-1.5 rounded-lg text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition shrink-0 cursor-pointer"
            title="Edit Lead Details"
            aria-label="Edit Lead Details"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSelectedLead(lead)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
            title="View Details & Timeline"
            aria-label="View Details & Timeline"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to permanently delete lead "${lead.name}"? This action cannot be undone.`)) {
                handleDelete?.(lead.id);
              }
            }}
            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition shrink-0 cursor-pointer"
            title="Delete Junk / Faltu Lead"
            aria-label="Delete Lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
