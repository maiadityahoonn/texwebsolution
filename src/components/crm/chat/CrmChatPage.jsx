"use client";

import dynamic from "next/dynamic";
import { useCrmShell } from "@/components/crm/shell/CrmShellContext";

const ChatView = dynamic(() => import("@/components/chat/ChatView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[460px] rounded-2xl border border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden shadow-2xs">
      <div className="border-r border-gray-100 dark:border-[#3a3020] p-3 space-y-3 hidden md:block">
        <div className="h-9 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-20 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-2.5 w-32 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 flex flex-col justify-between min-h-[460px]">
        <div className="space-y-4">
          <div className="h-9 w-44 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-14 w-3/4 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-14 w-2/3 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse ml-auto" />
        </div>
        <div className="h-11 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  ),
});

export default function CrmChatPage() {
  const {
    chatMobilePane,
    setChatMobilePane,
    selectedContactId,
    setSelectedContactId,
    chatContacts,
    profiles,
    sessionUser,
    userProfile,
    isDark,
    setToast,
  } = useCrmShell();

  return (
    <ChatView
      chatMobilePane={chatMobilePane}
      setChatMobilePane={setChatMobilePane}
      selectedContactId={selectedContactId}
      setSelectedContactId={setSelectedContactId}
      canAccessDirectChat
      chatContacts={chatContacts}
      profiles={profiles}
      sessionUser={sessionUser}
      userProfile={userProfile}
      isDark={isDark}
      setToast={setToast}
    />
  );
}
