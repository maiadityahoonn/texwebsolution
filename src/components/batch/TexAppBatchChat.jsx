"use client";

import { useState, useRef, useEffect, useMemo, useCallback, Fragment } from "react";
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
  ChevronUp,
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
  Pencil,
  Mic,
  Square,
  Camera,
  RotateCcw,
  BarChart2,
  GripVertical,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  Clock,
  MessageSquare,
  Lock,
  Palette,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  VolumeX,
  Volume2,
  Mail,
  ZoomIn,
  ZoomOut,
  Keyboard,
  Bell,
  MapPin,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Archive,
  Tag,
  Timer,
  ShieldAlert,
} from "lucide-react";
import { safeExternalUrl } from "@/lib/safeUrl";
import dynamic from "next/dynamic";

const EmojiMartPicker = dynamic(() => import("./EmojiMartPicker"), { ssr: false });
const GiphyPicker = dynamic(() => import("./GiphyPicker"), { ssr: false });
import { AppleEmoji, RenderWithAppleEmojis, getAppleEmojiUrl, getPlainTextFromEditor } from "./AppleEmoji";
import { uploadBatchFile } from "@/services/supabaseService";
import { supabase } from "@/lib/supabase";

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "kB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function formatSecs(sec) {
  if (!sec || isNaN(sec) || !isFinite(sec)) return "0:00";
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function extractFirstUrl(text) {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/(https?:\/\/[^\s<]+)/i);
  return match ? match[0] : null;
}

function getHostname(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

const WALLPAPER_PRESETS = [
  { id: "doodle", name: "WhatsApp Tech Doodle", desc: "Classic tech pattern overlay" },
  { id: "solid", name: "Clean Minimal", desc: "Solid background, no pattern" },
  { id: "dark", name: "Pitch AMOLED Dark", desc: "Deep dark contrast for night" },
  { id: "warm", name: "Warm Vintage Paper", desc: "Subtle vintage warmth" },
];

function parseDocMeta(msg) {
  const full = msg.attachment_name || "Document";
  const parts = full.split(" • ");
  const rawFileName = parts[0]?.trim() || "document";
  const sizeText = parts[1]?.trim() || "";

  let ext = "";
  const dotIdx = rawFileName.lastIndexOf(".");
  if (dotIdx !== -1 && dotIdx < rawFileName.length - 1) {
    ext = rawFileName.substring(dotIdx + 1).toUpperCase();
  } else if (msg.attachment_type === "pdf") {
    ext = "PDF";
  } else if (msg.attachment_type) {
    ext = msg.attachment_type.toUpperCase();
  }

  let iconLabel = ext ? ext.substring(0, 4) : "DOC";
  if (iconLabel === "WEBP") iconLabel = "WEB";

  return {
    fileName: rawFileName,
    extension: ext || "FILE",
    iconLabel,
    sizeText,
  };
}


// Role-based accent colors matching website theme
const ROLE_COLORS = {
  super_admin: "text-rose-600 dark:text-rose-400",
  hr: "text-amber-600 dark:text-amber-400",
  mentor: "text-red-600 dark:text-red-400",
  team_leader: "text-orange-600 dark:text-orange-400",
  intern: "text-red-600 dark:text-red-400",
};

const ROLE_BADGES = {
  super_admin: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
  hr: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  mentor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  team_leader: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900",
  intern: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
};

const ROLE_DISPLAY_NAMES = {
  super_admin: "Super Admin",
  hr: "HR Manager",
  mentor: "Mentor",
  team_leader: "Team Leader",
  intern: "Member",
};

// TexWeb Solution Website Curated Brand Colors for Member Names
// Exclusively uses the website's Red, Crimson, Rose, Ruby, Coral, and Amber brand palette
const WEBSITE_SENDER_COLORS = [
  "text-red-600 dark:text-red-400",          // Primary Brand Red
  "text-rose-600 dark:text-rose-400",        // Vivid Rose
  "text-[#dc2626] dark:text-[#f87171]",      // Bright Crimson
  "text-amber-600 dark:text-amber-400",      // Warm Amber / Gold
  "text-orange-600 dark:text-orange-400",    // Coral / Warm Orange
  "text-[#b91c1c] dark:text-[#fca5a5]",      // Deep Carmine
  "text-[#c2410c] dark:text-[#fb923c]",      // Terracotta
  "text-[#991b1b] dark:text-[#f87185]",      // Rich Burgundy
  "text-[#be123c] dark:text-[#fda4af]",      // Wine Rose
];

// Website Brand Gradients for Default Member Avatars
const SENDER_AVATAR_GRADIENTS = [
  "from-red-600 to-rose-600 ring-red-500/30",
  "from-rose-600 to-red-700 ring-rose-500/30",
  "from-red-700 to-orange-600 ring-orange-500/30",
  "from-amber-600 to-red-600 ring-amber-500/30",
  "from-rose-700 to-pink-600 ring-pink-500/30",
  "from-red-800 to-rose-600 ring-red-600/30",
];

function getSenderAvatarGradient(senderId, senderName) {
  const str = String(senderId || senderName || "user");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % SENDER_AVATAR_GRADIENTS.length;
  return SENDER_AVATAR_GRADIENTS[idx];
}

function getSenderNameColor(senderId, senderName, senderRole) {
  if (senderRole && ROLE_COLORS[senderRole] && senderRole !== "intern") {
    return ROLE_COLORS[senderRole];
  }
  const str = String(senderId || senderName || "user");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % WEBSITE_SENDER_COLORS.length;
  return WEBSITE_SENDER_COLORS[idx];
}

// Popular curated emojis for WhatsApp reaction bar & picker
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🚀", "🔥"];

const EDIT_WINDOW_MS = 60 * 1000;

const EMOJI_CATEGORIES = {
  "Smilies & Reactions": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳", "🤔", "🤫", "🫡", "🤝", "👍", "👎", "👏", "🙌", "🙏", "💪", "❤️", "🔥", "✨"],
  "Work & Tech": ["💻", "📱", "🚀", "💡", "🎯", "⚡", "⚙️", "🛠️", "📊", "📈", "📁", "📂", "📄", "📝", "📌", "📍", "⏰", "⌛", "🔍", "✅", "❌", "⚠️", "🚩", "🏆", "🥇", "🎉", "🎊"],
};

// Smart link classifier
function classifyLink(url) {
  if (!url) return { type: "general", label: "Web Link", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40" };
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) {
    return { type: "github", label: "GitHub Repository", color: "text-gray-900 dark:text-white", bg: "bg-gray-100 dark:bg-slate-800" };
  }
  if (lower.includes("figma.com")) {
    return { type: "figma", label: "Figma Design", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40" };
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

// WhatsApp-style full date & time formatter (e.g. "Today, 6:36 pm" or "14/09/2026, 6:36 pm")
function formatFullDateTime(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    const divider = getMessageDateDivider(value);
    const time = formatMessageTime(value);
    if (divider === "Today" || divider === "Yesterday") {
      return `${divider}, ${time}`;
    }
    return `${divider}, ${time}`;
  } catch {
    return "—";
  }
}

// WhatsApp vertical paperclip icon matching the exact native WhatsApp Web design
function TexAppPaperclipIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M17 9v7.5a5 5 0 0 1-10 0V7.5a3.5 3.5 0 0 1 7 0V16a2 2 0 0 1-4 0V9" />
    </svg>
  );
}

// WhatsApp sticker smiley icon (with peeled corner) matching the exact native WhatsApp Web design
function TexAppStickerSmileyIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer contour with peeled bottom-right corner */}
      <path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9c1.65 0 3.18-.45 4.5-1.23L20.23 16.5A8.96 8.96 0 0 0 21 12a9 9 0 0 0-9-9z" />
      {/* Folded peel corner */}
      <path d="M15.5 19.8l.2-3.8 3.8.2" />
      {/* Eyes */}
      <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none" />
      {/* Smile */}
      <path d="M8.5 14.2c.8 1.4 2.1 2.3 3.5 2.3 1.1 0 2.2-.6 2.9-1.5" />
    </svg>
  );
}

// WhatsApp native scroll down chevron (optically centered)
function TexAppScrollDownIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 19 20"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z" />
    </svg>
  );
}

// WhatsApp & App Brand Centered Send Icon (Optically & Geometrically Balanced in Circular Action Buttons)
function TexAppSendIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M20.5 3.5L13.5 23.5L9.5 14.5L0.5 10.5Z" />
    </svg>
  );
}

// WhatsApp Dynamic Status Tick: Single Tick (✓) -> Double Gray Tick (✓✓) -> Double Red Tick (✓✓)
const WHATSAPP_STICKER_PACK = [
  { id: "stk_heart", emoji: "❤️", text: "Love" },
  { id: "stk_laugh", emoji: "😂", text: "Haha" },
  { id: "stk_fire", emoji: "🔥", text: "Lit" },
  { id: "stk_party", emoji: "🎉", text: "Party" },
  { id: "stk_clap", emoji: "👏", text: "Bravo" },
  { id: "stk_100", emoji: "💯", text: "Perfect" },
  { id: "stk_cool", emoji: "😎", text: "Cool" },
  { id: "stk_mindblown", emoji: "🤯", text: "Woah" },
  { id: "stk_thumbsup", emoji: "👍", text: "Done" },
  { id: "stk_rocket", emoji: "🚀", text: "LFG" },
  { id: "stk_pray", emoji: "🙏", text: "Thanks" },
  { id: "stk_eyes", emoji: "👀", text: "Looking" },
  { id: "stk_star", emoji: "⭐", text: "Top" },
  { id: "stk_crown", emoji: "👑", text: "Boss" },
  { id: "stk_gem", emoji: "💎", text: "Gem" },
  { id: "stk_flex", emoji: "💪", text: "Strong" },
];
function MessageStatusTick({ msg, onMedia = false }) {
  // 1. Read check: either msg.read_at or msg.is_read or any individual receipt has read_at
  const receipts = msg.receipts || {};
  const hasMemberRead = Object.values(receipts).some((r) => Boolean(r?.read_at));
  const isRead = Boolean(msg.read_at || msg.is_read || hasMemberRead);

  if (isRead) {
    return (
      <CheckCheck
        className="w-3.5 h-3.5 stroke-[2.4] shrink-0 text-red-500"
        title="Read"
      />
    );
  }

  // 2. Delivery check: delivered_at on message, or any receipt in receipts
  const hasMemberDelivered = Object.values(receipts).some((r) => Boolean(r?.delivered_at));
  const isDelivered = Boolean(msg.delivered_at || hasMemberDelivered);

  if (isDelivered) {
    return (
      <CheckCheck
        className={`w-3.5 h-3.5 stroke-[2.2] shrink-0 ${
          onMedia ? "text-white/85" : "text-gray-400 dark:text-gray-400"
        }`}
        title="Delivered"
      />
    );
  }

  // 3. Sent to server, not yet delivered to receiver device: Single Gray Tick (✓)
  return (
    <Check
      className={`w-3.5 h-3.5 stroke-[2.2] shrink-0 ${
        onMedia ? "text-white/85" : "text-gray-400 dark:text-gray-400"
      }`}
      title="Sent"
    />
  );
}

