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

function validDeviceToken(value) {
  const token = String(value || "").trim();
  return token.length >= 20 && token.length <= 4096 && !/\s/.test(token) ? token : "";
}

export async function POST(request) {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (!requester) return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  if (isBodyTooLarge(request, 12_288)) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });

  const body = await request.json().catch(() => ({}));
  const token = validDeviceToken(body.token);
  if (!token) return NextResponse.json({ error: "Valid native push token is required." }, { status: 400 });
  const platform = body.platform === "ios" ? "ios" : "android";
  const appId = String(body.app_id || "in.texwebsolution.crm").trim().slice(0, 160);
  if (appId !== "in.texwebsolution.crm") {
    return NextResponse.json({ error: "Unexpected application identifier." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("push_device_tokens")
    .upsert({
      user_id: requester.id,
      token,
      platform,
      app_id: appId,
      device_name: String(body.device_name || "").slice(0, 200) || null,
      user_agent: String(request.headers.get("user-agent") || "").slice(0, 500),
      is_active: true,
      updated_at: now,
    }, { onConflict: "token" })
    .select("id, platform, app_id, is_active, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ device: data });
}

export async function DELETE(request) {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (!requester) return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });

  const token = validDeviceToken(new URL(request.url).searchParams.get("token"));
  let query = admin
    .from("push_device_tokens")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", requester.id);
  if (token) query = query.eq("token", token);
  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
