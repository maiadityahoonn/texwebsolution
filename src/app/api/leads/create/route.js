import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanPhone, cleanText, getClientIp, isBodyTooLarge, isJsonRequest, isValidEmail, normalizeEmail } from "@/lib/apiSecurity";
import { cacheDel } from "@/lib/upstashCache";
import { dispatchPushToUsers } from "@/lib/pushDispatcher";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function sendMetaCrmEvent(request, lead, status = "New", eventId = null) {
  try {
    const url = new URL("/api/meta/crm-events", request.url);
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": request.headers.get("user-agent") || "",
        "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
        "cookie": request.headers.get("cookie") || "",
        "referer": request.headers.get("referer") || "",
      },
      body: JSON.stringify({
        lead,
        status,
        event_id: eventId || undefined,
        action_source: "website",
        event_source_url: request.headers.get("referer") || undefined,
      }),
    });
  } catch (err) {
    console.warn("Meta CRM CAPI event skipped:", err?.message || err);
  }
}

async function sendOpenAiAdsEvent(request, lead, eventId = null) {
  const pixelId = process.env.OPENAI_ADS_PIXEL_ID;
  const apiKey = process.env.OPENAI_ADS_CAPI_KEY;
  if (!pixelId || !apiKey || !eventId) return;

  try {
    const referer = request.headers.get("referer") || process.env.NEXT_PUBLIC_SITE_URL || "https://texwebsolution.in";
    const cookie = request.headers.get("cookie") || "";
    const obref = cookie.match(/(?:^|;\s*)__obref=([^;]+)/)?.[1];
    const oppref = cookie.match(/(?:^|;\s*)__oppref=([^;]+)/)?.[1];
    const userAgent = request.headers.get("user-agent") || "";
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const ipAddress = forwardedFor.split(",")[0]?.trim() || undefined;

    const decodeCookieValue = (value) => {
      try {
        return value ? decodeURIComponent(value) : undefined;
      } catch (_) {
        return value || undefined;
      }
    };

    const response = await fetch(`https://bzr.openai.com/v1/events?pid=${encodeURIComponent(pixelId)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validate_only: false,
        events: [{
          id: String(eventId),
          type: "lead_created",
          timestamp_ms: Date.now(),
          ...(oppref ? { oppref: decodeCookieValue(oppref) } : {}),
          source_url: referer,
          action_source: "web",
          data: { type: "customer_action" },
          user: {
            ...(obref ? { obref: decodeURIComponent(obref) } : {}),
            ...(ipAddress ? { ip_address: ipAddress } : {}),
            ...(userAgent ? { user_agent: userAgent } : {}),
          },
        }],
      }),
    });

    if (!response.ok) {
      console.warn("OpenAI Ads CAPI event rejected:", response.status);
    }
  } catch (error) {
    console.warn("OpenAI Ads CAPI event skipped:", error?.message || error);
  }
}

export async function POST(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`lead-create:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 8192)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const eventId = cleanText(body.event_id || body.eventId, 120) || null;
  const requestCookie = request.headers.get("cookie") || "";
  const hasOpenAiAttribution = /(?:^|;\s*)__oppref=/.test(requestCookie);
  const requestedSource = cleanText(body.source || "Website Form", 80);
  const source = hasOpenAiAttribution
    ? requestedSource.startsWith("Meta Ads")
      ? `${requestedSource} + OpenAI Ads`
      : "OpenAI Ads"
    : requestedSource;
  const payload = {
    name: cleanText(body.name, 120),
    phone: cleanPhone(body.phone),
    email: normalizeEmail(body.email),
    service: cleanText(body.service || "General Inquiry", 160),
    source,
    status: cleanText(body.status || "New", 50),
    notes: cleanText(body.notes, 1000),
  };
  const isNewsletter = payload.service === "Newsletter Subscription" || payload.source === "Footer Newsletter";

  if (!payload.name || (!payload.phone && !isNewsletter)) {
    return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  }

  if (isNewsletter && !payload.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (payload.email && !isValidEmail(payload.email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const { data, error } = await admin.from("leads").insert([payload]).select().single();
  if (error) {
    return NextResponse.json({ error: "Unable to submit inquiry right now." }, { status: 400 });
  }

  if (data) await sendMetaCrmEvent(request, data, data.status || "New", eventId);
  if (data) await sendOpenAiAdsEvent(request, data, eventId);

  // Instant In-App Notification for CRM users
  if (data) {
    try {
      const { data: crmProfiles } = await admin
        .from("profiles")
        .select("id")
        .or("role.in.(super_admin,hr,sales_head,admin),domain.eq.sales")
        .limit(20);

      if (crmProfiles && crmProfiles.length > 0) {
        const notifPayload = {
          title: `New Lead: ${data.name || "New Client"}`,
          message: `${data.name || "Client"} submitted inquiry for ${data.service || "Tech Development"}${data.source ? ` via ${data.source}` : ""}${data.phone ? ` (${data.phone})` : ""}`,
          type: "lead",
          link_url: "/crm/leads",
          delivery_channels: ["in_app", "push"],
          metadata: {
            lead_id: data.id,
            source_type: "lead",
            source: data.source || "website",
          },
        };
        const notifRows = crmProfiles.map((p) => ({
          ...notifPayload,
          user_id: p.id,
        }));
        await admin.from("notifications").insert(notifRows);

        // Dispatch push notification to all mobile devices and web browsers
        const profileIds = crmProfiles.map((p) => p.id);
        dispatchPushToUsers(admin, profileIds, notifPayload).catch((pushErr) => {
          console.warn("Lead push notification dispatch error:", pushErr?.message);
        });
      }
    } catch (notifErr) {
      console.warn("Error creating lead notification:", notifErr?.message);
    }
  }

  await cacheDel("crm:leads-summary:all");
  await cacheDel("crm:leads-summary:start:end:meta");
  return NextResponse.json({ ok: true, lead: data });
}
