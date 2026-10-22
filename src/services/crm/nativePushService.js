import { getAuthToken } from "@/services/supabase/client";

const TOKEN_STORAGE_KEY = "texweb_native_push_token";

export function getStoredNativePushToken() {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function storeNativePushToken(token) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {}
}

export async function registerNativePushToken(token, platform = "android") {
  const authToken = await getAuthToken(true);
  if (!authToken || !token) return false;
  const response = await fetch("/api/notifications/device-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      token,
      platform,
      app_id: "in.texwebsolution.crm",
      device_name: typeof navigator !== "undefined" ? navigator.userAgent : "",
    }),
  });
  if (response.ok) storeNativePushToken(token);
  return response.ok;
}

export async function deactivateStoredNativePushToken() {
  const token = getStoredNativePushToken();
  if (!token) return true;
  const authToken = await getAuthToken();
  if (!authToken) return false;
  const response = await fetch(`/api/notifications/device-token?token=${encodeURIComponent(token)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
    keepalive: true,
  });
  if (response.ok && typeof window !== "undefined") {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
  }
  return response.ok;
}
