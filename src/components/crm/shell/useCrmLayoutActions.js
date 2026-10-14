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

export function useCrmLayoutActions({
  crmData,
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
    leadSummary,
    refreshLeadSummary,
    clients,
    deals,
    setDeals,
    dealPagination,
    proposals,
    setProposals,
    quotations,
    setQuotations,
    agreements,
    setAgreements,
    salesFollowUps,
    setSalesFollowUps,
    followUpPagination,
    salesMeetings,
    setSalesMeetings,
    meetingPagination,
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

  const workspaceViewProps = {
    leads,
    leadPagination,
    leadSummary,
    onRefreshLeadSummary: refreshLeadSummary,
    deals,
    dealPagination,
    clients,
    proposals,
    quotations,
    agreements,
    invoices: invoicesList,
    followUps: salesFollowUps,
    followUpPagination,
    salesMeetings,
    meetingPagination,
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
      refreshLeadSummary?.();
      setToast(`Lead status updated to ${status}.`);
    },
    onCreateLead: async (data) => {
      const res = await createCloudLead(data);
      if (res) {
        setLeads((prev) => [res, ...prev]);
        refreshLeadSummary?.();
        setToast("New lead created successfully.");
      }
    },
    onAddLead: async (data) => {
      const res = await createCloudLead(data);
      if (res) {
        setLeads((prev) => [res, ...prev]);
        refreshLeadSummary?.();
        setToast("New lead created successfully.");
      }
    },
    onImportBatchLeads: async (rows) => {
      const res = await createCloudLeadsBatch(rows);
      if (res?.length) {
        setLeads((prev) => [...res, ...prev]);
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
      const ok = await deleteCloudLead(id);
      if (ok) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        refreshLeadSummary?.();
        setToast("Lead deleted successfully.");
      }
    },
    onMarkLeadLost: async (id, updates) => {
      const res = await updateCloudLead(id, { ...updates, status: "Lost" });
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...updates, status: "Lost", ...(res || {}) } : lead)));
      refreshLeadSummary?.();
      setToast("Lead marked lost.");
      return res;
    },
    onCreateDeal: async (deal) => {
      const res = await createDeal({ ...deal, created_by: sessionUser?.id || null });
      if (res) {
        setDeals((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
        setToast("Pipeline deal created.");
      }
      return res;
    },
    onUpdateDealStage: async (id, stage, extra = {}) => {
      const res = await updateDealStage(id, stage, extra);
      if (res) setDeals((prev) => prev.map((deal) => (deal.id === id ? { ...deal, ...res } : deal)));
      setToast("Pipeline stage updated.");
      return res;
    },
    onUpdateDeal: async (id, updates) => {
      const res = await updateDeal(id, updates);
      if (res) setDeals((prev) => prev.map((deal) => (deal.id === id ? { ...deal, ...updates, ...res } : deal)));
      setToast("Deal updated.");
      return res;
    },
    onConvertToClientAndProject: handleConvertToClientAndProject,
    onCreateProposal: async (proposal) => {
      const res = await createProposal({ ...proposal, created_by: sessionUser?.id || null });
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
      const res = await createAgreement({ ...agreement, created_by: sessionUser?.id || null });
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
      const res = await createInvoice({ ...invoice, created_by: sessionUser?.id || null });
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
      const res = await createSalesFollowUp({ ...followUp, created_by: sessionUser?.id || null, assigned_to: sessionUser?.id || null });
      if (res) setSalesFollowUps((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
      setToast("Sales follow-up scheduled.");
      return res;
    },
    onUpdateFollowUp: async (id, updates) => {
      const res = await updateSalesFollowUp(id, updates);
      if (res) setSalesFollowUps((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
      setToast("Follow-up updated.");
      return res;
    },
    onDeleteFollowUp: async (id) => {
      const ok = await deleteSalesFollowUp(id);
      if (ok) setSalesFollowUps((prev) => prev.filter((item) => item.id !== id));
      setToast("Follow-up deleted.");
    },
    onCreateSalesMeeting: async (meeting) => {
      const res = await createSalesMeeting({ ...meeting, created_by: sessionUser?.id || null, host_id: sessionUser?.id || null });
      if (res) setSalesMeetings((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
      setToast("Sales meeting scheduled.");
      return res;
    },
    onUpdateSalesMeeting: async (id, updates) => {
      const res = await updateSalesMeeting(id, updates);
      if (res) setSalesMeetings((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, ...res } : item)));
      setToast("Meeting updated.");
      return res;
    },
    onDeleteSalesMeeting: async (id) => {
      const ok = await deleteSalesMeeting(id);
      if (ok) setSalesMeetings((prev) => prev.filter((item) => item.id !== id));
      setToast("Meeting deleted.");
    },
  };

  return {
    handleDirectWhatsapp,
    workspaceViewProps,
  };
}
