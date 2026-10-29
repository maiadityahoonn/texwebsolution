"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
  X,
  ChevronRight,
} from "lucide-react";

/**
 * Primary 4 tabs on the fixed mobile bottom bar:
 * 1. Dashboard
 * 2. Leads
 * 3. Sales Pipeline
 * 4. Follow-ups
 * 5. More (opens drawer)
 */
export const PRIMARY_BOTTOM_NAV = [
  {
    key: "dashboard",
    href: "/crm/dashboard",
    section: "overview",
    label: "Dashboard",
    icon: Home,
  },
  {
    key: "leads",
    href: "/crm/leads",
    section: "crm",
    label: "Leads",
    icon: Target,
  },
  {
    key: "pipeline",
    href: "/crm/pipeline",
    section: "pipeline",
    label: "Pipeline",
    icon: TrendingUp,
  },
  {
    key: "followups",
    href: "/crm/followups",
    section: "sales_followups",
    label: "Follow-ups",
    icon: Phone,
  },
];

/**
 * Remaining modules placed inside the "More" drawer,
 * following the exact desktop sidebar sequence & naming:
 * 5. Meetings
 * 6. Quotation
 * 7. Agreements
 * 8. Invoices
 * 9. Payments
 * 10. Clients
 * 11. Sales Reports
 * 12. Team Chat
 * 13. Profile & Settings
 */
export const MORE_BOTTOM_NAV = [
  {
    key: "meetings",
    href: "/crm/meetings",
    section: "sales_meetings",
    label: "Meetings",
    icon: Calendar,
    color: "#2563eb",
    iconClass: "text-blue-500",
  },
  {
    key: "quotation",
    href: "/crm/quotation",
    section: "sales_commercials",
    label: "Quotation",
    icon: FileText,
    color: "#0284c7",
    iconClass: "text-cyan-500",
  },
  {
    key: "agreements",
    href: "/crm/agreements",
    section: "agreements",
    label: "Agreements",
    icon: ShieldCheck,
    color: "#9333ea",
    iconClass: "text-purple-500",
  },
  {
    key: "invoices",
    href: "/crm/invoices",
    section: "invoices",
    label: "Invoices",
    icon: CreditCard,
    color: "#d97706",
    iconClass: "text-amber-500",
  },
  {
    key: "payments",
    href: "/crm/payments",
    section: "payments",
    label: "Payments",
    icon: Wallet,
    color: "#059669",
    iconClass: "text-emerald-500",
  },
  {
    key: "clients",
    href: "/crm/clients",
    section: "clients",
    label: "Clients",
    icon: Building2,
    color: "#e11d48",
    iconClass: "text-rose-500",
  },
  {
    key: "reports",
    href: "/crm/reports",
    section: "sales_reports",
    label: "Sales Reports",
    icon: Activity,
    color: "#7c3aed",
    iconClass: "text-violet-500",
  },
  {
    key: "chat",
    href: "/crm/chat",
    section: "chat",
    label: "Team Chat",
    icon: MessageSquare,
    color: "#059669",
    iconClass: "text-emerald-500",
  },
  {
    key: "settings",
    href: "/crm/settings",
    section: "settings",
    label: "Profile & Settings",
    icon: Settings,
    color: "#475569",
    iconClass: "text-slate-500",
  },
];

