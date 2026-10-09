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
  Clock,
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
  Target,
  Percent,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Video,
  ArrowDownAZ,
} from "lucide-react";
import ActivityTimeline from "../shared/ActivityTimeline";
import MetaLeadsImportModal from "./MetaLeadsImportModal";
import { playNotificationSound } from "@/lib/notificationSound";
import { createInvoice } from "@/services/supabaseService";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#3a3020]/60" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`h-3 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse ${colIndex === 0 ? "w-4/5" : colIndex === columns - 1 ? "w-2/3 justify-self-end" : "w-full"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PipelineSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage.id} className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3 shadow-2xs min-h-[350px]">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#3a3020]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${stage.color}`} />
              <div className="h-3 w-20 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-5 w-8 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-xl border border-gray-200/80 dark:border-[#3a3020] bg-gray-50 dark:bg-[#211d14] p-3 space-y-2">
                <div className="h-3 w-4/5 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-12 rounded-lg bg-gray-200/70 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const PIPELINE_STAGES = [
  { id: "contacted", label: "Contacted", color: "bg-cyan-500" },
  { id: "qualified", label: "Meeting", color: "bg-indigo-500" },
  { id: "proposal", label: "Quotation", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-amber-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
];

const CLOSED_PIPELINE_STAGES = ["closed_won", "closed_lost"];

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
    whatsapp_draft: "Hi {NAME}, haven't heard back so assuming your tech project is on hold for now. Closing this inquiry file to keep your inbox clean - feel free to ping anytime you're ready to restart!",
  },
  "Client Postponed Project (3-6 Months)": {
    counter: "Schedule automated re-touch notification for 45-60 days before their new planned launch quarter.",
    whatsapp_draft: "Hi {NAME}, understood! Timing is everything. I'll make a note to reconnect in a couple of months so we can plan the roadmap well in advance of your launch target.",
  },
  "Meeting No-Show / Client Didn't Join": {
    counter: "Send a gentle rescheduled calendar link with zero pressure.",
    whatsapp_draft: "Hi {NAME}, missed you on our call today! Tech emergencies happen - here's our quick booking link whenever you have 15 mins to reschedule: https://texweb.in/meet",
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

function getLeadNextAction(lead, followUps = [], meetings = []) {
  if (lead?.status === "Lost") return "Archive with loss reason and create nurture reminder after 30 days.";
  if (lead?.status === "Converted") return "Handover to client portal and project delivery.";
  const hasPendingFollowUp = followUps.some((item) => item.lead_id === lead?.id && item.status === "pending");
  const hasScheduledMeeting = meetings.some((item) => item.lead_id === lead?.id && item.status === "scheduled");
  if (!lead?.phone && !lead?.email) return "Capture phone or email before qualification.";
  if (lead?.status === "New") return hasPendingFollowUp ? "Complete first contact follow-up." : "Contact within 5 minutes and qualify budget.";
  if (lead?.status === "Contacted") return hasScheduledMeeting ? "Prepare discovery agenda and confirm attendee." : "Schedule discovery meeting.";
  if (lead?.status === "Proposal Sent") return hasPendingFollowUp ? "Follow up for quotation approval." : "Create approval follow-up for quotation.";
  return "Review conversation and move to next pipeline stage.";
}

function getLeadBudget(lead) {
  if (!lead) return "-";
  if (lead.budget_range) return lead.budget_range;
  if (!lead.notes) return "-";
  const match = lead.notes.match(/Budget:\s*([^|]+)/i);
  return match ? match[1].trim() : "-";
}

function getLeadLocation(lead) {
  if (!lead) return "-";
  if (lead.city || lead.state) {
    return [lead.city, lead.state].filter(Boolean).join(", ");
  }
  if (!lead.notes) return "-";
  const match = lead.notes.match(/Location:\s*([^|]+)/i);
  return match ? match[1].trim() : "-";
}

function formatLeadAnswer(value) {
  const text = String(value || "").trim();
  if (!text || text === "-" || text === "—" || /[\u0080-\u009f\u00c2\u00c3\u00e2\u201a]/u.test(text)) return "-";
  return text;
}

function parseLeadNoteFields(lead) {
  const fields = [];
  String(lead?.notes || "")
    .split(/[|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const separatorIndex = part.indexOf(":");
      if (separatorIndex === -1) return;
      const label = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      if (!label) return;
      fields.push({
        key: label.toLowerCase(),
        label,
        value,
      });
    });
  return fields;
}

function getLeadNoteValue(fields, labels) {
  const wanted = labels.map((label) => label.toLowerCase());
  return fields.find((field) => wanted.includes(field.key))?.value || "";
}

function getLeadFormAnswers(lead) {
  const noteFields = parseLeadNoteFields(lead);
  const baseFields = [
    { label: "Service Looking For", value: lead?.service || getLeadNoteValue(noteFields, ["Service"]) },
    { label: "Budget Range", value: getLeadNoteValue(noteFields, ["Budget"]) || getLeadBudget(lead) },
    { label: "City / State", value: getLeadNoteValue(noteFields, ["Location"]) || getLeadLocation(lead) },
  ];
  const reserved = new Set([
    "service",
    "budget",
    "location",
    "form",
    "form name",
    "campaign",
    "campaign name",
    "ad",
    "ad name",
    "meta lead id",
    "lead id",
    "leadgen id",
    "meta created",
    "created time",
    "meta status",
    "lead status",
    "source",
    "platform",
    "is organic",
    "is_organic",
    "page id",
    "form id",
    "ad id",
    "adset id",
    "campaign id",
  ]);
  const extraFields = noteFields
    .filter((field) => !reserved.has(field.key))
    .map((field) => ({ label: field.label, value: field.value }));
  return [...baseFields, ...extraFields].map((field) => ({
    ...field,
    value: formatLeadAnswer(field.value),
  })).filter((field) => field.value !== "-");
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
  dealPagination = null,
  clients = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  followUps = [],
  followUpPagination = null,
  salesMeetings = [],
  meetingPagination = null,
  initialViewMode = "leads",
  leadPagination = null,
  leadSummary = null,
  onRefreshLeadSummary = null,
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
  onCreateInvoice,
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
  onNavigateSection,
  onRefresh,
  onFetchLeadsPage,
  onFetchDealsPage,
  onFetchFollowUpsPage,
  onFetchMeetingsPage,
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
    setQuery("");
    setStatusFilter("active");
    setDateFilter("all");
    setLeadAlphabetFilter("all");
    setLeadSortOrder("default");
    setLeadPage(1);
  }, [viewMode]);

  useEffect(() => {
    if (!headerActionsSlotId) {
      setHeaderActionsTarget(null);
      return;
    }
    setHeaderActionsTarget(document.getElementById(headerActionsSlotId));
  }, [headerActionsSlotId, viewMode]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [leadPage, setLeadPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [leadAlphabetFilter, setLeadAlphabetFilter] = useState("all");
  const [leadSortOrder, setLeadSortOrder] = useState("default");
  const [pipelinePage, setPipelinePage] = useState(1);
  const [pipelinePageSize, setPipelinePageSize] = useState(20);
  const [followUpPage, setFollowUpPage] = useState(1);
  const [followUpPageSize, setFollowUpPageSize] = useState(10);
  const [meetingPage, setMeetingPage] = useState(1);
  const [meetingPageSize, setMeetingPageSize] = useState(50);
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
  const [followUpForm, setFollowUpForm] = useState({
    title: "Follow up for quotation approval",
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

  function getLeadServerDateRange() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const toIso = (date) => date.toISOString();
    if (dateFilter === "today") return { dateFrom: toIso(todayStart), dateTo: toIso(tomorrowStart) };
    if (dateFilter === "yesterday") {
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      return { dateFrom: toIso(yesterdayStart), dateTo: toIso(todayStart) };
    }
    if (dateFilter === "date" && selectedDate) {
      const selectedStart = new Date(`${selectedDate}T00:00:00`);
      const selectedEnd = new Date(selectedStart);
      selectedEnd.setDate(selectedEnd.getDate() + 1);
      return { dateFrom: toIso(selectedStart), dateTo: toIso(selectedEnd) };
    }
    if (dateFilter === "day") return { dateFrom: toIso(new Date(Date.now() - 86400000)), dateTo: "" };
    if (dateFilter === "week") return { dateFrom: toIso(new Date(Date.now() - 7 * 86400000)), dateTo: "" };
    if (dateFilter === "month") return { dateFrom: toIso(new Date(Date.now() - 30 * 86400000)), dateTo: "" };
    if (dateFilter === "year") return { dateFrom: toIso(new Date(Date.now() - 365 * 86400000)), dateTo: "" };
    if (dateFilter === "custom") {
      return {
        dateFrom: customDateRange.from ? new Date(`${customDateRange.from}T00:00:00`).toISOString() : "",
        dateTo: customDateRange.to ? new Date(`${customDateRange.to}T23:59:59`).toISOString() : "",
      };
    }
    return { dateFrom: "", dateTo: "" };
  }

  function getServerDateRange(fieldMode = "created") {
    return getLeadServerDateRange(fieldMode);
  }

  useEffect(() => {
    if (!onFetchLeadsPage || viewMode !== "leads") return;
    const timer = setTimeout(() => {
      const range = getLeadServerDateRange();
      onFetchLeadsPage({
        page: 1,
        pageSize: 200,
        search: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.from, customDateRange.to, dateFilter, onFetchLeadsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (!onFetchDealsPage || viewMode !== "pipeline") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchDealsPage({
        page: 1,
        pageSize: 200,
        search: "",
        stage: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.from, customDateRange.to, dateFilter, onFetchDealsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (!onFetchFollowUpsPage || viewMode !== "followups") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchFollowUpsPage({
        page: 1,
        pageSize: 100,
        search: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.from, customDateRange.to, dateFilter, onFetchFollowUpsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (!onFetchMeetingsPage || viewMode !== "sales_meetings") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchMeetingsPage({
        page: meetingPage,
        pageSize: meetingPageSize,
        search: query,
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.from, customDateRange.to, dateFilter, meetingPage, meetingPageSize, onFetchMeetingsPage, query, selectedDate, viewMode]);

  const leadLetterCounts = useMemo(() => {
    const counts = {};
    leads.forEach((lead) => {
      const linkedDeal = deals.find((deal) => deal.lead_id === lead.id);
      const isInPipeline = Boolean(linkedDeal && !CLOSED_PIPELINE_STAGES.includes(linkedDeal.pipeline_stage || linkedDeal.stage));
      const hasWonDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_won");
      const hasLostDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_lost");

      const isConverted = hasWonDeal || (!linkedDeal && (lead.status === "Converted" || lead.status === "Closed Won"));
      const isLost = !isConverted && (hasLostDeal || (!linkedDeal && lead.status === "Lost"));
      const isPipelineLead = !isConverted && !isLost && (isInPipeline || (!linkedDeal && ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(lead.status)));
      const isActiveInquiry = !isConverted && !isLost && !isPipelineLead;

      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "active"
          ? isActiveInquiry
          : statusFilter === "pipeline"
          ? isPipelineLead
          : statusFilter === "converted" || statusFilter === "won"
          ? isConverted
          : statusFilter === "lost"
          ? isLost
          : true;

      const matchDate = matchesDateFilter(lead);
      if (matchStatus && matchDate) {
        const first = (lead.name || "").trim().toUpperCase().charAt(0);
        if (/[A-Z]/.test(first)) {
          counts[first] = (counts[first] || 0) + 1;
        } else if (first) {
          counts["#"] = (counts["#"] || 0) + 1;
        }
      }
    });
    return counts;
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, leads, selectedDate, statusFilter]);

  const totalLettersCount = useMemo(() => {
    return Object.values(leadLetterCounts).reduce((a, b) => a + b, 0);
  }, [leadLetterCounts]);

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = leads.filter((lead) => {
      const linkedDeal = deals.find((deal) => deal.lead_id === lead.id);
      const isInPipeline = Boolean(linkedDeal && !CLOSED_PIPELINE_STAGES.includes(linkedDeal.pipeline_stage || linkedDeal.stage));
      const hasWonDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_won");
      const hasLostDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_lost");

      const isConverted = hasWonDeal || (!linkedDeal && (lead.status === "Converted" || lead.status === "Closed Won"));
      const isLost = !isConverted && (hasLostDeal || (!linkedDeal && lead.status === "Lost"));
      const isPipelineLead = !isConverted && !isLost && (isInPipeline || (!linkedDeal && ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(lead.status)));
      const isActiveInquiry = !isConverted && !isLost && !isPipelineLead;

      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "active"
          ? isActiveInquiry
          : statusFilter === "pipeline"
          ? isPipelineLead
          : statusFilter === "converted" || statusFilter === "won"
          ? isConverted
          : statusFilter === "lost"
          ? isLost
          : true;

      const matchDate = matchesDateFilter(lead);
      const matchQuery =
        !q ||
        [lead.name, lead.phone, lead.email, lead.service, lead.source, lead.city, lead.state].some((val) =>
          String(val || "").toLowerCase().includes(q)
        );

      const firstChar = (lead.name || "").trim().toUpperCase().charAt(0);
      const matchAlphabet =
        leadAlphabetFilter === "all"
          ? true
          : leadAlphabetFilter === "#"
          ? !/[A-Z]/.test(firstChar)
          : firstChar === leadAlphabetFilter;

      return matchStatus && matchQuery && matchDate && matchAlphabet;
    });

    if (leadSortOrder === "asc" || (leadSortOrder === "default" && leadAlphabetFilter !== "all")) {
      result.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" }));
    } else if (leadSortOrder === "desc") {
      result.sort((a, b) => String(b.name || "").localeCompare(String(a.name || ""), undefined, { sensitivity: "base" }));
    }

    return result;
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, leadAlphabetFilter, leadSortOrder, leads, query, selectedDate, statusFilter]);

  useEffect(() => {
    setLeadPage(1);
    setPipelinePage(1);
    setFollowUpPage(1);
    setMeetingPage(1);
  }, [customDateRange.from, customDateRange.to, dateFilter, followUpPageSize, leadAlphabetFilter, leadSortOrder, leadsPerPage, meetingPageSize, pipelinePageSize, query, selectedDate, statusFilter, viewMode]);

  const leadTotalForPagination = filteredLeads.length;
  const leadPageCount = Math.max(1, Math.ceil(leadTotalForPagination / leadsPerPage));
  const safeLeadPage = Math.min(Math.max(1, leadPage), leadPageCount);
  const paginatedLeads = useMemo(() => {
    const start = (safeLeadPage - 1) * leadsPerPage;
    return filteredLeads.slice(start, start + leadsPerPage);
  }, [filteredLeads, leadsPerPage, safeLeadPage]);
  const leadPageStart = leadTotalForPagination === 0 ? 0 : (safeLeadPage - 1) * leadsPerPage + 1;
  const leadPageEnd = Math.min(leadTotalForPagination, safeLeadPage * leadsPerPage);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = leadSummary?.total ?? leads.length;
    const newCount = leads.filter((l) => l.status === "New" && !deals.some((d) => d.lead_id === l.id)).length;
    
    const wonDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_won").map((d) => d.lead_id).filter(Boolean)
    );
    const activePipelineLeadIds = new Set(
      deals.filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage)).map((d) => d.lead_id).filter(Boolean)
    );
    const lostDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").map((d) => d.lead_id).filter(Boolean)
    );

    const convertedCount = leads.filter((l) => {
      if (wonDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return l.status === "Converted" || l.status === "Closed Won";
    }).length + deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_won" && !d.lead_id).length;

    const lostCount = leads.filter((l) => {
      if (lostDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
      return l.status === "Lost";
    }).length + deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost" && !d.lead_id).length;

    const lostDealsCount = deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").length;
    const rate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;
    const totalPipelineValue = deals
      .filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage))
      .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);
    const wonValue = deals
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_won")
      .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);
    const lostValue = deals
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_lost")
      .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);

    return { total, newCount, convertedCount, lostCount, lostDealsCount, rate, totalPipelineValue, wonValue, lostValue };
  }, [leads, deals, leadSummary]);

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

  function getLatestLinkedDoc(items, deal) {
    if (!deal) return null;
    return items
      .filter((item) => item.deal_id === deal.id || (deal.client_id && item.client_id === deal.client_id))
      .sort((a, b) => new Date(b.sent_at || b.signed_at || b.paid_at || b.created_at || 0).getTime() - new Date(a.sent_at || a.signed_at || a.paid_at || a.created_at || 0).getTime())[0] || null;
  }

  function getDocStatusBadge(label, doc) {
    const status = String(doc?.status || "").toLowerCase();
    if (!doc || !status || status === "draft") return null;
    const displayStatus = status.replace(/_/g, " ");
    const tone = ["paid", "signed", "accepted"].includes(status)
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
      : ["rejected", "declined", "cancelled", "overdue"].includes(status)
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
      : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300";
    return { label: `${label} ${displayStatus}`, tone };
  }

  const filteredFollowUps = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return followUps.filter((item) => {
      const lead = leads.find((l) => l.id === item.lead_id);
      const client = clients.find((c) => c.id === item.client_id);
      if (!matchesDateFilter(item, "due_at")) return false;

      const isOverdue = item.status === "pending" && item.due_at && new Date(item.due_at).getTime() < now;
      const isPending = item.status === "pending";
      const isDone = item.status === "done";
      const isMissed = item.status === "missed";

      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "pending" || statusFilter === "active"
          ? isPending && !isOverdue
          : statusFilter === "overdue"
          ? isOverdue
          : statusFilter === "done" || statusFilter === "completed" || statusFilter === "won" || statusFilter === "converted"
          ? isDone
          : statusFilter === "missed" || statusFilter === "lost"
          ? isMissed
          : true;

      const matchQuery =
        !q ||
        [item.title, item.channel, item.status, item.notes, lead?.name, client?.name]
          .some((value) => String(value || "").toLowerCase().includes(q));

      return matchStatus && matchQuery;
    });
  }, [clients, customDateRange.from, customDateRange.to, dateFilter, followUps, leads, query, selectedDate, statusFilter]);

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

  const allPipelineDeals = useMemo(() => {
    const existingDealLeadIds = new Set(deals.map((d) => d.lead_id).filter(Boolean));
    const list = [...deals];
    leads.forEach((l) => {
      const isLeadWon = l.status === "Converted" || l.status === "Closed Won";
      if (isLeadWon && !existingDealLeadIds.has(l.id)) {
        list.push({
          id: `lead-converted-${l.id}`,
          title: l.name ? `${l.name} - ${l.service || "Tech Development"}` : "Converted Lead",
          lead_id: l.id,
          pipeline_stage: "closed_won",
          stage: "closed_won",
          deal_value: Number(l.deal_value || l.budget || 0) || 50000,
          currency: "INR",
          service: l.service || "Tech Development",
          created_at: l.created_at,
          updated_at: l.updated_at || l.created_at,
          notes: l.notes || `Converted from lead: ${l.name}`,
        });
      }
    });
    return list;
  }, [deals, leads]);

  const visiblePipelineDeals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPipelineDeals.filter((deal) => {
      const stage = deal.pipeline_stage || deal.stage || "contacted";
      if (statusFilter === "lost") {
        if (stage !== "closed_lost") return false;
      } else {
        if (stage === "closed_lost") return false;
      }
      if (statusFilter === "won" || statusFilter === "converted") {
        return stage === "closed_won";
      }
      if (statusFilter === "active") {
        if (CLOSED_PIPELINE_STAGES.includes(stage)) return false;
      }
      if (q) {
        const lead = leads.find((l) => l.id === deal.lead_id);
        const matchTitle = String(deal.title || "").toLowerCase().includes(q);
        const matchService = String(deal.service || "").toLowerCase().includes(q);
        const matchLead = [lead?.name, lead?.phone, lead?.email].some((v) =>
          String(v || "").toLowerCase().includes(q)
        );
        if (!matchTitle && !matchService && !matchLead) return false;
      }
      return true;
    });
  }, [allPipelineDeals, leads, query, statusFilter]);
  const pipelineTotal = visiblePipelineDeals.length;
  const pipelinePageCount = Math.max(1, Math.ceil(pipelineTotal / pipelinePageSize));
  const safePipelinePage = Math.min(Math.max(1, pipelinePage), pipelinePageCount);
  const paginatedPipelineDeals = useMemo(() => {
    const start = (safePipelinePage - 1) * pipelinePageSize;
    return visiblePipelineDeals.slice(start, start + pipelinePageSize);
  }, [visiblePipelineDeals, pipelinePageSize, safePipelinePage]);
  const pipelinePageStart = pipelineTotal === 0 ? 0 : (safePipelinePage - 1) * pipelinePageSize + 1;
  const pipelinePageEnd = Math.min(pipelineTotal, safePipelinePage * pipelinePageSize);
  const followUpTotal = filteredFollowUps.length;
  const followUpPageCount = Math.max(1, Math.ceil(followUpTotal / followUpPageSize));
  const safeFollowUpPage = Math.min(Math.max(1, followUpPage), followUpPageCount);
  const paginatedFollowUps = useMemo(() => {
    const start = (safeFollowUpPage - 1) * followUpPageSize;
    return filteredFollowUps.slice(start, start + followUpPageSize);
  }, [filteredFollowUps, followUpPageSize, safeFollowUpPage]);
  const followUpPageStart = followUpTotal === 0 ? 0 : (safeFollowUpPage - 1) * followUpPageSize + 1;
  const followUpPageEnd = Math.min(followUpTotal, safeFollowUpPage * followUpPageSize);
  const meetingTotal = meetingPagination?.count ?? filteredSalesMeetings.length;
  const meetingBasePageCount = Math.max(1, Math.ceil(Math.max(meetingTotal, filteredSalesMeetings.length) / meetingPageSize));
  const safeMeetingPage = onFetchMeetingsPage ? Math.max(1, meetingPage) : Math.min(meetingPage, meetingBasePageCount);
  const meetingPageCount = Math.max(safeMeetingPage, meetingBasePageCount, onFetchMeetingsPage && filteredSalesMeetings.length >= meetingPageSize ? safeMeetingPage + 1 : 1);
  const isLeadsLoading = Boolean(leadPagination?.loading);
  const isPipelineLoading = Boolean(dealPagination?.loading);
  const isFollowUpsLoading = Boolean(followUpPagination?.loading);
  const isMeetingsLoading = Boolean(meetingPagination?.loading);

  const leadSummaryMetrics = useMemo(() => {
    const totalLeads = leadSummary?.total ?? (leadPagination?.count || leads.length);

    const wonDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_won").map((d) => d.lead_id).filter(Boolean)
    );
    const activePipelineLeadIds = new Set(
      deals.filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage)).map((d) => d.lead_id).filter(Boolean)
    );
    const lostDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").map((d) => d.lead_id).filter(Boolean)
    );

    // 1. Converted / Won Leads
    const convertedFromLeads = leads.filter((l) => {
      if (wonDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return l.status === "Converted" || l.status === "Closed Won";
    }).length;
    const standaloneWonDeals = deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_won" && !d.lead_id).length;
    const wonDealsCount = deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_won").length;
    const convertedCount = Math.max(wonDealsCount, convertedFromLeads + standaloneWonDeals);

    // 2. Lost Leads
    const lostFromLeads = leads.filter((l) => {
      if (lostDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
      return l.status === "Lost";
    }).length;
    const standaloneLostDeals = deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost" && !d.lead_id).length;
    const lostDealsCount = deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").length;
    const lostCount = Math.max(lostDealsCount, lostFromLeads + standaloneLostDeals);

    // 3. In Pipeline (Deal Stage)
    const openDealsCount = deals.filter(
      (d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage)
    ).length;
    const pipelineLeadsFromLoaded = leads.filter((l) => {
      if (activePipelineLeadIds.has(l.id)) return true;
      if (wonDealLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(l.status);
    }).length;
    const pipelineCount = Math.max(openDealsCount, pipelineLeadsFromLoaded);

    // 4. Active Inquiries (Raw incoming leads not in pipeline and not decided)
    const activeCount = Math.max(0, totalLeads - pipelineCount - convertedCount - lostCount);

    const convRateNumber = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;
    const convRateDisplay = convRateNumber % 1 === 0 ? `${convRateNumber}%` : `${convRateNumber.toFixed(1)}%`;

    const decidedTotal = convertedCount + lostCount;
    const winRateNumber = decidedTotal > 0 ? (convertedCount / decidedTotal) * 100 : 0;
    const winRateDisplay = winRateNumber % 1 === 0 ? `${winRateNumber}%` : `${winRateNumber.toFixed(1)}%`;

    return {
      totalLeads,
      activeCount,
      pipelineCount,
      convertedCount,
      lostCount,
      decidedTotal,
      convRateNumber,
      convRateDisplay,
      winRateNumber,
      winRateDisplay,
    };
  }, [deals, leadPagination?.count, leadSummary, leads]);

  const pageStatusCards = useMemo(() => {
    if (viewMode === "reports") return [];
    if (viewMode === "leads") {
      const {
        totalLeads,
        activeCount,
        pipelineCount,
        convertedCount,
        lostCount,
        decidedTotal,
        convRateDisplay,
        winRateDisplay,
      } = leadSummaryMetrics;

      return [
        {
          id: "total_leads",
          label: "Total Leads",
          value: totalLeads,
          sub: "All captured inbound leads",
          icon: Users,
          tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
          filterKey: "all",
          helpText: "All captured inbound inquiries across all channels.",
        },
        {
          id: "active_inquiries",
          label: "Active Inquiries",
          value: activeCount,
          sub: "New inquiries to qualify",
          icon: HelpCircle,
          tone: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30",
          filterKey: "active",
          helpText: "Inbound leads waiting to be qualified into sales pipeline.",
        },
        {
          id: "pipeline",
          label: "In Pipeline",
          value: pipelineCount,
          sub: "Active in deal stages",
          icon: TrendingUp,
          tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
          filterKey: "pipeline",
          helpText: "Leads currently in contacted, meeting, proposal, or negotiation stages.",
        },
        {
          id: "converted",
          label: "Converted (Won)",
          value: convertedCount,
          sub: "Turned into paying clients",
          icon: CheckCircle2,
          tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
          filterKey: "converted",
          helpText: "Leads successfully converted to closed won deals / client accounts.",
        },
        {
          id: "lost",
          label: "Lost Leads",
          value: lostCount,
          sub: "Dropped / marked lost",
          icon: XCircle,
          tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
          filterKey: "lost",
          helpText: "Leads that dropped off or were closed lost with documented reasons.",
        },
        {
          id: "conversion_rate",
          label: "Conversion Rate",
          value: convRateDisplay,
          sub: `${convertedCount} Won ÷ ${totalLeads} Total`,
          icon: Target,
          tone: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
          filterKey: "converted",
          badge: `Win Rate: ${winRateDisplay}`,
          isRateCard: true,
          ratioBasis: `Formula: (Converted Leads ÷ Total Leads) × 100`,
          ratioFormula: `(${convertedCount} ÷ ${totalLeads}) × 100 = ${convRateDisplay}`,
          winRateFormula: decidedTotal > 0 ? `Win Rate on Closed: (${convertedCount} Won ÷ ${decidedTotal} Decided) = ${winRateDisplay}` : null,
          helpText: `Conversion Ratio is calculated as (Converted Leads ÷ Total Leads) × 100. Out of ${totalLeads} total leads, ${convertedCount} became clients (${convRateDisplay}). Win rate on decided deals (${convertedCount} won, ${lostCount} lost) is ${winRateDisplay}.`,
        },
      ];
    }
    if (viewMode === "pipeline") {
      const activeDeals = allPipelineDeals.filter(
        (deal) => !CLOSED_PIPELINE_STAGES.includes(deal.pipeline_stage || deal.stage)
      );
      const wonDeals = allPipelineDeals.filter(
        (deal) => (deal.pipeline_stage || deal.stage) === "closed_won"
      );
      const lostDeals = allPipelineDeals.filter(
        (deal) => (deal.pipeline_stage || deal.stage) === "closed_lost"
      );

      const openCount = activeDeals.length;
      const wonCount = wonDeals.length;
      const lostCount = lostDeals.length;
      const totalDealsCount = allPipelineDeals.length;
      const decidedCount = wonCount + lostCount;

      const activeValue = activeDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      const lostValue = lostDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      const totalValue = allPipelineDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);

      const winRateNumber = decidedCount > 0 ? (wonCount / decidedCount) * 100 : 0;
      const winRateDisplay = winRateNumber % 1 === 0 ? `${winRateNumber}%` : `${winRateNumber.toFixed(1)}%`;

      return [
        {
          id: "pipeline_value",
          label: "Total Pipeline Value",
          value: `Rs. ${totalValue.toLocaleString("en-IN")}`,
          sub: `${totalDealsCount} total deals managed`,
          badge: `${openCount} in progress`,
          icon: DollarSign,
          tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
          filterKey: "all",
          helpText: "Total monetary value across all deals in the sales pipeline.",
        },
        {
          id: "active_deals",
          label: "Active Deals",
          value: openCount,
          sub: `Rs. ${activeValue.toLocaleString("en-IN")} in active stages`,
          badge: "In Progress",
          icon: TrendingUp,
          tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
          filterKey: "active",
          helpText: "Open deals currently in Contacted, Meeting, Quotation, or Negotiation stages.",
        },
        {
          id: "closed_won",
          label: "Closed Won",
          value: wonCount,
          sub: `Rs. ${wonValue.toLocaleString("en-IN")} revenue booked`,
          badge: "Won Deals",
          icon: CheckCircle2,
          tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
          filterKey: "won",
          helpText: "Deals successfully won and converted into paying clients.",
        },
        {
          id: "closed_lost",
          label: "Closed Lost",
          value: lostCount,
          sub: `Rs. ${lostValue.toLocaleString("en-IN")} dropped value`,
          badge: "Drop-offs",
          icon: XCircle,
          tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
          filterKey: "lost",
          helpText: "Deals marked lost with recorded drop-off reasons.",
        },
        {
          id: "deal_win_rate",
          label: "Deal Win Rate",
          value: winRateDisplay,
          sub: decidedCount > 0 ? `(${wonCount} Won ÷ ${decidedCount} Decided)` : "No closed deals yet",
          badge: decidedCount > 0 ? `${wonCount}W / ${lostCount}L` : "0 Decided",
          icon: Target,
          tone: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
          filterKey: "won",
          helpText: "Win rate calculated as (Closed Won ÷ (Closed Won + Closed Lost)) × 100.",
        },
      ];
    }
    if (viewMode === "commercials") {
      const quotationCount = proposals.length + quotations.length;
      const agreementCount = agreements.length;
      const sentCount = [...proposals, ...quotations, ...agreements].filter((item) => ["sent", "accepted", "signed"].includes(item.status)).length;
      const approvedCount = [...proposals, ...quotations, ...agreements].filter((item) => ["accepted", "signed"].includes(item.status)).length;
      return [
        { label: "Quotations", value: quotationCount, sub: "Proposal/quotation docs", icon: FileText, tone: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
        { label: "Agreements", value: agreementCount, sub: "Client agreement docs", icon: CheckCircle2, tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" },
        { label: "Sent", value: sentCount, sub: "Shared with client", icon: ExternalLink, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
        { label: "Approved", value: approvedCount, sub: "Accepted or signed", icon: ShieldAlert, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
      ];
    }
    if (viewMode === "followups") {
      const now = Date.now();
      const allFollowUps = followUps.filter((item) => matchesDateFilter(item, "due_at"));
      const totalCount = allFollowUps.length;
      const allPending = allFollowUps.filter((item) => item.status === "pending");
      const overdueCount = allPending.filter((item) => item.due_at && new Date(item.due_at).getTime() < now).length;
      const pendingCount = allPending.length - overdueCount;
      const doneCount = allFollowUps.filter((item) => item.status === "done").length;
      const missedCount = allFollowUps.filter((item) => item.status === "missed").length;

      return [
        {
          id: "total_followups",
          label: "Total Follow-ups",
          value: totalCount,
          sub: "All scheduled follow-ups",
          icon: Calendar,
          tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
          filterKey: "all",
          helpText: "All follow-up activities recorded for leads and clients.",
        },
        {
          id: "pending_followups",
          label: "Pending",
          value: pendingCount,
          sub: "Upcoming actions required",
          badge: "Open",
          icon: Phone,
          tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
          filterKey: "pending",
          helpText: "Open follow-ups scheduled for today or future dates.",
        },
        {
          id: "overdue_followups",
          label: "Overdue",
          value: overdueCount,
          sub: "Past due action required",
          badge: overdueCount > 0 ? "Urgent" : null,
          icon: AlertCircle,
          tone: "text-red-600 bg-red-50 dark:bg-red-950/30",
          filterKey: "overdue",
          helpText: "Pending follow-ups whose due date has passed.",
        },
        {
          id: "completed_followups",
          label: "Completed",
          value: doneCount,
          sub: "Marked done successfully",
          icon: CheckCircle2,
          tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
          filterKey: "done",
          helpText: "Follow-ups that were successfully completed.",
        },
        {
          id: "missed_followups",
          label: "Missed",
          value: missedCount,
          sub: "Needs reschedule",
          icon: XCircle,
          tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
          filterKey: "missed",
          helpText: "Follow-ups marked as missed or requiring rescheduling.",
        },
      ];
    }
    if (viewMode === "sales_meetings") {
      const scheduled = filteredSalesMeetings.filter((item) => item.status === "scheduled").length;
      const completed = filteredSalesMeetings.filter((item) => item.status === "completed").length;
      const noShow = filteredSalesMeetings.filter((item) => ["no_show", "cancelled"].includes(item.status)).length;
      const today = filteredSalesMeetings.filter((item) => item.scheduled_at && new Date(item.scheduled_at).toDateString() === new Date().toDateString()).length;
      return [
        { label: "Scheduled", value: scheduled, sub: "Upcoming meetings", icon: Calendar, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
        { label: "Today", value: today, sub: "Meetings today", icon: Phone, tone: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30" },
        { label: "Completed", value: completed, sub: "Done meetings", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
        { label: "No Show", value: noShow, sub: "Missed/cancelled", icon: XCircle, tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
      ];
    }
    return [];
  }, [
    agreements,
    deals,
    filteredFollowUps,
    filteredLeads,
    filteredSalesMeetings,
    leadTotalForPagination,
    leads,
    proposals,
    quotations,
    viewMode,
    visiblePipelineDeals,
    leadSummaryMetrics,
  ]);

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
        action: getLeadNextAction(lead, followUps, salesMeetings),
      }))
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
    const totalBaseLeads = dateFilter === "all" ? Math.max(activeLeads, leadSummary?.total || 0) : activeLeads;
    const totalWon = wonDeals;
    const conversionRate = totalBaseLeads > 0 ? Math.round((totalWon / totalBaseLeads) * 100) : 0;
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
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, followUps, leadSummary, leads, selectedDate]);

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

  async function scheduleAutoMeetingForDeal(deal) {
    if (!deal?.id) return;
    const alreadyScheduled = salesMeetings.some((item) => item.deal_id === deal.id && !["cancelled", "completed", "no_show"].includes(item.status));
    if (alreadyScheduled) return;
    const lead = getDealLead(deal);
    await onCreateSalesMeeting?.({
      title: `Client meeting: ${deal.title || lead?.name || "Sales deal"}`,
      lead_id: deal.lead_id || null,
      client_id: deal.client_id || null,
      deal_id: deal.id,
      meeting_type: "discovery",
      scheduled_at: deal.meeting_scheduled_at ? new Date(deal.meeting_scheduled_at).toISOString() : getMeetingStartIso(),
      duration_minutes: 30,
      meeting_link: deal.meeting_link || defaultMeetLink || "https://meet.google.com/new",
      agenda: "Auto-created when lead was moved into sales pipeline. Confirm requirements, budget, timeline, and decision maker.",
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
    setShowCommercialModal(true);
  }

  function openInvoiceModal(deal = null) {
    const linkedDeal = deal || deals.find((item) => item.id === invoiceForm.deal_id) || deals[0];
    setInvoiceDeal(linkedDeal || null);
    const dealVal = linkedDeal ? Number(linkedDeal.deal_value || linkedDeal.value) || 0 : 0;
    const invNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const advanceAmount = dealVal > 0 ? Math.round(dealVal * 0.4) : (dealVal ? dealVal : "");
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const dealTitle = linkedDeal?.title || linkedDeal?.client_name || "Client";

    setInvoiceForm({
      deal_id: linkedDeal?.id || "",
      client_id: linkedDeal?.client_id || "",
      invoice_number: invNumber,
      title: `${dealTitle} - Advance Invoice (40%)`,
      amount: advanceAmount ? String(advanceAmount) : "",
      milestone_type: "advance",
      due_date: dueDate,
      notes: "Payment due within 7 days of invoice issue date. 18% GST standard applicable.",
      status: "sent",
    });
    setShowInvoiceModal(true);
  }

  function handleInvoiceMilestoneChange(newMilestone) {
    const dealVal = invoiceDeal ? Number(invoiceDeal.deal_value || invoiceDeal.value) || 0 : 0;
    const dealTitle = invoiceDeal?.title || invoiceDeal?.client_name || "Client";
    let newAmount = invoiceForm.amount;
    let newTitle = invoiceForm.title;

    if (dealVal > 0) {
      if (newMilestone === "advance") {
        newAmount = String(Math.round(dealVal * 0.4));
        newTitle = `${dealTitle} - Advance Invoice (40%)`;
      } else if (newMilestone === "milestone") {
        newAmount = String(Math.round(dealVal * 0.3));
        newTitle = `${dealTitle} - Sprint Milestone Invoice (30%)`;
      } else if (newMilestone === "final") {
        newAmount = String(Math.round(dealVal * 0.3));
        newTitle = `${dealTitle} - Final Delivery Invoice (30%)`;
      } else if (newMilestone === "full") {
        newAmount = String(dealVal);
        newTitle = `${dealTitle} - Full Payment Invoice (100%)`;
      } else if (newMilestone === "monthly_retainer") {
        newAmount = String(dealVal);
        newTitle = `${dealTitle} - Monthly Retainer Invoice`;
      }
    }

    setInvoiceForm((prev) => ({
      ...prev,
      milestone_type: newMilestone,
      amount: newAmount,
      title: newTitle,
    }));
  }

  function sendDocWhatsApp(doc, docType = "quotation") {
    const linkedDeal = deals.find((d) => d.id === (doc.deal_id || doc.dealId));
    const lead = leads.find((l) => l.id === (linkedDeal?.lead_id || doc.lead_id || doc.leadId));
    const client = clients.find((c) => c.id === (linkedDeal?.client_id || doc.client_id || doc.clientId));
    const contactName = lead?.name || client?.name || linkedDeal?.title || "there";
    const rawPhone = lead?.phone || client?.phone || linkedDeal?.phone || "";

    if (!rawPhone) {
      alert(`Client phone number not found for ${contactName}. Please check lead or client profile.`);
      return;
    }

    let message = "";
    if (docType === "agreement") {
      const agrNum = doc.agreement_number || "AGR-2026";
      const title = doc.title || linkedDeal?.title || "your project";
      message = `Hi ${contactName}, greetings from TexWeb Solution! Your Project Agreement *#${agrNum}* for *${title}* is ready. Please review the commercial terms and confirm for execution. Thank you!`;
    } else if (docType === "invoice") {
      const invNum = doc.invoice_number || "INV-2026";
      const totalAmt = Number(doc.total_amount || doc.amount || 0).toLocaleString("en-IN");
      const dueDate = doc.due_date || "Within 7 days";
      const title = doc.title || linkedDeal?.title || "Project Development";
      message = `Hi ${contactName}, greetings from TexWeb Solution! Invoice *#${invNum}* for *${title}* has been generated for *₹${totalAmt}* (Due Date: ${dueDate}). Please find the invoice details and proceed with the payment. Thank you!`;
    } else {
      const quotNum = doc.quotation_number || "QT-2026";
      const totalAmt = Number(doc.total || doc.amount || 0).toLocaleString("en-IN");
      const title = doc.title || linkedDeal?.title || "your project";
      message = `Hi ${contactName}, greetings from TexWeb Solution! We have prepared the official Quotation *#${quotNum}* for *${title}* with total value *₹${totalAmt}*. Please review and let us know your confirmation or feedback. Thank you!`;
    }

    if (onOpenDirectWhatsapp) {
      onOpenDirectWhatsapp(rawPhone, contactName, message);
      return;
    }
    const digits = rawPhone.replace(/[^0-9]/g, "");
    const cleanPhone = digits.length === 10 ? `91${digits}` : digits;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function sendDealDocWhatsApp(deal) {
    const latestInvoice = getLatestLinkedDoc(invoices, deal);
    if (latestInvoice) {
      return sendDocWhatsApp(latestInvoice, "invoice");
    }
    const latestAgreement = getLatestLinkedDoc(agreements, deal);
    if (latestAgreement) {
      return sendDocWhatsApp(latestAgreement, "agreement");
    }
    const latestQuotation = getLatestLinkedDoc([...proposals, ...quotations], deal);
    if (latestQuotation) {
      return sendDocWhatsApp(latestQuotation, "quotation");
    }
    return openMeetingWhatsApp(deal);
  }

  async function handleCreateInvoiceSubmit(e, sendWhatsApp = false) {
    if (e && e.preventDefault) e.preventDefault();
    if (!invoiceForm.deal_id || !invoiceForm.amount) return;
    const baseAmt = parseFloat(invoiceForm.amount) || 0;
    const taxAmt = Math.round(baseAmt * 0.18);
    const payload = {
      ...invoiceForm,
      amount: baseAmt,
      tax_amount: taxAmt,
      total_amount: baseAmt + taxAmt,
    };
    if (onCreateInvoice) {
      await onCreateInvoice(payload);
    } else {
      await createInvoice(payload);
    }
    try {
      playNotificationSound?.("payment");
    } catch (_) {}
    setShowInvoiceModal(false);
    if (sendWhatsApp) {
      sendDocWhatsApp(payload, "invoice");
    }
  }

  function handleCreateCommercialSubmit(e, sendWhatsApp = false) {
    if (e && e.preventDefault) e.preventDefault();
    if (!commercialForm.deal_id) return;
    const amount = parseFloat(commercialForm.amount) || 0;
    if (commercialType !== "agreement") {
      onCreateProposal?.({
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
    if (sendWhatsApp) {
      sendDocWhatsApp(commercialForm, commercialType);
    }
  }

  function handleCreateFollowUpSubmit(e) {
    e.preventDefault();
    if (!followUpForm.title || !followUpForm.due_at) return;
    onCreateFollowUp?.({
      ...followUpForm,
      lead_id: followUpForm.lead_id || null,
      deal_id: followUpForm.deal_id || null,
      due_at: new Date(followUpForm.due_at).toISOString(),
      status: "pending",
    });
    setShowFollowUpModal(false);
  }

  function openPipelineFollowUpModal(deal) {
    const lead = getDealLead(deal);
    setFollowUpForm({
      title: `Follow up: ${deal.title || lead?.name || "Pipeline deal"}`,
      lead_id: deal.lead_id || "",
      client_id: "",
      deal_id: deal.id || "",
      channel: "whatsapp",
      due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      priority: "medium",
      notes: `Manual follow-up from ${PIPELINE_STAGES.find((stage) => stage.id === (deal.pipeline_stage || "contacted"))?.label || "pipeline"} stage.`,
    });
    setShowFollowUpModal(true);
  }

  function openLeadFollowUpModal(lead) {
    setFollowUpForm({
      title: `Follow up: ${lead?.name || "Lead"}`,
      lead_id: lead?.id || "",
      client_id: "",
      deal_id: "",
      channel: lead?.phone ? "whatsapp" : "phone",
      due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      priority: "medium",
      notes: `Manual follow-up from lead page for ${lead?.service || "inquiry"}.`,
    });
    setShowFollowUpModal(true);
  }

  function handleCreateSalesMeetingSubmit(e) {
    e.preventDefault();
    if (!salesMeetingForm.title || !salesMeetingForm.scheduled_at) return;
    onCreateSalesMeeting?.({
      ...salesMeetingForm,
      lead_id: salesMeetingForm.lead_id || null,
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
      rawStage.includes("meet") || rawStage.includes("qual") ? "meeting" :
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
      pipeline_stage: "contacted",
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
      pipeline_stage: "contacted",
      deal_value: Number(newDealForm.deal_value) || 0,
      client_id: null,
      lead_id: newDealForm.lead_id || null,
      expected_close_date: newDealForm.meeting_scheduled_at ? newDealForm.meeting_scheduled_at.slice(0, 10) : null,
      notes: [
        newDealForm.notes,
        newDealForm.meeting_scheduled_at ? `Meeting scheduled: ${new Date(newDealForm.meeting_scheduled_at).toLocaleString("en-IN")}` : null,
        newDealForm.meeting_link ? `Google Meet: ${newDealForm.meeting_link}` : null,
      ].filter(Boolean).join("\n"),
    });
    if (created?.id && newDealForm.meeting_scheduled_at) {
      await scheduleAutoMeetingForDeal({
        ...newDealForm,
        ...created,
        meeting_scheduled_at: newDealForm.meeting_scheduled_at,
        meeting_link: newDealForm.meeting_link,
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
      meeting_scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
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
          title="Import Excel, Google Sheet, or Meta Ads leads into CRM"
        >
          <Sparkles className="w-4 h-4" />
          <span>Import Excel Leads</span>
        </button>
      )}

      {viewMode === "commercials" && (
        <button
          onClick={() => openCommercialModal("proposal")}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Quotation + Agreement</span>
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

      {pageStatusCards.length > 0 && (
        <div className={`grid gap-3 ${pageStatusCards.length === 6 ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" : pageStatusCards.length === 5 ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" : "grid-cols-2 lg:grid-cols-4"}`}>
          {pageStatusCards.map((card) => {
            const Icon = card.icon;
            const isClickable = Boolean(card.filterKey && (viewMode === "leads" || viewMode === "pipeline" || viewMode === "followups"));
            const isFilterActive =
              (viewMode === "leads" || viewMode === "pipeline" || viewMode === "followups") &&
              card.filterKey &&
              (
                (card.filterKey === "all" && (statusFilter === "all" || !statusFilter)) ||
                (card.filterKey === "pending" && (statusFilter === "pending" || statusFilter === "active")) ||
                (card.filterKey === "overdue" && statusFilter === "overdue") ||
                (card.filterKey === "done" && (statusFilter === "done" || statusFilter === "completed")) ||
                (card.filterKey === "missed" && statusFilter === "missed") ||
                (card.filterKey === "active" && statusFilter === "active") ||
                (card.filterKey === "pipeline" && statusFilter === "pipeline") ||
                (card.filterKey === "converted" && (statusFilter === "converted" || statusFilter === "won")) ||
                (card.filterKey === "lost" && statusFilter === "lost")
              );
            return (
              <div
                key={card.label}
                onClick={() => {
                  if (isClickable && card.filterKey) {
                    setStatusFilter(card.filterKey);
                    setLeadPage(1);
                    setPipelinePage(1);
                    setFollowUpPage(1);
                  }
                }}
                className={`p-4 rounded-2xl bg-white dark:bg-[#18150f] border shadow-2xs min-w-0 transition-all ${
                  isFilterActive
                    ? "border-orange-500 ring-2 ring-orange-500/40 bg-orange-50/25 dark:bg-orange-950/25 shadow-xs"
                    : "border-gray-100 dark:border-[#3a3020]"
                } ${
                  isClickable ? "cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-xs active:scale-[0.99]" : ""
                }`}
                title={card.helpText || card.label}
              >
                <div className="flex items-center justify-between gap-2 text-gray-500 dark:text-neutral-400 text-xs">
                  <span className="font-semibold truncate">{card.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {card.badge && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300">
                        {card.badge}
                      </span>
                    )}
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-2 text-gray-900 dark:text-white truncate">{card.value}</div>
                <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 font-medium truncate" title={card.sub}>
                  {card.sub}
                </div>
                {card.ratioFormula && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#2a2418] text-[10px] text-purple-600 dark:text-purple-400 font-bold truncate flex items-center gap-1" title={card.ratioBasis}>
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span className="truncate">{card.ratioFormula}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


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
            Rs. {stats.totalPipelineValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Across open proposals</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Closed Won Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">
            Rs. {stats.wonValue.toLocaleString("en-IN")}
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
            aiInsights.rankedLeads.map(({ lead, action }) => (
              <div key={lead.id} className="rounded-xl border border-gray-100 dark:border-[#3a3020] bg-gray-50 dark:bg-[#211d14] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{lead.name}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">{action}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openAddDealModal("contacted", lead)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-600 text-white">Pipeline</button>
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
                      <div className="text-gray-500">{deal.pipeline_stage || "pipeline"} - {ageDays} days idle</div>
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

      {/* 3. Filter & Search Controls (Hidden on Leads, Pipeline & Follow-ups as cards handle filtering) */}
      {viewMode !== "reports" && viewMode !== "leads" && viewMode !== "pipeline" && viewMode !== "followups" && (
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

        {viewMode === "pipeline" && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            ["all", "All Stages"],
            ["active", "Active Deals"],
            ["won", "Won / Converted"],
            ["lost", "Closed Lost"],
          ].map(([value, label]) => {
            const isSelected =
              statusFilter === value ||
              (value === "won" && statusFilter === "converted") ||
              (value === "all" && !["active", "won", "converted", "lost"].includes(statusFilter));
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value === "won" ? "won" : value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? "bg-orange-600 text-white shadow-2xs"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        )}
      </div>
      )}

      {viewMode !== "reports" && (
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
        <div className="space-y-3">
          {/* Alphabetical Search & Filter Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input with clear button */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads alphabetically by name, phone, email, service..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* A-Z Sort Controls */}
              <div className="flex items-center gap-1.5 shrink-0 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
                <span className="text-[11px] text-gray-500 dark:text-neutral-400 px-1.5 flex items-center gap-1 select-none">
                  <ArrowDownAZ className="w-3.5 h-3.5 text-orange-500" />
                  <span>Sort:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setLeadSortOrder("asc")}
                  className={`px-2.5 py-1 rounded-lg transition select-none cursor-pointer ${
                    leadSortOrder === "asc"
                      ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                      : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Sort Alphabetically A to Z"
                >
                  A → Z
                </button>
                <button
                  type="button"
                  onClick={() => setLeadSortOrder("desc")}
                  className={`px-2.5 py-1 rounded-lg transition select-none cursor-pointer ${
                    leadSortOrder === "desc"
                      ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                      : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Sort Alphabetically Z to A"
                >
                  Z → A
                </button>
                <button
                  type="button"
                  onClick={() => setLeadSortOrder("default")}
                  className={`px-2 py-1 rounded-lg transition select-none cursor-pointer ${
                    leadSortOrder === "default"
                      ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                      : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Default order (Newest first)"
                >
                  Default
                </button>
              </div>
            </div>

            {/* A-Z Alphabet Selector Row */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100 dark:border-[#2e2619]">
              <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider shrink-0 mr-1 select-none">
                A-Z:
              </span>
              {["all", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"].map((char) => {
                const isSelected = leadAlphabetFilter === char;
                const count = char === "all" ? totalLettersCount : leadLetterCounts[char] || 0;
                const hasLeads = count > 0;

                return (
                  <button
                    key={char}
                    type="button"
                    onClick={() => {
                      setLeadAlphabetFilter(isSelected && char !== "all" ? "all" : char);
                      setLeadPage(1);
                    }}
                    disabled={char !== "all" && !hasLeads}
                    className={`min-w-[26px] h-7 px-1.5 rounded-lg text-[11px] font-bold shrink-0 transition flex items-center justify-center gap-0.5 select-none ${
                      isSelected
                        ? "bg-orange-600 text-white shadow-2xs scale-105 cursor-pointer"
                        : hasLeads
                        ? "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 cursor-pointer"
                        : "text-gray-300 dark:text-neutral-600 cursor-not-allowed opacity-35"
                    }`}
                    title={
                      char === "all"
                        ? `All leads (${totalLettersCount})`
                        : hasLeads
                        ? `${count} lead(s) starting with "${char}"`
                        : `No leads starting with "${char}"`
                    }
                  >
                    <span>{char === "all" ? "All" : char}</span>
                    {isSelected && char !== "all" && (
                      <span className="text-[9px] opacity-90">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
            {isLeadsLoading && paginatedLeads.length === 0 ? (
              <TableSkeleton rows={6} columns={6} />
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">
                <p>No leads found matching your search and filter criteria{leadAlphabetFilter !== "all" && ` starting with "${leadAlphabetFilter}"`}.</p>
                {(leadAlphabetFilter !== "all" || query) && (
                  <button
                    onClick={() => {
                      setLeadAlphabetFilter("all");
                      setQuery("");
                    }}
                    className="mt-2 text-xs font-semibold text-orange-600 hover:underline inline-block cursor-pointer"
                  >
                    Clear search & letter filter
                  </button>
                )}
              </div>
            ) : (
              <>
              <div className="overflow-x-auto table-scroll">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[980px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th
                        onClick={() => setLeadSortOrder(leadSortOrder === "asc" ? "desc" : "asc")}
                        className="py-3 px-4 cursor-pointer hover:text-orange-600 transition select-none"
                        title="Click to sort alphabetically"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Full Name</span>
                          <ArrowDownAZ className={`w-3.5 h-3.5 ${leadSortOrder !== "default" ? "text-orange-500" : "text-gray-400"}`} />
                          {leadSortOrder === "asc" && <span className="text-[9px] font-bold text-orange-600 lowercase">a-z</span>}
                          {leadSortOrder === "desc" && <span className="text-[9px] font-bold text-orange-600 lowercase">z-a</span>}
                        </div>
                      </th>
                      <th className="py-3 px-4">Contact (Phone & Email)</th>
                      <th className="py-3 px-4">Service Needed</th>
                      <th className="py-3 px-4">Budget Range</th>
                      <th className="py-3 px-4">City / State</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {paginatedLeads.map((lead) => {
                    const budget = getLeadBudget(lead);
                    const location = getLeadLocation(lead);
                    const linkedDeal = deals.find((deal) => deal.lead_id === lead.id);
                    const hasWonDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_won");
                    const hasLostDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_lost");
                    const isInPipeline = Boolean(linkedDeal && !CLOSED_PIPELINE_STAGES.includes(linkedDeal.pipeline_stage || linkedDeal.stage));
                    const isConverted = hasWonDeal || (!linkedDeal && (lead.status === "Converted" || lead.status === "Closed Won"));
                    const isLost = hasLostDeal || (!linkedDeal && lead.status === "Lost");
                    const stageLabel = linkedDeal ? (PIPELINE_STAGES.find((s) => s.id === (linkedDeal.pipeline_stage || linkedDeal.stage))?.label || "Pipeline") : null;

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition group"
                      >
                        {/* 1. Full Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                            <span>{lead.name}</span>
                            {isConverted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 shrink-0">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                <span>Won in Pipeline</span>
                              </span>
                            )}
                            {!isConverted && linkedDeal && (
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
                          {budget !== "-" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                              {budget}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>

                        {/* 5. City & State */}
                        <td className="py-3.5 px-4 text-xs font-medium text-gray-700 dark:text-slate-300">
                          {location !== "-" ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                              <span>{location}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap whitespace-nowrap">
                          {lead.phone && (
                            <button
                              onClick={() => handleWhatsAppClick(lead)}
                              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0"
                              title="Chat on WhatsApp"
                              aria-label="Chat on WhatsApp"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {linkedDeal || isConverted ? (
                            <button
                              onClick={() => {
                                setViewMode("pipeline");
                                setStatusFilter("all");
                              }}
                              className={`p-1.5 rounded-lg shrink-0 transition ${
                                isConverted
                                  ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                                  : "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100"
                              }`}
                              title={isConverted ? "Won in Pipeline (Click to view)" : "In Pipeline (Click to view)"}
                              aria-label={isConverted ? "Won in Pipeline" : "In Pipeline"}
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openAddDealModal("contacted", lead)}
                              className="p-1.5 rounded-lg text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition shrink-0"
                              title="Move to Pipeline"
                              aria-label="Move to Pipeline"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openLeadFollowUpModal(lead)}
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition shrink-0"
                            title="Schedule Follow-up"
                            aria-label="Schedule Follow-up"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {lead.status !== "Lost" && lead.status !== "Converted" && (
                            <button
                              onClick={() => openLostModal({ type: "lead", item: lead })}
                              className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0"
                              title="Mark Lead as Lost"
                              aria-label="Mark Lead as Lost"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition shrink-0"
                            title="View Details & Timeline"
                            aria-label="View Details & Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#211d14]/60 text-xs">
              <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
                <span>Showing</span>
                <span className="font-bold text-gray-800 dark:text-white">{leadPageStart}</span>
                <span>to</span>
                <span className="font-bold text-gray-800 dark:text-white">{leadPageEnd}</span>
                <span>of</span>
                <span className="font-bold text-gray-800 dark:text-white">{leadTotalForPagination}</span>
                <span>leads</span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
                  <span className="hidden xs:inline">Rows per page:</span>
                  <select
                    value={leadsPerPage}
                    onChange={(e) => {
                      setLeadsPerPage(Number(e.target.value));
                      setLeadPage(1);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    aria-label="Leads per page"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLeadPage((p) => Math.max(1, p - 1))}
                    disabled={safeLeadPage <= 1}
                    className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                    title="Previous Page"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: leadPageCount }, (_, i) => i + 1)
                    .filter((page) => {
                      if (leadPageCount <= 5) return true;
                      if (page === 1 || page === leadPageCount) return true;
                      return Math.abs(page - safeLeadPage) <= 1;
                    })
                    .reduce((acc, page, idx, arr) => {
                      if (idx > 0 && page - arr[idx - 1] > 1) {
                        acc.push("...");
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${item}`}
                          type="button"
                          onClick={() => setLeadPage(item)}
                          className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition ${
                            safeLeadPage === item
                              ? "bg-orange-600 text-white shadow-2xs"
                              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    onClick={() => setLeadPage((p) => Math.min(leadPageCount, p + 1))}
                    disabled={safeLeadPage >= leadPageCount}
                    className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                    title="Next Page"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
      )}

      {viewMode === "pipeline" && (
        <>
        {isPipelineLoading && visiblePipelineDeals.length === 0 ? (
          <PipelineSkeleton />
        ) : (
        <div className={`grid grid-cols-1 ${statusFilter === "lost" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"} gap-3`}>
          {(statusFilter === "lost"
            ? [{ id: "closed_lost", label: "Closed Lost Deals", color: "bg-rose-500" }]
            : PIPELINE_STAGES
          ).map((col) => {
            const colDeals = paginatedPipelineDeals.filter(
              (d) =>
                (d.pipeline_stage || "contacted") === col.id &&
                (dateFilter === "all" || matchesDateFilter(d, "created_at") || matchesDateFilter(d, "updated_at"))
            );
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
                  Rs. {colTotal.toLocaleString("en-IN")}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                  {colDeals.map((deal) => {
                    const dealFollowUps = followUps
                      .filter((item) => item.deal_id === deal.id && item.status === "pending")
                      .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime());
                    const nextFollowUp = dealFollowUps[0];
                    const nextMeeting = salesMeetings
                      .filter((item) => item.deal_id === deal.id && !["cancelled", "completed", "no_show"].includes(item.status))
                      .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())[0];
                    const latestQuotation = getLatestLinkedDoc([...proposals, ...quotations], deal);
                    const latestAgreement = getLatestLinkedDoc(agreements, deal);
                    const latestInvoice = getLatestLinkedDoc(invoices, deal);
                    const docBadges = [
                      getDocStatusBadge("Quotation", latestQuotation),
                      getDocStatusBadge("Agreement", latestAgreement),
                      getDocStatusBadge("Invoice", latestInvoice),
                    ].filter(Boolean);

                    const lead = leads.find((item) => item.id === deal.lead_id);
                    const clientName = lead?.name || deal.title?.split(" - ")[0] || deal.title || "Deal";
                    const serviceName = deal.service || lead?.service || deal.title?.split(" - ")[1] || "Tech Development";
                    const dealInitials = clientName
                      .split(" ")
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "DL";

                    const isMetaLead = Boolean(
                      lead?.source?.toLowerCase().includes("meta") ||
                      lead?.source?.toLowerCase().includes("instagram") ||
                      deal.notes?.toLowerCase().includes("meta") ||
                      deal.notes?.toLowerCase().includes("instagram")
                    );
                    const isInstagram = Boolean(
                      lead?.source?.toLowerCase().includes("instagram") ||
                      deal.notes?.toLowerCase().includes("instagram")
                    );

                    const isDefaultNote = !deal.notes || [
                      "converted lead",
                      "created from lead",
                    ].some((kw) => deal.notes.toLowerCase().includes(kw));
                    const customNotes = !isDefaultNote ? deal.notes : null;

                    const meetingDateStr = nextMeeting?.scheduled_at
                      ? new Date(nextMeeting.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
                        ", " +
                        new Date(nextMeeting.scheduled_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
                      : null;

                    const followUpDateStr = nextFollowUp?.due_at
                      ? new Date(nextFollowUp.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
                        ", " +
                        new Date(nextFollowUp.due_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
                      : null;

                    return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDraggedDealId(deal.id)}
                      onDragEnd={() => setDraggedDealId(null)}
                      className="group relative p-2.5 rounded-xl bg-white dark:bg-[#1a1711] border border-gray-200/90 dark:border-[#382f20] hover:border-orange-500/80 hover:shadow-xs transition-all duration-150 space-y-2 cursor-grab active:cursor-grabbing"
                    >
                      {/* 1. Header: Avatar + Client Name + Value */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 text-white text-[9px] font-black flex items-center justify-center shrink-0 uppercase tracking-tighter shadow-2xs">
                            {dealInitials}
                          </span>
                          <span className="font-bold text-xs text-gray-900 dark:text-white truncate" title={clientName}>
                            {clientName}
                          </span>
                          {deal._optimistic && (
                            <span className="text-[8px] font-bold text-amber-600 animate-pulse shrink-0">●</span>
                          )}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-black shrink-0 tracking-tight ${
                          col.id === "closed_won"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40"
                            : "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/40"
                        }`}>
                          ₹{(Number(deal.deal_value) || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* 2. Service & Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-300 truncate max-w-[140px]">
                          {serviceName}
                        </span>
                        {isMetaLead && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-200/50">
                            {isInstagram ? "IG" : "Meta"}
                          </span>
                        )}
                        {docBadges.map((badge) => (
                          <span
                            key={badge.label}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize ${badge.tone}`}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>

                      {/* 3. Action / Status Highlight (Single Compact Row) */}
                      {col.id === "closed_won" ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">Won · Client & Project Active</span>
                        </div>
                      ) : col.id === "closed_lost" ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-200/40 line-clamp-1" title={deal.loss_reason}>
                          <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{deal.loss_reason || "Deal dropped"}</span>
                        </div>
                      ) : meetingDateStr ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/30 px-2 py-1 rounded-lg border border-blue-200/40">
                          <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">Meet: {meetingDateStr}</span>
                        </div>
                      ) : followUpDateStr ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-200/40">
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">Follow-up: {followUpDateStr}</span>
                        </div>
                      ) : customNotes ? (
                        <div className="text-[10px] text-gray-500 dark:text-neutral-400 line-clamp-1 px-1 italic">
                          {customNotes}
                        </div>
                      ) : null}

                      {/* 4. Action Toolbar */}
                      <div className="pt-1.5 border-t border-gray-100 dark:border-[#2e2619] space-y-1.5">
                        {col.id !== "closed_won" && col.id !== "closed_lost" ? (
                          <>
                            <div className="flex items-center justify-between gap-1 min-w-0">
                              <select
                                value={deal.pipeline_stage || "contacted"}
                                onChange={(e) => handleDealStageChange(deal, e.target.value, col.id)}
                                className="text-[9.5px] font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-1 py-0.5 text-gray-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer max-w-[76px] shrink truncate"
                              >
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Meeting</option>
                                <option value="proposal">Quotation</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="closed_won">Won</option>
                                <option value="closed_lost">Lost</option>
                              </select>

                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openPipelineFollowUpModal(deal)}
                                  className="p-1 rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200/40 shrink-0 transition cursor-pointer"
                                  title="Add Follow-up"
                                >
                                  <Clock className="w-3 h-3 shrink-0" />
                                </button>

                                {col.id === "contacted" && (
                                  <button
                                    type="button"
                                    onClick={() => openMeetingWhatsApp(deal)}
                                    className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                                    title="Send WhatsApp confirmation"
                                  >
                                    <WhatsAppIcon className="w-3 h-3 shrink-0" />
                                  </button>
                                )}

                                {col.id === "proposal" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openCommercialModal("proposal", deal)}
                                      className="p-1 rounded-md text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 border border-orange-200/40 shrink-0 transition cursor-pointer"
                                      title="Open Quotation"
                                    >
                                      <FileText className="w-3 h-3 shrink-0" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => sendDealDocWhatsApp(deal)}
                                      className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                                      title="Share Quotation on WhatsApp"
                                    >
                                      <WhatsAppIcon className="w-3 h-3 shrink-0" />
                                    </button>
                                  </>
                                )}

                                {col.id === "negotiation" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openCommercialModal("agreement", deal)}
                                      className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200/40 shrink-0 transition cursor-pointer"
                                      title="Create / Open Agreement"
                                    >
                                      <FileText className="w-3 h-3 shrink-0" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openInvoiceModal(deal)}
                                      className="p-1 rounded-md text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200/40 shrink-0 transition cursor-pointer"
                                      title="Generate / Open Invoice"
                                    >
                                      <DollarSign className="w-3 h-3 shrink-0" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => sendDealDocWhatsApp(deal)}
                                      className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                                      title="Share Agreement / Invoice on WhatsApp"
                                    >
                                      <WhatsAppIcon className="w-3 h-3 shrink-0" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        ) : col.id === "closed_won" ? (
                          <div className="w-full flex items-center justify-between text-[10px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              <span>Client Active</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => onNavigateSection?.("projects")}
                              className="text-[9.5px] font-bold text-gray-500 hover:text-emerald-600 dark:text-neutral-400 flex items-center gap-0.5 transition cursor-pointer"
                            >
                              <span>View Project</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between text-[10px]">
                            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Closed Lost</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDealStageChange(deal, "contacted", col.id)}
                              className="text-[9.5px] font-bold text-blue-600 hover:underline transition cursor-pointer"
                            >
                              Re-open
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        )}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] text-xs shadow-2xs">
          <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
            <span>Showing</span>
            <span className="font-bold text-gray-800 dark:text-white">{pipelinePageStart}</span>
            <span>to</span>
            <span className="font-bold text-gray-800 dark:text-white">{pipelinePageEnd}</span>
            <span>of</span>
            <span className="font-bold text-gray-800 dark:text-white">{pipelineTotal}</span>
            <span>deals</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
              <span className="hidden xs:inline">Deals per page:</span>
              <select
                value={pipelinePageSize}
                onChange={(e) => {
                  setPipelinePageSize(Number(e.target.value));
                  setPipelinePage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                aria-label="Pipeline deals per page"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPipelinePage((p) => Math.max(1, p - 1))}
                disabled={safePipelinePage <= 1}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: pipelinePageCount }, (_, i) => i + 1)
                .filter((page) => {
                  if (pipelinePageCount <= 5) return true;
                  if (page === 1 || page === pipelinePageCount) return true;
                  return Math.abs(page - safePipelinePage) <= 1;
                })
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${item}`}
                      type="button"
                      onClick={() => setPipelinePage(item)}
                      className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition ${
                        safePipelinePage === item
                          ? "bg-orange-600 text-white shadow-2xs"
                          : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                type="button"
                onClick={() => setPipelinePage((p) => Math.min(pipelinePageCount, p + 1))}
                disabled={safePipelinePage >= pipelinePageCount}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {viewMode === "commercials" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ["proposal", "New Quotation", "Scope, deliverables, price, tax"],
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
                No quotation or agreement found.
              </div>
            ) : (
              <div className="overflow-x-auto table-scroll">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[860px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Document</th>
                      <th className="py-3 px-4">Deal</th>
                      <th className="py-3 px-4">Value / Terms</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                    {commercialDocs.map((doc) => {
                      const deal = deals.find((item) => item.id === doc.deal_id);
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
                            <div className="font-semibold text-gray-900 dark:text-white">{deal?.title || "Linked Deal"}</div>
                            <div className="text-[11px] text-gray-500">{deal?.pipeline_stage || "Pipeline deal"}</div>
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
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => sendDocWhatsApp(doc, doc.docType)}
                                className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/50 dark:border-emerald-800/40 transition shrink-0 cursor-pointer"
                                title="Send on WhatsApp"
                                aria-label="Send on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </button>
                              {!isFinal && (
                                <>
                                  <button
                                    onClick={() => {
                                      if (doc.docType === "agreement") onUpdateAgreement?.(doc.id, { status: "signed", signed_at: new Date().toISOString() });
                                      else if (doc.quotation_number) onUpdateQuotation?.(doc.id, { status: "accepted" });
                                      else onUpdateProposal?.(doc.id, { status: "accepted", accepted_at: new Date().toISOString() });
                                    }}
                                    className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                                    title={doc.docType === "agreement" ? "Sign Agreement" : "Accept Document"}
                                    aria-label={doc.docType === "agreement" ? "Sign Agreement" : "Accept Document"}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (doc.docType === "agreement") onUpdateAgreement?.(doc.id, { status: "cancelled" });
                                      else if (doc.quotation_number) onUpdateQuotation?.(doc.id, { status: "declined" });
                                      else onUpdateProposal?.(doc.id, { status: "rejected" });
                                    }}
                                    className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                                    title="Reject / Cancel"
                                    aria-label="Reject / Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
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
        </div>
      )}

      {viewMode === "followups" && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          {isFollowUpsLoading && paginatedFollowUps.length === 0 ? (
            <TableSkeleton rows={6} columns={6} />
          ) : filteredFollowUps.length === 0 ? (
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
                  {paginatedFollowUps.map((item) => {
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
                          <div className="flex items-center justify-end gap-1.5">
                            {contactPhone && (
                              <button
                                onClick={() => {
                                  const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
                                  const text = encodeURIComponent(getFollowUpWhatsappMessage(item, lead, client));
                                  window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0"
                                title="Chat on WhatsApp"
                                aria-label="Chat on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
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
                              className="p-1.5 rounded-lg text-gray-700 dark:text-neutral-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition shrink-0"
                              title="Add to Google Calendar"
                              aria-label="Add to Google Calendar"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </a>
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => onUpdateFollowUp?.(item.id, { status: "done", completed_at: new Date().toISOString() })}
                                  className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0"
                                  title="Mark as Done"
                                  aria-label="Mark as Done"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onUpdateFollowUp?.(item.id, { status: "missed", notes: [item.notes, `Missed at ${new Date().toLocaleString("en-IN")}`].filter(Boolean).join("\n") })}
                                  className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0"
                                  title="Mark as Missed"
                                  aria-label="Mark as Missed"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {["pending", "missed"].includes(item.status) && (
                              <button
                                onClick={() => openRescheduleModal(item)}
                                className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition shrink-0"
                                title="Reschedule Follow-up"
                                aria-label="Reschedule Follow-up"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#211d14]/60 text-xs">
                <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
                  <span>Showing</span>
                  <span className="font-bold text-gray-800 dark:text-white">{followUpPageStart}</span>
                  <span>to</span>
                  <span className="font-bold text-gray-800 dark:text-white">{followUpPageEnd}</span>
                  <span>of</span>
                  <span className="font-bold text-gray-800 dark:text-white">{followUpTotal}</span>
                  <span>follow-ups</span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
                    <span className="hidden xs:inline">Rows per page:</span>
                    <select
                      value={followUpPageSize}
                      onChange={(e) => {
                        setFollowUpPageSize(Number(e.target.value));
                        setFollowUpPage(1);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                      aria-label="Follow-ups per page"
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFollowUpPage((p) => Math.max(1, p - 1))}
                      disabled={safeFollowUpPage <= 1}
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      title="Previous Page"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {Array.from({ length: followUpPageCount }, (_, i) => i + 1)
                      .filter((page) => {
                        if (followUpPageCount <= 5) return true;
                        if (page === 1 || page === followUpPageCount) return true;
                        return Math.abs(page - safeFollowUpPage) <= 1;
                      })
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          acc.push("...");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${item}`}
                            type="button"
                            onClick={() => setFollowUpPage(item)}
                            className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition ${
                              safeFollowUpPage === item
                                ? "bg-orange-600 text-white shadow-2xs"
                                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      type="button"
                      onClick={() => setFollowUpPage((p) => Math.min(followUpPageCount, p + 1))}
                      disabled={safeFollowUpPage >= followUpPageCount}
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      title="Next Page"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === "sales_meetings" && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          {isMeetingsLoading && filteredSalesMeetings.length === 0 ? (
            <TableSkeleton rows={6} columns={6} />
          ) : filteredSalesMeetings.length === 0 ? (
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
                        <td className="py-3.5 px-4 text-gray-500 text-xs">{new Date(item.scheduled_at).toLocaleString("en-IN")} - {item.duration_minutes || 30}m</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.status === "completed" ? "bg-emerald-50 text-emerald-600" : item.status === "cancelled" || item.status === "no_show" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                          }`}>{item.status}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {lead?.phone && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleWhatsAppClick(lead)}
                                  className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0"
                                  title="Chat on WhatsApp"
                                  aria-label="Chat on WhatsApp"
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="p-1.5 rounded-lg text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition shrink-0"
                                  title="Call Client"
                                  aria-label="Call Client"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}
                            {item.meeting_link && (
                              <a
                                href={item.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition shrink-0"
                                title="Join Meeting"
                                aria-label="Join Meeting"
                              >
                                <Video className="w-3.5 h-3.5" />
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
                              className="p-1.5 rounded-lg text-gray-700 dark:text-neutral-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition shrink-0"
                              title="Open in Google Calendar"
                              aria-label="Open in Google Calendar"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </a>
                            {item.status === "scheduled" && (
                              <>
                                <button
                                  onClick={() => openSalesMeetingRescheduleModal(item)}
                                  className="p-1.5 rounded-lg text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition shrink-0"
                                  title="Reschedule Meeting"
                                  aria-label="Reschedule Meeting"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onUpdateSalesMeeting?.(item.id, { status: "completed", outcome: item.outcome || "Meeting completed. Follow-up required." })}
                                  className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0"
                                  title="Mark as Completed"
                                  aria-label="Mark as Completed"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onUpdateSalesMeeting?.(item.id, { status: "no_show", outcome: "Client did not join. Reschedule follow-up required." })}
                                  className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0"
                                  title="Mark as No Show"
                                  aria-label="Mark as No Show"
                                >
                                  <X className="w-3.5 h-3.5" />
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/40 dark:bg-[#211d14]/40 text-xs">
                <div className="text-gray-500 dark:text-neutral-400">
                  {meetingPagination?.loading ? "Loading meetings..." : (
                    <>Showing meeting page <span className="font-bold text-gray-800 dark:text-white">{safeMeetingPage}</span> of <span className="font-bold text-gray-800 dark:text-white">{meetingPageCount}</span> ({meetingTotal} meetings)</>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <select value={meetingPageSize} onChange={(e) => setMeetingPageSize(Number(e.target.value))} className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200" aria-label="Meetings per page">
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <button type="button" onClick={() => setMeetingPage((page) => Math.max(1, page - 1))} disabled={safeMeetingPage <= 1} className="px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed">
                    Prev
                  </button>
                  <button type="button" onClick={() => setMeetingPage((page) => Math.min(meetingPageCount, page + 1))} disabled={safeMeetingPage >= meetingPageCount} className="px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Lead Detail Drawer / Modal with Activity Timeline */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[92vh] rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] p-5 pb-3 shrink-0">
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

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs">
              <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-2">
                Form Answers
              </span>
              {getLeadFormAnswers(selectedLead).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getLeadFormAnswers(selectedLead).map((answer) => (
                    <div
                      key={answer.label}
                      className="rounded-lg border border-gray-100 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-2 min-w-0"
                    >
                      <span className="text-[10px] text-gray-400 block truncate" title={answer.label}>
                        {answer.label}
                      </span>
                      <span
                        className="font-semibold text-gray-800 dark:text-white block truncate"
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

            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] shrink-0">
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
                  <input
                    type="text"
                    value={newLeadForm.service}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                    placeholder="Customer filled service"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  />
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
                  <div className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200">
                    Contacted
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Service
                  </label>
                  <input
                    type="text"
                    value={newDealForm.service}
                    onChange={(e) => setNewDealForm({ ...newDealForm, service: e.target.value })}
                    required
                    placeholder="Customer filled service"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  />
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

              <div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Linked Lead</label>
                  {newDealForm.lead_id ? (
                    <div className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-200 font-semibold">
                      {leads.find((l) => l.id === newDealForm.lead_id)?.name || "Selected lead"} - read only
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
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Sales Quotation / Agreement</h3>
                <p className="text-[11px] text-gray-400">Quotation is the Sales document; agreement is final signing before deal won.</p>
              </div>
              <button type="button" onClick={() => setShowCommercialModal(false)} className="p-1 rounded-lg text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs">
              {[
                ["proposal", "Quotation"],
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
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Linked Deal *</label>
                <div className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-200 font-semibold">
                  {deals.find((deal) => deal.id === commercialForm.deal_id)?.title || "No deal available"}
                </div>
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
                    <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Quotation Ref</label>
                    <select
                      value={commercialForm.proposal_id}
                      onChange={(e) => setCommercialForm({ ...commercialForm, proposal_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                    >
                      <option value="">No quotation ref</option>
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

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowCommercialModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm cursor-pointer shrink-0"
              >
                Save {commercialType === "agreement" ? "Agreement" : "Quotation"}
              </button>
              <button
                type="button"
                onClick={(e) => handleCreateCommercialSubmit(e, true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Save & WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sales Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateInvoiceSubmit}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Generate Sales Invoice</h3>
                  <p className="text-[11px] text-gray-400">Create and issue an official tax invoice linked to this pipeline deal.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Linked Deal Context Card */}
            {invoiceDeal && (
              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Linked Deal</div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">
                    {invoiceDeal.title || invoiceDeal.client_name || "Client Deal"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400">Deal Value</div>
                  <div className="font-black text-xs text-purple-700 dark:text-purple-300">
                    ₹{Number(invoiceDeal.deal_value || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.invoice_number}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Milestone Stage</label>
                <select
                  value={invoiceForm.milestone_type}
                  onChange={(e) => handleInvoiceMilestoneChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  <option value="advance">Advance (40%)</option>
                  <option value="milestone">Sprint Milestone (30%)</option>
                  <option value="final">Final Delivery (30%)</option>
                  <option value="full">Full Payment (100%)</option>
                  <option value="monthly_retainer">Monthly Retainer</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Invoice Title / Description *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.title}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Subtotal (Excl. Tax) ₹ *</label>
                <input
                  type="number"
                  required
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              {/* Tax & Total Calculation Summary */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200/70 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-neutral-400">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-semibold">₹{(Number(invoiceForm.amount) || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-neutral-400">
                  <span>GST (18% Standard):</span>
                  <span className="font-mono font-semibold">₹{Math.round((Number(invoiceForm.amount) || 0) * 0.18).toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                  <span>Total Invoiced (Inc. Tax):</span>
                  <span className="font-mono text-sm text-purple-600 dark:text-purple-400">
                    ₹{Math.round((Number(invoiceForm.amount) || 0) * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Notes & Payment Terms</label>
                <textarea
                  rows={2}
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                <span>Issue Invoice</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleCreateInvoiceSubmit(e, true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Issue & WhatsApp</span>
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
              {followUpForm.deal_id && (
                <div className="sm:col-span-2">
                  <label className="block font-medium mb-1">Linked Pipeline Deal</label>
                  <div className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-200 font-semibold">
                    {deals.find((deal) => deal.id === followUpForm.deal_id)?.title || "Selected pipeline deal"} - read only
                  </div>
                </div>
              )}
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
                <label className="block font-medium mb-1">Meeting Type</label>
                <select value={salesMeetingForm.meeting_type} onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, meeting_type: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <option value="discovery">Discovery</option>
                  <option value="requirement">Requirement</option>
                  <option value="proposal">Quotation</option>
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
                  <input
                    type="text"
                    value={editLeadForm.service}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, service: e.target.value })}
                    placeholder="Customer filled service"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden"
                  />
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
                    { id: "contacted", label: "Contact", desc: "First Call / Outreach" },
                    { id: "meeting", label: "Meeting", desc: "Post Discovery / Demo" },
                    { id: "proposal", label: "Quotation", desc: "Quotation Sent" },
                    { id: "negotiation", label: "Negotiation", desc: "Final Terms" },
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

