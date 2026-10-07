"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
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
  XCircle,
  Copy,
  Check,
  AlertCircle,
  ShieldAlert,
  RotateCcw,
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
  { id: "contacted", label: "Meeting", color: "bg-cyan-500" },
  { id: "qualified", label: "Requirement & Qualified", color: "bg-indigo-500" },
  { id: "proposal", label: "Proposal / Quotation", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-amber-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
];

const STAGE_LOSS_REASONS = {
  contacted: [
    "Unresponsive after 3+ Follow-ups (Ghosted)",
    "Invalid / Wrong Phone Number",
    "Not Interested / Accidental Click",
    "Job / Internship Seeker",
    "Student / Academic Inquiry",
    "Spam / Junk Lead",
    "Budget Too Low (< Minimum Budget)",
  ],
  meeting: [
    "Meeting No-Show / Client Didn't Join",
    "Tech Stack / Scope Mismatch",
    "Client Postponed Project (3-6 Months)",
    "Competitor Selected (Lower Price / Existing SaaS)",
    "Decided to Build with In-House Team",
    "Decision Maker Not Convinced",
  ],
  proposal: [
    "Quotation Rejected (Pricing Too High)",
    "Scope / Deliverables Not Matched",
    "Competitor Selected (Lower Price)",
    "Competitor Selected (Better Brand / Portfolio)",
    "Project Budget Frozen / Cancelled by Management",
    "Client Ghosted After Receiving Quote",
  ],
  negotiation: [
    "Payment Terms Disagreement (Advance %)",
    "Timeline / Delivery SLA Not Matched",
    "Contract / Legal / IP Terms Disagreement",
    "Final Price Discount Not Agreed",
  ],
};

const LOSS_REASONS = [
  ...STAGE_LOSS_REASONS.contacted,
  ...STAGE_LOSS_REASONS.meeting,
  ...STAGE_LOSS_REASONS.proposal,
  ...STAGE_LOSS_REASONS.negotiation,
];

const AI_OBJECTION_HANDLERS = {
  "Quotation Rejected (Pricing Too High)": {
    counter: "Break project into Phase 1 MVP (core features only) to fit current budget, with Phase 2 later.",
    whatsapp_draft: "Hi {NAME}, completely understand budget constraints! Rather than compromising quality, how about we launch a Phase 1 MVP with core essentials at ~40% lower cost, and build advanced modules as revenue flows in? Let's do a quick 5-min call to review the tailored scope.",
  },
  "Budget Too Low (< Minimum Budget)": {
    counter: "Offer a pre-built template/starter kit solution instead of 100% bespoke software.",
    whatsapp_draft: "Hi {NAME}, custom development typically starts higher, but we also have modern pre-built frameworks that can get you live at your target budget! Let me know if you'd like a quick preview demo.",
  },
  "Competitor Selected (Lower Price)": {
    counter: "Emphasize 100% custom code ownership, dedicated project management, post-launch bug warranty, and zero recurring lock-in fees.",
    whatsapp_draft: "Hi {NAME}, wishing you the best with your selection! One quick note: TexWeb provides 100% full source code ownership, zero hidden license fees, and a dedicated PM. If anything changes down the line, our doors are always open.",
  },
  "Competitor Selected (Lower Price / Existing SaaS)": {
    counter: "Explain that off-the-shelf SaaS charges per-user per-month forever, whereas custom software has zero recurring licensing cost.",
    whatsapp_draft: "Hi {NAME}, congratulations on moving forward! Just keep in mind that custom software has 0 recurring user licenses. Whenever you outgrow SaaS limits, feel free to give us a shout.",
  },
  "Unresponsive after 3+ Follow-ups (Ghosted)": {
    counter: "Send a polite 'Breakup / File Closing' message. This psychologically triggers response in 45%+ cases.",
    whatsapp_draft: "Hi {NAME}, haven't heard back so assuming your tech project is on hold for now. Closing this inquiry file to keep your inbox clean—feel free to ping anytime you're ready to restart!",
  },
  "Client Postponed Project (3-6 Months)": {
    counter: "Schedule automated re-touch notification for 45-60 days before their new planned launch quarter.",
    whatsapp_draft: "Hi {NAME}, understood! Timing is everything. I'll make a note to reconnect in a couple of months so we can plan the roadmap well in advance of your launch target.",
  },
  "Meeting No-Show / Client Didn't Join": {
    counter: "Send a gentle rescheduled calendar link with zero pressure.",
    whatsapp_draft: "Hi {NAME}, missed you on our call today! Tech emergencies happen—here's our quick booking link whenever you have 15 mins to reschedule: https://texweb.in/meet",
  },
  "Tech Stack / Scope Mismatch": {
    counter: "Check if TexWeb's custom full-stack, AI, or mobile team can architect a customized alternative.",
    whatsapp_draft: "Hi {NAME}, thank you for walking through your requirements. We've reviewed the scope with our principal engineers to see if an alternative architecture could achieve your exact vision.",
  },
  "Payment Terms Disagreement (Advance %)": {
    counter: "Offer escrow or milestone-based payments (30% advance, 40% demo staging, 30% handover).",
    whatsapp_draft: "Hi {NAME}, we can restructure the payment plan to 3 milestones linked to clear deliverables so you only pay as you see tangible progress. Let's finalize this today!",
  },
};

function getLeadScore(lead) {
  let score = 35;
  if (lead?.phone) score += 15;
  if (lead?.email) score += 10;
  if (lead?.service && lead.service !== "General Inquiry") score += 10;
  if (getLeadBudget(lead) !== "â€”") score += 15;
  if (getLeadLocation(lead) !== "â€”") score += 5;
  if (["Contacted", "Proposal Sent", "Converted"].includes(lead?.status)) score += 10;
  if (lead?.status === "Lost") score = Math.min(score, 20);
  return Math.max(0, Math.min(score, 100));
}

function getLeadNextAction(lead, followUps = [], meetings = []) {
  if (lead?.status === "Lost") return "Archive with loss reason and create nurture reminder after 30 days.";
  if (lead?.status === "Converted") return "Handover to client portal and project delivery.";
  const hasPendingFollowUp = followUps.some((item) => item.lead_id === lead?.id && item.status === "pending");
  const hasScheduledMeeting = meetings.some((item) => item.lead_id === lead?.id && item.status === "scheduled");
  if (!lead?.phone && !lead?.email) return "Capture phone or email before qualification.";
  if (lead?.status === "New") return hasPendingFollowUp ? "Complete first contact follow-up." : "Contact within 5 minutes and qualify budget.";
  if (lead?.status === "Contacted") return hasScheduledMeeting ? "Prepare discovery agenda and confirm attendee." : "Schedule discovery meeting.";
  if (lead?.status === "Proposal Sent") return hasPendingFollowUp ? "Follow up for proposal approval." : "Create approval follow-up for proposal.";
  return "Review conversation and move to next pipeline stage.";
}

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

function getFollowUpWhatsappMessage(item, lead, client) {
  const name = client?.name || lead?.name || "there";
  const context = item?.notes || item?.title || "your project discussion";
  return `Hi ${name}, quick follow-up from TexWeb Solution regarding ${context}. Please let me know a good time to close the next step.`;
}

