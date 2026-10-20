"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Grid,
  Home,
  MessageSquare,
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
 * Exact sequence, button tabs, names and icons matching desktop/laptop CrmSidebar.jsx:
 * 1. Dashboard
 * 2. Leads
 * 3. Sales Pipeline
 * 4. Follow-ups
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
export const CRM_SIDEBAR_SEQUENCE = [
  {
    key: "dashboard",
    href: "/crm/dashboard",
    section: "overview",
    label: "Dashboard",
    icon: Home,
    color: "#dc2626",
    iconClass: "text-red-500",
  },
  {
    key: "leads",
    href: "/crm/leads",
    section: "crm",
    label: "Leads",
    icon: Target,
    color: "#ea580c",
    iconClass: "text-orange-500",
  },
  {
    key: "pipeline",
    href: "/crm/pipeline",
    section: "pipeline",
    label: "Sales Pipeline",
    icon: TrendingUp,
    color: "#4f46e5",
    iconClass: "text-emerald-500",
  },
  {
    key: "followups",
    href: "/crm/followups",
    section: "sales_followups",
    label: "Follow-ups",
    icon: Phone,
    color: "#0d9488",
    iconClass: "text-teal-600 dark:text-teal-400",
  },
  {
    key: "meetings",
    href: "/crm/meetings",
    section: "sales_meetings",
    label: "Meetings",
    icon: Calendar,
    color: "#2563eb",
    iconClass: "text-cyan-500",
  },
  {
    key: "quotation",
    href: "/crm/quotation",
    section: "sales_commercials",
    label: "Quotation",
    icon: FileText,
    color: "#0284c7",
    iconClass: "text-orange-500",
  },
  {
    key: "agreements",
    href: "/crm/agreements",
    section: "agreements",
    label: "Agreements",
    icon: ShieldCheck,
    color: "#9333ea",
    iconClass: "text-indigo-500",
  },
  {
    key: "invoices",
    href: "/crm/invoices",
    section: "invoices",
    label: "Invoices",
    icon: CreditCard,
    color: "#d97706",
    iconClass: "text-emerald-500",
  },
  {
    key: "payments",
    href: "/crm/payments",
    section: "payments",
    label: "Payments",
    icon: Wallet,
    color: "#059669",
    iconClass: "text-lime-600",
  },
  {
    key: "clients",
    href: "/crm/clients",
    section: "clients",
    label: "Clients",
    icon: Building2,
    color: "#e11d48",
    iconClass: "text-blue-500",
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
    color: "#334155",
    iconClass: "text-slate-600 dark:text-slate-400",
  },
];

