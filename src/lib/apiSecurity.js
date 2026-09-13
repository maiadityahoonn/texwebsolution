export function getBearerToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

export function getClientIp(request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

export function cleanText(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export function cleanPhone(value, max = 30) {
  return cleanText(value, max).replace(/[^0-9+]/g, "");
}

export function normalizeEmail(value) {
  return cleanText(value, 160).toLowerCase();
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}

export function isJsonRequest(request) {
  const contentType = request.headers.get("content-type") || "";
  return contentType.toLowerCase().includes("application/json");
}

export function isBodyTooLarge(request, maxBytes = 32_768) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(contentLength) && contentLength > maxBytes;
}