function formatCalendarDate(value) {
  return new Date(value).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function createGoogleCalendarUrl({ title, start, durationMinutes = 30, details = "", location = "" }) {
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + Number(durationMinutes || 30) * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "TexWeb Sales Follow-up",
    dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function CrmModule({
  leads = [],
  deals = [],
  clients = [],
  proposals = [],
  quotations = [],
  agreements = [],
  followUps = [],
  salesMeetings = [],
  initialViewMode = "leads",
  commercialScope = "all",
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
  onUpdateQuotation,
  onCreateAgreement,
  onUpdateAgreement,
  onCreateFollowUp,
  onUpdateFollowUp,
  onCreateSalesMeeting,
  onUpdateSalesMeeting,
  onUpdateDealStage,
  onMarkLeadLost,
  onCreateDeal,
  onOpenDirectWhatsapp,
  onOpenChatWithLead,
  onOpenChat,
  onRefresh,
  showViewTabs = false,
  headerActionsSlotId = "",
}) {
  const [viewMode, setViewMode] = useState(initialViewMode); // 'leads' or 'pipeline'
  const [headerActionsTarget, setHeaderActionsTarget] = useState(null);

  // Sync viewMode when initialViewMode prop changes (e.g., clicking Leads vs Sales Pipeline in sidebar)
  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);

  useEffect(() => {
    if (!headerActionsSlotId) {
      setHeaderActionsTarget(null);
      return;
    }
    setHeaderActionsTarget(document.getElementById(headerActionsSlotId));
  }, [headerActionsSlotId, viewMode]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    from: "",
    to: "",
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showMetaImportModal, setShowMetaImportModal] = useState(false);
  const [showCommercialModal, setShowCommercialModal] = useState(false);
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
    due_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    notes: "",
    meeting_link: "",
  });
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostTarget, setLostTarget] = useState(null);
  const [commercialType, setCommercialType] = useState("proposal");
  const [editingLead, setEditingLead] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [newDealForm, setNewDealForm] = useState({
    title: "",
    client_id: "",
    lead_id: "",
    pipeline_stage: "contacted",
    deal_value: "100000",
    service: "Web Development",
    meeting_scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
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
  const [followUpForm, setFollowUpForm] = useState({
    title: "Follow up for proposal approval",
    lead_id: "",
    client_id: "",
    deal_id: "",
    channel: "whatsapp",
    due_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    priority: "medium",
    notes: "",
  });
  const [salesMeetingForm, setSalesMeetingForm] = useState({
    title: "Client requirement discovery call",
    lead_id: "",
    client_id: "",
    deal_id: "",
    meeting_type: "discovery",
    scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    duration_minutes: 30,
    meeting_link: defaultMeetLink,
    agenda: "Requirement discovery, budget, timeline, decision maker, and next action.",
  });
  const [copiedScript, setCopiedScript] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [lostForm, setLostForm] = useState({
    stage: "contacted",
    reason: "Unresponsive after 3+ Follow-ups (Ghosted)",
    notes: "",
    competitor_name: "",
    re_nurture_days: "30",
  });

  function matchesDateFilter(item, field = "created_at") {
    if (dateFilter === "all") return true;
    const rawDate = item?.[field] || item?.created_at || item?.updated_at;
    if (!rawDate) return false;
    const time = new Date(rawDate).getTime();
    const now = Date.now();
    if (Number.isNaN(time)) return false;
    const itemDate = new Date(time);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    if (dateFilter === "today") return itemDate >= todayStart && itemDate < tomorrowStart;
    if (dateFilter === "yesterday") return itemDate >= yesterdayStart && itemDate < todayStart;
    if (dateFilter === "date") {
      if (!selectedDate) return true;
      const selectedStart = new Date(`${selectedDate}T00:00:00`);
      const selectedEnd = new Date(selectedStart);
      selectedEnd.setDate(selectedEnd.getDate() + 1);
      return itemDate >= selectedStart && itemDate < selectedEnd;
    }
    if (dateFilter === "day") return time >= now - 86400000;
    if (dateFilter === "week") return time >= now - 7 * 86400000;
    if (dateFilter === "month") return time >= now - 30 * 86400000;
    if (dateFilter === "year") return time >= now - 365 * 86400000;
    if (dateFilter === "custom") {
      const from = customDateRange.from ? new Date(customDateRange.from).getTime() : null;
      const to = customDateRange.to ? new Date(`${customDateRange.to}T23:59:59`).getTime() : null;
      return (!from || time >= from) && (!to || time <= to);
    }
    return true;
  }

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const isInPipeline = deals.some((deal) => deal.lead_id === lead.id);
      const isArchived = ["Converted", "Lost", "Archived"].includes(lead.status) || isInPipeline;
      const matchStatus =
        statusFilter === "active"
          ? !isArchived
          : statusFilter === "archived"
          ? isArchived
          : lead.status === statusFilter;
      const matchDate = matchesDateFilter(lead);
      const matchQuery =
        !q ||
        [lead.name, lead.phone, lead.email, lead.service, lead.source].some((val) =>
          String(val || "").toLowerCase().includes(q)
        );
      return matchStatus && matchQuery && matchDate;
    });
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, leads, query, selectedDate, statusFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "New").length;
    const convertedCount = leads.filter((l) => l.status === "Converted" || l.status === "Closed Won").length;
    const lostCount = leads.filter((l) => l.status === "Lost").length;
    const lostDealsCount = deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").length;
    const rate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;
    const totalPipelineValue = deals.reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);
    const wonValue = deals
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_won")
      .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);
    const lostValue = deals
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_lost")
      .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);

    return { total, newCount, convertedCount, lostCount, lostDealsCount, rate, totalPipelineValue, wonValue, lostValue };
  }, [leads, deals]);

  const commercialDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = [
      ...proposals.map((item) => ({ ...item, docType: "proposal_quote" })),
      ...quotations.map((item) => ({ ...item, docType: "proposal_quote" })),
      ...agreements.map((item) => ({ ...item, docType: "agreement" })),
    ];
    return rows.filter((item) => {
      if (commercialScope === "proposal_quote" && item.docType !== "proposal_quote") return false;
      if (commercialScope === "agreement" && item.docType !== "agreement") return false;
      if (!matchesDateFilter(item, item.docType === "agreement" ? "start_date" : "created_at")) return false;
      const client = clients.find((c) => c.id === item.client_id);
      return (
        !q ||
        [item.title, item.quotation_number, item.agreement_number, item.status, client?.name, client?.company_name]
          .some((value) => String(value || "").toLowerCase().includes(q))
      );
    });
  }, [agreements, clients, commercialScope, customDateRange.from, customDateRange.to, dateFilter, proposals, query, quotations, selectedDate]);

  const filteredFollowUps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return followUps.filter((item) => {
      const lead = leads.find((l) => l.id === item.lead_id);
      const client = clients.find((c) => c.id === item.client_id);
      if (!matchesDateFilter(item, "due_at")) return false;
      return !q || [item.title, item.channel, item.status, item.notes, lead?.name, client?.name]
        .some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [clients, customDateRange.from, customDateRange.to, dateFilter, followUps, leads, query, selectedDate]);

  const filteredSalesMeetings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return salesMeetings.filter((item) => {
      const lead = leads.find((l) => l.id === item.lead_id);
      const client = clients.find((c) => c.id === item.client_id);
      if (!matchesDateFilter(item, "scheduled_at")) return false;
      return !q || [item.title, item.meeting_type, item.status, item.agenda, lead?.name, client?.name]
        .some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [clients, customDateRange.from, customDateRange.to, dateFilter, leads, query, salesMeetings, selectedDate]);

  const archivedDeals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((deal) => {
      const isArchived = (deal.pipeline_stage || deal.stage) === "closed_lost";
      const matchQuery = !q || [deal.title, deal.service, deal.loss_reason, deal.notes]
        .some((value) => String(value || "").toLowerCase().includes(q));
      return isArchived && matchQuery && matchesDateFilter(deal, "updated_at");
    });
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, query, selectedDate]);

  const aiInsights = useMemo(() => {
    const openLeads = leads.filter((lead) => !["Converted", "Lost"].includes(lead.status) && !deals.some((deal) => deal.lead_id === lead.id));
    const rankedLeads = openLeads
      .map((lead) => ({
        lead,
        score: getLeadScore(lead),
        action: getLeadNextAction(lead, followUps, salesMeetings),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    const overdueFollowUps = followUps.filter((item) => item.status === "pending" && new Date(item.due_at).getTime() < Date.now()).length;
    const staleDeals = deals.filter((deal) => !["closed_won", "closed_lost"].includes(deal.pipeline_stage) && new Date(deal.updated_at || deal.created_at || Date.now()).getTime() < Date.now() - 7 * 86400000);
    const warmStaleDeals = deals.filter((deal) => !["closed_won", "closed_lost"].includes(deal.pipeline_stage) && new Date(deal.updated_at || deal.created_at || Date.now()).getTime() < Date.now() - 3 * 86400000);
    return { rankedLeads, overdueFollowUps, staleDeals, warmStaleDeals };
  }, [deals, followUps, leads, salesMeetings]);

  const salesReport = useMemo(() => {
    const completedFollowUps = followUps.filter((item) => item.status === "done" && matchesDateFilter(item, "completed_at")).length;
    const missedFollowUps = followUps.filter((item) => item.status === "missed" && matchesDateFilter(item, "updated_at")).length;
    const overdueFollowUps = followUps.filter((item) => item.status === "pending" && new Date(item.due_at).getTime() < Date.now()).length;
    const wonDeals = deals.filter((deal) => (deal.pipeline_stage || deal.stage) === "closed_won" && matchesDateFilter(deal, "updated_at")).length;
    const lostDeals = deals.filter((deal) => (deal.pipeline_stage || deal.stage) === "closed_lost" && matchesDateFilter(deal, "updated_at")).length;
    const activeLeads = leads.filter((lead) => matchesDateFilter(lead, "created_at")).length;
    const conversionRate = activeLeads > 0 ? Math.round((wonDeals / activeLeads) * 100) : 0;
    const sourceMap = new Map();
    leads.forEach((lead) => {
      const source = lead.source || "Unknown";
      const row = sourceMap.get(source) || { source, leads: 0, won: 0, lost: 0, value: 0 };
      row.leads += 1;
      if (lead.status === "Lost") row.lost += 1;
      sourceMap.set(source, row);
    });
    deals.forEach((deal) => {
      const lead = leads.find((item) => item.id === deal.lead_id);
      const source = lead?.source || "Direct / Client";
      const row = sourceMap.get(source) || { source, leads: 0, won: 0, lost: 0, value: 0 };
      if ((deal.pipeline_stage || deal.stage) === "closed_won") row.won += 1;
      if ((deal.pipeline_stage || deal.stage) === "closed_lost") row.lost += 1;
      row.value += Number(deal.deal_value || deal.value) || 0;
      sourceMap.set(source, row);
    });
    return {
      completedFollowUps,
      missedFollowUps,
      overdueFollowUps,
      conversionRate,
      sourceRows: Array.from(sourceMap.values()).sort((a, b) => b.value - a.value).slice(0, 5),
    };
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, followUps, leads, selectedDate]);

  const selectedLeadActivity = useMemo(() => {
    if (!selectedLead?.id) return { followUps: [], meetings: [], deals: [], summary: "" };
    const linkedDeals = deals.filter((deal) => deal.lead_id === selectedLead.id);
    const dealIds = new Set(linkedDeals.map((deal) => deal.id));
    const linkedFollowUps = followUps
      .filter((item) => item.lead_id === selectedLead.id || dealIds.has(item.deal_id))
      .sort((a, b) => new Date(b.completed_at || b.due_at || b.created_at || 0) - new Date(a.completed_at || a.due_at || a.created_at || 0));
    const linkedMeetings = salesMeetings
      .filter((item) => item.lead_id === selectedLead.id || dealIds.has(item.deal_id))
      .sort((a, b) => new Date(b.scheduled_at || b.created_at || 0) - new Date(a.scheduled_at || a.created_at || 0));
    const lastFollowUp = linkedFollowUps[0];
    const lastMeeting = linkedMeetings[0];
    const openFollowUps = linkedFollowUps.filter((item) => item.status === "pending").length;
    const summary = [
      `${selectedLead.name || "Client"} came from ${selectedLead.source || "unknown source"} for ${selectedLead.service || "a TexWeb service"}.`,
      selectedLead.status ? `Current lead status is ${selectedLead.status}.` : "",
      lastMeeting ? `Latest meeting: ${lastMeeting.title} (${lastMeeting.status}).` : "No meeting completed yet.",
      lastFollowUp ? `Latest follow-up: ${lastFollowUp.title} (${lastFollowUp.status}).` : "No follow-up history yet.",
      openFollowUps ? `${openFollowUps} pending follow-up(s) need action.` : "No pending follow-up currently.",
    ].filter(Boolean).join(" ");
    return { followUps: linkedFollowUps, meetings: linkedMeetings, deals: linkedDeals, summary };
  }, [deals, followUps, salesMeetings, selectedLead]);

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

  function getDealLead(deal) {
    return leads.find((lead) => lead.id === deal?.lead_id) || null;
  }

  function getMeetingStartIso(rawValue = "") {
    if (rawValue) return new Date(rawValue).toISOString();
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000);
    start.setMinutes(start.getMinutes() < 30 ? 30 : 0, 0, 0);
    if (start.getMinutes() === 0) start.setHours(start.getHours() + 1);
    return start.toISOString();
  }

  function scheduleAutoMeetingForDeal(deal) {
    if (!deal?.id) return;
    const alreadyScheduled = salesMeetings.some((item) => item.deal_id === deal.id && !["cancelled", "completed", "no_show"].includes(item.status));
    if (alreadyScheduled) return;
    const lead = getDealLead(deal);
    onCreateSalesMeeting?.({
      title: `Client meeting: ${deal.title || lead?.name || "Sales deal"}`,
      lead_id: deal.lead_id || null,
      client_id: deal.client_id || null,
      deal_id: deal.id,
      meeting_type: "discovery",
      scheduled_at: deal.meeting_scheduled_at ? new Date(deal.meeting_scheduled_at).toISOString() : getMeetingStartIso(),
      duration_minutes: 30,
      meeting_link: deal.meeting_link || defaultMeetLink || "https://meet.google.com/new",
      agenda: "Auto-created when deal entered Meeting stage. Confirm requirements, budget, timeline, and decision maker.",
      status: "scheduled",
    });
  }

  function openMeetingWhatsApp(deal) {
    const lead = getDealLead(deal);
    const contactName = lead?.name || deal.title || "there";
    const message = `Hi ${contactName}, thanks for your interest in ${deal.service || lead?.service || "TexWeb Solution services"}. I have scheduled a quick discovery meeting to understand your requirement, budget, and timeline. Please confirm your available time.`;
    if (onOpenDirectWhatsapp) {
      onOpenDirectWhatsapp(lead?.phone || deal.phone, contactName, message);
      return;
    }
    if (!lead?.phone) return;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
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
    if (commercialType !== "agreement") {
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

  function handleCreateFollowUpSubmit(e) {
    e.preventDefault();
    if (!followUpForm.title || !followUpForm.due_at) return;
    onCreateFollowUp?.({
      ...followUpForm,
      lead_id: followUpForm.lead_id || null,
      client_id: followUpForm.client_id || null,
      deal_id: followUpForm.deal_id || null,
      due_at: new Date(followUpForm.due_at).toISOString(),
      status: "pending",
    });
    setShowFollowUpModal(false);
  }

  function handleCreateSalesMeetingSubmit(e) {
    e.preventDefault();
    if (!salesMeetingForm.title || !salesMeetingForm.scheduled_at) return;
    onCreateSalesMeeting?.({
      ...salesMeetingForm,
      lead_id: salesMeetingForm.lead_id || null,
      client_id: salesMeetingForm.client_id || null,
      deal_id: salesMeetingForm.deal_id || null,
      duration_minutes: Number(salesMeetingForm.duration_minutes) || 30,
      scheduled_at: new Date(salesMeetingForm.scheduled_at).toISOString(),
      status: "scheduled",
    });
    setShowSalesMeetingModal(false);
  }

  function openRescheduleModal(item) {
    setRescheduleTarget(item);
    setSalesMeetingRescheduleTarget(null);
    setRescheduleForm({
      due_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      notes: item.notes || "",
      meeting_link: "",
    });
    setShowRescheduleModal(true);
  }

  function openSalesMeetingRescheduleModal(item) {
    setSalesMeetingRescheduleTarget(item);
    setRescheduleTarget(null);
    setRescheduleForm({
      due_at: item.scheduled_at ? new Date(item.scheduled_at).toISOString().slice(0, 16) : new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      notes: item.agenda || item.outcome || "",
      meeting_link: item.meeting_link || defaultMeetLink || "https://meet.google.com/new",
    });
    setShowRescheduleModal(true);
  }

  function handleRescheduleSubmit(e) {
    e.preventDefault();
    if (salesMeetingRescheduleTarget) {
      onUpdateSalesMeeting?.(salesMeetingRescheduleTarget.id, {
        status: "scheduled",
        scheduled_at: new Date(rescheduleForm.due_at).toISOString(),
        meeting_link: rescheduleForm.meeting_link || salesMeetingRescheduleTarget.meeting_link || "",
        agenda: rescheduleForm.notes || salesMeetingRescheduleTarget.agenda || "",
      });
      setShowRescheduleModal(false);
      setSalesMeetingRescheduleTarget(null);
      return;
    }
    if (!rescheduleTarget || !rescheduleForm.due_at) return;
    onUpdateFollowUp?.(rescheduleTarget.id, {
      status: "pending",
      due_at: new Date(rescheduleForm.due_at).toISOString(),
      notes: [rescheduleForm.notes, `Rescheduled from ${new Date(rescheduleTarget.due_at).toLocaleString("en-IN")}`]
        .filter(Boolean)
        .join("\n"),
    });
    setShowRescheduleModal(false);
    setRescheduleTarget(null);
  }

  function openLostModal(target) {
    const rawStage = (
      target?.stage ||
      (target?.type === "deal"
        ? target?.item?.pipeline_stage || "proposal"
        : target?.item?.status || "Contacted")
    ).toLowerCase();

    const mappedStage =
      rawStage.includes("meet") ? "meeting" :
      rawStage.includes("prop") || rawStage.includes("quot") ? "proposal" :
      rawStage.includes("nego") ? "negotiation" : "contacted";

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
          notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
        });
      } else if (onUpdateLeadStatus) {
        onUpdateLeadStatus(lostTarget.item.id, "Lost");
      }
    }

    setShowLostModal(false);
    setLostTarget(null);
  }

  function openAddDealModal(initialStage = "contacted", lead = null) {
    setNewDealForm({
      title: lead ? `${lead.name} - ${lead.service || "Tech Development"}` : "",
      client_id: "",
      lead_id: lead ? lead.id : "",
      pipeline_stage: initialStage,
      deal_value: "100000",
      service: lead?.service || "Web Development",
      meeting_scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      notes: lead ? `Created from lead: ${lead.name} (${lead.phone || ""})` : "",
    });
    setShowAddDealModal(true);
  }

  async function handleCreateDealSubmit(e) {
    e.preventDefault();
    if (
      !newDealForm.title ||
      !newDealForm.deal_value ||
      !newDealForm.pipeline_stage ||
      !newDealForm.service ||
      !newDealForm.meeting_scheduled_at ||
      !newDealForm.meeting_link ||
      !newDealForm.lead_id ||
      !newDealForm.notes?.trim()
    ) return;
    const created = await onCreateDeal?.({
      ...newDealForm,
      deal_value: Number(newDealForm.deal_value) || 0,
      client_id: newDealForm.client_id || null,
      lead_id: newDealForm.lead_id || null,
      expected_close_date: newDealForm.meeting_scheduled_at ? newDealForm.meeting_scheduled_at.slice(0, 10) : null,
      notes: [
        newDealForm.notes,
        newDealForm.meeting_scheduled_at ? `Meeting scheduled: ${new Date(newDealForm.meeting_scheduled_at).toLocaleString("en-IN")}` : null,
        newDealForm.meeting_link ? `Google Meet: ${newDealForm.meeting_link}` : null,
      ].filter(Boolean).join("\n"),
    });
    if ((created?.pipeline_stage || newDealForm.pipeline_stage) === "contacted") {
      scheduleAutoMeetingForDeal(created || { ...newDealForm, id: null });
    }
    setShowAddDealModal(false);
    setNewDealForm({
      title: "",
      client_id: "",
      lead_id: "",
      pipeline_stage: "contacted",
      deal_value: "100000",
      service: "Web Development",
      meeting_scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      notes: "",
    });
  }

  function handleDealStageChange(deal, nextStage, currentStage) {
    if (!deal || nextStage === (deal.pipeline_stage || currentStage)) return;
    if (nextStage === "closed_lost") {
      openLostModal({ type: "deal", item: deal, stage: currentStage });
      return;
    }
    onUpdateDealStage?.(deal.id, nextStage);
    if (nextStage === "contacted") {
      scheduleAutoMeetingForDeal({ ...deal, pipeline_stage: nextStage });
    }
  }

  function handleDealDrop(stageId) {
    if (!draggedDealId) return;
    const deal = deals.find((item) => item.id === draggedDealId);
    setDraggedDealId(null);
    if (!deal) return;
    handleDealStageChange(deal, stageId, deal.pipeline_stage || "contacted");
  }

  const crmActionButtons = (
    <>
      <button
        onClick={() => onRefresh?.()}
        className="p-2 shrink-0 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-neutral-300 transition cursor-pointer"
        title="Refresh CRM"
      >
        <RefreshCw className="w-4 h-4" />
      </button>

      {viewMode === "leads" && (
        <button
          onClick={() => setShowMetaImportModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white font-semibold text-xs transition shadow-sm cursor-pointer shadow-pink-500/20"
          title="Import Meta Ads Leads (CSV or Webhook)"
        >
          <Sparkles className="w-4 h-4" />
          <span>Import Meta Leads</span>
        </button>
      )}

      {viewMode === "commercials" && (
        <button
          onClick={() => openCommercialModal("proposal")}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Proposal + Agreement</span>
        </button>
      )}

      {viewMode === "followups" && (
        <button
          onClick={() => setShowFollowUpModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          <span>Follow-up</span>
        </button>
      )}

      {viewMode === "sales_meetings" && (
        <>
        <button
          type="button"
          onClick={() => setShowMeetingSettingsModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Meet Settings</span>
        </button>
        <button
          onClick={() => setShowSalesMeetingModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Meeting</span>
        </button>
        </>
      )}

      {viewMode === "pipeline" ? (
        <button
          type="button"
          onClick={() => openAddDealModal("contacted")}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      ) : viewMode === "leads" ? (
        <button
          type="button"
          onClick={() => setShowAddLeadModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      ) : null}
    </>
  );

  return (
    <div className="space-y-6">
      {headerActionsTarget
        ? createPortal(
            <div className="flex items-center justify-end gap-2 shrink-0 flex-nowrap whitespace-nowrap">
              {crmActionButtons}
            </div>,
            headerActionsTarget
          )
        : null}
      {/* 1. Header & Actions */}
      <div className={`${headerActionsTarget ? "hidden" : "flex"} items-center justify-end gap-2 overflow-x-auto no-scrollbar whitespace-nowrap`}>
          {/* View Mode Toggle */}
          {showViewTabs && (
          <div className="flex shrink-0 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
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
            <button
              onClick={() => setViewMode("followups")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "followups"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Follow-ups
            </button>
            <button
              onClick={() => setViewMode("sales_meetings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "sales_meetings"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Meetings
            </button>
          </div>
          )}

          {crmActionButtons}
      </div>

      {viewMode === "reports" && (
      <>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Sales Report</div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Follow-up performance and conversion for selected date filter.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black">{salesReport.conversionRate}% conversion</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["Completed", salesReport.completedFollowUps, "text-emerald-600"],
              ["Missed", salesReport.missedFollowUps, "text-red-600"],
              ["Overdue", salesReport.overdueFollowUps, "text-amber-600"],
              ["Conversion", `${salesReport.conversionRate}%`, "text-blue-600"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] p-3">
                <div className={`text-lg font-black ${tone}`}>{value}</div>
                <div className="text-[11px] text-gray-500 dark:text-neutral-400 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Lead Source ROI</div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Meta, Google, referral, and direct source quality.</p>
            </div>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </div>
          <div className="space-y-2">
            {salesReport.sourceRows.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-neutral-400">No source data available.</div>
            ) : salesReport.sourceRows.map((row) => (
              <div key={row.source} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center text-xs rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] px-3 py-2">
                <div className="font-bold text-gray-900 dark:text-white truncate">{row.source}</div>
                <div className="text-gray-500">{row.leads} leads</div>
                <div className="text-emerald-600 font-bold">{row.won} won</div>
                <div className="font-mono text-orange-600 font-bold">Rs. {row.value.toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Sales AI Assist
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Priority, risk, and next action from lead data, meetings, and follow-ups.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600">{aiInsights.overdueFollowUps} overdue</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">{aiInsights.staleDeals} stale deals</span>
            {(stats.lostCount > 0 || stats.lostDealsCount > 0) && (
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">{stats.lostCount + stats.lostDealsCount} drop-offs logged</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiInsights.rankedLeads.length === 0 ? (
            <div className="md:col-span-3 text-xs text-gray-500 dark:text-neutral-400">No active lead needs AI action right now.</div>
          ) : (
            aiInsights.rankedLeads.map(({ lead, score, action }) => (
              <div key={lead.id} className="rounded-xl border border-gray-100 dark:border-[#3a3020] bg-gray-50 dark:bg-[#211d14] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{lead.name}</span>
                  <span className={`text-[11px] font-black ${score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600"}`}>{score}/100</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">{action}</p>
                <div className="flex gap-2 mt-3">
                  {lead.status === "New" && (
                    <button onClick={() => onUpdateLeadStatus?.(lead.id, "Contacted")} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white">Contacted</button>
                  )}
                  <button onClick={() => openLostModal({ type: "lead", item: lead })} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-600">Lost</button>
                </div>
              </div>
            ))
          )}
        </div>
        {aiInsights.warmStaleDeals.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Stale Deal Alerts</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {aiInsights.warmStaleDeals.slice(0, 4).map((deal) => {
                const ageDays = Math.floor((Date.now() - new Date(deal.updated_at || deal.created_at || Date.now()).getTime()) / 86400000);
                return (
                  <div key={deal.id} className="flex items-center justify-between gap-3 rounded-lg bg-white dark:bg-[#211d14] px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{deal.title}</div>
                      <div className="text-gray-500">{deal.pipeline_stage || "pipeline"} · {ageDays} days idle</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-black ${ageDays >= 7 ? "bg-red-50 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {ageDays >= 7 ? "7d+" : "3d+"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* 3. Filter & Search Controls */}
      {viewMode !== "pipeline" && viewMode !== "reports" && (
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

        {viewMode === "leads" && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            ["active", "Active"],
            ["New", "New"],
            ["Contacted", "Contacted"],
            ["Proposal Sent", "Proposal Sent"],
            ["archived", "Archive"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === value
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        )}
        {viewMode === "pipeline" && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            ["active", "Active Pipeline"],
            ["archived", "Archive"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === value
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        )}
      </div>
      )}

      {viewMode !== "pipeline" && (
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-neutral-400">
          <Calendar className="w-4 h-4" />
          <span>Date Filter</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            ["all", "All"],
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["date", "Date"],
            ["day", "24h"],
            ["week", "Week"],
            ["month", "Month"],
            ["year", "Year"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDateFilter(value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                dateFilter === value
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400"
              }`}
            >
              {label}
            </button>
          ))}
          {dateFilter === "date" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              aria-label="Select exact date"
            />
          )}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDateRange.from}
                onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              />
              <input
                type="date"
                value={customDateRange.to}
                onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              />
            </div>
          )}
        </div>
      </div>
      )}

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
                    <th className="py-3 px-4">AI Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {filteredLeads.map((lead) => {
                    const budget = getLeadBudget(lead);
                    const location = getLeadLocation(lead);
                    const leadScore = getLeadScore(lead);
                    const nextAction = getLeadNextAction(lead, followUps, salesMeetings);

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

                        <td className="py-3.5 px-4">
                          <div className={`font-black text-xs ${leadScore >= 75 ? "text-emerald-600" : leadScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {leadScore}/100
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-neutral-400 line-clamp-1 max-w-[170px]">{nextAction}</div>
                        </td>

                        {/* 6. Lead Status */}
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status || "New"}
                            onChange={(e) => {
                              const nextStatus = e.target.value;
                              if (nextStatus === "Lost") {
                                openLostModal({ type: "lead", item: lead, stage: lead.status || "Contacted" });
                              } else {
                                onUpdateLeadStatus?.(lead.id, nextStatus);
                              }
                            }}
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
                            onClick={() => openAddDealModal("contacted", lead)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition flex items-center gap-1"
                            title="Move qualified lead to pipeline"
                          >
                            <span>Pipeline</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {lead.status !== "Lost" && lead.status !== "Converted" && (
                            <button
                              onClick={() => openLostModal({ type: "lead", item: lead })}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition"
                              title="Mark lead lost with reason"
                            >
                              Lost
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openAddDealModal("contacted", lead)}
                            className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition cursor-pointer"
                            title="Add as Deal to Pipeline"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openLostModal({ type: "lead", item: lead, stage: lead.status || "Contacted" })}
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition"
                            title="Mark as Lost / Log Reason"
                          >
                            <XCircle className="w-3.5 h-3.5" />
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
        statusFilter === "archived" ? (
          <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
            {archivedDeals.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">No archived lost deals found.</div>
            ) : (
              <div className="overflow-x-auto table-scroll">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Deal</th>
                      <th className="py-3 px-4">Value</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Loss Reason</th>
                      <th className="py-3 px-4">Archived</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                    {archivedDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{deal.title}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-orange-600">Rs. {(Number(deal.deal_value) || 0).toLocaleString("en-IN")}</td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-neutral-300">{deal.service || "Tech Development"}</td>
                        <td className="py-3.5 px-4 text-red-600 dark:text-red-400 max-w-[320px]">
                          <span className="line-clamp-2">{deal.loss_reason || deal.notes || "Closed lost"}</span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">{deal.updated_at?.slice(0, 10) || deal.created_at?.slice(0, 10) || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((col) => {
            const colDeals = deals.filter((d) => (d.pipeline_stage || "contacted") === col.id && matchesDateFilter(d, "created_at"));
            const colTotal = colDeals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);

            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDealDrop(col.id)}
                className={`flex flex-col rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3 shadow-2xs min-h-[350px] transition ${
                  draggedDealId ? "ring-1 ring-orange-400/40" : ""
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#3a3020]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="font-semibold text-xs text-gray-800 dark:text-neutral-200">
                      {col.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                      {colDeals.length}
                    </span>
                    {col.id !== "closed_lost" && (
                      <button
                        type="button"
                        onClick={() => openAddDealModal(col.id)}
                        className="p-0.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title={`Add Deal in ${col.label}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 mt-1 mb-2 font-mono">
                  ₹{colTotal.toLocaleString("en-IN")}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                  {colDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDraggedDealId(deal.id)}
                      onDragEnd={() => setDraggedDealId(null)}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-200/80 dark:border-[#3a3020] hover:border-orange-500 transition shadow-2xs space-y-1.5 cursor-grab active:cursor-grabbing"
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
                      {deal.notes && (
                        <div className="text-[10px] text-gray-500 dark:text-neutral-400 bg-white/60 dark:bg-slate-900/40 p-1.5 rounded-lg line-clamp-3">
                          {deal.notes}
                        </div>
                      )}
                      {col.id === "contacted" && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 p-1.5 rounded-lg">
                          Meeting: {deal.meeting_scheduled_at ? new Date(deal.meeting_scheduled_at).toLocaleString("en-IN") : deal.expected_close_date || "Scheduled automatically"}
                        </div>
                      )}
                      {deal.loss_reason && col.id === "closed_lost" && (
                        <div className="text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-1.5 rounded-lg border border-red-200/50 mt-1 line-clamp-2">
                          {deal.loss_reason}
                        </div>
                      )}

                      {col.id !== "closed_won" && col.id !== "closed_lost" && (
                        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-gray-200/60 dark:border-[#3a3020]/60 mt-1.5">
                          <select
                            value={deal.pipeline_stage || "contacted"}
                            onChange={(e) => {
                              const nextStage = e.target.value;
                              handleDealStageChange(deal, nextStage, col.id);
                            }}
                            className="text-[10px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-gray-700 dark:text-neutral-300 focus:outline-hidden"
                          >
                            <option value="contacted">Meeting</option>
                            <option value="qualified">Qualified</option>
                            <option value="proposal">Proposal</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="closed_won">Won</option>
                            <option value="closed_lost">Lost</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => openLostModal({ type: "deal", item: deal, stage: col.id })}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                            title="Mark Deal as Closed Lost"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Lost</span>
                          </button>
                        </div>
                      )}

                      {col.id === "contacted" && (
                        <button
                          type="button"
                          onClick={() => openMeetingWhatsApp(deal)}
                          className="w-full mt-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white flex items-center justify-center gap-1 shadow-2xs"
                          title="Send meeting confirmation on WhatsApp"
                        >
                          <WhatsAppIcon className="w-3 h-3" />
                          <span>Send Meeting WhatsApp</span>
                        </button>
                      )}

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
        )
      )}

      {viewMode === "commercials" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ["proposal", "New Proposal + Quotation", "Scope, deliverables, price, tax"],
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
                No proposal quotation or agreement found.
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
                                    else if (doc.quotation_number) onUpdateQuotation?.(doc.id, { status: "accepted" });
                                    else onUpdateProposal?.(doc.id, { status: "accepted", accepted_at: new Date().toISOString() });
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                >
                                  {doc.docType === "agreement" ? "Signed" : "Accept"}
                                </button>
                                <button
                                  onClick={() => {
                                    if (doc.docType === "agreement") onUpdateAgreement?.(doc.id, { status: "cancelled" });
                                    else if (doc.quotation_number) onUpdateQuotation?.(doc.id, { status: "declined" });
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

      {viewMode === "followups" && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          {filteredFollowUps.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">No sales follow-up found.</div>
          ) : (
            <div className="overflow-x-auto table-scroll">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Follow-up</th>
                    <th className="py-3 px-4">Linked Account</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {filteredFollowUps.map((item) => {
                    const lead = leads.find((leadItem) => leadItem.id === item.lead_id);
                    const client = clients.find((clientItem) => clientItem.id === item.client_id);
                    const contactPhone = client?.phone || lead?.phone || "";
                    const isOverdue = item.status === "pending" && new Date(item.due_at).getTime() < Date.now();
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition ${isOverdue ? "bg-red-50/40 dark:bg-red-950/10" : ""}`}>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase">Overdue</span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 line-clamp-1">{item.notes || "Sales follow-up"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{client?.name || lead?.name || "Unlinked"}</div>
                          <div className="text-[11px] text-gray-500">{client ? "Client" : lead ? "Lead" : "General"}</div>
                        </td>
                        <td className="py-3.5 px-4 capitalize font-semibold text-gray-700 dark:text-neutral-200">{item.channel}</td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs">{new Date(item.due_at).toLocaleString("en-IN")}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.status === "done" ? "bg-emerald-50 text-emerald-600" : item.status === "missed" || isOverdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                          }`}>{item.status}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {contactPhone && (
                              <button
                                onClick={() => {
                                  const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
                                  const text = encodeURIComponent(getFollowUpWhatsappMessage(item, lead, client));
                                  window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                                WhatsApp
                              </button>
                            )}
                            <a
                              href={createGoogleCalendarUrl({
                                title: item.title,
                                start: item.due_at,
                                durationMinutes: 15,
                                details: item.notes || "Sales follow-up",
                              })}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Calendar
                            </a>
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => onUpdateFollowUp?.(item.id, { status: "done", completed_at: new Date().toISOString() })}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                >
                                  Done
                                </button>
                                <button
                                  onClick={() => onUpdateFollowUp?.(item.id, { status: "missed", notes: [item.notes, `Missed at ${new Date().toLocaleString("en-IN")}`].filter(Boolean).join("\n") })}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition"
                                >
                                  Missed
                                </button>
                              </>
                            )}
                            {["pending", "missed"].includes(item.status) && (
                              <button
                                onClick={() => openRescheduleModal(item)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Reschedule
                              </button>
                            )}
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

      {viewMode === "sales_meetings" && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          {filteredSalesMeetings.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">No sales meeting scheduled.</div>
          ) : (
            <div className="overflow-x-auto table-scroll">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[820px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Meeting</th>
                    <th className="py-3 px-4">Linked Account</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {filteredSalesMeetings.map((item) => {
                    const lead = leads.find((leadItem) => leadItem.id === item.lead_id);
                    const client = clients.find((clientItem) => clientItem.id === item.client_id);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                          <div className="text-[11px] text-gray-500 line-clamp-1">{item.agenda || item.next_action || "Sales meeting"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{client?.name || lead?.name || "Unlinked"}</div>
                          <div className="text-[11px] text-gray-500">{client ? "Client" : lead ? "Lead" : "General"}</div>
                        </td>
                        <td className="py-3.5 px-4 capitalize font-semibold text-gray-700 dark:text-neutral-200">{item.meeting_type}</td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs">{new Date(item.scheduled_at).toLocaleString("en-IN")} · {item.duration_minutes || 30}m</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.status === "completed" ? "bg-emerald-50 text-emerald-600" : item.status === "cancelled" || item.status === "no_show" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                          }`}>{item.status}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {lead?.phone && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleWhatsAppClick(lead)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                >
                                  WhatsApp
                                </button>
                                <a href={`tel:${lead.phone}`} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 transition">
                                  Call
                                </a>
                              </>
                            )}
                            {item.meeting_link && (
                              <a href={item.meeting_link} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                                Join
                              </a>
                            )}
                            <a
                              href={createGoogleCalendarUrl({
                                title: item.title,
                                start: item.scheduled_at,
                                durationMinutes: item.duration_minutes || 30,
                                details: item.agenda || item.next_action || "Sales meeting",
                                location: item.meeting_link || item.location || "",
                              })}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                            >
                              Calendar
                            </a>
                            {item.status === "scheduled" && (
                              <>
                                <button
                                  onClick={() => openSalesMeetingRescheduleModal(item)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => onUpdateSalesMeeting?.(item.id, { status: "completed", outcome: item.outcome || "Meeting completed. Follow-up required." })}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => onUpdateSalesMeeting?.(item.id, { status: "no_show", outcome: "Client did not join. Reschedule follow-up required." })}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition"
                                >
                                  No Show
                                </button>
                              </>
                            )}
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

            <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 text-xs">
              <div className="flex items-center gap-2 font-black text-orange-700 dark:text-orange-300 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Client Summary</span>
              </div>
              <p className="text-gray-700 dark:text-neutral-300 leading-relaxed">{selectedLeadActivity.summary}</p>
            </div>

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
                  ...selectedLeadActivity.meetings.map((item) => ({
                    type: "meeting",
                    title: `Meeting: ${item.title}`,
                    description: `${item.status || "scheduled"} · ${item.outcome || item.agenda || "Sales meeting"}`,
                    time: new Date(item.scheduled_at || item.created_at || Date.now()).toLocaleString("en-IN"),
                  })),
                  ...selectedLeadActivity.followUps.map((item) => ({
                    type: "followup",
                    title: `Follow-up: ${item.title}`,
                    description: `${item.status || "pending"} · ${item.notes || item.channel || "Sales follow-up"}`,
                    time: new Date(item.completed_at || item.due_at || item.created_at || Date.now()).toLocaleString("en-IN"),
                  })),
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

      {/* 7b. Add Deal to Pipeline Modal */}
      {showAddDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateDealSubmit}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">New Sales Pipeline Deal</h3>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">Add an active commercial opportunity with value forecast</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDealModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-neutral-300">
                  Deal Title *
                </label>
                <input
                  type="text"
                  required
                  value={newDealForm.title}
                  onChange={(e) => setNewDealForm({ ...newDealForm, title: e.target.value })}
                  placeholder="e.g. Acme Corp - E-Commerce Website & Portal"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-neutral-300">
                    Average Deal Value (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newDealForm.deal_value}
                      onChange={(e) => setNewDealForm({ ...newDealForm, deal_value: e.target.value })}
                      placeholder="100000"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono font-bold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-neutral-300">
                    Pipeline Stage *
                  </label>
                  <select
                    value={newDealForm.pipeline_stage}
                    onChange={(e) => setNewDealForm({ ...newDealForm, pipeline_stage: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-medium focus:outline-hidden"
                  >
                    <option value="contacted">Meeting</option>
                    <option value="qualified">Requirement & Qualified</option>
                    <option value="proposal">Proposal / Quotation</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Service
                  </label>
                  <select
                    value={newDealForm.service}
                    onChange={(e) => setNewDealForm({ ...newDealForm, service: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="App Development">App Development</option>
                    <option value="SEO">SEO</option>
                    <option value="GMB">GMB</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="SMM">SMM</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Meeting Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newDealForm.meeting_scheduled_at}
                    onChange={(e) => setNewDealForm({ ...newDealForm, meeting_scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Google Meet Link
                </label>
                <input
                  type="url"
                  required
                  readOnly
                  value={newDealForm.meeting_link}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-neutral-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Linked Lead</label>
                  {newDealForm.lead_id ? (
                    <div className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-200 font-semibold">
                      {leads.find((l) => l.id === newDealForm.lead_id)?.name || "Selected lead"} · read only
                    </div>
                  ) : (
                    <select
                      value={newDealForm.lead_id}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const matchedLead = leads.find((l) => l.id === selId);
                        setNewDealForm({
                          ...newDealForm,
                          lead_id: selId,
                          title: newDealForm.title || (matchedLead ? `${matchedLead.name} - ${matchedLead.service || "Project"}` : ""),
                          service: matchedLead?.service || newDealForm.service,
                        });
                      }}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden truncate"
                    >
                      <option value="">-- No Linked Lead --</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.service || "Inquiry"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Link to Client Account (After Won)
                  </label>
                  <select
                    value={newDealForm.client_id}
                    onChange={(e) => setNewDealForm({ ...newDealForm, client_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden truncate"
                  >
                    <option value="">-- No Linked Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company_name ? `(${c.company_name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Deal Notes / Strategy
                </label>
                <textarea
                  rows={2}
                  required
                  value={newDealForm.notes}
                  onChange={(e) => setNewDealForm({ ...newDealForm, notes: e.target.value })}
                  placeholder="Key deliverables, client expectations, stakeholders involved..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowAddDealModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Pipeline Deal</span>
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
                <p className="text-[11px] text-gray-400">Proposal + quotation is one Sales document; agreement is final signing before deal won.</p>
              </div>
              <button type="button" onClick={() => setShowCommercialModal(false)} className="p-1 rounded-lg text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs">
              {[
                ["proposal", "Proposal + Quotation"],
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

      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleCreateFollowUpSubmit} className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create Sales Follow-up</h3>
              <button type="button" onClick={() => setShowFollowUpModal(false)} className="p-1 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Title *</label>
                <input required value={followUpForm.title} onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
              </div>
              <div>
                <label className="block font-medium mb-1">Lead</label>
                <select value={followUpForm.lead_id} onChange={(e) => setFollowUpForm({ ...followUpForm, lead_id: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <option value="">No lead</option>
                  {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Client</label>
                <select value={followUpForm.client_id} onChange={(e) => setFollowUpForm({ ...followUpForm, client_id: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <option value="">No client</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Channel</label>
                <select value={followUpForm.channel} onChange={(e) => setFollowUpForm({ ...followUpForm, channel: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Due Date & Time *</label>
                <input type="datetime-local" required value={followUpForm.due_at} onChange={(e) => setFollowUpForm({ ...followUpForm, due_at: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Notes</label>
                <textarea rows={3} value={followUpForm.notes} onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button type="button" onClick={() => setShowFollowUpModal(false)} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">Save Follow-up</button>
            </div>
          </form>
        </div>
      )}

      {showRescheduleModal && (rescheduleTarget || salesMeetingRescheduleTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleRescheduleSubmit} className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {salesMeetingRescheduleTarget ? "Reschedule Meeting" : "Reschedule Follow-up"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{(salesMeetingRescheduleTarget || rescheduleTarget)?.title}</p>
              </div>
              <button type="button" onClick={() => setShowRescheduleModal(false)} className="p-1 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">{salesMeetingRescheduleTarget ? "New Meeting Date & Time *" : "New Due Date & Time *"}</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleForm.due_at}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, due_at: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
              {salesMeetingRescheduleTarget && (
                <div>
                  <label className="block font-medium mb-1">Google Meet Link</label>
                  <input
                    type="url"
                    value={rescheduleForm.meeting_link}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, meeting_link: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>
              )}
              <div>
                <label className="block font-medium mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={rescheduleForm.notes}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button type="button" onClick={() => setShowRescheduleModal(false)} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">Reschedule</button>
            </div>
          </form>
        </div>
      )}

      {showMeetingSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Meeting Settings</h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Default Google Meet link used in pipeline meetings.</p>
              </div>
              <button type="button" onClick={() => setShowMeetingSettingsModal(false)} className="p-1 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-xs">
              <label className="block font-medium text-gray-700 dark:text-neutral-300">Default Google Meet Link</label>
              <input
                type="url"
                required
                value={defaultMeetLink}
                onChange={(e) => setDefaultMeetLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button type="button" onClick={() => setDefaultMeetLink("https://meet.google.com/new")} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300">Reset</button>
              <button type="button" onClick={() => setShowMeetingSettingsModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">Save</button>
            </div>
          </div>
        </div>
      )}

      {showSalesMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleCreateSalesMeetingSubmit} className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Schedule Sales Meeting</h3>
              <button type="button" onClick={() => setShowSalesMeetingModal(false)} className="p-1 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Title *</label>
                <input required value={salesMeetingForm.title} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
              </div>
              <div>
                <label className="block font-medium mb-1">Lead</label>
                <select value={salesMeetingForm.lead_id} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, lead_id: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <option value="">No lead</option>
                  {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Client</label>
                <select value={salesMeetingForm.client_id} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, client_id: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <option value="">No client</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Meeting Type</label>
                <select value={salesMeetingForm.meeting_type} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, meeting_type: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <option value="discovery">Discovery</option>
                  <option value="requirement">Requirement</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="handover">Handover</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Schedule *</label>
                <input type="datetime-local" required value={salesMeetingForm.scheduled_at} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, scheduled_at: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
              </div>
              <div>
                <label className="block font-medium mb-1">Meeting Link</label>
                <input value={salesMeetingForm.meeting_link} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, meeting_link: e.target.value })} placeholder="https://meet.google.com/..." className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
              </div>
              <div>
                <label className="block font-medium mb-1">Duration</label>
                <input type="number" value={salesMeetingForm.duration_minutes} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, duration_minutes: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Agenda</label>
                <textarea rows={3} value={salesMeetingForm.agenda} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, agenda: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button type="button" onClick={() => setShowSalesMeetingModal(false)} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">Schedule Meeting</button>
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

      {showLostModal && lostTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleMarkLostSubmit}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <XCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Mark as Closed Lost & Root Cause
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    Target: <span className="font-semibold text-gray-800 dark:text-slate-200">{lostTarget.item.name || lostTarget.item.title}</span> ({lostTarget.type === "deal" ? "Pipeline Deal" : "Inbound Lead"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLostModal(false);
                  setLostTarget(null);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 1. Stage where deal was lost */}
              <div>
                <label className="block font-bold mb-1.5 text-gray-700 dark:text-neutral-300">
                  Where was this deal lost? (Drop-Off Stage) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: "contacted", label: "📞 Contact", desc: "First Call / Outreach" },
                    { id: "meeting", label: "🤝 Meeting", desc: "Post Discovery / Demo" },
                    { id: "proposal", label: "📄 Proposal", desc: "Quotation Sent" },
                    { id: "negotiation", label: "⚖️ Negotiation", desc: "Final Terms" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        const newStage = st.id;
                        const newReasons = STAGE_LOSS_REASONS[newStage] || STAGE_LOSS_REASONS.contacted;
                        setLostForm({
                          ...lostForm,
                          stage: newStage,
                          reason: newReasons[0],
                        });
                      }}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        lostForm.stage === st.id
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold shadow-2xs"
                          : "border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-xs font-bold">{st.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Primary Loss Reason */}
              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-neutral-300">
                  Primary Loss Reason *
                </label>
                <select
                  value={lostForm.reason}
                  onChange={(e) => setLostForm({ ...lostForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  {(STAGE_LOSS_REASONS[lostForm.stage] || STAGE_LOSS_REASONS.contacted).map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Competitor & Re-Nurture Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Competitor Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={lostForm.competitor_name}
                    onChange={(e) => setLostForm({ ...lostForm, competitor_name: e.target.value })}
                    placeholder="e.g. Local Agency / Wix / Freelancer"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    AI Re-Nurture Cadence
                  </label>
                  <select
                    value={lostForm.re_nurture_days}
                    onChange={(e) => setLostForm({ ...lostForm, re_nurture_days: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  >
                    <option value="30">Re-engage after 30 days</option>
                    <option value="60">Re-engage after 60 days (Quarterly)</option>
                    <option value="90">Re-engage after 90 days (New Budget)</option>
                    <option value="none">Do Not Nurture (Spam / Unqualified)</option>
                  </select>
                </div>
              </div>

              {/* 4. Notes & Feedback */}
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Loss Notes & Context
                </label>
                <textarea
                  rows={2}
                  value={lostForm.notes}
                  onChange={(e) => setLostForm({ ...lostForm, notes: e.target.value })}
                  placeholder="Why did they decline? What budget did they expect? Any key objections raised?"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              {/* 5. 2026 AI Trend: AI Objection Counter & WhatsApp Recovery Draft */}
              {AI_OBJECTION_HANDLERS[lostForm.reason] && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>AI Sales Advice: Try Handling this Objection</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                    {AI_OBJECTION_HANDLERS[lostForm.reason].counter}
                  </p>

                  {/* 1-Click WhatsApp Recovery Draft */}
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between gap-2">
                    <span className="text-[10.5px] text-gray-500 dark:text-neutral-400">
                      Smart Breakup / Recovery Pitch
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const rawText = AI_OBJECTION_HANDLERS[lostForm.reason].whatsapp_draft;
                        const clientName = (lostTarget.item.name || lostTarget.item.title || "there").split(" ")[0];
                        const text = rawText.replace("{NAME}", clientName);
                        navigator.clipboard?.writeText(text);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 transition shadow-2xs cursor-pointer"
                    >
                      {copiedScript ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>Copied Pitch!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy WhatsApp Pitch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => {
                  setShowLostModal(false);
                  setLostTarget(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm & Mark as Lost</span>
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

