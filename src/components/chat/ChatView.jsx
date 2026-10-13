"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Folder,
  MessageSquare,
  Lock,
  Search,
  ChevronDown,
  Archive,
  Pin,
  VolumeX,
  MessageSquareDot,
  Ban,
  RefreshCw,
} from "lucide-react";
import { ROLE_LABELS, domainLabel } from "@/components/crm/shared/crmConstants";

const TexAppBatchChat = dynamic(() => import("@/components/chat/TexAppBatchChat"), { ssr: false });

const MESSAGE_EDIT_WINDOW_MS = 60 * 1000;

const CHAT_LABEL_PRESETS = [
  { id: "important", name: "Important", color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
  { id: "work", name: "Work", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  { id: "lead", name: "Lead / Client", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { id: "pending", name: "Pending", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { id: "personal", name: "Personal", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
];

function chatTimestamp(value) {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

const getBatchAvatarUrl = (batch) => {
  if (typeof batch?.avatar_url === "string" && batch.avatar_url.trim()) return batch.avatar_url.trim();
  return "";
};

export default function ChatView({
  chatMobilePane,
  setChatMobilePane,
  selectedContactId,
  setSelectedContactId,
  canAccessDirectChat,
  chatContacts = [],
  profiles = [],
  sessionUser,
  userProfile,
  tasks = [],
  meetings = [],
  messages = [],
  setMessages,
  chatBackSuppressAutoOpenRef,
  chatMobileHistoryGuardRef,
  loadMessages,
  workspaceOnlineUserIds = [],
  typingUsers = {},
  publishTyping,
  workspaceOnlineSet = new Set(),
  rememberDirectChatActivity,
  sendRealtimeMessage,
  updateRealtimeMessage,
  setToast,
  sendDirectMessageBroadcast,
  markDirectChatDelivered,
  markDirectChatRead,
  markDirectChatPreviewDeleted,
  forwardMessagesToTargets,
  retryDirectMessageOptimistic,
  isDark,
  localDate,
  selectedBatch,
  setSelectedBatchId,
  selectedBatchMembers = [],
  selectedBatchTasks = [],
  selectedBatchMeetings = [],
  activeBatchWorkspaceData = {},
  batches = [],
  setBatches,
  loadBatchWorkspaceData,
  sendBatchMessageOptimistic,
  pinBatchMessageOptimistic,
  createBatchWorkspaceItem,
  editBatchMessageOptimistic,
  deleteBatchMessagesOptimistic,
  setTaskDetailsModal,
  canManageSelectedBatch,
  isSelectedBatchWorkspaceLoading,
  batchWorkspaceLoadError,
  chatFilterChip,
  setChatFilterChip,
  availableChatBatches = [],
  directChatStats = { total: 0, online: 0 },
  screenLockPin,
  setShowSetPinModal,
  setIsScreenLocked,
  chatSearchQuery,
  setChatSearchQuery,
  setChatChannelTab,
  archivedChatIds = [],
  unifiedChatItems = [],
  batchChatMeta = {},
  setBatchChatMeta,
  batchNotificationMeta = {},
  pinnedChatIds = [],
  chatLabels = {},
  toggleArchiveChat,
  toggleManualUnread,
  manualUnreadChatIds = [],
  togglePinChat,
  openContactChat,
  blockedContactIds = [],
  directChatMeta = {},
  markChatAsReadLocally,
  setActiveSection,
}) {
  const getProfileAvatarUrl = (profile) => {
    const liveProfile = profiles.find((item) => item.id === profile?.id);
    const avatarUrl = liveProfile?.avatar_url || profile?.avatar_url || "";
    return typeof avatarUrl === "string" && avatarUrl.trim() ? avatarUrl.trim() : "";
  };

  const getChannelProfile = (profile) => profiles.find((item) => item.id === profile?.id) || profile || {};

  const channelRoleLabel = (role) => {
    if (role === "intern") return "Member";
    return ROLE_LABELS[role] || role || "Member";
  };

  const channelRolePillClass = (role) => {
    if (role === "hr") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800";
    return "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800";
  };

  const getBatchOnlineSummary = (batch) => {
    const memberIds = [
      batch?.hr_id,
      batch?.mentor_id,
      batch?.tl_id,
      ...(batch?.members || []).map((member) => member.id),
    ].filter(Boolean);
    const uniqueIds = Array.from(new Set(memberIds));
    const onlineCount = uniqueIds.filter((id) => workspaceOnlineSet.has(id)).length;
    return {
      onlineCount,
      totalCount: uniqueIds.length,
      isOnline: onlineCount > 0,
    };
  };

  const contactSubtitle = (contact) => {
    const profile = getChannelProfile(contact);
    const roleLabel = channelRoleLabel(profile?.role);
    const batchName = batches.find((batch) => batch.id === profile?.batch_id)?.name || profile?.batch_name || "";
    return [roleLabel, batchName].filter(Boolean).join(" - ");
  };

  return (
    <div className="flex-1 min-h-0 h-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)] gap-0 xl:gap-3 animate-fadeIn">
      {/* Left Column: Active WhatsApp Chat Area */}
      <div className={`${chatMobilePane === "chat" ? "fixed inset-0 z-50 xl:relative xl:inset-auto xl:z-auto flex animate-chat-pane-in bg-white dark:bg-[#0b0f17]" : "hidden"} xl:flex h-full min-h-0 rounded-none sm:rounded-2xl xl:rounded-3xl overflow-hidden border-0 sm:border border-gray-200/80 dark:border-slate-800/80 flex-col relative shadow-none`}>
        {selectedContactId && canAccessDirectChat ? (
          (() => {
            const activeContact = chatContacts.find((c) => c.id === selectedContactId) || profiles.find((p) => p.id === selectedContactId);
            if (!activeContact) {
              return (
                <div className="h-full flex items-center justify-center p-6 text-center text-gray-400 text-xs">
                  Contact not found or conversation ended.
                </div>
              );
            }
            return (
              <TexAppBatchChat
                mode="direct"
                contact={activeContact}
                currentUser={sessionUser}
                currentProfile={userProfile}
                batchTasks={tasks.filter((t) => t.assigned_to === activeContact.id || t.assigned_by === activeContact.id)}
                batchMeetings={meetings}
                messages={messages}
                onBack={() => {
                  if (chatBackSuppressAutoOpenRef?.current !== undefined) {
                    chatBackSuppressAutoOpenRef.current = true;
                  }
                  if (typeof window !== "undefined" && chatMobileHistoryGuardRef?.current) {
                    window.history.back();
                    return;
                  }
                  setSelectedContactId("");
                  setChatMobilePane("channels");
                }}
                onRefresh={() => loadMessages(activeContact.id)}
                onlineUserIds={workspaceOnlineUserIds}
                typingUsers={typingUsers}
                onTyping={publishTyping}
                onSendMessage={async (payload) => {
                  const isReceiverOnline = workspaceOnlineSet.has(activeContact.id) || (workspaceOnlineUserIds || []).includes(activeContact.id);
                  const nowIso = new Date().toISOString();
                  const msg = {
                    sender_id: sessionUser.id,
                    receiver_id: activeContact.id,
                    message: payload.message || "",
                    attachment_url: payload.attachment_url || null,
                    attachment_name: payload.attachment_name || null,
                    attachment_type: payload.attachment_type || null,
                    reply_to_id: payload.reply_to_id || null,
                    is_receiver_online: isReceiverOnline,
                    delivered_at: isReceiverOnline ? nowIso : null,
                  };
                  const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                  const tempMsg = {
                    ...msg,
                    id: tempId,
                    created_at: nowIso,
                    sender: userProfile,
                    pending: true,
                    delivered_at: isReceiverOnline ? nowIso : null,
                  };
                  setMessages((prev) => [...(prev || []), tempMsg]);
                  if (rememberDirectChatActivity) rememberDirectChatActivity(tempMsg);

                  const saved = await sendRealtimeMessage(msg);
                  if (!saved) {
                    setMessages((prev) => (prev || []).map((item) => (
                      item.id === tempId ? { ...item, pending: false, send_failed: true } : item
                    )));
                    setToast("Message could not be sent. Check network and try again.");
                    return false;
                  }

                  const existing = (messages || []).find((item) => item.id === tempId || item.id === saved.id);
                  const deliveredAt = saved.delivered_at || (isReceiverOnline ? nowIso : null) || existing?.delivered_at || tempMsg.delivered_at || null;
                  const readAt = saved.read_at || existing?.read_at || tempMsg.read_at || null;
                  const isRead = Boolean(saved.is_read || existing?.is_read || tempMsg.is_read);

                  const newMsg = {
                    ...tempMsg,
                    ...saved,
                    delivered_at: deliveredAt,
                    read_at: readAt,
                    is_read: isRead,
                    sender: saved.sender || userProfile,
                    pending: false,
                  };

                  setMessages((prev) => {
                    const list = prev || [];
                    const replaced = list.some((item) => item.id === tempId);
                    const next = replaced
                      ? list.map((item) => (item.id === tempId ? newMsg : item))
                      : [...list.filter((item) => item.id !== newMsg.id), newMsg];
                    return next.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                  });
                  if (rememberDirectChatActivity) rememberDirectChatActivity(newMsg);
                  if (sendDirectMessageBroadcast) sendDirectMessageBroadcast(activeContact.id, newMsg);
                  return true;
                }}
                availableChats={{ contacts: canAccessDirectChat ? chatContacts : [], batches: batches }}
                onMarkDelivered={(contactId) => markDirectChatDelivered(contactId || activeContact.id)}
                onMarkRead={() => markDirectChatRead(activeContact.id)}
                onEditMessage={async (messageId, text) => {
                  const target = messages.find((m) => m.id === messageId);
                  if (!target) return false;
                  const created = new Date(target.created_at).getTime();
                  if (Number.isNaN(created) || Date.now() - created > MESSAGE_EDIT_WINDOW_MS) {
                    setToast("Edit time window has expired.");
                    return false;
                  }
                  setMessages((prev) => (prev || []).map((m) => (
                    m.id === messageId ? { ...m, message: text, edited_at: new Date().toISOString(), pending_action: "edit" } : m
                  )));
                  const saved = await updateRealtimeMessage(messageId, {
                    message: text,
                    original_message: target.original_message || target.message,
                    edited_at: new Date().toISOString(),
                  });
                  if (!saved) {
                    setMessages((prev) => (prev || []).map((m) => (
                      m.id === messageId ? { ...m, message: target.message, pending_action: null } : m
                    )));
                    setToast("Message could not be edited.");
                    return false;
                  }
                  setMessages((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, ...saved, pending_action: null } : m)));
                  return true;
                }}
                onPinMessage={async (messageId, isPinned) => {
                  setMessages((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, is_pinned: isPinned, pending_action: "pin" } : m)));
                  const saved = await updateRealtimeMessage(messageId, { is_pinned: isPinned });
                  if (saved) {
                    setMessages((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, is_pinned: isPinned, pending_action: null } : m)));
                    setToast(isPinned ? "Message pinned." : "Message unpinned.");
                  } else {
                    setMessages((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, is_pinned: !isPinned, pending_action: null } : m)));
                    setToast("Pin update failed.");
                  }
                }}
                onDeleteMessage={async ({ messageIds, deleteType }) => {
                  if (deleteType === "for_everyone") {
                    const deletedAt = new Date().toISOString();
                    if (markDirectChatPreviewDeleted) markDirectChatPreviewDeleted(activeContact.id, deletedAt);
                    setMessages((prev) =>
                      (prev || []).map((m) =>
                        messageIds.includes(m.id)
                          ? {
                            ...m,
                            is_deleted: true,
                            deleted_at: deletedAt,
                            deleted_by: sessionUser.id,
                            is_pinned: false,
                            pending_action: "delete",
                          }
                          : m
                      )
                    );
                    for (const mId of messageIds) {
                      const saved = await updateRealtimeMessage(mId, {
                        is_deleted: true,
                        deleted_at: deletedAt,
                        deleted_by: sessionUser.id,
                      });
                      if (!saved) {
                        setToast("Delete failed. Refreshing chat...");
                        loadMessages(activeContact.id);
                        return;
                      }
                    }
                    setMessages((prev) =>
                      (prev || []).map((m) =>
                        messageIds.includes(m.id)
                          ? {
                            ...m,
                            is_deleted: true,
                            deleted_at: deletedAt,
                            deleted_by: sessionUser.id,
                            is_pinned: false,
                            pending_action: null,
                          }
                          : m
                      )
                    );
                  } else {
                    setMessages((prev) => (prev || []).filter((m) => !messageIds.includes(m.id)));
                  }
                  setToast(deleteType === "for_everyone" ? "Deleted for everyone." : "Deleted for you.");
                }}
                onForwardMessage={async ({ targets, messages: msgsToForward }) => {
                  await forwardMessagesToTargets(targets, msgsToForward);
                }}
                onRetryMessage={async (message) => {
                  await retryDirectMessageOptimistic(activeContact.id, message);
                }}
                isDark={isDark}
                localDate={localDate}
              />
            );
          })()
        ) : selectedBatch ? (
          <>
            <TexAppBatchChat
              mode="batch"
              batch={selectedBatch}
              currentUser={sessionUser}
              currentProfile={userProfile}
              batchMembers={selectedBatchMembers}
              batchTasks={selectedBatchTasks}
              batchMeetings={selectedBatchMeetings}
              messages={activeBatchWorkspaceData?.messages || []}
              availableChats={{ contacts: canAccessDirectChat ? chatContacts : [], batches: batches }}
              onOpenDirectChat={canAccessDirectChat ? (member) => {
                if (!chatContacts.some((contact) => contact.id === member?.id)) {
                  setToast("Direct chat is limited to HR, Mentor, and Admin for this role.");
                  return;
                }
                setActiveSection("chat");
                setSelectedBatchId("");
                openContactChat(member.id);
              } : null}
              onUpdateBatchInfo={(updatedBatch) => {
                setBatches((prev) => (prev || []).map((b) => (b.id === updatedBatch.id ? { ...b, ...updatedBatch } : b)));
              }}
              onBack={() => {
                if (chatBackSuppressAutoOpenRef?.current !== undefined) {
                  chatBackSuppressAutoOpenRef.current = true;
                }
                if (typeof window !== "undefined" && chatMobileHistoryGuardRef?.current) {
                  window.history.back();
                  return;
                }
                setSelectedBatchId("");
                setChatMobilePane("channels");
              }}
              onRefresh={() => loadBatchWorkspaceData(selectedBatch.id)}
              onlineUserIds={workspaceOnlineUserIds}
              typingUsers={typingUsers}
              onTyping={publishTyping}
              onSendMessage={async (payload) => {
                return sendBatchMessageOptimistic(selectedBatch.id, payload);
              }}
              onPinMessage={async (messageId, isPinned) => {
                await pinBatchMessageOptimistic(selectedBatch.id, messageId, isPinned);
              }}
              onMarkRead={() => createBatchWorkspaceItem({
                type: "read_messages",
                batch_id: selectedBatch.id,
              })}
              onEditMessage={async (messageId, text) => {
                return editBatchMessageOptimistic(selectedBatch.id, messageId, text);
              }}
              onDeleteMessage={async ({ messageIds, deleteType }) => {
                await deleteBatchMessagesOptimistic(selectedBatch.id, messageIds, deleteType);
              }}
              onForwardMessage={async ({ targets, messages: msgsToForward }) => {
                await forwardMessagesToTargets(targets, msgsToForward);
              }}
              onRetryMessage={async (message) => {
                await sendBatchMessageOptimistic(selectedBatch.id, {
                  message: message.message || "",
                  reply_to_id: message.reply_to_id || null,
                  attachment_url: message.attachment_url || null,
                  attachment_name: message.attachment_name || null,
                  attachment_type: message.attachment_type || null,
                  reference_type: message.reference_type || "none",
                  reference_id: message.reference_id || null,
                }, { replaceId: message.id });
              }}
              onOpenTaskDetails={(task) => setTaskDetailsModal(task)}
              isDark={isDark}
              localDate={localDate}
              canManage={canManageSelectedBatch}
            />
            {isSelectedBatchWorkspaceLoading && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#18150f]/90 border border-gray-200 dark:border-[#3a3020] text-[11px] font-bold text-gray-600 dark:text-[#f4ead2] shadow-sm flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                <span>Loading batch chat...</span>
              </div>
            )}
            {batchWorkspaceLoadError && !isSelectedBatchWorkspaceLoading && (
              <div className="absolute top-3 left-3 right-3 z-20 rounded-2xl border border-red-200 bg-red-50/95 px-3 py-2 text-[11px] font-bold text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-950/80 dark:text-red-200">
                <div className="flex items-start justify-between gap-2">
                  <span>Batch chat load failed: {batchWorkspaceLoadError}</span>
                  <button
                    type="button"
                    onClick={() => selectedBatch?.id && loadBatchWorkspaceData(selectedBatch.id)}
                    className="shrink-0 rounded-lg bg-red-600 px-2 py-1 text-[10px] font-black text-white"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/40 dark:bg-transparent">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 shadow-none">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              No active batch selected
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mt-1">
              Select a batch or team member from the right panel to begin chatting.
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Channels & Contacts List matching Batch Overview Chat Tab */}
      <div className={`${chatMobilePane === "chat" ? "hidden" : "flex"} xl:flex rounded-none xl:rounded-3xl border-0 xl:border xl:border-gray-200/80 xl:dark:border-slate-800/80 p-0 xl:p-4 space-y-3 bg-transparent xl:bg-white/60 xl:dark:bg-slate-900/30 shadow-none xl:shadow-2xs flex-col xl:h-full xl:min-h-0 w-full`}>
        <div className="hidden xl:flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800/80 shrink-0">
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            Channels & Contacts
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
              {chatFilterChip === "groups"
                ? `${availableChatBatches.length} Batches`
                : chatFilterChip === "direct"
                ? `${directChatStats.total} Direct`
                : `${availableChatBatches.length + (canAccessDirectChat ? directChatStats.total : 0)} Chats`}
            </span>
            <button
              type="button"
              onClick={() => {
                if (!screenLockPin) {
                  setShowSetPinModal(true);
                } else {
                  setIsScreenLocked(true);
                }
              }}
              className={`p-1 rounded-lg border transition cursor-pointer ${
                screenLockPin
                  ? "border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  : "border-gray-200 dark:border-slate-800 text-gray-400 hover:text-red-600"
              }`}
              title={screenLockPin ? "Lock Screen (PIN active)" : "Set Screen Lock PIN"}
              aria-label="Screen Lock"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search filter for channels */}
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels or contacts..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-xs placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        {/* WhatsApp Filter: Mobile Dropdown (<640px) */}
        <div className="block sm:hidden relative">
          <select
            value={chatFilterChip}
            onChange={(e) => {
              const val = e.target.value;
              setChatFilterChip(val);
              if (val === "groups") setChatChannelTab("batches");
              if (val === "direct") setChatChannelTab("direct");
            }}
            className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 appearance-none cursor-pointer"
          >
            <option value="all">All Chats</option>
            <option value="unread">Unread</option>
            <option value="groups">Groups</option>
            {canAccessDirectChat && <option value="direct">Direct Chats</option>}
            <option value="archived">Archived</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* WhatsApp Filter Chips: Tablet & Desktop (>=640px) */}
        <div className="hidden sm:flex items-center gap-1.5 flex-wrap py-0.5 shrink-0 text-[11px] select-none">
          <button
            type="button"
            onClick={() => setChatFilterChip("all")}
            className={`px-3 py-1 rounded-full font-bold transition cursor-pointer shrink-0 ${
              chatFilterChip === "all"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setChatFilterChip("unread")}
            className={`px-3 py-1 rounded-full font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              chatFilterChip === "unread"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
            }`}
          >
            <span>Unread</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setChatFilterChip("groups");
              setChatChannelTab("batches");
            }}
            className={`px-3 py-1 rounded-full font-bold transition cursor-pointer shrink-0 ${
              chatFilterChip === "groups"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
            }`}
          >
            Groups
          </button>
          {canAccessDirectChat && (
            <button
              type="button"
              onClick={() => {
                setChatFilterChip("direct");
                setChatChannelTab("direct");
              }}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer shrink-0 ${
                chatFilterChip === "direct"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
              }`}
            >
              Direct
            </button>
          )}
          <button
            type="button"
            onClick={() => setChatFilterChip("archived")}
            className={`px-3 py-1 rounded-full font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              chatFilterChip === "archived"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
          </button>
        </div>

        {/* Channel List */}
        <div className="space-y-2 text-xs overflow-y-visible xl:overflow-y-auto pr-0 xl:pr-1 pb-24 xl:pb-0 flex-initial xl:flex-1">
          {/* WhatsApp Top Archived Row (When not on archived filter) */}
          {chatFilterChip !== "archived" && archivedChatIds.length > 0 && (
            <button
              type="button"
              onClick={() => setChatFilterChip("archived")}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:bg-red-50/60 dark:hover:bg-red-950/30 text-xs font-semibold text-gray-700 dark:text-slate-300 transition cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 group-hover:scale-110 transition">
                  <Archive className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Archived</span>
              </div>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                {archivedChatIds.length}
              </span>
            </button>
          )}

          {/* Archived Banner when on archived filter */}
          {chatFilterChip === "archived" && (
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold mb-1">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 shrink-0" />
                <span>Archived Chats ({archivedChatIds.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setChatFilterChip("all")}
                className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-bold text-[10px] hover:bg-red-700 transition cursor-pointer"
              >
                Show All
              </button>
            </div>
          )}

          {unifiedChatItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              {chatFilterChip === "unread"
                ? "No unread messages."
                : chatFilterChip === "groups"
                ? "No matching batches found."
                : chatFilterChip === "direct"
                ? "No matching contacts found."
                : chatFilterChip === "archived"
                ? "No archived chats."
                : "No matching chats found."}
            </div>
          ) : (
            unifiedChatItems.map((item) => {
              if (item.type === "batch") {
                const b = item.data;
                const isSelected = !selectedContactId && selectedBatch?.id === b.id;
                const messageMeta = batchChatMeta[b.id] || {};
                const notificationMeta = batchNotificationMeta[b.id] || {};
                const unreadBadge = messageMeta.unreadCount || 0;
                const avatarUrl = getBatchAvatarUrl(b);
                const onlineSummary = getBatchOnlineSummary(b);
                return (
                  <div
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (e.target === e.currentTarget) {
                          e.preventDefault();
                          if (chatBackSuppressAutoOpenRef?.current !== undefined) {
                            chatBackSuppressAutoOpenRef.current = false;
                          }
                          setChatChannelTab("batches");
                          setSelectedContactId("");
                          setSelectedBatchId(b.id);
                          markChatAsReadLocally(b.id);
                          setBatchChatMeta((prev) => ({
                            ...prev,
                            [b.id]: {
                              ...(prev[b.id] || {}),
                              unreadCount: 0,
                            },
                          }));
                          setChatMobilePane("chat");
                          loadBatchWorkspaceData(b.id);
                        }
                      }
                    }}
                    onClick={() => {
                      if (chatBackSuppressAutoOpenRef?.current !== undefined) {
                        chatBackSuppressAutoOpenRef.current = false;
                      }
                      setChatChannelTab("batches");
                      setSelectedContactId("");
                      setSelectedBatchId(b.id);
                      markChatAsReadLocally(b.id);
                      setBatchChatMeta((prev) => ({
                        ...prev,
                        [b.id]: {
                          ...(prev[b.id] || {}),
                          unreadCount: 0,
                        },
                      }));
                      setChatMobilePane("chat");
                      loadBatchWorkspaceData(b.id);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-left group select-none touch-manipulation active:scale-[0.99] active:bg-gray-100/90 dark:active:bg-slate-800/90 ${
                      isSelected
                        ? "bg-red-50/80 text-red-950 dark:bg-red-500/10 dark:text-red-100 border-red-300 dark:border-red-500/30 font-bold shadow-xs"
                        : "bg-white/60 dark:bg-slate-900/30 border-gray-200/80 dark:border-slate-800 hover:border-red-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-xs flex items-center justify-center overflow-hidden shadow-xs">
                          {avatarUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={avatarUrl} alt={b.name || "Batch"} className="w-full h-full object-cover" />
                          ) : (
                            <Folder className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        {(() => {
                          const isPinned = pinnedChatIds.includes(b.id);
                          const isBatchMuted = typeof window !== "undefined" ? (() => {
                            try {
                              const map = JSON.parse(localStorage.getItem("texweb_muted_chats") || "{}");
                              return Boolean(map[b.id]);
                            } catch { return false; }
                          })() : false;

                          return (
                            <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5 flex-wrap leading-tight">
                              <span className="font-bold break-words">{b.name}</span>
                              {isPinned && (
                                <Pin className="w-3 h-3 fill-red-600 text-red-600 dark:text-red-400 rotate-45 shrink-0" title="Pinned chat" />
                              )}
                              {isBatchMuted && <VolumeX className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" title="Muted" />}
                            </div>
                          );
                        })()}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[9.5px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 truncate max-w-[150px]">
                            {domainLabel(b.domain)}
                          </span>
                          {onlineSummary.isOnline && (
                            <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                              {onlineSummary.onlineCount} online
                            </span>
                          )}
                          {chatLabels[b.id] && (() => {
                            const lbl = CHAT_LABEL_PRESETS.find((p) => p.id === chatLabels[b.id]);
                            return lbl ? (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-black border ${lbl.color}`}>
                                {lbl.name}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                      <div className="flex items-center gap-1">
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={(e) => toggleArchiveChat(b.id, e)}
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 transition cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                            title={archivedChatIds.includes(b.id) ? "Unarchive batch" : "Archive batch"}
                            aria-label="Toggle archive"
                          >
                            <Archive className={`w-3.5 h-3.5 ${archivedChatIds.includes(b.id) ? "text-red-600" : ""}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleManualUnread(b.id, e)}
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 transition cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                            title={manualUnreadChatIds.includes(b.id) ? "Mark as read" : "Mark as unread"}
                            aria-label="Toggle unread"
                          >
                            <MessageSquareDot className={`w-3.5 h-3.5 ${manualUnreadChatIds.includes(b.id) ? "fill-red-600 text-red-600" : ""}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => togglePinChat(b.id, e)}
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 transition cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                            title={pinnedChatIds.includes(b.id) ? "Unpin batch" : "Pin batch to top"}
                            aria-label="Pin batch"
                          >
                            <Pin className={`w-3.5 h-3.5 ${pinnedChatIds.includes(b.id) ? "fill-red-600 text-red-600 rotate-45" : ""}`} />
                          </button>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                          isSelected ? "bg-red-600 text-white border-red-600" : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
                        }`}>
                          {b.status || "active"}
                        </span>
                      </div>
                      {unreadBadge > 0 ? (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                          {unreadBadge > 99 ? "99+" : unreadBadge}
                        </span>
                      ) : manualUnreadChatIds.includes(b.id) ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 shadow-xs" title="Marked as unread" />
                      ) : null}
                    </div>
                  </div>
                );
              }

              const contact = item.data;
              const profile = getChannelProfile(contact);
              const isSelf = profile.id === sessionUser?.id || profile.id === userProfile?.id || (profile.email && profile.email === userProfile?.email);
              const isSelected = selectedContactId === contact.id;
              const unreadBadge = directChatMeta[contact.id]?.unreadCount || 0;
              const isOnline = workspaceOnlineSet.has(contact.id);
              const avatarUrl = getProfileAvatarUrl(profile);
              const subtitle = contactSubtitle(profile);
              const roleLabel = channelRoleLabel(profile.role);
              const isContactMuted = typeof window !== "undefined" ? (() => {
                try {
                  const map = JSON.parse(localStorage.getItem("texweb_muted_chats") || "{}");
                  return Boolean(map[contact.id]);
                } catch { return false; }
              })() : false;

              return (
                <div
                  key={contact.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (e.target === e.currentTarget) {
                        e.preventDefault();
                        openContactChat(contact.id);
                      }
                    }
                  }}
                  onClick={() => {
                    openContactChat(contact.id);
                  }}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-left group select-none touch-manipulation active:scale-[0.99] active:bg-gray-100/90 dark:active:bg-slate-800/90 ${
                    isSelected
                      ? "bg-red-50/80 text-red-950 dark:bg-red-500/10 dark:text-red-100 border-red-300 dark:border-red-500/30 font-bold shadow-xs"
                      : "bg-white/60 dark:bg-slate-900/30 border-gray-200/80 dark:border-slate-800 hover:border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden shadow-xs ring-1 ring-gray-200 dark:ring-slate-700">
                        {avatarUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={avatarUrl} alt={profile.full_name || "Contact"} className="w-full h-full object-cover" />
                        ) : (
                          profile.full_name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-600"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {(() => {
                        const isPinned = pinnedChatIds.includes(contact.id);
                        return (
                          <div className={`font-bold text-xs sm:text-sm flex items-center gap-1.5 flex-wrap leading-tight mb-1.5 ${isSelected ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-white"}`}>
                            {isSelf ? (
                              <>
                                <span className="text-red-600 dark:text-red-400 font-black">You</span>
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">({profile.full_name || "Myself"})</span>
                                {isPinned && <Pin className="w-3 h-3 fill-red-600 text-red-600 dark:text-red-400 rotate-45 shrink-0" title="Pinned contact" />}
                                {isContactMuted && <VolumeX className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" title="Muted" />}
                              </>
                            ) : (
                              <>
                                <span className="font-bold break-words">{profile.full_name}</span>
                                {isPinned && <Pin className="w-3 h-3 fill-red-600 text-red-600 dark:text-red-400 rotate-45 shrink-0" title="Pinned contact" />}
                                {isContactMuted && <VolumeX className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" title="Muted" />}
                              </>
                            )}
                          </div>
                        );
                      })()}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 truncate max-w-[150px]">
                          {subtitle || profile.email}
                        </span>
                        {blockedContactIds.includes(contact.id) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md font-black bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
                            <Ban className="w-2.5 h-2.5" />
                            <span>Blocked</span>
                          </span>
                        )}
                        {chatLabels[contact.id] && (() => {
                          const lbl = CHAT_LABEL_PRESETS.find((p) => p.id === chatLabels[contact.id]);
                          return lbl ? (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-black border ${lbl.color}`}>
                              {lbl.name}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                    <div className="flex items-center gap-1">
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => toggleArchiveChat(contact.id, e)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 transition cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                          title={archivedChatIds.includes(contact.id) ? "Unarchive contact" : "Archive contact"}
                          aria-label="Toggle archive"
                        >
                          <Archive className={`w-3.5 h-3.5 ${archivedChatIds.includes(contact.id) ? "text-red-600" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => toggleManualUnread(contact.id, e)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 transition cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                          title={manualUnreadChatIds.includes(contact.id) ? "Mark as read" : "Mark as unread"}
                          aria-label="Toggle unread"
                        >
                          <MessageSquareDot className={`w-3.5 h-3.5 ${manualUnreadChatIds.includes(contact.id) ? "fill-red-600 text-red-600" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => togglePinChat(contact.id, e)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 transition cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                          title={pinnedChatIds.includes(contact.id) ? "Unpin contact" : "Pin contact to top"}
                          aria-label="Pin contact"
                        >
                          <Pin className={`w-3.5 h-3.5 ${pinnedChatIds.includes(contact.id) ? "fill-red-600 text-red-600 rotate-45" : ""}`} />
                        </button>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${channelRolePillClass(profile.role)}`}>
                        {roleLabel}
                      </span>
                    </div>
                    {unreadBadge > 0 ? (
                      <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                        {unreadBadge > 99 ? "99+" : unreadBadge}
                      </span>
                    ) : manualUnreadChatIds.includes(contact.id) ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 shadow-xs" title="Marked as unread" />
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
