export const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Administrator",
  team_leader: "Delivery Lead",
  mentor: "Operations Lead",
  hr: "HR Manager",
  intern: "Developer Intern",
  sales_head: "Sales Head",
  sales_executive: "Sales Executive",
  telecaller: "Telecaller",
  tech_lead: "Tech Lead",
  pm: "Project Manager",
  smm_head: "SMM Head",
  finance_head: "Finance Head",
  support_head: "Support Head",
};

export const BUSINESS_DEPARTMENT_HEADS = [
  { key: "sales", name: "Priyank Patel", role: "Sales Head", section: "crm" },
  { key: "tech", name: "Aditya Kumar Gupta", role: "Tech Lead", section: "projects" },
  { key: "hr", name: "Shashank Suman", role: "HR", section: "members" },
  { key: "smm", name: "Thakur Kumar", role: "SMM Head", section: "smm" },
];

export const BUSINESS_FLOW_STEPS = [
  "Automatic lead capture",
  "Sales qualification",
  "Closed Won",
  "Client account",
  "Project creation",
  "Tech assignment",
  "Client visibility",
  "Support & growth",
];

export const DOMAIN_OPTIONS = [
  { value: "frontend_dev", label: "Frontend Development" },
  { value: "backend_dev", label: "Backend Development" },
  { value: "web_dev", label: "Web Development (Full Stack)" },
  { value: "telecaller", label: "Telecaller & Inside Sales" },
  { value: "sales_executive", label: "Sales Executive & Client Relations" },
  { value: "marketing", label: "Digital Marketing & SEO" },
  { value: "video_editing", label: "Video Editing & Motion Graphics" },
  { value: "script_writing", label: "Script Writing & Content Creation" },
  { value: "ai_automation", label: "AI Automation & Chatbots" },
  { value: "design", label: "UI / UX Design & Branding" },
  { value: "management", label: "Operations & HR" },
  { value: "sales", label: "Client Sales & CRM" },
];

export function domainLabel(value) {
  if (value === "digital_marketing") return "Digital Marketing & SEO";
  return DOMAIN_OPTIONS.find((item) => item.value === value)?.label || value || "General";
}

export function profileDepartmentLabel(profile) {
  if (!profile) return "All Departments";
  if (profile.role === "super_admin" || profile.role === "admin") return "All Departments";
  if (profile.role === "hr") return "HR Management";
  if (["sales_head", "sales_executive", "telecaller"].includes(profile.role)) return "Sales & CRM";
  if (["tech_lead", "pm"].includes(profile.role)) return "Engineering & Tech";
  if (profile.role === "smm_head") return "Digital Marketing & SMM";
  if (profile.role === "finance_head") return "Finance & Accounts";
  if (profile.role === "support_head") return "Customer Support & SLA";
  return domainLabel(profile.domain);
}

export function localDate(value) {
  if (!value) return "Open";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function localDateInputPart(value) {
  return String(value || "").slice(0, 10);
}

export function localTimeInputPart(value) {
  return String(value || "").slice(11, 16);
}

export const WORKSPACE_TIME_HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
export const WORKSPACE_TIME_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

export function localTimeParts12(value) {
  const [hourRaw = "10", minuteRaw = "00"] = localTimeInputPart(value).split(":");
  const hour24 = Math.min(23, Math.max(0, Number.parseInt(hourRaw, 10) || 10));
  const minute = Math.min(59, Math.max(0, Number.parseInt(minuteRaw, 10) || 0));
  return {
    hour: String(hour24 % 12 || 12).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
    meridiem: hour24 >= 12 ? "PM" : "AM",
  };
}

export function buildLocalTimeFrom12Hour(hour, minute, meridiem) {
  let nextHour = Math.min(12, Math.max(1, Number.parseInt(hour, 10) || 10));
  const nextMinute = Math.min(59, Math.max(0, Number.parseInt(minute, 10) || 0));
  if (meridiem === "PM" && nextHour !== 12) nextHour += 12;
  if (meridiem === "AM" && nextHour === 12) nextHour = 0;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

export function combineLocalDateTimeInput(currentValue, part, nextValue) {
  const today = new Date();
  const fallbackDate = today.toISOString().slice(0, 10);
  const date = part === "date" ? nextValue : localDateInputPart(currentValue) || fallbackDate;
  const time = part === "time" ? nextValue : localTimeInputPart(currentValue) || "10:00";
  return `${date || fallbackDate}T${time || "10:00"}`;
}

export function combineLocalTime12Parts(currentValue, patch) {
  const current = localTimeParts12(currentValue);
  const next = { ...current, ...patch };
  return combineLocalDateTimeInput(currentValue, "time", buildLocalTimeFrom12Hour(next.hour, next.minute, next.meridiem));
}

export function deadlineState(task) {
  if (!task?.deadline) return "Upcoming";
  if (["approved", "completed"].includes(task.status)) return "Completed";
  const today = new Date();
  const due = new Date(task.deadline);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const diffDays = Math.round((dueStart - todayStart) / 86_400_000);
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due Today";
  if (diffDays === 1) return "Due Tomorrow";
  return "Upcoming";
}

export function createTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const values = crypto.getRandomValues(new Uint32Array(18));
    return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  }
  return `TexWeb@${Date.now().toString(36)}${Math.floor(100000 + Math.random() * 900000)}`;
}

