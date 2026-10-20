import {
  BarChart3,
  Bell,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Phone,
  ReceiptText,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export const CRM_NAV = [
  { section: "crm", href: "/crm/leads", label: "Leads", icon: Target },
  { section: "pipeline", href: "/crm/pipeline", label: "Sales Pipeline", icon: TrendingUp },
  { section: "sales_followups", href: "/crm/followups", label: "Follow-ups", icon: Phone },
  { section: "sales_meetings", href: "/crm/meetings", label: "Meetings", icon: Calendar },
  { section: "sales_commercials", href: "/crm/quotation", label: "Quotation", icon: FileText },
  { section: "agreements", href: "/crm/agreements", label: "Agreements", icon: ShieldCheck },
  { section: "invoices", href: "/crm/invoices", label: "Invoices", icon: ReceiptText },
  { section: "payments", href: "/crm/payments", label: "Payments", icon: Wallet },
  { section: "clients", href: "/crm/clients", label: "Clients", icon: Users },
  { section: "sales_reports", href: "/crm/reports", label: "Sales Reports", icon: BarChart3 },
  { section: "overview", href: "/crm/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export const SECTION_META = {
  crm: {
    title: "Leads",
    desc: "Track website inquiries, lead qualification, and customer acquisition.",
    tag: "Lead Engine",
    gradient: "from-orange-500 to-amber-600",
    color: "#ea580c",
    colorFrom: "#f97316",
    colorTo: "#ea580c",
    icon: Target,
  },
  pipeline: {
    title: "Sales Pipeline",
    desc: "Move qualified leads from meeting to quotation, negotiation, won, or lost.",
    tag: "Deals & Stages",
    gradient: "from-indigo-600 to-purple-600",
    color: "#4f46e5",
    colorFrom: "#6366f1",
    colorTo: "#4f46e5",
    icon: TrendingUp,
  },
  sales_followups: {
    title: "Follow-ups",
    desc: "Manage scheduled calls, WhatsApp reminders, and reschedules.",
    tag: "Call Schedule",
    gradient: "from-teal-600 to-emerald-600",
    color: "#0d9488",
    colorFrom: "#0d9488",
    colorTo: "#0f766e",
    icon: Phone,
  },
  sales_meetings: {
    title: "Meetings",
    desc: "Track client meetings, agenda, outcomes, and reminders.",
    tag: "Client Calls",
    gradient: "from-blue-600 to-cyan-600",
    color: "#2563eb",
    colorFrom: "#2563eb",
    colorTo: "#1d4ed8",
    icon: Calendar,
  },
  sales_commercials: {
    title: "Quotation",
    desc: "Create and track quotations linked with pipeline deals.",
    tag: "Proposals & Quotes",
    gradient: "from-blue-600 to-indigo-600",
    color: "#0284c7",
    colorFrom: "#0284c7",
    colorTo: "#0369a1",
    icon: FileText,
  },
  agreements: {
    title: "Agreements",
    desc: "Manage client agreements for negotiation and closure.",
    tag: "Contracts & Legal",
    gradient: "from-purple-600 to-fuchsia-600",
    color: "#9333ea",
    colorFrom: "#9333ea",
    colorTo: "#7e22ce",
    icon: ShieldCheck,
  },
  invoices: {
    title: "Invoices",
    desc: "Generate and track deal-linked invoices.",
    tag: "Billing & GST",
    gradient: "from-amber-600 to-orange-600",
    color: "#d97706",
    colorFrom: "#d97706",
    colorTo: "#b45309",
    icon: ReceiptText,
  },
  payments: {
    title: "Payments",
    desc: "Track payment status and revenue collection.",
    tag: "Revenue & Income",
    gradient: "from-emerald-600 to-teal-600",
    color: "#059669",
    colorFrom: "#059669",
    colorTo: "#047857",
    icon: Wallet,
  },
  clients: {
    title: "Clients",
    desc: "Client accounts created after won deals.",
    tag: "Accounts & Clients",
    gradient: "from-rose-600 to-pink-600",
    color: "#e11d48",
    colorFrom: "#e11d48",
    colorTo: "#be123c",
    icon: Users,
  },
  sales_reports: {
    title: "Sales Reports",
    desc: "Conversion, ROI, follow-up, won/lost, and sales performance.",
    tag: "Analytics & ROI",
    gradient: "from-violet-600 to-indigo-600",
    color: "#7c3aed",
    colorFrom: "#7c3aed",
    colorTo: "#6d28d9",
    icon: BarChart3,
  },
  overview: {
    title: "Dashboard",
    desc: "Sales snapshot, reminders, and pipeline health.",
    tag: "Executive View",
    gradient: "from-red-600 to-rose-600",
    color: "#dc2626",
    colorFrom: "#dc2626",
    colorTo: "#b91c1c",
    icon: LayoutDashboard,
  },
  chat: {
    title: "Team Chat",
    desc: "Team conversations and internal client handoff messages.",
    tag: "Communication",
    gradient: "from-emerald-600 to-teal-600",
    color: "#059669",
    colorFrom: "#10b981",
    colorTo: "#059669",
    icon: MessageSquare,
  },
  alerts: {
    title: "Notifications",
    desc: "Reminders, lead alerts, meeting updates, and priority actions.",
    tag: "Alerts",
    gradient: "from-red-600 to-rose-600",
    color: "#dc2626",
    colorFrom: "#ef4444",
    colorTo: "#dc2626",
    icon: Bell,
  },
  settings: {
    title: "Profile & Settings",
    desc: "Manage your profile, password, theme, and account controls.",
    tag: "Account",
    gradient: "from-slate-700 to-slate-900",
    color: "#334155",
    colorFrom: "#475569",
    colorTo: "#1e293b",
    icon: Settings,
  },
};

export function getThemeSnapshot() {
  if (typeof window === "undefined") return "light";
  const saved =
    window.localStorage.getItem("texweb_theme") ||
    window.localStorage.getItem("texweb_workspace_theme");
  return saved === "dark" || saved === "light"
    ? saved
    : document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export function subscribeToThemeChanges(onStoreChange) {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (event) => {
    if (!event.key || event.key === "texweb_theme" || event.key === "texweb_workspace_theme") {
      onStoreChange();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener("texweb-theme-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("texweb-theme-change", onStoreChange);
  };
}

export function sectionFromPath(pathname = "") {
  if (pathname === "/crm/chat" || pathname.startsWith("/crm/chat/")) return "chat";
  if (pathname === "/crm/alerts" || pathname.startsWith("/crm/alerts/")) return "alerts";
  if (pathname === "/crm/settings" || pathname.startsWith("/crm/settings/")) return "settings";
  const match = CRM_NAV.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  return match?.section || "crm";
}
