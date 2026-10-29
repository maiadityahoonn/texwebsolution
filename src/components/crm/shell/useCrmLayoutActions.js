"use client";

import { useCallback } from "react";
import {
  createCloudLead,
  createCloudLeadsBatch,
  deleteCloudLead,
  updateCloudLead,
  updateCloudLeadStatus,
} from "@/services/crm/leadsService";
import {
  createDeal,
  updateDeal,
  updateDealStage,
} from "@/services/crm/dealsService";
import {
  createAgreement,
  createInvoice,
  createProposal,
  updateAgreement,
  updateInvoice,
  updateProposal,
  updateQuotation,
} from "@/services/crm/documentsService";
import {
  createSalesFollowUp,
  deleteSalesFollowUp,
  updateSalesFollowUp,
} from "@/services/crm/followupsService";
import {
  createSalesMeeting,
  deleteSalesMeeting,
  updateSalesMeeting,
} from "@/services/crm/meetingsService";
import { CRM_NAV } from "./CrmShellConfig";
import { isFollowUpActive, isMeetingActive } from "../shared/meetingUtils";
import { completeActiveEngagementsForLost } from "@/services/crm/engagementLifecycleService";
import { CLOSED_DEAL_STAGES, isActiveDealStage } from "@/services/crm/leadCategoryFilters";
import {
  normalizeDocumentRelationship,
  normalizeEngagementRelationship,
} from "../shared/crmRelationshipUtils";

