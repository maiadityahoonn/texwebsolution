"use client";

import { useState, useRef, useEffect, useMemo, Fragment } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Pin,
  CheckCheck,
  X,
  Search,
  Users,
  ChevronDown,
  Calendar,
  CheckSquare,
  ExternalLink,
  Download,
  Reply,
  Copy,
  Info,
  Globe,
  Folder,
  Check,
  Video,
  ArrowLeft,
  RefreshCw,
  Plus,
  Forward,
  Trash2,
  Ban,
  Star,
} from "lucide-react";
import { safeExternalUrl } from "@/lib/safeUrl";

// Role-based accent colors for WhatsApp chat bubbles
const ROLE_COLORS = {
  super_admin: "text-rose-600 dark:text-rose-400",
  hr: "text-amber-600 dark:text-amber-400",
  mentor: "text-purple-600 dark:text-purple-400",
  team_leader: "text-blue-600 dark:text-blue-400",
  intern: "text-emerald-600 dark:text-emerald-400",
};

const ROLE_BADGES = {
  super_admin: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
  hr: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  mentor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900",
  team_leader: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  intern: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
};

const ROLE_DISPLAY_NAMES = {
  super_admin: "Super Admin",
  hr: "HR Manager",
  mentor: "Mentor",
  team_leader: "Team Leader",
  intern: "Member",
};

// Popular curated emojis for WhatsApp reaction bar & picker
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🚀", "🔥"];

const EMOJI_CATEGORIES = {
  "Smilies & Reactions": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳", "🤔", "🤫", "🫡", "🤝", "👍", "👎", "👏", "🙌", "🙏", "💪", "❤️", "🔥", "✨"],
  "Work & Tech": ["💻", "📱", "🚀", "💡", "🎯", "⚡", "⚙️", "🛠️", "📊", "📈", "📁", "📂", "📄", "📝", "📌", "📍", "⏰", "⌛", "🔍", "✅", "❌", "⚠️", "🚩", "🏆", "🥇", "🎉", "🎊"],
};

