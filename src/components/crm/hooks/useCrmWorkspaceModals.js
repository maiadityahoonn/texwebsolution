"use client";

import { useState, useEffect } from "react";
import { playNotificationSound } from "@/lib/notificationSound";
import { toLocalDateTimeInput, DEFAULT_REMINDER_MINUTES } from "../shared/dateTimeUtils";
import { STAGE_LOSS_REASONS } from "../shared/leadUtils";
import { useCrmCommercialModals } from "./useCrmCommercialModals";
import { useCrmMeetingFollowUpModals } from "./useCrmMeetingFollowUpModals";

export function useCrmWorkspaceModals({
  leads = [],
  deals = [],
  clients = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  salesMeetings = [],
  followUps = [],
  onCreateLead,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onUpdateLeadStatus,
  onMarkLeadLost,
  onCreateDeal,
  onUpdateDeal,
  onUpdateDealStage,
  onConvertToClientAndProject,
  onCreateProposal,
  onCreateAgreement,
  onCreateInvoice,
  onCreateFollowUp,
  onUpdateFollowUp,
  onCreateSalesMeeting,
  onUpdateSalesMeeting,
  onOpenDirectWhatsapp,
  onRefreshLeadSummary,
}) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showMetaImportModal, setShowMetaImportModal] = useState(false);

  const [showLostModal, setShowLostModal] = useState(false);
  const [lostTarget, setLostTarget] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [draggedDealId, setDraggedDealId] = useState(null);

  const [editDealForm, setEditDealForm] = useState({
    title: "",
    deal_value: 0,
    pipeline_stage: "contacted",
    service: "Web Development",
    expected_close_date: "",
    loss_reason: "",
    notes: "",
  });

  // Follow-up and meeting modals
  const meetingModals = useCrmMeetingFollowUpModals({
    leads,
    deals,
    followUps,
    salesMeetings,
    onCreateFollowUp,
    onUpdateFollowUp,
    onCreateSalesMeeting,
    onUpdateSalesMeeting,
    onOpenDirectWhatsapp,
  });

  const {
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
  } = meetingModals;

  // Commercial and invoice modals
  const commercialModals = useCrmCommercialModals({
    deals,
    leads,
    clients,
    proposals,
    quotations,
    onCreateProposal,
    onCreateAgreement,
    onCreateInvoice,
    onOpenDirectWhatsapp,
    openMeetingWhatsApp,
  });

  const {
    showCommercialModal,
    setShowCommercialModal,
    commercialType,
    setCommercialType,
    commercialForm,
    setCommercialForm,
    showInvoiceModal,
    setShowInvoiceModal,
    invoiceDeal,
    setInvoiceDeal,
    invoiceForm,
    setInvoiceForm,
    aiDoc,
    openInvoiceModal,
    handleInvoiceSubmit,
    openCommercialModal,
    sendDocWhatsApp,
    sendDealDocWhatsApp,
    handleCommercialSubmit,
    handlePreviewCommercialPdf,
  } = commercialModals;

  const [newDealForm, setNewDealForm] = useState({
    title: "",
    client_id: "",
    lead_id: "",
    pipeline_stage: "contacted",
    deal_value: "100000",
    service: "Web Development",
    meeting_scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 2 * 60 * 60 * 1000)),
    reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
    duration_minutes: 60,
    meeting_link: defaultMeetLink,
    notes: "",
  });

  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Web Development",
    source: "Website",
    status: "New",
    notes: "",
  });

  const [editLeadForm, setEditLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Web Development",
    source: "Website",
    status: "New",
    notes: "",
  });

  const [lostForm, setLostForm] = useState({
    stage: "contacted",
    reason: "Unresponsive after 3+ Follow-ups (Ghosted)",
    notes: "",
    competitor_name: "",
    re_nurture_days: "30",
  });

  // Modal Scroll Lock
  const hasOpenCrmModal = Boolean(
    selectedLead ||
      selectedDeal ||
      editingLead ||
      editingDeal ||
      deleteConfirmId ||
      showAddLeadModal ||
      showAddDealModal ||
      showMetaImportModal ||
      showCommercialModal ||
      showInvoiceModal ||
      showFollowUpModal ||
      showSalesMeetingModal ||
      showMeetingSettingsModal ||
      showRescheduleModal ||
      stageModalTarget ||
      showLostModal
  );

  function closeAllModals() {
    setSelectedLead(null);
    setSelectedDeal(null);
    setEditingLead(null);
    setEditingDeal(null);
    setDeleteConfirmId(null);
    setShowAddLeadModal(false);
    setShowAddDealModal(false);
    setShowMetaImportModal(false);
    setShowCommercialModal(false);
    setShowInvoiceModal(false);
    setShowFollowUpModal(false);
    setShowSalesMeetingModal(false);
    setShowMeetingSettingsModal(false);
    setShowRescheduleModal(false);
    setStageModalTarget(null);
    setShowLostModal(false);
  }

  useEffect(() => {
    if (!hasOpenCrmModal || typeof window === "undefined") return undefined;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        closeAllModals();
      }
    }

    function getModalScrollTarget(target) {
      const overlay = target?.closest?.('[data-modal-overlay="true"]');
      if (!overlay) return null;

      const directScrollable = target?.closest?.(
        ".crm-modal-scroll, [data-modal-scroll='true'], [class*='overflow-y-auto'], [class*='overflow-auto']"
      );
      if (directScrollable && directScrollable.scrollHeight > directScrollable.clientHeight + 2) {
        return directScrollable;
      }

      const scrollables = Array.from(
        overlay.querySelectorAll(
          ".crm-modal-scroll, [data-modal-scroll='true'], [class*='overflow-y-auto'], [class*='overflow-auto']"
        )
      );
      return scrollables.find((node) => node && node.scrollHeight > node.clientHeight + 2) || null;
    }

    function handleModalWheel(e) {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const target = e.target;
      const overlay = target?.closest?.('[data-modal-overlay="true"]');
      if (!overlay || target?.closest?.("textarea, select, [contenteditable='true']")) return;

      const scrollTarget = getModalScrollTarget(target);
      if (!scrollTarget) return;

      e.preventDefault();
      scrollTarget.scrollTop += e.deltaY;
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleModalWheel, { passive: false, capture: true });

    const { body, documentElement } = document;
    const scrollY = window.scrollY || documentElement.scrollTop || 0;
    const scrollbarWidth = Math.max(0, window.innerWidth - documentElement.clientWidth);
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
      htmlOverflow: documentElement.style.overflow,
    };

    body.classList.add("modal-open");
    documentElement.classList.add("modal-open");
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    documentElement.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleModalWheel, { capture: true });
      body.classList.remove("modal-open");
      documentElement.classList.remove("modal-open");
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.right = previous.bodyRight;
      body.style.width = previous.bodyWidth;
      body.style.paddingRight = previous.bodyPaddingRight;
      documentElement.style.overflow = previous.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [hasOpenCrmModal]);

  // Lead Handlers
  function handleAddLeadSubmit(e) {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;
    const addFn = onCreateLead || onAddLead;
    addFn?.(newLeadForm);
    playNotificationSound("lead");
    setShowAddLeadModal(false);
    setNewLeadForm({
      name: "",
      phone: "",
      email: "",
      service: "Web Development",
      source: "Manual",
      status: "New",
      notes: "",
    });
  }

  function handleOpenEdit(lead) {
    setEditingLead(lead);
    setEditLeadForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      service: lead.service || "Web Development",
      source: lead.source || "Website",
      status: lead.status || "New",
      notes: lead.notes || "",
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingLead) return;
    onUpdateLead?.(editingLead.id, editLeadForm);
    setEditingLead(null);
  }

  function handleDelete(leadId) {
    onDeleteLead?.(leadId);
    setDeleteConfirmId(null);
  }

  function handleWhatsAppClick(lead) {
    if (!lead?.phone) return;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello ${lead.name}, greetings from TexWeb Solution! We received your inquiry regarding ${lead.service || "our software development services"}. How may we assist your project?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function openLostModal(target) {
    const rawStage = (
      target?.stage ||
      (target?.type === "deal"
        ? target?.item?.pipeline_stage || "proposal"
        : target?.item?.status || "Contacted")
    ).toLowerCase();

    const mappedStage =
      rawStage.includes("meet") || rawStage.includes("qual")
        ? "meeting"
        : rawStage.includes("prop") || rawStage.includes("quot")
        ? "proposal"
        : rawStage.includes("nego")
        ? "negotiation"
        : "contacted";

    const stageReasons = STAGE_LOSS_REASONS[mappedStage] || STAGE_LOSS_REASONS.contacted;

    setLostTarget(target);
    setLostForm({
      stage: mappedStage,
      reason: stageReasons[0],
      notes: "",
      competitor_name: "",
      re_nurture_days: "30",
    });
    setShowLostModal(true);
  }

  function handleMarkLostSubmit(e) {
    e.preventDefault();
    if (!lostTarget) return;
    const reasonText = [
      `[Lost At: ${lostForm.stage?.toUpperCase()}]`,
      lostForm.reason,
      lostForm.competitor_name ? `Competitor: ${lostForm.competitor_name}` : "",
      lostForm.re_nurture_days !== "none" ? `Re-Nurture: in ${lostForm.re_nurture_days} days` : "No Re-nurture",
      lostForm.notes,
    ]
      .filter(Boolean)
      .join(" | ");

    if (lostTarget.type === "deal") {
      if (onUpdateDealStage) {
        onUpdateDealStage(lostTarget.item.id, "closed_lost", {
          loss_reason: reasonText,
          notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
        });
      }
    } else if (lostTarget.type === "lead") {
      if (onMarkLeadLost) {
        onMarkLeadLost(lostTarget.item.id, {
          status: "Lost",
          loss_reason: reasonText,
          notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
          lost_at_stage: lostForm.stage,
        });
      } else if (onUpdateLead) {
        onUpdateLead(lostTarget.item.id, {
          status: "Lost",
          loss_reason: reasonText,
          notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
        });
      } else if (onUpdateLeadStatus) {
        onUpdateLeadStatus(lostTarget.item.id, "Lost");
      }

      if (selectedLead?.id === lostTarget.item.id) {
        setSelectedLead((prev) =>
          prev
            ? {
                ...prev,
                status: "Lost",
                loss_reason: reasonText,
                notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
              }
            : null
        );
      }
    }

    setShowLostModal(false);
    setLostTarget(null);
  }

  async function handleReopenLead(lead, linkedDeal) {
    if (!lead) return;
    try {
      const updates = {
        status: "Contacted",
        notes: [lead.notes, `[Restored from Lost to Active at ${new Date().toLocaleString("en-IN")}]`].filter(Boolean).join("\n"),
        loss_reason: null,
      };

      if (onUpdateLead) {
        await onUpdateLead(lead.id, updates);
      } else if (onUpdateLeadStatus) {
        await onUpdateLeadStatus(lead.id, "Contacted");
      }

      const dealToReopen = linkedDeal || deals.find((d) => d.lead_id === lead.id);
      if (dealToReopen && (dealToReopen.pipeline_stage || dealToReopen.stage) === "closed_lost") {
        if (onUpdateDealStage) {
          await onUpdateDealStage(dealToReopen.id, "contacted", {
            loss_reason: null,
            notes: [dealToReopen.notes, `[Deal Reopened from Lost at ${new Date().toLocaleString("en-IN")}]`].filter(Boolean).join("\n"),
          });
        }
      }

      if (selectedLead?.id === lead.id) {
        setSelectedLead((prev) => (prev ? { ...prev, ...updates, loss_reason: null } : prev));
      }
    } catch (err) {
      console.error("Failed to restore lead:", err);
    }
  }

  function openAddDealModal(initialStage = "contacted", lead = null) {
    setNewDealForm({
      title: lead ? `${lead.name} - ${lead.service || "Tech Development"}` : "",
      client_id: "",
      lead_id: lead ? lead.id : "",
      pipeline_stage: "contacted",
      deal_value: "100000",
      service: lead?.service || "Web Development",
      meeting_scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      duration_minutes: 60,
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      notes: lead ? `Created from lead: ${lead.name} (${lead.phone || ""})` : "",
    });
    setShowAddDealModal(true);
  }

  async function handleCreateDealSubmit(e) {
    e.preventDefault();
    if (!newDealForm.title?.trim() || !newDealForm.deal_value) return;

    const finalMeetLink = newDealForm.meeting_link?.trim() || defaultMeetLink || "https://meet.google.com/new";

    const created = await onCreateDeal?.({
      ...newDealForm,
      pipeline_stage: newDealForm.pipeline_stage || "contacted",
      deal_value: Number(newDealForm.deal_value) || 0,
      client_id: newDealForm.client_id || null,
      lead_id: newDealForm.lead_id || null,
      meeting_link: finalMeetLink,
      reminder_before_minutes: Number(newDealForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      expected_close_date: newDealForm.meeting_scheduled_at ? newDealForm.meeting_scheduled_at.slice(0, 10) : null,
      notes: [
        newDealForm.notes,
        newDealForm.meeting_scheduled_at
          ? `Meeting scheduled: ${new Date(newDealForm.meeting_scheduled_at).toLocaleString("en-IN")}`
          : null,
        finalMeetLink ? `Google Meet: ${finalMeetLink}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (created?.id && newDealForm.meeting_scheduled_at) {
      await scheduleAutoMeetingForDeal({
        ...newDealForm,
        ...created,
        meeting_scheduled_at: newDealForm.meeting_scheduled_at,
        reminder_before_minutes: Number(newDealForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
        meeting_link: finalMeetLink,
      });
    }

    if ((created?.pipeline_stage || "contacted") === "closed_won") {
      onConvertToClientAndProject?.(created || { ...newDealForm, pipeline_stage: "closed_won" });
    }

    setShowAddDealModal(false);
    setNewDealForm({
      title: "",
      client_id: "",
      lead_id: "",
      pipeline_stage: "contacted",
      deal_value: "100000",
      service: "Web Development",
      meeting_scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      duration_minutes: 60,
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      notes: "",
    });
  }

  async function handleDealStageChange(deal, nextStage, currentStage) {
    if (!deal || nextStage === (deal.pipeline_stage || currentStage)) return;
    if (nextStage === "closed_lost") {
      openLostModal({ type: "deal", item: deal, stage: currentStage });
      return;
    }
    const updatedDeal = await onUpdateDealStage?.(deal.id, nextStage);
    const stageDeal = { ...deal, ...(updatedDeal || {}), pipeline_stage: nextStage };
    if (nextStage === "contacted") {
      await scheduleAutoMeetingForDeal(stageDeal);
    }
    if (nextStage === "closed_won") {
      onConvertToClientAndProject?.(stageDeal);
    }
  }

  function handleDealDrop(stageId) {
    if (!draggedDealId) return;
    const deal = deals.find((item) => item.id === draggedDealId);
    setDraggedDealId(null);
    if (!deal) return;
    handleDealStageChange(deal, stageId, deal.pipeline_stage || "contacted");
  }

  function handleOpenEditDeal(deal) {
    if (!deal) return;
    setEditingDeal(deal);
    setEditDealForm({
      title: deal.title || "",
      deal_value: deal.deal_value || deal.value || 0,
      pipeline_stage: deal.pipeline_stage || deal.stage || "contacted",
      service: deal.service || "Web Development",
      expected_close_date: deal.expected_close_date ? deal.expected_close_date.split("T")[0] : "",
      loss_reason: deal.loss_reason || "",
      notes: deal.notes || "",
    });
  }

  async function handleSaveEditDeal(e) {
    e.preventDefault();
    if (!editingDeal) return;
    const updates = {
      title: editDealForm.title.trim() || editingDeal.title,
      deal_value: Number(editDealForm.deal_value) || 0,
      pipeline_stage: editDealForm.pipeline_stage,
      service: editDealForm.service || "Web Development",
      expected_close_date: editDealForm.expected_close_date || null,
      loss_reason: editDealForm.pipeline_stage === "closed_lost" ? editDealForm.loss_reason : null,
      notes: editDealForm.notes || "",
    };

    if (onUpdateDeal) {
      await onUpdateDeal(editingDeal.id, updates);
    } else if (onUpdateDealStage) {
      await onUpdateDealStage(editingDeal.id, updates.pipeline_stage, updates);
    }

    if (selectedDeal?.id === editingDeal.id) {
      setSelectedDeal((prev) => (prev ? { ...prev, ...updates } : null));
    }

    setEditingDeal(null);
  }

  return {
    selectedLead,
    setSelectedLead,
    showAddLeadModal,
    setShowAddLeadModal,
    showAddDealModal,
    setShowAddDealModal,
    showMetaImportModal,
    setShowMetaImportModal,
    showCommercialModal,
    setShowCommercialModal,
    showInvoiceModal,
    setShowInvoiceModal,
    invoiceDeal,
    setInvoiceDeal,
    invoiceForm,
    setInvoiceForm,
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
    showLostModal,
    setShowLostModal,
    lostTarget,
    commercialType,
    setCommercialType,
    editingLead,
    setEditingLead,
    selectedDeal,
    setSelectedDeal,
    editingDeal,
    setEditingDeal,
    editDealForm,
    setEditDealForm,
    deleteConfirmId,
    setDeleteConfirmId,
    draggedDealId,
    setDraggedDealId,
    newDealForm,
    setNewDealForm,
    newLeadForm,
    setNewLeadForm,
    editLeadForm,
    setEditLeadForm,
    commercialForm,
    setCommercialForm,
    lostForm,
    setLostForm,
    followUpForm,
    setFollowUpForm,
    salesMeetingForm,
    setSalesMeetingForm,
    handleAddLeadSubmit,
    handleOpenEdit,
    handleSaveEdit,
    handleDelete,
    handleWhatsAppClick,
    openMeetingWhatsApp,
    openCommercialModal,
    openInvoiceModal,
    handleInvoiceSubmit,
    sendDocWhatsApp,
    sendDealDocWhatsApp,
    handleCommercialSubmit,
    handlePreviewCommercialPdf,
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
    openLostModal,
    handleMarkLostSubmit,
    handleReopenLead,
    openAddDealModal,
    handleCreateDealSubmit,
    handleDealStageChange,
    handleDealDrop,
    handleOpenEditDeal,
    handleSaveEditDeal,
    aiDoc,
  };
}