export function useCrmLayoutActions({
  crmData,
  relationshipLeads = [],
  sessionUser,
  userProfile,
  activeSection,
  router,
  setToast,
  handleConvertToClientAndProject,
}) {
  const {
    leads,
    setLeads,
    leadPagination,
    setLeadPagination,
    leadSummary,
    setLeadSummary,
    refreshLeadSummary,
    clients,
    deals,
    setDeals,
    dealPagination,
    setDealPagination,
    dealSummary,
    setDealSummary,
    refreshDealSummary,
    proposals,
    setProposals,
    quotations,
    setQuotations,
    agreements,
    setAgreements,
    commercialSummary,
    setCommercialSummary,
    refreshCommercialSummary,
    salesFollowUps,
    setSalesFollowUps,
    engagementFollowUps,
    setEngagementFollowUps,
    followUpPagination,
    setFollowUpPagination,
    followUpSummary,
    setFollowUpSummary,
    refreshFollowUpSummary,
    salesMeetings,
    setSalesMeetings,
    meetingPagination,
    setMeetingPagination,
    meetingSummary,
    setMeetingSummary,
    refreshMeetingSummary,
    invoicesList,
    setInvoicesList,
    crmLoading,
    loadCrmData,
    handleFetchLeadsPage,
    handleFetchDealsPage,
    handleFetchFollowUpsPage,
    handleFetchMeetingsPage,
  } = crmData;

  const handleDirectWhatsapp = useCallback(
    (phone, name, messageText = "") => {
      if (!phone) {
        setToast("Phone number not available.");
        return;
      }
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const text = encodeURIComponent(messageText || `Hi ${name || ""}, this is from TexWeb Solution.`);
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
    },
    [setToast]
  );

  async function completeLostEngagements({ leadId = "", dealId = "" } = {}) {
    const dealIds = leadId
      ? deals.filter((deal) => deal.lead_id === leadId).map((deal) => deal.id)
      : [];
    await completeActiveEngagementsForLost({ leadId, dealId, dealIds });

    const linkedDealIds = new Set([dealId, ...dealIds].filter(Boolean));
    const isLinked = (item) => (
      (leadId && item.lead_id === leadId) ||
      (item.deal_id && linkedDealIds.has(item.deal_id))
    );
    const completedAt = new Date().toISOString();
    setSalesFollowUps((prev) => prev.map((item) => (
      isLinked(item) && isFollowUpActive(item.status)
        ? { ...item, status: "done", completed_at: completedAt, updated_at: completedAt }
        : item
    )));
    setEngagementFollowUps((prev) => prev.map((item) => (
      isLinked(item) && isFollowUpActive(item.status)
        ? { ...item, status: "done", completed_at: completedAt, updated_at: completedAt }
        : item
    )));
    setSalesMeetings((prev) => prev.map((item) => (
      isLinked(item) && isMeetingActive(item.status)
        ? { ...item, status: "completed", updated_at: completedAt }
        : item
    )));
    await Promise.all([
      refreshFollowUpSummary?.({ force: true }),
      refreshMeetingSummary?.({ force: true }),
    ]);
  }

  async function closeActiveDealsForLostLead(leadId, extra = {}) {
    const activeLinkedDeals = deals.filter(
      (deal) => deal.lead_id === leadId && isActiveDealStage(deal.pipeline_stage || deal.stage || "")
    );
    if (activeLinkedDeals.length === 0) return;

    await Promise.all(activeLinkedDeals.map((deal) => updateDealStage(deal.id, "closed_lost", extra)));
    const linkedIds = new Set(activeLinkedDeals.map((deal) => deal.id));
    setDeals((prev) => prev.map((deal) => (
      linkedIds.has(deal.id) ? { ...deal, ...extra, pipeline_stage: "closed_lost" } : deal
    )));
    refreshDealSummary?.({ force: true });
  }

  const workspaceViewProps = {
    leads,
    relationshipLeads,
    leadPagination,
    leadSummary,
    onRefreshLeadSummary: refreshLeadSummary,
    deals,
    dealPagination,
    dealSummary,
    onRefreshDealSummary: refreshDealSummary,
    clients,
    proposals,
    quotations,
    agreements,
    commercialSummary,
    onRefreshCommercialSummary: refreshCommercialSummary,
    invoices: invoicesList,
    followUps: salesFollowUps,
    engagementFollowUps,
    followUpPagination,
    followUpSummary,
    onRefreshFollowUpSummary: refreshFollowUpSummary,
    salesMeetings,
    meetingPagination,
    meetingSummary,
    onRefreshMeetingSummary: refreshMeetingSummary,
    isLoading: crmLoading,
    currentUser: sessionUser,
    currentProfile: userProfile,
    onFetchLeadsPage: handleFetchLeadsPage,
    onFetchDealsPage: handleFetchDealsPage,
    onFetchFollowUpsPage: handleFetchFollowUpsPage,
    onFetchMeetingsPage: handleFetchMeetingsPage,
    onRefresh: (scope = activeSection, options = {}) => loadCrmData(scope, { ...options, force: true }),
    onOpenDirectWhatsapp: handleDirectWhatsapp,
    onOpenChatWithLead: () => {
      router.push("/crm/chat");
      setToast("Team Chat sidebar page opened.");
    },
    onOpenChat: () => {
      router.push("/crm/chat");
      setToast("Team Chat sidebar page opened.");
    },
    onNavigateSection: (section, params = {}) => {
      const target = CRM_NAV.find((item) => item.section === section);
      if (target) {
        if (params && Object.keys(params).length > 0) {
          const validParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
          );
          const search = new URLSearchParams(validParams).toString();
          router.push(search ? `${target.href}?${search}` : target.href);
        } else {
          router.push(target.href);
        }
      }
    },
    onUpdateLeadStatus: async (id, status) => {
      await updateCloudLeadStatus(id, status);
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
      if (String(status).toLowerCase() === "lost") {
        await closeActiveDealsForLostLead(id);
        await completeLostEngagements({ leadId: id });
      }
      refreshLeadSummary?.();
      setToast(`Lead status updated to ${status}.`);
    },
    onCreateLead: async (data) => {
      const res = await createCloudLead(data);
      if (res) {
        setLeads((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
        setLeadPagination?.((prev) => ({ ...prev, count: (prev?.count || 0) + 1 }));
        setLeadSummary?.((prev) => ({ ...prev, total: (prev?.total || 0) + 1, active: (prev?.active || 0) + 1 }));
        refreshLeadSummary?.();
        setToast("New lead created successfully.");
      }
    },
    onAddLead: async (data) => {
      const res = await createCloudLead(data);
      if (res) {
        setLeads((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
        setLeadPagination?.((prev) => ({ ...prev, count: (prev?.count || 0) + 1 }));
        setLeadSummary?.((prev) => ({ ...prev, total: (prev?.total || 0) + 1, active: (prev?.active || 0) + 1 }));
        refreshLeadSummary?.();
        setToast("New lead created successfully.");
      }
    },
    onImportBatchLeads: async (rows) => {
      const res = await createCloudLeadsBatch(rows);
      if (res?.length) {
        setLeads((prev) => [...res, ...prev]);
        setLeadPagination?.((prev) => ({ ...prev, count: (prev?.count || 0) + res.length }));
        refreshLeadSummary?.();
        setToast(`${res.length} Meta leads imported successfully.`);
      }
      return res;
    },
    onUpdateLead: async (id, updates) => {
      const res = await updateCloudLead(id, updates);
      if (res) setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...updates, ...res } : lead)));
      setToast("Lead updated successfully.");
      return res;
    },
    onDeleteLead: async (id) => {
      const targetLead = leads.find((l) => l.id === id);
      const linkedDeals = deals.filter((d) => d.lead_id === id);
      const activeLinkedDeals = linkedDeals.filter((d) => !CLOSED_DEAL_STAGES.has(d.pipeline_stage || d.stage));
      const deletedActiveDealVal = activeLinkedDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);

      // Determine category of lead before deletion for instant card update
      let cat = "active";
      if (targetLead) {
        if (targetLead.status === "Converted" || targetLead.status === "Closed Won" || linkedDeals.some((d) => (d.pipeline_stage || d.stage) === "closed_won")) {
          cat = "converted";
        } else if (targetLead.status === "Lost" || linkedDeals.some((d) => (d.pipeline_stage || d.stage) === "closed_lost")) {
          cat = "lost";
        } else if (activeLinkedDeals.length > 0 || ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(targetLead.status)) {
          cat = "pipeline";
        }
      }

      // 1. Optimistic Leads table & pagination update
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      setLeadPagination?.((prev) => ({ ...prev, count: Math.max((prev?.count || 0) - 1, 0) }));

      // 2. Optimistic Deals, Meetings, Follow-ups & Documents cleanup (Immediate UI removal)
      const dealIdsSet = new Set(linkedDeals.map((d) => d.id));
      if (linkedDeals.length > 0) {
        setDeals((prev) => prev.filter((deal) => deal.lead_id !== id));
        setDealPagination?.((prev) => ({ ...prev, count: Math.max((prev?.count || 0) - linkedDeals.length, 0) }));
        setDealSummary?.((prev) => ({
          ...prev,
          total: Math.max((prev?.total || 0) - linkedDeals.length, 0),
          active: Math.max((prev?.active || 0) - activeLinkedDeals.length, 0),
          activeValue: Math.max((prev?.activeValue || 0) - deletedActiveDealVal, 0),
          totalValue: Math.max((prev?.totalValue || 0) - deletedActiveDealVal, 0),
        }));
      }

      setSalesMeetings?.((prev) => prev.filter((m) => m.lead_id !== id && !dealIdsSet.has(m.deal_id)));
      setSalesFollowUps?.((prev) => prev.filter((f) => f.lead_id !== id && !dealIdsSet.has(f.deal_id)));
      setEngagementFollowUps?.((prev) => prev.filter((f) => f.lead_id !== id && !dealIdsSet.has(f.deal_id)));
      if (dealIdsSet.size > 0) {
        setProposals?.((prev) => prev.filter((p) => !dealIdsSet.has(p.deal_id)));
        setQuotations?.((prev) => prev.filter((q) => !dealIdsSet.has(q.deal_id)));
        setAgreements?.((prev) => prev.filter((a) => !dealIdsSet.has(a.deal_id)));
        setInvoicesList?.((prev) => prev.filter((inv) => !dealIdsSet.has(inv.deal_id)));
      }

      // 3. Optimistic Leads Summary Cards update (Live update cards without refresh!)
      setLeadSummary?.((prev) => ({
        ...prev,
        total: Math.max((prev?.total || 0) - 1, 0),
        active: cat === "active" ? Math.max((prev?.active || 0) - 1, 0) : (prev?.active || 0),
        pipeline: cat === "pipeline" ? Math.max((prev?.pipeline || 0) - 1, 0) : (prev?.pipeline || 0),
        converted: cat === "converted" ? Math.max((prev?.converted || 0) - 1, 0) : (prev?.converted || 0),
        lost: cat === "lost" ? Math.max((prev?.lost || 0) - 1, 0) : (prev?.lost || 0),
      }));

      const ok = await deleteCloudLead(id);
      if (ok) {
        refreshLeadSummary?.();
        refreshDealSummary?.();
        refreshMeetingSummary?.();
        refreshFollowUpSummary?.();
        refreshCommercialSummary?.();
        setToast("Lead aur sabhi linked records (deal, meetings, documents) delete ho gaye.");
      } else {
        if (targetLead) {
          setLeads((prev) => [targetLead, ...prev]);
          if (linkedDeals.length > 0) {
            setDeals((prev) => [...linkedDeals, ...prev]);
          }
          refreshLeadSummary?.();
          refreshDealSummary?.();
        }
        setToast("Lead delete nahi ho payi. Please try again.");
      }
    },
    onMarkLeadLost: async (id, updates) => {
      const res = await updateCloudLead(id, { ...updates, status: "Lost" });
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...updates, status: "Lost", ...(res || {}) } : lead)));
      await closeActiveDealsForLostLead(id, {
        loss_reason: updates?.loss_reason || "Linked lead marked Lost",
      });
      await completeLostEngagements({ leadId: id });
      refreshLeadSummary?.();
      setToast("Lead marked lost.");
      return res;
    },
    onCreateDeal: async (deal) => {
      if (!deal?.lead_id) {
        setToast("Pipeline deal create karne ke liye linked lead select karein.");
        return null;
      }
      const res = await createDeal({ ...deal, created_by: sessionUser?.id || null });
      if (res) {
        const val = Number(res.deal_value || res.value) || 0;
        setDeals((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
        setDealPagination?.((prev) => ({ ...prev, count: (prev?.count || 0) + 1 }));
        if (deal.lead_id) {
          setLeads((prev) => prev.map((l) => (l.id === deal.lead_id ? { ...l, status: "In Pipeline" } : l)));
          updateCloudLeadStatus(deal.lead_id, "In Pipeline").catch(() => {});
        }
        // Live optimistic card updates
        setLeadSummary?.((prev) => ({
          ...prev,
          active: Math.max((prev?.active || 0) - 1, 0),
          pipeline: (prev?.pipeline || 0) + 1,
        }));
        setDealSummary?.((prev) => ({
          ...prev,
          total: (prev?.total || 0) + 1,
          active: (prev?.active || 0) + 1,
          totalValue: (prev?.totalValue || 0) + val,
          activeValue: (prev?.activeValue || 0) + val,
        }));
        refreshLeadSummary?.();
        refreshDealSummary?.();
        setToast("Pipeline deal created.");
      }
      return res;
    },
    onUpdateDealStage: async (id, stage, extra = {}) => {
      const currentDeal = deals.find((d) => d.id === id);
      const oldStage = currentDeal?.pipeline_stage || currentDeal?.stage || "contacted";
      const val = Number(currentDeal?.deal_value || currentDeal?.value) || 0;
      const wasActive = !CLOSED_DEAL_STAGES.has(oldStage);
      const nowActive = !CLOSED_DEAL_STAGES.has(stage);
      const wasWon = oldStage === "closed_won";
      const nowWon = stage === "closed_won";
      const wasLost = oldStage === "closed_lost" || oldStage === "lost";
      const nowLost = stage === "closed_lost" || stage === "lost";

      // Live optimistic deal summary card update without waiting for refresh!
      setDealSummary?.((prev) => {
        let active = prev?.active || 0;
        let won = prev?.won || 0;
        let lost = prev?.lost || 0;
        let activeVal = prev?.activeValue || 0;
        let wonVal = prev?.wonValue || 0;
        let lostVal = prev?.lostValue || 0;

        if (wasActive && !nowActive) {
          active = Math.max(0, active - 1);
          activeVal = Math.max(0, activeVal - val);
        } else if (!wasActive && nowActive) {
          active = active + 1;
          activeVal = activeVal + val;
        }

        if (!wasWon && nowWon) {
          won = won + 1;
          wonVal = wonVal + val;
        } else if (wasWon && !nowWon) {
          won = Math.max(0, won - 1);
          wonVal = Math.max(0, wonVal - val);
        }

        if (!wasLost && nowLost) {
          lost = lost + 1;
          lostVal = lostVal + val;
        } else if (wasLost && !nowLost) {
          lost = Math.max(0, lost - 1);
          lostVal = Math.max(0, lostVal - val);
        }

        return { ...prev, active, won, lost, activeValue: activeVal, wonValue: wonVal, lostValue: lostVal };
      });

      const res = await updateDealStage(id, stage, extra);
      if (res) {
        setDeals((prev) => prev.map((deal) => (deal.id === id ? { ...deal, ...res } : deal)));
        refreshDealSummary?.();
        refreshLeadSummary?.();
      }
      if (CLOSED_DEAL_STAGES.has(stage) && stage !== "closed_won") {
        await completeLostEngagements({ dealId: id });
      }
      setToast("Pipeline stage updated.");
      return res;
    },
    onUpdateDeal: async (id, updates) => {
      const res = await updateDeal(id, updates);
      if (res) {
        setDeals((prev) => prev.map((deal) => (deal.id === id ? { ...deal, ...updates, ...res } : deal)));
        refreshDealSummary?.();
      }
      setToast("Deal updated.");
      return res;
    },
    onConvertToClientAndProject: handleConvertToClientAndProject,
    onCreateProposal: async (proposal) => {
      const linkedProposal = normalizeDocumentRelationship(proposal, deals);
      if (!linkedProposal.deal_id || !linkedProposal.lead_id) {
        setToast("Quotation ke liye linked pipeline deal aur lead required hai.");
        return null;
      }
      const res = await createProposal({ ...linkedProposal, created_by: sessionUser?.id || null });
      if (res) setProposals((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
      setToast("Sales quotation saved.");
      return res;
    },
    onUpdateProposal: async (id, updates) => {
      const res = await updateProposal(id, updates);
      if (res) setProposals((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
      setToast("Quotation updated.");
      return res;
    },
    onUpdateQuotation: async (id, updates) => {
      const res = await updateQuotation(id, updates);
      if (res) setQuotations((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
      setToast("Quotation updated.");
      return res;
    },
    onCreateAgreement: async (agreement) => {
      const linkedAgreement = normalizeDocumentRelationship(agreement, deals);
      if (!linkedAgreement.deal_id || !linkedAgreement.lead_id) {
        setToast("Agreement ke liye linked pipeline deal aur lead required hai.");
        return null;
      }
      const res = await createAgreement({ ...linkedAgreement, created_by: sessionUser?.id || null });
      if (res) setAgreements((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
      setToast("Client agreement saved.");
      return res;
    },
    onUpdateAgreement: async (id, updates) => {
      const res = await updateAgreement(id, updates);
      if (res) setAgreements((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
      setToast("Agreement updated.");
      return res;
    },
    onCreateInvoice: async (invoice) => {
      const linkedInvoice = normalizeDocumentRelationship(invoice, deals);
      if (!linkedInvoice.deal_id || !linkedInvoice.lead_id) {
        setToast("Invoice ke liye linked pipeline deal aur lead required hai.");
        return null;
      }
      const res = await createInvoice({ ...linkedInvoice, created_by: sessionUser?.id || null });
      if (res) setInvoicesList((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
      setToast("Invoice generated successfully.");
      return res;
    },
    onUpdateInvoice: async (id, updates) => {
      const res = await updateInvoice(id, updates);
      if (res) setInvoicesList((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
      setToast("Invoice updated.");
      return res;
    },
    onCreateFollowUp: async (followUp) => {
      const linkedFollowUp = normalizeEngagementRelationship(followUp, deals);
      const targetLeadId = linkedFollowUp.lead_id;
      const targetDealId = linkedFollowUp.deal_id;
      if (!targetLeadId) {
        setToast("Follow-up ke liye linked lead select karein.");
        return null;
      }
      if (targetLeadId || targetDealId) {
        const existingActive = engagementFollowUps.find((item) => (
          isFollowUpActive(item.status) && (
            (targetLeadId && item.lead_id === targetLeadId) ||
            (targetDealId && item.deal_id === targetDealId)
          )
        ));
        if (existingActive) {
          setToast?.(`Active follow-up already scheduled for this lead (${new Date(existingActive.due_at).toLocaleDateString("en-IN")}). Please complete or reschedule it.`);
          return existingActive;
        }
      }
      const res = await createSalesFollowUp({ ...linkedFollowUp, created_by: sessionUser?.id || null, assigned_to: sessionUser?.id || null });
      if (res) {
        setSalesFollowUps((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
        setEngagementFollowUps((prev) => [res, ...prev.filter((item) => item.id !== res.id)].slice(0, 500));
        setFollowUpPagination?.((prev) => ({ ...prev, count: (prev?.count || 0) + 1 }));
        refreshFollowUpSummary?.();
      }
      setToast("Sales follow-up scheduled.");
      return res;
    },
    onUpdateFollowUp: async (id, updates) => {
      const res = await updateSalesFollowUp(id, updates);
      if (res) {
        setSalesFollowUps((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
        setEngagementFollowUps((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
        refreshFollowUpSummary?.();
      }
      setToast("Follow-up updated.");
      return res;
    },
    onDeleteFollowUp: async (id) => {
      const ok = await deleteSalesFollowUp(id);
      if (ok) {
        setSalesFollowUps((prev) => prev.filter((item) => item.id !== id));
        setEngagementFollowUps((prev) => prev.filter((item) => item.id !== id));
        setFollowUpPagination?.((prev) => ({ ...prev, count: Math.max((prev?.count || 0) - 1, 0) }));
        refreshFollowUpSummary?.();
      }
      setToast("Follow-up deleted.");
    },
    onCreateSalesMeeting: async (meeting) => {
      const linkedMeeting = normalizeEngagementRelationship(meeting, deals);
      const targetLeadId = linkedMeeting.lead_id;
      const targetDealId = linkedMeeting.deal_id;
      if (!targetLeadId) {
        setToast("Meeting ke liye linked lead select karein.");
        return null;
      }
      if (targetLeadId || targetDealId) {
        const existingActive = salesMeetings.find((item) => (
          isMeetingActive(item.status) && (
            (targetLeadId && item.lead_id === targetLeadId) ||
            (targetDealId && item.deal_id === targetDealId)
          )
        ));
        if (existingActive) {
          setToast?.(`Active meeting already scheduled for this lead (${new Date(existingActive.scheduled_at).toLocaleDateString("en-IN")}). Please complete or reschedule it.`);
          return existingActive;
        }
      }
      const res = await createSalesMeeting({ ...linkedMeeting, created_by: sessionUser?.id || null, host_id: sessionUser?.id || null });
      if (res) {
        setSalesMeetings((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
        setMeetingPagination?.((prev) => ({ ...prev, count: (prev?.count || 0) + 1 }));
        refreshMeetingSummary?.();
      }
      setToast("Sales meeting scheduled.");
      return res;
    },
    onUpdateSalesMeeting: async (id, updates) => {
      const res = await updateSalesMeeting(id, updates);
      if (res) {
        setSalesMeetings((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
        refreshMeetingSummary?.();
      }
      setToast("Meeting updated.");
      return res;
    },
    onDeleteSalesMeeting: async (id) => {
      const ok = await deleteSalesMeeting(id);
      if (ok) {
        setSalesMeetings((prev) => prev.filter((item) => item.id !== id));
        setMeetingPagination?.((prev) => ({ ...prev, count: Math.max((prev?.count || 0) - 1, 0) }));
        refreshMeetingSummary?.();
      }
      setToast("Meeting deleted.");
    },
  };

  return {
    handleDirectWhatsapp,
    workspaceViewProps,
  };
}
