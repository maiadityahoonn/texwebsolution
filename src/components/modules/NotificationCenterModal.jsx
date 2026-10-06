"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Volume2,
  VolumeX,
  Settings,
  ExternalLink,
  Trash2,
  X,
  Target,
  Briefcase,
  Users,
  Share2,
  CreditCard,
  MessageSquare,
  LifeBuoy,
  Sparkles,
} from "lucide-react";
import {
  isSoundEnabled,
  setSoundEnabled,
  playNotificationSound,
} from "@/lib/notificationSound";

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
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showPreferences, setShowPreferences] = useState(false);
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

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === "unread") return !item.is_read;
      if (activeFilter === "leads") return item.type === "lead" || item.type === "deal";
      if (activeFilter === "projects") return item.type === "project" || item.type === "task";
      if (activeFilter === "hr") return item.type === "hr" || item.type === "certificate" || item.type === "meeting";
      if (activeFilter === "smm") return item.type === "smm";
      if (activeFilter === "finance") return item.type === "finance" || item.type === "payment" || item.type === "invoice";
      if (activeFilter === "chat") return item.type === "message";
      if (activeFilter === "support") return item.type === "support";
      return true;
    });
  }, [notifications, activeFilter]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  function handleSoundToggle() {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    setLocalPrefs((p) => ({ ...p, sound_enabled: next }));
    onSavePreferences?.({ ...localPrefs, sound_enabled: next });
    if (next) {
      playNotificationSound("general");
    }
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
    onMarkRead?.(item.id);
    onClose?.();
    if (item.link_url) {
      onSelectRecord?.(item.link_url);
    } else if (item.type === "lead") {
      onSelectRecord?.("crm");
    } else if (item.type === "project" || item.type === "task") {
      onSelectRecord?.("projects");
    } else if (item.type === "message") {
      onSelectRecord?.("chat");
    } else if (item.type === "finance" || item.type === "invoice") {
      onSelectRecord?.("invoices");
    } else if (item.type === "smm") {
      onSelectRecord?.("smm");
    } else if (item.type === "support") {
      onSelectRecord?.("support");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[85vh] rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#3a3020] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Notification Center
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">Real-time enterprise event alerts</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-xl border transition ${
                soundActive
                  ? "border-orange-500/30 text-orange-600 bg-orange-50 dark:bg-orange-950/30"
                  : "border-gray-200 dark:border-slate-800 text-gray-400"
              }`}
              title={soundActive ? "Sound Alert ON (Click to mute)" : "Sound Alert OFF (Click to unmute)"}
            >
              {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Preferences Toggle */}
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className={`p-2 rounded-xl border transition ${
                showPreferences
                  ? "border-orange-500/30 text-orange-600 bg-orange-50 dark:bg-orange-950/30"
                  : "border-gray-200 dark:border-slate-800 text-gray-500 hover:text-gray-900"
              }`}
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If Preferences view is open */}
        {showPreferences ? (
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#3a3020]">
              <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Global Delivery Channels
              </span>
              <button
                onClick={() => playNotificationSound("general")}
                className="text-[11px] font-semibold text-orange-600 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Test Sound Chime</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-white">
                    Sound Chimes (Web Audio API)
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Play discrete acoustic chime on incoming leads, tasks, and chats.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundActive}
                  onChange={handleSoundToggle}
                  className="w-4 h-4 accent-orange-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-white">
                    Desktop & PWA Push Notifications
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Receive system notifications even when the app is minimized.
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

            <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px] block pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              Module-Specific Alert Toggles
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: "lead_alerts", label: "CRM & New Leads", icon: Target },
                { key: "task_alerts", label: "Tasks & QA Deadlines", icon: Briefcase },
                { key: "chat_alerts", label: "Chat & Mentions", icon: MessageSquare },
                { key: "project_alerts", label: "Project Status", icon: Briefcase },
                { key: "smm_alerts", label: "SMM Content Reviews", icon: Share2 },
                { key: "finance_alerts", label: "Invoices & Payments", icon: CreditCard },
                { key: "support_alerts", label: "Support Tickets", icon: LifeBuoy },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 cursor-pointer"
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
            {/* Filter Pills */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-[#3a3020] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "unread", label: "Unread" },
                  { id: "leads", label: "Leads" },
                  { id: "projects", label: "Projects" },
                  { id: "smm", label: "SMM" },
                  { id: "finance", label: "Finance" },
                  { id: "support", label: "Support" },
                  { id: "chat", label: "Chat" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                      activeFilter === f.id
                        ? "bg-orange-600 text-white shadow-2xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-[11px] font-bold text-orange-600 whitespace-nowrap hover:underline shrink-0"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#3a3020]/60 no-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400">
                  No notifications in this category.
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3.5 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer flex items-start justify-between gap-3 ${
                      !item.is_read ? "bg-orange-50/20 dark:bg-orange-950/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !item.is_read ? "bg-orange-600" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold px-1.5 py-0.2 rounded-md bg-gray-100 dark:bg-slate-800">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-neutral-400 mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(item.created_at || Date.now()).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification?.(item.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-md transition"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
