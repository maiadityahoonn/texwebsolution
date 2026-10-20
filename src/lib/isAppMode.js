"use client";

/**
 * Checks whether the current session is running inside the standalone Mobile App / APK / PWA mode.
 */
export function isAppMode() {
  if (typeof window === "undefined") return false;

  try {
    // 1. Capacitor Native Platform check
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === "function") {
      if (window.Capacitor.isNativePlatform()) return true;
    }

    // 2. Query param or stored APK flag
    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.get("mode") === "app" ||
      searchParams.get("app") === "1" ||
      searchParams.get("source") === "apk" ||
      searchParams.get("source") === "pwa"
    ) {
      try {
        localStorage.setItem("texweb_app_mode", "true");
      } catch {}
      return true;
    }

    if (localStorage.getItem("texweb_app_mode") === "true") {
      return true;
    }

    // 3. Standalone PWA / WebAPK / TWA check
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      window.navigator.standalone === true ||
      (document.referrer && document.referrer.includes("android-app://"))
    ) {
      return true;
    }

    // 4. Android WebView detection
    const userAgent = navigator.userAgent || "";
    if (/Capacitor|wv|Android.*Version\/[0-9.]+/i.test(userAgent)) {
      return true;
    }
  } catch {}

  return false;
}
