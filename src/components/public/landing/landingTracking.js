"use client";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1117053014586521";
const PENDING_META_LEAD_KEY = "texweb_pending_meta_lead_conversion";
const PENDING_META_LEAD_MAX_AGE_MS = 30 * 60 * 1000;

export function queueMetaLeadConversion({ eventId, leadData = {}, registrationData = {} }) {
  if (typeof window === "undefined" || !eventId) return false;

  try {
    const stored = sessionStorage.getItem(PENDING_META_LEAD_KEY);
    const previous = stored ? JSON.parse(stored) : null;
    const sameEvent = previous?.eventId === String(eventId) ? previous : {};
    sessionStorage.setItem(PENDING_META_LEAD_KEY, JSON.stringify({
      eventId: String(eventId),
      leadData: { ...(sameEvent.leadData || {}), ...leadData },
      registrationData: { ...(sameEvent.registrationData || {}), ...registrationData },
      createdAt: Date.now(),
    }));
    return true;
  } catch (_) {
    return false;
  }
}

export function consumePendingMetaLeadConversion() {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(PENDING_META_LEAD_KEY);
    sessionStorage.removeItem(PENDING_META_LEAD_KEY);
    if (!stored) return null;

    const pending = JSON.parse(stored);
    const createdAt = Number(pending?.createdAt || 0);
    if (!pending?.eventId || !createdAt || Date.now() - createdAt > PENDING_META_LEAD_MAX_AGE_MS) {
      return null;
    }
    return pending;
  } catch (_) {
    return null;
  }
}

/**
 * Safely parse and persist UTM and ad tracking parameters
 */
export function getTrackingParams() {
  if (typeof window === "undefined") return {};

  const urlParams = new URLSearchParams(window.location.search);
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "ad_id",
    "adset_id",
    "campaign_id",
    "placement",
    "gclid"
  ];

  const currentParams = {};
  keys.forEach((key) => {
    const val = urlParams.get(key);
    if (val) currentParams[key] = val;
  });

  // If URL has params, persist them to sessionStorage for session durability
  try {
    if (Object.keys(currentParams).length > 0) {
      sessionStorage.setItem("texweb_tracking_params", JSON.stringify(currentParams));
      return currentParams;
    }
    const cached = sessionStorage.getItem("texweb_tracking_params");
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // ignore sessionStorage errors
  }

  return currentParams;
}

/**
 * Format notes string with full tracking attribution for CRM Leads
 */
export function buildTrackingNotes({ service, budget, timeline, message, extra = {} }) {
  const params = getTrackingParams();
  const parts = [];

  if (service) parts.push(`Service: ${service}`);
  if (budget) parts.push(`Budget: ${budget}`);
  if (timeline) parts.push(`Timeline: ${timeline}`);
  if (message) parts.push(`Requirement: ${message}`);

  // Attribution details
  const attributionParts = [];
  if (params.utm_source) attributionParts.push(`Source: ${params.utm_source}`);
  if (params.utm_medium) attributionParts.push(`Medium: ${params.utm_medium}`);
  if (params.utm_campaign) attributionParts.push(`Campaign: ${params.utm_campaign}`);
  if (params.utm_content) attributionParts.push(`Ad Content: ${params.utm_content}`);
  if (params.ad_id) attributionParts.push(`Ad ID: ${params.ad_id}`);
  if (params.fbclid) attributionParts.push(`fbclid: ${params.fbclid.slice(0, 30)}...`);

  if (attributionParts.length > 0) {
    parts.push(`[Meta Ads Attribution: ${attributionParts.join(" | ")}]`);
  }

  Object.entries(extra).forEach(([k, v]) => {
    if (v) parts.push(`${k}: ${v}`);
  });

  return parts.join("\n");
}

/**
 * Client-Side Meta Pixel Event Trigger
 */
export function trackMetaEvent(eventName, customData = {}, eventId = null) {
  if (typeof window === "undefined") return;

  try {
    const isDeferredConversion =
      eventId &&
      window.location.pathname !== "/thank-you" &&
      (eventName === "Lead" || eventName === "CompleteRegistration");
    if (isDeferredConversion) {
      queueMetaLeadConversion({
        eventId,
        leadData: eventName === "Lead" ? customData : {},
        registrationData: eventName === "CompleteRegistration" ? customData : {},
      });
      return;
    }

    const params = getTrackingParams();
    const eventPayload = {
      ...customData,
      utm_source: params.utm_source || "meta_ads",
      utm_campaign: params.utm_campaign || "direct",
      page_path: window.location.pathname,
      timestamp: new Date().toISOString()
    };
    if (eventId) {
      eventPayload.event_id = String(eventId);
    }

    if (typeof window.fbq === "function") {
      const standardEvents = [
        "PageView",
        "Lead",
        "Contact",
        "CompleteRegistration",
        "InitiateCheckout",
        "ViewContent",
        "Search"
      ];

      const options = eventId ? { eventID: String(eventId) } : undefined;

      if (standardEvents.includes(eventName)) {
        if (options) {
          window.fbq("track", eventName, eventPayload, options);
        } else {
          window.fbq("track", eventName, eventPayload);
        }
      } else {
        if (options) {
          window.fbq("trackCustom", eventName, eventPayload, options);
        } else {
          window.fbq("trackCustom", eventName, eventPayload);
        }
      }
    }

    // Also push to dataLayer for Google Tag Manager / Analytics if present
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        meta_event: eventName,
        ...eventPayload
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Meta Tracking] ${eventName}:`, eventPayload);
    }
  } catch (err) {
    console.warn("Tracking event error:", err);
  }
}
