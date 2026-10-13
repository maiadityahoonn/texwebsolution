"use client";

import { useState } from "react";
import { useCrmAiDocDrafting } from "./useCrmAiDocDrafting";

export function useCrmCommercialModals({
  deals = [],
  leads = [],
  clients = [],
  proposals = [],
  quotations = [],
  onCreateProposal,
  onCreateAgreement,
  onCreateInvoice,
  onOpenDirectWhatsapp,
  openMeetingWhatsApp = () => {},
}) {
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [commercialType, setCommercialType] = useState("proposal");
  const [commercialForm, setCommercialForm] = useState({
    title: "Website + CRM Implementation Quotation",
    quotation_number: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    agreement_number: `AGR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    client_id: "",
    deal_id: "",
    proposal_id: "",
    quotation_id: "",
    amount: "120000",
    valid_until: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    scope_of_work: "Discovery, UI/UX, Next.js development, Supabase setup, QA, deployment, and handover.",
    deliverables: "Admin panel, client portal, responsive website, source handover, and support.",
    commercial_terms: "40% advance, 30% milestone, 30% final before handover.",
    status: "sent",
    notes: "Prepared by Sales Head for client approval.",
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDeal, setInvoiceDeal] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    deal_id: "",
    client_id: "",
    invoice_number: "",
    title: "",
    amount: "",
    milestone_type: "advance",
    due_date: "",
    notes: "",
    status: "sent",
  });

  const aiDoc = useCrmAiDocDrafting({
    showCommercialModal,
    commercialType,
    commercialForm,
    setCommercialForm,
    deals,
    leads,
    clients,
  });

  function openInvoiceModal(deal = null) {
    const linkedDeal = deal || deals[0];
    const client = clients.find((c) => c.id === linkedDeal?.client_id);
    setInvoiceDeal(linkedDeal || null);
    setInvoiceForm({
      deal_id: linkedDeal?.id || "",
      client_id: linkedDeal?.client_id || client?.id || "",
      invoice_number: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: linkedDeal ? `${linkedDeal.title} - Advance Milestone` : "Project Milestone Invoice",
      amount: linkedDeal?.deal_value ? String(Math.round(Number(linkedDeal.deal_value) * 0.4)) : "40000",
      milestone_type: "advance",
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      notes: "40% advance milestone invoice to initiate design and architectural sprints.",
      status: "sent",
    });
    setShowInvoiceModal(true);
  }

  async function handleInvoiceSubmit(e, sendWhatsApp = false) {
    if (e?.preventDefault) e.preventDefault();
    if (!invoiceForm.title || !invoiceForm.amount) return;
    const invoicePayload = {
      deal_id: invoiceForm.deal_id || invoiceDeal?.id || null,
      client_id: invoiceForm.client_id || invoiceDeal?.client_id || null,
      invoice_number: invoiceForm.invoice_number,
      title: invoiceForm.title,
      amount: Number(invoiceForm.amount) || 0,
      total_amount: Number(invoiceForm.amount) || 0,
      due_date: invoiceForm.due_date || null,
      status: invoiceForm.status || "sent",
      notes: invoiceForm.notes,
      milestone_type: invoiceForm.milestone_type,
    };
    const created = await onCreateInvoice?.(invoicePayload);
    setShowInvoiceModal(false);
    setInvoiceDeal(null);

    if (sendWhatsApp) {
      sendDocWhatsApp(
        {
          ...(created || invoicePayload),
          invoice_number: invoiceForm.invoice_number,
          client_id: invoicePayload.client_id,
          deal_id: invoicePayload.deal_id,
        },
        "invoice"
      );
    }
  }

  function openCommercialModal(type = "proposal", deal = null) {
    if (type === "invoice") {
      return openInvoiceModal(deal);
    }
    const linkedDeal = deal || deals.find((item) => item.id === commercialForm.deal_id) || deals[0];
    setCommercialType(type);
    setCommercialForm((prev) => ({
      ...prev,
      deal_id: linkedDeal?.id || "",
      title: linkedDeal ? `${linkedDeal.title} ${type === "agreement" ? "Agreement" : "Quotation"}` : prev.title,
      amount: linkedDeal?.deal_value ? String(linkedDeal.deal_value) : prev.amount,
      proposal_id: proposals[0]?.id || "",
      quotation_id: quotations[0]?.id || "",
      quotation_number: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      agreement_number: `AGR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
    aiDoc.setAiDocDraft(null);
    aiDoc.setAiDocInput("");
    aiDoc.setAiDocAttachments([]);
    aiDoc.setAiDocTracking({ status: "draft", sent_at: "", channel: "" });
    setShowCommercialModal(true);
  }

  function sendDocWhatsApp(doc, type = "quotation") {
    const linkedDeal = deals.find((d) => d.id === doc?.deal_id);
    const client = clients.find((c) => c.id === doc?.client_id || c.id === linkedDeal?.client_id);
    const lead = leads.find((l) => l.id === doc?.lead_id || l.id === linkedDeal?.lead_id);
    const phone = client?.phone || lead?.phone;
    const name = client?.name || lead?.name || "there";
    const docLabel = type === "agreement" ? "Project Agreement" : type === "invoice" ? "Tax Invoice" : "Commercial Quotation";
    const docNum = doc?.agreement_number || doc?.quotation_number || doc?.invoice_number || "";
    const msg = `Hi ${name}, please review your ${docLabel}${docNum ? ` (${docNum})` : ""} from TexWeb Solution. Let us know if you need any adjustments or if we should proceed with the next milestone.`;
    if (onOpenDirectWhatsapp && phone) {
      onOpenDirectWhatsapp(phone, name, msg);
      return;
    }
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    }
  }

  function sendDealDocWhatsApp(deal) {
    const doc =
      agreements.find((a) => a.deal_id === deal.id) ||
      quotations.find((q) => q.deal_id === deal.id) ||
      proposals.find((p) => p.deal_id === deal.id);
    if (!doc) {
      openMeetingWhatsApp(deal);
      return;
    }
    sendDocWhatsApp(doc, doc.agreement_number ? "agreement" : "quotation");
  }

  async function handleCommercialSubmit(e, sendWhatsApp = false) {
    if (e?.preventDefault) e.preventDefault();
    if (!commercialForm.deal_id) return;

    const amount = Number(commercialForm.amount) || 0;
    const linkedDeal = deals.find((deal) => deal.id === commercialForm.deal_id);
    const linkedLead = leads.find((lead) => lead.id === linkedDeal?.lead_id);
    const basePayload = {
      deal_id: commercialForm.deal_id || null,
      client_id: commercialForm.client_id || linkedDeal?.client_id || null,
      lead_id: linkedLead?.id || linkedDeal?.lead_id || null,
      title: commercialForm.title,
      amount,
      status: sendWhatsApp ? "sent" : commercialForm.status,
      scope_of_work: commercialForm.scope_of_work,
      deliverables: commercialForm.deliverables,
      sent_at: sendWhatsApp || commercialForm.status === "sent" ? new Date().toISOString() : null,
      notes: commercialForm.notes,
    };

    if (commercialType === "agreement") {
      await onCreateAgreement?.({
        ...basePayload,
        agreement_number: commercialForm.agreement_number,
        proposal_id: commercialForm.proposal_id || null,
        quotation_id: commercialForm.quotation_id || null,
        commercial_terms: commercialForm.commercial_terms,
        payment_milestones: [
          { label: "Advance", percent: 40 },
          { label: "Milestone", percent: 30 },
          { label: "Final", percent: 30 },
        ],
        start_date: commercialForm.start_date,
        end_date: commercialForm.end_date,
        status: commercialForm.status === "signed" ? "signed" : basePayload.status,
        signed_at: commercialForm.status === "signed" ? new Date().toISOString() : null,
      });
    } else {
      await onCreateProposal?.(basePayload);
    }

    aiDoc.setAiDocTracking({
      status: sendWhatsApp ? "sent" : commercialForm.status || "draft",
      sent_at: sendWhatsApp || commercialForm.status === "sent" ? new Date().toISOString() : "",
      channel: sendWhatsApp ? "whatsapp" : "",
    });
    setShowCommercialModal(false);

    if (sendWhatsApp) {
      sendDocWhatsApp(
        {
          ...basePayload,
          agreement_number: commercialForm.agreement_number,
          quotation_number: commercialForm.quotation_number,
        },
        commercialType === "agreement" ? "agreement" : "quotation"
      );
    }
  }

  function handlePreviewCommercialPdf() {
    if (typeof window === "undefined") return;
    window.print();
  }

  return {
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
    openCommercialModal,
    openInvoiceModal,
    handleInvoiceSubmit,
    sendDocWhatsApp,
    sendDealDocWhatsApp,
    handleCommercialSubmit,
    handlePreviewCommercialPdf,
    aiDoc,
  };
}
