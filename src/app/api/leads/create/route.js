import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanPhone, cleanText, getClientIp, isBodyTooLarge, isJsonRequest, isValidEmail, normalizeEmail } from "@/lib/apiSecurity";

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
  const payload = {
    name: cleanText(body.name, 120),
    phone: cleanPhone(body.phone),
    email: normalizeEmail(body.email),
    service: cleanText(body.service || "General Inquiry", 160),
    source: cleanText(body.source || "Website Form", 80),
    status: "New",
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

  const { error } = await admin.from("leads").insert([payload]);
  if (error) {
    return NextResponse.json({ error: "Unable to submit inquiry right now." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
