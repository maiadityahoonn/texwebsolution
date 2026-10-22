import { timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getBearerToken, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";
import { sendNativePushToUser } from "@/lib/firebaseAdminMessaging";

export const dynamic = "force-dynamic";

function authorized(request) {
  const actual = Buffer.from(getBearerToken(request));
  const expected = Buffer.from(String(process.env.SUPABASE_SERVICE_ROLE_KEY || ""));
  return expected.length > 0 && actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 4_096)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = String(body.user_id || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    return NextResponse.json({ error: "Valid user ID is required." }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const results = await sendNativePushToUser(admin, userId, {
    title: "TW-CRM Test Notification",
    message: "Push notification setup is working successfully.",
    type: "general",
    link_url: "/crm/dashboard",
    metadata: { test: "true" },
  });

  return NextResponse.json({ ok: results.some((item) => item.status === "sent"), results });
}