export const SECTION_META = {
  overview: {
    title: "Dashboard",
    descAdmin: "Overview of HR managers, training batches, and recent activity.",
    descUser: "Overview of team members, tasks, and updates.",
  },
  crm: { title: "Leads", desc: "Track website inquiries, lead statuses, WhatsApp outreach, and qualification." },
  pipeline: { title: "Sales Pipeline", desc: "Open Kanban pipeline for meetings, quotations, and negotiation." },
  sales_followups: { title: "Sales Follow-ups", desc: "Schedule calls, WhatsApp reminders, and sales next actions." },
  sales_meetings: { title: "Sales Meetings", desc: "Plan discovery, requirement, quotation, and negotiation meetings." },
  sales_reports: { title: "Sales Reports", desc: "Review source ROI, stale deals, follow-up performance, and sales AI insights." },
  sales_commercials: { title: "Quotation", desc: "Create and track sales quotations linked with pipeline deals." },
  agreements: { title: "Client Agreements", desc: "Manage final client agreement terms, milestones, and signed status." },
  clients: { title: "Client Accounts", desc: "Central client directory with connected deals, projects, invoices, and support." },
  projects: { title: "Projects & Delivery", desc: "Manage development sprint delivery, QA checklists, and deployment handovers." },
  smm: { title: "SMM Clients", desc: "Oversee marketing retainers, social accounts, and campaign deliverable timelines." },
  content_calendar: { title: "Content Calendar", desc: "Multi-stage content approval workflow: draft, review, client approval, and publish." },
  invoices: { title: "Sales Invoices", desc: "Sales-owned milestone invoices and GST billing before project handover." },
  payments: { title: "Sales Payments", desc: "Track paid invoices, settlement references, and collected revenue." },
  support: { title: "Client Support", desc: "Client maintenance tickets, SLA resolution, and handover management." },
  batches: {
    title: "Batches",
    descAdmin: "Create batches and assign HR managers.",
    descUser: "View and manage cohorts assigned to you.",
  },
  batch_files: { title: "Batch Files", desc: "Access technical guides, resources, and documents." },
  tasks: { title: "Tasks", desc: "Track project deliverables, deadlines, and assignments." },
  task_submissions: { title: "Task Submissions", desc: "Inspect submitted deliverables and grade student assignments." },
  review_center: { title: "Supervisor Review", desc: "Review batch escalations, critical roadblocks, and alerts." },
  at_risk_watchlist: { title: "At-Risk Watchlist", desc: "Monitor students with low attendance or pending tasks." },
  classes: { title: "Classes & Meetings", desc: "Join scheduled live sessions and Google Meet classes." },
  daily_updates: { title: "Daily Updates", desc: "Track daily standup progress, blockers, and comments." },
  members: {
    titleAdmin: "HR Managers",
    titleUser: "Team Members",
    descAdmin: "Manage HR manager accounts across the workspace.",
    descUser: "Directory of mentors, team leaders, and students.",
  },
  hr_mentors: { title: "Supervising Mentors", desc: "Oversee domain mentors and active cohort assignments." },
  hr_interns: { title: "Enrolled Interns", desc: "Monitor student profiles, assigned cohorts, and progress." },
  attendance: { title: "Attendance", desc: "Track session participation and attendance records." },
  certificates: { title: "Certificates", desc: "Generate and issue verified completion credentials." },
  cms: { title: "Website Content", desc: "Manage website content, banners, and published courses." },
  alerts: { title: "Notifications", desc: "Recent notifications, announcements, and priority updates." },
  chat: { title: "Chat", desc: "Direct and batch messaging with team members." },
  settings: { title: "Profile & Settings", desc: "Manage your personal profile, credentials, and settings." },
  batch_workspace: { title: "Batch Workspace", desc: "Collaborative workspace for tasks, files, and updates." },
  audit: { title: "Activity Logs", desc: "Recent activity logs and security history." },
};

export function WhatsAppIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.972.531 1.777.817 2.796.817 3.18 0 5.767-2.587 5.767-5.768.001-3.181-2.584-5.767-5.767-5.767zm3.364 8.163c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.072-.497-1.756-.728-2.883-2.518-2.97-2.634-.087-.116-.711-.945-.711-1.8 0-.855.449-1.275.609-1.449.16-.174.348-.217.464-.217.116 0 .232.002.333.007.106.005.249-.04.39.299.144.348.492 1.203.535 1.29.043.087.072.189.014.305-.058.116-.087.188-.174.29-.087.102-.183.228-.261.306-.088.087-.179.182-.077.357.102.174.453.747.971 1.209.669.596 1.233.78 1.407.868.174.087.276.072.377-.044.102-.116.435-.508.551-.682.116-.174.232-.145.39-.087.16.058 1.014.478 1.188.565.174.087.29.13.333.203.044.072.044.42-.1.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.178L2 22l4.981-1.306C8.423 21.524 10.158 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.632 0-3.149-.49-4.417-1.332l-.317-.212-2.964.777.791-2.89-.233-.371C3.968 14.869 3.5 13.486 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z" />
    </svg>
  );
}
