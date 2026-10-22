"use client";

import React from "react";
import {
  Briefcase,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Video,
  XCircle,
} from "lucide-react";
import WhatsAppIcon from "../shared/WhatsAppIcon";
import {
  buildCommunicationTemplate,
  getEmailHref,
  openWhatsAppMessage,
} from "../shared/communicationTemplates";

export default function PipelineDealActions({
  deal,
  col,
  lead,
  serviceName,
  nextFollowUp,
  nextMeeting,
  handleDealStageChange = () => {},
  openPipelineFollowUpModal = () => {},
  openDealMeetingModal = () => {},
  openCommercialModal = () => {},
  sendDealDocWhatsApp = () => {},
  openInvoiceModal = () => {},
  onNavigateSection = () => {},
}) {
  const phone = lead?.phone || deal?.phone || "";
  const email = lead?.email || deal?.email || "";
  const name = lead?.name || deal?.title?.split(" - ")[0] || "there";
  const template = buildCommunicationTemplate({
    stage: deal?.pipeline_stage || col?.id,
    name,
    service: serviceName,
    purpose: nextMeeting ? "meeting" : nextFollowUp ? "followup" : "stage",
    meeting: nextMeeting,
    followUp: nextFollowUp,
  });
  const emailHref = getEmailHref(email, template.subject, template.body);
  const isClosedWon = col.id === "closed_won";
  const isClosedLost = col.id === "closed_lost";

  const stop = (callback) => (event) => {
    event.stopPropagation();
    callback();
  };

  const reopenLostDeal = async () => {
    if (!isClosedLost) return;
    await handleDealStageChange(deal, "contacted", col.id);
  };

  const openFollowUp = async () => {
    await reopenLostDeal();
    openPipelineFollowUpModal({
      ...deal,
      pipeline_stage: isClosedLost ? "contacted" : deal.pipeline_stage,
    });
  };

  const openMeeting = async () => {
    if (isClosedLost) {
      await reopenLostDeal();
      return;
    }
    openDealMeetingModal(deal, lead);
  };

  return (
    <div className="pt-1.5 border-t border-gray-100 dark:border-[#2e2619] space-y-1.5">
      <div className="flex items-center gap-1 flex-wrap" role="group" aria-label={`${name} contact actions`}>
        {phone && (
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
            onClick={(event) => event.stopPropagation()}
            className="p-1 rounded-md text-orange-600 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/40"
            title={`Call ${phone}`}
            aria-label={`Call ${name}`}
          >
            <Phone className="w-3 h-3" />
          </a>
        )}
        {phone && (
          <button
            type="button"
            onClick={stop(() => openWhatsAppMessage(phone, template.body))}
            className="p-1 rounded-md text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/40"
            title={`WhatsApp ${template.stageLabel} template`}
            aria-label={`Send ${template.stageLabel} WhatsApp template`}
          >
            <WhatsAppIcon className="w-3 h-3" />
          </button>
        )}
        {emailHref && (
          <a
            href={emailHref}
            onClick={(event) => event.stopPropagation()}
            className="p-1 rounded-md text-sky-600 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/40"
            title={`Email ${template.stageLabel} template to ${email}`}
            aria-label={`Email ${name}`}
          >
            <Mail className="w-3 h-3" />
          </a>
        )}
        <button
          type="button"
          onClick={stop(openFollowUp)}
          className="p-1 rounded-md text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/40"
          title={isClosedLost ? "Re-open & Assign Follow-up" : nextFollowUp ? "Reschedule Follow-up" : "Assign Follow-up"}
          aria-label={isClosedLost ? "Re-open & Assign Follow-up" : nextFollowUp ? "Reschedule Follow-up" : "Assign Follow-up"}
        >
          <Clock className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={stop(openMeeting)}
          className="p-1 rounded-md text-violet-600 bg-violet-50 dark:bg-violet-950/40 border border-violet-200/40"
          title={isClosedLost ? "Re-open & Schedule Meeting" : nextMeeting ? "Reschedule Meeting" : "Schedule Meeting"}
          aria-label={isClosedLost ? "Re-open & Schedule Meeting" : nextMeeting ? "Reschedule Meeting" : "Schedule Meeting"}
        >
          <Video className="w-3 h-3" />
        </button>
        <div className="min-w-0 flex-1 text-right text-[8.5px] leading-tight text-gray-400">
          {phone && <div className="truncate" title={phone}>{phone}</div>}
          {email && <div className="truncate" title={email}>{email}</div>}
        </div>
      </div>

      {!isClosedWon && !isClosedLost && (
        <div className="flex items-center justify-between gap-1 min-w-0">
          <select
            value={deal.pipeline_stage || "contacted"}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              event.stopPropagation();
              handleDealStageChange(deal, event.target.value, col.id);
            }}
            className="text-[9px] font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-1 py-0.5 text-gray-700 dark:text-neutral-300 max-w-[82px]"
          >
            <option value="contacted">Contacted</option>
            <option value="qualified">Meeting</option>
            <option value="proposal">Quotation</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Won</option>
            <option value="closed_lost">Lost</option>
          </select>
          <div className="flex items-center gap-0.5">
            {col.id === "proposal" && (
              <button type="button" onClick={stop(() => openCommercialModal("proposal", deal))} className="p-1 rounded-md text-orange-600 bg-orange-50" title="Open Quotation">
                <FileText className="w-3 h-3" />
              </button>
            )}
            {col.id === "negotiation" && (
              <>
                <button type="button" onClick={stop(() => openCommercialModal("agreement", deal))} className="p-1 rounded-md text-indigo-600 bg-indigo-50" title="Open Agreement">
                  <FileText className="w-3 h-3" />
                </button>
                <button type="button" onClick={stop(() => openInvoiceModal(deal))} className="p-1 rounded-md text-purple-600 bg-purple-50" title="Open Invoice">
                  <DollarSign className="w-3 h-3" />
                </button>
              </>
            )}
            {["proposal", "negotiation"].includes(col.id) && (
              <button type="button" onClick={stop(() => sendDealDocWhatsApp(deal))} className="p-1 rounded-md text-emerald-600 bg-emerald-50" title="Share latest document on WhatsApp">
                <WhatsAppIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {isClosedWon && (
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-emerald-600 font-bold flex items-center gap-1"><Briefcase className="w-3 h-3" /> Client Active</span>
          <button type="button" onClick={stop(() => onNavigateSection?.("projects"))} className="text-[9.5px] font-bold text-gray-500 flex items-center gap-0.5">
            View Project <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
      {isClosedLost && (
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-rose-600 font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Closed Lost</span>
          <button type="button" onClick={stop(() => handleDealStageChange(deal, "contacted", col.id))} className="text-[9.5px] font-bold text-blue-600">Re-open</button>
        </div>
      )}
    </div>
  );
}