export default function CrmMobileNav({
  activeSection = "crm",
  chatMobilePane = "channels",
  isDark = false,
  unreadCount = 0,
}) {
  const pathname = usePathname() || "";
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const isChatOpen = activeSection === "chat" && chatMobilePane === "chat";

  function checkIsActive(item) {
    if (!item?.href) return false;
    if (pathname === item.href) return true;
    if (item.href === "/crm/dashboard") return pathname === "/crm" || pathname === "/crm/dashboard";
    if (item.href === "/crm/leads") return pathname.startsWith("/crm/leads");
    if (item.href === "/crm/pipeline") return pathname.startsWith("/crm/pipeline");
    if (item.href === "/crm/followups") return pathname.startsWith("/crm/followups");
    return pathname.startsWith(item.href);
  }

  const isMoreActive =
    mobileMoreOpen || MORE_BOTTOM_NAV.some((item) => checkIsActive(item));

  return (
    <>
      {/* "More" Slide-up Modal Drawer */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMoreOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div
            className={`relative z-10 w-full max-h-[82vh] flex flex-col rounded-t-3xl shadow-2xl transition-all border-t ${
              isDark
                ? "bg-[#111113] border-neutral-800 text-neutral-100"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            {/* Grab Handle */}
            <div className="w-full flex items-center justify-center pt-3 pb-1">
              <span className="w-10 h-1 rounded-full bg-gray-300 dark:bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-neutral-800/80">
              <div>
                <h3 className="text-base font-black tracking-tight text-gray-900 dark:text-white font-[Matter]">
                  More Modules
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
                  All modules, tools & settings
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer text-gray-500 dark:text-neutral-400"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modules List */}
            <div className="overflow-y-auto px-3 py-3 space-y-1 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
              {MORE_BOTTOM_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = checkIsActive(item);

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 font-bold shadow-2xs"
                        : "text-gray-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800/60 active:scale-[0.99]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? "bg-red-600 text-white shadow-xs"
                            : isDark
                            ? "bg-neutral-800/90 text-neutral-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 stroke-[2]" />
                      </div>
                      <span className="text-sm font-semibold truncate font-[Matter]">
                        {item.label}
                      </span>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-400 dark:text-neutral-500"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Primary Fixed Bottom Navigation (Classic 5-column design) */}
      <nav
        className={`${
          isChatOpen ? "!hidden" : "block"
        } fixed left-0 right-0 bottom-0 z-40 md:hidden border-t px-1 pt-1 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] transition-colors duration-200 select-none touch-manipulation ${
          isDark
            ? "bg-[#0b0b0c]/95 backdrop-blur-md border-neutral-800 text-neutral-400"
            : "bg-white/95 backdrop-blur-md border-gray-200/90 text-gray-600 shadow-lg shadow-black/5"
        }`}
      >
        <div className="grid grid-cols-5 items-center">
          {PRIMARY_BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = checkIsActive(item);

            return (
              <Link
                key={item.key}
                href={item.href}
                className="relative min-w-0 h-13 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer group touch-manipulation select-none active:scale-95"
                aria-label={item.label}
                title={item.label}
              >
                <div
                  className={`pointer-events-none relative px-2 min-[360px]:px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isActive
                      ? isDark
                        ? "bg-red-500/15 text-red-400 scale-105"
                        : "bg-red-50 text-red-600 scale-105 shadow-2xs"
                      : isDark
                      ? "text-neutral-400 group-hover:text-white"
                      : "text-gray-500 group-hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "stroke-[2.2]" : "stroke-[1.75]"
                    }`}
                  />
                </div>
                <span
                  className={`pointer-events-none w-full px-0.5 text-[10px] truncate text-center transition-colors leading-normal pb-0.5 ${
                    isActive
                      ? isDark
                        ? "font-extrabold text-red-400"
                        : "font-extrabold text-red-600"
                      : isDark
                      ? "font-medium text-neutral-400 group-hover:text-white"
                      : "font-medium text-gray-500 group-hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* 5th Tab: "More" Trigger */}
          <button
            type="button"
            onClick={() => setMobileMoreOpen((prev) => !prev)}
            className="relative min-w-0 h-13 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer group touch-manipulation select-none active:scale-95"
            aria-label="More Modules"
            title="More Modules"
          >
            <div
              className={`pointer-events-none relative px-2 min-[360px]:px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                isMoreActive
                  ? isDark
                    ? "bg-red-500/15 text-red-400 scale-105"
                    : "bg-red-50 text-red-600 scale-105 shadow-2xs"
                  : isDark
                  ? "text-neutral-400 group-hover:text-white"
                  : "text-gray-500 group-hover:text-gray-900"
              }`}
            >
              <MoreHorizontal className="w-5 h-5 stroke-[2]" />
            </div>
            <span
              className={`pointer-events-none w-full px-0.5 text-[10px] truncate text-center transition-colors leading-normal pb-0.5 ${
                isMoreActive
                  ? isDark
                    ? "font-extrabold text-red-400"
                    : "font-extrabold text-red-600"
                  : isDark
                  ? "font-medium text-neutral-400 group-hover:text-white"
                  : "font-medium text-gray-500 group-hover:text-gray-900"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
