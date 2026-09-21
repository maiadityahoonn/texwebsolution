import { NextResponse } from "next/server";

// In-memory cache for link metadata (URL -> { data, expiresAt })
const previewCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_SIZE = 500;

function isPrivateIpOrHost(hostname) {
  if (!hostname) return true;
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "::1" ||
    lower === "0.0.0.0" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }
  // Check IPv4 private ranges: 10.x, 172.16-31.x, 192.168.x
  const parts = lower.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
  }
  return false;
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return "";
      }
    })
    .replace(/\s+/g, " ")
    .trim();
}

function extractMetaTag(html, propertyOrName) {
  const escaped = propertyOrName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex1 = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i");
  const match1 = html.match(regex1);
  if (match1 && match1[1]) return match1[1].trim();

  const regex2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, "i");
  const match2 = html.match(regex2);
  if (match2 && match2[1]) return match2[1].trim();

  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url")?.trim();

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Invalid protocol. Only http/https supported." }, { status: 400 });
    }
    if (isPrivateIpOrHost(parsedUrl.hostname)) {
      return NextResponse.json({ error: "Restricted host." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 });
  }

  // Cache check
  const now = Date.now();
  const cached = previewCache.get(targetUrl);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 (compatible; WhatsApp/2.24)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    }).finally(() => clearTimeout(timeoutId));

    const contentType = res.headers.get("content-type") || "";

    // If it's a direct image URL
    if (contentType.startsWith("image/")) {
      const result = {
        url: targetUrl,
        domain: parsedUrl.hostname.replace(/^www\./, ""),
        title: parsedUrl.pathname.split("/").filter(Boolean).pop() || "Image",
        description: `${parsedUrl.hostname} image`,
        image: targetUrl,
        site_name: parsedUrl.hostname.replace(/^www\./, ""),
      };
      previewCache.set(targetUrl, { data: result, expiresAt: now + CACHE_TTL_MS });
      return NextResponse.json(result);
    }

    // Read initial HTML text (up to 300KB)
    const rawHtml = await res.text();
    const html = rawHtml.slice(0, 300_000);

    // Extract Title
    let title =
      extractMetaTag(html, "og:title") ||
      extractMetaTag(html, "twitter:title");
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1];
      }
    }
    title = decodeHtmlEntities(title || parsedUrl.hostname.replace(/^www\./, "")).slice(0, 150);

    // Extract Description
    let description =
      extractMetaTag(html, "og:description") ||
      extractMetaTag(html, "twitter:description") ||
      extractMetaTag(html, "description");
    description = decodeHtmlEntities(description || "").slice(0, 260);

    // Extract Image (with WhatsApp fallback hierarchy)
    let rawImage =
      extractMetaTag(html, "og:image") ||
      extractMetaTag(html, "og:image:secure_url") ||
      extractMetaTag(html, "twitter:image") ||
      extractMetaTag(html, "twitter:image:src");

    // Fallbacks: apple-touch-icon, alternate icon, image_src
    if (!rawImage) {
      const appleTouchMatch = html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']*)["']/i);
      if (appleTouchMatch && appleTouchMatch[1]) {
        rawImage = appleTouchMatch[1];
      }
    }
    if (!rawImage) {
      const altIconMatch = html.match(/<link[^>]+rel=["'][^"']*(?:alternate icon|image_src)[^"']*["'][^>]+href=["']([^"']*)["']/i);
      if (altIconMatch && altIconMatch[1]) {
        rawImage = altIconMatch[1];
      }
    }
    if (!rawImage) {
      const iconMatch = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']*)["']/i);
      if (iconMatch && iconMatch[1]) {
        rawImage = iconMatch[1];
      }
    }

    let image = null;
    if (rawImage) {
      try {
        image = new URL(rawImage, res.url || targetUrl).href;
      } catch {
        image = null;
      }
    }

    // Extract Favicon
    let favicon = null;
    const favMatch = html.match(/<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']*)["']/i);
    if (favMatch && favMatch[1]) {
      try {
        favicon = new URL(favMatch[1], res.url || targetUrl).href;
      } catch {
        favicon = null;
      }
    }
    if (!favicon) {
      favicon = `${parsedUrl.origin}/favicon.ico`;
    }

    // Extract Site Name
    let siteName =
      extractMetaTag(html, "og:site_name") ||
      extractMetaTag(html, "application-name");
    siteName = decodeHtmlEntities(siteName || parsedUrl.hostname.replace(/^www\./, "")).slice(0, 60);

    const result = {
      url: targetUrl,
      domain: parsedUrl.hostname.replace(/^www\./, ""),
      title,
      description,
      image: image || null,
      favicon: favicon || null,
      site_name: siteName,
    };

    if (previewCache.size >= MAX_CACHE_SIZE) {
      const firstKey = previewCache.keys().next().value;
      previewCache.delete(firstKey);
    }
    previewCache.set(targetUrl, { data: result, expiresAt: now + CACHE_TTL_MS });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
    });
  } catch {
    const fallbackResult = {
      url: targetUrl,
      domain: parsedUrl.hostname.replace(/^www\./, ""),
      title: parsedUrl.hostname.replace(/^www\./, ""),
      description: targetUrl,
      image: null,
      favicon: `${parsedUrl.origin}/favicon.ico`,
      site_name: parsedUrl.hostname.replace(/^www\./, ""),
    };
    return NextResponse.json(fallbackResult);
  }
}