// Smart link classifier
function classifyLink(url) {
  if (!url) return { type: "general", label: "Web Link", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" };
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) {
    return { type: "github", label: "GitHub Repository", color: "text-gray-900 dark:text-white", bg: "bg-gray-100 dark:bg-slate-800" };
  }
  if (lower.includes("figma.com")) {
    return { type: "figma", label: "Figma Design", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40" };
  }
  if (lower.includes("drive.google.com") || lower.includes("docs.google.com")) {
    return { type: "drive", label: "Google Drive File", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" };
  }
  return { type: "live", label: "Live Project / URL", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40" };
}

// WhatsApp-style message timestamp formatter (e.g. "8:56 pm", "12:11 pm")
function formatMessageTime(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).toLowerCase();
  } catch {
    return "";
  }
}

// WhatsApp-style date divider formatter (e.g. "Today", "Yesterday", "03/09/2026")
function getMessageDateDivider(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((today - target) / 86_400_000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
}

export default function WhatsAppBatchChat({
  mode = "batch", // "batch" or "direct"
  batch = null,
  contact = null,
  currentUser = null,
  currentProfile = null,
  batchMembers = [],
  batchTasks = [],
  batchMeetings = [],
  messages = [],
  availableChats = { contacts: [], batches: [] },
  onSendMessage,
  onPinMessage,
  onDeleteMessage = null,
  onForwardMessage = null,
  onOpenTaskDetails,
  onBack = null,
  onRefresh = null,
  isDark = false,
  localDate = (d) => d,
  canManage = false,
}) {
  // Chat state
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // Message object being quoted
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentTray, setShowAttachmentTray] = useState(false);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [showPinnedTray, setShowPinnedTray] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // Lightbox
  const [copiedId, setCopiedId] = useState(null);

  // WhatsApp Reaction and Dropdown States
  const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);
  const [activeDropdownMsgId, setActiveDropdownMsgId] = useState(null);
  const [dropdownDirection, setDropdownDirection] = useState("down"); // "down" | "up"
  const [messageInfoModal, setMessageInfoModal] = useState(null);
  const [reactionPickerMsg, setReactionPickerMsg] = useState(null);
  const [reactionSearchQuery, setReactionSearchQuery] = useState("");

  // WhatsApp Message Selection, Delete & Forward States
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetMessages, setDeleteTargetMessages] = useState([]);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [forwardTargetMessages, setForwardTargetMessages] = useState([]);
  const [forwardSearch, setForwardSearch] = useState("");
  const [selectedForwardTargets, setSelectedForwardTargets] = useState(new Set());

  // Starred messages (persisted in localStorage)
  const [starredMsgIds, setStarredMsgIds] = useState(() => {
    try {
      if (typeof window === "undefined") return new Set();
      const stored = localStorage.getItem(`texweb_starred_msgs_${currentUser?.id || "anon"}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const chatScrollRef = useRef(null);

  const handleToggleStar = (msgId) => {
    setStarredMsgIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      try {
        localStorage.setItem(
          `texweb_starred_msgs_${currentUser?.id || "anon"}`,
          JSON.stringify(Array.from(next))
        );
      } catch (e) {
        console.warn("Storage save error:", e);
      }
      return next;
    });
    setActiveDropdownMsgId(null);
  };

  // Smart dropdown position: if message is near bottom of chat, open upwards; if near top, open downwards
  const handleOpenDropdown = (msg, triggerElem) => {
    if (activeDropdownMsgId === msg.id) {
      setActiveDropdownMsgId(null);
      return;
    }

    if (triggerElem && chatScrollRef.current) {
      const containerRect = chatScrollRef.current.getBoundingClientRect();
      const elemRect = triggerElem.getBoundingClientRect();

      const spaceBelow = containerRect.bottom - elemRect.bottom;
      const spaceAbove = elemRect.top - containerRect.top;

      // The WhatsApp context menu + reactions bar is ~360px tall
      // If space below is less than 360px and there is more room above, open upwards!
      if (spaceBelow < 360 && spaceAbove > spaceBelow) {
        setDropdownDirection("up");
      } else {
        setDropdownDirection("down");
      }
    } else {
      setDropdownDirection("down");
    }

    setActiveDropdownMsgId(msg.id);
    setActiveReactionMsgId(null);
  };

  // Download attachment (Save as functionality for images, pdfs, documents)
  const handleDownloadAttachment = async (msg) => {
    if (!msg?.attachment_url) return;
    const filename =
      msg.attachment_name ||
      (msg.attachment_type === "image"
        ? `image_${Date.now()}.png`
        : msg.attachment_type === "pdf"
          ? `document_${Date.now()}.pdf`
          : `file_${Date.now()}`);

    try {
      const res = await fetch(msg.attachment_url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Direct anchor download fallback
      const link = document.createElement("a");
      link.href = msg.attachment_url;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Deleted for me (local persistence per user)
  const [deletedForMeIds, setDeletedForMeIds] = useState(() => {
    try {
      if (typeof window === "undefined") return new Set();
      const stored = localStorage.getItem(`texweb_deleted_for_me_${currentUser?.id || "anon"}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Deleted for everyone (optimistic state)
  const [deletedForAllIds, setDeletedForAllIds] = useState(new Set());

  // Dismiss dropdowns & reaction popups on document click outside, contextmenu outside, or scroll
  useEffect(() => {
    const handleDocClick = (e) => {
      if (
        e.target.closest?.("[data-reaction-trigger]") ||
        e.target.closest?.("[data-dropdown-trigger]") ||
        e.target.closest?.("[data-reaction-strip]") ||
        e.target.closest?.("[data-dropdown-menu]")
      ) {
        return;
      }
      setActiveReactionMsgId(null);
      setActiveDropdownMsgId(null);
    };

    const handleDocContextMenu = (e) => {
      if (!e.target.closest?.('[data-message-bubble="true"]')) {
        setActiveDropdownMsgId(null);
        setActiveReactionMsgId(null);
      }
    };

    const handleScroll = () => {
      setActiveDropdownMsgId(null);
      setActiveReactionMsgId(null);
    };

    document.addEventListener("click", handleDocClick);
    document.addEventListener("contextmenu", handleDocContextMenu);
    const scrollEl = chatScrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("contextmenu", handleDocContextMenu);
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Link Attachment Modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkForm, setLinkForm] = useState({ url: "", title: "", type: "live" });

  // Task Selector Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Meeting Selector Modal
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  // Mention Autocomplete
  const [mentionQuery, setMentionQuery] = useState(null); // null if not typing @, string if typing
  const [mentionIndex, setMentionIndex] = useState(-1);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);

  // References
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Monitor internal chat scroll to toggle floating scroll-down arrow
  const handleChatScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 140;
    setShowScrollBottomBtn(isScrolledUp);
  };

  // Auto-scroll to bottom only within chat body (NEVER scrolls parent page/window)
  const scrollToBottom = (behavior = "smooth") => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, [messages.length, contact?.id, batch?.id]);

  // Group emoji reactions by parent message ID and separate from regular chat stream
  // Enforces 1 reaction per user per message (new reaction replaces old reaction)
  const { displayMessages, reactionsByParentId } = useMemo(() => {
    const reactionsMap = {}; // parentId -> Map<sender_id, reactionObj>
    const regular = [];
    const reactionEmojiSet = new Set(QUICK_REACTIONS);

    (messages || []).forEach((m) => {
      // Exclude messages deleted for me
      if (deletedForMeIds.has(m.id)) {
        return;
      }

      const text = m.message?.trim();
      const isRemoval = m.reply_to_id && (text === "__REMOVE__" || text === "REMOVE_REACTION");
      // Reaction is any message that replies to another message with a reaction emoji or removal signal
      const isReaction = m.reply_to_id && text && (
        isRemoval ||
        reactionEmojiSet.has(text) ||
        (text.length <= 4 && /\p{Emoji}/u.test(text))
      );

      if (isReaction) {
        if (!reactionsMap[m.reply_to_id]) {
          reactionsMap[m.reply_to_id] = new Map();
        }
        if (isRemoval) {
          reactionsMap[m.reply_to_id].delete(m.sender_id);
        } else {
          // Replaces previous reaction from this sender with the newest one
          reactionsMap[m.reply_to_id].set(m.sender_id, {
            emoji: text,
            sender_id: m.sender_id,
            sender_name: m.sender?.full_name || "Member",
            id: m.id,
          });
        }
      } else {
        regular.push(m);
      }
    });

    const reactions = {};
    Object.keys(reactionsMap).forEach((parentId) => {
      reactions[parentId] = Array.from(reactionsMap[parentId].values());
    });

    return { displayMessages: regular, reactionsByParentId: reactions };
  }, [messages, deletedForMeIds, deletedForAllIds]);

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return displayMessages;
    const q = searchQuery.toLowerCase();
    return displayMessages.filter(
      (m) =>
        m.message?.toLowerCase().includes(q) ||
        m.sender?.full_name?.toLowerCase().includes(q) ||
        m.attachment_name?.toLowerCase().includes(q)
    );
  }, [displayMessages, searchQuery]);

  // Pinned messages
  const pinnedMessages = useMemo(() => {
    return messages.filter((m) => m.is_pinned);
  }, [messages]);

  // Filtered mention members
  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return batchMembers
      .filter((m) => m.id !== currentUser?.id && m.full_name?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [batchMembers, currentUser?.id, mentionQuery]);

  // Handle textarea text change & detect @mention
  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes(" ") && query.length <= 20) {
        setMentionQuery(query);
        setMentionIndex(lastAtIndex);
        return;
      }
    }
    setMentionQuery(null);
  };

  // Insert mention into input
  const handleSelectMention = (member) => {
    if (mentionIndex === -1) return;
    const before = inputText.slice(0, mentionIndex);
    const after = inputText.slice(textareaRef.current.selectionStart);
    const updated = `${before}@${member.full_name} ${after}`;
    setInputText(updated);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  // Send text message
  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text && !uploadingFile) return;

    const payload = {
      message: text,
      reply_to_id: replyingTo?.id || null,
      reference_type: "none",
      reference_id: null,
    };

    setInputText("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachmentTray(false);

    if (onSendMessage) {
      await onSendMessage(payload);
    }
  };

  // Send with custom attachment payload
  const handleSendAttachment = async (attachmentPayload) => {
    setShowAttachmentTray(false);
    setReplyingTo(null);

    if (onSendMessage) {
      await onSendMessage({
        message: attachmentPayload.message || "Shared an attachment",
        reply_to_id: replyingTo?.id || null,
        ...attachmentPayload,
      });
    }
  };

  // Direct File Upload handler (Image or Document)
  const handleFileUpload = async (e, type = "document") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);

    try {
      // Use FileReader to create robust data URL or upload
      const reader = new FileReader();
      reader.onload = async () => {
        const fileUrl = reader.result;
        await handleSendAttachment({
          message: type === "image" ? (inputText.trim() || `📷 ${file.name}`) : (inputText.trim() || `📄 ${file.name}`),
          attachment_url: fileUrl,
          attachment_name: file.name,
          attachment_type: type === "image" ? "image" : file.name.endsWith(".pdf") ? "pdf" : "document",
          reference_type: "none",
        });
        setInputText("");
        setUploadingFile(false);
      };
      reader.onerror = () => {
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingFile(false);
    }
  };

  // Submit Link Sharing modal
  const handleShareLink = async (e) => {
    e.preventDefault();
    if (!linkForm.url) return;
    const classified = classifyLink(linkForm.url);
    await handleSendAttachment({
      message: linkForm.title ? `${linkForm.title}` : `Shared a link`,
      attachment_url: linkForm.url,
      attachment_name: linkForm.title || classified.label,
      attachment_type: `link_${classified.type}`,
      reference_type: "none",
    });
    setLinkModalOpen(false);
    setLinkForm({ url: "", title: "", type: "live" });
  };

  // Submit Task Reference
  const handleShareTask = async (task) => {
    await handleSendAttachment({
      message: `📋 Task: ${task.title}`,
      attachment_url: task.reference_url || "",
      attachment_name: task.title,
      attachment_type: "task_reference",
      reference_type: "task",
      reference_id: task.id,
    });
    setTaskModalOpen(false);
  };

  // Submit Meeting Reference
  const handleShareMeeting = async (meeting) => {
    await handleSendAttachment({
      message: `📅 Class / Meeting: ${meeting.title}`,
      attachment_url: meeting.meeting_link || "",
      attachment_name: meeting.title,
      attachment_type: "meeting_reference",
      reference_type: "meeting",
      reference_id: meeting.id,
    });
    setMeetingModalOpen(false);
  };

  // Copy text to clipboard
  const handleCopyMessage = (msg) => {
    navigator.clipboard.writeText(msg.message || "");
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Quick Emoji Click from picker
  const handleInsertEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  // Quick Reaction directly on message (WhatsApp style: 1 reaction per user, replaces previous or toggles off if same)
  const handleSendReaction = async (msg, emoji) => {
    if (!onSendMessage || !msg?.id) return;

    const currentReactions = reactionsByParentId[msg.id] || [];
    const myExistingReaction = currentReactions.find((r) => r.sender_id === currentUser?.id);

    // If clicking the same emoji that's already active, remove it (toggle off)
    if (myExistingReaction && myExistingReaction.emoji === emoji) {
      await onSendMessage({
        message: "__REMOVE__",
        reply_to_id: msg.id,
        reference_type: "none",
      });
      return;
    }

    // Otherwise send new emoji (replaces existing reaction for this user)
    await onSendMessage({
      message: emoji,
      reply_to_id: msg.id,
      reference_type: "none",
    });
  };

  // Toggle selection for a message
  const toggleSelectMessage = (id) => {
    setSelectedMsgIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) setIsSelectionMode(false);
      return next;
    });
  };

  // Copy selected messages
  const handleCopySelected = () => {
    const selectedMsgs = (messages || []).filter((m) => selectedMsgIds.has(m.id));
    const textToCopy = selectedMsgs.map((m) => m.message || "").join("\n");
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId("selected_all");
      setTimeout(() => setCopiedId(null), 1500);
    }
    setIsSelectionMode(false);
    setSelectedMsgIds(new Set());
  };

  // Open Forward modal for selected messages
  const handleOpenForwardSelected = () => {
    const selectedMsgs = (messages || []).filter((m) => selectedMsgIds.has(m.id));
    setForwardTargetMessages(selectedMsgs);
    setSelectedForwardTargets(new Set());
    setForwardModalOpen(true);
  };

  // Open Delete modal for selected messages
  const handleOpenDeleteSelected = () => {
    const selectedMsgs = (messages || []).filter((m) => selectedMsgIds.has(m.id));
    setDeleteTargetMessages(selectedMsgs);
    setDeleteModalOpen(true);
  };

  // Execute Delete (WhatsApp options: for_everyone or for_me)
  const handleExecuteDelete = async (deleteType) => {
    const targetIds = deleteTargetMessages.map((m) => m.id);
    if (!targetIds.length) return;

    if (deleteType === "for_everyone") {
      setDeletedForAllIds((prev) => new Set([...prev, ...targetIds]));
      if (onDeleteMessage) {
        await onDeleteMessage({ messageIds: targetIds, deleteType: "for_everyone" });
      }
    } else {
      setDeletedForMeIds((prev) => {
        const next = new Set([...prev, ...targetIds]);
        try {
          localStorage.setItem(
            `texweb_deleted_for_me_${currentUser?.id || "anon"}`,
            JSON.stringify(Array.from(next))
          );
        } catch (e) {
          console.warn("Storage save error:", e);
        }
        return next;
      });
      if (onDeleteMessage) {
        await onDeleteMessage({ messageIds: targetIds, deleteType: "for_me" });
      }
    }

    setDeleteModalOpen(false);
    setDeleteTargetMessages([]);
    setIsSelectionMode(false);
    setSelectedMsgIds(new Set());
  };

  // Execute Forward to selected contacts / batches
  const handleExecuteForward = async () => {
    if (selectedForwardTargets.size === 0 || forwardTargetMessages.length === 0) return;
    const targetArray = Array.from(selectedForwardTargets).map((jsonStr) => JSON.parse(jsonStr));

    if (onForwardMessage) {
      await onForwardMessage({
        targets: targetArray,
        messages: forwardTargetMessages,
      });
    } else if (onSendMessage) {
      // Fallback: send into current chat
      for (const m of forwardTargetMessages) {
        await onSendMessage({
          message: m.message,
          attachment_url: m.attachment_url,
          attachment_name: m.attachment_name,
          attachment_type: m.attachment_type,
        });
      }
    }

    setForwardModalOpen(false);
    setForwardTargetMessages([]);
    setSelectedForwardTargets(new Set());
    setIsSelectionMode(false);
    setSelectedMsgIds(new Set());
  };

  // Header Title & Subtitle details
  const headerDetails = useMemo(() => {
    if (mode === "direct" && contact) {
      return {
        title: contact.full_name || "Direct Chat",
        subtitle: `${ROLE_DISPLAY_NAMES[contact.role] || contact.role} • ${contact.batch_name || "Assigned"}`,
        avatarLetter: contact.full_name?.charAt(0)?.toUpperCase() || "U",
        avatarUrl: contact.avatar_url,
        isGroup: false,
      };
    }
    const internCount = batchMembers.filter((m) => m.role === "intern").length;
    return {
      title: `${batch?.name || "Batch"} Group Chat`,
      subtitle: `HR, Mentor, TL, and ${internCount} Members`,
      avatarLetter: batch?.name?.charAt(0)?.toUpperCase() || "B",
      avatarUrl: null,
      isGroup: true,
    };
  }, [mode, contact, batch, batchMembers]);

  return (
    <div className={`flex flex-col flex-1 h-full max-h-full w-full overflow-hidden min-h-0 relative transition-colors ${isDark ? "bg-[#111b21] text-[#f4ead2]" : "bg-[#efeae2] text-gray-900"
      }`}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "image")}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.zip,.txt,.xlsx,.pptx"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "document")}
      />

      {/* Tech Chat Doodle Wallpaper Overlay (Developer themed tech doodles matching WhatsApp wallpaper) */}
      <div
        className="absolute inset-0 pointer-events-none bg-repeat transition-opacity z-0 opacity-[0.06] dark:opacity-[0.045] dark:invert"
        style={{
          backgroundImage: "url('/tech-chat-doodle.svg')",
          backgroundSize: "360px 360px",
        }}
      />

      {/* =========================================================================
          1. WHATSAPP HEADER BAR
          ========================================================================= */}
      <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b flex items-center justify-between gap-2.5 z-20 shrink-0 backdrop-blur-md shadow-none ${isDark ? "bg-[#18150f]/95 border-[#3a3020] text-[#f4ead2]" : "bg-white/95 border-gray-200/80 text-gray-900"
        }`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile / Desktop Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-slate-300 transition cursor-pointer shrink-0"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
          )}

          {/* Avatar */}
          <div className="relative shrink-0">
            {headerDetails.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={headerDetails.avatarUrl}
                alt={headerDetails.title}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-red-500/30"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-none">
                {headerDetails.isGroup ? <Users className="w-4 h-4 sm:w-5 sm:h-5" /> : headerDetails.avatarLetter}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#18150f]" />
          </div>

          {/* Group / Contact Meta */}
          <div className="min-w-0 cursor-pointer" onClick={() => headerDetails.isGroup && setShowMembersDrawer(true)}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-sm font-bold truncate">{headerDetails.title}</h2>
              {headerDetails.isGroup && (
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.2 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 shrink-0">
                  Batch Group
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
              <span>{headerDetails.subtitle}</span>
              {headerDetails.isGroup && <Info className="w-3 h-3 opacity-60 inline shrink-0" />}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 text-gray-600 dark:text-gray-300">
          {/* Refresh Action */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Toggle Search */}
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 sm:p-2 rounded-xl transition ${showSearch ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            title="Search in messages"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Pinned Messages Icon */}
          {pinnedMessages.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPinnedTray(!showPinnedTray)}
              className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              title="View pinned announcements"
            >
              <Pin className="w-4 h-4 text-amber-500" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>
          )}

          {/* Group Members Drawer Toggle */}
          {headerDetails.isGroup && (
            <button
              type="button"
              onClick={() => setShowMembersDrawer(!showMembersDrawer)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              title="Batch Members list"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. SEARCH BAR (When active)
          ========================================================================= */}
      {showSearch && (
        <div className={`px-4 py-2 border-b flex items-center gap-2 z-10 animate-fadeIn ${isDark ? "bg-[#111b21] border-slate-800" : "bg-white border-gray-200"
          }`}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs focus:outline-none placeholder-gray-400 dark:placeholder-slate-500"
            autoFocus
          />
          {searchQuery && (
            <span className="text-[10px] font-mono text-gray-400">
              {filteredMessages.length} found
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setShowSearch(false);
            }}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          2B. WHATSAPP SELECTION ACTION BAR (When selection mode is active)
          ========================================================================= */}
      {isSelectionMode && (
        <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-2 z-20 animate-fadeIn ${isDark ? "bg-[#202c33] border-slate-700 text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900 shadow-sm"
          }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMsgIds(new Set());
              }}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
              title="Close selection"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs sm:text-sm font-bold">
              {selectedMsgIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={selectedMsgIds.size === 0}
              onClick={handleCopySelected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 cursor-pointer"
              title="Copy selected text"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            <button
              type="button"
              disabled={selectedMsgIds.size === 0}
              onClick={handleOpenForwardSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 cursor-pointer"
              title="Forward selected messages"
            >
              <Forward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Forward</span>
            </button>

            <button
              type="button"
              disabled={selectedMsgIds.size === 0}
              onClick={handleOpenDeleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition disabled:opacity-40 cursor-pointer"
              title="Delete selected messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. PINNED MESSAGES BANNER (Sticky Top)
          ========================================================================= */}
      {pinnedMessages.length > 0 && (
        <div className={`px-4 py-2 border-b flex items-center justify-between gap-3 text-xs z-10 ${isDark ? "bg-[#182229] border-slate-800 text-[#d1d7db]" : "bg-amber-50/90 border-amber-200 text-amber-950"
          }`}>
          <div className="flex items-center gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400 mr-1.5 uppercase">
                Pinned Notice:
              </span>
              <span className="truncate text-xs">
                {pinnedMessages[pinnedMessages.length - 1].message}
              </span>
            </div>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => onPinMessage && onPinMessage(pinnedMessages[pinnedMessages.length - 1].id, false)}
              className="text-[10px] font-bold text-amber-600 hover:underline shrink-0"
            >
              Unpin
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          4. CHAT BODY (Clean Wallpaper, Tech Doodles, Smooth WhatsApp Scrolling)
          ========================================================================= */}
      <div
        ref={chatScrollRef}
        onScroll={handleChatScroll}
        className="whatsapp-message-scroll flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 space-y-1 sm:space-y-1.5 relative z-10 scroll-smooth"
      >

        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-500/20 flex items-center justify-center mb-3 shadow-none">
              <CheckCheck className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              {searchQuery ? "No matching messages found" : `Welcome to ${headerDetails.title}`}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              {searchQuery
                ? "Try searching for another word, member name, or link."
                : "Send batch announcements, project files, task references, and collaborate in real-time."}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isMine = msg.sender_id === currentUser?.id;
            const senderProfile = msg.sender || {};
            const senderRole = senderProfile.role || "intern";
            const roleColor = ROLE_COLORS[senderRole] || "text-purple-600";

            // WhatsApp Date Divider (e.g. "Today", "Yesterday", "03/09/2026")
            const msgDate = getMessageDateDivider(msg.created_at);
            const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
            const prevDate = prevMsg ? getMessageDateDivider(prevMsg.created_at) : null;
            const showDateDivider = msgDate && msgDate !== prevDate;

            // Find quoted reply message if exists
            const replyMsg = msg.reply_to_id
              ? messages.find((m) => m.id === msg.reply_to_id)
              : null;

            // Reactions attached to this parent message (at most 1 reaction per member)
            const msgReactions = reactionsByParentId[msg.id] || [];
            const reactionCounts = {};
            msgReactions.forEach((r) => {
              reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
            });

            const isMsgSelected = selectedMsgIds.has(msg.id);
            const isStarred = starredMsgIds.has(msg.id);
            const isDeletedForAll =
              msg.message === "This message was deleted" ||
              msg.message === "You deleted this message" ||
              deletedForAllIds.has(msg.id) ||
              Boolean(msg.is_deleted);

            return (
              <Fragment key={msg.id || index}>
                {/* WhatsApp Floating Centered Date Divider */}
                {showDateDivider && (
                  <div className="w-full flex justify-center my-2 select-none relative z-10">
                    <span className="px-3 py-1 rounded-lg text-[11px] font-medium shadow-2xs border bg-white/95 dark:bg-[#182229]/95 text-gray-600 dark:text-gray-300 border-gray-200/80 dark:border-slate-700/60 backdrop-blur-xs">
                      {msgDate}
                    </span>
                  </div>
                )}

                <div
                  id={`msg-${msg.id}`}
                  className={`w-full flex items-center gap-2 ${isMine ? "justify-end" : "justify-start"} ${msgReactions.length > 0 ? "mb-2.5" : ""}`}
                >
                  {/* WhatsApp Selection Checkbox (Shows when in selection mode) */}
                  {isSelectionMode && (
                    <div
                      className={`shrink-0 cursor-pointer p-1 select-none transition-all ${isMine ? "order-last ml-1" : "order-first mr-1"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectMessage(msg.id);
                      }}
                    >
                      {isMsgSelected ? (
                        <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-lg border-2 border-gray-400 dark:border-slate-500 bg-white/80 dark:bg-[#202c33] hover:border-emerald-500 transition" />
                      )}
                    </div>
                  )}

                  {/* Strictly scoped wrapper: hover ONLY triggers when cursor is on the message or smiley */}
                  <div
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleSelectMessage(msg.id);
                      }
                    }}
                    className={`w-fit max-w-[85%] sm:max-w-[75%] inline-flex items-center gap-1.5 relative group/msg ${
                      isMine ? "flex-row-reverse" : "flex-row"
                    } ${isSelectionMode ? "cursor-pointer" : ""}`}
                  >
                    {/* 1. WhatsApp Compact Bubble Container */}
                    <div
                      data-message-bubble="true"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenDropdown(msg, e.currentTarget);
                      }}
                      className={`rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-1.5 shadow-2xs relative transition-all duration-200 border ${
                        isMsgSelected ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#111b21]" : ""
                      } ${
                        isMine
                          ? "bg-[#d9fdd3] text-gray-900 border-[#c2f3b9] dark:bg-[#005c4b] dark:text-[#e9edef] dark:border-[#005c4b] rounded-tr-xs"
                          : "bg-white text-gray-900 border-gray-200/80 dark:bg-[#202c33] dark:text-[#e9edef] dark:border-slate-700/60 rounded-tl-xs"
                      }`}
                    >
                      {/* Sender Name in Group Chat (only for other members, not in direct chat, not on deleted messages) */}
                      {!isMine && mode !== "direct" && !isDeletedForAll && (
                        <div className="flex items-center gap-1.5 mb-0.5 text-[11px] font-bold leading-tight">
                          <span className={roleColor}>
                            {senderProfile.full_name || "Member"}
                          </span>
                          {msg.is_pinned && (
                            <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5 ml-auto">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                        </div>
                      )}

                      {/* Quoted Reply Snippet */}
                      {!isDeletedForAll && replyMsg && (
                        <div className={`mb-1.5 p-1.5 rounded-xl border-l-4 border-red-500 text-[11px] leading-tight opacity-95 ${
                          isMine ? "bg-black/5 text-gray-800 dark:bg-black/20 dark:text-white" : "bg-gray-100 dark:bg-black/30 text-gray-700 dark:text-gray-300"
                        }`}>
                          <div className="font-bold text-red-600 dark:text-red-400">
                            {replyMsg.sender?.full_name || "Quoted Message"}
                          </div>
                          <div className="truncate mt-0.5">
                            {replyMsg.message}
                          </div>
                        </div>
                      )}

                      {/* Attachment Previews */}
                      {!isDeletedForAll && msg.attachment_url && (
                        <div className="mb-1.5">
                          {/* Image Thumbnail */}
                          {msg.attachment_type === "image" ? (
                            <div
                              className="rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition max-w-sm border border-black/10"
                              onClick={() => setPreviewImage(msg.attachment_url)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={msg.attachment_url}
                                alt={msg.attachment_name || "Image attachment"}
                                className="max-h-60 w-auto object-cover rounded-xl"
                              />
                            </div>
                          ) : msg.attachment_type === "pdf" || msg.attachment_type === "document" ? (
                            /* Document / PDF Card */
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => handleDownloadAttachment(msg)}
                              className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 hover:bg-black/10 transition cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs truncate">
                                  {msg.attachment_name || "Document"}
                                </div>
                                <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-mono">
                                  {msg.attachment_type}
                                </span>
                              </div>
                              <Download className="w-3.5 h-3.5 opacity-80 shrink-0 text-gray-600 dark:text-gray-300" />
                            </div>
                          ) : msg.attachment_type?.startsWith("link_") ? (
                            /* Smart Link Card */
                            <a
                              href={safeExternalUrl(msg.attachment_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 hover:bg-black/10 transition"
                            >
                              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                {msg.attachment_type === "link_github" ? (
                                  <Folder className="w-3.5 h-3.5" />
                                ) : msg.attachment_type === "link_figma" ? (
                                  <Globe className="w-3.5 h-3.5" />
                                ) : (
                                  <ExternalLink className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs truncate text-blue-600 dark:text-blue-400">
                                  {msg.attachment_name || "Attached Link"}
                                </div>
                                <div className="text-[10px] text-gray-500 truncate font-mono">
                                  {msg.attachment_url}
                                </div>
                              </div>
                            </a>
                          ) : null}
                        </div>
                      )}

                      {/* Task Reference Card */}
                      {!isDeletedForAll && msg.reference_type === "task" && (
                        <div className="mb-1.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 block">
                                Task
                              </span>
                              <span className="font-bold text-xs truncate block">
                                {msg.attachment_name || msg.message}
                              </span>
                            </div>
                          </div>
                          {onOpenTaskDetails && (
                            <button
                              type="button"
                              onClick={() => {
                                const t = batchTasks.find((item) => item.id === msg.reference_id);
                                if (t) onOpenTaskDetails(t);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-700 shrink-0"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      )}

                      {/* Meeting Reference Card */}
                      {!isDeletedForAll && msg.reference_type === "meeting" && (
                        <div className="mb-1.5 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Video className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block">
                                Class / Meet
                              </span>
                              <span className="font-bold text-xs truncate block">
                                {msg.attachment_name || msg.message}
                              </span>
                            </div>
                          </div>
                          {msg.attachment_url && (
                            <a
                              href={safeExternalUrl(msg.attachment_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 shrink-0"
                            >
                              Join
                            </a>
                          )}
                        </div>
                      )}

                      {/* WhatsApp Message Content with Inline Float Timestamp */}
                      {isDeletedForAll ? (
                        <div className={`flex items-center gap-1.5 py-0.5 text-xs italic select-none ${
                          isMine ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                        }`}>
                          <Ban className="w-3.5 h-3.5 stroke-[2] shrink-0 opacity-80" />
                          <span>{isMine ? "You deleted this message" : "This message was deleted"}</span>
                          <span className="text-[10px] ml-2 opacity-70 not-italic select-none shrink-0">
                            {formatMessageTime(msg.created_at)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-[13px] leading-snug break-words">
                          <span className="whitespace-pre-wrap">{msg.message}</span>
                          {/* WhatsApp Float-right Timestamp + Blue Double Checks */}
                          <span className="inline-flex items-center gap-0.5 text-[10px] leading-none text-gray-500 dark:text-gray-400 opacity-80 ml-2 float-right translate-y-1 select-none shrink-0">
                            {isStarred && (
                              <Star className={`w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0 ${isMine ? "text-amber-500 fill-amber-500" : ""}`} />
                            )}
                            <span>{formatMessageTime(msg.created_at)}</span>
                            {isMine && (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.2] shrink-0" />
                            )}
                            {/* WhatsApp Dropdown Chevron Button */}
                            <button
                              type="button"
                              data-dropdown-trigger="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                const bubbleEl = e.currentTarget.closest('[data-message-bubble="true"]') || e.currentTarget;
                                handleOpenDropdown(msg, bubbleEl);
                              }}
                              className="p-0.5 rounded opacity-0 group-hover/msg:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity cursor-pointer text-gray-500 dark:text-gray-400 -mr-1"
                              title="Message options"
                            >
                              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </span>
                        </div>
                      )}

                    {/* WhatsApp Dropdown & Right-Click Context Menu Box */}
                    {activeDropdownMsgId === msg.id && (
                      <div
                        data-dropdown-menu="true"
                        onClick={(e) => e.stopPropagation()}
                        onContextMenu={(e) => e.stopPropagation()}
                        className={`absolute z-50 w-56 sm:w-60 rounded-2xl bg-white dark:bg-[#202c33] border border-gray-200/90 dark:border-slate-700 shadow-2xl animate-scaleUp select-none text-left overflow-hidden divide-y divide-gray-100 dark:divide-slate-700/60 ${isMine ? "right-0" : "left-0"
                          } ${dropdownDirection === "up"
                            ? "bottom-full mb-2 origin-bottom"
                            : "top-full mt-2 origin-top"
                          }`}
                      >
                        {isDeletedForAll ? (
                          <div className="p-1 space-y-0.5">
                            {/* 1. Select */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMsgIds(new Set([msg.id]));
                                setIsSelectionMode(true);
                                setActiveDropdownMsgId(null);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400"
                            >
                              <CheckSquare className="w-4 h-4 shrink-0" />
                              <span>Select</span>
                            </button>

                            {/* 2. Delete for me */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMsgIds(new Set([msg.id]));
                                setIsSelectionMode(true);
                                setDeleteTargetMessages([msg]);
                                setDeleteModalOpen(true);
                                setActiveDropdownMsgId(null);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold"
                            >
                              <Trash2 className="w-4 h-4 shrink-0" />
                              <span>Delete for me</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* 1. Quick Reactions Strip (WhatsApp Context Menu Header) */}
                            <div className="px-2.5 py-2 flex items-center justify-between gap-1 bg-gray-50/70 dark:bg-slate-800/40">
                              {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => {
                                const isSelected = myReaction?.emoji === emoji;
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendReaction(msg, emoji);
                                      setActiveDropdownMsgId(null);
                                    }}
                                    className={`p-1 text-lg hover:scale-130 transition-transform cursor-pointer leading-none rounded-full ${isSelected ? "bg-black/10 dark:bg-white/20 scale-110 ring-1 ring-emerald-500" : ""
                                      }`}
                                    title={`React ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReactionPickerMsg(msg);
                                  setActiveDropdownMsgId(null);
                                }}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 cursor-pointer transition"
                                title="More reactions"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>

                            {/* 2. Menu Actions List */}
                            <div className="p-1 space-y-0.5">
                              {/* Message info */}
                              <button
                                type="button"
                                onClick={() => {
                                  setMessageInfoModal(msg);
                                  setActiveDropdownMsgId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                              >
                                <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                <span>Message info</span>
                              </button>

                              {/* Reply */}
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(msg);
                                  setActiveDropdownMsgId(null);
                                  textareaRef.current?.focus();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                              >
                                <Reply className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                <span>Reply</span>
                              </button>

                              {/* Copy */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleCopyMessage(msg);
                                  setActiveDropdownMsgId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                )}
                                <span>Copy</span>
                              </button>

                              {/* Forward */}
                              <button
                                type="button"
                                onClick={() => {
                                  setForwardTargetMessages([msg]);
                                  setSelectedForwardTargets(new Set());
                                  setForwardModalOpen(true);
                                  setActiveDropdownMsgId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                              >
                                <Forward className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                <span>Forward</span>
                              </button>

                              {/* Pin / Unpin */}
                              {canManage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onPinMessage && onPinMessage(msg.id, !msg.is_pinned);
                                    setActiveDropdownMsgId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400"
                                >
                                  <Pin className="w-4 h-4 shrink-0" />
                                  <span>{msg.is_pinned ? "Unpin message" : "Pin message"}</span>
                                </button>
                              )}

                              {/* Star / Unstar */}
                              <button
                                type="button"
                                onClick={() => handleToggleStar(msg.id)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                              >
                                <Star className={`w-4 h-4 shrink-0 ${isStarred ? "fill-amber-400 text-amber-400" : "text-gray-500 dark:text-gray-400"}`} />
                                <span>{isStarred ? "Unstar" : "Star"}</span>
                              </button>
                            </div>

                            {/* 3. Selection & Deletion Actions */}
                            <div className="p-1 space-y-0.5">
                              {/* Select */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMsgIds(new Set([msg.id]));
                                  setIsSelectionMode(true);
                                  setActiveDropdownMsgId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400"
                              >
                                <CheckSquare className="w-4 h-4 shrink-0" />
                                <span>Select</span>
                              </button>

                              {/* Save as (Download Attachment) */}
                              {Boolean(msg.attachment_url) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDownloadAttachment(msg);
                                    setActiveDropdownMsgId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                                >
                                  <Download className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                  <span>Save as</span>
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMsgIds(new Set([msg.id]));
                                  setIsSelectionMode(true);
                                  setDeleteTargetMessages([msg]);
                                  setDeleteModalOpen(true);
                                  setActiveDropdownMsgId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold"
                              >
                                <Trash2 className="w-4 h-4 shrink-0" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* WhatsApp-Style Floating Reaction Pill (Docked to bottom edge of message) */}
                    {!isDeletedForAll && msgReactions.length > 0 && (
                      <div
                        className={`absolute -bottom-2.5 ${isMine ? "right-2.5" : "left-2.5"} z-20 flex items-center gap-1 bg-white dark:bg-[#202c33] border border-gray-200/90 dark:border-slate-700 shadow-sm rounded-full px-2 py-0.5 text-xs select-none cursor-pointer hover:scale-105 transition`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const myReaction = msgReactions.find((r) => r.sender_id === currentUser?.id);
                          if (myReaction) {
                            handleSendReaction(msg, myReaction.emoji);
                          }
                        }}
                      >
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <span key={emoji} className="flex items-center gap-0.5 text-xs leading-none">
                            <span>{emoji}</span>
                            {count > 1 && (
                              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                {count}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Side Action: Round Smiley Button (Image 1 Style: Shows on hover; opens Emoji Strip on click) */}
                  {!isDeletedForAll && (
                    <div className="relative shrink-0 select-none">
                      <button
                        type="button"
                        data-reaction-trigger="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReactionMsgId((prev) => (prev === msg.id ? null : msg.id));
                          setActiveDropdownMsgId(null);
                        }}
                        className={`w-8 h-8 rounded-full bg-white dark:bg-[#202c33] border border-gray-200/90 dark:border-slate-700 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-all duration-150 ${activeReactionMsgId === msg.id
                            ? "opacity-100 scale-105 pointer-events-auto"
                            : "opacity-0 pointer-events-none group-hover/msg:opacity-100 group-hover/msg:pointer-events-auto"
                          }`}
                      >
                        <Smile className="w-4.5 h-4.5 stroke-[2]" />
                      </button>

                      {/* Floating WhatsApp Reaction Strip (Image 2 Style: Opens on click of Smiley Button) */}
                      {activeReactionMsgId === msg.id && (
                        <div
                          data-reaction-strip="true"
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute -top-13 ${isMine ? "right-0" : "left-0"} z-50 flex items-center gap-1.5 bg-white dark:bg-[#202c33] border border-gray-200/90 dark:border-slate-700 rounded-full px-2.5 py-1.5 shadow-2xl animate-scaleUp select-none whitespace-nowrap`}
                        >
                          {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => {
                            const isSelected = myReaction?.emoji === emoji;
                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendReaction(msg, emoji);
                                  setActiveReactionMsgId(null);
                                }}
                                className={`p-1 text-lg sm:text-xl hover:scale-130 transition-transform cursor-pointer leading-none rounded-full ${isSelected ? "bg-black/10 dark:bg-white/20 scale-115 ring-1 ring-emerald-500" : ""
                                  }`}
                                title={isSelected ? `Remove ${emoji}` : `React ${emoji}`}
                              >
                                {emoji}
                              </button>
                            );
                          })}

                          {/* Plus (+) Button to open full WhatsApp reaction picker */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReactionPickerMsg(msg);
                              setActiveReactionMsgId(null);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition ml-0.5"
                            title="More reactions"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              </Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* =========================================================================
          5. MENTION AUTOCOMPLETE POPOVER
          ========================================================================= */}
      {mentionSuggestions.length > 0 && (
        <div className={`absolute bottom-20 left-4 z-30 w-64 rounded-2xl border shadow-none overflow-hidden animate-scaleUp ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
          }`}>
          <div className="p-2 border-b text-[10px] font-bold uppercase text-gray-400">
            Mention Member
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
            {mentionSuggestions.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMention(m)}
                className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-red-50 dark:hover:bg-slate-800 transition"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {m.full_name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate">{m.full_name}</div>
                  <div className="text-[10px] text-gray-400">{ROLE_DISPLAY_NAMES[m.role] || m.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          6. ATTACHMENT TRAY / SPEED-DIAL (WhatsApp Style 📎)
          ========================================================================= */}
      {showAttachmentTray && (
        <div className={`absolute bottom-20 left-6 z-30 p-2.5 rounded-2xl border shadow-2xl space-y-1 animate-scaleUp ${isDark ? "bg-[#202c33] border-slate-700" : "bg-white border-gray-200"
          }`}>
          {/* Photo / Image Upload */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentTray(false);
              fileInputRef.current?.click();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 text-left transition"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span>Photos & Media</span>
          </button>

          {/* Document / PDF Upload */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentTray(false);
              docInputRef.current?.click();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 text-left transition"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <span>Document / PDF</span>
          </button>

          {/* Share Link (GitHub, Drive, Figma, Live) */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentTray(false);
              setLinkModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-800 text-left transition"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
              <LinkIcon className="w-4 h-4" />
            </div>
            <span>Share Link (GitHub / Drive / Figma)</span>
          </button>

          {/* Task Reference */}
          {batchTasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowAttachmentTray(false);
                setTaskModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-purple-50 dark:hover:bg-slate-800 text-left transition"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span>Batch Task Reference</span>
            </button>
          )}

          {/* Meeting Reference */}
          {batchMeetings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowAttachmentTray(false);
                setMeetingModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-amber-50 dark:hover:bg-slate-800 text-left transition"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <span>Meeting / Class Reference</span>
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          7. EMOJI PICKER POPOVER
          ========================================================================= */}
      {showEmojiPicker && (
        <div className={`absolute bottom-20 left-4 z-30 w-72 p-3 rounded-2xl border shadow-2xl animate-scaleUp ${isDark ? "bg-[#202c33] border-slate-700" : "bg-white border-gray-200"
          }`}>
          <div className="flex items-center justify-between pb-2 border-b text-xs font-bold">
            <span>Emojis</span>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 mt-2 max-h-56 overflow-y-auto pr-1">
            {Object.entries(EMOJI_CATEGORIES).map(([cat, list]) => (
              <div key={cat}>
                <div className="text-[10px] font-bold text-gray-400 mb-1">{cat}</div>
                <div className="grid grid-cols-7 gap-1">
                  {list.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="p-1.5 text-base hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp Floating Scroll to Bottom Button */}
      {showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          className="absolute right-4 sm:right-6 bottom-16 sm:bottom-20 z-30 w-10 h-10 rounded-full bg-white dark:bg-[#202c33] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-lg border border-gray-200/80 dark:border-slate-700/80 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-all transform active:scale-95 cursor-pointer animate-in fade-in zoom-in-90"
          title="Scroll to bottom"
        >
          <ChevronDown className="w-5 h-5 stroke-[2.2]" />
        </button>
      )}

      {/* =========================================================================
          8. BOTTOM INPUT BAR (WhatsApp Web Style Pill + Send Button)
          ========================================================================= */}
      <div className={`px-3 sm:px-4 py-2 sm:py-2.5 border-t shrink-0 z-20 relative transition-colors ${
        isDark ? "bg-transparent border-slate-800" : "bg-transparent border-gray-200/80"
      }`}>
        {/* Replying-to Preview Banner */}
        {replyingTo && (
          <div className={`mb-2 p-2.5 rounded-2xl flex items-center justify-between gap-2.5 text-xs border-l-4 border-red-500 shadow-2xs ${
            isDark ? "bg-[#241f18] text-[#f4ead2]" : "bg-white text-gray-800"
          }`}>
            <div className="min-w-0">
              <span className="font-bold text-[11px] text-red-600 block">
                Replying to {replyingTo.sender?.full_name || "Member"}:
              </span>
              <p className="truncate text-[11px] opacity-80">{replyingTo.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* WhatsApp Composer Row */}
        <form onSubmit={handleSend} className="flex items-center gap-2 sm:gap-3">
          {/* WhatsApp Elongated Pill: [📎 Paperclip] [😊 Emoji] [Type a message...] */}
          <div className={`flex-1 flex items-center rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-2xs border min-h-[44px] transition-colors ${
            isDark
              ? "bg-[#2a3942] border-slate-700/60 focus-within:border-slate-600"
              : "bg-transparent border-gray-300/80 focus-within:border-gray-400"
          }`}>
            {/* Attachment Paperclip 📎 */}
            <button
              type="button"
              onClick={() => {
                setShowAttachmentTray(!showAttachmentTray);
                setShowEmojiPicker(false);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                showAttachmentTray
                  ? "text-red-600 bg-red-50 dark:bg-red-500/10 scale-105"
                  : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              title="Attach media or files"
            >
              <Paperclip className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Emoji Toggle 😊 */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachmentTray(false);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ml-0.5 ${
                showEmojiPicker
                  ? "text-red-600 bg-red-50 dark:bg-red-500/10 scale-105"
                  : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              title="Add emoji"
            >
              <Smile className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Message Text Input */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message"
              className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs sm:text-sm text-gray-900 dark:text-[#f4ead2] placeholder-gray-500 dark:placeholder-gray-400 px-2.5 py-1.5 resize-none max-h-32 min-h-[24px] leading-relaxed"
            />
          </div>

          {/* Far Right Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && !uploadingFile}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shrink-0 ${
              inputText.trim() || uploadingFile
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/25 active:scale-95 cursor-pointer"
                : "bg-gray-200/80 dark:bg-slate-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
            title="Send message"
          >
            <Send className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>

      {/* =========================================================================
          9. SHARE LINK MODAL (GitHub / Drive / Figma / Live)
          ========================================================================= */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-md p-5 rounded-3xl border shadow-none ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-black">Share Link or Resource</h3>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleShareLink} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Resource URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/... or https://figma.com/..."
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-red-500 shadow-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Title / Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Phase 1 Sprint Repo, Figma Mockups"
                  value={linkForm.title}
                  onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-red-500 shadow-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-none"
                >
                  Share in Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. LINK BATCH TASK SELECTOR MODAL
          ========================================================================= */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-lg p-5 rounded-3xl border shadow-none ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-black">Select Batch Task to Share</h3>
              </div>
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {batchTasks.length === 0 ? (
                <div className="text-center py-6 text-gray-400">No active tasks in this batch.</div>
              ) : (
                batchTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleShareTask(t)}
                    className="p-3 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-red-500 cursor-pointer flex items-center justify-between gap-3 transition shadow-none"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{t.title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Priority: {t.priority || "Medium"} · Deadline: {localDate(t.deadline)}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shrink-0">
                      Share Task
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. LINK MEETING SELECTOR MODAL
          ========================================================================= */}
      {meetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-lg p-5 rounded-3xl border shadow-none ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-black">Select Scheduled Meeting to Share</h3>
              </div>
              <button
                type="button"
                onClick={() => setMeetingModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {batchMeetings.length === 0 ? (
                <div className="text-center py-6 text-gray-400">No meetings scheduled for this batch.</div>
              ) : (
                batchMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleShareMeeting(m)}
                    className="p-3 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-red-500 cursor-pointer flex items-center justify-between gap-3 transition shadow-none"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{m.title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Scheduled: {localDate(m.scheduled_at)}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shrink-0">
                      Share Meet
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          12. GROUP MEMBERS DRAWER / MODAL
          ========================================================================= */}
      {showMembersDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-md p-5 rounded-3xl border shadow-none ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
              <div>
                <h3 className="text-sm font-black">{batch?.name || "Batch"} Members</h3>
                <p className="text-[11px] text-gray-400">{batchMembers.length} participants in this group</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMembersDrawer(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
              {batchMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-none">
                      {m.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate">{m.full_name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{m.email}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${ROLE_BADGES[m.role] || "bg-gray-100"}`}>
                    {ROLE_DISPLAY_NAMES[m.role] || m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          13. IMAGE LIGHTBOX ZOOM MODAL
          ========================================================================= */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Enlarged preview"
              className="w-auto h-auto max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <div className="absolute -top-3 -right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadAttachment({
                    attachment_url: previewImage,
                    attachment_type: "image",
                    attachment_name: `image_${Date.now()}.png`,
                  });
                }}
                className="p-2 rounded-full bg-white text-black font-bold shadow-lg hover:bg-gray-200 transition"
                title="Save as"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-full bg-white text-black font-bold shadow-lg hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          14. WHATSAPP FULL REACTION PICKER MODAL (From '+' Button)
          ========================================================================= */}
      {reactionPickerMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
          onClick={() => {
            setReactionPickerMsg(null);
            setReactionSearchQuery("");
          }}
        >
          <div
            className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden animate-scaleUp ${isDark ? "bg-[#202c33] border-slate-700 text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Quick Reaction Strip */}
            <div className="p-3 border-b border-gray-100 dark:border-slate-700/80 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      handleSendReaction(reactionPickerMsg, emoji);
                      setReactionPickerMsg(null);
                      setReactionSearchQuery("");
                    }}
                    className="p-1.5 text-xl hover:scale-125 transition-transform cursor-pointer leading-none"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setReactionPickerMsg(null);
                  setReactionSearchQuery("");
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input (WhatsApp Style) */}
            <div className="p-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 bg-gray-50 dark:bg-[#111b21]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reaction"
                  value={reactionSearchQuery}
                  onChange={(e) => setReactionSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none placeholder-gray-400 dark:placeholder-slate-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Categories & Emojis Grid (8 columns like Image 2) */}
            <div className="px-3 pb-3 max-h-64 overflow-y-auto space-y-3">
              {Object.entries(EMOJI_CATEGORIES).map(([cat, list]) => {
                const filtered = reactionSearchQuery
                  ? list.filter((emoji) => emoji.includes(reactionSearchQuery))
                  : list;
                return (
                  <div key={cat}>
                    <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                      {cat}
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {filtered.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            handleSendReaction(reactionPickerMsg, emoji);
                            setReactionPickerMsg(null);
                            setReactionSearchQuery("");
                          }}
                          className="p-1.5 text-xl hover:scale-130 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition cursor-pointer"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          15. WHATSAPP DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl animate-scaleUp ${isDark ? "bg-[#202c33] border-slate-700 text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center mb-2">
              {deleteTargetMessages.length > 1
                ? `Delete ${deleteTargetMessages.length} messages?`
                : "Delete message?"}
            </h3>

            {(() => {
              const hasAlreadyDeleted = deleteTargetMessages.some(
                (m) =>
                  m.message === "This message was deleted" ||
                  m.message === "You deleted this message" ||
                  deletedForAllIds.has(m.id) ||
                  Boolean(m.is_deleted)
              );
              const canDeleteForEveryone =
                deleteTargetMessages.length > 0 &&
                !hasAlreadyDeleted &&
                deleteTargetMessages.every((m) => m.sender_id === currentUser?.id);

              return (
                <>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    {hasAlreadyDeleted
                      ? "Delete this message for yourself? It will be removed from your chat history."
                      : canDeleteForEveryone
                        ? "You can delete this message for everyone or delete it for yourself only."
                        : "Delete message for me? This will remove the message from your chat. Other participants will still be able to see it."}
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {/* Option 1: Delete for everyone (Only if NOT already deleted and all belong to current user) */}
                    {canDeleteForEveryone && (
                      <button
                        type="button"
                        onClick={() => handleExecuteDelete("for_everyone")}
                        className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow-sm text-center"
                      >
                        Delete for everyone
                      </button>
                    )}

                    {/* Option 2: Delete for me */}
                    <button
                      type="button"
                      onClick={() => handleExecuteDelete("for_me")}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${canDeleteForEveryone
                          ? "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-100"
                          : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        }`}
                    >
                      Delete for me
                    </button>

                    {/* Option 3: Cancel */}
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* =========================================================================
          16. WHATSAPP FORWARD MESSAGE MODAL
          ========================================================================= */}
      {forwardModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setForwardModalOpen(false)}
        >
          <div
            className={`w-full max-w-md p-5 rounded-3xl border shadow-2xl flex flex-col max-h-[85vh] animate-scaleUp ${isDark ? "bg-[#202c33] border-slate-700 text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Forward className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold">
                  Forward {forwardTargetMessages.length > 1 ? `${forwardTargetMessages.length} messages` : "message"} to...
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForwardModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="py-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#111b21]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contact or batch..."
                  value={forwardSearch}
                  onChange={(e) => setForwardSearch(e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Forward Recipients List */}
            <div className="flex-1 overflow-y-auto space-y-1 py-1 max-h-60">
              {(() => {
                const targetBatches = (availableChats?.batches?.length ? availableChats.batches : (batch ? [batch] : []))
                  .filter((b) => !forwardSearch || b.name?.toLowerCase().includes(forwardSearch.toLowerCase()));

                const targetContacts = (availableChats?.contacts?.length ? availableChats.contacts : batchMembers)
                  .filter((c) => c.id !== currentUser?.id && (!forwardSearch || c.full_name?.toLowerCase().includes(forwardSearch.toLowerCase())));

                if (targetBatches.length === 0 && targetContacts.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-gray-400">
                      No matching chats found.
                    </div>
                  );
                }

                return (
                  <>
                    {targetBatches.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1">
                          Batches
                        </div>
                        {targetBatches.map((b) => {
                          const targetKey = JSON.stringify({ type: "batch", id: b.id, name: b.name });
                          const isTargetSelected = selectedForwardTargets.has(targetKey);
                          return (
                            <div
                              key={`batch-${b.id}`}
                              onClick={() => {
                                setSelectedForwardTargets((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(targetKey)) next.delete(targetKey);
                                  else next.add(targetKey);
                                  return next;
                                });
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition ${isTargetSelected
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800"
                                  : "hover:bg-gray-100 dark:hover:bg-slate-700/60"
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                  {b.name?.charAt(0) || "B"}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold truncate">{b.name}</div>
                                  <div className="text-[10px] text-gray-400 truncate">Batch Group</div>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${isTargetSelected
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-gray-300 dark:border-slate-600"
                                }`}>
                                {isTargetSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {targetContacts.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1">
                          Direct Contacts
                        </div>
                        {targetContacts.map((c) => {
                          const targetKey = JSON.stringify({ type: "direct", id: c.id, name: c.full_name });
                          const isTargetSelected = selectedForwardTargets.has(targetKey);
                          return (
                            <div
                              key={`contact-${c.id}`}
                              onClick={() => {
                                setSelectedForwardTargets((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(targetKey)) next.delete(targetKey);
                                  else next.add(targetKey);
                                  return next;
                                });
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition ${isTargetSelected
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800"
                                  : "hover:bg-gray-100 dark:hover:bg-slate-700/60"
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                  {c.full_name?.charAt(0) || "U"}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold truncate">{c.full_name}</div>
                                  <div className="text-[10px] text-gray-400 truncate capitalize">{c.role || "Member"}</div>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${isTargetSelected
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-gray-300 dark:border-slate-600"
                                }`}>
                                {isTargetSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedForwardTargets.size} chat(s) selected
              </span>
              <button
                type="button"
                disabled={selectedForwardTargets.size === 0}
                onClick={handleExecuteForward}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Forward className="w-3.5 h-3.5" />
                <span>Forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP MESSAGE INFO MODAL
          ========================================================================= */}
      {messageInfoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setMessageInfoModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 overflow-hidden animate-scaleUp select-none ${isDark ? "bg-[#202c33] border-slate-700 text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base">Message Info</h3>
              </div>
              <button
                type="button"
                onClick={() => setMessageInfoModal(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm">
              {/* Message preview */}
              <div className={`p-3 rounded-xl border ${isDark ? "bg-black/20 border-slate-700" : "bg-gray-50 border-gray-200"
                }`}>
                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Message Content</div>
                <div className="whitespace-pre-wrap break-words">{messageInfoModal.message}</div>
              </div>

              {/* Sender & Timestamp */}
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-700/60">
                  <span className="text-gray-500">Sent by</span>
                  <span className="font-semibold">{messageInfoModal.sender?.full_name || "Member"} ({ROLE_DISPLAY_NAMES[messageInfoModal.sender?.role] || messageInfoModal.sender?.role || "Member"})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-700/60">
                  <span className="text-gray-500">Sent at</span>
                  <span className="font-semibold">{new Date(messageInfoModal.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCheck className="w-4 h-4" /> Delivered & Read
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setMessageInfoModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
