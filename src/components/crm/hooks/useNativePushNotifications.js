"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { safeInternalPath } from "@/lib/safeUrl";
import { registerNativePushToken } from "@/services/crm/nativePushService";

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
  useEffect(() => {
    if (!userId || !isNativePushPlatform()) return undefined;
    let cancelled = false;
    const listenerHandles = [];

    const setup = async () => {
      try {
        listenerHandles.push(await PushNotifications.addListener("registration", async ({ value }) => {
          if (cancelled || !value) return;
          const saved = await registerNativePushToken(value, Capacitor.getPlatform() === "ios" ? "ios" : "android");
          if (!cancelled && saved) setToast?.("Mobile notifications enabled.");
        }));
        listenerHandles.push(await PushNotifications.addListener("registrationError", (error) => {
          console.warn("Native push registration failed:", error?.error || "unknown_error");
        }));
        listenerHandles.push(await PushNotifications.addListener("pushNotificationReceived", (notification) => {
          if (!cancelled) setToast?.(notification?.title || "New CRM notification");
        }));
        listenerHandles.push(await PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
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

        let permission = await PushNotifications.checkPermissions();
        if (permission.receive === "prompt" || permission.receive === "prompt-with-rationale") {
          permission = await PushNotifications.requestPermissions();
        }
        if (cancelled || permission.receive !== "granted") {
          if (!cancelled) setToast?.("Notification permission is disabled in phone settings.");
          return;
        }
        await PushNotifications.register();
      } catch (error) {
        console.warn("Native push setup skipped:", error?.message || error);
      }
    };

    setup();
    return () => {
      cancelled = true;
      listenerHandles.forEach((handle) => handle?.remove?.().catch(() => {}));
    };
  }, [onNavigate, setToast, userId]);
}
