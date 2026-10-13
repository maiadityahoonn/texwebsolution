"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  createCrmEntityMessage,
  getCrmEntityMessages,
  getOrCreateCrmEntityThread,
} from "@/services/crm/chatService";

function displayName(profile, fallback = "Team") {
  return profile?.full_name || profile?.name || profile?.email || fallback;
}

function messageTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export default function EntityChatPanel({
  entityType,
  entityId,
  title = "Internal Chat",
  subtitle = "Sales team notes and discussion for this record.",
  department = "sales",
  currentUser = null,
  currentProfile = null,
  compact = false,
}) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const currentUserId = currentUser?.id || currentProfile?.id || null;

  const localSender = useMemo(
    () => ({
      id: currentUserId,
      full_name: displayName(currentProfile, "You"),
      role: currentProfile?.role || currentProfile?.designation || "member",
      email: currentProfile?.email || currentUser?.email || "",
    }),
    [currentProfile, currentUser?.email, currentUserId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadThread() {
      if (!entityType || !entityId) return;
      setLoading(true);
      const nextThread = await getOrCreateCrmEntityThread({
        entity_type: entityType,
        entity_id: entityId,
        department,
        title,
        created_by: currentUserId,
      });
      if (cancelled) return;
      setThread(nextThread);
      const rows = await getCrmEntityMessages(nextThread?.id);
      if (!cancelled) setMessages(rows || []);
      if (!cancelled) setLoading(false);
    }

    loadThread();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, department, entityId, entityType, title]);

  useEffect(() => {
    if (!thread?.id || thread.local_only) return undefined;

    const channel = supabase
      .channel(`crm-entity-chat-${thread.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "crm_chat_messages",
          filter: `thread_id=eq.${thread.id}`,
        },
        async (payload) => {
          const incoming = payload.new;
          if (!incoming?.id) return;
          setMessages((prev) => {
            if (prev.some((item) => item.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thread?.id, thread?.local_only]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, loading]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || !thread?.id || sending) return;
    setSending(true);
    setDraft("");
    const saved = await createCrmEntityMessage({
      thread_id: thread.id,
      sender_id: currentUserId,
      body: text,
      message_type: "text",
      metadata: { department, entity_type: entityType, entity_id: entityId },
    });
    setMessages((prev) => {
      if (prev.some((item) => item.id === saved?.id)) return prev;
      return [...prev, { ...saved, sender: saved?.sender || localSender }];
    });
    setSending(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/30 overflow-hidden">
      <div className="px-3.5 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/40 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500 shrink-0" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white truncate">
              {title}
            </h4>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 truncate">{subtitle}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-900/60 capitalize shrink-0">
          {department}
        </span>
      </div>

      <div className={`${compact ? "max-h-56" : "max-h-72"} overflow-y-auto p-3 space-y-2.5 no-scrollbar`}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs font-semibold text-gray-500 dark:text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading chat...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 dark:text-neutral-400">
            No internal discussion yet. Add the first context note for this record.
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id && message.sender_id === currentUserId;
            const sender = message.sender || (isMine ? localSender : null);
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[86%] rounded-2xl px-3 py-2 text-xs border ${
                    isMine
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-neutral-100 border-gray-100 dark:border-slate-800"
                  }`}
                >
                  <div className={`mb-1 text-[10px] font-bold ${isMine ? "text-orange-100" : "text-gray-400"}`}>
                    {displayName(sender, isMine ? "You" : "Team")} · {messageTime(message.created_at)}
                  </div>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.body || message.content || ""}</p>
                  {message.local_only && (
                    <div className={`mt-1 text-[10px] ${isMine ? "text-orange-100" : "text-amber-600"}`}>
                      Saved locally until CRM chat table is available.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#18150f]">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            placeholder="Type internal CRM note..."
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || sending || !thread?.id}
            className="h-10 w-10 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="Send internal message"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
