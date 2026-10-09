import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cleanPhone, cleanText, normalizeEmail } from "@/lib/apiSecurity";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Format Meta Service value to human friendly text
function normalizeServiceName(val) {
  if (!val) return "General Inquiry";
  const s = String(val).toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();
  if (s.includes("website") || s.includes("web")) return "Website Development";
  if (s.includes("ai") || s.includes("bot") || s.includes("automation")) return "AI Automation & Bots";
  if (s.includes("mobile") || s.includes("app")) return "Mobile App Development";
  if (s.includes("digital") || s.includes("marketing")) return "Digital Marketing & Ads";
  if (s.includes("custom") || s.includes("software")) return "Custom Software";
  return cleanText(val, 100);
}

// Format Meta Budget value to human friendly text
function normalizeBudgetName(val) {
  if (!val) return "";
  const b = String(val).toLowerCase().replace(/_/g, " ").trim();
  if (b.includes("below") && b.includes("40")) return "Below ₹40,000";
  if (b.includes("80") && b.includes("100")) return "₹80,000 - ₹1,00,000";
  if (b.includes("40") && b.includes("80")) return "₹40,000 - ₹80,000";
  if (b.includes("above") || b.includes("100")) return "Above ₹1,00,000";
  return cleanText(val, 80);
}

// Clean phone string (handles "p:+91...", etc.)
function sanitizeMetaPhone(phone) {
  if (!phone) return "";
  let clean = String(phone).replace(/^p:/i, "").trim();
  return cleanPhone(clean) || clean;
}

function firstValue(body, keys = []) {
  for (const key of keys) {
    const value = body?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return "";
}

function collectFormAnswers(body) {
  const systemKeys = new Set([
    "id",
    "created_time",
    "ad_id",
    "ad_name",
    "adset_id",
    "adset_name",
    "campaign_id",
    "campaign_name",
    "form_id",
    "form_name",
    "is_organic",
    "platform",
    "lead_status",
  ]);
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key, value]) => {
      if (systemKeys.has(key)) return false;
      if (value === undefined || value === null || String(value).trim() === "") return false;
      return true;
    })
  );
}

async function insertMetaPlaceholderLead(admin, { leadgenId, formId, adId, reason }) {
  const notes = [
    `Leadgen ID: ${leadgenId}`,
    `Form ID: ${formId || "N/A"}`,
    `Ad ID: ${adId || "N/A"}`,
    reason ? `Reason: ${cleanText(reason, 220)}` : null,
  ].filter(Boolean).join(" | ");

  return admin.from("leads").insert([
    {
      name: `Meta Lead (${leadgenId})`,
      phone: "Check Meta Ads Manager",
      service: "Meta Inbound Lead",
      source: "Meta Ads",
      status: "New",
      notes,
    },
  ]).select().single();
}

async function sendMetaCrmEvent(request, lead, status = "New") {
  try {
    const url = new URL("/api/meta/crm-events", request.url);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead, status }),
    });
  } catch (err) {
    console.warn("Meta CRM CAPI event skipped:", err?.message || err);
  }
}

/**
 * 1. META WEBHOOK VERIFICATION (GET HANDSHAKE)
 * Meta calls this when you configure your Webhook URL in Meta Developer App:
 * URL: https://texwebsolution.in/api/webhooks/meta-leads
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "texweb_meta_leads_secret";

  if (mode === "subscribe" && token === expectedToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed." }, { status: 403 });
}

/**
 * 2. META LEADGEN NOTIFICATION (POST)
 * Accepts either:
 * A) Standard Meta Webhook event (object: "page", entry: [{ changes: [{ value: { leadgen_id } }] }])
 * B) Direct Lead JSON payload (from Zapier, Make.com, Pabbly, or custom CRM import)
 */
