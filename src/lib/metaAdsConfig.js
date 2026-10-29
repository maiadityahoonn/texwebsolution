import { createClient } from "@supabase/supabase-js";
import { cacheGetJson, cacheSetJson, cacheDel } from "@/lib/upstashCache";

const CONFIG_CACHE_KEY = "crm:meta-ads:config";
const CONFIG_CACHE_TTL = 180; // 3 minutes cache

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function resolveConfigWithEnv(db = {}) {
  const datasetId = String(db.dataset_id || process.env.META_CAPI_DATASET_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();
  const pixelId = String(db.pixel_id || db.dataset_id || process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_CAPI_DATASET_ID || "").trim();
  const capiAccessToken = String(db.capi_access_token || process.env.META_CAPI_ACCESS_TOKEN || "").trim();
  const pageAccessToken = String(db.page_access_token || process.env.META_PAGE_ACCESS_TOKEN || "").trim();
  const webhookVerifyToken = String(db.webhook_verify_token || process.env.META_WEBHOOK_VERIFY_TOKEN || "texweb_meta_leads_secret").trim();
  const testEventCode = db.test_event_code !== undefined ? String(db.test_event_code || "").trim() : String(process.env.META_CAPI_TEST_EVENT_CODE || "").trim();
  const apiVersion = String(db.api_version || process.env.META_CAPI_API_VERSION || "v26.0").trim();
  const crmName = String(db.crm_name || process.env.META_CAPI_CRM_NAME || "TexWeb CRM").trim();

  return {
    datasetId,
    pixelId,
    capiAccessToken,
    pageAccessToken,
    webhookVerifyToken,
    testEventCode,
    apiVersion,
    crmName,
    isFromDb: Boolean(db.dataset_id || db.capi_access_token),
    updatedAt: db.updated_at || null,
  };
}

/**
 * Retrieves the active Meta Ads and Dataset configuration in real-time.
 * Checks Redis cache -> Supabase `cms_content` ('meta_ads_config') -> Environment variables.
 * Ensures zero hardcoding and zero-downtime updates when Ads accounts change.
 */
export async function getMetaAdsConfig() {
  // 1. Check Redis cache
  try {
    const cached = await cacheGetJson(CONFIG_CACHE_KEY);
    if (cached && typeof cached === "object") {
      return resolveConfigWithEnv(cached);
    }
  } catch (err) {
    console.warn("[metaAdsConfig] Redis lookup failed:", err?.message);
  }

  // 2. Fetch from Supabase cms_content
  let dbConfig = null;
  try {
    const admin = getAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("cms_content")
        .select("content_json")
        .eq("key", "meta_ads_config")
        .maybeSingle();

      if (!error && data?.content_json) {
        dbConfig = data.content_json;
      }
    }
  } catch (err) {
    console.warn("[metaAdsConfig] Supabase lookup failed:", err?.message);
  }

  // 3. Cache valid DB config
  if (dbConfig) {
    try {
      await cacheSetJson(CONFIG_CACHE_KEY, dbConfig, CONFIG_CACHE_TTL);
    } catch (_) {}
  }

  return resolveConfigWithEnv(dbConfig || {});
}

/**
 * Updates Meta Ads & Dataset configuration in real time in Supabase `cms_content`.
 * Instantly purges cache so all incoming webhook events, CAPI conversions, and
 * frontend tracking immediately switch to the new dataset without redeploying.
 */
export async function saveMetaAdsConfig(updates = {}, updatedBy = null) {
  const admin = getAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client not configured.");
  }

  const { data: existing } = await admin
    .from("cms_content")
    .select("content_json")
    .eq("key", "meta_ads_config")
    .maybeSingle();

  const prev = existing?.content_json || {};
  const cleanedUpdates = {};

  if (updates.dataset_id !== undefined) cleanedUpdates.dataset_id = String(updates.dataset_id || "").trim();
  if (updates.pixel_id !== undefined) cleanedUpdates.pixel_id = String(updates.pixel_id || "").trim();
  if (updates.capi_access_token !== undefined) cleanedUpdates.capi_access_token = String(updates.capi_access_token || "").trim();
  if (updates.page_access_token !== undefined) cleanedUpdates.page_access_token = String(updates.page_access_token || "").trim();
  if (updates.webhook_verify_token !== undefined) cleanedUpdates.webhook_verify_token = String(updates.webhook_verify_token || "").trim();
  if (updates.test_event_code !== undefined) cleanedUpdates.test_event_code = String(updates.test_event_code || "").trim();
  if (updates.api_version !== undefined) cleanedUpdates.api_version = String(updates.api_version || "v26.0").trim();
  if (updates.crm_name !== undefined) cleanedUpdates.crm_name = String(updates.crm_name || "TexWeb CRM").trim();

  const merged = {
    ...prev,
    ...cleanedUpdates,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy || prev.updated_by || null,
  };

  const { error } = await admin
    .from("cms_content")
    .upsert({
      key: "meta_ads_config",
      content_json: merged,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

  if (error) {
    throw new Error(`Failed to save Meta Ads config: ${error.message}`);
  }

  // Purge Redis cache immediately
  try {
    await cacheDel(CONFIG_CACHE_KEY);
  } catch (_) {}

  return resolveConfigWithEnv(merged);
}
