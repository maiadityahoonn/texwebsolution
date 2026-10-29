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
  { id: "rescheduled", label: "Rescheduled" },
  { id: "cancelled", label: "Cancelled" },
];

export const DEFAULT_MEETING_SETTINGS = {
  default_duration: 30,
  default_channel: "google_meet",
  default_reminder_minutes: 10,
};

// ==========================================
// MEETINGS STATUS CLASSIFIERS
// ==========================================
export function isMeetingCompleted(status) {
  const s = String(status || "").toLowerCase().trim();
  return s === "completed" || s === "done";
}

export function isMeetingNoShow(status) {
  const s = String(status || "").toLowerCase().trim().replace(/[-\s]/g, "_");
  return s === "no_show" || s === "noshow" || s === "cancelled" || s === "missed";
}

export function isMeetingActive(status) {
  return !isMeetingCompleted(status) && !isMeetingNoShow(status);
}

export function isMeetingOverdue(item, nowMs = Date.now()) {
  return Boolean(isMeetingActive(item?.status) && item?.scheduled_at && new Date(item.scheduled_at).getTime() < nowMs);
}

export function isMeetingUpcoming(item, nowMs = Date.now()) {
  return Boolean(isMeetingActive(item?.status) && (!item?.scheduled_at || new Date(item.scheduled_at).getTime() >= nowMs));
}

// ==========================================
// FOLLOW-UPS STATUS CLASSIFIERS
// ==========================================
export function isFollowUpCompleted(status) {
  const s = String(status || "").toLowerCase().trim();
  return s === "done" || s === "completed";
}

export function isFollowUpMissed(status) {
  const s = String(status || "").toLowerCase().trim().replace(/[-\s]/g, "_");
  return s === "missed" || s === "cancelled" || s === "no_show" || s === "noshow";
}

export function isFollowUpActive(status) {
  return !isFollowUpCompleted(status) && !isFollowUpMissed(status);
}

export function isFollowUpOverdue(item, nowMs = Date.now()) {
  return isFollowUpActive(item?.status) && item?.due_at && new Date(item.due_at).getTime() < nowMs;
}

export function isFollowUpUpcomingPending(item, nowMs = Date.now()) {
  return isFollowUpActive(item?.status) && !isFollowUpOverdue(item, nowMs);
}

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
    return { name: "Unlinked", type: "General", phone: "", email: "", lead: null, client: null, deal: null };
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

  const email = client?.email || lead?.email || deal?.email || "";
  return { name, type, phone, email, lead, client, deal };
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

export function parseDateMs(str, fallbackMs = 0) {
  if (!str) return fallbackMs;
  const parsed = Date.parse(str);
  if (!Number.isNaN(parsed)) return parsed;

  const dmyMatch = String(str).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?/i);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    let hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 12;
    const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const second = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    const ampm = dmyMatch[7]?.toLowerCase();
    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;
    const d = new Date(year, month, day, hour, minute, second);
    if (!Number.isNaN(d.getTime())) return d.getTime();
  }
  return fallbackMs;
}