export async function POST(request) {
  try {
    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Admin client not configured." }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));

    const directName = firstValue(body, ["name", "full_name", "पूरा_नाम"]);
    const directPhone = firstValue(body, ["phone", "phone_number", "mobile", "मोबाइल"]);
    const directEmail = firstValue(body, ["email", "ईमेल"]);
    if (directName || directPhone || directEmail) {
      const name = cleanText(directName, 120);
      const phone = sanitizeMetaPhone(directPhone);
      const email = normalizeEmail(directEmail);
      const service = normalizeServiceName(firstValue(body, ["service", "service_required", "what_does_your_business_need?", "what_service_are_you_looking_for?"]));
      const budget = normalizeBudgetName(firstValue(body, ["budget", "budget_range", "what_is_your_approximate_budget_for_this_project?", "choose_your_budget_range?"]));
      const city = cleanText(firstValue(body, ["city", "शहर"]), 80);
      const state = cleanText(firstValue(body, ["state", "राज्य"]), 80);
      const platform = (body.platform === "fb" ? "Facebook" : body.platform === "ig" ? "Instagram" : "Meta Ads");
      const campaignName = cleanText(body.campaign_name || body.campaign, 120);
      const adName = cleanText(body.ad_name || body.ad, 120);
      const formName = cleanText(body.form_name || body.form, 120);
      const metaLeadId = cleanText(body.meta_lead_id || body.leadgen_id || body.id, 80);
      const formAnswers = collectFormAnswers(body);

      const notesParts = [
        campaignName ? `Campaign: ${campaignName}` : null,
        adName ? `Ad: ${adName}` : null,
        formName ? `Form: ${formName}` : null,
        budget ? `Budget: ${budget}` : null,
        city || state ? `Location: ${[city, state].filter(Boolean).join(", ")}` : null,
        metaLeadId ? `Meta Lead ID: ${metaLeadId}` : null,
        body.created_time ? `Meta Created: ${cleanText(body.created_time, 80)}` : null,
        body.lead_status ? `Meta Status: ${cleanText(body.lead_status, 80)}` : null,
        body.notes ? `Note: ${body.notes}` : null,
      ].filter(Boolean);

      const payload = {
        name: name || "Meta Lead",
        phone: phone || "Not provided",
        email: email || null,
        service: service || "Website Development",
        source: `Meta Ads (${platform})`,
        status: "New",
        meta_lead_id: metaLeadId || null,
        ad_id: cleanText(body.ad_id, 80) || null,
        ad_name: adName || null,
        adset_id: cleanText(body.adset_id, 80) || null,
        adset_name: cleanText(body.adset_name, 120) || null,
        campaign_id: cleanText(body.campaign_id, 80) || null,
        campaign_name: campaignName || null,
        form_id: cleanText(body.form_id, 80) || null,
        form_name: formName || null,
        platform,
        budget_range: budget || null,
        city: city || null,
        state: state || null,
        raw_metadata: {
          source: "direct_meta_payload",
          form_answers: formAnswers,
          original_payload: body,
        },
        notes: notesParts.join(" | ") || "Inbound inquiry via Meta Ads",
      };

      const { data, error } = await admin.from("leads").insert([payload]).select().single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await sendMetaCrmEvent(request, data, data.status || "New");
      return NextResponse.json({ ok: true, lead: data });
    }

    // Option A: Direct Lead JSON (from Zapier / Make / Internal Importer)
    if (body.name || body.full_name || body.phone || body.phone_number || body["पूरा_नाम"] || body["मोबाइल"] || body["ईमेल"]) {
      const name = cleanText(body.name || body.full_name || body["पूरा_नाम"], 120);
      const phone = sanitizeMetaPhone(body.phone || body.phone_number || body["मोबाइल"]);
      const email = normalizeEmail(body.email || body["ईमेल"]);
      const service = normalizeServiceName(body.service || body.service_required || body["what_does_your_business_need?"] || body["what_service_are_you_looking_for?"]);
      const budget = normalizeBudgetName(body.budget || body.budget_range || body["what_is_your_approximate_budget_for_this_project?"] || body["choose_your_budget_range?"]);
      const city = cleanText(body.city, 80);
      const state = cleanText(body.state, 80);
      const platform = (body.platform === "fb" ? "Facebook" : body.platform === "ig" ? "Instagram" : "Meta Ads");
      const campaignName = cleanText(body.campaign_name || body.campaign, 120);
      const adName = cleanText(body.ad_name || body.ad, 120);
      const formName = cleanText(body.form_name || body.form, 120);
      const metaLeadId = cleanText(body.meta_lead_id || body.leadgen_id || body.id, 80);

      const notesParts = [
        campaignName ? `Campaign: ${campaignName}` : null,
        adName ? `Ad: ${adName}` : null,
        formName ? `Form: ${formName}` : null,
        budget ? `Budget: ${budget}` : null,
        city || state ? `Location: ${[city, state].filter(Boolean).join(", ")}` : null,
        metaLeadId ? `Meta Lead ID: ${metaLeadId}` : null,
        body.created_time ? `Meta Created: ${cleanText(body.created_time, 80)}` : null,
        body.lead_status ? `Meta Status: ${cleanText(body.lead_status, 80)}` : null,
        body.notes ? `Note: ${body.notes}` : null,
      ].filter(Boolean);

      const payload = {
        name: name || "Meta Lead",
        phone: phone || "Not provided",
        email: email || null,
        service: service || "Website Development",
        source: `Meta Ads (${platform})`,
        status: "New",
        notes: notesParts.join(" | ") || "Inbound inquiry via Meta Ads",
      };

      const { data, error } = await admin.from("leads").insert([payload]).select().single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await sendMetaCrmEvent(request, data, data.status || "New");
      return NextResponse.json({ ok: true, lead: data });
    }

    // Option B: Standard Meta Leadgen Webhook
    if (body.object === "page" && Array.isArray(body.entry)) {
      const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;

      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          if (change.field === "leadgen") {
            const leadgenId = change.value?.leadgen_id;
            const formId = change.value?.form_id;
            const adId = change.value?.ad_id;

            if (leadgenId && pageAccessToken) {
              try {
                // Fetch lead details from Meta Graph API
                const apiVersion = process.env.META_CAPI_API_VERSION || "v26.0";
                const metaRes = await fetch(
                  `https://graph.facebook.com/${apiVersion}/${leadgenId}?access_token=${pageAccessToken}`
                );
                if (metaRes.ok) {
                  const leadData = await metaRes.json();
                  const fieldData = leadData.field_data || [];

                  const getField = (keys) => {
                    const match = fieldData.find((f) => keys.includes(f.name.toLowerCase()));
                    return match?.values?.[0] || "";
                  };

                  const fullName = getField(["full_name", "name", "first_name"]);
                  const email = getField(["email"]);
                  const phone = sanitizeMetaPhone(getField(["phone_number", "phone"]));
                  const serviceVal = getField(["what_does_your_business_need?", "what_service_are_you_looking_for?", "service", "service_required"]);
                  const budgetVal = getField(["what_is_your_approximate_budget_for_this_project?", "choose_your_budget_range?", "budget", "budget_range"]);
                  const city = getField(["city"]);
                  const state = getField(["state"]);

                  const notes = [
                    leadData.ad_name ? `Ad: ${leadData.ad_name}` : null,
                    leadData.campaign_name ? `Campaign: ${leadData.campaign_name}` : null,
                    budgetVal ? `Budget: ${normalizeBudgetName(budgetVal)}` : null,
                    city || state ? `Location: ${[city, state].filter(Boolean).join(", ")}` : null,
                    `Meta ID: ${leadgenId}`,
                  ].filter(Boolean).join(" | ");

                  const { data: insertedLead } = await admin.from("leads").insert([
                    {
                      name: cleanText(fullName, 120) || "Meta Lead",
                      phone: cleanPhone(phone) || phone || "Not provided",
                      email: normalizeEmail(email),
                      service: normalizeServiceName(serviceVal),
                      source: "Meta Ads (Instagram/FB)",
                      status: "New",
                      meta_lead_id: leadgenId,
                      ad_id: adId || null,
                      form_id: formId || null,
                      form_name: cleanText(leadData.form_name, 120) || null,
                      raw_metadata: {
                        source: "meta_leadgen_webhook",
                        form_answers: Object.fromEntries(fieldData.map((field) => [field.name, field.values?.[0] || ""])),
                        original_payload: leadData,
                      },
                      notes: notes || "Direct Meta Leadgen Form submission",
                    },
                  ]).select().single();
                  if (insertedLead) await sendMetaCrmEvent(request, insertedLead, insertedLead.status || "New");
                } else {
                  const errorBody = await metaRes.json().catch(() => ({}));
                  const reason = errorBody?.error?.message || `Meta Graph returned ${metaRes.status}`;
                  const { data: insertedLead } = await insertMetaPlaceholderLead(admin, {
                    leadgenId,
                    formId,
                    adId,
                    reason,
                  });
                  if (insertedLead) await sendMetaCrmEvent(request, insertedLead, insertedLead.status || "New");
                }
              } catch (fetchErr) {
                console.error("Meta Graph API error:", fetchErr);
                const { data: insertedLead } = await insertMetaPlaceholderLead(admin, {
                  leadgenId,
                  formId,
                  adId,
                  reason: fetchErr?.message || "Meta Graph fetch failed",
                });
                if (insertedLead) await sendMetaCrmEvent(request, insertedLead, insertedLead.status || "New");
              }
            } else if (leadgenId) {
              // Store placeholder if Access Token not set yet
              const { data: insertedLead } = await insertMetaPlaceholderLead(admin, {
                leadgenId,
                formId,
                adId,
                reason: "META_PAGE_ACCESS_TOKEN missing. Configure it for automatic field decoding.",
              });
              if (insertedLead) await sendMetaCrmEvent(request, insertedLead, insertedLead.status || "New");
            }
          }
        }
      }

      return NextResponse.json({ ok: true, received: true });
    }

    return NextResponse.json({ error: "Unsupported payload structure." }, { status: 400 });
  } catch (err) {
    console.error("Meta leads webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
