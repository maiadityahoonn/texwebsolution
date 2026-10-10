"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { safeInternalPath } from "@/lib/safeUrl";
import { playNotificationSound } from "@/lib/notificationSound";
import {
  deleteNotification,
  getSalesFollowUps,
  getSalesMeetings,
  getAuthToken,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationPreferences,
} from "@/services/supabaseService";

const REMINDER_WINDOW_MS = 10 * 60 * 1000;
const REMINDER_SCAN_MS = 30_000;
const MAX_REMINDER_KEYS = 500;

function readStoredKeys(storageKey) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredKeys(storageKey, keys) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(new Set(keys)).slice(-MAX_REMINDER_KEYS)));
  } catch {}
}

function mergeRowsById(...groups) {
  const map = new Map();
  groups.flat().forEach((item) => {
    if (!item?.id) return;
    map.set(item.id, { ...(map.get(item.id) || {}), ...item });
  });
  return Array.from(map.values());
}

function isUpcomingWithin(dateValue, now = Date.now()) {
  if (!dateValue) return false;
  const time = new Date(dateValue).getTime();
  if (!Number.isFinite(time)) return false;
  const diff = time - now;
  return diff > 0 && diff <= REMINDER_WINDOW_MS;
}

function isPendingFollowUp(item) {
  return String(item?.status || "").toLowerCase() === "pending";
}

