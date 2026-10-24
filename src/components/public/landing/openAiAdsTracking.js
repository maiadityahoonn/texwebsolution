"use client";

export const OPENAI_ADS_PIXEL_ID = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID || "";

export function trackOpenAiAdsEvent(eventName, data = {}, eventId = null) {
  if (typeof window === "undefined" || typeof window.oaiq !== "function") return false;

  try {
    const payload = {
      type: data.type || "customer_action",
      ...(eventId ? { event_id: String(eventId) } : {}),
    };
    window.oaiq(
      "measure",
      eventName,
      payload,
      eventId ? { event_id: String(eventId) } : undefined
    );
    return true;
  } catch (error) {
    console.warn("OpenAI Ads tracking event error:", error);
    return false;
  }
}
