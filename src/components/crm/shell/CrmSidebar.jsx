"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  Calendar,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Settings,
  ShieldCheck,
  Sun,
  Target,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { ROLE_LABELS, profileDepartmentLabel } from "@/components/crm/shared/crmConstants";

export default function CrmSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeSection,
  isDark,
  toggleTheme,
  sessionUser,
  userProfile,
  currentRole,
  unreadCount = 0,
  settingsMenuOpen,
  setSettingsMenuOpen,
  handleSignOut,
}) {
  const pathname = usePathname() || "";

  // Helper to determine if link is active
  const isDashboardActive =
    pathname === "/crm/dashboard" ||
    pathname.startsWith("/crm/dashboard/") ||
    pathname === "/crm/dashboard" ||
    activeSection === "overview";
  const isLeadsActive =
    pathname === "/crm/leads" ||
    pathname.startsWith("/crm/leads/") ||
    pathname === "/crm" ||
    activeSection === "crm";
  const isPipelineActive =
    pathname === "/crm/pipeline" ||
    pathname.startsWith("/crm/pipeline/") ||
    activeSection === "pipeline";
  const isFollowupsActive =
    pathname === "/crm/followups" ||
    pathname.startsWith("/crm/followups/") ||
    activeSection === "sales_followups";
  const isMeetingsActive =
    pathname === "/crm/meetings" ||
    pathname.startsWith("/crm/meetings/") ||
    activeSection === "sales_meetings";
  const isQuotationActive =
    pathname === "/crm/quotation" ||
    pathname.startsWith("/crm/quotation/") ||
    activeSection === "sales_commercials";
  const isAgreementsActive =
    pathname === "/crm/agreements" ||
    pathname.startsWith("/crm/agreements/") ||
    activeSection === "agreements";
  const isInvoicesActive =
    pathname === "/crm/invoices" ||
    pathname.startsWith("/crm/invoices/") ||
    activeSection === "invoices";
  const isPaymentsActive =
    pathname === "/crm/payments" ||
    pathname.startsWith("/crm/payments/") ||
    activeSection === "payments";
  const isClientsActive =
    pathname === "/crm/clients" ||
    pathname.startsWith("/crm/clients/") ||
    activeSection === "clients";
  const isReportsActive =
    pathname === "/crm/reports" ||
    pathname.startsWith("/crm/reports/") ||
    activeSection === "sales_reports";
  const isChatActive =
    pathname === "/crm/chat" ||
    pathname.startsWith("/crm/chat/") ||
    activeSection === "chat";
  const isAlertsActive =
    pathname === "/crm/alerts" ||
    pathname.startsWith("/crm/alerts/") ||
    activeSection === "alerts";
  const isSettingsActive =
    pathname === "/crm/settings" ||
    pathname.startsWith("/crm/settings/") ||
    activeSection === "settings";
  const navItemClass = (isActive) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${
      isActive
        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
    }`;

  return (
    <aside
      className={`admin-sidebar fixed top-0 bottom-0 left-0 h-screen max-h-screen border-r z-40 transition-all duration-300 hidden md:flex flex-col justify-between overflow-hidden select-none ${
        sidebarOpen
          ? "w-64 sm:w-68 translate-x-0"
          : "w-64 -translate-x-full md:w-[72px] md:translate-x-0 admin-sidebar-collapsed"
      } ${
        isDark
          ? "bg-[#0b0b0c] border-neutral-800 text-neutral-200"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      {/* 1. Sidebar Header */}
      <div className="admin-sidebar-header h-16 px-4 sm:px-5 flex items-center justify-between border-b border-gray-200/80 dark:border-slate-800/80 shrink-0">
        <Link href="/crm/dashboard" className="admin-sidebar-logo flex items-center group min-w-0">
          <Image
            width={140}
            height={38}
            alt="TexWeb Solution Logo"
            src="/texweb-full-logo-original.png"
            className="admin-sidebar-full-logo h-8 w-auto max-w-[152px] object-contain shrink-0 group-hover:scale-105 transition-transform"
            style={{ width: "auto" }}
            priority
          />
          <Image
            width={34}
            height={34}
            alt="TexWeb Logo Icon"
            src="/texweb-logo-icon.png"
            className="admin-sidebar-collapsed-logo h-8.5 w-auto object-contain shrink-0 hidden group-hover:scale-105 transition-transform"
            style={{ width: "auto" }}
          />
        </Link>

        <div className="admin-sidebar-actions flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="admin-sidebar-toggle p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 stroke-[1.75]" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 stroke-[1.75]" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Scrollable Navigation Menu */}
      <div className="admin-sidebar-nav flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-2.5 space-y-0.5 text-sm no-scrollbar">
        {/* Main Dashboard */}
        <Link
          href="/crm/dashboard"
          aria-label="Dashboard"
          title="Dashboard"
          className={navItemClass(isDashboardActive)}
        >
          <div className="flex items-center gap-3.5">
            <Home className="w-5 h-5 shrink-0 stroke-[1.75]" />
            <span className="admin-sidebar-item-label">Dashboard</span>
          </div>
        </Link>

        {/* CRM & Sales */}
        <div className="admin-sidebar-divider border-t border-gray-100 dark:border-slate-800/80 my-2 mx-1" />
        <div className="admin-sidebar-group-header px-3 pt-2 pb-1">
          <span className="admin-sidebar-group-title text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            CRM & Sales
          </span>
        </div>

        <Link
          href="/crm/leads"
          aria-label="Leads"
          title="Leads"
          className={navItemClass(isLeadsActive)}
        >
          <div className="flex items-center gap-3.5">
            <Target className="w-5 h-5 shrink-0 stroke-[1.75] text-red-500" />
            <span className="admin-sidebar-item-label">Leads</span>
          </div>
        </Link>

        <Link
          href="/crm/pipeline"
          aria-label="Sales Pipeline"
          title="Sales Pipeline"
          className={navItemClass(isPipelineActive)}
        >
          <div className="flex items-center gap-3.5">
            <TrendingUp className="w-5 h-5 shrink-0 stroke-[1.75] text-emerald-500" />
            <span className="admin-sidebar-item-label">Sales Pipeline</span>
          </div>
        </Link>

        <Link
          href="/crm/followups"
          aria-label="Sales Follow-ups"
          title="Sales Follow-ups"
          className={navItemClass(isFollowupsActive)}
        >
          <div className="flex items-center gap-3.5">
            <Phone className="w-5 h-5 shrink-0 stroke-[2.2] text-teal-600 dark:text-teal-400" />
            <span className="admin-sidebar-item-label">Follow-ups</span>
          </div>
        </Link>

        <Link
          href="/crm/meetings"
          aria-label="Sales Meetings"
          title="Sales Meetings"
          className={navItemClass(isMeetingsActive)}
        >
          <div className="flex items-center gap-3.5">
            <Calendar className="w-5 h-5 shrink-0 stroke-[1.75] text-cyan-500" />
            <span className="admin-sidebar-item-label">Meetings</span>
          </div>
        </Link>

        <Link
          href="/crm/quotation"
          aria-label="Quotation"
          title="Quotation"
          className={navItemClass(isQuotationActive)}
        >
          <div className="flex items-center gap-3.5">
            <FileText className="w-5 h-5 shrink-0 stroke-[1.75] text-orange-500" />
            <span className="admin-sidebar-item-label">Quotation</span>
          </div>
        </Link>

        <Link
          href="/crm/agreements"
          aria-label="Agreements"
          title="Agreements"
          className={navItemClass(isAgreementsActive)}
        >
          <div className="flex items-center gap-3.5">
            <ShieldCheck className="w-5 h-5 shrink-0 stroke-[1.75] text-indigo-500" />
            <span className="admin-sidebar-item-label">Agreements</span>
          </div>
        </Link>

        <Link
          href="/crm/invoices"
          aria-label="Invoices"
          title="Invoices"
          className={navItemClass(isInvoicesActive)}
        >
          <div className="flex items-center gap-3.5">
            <CreditCard className="w-5 h-5 shrink-0 stroke-[1.75] text-emerald-500" />
            <span className="admin-sidebar-item-label">Invoices</span>
          </div>
        </Link>

        <Link
          href="/crm/payments"
          aria-label="Payments"
          title="Payments"
          className={navItemClass(isPaymentsActive)}
        >
          <div className="flex items-center gap-3.5">
            <Wallet className="w-5 h-5 shrink-0 stroke-[1.75] text-lime-600" />
            <span className="admin-sidebar-item-label">Payments</span>
          </div>
        </Link>

        <Link
          href="/crm/clients"
          aria-label="Clients"
          title="Clients"
          className={navItemClass(isClientsActive)}
        >
          <div className="flex items-center gap-3.5">
            <Building2 className="w-5 h-5 shrink-0 stroke-[1.75] text-blue-500" />
            <span className="admin-sidebar-item-label">Clients</span>
          </div>
        </Link>

        <Link
          href="/crm/reports"
          aria-label="Sales Reports"
          title="Sales Reports"
          className={navItemClass(isReportsActive)}
        >
          <div className="flex items-center gap-3.5">
            <Activity className="w-5 h-5 shrink-0 stroke-[1.75] text-violet-500" />
            <span className="admin-sidebar-item-label">Sales Reports</span>
          </div>
        </Link>

        {/* Communication */}
        <div className="admin-sidebar-divider border-t border-gray-100 dark:border-slate-800/80 my-2 mx-1" />
        <div className="admin-sidebar-group-header px-3 pt-2 pb-1">
          <span className="admin-sidebar-group-title text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Communication
          </span>
        </div>

        <Link
          href="/crm/chat"
          aria-label="Team Chat"
          title="Team Chat"
          className={navItemClass(isChatActive)}
        >
          <div className="flex items-center gap-3.5">
            <MessageSquare className="w-5 h-5 shrink-0 stroke-[1.75] text-emerald-500" />
            <span className="admin-sidebar-item-label">Team Chat</span>
          </div>
        </Link>


        {/* System */}
        <div className="admin-sidebar-divider border-t border-gray-100 dark:border-slate-800/80 my-2 mx-1" />
        <div className="admin-sidebar-group-header px-3 pt-2 pb-1">
          <span className="admin-sidebar-group-title text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            System
          </span>
        </div>

        <Link
          href="/crm/settings"
          aria-label="Profile & Settings"
          title="Profile & Settings"
          className={navItemClass(isSettingsActive)}
        >
          <div className="flex items-center gap-3.5">
            <Settings className="w-5 h-5 shrink-0 stroke-[1.75]" />
            <span className="admin-sidebar-item-label">Profile & Settings</span>
          </div>
        </Link>

        <Link
          href="/"
          target="_blank"
          aria-label="View Website"
          title="View Website"
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <ExternalLink className="w-5 h-5 shrink-0 stroke-[1.75]" />
          <span className="admin-sidebar-item-label">View Website</span>
        </Link>
      </div>

      {/* 3. Bottom Workspace Card */}
      <div className="admin-sidebar-footer p-3 border-t border-gray-100 dark:border-slate-800/80 relative shrink-0 mt-auto space-y-2">
        <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FFF9F3] dark:bg-slate-800/90 border border-[#FEE7D6] dark:border-slate-700/60 flex items-center justify-center shadow-2xs">
          <Link
            href="/crm/settings"
            className={`flex items-center min-w-0 group ${
              sidebarOpen ? "gap-2.5 flex-1 justify-start" : "justify-center"
            }`}
            title={userProfile?.full_name || sessionUser?.email || "Profile & Settings"}
            aria-label="Profile & Settings"
          >
            <div
              className="w-9 h-9 rounded-xl bg-[#18181B] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs overflow-hidden group-hover:opacity-90 transition"
              title="Profile & Settings"
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
            </div>

            {sidebarOpen && (
              <div className="admin-sidebar-profile-info min-w-0 flex-1" title={userProfile?.full_name || sessionUser?.email}>
                <div className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[130px]">
                  {userProfile?.full_name ||
                    sessionUser?.user_metadata?.full_name ||
                    sessionUser?.email?.split("@")[0] ||
                    "Workspace User"}
                </div>
                <div className="mt-0.5">
                  <span className="inline-block px-2 py-0.2 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[10px] font-semibold text-gray-700 dark:text-gray-300 shadow-2xs">
                    {ROLE_LABELS[currentRole] || "Member"}
                  </span>
                </div>
              </div>
            )}
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className="admin-sidebar-theme-toggle w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          <span className="flex items-center gap-2 min-w-0">
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 shrink-0" />
            )}
            <span className="admin-sidebar-theme-label text-xs font-bold truncate">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </span>
          <span className="admin-sidebar-theme-state text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
            {isDark ? "ON" : "OFF"}
          </span>
        </button>

        {/* Settings Popover */}
        {settingsMenuOpen && (
          <div className="absolute bottom-20 left-3 right-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50 space-y-2 animate-scaleUp text-xs font-medium">
            <div className="pb-2.5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
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
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 dark:text-white truncate">
                  {userProfile?.full_name || "Workspace User"}
                </div>
                <div className="text-[11px] text-gray-400 dark:text-slate-500 truncate">
                  {sessionUser?.email}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-500/20">
                    {ROLE_LABELS[currentRole] || currentRole}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                    {profileDepartmentLabel(userProfile)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/crm/settings"
              onClick={() => setSettingsMenuOpen?.(false)}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold transition cursor-pointer"
            >
              <User className="w-4 h-4 text-red-600" />
              <span>Profile & Settings</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
                <span>Theme ({isDark ? "Dark" : "Light"})</span>
              </div>
              <span className="text-[10px] text-gray-400">Toggle</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
