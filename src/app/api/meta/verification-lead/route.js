import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cleanPhone, cleanText, getBearerToken, isBodyTooLarge, isJsonRequest, normalizeEmail } from "@/lib/apiSecurity";

const DATASET_ID = process.env.META_CAPI_DATASET_ID || "1117053014586521";
const API_VERSION = process.env.META_CAPI_API_VERSION || "v26.0";
const CRM_NAME = process.env.META_CAPI_CRM_NAME || "TexWeb CRM";
const CRM_ROLES = new Set(["super_admin", "admin", "hr", "sales_head", "sales_executive", "telecaller"]);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function normalizeRole(profile = {}) {
  if (profile.role && profile.role !== "intern") return profile.role;
  const designation = String(profile.designation || "").toLowerCase();
  const domain = String(profile.domain || "").toLowerCase();
  if (designation === "sales head" || (domain === "sales" && designation.includes("head"))) return "sales_head";
  if (designation === "sales executive") return "sales_executive";
  if (designation === "telecaller") return "telecaller";
  return profile.role || "";
}

async function getRequester(admin, request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, designation, domain")
    .eq("id", user.id)
    .maybeSingle();
  const role = normalizeRole(profile);
  return CRM_ROLES.has(role) ? { user, profile, role } : null;
}

function sha256(value) {
  const cleaned = String(value || "").trim().toLowerCase();
  if (!cleaned) return "";
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

function normalizePhoneForHash(value) {
  return cleanPhone(value).replace(/[^0-9]/g, "");
}

function eventNameForStatus(status) {
  const value = cleanText(status || "Qualified", 80).toLowerCase();
  if (value.includes("meeting") || value.includes("contacted")) return "LeadMeeting";
  if (value.includes("quotation") || value.includes("proposal")) return "LeadQuotation";
  if (value.includes("won") || value.includes("converted")) return "LeadWon";
  if (value.includes("lost")) return "LeadLost";
  return "QualifiedLead";
}

async function sendCapiEvent({ lead, status }) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    return { ok: true, skipped: true, reason: "META_CAPI_ACCESS_TOKEN is not configured." };
  }

  const email = normalizeEmail(lead.email);
  const phone = normalizePhoneForHash(lead.phone);
  const metaLeadId = String(lead.meta_lead_id || lead.leadgen_id || lead.lead_id || "").replace(/\D/g, "");
  const userData = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (metaLeadId) userData.lead_id = metaLeadId;

  if (!Object.keys(userData).length) {
    return { ok: true, skipped: true, reason: "No matchable user data available." };
  }

  const payload = {
    data: [
      {
        action_source: "system_generated",
        event_name: eventNameForStatus(status),
        event_time: Math.floor(Date.now() / 1000),
        custom_data: {
          event_source: "crm",
          lead_event_source: CRM_NAME,
          crm_status: cleanText(status || "Qualified", 80),
          source: "Meta verification lead",
        },
        user_data: userData,
      },
    ],
  };

  const url = `https://graph.facebook.com/${API_VERSION}/${DATASET_ID}/events?access_token=${encodeURIComponent(accessToken)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: result.error?.message || "Meta CAPI request failed.", details: result };
  }
  return { ok: true, result };
}

export async function POST(request) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 16_384)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  }
  const requester = await getRequester(admin, request);
  if (!requester) {
    return NextResponse.json({ error: "Unauthorized verification request." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const metaLeadId = cleanText(body.meta_lead_id || body.leadgen_id || body.lead_id, 80).replace(/\D/g, "");
  const email = normalizeEmail(body.email);
  const phone = cleanPhone(body.phone);
  const status = cleanText(body.status || "Qualified", 80);
  if (!metaLeadId || (!email && !phone)) {
    return NextResponse.json({ error: "meta_lead_id and email or phone are required." }, { status: 400 });
  }

  const leadPayload = {
    name: cleanText(body.name || "Meta Verification Lead", 120),
    phone: phone || "Not provided",
    email: email || null,
    service: cleanText(body.service || "Meta CRM Verification", 120),
    source: "Meta Ads Verification",
    status,
    meta_lead_id: metaLeadId,
    notes: `Meta Verification Lead ID: ${metaLeadId}`,
    raw_metadata: {
      source: "meta_capi_verification",
      requested_by: requester.user.id,
      verification_status: status,
    },
  };

  const { data: existingLead } = await admin
    .from("leads")
    .select("id")
    .eq("meta_lead_id", metaLeadId)
    .maybeSingle();

  const writeQuery = existingLead?.id
    ? admin.from("leads").update(leadPayload).eq("id", existingLead.id).select().single()
    : admin.from("leads").insert([leadPayload]).select().single();
  const { data: lead, error } = await writeQuery;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const capi = await sendCapiEvent({ lead, status });
  if (!capi.ok) {
    return NextResponse.json({ ok: false, lead, capi }, { status: 502 });
  }

  return NextResponse.json({ ok: true, lead, capi });
}