export function formatFriendlyDateTime(dateVal) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function parseNotesHistory(rawNotes, fallbackDate = null) {
  if (!rawNotes || typeof rawNotes !== "string") return [];
  const trimmed = rawNotes.trim();
  if (!trimmed) return [];

  const defaultFormatted = fallbackDate ? formatFriendlyDateTime(fallbackDate) : formatFriendlyDateTime(new Date());
  const fallbackMs = fallbackDate ? new Date(fallbackDate).getTime() || Date.now() : Date.now();

  // First split into major blocks: bracket headers [date • stage]: or double newlines
  const majorBlocks = trimmed
    .split(/\n{2,}|\n(?=\[)/i)
    .map((b) => b.trim())
    .filter(Boolean);

  const rawEntries = [];

  majorBlocks.forEach((block) => {
    // 1. Bracket header: [11 Oct 2026, 06:45 PM • Completed]: Note body
    const bracketMatch = block.match(/^\[(.*?)(?:\s*[•\-|]\s*(?:Status:\s*)?(.*?))?\]:\s*([\s\S]*)$/i);
    if (bracketMatch) {
      const rawTime = bracketMatch[1]?.trim() || defaultFormatted;
      const stage = bracketMatch[2]?.trim() || "";
      const note = bracketMatch[3]?.trim() || "";
      const timeMs = parseDateMs(rawTime, fallbackMs);
      rawEntries.push({
        timestamp: rawTime,
        timeMs,
        stage: formatStatusLabel(stage) || "Update",
        note,
        raw: block,
      });
      return;
    }

    // 2. Legacy / multi-line plain text: split line by line
    const lines = block.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    lines.forEach((line) => {
      // 2a. Rescheduled line
      const reschedMatch = line.match(/^Rescheduled\s+from\s+([^\n]+)$/i);
      if (reschedMatch) {
        const rawTime = reschedMatch[1]?.trim();
        const timeMs = parseDateMs(rawTime, fallbackMs);
        rawEntries.push({
          timestamp: formatFriendlyDateTime(timeMs) || rawTime || defaultFormatted,
          timeMs,
          stage: "Rescheduled",
          note: `Follow-up / Meeting shifted from ${rawTime || "previous schedule"}`,
          raw: line,
        });
        return;
      }

      // 2b. Check embedded date in line (e.g. "call busy 21/10" or "Today Reschedule at 7 PM")
      let lineTimeMs = fallbackMs;
      let lineTimeStr = defaultFormatted;

      const embeddedDateMatch = line.match(/(?:at|on|from|\b)(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{1,2}\s+[A-Za-z]+(?:\s+\d{4})?)(?:[,\s]+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm)))?/i);
      if (embeddedDateMatch) {
        const parsedMs = parseDateMs(embeddedDateMatch[0]);
        if (parsedMs > 0) {
          lineTimeMs = parsedMs;
          lineTimeStr = formatFriendlyDateTime(parsedMs);
        }
      }

      let detectedStage = "Note";
      const lLower = line.toLowerCase();
      if (lLower.includes("reschedule")) detectedStage = "Rescheduled";
      else if (lLower.includes("complete") || lLower.includes("done")) detectedStage = "Completed";
      else if (lLower.includes("call busy") || lLower.includes("busy")) detectedStage = "Call Busy";
      else if (lLower.includes("manual follow-up") || lLower.includes("agenda")) detectedStage = "Initial";
      else if (lLower.includes("quotation") || lLower.includes("quote")) detectedStage = "Quotation";
      else if (lLower.includes("discuss")) detectedStage = "Discussion";

      rawEntries.push({
        timestamp: lineTimeStr,
        timeMs: lineTimeMs,
        stage: detectedStage,
        note: line,
        raw: line,
      });
    });
  });

  // Deduplicate and assign unique IDs
  const seenNotes = new Set();
  const parsed = [];

  rawEntries.forEach((entry, idx) => {
    const key = `${entry.timestamp}__${entry.note.toLowerCase().trim()}`;
    if (seenNotes.has(key)) return;
    seenNotes.add(key);
    parsed.push({
      id: `entry-${idx}-${entry.timeMs}`,
      ...entry,
    });
  });

  // Strictly reverse-chronological: current / newest on top
  return parsed.sort((a, b) => (b.timeMs || 0) - (a.timeMs || 0));
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
  const outcomeText = String(item.outcome || "").trim();
  if (outcomeText) parts.push(outcomeText);

  const outcomeLower = outcomeText.toLowerCase();

  if (item.next_action && !outcomeLower.includes(item.next_action.toLowerCase().trim())) {
    const nextTime = formatFriendlyDateTime(item.updated_at || item.scheduled_at);
    parts.push(`[${nextTime} • Next Action]: ${item.next_action}`);
  }
  if (item.agenda && !outcomeLower.includes(item.agenda.toLowerCase().trim()) && parts.length === 0) {
    const agendaTime = formatFriendlyDateTime(item.created_at || item.scheduled_at);
    parts.push(`[${agendaTime} • Agenda]: ${item.agenda}`);
  }
  return parts.join("\n\n") || "";
}

export function getLatestMeetingSnippet(item) {
  if (!item) return "";
  if (item.outcome) {
    return getLatestNoteSnippet(item.outcome);
  }
  return item.agenda || item.next_action || "Sales meeting scheduled";
}