export default function CrmMobileNav({
  activeSection,
  chatMobilePane,
  isDark,
  unreadCount = 0,
}) {
  const pathname = usePathname() || "";
  const navScrollRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isChatOpen = (activeSection === "chat" || pathname.startsWith("/crm/chat")) && chatMobilePane === "chat";

  // Check if a specific nav item is active
  const checkIsActive = (item) => {
    if (item.href === "/crm/dashboard") {
      return pathname === "/crm/dashboard" || activeSection === "overview";
    }
    if (item.href === "/crm/leads") {
      return pathname === "/crm/leads" || pathname === "/crm" || activeSection === "crm";
    }
    return pathname === item.href || pathname.startsWith(item.href + "/") || activeSection === item.section;
  };

  // Automatically scroll the active tab to center when route changes
  useEffect(() => {
    if (!navScrollRef.current) return;
    const activeBtn = navScrollRef.current.querySelector("[data-active='true']");
    if (activeBtn) {
      activeBtn.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [pathname, activeSection]);

  if (isChatOpen) return null;

  return (
    <>
      {/* 1. All-Tabs Quick Grid Drawer (opened by the Grid button) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer animate-fadeIn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          />

          {/* Drawer Container */}
          <div
            className={`relative w-full max-h-[85dvh] rounded-t-[28px] border-t shadow-2xl flex flex-col z-10 overflow-hidden ${
              isDark
                ? "bg-[#111113] border-neutral-800 text-neutral-100"
                : "bg-white border-gray-200 text-gray-900 shadow-black/20"
            }`}
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
            }}
          >
            {/* Pull Bar */}
            <div
              className="pt-3 pb-1.5 flex justify-center shrink-0 cursor-pointer"
              onClick={() => setDrawerOpen(false)}
            >
              <div className="w-11 h-1.5 rounded-full bg-gray-300 dark:bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800/80 shrink-0">
              <div>
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-gray-400 dark:text-neutral-500 font-sans block">
                  CRM WORKSPACE NAVIGATION
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  All 13 Modules
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Complete Grid List matching desktop sequence */}
            <div className="overflow-y-auto flex-1 overscroll-contain p-3 grid grid-cols-2 gap-2 no-scrollbar">
              {CRM_SIDEBAR_SEQUENCE.map((item, index) => {
                const Icon = item.icon;
                const isActive = checkIsActive(item);

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "border-red-500 bg-red-50/70 dark:bg-red-500/10 text-red-600 dark:text-red-400 shadow-xs font-bold"
                        : isDark
                        ? "border-neutral-800/80 bg-neutral-900/40 text-neutral-200 hover:bg-neutral-800/60"
                        : "border-gray-100 bg-gray-50/70 text-gray-800 hover:bg-gray-100/80"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-red-600 text-white shadow-xs"
                          : isDark
                          ? "bg-neutral-800 text-neutral-300"
                          : "bg-white text-gray-700 shadow-2xs border border-gray-100"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 stroke-[2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-neutral-500 truncate leading-tight mt-0.5">
                        #{index + 1} Module
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Primary Fixed Bottom Navigation Bar */}
      <nav
        aria-label="CRM Mobile Footer Navigation"
        className={`fixed left-0 right-0 bottom-0 z-40 md:hidden border-t transition-colors duration-200 select-none shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)] ${
          isDark
            ? "bg-[#0b0b0c]/95 backdrop-blur-xl border-neutral-800 text-neutral-400"
            : "bg-white/95 backdrop-blur-xl border-gray-200/90 text-gray-600"
        }`}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.35rem)",
        }}
      >
        <div className="flex items-center justify-between w-full">
          {/* Scrollable Tabs Container matching Desktop Sidebar sequence 1-to-1 */}
          <div
            ref={navScrollRef}
            className="flex-1 min-w-0 flex items-center overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1.5 gap-1"
          >
            {CRM_SIDEBAR_SEQUENCE.map((item) => {
              const Icon = item.icon;
              const isActive = checkIsActive(item);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  data-active={isActive ? "true" : "false"}
                  className={`min-w-[70px] sm:min-w-[76px] h-13 flex flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1 transition-all shrink-0 snap-center cursor-pointer group ${
                    isActive
                      ? isDark
                        ? "text-red-400 font-extrabold"
                        : "text-red-600 font-extrabold"
                      : isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <div
                    className={`relative px-2.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
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
                      className={`w-4.5 h-4.5 transition-transform ${
                        isActive ? "stroke-[2.3]" : "stroke-[1.8]"
                      }`}
                    />
                    {item.key === "chat" && unreadCount > 0 && (
                      <span
                        className={`absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center ring-2 ${
                          isDark ? "ring-[#0b0b0c]" : "ring-white"
                        }`}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="w-full text-[9.5px] tracking-tight leading-tight truncate text-center block">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-red-600 dark:bg-red-400 mt-0.5 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick "All Tabs" Drawer Trigger Button on the right edge */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="All Modules Menu"
            title="All Modules Menu"
            className={`shrink-0 w-11 h-13 flex flex-col items-center justify-center gap-0.5 border-l px-1 transition-colors cursor-pointer ${
              isDark
                ? "border-neutral-800 text-neutral-400 hover:text-white bg-[#0b0b0c]/60"
                : "border-gray-200 text-gray-500 hover:text-gray-900 bg-gray-50/50"
            }`}
          >
            <div className="p-1 rounded-lg">
              <Grid className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <span className="text-[9px] font-bold tracking-tight">All</span>
          </button>
        </div>
      </nav>
    </>
  );
}
