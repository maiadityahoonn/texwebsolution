import crypto from "crypto";
import { NextResponse } from "next/server";
import { cleanPhone, cleanText, isBodyTooLarge, isJsonRequest, normalizeEmail } from "@/lib/apiSecurity";

const DATASET_ID = process.env.META_CAPI_DATASET_ID || "1117053014586521";
const API_VERSION = process.env.META_CAPI_API_VERSION || "v26.0";
const CRM_NAME = process.env.META_CAPI_CRM_NAME || "TexWeb CRM";

function sha256(value) {
  const cleaned = String(value || "").trim().toLowerCase();
  if (!cleaned) return "";
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

function normalizePhoneForHash(value) {
  return cleanPhone(value).replace(/[^0-9]/g, "");
}

function extractMetaLeadId(lead) {
  const direct = lead?.meta_lead_id || lead?.leadgen_id || lead?.lead_id;
  if (direct) return String(direct).replace(/\D/g, "");
  const notes = String(lead?.notes || "");
  const match = notes.match(/(?:Meta Lead ID|Meta ID|Leadgen ID)\s*:\s*(\d{10,25})/i);
  return match?.[1] || "";
}

function mapEventName(status) {
  const value = cleanText(status || "Lead", 80).toLowerCase();
  if (value.includes("lost")) return "LeadLost";
  if (value.includes("won") || value.includes("converted")) return "LeadWon";
  if (value.includes("negotiation")) return "LeadNegotiation";
  if (value.includes("proposal") || value.includes("quotation")) return "LeadQuotation";
  if (value.includes("meeting") || value.includes("contacted")) return "LeadMeeting";
  if (value.includes("qualified") || value.includes("requirement")) return "QualifiedLead";
  return "Lead";
}

export async function POST(request) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 16_384)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ ok: true, skipped: true, reason: "META_CAPI_ACCESS_TOKEN is not configured." });
  }

  const body = await request.json().catch(() => ({}));
  const lead = body.lead || body;
  const email = normalizeEmail(lead.email);
  const phone = normalizePhoneForHash(lead.phone);
  const metaLeadId = extractMetaLeadId(lead);

  const userData = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (metaLeadId) userData.lead_id = metaLeadId;

  if (!Object.keys(userData).length) {
    return NextResponse.json({ ok: true, skipped: true, reason: "No matchable user data available." });
  }

  const eventTime = Math.floor(new Date(body.event_time || lead.updated_at || lead.created_at || Date.now()).getTime() / 1000);
  const payload = {
    data: [
      {
        action_source: "system_generated",
        event_name: mapEventName(body.status || lead.status),
        event_time: Number.isFinite(eventTime) ? eventTime : Math.floor(Date.now() / 1000),
        custom_data: {
          event_source: "crm",
          lead_event_source: CRM_NAME,
          crm_status: cleanText(body.status || lead.status || "New", 80),
          service: cleanText(lead.service || "", 120),
          source: cleanText(lead.source || "", 120),
        },
        user_data: userData,
      },
    ],
  };

  if (process.env.META_CAPI_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${DATASET_ID}/events?access_token=${encodeURIComponent(accessToken)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: result.error?.message || "Meta CAPI request failed.", details: result }, { status: 502 });
  }

  return NextResponse.json({ ok: true, result });
}
