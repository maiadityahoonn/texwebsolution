import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getBearerToken, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getRequester(admin, request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function POST(request) {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (!requester) return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  if (isBodyTooLarge(request, 24_576)) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });

  const body = await request.json().catch(() => ({}));
  const subscription = body.subscription && typeof body.subscription === "object" ? body.subscription : null;
  const endpoint = String(subscription?.endpoint || "").trim();
  if (!endpoint || !endpoint.startsWith("https://")) {
    return NextResponse.json({ error: "Valid push subscription endpoint is required." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("push_subscriptions")
    .upsert({
      user_id: requester.id,
      endpoint,
      subscription,
      user_agent: String(body.user_agent || request.headers.get("user-agent") || "").slice(0, 500),
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "endpoint" })
    .select("id, endpoint, is_active, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ subscription: data });
}

export async function DELETE(request) {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (!requester) return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });

  const endpoint = new URL(request.url).searchParams.get("endpoint");
  let query = admin
    .from("push_subscriptions")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", requester.id);
  if (endpoint) query = query.eq("endpoint", endpoint);
  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
