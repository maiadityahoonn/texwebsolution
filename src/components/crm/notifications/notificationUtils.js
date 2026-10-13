import {
  Bell,
  Calendar,
  Phone,
  Target,
  Briefcase,
  MessageSquare,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export function resolveNotificationUrl(
  item,
  { salesMeetings = [], salesFollowUps = [], leads = [] } = {}
) {
  if (!item) return "/crm/leads";

  const rawUrl = String(item.link_url || "").trim();
  const title = String(item.title || "").toLowerCase();
  const message = String(item.message || "");
  const metadata = item.metadata || {};
  const sourceType = String(metadata.source_type || metadata.sourceType || "").toLowerCase();
  const sourceId = metadata.source_id || metadata.sourceId || metadata.meeting_id || metadata.followup_id || metadata.lead_id || "";

  // 1. Honor only current CRM links. Legacy workspace URLs are ignored.
  if (rawUrl.startsWith("/crm/") || rawUrl === "/crm") {
    let clean = rawUrl;
    if (sourceId && !clean.includes("highlight=")) {
      clean += clean.includes("?") ? `&highlight=${sourceId}` : `?highlight=${sourceId}`;
    }
    return clean;
  }

  // 2. Meeting notifications
  if (sourceType === "sales_meeting" || item.type === "meeting" || title.includes("meeting")) {
    if (sourceId) return `/crm/meetings?highlight=${sourceId}`;
    const match = message.match(/Client meeting:\s*([^-\n]+)/i) || message.match(/meeting with:\s*([^-\n]+)/i) || title.match(/meeting:\s*([^-\n]+)/i);
    const candidate = match ? match[1].trim() : "";
    if (candidate) {
      const found = salesMeetings.find((m) => m.title && m.title.toLowerCase().includes(candidate.toLowerCase()));
      if (found?.id) return `/crm/meetings?highlight=${found.id}`;
      return `/crm/meetings?highlight=${encodeURIComponent(candidate)}`;
    }
    return "/crm/meetings";
  }

  // 3. Follow-up notifications
  if (sourceType === "sales_followup" || item.type === "followup" || title.includes("follow-up") || title.includes("followup")) {
    if (sourceId) return `/crm/followups?highlight=${sourceId}`;
    const match = message.match(/Follow up:\s*([^is\n]+)/i) || title.match(/follow up:\s*([^is\n]+)/i);
    const candidate = match ? match[1].trim() : "";
    if (candidate) {
      const found = salesFollowUps.find((f) => f.title && f.title.toLowerCase().includes(candidate.toLowerCase()));
      if (found?.id) return `/crm/followups?highlight=${found.id}`;
      return `/crm/followups?highlight=${encodeURIComponent(candidate)}`;
    }
    return "/crm/followups";
  }

  // 4. Lead notifications
  if (item.type === "lead" || title.includes("lead")) {
    if (sourceId) return `/crm/leads?highlight=${sourceId}`;
    return "/crm/leads";
  }

  // 5. Default fallbacks
  if (item.type === "project" || item.type === "task") return "/projects";
  if (item.type === "message" || item.type === "chat") return "/crm/chat";
  if (item.type === "finance" || item.type === "invoice") return "/crm/invoices";
  if (item.type === "smm" || item.type === "support") return "/crm/dashboard";

  return "/crm/leads";
}

export function getCategoryIcon(item) {
  const type = String(item.type || "").toLowerCase();
  const title = String(item.title || "").toLowerCase();
  const sourceType = String(item.metadata?.source_type || "").toLowerCase();

  if (sourceType === "sales_meeting" || type === "meeting" || title.includes("meeting")) return Calendar;
  if (sourceType === "sales_followup" || type === "followup" || title.includes("follow-up") || title.includes("followup")) return Phone;
  if (type === "lead" || title.includes("lead")) return Target;
  if (type === "task" || type === "project") return Briefcase;
  if (type === "message" || type === "chat") return MessageSquare;
  if (type === "finance" || type === "invoice") return CreditCard;
  if (type === "alert") return AlertCircle;
  return Bell;
}

export function getCategoryBadgeStyle(item) {
  const type = String(item.type || "").toLowerCase();
  const title = String(item.title || "").toLowerCase();
  const sourceType = String(item.metadata?.source_type || "").toLowerCase();

  if (sourceType === "sales_meeting" || type === "meeting" || title.includes("meeting")) {
    return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
  }
  if (sourceType === "sales_followup" || type === "followup" || title.includes("follow-up") || title.includes("followup")) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
  if (type === "lead" || title.includes("lead")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (type === "alert") {
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  }
  return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
}

export function getCategoryLabel(item) {
  const type = String(item.type || "").toLowerCase();
  const title = String(item.title || "").toLowerCase();
  const sourceType = String(item.metadata?.source_type || "").toLowerCase();

  if (sourceType === "sales_meeting" || type === "meeting" || title.includes("meeting")) return "Meeting";
  if (sourceType === "sales_followup" || type === "followup" || title.includes("follow-up") || title.includes("followup")) return "Follow-up";
  if (type === "lead" || title.includes("lead")) return "Lead";
  if (type === "task") return "Task";
  if (type === "project") return "Project";
  if (type === "message") return "Chat";
  if (type === "finance" || type === "invoice") return "Finance";
  return item.type ? String(item.type).toUpperCase() : "Alert";
}

export function getActionLabel(item) {
  const type = String(item.type || "").toLowerCase();
  const title = String(item.title || "").toLowerCase();
  const sourceType = String(item.metadata?.source_type || "").toLowerCase();

  if (sourceType === "sales_meeting" || type === "meeting" || title.includes("meeting")) return "Open Meeting";
  if (sourceType === "sales_followup" || type === "followup" || title.includes("follow-up") || title.includes("followup")) return "Open Follow-up";
  if (type === "lead" || title.includes("lead")) return "Open Lead";
  return "Open Row";
}

export function formatRelativeTime(dateValue) {
  if (!dateValue) return "Recently";
  const date = new Date(dateValue);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