function isScheduledMeeting(item) {
  return ["scheduled", "pending", "upcoming"].includes(String(item?.status || "").toLowerCase());
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function useWorkspaceNotifications({
  sessionUser,
  userProfile,
  salesFollowUps = [],
  salesMeetings = [],
  setActiveSection,
  setToast,
} = {}) {
  const [notificationPreferences, setNotificationPreferences] = useState({});
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  function pushLiveSalesNotification(title, message, type = "lead", linkUrl = "/workspace?section=sales_followups") {
    const notification = {
      id: `local-sales-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: sessionUser?.id || userProfile?.id || "local",
      title,
      message,
      type,
      link_url: linkUrl,
      is_read: false,
      created_at: new Date().toISOString(),
      delivery_channels: ["in_app"],
    };
    setNotifications((prev) => [notification, ...prev]);
    setToast?.(title);
    playNotificationSound(type === "alert" ? "task" : type);

    if (typeof window !== "undefined" && "Notification" in window) {
      const showBrowserNotification = () => {
        try {
          new Notification(title, { body: message, tag: notification.id });
        } catch {}
      };
      if (window.Notification.permission === "granted") {
        showBrowserNotification();
      } else if (window.Notification.permission === "default") {
        window.Notification.requestPermission().then((permission) => {
          if (permission === "granted") showBrowserNotification();
        }).catch(() => {});
      }
    }
  }

  async function handleReadNotification(item) {
    if (!item?.id) return;
    if (!item.is_read) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
      await markNotificationRead(item.id);
      setToast?.("Notification marked as read.");
    }
    if (item.link_url && typeof window !== "undefined") {
      const safePath = safeInternalPath(item.link_url, "/workspace");
      const url = new URL(safePath, window.location.origin);
      const section = url.searchParams.get("section");
      setActiveSection?.(section || "overview");
    }
  }

  async function handleMarkAllAsRead() {
    if (!sessionUser?.id) return;
    const unreadExist = notifications.some((n) => !n.is_read);
    if (!unreadExist) {
      setToast?.("All notifications are already marked as read.");
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsRead(sessionUser.id);
    setToast?.("All notifications marked as read.");
  }

  async function handleDeleteNotification(item) {
    if (!item?.id) return;
    setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    await deleteNotification(item.id);
    setToast?.("Notification deleted.");
  }

  async function handleSaveNotificationPreferences(prefs) {
    const res = await saveNotificationPreferences(userProfile?.id || sessionUser?.id, prefs);
    if (res) setNotificationPreferences(res);
    return res;
  }

  useEffect(() => {
    if (!sessionUser?.id) return undefined;
    const notifChannel = supabase
      .channel(`realtime-notifications-${sessionUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${sessionUser.id}`,
        },
        (payload) => {
          const newNotif = payload?.new;
          if (newNotif) {
            setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
            playNotificationSound(newNotif.type || "general");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, [sessionUser?.id]);

  useEffect(() => {
    if (!sessionUser?.id || typeof window === "undefined") return undefined;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return undefined;

    let cancelled = false;
    const setupPushNotifications = async () => {
      try {
        const keyResponse = await fetch("/api/notifications/push-vapid-key", { cache: "no-store" });
        const keyResult = await keyResponse.json().catch(() => ({}));
        const publicKey = keyResult.publicKey || "";
        if (!publicKey) return;

        let permission = window.Notification.permission;
        if (permission === "default") {
          permission = await window.Notification.requestPermission();
        }
        if (cancelled || permission !== "granted") return;

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        const token = await getAuthToken();
        if (!token || cancelled) return;
        await fetch("/api/notifications/push-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            user_agent: navigator.userAgent,
          }),
        });
      } catch (error) {
        console.warn("Push notification registration skipped:", error?.message || error);
      }
    };

    const timer = setTimeout(setupPushNotifications, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionUser?.id]);

  useEffect(() => {
    if (!sessionUser?.id) return undefined;

    const storageKey = `texweb_overdue_followup_alerted_${sessionUser.id}`;
    const checkOverdueFollowUps = () => {
      const overdue = salesFollowUps.filter((item) => (
        item.status === "pending"
        && item.due_at
        && new Date(item.due_at).getTime() < Date.now()
      ));
      if (!overdue.length) return;

      let alerted = [];
      try {
        alerted = JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch {
        alerted = [];
      }
      const alertedSet = new Set(alerted);
      const fresh = overdue.filter((item) => !alertedSet.has(`${item.id}:${item.due_at}`));
      if (!fresh.length) return;

      const first = fresh[0];
      const title = fresh.length === 1 ? "Overdue sales follow-up" : `${fresh.length} overdue sales follow-ups`;
      const message = fresh.length === 1
        ? `${first.title} was due at ${new Date(first.due_at).toLocaleString("en-IN")}.`
        : `${fresh.length} follow-ups are overdue. Open Sales Follow-ups to clear them.`;
      pushLiveSalesNotification(title, message, "alert", "/workspace?section=sales_followups");

      const nextAlerted = Array.from(new Set([...alerted, ...fresh.map((item) => `${item.id}:${item.due_at}`)])).slice(-300);
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextAlerted));
      } catch {}
    };

    checkOverdueFollowUps();
    const timer = setInterval(checkOverdueFollowUps, 60_000);
    return () => clearInterval(timer);
  }, [salesFollowUps, sessionUser?.id]);

  useEffect(() => {
    if (!sessionUser?.id) return undefined;

    const followUpStorageKey = `texweb_sales_followup_10min_alerted_${sessionUser.id}`;
    const meetingStorageKey = `texweb_sales_meeting_10min_alerted_${sessionUser.id}`;
    let cancelled = false;

    const checkUpcomingReminders = async () => {
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const reminderEndIso = new Date(now + REMINDER_WINDOW_MS).toISOString();
      let fetchedFollowUps = [];
      let fetchedMeetings = [];

      try {
        const result = await getSalesFollowUps({
          page: 1,
          pageSize: 50,
          status: "pending",
          dateFrom: nowIso,
          dateTo: reminderEndIso,
        });
        fetchedFollowUps = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
      } catch {}

      try {
        const result = await getSalesMeetings({
          page: 1,
          pageSize: 50,
          dateFrom: nowIso,
          dateTo: reminderEndIso,
        });
        fetchedMeetings = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
      } catch {}

      if (cancelled) return;

      const upcomingFollowUps = mergeRowsById(salesFollowUps, fetchedFollowUps)
        .filter((item) => isPendingFollowUp(item) && isUpcomingWithin(item.due_at, now));
      const followUpAlerted = readStoredKeys(followUpStorageKey);
      const followUpAlertedSet = new Set(followUpAlerted);
      const freshFollowUps = upcomingFollowUps.filter((item) => !followUpAlertedSet.has(`${item.id}:${item.due_at}`));
      if (freshFollowUps.length) {
        const first = freshFollowUps[0];
        const title = freshFollowUps.length === 1 ? "Follow-up reminder in 10 minutes" : `${freshFollowUps.length} follow-ups due soon`;
        const message = freshFollowUps.length === 1
          ? `${first.title || "Sales follow-up"} is due at ${new Date(first.due_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}. Call or WhatsApp the client.`
          : "Open Sales Follow-ups and complete the due calls/WhatsApp actions.";
        pushLiveSalesNotification(title, message, "lead", "/workspace?section=sales_followups");
        writeStoredKeys(followUpStorageKey, [...followUpAlerted, ...freshFollowUps.map((item) => `${item.id}:${item.due_at}`)]);
      }

      const upcomingMeetings = mergeRowsById(salesMeetings, fetchedMeetings)
        .filter((item) => isScheduledMeeting(item) && isUpcomingWithin(item.scheduled_at, now));
      const meetingAlerted = readStoredKeys(meetingStorageKey);
      const meetingAlertedSet = new Set(meetingAlerted);
      const freshMeetings = upcomingMeetings.filter((item) => !meetingAlertedSet.has(`${item.id}:${item.scheduled_at}`));
      if (freshMeetings.length) {
        const first = freshMeetings[0];
        const title = freshMeetings.length === 1 ? "Client meeting in 10 minutes" : `${freshMeetings.length} client meetings soon`;
        const message = freshMeetings.length === 1
          ? `${first.title || "Sales meeting"} starts at ${new Date(first.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}. Send WhatsApp or call the client now.`
          : "Open Sales Meetings and confirm clients on WhatsApp/call.";
        pushLiveSalesNotification(title, message, "meeting", "/workspace?section=sales_meetings");
        writeStoredKeys(meetingStorageKey, [...meetingAlerted, ...freshMeetings.map((item) => `${item.id}:${item.scheduled_at}`)]);
      }
    };

    checkUpcomingReminders();
    const timer = setInterval(checkUpcomingReminders, REMINDER_SCAN_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [salesFollowUps, salesMeetings, sessionUser?.id]);

  return {
    notifications,
    setNotifications,
    notificationPreferences,
    setNotificationPreferences,
    notificationModalOpen,
    setNotificationModalOpen,
    unreadCount,
    pushLiveSalesNotification,
    handleReadNotification,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleSaveNotificationPreferences,
  };
}
