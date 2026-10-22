"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Home,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Target,
} from "lucide-react";
import CrmSidebar from "@/components/crm/shell/CrmSidebar";
import CrmMobileHeader from "@/components/crm/shell/CrmMobileHeader";
import CrmMobileNav from "@/components/crm/shell/CrmMobileNav";
import { supabase } from "@/lib/supabase";
import { playNotificationSound } from "@/lib/notificationSound";
import { getProfiles } from "@/services/supabaseService";
import { useAuth } from "@/components/auth/useAuth";
import { useCrmNotifications } from "@/components/crm/hooks/useCrmNotifications";
import NotificationCenterModal from "@/components/crm/notifications/NotificationCenterModal";
import { useCrmData } from "@/components/crm/hooks/useCrmData";
import { useCrmRelationshipLeads } from "@/components/crm/hooks/useCrmRelationshipLeads";
import { CrmShellContext } from "./CrmShellContext";
import {
  CRM_NAV,
  SECTION_META,
  getThemeSnapshot,
  sectionFromPath,
  subscribeToThemeChanges,
} from "./CrmShellConfig";
import { convertLeadOrDealToClientAndProject } from "./crmClientConversion";
import { useCrmLayoutActions } from "./useCrmLayoutActions";

export default function CrmAppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [chatMobilePane, setChatMobilePane] = useState("channels");
  const [projectsData, setProjectsData] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [clientsLoadedForConversion, setClientsLoadedForConversion] = useState(false);
  const activeSection = sectionFromPath(pathname);
  const theme = useSyncExternalStore(subscribeToThemeChanges, getThemeSnapshot, () => "light");
  const isDark = theme === "dark";

  const auth = useAuth({ setToast, setProfiles });
  const { sessionUser, userProfile, handleSignOut } = auth;

  const crmData = useCrmData({
    sessionUserId: sessionUser?.id,
    pushLiveSalesNotification: (title, body) => {
      playNotificationSound("lead");
      setToast(`${title}: ${body}`);
    },
  });

  const handleNotificationNavigation = useCallback(
    (linkUrl) => {
      const target = String(linkUrl || "/crm/alerts");
      router.push(target.startsWith("/") ? target : "/crm/alerts");
    },
    [router]
  );

  const {
    leads,
    setLeads,
    clients,
    setClients,
    setDeals,
    salesFollowUps,
    salesMeetings,
    loadCrmData,
    handleRealtimeLead,
    handleRealtimeDeal,
    handleRealtimeFollowUp,
    handleRealtimeSalesMeeting,
    handleRealtimeProposal,
    handleRealtimeAgreement,
    handleRealtimeInvoice,
  } = crmData;

  const relationshipLeads = useCrmRelationshipLeads({
    sessionUserId: sessionUser?.id || "",
    leads,
    clients,
    deals: crmData.deals,
    followUps: salesFollowUps,
    meetings: salesMeetings,
  });

  const {
    notifications,
    unreadCount,
    notificationModalOpen,
    setNotificationModalOpen,
    handleReadNotification,
    handleMarkAllAsRead,
    handleDeleteNotification,
    notificationPreferences,
    handleSaveNotificationPreferences,
  } = useCrmNotifications({
    sessionUser,
    userProfile,
    salesFollowUps,
    salesMeetings,
    onNavigateNotification: handleNotificationNavigation,
    setToast,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  useEffect(() => {
    if (!sessionUser?.id || !userProfile) return;
    loadCrmData(activeSection);
  }, [activeSection, loadCrmData, sessionUser?.id, userProfile]);

  useEffect(() => {
    if (!sessionUser?.id) return undefined;
    const channel = supabase
      .channel(`crm-routes-${sessionUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, handleRealtimeLead)
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, handleRealtimeDeal)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_followups" }, (payload) =>
        handleRealtimeFollowUp(payload, { notify: true })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_meetings" }, (payload) =>
        handleRealtimeSalesMeeting(payload, { notify: true })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "proposals" }, handleRealtimeProposal)
      .on("postgres_changes", { event: "*", schema: "public", table: "agreements" }, handleRealtimeAgreement)
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, handleRealtimeInvoice)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [
    handleRealtimeAgreement,
    handleRealtimeDeal,
    handleRealtimeFollowUp,
    handleRealtimeInvoice,
    handleRealtimeLead,
    handleRealtimeProposal,
    handleRealtimeSalesMeeting,
    sessionUser?.id,
  ]);

  useEffect(() => {
    if (!sessionUser && !auth.loading) {
      const timer = setTimeout(() => {
        if (!sessionUser) {
          const returnUrl = encodeURIComponent(pathname || "/crm/leads");
          router.replace(`/login?redirect=${returnUrl}`);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [auth.loading, pathname, router, sessionUser]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    if (typeof window !== "undefined") {
      localStorage.setItem("texweb_theme", next);
      localStorage.setItem("texweb_workspace_theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      window.dispatchEvent(new Event("texweb-theme-change"));
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("texweb_sidebar_open");
      if (stored !== null) {
        setSidebarOpen(stored === "true");
      }
    }
  }, []);

  const handleToggleSidebar = useCallback((valOrFn) => {
    setSidebarOpen((prev) => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (typeof window !== "undefined") {
        localStorage.setItem("texweb_sidebar_open", String(next));
      }
      return next;
    });
  }, []);

  const currentRole = userProfile?.role || "super_admin";

  useEffect(() => {
    if (!sessionUser?.id) return;
    let cancelled = false;
    getProfiles().then((res) => {
      if (cancelled) return;
      const list = res?.data || (Array.isArray(res) ? res : []);
      setProfiles(list);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionUser?.id]);

  const chatContacts = useMemo(() => {
    if (!sessionUser?.id || !profiles.length) return [];
    return profiles.filter((profile) => profile?.id);
  }, [profiles, sessionUser?.id]);

  const handleConvertToClientAndProject = useCallback(
    async (leadOrDeal) => {
      await convertLeadOrDealToClientAndProject({
        leadOrDeal,
        clients,
        setClients,
        projectsData,
        setProjectsData,
        leads,
        setLeads,
        setDeals,
        clientsLoadedForConversion,
        setClientsLoadedForConversion,
        projectsLoaded,
        setProjectsLoaded,
        setToast,
      });
    },
    [clients, clientsLoadedForConversion, leads, projectsData, projectsLoaded, setClients, setDeals, setLeads]
  );

  const { workspaceViewProps } = useCrmLayoutActions({
    crmData,
    relationshipLeads,
    sessionUser,
    userProfile,
    activeSection,
    router,
    setToast,
    handleConvertToClientAndProject,
  });

  const contextValue = {
    sessionUser,
    userProfile,
    isDark,
    activeSection,
    workspaceViewProps,
    notifications,
    unreadCount,
    handleMarkAllAsRead,
    handleReadNotification,
    handleDeleteNotification,
    notificationPreferences,
    handleSaveNotificationPreferences,
    profiles,
    chatContacts,
    selectedContactId,
    setSelectedContactId,
    chatMobilePane,
    setChatMobilePane,
    currentRole,
    handleSignOut,
    profileEditForm: auth.profileEditForm,
    setProfileEditForm: auth.setProfileEditForm,
    savingProfile: auth.savingProfile,
    avatarUploading: auth.avatarUploading,
    avatarProcessingMsg: auth.avatarProcessingMsg,
    avatarStats: auth.avatarStats,
    handleAvatarFileSelect: auth.handleAvatarFileSelect,
    handleRemoveAvatar: auth.handleRemoveAvatar,
    handleSaveOwnProfile: auth.handleSaveOwnProfile,
    changePasswordForm: auth.changePasswordForm,
    setChangePasswordForm: auth.setChangePasswordForm,
    showNewPassword: auth.showNewPassword,
    setShowNewPassword: auth.setShowNewPassword,
    handleChangeOwnPassword: auth.handleChangeOwnPassword,
    updatingPassword: auth.updatingPassword,
    setToast,
  };

  if (!sessionUser || !userProfile) {
    return <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0b0c]" />;
  }

  const meta = SECTION_META[activeSection] || SECTION_META.crm;

  return (
    <CrmShellContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0b0c] text-gray-900 dark:text-white flex flex-col">
        {/* Unified Application Workspace Sidebar */}
        <CrmSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={handleToggleSidebar}
          activeSection={activeSection}
          chatMobilePane={chatMobilePane}
          isDark={isDark}
          toggleTheme={toggleTheme}
          sessionUser={sessionUser}
          userProfile={userProfile}
          currentRole={currentRole}
          unreadCount={0}
          settingsMenuOpen={settingsMenuOpen}
          setSettingsMenuOpen={setSettingsMenuOpen}
          handleSignOut={handleSignOut}
        />

        {/* Mobile Top Header */}
        <CrmMobileHeader
          activeSection={activeSection}
          chatMobilePane={chatMobilePane}
          isDark={isDark}
          toggleTheme={toggleTheme}
          canUseAlerts={true}
          unreadCount={unreadCount}
          userProfile={userProfile}
          sessionUser={sessionUser}
          onOpenNotifications={() => setNotificationModalOpen(true)}
        />

        {/* Mobile Bottom Navigation - 13 Modules matching desktop sidebar sequence 1-to-1 */}
        <CrmMobileNav
          activeSection={activeSection}
          chatMobilePane={chatMobilePane}
          isDark={isDark}
          unreadCount={unreadCount}
        />

        {/* Main Content Viewport */}
        <div
          className={`flex-1 transition-all duration-300 flex flex-col min-w-0 ${
            sidebarOpen ? "md:pl-64 sm:md:pl-68" : "md:pl-[72px]"
          }`}
        >
          <main className="min-h-screen pt-[calc(3.5rem+max(env(safe-area-inset-top,0px),1.5rem))] md:pt-0 pb-20 md:pb-6">
            {/* Desktop CRM Page Header (hidden on mobile to prevent double header) */}
            <header className="hidden md:flex sticky top-0 z-30 h-16 w-full bg-white/85 dark:bg-[#0b0b0c]/85 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-800/80 transition-colors duration-200">
              <div className="w-full h-full px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
                {/* Left Side: Crisp Vibrant Icon & Title (No Glow Shadow) */}
                <div className="flex items-center gap-3 min-w-0 shrink">
                  {(() => {
                    const HeaderIcon = meta.icon || Target;
                    const bgColor = meta.color || "#ea580c";
                    const colorFrom = meta.colorFrom || bgColor;
                    const colorTo = meta.colorTo || bgColor;
                    return (
                      <div
                        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-105 shadow-none border border-black/5 dark:border-white/10"
                        style={{
                          backgroundColor: bgColor,
                          backgroundImage: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
                        }}
                      >
                        <HeaderIcon className="w-5.5 h-5.5 stroke-[2.3] text-white" />
                      </div>
                    );
                  })()}

                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white truncate font-[Matter] leading-normal py-0.5">
                      {meta.title}
                    </h1>
                    {meta.desc && (
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 max-w-sm lg:max-w-md xl:max-w-xl truncate leading-tight mt-0.5 hidden sm:block">
                        {meta.desc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Dynamic Action Portal Buttons & Controls (Uniform h-9 Height) */}
                <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 ml-auto">
                  {/* Dynamic Action Buttons Slot (Add Lead, Add Deal, Meta Leads, Refresh, etc.) */}
                  <div id="crm-top-header-actions" className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 flex-nowrap" />

                  {/* Theme Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    className="hidden sm:flex h-9 w-9 rounded-xl border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 items-center justify-center cursor-pointer transition shadow-2xs active:scale-95 shrink-0"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  </button>

                  {/* Header Notification Center Trigger */}
                  <button
                    type="button"
                    onClick={() => setNotificationModalOpen(true)}
                    className="relative h-9 w-9 rounded-xl border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition shadow-2xs active:scale-95 shrink-0 group"
                    title="Open Notification Center"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 text-gray-700 dark:text-slate-200" />
                    {unreadCount > 0 ? (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0b0b0c] shadow-2xs">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            </header>
            <div className="p-2 min-[360px]:p-3 sm:p-4 md:p-6">
              {/* Mobile Page Sub-Header (Directly below top header) */}
              {activeSection !== "chat" && (
                <div className="relative z-20 flex md:hidden items-center justify-between gap-1.5 min-[360px]:gap-2 mb-2.5 min-[360px]:mb-3 px-2.5 py-1.5 min-[360px]:px-3 min-[360px]:py-2 bg-white/95 dark:bg-[#111113]/95 backdrop-blur-md rounded-2xl border border-gray-200/90 dark:border-neutral-800/90 shadow-2xs">
                  {/* Left: Page Icon & Page Name */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {(() => {
                      const SubIcon = meta.icon || Target;
                      const bgColor = meta.color || "#ea580c";
                      const colorFrom = meta.colorFrom || bgColor;
                      const colorTo = meta.colorTo || bgColor;
                      return (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{
                            backgroundColor: bgColor,
                            backgroundImage: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
                          }}
                        >
                          <SubIcon className="w-4 h-4 stroke-[2.3] text-white" />
                        </div>
                      );
                    })()}
                    <h1 className="text-base font-black tracking-tight text-gray-900 dark:text-white truncate font-[Matter] leading-normal py-0.5">
                      {meta.title}
                    </h1>
                  </div>

                  {/* Right: Page Actions with Icon & Short Text */}
                  <div id="crm-mobile-page-actions" className="flex items-center gap-1.5 shrink-0 flex-nowrap" />
                </div>
              )}

              {children}
            </div>
          </main>
        </div>

        {/* Notification Center Modal */}
        {notificationModalOpen && (
          <NotificationCenterModal
            isOpen={notificationModalOpen}
            isDark={isDark}
            notifications={notifications}
            onClose={() => setNotificationModalOpen(false)}
            onMarkRead={handleReadNotification}
            onMarkAllRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
            preferences={notificationPreferences}
            onSavePreferences={handleSaveNotificationPreferences}
            onSelectRecord={(url) => {
              if (url) router.push(url);
            }}
            salesMeetings={salesMeetings}
            salesFollowUps={salesFollowUps}
            leads={leads}
          />
        )}

        {toast && (
          <div className="fixed bottom-5 right-5 z-[120] max-w-sm rounded-2xl bg-gray-900 text-white px-4 py-3 text-sm font-semibold shadow-2xl">
            <button className="text-left" type="button" onClick={() => setToast("")}>
              {toast}
            </button>
          </div>
        )}
      </div>
    </CrmShellContext.Provider>
  );
}
