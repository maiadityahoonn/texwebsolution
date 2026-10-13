"use client";

import dynamic from "next/dynamic";
import { useCrmShell } from "@/components/crm/shell/CrmShellContext";

const ChatView = dynamic(() => import("@/components/chat/ChatView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[420px] rounded-3xl border border-gray-200/80 dark:border-slate-800/80 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-slate-400">
      Loading chat...
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
