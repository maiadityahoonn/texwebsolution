import { createSign } from "crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIREBASE_MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

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

function getFirebaseEnvironment() {
  return {
    projectId: String(process.env.FIREBASE_PROJECT_ID || "").trim(),
    clientEmail: String(process.env.FIREBASE_CLIENT_EMAIL || "").trim(),
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    cronSecret: String(process.env.CRON_SECRET || "").trim(),
  };
}

function validateEnvironment(environment) {
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

async function requestAccessToken(environment) {
  const assertion = createServiceAccountAssertion(environment);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    return {
      ok: false,
      code: payload?.error || `oauth_http_${response.status}`,
    };
  }
  return { ok: true, accessToken: payload.access_token };
}

async function checkFcmApi(environment, accessToken) {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(environment.projectId)}/messages:send`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        validate_only: true,
        message: {
          token: "firebase-configuration-check",
          data: { check: "true" },
        },
      }),
      cache: "no-store",
    },
  );
  const payload = await response.json().catch(() => ({}));
  const googleStatus = String(payload?.error?.status || "").toUpperCase();
  const authorizedValidationResponse = response.status === 400 && googleStatus === "INVALID_ARGUMENT";
  if (response.ok || authorizedValidationResponse) {
    return { ok: true, code: response.ok ? "validated" : "authorized_validation_response" };
  }
  return {
    ok: false,
    code: googleStatus || `fcm_http_${response.status}`,
  };
}

export async function checkFirebaseAdminConfiguration() {
  const environment = getFirebaseEnvironment();
  const environmentCheck = validateEnvironment(environment);
  if (!environmentCheck.ready) {
    return {
      ok: false,
      environment: environmentCheck,
      google_oauth: { ok: false, code: "not_attempted" },
      fcm_http_v1: { ok: false, code: "not_attempted" },
    };
  }

  try {
    const oauth = await requestAccessToken(environment);
    if (!oauth.ok) {
      return {
        ok: false,
        environment: environmentCheck,
        google_oauth: oauth,
        fcm_http_v1: { ok: false, code: "not_attempted" },
      };
    }
    const fcm = await checkFcmApi(environment, oauth.accessToken);
    return {
      ok: oauth.ok && fcm.ok,
      environment: environmentCheck,
      google_oauth: { ok: oauth.ok, code: oauth.ok ? "authenticated" : oauth.code },
      fcm_http_v1: fcm,
    };
  } catch (error) {
    const privateKeyError = /key|PEM|DECODER|asn1/i.test(String(error?.message || ""));
    return {
      ok: false,
      environment: environmentCheck,
      google_oauth: { ok: false, code: privateKeyError ? "invalid_private_key" : "request_failed" },
      fcm_http_v1: { ok: false, code: "not_attempted" },
    };
  }
}
