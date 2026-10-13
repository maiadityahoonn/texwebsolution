export const FOLLOWUP_STAGES = [
  { id: "pending", label: "Pending" },
  { id: "in_discussion", label: "In Discussion" },
  { id: "quote_sent", label: "Quotation Sent" },
  { id: "done", label: "Completed (Done)" },
  { id: "missed", label: "Missed" },
  { id: "cancelled", label: "Cancelled" },
];

export const MEETING_STAGES = [
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed (Conducted)" },
  { id: "no_show", label: "No Show" },
  { id: "rescheduled", label: "Rescheduled" },
  { id: "cancelled", label: "Cancelled" },
];

export const DEFAULT_MEETING_SETTINGS = {
  default_duration: 30,
  default_channel: "google_meet",
  default_reminder_minutes: 10,
};

export function extractPhoneFromText(text) {
  if (!text || typeof text !== "string") return "";
  const match = text.match(/(?:\+?91[\s-]?)?[6-9]\d{9}/) || text.match(/\+?\d{10,13}/);
  return match ? match[0].trim() : "";
}

export function extractCandidateNameFromTitle(title) {
  if (!title || typeof title !== "string") return "";
  const clean = title
    .replace(/^(Client meeting|Meeting with|Meeting|Follow up|Follow-up|Followup)\s*:\s*/i, "")
    .trim();
  const parts = clean.split(/\s*[-·|]\s*/);
  return parts[0]?.trim() || clean;
}

export function resolveLinkedContact(item, { leads = [], clients = [], deals = [] } = {}) {
  if (!item) {
    return { name: "Unlinked", type: "General", phone: "", lead: null, client: null, deal: null };
  }

  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeDeals = Array.isArray(deals) ? deals : [];

  let lead = null;
  let client = null;
  let deal = null;

  // 1. Direct ID match
  if (item.lead_id) {
    const targetLeadId = String(item.lead_id).trim();
    lead = safeLeads.find((l) => String(l.id).trim() === targetLeadId);
  }
  if (item.client_id && !lead) {
    const targetClientId = String(item.client_id).trim();
    client = safeClients.find((c) => String(c.id).trim() === targetClientId);
  }

  // 2. Deal lookup
  if (item.deal_id) {
    const targetDealId = String(item.deal_id).trim();
    deal = safeDeals.find((d) => String(d.id).trim() === targetDealId);
    if (deal) {
      if (!lead && deal.lead_id) {
        const dealLeadId = String(deal.lead_id).trim();
        lead = safeLeads.find((l) => String(l.id).trim() === dealLeadId);
      }
      if (!client && !lead && deal.client_id) {
        const dealClientId = String(deal.client_id).trim();
        client = safeClients.find((c) => String(c.id).trim() === dealClientId);
      }
    }
  }

  // 3. Fallback name from title
  const candidateName = extractCandidateNameFromTitle(item.title);
  if (!lead && !client && candidateName) {
    const cLower = candidateName.toLowerCase();
    lead =
      safeLeads.find((l) => l.name && l.name.trim().toLowerCase() === cLower) ||
      safeLeads.find(
        (l) =>
          l.name &&
          (l.name.toLowerCase().includes(cLower) || cLower.includes(l.name.toLowerCase().trim()))
      );
    if (!lead) {
      client = safeClients.find((c) => c.name && c.name.trim().toLowerCase() === cLower);
    }
  }

  const dealCandidate = deal?.client_name || deal?.title?.split(/\s*[-·|]\s*/)[0]?.trim();
  const name =
    lead?.name || client?.name || dealCandidate || candidateName || "Unlinked";
  const type = client ? "Client" : lead ? "Lead" : dealCandidate ? "Lead" : candidateName ? "Lead" : "General";

  let phone = client?.phone || lead?.phone || deal?.phone || "";
  if (!phone) {
    phone =
      extractPhoneFromText(item.notes) ||
      extractPhoneFromText(deal?.notes) ||
      extractPhoneFromText(item.outcome) ||
      extractPhoneFromText(item.agenda) ||
      "";
  }

  return { name, type, phone, lead, client, deal };
}

export function getFollowUpWhatsappMessage(item, lead, client) {
  const name = client?.name || lead?.name || "there";
  const context = item?.notes || item?.title || "your project discussion";
  return `Hi ${name}, quick follow-up from TexWeb Solution regarding ${context}. Please let me know a good time to close the next step.`;
}

export function formatStatusLabel(status) {
  if (!status) return "Pending";
  const map = {
    pending: "Pending",
    done: "Completed",
    completed: "Completed",
    missed: "Missed",
    no_show: "No Show",
    scheduled: "Scheduled",
    cancelled: "Cancelled",
    in_discussion: "In Discussion",
    quote_sent: "Quote Sent",
    rescheduled: "Rescheduled",
    converted: "Converted",
  };
  return map[status] || status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseNotesHistory(rawNotes) {
  if (!rawNotes || typeof rawNotes !== "string") return [];
  const trimmed = rawNotes.trim();
  if (!trimmed) return [];

  const blocks = trimmed.split(/\n{2,}/);
  const parsed = [];

  blocks.forEach((block, idx) => {
    const text = block.trim();
    if (!text) return;

    // Pattern: [11 Oct 2026, 06:45 PM • Completed]: Note body
    const match = text.match(/^\[(.*?)(?:\s*[•\-|]\s*(?:Status:\s*)?(.*?))?\]:\s*([\s\S]*)$/i);
    if (match) {
      parsed.push({
        id: `entry-${idx}`,
        timestamp: match[1]?.trim() || "",
        stage: match[2]?.trim() || "",
        note: match[3]?.trim() || "",
        raw: text,
      });
    } else {
      parsed.push({
        id: `entry-${idx}`,
        timestamp: idx === 0 && blocks.length > 1 ? "Latest Note" : "Note",
        stage: "",
        note: text,
        raw: text,
      });
    }
  });

  return parsed;
}

export function getLatestNoteSnippet(rawNotes) {
  if (!rawNotes || typeof rawNotes !== "string") return "";
  const history = parseNotesHistory(rawNotes);
  if (history.length > 0) {
    return history[0].note || history[0].raw;
  }
  return rawNotes.split("\n")[0] || "";
}

export function getMeetingFullNotes(item) {
  if (!item) return "";
  const parts = [];
  if (item.outcome) parts.push(item.outcome);
  if (item.agenda) parts.push(`Agenda: ${item.agenda}`);
  if (item.next_action) parts.push(`Next Action: ${item.next_action}`);
  return parts.join("\n\n") || "No agenda or notes logged yet.";
}

export function getLatestMeetingSnippet(item) {
  if (!item) return "";
  if (item.outcome) {
    return getLatestNoteSnippet(item.outcome);
  }
  return item.agenda || item.next_action || "Sales meeting scheduled";
}
