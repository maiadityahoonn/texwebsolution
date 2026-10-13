export const PIPELINE_STAGES = [
  { id: "contacted", label: "Contacted", color: "bg-cyan-500" },
  { id: "qualified", label: "Meeting", color: "bg-indigo-500" },
  { id: "proposal", label: "Quotation", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-amber-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
];

export const CLOSED_PIPELINE_STAGES = ["closed_won", "closed_lost"];

export const STAGE_LOSS_REASONS = {
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

export const LOSS_REASONS = [
  ...STAGE_LOSS_REASONS.contacted,
  ...STAGE_LOSS_REASONS.meeting,
  ...STAGE_LOSS_REASONS.proposal,
  ...STAGE_LOSS_REASONS.negotiation,
];

export const AI_OBJECTION_HANDLERS = {
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

export function getLeadNextAction(lead, followUps = [], meetings = []) {
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

export function getLeadBudget(lead) {
  if (!lead) return "-";
  if (lead.budget_range) return lead.budget_range;
  if (!lead.notes) return "-";
  const match = lead.notes.match(/Budget:\s*([^|]+)/i);
  return match ? match[1].trim() : "-";
}

export function getLeadLocation(lead) {
  if (!lead) return "-";
  if (lead.city || lead.state) {
    return [lead.city, lead.state].filter(Boolean).join(", ");
  }
  if (!lead.notes) return "-";
  const match = lead.notes.match(/Location:\s*([^|]+)/i);
  return match ? match[1].trim() : "-";
}

export function getLeadLossReason(lead, linkedDeal) {
  if (lead?.loss_reason) return lead.loss_reason;
  if (lead?.raw_metadata?.loss_reason) return lead.raw_metadata.loss_reason;
  if (linkedDeal?.loss_reason) return linkedDeal.loss_reason;
  const notes = String(lead?.notes || linkedDeal?.notes || "");
  const match = notes.match(/Lost:\s*([^\n\r]+)/i);
  if (match && match[1]) return match[1].trim();
  return null;
}

export function formatLeadAnswer(value) {
  const text = String(value || "").trim();
  if (!text || text === "-" || text === "—" || /[\u0080-\u009f\u00c2\u00c3\u00e2\u201a]/u.test(text)) return "-";
  return text;
}

export function getLeadDisplayNotes(lead) {
  const cleanParts = String(lead?.notes || "")
    .split(/[|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/reason:\s*(error validating access token|session has expired|unsupported get request|missing permissions|graph api|oauth|access token)/i.test(part))
    .filter((part) => !/error validating access token|session has expired|unsupported get request|missing permissions|oauth|access token/i.test(part));
  return cleanParts.join(" | ");
}

export function parseLeadNoteFields(lead) {
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

export function getLeadNoteValue(fields, labels) {
  const wanted = labels.map((label) => label.toLowerCase());
  return fields.find((field) => wanted.includes(field.key))?.value || "";
}

export function getLeadRawFormAnswers(lead) {
  let metadata = lead?.raw_metadata || {};
  if (typeof metadata === "string") {
    try {
      metadata = JSON.parse(metadata);
    } catch (_) {
      metadata = {};
    }
  }
  const answers = metadata?.form_answers || metadata?.formAnswers || metadata?.original_payload || {};
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return [];
  return Object.entries(answers)
    .filter(([label, value]) => {
      if (!label) return false;
      if (value === undefined || value === null) return false;
      return String(Array.isArray(value) ? value.join(", ") : value).trim() !== "";
    })
    .map(([label, value]) => ({
      key: String(label || "").toLowerCase(),
      label: String(label || "").trim(),
      value: Array.isArray(value) ? value.join(", ") : value,
    }));
}

export function getLeadFormAnswers(lead) {
  const noteFields = parseLeadNoteFields(lead);
  const rawAnswerFields = getLeadRawFormAnswers(lead);
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
    "reason",
  ]);
  const mergedFields = [...noteFields.filter((field) => !reserved.has(field.key)), ...rawAnswerFields];
  const seen = new Set();
  const extraFields = mergedFields
    .filter((field) => {
      const key = `${field.key}:${String(field.value || "").trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((field) => ({ label: field.label, value: field.value }));
  return [...baseFields, ...extraFields].map((field) => ({
    ...field,
    value: formatLeadAnswer(field.value),
  })).filter((field) => field.value !== "-");
}

export { formatStatusLabel } from "./meetingUtils";
