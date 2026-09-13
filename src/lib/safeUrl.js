export function safeExternalUrl(value, fallback = "#") {
  if (!value || typeof value !== "string") return fallback;
  try {
    const url = new URL(value, "https://texwebsolution.in");
    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:" || url.protocol === "tel:") {
      return url.href;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function safeInternalPath(value, fallback = "/") {
  if (!value || typeof value !== "string") return fallback;
  try {
    const url = new URL(value, "https://texwebsolution.in");
    if (url.origin !== "https://texwebsolution.in") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
