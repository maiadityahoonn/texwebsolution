"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * AppBackButtonHandler manages Android hardware back button & web popstate events.
 * 
 * Rules:
 * 1. Closes any open modals first if one exists.
 * 2. Navigates back within CRM history.
 * 3. When at root (/crm/dashboard or /login), exits the app via App.exitApp().
 * 4. NEVER triggers a logout on back button.
 */
export default function AppBackButtonHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let removeListener = null;

    async function initNativeBackHandler() {
      try {
        if (typeof window === "undefined") return;

        // Check if Capacitor native environment is active
        const isNative =
          (window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform()) ||
          navigator.userAgent.includes("Capacitor");

        if (isNative) {
          const { App } = await import("@capacitor/app");

          const handle = await App.addListener("backButton", ({ canGoBack }) => {
            const currentPath = window.location.pathname;

            // 1. Check if any modal or drawer is open in the DOM
            const modalCloseBtn = document.querySelector(
              "[data-modal-close], button[aria-label='Close'], button[title='Close']"
            );
            const dialog = document.querySelector("[role='dialog'], .crm-modal-open");
            if (dialog && modalCloseBtn) {
              modalCloseBtn.click();
              return;
            }

            // 2. Check if we are at root screen (Dashboard or Login)
            const isRootScreen =
              currentPath === "/crm/dashboard" ||
              currentPath === "/crm" ||
              currentPath === "/login" ||
              currentPath === "/";

            if (isRootScreen) {
              // Exit the app gracefully without logging out
              App.exitApp();
              return;
            }

            // 3. Otherwise navigate back in CRM history or go to Dashboard
            if (canGoBack) {
              window.history.back();
            } else {
              router.replace("/crm/dashboard");
            }
          });

          removeListener = () => {
            handle.remove();
          };
        }
      } catch (err) {
        console.warn("Native back handler init warning:", err);
      }
    }

    initNativeBackHandler();

    // Web / PWA popstate guard
    function handlePopState() {
      const currentPath = window.location.pathname;
      if (currentPath === "/crm/dashboard") {
        window.history.pushState(null, "", "/crm/dashboard");
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (removeListener) removeListener();
    };
  }, [pathname, router]);

  return null;
}
