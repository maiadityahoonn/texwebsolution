import crypto from "crypto";
import { NextResponse } from "next/server";
import { cleanPhone, cleanText, getClientIp, isBodyTooLarge, isJsonRequest, normalizeEmail } from "@/lib/apiSecurity";
import { cacheDel, cacheSetNx } from "@/lib/upstashCache";

import { getMetaAdsConfig } from "@/lib/metaAdsConfig";

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
  const match = notes.match(/(?:Meta Lead ID|Meta ID|Leadgen ID)\s*:\s*(?:l:)?(\d{10,25})/i);
  return match?.[1] || "";
}

function extractFbclid(lead) {
  const notes = String(lead?.notes || "");
  const match = notes.match(/fbclid:\s*([A-Za-z0-9_-]+)/i);
  return match?.[1] || "";
}

function getMetaCookies(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  let fbp = "";
  let fbc = "";

  const matchFbp = cookieHeader.match(/(?:^|;\s*)_fbp=([^;]+)/);
  if (matchFbp) fbp = decodeURIComponent(matchFbp[1]);

  const matchFbc = cookieHeader.match(/(?:^|;\s*)_fbc=([^;]+)/);
  if (matchFbc) fbc = decodeURIComponent(matchFbc[1]);

  return { fbp, fbc };
}

function mapEventName(status) {
  const value = cleanText(status || "Lead", 80).toLowerCase();
  if (value.includes("lost")) return "LeadLost";
  if (value.includes("won") || value.includes("converted")) return "LeadWon";
  if (value.includes("negotiation")) return "LeadNegotiation";
  if (value.includes("proposal") || value.includes("quotation")) return "LeadQuotation";
  if (value.includes("meeting")) return "LeadMeeting";
  if (value.includes("contacted") || value.includes("qualified") || value.includes("requirement")) return "QualifiedLead";
  return "Lead";
}

export async function POST(request) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 16_384)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const config = await getMetaAdsConfig();
  const accessToken = config.capiAccessToken;
  const datasetId = config.datasetId;

  if (!accessToken || !datasetId) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Meta Dataset ID or CAPI Access Token is not configured.",
    });
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

  // Add browser / network signals for enhanced Event Match Quality (EMQ) & Deduplication
  const clientIp = body.client_ip_address || getClientIp(request);
  if (clientIp && clientIp !== "local") {
    userData.client_ip_address = clientIp;
  }
  const clientUa = body.client_user_agent || request.headers.get("user-agent");
  if (clientUa) {
    userData.client_user_agent = clientUa;
  }
  const cookies = getMetaCookies(request);
  const fbclid = extractFbclid(lead);
  const fbp = body.fbp || cookies.fbp;
  const fbc = body.fbc || cookies.fbc || (fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}` : "");
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  if (!Object.keys(userData).length) {
    return NextResponse.json({ ok: true, skipped: true, reason: "No matchable user data available." });
  }

  const eventTime = Math.floor(new Date(body.event_time || lead.updated_at || lead.created_at || Date.now()).getTime() / 1000);
  const eventName = mapEventName(body.status || lead.status);
  const eventId = body.event_id || lead.event_id || null;
  const actionSource = body.action_source || (eventId ? "website" : "system_generated");
  const eventSourceUrl = body.event_source_url || request.headers.get("referer") || undefined;

  const eventItem = {
    action_source: actionSource,
    event_name: eventName,
    event_time: Number.isFinite(eventTime) ? eventTime : Math.floor(Date.now() / 1000),
    custom_data: {
      event_source: actionSource === "website" ? "website" : "crm",
      lead_event_source: config.crmName || "TexWeb CRM",
      crm_status: cleanText(body.status || lead.status || "New", 80),
      service: cleanText(lead.service || "", 120),
      source: cleanText(lead.source || "", 120),
    },
    user_data: userData,
  };

  if (eventId) {
    eventItem.event_id = String(eventId);
  }
  if (eventSourceUrl && actionSource === "website") {
    eventItem.event_source_url = eventSourceUrl;
  }

  const payload = {
    data: [eventItem],
  };

  if (config.testEventCode) {
    payload.test_event_code = config.testEventCode;
  }

  const idempotencySubject = eventId || metaLeadId || email || phone || lead.id || "";
  const idempotencyKey = idempotencySubject
    ? `crm:capi:idempotency:${idempotencySubject}:${eventName}:${cleanText(body.status || lead.status || "New", 80)}`
    : "";
  if (idempotencyKey) {
    const claimed = await cacheSetNx(idempotencyKey, "1", 60 * 60 * 24 * 7);
    if (!claimed) {
      return NextResponse.json({ ok: true, skipped: true, reason: "Duplicate CAPI event suppressed." });
    }
  }

  const url = `https://graph.facebook.com/${config.apiVersion}/${datasetId}/events?access_token=${encodeURIComponent(accessToken)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (idempotencyKey) await cacheDel(idempotencyKey);
    return NextResponse.json({ ok: false, error: result.error?.message || "Meta CAPI request failed.", details: result }, { status: 502 });
  }

  return NextResponse.json({ ok: true, result });
}
