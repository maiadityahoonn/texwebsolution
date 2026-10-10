import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cleanPhone, cleanText, getBearerToken, isBodyTooLarge, isJsonRequest, normalizeEmail } from "@/lib/apiSecurity";
import { cacheDel } from "@/lib/upstashCache";

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

function extractMetaLeadId(lead = {}) {
  const direct = lead.meta_lead_id || lead.leadgen_id || lead.lead_id;
  if (direct) return String(direct).replace(/\D/g, "");
  const match = String(lead.notes || "").match(/(?:Meta Lead ID|Meta ID|Leadgen ID)\s*:\s*(?:l:)?(\d{10,25})/i);
  return match?.[1] || "";
}

function normalizeServiceName(value) {
  return cleanMetaAnswerLabel(value || "Meta Inbound Lead", 120);
}

function normalizeBudgetName(value) {
  return cleanMetaAnswerLabel(value, 100);
}

function cleanMetaAnswerLabel(value, max = 120) {
  return cleanText(value, max);
}

function getField(fieldData = [], keys = []) {
  const wanted = keys.map((key) => String(key).toLowerCase());
  const match = fieldData.find((field) => wanted.includes(String(field.name || "").toLowerCase()));
  return match?.values?.[0] || "";
}

function formAnswersFromFieldData(fieldData = []) {
  return Object.fromEntries(
    fieldData
      .filter((field) => field?.name)
      .map((field) => [field.name, field.values?.[0] || ""])
  );
}

function payloadFromMetaLead(lead, metaLeadId, leadData = {}) {
  const fieldData = leadData.field_data || [];
  const fullName = getField(fieldData, ["full_name", "name", "first_name", "पूरा_नाम"]);
  const email = getField(fieldData, ["email", "ईमेल"]);
  const phone = getField(fieldData, ["phone_number", "phone", "mobile", "मोबाइल"]);
  const serviceValue = getField(fieldData, [
    "what_does_your_business_need?",
    "what_service_are_you_looking_for?",
    "what_type_of_app_are_you_looking_to_build?",
    "what_would_you_like_to_improve_or_manage_with_software?",
    "which_area_would_you_like_to_automate?",
    "what_is_your_main_digital_marketing_goal?",
    "service",
    "service_required",
  ]);
  const budgetValue = getField(fieldData, [
    "what_is_your_approximate_budget_for_this_project?",
    "choose_your_budget_range?",
    "budget",
    "budget_range",
  ]);
  const city = getField(fieldData, ["city"]);
  const state = getField(fieldData, ["state"]);
  const budget = normalizeBudgetName(budgetValue);
  const notes = [
    leadData.ad_name ? `Ad: ${cleanText(leadData.ad_name, 140)}` : null,
    leadData.campaign_name ? `Campaign: ${cleanText(leadData.campaign_name, 140)}` : null,
    budget ? `Budget: ${budget}` : null,
    city || state ? `Location: ${[city, state].filter(Boolean).join(", ")}` : null,
    `Meta ID: ${metaLeadId}`,
    leadData.created_time ? `Meta Created: ${cleanText(leadData.created_time, 80)}` : null,
  ].filter(Boolean).join(" | ");

  return {
    name: cleanText(fullName, 120) || lead.name || `Meta Lead (${metaLeadId})`,
    phone: cleanPhone(phone) || cleanText(phone, 30) || lead.phone || "Not provided",
    email: normalizeEmail(email) || lead.email || null,
    service: normalizeServiceName(serviceValue || lead.service),
    source: lead.source || "Meta Ads (Instagram/FB)",
    status: lead.status || "New",
    meta_lead_id: metaLeadId,
    ad_id: cleanText(leadData.ad_id || lead.ad_id, 80) || null,
    form_id: cleanText(leadData.form_id || lead.form_id, 80) || null,
    form_name: lead.form_name || null,
    budget_range: budget || lead.budget_range || null,
    city: cleanText(city || lead.city, 80) || null,
    state: cleanText(state || lead.state, 80) || null,
    raw_metadata: {
      ...(lead.raw_metadata || {}),
      source: "meta_lead_backfill",
      form_answers: formAnswersFromFieldData(fieldData),
      original_payload: leadData,
      backfilled_at: new Date().toISOString(),
    },
    notes: notes || lead.notes || "Backfilled from Meta Lead Ads",
  };
}

export async function POST(request) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 16_384)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });

  const requester = await getRequester(admin, request);
  if (!requester) return NextResponse.json({ error: "Unauthorized backfill request." }, { status: 401 });

  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    return NextResponse.json({ error: "META_PAGE_ACCESS_TOKEN is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedIds = Array.isArray(body.meta_lead_ids)
    ? body.meta_lead_ids.map((id) => String(id).replace(/\D/g, "")).filter(Boolean)
    : [];
  const limit = Math.min(Math.max(Number(body.limit || 20), 1), 100);

  let query = admin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(requestedIds.length ? 2000 : limit);

  if (!requestedIds.length) {
    query = query.ilike("source", "%Meta%");
  }

  const { data: leads, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const matchedByRequestedId = new Map();
  const candidates = (leads || [])
    .map((lead) => ({ lead, metaLeadId: extractMetaLeadId(lead) }))
    .filter(({ metaLeadId }) => metaLeadId)
    .filter(({ metaLeadId }) => !requestedIds.length || requestedIds.includes(metaLeadId))
    .filter((item) => {
      if (!requestedIds.length) return true;
      if (matchedByRequestedId.has(item.metaLeadId)) return false;
      matchedByRequestedId.set(item.metaLeadId, item);
      return true;
    })
    .slice(0, requestedIds.length ? requestedIds.length : limit);
  const missingRequestedIds = requestedIds.filter((id) => !matchedByRequestedId.has(id));

  const apiVersion = process.env.META_CAPI_API_VERSION || "v26.0";
  const results = [];

  for (const { lead, metaLeadId } of candidates) {
    const fields = "id,created_time,field_data,ad_id,form_id,ad_name,campaign_name";
    const url = `https://graph.facebook.com/${apiVersion}/${metaLeadId}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(pageAccessToken)}`;
    const response = await fetch(url);
    const metaResult = await response.json().catch(() => ({}));
    if (!response.ok) {
      results.push({
        id: lead.id,
        meta_lead_id: metaLeadId,
        ok: false,
        error: metaResult?.error?.message || `Meta Graph returned ${response.status}`,
      });
      continue;
    }

    const updatePayload = payloadFromMetaLead(lead, metaLeadId, metaResult);
    const { data: updatedLead, error: updateError } = await admin
      .from("leads")
      .update(updatePayload)
      .eq("id", lead.id)
      .select("*")
      .single();

    if (!updateError && updatedLead) {
      await cacheDel("crm:leads-summary:all");
    }

    results.push({
      id: lead.id,
      meta_lead_id: metaLeadId,
      ok: !updateError,
      lead: updatedLead || null,
      error: updateError?.message || null,
    });
  }

  return NextResponse.json({
    ok: true,
    checked: candidates.length,
    updated: results.filter((item) => item.ok).length,
    failed: results.filter((item) => !item.ok).length,
    missing: missingRequestedIds,
    results,
  });
}
