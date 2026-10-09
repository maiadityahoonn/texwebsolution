"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { safeInternalPath } from "@/lib/safeUrl";
import { playNotificationSound } from "@/lib/notificationSound";
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationPreferences,
} from "@/services/supabaseService";

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

    const storageKey = `texweb_sales_meeting_10min_alerted_${sessionUser.id}`;
    const checkUpcomingSalesMeetings = () => {
      const now = Date.now();
      const upcoming = salesMeetings.filter((item) => {
        if (item.status !== "scheduled" || !item.scheduled_at) return false;
        const startsAt = new Date(item.scheduled_at).getTime();
        const diff = startsAt - now;
        return diff <= 10 * 60 * 1000 && diff > 0;
      });
      if (!upcoming.length) return;

      let alerted = [];
      try {
        alerted = JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch {
        alerted = [];
      }
      const alertedSet = new Set(alerted);
      const fresh = upcoming.filter((item) => !alertedSet.has(`${item.id}:${item.scheduled_at}`));
      if (!fresh.length) return;

      const first = fresh[0];
      const title = fresh.length === 1 ? "Client meeting in 10 minutes" : `${fresh.length} client meetings soon`;
      const message = fresh.length === 1
        ? `${first.title || "Sales meeting"} starts at ${new Date(first.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}. Send WhatsApp or call the client now.`
        : "Open Sales Meetings and confirm clients on WhatsApp/call.";
      pushLiveSalesNotification(title, message, "meeting", "/workspace?section=sales_meetings");

      const nextAlerted = Array.from(new Set([...alerted, ...fresh.map((item) => `${item.id}:${item.scheduled_at}`)])).slice(-300);
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextAlerted));
      } catch {}
    };

    checkUpcomingSalesMeetings();
    const timer = setInterval(checkUpcomingSalesMeetings, 60_000);
    return () => clearInterval(timer);
  }, [salesMeetings, sessionUser?.id]);

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
