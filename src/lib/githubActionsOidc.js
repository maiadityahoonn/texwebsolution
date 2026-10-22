import { createPublicKey, verify as verifySignature } from "crypto";

const ISSUER = "https://token.actions.githubusercontent.com";
const AUDIENCE = "texweb-crm-reminders";
const JWKS_URL = `${ISSUER}/.well-known/jwks`;
const CACHE_MS = 6 * 60 * 60 * 1000;
let jwksCache = { keys: [], expiresAt: 0 };

function decodeJsonSegment(segment) {
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function getSigningKeys() {
  if (jwksCache.keys.length && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch(JWKS_URL, { cache: "no-store" });
  if (!response.ok) return [];
  const payload = await response.json().catch(() => ({}));
  const keys = Array.isArray(payload?.keys) ? payload.keys : [];
  jwksCache = { keys, expiresAt: Date.now() + CACHE_MS };
  return keys;
}

function validClaims(payload) {
  const repository = process.env.GITHUB_REMINDER_REPOSITORY || "maiadityahoonn/texwebsolution";
  const expectedWorkflow = `${repository}/.github/workflows/crm-reminders.yml@refs/heads/main`;
  const audiences = Array.isArray(payload?.aud) ? payload.aud : [payload?.aud];
  const now = Math.floor(Date.now() / 1000);
  return Boolean(
    payload?.iss === ISSUER
    && audiences.includes(AUDIENCE)
    && payload?.repository === repository
    && payload?.ref === "refs/heads/main"
    && payload?.workflow_ref === expectedWorkflow
    && ["schedule", "workflow_dispatch"].includes(payload?.event_name)
    && Number(payload?.exp) > now
    && Number(payload?.iat) <= now + 60
    && String(payload?.sub || "").startsWith(`repo:${repository}:`)
  );
}

export async function verifyGitHubActionsOidc(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return false;
  const header = decodeJsonSegment(parts[0]);
  const payload = decodeJsonSegment(parts[1]);
  if (header?.alg !== "RS256" || !header?.kid || payload?.iss !== ISSUER || !validClaims(payload)) return false;

  try {
    const keys = await getSigningKeys();
    const jwk = keys.find((key) => key?.kid === header.kid && key?.kty === "RSA");
    if (!jwk) return false;
    return verifySignature(
      "RSA-SHA256",
      Buffer.from(`${parts[0]}.${parts[1]}`),
      createPublicKey({ key: jwk, format: "jwk" }),
      Buffer.from(parts[2], "base64url"),
    );
  } catch {
    return false;
  }
}
