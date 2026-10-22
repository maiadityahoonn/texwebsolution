import { createSign } from "crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIREBASE_MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
let cachedAccessToken = { value: "", expiresAt: 0 };

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function normalizePrivateKey(value) {
  return String(value || "")
    .trim()
    .replace(/^(["'])|(["'])$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
}

export function getFirebaseAdminEnvironment() {
  return {
    projectId: String(process.env.FIREBASE_PROJECT_ID || "").trim(),
    clientEmail: String(process.env.FIREBASE_CLIENT_EMAIL || "").trim(),
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    cronSecret: String(process.env.CRON_SECRET || "").trim(),
  };
}

export function validateFirebaseAdminEnvironment(environment = getFirebaseAdminEnvironment()) {
  const configured = {
    firebase_project_id: Boolean(environment.projectId),
    firebase_client_email: Boolean(environment.clientEmail),
    firebase_private_key: Boolean(environment.privateKey),
    cron_secret: Boolean(environment.cronSecret),
  };
  const valid = {
    firebase_project_id: /^[a-z0-9][a-z0-9-]{3,62}$/i.test(environment.projectId),
    firebase_client_email: /^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/i.test(environment.clientEmail),
    firebase_private_key:
      environment.privateKey.startsWith("-----BEGIN PRIVATE KEY-----") &&
      environment.privateKey.endsWith("-----END PRIVATE KEY-----"),
    cron_secret: environment.cronSecret.length >= 32,
  };
  return {
    configured,
    valid,
    messagingReady:
      configured.firebase_project_id
      && configured.firebase_client_email
      && configured.firebase_private_key
      && valid.firebase_project_id
      && valid.firebase_client_email
      && valid.firebase_private_key,
    ready: Object.values(configured).every(Boolean) && Object.values(valid).every(Boolean),
  };
}

function createServiceAccountAssertion(environment) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: environment.clientEmail,
    scope: FIREBASE_MESSAGING_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64Url(signer.sign(environment.privateKey))}`;
}

export async function getFirebaseAccessToken(environment = getFirebaseAdminEnvironment()) {
  if (cachedAccessToken.value && cachedAccessToken.expiresAt - TOKEN_REFRESH_BUFFER_MS > Date.now()) {
    return { ok: true, accessToken: cachedAccessToken.value };
  }
  try {
    const assertion = createServiceAccountAssertion(environment);
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.access_token) {
      return { ok: false, code: payload?.error || `oauth_http_${response.status}` };
    }
    cachedAccessToken = {
      value: payload.access_token,
      expiresAt: Date.now() + Math.max(60, Number(payload.expires_in || 3600)) * 1000,
    };
    return { ok: true, accessToken: payload.access_token };
  } catch (error) {
    const privateKeyError = /key|PEM|DECODER|asn1/i.test(String(error?.message || ""));
    return { ok: false, code: privateKeyError ? "invalid_private_key" : "oauth_request_failed" };
  }
}

function getFcmErrorCode(payload, status) {
  const details = Array.isArray(payload?.error?.details) ? payload.error.details : [];
  const fcmDetail = details.find((item) => item?.errorCode);
  return String(fcmDetail?.errorCode || payload?.error?.status || `fcm_http_${status}`).toUpperCase();
}

async function postFcmMessage(environment, accessToken, message, validateOnly = false) {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(environment.projectId)}/messages:send`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ message, validate_only: validateOnly }),
      cache: "no-store",
    },
  );
  const payload = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    code: response.ok ? "sent" : getFcmErrorCode(payload, response.status),
  };
}

export async function validateFirebaseMessagingAccess(environment, accessToken) {
  const result = await postFcmMessage(environment, accessToken, {
    token: "firebase-configuration-check",
    data: { check: "true" },
  }, true);
  if (result.ok || (result.status === 400 && result.code === "INVALID_ARGUMENT")) {
    return { ok: true, code: result.ok ? "validated" : "authorized_validation_response" };
  }
  return { ok: false, code: result.code };
}

function stringifyData(data = {}) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [String(key).slice(0, 100), String(value).slice(0, 1000)]),
  );
}

export async function sendNativePushToUser(admin, userId, notification) {
  const environment = getFirebaseAdminEnvironment();
  const environmentCheck = validateFirebaseAdminEnvironment(environment);
  if (!environmentCheck.messagingReady) {
    return [{ channel: "native_push", status: "skipped", reason: "firebase_not_configured" }];
  }

  const { data: devices, error } = await admin
    .from("push_device_tokens")
    .select("id, token, platform")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(20);
  if (error) return [{ channel: "native_push", status: "skipped", reason: "device_tokens_unavailable" }];
  if (!devices?.length) return [{ channel: "native_push", status: "skipped", reason: "no_active_device" }];

  const oauth = await getFirebaseAccessToken(environment);
  if (!oauth.ok) return [{ channel: "native_push", status: "failed", reason: oauth.code }];

  const title = String(notification?.title || "TexWeb CRM").slice(0, 160);
  const body = String(notification?.message || "You have a new CRM notification.").slice(0, 1000);
  const linkUrl = String(notification?.link_url || "/crm/alerts");
  const results = [];
  for (const device of devices) {
    const result = await postFcmMessage(environment, oauth.accessToken, {
      token: device.token,
      notification: { title, body },
      data: stringifyData({
        notification_id: notification?.id,
        type: notification?.type || "general",
        link_url: linkUrl,
        ...(notification?.metadata || {}),
      }),
      android: {
        priority: "HIGH",
        notification: {
          channel_id: "crm_reminders",
          sound: "default",
          tag: notification?.id || undefined,
        },
      },
    });
    const invalidToken = ["UNREGISTERED", "INVALID_ARGUMENT", "SENDER_ID_MISMATCH"].includes(result.code);
    await admin
      .from("push_device_tokens")
      .update({
        is_active: !invalidToken,
        last_used_at: result.ok ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", device.id);
    results.push({
      channel: "native_push",
      platform: device.platform,
      status: result.ok ? "sent" : "failed",
      code: result.code,
    });
  }
  return results;
}