// WhatsApp-Style Sleek Voice Note Player Bubble
function VoiceNoteBubble({ msg, isMine, isDark, onOpenDropdown }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  // Pseudo-random deterministic waveform bar heights for realistic voice look
  const waveformHeights = useMemo(() => {
    const seed = (msg.id || "voice").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const bars = [];
    for (let i = 0; i < 26; i++) {
      const val = 25 + Math.abs(Math.sin(seed + i * 1.6) * 70);
      bars.push(Math.round(val));
    }
    return bars;
  }, [msg.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => console.warn("Audio play error:", err));
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = percent * duration;
    setCurrentTime(audio.currentTime);
  };

  const toggleSpeed = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const activeBarIndex = Math.floor((progressPercent / 100) * waveformHeights.length);

  return (
    <div className="w-54 sm:w-62 max-w-[calc(100vw-4rem)] p-1 select-none">
      <audio ref={audioRef} src={msg.attachment_url} preload="metadata" />

      <div className="flex items-center gap-2">
        {/* Play / Pause Circular Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
          title={isPlaying ? "Pause voice note" : "Play voice note"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-white" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
          )}
        </button>

        {/* Waveform track & Time display */}
        <div className="flex-1 min-w-0">
          {/* Waveform bars scrubber */}
          <div
            onClick={handleSeek}
            className="h-6 flex items-center gap-[2px] cursor-pointer group/wave py-0.5"
            title="Click to seek"
          >
            {waveformHeights.map((h, idx) => {
              const isPlayed = idx <= activeBarIndex;
              return (
                <div
                  key={idx}
                  style={{ height: `${h}%` }}
                  className={`w-[2.5px] rounded-full transition-colors duration-150 ${
                    isPlayed
                      ? "bg-red-600 dark:bg-red-500"
                      : isDark
                      ? "bg-[#4a3e2e] group-hover/wave:bg-[#5f503c]"
                      : "bg-gray-300 group-hover/wave:bg-gray-400"
                  }`}
                />
              );
            })}
          </div>

          {/* Bottom subline: Duration / elapsed time + Speed toggle + Timestamp */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">
            <span className="font-mono tabular-nums text-[10px]">
              {formatSecs(isPlaying || currentTime > 0 ? currentTime : duration)}
            </span>

            {/* Speed pill (always accessible when audio has progress or rate is toggled) */}
            {(isPlaying || currentTime > 0 || playbackRate !== 1) && (
              <button
                type="button"
                onClick={toggleSpeed}
                className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900/60 text-[9.5px] font-bold text-red-700 dark:text-red-300 cursor-pointer transition-colors"
                title="Toggle playback speed (1x / 1.5x / 2x)"
              >
                {playbackRate}x
              </button>
            )}

            <div className="flex items-center gap-1">
              <Mic className="w-2.5 h-2.5 text-red-500 shrink-0" />
              <span>{formatMessageTime(msg.created_at)}</span>
              {isMine && <MessageStatusTick msg={msg} />}
              {/* Dropdown Chevron */}
              <button
                type="button"
                data-dropdown-trigger="true"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenDropdown) onOpenDropdown(msg, e.currentTarget);
                }}
                className="p-0.5 rounded opacity-0 group-hover/msg:opacity-100 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer -mr-1"
              >
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TexAppBatchChat({
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
  onEditMessage = null,
  onMarkDelivered = null,
  onMarkRead = null,
  onTyping = null,
  typingUsers = [],
  onlineUserIds = [],
  onOpenTaskDetails,
  onOpenDirectChat = null,
  onUpdateBatchInfo = null,
  onBack = null,
  onRefresh = null,
  isDark = false,
  localDate = (d) => d,
  canManage = false,
}) {
  // Chat state
  const [currentBatch, setCurrentBatch] = useState(batch);
  useEffect(() => {
    setCurrentBatch(batch);
  }, [batch]);

  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState(batch?.name || "");
  const [editGroupAvatarUrl, setEditGroupAvatarUrl] = useState(batch?.avatar_url || null);
  const [groupAvatarError, setGroupAvatarError] = useState(false);
  const [headerAvatarError, setHeaderAvatarError] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [membersFilterTab, setMembersFilterTab] = useState("all"); // "all" | "online" | "offline"
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const groupAvatarFileRef = useRef(null);

  const userRole = currentProfile?.role || currentUser?.role;
  const canAdminOrHrEditGroup =
    ["super_admin", "admin", "hr", "hr_head"].includes(userRole) ||
    (currentBatch?.hr_id && currentBatch.hr_id === currentUser?.id);

  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // Message object being quoted
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaPickerTab, setMediaPickerTab] = useState("emoji"); // "emoji" | "gif" | "stickers"
  const [showPickerSearch, setShowPickerSearch] = useState(false);
  const [showAttachmentTray, setShowAttachmentTray] = useState(false);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [showPinnedTray, setShowPinnedTray] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // Lightbox
  const [galleryMediaIndex, setGalleryMediaIndex] = useState(null); // Fullscreen Gallery Index
  const [galleryZoom, setGalleryZoom] = useState(1);
  const [isLockedRecording, setIsLockedRecording] = useState(false); // Hands-free voice recording lock
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [confirmClearChatModal, setConfirmClearChatModal] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("info"); // "info" | "media" | "docs" | "links"
  const [showChatOptionsDropdown, setShowChatOptionsDropdown] = useState(false);
  const [openedFromChatOptions, setOpenedFromChatOptions] = useState(false);

  // WhatsApp Navigation: Return to Chat Options drawer if sub-modal was launched from it
  const handleCloseMembersDrawer = () => {
    setShowMembersDrawer(false);
    setIsEditingGroup(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  const handleCloseWallpaperModal = () => {
    setShowWallpaperModal(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  const handleCloseMuteModal = () => {
    setShowMuteModal(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  const handleCloseClearChatModal = () => {
    setConfirmClearChatModal(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  const handleCloseKeyboardShortcutsModal = () => {
    setShowKeyboardShortcutsModal(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  const handleCloseLabelPickerModal = () => {
    setShowLabelPickerModal(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  const handleCloseDisappearingModal = () => {
    setShowDisappearingModal(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);
  const [desktopNotifState, setDesktopNotifState] = useState(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState(null);
  const [isPlayingVoicePreview, setIsPlayingVoicePreview] = useState(false);
  const voicePreviewAudioRef = useRef(null);

  const activeChatId = contact?.id || currentBatch?.id || batch?.id || "general";
  const draftKey = `texweb_draft_${activeChatId}`;

  const [isChatMuted, setIsChatMuted] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_muted_chats");
        if (stored) {
          const map = JSON.parse(stored);
          return Boolean(map[activeChatId]);
        }
      }
    } catch {}
    return false;
  });

  const CHAT_LABEL_PRESETS = [
    { id: "important", name: "Important", color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
    { id: "work", name: "Work", color: "bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30" },
    { id: "lead", name: "Lead / Client", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
    { id: "pending", name: "Pending", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    { id: "personal", name: "Personal", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
  ];

  // 1. Archive state
  const [isChatArchived, setIsChatArchived] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_archived_chats");
        return stored ? JSON.parse(stored).includes(activeChatId) : false;
      }
    } catch {}
    return false;
  });

  const handleToggleArchiveChat = () => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_archived_chats");
        const list = stored ? JSON.parse(stored) : [];
        const next = list.includes(activeChatId) ? list.filter((id) => id !== activeChatId) : [activeChatId, ...list];
        localStorage.setItem("texweb_archived_chats", JSON.stringify(next));
        setIsChatArchived(!isChatArchived);
        window.dispatchEvent(new Event("texweb_draft_updated"));
        setToast(isChatArchived ? "Chat unarchived" : "Chat archived");
      }
    } catch {}
  };

  // 2. Chat Label state
  const [activeChatLabel, setActiveChatLabel] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_chat_labels");
        return stored ? JSON.parse(stored)[activeChatId] || null : null;
      }
    } catch {}
    return null;
  });
  const [showLabelPickerModal, setShowLabelPickerModal] = useState(false);

  const handleSetChatLabel = (labelId) => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_chat_labels");
        const map = stored ? JSON.parse(stored) : {};
        if (!labelId) {
          delete map[activeChatId];
        } else {
          map[activeChatId] = labelId;
        }
        localStorage.setItem("texweb_chat_labels", JSON.stringify(map));
        setActiveChatLabel(labelId || null);
        window.dispatchEvent(new Event("texweb_draft_updated"));
        setShowLabelPickerModal(false);
        setToast(labelId ? `Chat labeled as ${labelId}` : "Chat label removed");
        if (openedFromChatOptions) {
          setOpenedFromChatOptions(false);
          setShowChatOptionsDropdown(true);
        }
      }
    } catch {}
  };

  // 3. Block contact state (for Direct chats)
  const [isContactBlocked, setIsContactBlocked] = useState(() => {
    try {
      if (typeof window !== "undefined" && mode === "direct" && contact?.id) {
        const stored = localStorage.getItem("texweb_blocked_contacts");
        return stored ? JSON.parse(stored).includes(contact.id) : false;
      }
    } catch {}
    return false;
  });

  const handleToggleBlockContact = () => {
    if (mode !== "direct" || !contact?.id) return;
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_blocked_contacts");
        const list = stored ? JSON.parse(stored) : [];
        const next = list.includes(contact.id) ? list.filter((id) => id !== contact.id) : [...list, contact.id];
        localStorage.setItem("texweb_blocked_contacts", JSON.stringify(next));
        setIsContactBlocked(!isContactBlocked);
        window.dispatchEvent(new Event("texweb_draft_updated"));
        setToast(isContactBlocked ? `Unblocked ${contact.full_name || "contact"}` : `Blocked ${contact.full_name || "contact"}`);
      }
    } catch {}
  };

  // 4. Disappearing Messages Timer state
  const [disappearingTimer, setDisappearingTimer] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_disappearing_timers");
        return stored ? JSON.parse(stored)[activeChatId] || "off" : "off";
      }
    } catch {}
    return "off";
  });
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);

  const handleSetDisappearingTimer = (timer) => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_disappearing_timers");
        const map = stored ? JSON.parse(stored) : {};
        if (timer === "off") {
          delete map[activeChatId];
        } else {
          map[activeChatId] = timer;
        }
        localStorage.setItem("texweb_disappearing_timers", JSON.stringify(map));
        setDisappearingTimer(timer);
        window.dispatchEvent(new Event("texweb_draft_updated"));
        setShowDisappearingModal(false);
        setToast(timer === "off" ? "Disappearing messages turned off" : `Messages will disappear after ${timer === "24h" ? "24 hours" : timer === "7d" ? "7 days" : "90 days"}`);
        if (openedFromChatOptions) {
          setOpenedFromChatOptions(false);
          setShowChatOptionsDropdown(true);
        }
      }
    } catch {}
  };

  // Sync privacy states on activeChatId change or storage update
  useEffect(() => {
    const handlePrivacyUpdate = () => {
      try {
        if (typeof window !== "undefined") {
          const arch = localStorage.getItem("texweb_archived_chats");
          setIsChatArchived(arch ? JSON.parse(arch).includes(activeChatId) : false);
          const lbls = localStorage.getItem("texweb_chat_labels");
          setActiveChatLabel(lbls ? JSON.parse(lbls)[activeChatId] || null : null);
          if (mode === "direct" && contact?.id) {
            const blk = localStorage.getItem("texweb_blocked_contacts");
            setIsContactBlocked(blk ? JSON.parse(blk).includes(contact.id) : false);
          }
          const dTimers = localStorage.getItem("texweb_disappearing_timers");
          setDisappearingTimer(dTimers ? JSON.parse(dTimers)[activeChatId] || "off" : "off");
        }
      } catch {}
    };
    handlePrivacyUpdate();
    window.addEventListener("texweb_draft_updated", handlePrivacyUpdate);
    window.addEventListener("storage", handlePrivacyUpdate);
    return () => {
      window.removeEventListener("texweb_draft_updated", handlePrivacyUpdate);
      window.removeEventListener("storage", handlePrivacyUpdate);
    };
  }, [activeChatId, mode, contact?.id]);

  // Restore draft when active chat changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
          setInputText(saved);
        } else {
          setInputText("");
        }
      }
    } catch {}
  }, [draftKey]);

  // Sync isChatMuted when active chat changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_muted_chats");
        const map = stored ? JSON.parse(stored) : {};
        setIsChatMuted(Boolean(map[activeChatId]));
      }
    } catch {}
  }, [activeChatId]);

  const handleInputTextChange = (val) => {
    setInputText(val);
    try {
      if (typeof window !== "undefined") {
        if (val && val.trim()) {
          localStorage.setItem(draftKey, val);
        } else {
          localStorage.removeItem(draftKey);
        }
        window.dispatchEvent(new Event("texweb_draft_updated"));
      }
    } catch {}
  };

  const handleToggleMute = (duration) => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_muted_chats");
        const map = stored ? JSON.parse(stored) : {};
        if (duration === "unmute" || isChatMuted) {
          delete map[activeChatId];
          setIsChatMuted(false);
          showToast("Notifications unmuted");
        } else {
          map[activeChatId] = {
            duration,
            mutedAt: Date.now(),
          };
          setIsChatMuted(true);
          showToast(`Notifications muted (${duration})`);
        }
        localStorage.setItem("texweb_muted_chats", JSON.stringify(map));
        window.dispatchEvent(new Event("texweb_draft_updated"));
      }
    } catch {}
    setShowMuteModal(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };
  const [copiedContactEmail, setCopiedContactEmail] = useState(false);
  const playWhatsAppChime = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioContext = new AudioContextClass();
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
      const t = audioContext.currentTime;

      // Note 1: 880 Hz (A5)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, t);
      gain1.gain.setValueAtTime(0.0001, t);
      gain1.gain.exponentialRampToValueAtTime(0.08, t + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.start(t);
      osc1.stop(t + 0.12);

      // Note 2: 1320 Hz (E6 harmonic fifth)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, t + 0.09);
      gain2.gain.setValueAtTime(0.0001, t + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.1, t + 0.105);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.23);
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.start(t + 0.09);
      osc2.stop(t + 0.24);

      setTimeout(() => {
        audioContext.close().catch(() => {});
      }, 400);
    } catch {}
  }, []);
  const [copiedId, setCopiedId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [recordingMode, setRecordingMode] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [chatToast, setChatToast] = useState(null);
  const [showMicHelpModal, setShowMicHelpModal] = useState(false);
  const [mediaPermissionState, setMediaPermissionState] = useState({
    microphone: "prompt",
    camera: "prompt",
  });
  const recordingTimerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const isDiscardedRef = useRef(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [editClock, setEditClock] = useState(() => Date.now());
  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const previousMessageCountRef = useRef(messages?.length || 0);

  const getChatAuthHeaders = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const showToast = (msg) => {
    setChatToast(msg);
    const duration = typeof msg === "object" && msg?.sticky ? 10000 : 4500;
    setTimeout(() => {
      setChatToast((curr) => (curr === msg ? null : curr));
    }, duration);
  };

  const requestDesktopNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Desktop notifications are not supported in this browser.");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setDesktopNotifState(res);
      if (res === "granted") {
        showToast("Desktop notifications enabled!");
        try {
          new Notification("TexWeb Notifications Enabled", {
            body: "You will receive desktop alerts for incoming messages when TexWeb is running in the background.",
            icon: "/favicon.ico",
          });
        } catch {}
      } else if (res === "denied") {
        showToast("Notifications were blocked. Please enable them in your browser site permissions.");
      }
    } catch {
      showToast("Could not request notification permissions.");
    }
  };

  // 1-Click Message Copy with Toast Feedback
  const handleCopyMessageText = (msg) => {
    const textToCopy = msg.message || msg.attachment_url || "";
    if (!textToCopy) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy);
        showToast("Message copied to clipboard");
      }
    } catch {
      showToast("Could not copy message.");
    }
  };

  // Rich Text Formatting (*bold*, _italic_, ~strike~, `code`)
  const applyTextFormatting = (wrapper) => {
    const el = getActiveComposerElement();
    if (!el) return;

    if (typeof el.selectionStart === "number") {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value || "";
      const selected = val.substring(start, end);
      const replacement = selected ? `${wrapper}${selected}${wrapper}` : `${wrapper}${wrapper}`;
      const updated = val.substring(0, start) + replacement + val.substring(end);
      el.value = updated;
      setInputText(updated);
      el.focus();
      const newCursor = selected ? start + replacement.length : start + wrapper.length;
      el.setSelectionRange(newCursor, newCursor);
    } else {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        const current = getPlainTextFromEditor(el);
        const updated = current + `${wrapper}${wrapper}`;
        el.innerText = updated;
        setInputText(updated);
        el.focus();
        return;
      }
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      const replacementText = selectedText ? `${wrapper}${selectedText}${wrapper}` : `${wrapper}${wrapper}`;
      range.deleteContents();
      const textNode = document.createTextNode(replacementText);
      range.insertNode(textNode);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      setInputText(getPlainTextFromEditor(el));
      el.focus();
    }
  };

  // Share Live Location
  const handleShareCurrentLocation = () => {
    if (!navigator?.geolocation) {
      showToast("Geolocation is not supported by your browser.");
      return;
    }
    showToast("Locating your position...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const locationMessage = `📍 Live Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}\n${mapsUrl}`;
        if (onSendMessage) {
          await onSendMessage({
            message: locationMessage,
            attachment_url: mapsUrl,
            attachment_name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            attachment_type: "location",
          });
          showToast("Location shared successfully!");
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        showToast("Could not access your location. Please check location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Realtime Camera states (Live Viewfinder, Snap, Retake, Send, Cancel)
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState("");
  const [cameraRetryKey, setCameraRetryKey] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Mobile Visual Viewport & Keyboard Handling (WhatsApp Mobile UX Parity)
  // Prevents header from scrolling off-screen when virtual keyboard opens
  useEffect(() => {
    if (typeof window === "undefined") return;

    const lockScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("scroll", lockScroll, { passive: true });

    const vv = window.visualViewport;
    if (!vv) return () => window.removeEventListener("scroll", lockScroll);

    const handleViewportChange = () => {
      lockScroll();
      if (chatContainerRef.current) {
        chatContainerRef.current.style.height = `${vv.height}px`;
      }
    };

    vv.addEventListener("resize", handleViewportChange);
    vv.addEventListener("scroll", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", lockScroll);
      vv.removeEventListener("resize", handleViewportChange);
      vv.removeEventListener("scroll", handleViewportChange);
      if (chatContainerRef.current) {
        chatContainerRef.current.style.height = "";
      }
    };
  }, []);

  const isPermissionDeniedError = (err) =>
    err?.name === "NotAllowedError" ||
    err?.name === "PermissionDeniedError" ||
    err?.message?.toLowerCase?.().includes("permission denied");

  const describeMediaError = (err, kind = "microphone") => {
    if (isPermissionDeniedError(err)) {
      return `${kind === "camera" ? "Camera" : "Microphone"} permission is blocked. Please allow it from the browser URL bar, then tap Try Again.`;
    }
    if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
      return `No ${kind === "camera" ? "camera" : "microphone"} device was detected. Please connect a device and try again.`;
    }
    if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
      return `${kind === "camera" ? "Camera" : "Microphone"} is being used by another app. Close the other app and try again.`;
    }
    if (err?.name === "OverconstrainedError" || err?.name === "ConstraintNotSatisfiedError") {
      return `${kind === "camera" ? "Camera" : "Microphone"} constraints did not match this device. Try again with default settings.`;
    }
    return err?.message || `Unable to access ${kind}. Please check browser and device permissions.`;
  };

  const requestChatMediaStream = async (mode = "audio", facingMode = cameraFacingMode) => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error("Media recording requires browser permissions and a secure HTTPS/localhost connection.");
    }

    const constraints =
      mode === "camera"
        ? {
            video: {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          }
        : mode === "video"
          ? { audio: true, video: true }
          : { audio: true };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (primaryErr) {
      if (mode === "camera") throw primaryErr;
      console.warn("Primary getUserMedia failed, checking alternative audio devices:", primaryErr?.name, primaryErr?.message);
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput" && d.deviceId);
        for (const dev of audioInputs) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: { deviceId: { exact: dev.deviceId } },
              video: mode === "video",
            });
            if (stream) return stream;
          } catch (fallbackDevErr) {
            console.warn("Alternative audio device attempt failed:", dev.label, fallbackDevErr?.name);
          }
        }
      } catch (enumErr) {
        console.warn("enumerateDevices fallback error:", enumErr);
      }
      throw primaryErr;
    }
  };

  const refreshMediaPermissionState = async () => {
    if (!navigator?.permissions?.query) return;
    await Promise.all(
      ["microphone", "camera"].map(async (name) => {
        try {
          const status = await navigator.permissions.query({ name });
          setMediaPermissionState((prev) => ({ ...prev, [name]: status.state }));
        } catch {
          // Some browsers do not expose camera/microphone through Permissions API.
        }
      })
    );
  };

  useEffect(() => {
    if (!navigator?.permissions?.query) return undefined;
    let cancelled = false;
    const cleanups = [];

    async function watchPermission(name) {
      try {
        const status = await navigator.permissions.query({ name });
        const sync = () => {
          if (cancelled) return;
          setMediaPermissionState((prev) => ({ ...prev, [name]: status.state }));
          if (status.state === "granted") {
            if (name === "microphone") {
              setShowMicHelpModal(false);
              setChatToast((curr) => (curr?.scope === "microphone" ? null : curr));
            }
            if (name === "camera") {
              setCameraError("");
              setCameraRetryKey((prev) => prev + 1);
            }
          }
        };
        status.onchange = sync;
        cleanups.push(() => {
          status.onchange = null;
        });
        sync();
      } catch {
        // Permission name unsupported in this browser.
      }
    }

    watchPermission("microphone");
    watchPermission("camera");
    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // Poll states (Create Poll & Realtime Interactive Voting)
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(true);
  const [optimisticVotes, setOptimisticVotes] = useState({});
  const [pollEmojiTarget, setPollEmojiTarget] = useState(null); // null | "question" | option index
  const [pollDetailsModal, setPollDetailsModal] = useState(null); // Poll msg object to view voters

  // WhatsApp Media & Document Preview Modal states (Multi-selection, Preview, Caption, Filmstrip)
  const [showMediaPreviewModal, setShowMediaPreviewModal] = useState(false);
  const [pendingMediaItems, setPendingMediaItems] = useState([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaCaption, setMediaCaption] = useState("");
  const [isUploadingMediaQueue, setIsUploadingMediaQueue] = useState(false);
  const [showCaptionEmojiPicker, setShowCaptionEmojiPicker] = useState(false);

  // Realtime Camera stream lifecycle
  useEffect(() => {
    if (!showCameraModal) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
      setCapturedPhoto(null);
      setCameraError("");
      return;
    }

    let localStream = null;
    let isCancelled = false;

    async function startCamera() {
      try {
        setCameraError("");
        await refreshMediaPermissionState();
        const stream = await requestChatMediaStream("camera", cameraFacingMode);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStream = stream;
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable:", err?.name || err?.message);
        await refreshMediaPermissionState();
        setCameraError(describeMediaError(err, "camera"));
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [showCameraModal, cameraFacingMode, cameraRetryKey]);

  const handleRetryCamera = async () => {
    setCapturedPhoto(null);
    setCameraError("");
    await refreshMediaPermissionState();
    setCameraRetryKey((prev) => prev + 1);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (cameraFacingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedPhoto(dataUrl);
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
    setCapturedPhoto(null);
    setCameraError("");
  };

  const handleFlipCamera = () => {
    if (capturedPhoto) return;
    setCameraFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleSendCapturedPhoto = async () => {
    if (!capturedPhoto) return;
    const photoData = capturedPhoto;
    handleCloseCamera();

    try {
      const res = await fetch(photoData);
      const blob = await res.blob();
      const photoFile = new File([blob], `camera_photo_${Date.now()}.jpg`, { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(photoFile);

      setPendingMediaItems([
        {
          id: `media_${Date.now()}`,
          file: photoFile,
          name: photoFile.name,
          sizeStr: formatBytes(photoFile.size),
          displayName: `camera_photo_${Date.now()}.jpg`,
          attachmentType: "image",
          isMedia: true,
          isVideo: false,
          isAudio: false,
          isImage: true,
          previewUrl,
          type: "media",
        },
      ]);
      setActiveMediaIndex(0);
      setMediaCaption("");
      setShowMediaPreviewModal(true);
    } catch {
      await handleSendAttachment({
        message: "",
        attachment_url: photoData,
        attachment_name: `camera_photo_${Date.now()}.jpg`,
        attachment_type: "image",
        reference_type: "none",
      });
    }
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    if (index === newOptions.length - 1 && value.trim() && newOptions.length < 12) {
      newOptions.push("");
    }
    setPollOptions(newOptions);
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleCreatePoll = async (e) => {
    if (e) e.preventDefault();
    const q = pollQuestion.trim();
    const cleanOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!q || cleanOpts.length < 2) return;

    const pollPayload = {
      id: `poll_${Date.now()}`,
      question: q,
      options: cleanOpts.map((text, idx) => ({
        id: idx + 1,
        text,
        votes: [],
      })),
      allow_multiple: pollAllowMultiple,
      created_by: currentUser?.id,
      created_by_name: currentUser?.full_name || currentProfile?.full_name || "Member",
      created_at: new Date().toISOString(),
    };

    setShowPollModal(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollAllowMultiple(true);

    await handleSendAttachment({
      message: JSON.stringify(pollPayload),
      attachment_name: q,
      attachment_type: "poll",
      reference_type: "none",
    });
  };

  const handleVotePoll = async (msg, optionId) => {
    if (!currentUser?.id) return;
    let pollData = optimisticVotes[msg.id];
    if (!pollData) {
      try {
        pollData = typeof msg.message === "string" ? JSON.parse(msg.message) : msg.message;
      } catch {
        return;
      }
    }
    if (!pollData || !Array.isArray(pollData.options)) return;

    const myId = currentUser.id;
    const allowMultiple = Boolean(pollData.allow_multiple);

    const voterEntry = {
      id: currentUser.id,
      name: currentUser.full_name || currentProfile?.full_name || "Member",
      role: currentUser.role || currentProfile?.role || "Member",
      avatar_url: currentProfile?.avatar_url || currentUser?.avatar_url || null,
      voted_at: new Date().toISOString(),
    };

    const updatedOptions = pollData.options.map((opt) => {
      const currentVotes = Array.isArray(opt.votes) ? opt.votes : [];
      const alreadyVoted = currentVotes.some((v) => (typeof v === "string" ? v === myId : v?.id === myId));

      if (opt.id === optionId) {
        if (alreadyVoted) {
          // Toggle off if clicking the same option
          return {
            ...opt,
            votes: currentVotes.filter((v) => (typeof v === "string" ? v !== myId : v?.id !== myId)),
          };
        } else {
          // Add vote to this option
          const withoutMe = currentVotes.filter((v) => (typeof v === "string" ? v !== myId : v?.id !== myId));
          return {
            ...opt,
            votes: [...withoutMe, voterEntry],
          };
        }
      } else {
        // When single-choice mode (Select one), clear vote from all other options
        if (!allowMultiple) {
          return {
            ...opt,
            votes: currentVotes.filter((v) => (typeof v === "string" ? v !== myId : v?.id !== myId)),
          };
        }
        return opt;
      }
    });

    const updatedPoll = {
      ...pollData,
      options: updatedOptions,
    };

    setOptimisticVotes((prev) => ({
      ...prev,
      [msg.id]: updatedPoll,
    }));

    try {
      const sessionRes = await supabase?.auth?.getSession?.();
      const token = sessionRes?.data?.session?.access_token;
      if (mode === "batch" && batch?.id) {
        await fetch("/api/batch-workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            type: "vote_poll",
            message_id: msg.id,
            batch_id: batch.id,
            poll_data: updatedPoll,
          }),
        });
      } else {
        await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            type: "vote_poll",
            message_id: msg.id,
            poll_data: updatedPoll,
          }),
        });
      }
    } catch (err) {
      console.warn("Failed to submit poll vote:", err?.message || err);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Chat refresh error:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // WhatsApp Reaction and Dropdown States
  const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);
  const [activeDropdownMsgId, setActiveDropdownMsgId] = useState(null);
  const [dropdownDirection, setDropdownDirection] = useState("down"); // "down" | "up"
  const [dropdownMenuState, setDropdownMenuState] = useState(null);
  const [messageInfoModal, setMessageInfoModal] = useState(null);

  const closeDropdown = () => {
    setActiveDropdownMsgId(null);
    setDropdownMenuState(null);
  };

  const [reactionTargetMessage, setReactionTargetMessage] = useState(null);

  const handleOpenReactionInChatboxPicker = (msg) => {
    closeDropdown();
    setActiveReactionMsgId(null);
    setReactionTargetMessage(msg);
    setMediaPickerTab("emoji");
    setShowEmojiPicker(true);
    setShowAttachmentTray(false);
  };

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
    closeDropdown();
  };

  const canEditMessage = (msg) => {
    if (!msg || msg.sender_id !== currentUser?.id || msg.attachment_url || msg.is_deleted) return false;
    if (msg.message === "This message was deleted" || msg.message === "You deleted this message") return false;
    const created = new Date(msg.created_at).getTime();
    return !Number.isNaN(created) && editClock - created <= EDIT_WINDOW_MS;
  };

  const canPinMessage = (msg) => {
    if (!msg || msg.is_deleted) return false;
    if (mode === "direct") return msg.sender_id === currentUser?.id;
    return Boolean(canManage);
  };

  const setComposerText = (text) => {
    setInputText(text || "");
    [textareaRef.current, mobileTextareaRef.current].forEach((el) => {
      if (!el) return;
      if (typeof el.value === "string") {
        el.value = text || "";
      } else {
        el.innerText = text || "";
      }
    });
    const activeEl = getActiveComposerElement();
    if (activeEl) {
      activeEl.focus();
    }
  };

  const getActiveComposerElement = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) {
      return mobileTextareaRef.current || textareaRef.current;
    }
    return textareaRef.current || mobileTextareaRef.current;
  };

  // WhatsApp Backspace button: deletes last character/emoji from active composer
  const handleComposerBackspace = () => {
    try {
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate(12);
      }
    } catch {}
    const activeEl = getActiveComposerElement();
    const currentText = (typeof activeEl?.value === "string" ? activeEl.value : activeEl?.innerText) || inputText || "";
    if (currentText.length > 0) {
      const chars = Array.from(currentText);
      chars.pop();
      const updated = chars.join("");
      setComposerText(updated);
      handleInputTextChange(updated);
    }
  };

  // Smart floating dropdown position: anchored cleanly without being clipped or covered by header
  const handleOpenDropdown = (msg, triggerElem) => {
    if (activeDropdownMsgId === msg.id) {
      closeDropdown();
      return;
    }

    if (!triggerElem || !chatScrollRef.current) {
      setActiveDropdownMsgId(msg.id);
      return;
    }

    const containerRect = chatScrollRef.current.getBoundingClientRect();
    const triggerRect = triggerElem.getBoundingClientRect();

    const isMine = msg.sender_id === currentUser?.id;
    const isDeletedForAll =
      msg.message === "This message was deleted" ||
      msg.message === "You deleted this message" ||
      deletedForAllIds.has(msg.id) ||
      Boolean(msg.is_deleted);

    const menuWidth = 268;
    const menuHeight = isDeletedForAll ? 95 : 345;

    const spaceBelow = containerRect.bottom - triggerRect.bottom;
    const spaceAbove = triggerRect.top - containerRect.top;

    let top = 0;
    let originClass = "";

    // Prefer opening downwards if enough space below
    if (spaceBelow >= menuHeight + 8) {
      top = triggerRect.bottom + 4;
      originClass = isMine ? "origin-top-right" : "origin-top-left";
      setDropdownDirection("down");
    } else if (spaceAbove >= menuHeight + 8) {
      // Plenty of room above
      top = triggerRect.top - menuHeight - 4;
      originClass = isMine ? "origin-bottom-right" : "origin-bottom-left";
      setDropdownDirection("up");
    } else {
      // Tight space: place where there is more room, clamping strictly inside visible area
      if (spaceAbove > spaceBelow) {
        top = Math.max(containerRect.top + 8, triggerRect.top - menuHeight - 4);
        originClass = isMine ? "origin-bottom-right" : "origin-bottom-left";
        setDropdownDirection("up");
      } else {
        top = Math.min(containerRect.bottom - menuHeight - 8, triggerRect.bottom + 4);
        top = Math.max(containerRect.top + 8, top);
        originClass = isMine ? "origin-top-right" : "origin-top-left";
        setDropdownDirection("down");
      }
    }

    // Strictly enforce top cannot go into or behind the header / pinned bar
    top = Math.max(containerRect.top + 8, top);

    // Horizontal position clamped inside container boundaries
    let left = isMine ? triggerRect.right - menuWidth : triggerRect.left;
    left = Math.max(containerRect.left + 8, Math.min(left, containerRect.right - menuWidth - 8));

    setDropdownMenuState({
      msg,
      top,
      left,
      originClass,
    });
    setActiveDropdownMsgId(msg.id);
    setActiveReactionMsgId(null);
  };

  // =========================================================================
  // MOBILE TOUCH GESTURES (WhatsApp Swipe to Reply & Long-Press Quick Reactions)
  // =========================================================================
  const [swipeState, setSwipeState] = useState({ msgId: null, offset: 0 });
  const touchCoordsRef = useRef({ x: 0, y: 0, time: 0 });
  const longPressTimerRef = useRef(null);
  const isDraggingSwipeRef = useRef(false);

  const handleMessageTouchStart = (e, msg, bubbleElem) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchCoordsRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    isDraggingSwipeRef.current = false;

    // 420ms long-press hold for WhatsApp selection & floating emoji reaction menu
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      try {
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate(30);
        }
      } catch {}
      if (bubbleElem) {
        handleOpenDropdown(msg, bubbleElem);
      }
      setSelectedMsgIds((prev) => {
        const next = new Set(prev);
        next.add(msg.id);
        return next;
      });
      setIsSelectionMode(true);
    }, 420);
  };

  const handleMessageTouchMove = (e, msg) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchCoordsRef.current.x;
    const diffY = touch.clientY - touchCoordsRef.current.y;

    // Movement cancels long-press
    if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    // Vertical drag: Let native scrolling happen smoothly with ZERO JS state updates
    if (Math.abs(diffY) > Math.abs(diffX)) {
      return;
    }

    // Horizontal right-swipe gesture (Swipe to reply) - ONLY when predominantly horizontal
    if (diffX > 18 && diffX > Math.abs(diffY) * 1.5) {
      isDraggingSwipeRef.current = true;
      const clampedOffset = Math.min(65, Math.max(0, diffX));
      setSwipeState((prev) => {
        if (prev.msgId === msg.id && Math.abs(prev.offset - clampedOffset) < 3) return prev;
        return { msgId: msg.id, offset: clampedOffset };
      });
    }
  };

  const handleMessageTouchEnd = (e, msg) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (swipeState.msgId === msg.id && swipeState.offset >= 45) {
      try {
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate(25);
        }
      } catch {}
      setReplyingTo(msg);
      const el = getActiveComposerElement();
      if (el) el.focus();
    } else if (!isDraggingSwipeRef.current && (!swipeState.offset || swipeState.offset < 10)) {
      handleMessageTap(msg);
    }

    setSwipeState({ msgId: null, offset: 0 });
    isDraggingSwipeRef.current = false;
  };

  // WhatsApp Double-Tap Quick React with ❤️
  const lastTapRef = useRef({ time: 0, msgId: null });
  const [doubleTapHeartMsgId, setDoubleTapHeartMsgId] = useState(null);

  const handleMessageTap = (msg) => {
    const now = Date.now();
    if (lastTapRef.current.msgId === msg.id && now - lastTapRef.current.time < 350) {
      lastTapRef.current = { time: 0, msgId: null };
      try {
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate(35);
        }
      } catch {}
      handleSendReaction(msg, "❤️");
      setDoubleTapHeartMsgId(msg.id);
      setTimeout(() => setDoubleTapHeartMsgId(null), 850);
      return true;
    }
    lastTapRef.current = { time: now, msgId: msg.id };
    return false;
  };

  // WhatsApp Chat Wallpaper Customization
  const [chatWallpaper, setChatWallpaper] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("texweb_chat_wallpaper") || "doodle";
      }
    } catch {}
    return "doodle";
  });
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);

  const handleSelectWallpaper = (wp) => {
    setChatWallpaper(wp);
    try {
      localStorage.setItem("texweb_chat_wallpaper", wp);
    } catch {}
    setShowWallpaperModal(false);
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  // Voice recording slide-to-cancel and slide-up-to-lock touch handlers
  const recordTouchStartRef = useRef(0);
  const recordTouchStartYRef = useRef(0);
  const [recordSlideOffset, setRecordSlideOffset] = useState(0);

  const handleRecordTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    recordTouchStartRef.current = e.touches[0].clientX;
    recordTouchStartYRef.current = e.touches[0].clientY;
    setRecordSlideOffset(0);
  };

  const handleRecordTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    const diffX = e.touches[0].clientX - recordTouchStartRef.current;
    const diffY = e.touches[0].clientY - recordTouchStartYRef.current;

    // Slide UP (>= 40px) locks recording into hands-free mode
    if (diffY < -40 && !isLockedRecording) {
      setIsLockedRecording(true);
      try {
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }
      } catch {}
    }

    if (diffX < 0) {
      const offset = Math.min(120, Math.abs(diffX));
      setRecordSlideOffset(offset);
      if (offset >= 85) {
        try {
          if (typeof window !== "undefined" && navigator.vibrate) {
            navigator.vibrate(40);
          }
        } catch {}
        handleCancelRecording();
        setRecordSlideOffset(0);
      }
    }
  };

  const handleRecordTouchEnd = () => {
    setRecordSlideOffset(0);
  };


  // Download attachment (Save as functionality for images, pdfs, documents)
  const handleDownloadAttachment = async (msg) => {
    if (!msg?.attachment_url) return;
    const rawName = (msg.attachment_name || "").split(" • ")[0]?.trim();
    const filename =
      rawName ||
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

  // Media, Docs, and Links lists for current chat (excluding deleted messages)
  const chatMediaList = useMemo(() => {
    return (messages || []).filter(
      (m) =>
        m.attachment_url &&
        (m.attachment_type === "image" || m.attachment_type === "video") &&
        !deletedForMeIds.has(m.id)
    );
  }, [messages, deletedForMeIds]);

  const chatDocsList = useMemo(() => {
    return (messages || []).filter(
      (m) =>
        m.attachment_url &&
        (m.attachment_type === "pdf" || m.attachment_type === "document") &&
        !deletedForMeIds.has(m.id)
    );
  }, [messages, deletedForMeIds]);

  const chatLinksList = useMemo(() => {
    const list = [];
    (messages || []).forEach((m) => {
      if (m.message && !deletedForMeIds.has(m.id)) {
        const u = extractFirstUrl(m.message);
        if (u) {
          list.push({ msg: m, url: u, domain: getHostname(u) });
        }
      }
    });
    return list;
  }, [messages, deletedForMeIds]);

  const starredMessagesList = useMemo(() => {
    return (messages || []).filter((m) => starredMsgIds.has(m.id) && !deletedForMeIds.has(m.id));
  }, [messages, starredMsgIds, deletedForMeIds]);

  const [enterIsSend, setEnterIsSend] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("texweb_enter_is_send");
        return stored !== null ? JSON.parse(stored) : true;
      }
    } catch {}
    return true;
  });

  const toggleEnterIsSend = () => {
    setEnterIsSend((prev) => {
      const next = !prev;
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("texweb_enter_is_send", JSON.stringify(next));
        }
      } catch {}
      showToast(next ? "Press Enter to send is now ON" : "Press Enter to send is now OFF (Enter creates newline)");
      return next;
    });
  };

  const datePickerRef = useRef(null);

  const handleJumpToDate = (e) => {
    const selectedDateStr = e.target.value;
    if (!selectedDateStr) return;
    const targetMsg = (messages || []).find((m) => {
      if (!m.created_at || deletedForMeIds.has(m.id)) return false;
      const d = new Date(m.created_at);
      if (isNaN(d.getTime())) return false;
      const dateIso = d.toISOString().slice(0, 10);
      return dateIso >= selectedDateStr;
    });

    if (targetMsg) {
      handleJumpToMessage(targetMsg.id);
      showToast(`Jumped to ${selectedDateStr}`);
    } else {
      showToast(`No messages found on or after ${selectedDateStr}`);
    }
  };

  const handleOpenMediaGallery = (mediaUrl) => {
    const idx = chatMediaList.findIndex((m) => m.attachment_url === mediaUrl);
    if (idx !== -1) {
      setGalleryMediaIndex(idx);
      setGalleryZoom(1);
    } else {
      setPreviewImage(mediaUrl);
    }
  };

  const handleClearChatConfirm = () => {
    const idsToClear = (messages || []).map((m) => m.id);
    setDeletedForMeIds((prev) => {
      const next = new Set(prev);
      idsToClear.forEach((id) => next.add(id));
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `texweb_deleted_for_me_${currentUser?.id || "anon"}`,
            JSON.stringify(Array.from(next))
          );
        }
      } catch {}
      return next;
    });
    setConfirmClearChatModal(false);
    showToast("Chat cleared successfully");
    if (openedFromChatOptions) {
      setOpenedFromChatOptions(false);
      setShowChatOptionsDropdown(true);
    }
  };

  const handleExportChat = () => {
    if (!messages || messages.length === 0) {
      showToast("No messages to export.");
      return;
    }
    const lines = [];
    lines.push(`=======================================================`);
    lines.push(`TexWeb Chat Transcript`);
    lines.push(`Chat: ${headerDetails.title || "Conversation"}`);
    lines.push(`Exported on: ${new Date().toLocaleString()}`);
    lines.push(`Total messages: ${messages.length}`);
    lines.push(`=======================================================\n`);

    messages.forEach((m) => {
      if (deletedForMeIds.has(m.id)) return;
      const dateStr = formatFullDateTime(m.created_at);
      const senderName =
        m.sender?.full_name ||
        m.sender_name ||
        (m.sender_id === currentUser?.id ? "You" : "User");

      let line = `[${dateStr}] ${senderName}: `;
      if (m.is_deleted_for_all) {
        line += "🚫 This message was deleted";
      } else {
        if (m.message) line += m.message;
        if (m.attachment_url) {
          line += ` [Attachment: ${m.attachment_name || m.attachment_type || "file"}] (${m.attachment_url})`;
        }
      }
      lines.push(line);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedTitle = (headerDetails.title || "chat").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.download = `${sanitizedTitle}_transcript.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Chat transcript exported successfully");
  };

  const searchMatchingIds = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return (messages || [])
      .filter((m) => !deletedForMeIds.has(m.id) && m.message && m.message.toLowerCase().includes(q))
      .map((m) => m.id);
  }, [messages, searchQuery, deletedForMeIds]);

  const handleNextSearchMatch = () => {
    if (searchMatchingIds.length === 0) return;
    const nextIdx = (searchMatchIndex + 1) % searchMatchingIds.length;
    setSearchMatchIndex(nextIdx);
    handleJumpToMessage(searchMatchingIds[nextIdx]);
  };

  const handlePrevSearchMatch = () => {
    if (searchMatchingIds.length === 0) return;
    const prevIdx = (searchMatchIndex - 1 + searchMatchingIds.length) % searchMatchingIds.length;
    setSearchMatchIndex(prevIdx);
    handleJumpToMessage(searchMatchingIds[prevIdx]);
  };

  // Dismiss dropdowns & reaction popups on document click outside, contextmenu outside, or scroll
  useEffect(() => {
    const handleDocClick = (e) => {
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      const isInsidePopover = path.some(
        (el) => el && el.getAttribute && (el.getAttribute("data-emoji-mart-popover") || el.getAttribute("data-emoji-trigger"))
      );
      if (
        isInsidePopover ||
        e.target.closest?.("[data-reaction-trigger]") ||
        e.target.closest?.("[data-dropdown-trigger]") ||
        e.target.closest?.("[data-reaction-strip]") ||
        e.target.closest?.("[data-dropdown-menu]") ||
        e.target.closest?.("[data-emoji-mart-popover]") ||
        e.target.closest?.("[data-emoji-trigger]")
      ) {
        return;
      }
      setActiveReactionMsgId(null);
      closeDropdown();
      setShowEmojiPicker(false);
      setReactionTargetMessage(null);
    };

    const handleDocContextMenu = (e) => {
      if (!e.target.closest?.('[data-message-bubble="true"]') && !e.target.closest?.('[data-dropdown-menu]')) {
        closeDropdown();
        setActiveReactionMsgId(null);
      }
    };

    const handleScroll = () => {
      closeDropdown();
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
  const mobileTextareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Monitor internal chat scroll to toggle floating scroll-down arrow
  const handleChatScroll = () => {
    if (activeDropdownMsgId || dropdownMenuState) {
      closeDropdown();
    }
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 140;
    setShowScrollBottomBtn((prev) => (prev !== isScrolledUp ? isScrolledUp : prev));
    if (!isScrolledUp) {
      setNewMessageCount((prev) => (prev !== 0 ? 0 : prev));
    }
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

  useEffect(() => {
    const timer = window.setInterval(() => setEditClock(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setNewMessageCount(0), 0);
    return () => window.clearTimeout(timer);
  }, [contact?.id, batch?.id]);

  useEffect(() => {
    if (!messages?.length) {
      previousMessageCountRef.current = 0;
      return;
    }

    const previousCount = previousMessageCountRef.current;
    const latest = messages[messages.length - 1];
    const isIncoming = latest?.sender_id && latest.sender_id !== currentUser?.id;
    const isScrolledUp = chatScrollRef.current
      ? chatScrollRef.current.scrollHeight - chatScrollRef.current.scrollTop - chatScrollRef.current.clientHeight > 140
      : false;

    if (messages.length > previousCount && isIncoming) {
      if (isScrolledUp) setNewMessageCount((count) => count + (messages.length - previousCount));
      if (!isChatMuted) {
        playWhatsAppChime();
        // Desktop background notification
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted" && document.hidden) {
          try {
            const senderName = latest?.sender_name || latest?.sender?.name || (contact?.name || "TexWeb Chat");
            const body = latest?.content || (latest?.attachments?.length ? "📎 Sent an attachment" : "New message");
            const notif = new Notification(senderName, {
              body: body.length > 100 ? body.slice(0, 97) + "..." : body,
              icon: "/favicon.ico",
              tag: `texweb-${latest?.id || Date.now()}`,
            });
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch {}
        }
      }
    }

    previousMessageCountRef.current = messages.length;
  }, [messages, currentUser?.id, isChatMuted, playWhatsAppChime, contact?.name]);

  // Automatically acknowledge delivery for unread incoming messages
  useEffect(() => {
    if (!messages?.length || !currentUser?.id) return;
    const undelivered = messages.filter(
      (m) => m.sender_id !== currentUser.id && !m.delivered_at && !m.is_read && !m.read_at && !m.receipts?.[currentUser.id]?.delivered_at
    );
    if (!undelivered.length) return;

    const unDeliveredIds = undelivered.map((m) => m.id);

    if (mode === "batch" && batch?.id) {
      getChatAuthHeaders().then((authHeaders) => fetch("/api/batch-workspace", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          type: "mark_delivered",
          batch_id: batch.id,
          message_ids: unDeliveredIds,
        }),
      })).catch(() => {});
    } else if (contact?.id && onMarkDelivered) {
      onMarkDelivered(contact.id);
    } else if (contact?.id) {
      getChatAuthHeaders().then((authHeaders) => fetch("/api/messages", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          type: "mark_delivered",
          sender_id: contact.id,
        }),
      })).catch(() => {});
    }
  }, [messages, currentUser?.id, mode, batch?.id, contact?.id, getChatAuthHeaders, onMarkDelivered]);

  const messageInfoId = messageInfoModal?.id;

  // Live polling for Message Info receipts when modal is open
  useEffect(() => {
    if (!messageInfoId) return;
    const interval = setInterval(async () => {
      try {
        if (mode === "batch" && batch?.id) {
          const authHeaders = await getChatAuthHeaders();
          const res = await fetch(`/api/batch-workspace?batch_id=${batch.id}`, { cache: "no-store", headers: authHeaders });
          if (res.ok) {
            const data = await res.json();
            const updatedMsg = (data.messages || []).find((m) => m.id === messageInfoId);
            if (updatedMsg) {
              setMessageInfoModal((prev) => (prev?.id === updatedMsg.id ? updatedMsg : prev));
            }
          }
        } else if (contact?.id) {
          const authHeaders = await getChatAuthHeaders();
          const res = await fetch(`/api/messages?contact_id=${contact.id}`, { cache: "no-store", headers: authHeaders });
          if (res.ok) {
            const data = await res.json();
            const updatedMsg = (data.messages || []).find((m) => m.id === messageInfoId);
            if (updatedMsg) {
              setMessageInfoModal((prev) => (prev?.id === updatedMsg.id ? updatedMsg : prev));
            }
          }
        }
      } catch (e) {
        console.warn("Live receipt poll error:", e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [messageInfoId, mode, batch?.id, contact?.id, getChatAuthHeaders]);

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
  }, [messages, deletedForMeIds]);

  // Filter messages based on disappearing messages timer & search query
  const filteredMessages = useMemo(() => {
    let list = displayMessages;
    if (disappearingTimer && disappearingTimer !== "off") {
      const msMap = {
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "90d": 90 * 24 * 60 * 60 * 1000,
      };
      const maxAgeMs = msMap[disappearingTimer];
      if (maxAgeMs) {
        const cutoff = Date.now() - maxAgeMs;
        list = list.filter((m) => {
          const time = new Date(m.created_at).getTime();
          return isNaN(time) || time >= cutoff;
        });
      }
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (m) =>
        m.message?.toLowerCase().includes(q) ||
        m.sender?.full_name?.toLowerCase().includes(q) ||
        m.attachment_name?.toLowerCase().includes(q)
    );
  }, [displayMessages, searchQuery, disappearingTimer]);

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
    handleInputTextChange(val);

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
    const el = getActiveComposerElement();
    if (el) {
      const currentText = getPlainTextFromEditor(el);
      const before = currentText.slice(0, mentionIndex);
      const updated = `${before}@${member.full_name} `;
      if (typeof el.value === "string") {
        el.value = updated;
      } else {
        el.innerText = updated;
      }
      handleInputTextChange(updated);
      el.focus();
    } else {
      const before = inputText.slice(0, mentionIndex);
      const updated = `${before}@${member.full_name} `;
      handleInputTextChange(updated);
    }
    setMentionQuery(null);
  };

  // ContentEditable Input Handler
  const handleContentEditableInput = () => {
    const el = getActiveComposerElement();
    if (!el) return;
    const text = getPlainTextFromEditor(el);
    setInputText(text);
    if (onTyping) onTyping(Boolean(text.trim()));

    // Mention detection
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const textBeforeCursor = text.slice(0, range.startOffset || text.length);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const query = textBeforeCursor.slice(lastAtIndex + 1);
        if (!query.includes(" ") && query.length <= 20) {
          setMentionQuery(query);
          setMentionIndex(lastAtIndex);
          return;
        }
      }
    }
    setMentionQuery(null);
  };

  // Reusable Stage Files Handler for manual upload, clipboard paste, and drag-and-drop
  const stageFiles = useCallback((rawFiles, type = "document") => {
    const filesArray = rawFiles ? Array.from(rawFiles) : [];
    if (!filesArray.length) return;

    const isMedia = type === "media";
    const newItems = filesArray.map((file) => {
      const isVideo = file.type?.startsWith("video/");
      const isAudio = file.type?.startsWith("audio/");
      const isPdf = file.name?.toLowerCase().endsWith(".pdf");
      const isImage = file.type?.startsWith("image/");

      let attachmentType = "document";
      if (isMedia || isImage || isVideo || isAudio) {
        attachmentType = isVideo ? "video" : isAudio ? "audio" : isImage ? "image" : isPdf ? "pdf" : "document";
      } else {
        attachmentType = isPdf ? "pdf" : "document";
      }

      let previewUrl = "";
      if (isImage || isVideo || isAudio) {
        try {
          previewUrl = URL.createObjectURL(file);
        } catch {
          previewUrl = "";
        }
      }

      const sizeStr = formatBytes(file.size);
      const displayName = sizeStr ? `${file.name} • ${sizeStr}` : file.name;

      return {
        id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name || "Pasted-Image.png",
        sizeStr,
        displayName,
        attachmentType,
        isMedia: isMedia || isImage || isVideo,
        isVideo,
        isAudio,
        isImage,
        previewUrl,
        type,
      };
    });

    if (showMediaPreviewModal) {
      setPendingMediaItems((prev) => [...prev, ...newItems]);
    } else {
      setPendingMediaItems(newItems);
      setActiveMediaIndex(0);
      setMediaCaption("");
      setShowMediaPreviewModal(true);
    }
  }, [showMediaPreviewModal]);

  // Drag and drop event handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const hasMedia = droppedFiles.some((f) => f.type?.startsWith("image/") || f.type?.startsWith("video/"));
      stageFiles(droppedFiles, hasMedia ? "media" : "document");
    }
  };

  // Global Keyboard Shortcuts (Ctrl+F, Ctrl+/, Esc, Left/Right for gallery)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ctrl+F or Cmd+F -> Toggle in-chat search
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === "f") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
        return;
      }

      // Ctrl+/ or Cmd+/ -> Toggle keyboard shortcuts modal
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowKeyboardShortcutsModal((prev) => !prev);
        return;
      }

      // Left / Right arrow navigation in fullscreen gallery
      if (galleryMediaIndex !== null) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setGalleryMediaIndex((i) => (i > 0 ? i - 1 : i));
          setGalleryZoom(1);
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          setGalleryMediaIndex((i) => (i < chatMediaList.length - 1 ? i + 1 : i));
          setGalleryZoom(1);
          return;
        }
      }

      // Esc -> Dismiss topmost active modal / drawer / overlay
      if (e.key === "Escape") {
        if (showKeyboardShortcutsModal) {
          setShowKeyboardShortcutsModal(false);
          return;
        }
        if (galleryMediaIndex !== null) {
          setGalleryMediaIndex(null);
          setGalleryZoom(1);
          return;
        }
        if (previewImage) {
          setPreviewImage(null);
          return;
        }
        if (showMediaPreviewModal) {
          handleCloseMediaPreviewModal();
          return;
        }
        if (showMembersDrawer) {
          setShowMembersDrawer(false);
          return;
        }
        if (showSearch) {
          setShowSearch(false);
          return;
        }
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
          return;
        }
        if (showLabelPickerModal) {
          setShowLabelPickerModal(false);
          return;
        }
        if (showMuteModal) {
          setShowMuteModal(false);
          return;
        }
        if (showChatOptionsDropdown) {
          setShowChatOptionsDropdown(false);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    showKeyboardShortcutsModal,
    galleryMediaIndex,
    previewImage,
    showMediaPreviewModal,
    showMembersDrawer,
    showSearch,
    showEmojiPicker,
    showLabelPickerModal,
    showMuteModal,
    showChatOptionsDropdown,
    chatMediaList?.length,
  ]);

  // ContentEditable Paste Handler (converts pasted emojis to Apple emoji images and stages pasted screenshots/files)
  const handleContentEditablePaste = (e) => {
    // 1. Check for pasted files or images (e.g. screenshots from Win+Shift+S or copied files)
    if (e.clipboardData) {
      const files = Array.from(e.clipboardData.files || []);
      if (files.length > 0) {
        e.preventDefault();
        const hasMedia = files.some((f) => f.type?.startsWith("image/") || f.type?.startsWith("video/"));
        stageFiles(files, hasMedia ? "media" : "document");
        return;
      }
      const items = Array.from(e.clipboardData.items || []);
      const fileItems = items.filter((it) => it.kind === "file");
      if (fileItems.length > 0) {
        const itemFiles = fileItems.map((it) => it.getAsFile()).filter(Boolean);
        if (itemFiles.length > 0) {
          e.preventDefault();
          const hasMedia = itemFiles.some((f) => f.type?.startsWith("image/") || f.type?.startsWith("video/"));
          stageFiles(itemFiles, hasMedia ? "media" : "document");
          return;
        }
      }
    }

    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    if (!text) return;

    const el = getActiveComposerElement();
    if (!el) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const fragment = document.createDocumentFragment();
    const parts = text.split(/(\p{Extended_Pictographic}+|\p{Emoji_Presentation}+)/gu);
    for (const part of parts) {
      if (!part) continue;
      const url = getAppleEmojiUrl(part);
      if (url) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = part;
        img.setAttribute("data-emoji", part);
        img.draggable = false;
        img.className = "apple-emoji-inline inline-block select-none pointer-events-none";
        img.style.width = "20px";
        img.style.height = "20px";
        img.style.verticalAlign = "-0.22em";
        img.style.margin = "0 1.5px";
        fragment.appendChild(img);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    }

    range.insertNode(fragment);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    setInputText(getPlainTextFromEditor(el));
  };

  // Send text message
  const handleSend = async (e) => {
    e?.preventDefault();
    const composerEl = getActiveComposerElement();
    const text = (composerEl ? getPlainTextFromEditor(composerEl) : inputText).trim();
    if (!text && !uploadingFile) return;

    if (editingMessage) {
      if (onEditMessage && canEditMessage(editingMessage)) {
        const saved = await onEditMessage(editingMessage.id, text);
        if (saved !== false) {
          setEditingMessage(null);
          setComposerText("");
        }
      }
      return;
    }

    const payload = {
      message: text,
      reply_to_id: replyingTo?.id || null,
      reference_type: "none",
      reference_id: null,
    };

    [textareaRef.current, mobileTextareaRef.current].forEach((el) => {
      if (!el) return;
      if (typeof el.value === "string") {
        el.value = "";
      } else {
        el.innerHTML = "";
      }
    });
    setInputText("");
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(draftKey);
        window.dispatchEvent(new Event("texweb_draft_updated"));
      }
    } catch {}
    if (onTyping) onTyping(false);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachmentTray(false);

    if (onSendMessage) {
      const sent = await onSendMessage(payload);
      if (sent !== false && onTyping) onTyping(false);
    }
  };


  // Send with custom attachment payload
  const handleSendAttachment = async (attachmentPayload) => {
    setShowAttachmentTray(false);
    setReplyingTo(null);

    if (onSendMessage) {
      const sent = await onSendMessage({
        message: attachmentPayload.message || "",
        reply_to_id: replyingTo?.id || null,
        ...attachmentPayload,
      });
      if (sent !== false && onTyping) onTyping(false);
    }
  };

  // Direct File Upload handler (Media or Document) - Previews first before sending
  const handleFileUpload = async (e, type = "document") => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (!rawFiles.length) return;
    e.target.value = "";
    stageFiles(rawFiles, type);
  };

  // Close media preview modal and clean up object URLs
  const handleCloseMediaPreviewModal = () => {
    pendingMediaItems.forEach((it) => {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    });
    setPendingMediaItems([]);
    setMediaCaption("");
    setShowMediaPreviewModal(false);
  };

  // Remove single item from media preview filmstrip
  const handleRemovePendingMediaItem = (index) => {
    const itemToRemove = pendingMediaItems[index];
    if (itemToRemove?.previewUrl) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }
    const updated = pendingMediaItems.filter((_, i) => i !== index);
    if (updated.length === 0) {
      handleCloseMediaPreviewModal();
      return;
    }
    setPendingMediaItems(updated);
    if (activeMediaIndex >= updated.length) {
      setActiveMediaIndex(updated.length - 1);
    }
  };

  // Send pending media queue with caption
  const handleSendPendingMedia = async () => {
    if (!pendingMediaItems.length || isUploadingMediaQueue) return;
    setIsUploadingMediaQueue(true);

    try {
      const caption = mediaCaption.trim();
      const currentBatchId = batch?.id || (contact?.id ? `direct-${contact.id}` : "general");
      const total = pendingMediaItems.length;

      for (let i = 0; i < total; i++) {
        const item = pendingMediaItems[i];
        let fileUrl = "";

        const basePercent = Math.round((i / total) * 100);
        setUploadProgress({
          percent: Math.min(95, basePercent + 15),
          text: `Uploading ${i + 1} of ${total}: ${item.name}`,
        });

        // 1. Upload to Supabase Storage
        const uploadRes = await uploadBatchFile(item.file, currentBatchId);
        setUploadProgress({
          percent: Math.min(98, Math.round(((i + 0.85) / total) * 100)),
          text: `Processing ${item.name}...`,
        });

        if (uploadRes?.file_url) {
          fileUrl = uploadRes.file_url;
        } else if (item.file.size <= 2 * 1024 * 1024) {
          // Small file fallback to base64
          fileUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(item.file);
          });
        }

        if (!fileUrl) {
          console.error(`Could not upload ${item.name}`);
          continue;
        }

        // WhatsApp Style: Caption is attached to the first item (or the single item)
        const messageText = i === 0 ? caption : "";

        await handleSendAttachment({
          message: messageText,
          attachment_url: fileUrl,
          attachment_name: item.displayName,
          attachment_type: item.attachmentType,
          reference_type: "none",
        });

        setUploadProgress({
          percent: Math.round(((i + 1) / total) * 100),
          text: `Uploaded ${i + 1} of ${total}`,
        });
      }

      // Cleanup object URLs
      pendingMediaItems.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      });
      setPendingMediaItems([]);
      setMediaCaption("");
      setShowMediaPreviewModal(false);
    } catch (err) {
      console.error("Error sending media queue:", err);
    } finally {
      setIsUploadingMediaQueue(false);
      setUploadProgress(null);
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

  const handleStartEdit = (msg) => {
    if (!canEditMessage(msg)) return;
    setEditingMessage(msg);
    setActiveDropdownMsgId(null);
    setReplyingTo(null);
    setComposerText(msg.message || "");
  };

  const handleStartRecording = async (mode = "audio") => {
    if (recordingMode || isUploadingVoice) return;

    if (!navigator?.mediaDevices?.getUserMedia) {
      showToast("Voice recording requires microphone permissions and a secure HTTPS/localhost connection.");
      return;
    }

    try {
      isDiscardedRef.current = false;
      setRecordingSeconds(0);
      setShowMicHelpModal(false);
      setChatToast((curr) => (curr?.scope === "microphone" ? null : curr));
      await refreshMediaPermissionState();

      const stream = await requestChatMediaStream(mode);
      mediaStreamRef.current = stream;

      // Detect best supported MIME type across browsers (Chrome, Safari, Firefox, Edge)
      let chosenMimeType = "";
      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/mp4",
        "audio/aac",
      ];
      if (typeof MediaRecorder !== "undefined") {
        for (const cand of candidates) {
          if (MediaRecorder.isTypeSupported(cand)) {
            chosenMimeType = cand;
            break;
          }
        }
      }

      mediaChunksRef.current = [];
      const options = chosenMimeType ? { mimeType: chosenMimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          mediaChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all audio/video tracks to release mic/camera hardware
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        // If user cancelled/discarded, do not upload
        if (isDiscardedRef.current) {
          mediaChunksRef.current = [];
          setRecordingMode(null);
          setRecordingSeconds(0);
          return;
        }

        const chunks = mediaChunksRef.current;
        if (!chunks.length) {
          setRecordingMode(null);
          setRecordingSeconds(0);
          return;
        }

        const actualType = recorder.mimeType || chosenMimeType || "audio/webm";
        const blob = new Blob(chunks, { type: actualType });

        if (blob.size < 100) {
          showToast("Voice recording was too short.");
          setRecordingMode(null);
          setRecordingSeconds(0);
          return;
        }

        setIsUploadingVoice(true);
        try {
          const ext = actualType.includes("mp4") ? "mp4" : actualType.includes("ogg") ? "ogg" : "webm";
          const fileName = `voice_${Date.now()}.${ext}`;
          const voiceFile = new File([blob], fileName, { type: actualType });

          const currentBatchId = batch?.id || (contact?.id ? `direct-${contact.id}` : "general");
          const uploadRes = await uploadBatchFile(voiceFile, currentBatchId);

          if (uploadRes?.file_url) {
            await handleSendAttachment({
              message: "",
              attachment_url: uploadRes.file_url,
              attachment_name: `Voice note (${formatSecs(recordingSeconds)})`,
              attachment_type: "audio",
              reference_type: "none",
            });
          } else {
            showToast("Failed to upload voice message. Please check storage bucket configuration.");
          }
        } catch (uploadErr) {
          console.error("Voice upload error:", uploadErr);
          showToast("Failed to send voice message: " + (uploadErr.message || "Network error"));
        } finally {
          setIsUploadingVoice(false);
          setRecordingMode(null);
          setRecordingSeconds(0);
          mediaChunksRef.current = [];
        }
      };

      recorder.start(250); // Emit chunk every 250ms
      setRecordingMode(mode);

      // Start elapsed recording timer
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Microphone access error:", err);
      await refreshMediaPermissionState();
      if (isPermissionDeniedError(err)) {
        setShowMicHelpModal(true);
        showToast({
          title: "Microphone Access Blocked",
          message: "Allow microphone from the browser URL bar, then tap Try Again. No page reload needed.",
          action: "retry-mic",
          scope: "microphone",
          sticky: true,
        });
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        showToast({
          title: "No Microphone Detected",
          message: "No microphone device was detected on your computer. Please connect a headset or mic.",
        });
      } else {
        showToast({
          title: "Microphone Error",
          message: describeMediaError(err, "microphone"),
        });
      }
      setRecordingMode(null);
      setRecordingSeconds(0);
    }
  };

  const handleCancelRecording = () => {
    isDiscardedRef.current = true;
    setIsLockedRecording(false);
    setIsRecordingPaused(false);
    if (voicePreviewUrl) {
      URL.revokeObjectURL(voicePreviewUrl);
      setVoicePreviewUrl(null);
    }
    setIsPlayingVoicePreview(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setRecordingMode(null);
    setRecordingSeconds(0);
    mediaChunksRef.current = [];
  };

  const handleStopAndSendVoice = () => {
    isDiscardedRef.current = false;
    setIsLockedRecording(false);
    setIsRecordingPaused(false);
    if (voicePreviewUrl) {
      URL.revokeObjectURL(voicePreviewUrl);
      setVoicePreviewUrl(null);
    }
    setIsPlayingVoicePreview(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  const handleTogglePauseRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    if (recorder.state === "recording") {
      try {
        recorder.pause();
      } catch {}
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecordingPaused(true);

      // Create preview audio URL from recorded chunks
      try {
        const actualType = recorder.mimeType || "audio/webm";
        const previewBlob = new Blob(mediaChunksRef.current, { type: actualType });
        if (previewBlob.size > 0) {
          if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
          const url = URL.createObjectURL(previewBlob);
          setVoicePreviewUrl(url);
        }
      } catch {}
    } else if (recorder.state === "paused") {
      if (voicePreviewAudioRef.current) {
        voicePreviewAudioRef.current.pause();
        setIsPlayingVoicePreview(false);
      }
      if (voicePreviewUrl) {
        URL.revokeObjectURL(voicePreviewUrl);
        setVoicePreviewUrl(null);
      }
      try {
        recorder.resume();
      } catch {}
      setIsRecordingPaused(false);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const handleTogglePlayVoicePreview = () => {
    if (!voicePreviewAudioRef.current || !voicePreviewUrl) return;
    if (isPlayingVoicePreview) {
      voicePreviewAudioRef.current.pause();
      setIsPlayingVoicePreview(false);
    } else {
      voicePreviewAudioRef.current.play()
        .then(() => setIsPlayingVoicePreview(true))
        .catch(() => setIsPlayingVoicePreview(false));
    }
  };

  // Jump to original replied-to message with smooth scroll & brief highlight flash
  const handleJumpToMessage = (targetId) => {
    if (!targetId) return;
    const el = document.getElementById(`msg-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const bubble = el.querySelector('[data-message-bubble="true"]') || el;
      bubble.classList.add("ring-2", "ring-red-500", "ring-offset-2", "scale-[1.02]", "transition-all", "duration-300");
      setTimeout(() => {
        bubble.classList.remove("ring-2", "ring-red-500", "ring-offset-2", "scale-[1.02]");
      }, 1600);
    } else {
      showToast("Original message is further up in history.");
    }
  };

  // Copy text to clipboard (Safe with fallback and error handling)
  const handleCopyMessage = async (msg) => {
    const text = msg.message || "";
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      try {
        const temp = document.createElement("textarea");
        temp.value = text;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      } catch (e) {
        console.warn("Clipboard copy fallback failed:", e);
      }
    }
    setCopiedId(msg.id);
    showToast("Message copied to clipboard");
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Quick Emoji Click from picker (inserts Apple Emoji image into editor)
  const handleInsertEmoji = (emoji) => {
    const el = getActiveComposerElement();
    if (!el) {
      setInputText((prev) => prev + emoji);
      return;
    }

    el.focus();
    if (typeof el.value === "string") {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? start;
      const next = `${el.value.slice(0, start)}${emoji}${el.value.slice(end)}`;
      el.value = next;
      setInputText(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + emoji.length;
        el.setSelectionRange(pos, pos);
      });
      return;
    }

    const url = getAppleEmojiUrl(emoji);
    const sel = window.getSelection();
    let range = null;

    if (sel && sel.rangeCount > 0) {
      const currentRange = sel.getRangeAt(0);
      if (el.contains(currentRange.commonAncestorContainer)) {
        range = currentRange;
      }
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    range.deleteContents();

    let nodeToInsert;
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = emoji;
      img.setAttribute("data-emoji", emoji);
      img.draggable = false;
      img.className = "apple-emoji-inline inline-block select-none pointer-events-none";
      img.style.width = "20px";
      img.style.height = "20px";
      img.style.verticalAlign = "-0.22em";
      img.style.margin = "0 1.5px";
      nodeToInsert = img;
    } else {
      nodeToInsert = document.createTextNode(emoji);
    }

    range.insertNode(nodeToInsert);

    // Place caret after inserted emoji
    range.setStartAfter(nodeToInsert);
    range.setEndAfter(nodeToInsert);
    sel.removeAllRanges();
    sel.addRange(range);

    const updatedText = getPlainTextFromEditor(el);
    setInputText(updatedText);
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

  // Copy selected messages (Safe with fallback and error handling)
  const handleCopySelected = async () => {
    const selectedMsgs = (messages || []).filter((m) => selectedMsgIds.has(m.id));
    const textToCopy = selectedMsgs.map((m) => m.message || "").join("\n");
    if (textToCopy) {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          throw new Error("Clipboard API unavailable");
        }
      } catch {
        try {
          const temp = document.createElement("textarea");
          temp.value = textToCopy;
          temp.style.position = "fixed";
          temp.style.opacity = "0";
          document.body.appendChild(temp);
          temp.focus();
          temp.select();
          document.execCommand("copy");
          document.body.removeChild(temp);
        } catch (e) {
          console.warn("Clipboard copy fallback failed:", e);
        }
      }
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
    if (!targetIds.length) {
      setDeleteModalOpen(false);
      return;
    }

    // WhatsApp UX: Close modal and reset target state IMMEDIATELY so it never lingers or switches view during async API call
    setDeleteModalOpen(false);
    setDeleteTargetMessages([]);
    setIsSelectionMode(false);
    setSelectedMsgIds(new Set());

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

  // Effective batch members: ensures the current logged-in user is ALWAYS included and sorted to the top (like WhatsApp "You")
  const effectiveBatchMembers = useMemo(() => {
    const list = [...(batchMembers || [])];
    const myId = currentUser?.id || currentProfile?.id;
    if (myId) {
      const existingIdx = list.findIndex((m) => m.id === myId);
      const myObj = {
        id: myId,
        full_name: currentProfile?.full_name || currentUser?.user_metadata?.full_name || "You",
        email: currentProfile?.email || currentUser?.email || "",
        role: currentProfile?.role || currentUser?.user_metadata?.role || "admin",
        avatar_url: currentProfile?.avatar_url || currentUser?.user_metadata?.avatar_url || null,
        batch_id: currentBatch?.id || null,
        isCurrentUser: true,
      };
      if (existingIdx === -1) {
        list.unshift(myObj);
      } else {
        list[existingIdx] = { ...list[existingIdx], ...myObj, isCurrentUser: true };
      }
    }
    // Sort so that the current user ("You") is always at the top (index 0), exactly like WhatsApp
    return list.sort((a, b) => {
      const aIsMe = a.id === myId;
      const bIsMe = b.id === myId;
      if (aIsMe) return -1;
      if (bIsMe) return 1;
      return (a.full_name || "").localeCompare(b.full_name || "");
    });
  }, [batchMembers, currentUser?.id, currentUser?.email, currentUser?.user_metadata, currentProfile, currentBatch?.id]);

  // Online member IDs set for quick lookup - current user viewing the chat is always counted as online
  const onlineMemberIds = useMemo(() => {
    const set = new Set(
      (effectiveBatchMembers || [])
        .filter((m) => (onlineUserIds || []).includes(m.id))
        .map((m) => m.id)
    );
    const myId = currentUser?.id || currentProfile?.id;
    if (myId) {
      set.add(myId);
    }
    return set;
  }, [effectiveBatchMembers, onlineUserIds, currentUser?.id, currentProfile?.id]);

  const onlineMembersCount = onlineMemberIds.size;

  // Header Title & Subtitle details
  const headerDetails = useMemo(() => {
    if (mode === "direct" && contact) {
      const isContactOnline = (onlineUserIds || []).includes(contact.id);
      return {
        title: contact.full_name || "Direct Chat",
        subtitle: `${ROLE_DISPLAY_NAMES[contact.role] || contact.role} • ${contact.batch_name || "Assigned"}`,
        avatarLetter: contact.full_name?.charAt(0)?.toUpperCase() || "U",
        avatarUrl: contact.avatar_url || null,
        isGroup: false,
        isOnline: isContactOnline,
      };
    }

    const myId = currentUser?.id || currentProfile?.id;
    const otherMembers = effectiveBatchMembers.filter((m) => m.id !== myId);
    const namesPreview = otherMembers.length > 0
      ? `You, ${otherMembers.slice(0, 3).map((m) => (m.full_name || "Member").split(" ")[0]).join(", ")}${otherMembers.length > 3 ? ` +${otherMembers.length - 3}` : ""}`
      : "You";

    return {
      title: currentBatch?.name || "Batch",
      subtitle: `${namesPreview} • ${effectiveBatchMembers.length} members • ${onlineMembersCount > 0 ? `${onlineMembersCount} online` : "offline"}`,
      avatarLetter: currentBatch?.name?.charAt(0)?.toUpperCase() || "B",
      avatarUrl: currentBatch?.avatar_url || null,
      isGroup: true,
      isOnline: onlineMembersCount > 0,
      onlineCount: onlineMembersCount,
    };
  }, [mode, contact, currentBatch, effectiveBatchMembers, onlineUserIds, onlineMembersCount, currentUser?.id, currentProfile]);

  const isHeaderOnline = headerDetails.isOnline;
  const typingLabel = typingUsers
    .filter((user) => user?.id !== currentUser?.id)
    .map((user) => user.name || user.full_name || "Member")
    .slice(0, 2)
    .join(", ");

  // Handler: Upload Group DP to Supabase storage (Admin/HR only)
  const handleGroupAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Immediate local preview so the user sees the photo right away
      try {
        const localPreview = URL.createObjectURL(file);
        setEditGroupAvatarUrl(localPreview);
        setGroupAvatarError(false);
      } catch (prevErr) {
        console.warn("Local preview error:", prevErr);
      }

      setIsSavingGroup(true);
      const res = await uploadBatchFile(file, currentBatch?.id || "batch");
      const finalUrl = typeof res === "string" ? res : (res?.file_url || res?.url || null);
      if (finalUrl) {
        setEditGroupAvatarUrl(finalUrl);
        setGroupAvatarError(false);
        showToast("Group photo uploaded! Click 'Save Changes' to update.");
      }
    } catch (err) {
      console.warn("Group avatar upload error:", err);
      showToast("Failed to upload group profile picture.");
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Handler: Save Group Name and DP (Admin/HR only)
  const handleSaveGroupInfo = async () => {
    if (!currentBatch?.id) return;
    const trimmedName = editGroupName.trim();
    if (!trimmedName) {
      showToast("Group name cannot be empty.");
      return;
    }
    setIsSavingGroup(true);
    try {
      let token = null;
      try {
        const sessionRes = await supabase?.auth?.getSession?.();
        token = sessionRes?.data?.session?.access_token;
      } catch (sessionErr) {
        console.warn("Could not retrieve session token:", sessionErr);
      }

      const finalAvatarUrl = typeof editGroupAvatarUrl === "string" && !editGroupAvatarUrl.startsWith("blob:")
        ? editGroupAvatarUrl.trim()
        : (typeof editGroupAvatarUrl?.file_url === "string" ? editGroupAvatarUrl.file_url : (currentBatch?.avatar_url || null));

      const res = await fetch("/api/batch-workspace", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: "update_batch_info",
          batch_id: currentBatch.id,
          name: trimmedName,
          avatar_url: finalAvatarUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.ok || data.batch)) {
        const updated = data.batch || { ...currentBatch, name: trimmedName, avatar_url: finalAvatarUrl };
        setCurrentBatch(updated);
        setIsEditingGroup(false);
        showToast("Group name and photo updated successfully!");
        try {
          if (onUpdateBatchInfo) onUpdateBatchInfo(updated);
        } catch (parentErr) {
          console.warn("onUpdateBatchInfo non-fatal error:", parentErr);
        }
        if (onRefresh) onRefresh();
      } else {
        showToast(data.error || "Failed to update group information.");
      }
    } catch (err) {
      console.warn("Save group info error:", err);
      showToast(err?.message || "Error updating group info.");
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Render floating non-clipped WhatsApp context dropdown (anchored directly to message)
  const renderFloatingDropdownMenu = () => {
    if (!dropdownMenuState || !dropdownMenuState.msg) return null;
    const msg = dropdownMenuState.msg;
    const isMine = msg.sender_id === currentUser?.id;
    const isStarred = starredMsgIds.has(msg.id);
    const isDeletedForAll =
      msg.message === "This message was deleted" ||
      msg.message === "You deleted this message" ||
      deletedForAllIds.has(msg.id) ||
      Boolean(msg.is_deleted);
    const msgReactions = reactionsByParentId[msg.id] || [];
    const myReaction = msgReactions.find((r) => r.sender_id === currentUser?.id);

    return (
      <div
        data-dropdown-menu="true"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: `${dropdownMenuState.top}px`,
          left: `${dropdownMenuState.left}px`,
          zIndex: 9999,
        }}
        className={`w-[268px] rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-2xl animate-scaleUp select-none text-left overflow-hidden divide-y divide-gray-100 dark:divide-[#3a3020]/70 ${dropdownMenuState.originClass}`}
      >
        {isDeletedForAll ? (
          <div className="p-1 space-y-0.5">
            {/* Select */}
            <button
              type="button"
              onClick={() => {
                setSelectedMsgIds(new Set([msg.id]));
                setIsSelectionMode(true);
                closeDropdown();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
            >
              <CheckSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span>Select</span>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                setSelectedMsgIds(new Set());
                setIsSelectionMode(false);
                setDeleteTargetMessages([msg]);
                setDeleteModalOpen(true);
                closeDropdown();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Delete</span>
            </button>
          </div>
        ) : (
          <>
            {/* 1. Quick Reactions Strip (WhatsApp Context Menu Header with Apple Emoji) */}
            <div className="px-2.5 py-2 flex items-center justify-between gap-0.5 bg-gray-50/70 dark:bg-slate-800/40">
              {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => {
                const isSelected = myReaction?.emoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendReaction(msg, emoji);
                      closeDropdown();
                    }}
                    className={`w-7.5 h-7.5 rounded-full flex items-center justify-center hover:scale-125 transition-transform cursor-pointer shrink-0 ${
                      isSelected ? "bg-black/10 dark:bg-white/20 scale-110 ring-1 ring-red-500" : ""
                    }`}
                    aria-label={`React ${emoji}`}
                  >
                    <AppleEmoji emoji={emoji} size={21} />
                  </button>
                );
              })}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenReactionInChatboxPicker(msg);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition shrink-0 ml-0.5"
                aria-label="More reactions"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* 2. Menu Actions List */}
            <div className="p-1 space-y-0.5">
              {/* Message info (Only for sender of message, exactly like WhatsApp) */}
              {isMine && (
                <button
                  type="button"
                  onClick={() => {
                    setMessageInfoModal(msg);
                    closeDropdown();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                >
                  <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                  <span>Message info</span>
                </button>
              )}

              {/* View votes (For Polls) */}
              {msg.attachment_type === "poll" && (
                <button
                  type="button"
                  onClick={() => {
                    setPollDetailsModal(msg);
                    closeDropdown();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                >
                  <BarChart2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>View votes</span>
                </button>
              )}

              {/* Reply */}
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(msg);
                  closeDropdown();
                  getActiveComposerElement()?.focus();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
              >
                <Reply className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>Reply</span>
              </button>

              {/* Copy */}
              <button
                type="button"
                onClick={() => {
                  handleCopyMessage(msg);
                  closeDropdown();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
              >
                {copiedId === msg.id ? (
                  <Check className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                )}
                <span>Copy</span>
              </button>

              {/* Edit */}
              {canEditMessage(msg) && onEditMessage && (
                <button
                  type="button"
                  onClick={() => {
                    handleStartEdit(msg);
                    closeDropdown();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                >
                  <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                  <span>Edit message</span>
                </button>
              )}

              {/* Forward */}
              <button
                type="button"
                onClick={() => {
                  setForwardTargetMessages([msg]);
                  setSelectedForwardTargets(new Set());
                  setForwardModalOpen(true);
                  closeDropdown();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
              >
                <Forward className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>Forward</span>
              </button>

              {/* Pin / Unpin */}
              {onPinMessage && canPinMessage(msg) && (
                <button
                  type="button"
                  onClick={() => {
                    onPinMessage(msg.id, !msg.is_pinned);
                    closeDropdown();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-amber-500 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400"
                >
                  <Pin className="w-4 h-4 shrink-0" />
                  <span>{msg.is_pinned ? "Unpin message" : "Pin message"}</span>
                </button>
              )}

              {/* Star / Unstar */}
              <button
                type="button"
                onClick={() => {
                  handleToggleStar(msg.id);
                  closeDropdown();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-amber-500 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
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
                  closeDropdown();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-500 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400"
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
                    closeDropdown();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100"
                >
                  <Download className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                  <span>Save as</span>
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMsgIds(new Set());
                  setIsSelectionMode(false);
                  setDeleteTargetMessages([msg]);
                  setDeleteModalOpen(true);
                  closeDropdown();
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
    );
  };

  return (
    <div
      ref={chatContainerRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 h-full max-h-full w-full overflow-hidden min-h-0 relative transition-colors ${
        isDark ? "bg-[#100f0b] text-[#f4ead2]" : "bg-[#f4eee6] text-gray-900"
      }`}
    >
      {/* Live Upload Progress Indicator */}
      {uploadProgress && (
        <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 bg-[#18150f]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-red-500/40 flex items-center gap-3 animate-fadeIn select-none">
          <div className="w-5 h-5 rounded-full border-2 border-red-500 border-t-transparent animate-spin shrink-0" />
          <div className="flex flex-col min-w-[140px]">
            <span className="text-xs font-bold text-red-100 truncate max-w-[220px]">{uploadProgress.text}</span>
            <div className="w-full h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress.percent}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-red-400 shrink-0">{uploadProgress.percent}%</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      {/* Photos & videos: images & videos for direct inline chat media */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e, "media")}
      />
      {/* Camera fallback input */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "media")}
      />
      {/* Document: any file (including original uncompressed photos & videos) */}
      <input
        type="file"
        ref={docInputRef}
        accept="*/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e, "document")}
      />

      {/* Dynamic Chat Wallpaper Background (WhatsApp Doodle, Minimal, AMOLED Dark, Warm Paper) */}
      {chatWallpaper === "doodle" && (
        <div
          className="absolute inset-0 pointer-events-none bg-repeat transition-opacity z-0 opacity-[0.06] dark:opacity-[0.045] dark:invert"
          style={{
            backgroundImage: "url('/tech-chat-doodle.svg')",
            backgroundSize: "360px 360px",
          }}
        />
      )}
      {chatWallpaper === "dark" && (
        <div className="absolute inset-0 pointer-events-none z-0 bg-[#070709]/95 dark:bg-[#050507]" />
      )}
      {chatWallpaper === "warm" && (
        <div
          className="absolute inset-0 pointer-events-none z-0 bg-[#fbf5e8]/90 dark:bg-[#1a1612]/90 bg-repeat"
          style={{
            backgroundImage: "url('/tech-chat-doodle.svg')",
            backgroundSize: "360px 360px",
            opacity: 0.035,
          }}
        />
      )}

      {/* Drag & Drop File Upload Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs pointer-events-none animate-in fade-in duration-150">
          <div className="p-8 rounded-3xl border-2 border-dashed border-red-500 bg-red-950/50 border-red-500/80 flex flex-col items-center max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-red-600/40 animate-bounce">
              <Paperclip className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Drop files here to send</h3>
            <p className="text-xs text-red-200/90 font-medium">Add photos, videos, voice notes or documents directly to this chat</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. WHATSAPP HEADER BAR (Pinned & Sticky at Top - Never scrolls)
          ========================================================================= */}
      <div className={`sticky top-0 px-3 sm:px-4 pt-[max(env(safe-area-inset-top),0.625rem)] pb-2.5 sm:pb-3 border-0 border-transparent flex items-center justify-between gap-2.5 z-30 shrink-0 backdrop-blur-md shadow-none ${isDark ? "bg-[#18150f]/95 text-[#f4ead2]" : "bg-white/95 text-gray-900"
        }`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile / Desktop Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-xl text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition cursor-pointer shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
          )}

          {/* Avatar */}
          <div className="relative shrink-0 cursor-pointer" onClick={() => setShowMembersDrawer(true)}>
            {(() => {
              const headerAvatarSrc = typeof headerDetails.avatarUrl === "string" && headerDetails.avatarUrl.trim() ? headerDetails.avatarUrl.trim() : null;
              if (headerAvatarSrc && !headerAvatarError) {
                return (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={headerAvatarSrc}
                    alt=""
                    onError={() => setHeaderAvatarError(true)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-red-500/30"
                  />
                );
              }
              return (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-none">
                  {headerDetails.isGroup ? <Users className="w-4 h-4 sm:w-5 sm:h-5" /> : headerDetails.avatarLetter}
                </div>
              );
            })()}
            {!headerDetails.isGroup && (
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#18150f] ${
                  headerDetails.isOnline ? "bg-amber-500" : "bg-gray-400"
                }`}
                title={headerDetails.isOnline ? "Online" : "Offline"}
              />
            )}
          </div>

          {/* Group / Contact Meta */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowMembersDrawer(true)}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5 min-w-0">
                <span className="truncate">{headerDetails.title}</span>
                {isChatArchived && (
                  <span className="p-0.5 px-1 rounded bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-bold flex items-center gap-0.5 shrink-0" title="Archived chat">
                    <Archive className="w-3 h-3" />
                    <span className="text-[9px]">Archived</span>
                  </span>
                )}
                {isChatMuted && (
                  <VolumeX className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" title="Notifications muted" />
                )}
                {disappearingTimer && disappearingTimer !== "off" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDisappearingModal(true);
                    }}
                    className="p-0.5 px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-0.5 shrink-0 hover:bg-amber-500/20 transition cursor-pointer"
                    title={`Disappearing messages: ${disappearingTimer}`}
                  >
                    <Clock className="w-3 h-3" />
                    <span className="text-[9px]">{disappearingTimer}</span>
                  </button>
                )}
                {activeChatLabel && (() => {
                  const lbl = CHAT_LABEL_PRESETS.find((p) => p.id === activeChatLabel);
                  return lbl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLabelPickerModal(true);
                      }}
                      className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold border shrink-0 cursor-pointer ${lbl.color}`}
                      title="Chat Label"
                    >
                      {lbl.name}
                    </button>
                  ) : null;
                })()}
              </h2>
              {headerDetails.isGroup && canAdminOrHrEditGroup && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditGroupName(currentBatch?.name || "");
                    setEditGroupAvatarUrl(currentBatch?.avatar_url || null);
                    setIsEditingGroup(true);
                    setShowMembersDrawer(true);
                  }}
                  className="p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer shrink-0"
                  title="Edit Group DP & Name (Admin/HR only)"
                  aria-label="Edit group profile"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
              {typingLabel ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{typingLabel} typing...</span>
              ) : headerDetails.isGroup ? (
                <span className="flex items-center gap-1.5 truncate">
                  <span className="truncate font-medium">{headerDetails.subtitle.split(" • ")[0]}</span>
                  <span>•</span>
                  <span className="shrink-0 font-semibold">{effectiveBatchMembers.length} members</span>
                  <span>•</span>
                  {onlineMembersCount > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {onlineMembersCount} online
                    </span>
                  ) : (
                    <span className="text-gray-400 shrink-0">offline</span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>{ROLE_DISPLAY_NAMES[contact?.role] || contact?.role || "Member"}</span>
                  <span>•</span>
                  {headerDetails.isOnline ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Online
                    </span>
                  ) : (
                    <span className="text-gray-400">Offline</span>
                  )}
                </span>
              )}
              {headerDetails.isGroup && <Info className="w-3 h-3 opacity-60 inline shrink-0" />}
            </p>
          </div>
        </div>

        {/* Action Controls - Clean 2-action header (Search & 3-Dots) giving full width to chat name */}
        <div className="flex items-center gap-1 shrink-0 text-gray-600 dark:text-gray-300">
          {/* Toggle Search */}
          <button
            type="button"
            onClick={() => {
              setShowSearch((prev) => !prev);
              if (showSearch) setSearchQuery("");
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer ${
              showSearch ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "hover:text-gray-900 dark:hover:text-white"
            }`}
            aria-label="Search in messages"
            title="Search messages"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* WhatsApp 3-Dots More Options Trigger */}
          <button
            type="button"
            onClick={() => setShowChatOptionsDropdown(true)}
            className="p-1.5 sm:p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            aria-label="More chat options"
            title="More options"
          >
            <MoreVertical className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          WHATSAPP RIGHT SIDEBAR SLIDE-OVER DRAWER (Chat Options & Settings Page)
          ========================================================================= */}
      {showChatOptionsDropdown && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs transition-opacity animate-fadeIn select-none"
          onClick={() => setShowChatOptionsDropdown(false)}
        >
          <div
            className={`w-full max-w-xs sm:max-w-sm h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Drawer Header */}
            <div className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 ${
              isDark ? "border-[#3a3020] bg-[#14120d]" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowChatOptionsDropdown(false)}
                  className="p-1 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                  title="Close options"
                  aria-label="Close"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate">Chat Options</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{headerDetails.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChatOptionsDropdown(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Drawer Content - Cleanly categorized cards */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
              {/* Category 1: Overview & Details */}
              <div className={`rounded-2xl border p-2 space-y-0.5 ${
                isDark ? "bg-[#1d1913] border-[#3a3020]" : "bg-gray-50/70 border-gray-200/80"
              }`}>
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Overview & Details
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setShowMembersDrawer(true);
                    setActiveInfoTab("info");
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">{headerDetails.isGroup ? "Group info & members" : "Contact info"}</div>
                      <div className="text-[10.5px] text-gray-400 truncate">View participants, roles & details</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setShowMembersDrawer(true);
                    setActiveInfoTab("media");
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-stone-500/10 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Media, links & docs</div>
                      <div className="text-[10.5px] text-gray-400 truncate">{chatMediaList.length} media • {chatDocsList.length} docs • {chatLinksList.length} links</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setShowMembersDrawer(true);
                    setActiveInfoTab("starred");
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Starred messages</div>
                      <div className="text-[10.5px] text-gray-400 truncate">{starredMessagesList.length} starred items</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </button>
              </div>

              {/* Category 2: Chat Tools & Preferences */}
              <div className={`rounded-2xl border p-2 space-y-0.5 ${
                isDark ? "bg-[#1d1913] border-[#3a3020]" : "bg-gray-50/70 border-gray-200/80"
              }`}>
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Chat Tools & Settings
                </div>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={() => handleRefresh()}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-gray-500/10 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Refresh chat</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Sync latest messages</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-gray-300 shrink-0">
                    {isRefreshing ? "Syncing..." : "Sync"}
                  </span>
                </button>

                {/* Screen Lock */}
                <button
                  type="button"
                  onClick={() => {
                    setShowChatOptionsDropdown(false);
                    window.dispatchEvent(new Event("texweb_draft_updated"));
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-gray-500/10 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Screen lock</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Lock chat with 4-digit PIN</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-gray-300 shrink-0">Lock</span>
                </button>

                {/* Text formatting toolbar toggle */}
                <button
                  type="button"
                  onClick={() => setShowFormattingToolbar((prev) => !prev)}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-serif font-bold text-xs">
                      T
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Text formatting toolbar</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Bold, italic, strike, code</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${showFormattingToolbar ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-stone-800 text-gray-600 dark:text-gray-400"}`}>
                    {showFormattingToolbar ? "ON" : "OFF"}
                  </span>
                </button>

                {/* Enter is send toggle */}
                <button
                  type="button"
                  onClick={() => toggleEnterIsSend()}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Enter is send</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Send message on Enter key</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${enterIsSend ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-stone-800 text-gray-600 dark:text-gray-400"}`}>
                    {enterIsSend ? "ON" : "OFF"}
                  </span>
                </button>

                {/* Mute notifications */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setShowMuteModal(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-gray-500/10 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                      <VolumeX className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Mute notifications</div>
                      <div className="text-[10.5px] text-gray-400 truncate">{isChatMuted ? "Muted" : "Active sound alerts"}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${isChatMuted ? "bg-amber-600 text-white" : "bg-gray-200 dark:bg-stone-800 text-gray-600 dark:text-gray-400"}`}>
                    {isChatMuted ? "MUTED" : "ACTIVE"}
                  </span>
                </button>

                {/* Wallpaper */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setShowWallpaperModal(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Chat wallpaper</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Theme, solid colors & doodles</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </button>

                {/* Desktop alerts */}
                <button
                  type="button"
                  onClick={() => requestDesktopNotifications()}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Desktop alerts</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Background tab push notifications</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                    desktopNotifState === "granted"
                      ? "bg-red-600 text-white"
                      : desktopNotifState === "denied"
                      ? "bg-red-900/60 text-red-300"
                      : "bg-gray-200 dark:bg-stone-800 text-gray-600 dark:text-gray-400"
                  }`}>
                    {desktopNotifState === "granted" ? "ON" : desktopNotifState === "denied" ? "BLOCKED" : "OFF"}
                  </span>
                </button>

                {/* Shortcuts */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setShowKeyboardShortcutsModal(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-gray-500/10 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                      <Keyboard className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Keyboard shortcuts</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Hotkeys for messaging navigation</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-gray-200 dark:bg-stone-800 text-gray-600 dark:text-gray-400 shrink-0">Ctrl+/</span>
                </button>

                {/* Chat Label */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setShowLabelPickerModal(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Chat label</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Color-coded business tag</div>
                    </div>
                  </div>
                  {activeChatLabel ? (() => {
                    const lbl = CHAT_LABEL_PRESETS.find((p) => p.id === activeChatLabel);
                    return lbl ? (
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold border shrink-0 ${lbl.color}`}>
                        {lbl.name}
                      </span>
                    ) : null;
                  })() : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                  )}
                </button>

                {/* Disappearing Messages */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setShowDisappearingModal(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Disappearing messages</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Auto-expiry timer</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">
                    {disappearingTimer === "off" ? "Off" : disappearingTimer}
                  </span>
                </button>
              </div>

              {/* Category 3: Actions & Privacy */}
              <div className={`rounded-2xl border p-2 space-y-0.5 ${
                isDark ? "bg-[#1d1913] border-[#3a3020]" : "bg-gray-50/70 border-gray-200/80"
              }`}>
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Actions & Privacy
                </div>

                {/* Export Chat */}
                <button
                  type="button"
                  onClick={() => {
                    setShowChatOptionsDropdown(false);
                    handleExportChat();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-gray-500/10 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Export chat transcript</div>
                      <div className="text-[10.5px] text-gray-400 truncate">Download text transcript</div>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>

                {/* Archive Chat */}
                <button
                  type="button"
                  onClick={() => {
                    setShowChatOptionsDropdown(false);
                    handleToggleArchiveChat();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-gray-500/10 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                      <Archive className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">{isChatArchived ? "Unarchive chat" : "Archive chat"}</div>
                      <div className="text-[10.5px] text-gray-400 truncate">{isChatArchived ? "Move back to active inbox" : "Hide from inbox list"}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${isChatArchived ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-stone-800 text-gray-600 dark:text-gray-400"}`}>
                    {isChatArchived ? "ARCHIVED" : "ACTIVE"}
                  </span>
                </button>

                {/* Block contact if direct */}
                {mode === "direct" && contact?.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowChatOptionsDropdown(false);
                      handleToggleBlockContact();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-500/10 text-red-600 dark:text-red-400 transition text-left cursor-pointer font-semibold"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                        <Ban className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate">{isContactBlocked ? "Unblock contact" : "Block contact"}</div>
                        <div className="text-[10.5px] opacity-80 truncate">{isContactBlocked ? "Allow messaging again" : "Stop receiving messages"}</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Clear Chat */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromChatOptions(true);
                    setShowChatOptionsDropdown(false);
                    setConfirmClearChatModal(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-red-500/10 text-red-600 dark:text-red-400 transition text-left cursor-pointer font-semibold"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">Clear chat history</div>
                      <div className="text-[10.5px] opacity-80 truncate">Delete all messages</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. SEARCH BAR (When active, with WhatsApp Match Navigator)
          ========================================================================= */}
      {showSearch && (
        <div className={`px-4 py-2 border-0 border-transparent flex items-center gap-2 z-10 animate-fadeIn ${isDark ? "bg-[#100f0b]" : "bg-white"
          }`}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversation..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchMatchIndex(0);
            }}
            className="flex-1 bg-transparent text-xs focus:outline-none placeholder-gray-400 dark:placeholder-slate-500"
            autoFocus
          />
          {searchQuery && (
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <span className="text-[10.5px] font-medium text-gray-500 dark:text-gray-400">
                {searchMatchingIds.length > 0 ? `${searchMatchIndex + 1} of ${searchMatchingIds.length}` : "0 matches"}
              </span>
              <button
                type="button"
                onClick={handlePrevSearchMatch}
                disabled={searchMatchingIds.length === 0}
                className="p-1 rounded-md text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 cursor-pointer transition"
                title="Previous match"
                aria-label="Previous match"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextSearchMatch}
                disabled={searchMatchingIds.length === 0}
                className="p-1 rounded-md text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 cursor-pointer transition"
                title="Next match"
                aria-label="Next match"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {/* Jump to Date Calendar Picker */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                if (datePickerRef.current) {
                  if (typeof datePickerRef.current.showPicker === "function") {
                    datePickerRef.current.showPicker();
                  } else {
                    datePickerRef.current.focus();
                  }
                }
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition"
              title="Jump to date"
              aria-label="Jump to date"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <input
              ref={datePickerRef}
              type="date"
              className="absolute inset-0 opacity-0 pointer-events-auto cursor-pointer w-full h-full"
              onChange={handleJumpToDate}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setShowSearch(false);
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer transition"
            aria-label="Close search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toast Notification Banner (Microphone permission, upload errors, etc.) */}
      {chatToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 max-w-[92%] sm:max-w-md bg-gray-900/95 backdrop-blur-md text-white text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-2.5 border border-white/10 animate-scaleUp">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-snug">
            {typeof chatToast === "string" ? (
              <span>{chatToast}</span>
            ) : (
              <>
                {chatToast.title && <div className="font-bold text-white text-xs sm:text-sm">{chatToast.title}</div>}
                <div className="text-gray-300 text-xs mt-0.5">{chatToast.message}</div>
                {chatToast.action === "retry-mic" && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartRecording("audio")}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm transition flex items-center gap-1.5"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Try Again</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChatToast(null);
                        setShowMicHelpModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition"
                    >
                      Help Guide
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setChatToast(null)}
            className="p-1 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          2B. WHATSAPP SELECTION ACTION BAR (When selection mode is active)
          ========================================================================= */}
      {isSelectionMode && (
        <div className={`px-4 py-2.5 border-0 border-transparent flex items-center justify-between gap-2 z-20 animate-fadeIn ${isDark ? "bg-[#18150f] text-[#f4ead2]" : "bg-white text-gray-900 shadow-sm"
          }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMsgIds(new Set());
              }}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
              aria-label="Close selection"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 cursor-pointer"
                aria-label="Copy selected text"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </button>

              <button
                type="button"
                disabled={selectedMsgIds.size === 0}
                onClick={handleOpenForwardSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 cursor-pointer"
                aria-label="Forward selected messages"
              >
                <Forward className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Forward</span>
              </button>

              <button
                type="button"
                disabled={selectedMsgIds.size === 0}
                onClick={handleOpenDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition disabled:opacity-40 cursor-pointer"
                aria-label="Delete selected messages"
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
        <div className={`px-4 py-2 border-0 border-transparent flex items-center justify-between gap-3 text-xs z-10 ${isDark ? "bg-[#182229] text-[#d1d7db]" : "bg-amber-50/90 text-amber-950"
          }`}>
          <div
            className="flex items-center gap-2 min-w-0 cursor-pointer"
            onClick={() => {
              const lastPinned = pinnedMessages[pinnedMessages.length - 1];
              if (lastPinned) {
                const el = document.getElementById(`msg-${lastPinned.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  el.classList.add("ring-2", "ring-amber-500", "ring-offset-2");
                  setTimeout(() => {
                    el.classList.remove("ring-2", "ring-amber-500", "ring-offset-2");
                  }, 2000);
                }
              }
            }}
          >
            <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400 mr-1.5 uppercase">
                Pinned Notice:
              </span>
              <span className="truncate text-xs">
                {pinnedMessages[pinnedMessages.length - 1].attachment_name || pinnedMessages[pinnedMessages.length - 1].message}
              </span>
            </div>
          </div>
          {canPinMessage(pinnedMessages[pinnedMessages.length - 1]) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPinMessage && onPinMessage(pinnedMessages[pinnedMessages.length - 1].id, false);
              }}
              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline shrink-0 cursor-pointer py-0.5 px-1"
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
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: isDark ? "rgba(255, 255, 255, 0.35) transparent" : "rgba(148, 163, 184, 0.55) transparent",
        }}
        className="texapp-message-scroll flex-1 min-h-0 p-3 sm:p-4 space-y-1 sm:space-y-1.5 relative z-10"
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
          <>
            {/* WhatsApp End-to-End Encryption Security Pill */}
            {!searchQuery && (
              <div className="w-full flex justify-center my-3 px-4 select-none relative z-10">
                <div className="max-w-md px-3.5 py-1.5 rounded-xl text-[11px] leading-relaxed text-center shadow-2xs border bg-amber-50/90 dark:bg-[#201c13]/90 text-amber-900/90 dark:text-amber-200/90 border-amber-200/70 dark:border-amber-900/40 backdrop-blur-xs flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 inline -mt-0.5" />
                  <span>Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</span>
                </div>
              </div>
            )}

            {/* WhatsApp Disappearing Messages Notice Pill */}
            {!searchQuery && disappearingTimer && disappearingTimer !== "off" && (
              <div className="w-full flex justify-center my-2 px-4 select-none relative z-10">
                <button
                  type="button"
                  onClick={() => setShowDisappearingModal(true)}
                  className="max-w-md px-3.5 py-1.5 rounded-xl text-[11px] leading-relaxed text-center shadow-2xs border bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 backdrop-blur-xs flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    Messages in this chat disappear after{" "}
                    <strong>
                      {disappearingTimer === "24h" ? "24 hours" : disappearingTimer === "7d" ? "7 days" : "90 days"}
                    </strong>
                    . Tap to change.
                  </span>
                </button>
              </div>
            )}

            {filteredMessages.map((msg, index) => {
            const isMine = msg.sender_id === currentUser?.id;
            const memberFromBatch = !isMine && (mode === "batch" || headerDetails.isGroup)
              ? batchMembers.find((m) => m.id === msg.sender_id)
              : null;
            const senderProfile = msg.sender || memberFromBatch || {};
            const senderFullName = senderProfile.full_name || memberFromBatch?.full_name || (mode === "direct" && contact ? contact.full_name : "Member");
            const senderAvatarUrl = senderProfile.avatar_url || memberFromBatch?.avatar_url || (mode === "direct" && contact ? contact.avatar_url : null);
            const senderInitial = (senderFullName?.charAt(0) || "U").toUpperCase();
            const senderRole = senderProfile.role || memberFromBatch?.role || "intern";
            const roleColor = ROLE_COLORS[senderRole] || "text-red-600";
            const showSenderHeader = !isMine && (headerDetails.isGroup || mode === "batch");

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
            const myReaction = msgReactions.find((r) => r.sender_id === currentUser?.id);

            const isMsgSelected = selectedMsgIds.has(msg.id);
            const isStarred = starredMsgIds.has(msg.id);
            const isDeletedForAll =
              msg.message === "This message was deleted" ||
              msg.message === "You deleted this message" ||
              deletedForAllIds.has(msg.id) ||
              Boolean(msg.is_deleted);
            const hasMediaAttachment = Boolean(
              msg.attachment_url &&
              (msg.attachment_type === "image" ||
               msg.attachment_type === "video")
            );
            const isDocAttachment = Boolean(
              msg.attachment_url &&
              (msg.attachment_type === "pdf" ||
               msg.attachment_type === "document")
            );
            const isAudioAttachment = Boolean(
              msg.attachment_url && msg.attachment_type === "audio"
            );

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
                  className={`w-full flex items-start gap-1.5 sm:gap-2 transition-all duration-200 ease-out ${
                    isMine ? "justify-end" : "justify-start"
                  } ${
                    isSelectionMode
                      ? "my-2.5 sm:my-3.5"
                      : msgReactions.length > 0
                      ? "mb-4 sm:mb-4.5"
                      : "mb-2 sm:mb-2.5"
                  }`}
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
                        <div className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-lg border-2 border-gray-400 dark:border-[#5a4a32] bg-white/80 dark:bg-[#18150f] hover:border-red-500 transition" />
                      )}
                    </div>
                  )}

                  {/* WhatsApp Group Sender Avatar (Left of incoming group message bubble) */}
                  {showSenderHeader && (
                    <div className="shrink-0 self-start mt-0.5 select-none">
                      {senderAvatarUrl ? (
                        <img
                          src={senderAvatarUrl}
                          alt={senderFullName}
                          className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full object-cover shadow-2xs ring-2 ring-red-500/25"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: senderAvatarUrl ? "none" : "flex" }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${getSenderAvatarGradient(msg.sender_id, senderFullName)} text-white font-black text-xs sm:text-[13px] items-center justify-center shadow-2xs ring-2`}
                      >
                        {senderInitial}
                      </div>
                    </div>
                  )}

                  {/* Strictly scoped wrapper: hover ONLY triggers when cursor is on the message or smiley */}
                  <div
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleSelectMessage(msg.id);
                      }
                    }}
                    className={`w-fit max-w-[85%] sm:max-w-[70%] inline-flex items-center gap-1.5 relative group/msg cursor-pointer ${
                      activeDropdownMsgId === msg.id ? "z-40" : "z-1"
                    } ${
                      isMine ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* 1. WhatsApp Compact Bubble Container with Swipe to Reply & Long Press */}
                    <div className="relative inline-block">
                      {/* WhatsApp Swipe to Reply Indicator */}
                      {swipeState.msgId === msg.id && swipeState.offset > 5 && (
                        <div
                          style={{
                            opacity: Math.min(1, swipeState.offset / 35),
                            transform: `scale(${Math.min(1, swipeState.offset / 35)}) translateY(-50%)`,
                          }}
                          className="absolute -left-9 top-1/2 w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 flex items-center justify-center shadow-xs pointer-events-none z-30 transition-transform"
                        >
                          <Reply className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}

                      <div
                        data-message-bubble="true"
                        style={{
                          transform:
                            swipeState.msgId === msg.id && swipeState.offset > 0
                              ? `translateX(${swipeState.offset}px)`
                              : undefined,
                          transition:
                            swipeState.msgId === msg.id && isDraggingSwipeRef.current
                              ? "none"
                              : "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          touchAction: "pan-y",
                        }}
                        onTouchStart={(e) => handleMessageTouchStart(e, msg, e.currentTarget)}
                        onTouchMove={(e) => handleMessageTouchMove(e, msg)}
                        onTouchEnd={(e) => handleMessageTouchEnd(e, msg)}
                        onTouchCancel={(e) => handleMessageTouchEnd(e, msg)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const chevronBtn = e.currentTarget.querySelector('[data-dropdown-trigger="true"]') || e.currentTarget;
                          handleOpenDropdown(msg, chevronBtn);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setReplyingTo(msg);
                          const el = getActiveComposerElement();
                          if (el) el.focus();
                        }}
                      className={`rounded-2xl ${
                        isDocAttachment && !msg.message && !replyMsg && !msg.is_pinned
                          ? (showSenderHeader ? "p-1 pb-0" : "p-0")
                          : isDocAttachment && msg.message && !replyMsg && !msg.is_pinned
                          ? (showSenderHeader ? "p-1 pb-1" : "p-0 pb-1")
                          : hasMediaAttachment && !msg.message && !replyMsg && !msg.is_pinned
                          ? (showSenderHeader ? "p-1 pb-1" : "p-[3px]")
                          : hasMediaAttachment && msg.message && !replyMsg && !msg.is_pinned
                          ? (showSenderHeader ? "p-1 pb-1" : "p-[3px] pb-1")
                          : isAudioAttachment
                          ? (showSenderHeader ? "p-1" : "p-0.5")
                          : (showSenderHeader ? "pt-0.5 px-2 pb-1 sm:px-2.5 sm:pb-1" : "px-2 py-1 sm:px-2.5 sm:py-1")
                      } shadow-2xs relative transition-all duration-200 border cursor-pointer ${
                        activeDropdownMsgId === msg.id ? "z-40" : ""
                      } ${
                        isMsgSelected ? "ring-2 ring-red-500 ring-offset-2 dark:ring-offset-[#100f0b]" : ""
                      } ${
                        isMine
                          ? "bg-red-50 text-gray-900 border-red-200/80 dark:bg-[#3a1715] dark:text-[#f4ead2] dark:border-[#5b241f] rounded-tr-none"
                          : "bg-white text-gray-900 border-gray-200/80 dark:bg-[#18150f] dark:text-[#f4ead2] dark:border-[#3a3020]/80 rounded-tl-none"
                      }`}
                    >
                      {/* WhatsApp Double-Tap Quick Heart Animation Pop */}
                      {doubleTapHeartMsgId === msg.id && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-scaleUp">
                          <span className="text-3xl sm:text-4xl drop-shadow-md animate-bounce">❤️</span>
                        </div>
                      )}
                      {/* WhatsApp Bubble Tail ("Choch" - Left pointing for incoming, Right pointing for outgoing) */}
                      {isMine ? (
                        <svg
                          viewBox="0 0 8 11"
                          width="8"
                          height="11"
                          className="absolute -right-2 top-0 pointer-events-none z-10 overflow-visible"
                          aria-hidden="true"
                        >
                          <polygon points="0,0 8,0 0,11" className="fill-red-50 dark:fill-[#3a1715]" />
                          <line x1="0" y1="0.5" x2="8" y2="0.5" className="stroke-red-200/80 dark:stroke-[#5b241f]" strokeWidth="1" />
                          <line x1="8" y1="0.5" x2="0" y2="11" className="stroke-red-200/80 dark:stroke-[#5b241f]" strokeWidth="1" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 8 11"
                          width="8"
                          height="11"
                          className="absolute -left-2 top-0 pointer-events-none z-10 overflow-visible"
                          aria-hidden="true"
                        >
                          <polygon points="8,0 0,0 8,11" className="fill-white dark:fill-[#18150f]" />
                          <line x1="8" y1="0.5" x2="0" y2="0.5" className="stroke-gray-200/80 dark:stroke-[#3a3020]/80" strokeWidth="1" />
                          <line x1="0" y1="0.5" x2="8" y2="11" className="stroke-gray-200/80 dark:stroke-[#3a3020]/80" strokeWidth="1" />
                        </svg>
                      )}
                      {/* WhatsApp Sender Name Header with Top-Right Chevron (On ALL message types: photo, video, document, poll, audio, text) */}
                      {showSenderHeader && !isDeletedForAll && (
                        <div className="flex items-center justify-between gap-2 px-1 pt-0.5 pb-0.5 select-none min-w-[110px]">
                          <span className={`text-[11.5px] sm:text-xs font-bold tracking-tight truncate ${getSenderNameColor(msg.sender_id, senderFullName, senderRole)}`}>
                            {senderFullName}
                          </span>
                          <button
                            type="button"
                            data-dropdown-trigger="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDropdown(msg, e.currentTarget);
                            }}
                            className="p-0.5 rounded opacity-0 group-hover/msg:opacity-100 text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer -mr-0.5"
                            aria-label="Message options"
                          >
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      )}

                      {/* Pinned Message Indicator */}
                      {msg.is_pinned && !isDeletedForAll && (
                        <div className="flex items-center gap-1 mb-0.5 text-[10px] font-bold text-amber-500">
                          <Pin className="w-2.5 h-2.5" />
                          <span>Pinned</span>
                        </div>
                      )}

                      {/* Quoted Reply Snippet (Click to jump to quoted message) */}
                      {!isDeletedForAll && replyMsg && (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJumpToMessage(msg.reply_to_id || replyMsg.id);
                          }}
                          className={`mb-1 py-1 px-2 rounded-lg border-l-[3px] border-red-500 text-[10px] sm:text-[10.5px] leading-tight opacity-95 cursor-pointer transition-all hover:opacity-100 hover:brightness-95 active:scale-[0.98] select-none ${
                            isMine ? "bg-black/5 text-gray-800 dark:bg-black/20 dark:text-white" : "bg-gray-100 dark:bg-black/30 text-gray-700 dark:text-gray-300"
                          }`}
                          title="Click to jump to quoted message"
                        >
                          <div className="font-semibold text-red-600 dark:text-red-400">
                            {replyMsg.sender?.full_name || "Quoted Message"}
                          </div>
                          <div className="truncate mt-0.5 text-[10px]">
                            {replyMsg.message || (replyMsg.attachment_url ? (replyMsg.attachment_type === "image" ? "📷 Photo" : replyMsg.attachment_type === "pdf" || replyMsg.attachment_type === "document" ? `📄 ${replyMsg.attachment_name || "Document"}` : "Attachment") : "")}
                          </div>
                        </div>
                      )}

                      {/* Attachment Previews */}
                      {!isDeletedForAll && msg.attachment_url && (
                        <div className={hasMediaAttachment || (isDocAttachment && !msg.message) ? "mb-0" : "mb-1.5"}>
                          {/* Image Thumbnail */}
                          {msg.attachment_type === "image" ? (
                            <div
                              className={`relative overflow-hidden cursor-pointer group/img select-none min-w-[150px] max-w-[250px] sm:max-w-[280px] ${
                                msg.message ? "rounded-t-[13px] rounded-b-[4px]" : "rounded-[13px]"
                              }`}
                              onClick={() => handleOpenMediaGallery(msg.attachment_url)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={msg.attachment_url}
                                alt={msg.attachment_name || "Image attachment"}
                                className={`block max-h-44 sm:max-h-52 w-auto max-w-full object-cover transition duration-200 hover:brightness-[0.98] ${
                                  msg.message ? "rounded-t-[13px] rounded-b-[4px]" : "rounded-[13px]"
                                }`}
                              />

                              {/* WhatsApp-Style Floating Timestamp on Photo Bottom-Right (When no text caption) */}
                              {!msg.message && (
                                <>
                                  {/* Subtle dark gradient overlay at bottom edge for 100% legibility on bright/white images */}
                                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none rounded-b-[13px]" />

                                  <div className="absolute bottom-1 right-2 z-10 flex items-center gap-1 text-[10px] text-white select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] font-normal leading-none">
                                    {isStarred && (
                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                                    )}
                                    <span>{formatMessageTime(msg.created_at)}</span>
                                    {isMine && <MessageStatusTick msg={msg} onMedia={true} />}
                                    {/* WhatsApp Dropdown Chevron Button */}
                                    {!showSenderHeader && (
                                      <button
                                        type="button"
                                        data-dropdown-trigger="true"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenDropdown(msg, e.currentTarget);
                                        }}
                                        className="p-0.5 rounded opacity-0 group-hover/msg:opacity-100 text-white/90 hover:text-white transition cursor-pointer -mr-0.5 ml-0.5"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : msg.attachment_type === "audio" ? (
                            <VoiceNoteBubble
                              msg={msg}
                              isMine={isMine}
                              isDark={isDark}
                              onOpenDropdown={handleOpenDropdown}
                            />
                          ) : msg.attachment_type === "video" ? (
                            <div className={`relative overflow-hidden min-w-[150px] max-w-[250px] sm:max-w-[280px] ${
                              msg.message ? "rounded-t-[13px] rounded-b-[4px]" : "rounded-[13px]"
                            }`}>
                              <video
                                controls
                                src={msg.attachment_url}
                                className={`max-h-44 sm:max-h-52 max-w-full block ${
                                  msg.message ? "rounded-t-[13px] rounded-b-[4px]" : "rounded-[13px]"
                                }`}
                              />
                              {!msg.message && (
                                <div className="absolute bottom-1.5 right-2 z-10 flex items-center gap-1 text-[10px] text-white bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full select-none">
                                  <span>{formatMessageTime(msg.created_at)}</span>
                                  {isMine && <MessageStatusTick msg={msg} onMedia={true} />}
                                </div>
                              )}
                            </div>
                          ) : msg.attachment_type === "pdf" || msg.attachment_type === "document" ? (
                            /* WhatsApp Document Card (Structure matching user sample, website color theme) */
                            (() => {
                              const docMeta = parseDocMeta(msg);
                              const isImageDoc = /\.(webp|png|jpe?g|gif|svg)$/i.test(docMeta.fileName);

                              return (
                                <div className="w-56 sm:w-64 max-w-[calc(100vw-4rem)] select-none">
                                  {/* Upper Document Info Row */}
                                  <div className="p-2 sm:p-2.5 flex items-start gap-2.5 relative">
                                    {/* Folded Document Icon with Extension Badge */}
                                    <div className="shrink-0 relative">
                                      <svg width="28" height="36" viewBox="0 0 36 44" fill="none" className="drop-shadow-xs">
                                        <path
                                          d="M0 5C0 2.23858 2.23858 0 5 0H24L36 12V39C36 41.7614 33.7614 44 31 44H5C2.23858 44 0 41.7614 0 39V5Z"
                                          fill="#dc2626"
                                        />
                                        <path d="M24 0V12H36L24 0Z" fill="#991b1b" />
                                        <text
                                          x="18"
                                          y="33"
                                          textAnchor="middle"
                                          fill="#FFFFFF"
                                          fontSize="9.5"
                                          fontWeight="bold"
                                          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                          letterSpacing="0.4"
                                        >
                                          {docMeta.iconLabel}
                                        </text>
                                      </svg>
                                    </div>

                                    {/* File Name & Subline (Extension • Size) */}
                                    <div className="min-w-0 flex-1 pr-12">
                                      <div
                                        className="font-medium text-[11px] sm:text-xs text-gray-900 dark:text-gray-100 truncate block leading-snug"
                                        title={docMeta.fileName}
                                      >
                                        {docMeta.fileName}
                                      </div>
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase font-mono mt-0.5 flex items-center gap-1 truncate">
                                        <span>{docMeta.extension}</span>
                                        {docMeta.sizeText && (
                                          <>
                                            <span className="opacity-50">•</span>
                                            <span>{docMeta.sizeText}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Timestamp & Status ticks at bottom-right of upper section */}
                                    <div className="absolute bottom-2 right-2.5 flex items-center gap-1 text-[9.5px] text-gray-500 dark:text-gray-400 select-none">
                                      {isStarred && (
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                                      )}
                                      <span>{formatMessageTime(msg.created_at)}</span>
                                      {isMine && <MessageStatusTick msg={msg} />}
                                    </div>
                                  </div>

                                  {/* Bottom Horizontal Action Bar: Open | Save as... */}
                                  <div className={`border-t flex items-center divide-x ${
                                    isMine
                                      ? "border-red-200/80 dark:border-[#5b241f] divide-red-200/80 dark:divide-[#5b241f] bg-red-100/40 dark:bg-black/25"
                                      : "border-gray-200/80 dark:border-white/10 divide-gray-200/80 dark:divide-white/10 bg-gray-50/70 dark:bg-white/5"
                                  }`}>
                                    {/* Open */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (msg.attachment_url) {
                                          if (isImageDoc) {
                                            handleOpenMediaGallery(msg.attachment_url);
                                          } else {
                                            window.open(msg.attachment_url, "_blank");
                                          }
                                        }
                                      }}
                                      className="flex-1 py-1.5 text-center text-[10.5px] sm:text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                                    >
                                      Open
                                    </button>

                                    {/* Save as... */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadAttachment(msg);
                                      }}
                                      className="flex-1 py-1.5 text-center text-[10.5px] sm:text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                                    >
                                      Save as...
                                    </button>
                                  </div>
                                </div>
                              );
                            })()
                          ) : msg.attachment_type === "location" || msg.message?.includes("📍 Live Location") ? (
                            /* WhatsApp Interactive Google Maps Location Card */
                            (() => {
                              const match = msg.message?.match(/https?:\/\/(?:www\.)?google\.com\/maps[^\s]+/);
                              const mapsUrl = match ? match[0] : (msg.attachment_url || "https://maps.google.com");
                              const coordsMatch = msg.message?.match(/([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)/);
                              const coordsText = coordsMatch ? `${coordsMatch[1]}, ${coordsMatch[2]}` : "Live Pinned Location";

                              return (
                                <div className="w-56 sm:w-64 max-w-[calc(100vw-4rem)] rounded-xl overflow-hidden select-none">
                                  <div className="h-24 bg-gradient-to-br from-red-950 via-stone-900 to-slate-900 relative flex items-center justify-center p-3 text-center overflow-hidden border-b border-black/10">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                                    <div className="relative z-10 flex flex-col items-center">
                                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 animate-bounce mb-1">
                                        <MapPin className="w-4 h-4 fill-white" />
                                      </div>
                                      <span className="text-[11px] font-bold text-white tracking-wide">Live Location</span>
                                      <span className="text-[9.5px] text-amber-100/90 font-mono mt-0.5">{coordsText}</span>
                                    </div>
                                  </div>

                                  <div className="p-2 bg-black/5 dark:bg-white/5 flex items-center justify-between gap-2">
                                    <span className="text-[10.5px] font-medium text-gray-700 dark:text-gray-300 truncate">
                                      Google Maps
                                    </span>
                                    <a
                                      href={mapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-bold flex items-center gap-1 shrink-0 transition shadow-xs cursor-pointer"
                                    >
                                      <span>Open</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              );
                            })()
                          ) : msg.attachment_type?.startsWith("link_") ? (
                            /* Smart Link Card */
                            <a
                              href={safeExternalUrl(msg.attachment_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 hover:opacity-90 transition"
                            >
                              <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                {msg.attachment_type === "link_github" ? (
                                  <Folder className="w-3.5 h-3.5" />
                                ) : msg.attachment_type === "link_figma" ? (
                                  <Globe className="w-3.5 h-3.5" />
                                ) : (
                                  <ExternalLink className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs truncate text-red-600 dark:text-red-400">
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
                        <div className="mb-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">
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
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 shrink-0"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      )}

                      {/* Meeting Reference Card */}
                      {!isDeletedForAll && msg.reference_type === "meeting" && (
                        <div className="mb-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Video className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">
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
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 shrink-0"
                            >
                              Join
                            </a>
                          )}
                        </div>
                      )}

                      {/* WhatsApp Message Content with Inline Float Timestamp */}
                      {!isDeletedForAll && msg.attachment_type === "poll" ? (
                        (() => {
                          let pollData = optimisticVotes[msg.id];
                          if (!pollData) {
                            try {
                              pollData = typeof msg.message === "string" ? JSON.parse(msg.message) : msg.message;
                            } catch {
                              pollData = null;
                            }
                          }
                          const question = pollData?.question || msg.attachment_name || "Poll";
                          const options = Array.isArray(pollData?.options) ? pollData.options : [];
                          const allowMultiple = Boolean(pollData?.allow_multiple);
                          const totalVotes = options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);

                          return (
                            <div className="w-52 sm:w-60 max-w-full space-y-1.5 py-0.5">
                              {/* Poll Header */}
                              <div>
                                <div className="font-bold text-[12px] sm:text-[12.5px] text-gray-950 dark:text-white leading-snug break-words">
                                  <RenderWithAppleEmojis text={question} />
                                </div>
                                <div className="text-[9.5px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                  {allowMultiple ? "Select one or more" : "Select one"}
                                </div>
                              </div>

                              {/* Options List */}
                              <div className="space-y-1">
                                {options.map((opt) => {
                                  const votesCount = opt.votes?.length || 0;
                                  const pct = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                                  const hasVoted = Boolean(
                                    opt.votes?.some((v) => (typeof v === "string" ? v === currentUser?.id : v?.id === currentUser?.id))
                                  );

                                  return (
                                    <div
                                      key={opt.id}
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVotePoll(msg, opt.id);
                                      }}
                                      className={`relative overflow-hidden rounded-lg border p-1.5 px-2 flex items-center justify-between gap-2 transition cursor-pointer select-none ${
                                        hasVoted
                                          ? "border-red-600/70 dark:border-red-500/70 bg-red-500/10 dark:bg-red-500/15 font-semibold"
                                          : "border-gray-200 dark:border-[#3a3020] hover:bg-black/5 dark:hover:bg-white/5"
                                      }`}
                                    >
                                      {/* Progress Fill Bar */}
                                      <div
                                        className="absolute inset-0 bg-red-500/20 dark:bg-red-400/25 transition-all duration-300 pointer-events-none"
                                        style={{ width: `${pct}%` }}
                                      />

                                      {/* Check/Radio + Option Text with Apple Emoji */}
                                      <div className="relative z-10 flex items-center gap-1.5 min-w-0 flex-1">
                                        {allowMultiple ? (
                                          <div
                                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                              hasVoted
                                                ? "bg-red-600 border-red-600 text-white"
                                                : "border-gray-400 dark:border-gray-500"
                                            }`}
                                          >
                                            {hasVoted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                          </div>
                                        ) : (
                                          <div
                                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                              hasVoted
                                                ? "border-red-600 dark:border-red-400"
                                                : "border-gray-400 dark:border-gray-500"
                                            }`}
                                          >
                                            {hasVoted && <div className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />}
                                          </div>
                                        )}
                                        <span className="text-[11px] sm:text-[11.5px] truncate text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                          <RenderWithAppleEmojis text={opt.text} />
                                        </span>
                                      </div>

                                      {/* Vote count */}
                                      <div className="relative z-10 text-[9.5px] font-bold text-gray-500 dark:text-gray-400 shrink-0">
                                        {votesCount}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Poll Footer with View Votes button */}
                              <div className="pt-1 border-t border-black/5 dark:border-white/10 flex items-center justify-between select-none">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPollDetailsModal(msg);
                                  }}
                                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <BarChart2 className="w-3 h-3" />
                                  <span>View votes</span>
                                </button>
                                <div className="flex items-center gap-1 text-[9.5px] text-gray-500 dark:text-gray-400">
                                  <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
                                  <span>•</span>
                                  <span>{formatMessageTime(msg.created_at)}</span>
                                  {isMine && <MessageStatusTick msg={msg} />}
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : isDeletedForAll ? (
                        <div className={`flex items-center gap-1.5 py-0.5 text-xs italic select-none ${
                          isMine ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                        }`}>
                          <Ban className="w-3.5 h-3.5 stroke-[2] shrink-0 opacity-80" />
                          <span>{isMine ? "You deleted this message" : "This message was deleted"}</span>
                          <span className="text-[10px] ml-2 opacity-70 not-italic select-none shrink-0">
                            {formatMessageTime(msg.created_at)}
                          </span>
                          {/* WhatsApp Dropdown Chevron Button on Hover for Deleted Messages */}
                          <button
                            type="button"
                            data-dropdown-trigger="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDropdown(msg, e.currentTarget);
                            }}
                            className="p-0.5 rounded opacity-0 group-hover/msg:opacity-100 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer -mr-0.5 ml-1.5"
                          >
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (hasMediaAttachment && !msg.message) || (isDocAttachment && !msg.message) || (isAudioAttachment && (!msg.message || msg.message === "Voice message")) ? null : (
                        <div
                          className={`${
                            hasMediaAttachment
                              ? "px-1.5 pt-1 pb-0.5 sm:px-2 sm:pt-1.5 sm:pb-0.5 text-[11px] sm:text-[12px] leading-snug"
                              : isDocAttachment
                              ? "px-2.5 pt-1.5 pb-1 text-[11px] sm:text-[12px] leading-snug"
                              : isAudioAttachment
                              ? "px-2.5 pt-1 pb-1 text-[11px] sm:text-[12px] leading-snug"
                              : "text-[11.5px] sm:text-[12px] leading-snug"
                          } break-words`}
                        >
                          <span className="whitespace-pre-wrap font-normal text-gray-900 dark:text-[#f4ead2]">
                            <RenderWithAppleEmojis text={msg.message} />
                          </span>

                          {/* WhatsApp Auto Link Preview Card */}
                          {(() => {
                            const detectedUrl = extractFirstUrl(msg.message);
                            if (!detectedUrl) return null;
                            const domain = getHostname(detectedUrl);
                            return (
                              <a
                                href={detectedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="my-1.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition border border-black/5 dark:border-white/10 flex items-center gap-2.5 group/link text-left select-none max-w-full block clear-both cursor-pointer"
                              >
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-2xs">
                                  <Globe className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate flex items-center gap-1">
                                    <span>{domain}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                                  </div>
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-mono">
                                    {detectedUrl}
                                  </div>
                                </div>
                              </a>
                            );
                          })()}
                          {/* WhatsApp Float-right Timestamp + Checkmarks */}
                          <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] leading-none text-gray-500 dark:text-gray-400 opacity-85 ml-2.5 float-right translate-y-0.5 select-none shrink-0 font-normal">
                            {isStarred && (
                              <Star className={`w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0 ${isMine ? "text-amber-500 fill-amber-500" : ""}`} />
                            )}
                            <span>{formatMessageTime(msg.created_at)}</span>
                            {msg.edited_at && <span className="italic">edited</span>}
                            {isMine && <MessageStatusTick msg={msg} />}
                            {/* WhatsApp Dropdown Chevron Button */}
                            {!showSenderHeader && (
                              <button
                                type="button"
                                data-dropdown-trigger="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDropdown(msg, e.currentTarget);
                                }}
                                className="p-0.5 rounded opacity-0 group-hover/msg:opacity-100 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer -mr-1"
                              >
                                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            )}
                          </span>
                        </div>
                      )}

                    {/* WhatsApp-Style Floating Reaction Pill (Docked to bottom edge of message) */}
                    {!isDeletedForAll && msgReactions.length > 0 && (
                      <div
                        className={`absolute -bottom-2.5 ${isMine ? "right-2.5" : "left-2.5"} z-20 flex items-center gap-1 bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-sm rounded-full px-2 py-0.5 text-xs select-none cursor-pointer hover:scale-105 transition`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const myReaction = msgReactions.find((r) => r.sender_id === currentUser?.id);
                          if (myReaction) {
                            handleSendReaction(msg, myReaction.emoji);
                          }
                        }}
                      >
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <span key={emoji} className="flex items-center gap-1 text-xs leading-none">
                            <AppleEmoji emoji={emoji} size={15} />
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
                </div>

                  {/* 2. Side Actions: Round Smiley Button + Forward/Reply (WhatsApp Style: Shows on hover) */}
                  {!isDeletedForAll && (
                    <div className="flex items-center gap-1 select-none">
                      {/* Round Smiley Button */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          data-reaction-trigger="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReactionMsgId((prev) => (prev === msg.id ? null : msg.id));
                            setActiveDropdownMsgId(null);
                          }}
                          className={`w-6.5 h-6.5 rounded-full bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-xs flex items-center justify-center text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-all duration-150 ${activeReactionMsgId === msg.id
                              ? "opacity-100 scale-105 pointer-events-auto"
                              : "opacity-0 pointer-events-none group-hover/msg:opacity-100 group-hover/msg:pointer-events-auto"
                            }`}
                          aria-label="React to message"
                        >
                          <Smile className="w-3.5 h-3.5 stroke-[1.9]" />
                        </button>

                        {/* Floating WhatsApp Reaction Strip (Image 2 Style: Opens on click of Smiley Button) */}
                        {activeReactionMsgId === msg.id && (
                          <div
                            data-reaction-strip="true"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] rounded-full px-2 py-1 shadow-2xl animate-scaleUp select-none whitespace-nowrap shrink-0"
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
                                  className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-125 transition-transform cursor-pointer shrink-0 ${isSelected ? "bg-black/10 dark:bg-white/20 scale-110 ring-1 ring-red-500" : ""
                                    }`}
                                  aria-label={isSelected ? `Remove ${emoji}` : `React ${emoji}`}
                                >
                                  <AppleEmoji emoji={emoji} size={24} />
                                </button>
                              );
                            })}

                            {/* Plus (+) Button to open full WhatsApp reaction picker */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReactionInChatboxPicker(msg);
                              }}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition shrink-0 ml-0.5"
                              aria-label="More reactions"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Reply Button (WhatsApp Style: Shows on hover) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyingTo(msg);
                          const el = getActiveComposerElement();
                          if (el) el.focus();
                        }}
                        className="w-6.5 h-6.5 rounded-full bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-2xs flex items-center justify-center text-gray-400 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer transition-all duration-150 opacity-0 pointer-events-none group-hover/msg:opacity-100 group-hover/msg:pointer-events-auto"
                        title="Reply"
                        aria-label="Reply to message"
                      >
                        <Reply className="w-3.5 h-3.5 stroke-[2]" />
                      </button>

                      {/* Copy Text Button (WhatsApp Style: Shows on hover) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMessageText(msg);
                        }}
                        className="w-6.5 h-6.5 rounded-full bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-2xs flex items-center justify-center text-gray-400 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-all duration-150 opacity-0 pointer-events-none group-hover/msg:opacity-100 group-hover/msg:pointer-events-auto"
                        title="Copy message"
                        aria-label="Copy message text"
                      >
                        <Copy className="w-3.5 h-3.5 stroke-[2]" />
                      </button>

                      {/* Forward Arrow Button (WhatsApp Style: Shows on hover / prominent for media) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForwardTargetMessages([msg]);
                          setSelectedForwardTargets(new Set());
                          setForwardModalOpen(true);
                        }}
                        className={`w-6.5 h-6.5 rounded-full bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-2xs flex items-center justify-center text-gray-400 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-all duration-150 ${
                          hasMediaAttachment
                            ? "opacity-85 hover:opacity-100 group-hover/msg:opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none group-hover/msg:opacity-100 group-hover/msg:pointer-events-auto"
                        }`}
                        title="Forward"
                        aria-label="Forward message"
                      >
                        <Forward className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </>
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
                className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-red-50 dark:hover:bg-red-950/40 transition"
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
          7. EMOJI, GIF & STICKER PICKER (WhatsApp Mobile Native Bottom Sheet & Desktop Dock)
          ========================================================================= */}
      {showEmojiPicker && (
        <>
          {/* Mobile Backdrop to tap out and close sheet */}
          <div
            className="fixed inset-0 z-40 bg-black/25 sm:hidden backdrop-blur-2xs transition-opacity"
            onClick={() => {
              setShowEmojiPicker(false);
              setReactionTargetMessage(null);
            }}
          />

          <div
            data-emoji-mart-popover="true"
            className="fixed sm:absolute inset-x-0 bottom-0 sm:bottom-20 sm:left-4 sm:right-auto z-40 w-full sm:w-[460px] h-[390px] sm:h-[440px] max-h-[55vh] sm:max-h-[calc(100vh-7rem)] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl border-t sm:border border-gray-200 dark:border-[#3a3020] bg-white dark:bg-[#18150f] flex flex-col animate-in slide-in-from-bottom duration-200 select-none"
          >
            {/* Mobile Top Drag Handle Bar */}
            <div className="pt-2 pb-0.5 flex justify-center sm:hidden shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-stone-700" />
            </div>

            {/* Reaction Banner if opened from '+' button to react to a message */}
            {reactionTargetMessage && (
              <div className="px-3.5 py-2 bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-800/60 flex items-center justify-between text-xs text-red-800 dark:text-red-200 shrink-0">
                <span className="font-semibold truncate">
                  React to {reactionTargetMessage.sender?.full_name || "message"}
                </span>
                <button
                  type="button"
                  onClick={() => setReactionTargetMessage(null)}
                  className="p-0.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer transition"
                  title="Cancel reaction"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* WhatsApp Mobile Top Action Strip: [ 🔍 Search | [ 😃 | GIF | 🏷️ ] | ⌫ Backspace ] */}
            <div className="pt-1.5 pb-2 px-3 sm:px-4 flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020]/60 shrink-0">
              {/* Left: Search Toggle Icon Button */}
              <button
                type="button"
                onClick={() => setShowPickerSearch((prev) => !prev)}
                className={`p-2 rounded-full transition cursor-pointer ${
                  showPickerSearch
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40"
                    : "text-gray-500 hover:text-gray-900 dark:text-stone-400 dark:hover:text-white"
                }`}
                aria-label="Search emojis"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Center: Segmented Capsule Pill [ 😃 | GIF | 🏷️ ] */}
              <div className="inline-flex items-center p-0.5 rounded-full border border-gray-200 dark:border-[#3a3020] bg-gray-100/80 dark:bg-[#100f0b]">
                {/* Emoji Icon Button */}
                <button
                  type="button"
                  onClick={() => setMediaPickerTab("emoji")}
                  className={`px-3.5 py-1 rounded-full flex items-center justify-center transition cursor-pointer ${
                    mediaPickerTab === "emoji"
                      ? "bg-white dark:bg-[#272118] text-red-600 dark:text-red-400 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-900 dark:text-stone-400 dark:hover:text-white"
                  }`}
                  aria-label="Emojis"
                  title="Emojis"
                >
                  <TexAppStickerSmileyIcon className="w-5 h-5 stroke-[2]" />
                </button>

                {/* GIF Button */}
                <button
                  type="button"
                  onClick={() => setMediaPickerTab("gif")}
                  className={`px-3.5 py-1 rounded-full flex items-center justify-center transition cursor-pointer ${
                    mediaPickerTab === "gif"
                      ? "bg-white dark:bg-[#272118] text-red-600 dark:text-red-400 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-900 dark:text-stone-400 dark:hover:text-white"
                  }`}
                  aria-label="GIFs"
                  title="GIFs"
                >
                  <span className="text-xs font-black tracking-wider uppercase font-sans">
                    GIF
                  </span>
                </button>

                {/* Stickers Button */}
                <button
                  type="button"
                  onClick={() => setMediaPickerTab("stickers")}
                  className={`px-3.5 py-1 rounded-full flex items-center justify-center transition cursor-pointer ${
                    mediaPickerTab === "stickers"
                      ? "bg-white dark:bg-[#272118] text-red-600 dark:text-red-400 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-900 dark:text-stone-400 dark:hover:text-white"
                  }`}
                  aria-label="Stickers"
                  title="Stickers"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8l7-7V6a3 3 0 0 0-3-3z" />
                    <path d="M14 21v-4a3 3 0 0 1 3-3h4" />
                  </svg>
                </button>
              </div>

              {/* Right: Backspace / Delete Button */}
              <button
                type="button"
                onClick={handleComposerBackspace}
                className="p-2 rounded-full text-gray-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 transition cursor-pointer active:scale-90"
                aria-label="Delete last character"
                title="Backspace"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[1.9]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
              {mediaPickerTab === "emoji" ? (
                <EmojiMartPicker
                  isDark={isDark}
                  onEmojiSelect={(emoji) => {
                    if (reactionTargetMessage) {
                      handleSendReaction(reactionTargetMessage, emoji);
                      setReactionTargetMessage(null);
                      setShowEmojiPicker(false);
                    } else {
                      handleInsertEmoji(emoji);
                    }
                  }}
                  perLine={9}
                  navPosition="bottom"
                  searchPosition={showPickerSearch ? "top" : "none"}
                  previewPosition="none"
                />
              ) : mediaPickerTab === "gif" ? (
                <GiphyPicker
                  isDark={isDark}
                  onSelectGif={(gif) => {
                    handleSendAttachment({
                      message: "",
                      attachment_url: gif.url,
                      attachment_name: "GIF",
                      attachment_type: "image",
                      reference_type: "none",
                    });
                    setShowEmojiPicker(false);
                    setReactionTargetMessage(null);
                  }}
                  onClose={() => {
                    setShowEmojiPicker(false);
                    setReactionTargetMessage(null);
                  }}
                />
              ) : (
                /* WhatsApp Curated Stickers Grid */
                <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2.5">
                  {WHATSAPP_STICKER_PACK.map((stk) => (
                    <button
                      key={stk.id}
                      type="button"
                      onClick={() => {
                        handleInsertEmoji(stk.emoji);
                      }}
                      className="p-3 rounded-2xl border border-gray-200/80 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#100f0b] hover:border-red-500 flex flex-col items-center justify-center gap-1 hover:scale-105 transition active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="text-3xl">{stk.emoji}</span>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-stone-400">{stk.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* WhatsApp Floating Scroll to Bottom Button */}
      {showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom("smooth");
            setNewMessageCount(0);
          }}
          className="absolute right-4 sm:right-6 bottom-20 z-40 w-10 h-10 rounded-full bg-white dark:bg-[#18150f] text-stone-600 dark:text-stone-300 hover:text-red-700 dark:hover:text-red-200 shadow-md border border-gray-200/90 dark:border-[#3a3020]/80 p-0 flex items-center justify-center hover:scale-105 transition-all transform active:scale-95 cursor-pointer animate-in fade-in zoom-in-90 shrink-0"
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
        >
          <TexAppScrollDownIcon className="w-4 h-4" />
          {newMessageCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {newMessageCount > 99 ? "99+" : newMessageCount}
            </span>
          )}
        </button>
      )}
      {newMessageCount > 0 && !showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom("smooth");
            setNewMessageCount(0);
          }}
          className="absolute right-4 sm:right-6 bottom-20 z-40 px-3.5 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-lg shadow-red-500/25 border border-red-500/50 hover:bg-red-700 transition cursor-pointer shrink-0"
          aria-label="Jump to new messages"
        >
          {newMessageCount} new message{newMessageCount > 1 ? "s" : ""}
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
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {editingMessage && (
          <div className={`mb-2 p-2.5 rounded-2xl flex items-center justify-between gap-2.5 text-xs border-l-4 border-amber-500 shadow-2xs ${
            isDark ? "bg-[#241f18] text-[#f4ead2]" : "bg-white text-gray-800"
          }`}>
            <div className="min-w-0">
              <span className="font-bold text-[11px] text-amber-600 block">Editing message</span>
              <p className="truncate text-[11px] opacity-80">{editingMessage.message}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingMessage(null);
                setComposerText("");
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
              aria-label="Cancel edit"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Rich Text Formatting Toolbar Strip */}
        {showFormattingToolbar && (
          <div className={`mb-2 px-3 py-1.5 rounded-2xl flex items-center justify-between gap-1.5 border shadow-xs animate-fadeIn select-none ${
            isDark ? "bg-[#18150f] border-[#3a3020] text-gray-200" : "bg-white border-gray-200/90 text-gray-800"
          }`}>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Format:</span>
              <button
                type="button"
                onClick={() => applyTextFormatting("*")}
                className="px-2 py-1 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 font-bold transition cursor-pointer text-xs flex items-center gap-1"
                title="Bold (*text*)"
              >
                <Bold className="w-3.5 h-3.5" />
                <span className="text-[11px]">Bold</span>
              </button>
              <button
                type="button"
                onClick={() => applyTextFormatting("_")}
                className="px-2 py-1 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 italic transition cursor-pointer text-xs flex items-center gap-1"
                title="Italic (_text_)"
              >
                <Italic className="w-3.5 h-3.5" />
                <span className="text-[11px]">Italic</span>
              </button>
              <button
                type="button"
                onClick={() => applyTextFormatting("~")}
                className="px-2 py-1 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 line-through transition cursor-pointer text-xs flex items-center gap-1"
                title="Strikethrough (~text~)"
              >
                <Strikethrough className="w-3.5 h-3.5" />
                <span className="text-[11px]">Strike</span>
              </button>
              <button
                type="button"
                onClick={() => applyTextFormatting("`")}
                className="px-2 py-1 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 font-mono transition cursor-pointer text-xs flex items-center gap-1"
                title="Monospace (`code`)"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="text-[11px]">Code</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowFormattingToolbar(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer shrink-0"
              title="Close formatting"
              aria-label="Close formatting"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* WhatsApp Composer Row (Single Unified Pill Design matching user sample) */}
        {isContactBlocked ? (
          <div className="w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs font-semibold text-red-600 dark:text-red-400 select-none shadow-xs">
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 shrink-0" />
              <span>You blocked this contact. Unblock to send messages or media.</span>
            </div>
            <button
              type="button"
              onClick={handleToggleBlockContact}
              className="px-3.5 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              Unblock
            </button>
          </div>
        ) : (
        <form onSubmit={handleSend} className="w-full flex items-center">
          <div
            className={`w-full flex items-center rounded-full px-2 sm:px-2.5 py-1 min-h-[48px] shadow-sm border transition-colors gap-1 sm:gap-2 ${
              recordingMode === "audio"
                ? isDark
                  ? "bg-[#271515] border-red-900/60"
                  : "bg-red-50/80 border-red-200"
                : isDark
                ? "bg-[#18150f] border-[#3a3020]/80 focus-within:border-[#5a4a32]"
                : "bg-white border-gray-200/90 focus-within:border-gray-300"
            }`}
          >
            {recordingMode === "audio" ? (
              /* ACTIVE VOICE RECORDING BAR (WhatsApp Web & Mobile Style) */
              <div
                onTouchStart={handleRecordTouchStart}
                onTouchMove={handleRecordTouchMove}
                onTouchEnd={handleRecordTouchEnd}
                onTouchCancel={handleRecordTouchEnd}
                className="w-full flex items-center justify-between px-2 gap-2 animate-fadeIn select-none touch-pan-y"
              >
                {/* Left: Blinking Red Dot & Timer & Waveform animation */}
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                    <span className="absolute w-3 h-3 rounded-full bg-red-600 animate-ping opacity-75" />
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  </div>

                  <span className="font-mono text-sm sm:text-base font-bold text-red-600 dark:text-red-400 tabular-nums">
                    {formatSecs(recordingSeconds)}
                  </span>

                  {/* Sound Wave Dancing Bars Animation */}
                  <div className="hidden sm:flex items-center gap-[3px] h-4 px-1.5">
                    <span className="w-[3px] h-2.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="w-[3px] h-4 bg-red-600 rounded-full animate-bounce" style={{ animationDuration: "0.6s" }} />
                    <span className="w-[3px] h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDuration: "0.8s" }} />
                    <span className="w-[3px] h-4 bg-red-600 rounded-full animate-bounce" style={{ animationDuration: "0.5s" }} />
                    <span className="w-[3px] h-2 bg-red-400 rounded-full animate-pulse" />
                  </div>

                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate hidden lg:inline">
                    {isUploadingVoice
                      ? "Sending voice note..."
                      : isRecordingPaused
                      ? "Voice recording paused"
                      : "Recording voice message..."}
                  </span>
                </div>

                {/* Center: Slide to cancel or Locked indicator or Audio Preview */}
                {isLockedRecording && isRecordingPaused && voicePreviewUrl ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-300/80 dark:border-red-900/60 text-xs font-bold text-red-600 dark:text-red-400 select-none">
                    <audio
                      ref={voicePreviewAudioRef}
                      src={voicePreviewUrl}
                      onEnded={() => setIsPlayingVoicePreview(false)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleTogglePlayVoicePreview}
                      className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer hover:scale-105 transition shrink-0"
                      title={isPlayingVoicePreview ? "Pause preview" : "Play preview"}
                    >
                      {isPlayingVoicePreview ? (
                        <Pause className="w-3 h-3 fill-white" />
                      ) : (
                        <Play className="w-3 h-3 fill-white translate-x-0.5" />
                      )}
                    </button>
                    <span className="text-[11px] font-semibold truncate">Preview audio</span>
                  </div>
                ) : isLockedRecording ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-300/80 dark:border-red-900/60 text-[11px] font-bold text-red-600 dark:text-red-400 animate-pulse select-none">
                    <Lock className="w-3 h-3" />
                    <span>Hands-free locked</span>
                  </div>
                ) : (
                  <div
                    style={{
                      transform: recordSlideOffset > 0 ? `translateX(-${recordSlideOffset}px)` : undefined,
                      opacity: Math.max(0.2, 1 - recordSlideOffset / 100),
                    }}
                    className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium select-none transition-transform"
                  >
                    <span className="text-gray-400 dark:text-gray-500 animate-pulse font-bold">‹‹</span>
                    <span className="truncate">Slide left to cancel</span>
                  </div>
                )}

                {/* Right: Lock, Pause/Resume, Discard Trash Button + Send Button */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {!isLockedRecording && (
                    <button
                      type="button"
                      onClick={() => setIsLockedRecording(true)}
                      className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                      title="Lock hands-free recording (or slide up)"
                      aria-label="Lock recording"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Lock</span>
                    </button>
                  )}

                  {/* Pause / Resume Button for locked recording */}
                  {isLockedRecording && (
                    <button
                      type="button"
                      onClick={handleTogglePauseRecording}
                      disabled={isUploadingVoice}
                      className="p-1.5 sm:p-2 rounded-full text-red-600 hover:bg-red-100/60 dark:hover:bg-red-950/50 transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                      title={isRecordingPaused ? "Resume recording" : "Pause recording"}
                      aria-label="Pause or resume recording"
                    >
                      {isRecordingPaused ? (
                        <Mic className="w-4 h-4 text-red-600 animate-pulse" />
                      ) : (
                        <Pause className="w-4 h-4 text-red-600" />
                      )}
                      <span className="hidden sm:inline">{isRecordingPaused ? "Resume" : "Pause"}</span>
                    </button>
                  )}

                  {/* Cancel / Trash Button */}
                  <button
                    type="button"
                    onClick={handleCancelRecording}
                    disabled={isUploadingVoice}
                    className={`p-2 rounded-full transition cursor-pointer ${
                      recordSlideOffset > 40
                        ? "text-red-600 bg-red-100 dark:bg-red-950/60 scale-110"
                        : "text-gray-500 hover:text-red-600 hover:bg-red-100/50 dark:hover:bg-white/10"
                    }`}
                    title="Cancel and discard voice note"
                    aria-label="Discard recording"
                  >
                    <Trash2 className="w-5 h-5 stroke-[2]" />
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={handleStopAndSendVoice}
                    disabled={isUploadingVoice}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all transform active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                    title="Send voice note"
                    aria-label="Send voice message"
                  >
                    {isUploadingVoice ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <TexAppSendIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* NORMAL COMPOSER CONTENT */
              <>
                {/* Attachment Paperclip 📎 */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttachmentTray((prev) => !prev);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      showAttachmentTray
                        ? "text-red-600 bg-red-50 dark:bg-red-500/10"
                        : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white"
                    }`}
                    aria-label="Attach media or files"
                    title="Attach"
                  >
                    <TexAppPaperclipIcon className="w-5 h-5 stroke-[2]" />
                  </button>

                  {/* WhatsApp Speed-Dial Attachment Tray (Cleanly anchored right above clip icon) */}
                  {showAttachmentTray && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/25 sm:bg-transparent backdrop-blur-2xs sm:backdrop-blur-none"
                        onClick={() => setShowAttachmentTray(false)}
                      />
                      <div
                        className={`absolute bottom-full mb-3 left-0 z-50 w-52 p-1.5 rounded-2xl border shadow-2xl space-y-0.5 animate-scaleUp select-none ${
                          isDark ? "bg-[#18150f] border-[#3a3020]" : "bg-white border-gray-200/90"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 1. Document */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentTray(false);
                            docInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-100/80 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-left transition cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Document</span>
                        </button>

                        {/* 2. Photos & videos */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentTray(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-100/80 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-left transition cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-stone-500/15 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Photos & videos</span>
                        </button>

                        {/* 3. Camera */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentTray(false);
                            setShowCameraModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-100/80 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-left transition cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <Camera className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Camera</span>
                        </button>

                        {/* 4. Poll */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentTray(false);
                            setShowPollModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-100/80 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-left transition cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <BarChart2 className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Poll</span>
                        </button>

                        {/* 5. Location */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentTray(false);
                            handleShareCurrentLocation();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-100/80 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-left transition cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Location</span>
                        </button>

                        {/* 6. Text formatting (T) */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentTray(false);
                            setShowFormattingToolbar((prev) => !prev);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-100/80 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-left transition cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-serif font-bold text-sm">
                            T
                          </div>
                          <span className="text-sm font-medium">Text formatting</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Emoji / Sticker Toggle */}
                <button
                  type="button"
                  data-emoji-trigger="true"
                  onClick={() => {
                    setReactionTargetMessage(null);
                    setMediaPickerTab("emoji");
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowAttachmentTray(false);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    showEmojiPicker
                      ? "text-red-600 bg-red-50 dark:bg-red-500/10"
                      : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                  aria-label="Add emoji or sticker"
                  title="Emoji & Stickers"
                >
                  <TexAppStickerSmileyIcon className="w-5 h-5 stroke-[2]" />
                </button>

                {/* Message Text Input (WhatsApp Style ContentEditable with Apple Emojis) */}
                <textarea
                  ref={mobileTextareaRef}
                  value={inputText}
                  rows={1}
                  placeholder="Type a message"
                  onChange={handleTextChange}
                  onPaste={handleContentEditablePaste}
                  onFocus={() => {
                    if (typeof window !== "undefined") {
                      window.scrollTo(0, 0);
                      setTimeout(() => window.scrollTo(0, 0), 50);
                    }
                  }}
                  onInput={(e) => {
                    if (onTyping) onTyping(Boolean(e.currentTarget.value.trim()));
                  }}
                  onKeyDown={(e) => {
                    if (enterIsSend) {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    } else {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }
                  }}
                  className="chat-composer-input sm:hidden flex-1 resize-none !bg-transparent !border-none outline-none focus:outline-none focus:ring-0 !shadow-none text-sm text-gray-900 dark:text-[#f4ead2] px-2 py-1.5 max-h-28 min-h-[28px] overflow-y-auto leading-relaxed placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
                <div
                  ref={textareaRef}
                  contentEditable
                  role="textbox"
                  data-placeholder="Type a message"
                  onFocus={() => {
                    if (typeof window !== "undefined") {
                      window.scrollTo(0, 0);
                      setTimeout(() => window.scrollTo(0, 0), 50);
                    }
                  }}
                  onInput={handleContentEditableInput}
                  onPaste={handleContentEditablePaste}
                  onKeyDown={(e) => {
                    if (enterIsSend) {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    } else {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }
                  }}
                  style={{ background: "transparent", backgroundColor: "transparent" }}
                  className="chat-composer-input hidden sm:block flex-1 !bg-transparent !border-none outline-none focus:outline-none focus:ring-0 !shadow-none text-xs sm:text-sm text-gray-900 dark:text-[#f4ead2] px-2 py-1.5 max-h-32 min-h-[24px] overflow-y-auto leading-relaxed whitespace-pre-wrap break-words cursor-text"
                />

                {/* Circular send / mic action button */}
                {inputText.trim() || uploadingFile || editingMessage ? (
                  <button
                    type="submit"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all transform active:scale-95 cursor-pointer shrink-0"
                    aria-label={editingMessage ? "Update message" : "Send message"}
                  >
                    {editingMessage ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <TexAppSendIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartRecording("audio")}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all transform active:scale-95 cursor-pointer shrink-0"
                    aria-label="Record voice message"
                    title="Record voice message"
                  >
                    <Mic className="w-5 h-5 text-white stroke-[2.2]" />
                  </button>
                )}
              </>
            )}
          </div>
        </form>
        )}
      </div>

      {/* =========================================================================
          REALTIME CAMERA MODAL (Live Viewfinder, Snap, Retake, Send, Cancel)
          ========================================================================= */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#111] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            {/* Camera Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 text-white">
              <span className="text-sm font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-500" />
                <span>Take Photo</span>
              </span>
              <div className="flex items-center gap-2">
                {!capturedPhoto && (
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                    title="Flip camera"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                  aria-label="Close camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewfinder or Snapshot Preview */}
            <div className="relative aspect-4/3 sm:aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-rose-400 space-y-3">
                  <p className="text-sm">{cameraError}</p>
                  <button
                    type="button"
                    onClick={handleRetryCamera}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-2"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Try Camera Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseCamera();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Select from gallery instead
                  </button>
                </div>
              ) : capturedPhoto ? (
                /* Captured Photo Snapshot */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                /* Live Video Stream */
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover bg-black ${cameraFacingMode === "user" ? "-scale-x-100" : ""}`}
                />
              )}
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-center gap-3 sm:gap-6">
              {capturedPhoto ? (
                <>
                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={handleCloseCamera}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>

                  {/* Retake */}
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake</span>
                  </button>

                  {/* Send */}
                  <button
                    type="button"
                    onClick={handleSendCapturedPhoto}
                    className="px-5 sm:px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
                  >
                    <TexAppSendIcon className="w-4 h-4 text-white" />
                    <span>Send Photo</span>
                  </button>
                </>
              ) : (
                /* Shutter Button to take photo */
                <button
                  type="button"
                  disabled={Boolean(cameraError)}
                  onClick={handleCapturePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 active:scale-95 transition cursor-pointer group shadow-xl"
                  aria-label="Capture photo"
                >
                  <div className="w-11 h-11 rounded-full bg-white group-hover:scale-95 transition" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE POLL MODAL (Matches WhatsApp Sample from Screenshot 2)
          ========================================================================= */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border overflow-hidden transition-colors flex flex-col max-h-[90vh] ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowPollModal(false)}
                className="p-1 -ml-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-full transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-bold">Create poll</h2>
            </div>

            {/* Body */}
            <form onSubmit={handleCreatePoll} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Question */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-white">Question</label>
                <div className="relative flex items-center border-b-2 border-red-600 focus-within:border-red-600 pb-1.5">
                  <input
                    type="text"
                    required
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Ask question"
                    className="w-full bg-transparent text-sm sm:text-base outline-none pr-8 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setPollEmojiTarget(pollEmojiTarget === "question" ? null : "question")}
                    className="absolute right-0 text-gray-400 hover:text-red-500 transition cursor-pointer p-0.5"
                    title="Insert emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                {/* Quick Emoji Picker for Question */}
                {pollEmojiTarget === "question" && (
                  <div className="flex items-center gap-2 py-1.5 px-2 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 mt-1 animate-scaleUp overflow-x-auto select-none">
                    {["👍", "❤️", "😂", "🔥", "🎉", "✨", "✅", "❌", "👏", "🎯", "💯", "🚀"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setPollQuestion((prev) => prev + emoji)}
                        className="hover:scale-125 transition cursor-pointer shrink-0"
                      >
                        <AppleEmoji emoji={emoji} size={20} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900 dark:text-white">Options</label>
                <div className="space-y-3">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="space-y-1">
                      <div
                        className="relative flex items-center border-b border-gray-300 dark:border-gray-700 focus-within:border-red-600 pb-1.5 gap-2"
                      >
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                          placeholder="Add text"
                          className="flex-1 bg-transparent text-sm sm:text-base outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePollOption(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition cursor-pointer"
                            title="Remove option"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPollEmojiTarget(pollEmojiTarget === idx ? null : idx)}
                          className="text-gray-400 hover:text-red-500 transition cursor-pointer p-0.5 shrink-0"
                          title="Insert emoji"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                        <div className="text-gray-400 shrink-0 cursor-grab">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Quick Emoji Picker for this Option */}
                      {pollEmojiTarget === idx && (
                        <div className="flex items-center gap-2 py-1.5 px-2 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 mt-1 animate-scaleUp overflow-x-auto select-none">
                          {["👍", "❤️", "😂", "🔥", "🎉", "✨", "✅", "❌", "👏", "🎯", "💯", "🚀"].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handlePollOptionChange(idx, opt + emoji)}
                              className="hover:scale-125 transition cursor-pointer shrink-0"
                            >
                              <AppleEmoji emoji={emoji} size={18} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Allow multiple answers */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Allow multiple answers</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pollAllowMultiple}
                  onClick={() => setPollAllowMultiple(!pollAllowMultiple)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    pollAllowMultiple ? "bg-red-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      pollAllowMultiple ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Send Button at bottom center matching Website Red Palette */}
              <div className="pt-6 flex justify-center">
                <button
                  type="submit"
                  disabled={!pollQuestion.trim() || pollOptions.map((o) => o.trim()).filter(Boolean).length < 2}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 cursor-pointer ${
                    pollQuestion.trim() && pollOptions.map((o) => o.trim()).filter(Boolean).length >= 2
                      ? "bg-red-600 hover:bg-red-700 active:scale-95 hover:scale-105 shadow-red-600/30"
                      : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60"
                  }`}
                  aria-label="Send poll"
                  title="Send poll"
                >
                  <TexAppSendIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  className="px-3 py-1.5 rounded-xl font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition shadow-none"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setTaskModalOpen(false)}
        >
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 animate-scaleUp ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-base">Share Task Reference</h3>
              </div>
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-64 overflow-y-auto">
              {batchTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTask(t)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-[#3a3020] flex items-center justify-between text-left hover:border-red-500 transition"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs truncate block">{t.title}</span>
                    <span className="text-[10px] text-gray-400">{t.domain || "Task"}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                    {t.status || "open"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. LINK BATCH MEETING SELECTOR MODAL
          ========================================================================= */}
      {meetingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setMeetingModalOpen(false)}
        >
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 animate-scaleUp ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-base">Share Meeting Reference</h3>
              </div>
              <button
                type="button"
                onClick={() => setMeetingModalOpen(false)}
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
          12. GROUP MEMBERS & INFO MODAL (With Live Online Status & Admin/HR DP/Name Editing)
          ========================================================================= */}
      {showMembersDrawer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={handleCloseMembersDrawer}
        >
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] animate-scaleUp overflow-hidden ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with WhatsApp-style Back & Close */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={handleCloseMembersDrawer}
                  className="p-1 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                  title={openedFromChatOptions ? "Back to Chat Options" : "Close"}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-bold truncate">{headerDetails.isGroup ? "Group Info & Participants" : "Contact Info"}</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseMembersDrawer}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* WhatsApp Tabs Bar: Info / Media / Docs / Links / Starred (Scrollable) */}
            <div className="flex items-center overflow-x-auto no-scrollbar scrollbar-none border-b border-gray-100 dark:border-stone-800 bg-gray-50/60 dark:bg-stone-900/40 px-3 pt-2 gap-1 text-xs select-none shrink-0 whitespace-nowrap scroll-smooth touch-pan-x">
              <button
                type="button"
                onClick={() => setActiveInfoTab("info")}
                className={`pb-2 px-3 font-semibold border-b-2 transition cursor-pointer shrink-0 whitespace-nowrap ${
                  activeInfoTab === "info"
                    ? "border-red-600 text-red-600 dark:text-red-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                {headerDetails.isGroup ? "Members" : "Info"}
              </button>
              <button
                type="button"
                onClick={() => setActiveInfoTab("media")}
                className={`pb-2 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeInfoTab === "media"
                    ? "border-red-600 text-red-600 dark:text-red-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <span>Media</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-gray-300 font-bold">
                  {chatMediaList.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInfoTab("docs")}
                className={`pb-2 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeInfoTab === "docs"
                    ? "border-red-600 text-red-600 dark:text-red-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <span>Docs</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-gray-300 font-bold">
                  {chatDocsList.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInfoTab("links")}
                className={`pb-2 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeInfoTab === "links"
                    ? "border-red-600 text-red-600 dark:text-red-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <span>Links</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-gray-300 font-bold">
                  {chatLinksList.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInfoTab("starred")}
                className={`pb-2 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeInfoTab === "starred"
                    ? "border-red-600 text-red-600 dark:text-red-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <span>Starred</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-gray-300 font-bold">
                  {starredMessagesList.length}
                </span>
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {activeInfoTab === "media" ? (
                <div className="space-y-3">
                  {chatMediaList.length === 0 ? (
                    <div className="py-16 text-center text-xs text-gray-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-red-500" />
                      No photos or videos shared in this chat yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {chatMediaList.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          onClick={() => {
                            setGalleryMediaIndex(idx);
                            setGalleryZoom(1);
                          }}
                          className="aspect-square relative rounded-xl overflow-hidden cursor-pointer group bg-gray-100 dark:bg-stone-900 border border-black/5 dark:border-white/5 shadow-2xs"
                        >
                          {m.attachment_type === "video" ? (
                            <div className="w-full h-full flex items-center justify-center bg-stone-900 text-white">
                              <Play className="w-6 h-6 fill-white drop-shadow-md" />
                            </div>
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={m.attachment_url}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeInfoTab === "docs" ? (
                <div className="space-y-2">
                  {chatDocsList.length === 0 ? (
                    <div className="py-16 text-center text-xs text-gray-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-red-500" />
                      No documents shared in this chat yet.
                    </div>
                  ) : (
                    chatDocsList.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 transition shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                              {m.attachment_name || "Document"}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">
                              {formatMessageTime(m.created_at)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(m)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : activeInfoTab === "links" ? (
                <div className="space-y-2">
                  {chatLinksList.length === 0 ? (
                    <div className="py-16 text-center text-xs text-gray-400">
                      <LinkIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-red-500" />
                      No links shared in this chat yet.
                    </div>
                  ) : (
                    chatLinksList.map(({ msg: m, url, domain }) => (
                      <a
                        key={m.id}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 transition group shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400">
                              {domain}
                            </div>
                            <div className="text-[10.5px] text-gray-500 dark:text-gray-400 truncate">
                              {url}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600 shrink-0 ml-2" />
                      </a>
                    ))
                  )}
                </div>
              ) : activeInfoTab === "starred" ? (
                <div className="space-y-2">
                  {starredMessagesList.length === 0 ? (
                    <div className="py-16 text-center text-xs text-gray-400">
                      <Star className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-500 fill-amber-500" />
                      No starred messages in this chat yet.
                      <p className="text-[11px] text-gray-400 mt-1">Tap Star on any message to save it here for quick access.</p>
                    </div>
                  ) : (
                    starredMessagesList.map((m) => {
                      const isMine = m.sender_id === currentUser?.id;
                      const senderName = isMine ? "You" : m.sender_name || "Member";
                      return (
                        <div
                          key={m.id}
                          className="p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/40 shadow-2xs hover:border-red-400/50 transition group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {senderName}
                              </span>
                              <span className="text-[10.5px] text-gray-400">
                                {formatMessageTime(m.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleStar(m.id)}
                                className="p-1 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition cursor-pointer"
                                title="Unstar message"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleJumpToMessage(m.id)}
                                className="p-1 px-2 rounded-lg text-[10.5px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer flex items-center gap-1"
                                title="Jump to message in chat"
                              >
                                <span>Jump</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {m.attachment_url && (
                            <div className="mb-1.5 rounded-xl overflow-hidden max-h-32 bg-gray-100 dark:bg-stone-950 border border-black/5">
                              {m.attachment_type === "video" ? (
                                <div className="p-2 flex items-center gap-2 text-xs text-gray-500">
                                  <Play className="w-4 h-4 text-red-600" />
                                  <span>Video attachment</span>
                                </div>
                              ) : m.attachment_type === "audio" ? (
                                <div className="p-2 flex items-center gap-2 text-xs text-gray-500">
                                  <Mic className="w-4 h-4 text-red-600" />
                                  <span>Voice message</span>
                                </div>
                              ) : m.attachment_type === "document" ? (
                                <div className="p-2 flex items-center gap-2 text-xs text-gray-500">
                                  <FileText className="w-4 h-4 text-red-600" />
                                  <span className="truncate">{m.attachment_name || "Document"}</span>
                                </div>
                              ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={m.attachment_url} alt="" className="w-full h-28 object-cover" />
                              )}
                            </div>
                          )}
                          {m.message && (
                            <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words line-clamp-3">
                              {m.message}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : !headerDetails.isGroup ? (
                /* Contact Profile Card for Direct Chat */
                <div className="space-y-4 animate-fadeIn">
                  {/* Profile Card Header */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50/70 to-rose-50/40 dark:from-red-950/20 dark:to-transparent border border-red-200/70 dark:border-red-900/40 flex flex-col items-center text-center relative">
                    {/* Large Avatar */}
                    <div className="relative mb-3">
                      {(() => {
                        const avatarSrc = typeof headerDetails.avatarUrl === "string" && headerDetails.avatarUrl.trim() ? headerDetails.avatarUrl.trim() : null;
                        if (avatarSrc && !headerAvatarError) {
                          return (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={avatarSrc}
                              alt=""
                              onError={() => setHeaderAvatarError(true)}
                              className="w-20 h-20 rounded-full object-cover ring-3 ring-red-500/40 shadow-sm"
                            />
                          );
                        }
                        return (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-sm">
                            {headerDetails.avatarLetter}
                          </div>
                        );
                      })()}
                      <span
                        className={`absolute bottom-0 right-1 w-4 h-4 rounded-full ring-2 ring-white dark:ring-[#18150f] ${
                          headerDetails.isOnline ? "bg-amber-500 ring-amber-300" : "bg-gray-400"
                        }`}
                        title={headerDetails.isOnline ? "Online" : "Offline"}
                      />
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate max-w-full">
                      {headerDetails.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${ROLE_BADGES[contact?.role] || "bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-stone-700"}`}>
                        {ROLE_DISPLAY_NAMES[contact?.role] || contact?.role || "Member"}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        headerDetails.isOnline
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-gray-100 text-gray-600 dark:bg-stone-800 dark:text-gray-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${headerDetails.isOnline ? "bg-amber-500" : "bg-gray-400"}`} />
                        <span>{headerDetails.isOnline ? "Online" : "Offline"}</span>
                      </span>
                    </div>

                    {(contact?.batch_name || contact?.domain) && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                        {contact?.batch_name || ""} {contact?.domain ? `• ${contact.domain}` : ""}
                      </p>
                    )}
                  </div>

                  {/* Contact Email & Quick Copy */}
                  {contact?.email && (
                    <div className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-stone-800 bg-gray-50/50 dark:bg-stone-900/30 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-gray-400 dark:text-stone-400 uppercase tracking-wider">Email Address</div>
                          <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{contact.email}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(contact.email);
                          }
                          setCopiedContactEmail(true);
                          showToast("Email address copied to clipboard!");
                          setTimeout(() => setCopiedContactEmail(false), 2000);
                        }}
                        className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-red-600 transition shrink-0 cursor-pointer"
                        title="Copy Email"
                        aria-label="Copy contact email"
                      >
                        {copiedContactEmail ? <Check className="w-4 h-4 text-amber-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* Media, Docs, Links & Starred Overview Cards */}
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveInfoTab("media")}
                      className="p-2.5 sm:p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/40 hover:border-red-400 transition text-center cursor-pointer shadow-2xs"
                    >
                      <div className="text-sm sm:text-base font-black text-red-600 dark:text-red-400">{chatMediaList.length}</div>
                      <div className="text-[10px] sm:text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Media</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInfoTab("docs")}
                      className="p-2.5 sm:p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/40 hover:border-red-400 transition text-center cursor-pointer shadow-2xs"
                    >
                      <div className="text-sm sm:text-base font-black text-red-600 dark:text-red-400">{chatDocsList.length}</div>
                      <div className="text-[10px] sm:text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Docs</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInfoTab("links")}
                      className="p-2.5 sm:p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/40 hover:border-red-400 transition text-center cursor-pointer shadow-2xs"
                    >
                      <div className="text-sm sm:text-base font-black text-red-600 dark:text-red-400">{chatLinksList.length}</div>
                      <div className="text-[10px] sm:text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Links</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInfoTab("starred")}
                      className="p-2.5 sm:p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/40 hover:border-amber-400 transition text-center cursor-pointer shadow-2xs"
                    >
                      <div className="text-sm sm:text-base font-black text-amber-500">{starredMessagesList.length}</div>
                      <div className="text-[10px] sm:text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Starred</div>
                    </button>
                  </div>

                  {/* Quick Chat Actions */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveInfoTab("starred");
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Starred Messages</span>
                      </div>
                      <span className="text-[10.5px] text-gray-400">{starredMessagesList.length} saved</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMembersDrawer(false);
                        setShowMuteModal(true);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <VolumeX className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {isChatMuted ? "Unmute Notifications" : "Mute Notifications"}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-gray-400">{isChatMuted ? "Muted" : "Enabled"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMembersDrawer(false);
                        handleExportChat();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Export Chat History</span>
                      </div>
                      <span className="text-[10.5px] text-gray-400">.txt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleToggleArchiveChat();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Archive className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {isChatArchived ? "Unarchive Chat" : "Archive Chat"}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-gray-400">{isChatArchived ? "Archived" : "Inbox"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowLabelPickerModal(true);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Chat Label</span>
                      </div>
                      {activeChatLabel ? (() => {
                        const lbl = CHAT_LABEL_PRESETS.find((p) => p.id === activeChatLabel);
                        return lbl ? (
                          <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold border ${lbl.color}`}>
                            {lbl.name}
                          </span>
                        ) : null;
                      })() : (
                        <span className="text-[10.5px] text-gray-400">None</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowDisappearingModal(true);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Disappearing Messages</span>
                      </div>
                      <span className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400">
                        {disappearingTimer === "off" ? "Off" : disappearingTimer === "24h" ? "24 hours" : disappearingTimer === "7d" ? "7 days" : "90 days"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleToggleBlockContact();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer text-left shadow-2xs ${
                        isContactBlocked
                          ? "border-amber-200/80 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                          : "border-red-200/60 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Ban className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {isContactBlocked ? `Unblock ${contact?.full_name || "Contact"}` : `Block ${contact?.full_name || "Contact"}`}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMembersDrawer(false);
                        setConfirmClearChatModal(true);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-red-200/60 dark:border-red-900/40 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs font-bold">Clear Chat Messages</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <>
              {/* Group Profile Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50/70 to-rose-50/40 dark:from-red-950/20 dark:to-transparent border border-red-200/70 dark:border-red-900/40 flex flex-col items-center text-center relative">
                {/* Group DP */}
                <div className="relative mb-2.5">
                  {(() => {
                    const avatarSrc = typeof editGroupAvatarUrl === "string" && editGroupAvatarUrl.trim()
                      ? editGroupAvatarUrl.trim()
                      : (typeof currentBatch?.avatar_url === "string" && currentBatch.avatar_url.trim() ? currentBatch.avatar_url.trim() : null);

                    if (avatarSrc && !groupAvatarError) {
                      return (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={avatarSrc}
                          alt=""
                          onError={() => setGroupAvatarError(true)}
                          className="w-20 h-20 rounded-full object-cover ring-3 ring-red-500/40 shadow-sm"
                        />
                      );
                    }
                    return (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-sm">
                        <Users className="w-9 h-9" />
                      </div>
                    );
                  })()}

                  {/* Camera Upload Button (Admin & HR Only) */}
                  {canAdminOrHrEditGroup && (
                    <>
                      <button
                        type="button"
                        disabled={isSavingGroup}
                        onClick={() => groupAvatarFileRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md hover:scale-105 transition cursor-pointer"
                        title="Change Group Profile Picture"
                        aria-label="Upload group photo"
                      >
                        {isSavingGroup ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        type="file"
                        ref={groupAvatarFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleGroupAvatarUpload}
                      />
                    </>
                  )}
                </div>

                {/* Group Name & Edit Form */}
                {isEditingGroup ? (
                  <div className="w-full space-y-2.5 mt-1">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase text-gray-500 dark:text-gray-400 text-left mb-1">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={editGroupName}
                        onChange={(e) => setEditGroupName(e.target.value)}
                        placeholder="Enter group name..."
                        className="w-full px-3 py-2 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-[#100f0b] text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        type="button"
                        disabled={isSavingGroup}
                        onClick={() => {
                          setEditGroupName(currentBatch?.name || "");
                          setEditGroupAvatarUrl(currentBatch?.avatar_url || null);
                          setIsEditingGroup(false);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSavingGroup}
                        onClick={handleSaveGroupInfo}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {isSavingGroup ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-2">
                      <h4 className="text-base sm:text-lg font-black truncate">{currentBatch?.name || "Batch Group"}</h4>
                      {canAdminOrHrEditGroup && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditGroupName(currentBatch?.name || "");
                            setEditGroupAvatarUrl(currentBatch?.avatar_url || null);
                            setIsEditingGroup(true);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                          title="Edit Group Name & DP (Admin/HR)"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {canAdminOrHrEditGroup ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditGroupName(currentBatch?.name || "");
                          setEditGroupAvatarUrl(currentBatch?.avatar_url || null);
                          setIsEditingGroup(true);
                        }}
                        className="text-[11px] text-red-600 dark:text-red-400 font-semibold hover:underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        <span>Edit Group Name & DP (Admin/HR)</span>
                      </button>
                    ) : (
                      <p className="text-[11px] text-gray-400 mt-0.5">Batch Official Group</p>
                    )}
                  </div>
                )}
              </div>

              {/* Status Filter Tabs (All / Online / Offline) */}
              <div>
                <div className="flex items-center justify-between gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-black/40 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMembersFilterTab("all")}
                    className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer text-center ${
                      membersFilterTab === "all"
                        ? "bg-white dark:bg-[#18150f] text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    All ({effectiveBatchMembers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMembersFilterTab("online")}
                    className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      membersFilterTab === "online"
                        ? "bg-white dark:bg-[#18150f] text-amber-600 dark:text-amber-400 shadow-xs"
                        : "text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Online ({onlineMembersCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMembersFilterTab("offline")}
                    className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer text-center ${
                      membersFilterTab === "offline"
                        ? "bg-white dark:bg-[#18150f] text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Offline ({Math.max(0, effectiveBatchMembers.length - onlineMembersCount)})
                  </button>
                </div>

                {/* Member Search input */}
                <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3a3020] bg-gray-50 dark:bg-[#100f0b]">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members by name or email..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs focus:outline-none placeholder-gray-400 dark:placeholder-slate-500"
                  />
                  {memberSearchQuery && (
                    <button type="button" onClick={() => setMemberSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-1.5">
                {(() => {
                  const filtered = (effectiveBatchMembers || []).filter((m) => {
                    const isMe = m.id === currentUser?.id || m.id === currentProfile?.id;
                    const matchesSearch =
                      !memberSearchQuery ||
                      (isMe && "you".includes(memberSearchQuery.toLowerCase())) ||
                      m.full_name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                      m.email?.toLowerCase().includes(memberSearchQuery.toLowerCase());
                    const isOnline = onlineMemberIds.has(m.id);
                    if (membersFilterTab === "online") return matchesSearch && isOnline;
                    if (membersFilterTab === "offline") return matchesSearch && !isOnline;
                    return matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8 text-xs text-gray-400">
                        {memberSearchQuery
                          ? "No matching members found."
                          : membersFilterTab === "online"
                          ? "No members are currently online."
                          : "No members found."}
                      </div>
                    );
                  }

                  return filtered.map((m) => {
                    const isMe = m.id === currentUser?.id || m.id === currentProfile?.id;
                    const isOnline = onlineMemberIds.has(m.id);

                    return (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between gap-2.5 p-2.5 rounded-2xl transition ${
                          isMe
                            ? "bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30"
                            : "hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        {/* Avatar with Online/Offline Indicator */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            {m.avatar_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={m.avatar_url}
                                alt={m.full_name || "Member"}
                                className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200 dark:ring-slate-700"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-none">
                                {m.full_name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            )}
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#18150f] ${
                                isOnline ? "bg-amber-500" : "bg-gray-400"
                              }`}
                              title={isOnline ? "Online" : "Offline"}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs flex items-center gap-1.5 flex-wrap leading-tight">
                              {isMe ? (
                                <>
                                  <span className="text-red-600 dark:text-red-400 font-black">You</span>
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                                    ({m.full_name || "Myself"})
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold break-words">{m.full_name || "Member"}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {isOnline ? (
                                <span className="text-amber-600 dark:text-amber-400 font-bold text-[10.5px] flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span>Online</span>
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10.5px]">Offline</span>
                              )}
                              {m.email && (
                                <>
                                  <span className="text-gray-300 dark:text-gray-600">•</span>
                                  <span className="text-[10.5px] text-gray-400 truncate max-w-[140px]">{m.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Role Badge and Personal Message Action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${ROLE_BADGES[m.role] || "bg-gray-100"}`}>
                            {ROLE_DISPLAY_NAMES[m.role] || m.role}
                          </span>
                          {!isMe && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowMembersDrawer(false);
                                if (onOpenDirectChat) {
                                  onOpenDirectChat(m);
                                }
                              }}
                              className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                              title={`Direct message with ${m.full_name}`}
                              aria-label={`Send message to ${m.full_name}`}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          12B. PINNED MESSAGES MODAL / DRAWER
          ========================================================================= */}
      {showPinnedTray && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowPinnedTray(false)}
        >
          <div
            className={`w-full max-w-md p-5 rounded-3xl border shadow-2xl animate-scaleUp ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black">Pinned Messages</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  {pinnedMessages.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPinnedTray(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                aria-label="Close pinned messages"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {pinnedMessages.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  No pinned messages in this chat.
                </div>
              ) : (
                pinnedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl border transition ${
                      isDark ? "bg-[#18150f]/90 border-[#3a3020] hover:border-amber-500/50" : "bg-amber-50/40 border-amber-200/70 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs truncate text-amber-600 dark:text-amber-400">
                          {msg.sender?.full_name || "Member"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPinnedTray(false);
                            const el = document.getElementById(`msg-${msg.id}`);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "center" });
                              el.classList.add("ring-2", "ring-amber-500", "ring-offset-2");
                              setTimeout(() => {
                                el.classList.remove("ring-2", "ring-amber-500", "ring-offset-2");
                              }, 2000);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition cursor-pointer"
                        >
                          Jump to chat
                        </button>
                        {onPinMessage && canPinMessage(msg) && (
                          <button
                            type="button"
                            onClick={() => onPinMessage(msg.id, false)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          >
                            Unpin
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed break-words line-clamp-3">
                      {msg.message}
                    </p>
                    {msg.attachment_url && (
                      <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                        <span>📎 {msg.attachment_name || "Attachment"}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP MEDIA & DOCUMENT PREVIEW / COMPOSER MODAL (Screenshot Exact Match)
          ========================================================================= */}
      {showMediaPreviewModal && pendingMediaItems.length > 0 && (
        <div className={`fixed inset-0 z-50 flex flex-col justify-between animate-fadeIn select-none ${
          isDark ? "bg-[#111b21] text-white" : "bg-white text-gray-900"
        }`}>
          {/* Top Header: Close Button */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 z-20">
            <button
              type="button"
              onClick={handleCloseMediaPreviewModal}
              className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
              aria-label="Close preview"
              title="Close"
            >
              <X className="w-6 h-6 stroke-[2]" />
            </button>

            <div className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
              {activeMediaIndex + 1} of {pendingMediaItems.length}
            </div>

            <div className="w-10" />
          </div>

          {/* Center Main Preview Area */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-2 overflow-hidden min-h-0 relative">
            {(() => {
              const activeItem = pendingMediaItems[activeMediaIndex] || pendingMediaItems[0];
              if (!activeItem) return null;

              if (activeItem.isVideo) {
                return (
                  <video
                    key={activeItem.id}
                    controls
                    src={activeItem.previewUrl}
                    className="max-h-[50vh] sm:max-h-[56vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain bg-black"
                  />
                );
              }

              if (activeItem.isImage) {
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={activeItem.id}
                    src={activeItem.previewUrl}
                    alt={activeItem.name}
                    className="max-h-[50vh] sm:max-h-[56vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
                  />
                );
              }

              // Document Preview Card (ZIP, PDF, Docs)
              const ext = activeItem.name?.split(".").pop()?.toUpperCase() || "DOC";
              let iconLabel = ext.substring(0, 4);
              if (iconLabel === "WEBP") iconLabel = "WEB";

              return (
                <div className="w-80 sm:w-96 p-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#18150f] shadow-xl flex flex-col items-center text-center">
                  <div className="mb-4">
                    <svg width="60" height="72" viewBox="0 0 36 44" fill="none" className="drop-shadow-md">
                      <path
                        d="M0 5C0 2.23858 2.23858 0 5 0H24L36 12V39C36 41.7614 33.7614 44 31 44H5C2.23858 44 0 41.7614 0 39V5Z"
                        fill="#5A6578"
                      />
                      <path d="M24 0V12H36L24 0Z" fill="#434D5D" />
                      <text
                        x="18"
                        y="33"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="system-ui, -apple-system, sans-serif"
                        letterSpacing="0.4"
                      >
                        {iconLabel}
                      </text>
                    </svg>
                  </div>
                  <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white max-w-full truncate">
                    {activeItem.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-mono mt-1">
                    {ext} • {activeItem.sizeStr}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Caption Input Row (Matching Screenshot: Rounded bar + Emoji button) */}
          <div className="w-full max-w-2xl mx-auto px-4 pt-2 pb-2 z-20">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition shadow-sm ${
              isDark ? "bg-[#202c33] border-white/10" : "bg-[#f0f2f5] border-gray-200"
            }`}>
              <input
                type="text"
                placeholder="Type a message"
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPendingMedia();
                  }
                }}
                disabled={isUploadingMediaQueue}
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 leading-relaxed"
                autoFocus
              />

              {/* Emoji button */}
              <button
                type="button"
                onClick={() => setShowCaptionEmojiPicker(!showCaptionEmojiPicker)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white cursor-pointer transition"
                title="Add emoji"
              >
                <TexAppStickerSmileyIcon className="w-5 h-5 stroke-[2]" />
              </button>

              {/* View Once indicator */}
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition text-xs font-bold font-mono"
                title="View once"
              >
                ①
              </button>
            </div>

            {/* Quick emoji strip for caption */}
            {showCaptionEmojiPicker && (
              <div className="flex items-center justify-center gap-2 py-2 mt-1 animate-scaleUp">
                {["👍", "❤️", "😂", "🔥", "🙏", "✨", "👏", "🎉"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setMediaCaption((prev) => prev + emoji);
                    }}
                    className="p-1.5 hover:scale-125 transition cursor-pointer text-lg leading-none"
                  >
                    <AppleEmoji emoji={emoji} size={22} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Filmstrip Bar (Matching Screenshot: Thumbnails + Plus button on Center, Big Send Button on Right) */}
          <div className={`w-full px-4 sm:px-6 py-3 border-t flex items-center justify-between z-20 ${
            isDark ? "bg-[#111b21] border-white/10" : "bg-white border-gray-200"
          }`}>
            {/* Left Balance Spacer */}
            <div className="w-12 sm:w-14 shrink-0" />

            {/* Center Thumbnails + Plus Button */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-[calc(100vw-8rem)] py-1 px-2">
              {pendingMediaItems.map((item, idx) => {
                const isActive = idx === activeMediaIndex;
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition relative group shrink-0 ${
                      isActive
                        ? "border-red-600 ring-2 ring-red-500/50 scale-105"
                        : "border-gray-200 dark:border-white/20 opacity-70 hover:opacity-100 hover:border-red-400"
                    }`}
                  >
                    {item.isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : item.isVideo ? (
                      <video src={item.previewUrl} className="w-full h-full object-cover bg-black" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-zinc-800 text-[9px] font-bold uppercase p-1">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="truncate max-w-full">{item.name?.split(".").pop() || "DOC"}</span>
                      </div>
                    )}

                    {/* Remove button on thumbnail */}
                    {pendingMediaItems.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePendingMediaItem(idx);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer hover:bg-red-600"
                        title="Remove"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Plus (+) Button to Add More Files */}
              <button
                type="button"
                onClick={() => {
                  const active = pendingMediaItems[activeMediaIndex] || pendingMediaItems[0];
                  if (active?.type === "document") {
                    docInputRef.current?.click();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/25 hover:border-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-600 flex items-center justify-center cursor-pointer transition shrink-0"
                title="Add more files"
                aria-label="Add more files"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Right: Circular Send Button (Website Red Color Theme!) */}
            <div className="shrink-0 pl-2 flex items-center justify-center">
              <button
                type="button"
                onClick={handleSendPendingMedia}
                disabled={isUploadingMediaQueue}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xl flex items-center justify-center cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send media"
                title="Send"
              >
                {isUploadingMediaQueue ? (
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                ) : (
                  <TexAppSendIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          13. WHATSAPP FULLSCREEN MEDIA GALLERY VIEWER
          ========================================================================= */}
      {(galleryMediaIndex !== null || previewImage) && (() => {
        const currentMsg = galleryMediaIndex !== null ? chatMediaList[galleryMediaIndex] : null;
        const currentUrl = currentMsg?.attachment_url || previewImage;
        const isVideo = currentMsg?.attachment_type === "video";
        const hasPrev = galleryMediaIndex !== null && galleryMediaIndex > 0;
        const hasNext = galleryMediaIndex !== null && galleryMediaIndex < chatMediaList.length - 1;

        const senderName =
          currentMsg?.sender?.full_name ||
          currentMsg?.sender_name ||
          (currentMsg?.sender_id === currentUser?.id ? "You" : "User");

        return (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white select-none animate-fadeIn"
            onClick={() => {
              setGalleryMediaIndex(null);
              setPreviewImage(null);
              setGalleryZoom(1);
            }}
          >
            {/* Top Bar */}
            <div
              className="flex items-center justify-between px-3 sm:px-5 py-3 bg-black/70 backdrop-blur-md z-20 border-b border-white/10 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Close/Back & Sender Info */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setGalleryMediaIndex(null);
                    setPreviewImage(null);
                    setGalleryZoom(1);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold truncate text-white">{senderName}</div>
                  <div className="text-[10.5px] sm:text-[11px] text-white/60 truncate flex items-center gap-1.5">
                    {currentMsg?.created_at && (
                      <span>{formatFullDateTime(currentMsg.created_at)}</span>
                    )}
                    {galleryMediaIndex !== null && chatMediaList.length > 1 && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-white/80">
                          {galleryMediaIndex + 1} of {chatMediaList.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions (Zoom in/out, Forward, Download, Close) */}
              <div className="flex items-center gap-1 sm:gap-2">
                {!isVideo && (
                  <>
                    <button
                      type="button"
                      onClick={() => setGalleryZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryZoom((z) => Math.min(3, z + 0.25))}
                      className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </>
                )}

                {currentMsg && (
                  <button
                    type="button"
                    onClick={() => handleForwardMessage(currentMsg)}
                    className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                    title="Forward"
                  >
                    <Forward className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleDownloadAttachment(
                      currentMsg || {
                        attachment_url: currentUrl,
                        attachment_type: isVideo ? "video" : "image",
                        attachment_name: isVideo ? `video_${Date.now()}.mp4` : `image_${Date.now()}.png`,
                      }
                    )
                  }
                  className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGalleryMediaIndex(null);
                    setPreviewImage(null);
                    setGalleryZoom(1);
                  }}
                  className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
              {/* Prev Button */}
              {hasPrev && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGalleryMediaIndex((i) => (i > 0 ? i - 1 : i));
                    setGalleryZoom(1);
                  }}
                  className="absolute left-2 sm:left-6 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/15 transition cursor-pointer shadow-2xl backdrop-blur-xs"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Media Content */}
              <div
                className="max-w-full max-h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {isVideo ? (
                  <video
                    controls
                    autoPlay
                    src={currentUrl}
                    className="max-h-[70vh] sm:max-h-[75vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentUrl}
                    alt="Gallery item"
                    style={{ transform: `scale(${galleryZoom})` }}
                    className="max-h-[70vh] sm:max-h-[75vh] max-w-[90vw] rounded-xl object-contain shadow-2xl transition-transform duration-200"
                  />
                )}
              </div>

              {/* Next Button */}
              {hasNext && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGalleryMediaIndex((i) => (i < chatMediaList.length - 1 ? i + 1 : i));
                    setGalleryZoom(1);
                  }}
                  className="absolute right-2 sm:right-6 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/15 transition cursor-pointer shadow-2xl backdrop-blur-xs"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Bottom Caption & Thumbnails Carousel */}
            <div
              className="bg-black/75 backdrop-blur-md px-4 py-3 z-20 flex flex-col items-center gap-2 border-t border-white/10 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {currentMsg?.message && (
                <div className="max-w-xl text-center text-xs text-white/90 bg-white/10 px-4 py-1.5 rounded-full truncate">
                  {currentMsg.message}
                </div>
              )}

              {/* Media Thumbnails Scroller */}
              {chatMediaList.length > 1 && (
                <div className="flex items-center gap-2 max-w-full overflow-x-auto py-1 px-2 no-scrollbar">
                  {chatMediaList.map((m, idx) => {
                    const isSelected = idx === galleryMediaIndex;
                    return (
                      <button
                        key={m.id || idx}
                        type="button"
                        onClick={() => {
                          setGalleryMediaIndex(idx);
                          setGalleryZoom(1);
                        }}
                        className={`relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                          isSelected
                            ? "border-red-500 scale-105 opacity-100 shadow-md ring-2 ring-red-500/50"
                            : "border-transparent opacity-50 hover:opacity-85"
                        }`}
                      >
                        {m.attachment_type === "video" ? (
                          <div className="w-full h-full bg-stone-900 flex items-center justify-center text-white">
                            <Play className="w-3.5 h-3.5 fill-white" />
                          </div>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={m.attachment_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}


      {/* =========================================================================
          15. WHATSAPP DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl animate-scaleUp ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
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
                          ? "bg-gray-100 dark:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 text-gray-800 dark:text-gray-100"
                          : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        }`}
                    >
                      Delete for me
                    </button>

                    {/* Option 3: Cancel */}
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-gray-300 dark:border-slate-600 hover:text-gray-900 dark:hover:text-white text-gray-600 dark:text-gray-300 transition cursor-pointer text-center"
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
            className={`w-full max-w-md p-5 rounded-3xl border shadow-2xl flex flex-col max-h-[85vh] animate-scaleUp ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Forward className="w-5 h-5 text-red-600" />
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
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3a3020] bg-gray-50 dark:bg-[#100f0b]">
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
                                  ? "bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800"
                                  : "hover:border-red-300 dark:hover:border-[#5a4a32]"
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                  {b.name?.charAt(0) || "B"}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold truncate">{b.name}</div>
                                  <div className="text-[10px] text-gray-400 truncate">Batch Group</div>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${isTargetSelected
                                  ? "bg-red-600 border-red-600 text-white"
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
                                  ? "bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800"
                                  : "hover:border-red-300 dark:hover:border-[#5a4a32]"
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
                                  ? "bg-red-600 border-red-600 text-white"
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Forward className="w-3.5 h-3.5" />
                <span>Forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP CHAT WALLPAPER SELECTION MODAL
          ========================================================================= */}
      {showWallpaperModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={handleCloseWallpaperModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200/90 dark:border-[#3a3020] shadow-2xl p-5 select-none animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseWallpaperModal}
                  className="p-1 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                  title={openedFromChatOptions ? "Back to Chat Options" : "Close"}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Palette className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Chat Wallpaper</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseWallpaperModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {WALLPAPER_PRESETS.map((wp) => {
                const isSelected = chatWallpaper === wp.id;
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => handleSelectWallpaper(wp.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-red-500 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold shadow-2xs"
                        : "border-gray-200/80 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{wp.name}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{wp.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP MUTE NOTIFICATIONS MODAL
          ========================================================================= */}
      {showMuteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={handleCloseMuteModal}
        >
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 select-none animate-scaleUp ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-gray-200" : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseMuteModal}
                  className="p-1 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                  title={openedFromChatOptions ? "Back to Chat Options" : "Close"}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <VolumeX className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {isChatMuted ? "Unmute Notifications" : "Mute Notifications"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseMuteModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isChatMuted ? (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This chat is currently muted. Unmute to receive sound and push notifications again.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseMuteModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMute("unmute")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm cursor-pointer"
                  >
                    Unmute
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Other participants won't see that you muted this chat.
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "8 hours", val: "8 hours" },
                    { label: "1 week", val: "1 week" },
                    { label: "Always", val: "Always" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleToggleMute(opt.val)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-gray-200/80 dark:border-stone-800 hover:border-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/30 text-xs font-semibold text-gray-800 dark:text-gray-200 transition cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => playWhatsAppChime()}
                      className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Test Tone</span>
                    </button>
                    {desktopNotifState !== "granted" && (
                      <button
                        type="button"
                        onClick={requestDesktopNotifications}
                        className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      >
                        <Bell className="w-3 h-3" />
                        <span>Enable desktop alerts</span>
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseMuteModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP CLEAR CHAT CONFIRMATION MODAL
          ========================================================================= */}
      {confirmClearChatModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={handleCloseClearChatModal}
        >
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 select-none animate-scaleUp ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-gray-200" : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseClearChatModal}
                  className="p-1 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                  title={openedFromChatOptions ? "Back to Chat Options" : "Close"}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Clear this chat?</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseClearChatModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              This will clear all messages in this chat from your device. Messages will remain visible to other participants.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseClearChatModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClearChatConfirm();
                  setConfirmClearChatModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm cursor-pointer"
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP KEYBOARD SHORTCUTS MODAL
          ========================================================================= */}
      {showKeyboardShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={handleCloseKeyboardShortcutsModal}
        >
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 select-none animate-scaleUp ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-gray-200" : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseKeyboardShortcutsModal}
                  className="p-1 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                  title={openedFromChatOptions ? "Back to Chat Options" : "Close"}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
                  <p className="text-[10px] text-gray-500 dark:text-stone-400">WhatsApp Web desktop controls</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseKeyboardShortcutsModal}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Navigation & Search</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span>Search within chat</span>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-stone-800 font-mono text-[11px] border border-gray-300 dark:border-stone-700">Ctrl + F</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Keyboard shortcuts helper</span>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-stone-800 font-mono text-[11px] border border-gray-300 dark:border-stone-700">Ctrl + /</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Close drawers, search & modals</span>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-stone-800 font-mono text-[11px] border border-gray-300 dark:border-stone-700">Esc</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Browse gallery items</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-stone-800 font-mono text-[11px] border border-gray-300 dark:border-stone-700">←</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-stone-800 font-mono text-[11px] border border-gray-300 dark:border-stone-700">→</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-stone-800">
                <h4 className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Composing & Sending</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span>Send message</span>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-stone-800 font-mono text-[11px] border border-gray-300 dark:border-stone-700">{enterIsSend ? "Enter" : "Ctrl + Enter"}</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Insert new line</span>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-stone-800 font-mono text-[11px] border border-gray-300 dark:border-stone-700">Shift + Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Paste screenshot or copied file</span>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-stone-800 font-mono text-[11px] border border-gray-300 dark:border-stone-700">Ctrl + V</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Drag & drop files</span>
                    <span className="text-[11px] text-gray-500 dark:text-stone-400">Drag any file into chat</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowKeyboardShortcutsModal(false)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP MESSAGE INFO MODAL (Sent by, Sent at, Status & Group Delivery/Read Details)
          ========================================================================= */}
      {messageInfoModal && (() => {
        const isGroup = mode === "batch" || Boolean(batch?.id);
        const receipts = messageInfoModal.receipts || {};
        const infoSender =
          messageInfoModal.sender ||
          effectiveBatchMembers.find((m) => m.id === messageInfoModal.sender_id) ||
          (messageInfoModal.sender_id === currentUser?.id ? currentProfile : null) ||
          (messageInfoModal.sender_id === contact?.id ? contact : null) ||
          {};

        const sentTime = formatFullDateTime(messageInfoModal.created_at);
        const defaultDeliveredTime = messageInfoModal.delivered_at ? formatFullDateTime(messageInfoModal.delivered_at) : null;
        const defaultReadTime = messageInfoModal.read_at ? formatFullDateTime(messageInfoModal.read_at) : null;

        // Target members who receive this message (excluding sender)
        const recipientMembers = isGroup
          ? (effectiveBatchMembers?.length ? effectiveBatchMembers.filter((m) => m.id !== messageInfoModal.sender_id) : [])
          : (contact ? [contact] : []);

        // Read members: ONLY members who actually have their own read_at timestamp!
        const readMembers = isGroup
          ? recipientMembers.filter((m) => Boolean(receipts[m.id]?.read_at))
          : (messageInfoModal.read_at || receipts[contact?.id]?.read_at ? recipientMembers : []);

        // Delivered members: ONLY members who actually have their own delivered_at or read_at timestamp!
        const deliveredMembers = isGroup
          ? recipientMembers.filter((m) => Boolean(receipts[m.id]?.delivered_at || receipts[m.id]?.read_at))
          : (messageInfoModal.delivered_at || receipts[contact?.id]?.delivered_at ? recipientMembers : []);

        // Pending members: Members who haven't yet received delivery
        const pendingMembers = isGroup
          ? recipientMembers.filter((m) => !receipts[m.id]?.delivered_at && !receipts[m.id]?.read_at)
          : (deliveredMembers.length === 0 ? recipientMembers : []);

        const isAllRead = recipientMembers.length > 0 && readMembers.length === recipientMembers.length;

        return (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setMessageInfoModal(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp select-none ${
                isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Message Info</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Delivery and read receipts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMessageInfoModal(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body: Metadata (Sent by, Sent at, Status) + Group/Direct Delivery Breakdown */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
                {/* 1. Core Summary Card */}
                <div className="rounded-2xl border p-4 space-y-2.5 bg-gray-50/70 dark:bg-black/20 border-gray-100 dark:border-slate-800/80">
                  {/* Sent by */}
                  <div className="flex items-center justify-between gap-2 py-0.5 border-b border-gray-200/60 dark:border-slate-700/50 pb-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Sent by</span>
                    <span className="font-bold text-gray-900 dark:text-white truncate text-right">
                      {infoSender.full_name || infoSender.email || "Member"}{" "}
                      <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                        ({ROLE_DISPLAY_NAMES[infoSender.role] || infoSender.role || "Member"})
                      </span>
                    </span>
                  </div>

                  {/* Sent at */}
                  <div className="flex items-center justify-between gap-2 py-0.5 border-b border-gray-200/60 dark:border-slate-700/50 pb-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Sent at</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono text-xs sm:text-sm">
                      {sentTime}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between gap-2 py-0.5 pt-0.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Status</span>
                    {isGroup ? (
                      isAllRead ? (
                        <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                          <span>Read by everyone ({readMembers.length})</span>
                        </span>
                      ) : readMembers.length > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                          <span>Read by {readMembers.length} of {recipientMembers.length}</span>
                        </span>
                      ) : deliveredMembers.length > 0 ? (
                        <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4 stroke-[2.2]" />
                          <span>Delivered to {deliveredMembers.length} of {recipientMembers.length}</span>
                        </span>
                      ) : (
                        <span className="font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                          <Check className="w-4 h-4 stroke-[2.2]" />
                          <span>Sent to server</span>
                        </span>
                      )
                    ) : (
                      readMembers.length > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                          <span>Read</span>
                        </span>
                      ) : deliveredMembers.length > 0 ? (
                        <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4 stroke-[2.2]" />
                          <span>Delivered</span>
                        </span>
                      ) : (
                        <span className="font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                          <Check className="w-4 h-4 stroke-[2.2]" />
                          <span>Sent to server</span>
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* 2. Group / Direct Member Delivery Breakdown */}
                {isGroup ? (
                  <div className="space-y-3 pt-1">
                    {/* Read by Section */}
                    <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 overflow-hidden">
                      <div className="px-4 py-2.5 bg-red-50/50 dark:bg-red-950/20 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                          <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                          <span>Read by ({readMembers.length} of {recipientMembers.length})</span>
                        </div>
                      </div>

                      <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
                        {readMembers.length === 0 ? (
                          <div className="text-center py-3 text-xs text-gray-400 italic">
                            No participants have read this message yet
                          </div>
                        ) : (
                          readMembers.map((m) => {
                            const mReceipt = receipts[m.id] || {};
                            const mReadTime = mReceipt.read_at ? formatFullDateTime(mReceipt.read_at) : (defaultReadTime || "Read");

                            return (
                              <div key={m.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {m.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.avatar_url} alt={m.full_name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                      {m.full_name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-semibold text-xs truncate text-gray-900 dark:text-white">
                                      {m.full_name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 capitalize">
                                      {ROLE_DISPLAY_NAMES[m.role] || m.role}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-[11px] font-mono text-red-600 dark:text-red-400 shrink-0 font-medium">
                                  {mReadTime}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Delivered to Section */}
                    <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 overflow-hidden">
                      <div className="px-4 py-2.5 bg-gray-50/70 dark:bg-black/30 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          <CheckCheck className="w-4 h-4 text-gray-400 stroke-[2.2]" />
                          <span>Delivered to ({deliveredMembers.length} of {recipientMembers.length})</span>
                        </div>
                      </div>

                      <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
                        {deliveredMembers.length === 0 ? (
                          <div className="text-center py-3 text-xs text-gray-400 italic">
                            Waiting for participants to receive message
                          </div>
                        ) : (
                          deliveredMembers.map((m) => {
                            const mReceipt = receipts[m.id] || {};
                            const mDeliveredTime = mReceipt.delivered_at
                              ? formatFullDateTime(mReceipt.delivered_at)
                              : (mReceipt.read_at ? formatFullDateTime(mReceipt.read_at) : (defaultDeliveredTime || "Delivered"));

                            return (
                              <div key={m.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {m.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.avatar_url} alt={m.full_name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-gray-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                      {m.full_name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-semibold text-xs truncate text-gray-900 dark:text-white">
                                      {m.full_name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 capitalize">
                                      {ROLE_DISPLAY_NAMES[m.role] || m.role}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 shrink-0">
                                  {mDeliveredTime}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Pending Delivery Section */}
                    {pendingMembers.length > 0 && (
                      <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-50/70 dark:bg-black/30 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <Clock className="w-4 h-4 text-gray-400 stroke-[2.2]" />
                            <span>Pending Delivery ({pendingMembers.length})</span>
                          </div>
                          <span className="text-[11px] font-mono text-gray-400">
                            Waiting for device
                          </span>
                        </div>
                        <div className="p-2 space-y-1 max-h-36 overflow-y-auto">
                          {pendingMembers.map((m) => (
                            <div key={m.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition opacity-75">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {m.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={m.avatar_url} alt={m.full_name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-gray-400 dark:bg-gray-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {m.full_name?.charAt(0)?.toUpperCase() || "U"}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-semibold text-xs truncate text-gray-900 dark:text-white">
                                    {m.full_name}
                                  </div>
                                  <div className="text-[10px] text-gray-400 capitalize">
                                    {ROLE_DISPLAY_NAMES[m.role] || m.role}
                                  </div>
                                </div>
                              </div>
                              <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 shrink-0 font-medium">
                                Not delivered yet
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Direct 1-on-1 Message Delivery Breakdown */
                  <div className="space-y-3 pt-1">
                    {/* Read */}
                    <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-red-50/40 dark:bg-red-950/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCheck className="w-4 h-4 text-red-600 stroke-[2.5]" />
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">Read</div>
                          <div className="text-[11px] text-gray-400">{contact?.full_name || "Recipient"}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-red-600 dark:text-red-400 font-semibold">
                        {readMembers.length > 0 ? (receipts[contact?.id]?.read_at ? formatFullDateTime(receipts[contact?.id].read_at) : (defaultReadTime || "Read")) : "Not read yet"}
                      </div>
                    </div>

                    {/* Delivered */}
                    <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-black/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCheck className="w-4 h-4 text-gray-400 stroke-[2.2]" />
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">Delivered</div>
                          <div className="text-[11px] text-gray-400">{contact?.full_name || "Recipient"}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-gray-600 dark:text-gray-400 font-semibold">
                        {deliveredMembers.length > 0 ? (receipts[contact?.id]?.delivered_at ? formatFullDateTime(receipts[contact?.id].delivered_at) : (defaultDeliveredTime || "Delivered")) : "Not delivered yet"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMessageInfoModal(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          WHATSAPP POLL DETAILS / VOTES MODAL (Shows who voted for what)
          ========================================================================= */}
      {pollDetailsModal && (() => {
        let pollData = optimisticVotes[pollDetailsModal.id];
        if (!pollData) {
          try {
            pollData = typeof pollDetailsModal.message === "string" ? JSON.parse(pollDetailsModal.message) : pollDetailsModal.message;
          } catch {
            pollData = null;
          }
        }
        const question = pollData?.question || pollDetailsModal.attachment_name || "Poll";
        const options = Array.isArray(pollData?.options) ? pollData.options : [];
        const totalVotes = options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);

        return (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
            onClick={() => setPollDetailsModal(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp select-none ${
                isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="min-w-0 pr-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Poll Details & Voters</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base leading-snug break-words mt-1">
                    <RenderWithAppleEmojis text={question} />
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPollDetailsModal(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options & Voters breakdown list */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {options.map((opt) => {
                  const votesList = Array.isArray(opt.votes) ? opt.votes : [];
                  const count = votesList.length;
                  const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-2xl border ${
                        count > 0
                          ? "border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/15"
                          : "border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-black/20"
                      }`}
                    >
                      {/* Option Header: Name + Count + Pct */}
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center gap-1.5 min-w-0">
                          <RenderWithAppleEmojis text={opt.text} />
                        </div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0 flex items-center gap-1.5">
                          <span className="font-bold text-red-600 dark:text-red-400">{count} vote{count !== 1 ? "s" : ""}</span>
                          <span>•</span>
                          <span>{pct}%</span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden mb-3">
                        <div
                          className="h-full bg-red-600 transition-all duration-300 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* List of Voters */}
                      {count === 0 ? (
                        <div className="text-[11px] text-gray-400 italic py-1">
                          No votes yet for this option
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
                          {votesList.map((v, vIdx) => {
                            const voterId = typeof v === "string" ? v : v?.id;
                            const matchedMember = batchMembers.find((m) => m.id === voterId) || (currentUser?.id === voterId ? currentUser : null);
                            const voterName = (typeof v === "object" && v?.name) ? v.name : (matchedMember?.full_name || "Member");
                            const voterRole = (typeof v === "object" && v?.role) ? v.role : (matchedMember?.role || "Member");
                            const voterAvatar = (typeof v === "object" && v?.avatar_url) ? v.avatar_url : (matchedMember?.avatar_url || null);
                            const isMe = voterId === currentUser?.id;

                            return (
                              <div key={voterId || vIdx} className="py-2 flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {voterAvatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={voterAvatar} alt={voterName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                      {voterName?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                                      <span>{voterName}</span>
                                      {isMe && <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">(You)</span>}
                                    </div>
                                    <div className="text-[10px] text-gray-400 capitalize">
                                      {ROLE_DISPLAY_NAMES[voterRole] || voterRole}
                                    </div>
                                  </div>
                                </div>
                                {typeof v === "object" && v?.voted_at && (
                                  <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                                    {formatMessageTime(v.voted_at)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPollDetailsModal(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Microphone Permission & Device Guide Modal */}
      {showMicHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Microphone Access Guide</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Voice recording permissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMicHelpModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Steps */}
            <div className="p-5 space-y-3.5 text-xs text-gray-700 dark:text-gray-300">
              {/* Step 1: Browser permission */}
              <div className="p-3.5 rounded-2xl bg-red-50/80 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 text-xs">
                  <Mic className="w-3.5 h-3.5" />
                  <span>1. Browser permission allow karein</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-red-900 dark:text-red-200">
                  Browser URL bar me Microphone toggle <strong>ON</strong> karein, phir yahin se <strong>Try Recording Again</strong> tap karein. Page reload zaroori nahi hai.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowMicHelpModal(false);
                    handleStartRecording("audio");
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Try Recording Again</span>
                </button>
              </div>

              {/* Step 2: Windows OS Privacy */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 space-y-1.5">
                <span className="font-bold text-gray-900 dark:text-white block">
                  2. Windows Privacy Settings
                </span>
                <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                  Agar reload ke baad bhi na chale, to Windows Settings me check karein:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-600 dark:text-gray-400 pl-1">
                  <li><strong>Settings</strong> (Win + I) &rarr; <strong>Privacy & security</strong> &rarr; <strong>Microphone</strong></li>
                  <li>Ensure <strong>&quot;Microphone access&quot;</strong> ON hai.</li>
                  <li>Ensure <strong>&quot;Let desktop apps access your microphone&quot;</strong> (Google Chrome) ON hai.</li>
                </ul>
              </div>

              {/* Step 3: Check device */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 space-y-1">
                <span className="font-bold text-gray-900 dark:text-white block">
                  3. Active Microphone Device
                </span>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Ensure laptop mic ya headset/earphones connected aur unmuted hain.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-2 bg-gray-50/50 dark:bg-white/2">
              <button
                type="button"
                onClick={() => setShowMicHelpModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMicHelpModal(false);
                  handleStartRecording("audio");
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
              >
                Try Recording Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP CUSTOM CHAT LABELS PICKER MODAL
          ========================================================================= */}
      {showLabelPickerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={handleCloseLabelPickerModal}
        >
          <div
            className={`w-full max-w-sm rounded-3xl border shadow-2xl p-5 select-none animate-scaleUp ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-gray-200" : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseLabelPickerModal}
                  className="p-1 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                  title={openedFromChatOptions ? "Back to Chat Options" : "Close"}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Tag className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-black text-gray-900 dark:text-white">Chat Label</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseLabelPickerModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-2.5 text-xs text-gray-500 dark:text-gray-400">
              Assign a category tag to organize your chats effectively.
            </p>

            <div className="mt-4 space-y-2">
              {CHAT_LABEL_PRESETS.map((lbl) => {
                const isSelected = activeChatLabel === lbl.id;
                return (
                  <button
                    key={lbl.id}
                    type="button"
                    onClick={() => handleSetChatLabel(lbl.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-red-50/80 dark:bg-red-950/30 border-red-500/50 font-bold"
                        : "hover:bg-black/5 dark:hover:bg-white/5 border-gray-200/80 dark:border-stone-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${lbl.color}`}>
                        {lbl.name}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-red-600 dark:text-red-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-stone-800">
              {activeChatLabel ? (
                <button
                  type="button"
                  onClick={() => handleSetChatLabel(null)}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                >
                  Remove Label
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={handleCloseLabelPickerModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP DISAPPEARING MESSAGES MODAL
          ========================================================================= */}
      {showDisappearingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={handleCloseDisappearingModal}
        >
          <div
            className={`w-full max-w-sm rounded-3xl border shadow-2xl p-5 select-none animate-scaleUp ${
              isDark ? "bg-[#18150f] border-[#3a3020] text-gray-200" : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseDisappearingModal}
                  className="p-1 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                  title={openedFromChatOptions ? "Back to Chat Options" : "Close"}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-black text-gray-900 dark:text-white">Disappearing Messages</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseDisappearingModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-2.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              When enabled, messages in this chat will disappear after the selected timer duration.
            </p>

            <div className="mt-4 space-y-2">
              {[
                { id: "24h", label: "24 hours", desc: "Disappear after 1 day" },
                { id: "7d", label: "7 days", desc: "Disappear after 1 week" },
                { id: "90d", label: "90 days", desc: "Disappear after 3 months" },
                { id: "off", label: "Off", desc: "Messages will not disappear" },
              ].map((opt) => {
                const isSelected = disappearingTimer === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSetDisappearingTimer(opt.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-red-50/80 dark:bg-red-950/30 border-red-500/50"
                        : "hover:bg-black/5 dark:hover:bg-white/5 border-gray-200/80 dark:border-stone-800"
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-gray-400">{opt.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-red-600 dark:text-red-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end pt-3 border-t border-gray-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowDisappearingModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Non-Clipped WhatsApp Context Menu */}
      {renderFloatingDropdownMenu()}
    </div>
  );
}
