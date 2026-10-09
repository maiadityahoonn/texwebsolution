const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "") || "";
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

function isEnabled() {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

export async function redisCommand(command = []) {
  if (!isEnabled() || !Array.isArray(command) || command.length === 0) {
    return { ok: false, skipped: true, result: null };
  }
  try {
    const response = await fetch(UPSTASH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body?.error) {
      return { ok: false, error: body?.error || response.statusText, result: null };
    }
    return { ok: true, result: body.result };
  } catch (err) {
    return { ok: false, error: err?.message || "Upstash request failed", result: null };
  }
}

export async function cacheGetJson(key) {
  const res = await redisCommand(["GET", key]);
  if (!res.ok || !res.result) return null;
  try {
    return JSON.parse(res.result);
  } catch {
    return null;
  }
}

export async function cacheSetJson(key, value, ttlSeconds = 60) {
  return redisCommand(["SET", key, JSON.stringify(value), "EX", String(ttlSeconds)]);
}

export async function cacheDel(key) {
  return redisCommand(["DEL", key]);
}

export async function cacheSetNx(key, value = "1", ttlSeconds = 2_592_000) {
  const res = await redisCommand(["SET", key, String(value), "NX", "EX", String(ttlSeconds)]);
  return res.ok && res.result === "OK";
}

export async function pushQueue(key, value, { ttlSeconds = 86_400, maxItems = 100 } = {}) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  await redisCommand(["LPUSH", key, serialized]);
  await redisCommand(["LTRIM", key, "0", String(Math.max(0, maxItems - 1))]);
  await redisCommand(["EXPIRE", key, String(ttlSeconds)]);
}
