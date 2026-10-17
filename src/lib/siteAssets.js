import { supabase } from "@/lib/supabase";

export const SUPABASE_STORAGE_BASE = "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets";

/**
 * Returns the Supabase Storage public CDN URL for an asset path.
 * If the path is already an absolute HTTP/HTTPS URL, returns it unchanged.
 */
export function getAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${SUPABASE_STORAGE_BASE}/${cleanPath}`;
}

/**
 * Fetches JSON content from Supabase `cms_content` table by key.
 * Returns null if not found or on network error.
 */
export async function fetchCmsKey(key) {
  try {
    const { data, error } = await supabase
      .from("cms_content")
      .select("content_json")
      .eq("key", key)
      .single();

    if (error || !data) return null;
    return data.content_json;
  } catch (err) {
    console.warn(`[siteAssets] Error fetching '${key}' from cms_content:`, err?.message);
    return null;
  }
}
