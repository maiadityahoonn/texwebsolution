import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/apiSecurity";
import { checkFirebaseAdminConfiguration } from "@/lib/firebaseAdminCheck";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function authorizeRequest(request) {
  const cronSecret = String(process.env.CRON_SECRET || "").trim();
  const authHeader = request.headers.get("authorization") || "";
  const secretHeader = request.headers.get("x-cron-secret") || "";
  if (cronSecret && (authHeader === `Bearer ${cronSecret}` || secretHeader === cronSecret)) {
    return { ok: true };
  }

  const token = getBearerToken(request);
  if (!token) return { ok: false, status: 401, error: "Authorization required." };
  const admin = getAdminClient();
  if (!admin) return { ok: false, status: 500, error: "Server authentication is not configured." };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { ok: false, status: 401, error: "Invalid authorization token." };
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile || !["super_admin", "admin"].includes(profile.role)) {
    return { ok: false, status: 403, error: "Admin access required." };
  }
  return { ok: true };
}

async function handleStatus(request) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) {
    return NextResponse.json(
      { ok: false, error: authorization.error },
      { status: authorization.status, headers: { "cache-control": "no-store" } },
    );
  }

  const result = await checkFirebaseAdminConfiguration();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}

export async function GET(request) {
  return handleStatus(request);
}

export async function POST(request) {
  return handleStatus(request);
}
