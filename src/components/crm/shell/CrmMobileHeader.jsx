"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Moon, Sun } from "lucide-react";

export default function CrmMobileHeader({
  activeSection,
  chatMobilePane,
  isDark,
  toggleTheme,
  canUseAlerts = false,
  unreadCount = 0,
  selectSection,
  userProfile,
  sessionUser,
}) {
  const isChatOpen = activeSection === "chat" && chatMobilePane === "chat";

  return (
    <div
      className={`${isChatOpen ? "!hidden" : "flex"} fixed top-0 left-0 right-0 z-40 md:hidden h-16 px-3.5 items-center justify-between border-b border-gray-200/80 dark:border-white/[0.08] transition-colors duration-200 pt-[env(safe-area-inset-top,0px)] ${
        isDark
          ? "bg-[#0b0b0c]/90 backdrop-blur-xl text-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]"
          : "bg-white/90 backdrop-blur-xl text-gray-900 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Link href="/crm/dashboard" className="admin-sidebar-logo flex items-center group min-w-0">
          <Image
            width={140}
            height={38}
            alt="TexWeb Solution Logo"
            src="/texweb-full-logo-original.png"
            className="h-8 w-auto max-w-[140px] sm:max-w-[155px] object-contain shrink-0 group-hover:scale-105 transition-transform"
            style={{ width: "auto" }}
            priority
          />
        </Link>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className={`w-9 h-9 rounded-xl border border-gray-200/90 dark:border-slate-800 flex items-center justify-center transition cursor-pointer active:scale-95 ${
            isDark
              ? "bg-slate-900/90 text-amber-400 hover:bg-slate-800"
              : "bg-white/90 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {canUseAlerts && (
          <Link
            href="/crm/alerts"
            className={`relative w-9 h-9 rounded-xl border border-gray-200/90 dark:border-slate-800 flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isDark
                ? "bg-slate-900/90 text-neutral-300 hover:text-white hover:bg-slate-800"
                : "bg-white/90 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }`}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ${
                  isDark ? "ring-[#0b0b0c]" : "ring-white"
                } shadow-sm animate-pulse`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}

        <Link
          href="/crm/settings"
          className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center overflow-hidden cursor-pointer ring-2 ring-red-500/25 hover:ring-red-500 transition ${
            isDark ? "bg-neutral-800 text-white" : "bg-gray-100 text-gray-800"
          }`}
          aria-label="Profile"
          title={userProfile?.full_name || "Profile"}
        >
          {userProfile?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={userProfile.avatar_url}
              alt={userProfile.full_name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            (userProfile?.full_name || sessionUser?.email || "T")[0]?.toUpperCase()
          )}
        </Link>
      </div>
    </div>
  );
}
