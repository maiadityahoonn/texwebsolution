"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
  X,
  Target,
  Briefcase,
  ArrowRight,
  Sparkles,
  MessageSquare,
  CreditCard,
  Share2,
  LifeBuoy,
  History,
} from "lucide-react";
import {
  isSoundEnabled,
  setSoundEnabled,
  playNotificationSound,
} from "@/lib/notificationSound";
import {
  resolveNotificationUrl,
  getCategoryIcon,
  getCategoryBadgeStyle,
  getCategoryLabel,
  getActionLabel,
  formatRelativeTime,
} from "./notificationUtils";

export { resolveNotificationUrl };

export default function NotificationCenterModal({
  notifications = [],
  isDark = false,
  isOpen = false,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onSelectRecord,
  preferences,
  notificationPreferences,
  onSavePreferences,
  salesMeetings = [],
  salesFollowUps = [],
  leads = [],
}) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showPreferences, setShowPreferences] = useState(false);
  const [showReadHistory, setShowReadHistory] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [localPrefs, setLocalPrefs] = useState({
    sound_enabled: true,
    push_enabled: true,
    lead_alerts: true,
    task_alerts: true,
    chat_alerts: true,
    project_alerts: true,
    smm_alerts: true,
    finance_alerts: true,
    support_alerts: true,
  });

  const incomingPrefs = preferences || notificationPreferences;
  const prefsKey = incomingPrefs ? JSON.stringify(incomingPrefs) : "";

  useEffect(() => {
    if (!isOpen) return;
    setSoundActive(isSoundEnabled());
    if (incomingPrefs && typeof incomingPrefs === "object" && Object.keys(incomingPrefs).length > 0) {
      setLocalPrefs((prev) => ({ ...prev, ...incomingPrefs }));
    }
  }, [isOpen, prefsKey]);

  // Counts: Separate unread vs read
  const counts = useMemo(() => {
    let unread = 0;
    let followups = 0;
    let meetings = 0;
    let readCount = 0;

    notifications.forEach((item) => {
      if (!item.is_read) {
        unread += 1;
        const type = String(item.type || "").toLowerCase();
        const title = String(item.title || "").toLowerCase();
        const src = String(item.metadata?.source_type || "").toLowerCase();
        const link = String(item.link_url || "").toLowerCase();

        if (src === "sales_followup" || type === "followup" || link.includes("followups") || title.includes("follow-up") || title.includes("followup")) {
          followups += 1;
        }
        if (src === "sales_meeting" || type === "meeting" || link.includes("meetings") || title.includes("meeting")) {
          meetings += 1;
        }
      } else {
        readCount += 1;
      }
    });

    return { total: unread, unread, followups, meetings, readCount };
  }, [notifications]);

  // Filtered Notifications:
  // Rule: Read notifications are hidden from the active modal view, but preserved in database.
  const filteredNotifications = useMemo(() => {
    const baseList = showReadHistory ? notifications : notifications.filter((item) => !item.is_read);

    return baseList.filter((item) => {
      const type = String(item.type || "").toLowerCase();
      const title = String(item.title || "").toLowerCase();
      const src = String(item.metadata?.source_type || "").toLowerCase();
      const link = String(item.link_url || "").toLowerCase();

      if (activeFilter === "followups") {
        return src === "sales_followup" || type === "followup" || link.includes("followups") || title.includes("follow-up") || title.includes("followup");
      }
      if (activeFilter === "meetings") {
        return src === "sales_meeting" || type === "meeting" || link.includes("meetings") || title.includes("meeting");
      }
      return true;
    });
  }, [notifications, activeFilter, showReadHistory]);

  function handleSoundToggle() {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    setLocalPrefs((p) => ({ ...p, sound_enabled: next }));
    onSavePreferences?.({ ...localPrefs, sound_enabled: next });
    if (next) playNotificationSound("general");
  }

  function handlePushToggle() {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        const next = !localPrefs.push_enabled;
        setLocalPrefs((p) => ({ ...p, push_enabled: next }));
        onSavePreferences?.({ ...localPrefs, push_enabled: next });
      } else {
        Notification.requestPermission().then((perm) => {
          const granted = perm === "granted";
          setLocalPrefs((p) => ({ ...p, push_enabled: granted }));
          onSavePreferences?.({ ...localPrefs, push_enabled: granted });
        });
      }
    }
  }

  function handleSaveModulePref(key) {
    const nextVal = !localPrefs[key];
    const updated = { ...localPrefs, [key]: nextVal };
    setLocalPrefs(updated);
    onSavePreferences?.(updated);
  }

  function handleItemClick(item) {
    // 1. Mark as read in state & DB (so it immediately leaves modal view)
    onMarkRead?.(item);
    onClose?.();

    // 2. Resolve URL and deep-link to the exact record row
    const targetUrl = resolveNotificationUrl(item, {
      salesMeetings,
      salesFollowUps,
      leads,
    });

    if (onSelectRecord) {
      onSelectRecord(targetUrl);
    } else if (targetUrl) {
      router.push(targetUrl);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
    >
      {/* Standard CRM Modal Container (exact matching height and style across all CRM modals) */}
      <div
        className="w-full max-w-xl h-[82vh] max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header - Matches all other CRM modals */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-orange-50/60 via-amber-50/20 to-transparent dark:from-orange-950/25 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <Bell className="w-5 h-5" />
              {counts.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#18150f] animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                  Notification Center
                </h3>
                {counts.unread > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                    {counts.unread} New
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Caught Up
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Real-time active alerts & quick action deep links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Sound Toggle */}
            <button
              type="button"
              onClick={handleSoundToggle}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundActive
                  ? "border-orange-500/30 text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400"
                  : "border-gray-200 dark:border-neutral-800 text-gray-400 hover:text-gray-600"
              }`}
              title={soundActive ? "Sound Alerts ON (Click to mute)" : "Sound Alerts OFF (Click to unmute)"}
              aria-label="Toggle notification sound"
            >
              {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                showPreferences
                  ? "border-orange-500/30 text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400"
                  : "border-gray-200 dark:border-neutral-800 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
              title="Notification Settings"
              aria-label="Notification settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* If Settings panel is open */}
        {showPreferences ? (
          <div className="p-5 space-y-3.5 text-xs flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#3a3020]">
              <span className="font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-400 text-[10px]">
                Global Delivery Channels
              </span>
              <button
                type="button"
                onClick={() => playNotificationSound("general")}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test Sound Chime</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] cursor-pointer hover:border-orange-500/30 transition">
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-white text-xs sm:text-sm">
                    Sound Chimes (Web Audio API)
                  </span>
                  <span className="text-xs text-gray-400">
                    Play discrete acoustic chime on incoming leads, meetings, and follow-ups.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundActive}
                  onChange={handleSoundToggle}
                  className="w-4 h-4 accent-orange-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] cursor-pointer hover:border-orange-500/30 transition">
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-white text-xs sm:text-sm">
                    Desktop & PWA Push Notifications
                  </span>
                  <span className="text-xs text-gray-400">
                    Receive system alerts even when the browser tab is in background.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.push_enabled}
                  onChange={handlePushToggle}
                  className="w-4 h-4 accent-orange-600 cursor-pointer"
                />
              </label>
            </div>

            <span className="font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-400 text-[10px] block pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              Module-Specific Alert Toggles
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: "lead_alerts", label: "New Leads & Deals", icon: Target },
                { key: "task_alerts", label: "Tasks & Deadlines", icon: Briefcase },
                { key: "chat_alerts", label: "Chat & Mentions", icon: MessageSquare },
                { key: "project_alerts", label: "Project Status", icon: Briefcase },
                { key: "smm_alerts", label: "SMM Reviews", icon: Share2 },
                { key: "finance_alerts", label: "Invoices & Payments", icon: CreditCard },
                { key: "support_alerts", label: "Support Tickets", icon: LifeBuoy },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] cursor-pointer hover:border-orange-500/30 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-gray-800 dark:text-neutral-200">
                        {item.label}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs[item.key] !== false}
                      onChange={() => handleSaveModulePref(item.key)}
                      className="w-4 h-4 accent-orange-600 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Filter Tabs & Quick Actions */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/40 dark:bg-[#1f1a13]/50 shrink-0 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All", count: counts.unread },
                  { id: "followups", label: "Follow-ups", count: counts.followups },
                  { id: "meetings", label: "Meetings", count: counts.meetings },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                      activeFilter === f.id
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-2xs"
                        : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-neutral-800/50"
                    }`}
                  >
                    <span>{f.label}</span>
                    {f.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          activeFilter === f.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300"
                        }`}
                      >
                        {f.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {counts.unread > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}

                {counts.readCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReadHistory(!showReadHistory)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      showReadHistory
                        ? "text-orange-600 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40"
                        : "text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#211d14]"
                    }`}
                    title={showReadHistory ? "Hide Read History" : `Show Read History (${counts.readCount})`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{showReadHistory ? "Hide Read" : `History (${counts.readCount})`}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification Card List - Perfectly Scrollable with visible clean scrollbar */}
            <div
              className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(249, 115, 22, 0.45) transparent",
              }}
            >
              {filteredNotifications.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-400 dark:text-neutral-500 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#211d14] flex items-center justify-center text-gray-400">
                    <Bell className="w-6 h-6 opacity-40" />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-neutral-300 text-sm">
                    {showReadHistory ? "No notifications in history" : "All Caught Up! 🎉"}
                  </span>
                  <span className="text-xs text-gray-400 max-w-xs">
                    {showReadHistory
                      ? "No notifications match this category."
                      : "Read notifications are automatically cleared from this modal."}
                  </span>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const CategoryIcon = getCategoryIcon(item);
                  const badgeStyle = getCategoryBadgeStyle(item);
                  const categoryLabel = getCategoryLabel(item);
                  const actionLabel = getActionLabel(item);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col gap-2 ${
                        !item.is_read
                          ? "bg-gradient-to-r from-orange-500/[0.08] via-amber-500/[0.04] to-transparent border-orange-500/30 dark:border-amber-500/30 shadow-2xs hover:border-orange-500/60"
                          : "bg-white dark:bg-[#1f1a13]/60 border-gray-100 dark:border-[#3a3020] hover:border-gray-200 dark:hover:border-neutral-700 opacity-80"
                      }`}
                    >
                      {/* Top Row: Icon + Title + Category Chip + Delete */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-xl shrink-0 border ${badgeStyle}`}>
                            <CategoryIcon className="w-4 h-4" />
                          </div>

                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${badgeStyle}`}>
                              {categoryLabel}
                            </span>
                            {!item.is_read && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                                New
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification?.(item);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer shrink-0 opacity-60 group-hover:opacity-100"
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Middle: Clean Message */}
                      <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed line-clamp-2 pl-0.5">
                        {item.message}
                      </p>

                      {/* Bottom Row: Timestamp + Action Link */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-[#3a3020]/60 mt-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-neutral-400 font-mono">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{formatRelativeTime(item.created_at)}</span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 group-hover:bg-orange-600 group-hover:text-white border border-orange-200/80 dark:border-orange-500/30 px-3 py-1 rounded-xl transition-all shadow-2xs">
                          <span>{actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
