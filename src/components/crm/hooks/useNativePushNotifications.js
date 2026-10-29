"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { PushNotifications } from "@capacitor/push-notifications";
import { safeInternalPath } from "@/lib/safeUrl";
import {
  getStoredNativePushToken,
  registerNativePushToken,
} from "@/services/crm/nativePushService";

const RETRY_DELAYS_MS = [4_000, 15_000, 45_000];
const LISTENER_RETRY_DELAYS_MS = [500, 1_500];

export function isNativePushPlatform() {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

function notificationLink(notification) {
  const data = notification?.data || {};
  return safeInternalPath(
    data.link_url || data.linkUrl || notification?.link || "/crm/alerts",
    "/crm/alerts",
  );
}

export function useNativePushNotifications({ userId, onNavigate, setToast } = {}) {
  const toastRef = useRef(setToast);
  toastRef.current = setToast;

  useEffect(() => {
    if (!userId || !isNativePushPlatform()) return undefined;
    let cancelled = false;
    const listenerHandles = [];
    const retryTimers = [];
    let latestToken = getStoredNativePushToken();
    let registrationInProgress = false;

    const keepListener = (handle) => {
      if (handle) listenerHandles.push(handle);
      return handle;
    };

    const safeListener = async (label, subscribe) => {
      try {
        return keepListener(await subscribe());
      } catch (error) {
        console.warn(`Native push ${label} listener unavailable:`, error?.message || error);
        return null;
      }
    };

    const addRegistrationListener = async (listener, attempt = 0) => {
      try {
        return keepListener(await PushNotifications.addListener("registration", listener));
      } catch (error) {
        if (attempt < LISTENER_RETRY_DELAYS_MS.length) {
          await new Promise((resolve) => window.setTimeout(resolve, LISTENER_RETRY_DELAYS_MS[attempt]));
          if (!cancelled) return addRegistrationListener(listener, attempt + 1);
        }
        const detail = String(error?.message || error || "unknown_error").slice(0, 70);
        const available = Capacitor.isPluginAvailable("PushNotifications");
        throw new Error(`push_listener:${detail};available=${available};platform=${Capacitor.getPlatform()}`);
      }
    };

    const syncToken = async (token, attempt = 0) => {
      if (cancelled || !token) return false;
      const result = await registerNativePushToken(
        token,
        Capacitor.getPlatform() === "ios" ? "ios" : "android",
      );
      if (cancelled) return false;
      if (result.ok) {
        return true;
      }
      if (attempt < RETRY_DELAYS_MS.length) {
        const timer = window.setTimeout(
          () => syncToken(token, attempt + 1),
          RETRY_DELAYS_MS[attempt],
        );
        retryTimers.push(timer);
      } else {
        console.warn("Native push token could not be saved:", result.error || result.status);
      }
      return false;
    };

    const requestRegistration = async () => {
      if (cancelled || registrationInProgress) return;
      registrationInProgress = true;
      try {
        let permission = await PushNotifications.checkPermissions();
        if (permission.receive === "prompt" || permission.receive === "prompt-with-rationale") {
          permission = await PushNotifications.requestPermissions();
        }
        if (cancelled) return;
        if (permission.receive !== "granted") {
          return;
        }
        if (latestToken) await syncToken(latestToken);
        await PushNotifications.register();
      } catch (error) {
        console.warn("Native push registration failed:", error?.message || error);
      } finally {
        registrationInProgress = false;
      }
    };

    const setup = async () => {
      try {
        await addRegistrationListener(async ({ value }) => {
          if (cancelled || !value) return;
          latestToken = value;
          await syncToken(value);
        });
        await safeListener("registration-error", () => PushNotifications.addListener("registrationError", (error) => {
          console.warn("Native push registration failed:", error?.error || "unknown_error");
        }));
        await safeListener("foreground", () => PushNotifications.addListener("pushNotificationReceived", (notification) => {
          if (!cancelled) toastRef.current?.(notification?.title || "New CRM notification");
        }));
        await safeListener("action", () => PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
          const target = notificationLink(notification);
          if (onNavigate) onNavigate(target, notification);
          else if (typeof window !== "undefined") window.location.assign(target);
        }));

        await PushNotifications.createChannel({
          id: "crm_reminders",
          name: "CRM reminders",
          description: "Follow-up, meeting, lead and CRM activity reminders",
          importance: 5,
          visibility: 1,
          vibration: true,
          lights: true,
          lightColor: "#FF6B00",
          sound: "default",
        }).catch(() => {});
        await safeListener("resume", () => App.addListener("resume", requestRegistration));
        window.addEventListener("online", requestRegistration);
        await requestRegistration();
      } catch (error) {
        console.warn("Native push setup skipped:", error?.message || error);
        if (!cancelled) {
          const reason = String(error?.message || error || "unknown_error").slice(0, 100);
          const appInfo = await App.getInfo().catch(() => null);
          const appVersion = appInfo ? `;app=${appInfo.version}(${appInfo.build})` : ";app=unknown";
          toastRef.current?.(`Notification setup failed: ${reason}${appVersion}`);
        }
      }
    };

    setup();
    return () => {
      cancelled = true;
      window.removeEventListener("online", requestRegistration);
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      listenerHandles.forEach((handle) => handle?.remove?.().catch(() => {}));
    };
  }, [onNavigate, userId]);
}
