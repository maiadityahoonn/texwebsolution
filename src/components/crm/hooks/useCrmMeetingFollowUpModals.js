"use client";

import { useState, useEffect } from "react";
import { toLocalDateTimeInput, DEFAULT_REMINDER_MINUTES } from "../shared/dateTimeUtils";
import { formatFriendlyDateTime, formatStatusLabel, isFollowUpActive, isMeetingActive } from "../shared/meetingUtils";
import { isActiveDealStage } from "@/services/crm/leadCategoryFilters";
import { buildCommunicationTemplate, openWhatsAppMessage } from "../shared/communicationTemplates";

export function useCrmMeetingFollowUpModals({
  leads = [],
  deals = [],
  followUps = [],
  salesMeetings = [],
  onCreateFollowUp,
  onUpdateFollowUp,
  onCreateSalesMeeting,
  onUpdateSalesMeeting,
  onOpenDirectWhatsapp,
}) {
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showSalesMeetingModal, setShowSalesMeetingModal] = useState(false);
  const [showMeetingSettingsModal, setShowMeetingSettingsModal] = useState(false);

  const [defaultMeetLink, setDefaultMeetLink] = useState(() => {
    if (typeof window === "undefined") return "https://meet.google.com/new";
    return localStorage.getItem("texweb_sales_default_meet_link") || "https://meet.google.com/new";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("texweb_sales_default_meet_link", defaultMeetLink || "https://meet.google.com/new");
  }, [defaultMeetLink]);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [salesMeetingRescheduleTarget, setSalesMeetingRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    due_at: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
    reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
    notes: "",
    meeting_link: "",
  });

  const [stageModalTarget, setStageModalTarget] = useState(null);
  const [stageModalStatus, setStageModalStatus] = useState("");
  const [stageModalNote, setStageModalNote] = useState("");

  const [followUpForm, setFollowUpForm] = useState({
    title: "Follow up for quotation approval",
    lead_id: "",
    client_id: "",
    deal_id: "",
    channel: "phone",
    due_at: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
    reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
    priority: "medium",
    notes: "",
  });

  const [salesMeetingForm, setSalesMeetingForm] = useState({
    title: "Client requirement discovery call",
    lead_id: "",
    client_id: "",
    deal_id: "",
    meeting_type: "discovery",
    scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
    reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
    duration_minutes: 60,
    meeting_link: defaultMeetLink,
    agenda: "Requirement discovery, budget, timeline, decision maker, and next action.",
  });

  function getDealLead(deal) {
    return leads.find((lead) => lead.id === deal?.lead_id) || null;
  }

  function getActiveLeadDeal(leadId) {
    return deals.find(
      (deal) => deal.lead_id === leadId && isActiveDealStage(deal.pipeline_stage || deal.stage || "")
    ) || null;
  }

  function getMeetingStartIso(rawValue = "") {
    if (rawValue) return new Date(rawValue).toISOString();
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000);
    start.setMinutes(start.getMinutes() < 30 ? 30 : 0, 0, 0);
    if (start.getMinutes() === 0) start.setHours(start.getHours() + 1);
    return start.toISOString();
  }

  async function scheduleAutoMeetingForDeal(deal) {
    if (!deal?.id) return;
    const alreadyScheduled = salesMeetings.some(
      (item) => item.deal_id === deal.id && !["cancelled", "completed"].includes(item.status)
    );
    if (alreadyScheduled) return;
    const lead = getDealLead(deal);
    await onCreateSalesMeeting?.({
      title: `Client meeting: ${deal.title || lead?.name || "Sales deal"}`,
      lead_id: deal.lead_id || null,
      client_id: deal.client_id || null,
      deal_id: deal.id,
      meeting_type: "discovery",
      scheduled_at: deal.meeting_scheduled_at ? new Date(deal.meeting_scheduled_at).toISOString() : getMeetingStartIso(),
      duration_minutes: Number(deal.duration_minutes) || 60,
      reminder_before_minutes: Number(deal.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      meeting_link: deal.meeting_link || defaultMeetLink || "https://meet.google.com/new",
      agenda: "Auto-created when lead was moved into sales pipeline. Confirm requirements, budget, timeline, and decision maker.",
      status: "scheduled",
    });
  }

  function openMeetingWhatsApp(deal) {
    const lead = getDealLead(deal);
    const contactName = lead?.name || deal.title || "there";
    const meeting = salesMeetings.find((item) => item.deal_id === deal?.id && isMeetingActive(item.status));
    const message = buildCommunicationTemplate({
      stage: deal?.pipeline_stage || deal?.stage,
      name: contactName,
      service: deal?.service || lead?.service,
      purpose: "meeting",
      meeting,
    }).body;
    if (onOpenDirectWhatsapp) {
      onOpenDirectWhatsapp(lead?.phone || deal.phone, contactName, message);
      return;
    }
    openWhatsAppMessage(lead?.phone || deal?.phone, message);
  }

  function handleCreateFollowUpSubmit(e) {
    e.preventDefault();
    if (!followUpForm.title || !followUpForm.due_at || (!followUpForm.lead_id && !followUpForm.deal_id)) return;

    if (followUpForm.lead_id || followUpForm.deal_id) {
      const existingActive = followUps.find((item) => (
        isFollowUpActive(item.status) && (
          (followUpForm.lead_id && item.lead_id === followUpForm.lead_id) ||
          (followUpForm.deal_id && item.deal_id === followUpForm.deal_id)
        )
      ));
      if (existingActive) {
        setShowFollowUpModal(false);
        openRescheduleModal(existingActive);
        return;
      }
    }

    onCreateFollowUp?.({
      ...followUpForm,
      channel: followUpForm.channel || "phone",
      lead_id: followUpForm.lead_id || null,
      client_id: followUpForm.client_id || null,
      deal_id: followUpForm.deal_id || null,
      reminder_before_minutes: Number(followUpForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      due_at: new Date(followUpForm.due_at).toISOString(),
      status: "pending",
    });
    setShowFollowUpModal(false);
  }

  function openPipelineFollowUpModal(deal) {
    const existingActive = followUps.find(
      (item) => isFollowUpActive(item.status) && (
        (deal?.id && item.deal_id === deal.id) ||
        (deal?.lead_id && item.lead_id === deal.lead_id)
      )
    );
    if (existingActive) {
      openRescheduleModal(existingActive);
      return;
    }

    const l = leads.find((item) => item.id === deal?.lead_id);
    setFollowUpForm({
      title: `Follow up: ${deal.title}`,
      lead_id: deal.lead_id || l?.id || "",
      client_id: deal.client_id || "",
      deal_id: deal.id || "",
      channel: "phone",
      due_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      priority: "medium",
      notes: `Manual follow-up from ${PIPELINE_STAGES.find((stage) => stage.id === (deal.pipeline_stage || "contacted"))?.label || "pipeline"} stage.`,
    });
    setShowFollowUpModal(true);
  }

  function openLeadFollowUpModal(lead) {
    const existingActive = followUps.find(
      (item) => isFollowUpActive(item.status) && item.lead_id === lead?.id
    );
    if (existingActive) {
      openRescheduleModal(existingActive);
      return;
    }

    const linkedDeal = getActiveLeadDeal(lead?.id);
    setFollowUpForm({
      title: `Follow up: ${lead?.name || "Lead"}`,
      lead_id: lead?.id || "",
      client_id: linkedDeal?.client_id || "",
      deal_id: linkedDeal?.id || "",
      channel: "phone",
      due_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      priority: "medium",
      notes: `Manual follow-up from lead page for ${lead?.service || "inquiry"}.`,
    });
    setShowFollowUpModal(true);
  }

  function openDealFollowUpModal(deal, lead = null) {
    const existingActive = followUps.find(
      (item) => isFollowUpActive(item.status) && (
        (deal?.id && item.deal_id === deal.id) ||
        (deal?.lead_id && item.lead_id === deal.lead_id) ||
        (lead?.id && item.lead_id === lead.id)
      )
    );
    if (existingActive) {
      openRescheduleModal(existingActive);
      return;
    }

    const l = lead || leads.find((item) => item.id === deal?.lead_id);
    setFollowUpForm({
      title: `Follow up: ${deal?.title || l?.name || "Deal"}`,
      lead_id: deal?.lead_id || l?.id || "",
      client_id: deal?.client_id || "",
      deal_id: deal?.id || "",
      channel: "phone",
      due_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      priority: "medium",
      notes: `Follow-up for pipeline deal: ${deal?.title || "Deal"}.`,
    });
    setShowFollowUpModal(true);
  }

  function openDealMeetingModal(deal, lead = null) {
    const existingActive = salesMeetings.find(
      (item) => isMeetingActive(item.status) && (
        (deal?.id && item.deal_id === deal.id) ||
        (deal?.lead_id && item.lead_id === deal.lead_id) ||
        (lead?.id && item.lead_id === lead.id)
      )
    );
    if (existingActive) {
      openSalesMeetingRescheduleModal(existingActive);
      return;
    }

    const l = lead || leads.find((item) => item.id === deal?.lead_id);
    setSalesMeetingForm({
      lead_id: deal?.lead_id || l?.id || "",
      client_id: deal?.client_id || "",
      deal_id: deal?.id || "",
      title: `Meeting: ${deal?.title || l?.name || "Deal"}`,
      scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      duration_minutes: 30,
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      agenda: `Discuss requirements for ${deal?.service || "project"}`,
      notes: "",
    });
    setShowSalesMeetingModal(true);
  }

  function openLeadMeetingModal(lead) {
    const existingActive = salesMeetings.find(
      (item) => isMeetingActive(item.status) && item.lead_id === lead?.id
    );
    if (existingActive) {
      openSalesMeetingRescheduleModal(existingActive);
      return;
    }

    const linkedDeal = getActiveLeadDeal(lead?.id);
    setSalesMeetingForm({
      lead_id: lead?.id || "",
      client_id: linkedDeal?.client_id || "",
      deal_id: linkedDeal?.id || "",
      title: `Meeting: ${lead?.name || "Lead"}`,
      meeting_type: "discovery",
      scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      duration_minutes: 30,
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      agenda: `Discuss requirements for ${lead?.service || "project inquiry"}`,
      notes: "",
    });
    setShowSalesMeetingModal(true);
  }

  function handleCreateSalesMeetingSubmit(e) {
    e.preventDefault();
    if (!salesMeetingForm.title || !salesMeetingForm.scheduled_at || (!salesMeetingForm.lead_id && !salesMeetingForm.deal_id)) return;

    if (salesMeetingForm.lead_id || salesMeetingForm.deal_id) {
      const existingActive = salesMeetings.find((item) => (
        isMeetingActive(item.status) && (
          (salesMeetingForm.lead_id && item.lead_id === salesMeetingForm.lead_id) ||
          (salesMeetingForm.deal_id && item.deal_id === salesMeetingForm.deal_id)
        )
      ));
      if (existingActive) {
        setShowSalesMeetingModal(false);
        openSalesMeetingRescheduleModal(existingActive);
        return;
      }
    }

    const finalMeetLink = salesMeetingForm.meeting_link?.trim() || defaultMeetLink || "https://meet.google.com/new";
    onCreateSalesMeeting?.({
      ...salesMeetingForm,
      meeting_link: finalMeetLink,
      lead_id: salesMeetingForm.lead_id || null,
      deal_id: salesMeetingForm.deal_id || null,
      duration_minutes: Number(salesMeetingForm.duration_minutes) || 30,
      reminder_before_minutes: Number(salesMeetingForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      scheduled_at: new Date(salesMeetingForm.scheduled_at).toISOString(),
      status: "scheduled",
    });
    setShowSalesMeetingModal(false);
  }

  function openStageModal(item, type, prefillStatus = null) {
    setStageModalTarget({ item, type });
    setStageModalStatus(prefillStatus || item.status || (type === "meeting" ? "scheduled" : "pending"));
    setStageModalNote("");
  }

  function handleSaveStageModal(e, isQuickDoneWithoutNote = false) {
    if (e?.preventDefault) e.preventDefault();
    if (!stageModalTarget) return;

    const { item, type } = stageModalTarget;
    const nowStr = formatFriendlyDateTime(new Date());
    const isDone = ["done", "completed"].includes(stageModalStatus);

    const formattedStage = formatStatusLabel(stageModalStatus);
    const noteText = isQuickDoneWithoutNote
      ? "Marked as completed"
      : stageModalNote.trim() || (isDone ? "Marked as completed" : `Stage updated to ${formattedStage}`);

    const newHistoryEntry = `[${nowStr} • ${formattedStage}]: ${noteText}`;

    if (type === "followup") {
      const updatedNotes = [newHistoryEntry, item.notes].filter(Boolean).join("\n\n");
      onUpdateFollowUp?.(item.id, {
        status: stageModalStatus,
        completed_at: isDone ? new Date().toISOString() : item.completed_at || null,
        notes: updatedNotes,
      });
    } else if (type === "meeting") {
      const updatedOutcome = [newHistoryEntry, item.outcome].filter(Boolean).join("\n\n");
      onUpdateSalesMeeting?.(item.id, {
        status: stageModalStatus,
        outcome: updatedOutcome,
        next_action: item.next_action || (isDone ? "Discussion completed" : ""),
      });
    }

    setStageModalTarget(null);
    setStageModalNote("");
  }

  function openRescheduleModal(item) {
    setRescheduleTarget(item);
    setSalesMeetingRescheduleTarget(null);
    setRescheduleForm({
      due_at: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
      reminder_before_minutes: Number(item.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      notes: "",
      meeting_link: "",
    });
    setShowRescheduleModal(true);
  }

  function openSalesMeetingRescheduleModal(item) {
    setSalesMeetingRescheduleTarget(item);
    setRescheduleTarget(null);
    setRescheduleForm({
      due_at: item.scheduled_at ? toLocalDateTimeInput(item.scheduled_at) : toLocalDateTimeInput(new Date(Date.now() + 86400000)),
      reminder_before_minutes: Number(item.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      notes: "",
      meeting_link: item.meeting_link || defaultMeetLink || "https://meet.google.com/new",
    });
    setShowRescheduleModal(true);
  }

  async function handleRescheduleSubmit(e) {
    e.preventDefault();
    const nowStr = formatFriendlyDateTime(new Date());

    if (salesMeetingRescheduleTarget) {
      const newSchedStr = formatFriendlyDateTime(rescheduleForm.due_at);
      const oldSchedStr = formatFriendlyDateTime(salesMeetingRescheduleTarget.scheduled_at);
      const userNote = rescheduleForm.notes?.trim() ? ` · Reason: ${rescheduleForm.notes.trim()}` : "";
      const rescheduleEntry = `[${nowStr} • Rescheduled]: Meeting moved to ${newSchedStr} (was ${oldSchedStr})${userNote}`;
      const updatedOutcome = [rescheduleEntry, salesMeetingRescheduleTarget.outcome].filter(Boolean).join("\n\n");

      await onUpdateSalesMeeting?.(salesMeetingRescheduleTarget.id, {
        status: "scheduled",
        scheduled_at: new Date(rescheduleForm.due_at).toISOString(),
        reminder_before_minutes: Number(rescheduleForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
        meeting_link:
          rescheduleForm.meeting_link?.trim() ||
          salesMeetingRescheduleTarget.meeting_link ||
          defaultMeetLink ||
          "https://meet.google.com/new",
        outcome: updatedOutcome,
        agenda: salesMeetingRescheduleTarget.agenda || "",
      });
      setShowRescheduleModal(false);
      setSalesMeetingRescheduleTarget(null);
      return;
    }
    if (!rescheduleTarget || !rescheduleForm.due_at) return;
    const newDueStr = formatFriendlyDateTime(rescheduleForm.due_at);
    const oldDueStr = formatFriendlyDateTime(rescheduleTarget.due_at);
    const userNote = rescheduleForm.notes?.trim() ? ` · Note: ${rescheduleForm.notes.trim()}` : "";
    const rescheduleEntry = `[${nowStr} • Rescheduled]: Follow-up moved to ${newDueStr} (was ${oldDueStr})${userNote}`;
    const updatedNotes = [rescheduleEntry, rescheduleTarget.notes].filter(Boolean).join("\n\n");

    await onUpdateFollowUp?.(rescheduleTarget.id, {
      status: "pending",
      due_at: new Date(rescheduleForm.due_at).toISOString(),
      reminder_before_minutes: Number(rescheduleForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      notes: updatedNotes,
    });
    setShowRescheduleModal(false);
    setRescheduleTarget(null);
  }

  async function handleSaveMeetingSettings() {
    const trimmed = defaultMeetLink?.trim() || "https://meet.google.com/new";
    setDefaultMeetLink(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem("texweb_sales_default_meet_link", trimmed);
    }
    const targetMeetings = salesMeetings.filter(
      (item) => item.status === "scheduled" || !item.meeting_link || item.meeting_link === "https://meet.google.com/new"
    );
    for (const meeting of targetMeetings) {
      await onUpdateSalesMeeting?.(meeting.id, { meeting_link: trimmed });
    }
    setShowMeetingSettingsModal(false);
  }

  return {
    showFollowUpModal,
    setShowFollowUpModal,
    showSalesMeetingModal,
    setShowSalesMeetingModal,
    showMeetingSettingsModal,
    setShowMeetingSettingsModal,
    defaultMeetLink,
    setDefaultMeetLink,
    showRescheduleModal,
    setShowRescheduleModal,
    rescheduleTarget,
    salesMeetingRescheduleTarget,
    rescheduleForm,
    setRescheduleForm,
    stageModalTarget,
    setStageModalTarget,
    stageModalStatus,
    setStageModalStatus,
    stageModalNote,
    setStageModalNote,
    followUpForm,
    setFollowUpForm,
    salesMeetingForm,
    setSalesMeetingForm,
    handleCreateFollowUpSubmit,
    openPipelineFollowUpModal,
    openLeadFollowUpModal,
    openDealFollowUpModal,
    openDealMeetingModal,
    openLeadMeetingModal,
    handleCreateSalesMeetingSubmit,
    openStageModal,
    handleSaveStageModal,
    openRescheduleModal,
    openSalesMeetingRescheduleModal,
    handleRescheduleSubmit,
    handleSaveMeetingSettings,
    scheduleAutoMeetingForDeal,
    openMeetingWhatsApp,
  };
}
