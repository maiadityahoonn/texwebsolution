"use client";

import Link from "next/link";
import { Bell, Moon, Sun } from "lucide-react";

export default function CrmMobileHeader({
  activeSection = "crm",
  chatMobilePane = "channels",
  isDark = false,
  toggleTheme = () => {},
  canUseAlerts = true,
  unreadCount = 0,
  userProfile = null,
  sessionUser = null,
  onOpenNotifications = null,
}) {
  const isChatOpen = activeSection === "chat" && chatMobilePane === "chat";

  return (
    <header
      className={`${
        isChatOpen ? "!hidden" : "flex"
      } fixed top-0 left-0 right-0 z-40 md:hidden h-14 px-3 items-center justify-between border-b transition-colors duration-200 select-none shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06)] ${
        isDark
          ? "bg-[#0b0b0c]/95 backdrop-blur-xl border-neutral-800 text-neutral-100"
          : "bg-white/95 backdrop-blur-xl border-gray-200/90 text-gray-900"
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Left: Official TexWeb Solution Brand Logo */}
      <div className="flex items-center shrink-0">
        <Link
          href="/crm/dashboard"
          className="flex items-center group py-0.5"
          title="TexWeb Solution"
          aria-label="TexWeb Solution"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-brand-logo.png"
            alt="TexWeb Solution"
            className="h-8 w-auto max-w-[155px] sm:max-w-[175px] object-contain group-hover:scale-105 transition-transform dark:bg-white dark:px-2 dark:py-1 dark:rounded-xl shadow-2xs"
          />
        </Link>
      </div>

      {/* Right Controls: Theme Toggle, Notification Bell, User Avatar */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Theme Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0 ${
            isDark
              ? "border-neutral-800 bg-neutral-900 text-amber-400 hover:bg-neutral-800"
              : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Center Trigger */}
        {canUseAlerts && (
          <button
            type="button"
            onClick={onOpenNotifications || (() => {})}
            className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 ${
              isDark
                ? "border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
            aria-label="Notifications"
            title="Open Notification Center"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0b0b0c] shadow-2xs animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Profile Avatar linking to Profile & Settings */}
        <Link
          href="/crm/settings"
          className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center overflow-hidden cursor-pointer ring-1.5 ring-red-500/30 hover:ring-red-500 transition shrink-0 ${
            isDark ? "bg-neutral-800 text-white" : "bg-gray-100 text-gray-800"
          }`}
          aria-label="Profile & Settings"
          title={userProfile?.full_name || sessionUser?.email || "Profile & Settings"}
        >
          {userProfile?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={userProfile.avatar_url}
              alt={userProfile.full_name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            (userProfile?.full_name || sessionUser?.email || "U")[0]?.toUpperCase()
          )}
        </Link>
      </div>
    </header>
  );
}
