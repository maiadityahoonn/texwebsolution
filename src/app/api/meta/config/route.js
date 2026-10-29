import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getBearerToken, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";
import { getMetaAdsConfig, saveMetaAdsConfig } from "@/lib/metaAdsConfig";

const CRM_ADMIN_ROLES = new Set(["super_admin", "admin", "sales_head"]);

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
  return profile.role || "";
}

async function getAdminRequester(request) {
  const admin = getAdminClient();
  if (!admin) return null;
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
  return CRM_ADMIN_ROLES.has(role) ? { user, profile, role } : null;
}

function maskSecret(token = "") {
  if (!token || token.length < 12) return token ? "••••••••" : "";
  return `${token.slice(0, 7)}...${token.slice(-5)}`;
}

/**
 * GET: Returns active Meta Ads & Dataset configuration in real-time.
 * - Public callers get only public pixel_id for browser tracking.
 * - CRM Admins get full configuration details for management.
 */
export async function GET(request) {
  try {
    const config = await getMetaAdsConfig();
    const requester = await getAdminRequester(request);

    if (!requester) {
      // Public response for landing page & tracking scripts
      return NextResponse.json({
        ok: true,
        pixel_id: config.pixelId,
        dataset_id: config.datasetId,
      }, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }

    // Authenticated CRM Admin response
    return NextResponse.json({
      ok: true,
      config: {
        dataset_id: config.datasetId,
        pixel_id: config.pixelId,
        capi_access_token_masked: maskSecret(config.capiAccessToken),
        has_capi_token: Boolean(config.capiAccessToken),
        page_access_token_masked: maskSecret(config.pageAccessToken),
        has_page_token: Boolean(config.pageAccessToken),
        webhook_verify_token: config.webhookVerifyToken,
        test_event_code: config.testEventCode,
        api_version: config.apiVersion,
        crm_name: config.crmName,
        is_from_db: config.isFromDb,
        updated_at: config.updatedAt,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to fetch Meta configuration" }, { status: 500 });
  }
}

/**
 * POST: Saves updated Meta Ads Account & Dataset configuration in real-time.
 * Strictly restricted to Super Admin, Admin, and Sales Head roles.
 */
export async function POST(request) {
  try {
    const requester = await getAdminRequester(request);
    if (!requester) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    if (!isJsonRequest(request)) {
      return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
    }
    if (isBodyTooLarge(request, 16_384)) {
      return NextResponse.json({ error: "Request body too large." }, { status: 413 });
    }

    const body = await request.json().catch(() => ({}));
    const updates = {};

    if (typeof body.dataset_id === "string") updates.dataset_id = body.dataset_id.trim();
    if (typeof body.pixel_id === "string") updates.pixel_id = body.pixel_id.trim();
    if (typeof body.capi_access_token === "string" && !body.capi_access_token.includes("...")) {
      updates.capi_access_token = body.capi_access_token.trim();
    }
    if (typeof body.page_access_token === "string" && !body.page_access_token.includes("...")) {
      updates.page_access_token = body.page_access_token.trim();
    }
    if (typeof body.webhook_verify_token === "string") {
      updates.webhook_verify_token = body.webhook_verify_token.trim();
    }
    if (typeof body.test_event_code === "string") {
      updates.test_event_code = body.test_event_code.trim();
    }
    if (typeof body.api_version === "string") {
      updates.api_version = body.api_version.trim();
    }
    if (typeof body.crm_name === "string") {
      updates.crm_name = body.crm_name.trim();
    }

    const updated = await saveMetaAdsConfig(updates, requester.user.id);

    return NextResponse.json({
      ok: true,
      message: "Meta Ads and Dataset configuration updated successfully in real-time.",
      config: {
        dataset_id: updated.datasetId,
        pixel_id: updated.pixelId,
        webhook_verify_token: updated.webhookVerifyToken,
        test_event_code: updated.testEventCode,
        api_version: updated.apiVersion,
        crm_name: updated.crmName,
        is_from_db: updated.isFromDb,
        updated_at: updated.updatedAt,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to save Meta configuration." }, { status: 500 });
  }
}
