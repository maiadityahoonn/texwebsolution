import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";

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
  const limited = await checkApiRateLimit(`cms-upsert:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
  }

  const {
    data: { user: requester },
    error: requesterError,
  } = await admin.auth.getUser(token);

  if (requesterError || !requester) {
    return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });
  }

  const { data: requesterProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", requester.id)
    .single();

  const requesterRole = requesterProfile?.role || "";
  if (!["super_admin", "hr"].includes(requesterRole)) {
    return NextResponse.json({ error: "Only Admin or HR can update CMS content." }, { status: 403 });
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 131_072)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const key = body.key?.trim();
  const contentJson = body.content_json;
  if (!key || !contentJson || typeof contentJson !== "object" || Array.isArray(contentJson)) {
    return NextResponse.json({ error: "CMS key and JSON object are required." }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("cms_content")
    .select("content_json")
    .eq("key", key)
    .single();

  const { data: saved, error: saveError } = await admin
    .from("cms_content")
    .upsert({ key, content_json: contentJson, updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select()
    .single();

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 400 });
  }

  if (existing?.content_json) {
    const { data: latestVersion } = await admin
      .from("cms_versions")
      .select("version_no")
      .eq("cms_key", key)
      .order("version_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    await admin.from("cms_versions").insert([{
      cms_key: key,
      content_json: existing.content_json,
      version_no: Number(latestVersion?.version_no || 0) + 1,
      created_by: requester.id,
    }]);
  }

  await admin.from("audit_logs").insert([{
    actor_id: requester.id,
    actor_role: requesterRole,
    action: body.restore_version ? "cms.restore" : "cms.update",
    entity_type: "cms_content",
    entity_id: key,
    summary: body.restore_version ? `Restored CMS block ${key}` : `Updated CMS block ${key}`,
    metadata: { restore_version: body.restore_version || null },
  }]);

  return NextResponse.json({ content: saved });
}
