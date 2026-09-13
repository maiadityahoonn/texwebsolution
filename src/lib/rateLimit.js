const buckets = new Map();

async function checkUpstashRateLimit(key, { limit, windowMs }) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const bucketKey = `ratelimit:${key}:${Math.floor(Date.now() / windowMs)}`;
  const endpoint = url.replace(/\/$/, "");
  const increment = await fetch(`${endpoint}/incr/${encodeURIComponent(bucketKey)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!increment.ok) return null;

  const body = await increment.json();
  const count = Number(body.result || 0);
  if (count === 1) {
    await fetch(`${endpoint}/expire/${encodeURIComponent(bucketKey)}/${Math.ceil(windowMs / 1000)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => {});
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: Date.now() + windowMs,
    backend: "upstash",
  };
}

export async function checkApiRateLimit(key, options = {}) {
  const config = { limit: 30, windowMs: 60_000, ...options };
  try {
    const remote = await checkUpstashRateLimit(key, config);
    if (remote) return remote;
  } catch {
    // Fall back to the local bucket if Redis is unavailable.
  }
  return checkRateLimit(key, config);
}

export function checkRateLimit(key, { limit = 30, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucketKey = key || "anonymous";
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

export function rateLimitResponse(limitResult) {
  return {
    error: "Too many requests. Please try again after a short break.",
    retry_after_seconds: Math.max(1, Math.ceil((limitResult.resetAt - Date.now()) / 1000)),
  };
}
