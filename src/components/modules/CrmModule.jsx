"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  MessageSquare,
  Building2,
  Briefcase,
  X,
  ExternalLink,
  FileText,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import ActivityTimeline from "./ActivityTimeline";
import MetaLeadsImportModal from "./MetaLeadsImportModal";
import { playNotificationSound } from "@/lib/notificationSound";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const PIPELINE_STAGES = [
  { id: "new", label: "New Leads", color: "bg-blue-500" },
  { id: "contacted", label: "Contacted", color: "bg-cyan-500" },
  { id: "qualified", label: "Requirement & Qualified", color: "bg-indigo-500" },
  { id: "proposal", label: "Proposal / Quotation", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-amber-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
];

function getLeadBudget(lead) {
  if (!lead) return "—";
  if (lead.budget_range) return lead.budget_range;
  if (!lead.notes) return "—";
  const match = lead.notes.match(/Budget:\s*([^|]+)/i);
  return match ? match[1].trim() : "—";
}

function getLeadLocation(lead) {
  if (!lead) return "—";
  if (lead.city || lead.state) {
    return [lead.city, lead.state].filter(Boolean).join(", ");
  }
  if (!lead.notes) return "—";
  const match = lead.notes.match(/Location:\s*([^|]+)/i);
  return match ? match[1].trim() : "—";
}

export default function CrmModule({
  leads = [],
  deals = [],
  clients = [],
  proposals = [],
  quotations = [],
  agreements = [],
  initialViewMode = "leads",
  isDark = false,
  onUpdateLeadStatus,
  onCreateLead,
  onAddLead,
  onImportBatchLeads,
  onUpdateLead,
  onDeleteLead,
  onConvertToClientAndProject,
  onCreateProposal,
  onUpdateProposal,
  onCreateQuotation,
  onUpdateQuotation,
  onCreateAgreement,
  onUpdateAgreement,
  onOpenChatWithLead,
  onOpenChat,
  onRefresh,
}) {
  const [viewMode, setViewMode] = useState(initialViewMode); // 'leads' or 'pipeline'

  // Sync viewMode when initialViewMode prop changes (e.g., clicking Leads vs Sales Pipeline in sidebar)
  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showMetaImportModal, setShowMetaImportModal] = useState(false);
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [commercialType, setCommercialType] = useState("proposal");
  const [editingLead, setEditingLead] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
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
  const [commercialForm, setCommercialForm] = useState({
    title: "Website + CRM Implementation Proposal",
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

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchQuery =
        !q ||
        [lead.name, lead.phone, lead.email, lead.service, lead.source].some((val) =>
          String(val || "").toLowerCase().includes(q)
        );
      return matchStatus && matchQuery;
    });
  }, [leads, query, statusFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "New").length;
    const convertedCount = leads.filter((l) => l.status === "Converted" || l.status === "Closed Won").length;
    const rate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;
    const totalPipelineValue = deals.reduce((acc, d) => acc + (Number(d.deal_value) || 0), 0);
    const wonValue = deals
      .filter((d) => d.pipeline_stage === "closed_won")
      .reduce((acc, d) => acc + (Number(d.deal_value) || 0), 0);

    return { total, newCount, convertedCount, rate, totalPipelineValue, wonValue };
  }, [leads, deals]);

  const commercialDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = [
      ...proposals.map((item) => ({ ...item, docType: "proposal" })),
      ...quotations.map((item) => ({ ...item, docType: "quotation" })),
      ...agreements.map((item) => ({ ...item, docType: "agreement" })),
    ];
    return rows.filter((item) => {
      const client = clients.find((c) => c.id === item.client_id);
      return (
        !q ||
        [item.title, item.quotation_number, item.agreement_number, item.status, client?.name, client?.company_name]
          .some((value) => String(value || "").toLowerCase().includes(q))
      );
    });
  }, [agreements, clients, proposals, query, quotations]);

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
    if (!lead.phone) return;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello ${lead.name}, greetings from TexWeb Solution! We received your inquiry regarding ${lead.service || "our software development services"}. How may we assist your project?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function openCommercialModal(type = "proposal") {
    setCommercialType(type);
    setCommercialForm((prev) => ({
      ...prev,
      client_id: clients[0]?.id || "",
      deal_id: deals[0]?.id || "",
      proposal_id: proposals[0]?.id || "",
      quotation_id: quotations[0]?.id || "",
      quotation_number: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      agreement_number: `AGR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
    setShowCommercialModal(true);
  }

  function handleCreateCommercialSubmit(e) {
    e.preventDefault();
    if (!commercialForm.client_id) return;
    const amount = parseFloat(commercialForm.amount) || 0;
    if (commercialType === "proposal") {
      onCreateProposal?.({
        client_id: commercialForm.client_id,
        deal_id: commercialForm.deal_id || null,
        title: commercialForm.title,
        amount,
        status: commercialForm.status,
        scope_of_work: commercialForm.scope_of_work,
        deliverables: commercialForm.deliverables,
        sent_at: commercialForm.status === "sent" ? new Date().toISOString() : null,
        notes: commercialForm.notes,
      });
    } else if (commercialType === "quotation") {
      const tax = Math.round(amount * 0.18);
      onCreateQuotation?.({
        quotation_number: commercialForm.quotation_number,
        client_id: commercialForm.client_id,
        deal_id: commercialForm.deal_id || null,
        subtotal: amount,
        discount: 0,
        tax,
        total: amount + tax,
        status: commercialForm.status === "accepted" ? "accepted" : "sent",
        valid_until: commercialForm.valid_until,
        notes: commercialForm.notes,
        items: [{ title: commercialForm.title, description: commercialForm.scope_of_work, amount }],
      });
    } else {
      onCreateAgreement?.({
        agreement_number: commercialForm.agreement_number,
        client_id: commercialForm.client_id,
        deal_id: commercialForm.deal_id || null,
        proposal_id: commercialForm.proposal_id || null,
        quotation_id: commercialForm.quotation_id || null,
        title: commercialForm.title,
        scope_of_work: commercialForm.scope_of_work,
        deliverables: commercialForm.deliverables,
        commercial_terms: commercialForm.commercial_terms,
        payment_milestones: [
          { label: "Advance", percent: 40 },
          { label: "Milestone", percent: 30 },
          { label: "Final", percent: 30 },
        ],
        start_date: commercialForm.start_date,
        end_date: commercialForm.end_date,
        status: commercialForm.status === "signed" ? "signed" : "sent",
        signed_at: commercialForm.status === "signed" ? new Date().toISOString() : null,
        notes: commercialForm.notes,
      });
    }
    setShowCommercialModal(false);
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">CRM & Sales Operations</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Capture, qualify, convert leads into clients, and hand over to tech engineering seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("leads")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "leads"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Leads List
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "pipeline"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Sales Pipeline
            </button>
            <button
              onClick={() => setViewMode("commercials")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "commercials"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Commercials
            </button>
          </div>

          <button
            onClick={() => onRefresh?.()}
            className="p-2 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-neutral-300 transition cursor-pointer"
            title="Refresh CRM"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowMetaImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white font-semibold text-xs transition shadow-sm cursor-pointer shadow-pink-500/20"
            title="Import Meta Ads Leads (CSV or Webhook)"
          >
            <Sparkles className="w-4 h-4" />
            <span>Import Meta Leads</span>
          </button>

          <button
            onClick={() => openCommercialModal("proposal")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Proposal / Agreement</span>
          </button>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Total Captured Leads</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">{stats.total}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
            {stats.newCount} New awaiting action
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">{stats.rate}%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {stats.convertedCount} Converted to clients
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Active Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">
            ₹{stats.totalPipelineValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Across open proposals</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Closed Won Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">
            ₹{stats.wonValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Transferred to project execution
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads by name, phone, email, service, source..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {["all", "New", "Contacted", "Proposal Sent", "Converted", "Lost"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {st === "all" ? "All Statuses" : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Leads List View */}
      {viewMode === "leads" && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">
              No leads found matching your search and filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto table-scroll">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Contact (Phone & Email)</th>
                    <th className="py-3 px-4">Service Needed</th>
                    <th className="py-3 px-4">Budget Range</th>
                    <th className="py-3 px-4">City / State</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {filteredLeads.map((lead) => {
                    const budget = getLeadBudget(lead);
                    const location = getLeadLocation(lead);

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition group"
                      >
                        {/* 1. Full Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{lead.name}</span>
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
                        </td>

                        {/* 2. Contact Info (Phone & Email) */}
                        <td className="py-3.5 px-4">
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 font-mono text-gray-800 dark:text-slate-200 font-medium">
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
                              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{lead.email}</span>
                            </div>
                          )}
                        </td>

                        {/* 3. Service Needed (what_service_are_you_looking_for?) */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-neutral-200">
                            {lead.service || "General Inquiry"}
                          </span>
                        </td>

                        {/* 4. Budget Range (choose_your_budget_range?) */}
                        <td className="py-3.5 px-4">
                          {budget !== "—" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                              {budget}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* 5. City & State */}
                        <td className="py-3.5 px-4 text-xs font-medium text-gray-700 dark:text-slate-300">
                          {location !== "—" ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                              <span>{location}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* 6. Lead Status */}
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status || "New"}
                            onChange={(e) => onUpdateLeadStatus?.(lead.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-neutral-200 focus:outline-hidden"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Proposal Sent">Proposal Sent</option>
                            <option value="Converted">Converted (Won)</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.phone && (
                            <button
                              onClick={() => handleWhatsAppClick(lead)}
                              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition"
                              title="Chat on WhatsApp"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenChatWithLead?.(lead)}
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition"
                            title="Open Sales Team Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onConvertToClientAndProject?.(lead)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition flex items-center gap-1"
                            title="Convert to Client & Project"
                          >
                            <span>Convert</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition"
                            title="Edit Lead"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {deleteConfirmId === lead.id ? (
                            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/50 p-1 rounded-lg border border-red-200 dark:border-red-800">
                              <span className="text-[10px] text-red-600 dark:text-red-400 font-bold px-1">Delete?</span>
                              <button
                                onClick={() => handleDelete(lead.id)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(lead.id)}
                              className="p-1.5 rounded-lg text-red-500 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                            title="View Timeline & Details"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Sales Pipeline Kanban View */}
      {viewMode === "pipeline" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((col) => {
            const colDeals = deals.filter((d) => (d.pipeline_stage || "new") === col.id);
            const colTotal = colDeals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3 shadow-2xs min-h-[350px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#3a3020]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="font-semibold text-xs text-gray-800 dark:text-neutral-200">
                      {col.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {colDeals.length}
                  </span>
                </div>

                <div className="text-[10px] text-gray-400 mt-1 mb-2 font-mono">
                  ₹{colTotal.toLocaleString("en-IN")}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                  {colDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-200/80 dark:border-[#3a3020] hover:border-orange-500 transition shadow-2xs space-y-1.5"
                    >
                      <div className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-1">
                        {deal.title}
                      </div>
                      <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                        ₹{(Number(deal.deal_value) || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-neutral-400">
                        {deal.service || "Tech Development"}
                      </div>
                      {col.id === "closed_won" && (
                        <button
                          onClick={() => onConvertToClientAndProject?.(deal)}
                          className="w-full mt-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Briefcase className="w-3 h-3" />
                          <span>Create Project</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "commercials" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ["proposal", "New Proposal", "Scope, deliverables, timeline"],
              ["quotation", "New Quotation", "Price, tax, validity"],
              ["agreement", "New Agreement", "Terms, milestones, signature"],
            ].map(([type, title, desc]) => (
              <button
                key={type}
                onClick={() => openCommercialModal(type)}
                className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] text-left hover:border-orange-500/60 transition shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{title}</span>
                  <Plus className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{desc}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
            {commercialDocs.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">
                No proposal, quotation, or agreement found.
              </div>
            ) : (
              <div className="overflow-x-auto table-scroll">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[860px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Document</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Value / Terms</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                    {commercialDocs.map((doc) => {
                      const client = clients.find((item) => item.id === doc.client_id);
                      const amount = Number(doc.total) || Number(doc.amount) || Number(doc.subtotal) || 0;
                      const label = doc.agreement_number || doc.quotation_number || doc.title;
                      const isFinal = ["accepted", "signed", "rejected", "declined", "cancelled"].includes(doc.status);

                      return (
                        <tr key={`${doc.docType}-${doc.id}`} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900 dark:text-white">{label || "Commercial Document"}</div>
                            <div className="text-[11px] text-gray-500 capitalize">{doc.docType}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{client?.name || "Client Account"}</div>
                            <div className="text-[11px] text-gray-500">{client?.company_name || client?.email || "Central client entity"}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-gray-900 dark:text-white">
                              {doc.docType === "agreement" ? (doc.commercial_terms || "Payment milestones") : `Rs. ${amount.toLocaleString("en-IN")}`}
                            </div>
                            {doc.scope_of_work && <div className="text-[11px] text-gray-500 line-clamp-1">{doc.scope_of_work}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ["accepted", "signed"].includes(doc.status)
                                ? "bg-emerald-50 text-emerald-600"
                                : ["rejected", "declined", "cancelled"].includes(doc.status)
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                            }`}>
                              {doc.status || "draft"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 text-xs">
                            {doc.valid_until || doc.start_date || doc.sent_at?.slice(0, 10) || doc.created_at?.slice(0, 10) || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isFinal && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    if (doc.docType === "agreement") onUpdateAgreement?.(doc.id, { status: "signed", signed_at: new Date().toISOString() });
                                    else if (doc.docType === "quotation") onUpdateQuotation?.(doc.id, { status: "accepted" });
                                    else onUpdateProposal?.(doc.id, { status: "accepted", accepted_at: new Date().toISOString() });
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                >
                                  {doc.docType === "agreement" ? "Signed" : "Accept"}
                                </button>
                                <button
                                  onClick={() => {
                                    if (doc.docType === "agreement") onUpdateAgreement?.(doc.id, { status: "cancelled" });
                                    else if (doc.docType === "quotation") onUpdateQuotation?.(doc.id, { status: "declined" });
                                    else onUpdateProposal?.(doc.id, { status: "rejected" });
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-200 transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Lead Detail Drawer / Modal with Activity Timeline */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{selectedLead.name}</h3>
                <span className="text-xs text-gray-500 dark:text-neutral-400">Lead Details & Timeline</span>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Phone Number</span>
                <span className="font-semibold text-gray-800 dark:text-white font-mono">
                  {selectedLead.phone || "N/A"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Email Address</span>
                <span className="font-semibold text-gray-800 dark:text-white truncate block" title={selectedLead.email}>
                  {selectedLead.email || "N/A"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Service Required</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {selectedLead.service || "Web Development"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Budget Range</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
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

            {selectedLead.notes && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs">
                <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-1">
                  Inquiry Notes
                </span>
                <p className="text-gray-700 dark:text-neutral-300">{selectedLead.notes}</p>
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
                  {
                    type: "contacted",
                    title: "Initial Qualification Contact",
                    description: "Lead status set to " + (selectedLead.status || "New"),
                    time: "Recent",
                  },
                ]}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                onClick={() => handleWhatsAppClick(selectedLead)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition flex items-center gap-1.5"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  onConvertToClientAndProject?.(selectedLead);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition flex items-center gap-1.5 shadow-sm"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Convert to Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddLeadSubmit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Add New Lead</h3>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Service
                  </label>
                  <select
                    value={newLeadForm.service}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Customized Software">Customized Software</option>
                    <option value="Prebuilt SaaS">Prebuilt SaaS</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Source
                  </label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  >
                    <option value="Website">Website</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Notes / Requirements
                </label>
                <textarea
                  rows={2}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Customer requirements summary..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
              >
                Save Lead
              </button>
            </div>
          </form>
        </div>
      )}

      {showCommercialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateCommercialSubmit}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Sales Commercial Document</h3>
                <p className="text-[11px] text-gray-400">Proposal, quotation, and agreement stay inside Sales until deal won.</p>
              </div>
              <button type="button" onClick={() => setShowCommercialModal(false)} className="p-1 rounded-lg text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs">
              {[
                ["proposal", "Proposal"],
                ["quotation", "Quotation"],
                ["agreement", "Agreement"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCommercialType(id)}
                  className={`flex-1 rounded-lg px-3 py-2 font-bold transition ${
                    commercialType === id ? "bg-white dark:bg-slate-900 text-orange-600 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Client Account *</label>
                <select
                  required
                  value={commercialForm.client_id}
                  onChange={(e) => setCommercialForm({ ...commercialForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold"
                >
                  <option value="">Select Client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Linked Deal</label>
                <select
                  value={commercialForm.deal_id}
                  onChange={(e) => setCommercialForm({ ...commercialForm, deal_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="">No linked deal</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>{deal.title}</option>
                  ))}
                </select>
              </div>

              {commercialType === "quotation" && (
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Quotation Number</label>
                  <input
                    type="text"
                    value={commercialForm.quotation_number}
                    onChange={(e) => setCommercialForm({ ...commercialForm, quotation_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>
              )}

              {commercialType === "agreement" && (
                <>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Agreement Number</label>
                    <input
                      type="text"
                      value={commercialForm.agreement_number}
                      onChange={(e) => setCommercialForm({ ...commercialForm, agreement_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Proposal Ref</label>
                    <select
                      value={commercialForm.proposal_id}
                      onChange={(e) => setCommercialForm({ ...commercialForm, proposal_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                    >
                      <option value="">No proposal ref</option>
                      {proposals.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Quotation Ref</label>
                    <select
                      value={commercialForm.quotation_id}
                      onChange={(e) => setCommercialForm({ ...commercialForm, quotation_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                    >
                      <option value="">No quotation ref</option>
                      {quotations.map((item) => <option key={item.id} value={item.id}>{item.quotation_number}</option>)}
                    </select>
                  </div>
                </>
              )}

              {commercialType !== "agreement" && (
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Commercial Value *</label>
                  <input
                    type="number"
                    required
                    value={commercialForm.amount}
                    onChange={(e) => setCommercialForm({ ...commercialForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  {commercialType === "agreement" ? "Start Date" : "Valid Until"}
                </label>
                <input
                  type="date"
                  value={commercialType === "agreement" ? commercialForm.start_date : commercialForm.valid_until}
                  onChange={(e) =>
                    setCommercialForm({
                      ...commercialForm,
                      [commercialType === "agreement" ? "start_date" : "valid_until"]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              {commercialType === "agreement" && (
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">End Date</label>
                  <input
                    type="date"
                    value={commercialForm.end_date}
                    onChange={(e) => setCommercialForm({ ...commercialForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Status</label>
                <select
                  value={commercialForm.status}
                  onChange={(e) => setCommercialForm({ ...commercialForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  {commercialType === "agreement" ? <option value="signed">Signed</option> : <option value="accepted">Accepted</option>}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Title *</label>
                <input
                  type="text"
                  required
                  value={commercialForm.title}
                  onChange={(e) => setCommercialForm({ ...commercialForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Scope of Work</label>
                <textarea
                  rows={3}
                  value={commercialForm.scope_of_work}
                  onChange={(e) => setCommercialForm({ ...commercialForm, scope_of_work: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  {commercialType === "agreement" ? "Commercial Terms" : "Deliverables"}
                </label>
                <textarea
                  rows={3}
                  value={commercialType === "agreement" ? commercialForm.commercial_terms : commercialForm.deliverables}
                  onChange={(e) =>
                    setCommercialForm({
                      ...commercialForm,
                      [commercialType === "agreement" ? "commercial_terms" : "deliverables"]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button type="button" onClick={() => setShowCommercialModal(false)} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm">
                Save {commercialType}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Pencil className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Edit Lead Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Client / Lead Name *
                </label>
                <input
                  type="text"
                  required
                  value={editLeadForm.name}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Phone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={editLeadForm.phone}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editLeadForm.email}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Service
                  </label>
                  <select
                    value={editLeadForm.service}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, service: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Customized Software">Customized Software</option>
                    <option value="Prebuilt SaaS">Prebuilt SaaS</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Status
                  </label>
                  <select
                    value={editLeadForm.status}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Notes / Requirements
                </label>
                <textarea
                  rows={2}
                  value={editLeadForm.notes}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, notes: e.target.value })}
                  placeholder="Customer requirements summary..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {showMetaImportModal && (
        <MetaLeadsImportModal
          isOpen={showMetaImportModal}
          onClose={() => setShowMetaImportModal(false)}
          onImport={async (importedLeads) => {
            await onImportBatchLeads?.(importedLeads);
            playNotificationSound("lead");
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
}
