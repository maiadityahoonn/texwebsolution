import { createPrivateKey, sign as cryptoSign } from "crypto";
import { sendNativePushToUser } from "@/lib/firebaseAdminMessaging";

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBuffer(value) {
  const padded = `${value}`.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function createVapidJwt(audience) {
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY || "";
  if (!publicKey || !privateKey) return null;

  const publicBytes = base64UrlToBuffer(publicKey);
  const privateBytes = base64UrlToBuffer(privateKey);
  if (publicBytes.length !== 65 || publicBytes[0] !== 4 || privateBytes.length !== 32) return null;

  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: base64Url(publicBytes.subarray(1, 33)),
    y: base64Url(publicBytes.subarray(33, 65)),
    d: base64Url(privateBytes),
  };

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = base64Url(JSON.stringify({
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: process.env.WEB_PUSH_CONTACT_EMAIL || "mailto:notifications@texwebsolution.in",
  }));
  const unsigned = `${header}.${payload}`;
  const signer = cryptoSign("sha256", Buffer.from(unsigned), createPrivateKey({ format: "jwk", key: jwk }));
  return {
    token: `${unsigned}.${base64Url(signer)}`,
    authorization: `vapid t=${unsigned}.${base64Url(signer)}, k=${publicKey}`,
  };
}

export async function sendWebPushToUser(admin, userId) {
  try {
    const { data: subscriptions } = await admin
      .from("push_subscriptions")
      .select("id, endpoint")
      .eq("user_id", userId)
      .eq("is_active", true)
      .like("endpoint", "https://%")
      .limit(20);

    if (!subscriptions?.length) return [];

    const results = [];
    for (const subscription of subscriptions) {
      try {
        const audience = new URL(subscription.endpoint).origin;
        const vapid = createVapidJwt(audience);
        if (!vapid) continue;

        const response = await fetch(subscription.endpoint, {
          method: "POST",
          headers: {
            TTL: "600",
            Urgency: "high",
            Authorization: vapid.authorization,
            "Content-Length": "0",
          },
        });
        const status = response.ok ? "sent" : "failed";
        results.push({ endpoint: subscription.endpoint, status, code: response.status });
        const updatePayload = {
          is_active: response.status === 404 || response.status === 410 ? false : true,
          updated_at: new Date().toISOString(),
        };
        if (response.ok) updatePayload.last_used_at = new Date().toISOString();
        await admin.from("push_subscriptions").update(updatePayload).eq("id", subscription.id);
      } catch (error) {
        results.push({ endpoint: subscription.endpoint, status: "failed", reason: error?.message || "push_failed" });
      }
    }
    return results;
  } catch (err) {
    console.warn("Web push dispatch failed:", err?.message);
    return [];
  }
}

export async function dispatchPushToUsers(admin, userIds = [], notification = {}) {
  if (!admin || !userIds.length) return [];
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const results = [];

  for (const userId of uniqueIds) {
    try {
      const [nativeResults, webResults] = await Promise.all([
        sendNativePushToUser(admin, userId, notification),
        sendWebPushToUser(admin, userId),
      ]);
      results.push({ userId, native: nativeResults, web: webResults });
    } catch (err) {
      console.warn(`Push dispatch failed for user ${userId}:`, err?.message);
    }
  }

  return results;
}
