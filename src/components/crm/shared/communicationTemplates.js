const STAGE_COPY = {
  contacted: {
    label: "Contacted",
    subject: "Your enquiry with TexWeb Solution",
    body: "Thank you for your enquiry. We would like to understand your requirements, expected timeline, and budget so we can suggest the right solution.",
  },
  qualified: {
    label: "Meeting",
    subject: "Requirement discussion with TexWeb Solution",
    body: "Your requirement is shortlisted for a detailed discussion. Please confirm a convenient time for the meeting so we can finalize the scope and next steps.",
  },
  proposal: {
    label: "Quotation",
    subject: "Quotation follow-up from TexWeb Solution",
    body: "We are following up regarding the quotation for your project. Please share your feedback or any changes required so we can proceed.",
  },
  negotiation: {
    label: "Negotiation",
    subject: "Final project scope and commercials",
    body: "We are ready to finalize the project scope, commercials, timeline, and delivery milestones. Please let us know a suitable time to close the next step.",
  },
  closed_won: {
    label: "Closed Won",
    subject: "Project onboarding with TexWeb Solution",
    body: "Thank you for choosing TexWeb Solution. We are ready to proceed with onboarding, project kickoff, and the agreed delivery milestones.",
  },
  closed_lost: {
    label: "Closed Lost",
    subject: "Reconnecting regarding your project",
    body: "We wanted to reconnect regarding your project. If the requirement is active again, we would be happy to review the scope and offer the best possible next step.",
  },
};

export function normalizePipelineStage(stage = "") {
  const value = String(stage || "").toLowerCase().trim();
  if (["qualified", "meeting"].includes(value)) return "qualified";
  if (["proposal", "quotation", "quote_sent"].includes(value)) return "proposal";
  if (["negotiation", "in_discussion"].includes(value)) return "negotiation";
  if (["closed_won", "won", "converted", "closed won"].includes(value)) return "closed_won";
  if (["closed_lost", "lost", "abandoned", "dropped", "closed lost"].includes(value)) return "closed_lost";
  return "contacted";
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function buildCommunicationTemplate({
  stage = "contacted",
  name = "there",
  service = "your project",
  purpose = "stage",
  followUp = null,
  meeting = null,
} = {}) {
  const normalizedStage = normalizePipelineStage(stage);
  const stageCopy = STAGE_COPY[normalizedStage] || STAGE_COPY.contacted;
  const greeting = `Hi ${name || "there"},`;
  const serviceLine = service ? ` regarding ${service}` : "";
  let subject = `${stageCopy.subject}${service ? ` - ${service}` : ""}`;
  let body = `${greeting}\n\n${service ? `Regarding: ${service}\n\n` : ""}${stageCopy.body}\n\nRegards,\nTexWeb Solution`;

  if (purpose === "followup") {
    const dueAt = formatDateTime(followUp?.due_at);
    subject = `Follow-up${service ? `: ${service}` : ""}`;
    body = `${greeting}\n\nThis is a quick follow-up${serviceLine}. ${stageCopy.body}${dueAt ? `\n\nScheduled follow-up: ${dueAt}` : ""}\n\nPlease share a convenient time for the next step.\n\nRegards,\nTexWeb Solution`;
  }

  if (purpose === "meeting") {
    const scheduledAt = formatDateTime(meeting?.scheduled_at);
    const meetingLink = meeting?.meeting_link && meeting.meeting_link !== "https://meet.google.com/new"
      ? meeting.meeting_link
      : "";
    subject = `Meeting confirmation${service ? `: ${service}` : ""}`;
    body = `${greeting}\n\nThis is a confirmation for our ${stageCopy.label.toLowerCase()} meeting${serviceLine}.${scheduledAt ? `\nDate & time: ${scheduledAt}` : ""}${meetingLink ? `\nMeeting link: ${meetingLink}` : ""}\n\nPlease confirm your availability.\n\nRegards,\nTexWeb Solution`;
  }

  return { subject, body, stage: normalizedStage, stageLabel: stageCopy.label };
}

export function openWhatsAppMessage(phone, body) {
  const cleanPhone = String(phone || "").replace(/[^0-9]/g, "");
  if (!cleanPhone || typeof window === "undefined") return false;
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(body || "")}`, "_blank", "noopener,noreferrer");
  return true;
}

export function getEmailHref(email, subject, body) {
  if (!email) return "";
  return `mailto:${email}?subject=${encodeURIComponent(subject || "")}&body=${encodeURIComponent(body || "")}`;
}
