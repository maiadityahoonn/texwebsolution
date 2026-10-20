"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Moon, Sun, Target } from "lucide-react";
import { SECTION_META } from "./CrmShellConfig";

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

  const meta = SECTION_META[activeSection] || SECTION_META.crm;
  const SectionIcon = meta?.icon || Target;
  const sectionBgColor = meta?.color || "#ea580c";
  const sectionGradientFrom = meta?.colorFrom || sectionBgColor;
  const sectionGradientTo = meta?.colorTo || sectionBgColor;

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
      {/* Left: Brand Mini Logo + Divider + Active Section Badge */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Brand App Icon */}
        <Link
          href="/crm/dashboard"
          className="shrink-0 flex items-center group"
          title="TexWeb CRM Dashboard"
          aria-label="TexWeb CRM Dashboard"
        >
          <Image
            width={32}
            height={32}
            alt="TexWeb"
            src="/logo.png"
            className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
            priority
          />
        </Link>

        {/* Subtle vertical separator */}
        <span className="w-px h-5 bg-gray-200 dark:bg-neutral-800 shrink-0" />

        {/* Current Active Section Badge & Title */}
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{
              backgroundColor: sectionBgColor,
              backgroundImage: `linear-gradient(135deg, ${sectionGradientFrom}, ${sectionGradientTo})`,
            }}
          >
            <SectionIcon className="w-3.5 h-3.5 stroke-[2.3] text-white" />
          </div>
          <span className="text-xs sm:text-sm font-black tracking-tight text-gray-900 dark:text-white truncate font-[Matter]">
            {meta?.title || "CRM"}
          </span>
        </div>
      </div>

      {/* Right Controls: Action Portal, Theme Toggle, Notification Bell, User Avatar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Dynamic Mobile Action Buttons Slot (portal target for + Add Lead, + Add Deal, Refresh) */}
        <div id="crm-mobile-header-actions" className="flex items-center gap-1 shrink-0 flex-nowrap" />

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
