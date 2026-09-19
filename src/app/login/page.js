"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Camera,
  Clock,
  Compass,
  Copy,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Folder,
  Home,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Video,
  Wallet,
  X,
  Trash2,
  Upload,
  Edit3,
  Pencil,
  Save,
  Play,
  Pause,
  Paperclip,
  Download,
  File,
  Image as ImageIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Pagination from "@/components/Pagination";
import MemberProfileModal from "@/components/batch/MemberProfileModal";
import DailyReportModal from "@/components/batch/DailyReportModal";
import TaskDetailsModal from "@/components/batch/TaskDetailsModal";
import GlobalSearchModal from "@/components/batch/GlobalSearchModal";
import InternOverview from "@/components/batch/InternOverview";
import TeamLeaderOverview from "@/components/batch/TeamLeaderOverview";
import MentorOverview from "@/components/batch/MentorOverview";
import HrOverview from "@/components/batch/HrOverview";
import SupervisionPulsePanel from "@/components/batch/SupervisionPulsePanel";
import TexAppBatchChat from "@/components/batch/TexAppBatchChat";
import { supabase } from "@/lib/supabase";
import { safeExternalUrl, safeInternalPath } from "@/lib/safeUrl";
import { processImageToWebp } from "@/lib/imageProcessor";
import {
  createMeeting,
  createBatch,
  createBatchWorkspaceItem,
  updateBatch,
  updateBatchEscalation,
  createDailyUpdate,
  commentDailyUpdate,
  createNotification,
  createTaskReview,
  getCertificates,
  getAuditLogs,
  getBatches,
  getBatchWorkspace,
  getVisibleBatchEscalations,
  getAttendance,
  getCmsContent,
  getCmsVersions,
  getCloudLeads,
  getDailyUpdates,
  getMeetings,
  getBatchMessageSummary,
  getDirectMessageSummary,
  getMessages,
  getNotificationQueue,
  getNotifications,
  getProfiles,
  getSubmissionFileUrl,
  getTaskSubmissions,
  getTaskReviews,
  getTasks,
  issueCertificate,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  markAttendance,
  retryNotificationQueueItem,
  sendRealtimeMessage,
  updateRealtimeMessage,
  markDirectMessagesDelivered,
  markDirectMessagesRead,
  submitTaskWork,
  createCloudTask,
  createAuditLog,
  updateCloudTaskStatus,
  uploadSubmissionFile,
  uploadBatchFile,
  updateUserProfile,
  uploadAvatarImage,
  uploadTaskReferenceFile,
  upsertCmsContent,
} from "@/services/supabaseService";

function WhatsAppIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.972.531 1.777.817 2.796.817 3.18 0 5.767-2.587 5.767-5.768.001-3.181-2.584-5.767-5.767-5.767zm3.364 8.163c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.072-.497-1.756-.728-2.883-2.518-2.97-2.634-.087-.116-.711-.945-.711-1.8 0-.855.449-1.275.609-1.449.16-.174.348-.217.464-.217.116 0 .232.002.333.007.106.005.249-.04.39.299.144.348.492 1.203.535 1.29.043.087.072.189.014.305-.058.116-.087.188-.174.29-.087.102-.183.228-.261.306-.088.087-.179.182-.077.357.102.174.453.747.971 1.209.669.596 1.233.78 1.407.868.174.087.276.072.377-.044.102-.116.435-.508.551-.682.116-.174.232-.145.39-.087.16.058 1.014.478 1.188.565.174.087.29.13.333.203.044.072.044.42-.1.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.178L2 22l4.981-1.306C8.423 21.524 10.158 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.632 0-3.149-.49-4.417-1.332l-.317-.212-2.964.777.791-2.89-.233-.371C3.968 14.869 3.5 13.486 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z" />
    </svg>
  );
}

const ROLE_LABELS = {
  super_admin: "Super Admin",
  team_leader: "Team Leader",
  mentor: "Mentor",
  hr: "HR Manager",
  intern: "Intern",
};

const MESSAGE_EDIT_WINDOW_MS = 60 * 1000;

function emptyBatchWorkspaceData() {
  return {
    messages: [],
    announcements: [],
    resources: [],
    escalations: [],
    history: [],
  };
}

function chatTimestamp(value) {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function chatPreview(item, fallback = "No messages yet") {
  if (!item) return fallback;
  if (item.is_deleted) return "Message deleted";
  if (item.message) return item.message;
  if (item.attachment_name) return item.attachment_name;
  if (item.attachment_type) return "Attachment";
  return fallback;
}

function directChatRoomId(userId, contactId) {
  return [userId, contactId].filter(Boolean).sort().join("--");
}

const DOMAIN_OPTIONS = [
  { value: "frontend_dev", label: "Frontend Development" },
  { value: "backend_dev", label: "Backend Development" },
  { value: "web_dev", label: "Web Development (Full Stack)" },
  { value: "telecaller", label: "Telecaller & Inside Sales" },
  { value: "sales_executive", label: "Sales Executive & Client Relations" },
  { value: "marketing", label: "Digital Marketing & SEO" },
  { value: "video_editing", label: "Video Editing & Motion Graphics" },
  { value: "script_writing", label: "Script Writing & Content Creation" },
  { value: "ai_automation", label: "AI Automation & Chatbots" },
  { value: "design", label: "UI / UX Design & Branding" },
  { value: "management", label: "Operations & HR" },
  { value: "sales", label: "Client Sales & CRM" },
];

function domainLabel(value) {
  if (value === "digital_marketing") return "Digital Marketing & SEO";
  return DOMAIN_OPTIONS.find((item) => item.value === value)?.label || value || "General";
}

function profileDepartmentLabel(profile) {
  if (!profile) return "All Departments";
  if (profile.role === "super_admin") return "All Departments";
  if (profile.role === "hr") return "HR Management";
  return domainLabel(profile.domain);
}

function localDate(value) {
  if (!value) return "Open";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function deadlineState(task) {
  if (!task?.deadline) return "Upcoming";
  if (["approved", "completed"].includes(task.status)) return "Completed";
  const today = new Date();
  const due = new Date(task.deadline);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const diffDays = Math.round((dueStart - todayStart) / 86_400_000);
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due Today";
  if (diffDays === 1) return "Due Tomorrow";
  return "Upcoming";
}

function createTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const values = crypto.getRandomValues(new Uint32Array(18));
    return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  }
  return `TexWeb@${Date.now().toString(36)}${Math.floor(100000 + Math.random() * 900000)}`;
}

function getThemeSnapshot() {
  const saved = window.localStorage.getItem("texweb_theme");
  return saved === "dark" || saved === "light" ? saved : "light";
}

function subscribeToThemeChanges(onStoreChange) {
  const handleStorage = (event) => {
    if (!event.key || event.key === "texweb_theme") {
      onStoreChange();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener("texweb-theme-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("texweb-theme-change", onStoreChange);
  };
}

export default function LoginPage({ defaultSection = "overview" } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const attendanceLinkHandledRef = useRef(false);

  const theme = useSyncExternalStore(subscribeToThemeChanges, getThemeSnapshot, () => "light");

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    localStorage.setItem("texweb_theme", next);
    window.dispatchEvent(new Event("texweb-theme-change"));
  }

  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? "#100f0b" : "#ffffff");
  }, [isDark]);

  const [authMode, setAuthMode] = useState("signin");
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [setupLinks, setSetupLinks] = useState({});

  const [profileEditForm, setProfileEditForm] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    password: "",
    confirm: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProcessingMsg, setAvatarProcessingMsg] = useState("");
  const [avatarStats, setAvatarStats] = useState(null);

  const [activeSection, setActiveSection] = useState(defaultSection);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    hr: true,
    ops: true,
    comm: true,
    mgmt: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const timer = setTimeout(() => setSidebarOpen(false), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  function toggleMenu(key) {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function selectSection(sec) {
    setMobileMoreOpen(false);
    setActiveSection(sec);
    if (typeof window !== "undefined") {
      const isUnderAdmin = pathname?.startsWith("/admin") || window.location.pathname.startsWith("/admin") || userProfile?.role === "super_admin";
      const basePath = isUnderAdmin ? "/admin" : "/login";
      const url = new URL(window.location.href);
      url.pathname = basePath;
      url.searchParams.set("section", sec);
      window.history.replaceState({}, "", url.toString());
    }
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function openBatchWorkspace(batchId) {
    setSelectedBatchId(batchId);
    setBatchWorkspaceTab("overview");
    selectSection("batch_workspace");
  }

  function openDirectChatWithUser(userId) {
    if (!userId || !["super_admin", "hr", "mentor"].includes(userProfile?.role)) {
      setToast("Direct chat is available only for Super Admin, HR, and Mentor.");
      return;
    }
    setChatChannelTab("direct");
    setSelectedContactId(userId);
    setChatMobilePane("chat");
    selectSection("chat");
  }

  function handleDirectWhatsapp(phone, name, messageText = "") {
    if (!phone) {
      setToast("Phone number not available.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(messageText || `Hi ${name}, this is from TexWeb Solution.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [batches, setBatches] = useState([]);
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [cmsContent, setCmsContent] = useState([]);
  const [cmsVersions, setCmsVersions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [taskReviews, setTaskReviews] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [batchWorkspaceTab, setBatchWorkspaceTab] = useState("overview");
  const [batchWorkspaceData, setBatchWorkspaceData] = useState(() => emptyBatchWorkspaceData());
  const [batchWorkspaceBatchId, setBatchWorkspaceBatchId] = useState("");
  const [loadingBatchWorkspaceId, setLoadingBatchWorkspaceId] = useState("");
  const batchWorkspaceCacheRef = useRef({});
  const batchWorkspaceRequestRef = useRef("");
  const [accessibleEscalations, setAccessibleEscalations] = useState([]);
  const [batchMessageText, setBatchMessageText] = useState("");
  const [batchAnnouncementForm, setBatchAnnouncementForm] = useState({ title: "", body: "", category: "announcement", link_url: "", pinned: false });
  const [batchResourceForm, setBatchResourceForm] = useState({ title: "", category: "technical_guides", description: "", link_url: "", file_url: "" });
  const [batchEscalationModalOpen, setBatchEscalationModalOpen] = useState(false);
  const [batchEscalationForm, setBatchEscalationForm] = useState({ batch_id: "", assigned_to: "", issue: "", category: "general", priority: "medium", description: "", related_member_id: "", related_task_id: "" });
  const [escalationResolutionModal, setEscalationResolutionModal] = useState(null);
  const [batchTransferForm, setBatchTransferForm] = useState({ member_id: "", to_batch_id: "", note: "" });

  // Batch Announcement Attachments & Pagination
  const [announcementAttachment, setAnnouncementAttachment] = useState({
    file: null,
    previewUrl: "",
    fileName: "",
    fileType: "",
    uploading: false,
  });
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const [announcementsPerPage, setAnnouncementsPerPage] = useState(5);

  // Batch Files / Resources Uploads, Filtering & Pagination
  const [batchResourceFile, setBatchResourceFile] = useState({
    file: null,
    previewUrl: "",
    fileName: "",
    fileType: "",
    uploading: false,
  });
  const [filesPage, setFilesPage] = useState(1);
  const [filesPerPage, setFilesPerPage] = useState(10);
  const [filesCategoryFilter, setFilesCategoryFilter] = useState("all");
  const [filesSearch, setFilesSearch] = useState("");
  const [selectedSidebarBatchId, setSelectedSidebarBatchId] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editingResource, setEditingResource] = useState(null);

  // Batch Overview Activity Tab Search, Filtering & Pagination (Admin & HR)
  const [batchActivitySearch, setBatchActivitySearch] = useState("");
  const [batchActivityCategory, setBatchActivityCategory] = useState("all");
  const [batchActivityPage, setBatchActivityPage] = useState(1);
  const [batchActivityPerPage, setBatchActivityPerPage] = useState(10);

  // Modals
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [newMeetingModal, setNewMeetingModal] = useState(false);
  const [newCertModal, setNewCertModal] = useState(false);
  const [newMemberModal, setNewMemberModal] = useState(false);
  const [newBatchModal, setNewBatchModal] = useState(false);
  const [dailyUpdateModal, setDailyUpdateModal] = useState(false);
  const [dailyReportModalOpen, setDailyReportModalOpen] = useState(false);
  const [dailyCommentModal, setDailyCommentModal] = useState(null);
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [editMemberModal, setEditMemberModal] = useState(null);
  const [cmsModal, setCmsModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [submissionModal, setSubmissionModal] = useState(null);
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);
  const [taskDetailsModal, setTaskDetailsModal] = useState(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [shareLinkModal, setShareLinkModal] = useState(null);

  const [selectedContactId, setSelectedContactId] = useState("");
  const [chatChannelTab, setChatChannelTab] = useState("batches");
  const [chatMobilePane, setChatMobilePane] = useState("channels");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatText, setChatText] = useState("");
  const [batchChatMeta, setBatchChatMeta] = useState({});
  const [directChatMeta, setDirectChatMeta] = useState({});
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [workspaceOnlineUserIds, setWorkspaceOnlineUserIds] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingChannelRef = useRef(null);
  const directChatChannelRef = useRef(null);
  const directChatChannelRoomRef = useRef("");
  const directReadReceiptPendingRef = useRef(null);
  const directDeliveryReceiptPendingRef = useRef(null);
  const chatMobileHistoryGuardRef = useRef(false);
  const chatBackSuppressAutoOpenRef = useRef(false);
  const typingStopTimerRef = useRef(null);

  // Resizable WhatsApp Chat Sidebar (Left Panel)
  const [chatSidebarWidth, setChatSidebarWidth] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("texweb_chat_sidebar_width");
        if (saved) {
          const num = parseInt(saved, 10);
          if (!isNaN(num) && num >= 240 && num <= 600) return num;
        }
      } catch {}
    }
    return 360;
  });
  const [isDraggingChatDivider, setIsDraggingChatDivider] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (activeSection === "chat" && typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [activeSection]);

  useEffect(() => {
    if (!isDraggingChatDivider) return;

    const handleMouseMove = (e) => {
      if (!chatContainerRef.current) return;
      const rect = chatContainerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const maxAllowed = Math.min(rect.width * 0.65, 580);
      const clampedWidth = Math.max(250, Math.min(newWidth, maxAllowed));
      setChatSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingChatDivider(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingChatDivider]);

  useEffect(() => {
    try {
      localStorage.setItem("texweb_chat_sidebar_width", String(chatSidebarWidth));
    } catch {}
  }, [chatSidebarWidth]);
  const [submissionForm, setSubmissionForm] = useState({ submission_url: "", notes: "", file: null });
  const [memberFilter, setMemberFilter] = useState("all");

  const [memberForm, setMemberForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "intern",
    domain: "web_dev",
    batch_id: "",
    assigned_tl_id: "",
    assigned_mentor_id: "",
    temp_password: createTempPassword(),
  });

  const [batchForm, setBatchForm] = useState({
    name: "",
    batch_type: "internship",
    domain: "web_dev",
    hr_id: "",
    starts_at: "",
  });

  const [alertsFilter, setAlertsFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editBatchModal, setEditBatchModal] = useState(null);
  const [editBatchForm, setEditBatchForm] = useState({
    id: "",
    name: "",
    batch_type: "internship",
    domain: "web_dev",
    hr_id: "",
    status: "active",
    starts_at: "",
  });

  const [assignLeadsModal, setAssignLeadsModal] = useState(null);
  const [assignLeadsForm, setAssignLeadsForm] = useState({
    batch_id: "",
    batch_name: "",
    domain: "web_dev",
    mentor_id: "",
    tl_id: "",
  });

  const [dailyUpdateForm, setDailyUpdateForm] = useState({
    task_id: "",
    mentor_id: "",
    batch_id: "",
    summary: "",
    blockers: "",
    present_interns: "",
    absent_interns: "",
    completed_tasks: "",
    pending_tasks: "",
    tomorrow_plan: "",
    assigned_tasks: "",
    reviewer_comment: "",
    completed_count: 0,
    pending_count: 0,
  });
  const [dailyCommentText, setDailyCommentText] = useState("");

  const [reviewForm, setReviewForm] = useState({
    status: "reviewed",
    rating: 5,
    feedback: "",
  });
  const [attendanceForm, setAttendanceForm] = useState({
    user_id: "",
    batch_id: "",
    meeting_id: "",
    status: "present",
    notes: "",
  });
  const [editMemberForm, setEditMemberForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "intern",
    domain: "web_dev",
    status: "active",
    batch_id: "",
    assigned_tl_id: "",
    assigned_mentor_id: "",
    password: "",
  });
  const [cmsForm, setCmsForm] = useState({
    key: "homepage.hero",
    title: "",
    subtitle: "",
    body: "",
    cta: "",
    raw_json: "",
  });

  const [reviewCenterTab, setReviewCenterTab] = useState("all");
  const [reviewCenterSearch, setReviewCenterSearch] = useState("");
  const [reviewCenterBatchFilter, setReviewCenterBatchFilter] = useState("all");
  const [reviewCenterPage, setReviewCenterPage] = useState(1);
  const [reviewCenterRowsPerPage, setReviewCenterRowsPerPage] = useState(10);

  const [taskSubmissionsTab, setTaskSubmissionsTab] = useState("pending");
  const [taskSubmissionsSearch, setTaskSubmissionsSearch] = useState("");
  const [taskSubmissionsBatchFilter, setTaskSubmissionsBatchFilter] = useState("all");
  const [taskSubmissionsPage, setTaskSubmissionsPage] = useState(1);
  const [taskSubmissionsRowsPerPage, setTaskSubmissionsRowsPerPage] = useState(10);

  const [atRiskTab, setAtRiskTab] = useState("all");
  const [atRiskSearch, setAtRiskSearch] = useState("");
  const [atRiskBatchFilter, setAtRiskBatchFilter] = useState("all");
  const [atRiskPage, setAtRiskPage] = useState(1);
  const [atRiskRowsPerPage, setAtRiskRowsPerPage] = useState(10);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    domain: "web_dev",
    batch_id: "",
    assign_scope: "tl",
    assign_target: "",
    assigned_to: "",
    reference_url: "",
    reference_file: null,
    priority: "medium",
    start_date: "",
    expected_output: "",
    deadline: "",
  });

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    topic: "",
    meeting_type: "daily",
    scheduled_at: "",
    meeting_link: "https://meet.google.com/new",
    batch_id: "",
    attendee_id: "",
    attendance_token: "",
  });

  const [certForm, setCertForm] = useState({
    intern_name: "",
    intern_id: "",
    domain: "",
    start_date: "",
    end_date: "",
    performance_grade: "A+ Outstanding",
  });

  const currentRole = userProfile?.role || "intern";
  const isAdminRole = currentRole === "super_admin";
  const isHrRole = currentRole === "hr";
  const isMentor = currentRole === "mentor";
  const isTeamLeader = currentRole === "team_leader";
  const canAssignWork = isMentor || isTeamLeader;
  const canScheduleMeetings = isHrRole || isMentor || isTeamLeader;
  const canManageMembers = isAdminRole || isHrRole || isMentor || isTeamLeader;
  const canViewAllTeam = isAdminRole || isMentor;
  const canManageCredentials = isAdminRole || isHrRole;
  const canCreateBatch = isAdminRole;
  const canViewBatches = isAdminRole || isHrRole || isMentor || isTeamLeader || currentRole === "intern";
  const canIssueCertificates = isHrRole;
  const canUseCrm = ["sales", "sales_executive", "telecaller"].includes(userProfile?.domain);
  const canUseCms = false;
  const canSeeOperations = isHrRole || isMentor || isTeamLeader || currentRole === "intern";
  const canUseMessages = true;
  const canUseAlerts = true;
  const canAccessDirectChat = Boolean(isAdminRole || isHrRole || isMentor || isTeamLeader || currentRole === "intern");

  useEffect(() => {
    if (batchWorkspaceTab === "activity" && !isAdminRole && !isHrRole) {
      setBatchWorkspaceTab("overview");
    }
  }, [batchWorkspaceTab, isAdminRole, isHrRole]);

  useEffect(() => {
    if (canAccessDirectChat) return;
    if (chatChannelTab === "direct") setChatChannelTab("batches");
    if (selectedContactId) setSelectedContactId("");
  }, [canAccessDirectChat, chatChannelTab, selectedContactId]);
  const memberRoleOptions = useMemo(() => {
    if (isAdminRole) return [["hr", "HR Manager"]];
    if (isHrRole) return [["mentor", "Mentor"], ["intern", "Intern"]];
    return [];
  }, [isAdminRole, isHrRole]);
  const memberModalRoleLabel = ROLE_LABELS[memberForm.role] || "Member";

  const ownedBatchIds = useMemo(() => {
    if (!sessionUser?.id) return new Set();
    if (isHrRole) return new Set(batches.map((batch) => batch.id));
    if (isMentor) {
      return new Set(
        batches
          .filter((batch) => batch.mentor_id === sessionUser.id || batch.mentor?.id === sessionUser.id || batch.id === userProfile?.batch_id)
          .map((batch) => batch.id)
      );
    }
    if (isTeamLeader || currentRole === "intern") return new Set([userProfile?.batch_id].filter(Boolean));
    return new Set(batches.map((batch) => batch.id));
  }, [batches, currentRole, isHrRole, isMentor, isTeamLeader, sessionUser?.id, userProfile?.batch_id]);

  const ownedBatches = useMemo(() => batches.filter((batch) => ownedBatchIds.has(batch.id)), [batches, ownedBatchIds]);
  const escalationBatchOptions = useMemo(() => {
    if (isAdminRole) return batches;
    if (isHrRole || isMentor) return ownedBatches;
    if (isTeamLeader) return batches.filter((batch) => batch.id === userProfile?.batch_id);
    return [];
  }, [batches, currentRole, isAdminRole, isHrRole, isMentor, isTeamLeader, ownedBatches, userProfile?.batch_id]);

  const accessibleFileBatches = useMemo(() => {
    if (isAdminRole || isHrRole) return batches;
    if (isMentor) {
      const mb = batches.filter((b) => b.mentor_id === userProfile?.id || b.mentor_ids?.includes(userProfile?.id) || ownedBatchIds.has(b.id));
      return mb.length > 0 ? mb : ownedBatches;
    }
    if (isTeamLeader || currentRole === "intern") {
      const userBatch = batches.find((b) => b.id === userProfile?.batch_id);
      return userBatch ? [userBatch] : [];
    }
    return batches;
  }, [batches, currentRole, isAdminRole, isHrRole, isMentor, isTeamLeader, ownedBatchIds, ownedBatches, userProfile?.batch_id, userProfile?.id]);

  const selectedEscalationBatch = useMemo(() => {
    const targetId = batchEscalationForm.batch_id || escalationBatchOptions[0]?.id || "";
    return escalationBatchOptions.find((batch) => batch.id === targetId) || null;
  }, [batchEscalationForm.batch_id, escalationBatchOptions]);

  const escalationBatchMembers = useMemo(() => {
    if (!selectedEscalationBatch?.id) return [];
    return profiles.filter((profile) => profile.batch_id === selectedEscalationBatch.id);
  }, [profiles, selectedEscalationBatch?.id]);

  const escalationAssigneeOptions = useMemo(() => {
    if (!selectedEscalationBatch?.id) return [];
    const linkedIds = [
      selectedEscalationBatch.hr_id,
      selectedEscalationBatch.mentor_id,
      selectedEscalationBatch.tl_id,
    ].filter(Boolean);
    const candidates = profiles.filter((profile) => {
      if (profile.id === sessionUser?.id) return false;
      if (profile.role === "intern") return false;
      if (profile.role === "super_admin") return true;
      if (linkedIds.includes(profile.id)) return true;
      if (profile.batch_id === selectedEscalationBatch.id && ["hr", "mentor", "team_leader"].includes(profile.role)) return true;
      return false;
    });
    return candidates.filter((profile, index, list) => profile?.id && list.findIndex((item) => item.id === profile.id) === index);
  }, [profiles, selectedEscalationBatch, sessionUser?.id]);

  const selectedEscalationAssignee = useMemo(() => {
    return escalationAssigneeOptions.find((profile) => profile.id === batchEscalationForm.assigned_to) || null;
  }, [batchEscalationForm.assigned_to, escalationAssigneeOptions]);

  const allSupervisedSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const task = tasks.find((t) => t.id === s.task_id);
      if (!task) return false;
      if (isAdminRole) return true;
      if (isHrRole) return ownedBatchIds.has(task.batch_id);
      if (isMentor) return ownedBatchIds.has(task.batch_id);
      if (isTeamLeader) return userProfile?.batch_id === task.batch_id;
      return false;
    });
  }, [submissions, tasks, isAdminRole, isHrRole, isMentor, isTeamLeader, ownedBatchIds, userProfile?.batch_id]);

  const pendingSubmissionsCount = useMemo(() => {
    return allSupervisedSubmissions.filter((s) => {
      const task = tasks.find((t) => t.id === s.task_id);
      return task && !["approved", "completed"].includes(task.status);
    }).length;
  }, [allSupervisedSubmissions, tasks]);

  const mentorReviewCenterData = useMemo(() => {
    const escalations = (accessibleEscalations || []).filter((e) => {
      return e.created_by === sessionUser?.id || e.assigned_to === sessionUser?.id;
    });
    const openEscalations = escalations.filter((e) => e.status === "open");
    const criticalEscalations = escalations.filter((e) => ["critical", "urgent", "high"].includes(e.priority));
    const resolvedEscalations = escalations.filter((e) => e.status === "resolved");

    return {
      all: escalations,
      open: openEscalations,
      critical: criticalEscalations,
      resolved: resolvedEscalations,
      raisedByMe: escalations.filter((e) => e.created_by === sessionUser?.id),
      assignedToMe: escalations.filter((e) => e.assigned_to === sessionUser?.id),
      total: openEscalations.length,
    };
  }, [accessibleEscalations, sessionUser?.id]);

  const mentorAtRiskMembers = useMemo(() => {
    if (!isAdminRole && !isHrRole && !isMentor) return [];
    const batchInterns = profiles.filter(
      (p) => p.role === "intern" && (isAdminRole || ownedBatchIds.has(p.batch_id))
    );
    return batchInterns
      .map((intern) => {
        const userAtt = attendance.filter((a) => a.user_id === intern.id);
        const attRate = userAtt.length > 0
          ? Math.round((userAtt.filter((a) => a.status === "present").length / userAtt.length) * 100)
          : 100;
        const overdueTasks = tasks.filter(
          (t) =>
            (t.assigned_to === intern.id || t.visible_to_interns) &&
            t.deadline &&
            new Date(t.deadline) < new Date() &&
            !["approved", "completed"].includes(t.status)
        );
        let riskLevel = "good";
        if (attRate < 70 || overdueTasks.length >= 2) riskLevel = "critical";
        else if (attRate < 85 || overdueTasks.length >= 1) riskLevel = "warning";

        return {
          ...intern,
          attendanceRate: attRate,
          overdueCount: overdueTasks.length,
          overdueTasks,
          riskLevel,
        };
      })
      .filter((m) => m.riskLevel !== "good")
      .sort((a, b) => (a.riskLevel === "critical" ? -1 : 1));
  }, [isAdminRole, isHrRole, isMentor, profiles, ownedBatchIds, attendance, tasks]);

  const filteredTaskSubmissions = useMemo(() => {
    return allSupervisedSubmissions.filter((s) => {
      const task = tasks.find((t) => t.id === s.task_id);
      const isApproved = ["approved", "completed"].includes(task?.status);

      if (taskSubmissionsTab === "pending" && isApproved) return false;
      if (taskSubmissionsTab === "approved" && !isApproved) return false;

      if (taskSubmissionsBatchFilter !== "all" && task?.batch_id !== taskSubmissionsBatchFilter) return false;

      if (taskSubmissionsSearch.trim()) {
        const q = taskSubmissionsSearch.toLowerCase();
        const b = batches.find((item) => item.id === task?.batch_id);
        return (
          task?.title?.toLowerCase().includes(q) ||
          s.intern?.full_name?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q) ||
          s.submission_url?.toLowerCase().includes(q) ||
          b?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allSupervisedSubmissions, tasks, taskSubmissionsTab, taskSubmissionsBatchFilter, taskSubmissionsSearch, batches]);

  const filteredOpenEscalations = useMemo(() => {
    let list = mentorReviewCenterData.all;
    if (reviewCenterTab === "open") list = mentorReviewCenterData.open;
    else if (reviewCenterTab === "critical") list = mentorReviewCenterData.critical;
    else if (reviewCenterTab === "resolved") list = mentorReviewCenterData.resolved;
    else if (reviewCenterTab === "mine") list = mentorReviewCenterData.raisedByMe;
    else if (reviewCenterTab === "assigned") list = mentorReviewCenterData.assignedToMe;

    return list.filter((e) => {
      if (reviewCenterBatchFilter !== "all" && e.batch_id !== reviewCenterBatchFilter) return false;
      if (reviewCenterSearch.trim()) {
        const q = reviewCenterSearch.toLowerCase();
        const b = batches.find((item) => item.id === e.batch_id);
        return (
          e.issue?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          b?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mentorReviewCenterData, reviewCenterTab, reviewCenterBatchFilter, reviewCenterSearch, batches]);

  const filteredAtRiskMembers = useMemo(() => {
    return mentorAtRiskMembers.filter((m) => {
      if (atRiskTab === "critical" && m.riskLevel !== "critical") return false;
      if (atRiskTab === "warning" && m.riskLevel !== "warning") return false;
      if (atRiskBatchFilter !== "all" && m.batch_id !== atRiskBatchFilter) return false;
      if (atRiskSearch.trim()) {
        const q = atRiskSearch.toLowerCase();
        const b = batches.find((item) => item.id === m.batch_id);
        return (
          m.full_name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.phone?.includes(q) ||
          b?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mentorAtRiskMembers, atRiskTab, atRiskBatchFilter, atRiskSearch, batches]);

  // 1. Task Submissions Pagination
  const totalTaskSubmissions = filteredTaskSubmissions.length;
  const totalTaskSubmissionsPages = Math.max(1, Math.ceil(totalTaskSubmissions / taskSubmissionsRowsPerPage));
  const safeTaskSubmissionsPage = Math.min(Math.max(1, taskSubmissionsPage), totalTaskSubmissionsPages);
  const taskSubmissionsStartIndex = totalTaskSubmissions === 0 ? 0 : (safeTaskSubmissionsPage - 1) * taskSubmissionsRowsPerPage;
  const paginatedTaskSubmissions = filteredTaskSubmissions.slice(
    taskSubmissionsStartIndex,
    taskSubmissionsStartIndex + taskSubmissionsRowsPerPage
  );

  // 2. Review Center Escalations Pagination
  const totalReviewCenterItems = filteredOpenEscalations.length;
  const totalReviewCenterPages = Math.max(1, Math.ceil(totalReviewCenterItems / reviewCenterRowsPerPage));
  const safeReviewCenterPage = Math.min(Math.max(1, reviewCenterPage), totalReviewCenterPages);
  const reviewCenterStartIndex = totalReviewCenterItems === 0 ? 0 : (safeReviewCenterPage - 1) * reviewCenterRowsPerPage;
  const paginatedReviewCenterEscalations = filteredOpenEscalations.slice(
    reviewCenterStartIndex,
    reviewCenterStartIndex + reviewCenterRowsPerPage
  );

  // 3. At-Risk Intern Watchlist Pagination
  const totalAtRiskItems = filteredAtRiskMembers.length;
  const totalAtRiskPages = Math.max(1, Math.ceil(totalAtRiskItems / atRiskRowsPerPage));
  const safeAtRiskPage = Math.min(Math.max(1, atRiskPage), totalAtRiskPages);
  const atRiskStartIndex = totalAtRiskItems === 0 ? 0 : (safeAtRiskPage - 1) * atRiskRowsPerPage;
  const paginatedAtRiskMembers = filteredAtRiskMembers.slice(
    atRiskStartIndex,
    atRiskStartIndex + atRiskRowsPerPage
  );

  useEffect(() => {
    setTaskSubmissionsPage(1);
  }, [taskSubmissionsTab, taskSubmissionsSearch, taskSubmissionsBatchFilter]);

  useEffect(() => {
    setReviewCenterPage(1);
  }, [reviewCenterTab, reviewCenterSearch, reviewCenterBatchFilter]);

  useEffect(() => {
    setAtRiskPage(1);
  }, [atRiskTab, atRiskSearch, atRiskBatchFilter]);

  const visibleProfiles = useMemo(() => {
    if (!profiles.length) return [];
    if (currentRole === "super_admin") return profiles.filter((profile) => profile.role === "hr");
    if (currentRole === "hr") return profiles.filter((profile) => ["mentor", "team_leader", "intern"].includes(profile.role) && ownedBatchIds.has(profile.batch_id));
    if (currentRole === "mentor") {
      return profiles.filter((profile) => profile.id === sessionUser?.id || (["intern", "team_leader"].includes(profile.role) && ownedBatchIds.has(profile.batch_id)));
    }
    if (currentRole === "team_leader") {
      return profiles.filter((profile) => profile.id === sessionUser?.id || (profile.role === "intern" && profile.batch_id === userProfile?.batch_id) || profile.id === userProfile?.assigned_mentor_id);
    }
    return profiles.filter((profile) => profile.id === sessionUser?.id);
  }, [currentRole, ownedBatchIds, profiles, sessionUser?.id, userProfile?.assigned_mentor_id, userProfile?.batch_id]);

  const taskAssignmentOptions = useMemo(() => {
    if (isMentor) {
      const selectedBatch = ownedBatches.find((batch) => batch.id === taskForm.batch_id);
      if (!selectedBatch) return [];
      const batchProfiles = [
        ...(selectedBatch.members || []),
        ...profiles.filter((profile) => profile.batch_id === selectedBatch.id),
      ].filter((profile, index, list) => profile?.id && list.findIndex((item) => item.id === profile.id) === index);
      const assignedTl = selectedBatch.tl || profiles.find((profile) => profile.id === selectedBatch.tl_id) || batchProfiles.find((profile) => profile.role === "team_leader");
      const interns = batchProfiles.filter((profile) => profile.role === "intern");
      const options = [
        ...(assignedTl ? [[`tl:${assignedTl.id}`, `Assigned TL only - ${assignedTl.full_name}`]] : []),
        ...(interns.length ? [[`interns:${selectedBatch.id}`, `All batch interns (${interns.length})`]] : []),
        ...(assignedTl && interns.length ? [[`both:${assignedTl.id}`, `Assigned TL + all batch interns (${interns.length})`]] : []),
        ...interns.map((i) => [`intern:${i.id}`, `Intern: ${i.full_name}`]),
      ];
      return options.length ? options : [["", "No TL or intern found in this batch"]];
    }
    if (isTeamLeader) return profiles.filter((profile) => profile.role === "intern" && profile.batch_id === userProfile?.batch_id).map((profile) => [profile.id, profile.full_name]);
    return [];
  }, [isMentor, isTeamLeader, ownedBatches, profiles, taskForm.batch_id, userProfile?.batch_id]);

  const meetingTargetProfiles = useMemo(() => {
    if (isHrRole) return visibleProfiles.filter((profile) => ["mentor", "team_leader", "intern"].includes(profile.role));
    if (isMentor) return visibleProfiles.filter((profile) => ["team_leader", "intern"].includes(profile.role));
    if (isTeamLeader) return visibleProfiles.filter((profile) => profile.role === "intern" && profile.batch_id === userProfile?.batch_id);
    return [];
  }, [isHrRole, isMentor, isTeamLeader, userProfile?.batch_id, visibleProfiles]);

  const memberDirectory = useMemo(() => {
    if (isAdminRole || isHrRole) return visibleProfiles;
    if (isMentor) {
      const roster = [];
      const addProfile = (profile, batch = null, fallbackRole = "") => {
        if (!profile?.id) return;
        roster.push({
          ...profile,
          role: profile.role || fallbackRole || "member",
          batch_id: profile.batch_id || batch?.id || "",
          batch_name: batch?.name || profile.batch_name || "",
          domain: batch?.domain || profile.domain || "",
        });
      };

      ownedBatches.forEach((batch) => {
        (batch.admins || []).forEach((adminProfile) => addProfile(adminProfile, batch, adminProfile.role || "admin"));
        addProfile(batch.hr || profiles.find((profile) => profile.id === batch.hr_id), batch, "hr");
        addProfile(batch.mentor || profiles.find((profile) => profile.id === batch.mentor_id), batch, "mentor");
        addProfile(batch.tl || profiles.find((profile) => profile.id === batch.tl_id || profile.id === batch.team_leader_id), batch, "team_leader");
        (batch.members || []).forEach((member) => addProfile(member, batch));
        profiles
          .filter(
            (profile) =>
              profile.batch_id === batch.id ||
              profile.id === batch.hr_id ||
              profile.id === batch.mentor_id ||
              profile.id === batch.tl_id ||
              profile.id === batch.team_leader_id ||
              profile.id === batch.trainer_id
          )
          .forEach((profile) => addProfile(profile, batch));
      });

      if (userProfile?.id) addProfile(userProfile, ownedBatches.find((batch) => batch.id === userProfile.batch_id), "mentor");
      return roster.filter((profile, index, list) => profile?.id && list.findIndex((item) => item.id === profile.id) === index);
    }
    if (isTeamLeader) return [];
    return visibleProfiles;
  }, [isAdminRole, isHrRole, isMentor, isTeamLeader, ownedBatches, profiles, userProfile, visibleProfiles]);

  const hrAssignableMentors = useMemo(() => {
    if (!isHrRole) return [];
    const mentorIdsFromHrBatches = new Set(
      batches
        .filter((batch) => ownedBatchIds.has(batch.id))
        .map((batch) => batch.mentor_id || batch.mentor?.id)
        .filter(Boolean)
    );
    return profiles
      .filter(
        (profile) =>
          profile.role === "mentor" &&
          (ownedBatchIds.has(profile.batch_id) || mentorIdsFromHrBatches.has(profile.id))
      )
      .filter((profile, index, list) => profile?.id && list.findIndex((item) => item.id === profile.id) === index);
  }, [batches, isHrRole, ownedBatchIds, profiles]);

  const directContactSource = useMemo(() => {
    const candidates = [...(profiles || [])];
    const pushProfile = (profile) => {
      if (profile?.id) candidates.push(profile);
    };

    (batches || []).forEach((batch) => {
      (batch.admins || []).forEach(pushProfile);
      pushProfile(batch.hr);
      pushProfile(batch.mentor);
      pushProfile(batch.tl);
      pushProfile(batch.team_leader);
      pushProfile(batch.trainer);
      (batch.members || []).forEach(pushProfile);
    });

    if (userProfile?.id) pushProfile(userProfile);

    return candidates.filter((profile, index, list) => profile?.id && list.findIndex((item) => item.id === profile.id) === index);
  }, [batches, profiles, userProfile]);

  const chatContacts = useMemo(() => {
    if (!sessionUser?.id || !userProfile || !canAccessDirectChat) return [];
    const contactList = directContactSource.filter((p) => {
      if (!p?.id) return false;
      if (isAdminRole || isHrRole) return true;
      if (isMentor) {
        if (p.id === sessionUser.id || p.id === userProfile.id) return true;
        if (["super_admin", "admin", "hr"].includes(p.role)) return true;
        return ["team_leader", "intern"].includes(p.role) && ownedBatchIds.has(p.batch_id);
      }
      if (isTeamLeader || currentRole === "intern") {
        if (p.id === sessionUser.id || p.id === userProfile.id) return true;
        if (["super_admin", "admin", "hr"].includes(p.role)) return true;
        if (p.role === "mentor") {
          return p.id === userProfile.assigned_mentor_id || ownedBatches.some((batch) => p.id === batch.mentor_id || p.id === batch.mentor?.id);
        }
        return false;
      }
      return p.id === sessionUser.id || p.id === userProfile.id;
    });
    if (!contactList.some((p) => p.id === userProfile.id)) {
      contactList.unshift(userProfile);
    }
    return contactList.filter((p, index, list) => list.findIndex((item) => item.id === p.id) === index);
  }, [sessionUser?.id, userProfile, canAccessDirectChat, directContactSource, isAdminRole, isHrRole, isMentor, isTeamLeader, currentRole, ownedBatchIds, ownedBatches]);

  const workspaceOnlineSet = useMemo(() => new Set(workspaceOnlineUserIds), [workspaceOnlineUserIds]);

  const directChatStats = useMemo(() => {
    const total = chatContacts.length;
    const online = chatContacts.filter((contact) => workspaceOnlineSet.has(contact.id)).length;
    return { total, online, offline: Math.max(0, total - online) };
  }, [chatContacts, workspaceOnlineSet]);

  const getBatchAvatarUrl = (batch) => {
    if (typeof batch?.avatar_url === "string" && batch.avatar_url.trim()) return batch.avatar_url.trim();
    return "";
  };

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

  const availableChatBatches = useMemo(() => {
    return batches.filter(
      (b) => isAdminRole || isHrRole || ownedBatchIds.has(b.id) || b.id === userProfile?.batch_id
    );
  }, [batches, isAdminRole, isHrRole, ownedBatchIds, userProfile?.batch_id]);

  const availableChatBatchIds = useMemo(() => availableChatBatches.map((batch) => batch.id).filter(Boolean), [availableChatBatches]);

  const batchNotificationMeta = useMemo(() => {
    const meta = {};
    (notifications || []).forEach((item) => {
      const batchId =
        item?.metadata?.batch_id ||
        (() => {
          try {
            const url = new URL(item?.link_url || "", "https://texweb.local");
            return url.searchParams.get("batch_id");
          } catch {
            return "";
          }
        })();
      if (!batchId) return;
      const existing = meta[batchId] || { unreadCount: 0, lastMessageTime: 0, lastMessagePreview: "" };
      const itemTime = chatTimestamp(item.created_at);
      meta[batchId] = {
        unreadCount: existing.unreadCount + (item.is_read ? 0 : 1),
        lastMessageTime: Math.max(existing.lastMessageTime || 0, itemTime),
        lastMessagePreview: itemTime >= (existing.lastMessageTime || 0) ? item.title || item.message || "New notification" : existing.lastMessagePreview,
      };
    });
    return meta;
  }, [notifications]);

  // Sort batches dynamically: Most recent message appears on top (WhatsApp style)
  const sortedChatBatches = useMemo(() => {
    return [...availableChatBatches].sort((a, b) => {
      const timeA = Math.max(
        chatTimestamp(batchChatMeta[a.id]?.lastMessageTime),
        chatTimestamp(batchNotificationMeta[a.id]?.lastMessageTime),
        chatTimestamp(a.updated_at || a.created_at)
      );
      const timeB = Math.max(
        chatTimestamp(batchChatMeta[b.id]?.lastMessageTime),
        chatTimestamp(batchNotificationMeta[b.id]?.lastMessageTime),
        chatTimestamp(b.updated_at || b.created_at)
      );
      return timeB - timeA;
    });
  }, [availableChatBatches, batchChatMeta, batchNotificationMeta]);

  const filteredChatBatches = useMemo(() => {
    if (!chatSearchQuery.trim()) return sortedChatBatches;
    const q = chatSearchQuery.toLowerCase();
    return sortedChatBatches.filter(
      (b) => b.name?.toLowerCase().includes(q) || b.domain?.toLowerCase().includes(q)
    );
  }, [sortedChatBatches, chatSearchQuery]);

  // Sort contacts dynamically: Most recent message appears on top (WhatsApp style)
  const sortedChatContacts = useMemo(() => {
    return [...chatContacts].sort((a, b) => {
      const timeA = chatTimestamp(directChatMeta[a.id]?.lastMessageTime);
      const timeB = chatTimestamp(directChatMeta[b.id]?.lastMessageTime);
      if (timeA !== timeB) return timeB - timeA;
      const unreadA = directChatMeta[a.id]?.unreadCount || 0;
      const unreadB = directChatMeta[b.id]?.unreadCount || 0;
      if (unreadA !== unreadB) return unreadB - unreadA;
      const aIsSelf = a.id === sessionUser?.id || a.id === userProfile?.id || (a.email && a.email === userProfile?.email);
      const bIsSelf = b.id === sessionUser?.id || b.id === userProfile?.id || (b.email && b.email === userProfile?.email);
      if (aIsSelf) return -1;
      if (bIsSelf) return 1;
      return (a.full_name || "").localeCompare(b.full_name || "");
    });
  }, [chatContacts, directChatMeta, sessionUser?.id, userProfile?.id, userProfile?.email]);

  const filteredChatContacts = useMemo(() => {
    if (!chatSearchQuery.trim()) return sortedChatContacts;
    const q = chatSearchQuery.toLowerCase();
    return sortedChatContacts.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q) ||
        c.domain?.toLowerCase().includes(q)
    );
  }, [sortedChatContacts, chatSearchQuery]);

  useEffect(() => {
    if (!selectedContactId) return;
    if (chatContacts.some((contact) => contact.id === selectedContactId)) return;
    setSelectedContactId("");
    setChatMobilePane("channels");
  }, [chatContacts, selectedContactId]);

  useEffect(() => {
    if (!sessionUser?.id || availableChatBatchIds.length === 0) {
      setBatchChatMeta({});
      return undefined;
    }
    let cancelled = false;
    async function loadBatchChatSummary() {
      const rows = await getBatchMessageSummary(availableChatBatchIds);
      if (cancelled) return;
      const nextMeta = {};
      (rows || []).forEach((item) => {
        if (!item?.batch_id) return;
        const existing = nextMeta[item.batch_id];
        if (existing && chatTimestamp(existing.lastMessageTime) >= chatTimestamp(item.created_at)) return;
        nextMeta[item.batch_id] = {
          ...(nextMeta[item.batch_id] || {}),
          lastMessageTime: item.created_at,
          lastMessagePreview: chatPreview(item),
          lastMessageSenderId: item.sender_id || "",
        };
      });
      setBatchChatMeta((prev) => {
        const merged = { ...nextMeta };
        Object.keys(prev || {}).forEach((batchId) => {
          if (!merged[batchId]) merged[batchId] = prev[batchId];
          else merged[batchId] = { ...merged[batchId], unreadCount: prev[batchId]?.unreadCount || 0 };
        });
        return merged;
      });
    }
    loadBatchChatSummary();
    return () => {
      cancelled = true;
    };
  }, [sessionUser?.id, availableChatBatchIds]);

  useEffect(() => {
    if (!sessionUser?.id || !canAccessDirectChat) {
      setDirectChatMeta({});
      return undefined;
    }
    let cancelled = false;
    async function loadDirectChatSummary() {
      const rows = await getDirectMessageSummary(sessionUser.id);
      if (cancelled) return;
      const nextMeta = {};
      (rows || []).forEach((item) => {
        const otherId = item.sender_id === sessionUser.id ? item.receiver_id : item.sender_id;
        if (!otherId) return;
        const existing = nextMeta[otherId] || { unreadCount: 0, lastMessageTime: 0, lastMessagePreview: "" };
        const itemTime = chatTimestamp(item.created_at);
        nextMeta[otherId] = {
          unreadCount: existing.unreadCount + (item.receiver_id === sessionUser.id && !item.is_read ? 1 : 0),
          lastMessageTime: itemTime > chatTimestamp(existing.lastMessageTime) ? item.created_at : existing.lastMessageTime,
          lastMessagePreview: itemTime > chatTimestamp(existing.lastMessageTime) ? chatPreview(item) : existing.lastMessagePreview,
          lastMessageSenderId: itemTime > chatTimestamp(existing.lastMessageTime) ? item.sender_id : existing.lastMessageSenderId,
        };
      });
      setDirectChatMeta(nextMeta);
    }
    loadDirectChatSummary();
    return () => {
      cancelled = true;
    };
  }, [sessionUser?.id, canAccessDirectChat]);

  const combinedMembers = useMemo(() => {
    return memberDirectory.map((profile) => {
      const tl = profiles.find((item) => item.id === profile.assigned_tl_id);
      const mentor = profiles.find((item) => item.id === profile.assigned_mentor_id);
      const batch = batches.find((item) => item.id === profile.batch_id);
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || "",
        role: profile.role,
        domain: batch?.domain || profile.domain,
        status: profile.status || "active",
        batch_id: profile.batch_id || "",
        batch_name: batch?.name || profile.batch_name || "",
        batch: batch?.name || profile.batch_name || "Unassigned",
        assigned_tl: tl?.full_name || mentor?.full_name || "Unassigned",
        avatar_url: profile.avatar_url || "",
        setup_link: setupLinks[profile.id] || "",
        cloud: true,
      };
    });
  }, [batches, memberDirectory, profiles, setupLinks]);

  const resolveBatchLead = (batch, role) => {
    if (!batch) return null;
    if (role === "hr") {
      return (
        batch.hr ||
        profiles.find((profile) => profile.id === batch.hr_id) ||
        (batch.hr_id ? { id: batch.hr_id, full_name: "Assigned HR", email: "" } : null)
      );
    }
    if (role === "mentor") {
      return (
        batch.mentor ||
        profiles.find((profile) => profile.id === batch.mentor_id) ||
        profiles.find((profile) => profile.role === "mentor" && profile.batch_id === batch.id) ||
        (isMentor && userProfile?.batch_id === batch.id ? userProfile : null)
      );
    }
    if (role === "team_leader") {
      return (
        batch.tl ||
        profiles.find((profile) => profile.id === batch.tl_id) ||
        profiles.find((profile) => profile.role === "team_leader" && profile.batch_id === batch.id) ||
        (isTeamLeader && userProfile?.batch_id === batch.id ? userProfile : null)
      );
    }
    return null;
  };

  const selectedBatch = useMemo(() => {
    const fallbackId = selectedBatchId || userProfile?.batch_id || ownedBatches[0]?.id || batches[0]?.id || "";
    return batches.find((batch) => batch.id === fallbackId) || ownedBatches[0] || null;
  }, [batches, ownedBatches, selectedBatchId, userProfile?.batch_id]);

  const selectedBatchMembers = useMemo(() => {
    if (!selectedBatch?.id) return [];
    const members = [];
    const addProfile = (profile, fallbackRole = "") => {
      if (!profile?.id) return;
      members.push({
        ...profile,
        role: profile.role || fallbackRole || "member",
        batch_id: profile.batch_id || selectedBatch.id,
        batch_name: selectedBatch.name || profile.batch_name || "",
        domain: selectedBatch.domain || profile.domain || "",
      });
    };

    addProfile(selectedBatch.hr || profiles.find((profile) => profile.id === selectedBatch.hr_id), "hr");
    (selectedBatch.admins || []).forEach((adminProfile) => addProfile(adminProfile, adminProfile.role || "admin"));
    addProfile(selectedBatch.mentor || profiles.find((profile) => profile.id === selectedBatch.mentor_id), "mentor");
    addProfile(selectedBatch.tl || profiles.find((profile) => profile.id === selectedBatch.tl_id || profile.id === selectedBatch.team_leader_id), "team_leader");
    addProfile(selectedBatch.trainer || profiles.find((profile) => profile.id === selectedBatch.trainer_id), "trainer");
    (selectedBatch.members || []).forEach((member) => addProfile(member));
    profiles
      .filter((profile) =>
        profile.batch_id === selectedBatch.id ||
        selectedBatch.members?.some((member) => member.id === profile.id) ||
        selectedBatch.hr_id === profile.id ||
        selectedBatch.mentor_id === profile.id ||
        selectedBatch.tl_id === profile.id ||
        selectedBatch.team_leader_id === profile.id ||
        selectedBatch.trainer_id === profile.id
      )
      .forEach((profile) => addProfile(profile));

    // If current logged-in user is part of the batch workspace or is viewing this batch chat (Admin, HR, Mentor, TL, intern)
    if (userProfile?.id && !members.some((m) => m.id === userProfile.id)) {
      addProfile(userProfile, userProfile.role);
    }

    return members
      .filter((profile, index, list) => profile?.id && list.findIndex((item) => item.id === profile.id) === index);
  }, [profiles, selectedBatch, userProfile]);

  const selectedBatchTasks = useMemo(() => {
    if (!selectedBatch?.id) return [];
    return tasks.filter((task) => task.batch_id === selectedBatch.id || task.assigned_to_profile?.batch_id === selectedBatch.id);
  }, [selectedBatch?.id, tasks]);

  const selectedBatchMeetings = useMemo(() => {
    if (!selectedBatch?.id) return [];
    return meetings.filter((meeting) => meeting.batch_id === selectedBatch.id);
  }, [meetings, selectedBatch?.id]);

  const selectedBatchAttendance = useMemo(() => {
    if (!selectedBatch?.id) return [];
    return attendance.filter((item) => item.batch_id === selectedBatch.id);
  }, [attendance, selectedBatch?.id]);

  const selectedBatchDailyUpdates = useMemo(() => {
    if (!selectedBatch?.id) return [];
    return dailyUpdates.filter((update) => update.batch_id === selectedBatch.id || update.batch?.id === selectedBatch.id);
  }, [dailyUpdates, selectedBatch?.id]);

  const selectedMemberProfile = useMemo(() => {
    if (!selectedMemberModal?.id) return null;
    const liveProfile = profiles.find((profile) => profile.id === selectedMemberModal.id);
    const batch = batches.find((item) => item.id === (liveProfile?.batch_id || selectedMemberModal.batch_id));
    return {
      ...selectedMemberModal,
      ...(liveProfile || {}),
      batch_id: liveProfile?.batch_id || selectedMemberModal.batch_id || "",
      batch_name: batch?.name || liveProfile?.batch_name || selectedMemberModal.batch_name || "",
    };
  }, [batches, profiles, selectedMemberModal]);

  const selectedMemberBatch = useMemo(() => {
    if (!selectedMemberProfile?.batch_id) return null;
    return batches.find((batch) => batch.id === selectedMemberProfile.batch_id) || null;
  }, [batches, selectedMemberProfile?.batch_id]);

  const selectedMemberAssignedBatches = useMemo(() => {
    if (!selectedMemberProfile?.id || selectedMemberProfile.role !== "hr") return [];
    return batches
      .filter((batch) => batch.hr_id === selectedMemberProfile.id || batch.hr?.id === selectedMemberProfile.id)
      .map((batch) => ({
        ...batch,
        assigned_mentor: resolveBatchLead(batch, "mentor"),
        assigned_tl: resolveBatchLead(batch, "team_leader"),
        intern_count: profiles.filter((profile) => profile.role === "intern" && profile.batch_id === batch.id).length,
        team_leader_count: profiles.filter((profile) => profile.role === "team_leader" && profile.batch_id === batch.id).length,
      }));
  }, [batches, profiles, selectedMemberProfile?.id, selectedMemberProfile?.role]);

  const selectedMemberResponsibilityMap = useMemo(() => {
    if (!selectedMemberBatch) return null;
    return {
      hr: resolveBatchLead(selectedMemberBatch, "hr"),
      mentor:
        resolveBatchLead(selectedMemberBatch, "mentor") ||
        profiles.find((profile) => profile.id === selectedMemberProfile?.assigned_mentor_id) ||
        null,
      tl:
        resolveBatchLead(selectedMemberBatch, "team_leader") ||
        profiles.find((profile) => profile.id === selectedMemberProfile?.assigned_tl_id) ||
        null,
    };
  }, [profiles, selectedMemberBatch, selectedMemberProfile?.assigned_mentor_id, selectedMemberProfile?.assigned_tl_id]);

  const selectedMemberTasks = useMemo(() => {
    if (!selectedMemberProfile?.id) return [];
    return tasks.filter(
      (task) =>
        task.assigned_to === selectedMemberProfile.id ||
        task.assigned_to_profile?.id === selectedMemberProfile.id ||
        (selectedMemberProfile.role === "intern" &&
          task.visible_to_interns &&
          task.batch_id &&
          task.batch_id === selectedMemberProfile.batch_id)
    );
  }, [selectedMemberProfile, tasks]);

  const selectedMemberSubmissions = useMemo(() => {
    if (!selectedMemberProfile?.id) return [];
    return submissions.filter(
      (submission) =>
        submission.intern_id === selectedMemberProfile.id ||
        submission.user_id === selectedMemberProfile.id ||
        submission.intern?.id === selectedMemberProfile.id ||
        selectedMemberTasks.some((task) => task.id === submission.task_id)
    );
  }, [selectedMemberProfile?.id, selectedMemberTasks, submissions]);

  const selectedMemberReviews = useMemo(() => {
    if (!selectedMemberProfile?.id) return [];
    const submissionIds = new Set(selectedMemberSubmissions.map((submission) => submission.id).filter(Boolean));
    return taskReviews.filter(
      (review) =>
        review.user_id === selectedMemberProfile.id ||
        review.submission?.intern_id === selectedMemberProfile.id ||
        review.submission?.user_id === selectedMemberProfile.id ||
        submissionIds.has(review.submission_id)
    );
  }, [selectedMemberProfile?.id, selectedMemberSubmissions, taskReviews]);

  const selectedMemberAttendance = useMemo(() => {
    if (!selectedMemberProfile?.id) return [];
    return attendance.filter((item) => item.user_id === selectedMemberProfile.id);
  }, [attendance, selectedMemberProfile?.id]);

  const selectedBatchActivity = useMemo(() => {
    if (!selectedBatch?.id) return [];

    // 1. Audit logs for this batch
    const batchLogs = auditLogs
      .filter((log) => {
        const metadataBatchId = log.metadata?.batch_id || log.metadata?.batchId;
        return (
          log.entity_id === selectedBatch.id ||
          metadataBatchId === selectedBatch.id ||
          (log.summary && log.summary.toLowerCase().includes(selectedBatch.name?.toLowerCase() || ""))
        );
      })
      .map((log) => ({
        id: `audit-${log.id}`,
        category: "audit",
        categoryLabel: "Audit Log",
        title: log.summary || log.action || "Activity recorded",
        description: log.action ? `Action: ${log.action}` : "",
        meta: log.actor?.full_name || ROLE_LABELS[log.actor_role] || "System",
        date: log.created_at,
        badgeColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      }));

    // 2. Announcements
    const announcementItems = (batchWorkspaceData.announcements || []).map((ann) => ({
      id: `ann-${ann.id}`,
      category: "announcements",
      categoryLabel: "Announcement",
      title: ann.title || "Batch Announcement",
      description: ann.body || "",
      meta: `Posted by ${ann.author?.full_name || "Lead"}`,
      file: ann.file_name ? { name: ann.file_name, url: ann.file_url } : null,
      date: ann.created_at,
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    }));

    // 3. Resources / Files
    const resourceItems = (batchWorkspaceData.resources || []).map((res) => ({
      id: `res-${res.id}`,
      category: "files",
      categoryLabel: "File / Resource",
      title: res.title || res.file_name || "Resource Shared",
      description: res.description || (res.category ? `Category: ${res.category.replaceAll("_", " ")}` : ""),
      meta: `Shared by ${res.uploader?.full_name || "Instructor"}`,
      file: res.file_name ? { name: res.file_name, url: res.file_url } : null,
      date: res.created_at,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    }));

    // 4. Tasks
    const taskItems = selectedBatchTasks.map((task) => ({
      id: `task-${task.id}`,
      category: "tasks",
      categoryLabel: "Task",
      title: `Task: ${task.title}`,
      description: task.description || "",
      meta: `Assigned to ${task.assigned_to_profile?.full_name || "Whole Batch"} • Priority: ${task.priority || "medium"} • Status: ${task.status || "active"}`,
      date: task.created_at || task.updated_at,
      badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
    }));

    // 5. Intern Submissions
    const submissionItems = submissions
      .filter((sub) => {
        const t = tasks.find((x) => x.id === sub.task_id);
        return t && t.batch_id === selectedBatch.id;
      })
      .map((sub) => {
        const t = tasks.find((x) => x.id === sub.task_id);
        return {
          id: `sub-${sub.id}`,
          category: "submissions",
          categoryLabel: "Work Submission",
          title: `Submission for "${t?.title || "Task"}"`,
          description: sub.notes || (sub.submission_url ? `URL: ${sub.submission_url}` : ""),
          meta: `Submitted by ${sub.intern?.full_name || "Intern"} • Status: ${sub.status || "submitted"}`,
          date: sub.submitted_at || sub.created_at,
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
        };
      });

    // 6. Task Reviews & Feedback
    const reviewItems = taskReviews
      .filter((rev) => {
        const sub = submissions.find((s) => s.id === rev.submission_id);
        const t = sub ? tasks.find((x) => x.id === sub.task_id) : null;
        return t && t.batch_id === selectedBatch.id;
      })
      .map((rev) => ({
        id: `rev-${rev.id}`,
        category: "reviews",
        categoryLabel: "Task Review",
        title: `Task Graded: ${rev.status || "Reviewed"}`,
        description: rev.feedback || "",
        meta: `Rating: ${rev.rating || 5}/5 by ${rev.reviewer?.full_name || "Reviewer"}`,
        date: rev.created_at,
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      }));

    // 7. Meetings & Classes
    const meetingItems = selectedBatchMeetings.map((meeting) => ({
      id: `meeting-${meeting.id}`,
      category: "meetings",
      categoryLabel: "Class / Meeting",
      title: `Meeting: ${meeting.title}`,
      description: meeting.topic ? `Topic: ${meeting.topic}` : "",
      meta: `${meeting.attendee_id ? "1:1 Session" : "Batch Class"} • Scheduled: ${localDate(meeting.scheduled_at)}`,
      date: meeting.created_at || meeting.scheduled_at,
      badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
    }));

    // 8. Daily Reports
    const reportItems = selectedBatchDailyUpdates.map((update) => ({
      id: `daily-${update.id}`,
      category: "reports",
      categoryLabel: update.reviewed_at ? "Report Reviewed" : "Daily Report",
      title: `Daily Report from ${update.tl?.full_name || "Team Leader"}`,
      description: update.summary || update.completed_tasks || "",
      meta: `TL: ${update.tl?.full_name || "Team Leader"}${update.reviewer_comment ? ` • Feedback: "${update.reviewer_comment}"` : ""}`,
      date: update.reviewed_at || update.created_at,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    }));

    // 9. Escalations
    const escalationItems = (batchWorkspaceData.escalations || []).map((esc) => ({
      id: `esc-${esc.id}`,
      category: "escalations",
      categoryLabel: "Escalation",
      title: `Escalation: ${esc.issue || "Issue Raised"}`,
      description: esc.description || "",
      meta: `Priority: ${esc.priority || "medium"} • Status: ${esc.status || "open"} • Assigned to ${esc.assignee?.full_name || "Lead"}`,
      date: esc.created_at,
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
    }));

    // 10. Member Assignment History
    const historyItems = (batchWorkspaceData.history || []).map((item) => ({
      id: `hist-${item.id}`,
      category: "members",
      categoryLabel: "Member Update",
      title: `${(item.assignment_type || "assignment").replaceAll("_", " ")} recorded`,
      description: item.note || "",
      meta: item.new_user?.full_name || item.member?.full_name || "Batch member update",
      date: item.created_at,
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    }));

    // 11. Batch Initialized
    const batchCreatedItem = selectedBatch.created_at
      ? [
          {
            id: `batch-init-${selectedBatch.id}`,
            category: "batch",
            categoryLabel: "Cohort Initialized",
            title: `Batch "${selectedBatch.name}" was initialized`,
            description: `Domain: ${selectedBatch.domain === "web_dev" ? "Web Development" : selectedBatch.domain || "Technology"} • Starts: ${selectedBatch.starts_at || "Immediate"}`,
            meta: "Batch lifecycle started",
            date: selectedBatch.created_at,
            badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
          },
        ]
      : [];

    return [
      ...batchCreatedItem,
      ...batchLogs,
      ...announcementItems,
      ...resourceItems,
      ...taskItems,
      ...submissionItems,
      ...reviewItems,
      ...meetingItems,
      ...reportItems,
      ...escalationItems,
      ...historyItems,
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    auditLogs,
    batchWorkspaceData.announcements,
    batchWorkspaceData.escalations,
    batchWorkspaceData.history,
    batchWorkspaceData.resources,
    selectedBatch,
    selectedBatchDailyUpdates,
    selectedBatchMeetings,
    selectedBatchTasks,
    submissions,
    taskReviews,
    tasks,
  ]);

  const filteredBatchActivities = useMemo(() => {
    let list = selectedBatchActivity;
    if (batchActivityCategory !== "all") {
      if (batchActivityCategory === "tasks_and_work") {
        list = list.filter((item) => ["tasks", "submissions", "reviews"].includes(item.category));
      } else if (batchActivityCategory === "governance") {
        list = list.filter((item) => ["escalations", "members", "audit", "batch"].includes(item.category));
      } else {
        list = list.filter((item) => item.category === batchActivityCategory);
      }
    }
    if (batchActivitySearch.trim()) {
      const q = batchActivitySearch.toLowerCase();
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.meta?.toLowerCase().includes(q) ||
          item.categoryLabel?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedBatchActivity, batchActivityCategory, batchActivitySearch]);

  const totalBatchActivitiesCount = filteredBatchActivities.length;
  const totalBatchActivityPages = Math.max(1, Math.ceil(totalBatchActivitiesCount / batchActivityPerPage));
  const safeBatchActivityPage = Math.min(Math.max(1, batchActivityPage), totalBatchActivityPages);
  const startBatchActivityIdx = totalBatchActivitiesCount === 0 ? 0 : (safeBatchActivityPage - 1) * batchActivityPerPage;
  const paginatedBatchActivities = useMemo(() => {
    return filteredBatchActivities.slice(startBatchActivityIdx, startBatchActivityIdx + batchActivityPerPage);
  }, [filteredBatchActivities, startBatchActivityIdx, batchActivityPerPage]);

  const selectedBatchHealth = useMemo(() => {
    const totalTasks = selectedBatchTasks.length;
    const completedTasks = selectedBatchTasks.filter((task) => ["approved", "completed"].includes(task.status)).length;
    const submittedTasks = selectedBatchTasks.filter((task) => ["submitted", "reviewed", "changes_requested"].includes(task.status)).length;
    const overdueTasks = selectedBatchTasks.filter((task) => task.deadline && !["approved", "completed"].includes(task.status) && new Date(task.deadline).getTime() < Date.now()).length;
    const attendanceTotal = selectedBatchAttendance.length;
    const presentCount = selectedBatchAttendance.filter((item) => item.status === "present" || item.status === "late").length;
    const pendingReports = selectedBatchDailyUpdates.filter((update) => !update.reviewed_at && !update.reviewer_comment).length;
    const blockerCount = selectedBatchDailyUpdates.filter((update) => update.blockers?.trim()).length;
    const taskCompletion = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const attendancePercent = attendanceTotal ? Math.round((presentCount / attendanceTotal) * 100) : 0;
    const needsAttention = overdueTasks + blockerCount + selectedBatchTasks.filter((task) => task.status === "changes_requested").length;
    const atRisk = overdueTasks >= 2 || blockerCount >= 2 ? 1 : 0;
    return { totalTasks, completedTasks, submittedTasks, overdueTasks, taskCompletion, attendancePercent, pendingReports, blockerCount, needsAttention, atRisk };
  }, [selectedBatchAttendance, selectedBatchDailyUpdates, selectedBatchTasks]);

  const selectedBatchReviews = useMemo(() => {
    if (!selectedBatch?.id) return { reports: [], submissions: [], changes: [], escalations: [] };
    const reports = selectedBatchDailyUpdates.filter((update) => !update.reviewed_at && !update.reviewer_comment);
    const submissionsNeedingReview = submissions.filter((submission) => {
      const task = submission.task || selectedBatchTasks.find((item) => item.id === submission.task_id);
      return task?.batch_id === selectedBatch.id && ["submitted", "reviewed"].includes(task.status || "");
    });
    const changes = selectedBatchTasks.filter((task) => task.status === "changes_requested");
    const escalations = selectedBatchDailyUpdates.filter((update) => update.blockers?.trim());
    return { reports, submissions: submissionsNeedingReview, changes, escalations };
  }, [selectedBatch, selectedBatchDailyUpdates, selectedBatchTasks, submissions]);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const globalSearchResults = useMemo(() => {
    const q = globalSearchTerm.trim().toLowerCase();
    if (!q) return { members: [], batches: [], tasks: [], meetings: [], reports: [], totalCount: 0 };

    const matchedMembers = visibleProfiles.filter(
      (p) => p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q)
    ).slice(0, 5);

    const matchedBatches = ownedBatches.filter(
      (b) => b.name?.toLowerCase().includes(q) || b.domain?.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedTasks = tasks.filter(
      (t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedMeetings = meetings.filter(
      (m) => m.title?.toLowerCase().includes(q) || m.topic?.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedReports = dailyUpdates.filter(
      (u) => u.summary?.toLowerCase().includes(q) || u.blockers?.toLowerCase().includes(q)
    ).slice(0, 5);

    return {
      members: matchedMembers,
      batches: matchedBatches,
      tasks: matchedTasks,
      meetings: matchedMeetings,
      reports: matchedReports,
      totalCount: matchedMembers.length + matchedBatches.length + matchedTasks.length + matchedMeetings.length + matchedReports.length,
    };
  }, [globalSearchTerm, visibleProfiles, ownedBatches, tasks, meetings, dailyUpdates]);

  const canManageSelectedBatch = useMemo(() => {
    if (!selectedBatch || !sessionUser?.id) return false;
    if (isAdminRole) return true;
    return [selectedBatch.hr_id, selectedBatch.mentor_id, selectedBatch.tl_id].includes(sessionUser.id);
  }, [isAdminRole, selectedBatch, sessionUser?.id]);

  // Only Admin, HR, and Mentor can create announcements or upload resources per batch
  const canPostBatchNotice = useMemo(() => {
    if (!selectedBatch || !sessionUser?.id) return false;
    if (isAdminRole || isHrRole) return true;
    if (isMentor) {
      if (selectedBatch.mentor_id === sessionUser.id) return true;
      if (ownedBatches.some((b) => b.id === selectedBatch.id)) return true;
    }
    return false;
  }, [isAdminRole, isHrRole, isMentor, selectedBatch, sessionUser?.id, ownedBatches]);

  const activeBatchWorkspaceData = useMemo(() => {
    if (!selectedBatch?.id) return emptyBatchWorkspaceData();
    if (batchWorkspaceBatchId === selectedBatch.id) return batchWorkspaceData;
    return batchWorkspaceCacheRef.current[selectedBatch.id] || emptyBatchWorkspaceData();
  }, [batchWorkspaceBatchId, batchWorkspaceData, selectedBatch?.id]);

  const isSelectedBatchWorkspaceLoading = Boolean(
    selectedBatch?.id && loadingBatchWorkspaceId === selectedBatch.id
  );

  useEffect(() => {
    if (!batchWorkspaceBatchId || loadingBatchWorkspaceId === batchWorkspaceBatchId) return;
    batchWorkspaceCacheRef.current[batchWorkspaceBatchId] = batchWorkspaceData;
  }, [batchWorkspaceBatchId, batchWorkspaceData, loadingBatchWorkspaceId]);

  const selectedBatchAnnouncements = useMemo(() => {
    if (!selectedBatch?.id) return [];
    return (activeBatchWorkspaceData.announcements || []).map((item) => ({
      ...item,
      message: item.body || item.message,
      source: "batch",
    }));
  }, [activeBatchWorkspaceData.announcements, selectedBatch]);

  async function refreshBatchWorkspace(batchId = selectedBatch?.id, options = {}) {
    if (!batchId) return;
    const cached = batchWorkspaceCacheRef.current[batchId];
    const silent = Boolean(options.silent);
    if (cached && !silent) {
      setBatchWorkspaceData(cached);
      setBatchWorkspaceBatchId(batchId);
    } else if (!silent) {
      setBatchWorkspaceData(emptyBatchWorkspaceData());
      setBatchWorkspaceBatchId(batchId);
    }

    const requestId = `${batchId}:${Date.now()}:${Math.random()}`;
    batchWorkspaceRequestRef.current = requestId;
    if (!silent) setLoadingBatchWorkspaceId(batchId);

    const data = await getBatchWorkspace(batchId);
    batchWorkspaceCacheRef.current[batchId] = data;
    if (batchWorkspaceRequestRef.current === requestId || selectedBatch?.id === batchId) {
      setBatchWorkspaceData(data);
      setBatchWorkspaceBatchId(batchId);
      setBatchChatMeta((prev) => ({
        ...prev,
        [batchId]: {
          ...(prev[batchId] || {}),
          unreadCount: 0,
        },
      }));
      setLoadingBatchWorkspaceId((current) => (current === batchId ? "" : current));
    }
    return data;
  }
  const loadBatchWorkspaceData = refreshBatchWorkspace;

  async function refreshAccessibleEscalations() {
    const escalations = await getVisibleBatchEscalations();
    setAccessibleEscalations(
      (escalations || [])
      .filter((item, index, list) => item?.id && list.findIndex((entry) => entry.id === item.id) === index)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    );
  }

  const filteredMembers = useMemo(() => {
    let list = combinedMembers;
    if (memberFilter !== "all") {
      list = list.filter((m) => m.domain === memberFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.full_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.phone?.includes(q));
    }
    return list;
  }, [combinedMembers, memberFilter, searchQuery]);

  const [prevFilterKey, setPrevFilterKey] = useState(
    `${activeSection}:${searchQuery}:${memberFilter}:${alertsFilter}`
  );
  const currentFilterKey = `${activeSection}:${searchQuery}:${memberFilter}:${alertsFilter}`;
  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setCurrentPage(1);
  }

  const filteredBatches = useMemo(() => {
    let list = batches;
    if (memberFilter !== "all") {
      list = list.filter((b) => b.domain === memberFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) => b.name?.toLowerCase().includes(q));
    }
    return list;
  }, [batches, memberFilter, searchQuery]);

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (isMentor) {
      list = list.filter((task) => {
        if (task.batch_id) return ownedBatchIds.has(task.batch_id);
        return task.assigned_by === sessionUser?.id || task.assigned_to === sessionUser?.id || task.assigned_to_profile?.batch_id && ownedBatchIds.has(task.assigned_to_profile.batch_id);
      });
    } else if (isTeamLeader) {
      list = list.filter((task) => {
        if (task.batch_id) return task.batch_id === userProfile?.batch_id;
        return task.assigned_by === sessionUser?.id || task.assigned_to === sessionUser?.id;
      });
    } else if (currentRole === "intern") {
      list = list.filter((task) => task.assigned_to === sessionUser?.id || (task.visible_to_interns && task.batch_id === userProfile?.batch_id));
    }
    if (memberFilter !== "all") {
      list = list.filter((t) => t.domain === memberFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assigned_to_profile?.full_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [currentRole, isMentor, isTeamLeader, memberFilter, ownedBatchIds, searchQuery, sessionUser?.id, tasks, userProfile?.batch_id]);

  const filteredCrmLeads = useMemo(() => {
    let list = leads;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.full_name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.service_interest?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, searchQuery]);

  const filteredMeetings = useMemo(() => {
    let list = meetings;
    if (isMentor) {
      list = list.filter((meeting) => meeting.host_id === sessionUser?.id || meeting.attendee_id === sessionUser?.id || (meeting.batch_id && ownedBatchIds.has(meeting.batch_id)));
    } else if (isTeamLeader || currentRole === "intern") {
      list = list.filter((meeting) => meeting.host_id === sessionUser?.id || meeting.attendee_id === sessionUser?.id || meeting.batch_id === userProfile?.batch_id);
    } else if (isHrRole) {
      list = list.filter((meeting) => !meeting.batch_id || ownedBatchIds.has(meeting.batch_id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) => m.title?.toLowerCase().includes(q) || m.topic?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [currentRole, isHrRole, isMentor, isTeamLeader, meetings, ownedBatchIds, searchQuery, sessionUser?.id, userProfile?.batch_id]);

  const filteredAttendance = useMemo(() => {
    let list = attendance;
    if (isMentor || isHrRole) {
      list = list.filter((item) => item.batch_id ? ownedBatchIds.has(item.batch_id) : item.domain === userProfile?.domain);
    } else if (isTeamLeader || currentRole === "intern") {
      list = list.filter((item) => item.user_id === sessionUser?.id || item.batch_id === userProfile?.batch_id);
    }
    if (memberFilter !== "all") {
      list = list.filter((a) => a.domain === memberFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.user?.full_name?.toLowerCase().includes(q) ||
          a.batch?.name?.toLowerCase().includes(q) ||
          a.attendance_date?.includes(q)
      );
    }
    return list;
  }, [attendance, currentRole, isHrRole, isMentor, isTeamLeader, memberFilter, ownedBatchIds, searchQuery, sessionUser?.id, userProfile?.batch_id, userProfile?.domain]);

  const filteredCertificates = useMemo(() => {
    let list = certificates;
    if (memberFilter !== "all") {
      list = list.filter((c) => c.domain === memberFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.intern_name?.toLowerCase().includes(q) ||
          c.certificate_code?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [certificates, memberFilter, searchQuery]);

  const filteredAuditLogs = useMemo(() => {
    const knownEntityIds = new Set((auditLogs || []).map((l) => l.entity_id).filter(Boolean));

    // A to Z Website & Portal Activities
    const websiteLeadLogs = (leads || []).map((lead) => ({
      id: `lead-${lead.id || lead.created_at}`,
      entity_id: lead.id,
      action: "website_inquiry",
      summary: `Website inquiry from ${lead.full_name || lead.name || "Visitor"} (${lead.email || "No email"}) for ${lead.domain || lead.service || "General inquiry"}`,
      actor: { full_name: lead.full_name || lead.name || "Website Lead", role: "lead" },
      actor_role: "visitor",
      source: "Website",
      created_at: lead.created_at || new Date().toISOString(),
    }));

    const certificateLogs = (certificates || []).map((cert) => ({
      id: `cert-${cert.id || cert.certificate_code}`,
      entity_id: cert.id,
      action: "certificate_issued",
      summary: `Certificate issued for ${cert.intern_name} (${cert.certificate_code}) - Grade: ${cert.performance_grade || "A+"}`,
      actor: { full_name: cert.issued_by_name || "HR Manager", role: "hr" },
      actor_role: "hr",
      source: "Portal",
      created_at: cert.created_at || new Date().toISOString(),
    }));

    const memberLogs = (profiles || []).map((p) => ({
      id: `profile-${p.id}`,
      entity_id: p.id,
      action: "user_registered",
      summary: `Account registered: ${p.full_name} (${p.email}) as ${ROLE_LABELS[p.role] || p.role}`,
      actor: { full_name: p.full_name, role: p.role },
      actor_role: p.role,
      source: "Auth",
      created_at: p.created_at || new Date().toISOString(),
    }));

    const cmsLogs = (cmsVersions || []).map((v) => ({
      id: `cms-${v.id || v.created_at}`,
      entity_id: v.id,
      action: "cms_updated",
      summary: `Website block '${v.key}' published / updated`,
      actor: v.editor || { full_name: "Admin", role: "super_admin" },
      actor_role: "super_admin",
      source: "Website CMS",
      created_at: v.created_at || new Date().toISOString(),
    }));

    const batchLogs = (batches || []).map((b) => ({
      id: `batch-${b.id}`,
      entity_id: b.id,
      action: "batch_created",
      summary: `Batch '${b.name}' initialized (${b.domain === "web_dev" ? "Web Development" : b.domain})`,
      actor: { full_name: "Super Admin", role: "super_admin" },
      actor_role: "super_admin",
      source: "Batches",
      created_at: b.created_at || new Date().toISOString(),
    }));

    // Deduplicate against explicit auditLogs
    const extraLogs = [
      ...websiteLeadLogs,
      ...certificateLogs,
      ...memberLogs,
      ...cmsLogs,
      ...batchLogs,
    ].filter((item) => !knownEntityIds.has(item.entity_id));

    const normalizedAudit = (auditLogs || []).map((log) => ({
      ...log,
      source: log.source || (log.entity_type === "lead" ? "Website" : log.entity_type === "cms" ? "Website CMS" : "System"),
    }));

    let allLogs = [...normalizedAudit, ...extraLogs]
      .filter((item) => item.created_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      allLogs = allLogs.filter(
        (a) =>
          a.action?.toLowerCase().includes(q) ||
          a.summary?.toLowerCase().includes(q) ||
          a.actor?.full_name?.toLowerCase().includes(q) ||
          a.source?.toLowerCase().includes(q)
      );
    }
    return allLogs;
  }, [auditLogs, batches, certificates, cmsVersions, leads, profiles, searchQuery]);

  const filteredCmsContent = useMemo(() => {
    let list = cmsContent;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.key?.toLowerCase().includes(q) ||
          c.content_json?.title?.toLowerCase().includes(q) ||
          c.content_json?.subtitle?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cmsContent, searchQuery]);

  const filteredNotifications = useMemo(() => {
    let list = notifications;
    if (alertsFilter === "unread") {
      list = list.filter((n) => !n.is_read);
    }
    return list;
  }, [notifications, alertsFilter]);

  const filteredDailyUpdates = useMemo(() => {
    let list = dailyUpdates;
    if (memberFilter !== "all") {
      list = list.filter((update) => update.domain === memberFilter || update.batch?.domain === memberFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (update) =>
          update.summary?.toLowerCase().includes(q) ||
          update.blockers?.toLowerCase().includes(q) ||
          update.completed_tasks?.toLowerCase().includes(q) ||
          update.pending_tasks?.toLowerCase().includes(q) ||
          update.assigned_tasks?.toLowerCase().includes(q) ||
          update.tl?.full_name?.toLowerCase().includes(q) ||
          update.task?.title?.toLowerCase().includes(q) ||
          update.batch?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [dailyUpdates, memberFilter, searchQuery]);

  const latestSubmissionByTaskId = useMemo(() => {
    const latest = new Map();
    submissions.forEach((submission) => {
      if (!submission.task_id) return;
      const existing = latest.get(submission.task_id);
      const existingTime = existing?.submitted_at ? new Date(existing.submitted_at).getTime() : 0;
      const nextTime = submission.submitted_at ? new Date(submission.submitted_at).getTime() : 0;
      if (!existing || nextTime >= existingTime) latest.set(submission.task_id, submission);
    });
    return latest;
  }, [submissions]);

  const latestDailyUpdateByTaskId = useMemo(() => {
    const latest = new Map();
    dailyUpdates.forEach((update) => {
      if (!update.task_id) return;
      const existing = latest.get(update.task_id);
      const existingTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
      const nextTime = update.created_at ? new Date(update.created_at).getTime() : 0;
      if (!existing || nextTime >= existingTime) latest.set(update.task_id, update);
    });
    return latest;
  }, [dailyUpdates]);

  function canSubmitTask(task) {
    if (!task || !sessionUser?.id) return false;
    if (["submitted", "reviewed", "approved"].includes(task.status)) return false;
    if (task.deadline && new Date(task.deadline).getTime() < Date.now()) return false;
    if (task.assigned_to === sessionUser.id) return true;
    return currentRole === "intern" && task.visible_to_interns && task.batch_id === userProfile?.batch_id;
  }

  function canSendDailyTaskUpdate(task) {
    if (!task || !sessionUser?.id) return false;
    if (!isTeamLeader) return false;
    if (task.status === "approved") return false;
    if (task.deadline && new Date(task.deadline).getTime() < Date.now()) return false;
    if (task.assigned_to === sessionUser.id) return true;
    return task.batch_id === userProfile?.batch_id;
  }

  function canReviewTask(task) {
    if (!task || !sessionUser?.id || !["submitted", "reviewed", "approved", "rejected", "changes_requested"].includes(task.status)) return false;
    const submission = latestSubmissionByTaskId.get(task.id);
    if (!submission) return false;
    if (isMentor) return ownedBatchIds.has(task.batch_id) || task.assigned_by === sessionUser.id;
    if (isTeamLeader) return submission.intern?.role === "intern" && submission.intern?.batch_id === userProfile?.batch_id;
    return isAdminRole || isHrRole;
  }

  function canCommentDailyUpdate(update) {
    if (!update || !sessionUser?.id) return false;
    if (isMentor) return ownedBatchIds.has(update.batch_id) || update.mentor_id === sessionUser.id;
    if (isTeamLeader) return update.tl?.role === "intern" && update.batch_id === userProfile?.batch_id;
    return isAdminRole || isHrRole;
  }

  const currentSectionRecords = useMemo(() => {
    if (activeSection === "overview") {
      return isAdminRole ? filteredMembers : filteredTasks;
    }
    if (activeSection === "members") return filteredMembers;
    if (activeSection === "hr_mentors") return filteredMembers.filter((member) => member.role === "mentor");
    if (activeSection === "hr_interns") return filteredMembers.filter((member) => ["intern", "team_leader"].includes(member.role));
    if (activeSection === "batches") return filteredBatches;
    if (activeSection === "batch_workspace") return [];
    if (activeSection === "tasks") return filteredTasks;
    if (activeSection === "daily_updates") return filteredDailyUpdates;
    if (activeSection === "crm") return filteredCrmLeads;
    if (activeSection === "classes") return filteredMeetings;
    if (activeSection === "attendance") return filteredAttendance;
    if (activeSection === "certificates") return filteredCertificates;
    if (activeSection === "audit") return filteredAuditLogs;
    if (activeSection === "cms") return filteredCmsContent;
    if (activeSection === "alerts") return filteredNotifications;
    return [];
  }, [
    activeSection,
    isAdminRole,
    filteredMembers,
    filteredTasks,
    filteredDailyUpdates,
    filteredBatches,
    filteredCrmLeads,
    filteredMeetings,
    filteredAttendance,
    filteredCertificates,
    filteredAuditLogs,
    filteredCmsContent,
    filteredNotifications,
  ]);

  const totalRecords = currentSectionRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalRecords === 0 ? 0 : (safePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);

  const paginatedRecords = useMemo(() => {
    return currentSectionRecords.slice(startIndex, endIndex);
  }, [currentSectionRecords, startIndex, endIndex]);

  const selectedContact = chatContacts.find((profile) => profile.id === selectedContactId) || profiles.find((profile) => profile.id === selectedContactId);
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const allowedSections = useMemo(() => {
    const sections = ["overview", "settings"];
    if (isMentor) {
      sections.push("review_center", "task_submissions", "at_risk_watchlist");
    } else if (isTeamLeader) {
      sections.push("task_submissions");
    }
    if (isAdminRole || isHrRole) {
      sections.push("review_center", "at_risk_watchlist");
    }
    if (canSeeOperations) {
      if (!isHrRole) sections.push("tasks");
      if (isMentor || isTeamLeader) sections.push("daily_updates");
      sections.push("classes", "attendance");
    }
    if (canViewAllTeam) sections.push("members");
    if (isHrRole) sections.push("hr_mentors", "hr_interns");
    if (canViewBatches) sections.push("batches", "batch_workspace");
    if (!sections.includes("batch_workspace")) sections.push("batch_workspace");
    sections.push("batch_files");
    if (canIssueCertificates) sections.push("certificates");
    if (canUseMessages) sections.push("chat");
    if (canUseAlerts) sections.push("alerts");
    if (isAdminRole) sections.push("audit");
    return sections;
  }, [canIssueCertificates, canSeeOperations, canUseAlerts, canUseMessages, canViewAllTeam, canViewBatches, isAdminRole, isHrRole, isMentor, isTeamLeader]);

  const cmsPreview = useMemo(() => {
    const usesRaw = Boolean(cmsForm.raw_json.trim());
    try {
      if (usesRaw) {
        const parsed = JSON.parse(cmsForm.raw_json);
        return { valid: true, usesRaw, data: parsed, message: "Valid full JSON override." };
      }
      const data = {
        title: cmsForm.title,
        subtitle: cmsForm.subtitle,
        body: cmsForm.body,
        cta: cmsForm.cta,
      };
      if (cmsForm.body?.trim().startsWith("{") || cmsForm.body?.trim().startsWith("[")) {
        data.body = JSON.parse(cmsForm.body);
      }
      return { valid: true, usesRaw, data, message: "Valid field-based CMS block." };
    } catch (error) {
      return { valid: false, usesRaw, data: null, message: error.message || "Invalid JSON." };
    }
  }, [cmsForm]);

  const dashboardMetrics = useMemo(() => {
    const mentorCount = profiles.filter((member) => member.role === "mentor").length;
    const internCount = profiles.filter((member) => ["intern", "team_leader"].includes(member.role)).length;
    if (isAdminRole) {
      return [
        { label: "Assigned Batches", value: batches.length, sub: "Cohorts assigned across domains", color: "text-gray-900 dark:text-white" },
        { label: "HR Managers", value: profiles.filter((member) => member.role === "hr").length, sub: "HR Operations Team", color: "text-red-600" },
        { label: "Mentors & Interns", value: mentorCount + internCount, sub: "Total technical workforce", color: "text-blue-600" },
        { label: "Audit & Site Events", value: filteredAuditLogs.length, sub: "A to Z system & website activity", color: "text-emerald-600" },
      ];
    }
    if (isHrRole) {
      return [
        { label: "Assigned Batches", value: batches.length, sub: "Cohorts assigned by Super Admin", color: "text-gray-900 dark:text-white" },
        { label: "Mentors", value: mentorCount, sub: "Mentors added batch by batch", color: "text-red-600" },
        { label: "Interns", value: internCount, sub: "Interns added inside batches", color: "text-blue-600" },
        { label: "Certificates", value: certificates.length, sub: "HR release queue", color: "text-emerald-600" },
      ];
    }
    const activeTasks = tasks.filter((task) => !["approved", "rejected"].includes(task.status)).length;
    const approvedTasks = tasks.filter((task) => task.status === "approved").length;
    if (isMentor) {
      return [
        { label: "Assigned Batches", value: ownedBatches.length, sub: "Batches under your mentorship", color: "text-gray-900 dark:text-white" },
        { label: "Batch Members", value: combinedMembers.length, sub: "Interns and TLs in your batches", color: "text-red-600" },
        { label: "Active Tasks", value: activeTasks, sub: "Tasks assigned to TLs", color: "text-blue-600" },
        { label: "Meetings", value: meetings.length, sub: "Batch and 1:1 sessions", color: "text-emerald-600" },
      ];
    }
    return [
      { label: "Active Team & Interns", value: combinedMembers.length, sub: "Engineers, Mentors & Trainees", color: "text-gray-900 dark:text-white" },
      { label: "Active Project Tasks", value: activeTasks, sub: "Client Work Orders & Sprints", color: "text-red-600" },
      { label: canUseCrm ? "Website Client Leads" : "Meetings", value: canUseCrm ? leads.length : meetings.length, sub: canUseCrm ? "Inbound Contact & CRM Requests" : "Live sessions and check-ins", color: "text-blue-600" },
      { label: "Completed Deliverables", value: approvedTasks, sub: "Verified & Approved Milestones", color: "text-emerald-600" },
    ];
  }, [batches.length, canUseCrm, certificates.length, combinedMembers, filteredAuditLogs.length, isAdminRole, isHrRole, isMentor, leads.length, meetings.length, ownedBatches.length, profiles, tasks]);

  const metrics = dashboardMetrics;

  const mobileNavItems = useMemo(() => {
    const items = [
      { key: "overview", label: "Dashboard", icon: Home, section: "overview", show: true },
      { key: "crm", label: "Leads", icon: Target, href: "/crm", show: canUseCrm, badge: leads.length },
      { key: "members", label: isAdminRole ? "HR" : "Team", icon: Users, section: "members", show: canViewAllTeam, badge: combinedMembers.length },
      { key: "batches", label: "Batches", icon: Folder, section: "batches", show: canViewBatches, badge: batches.length },
      { key: "tasks", label: "Tasks", icon: CheckSquare, section: "tasks", show: canSeeOperations && !isHrRole, badge: tasks.length },
      { key: "chat", label: "Chat", icon: MessageSquare, section: "chat", show: canUseMessages },
      { key: "classes", label: "Classes", icon: Calendar, section: "classes", show: canSeeOperations, badge: meetings.length },
      { key: "attendance", label: "Attendance", icon: Clock, section: "attendance", show: canSeeOperations },
      { key: "batch_workspace", label: "Workspace", icon: LayoutDashboard, section: "batch_workspace", show: true },
      { key: "batch_files", label: "Files", icon: Folder, section: "batch_files", show: true },
      { key: "daily_updates", label: "Updates", icon: Activity, section: "daily_updates", show: isMentor || isTeamLeader, badge: dailyUpdates.length },
      { key: "task_submissions", label: "Submissions", icon: Send, section: "task_submissions", show: isMentor || isTeamLeader, badge: pendingSubmissionsCount },
      { key: "review_center", label: "Reviews", icon: AlertCircle, section: "review_center", show: isMentor || isHrRole || isAdminRole, badge: mentorReviewCenterData.total },
      { key: "at_risk_watchlist", label: "At Risk", icon: AlertTriangle, section: "at_risk_watchlist", show: isMentor || isHrRole || isAdminRole, badge: mentorAtRiskMembers.length },
      { key: "certificates", label: "Certificates", icon: Award, section: "certificates", show: canIssueCertificates, badge: certificates.length },
      { key: "hr_mentors", label: "Mentors", icon: UserCheck, section: "hr_mentors", show: isHrRole, badge: combinedMembers.filter((member) => member.role === "mentor").length },
      { key: "hr_interns", label: "Interns", icon: Users, section: "hr_interns", show: isHrRole, badge: combinedMembers.filter((member) => member.role === "intern").length },
      { key: "alerts", label: "Alerts", icon: Bell, section: "alerts", show: canUseAlerts, badge: unreadCount },
      { key: "audit", label: "Audit", icon: ShieldCheck, section: "audit", show: isAdminRole },
      { key: "cms", label: "CMS", icon: FileText, section: "cms", show: canUseCms },
      { key: "settings", label: "Settings", icon: Settings, section: "settings", show: true },
      { key: "website", label: "Website", icon: ExternalLink, href: "/", show: !isMentor },
    ];
    return items.filter((item) => item.show);
  }, [
    batches.length,
    canIssueCertificates,
    canSeeOperations,
    canUseAlerts,
    canUseCms,
    canUseCrm,
    canUseMessages,
    canViewAllTeam,
    canViewBatches,
    certificates.length,
    combinedMembers,
    dailyUpdates.length,
    isAdminRole,
    isHrRole,
    isMentor,
    isTeamLeader,
    leads.length,
    meetings.length,
    mentorAtRiskMembers.length,
    mentorReviewCenterData.total,
    pendingSubmissionsCount,
    tasks.length,
    unreadCount,
  ]);

  const mobilePrimaryNavItems = mobileNavItems.slice(0, 4);
  const mobileMoreNavItems = mobileNavItems.slice(4);

  function handleMobileNavItem(item) {
    setMobileMoreOpen(false);
    if (item.key === "chat") {
      setChatMobilePane("channels");
    }
    if (item.section) {
      selectSection(item.section);
      return;
    }
    if (item.href && typeof window !== "undefined") {
      if (item.href === "/") {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = item.href;
      }
    }
  }

  const dashboardAnalytics = useMemo(() => {
    const attendanceTotal = attendance.length || 0;
    const presentCount = attendance.filter((item) => item.status === "present" || item.status === "late").length;
    const taskTotal = tasks.length || 0;
    const completeCount = tasks.filter((task) => ["submitted", "approved"].includes(task.status)).length;
    const tlPerformance = profiles
      .filter((profile) => profile.role === "team_leader")
      .map((tl) => {
        const tlTasks = tasks.filter((task) => task.assigned_by === tl.id);
        const done = tlTasks.filter((task) => ["submitted", "approved"].includes(task.status)).length;
        const tlAttendance = attendance.filter((item) => item.marker?.id === tl.id || item.marked_by === tl.id);
        const present = tlAttendance.filter((item) => item.status === "present" || item.status === "late").length;
        return {
          id: tl.id,
          name: tl.full_name,
          domain: tl.domain,
          tasks: tlTasks.length,
          completion: tlTasks.length ? Math.round((done / tlTasks.length) * 100) : 0,
          attendance: tlAttendance.length ? Math.round((present / tlAttendance.length) * 100) : 0,
        };
      });
    return {
      attendancePercent: attendanceTotal ? Math.round((presentCount / attendanceTotal) * 100) : 0,
      completionPercent: taskTotal ? Math.round((completeCount / taskTotal) * 100) : 0,
      tlPerformance,
    };
  }, [attendance, profiles, tasks]);

  async function loadDashboardData(profile = userProfile, user = sessionUser) {
    if (!user) return;
    try {
      const role = profile?.role || "intern";
      const domain = profile?.domain;
      const shouldLoadTasks = ["super_admin", "hr", "mentor", "team_leader", "intern"].includes(role);
      const shouldLoadMeetings = ["super_admin", "hr", "mentor", "team_leader", "intern"].includes(role);
      const shouldLoadAttendance = ["super_admin", "hr", "mentor", "team_leader", "intern"].includes(role);
      const shouldLoadOperations = true;
      const shouldLoadPeople = ["super_admin", "hr", "mentor", "team_leader"].includes(role);
      const shouldLoadBatches = ["super_admin", "hr", "mentor", "team_leader", "intern"].includes(role);
      const shouldLoadCrmSummary = ["sales", "sales_executive", "telecaller"].includes(domain) || role === "super_admin";
      const shouldLoadCertificates = role === "hr" || role === "super_admin";
      const shouldLoadGovernance = role === "super_admin";
      const [leadsData, certsData, profilesData, notificationsData, batchesData, cmsData, cmsVersionsData, auditData, queueData] = await Promise.all([
        shouldLoadCrmSummary ? getCloudLeads() : Promise.resolve([]),
        shouldLoadCertificates ? getCertificates() : Promise.resolve([]),
        shouldLoadPeople ? getProfiles() : Promise.resolve([]),
        getNotifications(user.id),
        shouldLoadBatches ? getBatches(user.id, role) : Promise.resolve([]),
        shouldLoadGovernance ? getCmsContent() : Promise.resolve([]),
        shouldLoadGovernance ? getCmsVersions() : Promise.resolve([]),
        shouldLoadGovernance ? getAuditLogs() : Promise.resolve([]),
        shouldLoadGovernance ? getNotificationQueue() : Promise.resolve([]),
      ]);
      const scopedBatchIds = (() => {
        if (role === "hr") return (batchesData || []).map((batch) => batch.id).filter(Boolean);
        if (role === "mentor") return (batchesData || []).filter((batch) => batch.mentor_id === user.id).map((batch) => batch.id).filter(Boolean);
        if (profile?.batch_id) return [profile.batch_id];
        return [];
      })();
      const batchScope = scopedBatchIds.length > 1 ? scopedBatchIds : scopedBatchIds[0] || profile?.batch_id;
      const [tasksData, meetingsData, submissionsData, updatesData, reviewsData, attendanceData] = await Promise.all([
        shouldLoadTasks ? getTasks(role, user.id, domain, batchScope) : Promise.resolve([]),
        shouldLoadMeetings ? getMeetings(user.id, role, domain, batchScope) : Promise.resolve([]),
        shouldLoadOperations ? getTaskSubmissions() : Promise.resolve([]),
        shouldLoadTasks ? getDailyUpdates(user.id, role, domain) : Promise.resolve([]),
        shouldLoadTasks ? getTaskReviews() : Promise.resolve([]),
        shouldLoadAttendance ? getAttendance(user.id, role, domain) : Promise.resolve([]),
      ]);
      setLeads(leadsData || []);
      setTasks(tasksData || []);
      setMeetings(meetingsData || []);
      setCertificates(certsData || []);
      setProfiles(profilesData || []);
      setSubmissions(submissionsData || []);
      setNotifications(notificationsData || []);
      setBatches(batchesData || []);
      setDailyUpdates(updatesData || []);
      setTaskReviews(reviewsData || []);
      setAttendance(attendanceData || []);
      setCmsContent(cmsData || []);
      setCmsVersions(cmsVersionsData || []);
      setAuditLogs(auditData || []);
      setNotificationQueue(queueData || []);
    } catch (err) {
      console.warn("Failed to load dashboard data (network or sync):", err?.message || err);
    }
  }

  async function writeAudit(action, entityType, entityId, summary, metadata = {}) {
    if (!sessionUser?.id) return;
    try {
      await createAuditLog({
        actor_id: sessionUser.id,
        actor_role: currentRole,
        action,
        entity_type: entityType,
        entity_id: entityId,
        summary,
        metadata,
      });
    } catch (err) {
      console.warn("Audit log error:", err?.message || err);
    }
  }

  async function fetchProfile(userId, userEmail) {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) {
        console.warn("Profile fetch warning:", error.message);
      }
      const profile =
        data || {
          id: userId,
          full_name: userEmail?.split("@")[0] || "User",
          email: userEmail,
          role: userEmail?.toLowerCase().includes("admin") ? "super_admin" : "intern",
          domain: "web_dev",
        };
      if (["suspended", "paused"].includes(profile.status)) {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore signout error
        }
        setSessionUser(null);
        setUserProfile(null);
        setAuthMessage({
          type: "error",
          text: profile.status === "suspended" ? "Your account is suspended." : "Your account is paused.",
        });
        return;
      }
      setUserProfile(profile);
      await loadDashboardData(profile, { id: userId, email: userEmail });
    } catch (err) {
      console.warn("fetchProfile network error:", err?.message || err);
    }
  }

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setSessionUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        }
      } catch (err) {
        console.warn("Auth check network error:", err?.message || err);
      }
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (!isMounted) return;
        if (event === "PASSWORD_RECOVERY") {
          setAuthMode("reset");
          setAuthMessage({ type: "success", text: "Set a new password to complete secure account setup." });
        }
        if (session?.user) {
          setSessionUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setSessionUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.warn("Auth state change error:", err?.message || err);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionUser) return undefined;
    if (isAdminRole) {
      const adminChannel = supabase
        .channel(`admin-governance-${sessionUser.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "batches" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "task_submissions" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "task_reviews" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "daily_updates" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "batch_messages" }, (payload) => {
          const item = payload.new || payload.old;
          rememberBatchChatActivity(item);
          refreshBatchWorkspace(undefined, { silent: true });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "batch_announcements" }, () => refreshBatchWorkspace(undefined, { silent: true }))
        .on("postgres_changes", { event: "*", schema: "public", table: "batch_resources" }, () => refreshBatchWorkspace(undefined, { silent: true }))
        .on("postgres_changes", { event: "*", schema: "public", table: "batch_escalations" }, () => {
          refreshBatchWorkspace(undefined, { silent: true });
          refreshAccessibleEscalations();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "batch_assignment_history" }, () => refreshBatchWorkspace(undefined, { silent: true }))
        .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${sessionUser.id}` }, (payload) => {
          loadDashboardData();
          if (payload.new?.title) setToast(payload.new.title);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
          const item = payload.new || payload.old;
          if (item?.sender_id === sessionUser.id || item?.receiver_id === sessionUser.id) {
            rememberDirectChatActivity(item);
            if (payload.new) upsertOpenDirectMessage(payload.new);
            if (item?.receiver_id === sessionUser.id) setToast("New message received");
          }
        })
        .subscribe();

      return () => supabase.removeChannel(adminChannel);
    }

    const channel = supabase
      .channel(`workspace-${sessionUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_submissions" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "batches" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "member_assignments" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_updates" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_reviews" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "batch_messages" }, (payload) => {
        const item = payload.new || payload.old;
        rememberBatchChatActivity(item);
        refreshBatchWorkspace(undefined, { silent: true });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "batch_announcements" }, () => refreshBatchWorkspace(undefined, { silent: true }))
      .on("postgres_changes", { event: "*", schema: "public", table: "batch_resources" }, () => refreshBatchWorkspace(undefined, { silent: true }))
      .on("postgres_changes", { event: "*", schema: "public", table: "batch_escalations" }, () => {
        refreshBatchWorkspace(undefined, { silent: true });
        refreshAccessibleEscalations();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "batch_assignment_history" }, () => refreshBatchWorkspace(undefined, { silent: true }))
      .on("postgres_changes", { event: "*", schema: "public", table: "cms_content" }, () => loadDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${sessionUser.id}` }, (payload) => {
        loadDashboardData();
        if (payload.new?.title) setToast(payload.new.title);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        const item = payload.new || payload.old;
        if (item?.sender_id === sessionUser.id || item?.receiver_id === sessionUser.id) {
          rememberDirectChatActivity(item);
          if (payload.new) upsertOpenDirectMessage(payload.new);
          if (item?.receiver_id === sessionUser.id) setToast("New message received");
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser, selectedContactId]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!sessionUser || !selectedBatch?.id) return undefined;
    let cancelled = false;
    async function loadSelectedBatchWorkspace() {
      if (cancelled) return;
      await refreshBatchWorkspace(selectedBatch.id);
    }
    loadSelectedBatchWorkspace();

    const batchChannel = supabase
      .channel(`batch-live-sync-${selectedBatch.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "batch_announcements", filter: `batch_id=eq.${selectedBatch.id}` }, () => {
        refreshBatchWorkspace(selectedBatch.id, { silent: true });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "batch_resources", filter: `batch_id=eq.${selectedBatch.id}` }, () => {
        refreshBatchWorkspace(selectedBatch.id, { silent: true });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "batch_messages", filter: `batch_id=eq.${selectedBatch.id}` }, () => {
        refreshBatchWorkspace(selectedBatch.id, { silent: true });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(batchChannel);
    };
  }, [sessionUser, selectedBatch?.id]);

  useEffect(() => {
    if (!sessionUser?.id) return undefined;
    const channel = supabase.channel("workspace-online-presence", {
      config: { presence: { key: sessionUser.id } },
    });

    const syncPresence = () => {
      const state = channel.presenceState();
      const ids = Object.values(state)
        .flat()
        .map((entry) => entry.user_id)
        .filter(Boolean);
      setWorkspaceOnlineUserIds(Array.from(new Set(ids)));
    };

    channel
      .on("presence", { event: "sync" }, syncPresence)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({
            user_id: sessionUser.id,
            name: userProfile?.full_name || "Member",
            role: userProfile?.role || "member",
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      setWorkspaceOnlineUserIds([]);
      supabase.removeChannel(channel);
    };
  }, [sessionUser?.id, userProfile?.full_name, userProfile?.role]);

  useEffect(() => {
    if (!sessionUser?.id || (!selectedBatch?.id && !selectedContactId)) {
      const resetTimer = window.setTimeout(() => {
        setOnlineUserIds([]);
        setTypingUsers([]);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const roomId = selectedContactId
      ? [sessionUser.id, selectedContactId].sort().join("-")
      : selectedBatch.id;
    const channel = supabase.channel(`chat-presence-${roomId}`, {
      config: { presence: { key: sessionUser.id } },
    });

    const syncPresence = () => {
      const state = channel.presenceState();
      const entries = Object.values(state).flat();
      setOnlineUserIds(entries.map((entry) => entry.user_id).filter(Boolean));
      setTypingUsers(
        entries
          .filter((entry) => {
            if (!entry.typing || entry.user_id === sessionUser.id) return false;
            const typingAt = new Date(entry.typing_at || entry.online_at || 0).getTime();
            return typingAt && Date.now() - typingAt < 3000;
          })
          .map((entry) => ({ id: entry.user_id, name: entry.name }))
      );
    };

    channel
      .on("presence", { event: "sync" }, syncPresence)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({
            user_id: sessionUser.id,
            name: userProfile?.full_name || "Member",
            typing: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    typingChannelRef.current = channel;
    return () => {
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
      typingChannelRef.current = null;
      setOnlineUserIds([]);
      setTypingUsers([]);
      supabase.removeChannel(channel);
    };
  }, [sessionUser?.id, selectedBatch?.id, selectedContactId, userProfile?.full_name]);

  function publishTyping(isTyping) {
    const channel = typingChannelRef.current;
    if (!channel || !sessionUser?.id) return;
    channel.track({
      user_id: sessionUser.id,
      name: userProfile?.full_name || "Member",
      typing: isTyping,
      typing_at: isTyping ? new Date().toISOString() : null,
      online_at: new Date().toISOString(),
    });
    if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
    if (isTyping) {
      typingStopTimerRef.current = setTimeout(() => publishTyping(false), 1800);
    }
  }

  function rememberBatchChatActivity(item) {
    if (!item?.batch_id) return;
    setBatchChatMeta((prev) => {
      const existing = prev[item.batch_id] || {};
      const isOpenBatch = activeSection === "chat" && selectedBatchId === item.batch_id;
      const incomingUnread = item.sender_id !== sessionUser?.id && !isOpenBatch ? 1 : 0;
      return {
        ...prev,
        [item.batch_id]: {
          ...existing,
          unreadCount: isOpenBatch ? 0 : (existing.unreadCount || 0) + incomingUnread,
          lastMessageTime: item.created_at || new Date().toISOString(),
          lastMessagePreview: chatPreview(item),
          lastMessageSenderId: item.sender_id || existing.lastMessageSenderId || "",
        },
      };
    });
  }

  function rememberDirectChatActivity(item) {
    if (!item?.sender_id || !item?.receiver_id || !sessionUser?.id) return;
    const otherId = item.sender_id === sessionUser.id ? item.receiver_id : item.sender_id;
    if (!otherId) return;
    setDirectChatMeta((prev) => {
      const existing = prev[otherId] || {};
      const isOpenDirectChat = activeSection === "chat" && selectedContactId === otherId;
      const incomingUnread = item.receiver_id === sessionUser.id && !isOpenDirectChat && !item.is_read ? 1 : 0;
      return {
        ...prev,
        [otherId]: {
          ...existing,
          unreadCount: isOpenDirectChat ? 0 : (existing.unreadCount || 0) + incomingUnread,
          lastMessageTime: item.created_at || new Date().toISOString(),
          lastMessagePreview: chatPreview(item),
          lastMessageSenderId: item.sender_id,
        },
      };
    });
  }

  function upsertOpenDirectMessage(item) {
    if (!item?.id || !item?.sender_id || !item?.receiver_id || !sessionUser?.id || !selectedContactId) return;
    const otherId = item.sender_id === sessionUser.id ? item.receiver_id : item.sender_id;
    if (otherId !== selectedContactId) return;
    setMessages((prev) => {
      const list = prev || [];
      const existingIndex = list.findIndex((message) => message.id === item.id);
      const next = existingIndex >= 0
        ? list.map((message) => (message.id === item.id ? { ...message, ...item } : message))
        : [...list, item];
      return next.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    });
  }

  function applyDirectReadReceipt({ senderId, readerId, readAt }) {
    if (!senderId || !readerId) return;
    const timestamp = readAt || new Date().toISOString();
    setMessages((prev) =>
      (prev || []).map((message) =>
        message.sender_id === senderId && message.receiver_id === readerId
          ? {
            ...message,
            is_read: true,
            read_at: message.read_at || timestamp,
            delivered_at: message.delivered_at || timestamp,
          }
          : message
      )
    );
  }

  function applyDirectDeliveryReceipt({ senderId, receiverId, deliveredAt }) {
    if (!senderId || !receiverId) return;
    const timestamp = deliveredAt || new Date().toISOString();
    setMessages((prev) =>
      (prev || []).map((message) =>
        message.sender_id === senderId && message.receiver_id === receiverId
          ? {
            ...message,
            delivered_at: message.delivered_at || timestamp,
          }
          : message
      )
    );
  }

  function sendDirectDeliveryReceiptBroadcast(contactId, deliveredAt) {
    if (!sessionUser?.id || !contactId) return;
    const roomId = directChatRoomId(sessionUser.id, contactId);
    if (directChatChannelRoomRef.current !== roomId) {
      directDeliveryReceiptPendingRef.current = { roomId, contactId, deliveredAt };
      return;
    }
    directChatChannelRef.current?.send({
      type: "broadcast",
      event: "delivery_receipt",
      payload: {
        sender_id: contactId,
        receiver_id: sessionUser.id,
        delivered_at: deliveredAt || new Date().toISOString(),
      },
    });
    directDeliveryReceiptPendingRef.current = null;
  }

  async function markDirectChatDelivered(contactId) {
    if (!contactId || !sessionUser?.id) return false;
    const result = await markDirectMessagesDelivered(contactId);
    if (!result) return false;
    const deliveredAt = result?.delivered_at || new Date().toISOString();
    applyDirectDeliveryReceipt({ senderId: contactId, receiverId: sessionUser.id, deliveredAt });
    sendDirectDeliveryReceiptBroadcast(contactId, deliveredAt);
    setTimeout(() => sendDirectDeliveryReceiptBroadcast(contactId, deliveredAt), 250);
    return true;
  }

  function sendDirectReadReceiptBroadcast(contactId, readAt) {
    if (!sessionUser?.id || !contactId) return;
    const roomId = directChatRoomId(sessionUser.id, contactId);
    if (directChatChannelRoomRef.current !== roomId) {
      directReadReceiptPendingRef.current = { roomId, contactId, readAt };
      return;
    }
    directChatChannelRef.current?.send({
      type: "broadcast",
      event: "read_receipt",
      payload: {
        sender_id: contactId,
        reader_id: sessionUser.id,
        read_at: readAt || new Date().toISOString(),
      },
    });
    directReadReceiptPendingRef.current = null;
  }

  async function markDirectChatRead(contactId) {
    if (!contactId || !sessionUser?.id) return false;
    const result = await markDirectMessagesRead(contactId, sessionUser.id);
    if (!result) return false;
    const readAt = result?.read_at || new Date().toISOString();
    applyDirectReadReceipt({ senderId: contactId, readerId: sessionUser.id, readAt });
    sendDirectReadReceiptBroadcast(contactId, readAt);
    setTimeout(() => sendDirectReadReceiptBroadcast(contactId, readAt), 250);
    return true;
  }

  useEffect(() => {
    if (!sessionUser?.id || !selectedContactId) {
      directChatChannelRef.current = null;
      directChatChannelRoomRef.current = "";
      return undefined;
    }

    const roomId = directChatRoomId(sessionUser.id, selectedContactId);
    const channel = supabase
      .channel(`direct-chat-${roomId}`)
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const item = payload?.message;
        if (!item?.id || item.sender_id === sessionUser.id) return;
        rememberDirectChatActivity(item);
        upsertOpenDirectMessage(item);
      })
      .on("broadcast", { event: "read_receipt" }, ({ payload }) => {
        if (!payload?.sender_id || !payload?.reader_id || payload.reader_id === sessionUser.id) return;
        applyDirectReadReceipt({
          senderId: payload.sender_id,
          readerId: payload.reader_id,
          readAt: payload.read_at,
        });
      })
      .on("broadcast", { event: "delivery_receipt" }, ({ payload }) => {
        if (!payload?.sender_id || !payload?.receiver_id || payload.receiver_id === sessionUser.id) return;
        applyDirectDeliveryReceipt({
          senderId: payload.sender_id,
          receiverId: payload.receiver_id,
          deliveredAt: payload.delivered_at,
        });
      })
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;
        const pendingRead = directReadReceiptPendingRef.current;
        if (pendingRead?.roomId === roomId) {
          sendDirectReadReceiptBroadcast(pendingRead.contactId, pendingRead.readAt);
        }
        const pendingDelivery = directDeliveryReceiptPendingRef.current;
        if (pendingDelivery?.roomId === roomId) {
          sendDirectDeliveryReceiptBroadcast(pendingDelivery.contactId, pendingDelivery.deliveredAt);
        }
      });

    directChatChannelRef.current = channel;
    directChatChannelRoomRef.current = roomId;

    return () => {
      if (directChatChannelRef.current === channel) {
        directChatChannelRef.current = null;
        directChatChannelRoomRef.current = "";
      }
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id, selectedContactId]);

  useEffect(() => {
    if (!sessionUser) return undefined;
    let cancelled = false;
    async function loadAccessibleBatchEscalations() {
      const visibleEscalations = await getVisibleBatchEscalations();
      if (cancelled) return;
      const escalations = (visibleEscalations || [])
        .filter((item, index, list) => item?.id && list.findIndex((entry) => entry.id === item.id) === index)
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setAccessibleEscalations(escalations);
    }
    loadAccessibleBatchEscalations();
    return () => {
      cancelled = true;
    };
  }, [sessionUser]);

  useEffect(() => {
    if (!sessionUser || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (section && allowedSections.includes(section)) {
      const timer = setTimeout(() => setActiveSection(section), 0);
      return () => clearTimeout(timer);
    }
  }, [allowedSections, sessionUser]);

  useEffect(() => {
    if (sessionUser && !allowedSections.includes(activeSection)) {
      const timer = setTimeout(() => setActiveSection("overview"), 0);
      return () => clearTimeout(timer);
    }
  }, [activeSection, allowedSections, sessionUser]);

  useEffect(() => {
    if (!sessionUser || !userProfile || attendanceLinkHandledRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("attendance") !== "verify") return;
    attendanceLinkHandledRef.current = true;

    async function verifyAttendanceFromLink() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const response = await fetch("/api/attendance/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || ""}`,
          },
          body: JSON.stringify({
            meeting_id: params.get("meeting_id") || null,
            batch_id: params.get("batch_id") || null,
            token: params.get("token") || "",
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          setToast(result.error || "Attendance verification failed.");
          return;
        }
        setToast(result.alreadyMarked ? "Attendance already verified." : "Attendance verified successfully.");
        await loadDashboardData();
      } catch (err) {
        setToast(err.message || "Attendance verification failed.");
      } finally {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("attendance");
        cleanUrl.searchParams.delete("meeting_id");
        cleanUrl.searchParams.delete("batch_id");
        cleanUrl.searchParams.delete("token");
        cleanUrl.searchParams.set("section", "attendance");
        window.history.replaceState({}, "", cleanUrl.toString());
        setActiveSection("attendance");
      }
    }

    verifyAttendanceFromLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser, userProfile]);

  useEffect(() => {
    if (sessionUser && userProfile?.role === "super_admin" && pathname === "/login") {
      const search = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`/admin${search}`);
    }
  }, [sessionUser, userProfile, pathname, router]);

  useEffect(() => {
    if (userProfile) {
      const timer = setTimeout(() => {
        setProfileEditForm({
          full_name: userProfile.full_name || "",
          phone: userProfile.phone || "",
          avatar_url: userProfile.avatar_url || "",
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [userProfile]);

  async function loadMessages(contactId, options = {}) {
    if (!sessionUser || !contactId) {
      setMessages([]);
      return;
    }
    try {
      const data = await getMessages(sessionUser.id, contactId);
      setMessages(data || []);
      const latest = (data || [])[data?.length - 1];
      setDirectChatMeta((prev) => ({
        ...prev,
        [contactId]: {
          ...(prev[contactId] || {}),
          unreadCount: options.preserveUnread ? (prev[contactId]?.unreadCount || 0) : 0,
          lastMessageTime: latest?.created_at || prev[contactId]?.lastMessageTime || 0,
          lastMessagePreview: latest ? chatPreview(latest) : prev[contactId]?.lastMessagePreview || "",
          lastMessageSenderId: latest?.sender_id || prev[contactId]?.lastMessageSenderId || "",
        },
      }));
    } catch (err) {
      console.warn("Failed to load messages:", err?.message || err);
    }
  }

  useEffect(() => {
    loadMessages(selectedContactId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContactId]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const isMobileChatPane = activeSection === "chat" && chatMobilePane === "chat";
    if (!isMobileChatPane) {
      chatMobileHistoryGuardRef.current = false;
      return undefined;
    }
    if (!chatMobileHistoryGuardRef.current) {
      window.history.pushState({ texwebChatPane: true }, "", window.location.href);
      chatMobileHistoryGuardRef.current = true;
    }
    const handlePopState = () => {
      if (chatMobileHistoryGuardRef.current) {
        chatMobileHistoryGuardRef.current = false;
        chatBackSuppressAutoOpenRef.current = true;
        setSelectedContactId("");
        setSelectedBatchId("");
        setChatMobilePane("channels");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeSection, chatMobilePane]);

  useEffect(() => {
    if (activeSection !== "chat" || !selectedContactId || !sessionUser?.id || !canAccessDirectChat) return undefined;
    let cancelled = false;
    let inFlight = false;
    let timer = null;

    const scheduleSync = () => {
      timer = setTimeout(async () => {
        if (cancelled) return;
        const hidden = typeof document !== "undefined" && document.hidden;
        const offline = typeof navigator !== "undefined" && navigator.onLine === false;
        if (!hidden && !offline && !inFlight) {
          inFlight = true;
          try {
            await loadMessages(selectedContactId, { preserveUnread: true });
          } finally {
            inFlight = false;
          }
        }
        if (!cancelled) scheduleSync();
      }, 60_000);
    };

    scheduleSync();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, selectedContactId, sessionUser?.id, canAccessDirectChat]);

  const chatAutoOpenKey = useMemo(() => {
    const topBatch = sortedChatBatches[0] || null;
    const topContact = sortedChatContacts[0] || null;
    return JSON.stringify({
      batchId: topBatch?.id || "",
      batchMessageTime: topBatch ? batchChatMeta[topBatch.id]?.lastMessageTime || "" : "",
      batchNotificationTime: topBatch ? batchNotificationMeta[topBatch.id]?.lastMessageTime || "" : "",
      batchUpdatedAt: topBatch?.updated_at || topBatch?.created_at || "",
      batchUnread: topBatch ? batchChatMeta[topBatch.id]?.unreadCount || 0 : 0,
      contactId: topContact?.id || "",
      contactMessageTime: topContact ? directChatMeta[topContact.id]?.lastMessageTime || "" : "",
      contactUnread: topContact ? directChatMeta[topContact.id]?.unreadCount || 0 : 0,
    });
  }, [sortedChatBatches, sortedChatContacts, batchChatMeta, batchNotificationMeta, directChatMeta]);

  useEffect(() => {
    if (activeSection !== "chat") {
      chatBackSuppressAutoOpenRef.current = false;
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "chat" || selectedBatchId || selectedContactId) return;
    if (chatBackSuppressAutoOpenRef.current) return;

    const topBatch = sortedChatBatches[0] || null;
    const topContact = sortedChatContacts[0] || null;
    const batchTime = topBatch
      ? Math.max(
        chatTimestamp(batchChatMeta[topBatch.id]?.lastMessageTime),
        chatTimestamp(batchNotificationMeta[topBatch.id]?.lastMessageTime),
        chatTimestamp(topBatch.updated_at || topBatch.created_at)
      )
      : 0;
    const contactTime = topContact ? chatTimestamp(directChatMeta[topContact.id]?.lastMessageTime) : 0;
    const batchUnread = topBatch ? (batchChatMeta[topBatch.id]?.unreadCount || 0) : 0;
    const contactUnread = topContact ? (directChatMeta[topContact.id]?.unreadCount || 0) : 0;

    if (topContact && (contactUnread > 0 || (!topBatch && contactTime) || (contactTime > batchTime && batchUnread === 0))) {
      setChatChannelTab("direct");
      setSelectedContactId(topContact.id);
      setChatMobilePane("chat");
      return;
    }

    if (topBatch) {
      setChatChannelTab("batches");
      setSelectedBatchId(topBatch.id);
      setBatchChatMeta((prev) => ({
        ...prev,
        [topBatch.id]: {
          ...(prev[topBatch.id] || {}),
          unreadCount: 0,
        },
      }));
      setChatMobilePane("chat");
      return;
    }

    if (topContact) {
      setChatChannelTab("direct");
      setSelectedContactId(topContact.id);
      setChatMobilePane("chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, selectedBatchId, selectedContactId, chatAutoOpenKey]);

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setAuthMessage({ type: "", text: "" });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setAuthMessage({
          type: "error",
          text: error.message.includes("Invalid login credentials")
            ? "Invalid email or password. Please use your secure setup link or Forgot password."
            : error.message,
        });
      } else if (data?.user) {
        setSessionUser(data.user);
        await fetchProfile(data.user.id, data.user.email);
        setAuthMessage({ type: "success", text: "Signed in successfully. Opening dashboard..." });
        if (data.user.email?.toLowerCase().includes("admin")) {
          router.replace("/admin");
        }
      }
    } catch {
      setAuthMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setLoading(true);
    setAuthMessage({ type: "", text: "" });
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : "https://texwebsolution.in/login";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      setAuthMessage(error ? { type: "error", text: error.message } : { type: "success", text: "Password reset link sent to your email." });
    } catch {
      setAuthMessage({ type: "error", text: "Error sending reset email." });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOwnPassword(e) {
    e.preventDefault();
    setLoading(true);
    setAuthMessage({ type: "", text: "" });
    try {
      if (newPassword.trim().length < 12) {
        setAuthMessage({ type: "error", text: "Password must be at least 12 characters." });
        setToast("Password must be at least 12 characters.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) {
        setAuthMessage({ type: "error", text: error.message });
        setToast(error.message);
        return;
      }
      setNewPassword("");
      setAuthMode("signin");
      setToast("Password updated securely.");
      setAuthMessage({ type: "success", text: "Password updated successfully." });
    } catch {
      setAuthMessage({ type: "error", text: "Error updating password." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out warning:", err?.message || err);
    }
    setSessionUser(null);
    setUserProfile(null);
    setEmail("");
    setPassword("");
    setAuthMessage({ type: "", text: "" });
    if (typeof window !== "undefined") {
      router.push("/login");
    }
  }

  async function handleSaveOwnProfile(e) {
    e.preventDefault();
    if (!sessionUser?.id) return;
    setSavingProfile(true);
    try {
      const updates = {
        full_name: profileEditForm.full_name.trim(),
        phone: profileEditForm.phone.trim(),
        avatar_url: profileEditForm.avatar_url.trim(),
      };
      const updated = await updateUserProfile(sessionUser.id, updates);
      if (updated) {
        setUserProfile((prev) => ({ ...prev, ...updates }));
        setProfiles((prev) => prev.map((p) => (p.id === sessionUser.id ? { ...p, ...updates } : p)));
        setToast("Profile updated successfully!");
      } else {
        setUserProfile((prev) => ({ ...prev, ...updates }));
        setToast("Profile saved.");
      }
    } catch (err) {
      setToast(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file || !sessionUser?.id) return;
    setAvatarUploading(true);
    setAvatarProcessingMsg("Resizing & converting to WebP...");
    try {
      // 1. Automatically resize to 400x400 square and convert to .webp
      const processed = await processImageToWebp(file, {
        maxSize: 400,
        quality: 0.85,
        squareCrop: true,
      });

      setAvatarStats({
        originalKb: processed.originalKb,
        newKb: processed.newKb,
        savingsPercent: processed.savingsPercent,
      });

      // 2. Upload WebP file / dataUrl
      setAvatarProcessingMsg("Saving WebP photo to profile...");
      const targetPayload = processed.file || processed.dataUrl;
      const url = await uploadAvatarImage(targetPayload, sessionUser.id);
      const finalUrl = url || processed.dataUrl;

      if (finalUrl) {
        setProfileEditForm((prev) => ({ ...prev, avatar_url: finalUrl }));
        await updateUserProfile(sessionUser.id, { avatar_url: finalUrl });
        setUserProfile((prev) => ({ ...prev, avatar_url: finalUrl }));
        setProfiles((prev) => prev.map((p) => (p.id === sessionUser.id ? { ...p, avatar_url: finalUrl } : p)));
        setToast(`Photo saved! Converted to WebP (${processed.newKb} KB, ${processed.savingsPercent}% smaller).`);
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      setToast(err.message || "Error processing profile photo.");
    } finally {
      setAvatarUploading(false);
      setAvatarProcessingMsg("");
      if (e.target) e.target.value = "";
    }
  }

  async function handleRemoveAvatar() {
    if (!sessionUser?.id) return;
    setAvatarUploading(true);
    setAvatarProcessingMsg("Removing profile photo...");
    try {
      setProfileEditForm((prev) => ({ ...prev, avatar_url: "" }));
      await updateUserProfile(sessionUser.id, { avatar_url: "" });
      setUserProfile((prev) => ({ ...prev, avatar_url: "" }));
      setProfiles((prev) => prev.map((p) => (p.id === sessionUser.id ? { ...p, avatar_url: "" } : p)));
      setAvatarStats(null);
      setToast("Profile photo removed.");
    } catch (err) {
      setToast("Failed to remove profile photo.");
    } finally {
      setAvatarUploading(false);
      setAvatarProcessingMsg("");
    }
  }

  async function handleChangeOwnPassword(e) {
    e.preventDefault();
    if (!changePasswordForm.password.trim()) {
      setToast("Please enter a new password.");
      return;
    }
    if (changePasswordForm.password.trim().length < 8) {
      setToast("Password must be at least 8 characters long.");
      return;
    }
    if (changePasswordForm.password !== changePasswordForm.confirm) {
      setToast("Passwords do not match.");
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: changePasswordForm.password.trim() });
      if (error) throw error;
      setChangePasswordForm({ password: "", confirm: "" });
      setToast("Password updated successfully!");
    } catch (err) {
      setToast(err.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  }

  async function handleEnrollMember(e) {
    e.preventDefault();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const selectedBatch = batches.find((b) => b.id === memberForm.batch_id);
      if (isHrRole && !selectedBatch) {
        setToast("Please select an assigned batch first.");
        return;
      }
      const resolvedDomain = isAdminRole && memberForm.role === "hr" ? "management" : isHrRole ? selectedBatch.domain : memberForm.domain;
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          full_name: memberForm.full_name,
          email: memberForm.email,
          phone: memberForm.phone.replace(/[^0-9]/g, ""),
          role: memberForm.role,
          domain: resolvedDomain,
          batch_id: memberForm.batch_id || null,
          batch_name: selectedBatch?.name || null,
          assigned_tl_id: null,
          assigned_mentor_id: memberForm.role === "intern" ? selectedBatch?.mentor_id || null : null,
          password: memberForm.temp_password,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setToast(result.error || "Enrollment failed.");
        return;
      }
      if (result.profile?.id && result.setup_link) {
        setSetupLinks((prev) => ({ ...prev, [result.profile.id]: result.setup_link }));
      }
      setNewMemberModal(false);
      await createNotification({
        user_id: sessionUser.id,
        title: `${ROLE_LABELS[result.profile?.role] || "Account"} created`,
        message: `${result.profile?.full_name || memberForm.full_name} account has been created and setup link is ready.`,
        type: "general",
        link_url: "/login?section=members",
        channels: [],
      });
      if (result.profile?.id && result.profile.id !== sessionUser.id) {
        await createNotification({
          user_id: result.profile.id,
          title: "Workspace account ready",
          message: `Your ${ROLE_LABELS[result.profile?.role] || "TexWeb"} account is ready. Complete setup from the secure link shared by your manager.`,
          type: "general",
          link_url: "/login?section=alerts",
          channels: [],
        });
      }
      setToast(result.setup_link ? "Account created. Send secure setup link on WhatsApp." : "Account created. Ask user to use Forgot password.");
      await loadDashboardData();
      setMemberForm({
        full_name: "",
        email: "",
        phone: "",
        role: "intern",
        domain: batches[0]?.domain || "web_dev",
        batch_id: "",
        assigned_tl_id: "",
        assigned_mentor_id: "",
        temp_password: createTempPassword(),
      });
    } catch (err) {
      console.warn("Enroll member error:", err);
      setToast("Network error creating account. Please try again.");
    }
  }

  function openEnrollMemberModal(roleOverride = "") {
    const defaultRole = memberRoleOptions.some(([role]) => role === roleOverride) ? roleOverride : memberRoleOptions[0]?.[0] || "intern";
    const defaultBatch = isHrRole ? batches[0] : null;
    setMemberForm((prev) => ({
      ...prev,
      role: roleOverride || (memberRoleOptions.some(([role]) => role === prev.role) ? prev.role : defaultRole),
      batch_id: isHrRole ? defaultBatch?.id || "" : prev.batch_id,
      domain: isHrRole ? defaultBatch?.domain || "web_dev" : prev.domain,
      assigned_tl_id: "",
      assigned_mentor_id: "",
    }));
    setNewMemberModal(true);
  }

  function openTaskModal() {
    const defaultBatch = isMentor ? ownedBatches[0] : null;
    setTaskForm((prev) => ({
      ...prev,
      batch_id: defaultBatch?.id || prev.batch_id || "",
      domain: defaultBatch?.domain || userProfile?.domain || prev.domain,
      assign_scope: isMentor ? prev.assign_scope || "tl" : "intern",
      assign_target: "",
      assigned_to: "",
      reference_file: null,
    }));
    setNewTaskModal(true);
  }

  function handleSendWhatsapp(member) {
    if (!member.phone) {
      setToast("WhatsApp phone number is missing.");
      return;
    }
    const setupLine = member.setup_link
      ? `Secure Setup Link: ${member.setup_link}\n`
      : "Setup: Open login page and use Forgot password to set your password.\n";
    const message = encodeURIComponent(
      `*Welcome to TexWeb Solution Panel!*\n\nHello *${member.full_name}*,\nYour secure portal setup details are:\n\nURL: https://texwebsolution.in/login\nEmail: ${member.email}\n${setupLine}Domain: ${domainLabel(member.domain)}\nSupervisor: ${member.assigned_tl}\n\nPlease set your own password and do not share this link with anyone.`
    );
    window.open(`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  function openEditMemberModal(member) {
    const profile = profiles.find((item) => item.id === member.id) || member;
    setEditMemberForm({
      full_name: profile.full_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      role: profile.role || "intern",
      domain: profile.domain || "web_dev",
      status: profile.status || "active",
      batch_id: profile.batch_id || "",
      assigned_tl_id: profile.assigned_tl_id || "",
      assigned_mentor_id: profile.assigned_mentor_id || "",
      password: "",
    });
    setEditMemberModal(member.id);
  }
  const openEditMember = openEditMemberModal;

  async function handleUpdateMember(e) {
    e.preventDefault();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const selectedBatch = batches.find((b) => b.id === editMemberForm.batch_id);
      const resolvedDomain = isHrRole ? selectedBatch?.domain || editMemberForm.domain : editMemberForm.domain;
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          id: editMemberModal,
          full_name: editMemberForm.full_name,
          email: editMemberForm.email,
          phone: editMemberForm.phone.replace(/[^0-9]/g, ""),
          role: editMemberForm.role,
          domain: resolvedDomain,
          status: editMemberForm.status,
          batch_id: editMemberForm.batch_id || null,
          batch_name: selectedBatch?.name || null,
          assigned_tl_id: editMemberForm.assigned_tl_id || null,
          assigned_mentor_id: editMemberForm.assigned_mentor_id || null,
          password: editMemberForm.password,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setToast(result.error || "Update failed.");
        return;
      }
      setEditMemberModal(null);
      setToast("Profile updated.");
      await loadDashboardData();
    } catch (err) {
      console.warn("Update member error:", err);
      setToast("Network error updating profile. Please try again.");
    }
  }

  async function handleSaveCmsContent(e) {
    e.preventDefault();
    if (!cmsPreview.valid) {
      setToast(`Validation error: ${cmsPreview.message}`);
      return;
    }
    const saved = await upsertCmsContent({
      key: cmsForm.key.trim(),
      content_json: cmsPreview.data,
      updated_by: sessionUser?.id,
    });
    if (!saved) {
      setToast("Failed to save CMS block.");
      return;
    }
    setCmsContent((prev) => [saved, ...prev.filter((item) => item.key !== saved.key)]);
    setCmsVersions(await getCmsVersions());
    setCmsModal(false);
    setCmsForm({ key: "homepage.hero", title: "", subtitle: "", body: "", cta: "", raw_json: "" });
    setToast("CMS block saved.");
  }

  function openCmsEditor(item = null) {
    if (!item) {
      setCmsForm({ key: "homepage.hero", title: "", subtitle: "", body: "", cta: "", raw_json: "" });
      setCmsModal(true);
      return;
    }
    const content = item.content_json || {};
    setCmsForm({
      key: item.key,
      title: content.title || "",
      subtitle: content.subtitle || "",
      body: typeof content.body === "string" ? content.body : content.body ? JSON.stringify(content.body, null, 2) : "",
      cta: content.cta || "",
      raw_json: JSON.stringify(content, null, 2),
    });
    setCmsModal(true);
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    const selectedBatch = isMentor
      ? ownedBatches.find((batch) => batch.id === taskForm.batch_id)
      : null;
    const [mentorAssignScope, mentorAssignedTo] = isMentor && taskForm.assign_target
      ? taskForm.assign_target.split(":")
      : [taskForm.assign_scope, taskForm.assigned_to];
    const assignedToId = isMentor && mentorAssignScope === "interns" ? "" : isMentor ? mentorAssignedTo : taskForm.assigned_to;
    const assignedProfile = profiles.find((profile) => profile.id === assignedToId)
      || selectedBatch?.tl?.id === assignedToId && selectedBatch.tl
      || selectedBatch?.members?.find((profile) => profile.id === assignedToId);
    const relatedBatch = selectedBatch || batches.find((batch) => batch.id === (assignedProfile?.batch_id || userProfile?.batch_id)) || ownedBatches[0] || null;
    if (isMentor && !selectedBatch) {
      setToast("Please select a batch before assigning the task.");
      return;
    }
    if (isMentor && mentorAssignScope !== "interns" && !assignedProfile) {
      setToast("Please select who should receive this task.");
      return;
    }
    if (isMentor && ["tl", "both"].includes(mentorAssignScope) && (assignedProfile?.role !== "team_leader" || assignedProfile.batch_id !== selectedBatch.id)) {
      setToast("Please select the TL from the selected batch.");
      return;
    }
    if (isTeamLeader && (!assignedProfile || assignedProfile.role !== "intern" || assignedProfile.batch_id !== userProfile?.batch_id)) {
      setToast("TL can assign tasks only to interns from their own batch.");
      return;
    }
    let fileMeta = {};
    if (taskForm.reference_file) {
      if (!["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(taskForm.reference_file.type)) {
        setToast("Only PDF, PNG, JPG, or WebP reference files are allowed.");
        return;
      }
      const uploaded = await uploadTaskReferenceFile(taskForm.reference_file, sessionUser?.id);
      if (!uploaded) {
        setToast("Reference file upload failed. Please try again.");
        return;
      }
      fileMeta = uploaded;
    }
    const newTask = {
      title: taskForm.title,
      description: taskForm.description,
      domain: relatedBatch?.domain || assignedProfile?.domain || taskForm.domain,
      assigned_by: sessionUser?.id,
      assigned_to: assignedToId || null,
      batch_id: relatedBatch?.id || assignedProfile?.batch_id || userProfile?.batch_id || null,
      visible_to_interns: isMentor && mentorAssignScope !== "tl",
      assignment_scope: isMentor && mentorAssignScope === "interns" ? "intern" : isMentor ? mentorAssignScope : "intern",
      reference_url: taskForm.reference_url.trim() ? safeExternalUrl(taskForm.reference_url.trim(), "") : null,
      start_date: taskForm.start_date || null,
      expected_output: taskForm.expected_output || null,
      ...fileMeta,
      priority: taskForm.priority,
      deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : new Date().toISOString(),
      status: "pending",
    };
    const saved = await createCloudTask(newTask);
    setTasks([saved || newTask, ...tasks]);
    await writeAudit("task.create", "task", saved?.id, `Assigned task ${taskForm.title}`);
    setNewTaskModal(false);
    setToast("Task assigned.");
    setTaskForm({ title: "", description: "", domain: userProfile?.domain || "web_dev", batch_id: "", assign_scope: "tl", assign_target: "", assigned_to: "", reference_url: "", reference_file: null, priority: "medium", start_date: "", expected_output: "", deadline: "" });
    await loadDashboardData();
  }

  async function handleCreateBatch(e) {
    e.preventDefault();
    const assignedHr = profiles.find((profile) => profile.id === batchForm.hr_id);
    if (!assignedHr) {
      setToast("Please select an HR before creating the batch.");
      return;
    }
    const batch = {
      name: batchForm.name,
      batch_type: batchForm.batch_type || "internship",
      domain: batchForm.domain,
      hr_id: assignedHr.id,
      mentor_id: null,
      tl_id: null,
      starts_at: batchForm.starts_at || new Date().toISOString().split("T")[0],
      ends_at: null,
      created_by: sessionUser?.id,
      status: "active",
    };
    const saved = await createBatch(batch);
    if (!saved) {
      setToast("Failed to create batch.");
      return;
    }
    const populated = {
      ...saved,
      hr: assignedHr || null,
      mentor: null,
      tl: null,
    };
    setBatches([populated, ...batches]);
    await writeAudit("batch.create", "batch", saved.id, `Created batch ${saved.name}`);
    await createNotification({
      user_id: sessionUser.id,
      title: "Batch created",
      message: `${saved.name} batch created for ${domainLabel(saved.domain)}${assignedHr ? ` and assigned to HR ${assignedHr.full_name}.` : "."}`,
      type: "general",
      link_url: "/login?section=batches",
      channels: [],
    });
    const hrId = saved.hr_id || batchForm.hr_id;
    if (hrId && hrId !== sessionUser.id) {
      await createNotification({
        user_id: hrId,
        title: "Batch assigned",
        message: `${saved.name} batch has been assigned to you for HR coordination.`,
        type: "general",
        link_url: "/login?section=batches",
        channels: [],
      });
    }
    setNewBatchModal(false);
    setToast("Batch created successfully.");
    setBatchForm({ name: "", batch_type: "internship", domain: "web_dev", hr_id: "", starts_at: "" });
  }

  function openEditBatch(batch) {
    setEditBatchForm({
      id: batch.id,
      name: batch.name || "",
      batch_type: batch.batch_type || "internship",
      domain: batch.domain || "web_dev",
      hr_id: batch.hr_id || "",
      status: batch.status || "active",
      starts_at: batch.starts_at || "",
    });
    setEditBatchModal(batch);
  }

  async function handleToggleBatchStatus(batch) {
    const newStatus = batch.status === "paused" ? "active" : "paused";
    const updated = await updateBatch(batch.id, { status: newStatus, updated_at: new Date().toISOString() });
    if (!updated) {
      setToast("Failed to update batch status.");
      return;
    }
    setBatches((prev) => prev.map((b) => (b.id === batch.id ? { ...b, status: newStatus } : b)));
    await writeAudit("batch.status", "batch", batch.id, `${newStatus === "paused" ? "Paused" : "Resumed"} batch ${batch.name}`);
    setToast(`Batch "${batch.name}" is now ${newStatus === "paused" ? "Paused" : "Active"}.`);
  }

  async function handleUpdateBatch(e) {
    e.preventDefault();
    if (!editBatchModal) return;
    const assignedHr = profiles.find((profile) => profile.id === editBatchForm.hr_id);
    if (!assignedHr) {
      setToast("Please select an HR before saving the batch.");
      return;
    }

    const updates = {
      name: editBatchForm.name,
      batch_type: editBatchForm.batch_type || "internship",
      domain: editBatchForm.domain,
      hr_id: assignedHr.id,
      status: editBatchForm.status || "active",
      starts_at: editBatchForm.starts_at || null,
      updated_at: new Date().toISOString(),
    };

    const updated = await updateBatch(editBatchModal.id, updates);
    if (!updated) {
      setToast("Failed to update batch.");
      return;
    }

    const populated = {
      ...updated,
      hr: assignedHr || null,
      mentor: editBatchModal.mentor || null,
      tl: editBatchModal.tl || null,
    };

    setBatches(batches.map((b) => (b.id === editBatchModal.id ? { ...b, ...populated } : b)));
    await writeAudit("batch.update", "batch", editBatchModal.id, `Updated batch ${editBatchForm.name}`);

    if (editBatchForm.hr_id && editBatchForm.hr_id !== editBatchModal.hr_id) {
      await createBatchWorkspaceItem({
        type: "assignment_history",
        batch_id: editBatchModal.id,
        assignment_type: "hr",
        old_user_id: editBatchModal.hr_id || null,
        new_user_id: editBatchForm.hr_id,
        note: "HR assignment changed from batch edit.",
      });
      await createNotification({
        user_id: editBatchForm.hr_id,
        title: "Batch assigned",
        message: `${editBatchForm.name} batch has been assigned to you for HR coordination.`,
        type: "general",
        link_url: "/login?section=batches",
        channels: [],
      });
    }

    setEditBatchModal(null);
    setToast("Batch updated successfully.");
  }

  function openAssignLeads(batch) {
    setAssignLeadsForm({
      batch_id: batch.id,
      batch_name: batch.name || "",
      domain: batch.domain || "web_dev",
      mentor_id: batch.mentor_id || "",
      tl_id: batch.tl_id || "",
    });
    setAssignLeadsModal(batch);
  }

  async function handleAssignBatchLeads(e) {
    e.preventDefault();
    if (!assignLeadsModal) return;
    const assignedMentor = profiles.find((profile) => profile.id === assignLeadsForm.mentor_id);
    const assignedTl = profiles.find((profile) => profile.id === assignLeadsForm.tl_id);

    if (isMentor) {
      if (!assignedTl || assignedTl.role !== "intern" || assignedTl.batch_id !== assignLeadsModal.id) {
        setToast("Select an intern from this batch to promote as TL.");
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          id: assignedTl.id,
          role: "team_leader",
          batch_id: assignLeadsModal.id,
          batch_name: assignLeadsForm.batch_name,
          domain: assignLeadsForm.domain,
          assigned_mentor_id: sessionUser.id,
          promote_to_tl_for_batch_id: assignLeadsModal.id,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setToast(result.error || "Failed to assign TL.");
        return;
      }
      const updated = await updateBatch(assignLeadsModal.id, { tl_id: assignedTl.id, updated_at: new Date().toISOString() });
      if (!updated) {
        setToast("TL profile updated, but batch TL link failed.");
        await loadDashboardData();
        return;
      }
      setBatches(batches.map((b) => (b.id === assignLeadsModal.id ? { ...b, ...updated, tl: { ...assignedTl, role: "team_leader" } } : b)));
      await createBatchWorkspaceItem({
        type: "assignment_history",
        batch_id: assignLeadsModal.id,
        assignment_type: "team_leader",
        old_user_id: assignLeadsModal.tl_id || null,
        new_user_id: assignedTl.id,
        member_id: assignedTl.id,
        note: "Mentor changed Team Leader.",
      });
      await createNotification({
        user_id: assignedTl.id,
        title: "Team Leader assigned",
        message: `You have been assigned as Team Leader for batch ${assignLeadsForm.batch_name}.`,
        type: "general",
        link_url: "/login?section=batches",
        channels: [],
      });
      setAssignLeadsModal(null);
      setToast("Intern promoted and assigned as TL.");
      await loadDashboardData();
      return;
    }

    if (assignLeadsForm.mentor_id && (!assignedMentor || assignedMentor.role !== "mentor")) {
      setToast("Select a valid mentor.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const response = await fetch("/api/admin/batches", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      },
      body: JSON.stringify({
        batch_id: assignLeadsModal.id,
        mentor_id: assignLeadsForm.mentor_id || null,
      }),
    });
    const result = await response.json().catch(() => ({}));
    const updated = result.batch || null;
    if (!updated) {
      setToast(result.error || "Failed to assign leads.");
      return;
    }

    const populated = {
      ...assignLeadsModal,
      ...updated,
      mentor: assignedMentor || null,
      tl: assignedTl || null,
    };

    setBatches(batches.map((b) => (b.id === assignLeadsModal.id ? { ...b, ...populated } : b)));
    await writeAudit("batch.assign_mentor", "batch", assignLeadsModal.id, `Assigned Mentor to batch ${assignLeadsForm.batch_name}`);

    if (assignLeadsForm.mentor_id && assignLeadsForm.mentor_id !== assignLeadsModal.mentor_id) {
      await createBatchWorkspaceItem({
        type: "assignment_history",
        batch_id: assignLeadsModal.id,
        assignment_type: "mentor",
        old_user_id: assignLeadsModal.mentor_id || null,
        new_user_id: assignLeadsForm.mentor_id,
        note: "HR changed batch mentor.",
      });
      await createNotification({
        user_id: assignLeadsForm.mentor_id,
        title: "Batch assigned",
        message: `You have been assigned as Supervisor Mentor for batch ${assignLeadsForm.batch_name}.`,
        type: "general",
        link_url: "/login?section=batches",
        channels: [],
      });
    }

    setAssignLeadsModal(null);
    setToast("Mentor assigned to batch.");
  }

  async function handleCreateDailyUpdate(e) {
    e.preventDefault();
    const selectedTask = tasks.find((task) => task.id === dailyUpdateForm.task_id);
    const selectedBatch = batches.find((batch) => batch.id === (dailyUpdateForm.batch_id || selectedTask?.batch_id));
    const mentorId = dailyUpdateForm.mentor_id || selectedBatch?.mentor_id || profiles.find((p) => p.role === "mentor" && p.domain === userProfile?.domain)?.id || userProfile?.assigned_mentor_id || null;
    const update = {
      tl_id: sessionUser.id,
      mentor_id: mentorId,
      task_id: dailyUpdateForm.task_id || null,
      batch_id: selectedBatch?.id || dailyUpdateForm.batch_id || null,
      domain: selectedBatch?.domain || userProfile?.domain || "web_dev",
      summary: dailyUpdateForm.summary,
      blockers: dailyUpdateForm.blockers,
      present_interns: dailyUpdateForm.present_interns,
      absent_interns: dailyUpdateForm.absent_interns,
      completed_tasks: dailyUpdateForm.completed_tasks,
      pending_tasks: dailyUpdateForm.pending_tasks,
      tomorrow_plan: dailyUpdateForm.tomorrow_plan,
      assigned_tasks: dailyUpdateForm.assigned_tasks,
      completed_count: Number(dailyUpdateForm.completed_count || 0),
      pending_count: Number(dailyUpdateForm.pending_count || 0),
    };
    const saved = await createDailyUpdate(update);
    if (!saved) {
      setToast("Update failed.");
      return;
    }
    setDailyUpdates([saved, ...dailyUpdates]);
    setDailyUpdateModal(false);
    setDailyUpdateForm({ task_id: "", mentor_id: "", batch_id: "", summary: "", blockers: "", present_interns: "", absent_interns: "", completed_tasks: "", pending_tasks: "", tomorrow_plan: "", assigned_tasks: "", reviewer_comment: "", completed_count: 0, pending_count: 0 });
    setToast("Daily update sent.");
  }

  function openDailyUpdateModal(task = null) {
    const batch = task?.batch_id ? batches.find((item) => item.id === task.batch_id) : batches.find((item) => item.id === userProfile?.batch_id) || ownedBatches[0];
    setDailyUpdateForm((prev) => ({
      ...prev,
      task_id: task?.id || "",
      batch_id: batch?.id || prev.batch_id || "",
      mentor_id: batch?.mentor_id || userProfile?.assigned_mentor_id || prev.mentor_id || "",
      assigned_tasks: task?.title || prev.assigned_tasks || "",
    }));
    setDailyUpdateModal(true);
  }

  async function handleDailyComment(e) {
    e.preventDefault();
    if (!dailyCommentModal) return;
    const saved = await commentDailyUpdate(dailyCommentModal.id, dailyCommentText);
    if (!saved) {
      setToast("Daily update comment failed.");
      return;
    }
    setDailyUpdates((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
    setDailyCommentModal(null);
    setDailyCommentText("");
    setToast("Daily update commented.");
  }

  async function handleCreateReview(e) {
    e.preventDefault();
    const taskId = typeof reviewModal === "object" ? reviewModal.id : reviewModal;
    const latestSubmission = latestSubmissionByTaskId.get(taskId);
    if (!latestSubmission) {
      setToast("No submitted work found for this task.");
      return;
    }
    const review = {
      task_id: taskId,
      submission_id: latestSubmission.id,
      reviewer_id: sessionUser?.id,
      review_stage: isMentor ? "mentor_review" : isTeamLeader ? "tl_review" : "admin_review",
      status: reviewForm.status,
      rating: Number(reviewForm.rating || 5),
      feedback: reviewForm.feedback,
    };
    const saved = await createTaskReview(review);
    if (!saved) {
      setToast("Review failed.");
      return;
    }
    setTaskReviews([saved, ...taskReviews]);
    setReviewModal(null);
    setToast("Review saved.");
    await loadDashboardData();
  }

  async function handleMarkAttendance(e) {
    e.preventDefault();
    const userId = attendanceForm.user_id || sessionUser?.id;
    const profile = profiles.find((item) => item.id === userId) || userProfile;
    const saved = await markAttendance({
      user_id: userId,
      batch_id: attendanceForm.batch_id || profile?.batch_id || null,
      meeting_id: attendanceForm.meeting_id || null,
      domain: profile?.domain || userProfile?.domain || "web_dev",
      status: attendanceForm.status,
      marked_by: sessionUser?.id,
      notes: attendanceForm.notes,
    });
    if (!saved) {
      setToast("Failed to mark attendance.");
      return;
    }
    setAttendance([saved, ...attendance]);
    setAttendanceModal(false);
    setToast("Attendance saved.");
  }

  async function handleTaskStatus(task, status) {
    const saved = await updateCloudTaskStatus(task.id, status);
    if (!saved) {
      setToast("Status update failed.");
      return;
    }
    setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, ...saved } : item)));
    setToast(`Status updated to ${status}.`);
  }

  function openMeetingModal() {
    const defaultBatch = isTeamLeader
      ? batches.find((batch) => batch.id === userProfile?.batch_id)
      : ownedBatches[0] || batches.find((batch) => batch.id === userProfile?.batch_id);
    setMeetingForm((prev) => ({
      ...prev,
      batch_id: defaultBatch?.id || "",
      attendance_token: createAttendanceToken(),
    }));
    setNewMeetingModal(true);
  }

  function createAttendanceToken() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function buildAttendanceLink(meeting) {
    if (typeof window === "undefined" || !meeting?.id) return "";
    const url = new URL("/login", window.location.origin);
    url.searchParams.set("section", "attendance");
    url.searchParams.set("attendance", "verify");
    url.searchParams.set("meeting_id", meeting.id);
    if (meeting.batch_id) url.searchParams.set("batch_id", meeting.batch_id);
    if (meeting.attendance_token) url.searchParams.set("token", meeting.attendance_token);
    return url.toString();
  }

  async function copyAttendanceLink(meeting) {
    const link = buildAttendanceLink(meeting);
    if (!link) {
      setToast("Attendance link unavailable for this meeting.");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setToast("Attendance verification link copied to clipboard.");
    } catch {
      setShareLinkModal({
        title: "Attendance Verification Link",
        subtitle: `Verification link for ${meeting?.title || "meeting"}`,
        link,
      });
    }
  }

  async function handleCreateMeeting(e) {
    e.preventDefault();
    const selectedBatch = batches.find((batch) => batch.id === meetingForm.batch_id) || null;
    const attendee = profiles.find((profile) => profile.id === meetingForm.attendee_id);
    if (!selectedBatch?.id) {
      setToast("Please select a batch for this meeting.");
      return;
    }
    if ((isMentor || isTeamLeader) && selectedBatch?.id && !ownedBatchIds.has(selectedBatch.id) && selectedBatch.id !== userProfile?.batch_id) {
      setToast("You can schedule meetings only for your assigned batch.");
      return;
    }
    if (attendee?.id && attendee.batch_id !== selectedBatch.id) {
      setToast("Selected attendee must belong to the selected batch.");
      return;
    }
    const newMeeting = {
      title: meetingForm.title,
      topic: meetingForm.topic,
      scheduled_at: meetingForm.scheduled_at ? new Date(meetingForm.scheduled_at).toISOString() : new Date().toISOString(),
      meeting_link: meetingForm.meeting_link,
      host_id: sessionUser?.id,
      batch_id: selectedBatch.id,
      domain: selectedBatch.domain || attendee?.domain || userProfile?.domain || "web_dev",
      attendance_token: meetingForm.attendance_token || createAttendanceToken(),
      attendee_id: meetingForm.attendee_id || null,
      status: "scheduled",
    };
    const saved = await createMeeting(newMeeting);
    setMeetings([saved || newMeeting, ...meetings]);
    setNewMeetingModal(false);
    setToast("Meeting scheduled.");
    setMeetingForm({ title: "", topic: "", scheduled_at: "", meeting_link: "https://meet.google.com/new", batch_id: "", attendee_id: "", attendance_token: "" });
  }

  async function handlePromoteInternToTl(member) {
    if (!isMentor || member.role !== "intern" || !ownedBatchIds.has(member.batch_id)) {
      setToast("Mentor can promote only an intern from assigned batch.");
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const selectedBatch = batches.find((batch) => batch.id === member.batch_id);
    const response = await fetch("/api/admin/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      },
      body: JSON.stringify({
        id: member.id,
        role: "team_leader",
        batch_id: member.batch_id,
        batch_name: member.batch_name || selectedBatch?.name || null,
        domain: member.domain,
        assigned_mentor_id: sessionUser.id,
        promote_to_tl_for_batch_id: member.batch_id,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setToast(result.error || "Failed to make TL.");
      return;
    }
    setToast(`${member.full_name} is now Team Leader.`);
    await loadDashboardData();
  }

  async function handleCreateCert(e) {
    e.preventDefault();
    const certDomain = certForm.domain || "General Training";
    const codePrefix = certDomain.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "GEN";
    const code = `TEX-2026-${codePrefix}-${Math.floor(100 + Math.random() * 900)}`;
    const cert = {
      certificate_code: code,
      intern_id: certForm.intern_id || null,
      intern_name: certForm.intern_name,
      domain: certDomain,
      start_date: certForm.start_date || "2026-06-01",
      end_date: certForm.end_date || "2026-09-01",
      performance_grade: certForm.performance_grade,
      issued_by: sessionUser?.id,
      verification_status: "verified",
    };
    const saved = await issueCertificate(cert);
    setCertificates([saved || cert, ...certificates]);
    setNewCertModal(false);
    setToast("Certificate issued.");
    setCertForm({ intern_name: "", intern_id: "", domain: "", start_date: "", end_date: "", performance_grade: "A+ Outstanding" });
  }

  async function handleSubmitWork(e) {
    e.preventDefault();
    if (!submissionModal) return;
    const task = tasks.find((item) => item.id === submissionModal);
    if (task && !canSubmitTask(task)) {
      setToast(task.deadline && new Date(task.deadline).getTime() < Date.now() ? "Deadline is over. Submission is locked." : "This task is already submitted and locked for review.");
      return;
    }
    let uploadData = {};
    if (submissionForm.file) {
      const uploaded = await uploadSubmissionFile(submissionForm.file, sessionUser?.id, submissionModal);
      if (!uploaded) {
        setToast("File upload failed.");
        return;
      }
      uploadData = uploaded;
    }
    const saved = await submitTaskWork({
      task_id: submissionModal,
      intern_id: sessionUser?.id,
      submission_url: submissionForm.submission_url,
      notes: submissionForm.notes,
      ...uploadData,
    });
    setSubmissions([saved || submissionForm, ...submissions]);
    setSubmissionModal(null);
    setSubmissionForm({ submission_url: "", notes: "", file: null });
    setToast("Work submitted.");
    await loadDashboardData();
  }

  async function handleRestoreCmsVersion(version) {
    const saved = await upsertCmsContent({
      key: version.cms_key,
      content_json: version.content_json,
      updated_by: sessionUser?.id,
      restore_version: version.version_no,
    });
    if (!saved) {
      setToast("Restore failed.");
      return;
    }
    setCmsContent((prev) => [saved, ...prev.filter((item) => item.key !== saved.key)]);
    setCmsVersions(await getCmsVersions());
    setToast("CMS version restored.");
  }

  async function handleRetryNotification(queueId) {
    const result = await retryNotificationQueueItem(queueId);
    if (!result) {
      setToast("Retry failed.");
      return;
    }
    setNotificationQueue(await getNotificationQueue());
    setToast("Notification retried.");
  }

  function handleDirectWhatsapp(phone, name, customMsg = "") {
    if (!phone) {
      setToast("Phone number not registered.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(customMsg || `Hi ${name}, this is ${userProfile?.full_name || "Mentor"}. I wanted to check in on your batch progress.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  }

  async function handleOpenSubmissionFile(filePath) {
    const url = await getSubmissionFileUrl(filePath);
    if (!url) {
      setToast("File link unavailable.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!chatText.trim() || !selectedContactId) return;
    const msg = {
      sender_id: sessionUser.id,
      receiver_id: selectedContactId,
      message: chatText.trim(),
    };
    const saved = await sendRealtimeMessage(msg);
    const newMsg = saved || { ...msg, id: Date.now(), created_at: new Date().toISOString() };
    setMessages([...(messages || []), newMsg]);
    rememberDirectChatActivity(newMsg);
    setChatText("");
  }

  async function handleSendBatchMessage(e) {
    e.preventDefault();
    if (!selectedBatch?.id || !batchMessageText.trim()) return;
    const result = await createBatchWorkspaceItem({
      type: "message",
      batch_id: selectedBatch.id,
      message: batchMessageText.trim(),
    });
    if (!result?.message) {
      setToast("Batch message could not be sent.");
      return;
    }
    setBatchWorkspaceData((prev) => ({ ...prev, messages: [...(prev.messages || []), result.message] }));
    rememberBatchChatActivity(result.message);
    setBatchMessageText("");
    setToast("Batch message sent.");
  }

  async function handleCreateBatchAnnouncement(e) {
    e.preventDefault();
    if (!selectedBatch?.id) return;

    let attachmentUrl = null;
    let attachmentName = null;
    let attachmentType = null;

    if (announcementAttachment.file) {
      setAnnouncementAttachment((prev) => ({ ...prev, uploading: true }));
      const uploaded = await uploadBatchFile(announcementAttachment.file, selectedBatch.id);
      if (uploaded?.file_url) {
        attachmentUrl = uploaded.file_url;
        attachmentName = uploaded.file_name;
        attachmentType = uploaded.file_type;
      }
      setAnnouncementAttachment((prev) => ({ ...prev, uploading: false }));
    }

    const result = await createBatchWorkspaceItem({
      type: "announcement",
      batch_id: selectedBatch.id,
      ...batchAnnouncementForm,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
    });
    if (!result?.announcement) {
      setToast(result?.error || "Announcement could not be published.");
      return;
    }
    setBatchWorkspaceData((prev) => ({ ...prev, announcements: [result.announcement, ...(prev.announcements || [])] }));
    setBatchAnnouncementForm({ title: "", body: "", category: "announcement", link_url: "", pinned: false });
    setAnnouncementAttachment({ file: null, previewUrl: "", fileName: "", fileType: "", uploading: false });
    setToast("Announcement published.");
  }

  async function handleCreateBatchResource(e) {
    e.preventDefault();
    const targetBatchId = selectedBatch?.id || selectedSidebarBatchId;
    if (!targetBatchId) return;

    let fileUrl = batchResourceForm.file_url || null;
    let fileName = null;

    if (batchResourceFile.file) {
      setBatchResourceFile((prev) => ({ ...prev, uploading: true }));
      const uploaded = await uploadBatchFile(batchResourceFile.file, targetBatchId);
      if (uploaded?.file_url) {
        fileUrl = uploaded.file_url;
        fileName = uploaded.file_name;
      }
      setBatchResourceFile((prev) => ({ ...prev, uploading: false }));
    }

    const result = await createBatchWorkspaceItem({
      type: "resource",
      batch_id: targetBatchId,
      ...batchResourceForm,
      file_url: fileUrl,
      file_name: fileName || batchResourceForm.title,
    });
    if (!result?.resource) {
      setToast(result?.error || "Resource could not be added.");
      return;
    }
    setBatchWorkspaceData((prev) => ({ ...prev, resources: [result.resource, ...(prev.resources || [])] }));
    setBatchResourceForm({ title: "", category: "technical_guides", description: "", link_url: "", file_url: "" });
    setBatchResourceFile({ file: null, fileName: "", fileType: "", uploading: false });
    setToast("Resource added.");
  }

  function handleDeleteBatchAnnouncement(item) {
    if (!item?.id || !selectedBatch?.id) return;
    setConfirmModal({
      title: "Delete Announcement",
      itemName: item.title,
      message: "This announcement and its attached resources will be permanently removed for all members in this batch.",
      confirmText: "Delete Announcement",
      danger: true,
      onConfirm: async () => {
        const result = await createBatchWorkspaceItem({
          type: "delete_announcement",
          id: item.id,
          batch_id: selectedBatch.id,
        });
        if (result?.success) {
          setBatchWorkspaceData((prev) => ({
            ...prev,
            announcements: (prev.announcements || []).filter((a) => a.id !== item.id),
          }));
          setToast("Announcement deleted.");
        } else {
          setToast(result?.error || "Failed to delete announcement.");
        }
      },
    });
  }

  async function handleUpdateBatchAnnouncement(e) {
    e.preventDefault();
    if (!editingAnnouncement?.id || !selectedBatch?.id) return;

    let attachmentUrl = editingAnnouncement.attachment_url || null;
    let attachmentName = editingAnnouncement.attachment_name || null;
    let attachmentType = editingAnnouncement.attachment_type || null;

    if (editingAnnouncement.file) {
      setEditingAnnouncement((prev) => ({ ...prev, uploading: true }));
      const uploaded = await uploadBatchFile(editingAnnouncement.file, selectedBatch.id);
      if (uploaded?.file_url) {
        attachmentUrl = uploaded.file_url;
        attachmentName = uploaded.file_name;
        attachmentType = uploaded.file_type;
      }
      setEditingAnnouncement((prev) => ({ ...prev, uploading: false }));
    }

    const result = await createBatchWorkspaceItem({
      type: "update_announcement",
      id: editingAnnouncement.id,
      batch_id: selectedBatch.id,
      title: editingAnnouncement.title,
      body: editingAnnouncement.body,
      category: editingAnnouncement.category,
      link_url: editingAnnouncement.link_url,
      pinned: editingAnnouncement.pinned,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
    });

    if (result?.announcement) {
      setBatchWorkspaceData((prev) => ({
        ...prev,
        announcements: (prev.announcements || []).map((a) => (a.id === result.announcement.id ? result.announcement : a)),
      }));
      setEditingAnnouncement(null);
      setToast("Announcement updated.");
    } else {
      setToast(result?.error || "Failed to update announcement.");
    }
  }

  function handleDeleteBatchResource(item) {
    const targetBatchId = selectedBatch?.id || selectedSidebarBatchId;
    if (!item?.id || !targetBatchId) return;
    setConfirmModal({
      title: "Delete File / Resource",
      itemName: item.title,
      message: "This file will be permanently removed from the batch workspace and will no longer be accessible to members.",
      confirmText: "Delete File",
      danger: true,
      onConfirm: async () => {
        const result = await createBatchWorkspaceItem({
          type: "delete_resource",
          id: item.id,
          batch_id: targetBatchId,
        });
        if (result?.success) {
          setBatchWorkspaceData((prev) => ({
            ...prev,
            resources: (prev.resources || []).filter((r) => r.id !== item.id),
          }));
          setToast("File deleted.");
        } else {
          setToast(result?.error || "Failed to delete file.");
        }
      },
    });
  }

  async function handleUpdateBatchResource(e) {
    e.preventDefault();
    const targetBatchId = selectedBatch?.id || selectedSidebarBatchId;
    if (!editingResource?.id || !targetBatchId) return;

    let fileUrl = editingResource.file_url || null;
    let fileName = editingResource.file_name || null;

    if (editingResource.file) {
      setEditingResource((prev) => ({ ...prev, uploading: true }));
      const uploaded = await uploadBatchFile(editingResource.file, targetBatchId);
      if (uploaded?.file_url) {
        fileUrl = uploaded.file_url;
        fileName = uploaded.file_name;
      }
      setEditingResource((prev) => ({ ...prev, uploading: false }));
    }

    const result = await createBatchWorkspaceItem({
      type: "update_resource",
      id: editingResource.id,
      batch_id: targetBatchId,
      title: editingResource.title,
      category: editingResource.category,
      description: editingResource.description,
      link_url: editingResource.link_url,
      file_url: fileUrl,
      file_name: fileName || editingResource.title,
    });

    if (result?.resource) {
      setBatchWorkspaceData((prev) => ({
        ...prev,
        resources: (prev.resources || []).map((r) => (r.id === result.resource.id ? result.resource : r)),
      }));
      setEditingResource(null);
      setToast("File updated.");
    } else {
      setToast(result?.error || "Failed to update file.");
    }
  }

  function openRaiseEscalationModal(batchId = selectedBatch?.id || escalationBatchOptions[0]?.id || "") {
    if (currentRole === "intern") {
      setToast("Intern escalation is handled through TL or Mentor.");
      return;
    }
    const batch = escalationBatchOptions.find((item) => item.id === batchId) || escalationBatchOptions[0] || null;
    setBatchEscalationForm({
      batch_id: batch?.id || "",
      assigned_to: "",
      issue: "",
      category: "general",
      priority: "medium",
      description: "",
      related_member_id: "",
      related_task_id: "",
    });
    setBatchEscalationModalOpen(true);
  }

  async function handleCreateBatchEscalation(e) {
    e.preventDefault();
    const targetBatchId = batchEscalationForm.batch_id || selectedBatch?.id;
    if (!targetBatchId) {
      setToast("Please select a batch for this escalation.");
      return;
    }
    const result = await createBatchWorkspaceItem({
      type: "escalation",
      ...batchEscalationForm,
      batch_id: targetBatchId,
      assigned_to: batchEscalationForm.assigned_to || null,
    });
    if (!result?.escalation) {
      setToast("Escalation could not be created.");
      return;
    }
    setBatchWorkspaceData((prev) => ({ ...prev, escalations: [result.escalation, ...(prev.escalations || [])] }));
    setAccessibleEscalations((prev) => [result.escalation, ...prev.filter((item) => item.id !== result.escalation.id)]);
    setBatchEscalationForm({ batch_id: "", assigned_to: "", issue: "", category: "general", priority: "medium", description: "", related_member_id: "", related_task_id: "" });
    setBatchEscalationModalOpen(false);
    setToast("Escalation opened.");
  }

  async function handleUpdateBatchEscalationStatus(escalation, status) {
    if (status === "resolved" && !escalationResolutionText.trim()) {
      setToast("Resolution comment is required.");
      return;
    }
    const saved = await updateBatchEscalation({ id: escalation.id, status, resolution: escalationResolutionText });
    if (!saved) {
      setToast("Escalation update failed.");
      return;
    }
    setBatchWorkspaceData((prev) => ({
      ...prev,
      escalations: (prev.escalations || []).map((item) => (item.id === saved.id ? { ...item, ...saved } : item)),
    }));
    setAccessibleEscalations((prev) => prev.map((item) => (item.id === saved.id ? { ...item, ...saved } : item)));
    setEscalationResolutionModal(null);
    setEscalationResolutionText("");
    setToast("Escalation updated.");
  }

  async function handleTransferBatchMember(e) {
    e.preventDefault();
    if (!selectedBatch?.id) return;
    const result = await createBatchWorkspaceItem({
      type: "transfer_member",
      batch_id: selectedBatch.id,
      ...batchTransferForm,
    });
    if (!result?.profile) {
      setToast("Member transfer failed.");
      return;
    }
    setBatchTransferForm({ member_id: "", to_batch_id: "", note: "" });
    await loadDashboardData();
    await refreshBatchWorkspace(selectedBatch.id);
    setToast("Member transferred with history preserved.");
  }

  async function handleReadNotification(item) {
    if (!item?.id) return;
    if (!item.is_read) {
      // Optimistic update immediately
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
      await markNotificationRead(item.id);
      setToast("Notification marked as read.");
    }
    if (item.link_url) {
      const safePath = safeInternalPath(item.link_url, "/login");
      const url = new URL(safePath, window.location.origin);
      const section = url.searchParams.get("section");
      setActiveSection(section || "overview");
    }
  }

  async function handleMarkAllAsRead() {
    if (!sessionUser?.id) return;
    const unreadExist = notifications.some((n) => !n.is_read);
    if (!unreadExist) {
      setToast("All notifications are already marked as read.");
      return;
    }
    // Optimistic update immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsRead(sessionUser.id);
    setToast("All notifications marked as read.");
  }

  async function handleDeleteNotification(item) {
    if (!item?.id) return;
    // Optimistic update immediately
    setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    await deleteNotification(item.id);
    setToast("Notification deleted.");
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-150 ${isDark
        ? "bg-[#070707] text-stone-100"
        : "bg-white text-gray-800"
        }`}
    >
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-[90] bg-gray-900 text-white rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xl border border-white/10 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>{toast}</span>
        </div>
      )}

      {sessionUser ? (
        <div className="min-h-screen relative flex flex-col">
          <div className={`${(activeSection === "chat" && chatMobilePane === "chat") ? "!hidden" : "flex"} fixed top-0 left-0 right-0 z-40 md:hidden h-16 px-3.5 items-center justify-between border-b transition-colors duration-200 ${
            isDark
              ? "bg-[#0b0b0c]/95 backdrop-blur-md border-neutral-800 text-neutral-100 shadow-none"
              : "bg-white/95 backdrop-blur-md border-gray-200/90 text-gray-900 shadow-xs"
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <Link href="/" className="admin-sidebar-logo flex items-center group min-w-0">
                <Image
                  width={140}
                  height={38}
                  alt="TexWeb Solution Logo"
                  src="/texweb-full-logo-original.png"
                  className="h-8 w-auto max-w-[140px] sm:max-w-[155px] object-contain shrink-0 group-hover:scale-105 transition-transform"
                  style={{ width: "auto" }}
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                  isDark
                    ? "text-amber-400 hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
              {canUseAlerts && (
                <button
                  type="button"
                  onClick={() => selectSection("alerts")}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                    isDark
                      ? "text-neutral-300 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="w-4.5 h-4.5 stroke-[1.8]" />
                  {unreadCount > 0 && (
                    <span className={`absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ${
                      isDark ? "ring-[#0b0b0c]" : "ring-white"
                    }`}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => selectSection("settings")}
                className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center overflow-hidden cursor-pointer ring-2 ring-red-500/25 hover:ring-red-500 transition ${
                  isDark ? "bg-neutral-800 text-white" : "bg-gray-100 text-gray-800"
                }`}
                aria-label="Profile"
                title={userProfile?.full_name || "Profile"}
              >
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt={userProfile.full_name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  (userProfile?.full_name || sessionUser?.email || "T")[0]?.toUpperCase()
                )}
              </button>
            </div>
          </div>

          {mobileMoreOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
              {/* Backdrop */}
              <button
                type="button"
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer animate-fadeIn"
                onClick={() => setMobileMoreOpen(false)}
                aria-label="Close more menu"
              />

              {/* Bottom Sheet Slider */}
              <div
                className={`relative w-full max-h-[82dvh] rounded-t-[28px] border-t shadow-2xl flex flex-col z-10 overflow-hidden ${
                  isDark
                    ? "bg-[#111113] border-neutral-800 text-neutral-100"
                    : "bg-white border-gray-200 text-gray-900 shadow-black/20"
                }`}
                style={{
                  animation: "slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
                }}
              >
                {/* Drag / Pull handle bar */}
                <div
                  className="pt-3 pb-1.5 flex justify-center shrink-0 cursor-pointer"
                  onClick={() => setMobileMoreOpen(false)}
                >
                  <div className="w-11 h-1.5 rounded-full bg-gray-300 dark:bg-neutral-700" />
                </div>

                {/* Section Header */}
                <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800/80 shrink-0">
                  <span className="text-[11px] font-extrabold tracking-widest uppercase text-gray-400 dark:text-neutral-500 font-sans">
                    MORE
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMoreOpen(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Single-column vertical list with Icon, Label, Badge and Chevron */}
                <div className="overflow-y-auto flex-1 overscroll-contain py-1 divide-y divide-gray-100/60 dark:divide-neutral-800/40">
                  {mobileMoreNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.section && activeSection === item.section;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleMobileNavItem(item)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors cursor-pointer text-left ${
                          isActive
                            ? "bg-red-50/70 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold"
                            : "text-gray-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-900/60 active:bg-gray-100 dark:active:bg-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Icon
                            className={`w-5 h-5 shrink-0 stroke-[1.8] ${
                              isActive
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-500 dark:text-neutral-400"
                            }`}
                          />
                          <span className="text-sm font-semibold truncate">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.badge > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isActive
                                ? "text-red-500 dark:text-red-400"
                                : "text-gray-400 dark:text-neutral-500"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <nav className={`${(activeSection === "chat" && chatMobilePane === "chat") ? "!hidden" : "block"} fixed left-0 right-0 bottom-0 z-40 md:hidden border-t px-1.5 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] transition-colors duration-200 ${
            isDark
              ? "bg-[#0b0b0c]/95 backdrop-blur-md border-neutral-800 text-neutral-400"
              : "bg-white/95 backdrop-blur-md border-gray-200/90 text-gray-600 shadow-lg shadow-black/5"
          }`}>
            <div className="grid grid-cols-5 items-center">
              {mobilePrimaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.section && activeSection === item.section;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleMobileNavItem(item)}
                    className="relative min-w-0 h-13 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer group"
                    aria-label={item.label}
                    title={item.label}
                  >
                    <div className={`relative px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                      isActive
                        ? isDark
                          ? "bg-red-500/15 text-red-400 scale-105"
                          : "bg-red-50 text-red-600 scale-105 shadow-2xs"
                        : isDark
                          ? "text-neutral-400 group-hover:text-white"
                          : "text-gray-500 group-hover:text-gray-900"
                    }`}>
                      <Icon className={`w-5 h-5 transition-transform ${isActive ? "stroke-[2.2]" : "stroke-[1.75]"}`} />
                      {item.badge > 0 && (
                        <span className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ${
                          isDark ? "ring-[#0b0b0c]" : "ring-white"
                        }`}>
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`w-full px-0.5 text-[10px] truncate text-center transition-colors ${
                      isActive
                        ? isDark
                          ? "font-extrabold text-red-400"
                          : "font-extrabold text-red-600"
                        : isDark
                          ? "font-medium text-neutral-400 group-hover:text-white"
                          : "font-medium text-gray-500 group-hover:text-gray-900"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setMobileMoreOpen((open) => !open)}
                className="relative min-w-0 h-13 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer group"
                aria-label="More"
                title="More"
              >
                <div className={`relative px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  mobileMoreOpen || mobileMoreNavItems.some((item) => item.section && item.section === activeSection)
                    ? isDark
                      ? "bg-red-500/15 text-red-400 scale-105"
                      : "bg-red-50 text-red-600 scale-105 shadow-2xs"
                    : isDark
                      ? "text-neutral-400 group-hover:text-white"
                      : "text-gray-500 group-hover:text-gray-900"
                }`}>
                  <MoreHorizontal className="w-5 h-5 stroke-[2]" />
                </div>
                <span className={`w-full px-0.5 text-[10px] truncate text-center transition-colors ${
                  mobileMoreOpen || mobileMoreNavItems.some((item) => item.section && item.section === activeSection)
                    ? isDark
                      ? "font-extrabold text-red-400"
                      : "font-extrabold text-red-600"
                    : isDark
                      ? "font-medium text-neutral-400 group-hover:text-white"
                      : "font-medium text-gray-500 group-hover:text-gray-900"
                }`}>
                  More
                </span>
              </button>
            </div>
          </nav>

          {/* Floating Menu Toggle button when sidebar is closed (works on all devices) */}
          {!sidebarOpen && (
            <div className="hidden fixed top-3.5 left-3.5 z-40 animate-fadeIn md:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2 group"
                title="Open Sidebar"
              >
                <PanelLeftOpen className="w-5 h-5 text-red-600 stroke-[1.75]" />
                <Image
                  width={110}
                  height={30}
                  alt="TexWeb Solution Logo"
                  src="/texweb-full-logo-original.png"
                  className="h-5 w-auto object-contain shrink-0"
                  style={{ width: "auto" }}
                />
              </button>
            </div>
          )}

          {/* Backdrop for Mobile Sidebar */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden"
            />
          )}

          {/* =========================================================================
              CLEAN MODERN SIDEBAR (Real Database Items Only - Simple English)
              ========================================================================= */}
          <aside
            className={`admin-sidebar fixed top-0 bottom-0 left-0 h-screen max-h-screen border-r z-40 transition-all duration-300 hidden md:flex flex-col justify-between overflow-hidden select-none ${sidebarOpen ? "w-64 sm:w-68 translate-x-0" : "w-64 -translate-x-full md:w-[72px] md:translate-x-0 admin-sidebar-collapsed"
              } ${isDark ? "bg-[#0b0b0c] border-neutral-800 text-neutral-200" : "bg-white border-gray-200 text-gray-800"
              }`}
          >
            {/* 1. Sidebar Header: TexWeb Solution Logo + Title + Notification Bell + Collapse Toggle */}
            <div className="admin-sidebar-header h-16 px-4 sm:px-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 shrink-0">
              {/* Left: TexWeb Solution Logo Banner */}
              <Link href="/" className="admin-sidebar-logo flex items-center group min-w-0">
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
                  width={48}
                  height={48}
                  alt="TexWeb Solution Logo"
                  src="/logo.png"
                  className="admin-sidebar-logo-mark hidden h-12 w-12 object-contain shrink-0 transition-transform"
                  priority
                />
              </Link>

              {/* Right: Notification Bell & Panel Collapse Button */}
              <div className="admin-sidebar-actions flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                {canUseAlerts && (
                  <button
                    onClick={() => {
                      selectSection("alerts");
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5 stroke-[1.75]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => setSidebarOpen((open) => !open)}
                  className="admin-sidebar-toggle p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                  title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="w-5 h-5 stroke-[1.75]" />
                  ) : (
                    <PanelLeftOpen className="w-5 h-5 stroke-[1.75]" />
                  )}
                </button>
              </div>
            </div>

            {/* 2. Scrollable Navigation Menu (Categorized Hierarchy) */}
            <div className="admin-sidebar-nav flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-2.5 space-y-0.5 text-sm no-scrollbar">

              {/* Category 1: Main */}
              <button
                onClick={() => selectSection("overview")}
                aria-label="Dashboard"
                title="Dashboard"
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "overview"
                  ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                  }`}
              >
                <Home className="w-5 h-5 shrink-0 stroke-[1.75]" />
                <span className="admin-sidebar-item-label">Dashboard</span>
              </button>

              {/* Category 2: Supervision & Review */}
              {(isMentor || isTeamLeader || isHrRole || isAdminRole) && (
                <>
                  <div className="admin-sidebar-divider border-t border-gray-100 dark:border-slate-800/80 my-2 mx-1" />
                  <div className="admin-sidebar-group-header px-3 pt-2 pb-1">
                    <span className="admin-sidebar-group-title text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                      Supervision
                    </span>
                  </div>

                  {/* Task Submissions */}
                  {(isMentor || isTeamLeader) && (
                    <button
                      onClick={() => selectSection("task_submissions")}
                      aria-label="Task Submissions"
                      title="Task Submissions"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "task_submissions"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Send className="w-5 h-5 shrink-0 stroke-[1.75] text-indigo-500" />
                        <span className="admin-sidebar-item-label">Task Submissions</span>
                      </div>
                      {pendingSubmissionsCount > 0 && (
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-900/60 animate-pulse">
                          {pendingSubmissionsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Review Center */}
                  {(isMentor || isHrRole || isAdminRole) && (
                    <button
                      onClick={() => selectSection("review_center")}
                      aria-label="Review Center"
                      title="Review Center"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "review_center"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <AlertCircle className="w-5 h-5 shrink-0 stroke-[1.75] text-amber-500" />
                        <span className="admin-sidebar-item-label">Review Center</span>
                      </div>
                      {mentorReviewCenterData.total > 0 && (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/60 animate-pulse">
                          {mentorReviewCenterData.total}
                        </span>
                      )}
                    </button>
                  )}

                  {/* At-Risk Watchlist */}
                  {(isMentor || isHrRole || isAdminRole) && (
                    <button
                      onClick={() => selectSection("at_risk_watchlist")}
                      aria-label="At-Risk Watchlist"
                      title="At-Risk Watchlist"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "at_risk_watchlist"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <AlertTriangle className="w-5 h-5 shrink-0 stroke-[1.75] text-red-500" />
                        <span className="admin-sidebar-item-label">At-Risk Watchlist</span>
                      </div>
                      {mentorAtRiskMembers.length > 0 && (
                        <span className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-900/60">
                          {mentorAtRiskMembers.length}
                        </span>
                      )}
                    </button>
                  )}
                </>
              )}

              {/* Category 3: Batch Operations */}
              {(canViewBatches || canSeeOperations || canIssueCertificates) && (
                <>
                  <div className="admin-sidebar-divider border-t border-gray-100 dark:border-slate-800/80 my-2 mx-1" />
                  <div className="admin-sidebar-group-header px-3 pt-2 pb-1">
                    <span className="admin-sidebar-group-title text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                      Operations
                    </span>
                  </div>

                  {/* Batches */}
                  {canViewBatches && (
                    <button
                      onClick={() => selectSection("batches")}
                      aria-label="Batches"
                      title="Batches"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "batches"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Folder className="w-5 h-5 shrink-0 stroke-[1.75]" />
                        <span className="admin-sidebar-item-label">Batches</span>
                      </div>
                      {batches.length > 0 && (
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {batches.length}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Batch Files (Accessible to Admin, HR, Mentor, TL, and Intern) */}
                  <button
                    onClick={() => selectSection("batch_files")}
                    aria-label="Batch Files"
                    title="Batch Files"
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "batch_files"
                      ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                      }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Folder className="w-5 h-5 shrink-0 stroke-[1.75] text-amber-500" />
                      <span className="admin-sidebar-item-label">Batch Files</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/60">
                      Docs
                    </span>
                  </button>

                  {/* Tasks */}
                  {canSeeOperations && !isHrRole && (
                    <button
                      onClick={() => selectSection("tasks")}
                      aria-label="Tasks"
                      title="Tasks"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "tasks"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <CheckSquare className="w-5 h-5 shrink-0 stroke-[1.75]" />
                        <span className="admin-sidebar-item-label">Tasks</span>
                      </div>
                      {tasks.length > 0 && (
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {tasks.length}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Daily Updates (Strictly Mentor and TL only) */}
                  {(isMentor || isTeamLeader) && (
                    <button
                      onClick={() => selectSection("daily_updates")}
                      aria-label="Daily Updates"
                      title="Daily Updates"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "daily_updates"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Activity className="w-5 h-5 shrink-0 stroke-[1.75]" />
                        <span className="admin-sidebar-item-label">Daily Updates</span>
                      </div>
                      {dailyUpdates.length > 0 && (
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {dailyUpdates.length}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Classes */}
                  {canSeeOperations && (
                    <button
                      onClick={() => selectSection("classes")}
                      aria-label="Classes"
                      title="Classes"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "classes"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Calendar className="w-5 h-5 shrink-0 stroke-[1.75]" />
                        <span className="admin-sidebar-item-label">Classes</span>
                      </div>
                      {meetings.length > 0 && (
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {meetings.length}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Attendance */}
                  {canSeeOperations && (
                    <button
                      onClick={() => selectSection("attendance")}
                      aria-label="Attendance"
                      title="Attendance"
                      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "attendance"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <Clock className="w-5 h-5 shrink-0 stroke-[1.75]" />
                      <span className="admin-sidebar-item-label">Attendance</span>
                    </button>
                  )}

                  {/* Certificates */}
                  {canIssueCertificates && (
                    <button
                      onClick={() => selectSection("certificates")}
                      aria-label="Certificates"
                      title="Certificates"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "certificates"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Award className="w-5 h-5 shrink-0 stroke-[1.75]" />
                        <span className="admin-sidebar-item-label">Certificates</span>
                      </div>
                      {certificates.length > 0 && (
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {certificates.length}
                        </span>
                      )}
                    </button>
                  )}
                </>
              )}

              {/* Category 4: Directory & Team */}
              {(canViewAllTeam || isHrRole) && (
                <>
                  <div className="admin-sidebar-divider border-t border-gray-100 dark:border-slate-800/80 my-2 mx-1" />
                  <div className="admin-sidebar-group-header px-3 pt-2 pb-1">
                    <span className="admin-sidebar-group-title text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                      Directory
                    </span>
                  </div>

                  {canViewAllTeam && (
                    <button
                      onClick={() => selectSection("members")}
                      aria-label={isAdminRole ? "HR Managers" : "Team"}
                      title={isAdminRole ? "HR Managers" : "Team"}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "members"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Users className="w-5 h-5 shrink-0 stroke-[1.75]" />
                        <span className="admin-sidebar-item-label">{isAdminRole ? "HR Managers" : "Team"}</span>
                      </div>
                      {combinedMembers.length > 0 && (
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {combinedMembers.length}
                        </span>
                      )}
                    </button>
                  )}

                  {isHrRole && (
                    <>
                      <button
                        onClick={() => selectSection("hr_mentors")}
                        aria-label="Mentors"
                        title="Mentors"
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "hr_mentors"
                          ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                          : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                          }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <UserCheck className="w-5 h-5 shrink-0 stroke-[1.75]" />
                          <span className="admin-sidebar-item-label">Mentors</span>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {combinedMembers.filter((member) => member.role === "mentor").length}
                        </span>
                      </button>

                      <button
                        onClick={() => selectSection("hr_interns")}
                        aria-label="Interns"
                        title="Interns"
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "hr_interns"
                          ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                          : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                          }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Users className="w-5 h-5 shrink-0 stroke-[1.75]" />
                          <span className="admin-sidebar-item-label">Interns</span>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {combinedMembers.filter((member) => member.role === "intern").length}
                        </span>
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Category 5: Communication */}
              {(canUseMessages || canUseAlerts) && (
                <>
                  <div className="admin-sidebar-divider border-t border-gray-100 dark:border-slate-800/80 my-2 mx-1" />
                  <div className="admin-sidebar-group-header px-3 pt-2 pb-1">
                    <span className="admin-sidebar-group-title text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                      Communication
                    </span>
                  </div>

                  {canUseMessages && (
                    <button
                      onClick={() => {
                        setChatMobilePane("channels");
                        selectSection("chat");
                      }}
                      aria-label="Chat"
                      title="Chat"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "chat"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <MessageSquare className="w-5 h-5 shrink-0 stroke-[1.75]" />
                        <span className="admin-sidebar-item-label">Chat</span>
                      </div>
                    </button>
                  )}

                  {canUseAlerts && (
                    <button
                      onClick={() => selectSection("alerts")}
                      aria-label="Notifications"
                      title="Notifications"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "alerts"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Bell className="w-5 h-5 shrink-0 stroke-[1.75]" />
                        <span className="admin-sidebar-item-label">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )}
                </>
              )}

              {/* Category 6: Governance & System */}
              <div className="admin-sidebar-divider border-t border-gray-100 dark:border-slate-800/80 my-2 mx-1" />
              <div className="admin-sidebar-group-header px-3 pt-2 pb-1">
                <span className="admin-sidebar-group-title text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                  System
                </span>
              </div>

              {/* Sales CRM */}
              {canUseCrm && (
                <Link
                  href="/crm"
                  aria-label="Sales CRM"
                  title="Sales CRM"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-center gap-3.5">
                    <Target className="w-5 h-5 shrink-0 stroke-[1.75]" />
                    <span className="admin-sidebar-item-label">Sales CRM</span>
                  </div>
                  {leads.length > 0 && (
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                      {leads.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Audit Logs */}
              {isAdminRole && (
                <button
                  onClick={() => selectSection("audit")}
                  aria-label="Audit Logs"
                  title="Audit Logs"
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "audit"
                    ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                    }`}
                >
                  <ShieldCheck className="w-5 h-5 shrink-0 stroke-[1.75]" />
                  <span className="admin-sidebar-item-label">Audit Logs</span>
                </button>
              )}

              {/* Website CMS */}
              {canUseCms && (
                <button
                  onClick={() => selectSection("cms")}
                  aria-label="Website CMS"
                  title="Website CMS"
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "cms"
                    ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                    }`}
                >
                  <FileText className="w-5 h-5 shrink-0 stroke-[1.75]" />
                  <span className="admin-sidebar-item-label">Website CMS</span>
                </button>
              )}

              {/* Profile & Settings Nav Link */}
              <button
                onClick={() => selectSection("settings")}
                aria-label="Profile & Settings"
                title="Profile & Settings"
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeSection === "settings"
                  ? "text-gray-900 dark:text-white font-semibold bg-gray-100/90 dark:bg-slate-800 shadow-2xs"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60"
                  }`}
              >
                <Settings className="w-5 h-5 shrink-0 stroke-[1.75]" />
                <span className="admin-sidebar-item-label">Profile & Settings</span>
              </button>

              {!isMentor && (
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
              )}

            </div>

            {/* 3. Bottom Workspace Card: [ T / Avatar ] TexWeb Solution + Role Badge + Settings Gear */}
            <div className="admin-sidebar-footer p-3 border-t border-gray-100 dark:border-slate-800/80 relative shrink-0 mt-auto space-y-2">
              <div className="p-2.5 rounded-2xl bg-[#FFF9F3] dark:bg-slate-800/90 border border-[#FEE7D6] dark:border-slate-700/60 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Avatar Photo / Initial */}
                  <div
                    onClick={() => selectSection("settings")}
                    className="w-9 h-9 rounded-xl bg-[#18181B] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs overflow-hidden cursor-pointer hover:opacity-90 transition"
                    title="Profile & Settings"
                  >
                    {userProfile?.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={userProfile.avatar_url} alt={userProfile.full_name || "Profile"} className="w-full h-full object-cover" />
                    ) : (
                      (userProfile?.full_name || sessionUser?.email || "U")[0]?.toUpperCase()
                    )}
                  </div>

                  {/* Real User Full Name & Role Badge */}
                  <div
                    onClick={() => selectSection("settings")}
                    className="min-w-0 cursor-pointer flex-1"
                    title={userProfile?.full_name || sessionUser?.email}
                  >
                    <div className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[130px]">
                      {userProfile?.full_name || sessionUser?.user_metadata?.full_name || sessionUser?.email?.split("@")[0] || "Workspace User"}
                    </div>
                    <div className="mt-0.5">
                      <span className="inline-block px-2 py-0.2 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[10px] font-semibold text-gray-700 dark:text-gray-300 shadow-2xs">
                        {ROLE_LABELS[currentRole] || "Member"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                className="admin-sidebar-theme-toggle w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
                title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {isDark ? <Sun className="w-5 h-5 text-amber-400 shrink-0" /> : <Moon className="w-5 h-5 text-gray-700 shrink-0" />}
                  <span className="admin-sidebar-theme-label text-xs font-bold truncate">
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </span>
                </span>
                <span className="admin-sidebar-theme-state text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                  {isDark ? "ON" : "OFF"}
                </span>
              </button>

              {/* Settings Dropdown Popover */}
              {settingsMenuOpen && (
                <div className="absolute bottom-20 left-3 right-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50 space-y-2 animate-scaleUp text-xs font-medium">
                  <div className="pb-2.5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      {userProfile?.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={userProfile.avatar_url} alt={userProfile.full_name || "Profile"} className="w-full h-full object-cover" />
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

                  {/* Profile & Settings Button in Popover */}
                  <button
                    onClick={() => {
                      selectSection("settings");
                      setSettingsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-red-600" />
                    <span>Profile & Settings</span>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
                      <span>Theme ({isDark ? "Dark" : "Light"})</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Toggle</span>
                  </button>

                  {/* Sign Out */}
                  <button
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

          {/* Main Content Area: Transitions cleanly when sidebar collapses/expands */}
          <main className={`flex-1 min-w-0 max-w-full transition-all duration-300 ${sidebarOpen ? "md:ml-64 sm:md:ml-68" : "ml-0 md:ml-[72px]"
            } ${activeSection === "chat"
              ? (chatMobilePane === "chat"
                ? "h-[100dvh] max-h-[100dvh] overflow-hidden pt-0 md:pt-3 px-0 sm:px-3 lg:px-4 pb-0 md:pb-2 flex flex-col"
                : "min-h-screen xl:min-h-0 xl:h-[100dvh] xl:max-h-[100dvh] xl:overflow-hidden pt-[4.5rem] md:pt-3 sm:pt-[4.5rem] px-2 sm:px-3 lg:px-4 pb-28 md:pb-4 flex flex-col")
              : "min-h-screen pt-[4.5rem] md:pt-3 sm:pt-[4.5rem] px-2 sm:px-3 lg:px-4 pb-28 md:pb-12"}`}>
            <div
              className={`transition-colors min-w-0 max-w-full ${activeSection === "chat"
                ? (chatMobilePane === "chat"
                  ? "flex-1 min-h-0 flex flex-col space-y-0 sm:space-y-2 p-0 sm:p-2"
                  : "flex-1 min-h-0 flex flex-col p-2 sm:p-3 lg:p-4 space-y-4")
                : "p-2 sm:p-3 lg:p-4 space-y-2 md:space-y-4"} ${isDark ? "bg-transparent text-slate-100" : "bg-transparent text-gray-900"}`}
            >
              {/* 1. Header Banner of the Card with Title + Contextual Actions (Shown for Chat channels view and all standard sections) */}
              {!(activeSection === "chat" && chatMobilePane === "chat") && (
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pb-1 md:pb-3 md:border-b md:border-gray-100 md:dark:border-slate-800 shrink-0 ${activeSection === "chat" ? "md:hidden" : ""}`}>
                  <div>
                    {/* Role & Department Badges */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                        {ROLE_LABELS[currentRole] || currentRole}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                        {profileDepartmentLabel(userProfile)}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-[Matter]">
                      {activeSection === "overview" && "Dashboard"}
                      {activeSection === "task_submissions" && "Task Submissions"}
                      {activeSection === "review_center" && "Supervisor Review Center"}
                      {activeSection === "at_risk_watchlist" && "At-Risk Intern Watchlist"}
                      {activeSection === "crm" && "Website Leads"}
                      {activeSection === "tasks" && "Tasks"}
                      {activeSection === "daily_updates" && "Daily Updates"}
                      {activeSection === "classes" && "Classes & Meetings"}
                      {activeSection === "members" && (isAdminRole ? "HR Managers" : "Team Members")}
                      {activeSection === "hr_mentors" && "Mentors"}
                      {activeSection === "hr_interns" && "Interns"}
                      {activeSection === "batches" && "Batches"}
                      {activeSection === "batch_files" && "Batch Files & Knowledge Base"}
                      {activeSection === "batch_workspace" && (selectedBatch?.name || "Batch Workspace")}
                      {activeSection === "attendance" && "Attendance"}
                      {activeSection === "chat" && "Chat"}
                      {activeSection === "alerts" && "Notifications"}
                      {activeSection === "cms" && "Website Content"}
                      {activeSection === "certificates" && "Certificates"}
                      {activeSection === "audit" && "Activity Logs"}
                      {activeSection === "settings" && "Profile & Settings"}
                    </h1>

                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {activeSection === "overview" && (isAdminRole ? "Overview of HR managers, training batches, and recent activity." : "Overview of team members, tasks, and updates.")}
                      {activeSection === "task_submissions" && "Dedicated console to inspect submitted links, project deliverables, and grade intern task submissions."}
                      {activeSection === "review_center" && "Review and resolve batch escalations, critical roadblocks, and urgent issues escalated by batch managers."}
                      {activeSection === "at_risk_watchlist" && "Centralized monitoring of interns with low attendance (<70%) or blocked tasks requiring mentor intervention."}
                      {activeSection === "crm" && "View customer inquiries from the website."}
                      {activeSection === "tasks" && "View and manage assigned tasks."}
                      {activeSection === "daily_updates" && "Track task-wise daily progress, blockers, and TL/Mentor comments."}
                      {activeSection === "classes" && "Join scheduled live sessions and Google Meet classes."}
                      {activeSection === "members" && (isAdminRole ? "Add and manage HR accounts." : "Manage mentors, team leaders, and interns.")}
                      {activeSection === "hr_mentors" && "Add and manage mentors batch by batch."}
                      {activeSection === "hr_interns" && "Add and manage interns inside admin-assigned batches."}
                      {activeSection === "batches" && (isAdminRole ? "Create batches and assign HR managers." : "View batches assigned to you.")}
                      {activeSection === "batch_files" && "Technical guides, guidelines, task files, and batch knowledge base documents connected batch by batch."}
                      {activeSection === "batch_workspace" && "Batch operating workspace for people, responsibility, tasks, meetings, reports, communication, and activity."}
                      {activeSection === "attendance" && "Daily attendance records."}
                      {activeSection === "chat" && "Direct and batch messaging with team members."}
                      {activeSection === "alerts" && "Recent notifications and updates."}
                      {activeSection === "cms" && "Edit website text and banners."}
                      {activeSection === "certificates" && "Verified certificates issued to candidates."}
                      {activeSection === "audit" && "Recent activity and history logs."}
                      {activeSection === "settings" && "Manage your personal profile details, photo, and account security."}
                    </p>
                  </div>

                  {/* Header Action Buttons (Context-Aware) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setGlobalSearchOpen(true)}
                      className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100/80 hover:bg-gray-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 shadow-2xs transition cursor-pointer"
                      title="Global Search (Ctrl + K)"
                    >
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <span className="hidden md:inline">Search...</span>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-gray-400">
                        Ctrl K
                      </kbd>
                    </button>
                    {activeSection === "overview" && isAdminRole && (
                      <>
                        <button
                          onClick={openEnrollMemberModal}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add HR</span>
                        </button>
                        <button
                          onClick={() => setNewBatchModal(true)}
                          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs transition-all shadow-2xs hover:shadow-sm active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                          <Folder className="w-4 h-4 text-red-600" />
                          <span>Create Batch</span>
                        </button>
                      </>
                    )}
                    {activeSection === "overview" && isHrRole && (
                      <>
                        <button
                          onClick={() => openEnrollMemberModal("mentor")}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Mentor</span>
                        </button>
                        <button
                          onClick={() => openEnrollMemberModal("intern")}
                          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                        >
                          <Plus className="w-4 h-4 text-red-600" />
                          <span>Add Intern</span>
                        </button>
                      </>
                    )}
                    {activeSection === "members" && canManageCredentials && (
                      <button
                        onClick={openEnrollMemberModal}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAdminRole ? "Add HR Manager" : "Add Team Member"}</span>
                      </button>
                    )}
                    {activeSection === "hr_mentors" && isHrRole && (
                      <button
                        onClick={() => openEnrollMemberModal("mentor")}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Mentor</span>
                      </button>
                    )}
                    {activeSection === "hr_interns" && isHrRole && (
                      <button
                        onClick={() => openEnrollMemberModal("intern")}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Intern</span>
                      </button>
                    )}
                    {activeSection === "batches" && canCreateBatch && (
                      <button
                        onClick={() => setNewBatchModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Batch</span>
                      </button>
                    )}
                    {activeSection === "batch_workspace" && (
                      <>
                        <button
                          onClick={() => selectSection("batches")}
                          className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Batches</span>
                        </button>
                        {canAssignWork && (
                          <button
                            onClick={openTaskModal}
                            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Task</span>
                          </button>
                        )}
                        {canScheduleMeetings && (
                          <button
                            onClick={openMeetingModal}
                            className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-2"
                          >
                            <Video className="w-4 h-4 text-red-600" />
                            <span>Meeting</span>
                          </button>
                        )}
                        {isTeamLeader && (
                          <button
                            onClick={() => openDailyUpdateModal()}
                            className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-red-600" />
                            <span>Daily Report</span>
                          </button>
                        )}
                      </>
                    )}
                    {activeSection === "tasks" && canAssignWork && (
                      <button
                        onClick={openTaskModal}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Task</span>
                      </button>
                    )}
                    {activeSection === "daily_updates" && isTeamLeader && (
                      <button
                        onClick={() => openDailyUpdateModal()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Daily Report</span>
                      </button>
                    )}
                    {activeSection === "classes" && canScheduleMeetings && (
                      <button
                        onClick={openMeetingModal}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Schedule Meeting</span>
                      </button>
                    )}
                    {activeSection === "certificates" && canIssueCertificates && (
                      <button
                        onClick={() => setNewCertModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Issue Certificate</span>
                      </button>
                    )}
                    {activeSection === "chat" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedContactId) loadMessages(selectedContactId);
                          if (selectedBatch?.id) loadBatchWorkspaceData(selectedBatch.id);
                          setToast("Messages refreshed.");
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer flex items-center gap-2 tracking-wide"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 1.5. Branded Hero Welcome Card - ONLY on Admin Dashboard Overview */}
              {activeSection === "overview" && isAdminRole && (
                <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 dark:border-slate-800 bg-gradient-to-r from-red-50/70 via-rose-50/40 to-amber-50/30 dark:from-red-950/20 dark:via-transparent dark:to-transparent p-4 sm:p-5 backdrop-blur-xs transition-all shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                            Welcome back, {userProfile?.full_name || "Workspace Admin"} 👋
                          </h2>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Operational
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                          TexWeb Solution unified workspace dashboard — real-time monitoring of team members, tasks, and operational performance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-transparent border border-gray-200/80 dark:border-slate-800 flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-semibold text-[11px]">
                          {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Stat Metric Cards - ONLY on Admin Dashboard Overview */}
              {activeSection === "overview" && isAdminRole && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {dashboardMetrics.map((m, mIdx) => {
                    const icons = [Users, Folder, Briefcase, Activity];
                    const IconComp = icons[mIdx % icons.length];
                    return (
                      <div
                        key={m.label}
                        className="relative overflow-hidden p-3.5 rounded-xl border border-gray-200/80 dark:border-slate-800/80 bg-transparent dark:bg-transparent shadow-none hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider font-sans">
                              {m.label}
                            </div>
                            <div className={`text-3xl font-black tracking-tight my-1.5 font-sans ${m.color}`}>
                              {m.value}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400 font-sans truncate">
                              {m.sub}
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <IconComp className="w-5 h-5 stroke-[1.75]" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. Search & Filter Bar (Only for tables, not alerts, chat, settings, batch files, or non-admin overview) */}
              {activeSection !== "alerts" && activeSection !== "chat" && activeSection !== "settings" && activeSection !== "batch_workspace" && activeSection !== "batch_files" && activeSection !== "review_center" && activeSection !== "task_submissions" && activeSection !== "at_risk_watchlist" && (activeSection !== "overview" || isAdminRole) && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={
                        activeSection === "batches"
                          ? "Search batches by name..."
                          : activeSection === "members" || (activeSection === "overview" && isAdminRole)
                            ? "Search by name or email..."
                            : activeSection === "daily_updates"
                              ? "Search daily updates..."
                              : activeSection === "audit"
                                ? "Search activity logs..."
                                : "Search by title, name, or keywords..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition shadow-none"
                    />
                  </div>
                  {activeSection !== "audit" && (
                    <div className="sm:w-60 relative">
                      <select
                        value={memberFilter}
                        onChange={(e) => setMemberFilter(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs font-semibold text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition shadow-none cursor-pointer appearance-none"
                      >
                        <option value="all">All Departments</option>
                        {DOMAIN_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              )}

              {/* 4. Upgraded Notifications Feed (when on alerts) */}
              {activeSection === "alerts" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Filter & Action Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-transparent dark:bg-transparent border border-gray-200/80 dark:border-slate-800/80 shadow-none">
                    {/* Left: Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setAlertsFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${alertsFilter === "all"
                          ? "bg-transparent dark:bg-transparent text-red-600 dark:text-red-400 shadow-none"
                          : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                      >
                        <span>All</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${alertsFilter === "all" ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300" : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                          }`}>
                          {notifications.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertsFilter("unread")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${alertsFilter === "unread"
                          ? "bg-transparent dark:bg-transparent text-red-600 dark:text-red-400 shadow-none"
                          : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                      >
                        <span>Unread</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Right: Mark All As Read */}
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${unreadCount > 0
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed border border-gray-200 dark:border-slate-800"
                        }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Mark all as read</span>
                    </button>
                  </div>

                  {/* Notification Cards List */}
                  <div className="space-y-4">
                    {totalRecords === 0 ? (
                      <div className="text-center py-16 px-4 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl bg-transparent dark:bg-transparent">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-gray-400">
                          {alertsFilter === "unread" ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Bell className="w-6 h-6 text-gray-400" />}
                        </div>
                        <div className="text-sm font-bold text-gray-800 dark:text-white">
                          {alertsFilter === "unread" ? "You're all caught up!" : "No notifications yet"}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                          {alertsFilter === "unread"
                            ? "There are no unread notifications right now. Check back later for updates."
                            : "System alerts, announcements, and task updates will appear here."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {paginatedRecords.map((n) => {
                          const isUnread = !n.is_read;
                          const typeStyles = {
                            meeting: { icon: Video, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900", label: "Meeting" },
                            class: { icon: Video, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900", label: "Class" },
                            task: { icon: CheckSquare, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900", badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900", label: "Task" },
                            submission: { icon: FileText, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900", badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900", label: "Submission" },
                            certificate: { icon: Award, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900", label: "Certificate" },
                            lead: { icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900", label: "Lead" },
                            announcement: { icon: Bell, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900", label: "Announcement" },
                            file: { icon: Folder, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900", badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900", label: "Batch File" },
                          }[n.type] || { icon: Bell, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900", badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900", label: "Alert" };
                          const IconComp = typeStyles.icon;

                          return (
                            <div
                              key={n.id}
                              className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 shadow-2xs group ${isUnread
                                ? "bg-transparent dark:bg-transparent border-red-300 dark:border-red-900/80 border-l-4 border-l-red-600 shadow-none"
                                : "bg-transparent dark:bg-transparent border-gray-200/80 dark:border-slate-800/80 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700"
                                }`}
                            >
                              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${typeStyles.bg} ${typeStyles.color} shadow-2xs`}>
                                  <IconComp className="w-5 h-5 stroke-[1.8]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${typeStyles.badge}`}>
                                      {typeStyles.label}
                                    </span>
                                    <h3 className={`font-bold text-xs sm:text-[13px] ${isUnread ? "text-gray-950 dark:text-white" : "text-gray-800 dark:text-slate-200"}`}>
                                      {n.title}
                                    </h3>
                                    {isUnread && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 shadow-2xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                                        New
                                      </span>
                                    )}
                                  </div>

                                  {/* Author Role Chip, Batch Chip & Attachment Indicator */}
                                  {(n.metadata?.creator_name || n.metadata?.batch_name) && (
                                    <div className="flex items-center gap-1.5 flex-wrap w-full mt-1 mb-1.5">
                                      {n.metadata?.creator_name && (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                                          ["super_admin", "admin"].includes(n.metadata.creator_role)
                                            ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900"
                                            : n.metadata.creator_role === "mentor"
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900"
                                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                                        }`}>
                                          <UserCheck className="w-3 h-3" />
                                          <span>
                                            [{ROLE_LABELS[n.metadata.creator_role] || n.metadata.creator_role || "Author"}] {n.metadata.creator_name}
                                          </span>
                                        </span>
                                      )}
                                      {n.metadata?.batch_name && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                                          <Folder className="w-3 h-3 text-amber-500" />
                                          <span>Batch: {n.metadata.batch_name}</span>
                                        </span>
                                      )}
                                      {n.metadata?.attachment_url && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                          <Paperclip className="w-3 h-3" />
                                          <span>{n.metadata.attachment_name || "Attachment"}</span>
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed break-words">
                                    {n.message}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-gray-400 dark:text-slate-500 font-mono">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      <span>{localDate(n.created_at)}</span>
                                    </span>
                                    {n.link_url && (
                                      <button
                                        type="button"
                                        onClick={() => handleReadNotification(n)}
                                        className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                                      >
                                        <span>View Section</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800 w-full sm:w-auto justify-end">
                                {isUnread && (
                                  <button
                                    type="button"
                                    onClick={() => handleReadNotification(n)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95 cursor-pointer shrink-0"
                                    title="Mark as Read"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark read</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNotification(n)}
                                  className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition cursor-pointer shrink-0"
                                  title="Delete notification"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Notification Pagination Bar */}
                    <div className="rounded-2xl border border-gray-200/90 dark:border-slate-800/90 overflow-hidden shadow-2xs">
                      <Pagination
                        currentPage={safePage}
                        totalItems={totalRecords}
                        rowsPerPage={rowsPerPage}
                        onPageChange={setCurrentPage}
                        onRowsPerPageChange={setRowsPerPage}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        itemName="notifications"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dedicated Profile & Account Settings Section */}
              {activeSection === "settings" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Identity & Avatar Card */}
                    <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-6 bg-transparent dark:bg-transparent flex flex-col items-center text-center shadow-none">
                      <div className="relative group mb-4">
                        <div className="w-24 h-24 rounded-2xl bg-gray-900 text-white font-bold text-3xl flex items-center justify-center overflow-hidden shadow-md border-2 border-white dark:border-slate-800">
                          {profileEditForm.avatar_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={profileEditForm.avatar_url}
                              alt={userProfile?.full_name || "Profile"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (userProfile?.full_name || sessionUser?.email || "U")[0]?.toUpperCase()
                          )}
                        </div>
                        <label
                          className="absolute -bottom-2 -right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md cursor-pointer transition flex items-center justify-center group-hover:scale-105"
                          title="Upload / Change Photo (Auto-WebP)"
                        >
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarFileSelect}
                            disabled={avatarUploading}
                          />
                        </label>
                      </div>

                      {avatarUploading && (
                        <p className="text-xs text-red-600 font-semibold mb-2 animate-pulse">
                          {avatarProcessingMsg || "Processing WebP photo..."}
                        </p>
                      )}
                      {avatarStats && !avatarUploading && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 mb-2">
                          WebP {avatarStats.newKb} KB ({avatarStats.savingsPercent}% saved)
                        </span>
                      )}

                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {userProfile?.full_name || "Workspace User"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sessionUser?.email}</p>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                          {ROLE_LABELS[currentRole] || currentRole}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                          {profileDepartmentLabel(userProfile)}
                        </span>
                      </div>

                      <div className="w-full mt-6 pt-4 border-t border-gray-200 dark:border-slate-800 text-left text-xs space-y-2.5 text-gray-500 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span className="font-medium">Account Status:</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Account ID:</span>
                          <span className="font-mono text-[11px] text-gray-400">{sessionUser?.id?.slice(0, 8)}...</span>
                        </div>
                        {userProfile?.created_at && (
                          <div className="flex justify-between">
                            <span className="font-medium">Joined Workspace:</span>
                            <span className="text-gray-700 dark:text-slate-300">
                              {new Date(userProfile.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Columns 2 & 3: Personal Information & Password Updates */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Card 1: Personal Details */}
                      <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-6 bg-transparent dark:bg-transparent shadow-none">
                        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
                          <User className="w-5 h-5 text-red-600" />
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Personal Information</h4>
                            <p className="text-xs text-gray-400">Update your name, contact phone number, and profile picture</p>
                          </div>
                        </div>

                        <form onSubmit={handleSaveOwnProfile} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">Full Name</label>
                              <input
                                type="text"
                                required
                                value={profileEditForm.full_name}
                                onChange={(e) => setProfileEditForm({ ...profileEditForm, full_name: e.target.value })}
                                placeholder="Your Full Name"
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs focus:bg-white/60 dark:focus:bg-transparent focus:outline-none focus:border-red-600"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">Phone Number</label>
                              <input
                                type="tel"
                                value={profileEditForm.phone}
                                onChange={(e) => setProfileEditForm({ ...profileEditForm, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs focus:bg-white/60 dark:focus:bg-transparent focus:outline-none focus:border-red-600"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">Work Email (Verified)</label>
                            <input
                              type="email"
                              disabled
                              value={sessionUser?.email || ""}
                              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100/70 dark:bg-slate-950 text-gray-400 text-xs cursor-not-allowed"
                            />
                          </div>

                          {/* Direct Photo Submit with Automatic Resize & WebP Conversion */}
                          <div>
                            <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">
                              Profile Photo
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-gray-900 text-white font-bold text-base flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700 shadow-2xs">
                                  {profileEditForm.avatar_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={profileEditForm.avatar_url}
                                      alt={userProfile?.full_name || "Profile"}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    (userProfile?.full_name || sessionUser?.email || "U")[0]?.toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                    {profileEditForm.avatar_url ? "Custom Photo Uploaded" : "Default Avatar"}
                                  </div>
                                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                    ⚡ Auto-resizes to 400×400 & converts to lightweight WebP
                                  </p>
                                  {avatarStats && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>WebP: {avatarStats.originalKb} KB → {avatarStats.newKb} KB ({avatarStats.savingsPercent}% saved)</span>
                                    </p>
                                  )}
                                  {avatarProcessingMsg && (
                                    <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-0.5 animate-pulse">
                                      {avatarProcessingMsg}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <label
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition shadow-xs cursor-pointer ${avatarUploading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{avatarUploading ? "Processing..." : profileEditForm.avatar_url ? "Change Photo" : "Upload Photo"}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarFileSelect}
                                    disabled={avatarUploading}
                                  />
                                </label>
                                {profileEditForm.avatar_url && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    disabled={avatarUploading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition border border-red-200 dark:border-red-500/20 cursor-pointer"
                                    title="Remove profile photo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={savingProfile}
                              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-2"
                            >
                              {savingProfile ? "Saving..." : "Save Profile Details"}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Card 2: Change Password */}
                      <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-6 bg-transparent dark:bg-transparent shadow-none">
                        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
                          <Lock className="w-5 h-5 text-red-600" />
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Change Password</h4>
                            <p className="text-xs text-gray-400">Keep your account secure by setting a new password</p>
                          </div>
                        </div>

                        <form onSubmit={handleChangeOwnPassword} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">New Password</label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  required
                                  minLength={8}
                                  value={changePasswordForm.password}
                                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, password: e.target.value })}
                                  placeholder="Min 8 characters"
                                  className="w-full p-2.5 pr-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs focus:bg-white/60 dark:focus:bg-transparent focus:outline-none focus:border-red-600"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">Confirm New Password</label>
                              <input
                                type="password"
                                required
                                value={changePasswordForm.confirm}
                                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirm: e.target.value })}
                                placeholder="Repeat new password"
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs focus:bg-white/60 dark:focus:bg-transparent focus:outline-none focus:border-red-600"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={updatingPassword}
                              className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-slate-200 rounded-xl font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-2"
                            >
                              {updatingPassword ? "Updating..." : "Update Password"}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Card 3: Account Actions */}
                      <div className="rounded-2xl border border-red-100 dark:border-red-500/20 p-6 bg-transparent dark:bg-transparent shadow-none">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <LogOut className="w-5 h-5 text-red-600" />
                            <div>
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Account Session</h4>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Logout from this workspace account.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer text-xs flex items-center justify-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DEDICATED WHATSAPP WEB MESSAGING SECTION - Matching Batch Overview Chat Tab 1:1 */}
              {activeSection === "chat" && (
                <div className="flex-1 min-h-0 h-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)] gap-0 xl:gap-3 animate-fadeIn">
                  {/* Left Column: Active WhatsApp Chat Area */}
                  <div className={`${chatMobilePane === "chat" ? "flex" : "hidden"} xl:flex h-full min-h-0 rounded-none sm:rounded-2xl xl:rounded-3xl overflow-hidden border-0 sm:border border-gray-200/80 dark:border-slate-800/80 flex-col relative shadow-none`}>
                    {selectedContactId && canAccessDirectChat ? (
                      (() => {
                        const activeContact = chatContacts.find((c) => c.id === selectedContactId);
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
                              chatBackSuppressAutoOpenRef.current = true;
                              if (typeof window !== "undefined" && chatMobileHistoryGuardRef.current) {
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
                              const msg = {
                                sender_id: sessionUser.id,
                                receiver_id: activeContact.id,
                                message: payload.message || "",
                                attachment_url: payload.attachment_url || null,
                                attachment_name: payload.attachment_name || null,
                                attachment_type: payload.attachment_type || null,
                                reply_to_id: payload.reply_to_id || null,
                              };
                              const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                              const tempMsg = {
                                ...msg,
                                id: tempId,
                                created_at: new Date().toISOString(),
                                sender: userProfile,
                              };
                              setMessages((prev) => [...(prev || []), tempMsg]);
                              rememberDirectChatActivity(tempMsg);

                              const saved = await sendRealtimeMessage(msg);
                              if (!saved) {
                                setToast("Message saved after refresh. Reopen chat if it does not appear.");
                                return true;
                              }

                              const newMsg = { ...tempMsg, ...saved, sender: saved.sender || userProfile };
                              setMessages((prev) => {
                                const list = prev || [];
                                const replaced = list.some((item) => item.id === tempId);
                                const next = replaced
                                  ? list.map((item) => (item.id === tempId ? newMsg : item))
                                  : [...list.filter((item) => item.id !== newMsg.id), newMsg];
                                return next.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                              });
                              rememberDirectChatActivity(newMsg);
                              directChatChannelRef.current?.send({
                                type: "broadcast",
                                event: "message",
                                payload: { message: newMsg },
                              });
                              return true;
                            }}
                            availableChats={{ contacts: canAccessDirectChat ? chatContacts : [], batches: batches }}
                            onMarkDelivered={() => markDirectChatDelivered(activeContact.id)}
                            onMarkRead={() => markDirectChatRead(activeContact.id)}
                            onEditMessage={async (messageId, text) => {
                              const target = messages.find((m) => m.id === messageId);
                              if (!target) return false;
                              const created = new Date(target.created_at).getTime();
                              if (Number.isNaN(created) || Date.now() - created > MESSAGE_EDIT_WINDOW_MS) {
                                setToast("Edit time window has expired.");
                                return false;
                              }
                              const saved = await updateRealtimeMessage(messageId, {
                                message: text,
                                original_message: target.original_message || target.message,
                                edited_at: new Date().toISOString(),
                              });
                              if (!saved) {
                                setToast("Message could not be edited.");
                                return false;
                              }
                              setMessages((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, ...saved } : m)));
                              return true;
                            }}
                            onPinMessage={async (messageId, isPinned) => {
                              const saved = await updateRealtimeMessage(messageId, { is_pinned: isPinned });
                              if (saved) {
                                setMessages((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, is_pinned: isPinned } : m)));
                                setToast(isPinned ? "Message pinned." : "Message unpinned.");
                              }
                            }}
                            onDeleteMessage={async ({ messageIds, deleteType }) => {
                              if (deleteType === "for_everyone") {
                                for (const mId of messageIds) {
                                  await updateRealtimeMessage(mId, {
                                    is_deleted: true,
                                    deleted_at: new Date().toISOString(),
                                    deleted_by: sessionUser.id,
                                  });
                                }
                                setMessages((prev) =>
                                  (prev || []).map((m) =>
                                    messageIds.includes(m.id)
                                      ? {
                                        ...m,
                                        is_deleted: true,
                                        deleted_at: new Date().toISOString(),
                                        deleted_by: sessionUser.id,
                                        is_pinned: false,
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
                              for (const target of targets) {
                                for (const m of msgsToForward) {
                                  if (target.type === "direct") {
                                    await sendRealtimeMessage({
                                      sender_id: sessionUser.id,
                                      receiver_id: target.id,
                                      message: m.message || "",
                                      attachment_url: m.attachment_url || null,
                                      attachment_name: m.attachment_name || null,
                                      attachment_type: m.attachment_type || null,
                                    });
                                  } else {
                                    await createBatchWorkspaceItem({
                                      type: "message",
                                      batch_id: target.id,
                                      message: m.message || "",
                                      attachment_url: m.attachment_url || null,
                                      attachment_name: m.attachment_name || null,
                                      attachment_type: m.attachment_type || null,
                                    });
                                  }
                                }
                              }
                              setToast(`Forwarded to ${targets.length} chat(s).`);
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
                        messages={activeBatchWorkspaceData.messages || []}
                        availableChats={{ contacts: canAccessDirectChat ? chatContacts : [], batches: batches }}
                        onOpenDirectChat={canAccessDirectChat ? (member) => {
                          if (!chatContacts.some((contact) => contact.id === member?.id)) {
                            setToast("Direct chat is limited to HR, Mentor, and Admin for this role.");
                            return;
                          }
                          chatBackSuppressAutoOpenRef.current = false;
                          setActiveSection("chat");
                          setSelectedContactId(member.id);
                          setChatMobilePane("chat");
                          setSelectedBatchId("");
                          loadMessages(member.id);
                          markDirectChatRead(member.id);
                        } : null}
                        onUpdateBatchInfo={(updatedBatch) => {
                          setBatches((prev) => (prev || []).map((b) => (b.id === updatedBatch.id ? { ...b, ...updatedBatch } : b)));
                        }}
                        onBack={() => {
                          chatBackSuppressAutoOpenRef.current = true;
                          if (typeof window !== "undefined" && chatMobileHistoryGuardRef.current) {
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
                          const result = await createBatchWorkspaceItem({
                            type: "message",
                            batch_id: selectedBatch.id,
                            ...payload,
                          });
                          if (result?.message) {
                            setBatchWorkspaceData((prev) => ({
                              ...prev,
                              messages: [...(prev.messages || []), result.message],
                            }));
                            rememberBatchChatActivity(result.message);
                            return true;
                          }
                          setToast("Batch message could not be sent.");
                          return false;
                        }}
                        onPinMessage={async (messageId, isPinned) => {
                          const result = await createBatchWorkspaceItem({
                            type: "pin_message",
                            batch_id: selectedBatch.id,
                            message_id: messageId,
                            is_pinned: isPinned,
                          });
                          if (result?.message) {
                            setBatchWorkspaceData((prev) => ({
                              ...prev,
                              messages: (prev.messages || []).map((m) =>
                                m.id === messageId ? { ...m, is_pinned: isPinned } : m
                              ),
                            }));
                            setToast(isPinned ? "Message pinned to batch notice." : "Message unpinned.");
                          }
                        }}
                        onMarkRead={() => createBatchWorkspaceItem({
                          type: "read_messages",
                          batch_id: selectedBatch.id,
                        })}
                        onEditMessage={async (messageId, text) => {
                          const result = await createBatchWorkspaceItem({
                            type: "edit_message",
                            batch_id: selectedBatch.id,
                            message_id: messageId,
                            message: text,
                          });
                          if (result?.message) {
                            setBatchWorkspaceData((prev) => ({
                              ...prev,
                              messages: (prev.messages || []).map((m) => (m.id === messageId ? result.message : m)),
                            }));
                            return true;
                          }
                          setToast("Message could not be edited.");
                          return false;
                        }}
                        onDeleteMessage={async ({ messageIds, deleteType }) => {
                          if (deleteType === "for_everyone") {
                            await createBatchWorkspaceItem({
                              type: "delete_message",
                              batch_id: selectedBatch.id,
                              message_ids: messageIds,
                              delete_type: "for_everyone",
                            });
                            setBatchWorkspaceData((prev) => ({
                              ...prev,
                              messages: (prev.messages || []).map((m) =>
                                messageIds.includes(m.id)
                                  ? {
                                    ...m,
                                    is_deleted: true,
                                    deleted_at: new Date().toISOString(),
                                    deleted_by: sessionUser.id,
                                    is_pinned: false,
                                  }
                                  : m
                              ),
                            }));
                          } else {
                            setBatchWorkspaceData((prev) => ({
                              ...prev,
                              messages: (prev.messages || []).filter((m) => !messageIds.includes(m.id)),
                            }));
                          }
                          setToast(deleteType === "for_everyone" ? "Deleted for everyone." : "Deleted for you.");
                        }}
                        onForwardMessage={async ({ targets, messages: msgsToForward }) => {
                          for (const target of targets) {
                            for (const m of msgsToForward) {
                              if (target.type === "direct") {
                                await sendRealtimeMessage({
                                  sender_id: sessionUser.id,
                                  receiver_id: target.id,
                                  message: m.message || "",
                                  attachment_url: m.attachment_url || null,
                                  attachment_name: m.attachment_name || null,
                                  attachment_type: m.attachment_type || null,
                                });
                              } else {
                                await createBatchWorkspaceItem({
                                  type: "message",
                                  batch_id: target.id,
                                  message: m.message || "",
                                  attachment_url: m.attachment_url || null,
                                  attachment_name: m.attachment_name || null,
                                  attachment_type: m.attachment_type || null,
                                });
                              }
                            }
                          }
                          setToast(`Forwarded to ${targets.length} chat(s).`);
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
                  <div className={`${chatMobilePane === "chat" ? "hidden" : "flex"} xl:flex rounded-2xl xl:rounded-3xl border border-gray-200/80 dark:border-slate-800/80 p-3 sm:p-4 space-y-3 bg-white/60 dark:bg-slate-900/30 shadow-2xs backdrop-blur-xs flex-col h-full min-h-0`}>
                    <div className="hidden xl:flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800/80 shrink-0">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Channels & Contacts
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
                        {chatChannelTab === "batches" ? `${availableChatBatches.length} Batches` : `${directChatStats.total} Direct`}
                      </span>
                    </div>

                    {/* Mode Toggle: Batches vs Direct */}
                    <div className={`${canAccessDirectChat ? "grid-cols-2" : "grid-cols-1"} grid gap-1.5 p-1 rounded-2xl bg-gray-100/90 dark:bg-slate-800/60 text-xs font-bold shrink-0`}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextBatch = sortedChatBatches[0] || null;
                          chatBackSuppressAutoOpenRef.current = false;
                          setChatChannelTab("batches");
                          setSelectedContactId("");
                          if (nextBatch?.id) {
                            setSelectedBatchId(nextBatch.id);
                            setBatchChatMeta((prev) => ({
                              ...prev,
                              [nextBatch.id]: {
                                ...(prev[nextBatch.id] || {}),
                                unreadCount: 0,
                              },
                            }));
                            setChatMobilePane("chat");
                            loadBatchWorkspaceData(nextBatch.id);
                          } else {
                            setSelectedBatchId("");
                            setChatMobilePane("channels");
                          }
                        }}
                        className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          chatChannelTab === "batches"
                            ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-2xs font-extrabold"
                            : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Folder className="w-4 h-4" />
                        <span>Batches</span>
                        {availableChatBatches.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/5 dark:bg-white/10">
                            {availableChatBatches.length}
                          </span>
                        )}
                      </button>
                      {canAccessDirectChat && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextContact = sortedChatContacts[0] || null;
                            chatBackSuppressAutoOpenRef.current = false;
                            setChatChannelTab("direct");
                            setSelectedBatchId("");
                            if (nextContact?.id) {
                              setSelectedContactId(nextContact.id);
                              setChatMobilePane("chat");
                              loadMessages(nextContact.id);
                              markDirectChatRead(nextContact.id);
                            } else {
                              setSelectedContactId("");
                              setChatMobilePane("channels");
                            }
                          }}
                          className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            chatChannelTab === "direct"
                              ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-2xs font-extrabold"
                              : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span>Direct</span>
                          {directChatStats.total > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/5 dark:bg-white/10">
                              {directChatStats.total}
                            </span>
                          )}
                        </button>
                      )}
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

                    {chatChannelTab === "direct" && canAccessDirectChat && (
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold shrink-0">
                        <div className="rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 px-2 py-1.5 text-center">
                          <div className="text-gray-400">Total</div>
                          <div className="text-gray-900 dark:text-white">{directChatStats.total}</div>
                        </div>
                        <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 px-2 py-1.5 text-center">
                          <div className="text-emerald-600 dark:text-emerald-400">Online</div>
                          <div className="text-emerald-700 dark:text-emerald-300">{directChatStats.online}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 px-2 py-1.5 text-center">
                          <div className="text-gray-400">Offline</div>
                          <div className="text-gray-700 dark:text-slate-300">{directChatStats.offline}</div>
                        </div>
                      </div>
                    )}

                    {/* Channel List */}
                    <div className="space-y-2 text-xs overflow-y-auto pr-1 flex-1">
                      {chatChannelTab === "batches" ? (
                        filteredChatBatches.length === 0 ? (
                          <div className="text-center py-8 text-xs text-gray-400">No matching batches found.</div>
                        ) : (
                          filteredChatBatches.map((b) => {
                            const isSelected = !selectedContactId && selectedBatch?.id === b.id;
                            const messageMeta = batchChatMeta[b.id] || {};
                            const notificationMeta = batchNotificationMeta[b.id] || {};
                            const useNotificationPreview = chatTimestamp(notificationMeta.lastMessageTime) > chatTimestamp(messageMeta.lastMessageTime);
                            const latestPreview = useNotificationPreview ? notificationMeta.lastMessagePreview : messageMeta.lastMessagePreview;
                            const unreadBadge = messageMeta.unreadCount || 0;
                            const avatarUrl = getBatchAvatarUrl(b);
                            const onlineSummary = getBatchOnlineSummary(b);
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  chatBackSuppressAutoOpenRef.current = false;
                                  setChatChannelTab("batches");
                                  setSelectedContactId("");
                                  setSelectedBatchId(b.id);
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
                                className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                                  isSelected
                                    ? "bg-red-50/80 text-red-950 dark:bg-red-500/10 dark:text-red-100 border-red-300 dark:border-red-500/30 font-bold shadow-xs"
                                    : "bg-white/60 dark:bg-slate-900/30 border-gray-200/80 dark:border-slate-800 hover:border-red-300 dark:hover:border-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="relative shrink-0">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-xs flex items-center justify-center overflow-hidden shadow-xs">
                                      {avatarUrl ? (
                                        <img src={avatarUrl} alt={b.name || "Batch"} className="w-full h-full object-cover" />
                                      ) : (
                                        <Folder className="w-5 h-5" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-xs sm:text-sm truncate text-gray-900 dark:text-white mb-0.5">{b.name}</div>
                                    <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate mb-1">
                                      {latestPreview || domainLabel(b.domain)}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 truncate max-w-[150px]">
                                        {domainLabel(b.domain)}
                                      </span>
                                      {onlineSummary.isOnline && (
                                        <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                          {onlineSummary.onlineCount} online
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                                    isSelected ? "bg-red-600 text-white border-red-600" : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
                                  }`}>
                                    {b.status || "active"}
                                  </span>
                                  {unreadBadge > 0 && (
                                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                      {unreadBadge > 99 ? "99+" : unreadBadge}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )
                      ) : (
                        filteredChatContacts.length === 0 ? (
                          <div className="text-center py-8 text-xs text-gray-400">No matching contacts.</div>
                        ) : (
                          filteredChatContacts.map((contact) => {
                            const profile = getChannelProfile(contact);
                            const isSelf = profile.id === sessionUser?.id || profile.id === userProfile?.id || (profile.email && profile.email === userProfile?.email);
                            const isSelected = selectedContactId === contact.id;
                            const meta = directChatMeta[contact.id] || {};
                            const unreadBadge = meta.unreadCount || 0;
                            const isOnline = workspaceOnlineSet.has(contact.id);
                            const avatarUrl = getProfileAvatarUrl(profile);
                            const subtitle = contactSubtitle(profile);
                            const roleLabel = channelRoleLabel(profile.role);
                            return (
                              <button
                                key={contact.id}
                                type="button"
                                onClick={() => {
                                  chatBackSuppressAutoOpenRef.current = false;
                                  setSelectedContactId(contact.id);
                                  setChatMobilePane("chat");
                                  loadMessages(contact.id);
                                  markDirectChatRead(contact.id);
                                }}
                                className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                                  isSelected
                                    ? "bg-red-50/80 text-red-950 dark:bg-red-500/10 dark:text-red-100 border-red-300 dark:border-red-500/30 font-bold shadow-xs"
                                    : "bg-white/60 dark:bg-slate-900/30 border-gray-200/80 dark:border-slate-800 hover:border-emerald-500"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="relative shrink-0">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden shadow-xs ring-1 ring-gray-200 dark:ring-slate-700">
                                      {avatarUrl ? (
                                        <img src={avatarUrl} alt={profile.full_name || "Contact"} className="w-full h-full object-cover" />
                                      ) : (
                                        profile.full_name?.charAt(0)?.toUpperCase() || "U"
                                      )}
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-600"}`} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className={`font-bold text-xs sm:text-sm truncate flex items-center gap-1.5 mb-0.5 ${isSelected ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-white"}`}>
                                      {isSelf ? (
                                        <>
                                          <span className="text-red-600 dark:text-red-400 font-black">You</span>
                                          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal truncate">({profile.full_name || "Myself"})</span>
                                        </>
                                      ) : (
                                        <span>{profile.full_name}</span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate mb-1">
                                      {meta.lastMessagePreview || subtitle || profile.email}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 truncate max-w-[150px]">
                                        {subtitle || profile.email}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${channelRolePillClass(profile.role)}`}>
                                    {roleLabel}
                                  </span>
                                  {unreadBadge > 0 && (
                                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                      {unreadBadge > 99 ? "99+" : unreadBadge}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "batch_workspace" && (
                <div className="space-y-4 animate-fadeIn">
                  {!selectedBatch ? (
                    <div className="text-center py-14 px-4 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl bg-transparent dark:bg-transparent">
                      <Folder className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <div className="text-sm font-bold text-gray-900 dark:text-white">No assigned batch found</div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Open Batches after an Admin or HR assigns a batch to this account.</p>
                    </div>
                  ) : (
                    <>
                      {batchWorkspaceTab !== "chat" && (
                        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-4">
                          <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 bg-transparent dark:bg-transparent">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                    <Folder className="w-3.5 h-3.5" />
                                    {selectedBatch.name}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {domainLabel(selectedBatch.domain)}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-50 text-gray-700 dark:bg-slate-900 dark:text-slate-300 border border-gray-200 dark:border-slate-800 capitalize">
                                    {selectedBatch.batch_type || "internship"}
                                  </span>
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold uppercase border ${selectedBatch.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                    }`}>
                                    {selectedBatch.status || "active"}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">
                                  Batch ID: <span className="font-mono">{selectedBatch.id}</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                  Start: {selectedBatch.starts_at || "Immediate"} · End: {selectedBatch.ends_at || "Open"}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
                                {[
                                  ["Members", selectedBatchMembers.length],
                                  ["Active", selectedBatchHealth.totalTasks - selectedBatchHealth.completedTasks],
                                  ["Pending", selectedBatchHealth.submittedTasks + selectedBatchHealth.pendingReports],
                                  ["Overdue", selectedBatchHealth.overdueTasks],
                                ].map(([label, value]) => (
                                  <div key={label} className="rounded-xl border border-gray-200 dark:border-slate-800 px-3 py-2 text-center">
                                    <div className="text-lg font-black text-gray-900 dark:text-white">{value}</div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400 dark:text-slate-500">{label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 bg-transparent dark:bg-transparent">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Responsibility Map</div>
                            {[
                              ["HR", resolveBatchLead(selectedBatch, "hr")],
                              ["Mentor", resolveBatchLead(selectedBatch, "mentor")],
                              ["Team Leader", resolveBatchLead(selectedBatch, "team_leader")],
                            ].map(([label, person]) => (
                              <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                <span className="text-xs font-bold text-gray-500 dark:text-slate-400">{label}</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[180px]" title={person?.email || person?.full_name || "Unassigned"}>
                                  {person?.full_name || "Unassigned"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                          ["overview", LayoutDashboard, "Overview"],
                          ["members", Users, "Members"],
                          ["tasks", CheckSquare, "Tasks"],
                          ["meetings", Video, "Meetings"],
                          ["attendance", ShieldCheck, "Attendance"],
                          ...((isMentor || isTeamLeader) ? [["reports", FileText, "Daily Reports"]] : []),
                          ["chat", MessageSquare, "Chat"],
                          ["announcements", Bell, "Announcements"],
                          ...((isAdminRole || isHrRole) ? [["activity", Activity, "Activity"]] : []),
                        ].map(([key, IconComp, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setBatchWorkspaceTab(key)}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${batchWorkspaceTab === key
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-transparent text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900"
                              }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                            {label}
                          </button>
                        ))}
                      </div>

                      {batchWorkspaceTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <h3 className="text-sm font-black text-gray-900 dark:text-white">Today</h3>
                              {canScheduleMeetings && (
                                <button onClick={openMeetingModal} className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                                  <Plus className="w-3.5 h-3.5" /> Meeting
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="rounded-xl border border-gray-200 dark:border-slate-800 p-3">
                                <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">Today&apos;s Meeting</div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                  {selectedBatchMeetings[0]?.title || "No meeting scheduled"}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{selectedBatchMeetings[0] ? localDate(selectedBatchMeetings[0].scheduled_at) : "Schedule from Classes & Meetings"}</div>
                              </div>
                              <div className="rounded-xl border border-gray-200 dark:border-slate-800 p-3">
                                <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">Pending Mentor Reviews</div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{selectedBatchReviews.reports.length + selectedBatchReviews.submissions.length}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Reports and task submissions needing review</div>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3">Batch Health</h3>
                            {[
                              ["Task Completion", `${selectedBatchHealth.taskCompletion}%`],
                              ["Meeting Attendance", `${selectedBatchHealth.attendancePercent}%`],
                              ...((isMentor || isTeamLeader) ? [["Daily Reports", `${selectedBatchDailyUpdates.length - selectedBatchHealth.pendingReports}/${selectedBatchDailyUpdates.length}`]] : []),
                              ["Needs Attention", selectedBatchHealth.needsAttention],
                              ["At Risk", selectedBatchHealth.atRisk],
                            ].map(([label, value]) => (
                              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
                                <span className="text-xs font-black text-gray-900 dark:text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {batchWorkspaceTab === "members" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {selectedBatchMembers.map((member) => (
                            <div
                              key={member.id}
                              onClick={() => setSelectedMemberModal(member)}
                              className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 hover:border-red-300 dark:hover:border-slate-700 transition cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-black text-sm text-gray-900 dark:text-white truncate hover:text-red-600 transition">{member.full_name}</div>
                                  <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{member.email}</div>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    <span className="px-2 py-1 rounded-lg text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{ROLE_LABELS[member.role] || member.role}</span>
                                    <span className="px-2 py-1 rounded-lg text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">{member.status || "active"}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  {isMentor && member.role === "intern" && (
                                    <button onClick={() => handlePromoteInternToTl(member)} className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                      Make TL
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {batchWorkspaceTab === "tasks" && (
                        <div className="space-y-2">
                          {selectedBatchTasks.map((task) => (
                            <div key={task.id} className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-black text-sm text-gray-900 dark:text-white">{task.title}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</div>
                                {task.expected_output && (
                                  <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 line-clamp-2">Expected: {task.expected_output}</div>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                                  <span className="font-bold text-red-600 dark:text-red-400">{task.priority || "medium"}</span>
                                  <span className={`font-bold ${deadlineState(task) === "Overdue" ? "text-rose-600" : deadlineState(task) === "Due Today" ? "text-amber-600" : "text-emerald-600"}`}>{deadlineState(task)}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => setTaskDetailsModal(task)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-600">Details</button>
                                {canReviewTask(task) && <button onClick={() => setReviewModal(task)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">Review</button>}
                                {canSubmitTask(task) && <button onClick={() => setSubmissionModal(task.id)} className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 text-white">Submit Work</button>}
                                <span className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300">{task.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {batchWorkspaceTab === "meetings" && (
                        <div className="space-y-2">
                          {selectedBatchMeetings.map((meeting) => (
                            <div key={meeting.id} className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="font-black text-sm text-gray-900 dark:text-white">{meeting.title}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">{meeting.topic} · {localDate(meeting.scheduled_at)}</div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {canScheduleMeetings && <button onClick={() => copyAttendanceLink(meeting)} className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Attendance Link</button>}
                                <a href={safeExternalUrl(meeting.meeting_link)} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 text-white">Join</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {batchWorkspaceTab === "attendance" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {selectedBatchAttendance.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4">
                              <div className="font-black text-sm text-gray-900 dark:text-white">{item.user?.full_name || "Member"}</div>
                              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.attendance_date} · {item.meeting?.title || "Batch attendance"}</div>
                              <span className="inline-flex mt-3 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{item.status || "present"}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {batchWorkspaceTab === "reports" && (isMentor || isTeamLeader) && (
                        <div className="space-y-2">
                          {selectedBatchDailyUpdates.map((update) => (
                            <div key={update.id} className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-black text-sm text-gray-900 dark:text-white">{update.tl?.full_name || "Team Leader"} · {update.assigned_tasks || "Daily Report"}</div>
                                  <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">{update.summary}</p>
                                  {update.blockers && <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">Issue: {update.blockers}</p>}
                                  {update.reviewer_comment && <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">Mentor comment: {update.reviewer_comment}</p>}
                                </div>
                                {canCommentDailyUpdate(update) && (
                                  <button onClick={() => setDailyCommentModal(update)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">Comment</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {batchWorkspaceTab === "chat" && (
                        <div className={`grid grid-cols-1 ${canAccessDirectChat ? "xl:grid-cols-[1fr_320px]" : ""} gap-4 animate-fadeIn h-[calc(100dvh-13.5rem)] min-h-[450px]`}>
                          <div className="h-full min-h-0 rounded-3xl overflow-hidden border border-gray-200/80 dark:border-slate-800/80 flex flex-col relative shadow-none">
                            <TexAppBatchChat
                            mode="batch"
                            batch={selectedBatch}
                            currentUser={sessionUser}
                            currentProfile={userProfile}
                            batchMembers={selectedBatchMembers}
                            batchTasks={selectedBatchTasks}
                            batchMeetings={selectedBatchMeetings}
                        messages={activeBatchWorkspaceData.messages || []}
                            availableChats={{ contacts: canAccessDirectChat ? chatContacts : [], batches: batches }}
                            onOpenDirectChat={canAccessDirectChat ? (member) => {
                              if (!chatContacts.some((contact) => contact.id === member?.id)) {
                                setToast("Direct chat is limited to HR, Mentor, and Admin for this role.");
                                return;
                              }
                              chatBackSuppressAutoOpenRef.current = false;
                              setActiveSection("chat");
                              setSelectedContactId(member.id);
                              setChatMobilePane("chat");
                              setSelectedBatchId("");
                              loadMessages(member.id);
                              markDirectChatRead(member.id);
                            } : null}
                            onUpdateBatchInfo={(updatedBatch) => {
                              setBatches((prev) => (prev || []).map((b) => (b.id === updatedBatch.id ? { ...b, ...updatedBatch } : b)));
                            }}
                            onRefresh={() => loadBatchWorkspaceData(selectedBatch.id)}
                            onlineUserIds={workspaceOnlineUserIds}
                            typingUsers={typingUsers}
                            onTyping={publishTyping}
                            onSendMessage={async (payload) => {
                              const result = await createBatchWorkspaceItem({
                                type: "message",
                                batch_id: selectedBatch.id,
                                ...payload,
                              });
                            if (result?.message) {
                              setBatchWorkspaceData((prev) => ({
                                ...prev,
                                messages: [...(prev.messages || []), result.message],
                              }));
                              rememberBatchChatActivity(result.message);
                              return true;
                            }
                              setToast("Batch message could not be sent.");
                              return false;
                            }}
                            onPinMessage={async (messageId, isPinned) => {
                              const result = await createBatchWorkspaceItem({
                                type: "pin_message",
                                batch_id: selectedBatch.id,
                                message_id: messageId,
                                is_pinned: isPinned,
                              });
                              if (result?.message) {
                                setBatchWorkspaceData((prev) => ({
                                  ...prev,
                                  messages: (prev.messages || []).map((m) =>
                                    m.id === messageId ? { ...m, is_pinned: isPinned } : m
                                  ),
                                }));
                                setToast(isPinned ? "Message pinned to batch notice." : "Message unpinned.");
                              }
                            }}
                            onMarkRead={() => createBatchWorkspaceItem({
                              type: "read_messages",
                              batch_id: selectedBatch.id,
                            })}
                            onEditMessage={async (messageId, text) => {
                              const result = await createBatchWorkspaceItem({
                                type: "edit_message",
                                batch_id: selectedBatch.id,
                                message_id: messageId,
                                message: text,
                              });
                              if (result?.message) {
                                setBatchWorkspaceData((prev) => ({
                                  ...prev,
                                  messages: (prev.messages || []).map((m) => (m.id === messageId ? result.message : m)),
                                }));
                                return true;
                              }
                              setToast("Message could not be edited.");
                              return false;
                            }}
                            onDeleteMessage={async ({ messageIds, deleteType }) => {
                              if (deleteType === "for_everyone") {
                                await createBatchWorkspaceItem({
                                  type: "delete_message",
                                  batch_id: selectedBatch.id,
                                  message_ids: messageIds,
                                  delete_type: "for_everyone",
                                });
                                setBatchWorkspaceData((prev) => ({
                                  ...prev,
                                  messages: (prev.messages || []).map((m) =>
                                    messageIds.includes(m.id)
                                      ? {
                                        ...m,
                                        is_deleted: true,
                                        deleted_at: new Date().toISOString(),
                                        deleted_by: sessionUser.id,
                                        is_pinned: false,
                                      }
                                      : m
                                  ),
                                }));
                              } else {
                                setBatchWorkspaceData((prev) => ({
                                  ...prev,
                                  messages: (prev.messages || []).filter((m) => !messageIds.includes(m.id)),
                                }));
                              }
                              setToast(deleteType === "for_everyone" ? "Deleted for everyone." : "Deleted for you.");
                            }}
                            onForwardMessage={async ({ targets, messages: msgsToForward }) => {
                              for (const target of targets) {
                                for (const m of msgsToForward) {
                                  if (target.type === "direct") {
                                    await sendRealtimeMessage({
                                      sender_id: sessionUser.id,
                                      receiver_id: target.id,
                                      message: m.message || "",
                                      attachment_url: m.attachment_url || null,
                                      attachment_name: m.attachment_name || null,
                                      attachment_type: m.attachment_type || null,
                                    });
                                  } else {
                                    await createBatchWorkspaceItem({
                                      type: "message",
                                      batch_id: target.id,
                                      message: m.message || "",
                                      attachment_url: m.attachment_url || null,
                                      attachment_name: m.attachment_name || null,
                                      attachment_type: m.attachment_type || null,
                                    });
                                  }
                                }
                              }
                              setToast(`Forwarded to ${targets.length} chat(s).`);
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
                          </div>
                          {canAccessDirectChat && (
                          <div className="rounded-3xl border border-gray-200/80 dark:border-slate-800/80 p-4 space-y-3 bg-white/50 dark:bg-transparent backdrop-blur-xs flex flex-col h-full min-h-0">
                            <div>
                              <h3 className="text-sm font-black text-gray-900 dark:text-white mb-0.5">Personal Chat Channels</h3>
                              <p className="text-[11px] text-gray-500 dark:text-slate-400">Live direct contacts with real profile status.</p>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                              <div className="rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 px-2 py-1.5 text-center">
                                <div className="text-gray-400">Total</div>
                                <div className="text-gray-900 dark:text-white">{directChatStats.total}</div>
                              </div>
                              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 px-2 py-1.5 text-center">
                                <div className="text-emerald-600 dark:text-emerald-400">Online</div>
                                <div className="text-emerald-700 dark:text-emerald-300">{directChatStats.online}</div>
                              </div>
                              <div className="rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 px-2 py-1.5 text-center">
                                <div className="text-gray-400">Offline</div>
                                <div className="text-gray-700 dark:text-slate-300">{directChatStats.offline}</div>
                              </div>
                            </div>
                            <div className="space-y-2 text-xs overflow-y-auto pr-1 flex-1">
                              {sortedChatContacts.length === 0 ? (
                                <div className="text-center py-6 text-xs text-gray-400">No permitted direct contacts.</div>
                              ) : (
                                sortedChatContacts.map((contact) => {
                                  const isOnline = workspaceOnlineSet.has(contact.id);
                                  return (
                                    <button
                                      key={contact.id}
                                      onClick={() => {
                                        chatBackSuppressAutoOpenRef.current = false;
                                        setSelectedContactId(contact.id);
                                        setChatMobilePane("chat");
                                        selectSection("chat");
                                        loadMessages(contact.id);
                                        markDirectChatRead(contact.id);
                                      }}
                                      className="w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl border border-gray-200/80 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-slate-800/60 text-left transition cursor-pointer group"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="relative shrink-0">
                                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                                            {contact.full_name?.charAt(0) || "U"}
                                          </div>
                                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-600"}`} />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-bold text-xs truncate group-hover:text-emerald-600 transition-colors">{contact.full_name}</div>
                                          <div className="text-[10px] text-gray-400 truncate">{contact.email}</div>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold text-gray-500 dark:text-slate-400">
                                          {ROLE_LABELS[contact.role] || contact.role}
                                        </span>
                                        <span className={`text-[9px] font-bold ${isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                                          {isOnline ? "Online" : "Offline"}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                          )}
                        </div>
                      )}

                      {batchWorkspaceTab === "announcements" && (() => {
                        const totalAnnouncementsCount = selectedBatchAnnouncements.length;
                        const safeAnnouncePage = Math.min(Math.max(1, announcementsPage), Math.max(1, Math.ceil(totalAnnouncementsCount / announcementsPerPage)));
                        const startIdx = (safeAnnouncePage - 1) * announcementsPerPage;
                        const paginatedAnnouncements = selectedBatchAnnouncements.slice(startIdx, startIdx + announcementsPerPage);

                        return (
                          <div className={`grid grid-cols-1 ${canPostBatchNotice ? "lg:grid-cols-[360px_1fr]" : "grid-cols-1"} gap-4`}>
                            {canPostBatchNotice && (
                              <form onSubmit={handleCreateBatchAnnouncement} className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 space-y-3 bg-white/50 dark:bg-transparent">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Post Notice</h3>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                    Broadcast
                                  </span>
                                </div>
                                <InputField label="Title" value={batchAnnouncementForm.title} onChange={(v) => setBatchAnnouncementForm({ ...batchAnnouncementForm, title: v })} required />
                                <SelectField label="Category" value={batchAnnouncementForm.category} onChange={(v) => setBatchAnnouncementForm({ ...batchAnnouncementForm, category: v })} options={[
                                  ["announcement", "Announcement"],
                                  ["important_link", "Important Link"],
                                  ["rule", "Rule"],
                                  ["pinned", "Pinned Information"],
                                ]} />

                                {/* Optional Attachment: PDF, Image, Document */}
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Attachment (PDF / Image / Doc)</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept=".pdf,image/*,.doc,.docx,.txt,.xlsx,.zip"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
                                          setAnnouncementAttachment({
                                            file,
                                            previewUrl,
                                            fileName: file.name,
                                            fileType: file.type || file.name.split(".").pop(),
                                            uploading: false,
                                          });
                                        }
                                      }}
                                      className="hidden"
                                      id="batch-announcement-file-input"
                                    />
                                    {announcementAttachment.file ? (
                                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                          {announcementAttachment.previewUrl ? (
                                            <img src={announcementAttachment.previewUrl} alt="Preview" className="w-7 h-7 rounded object-cover border" />
                                          ) : (
                                            <FileText className="w-4 h-4 text-red-600 shrink-0" />
                                          )}
                                          <span className="font-bold text-red-950 dark:text-red-200 truncate">{announcementAttachment.fileName}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => setAnnouncementAttachment({ file: null, previewUrl: "", fileName: "", fileType: "", uploading: false })}
                                          className="p-1 hover:text-red-600 text-gray-400"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <label
                                        htmlFor="batch-announcement-file-input"
                                        className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl hover:border-red-500 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition text-xs text-gray-500 dark:text-slate-400 font-medium"
                                      >
                                        <Paperclip className="w-4 h-4 text-gray-400" />
                                        <span>Attach PDF, Document, or Image</span>
                                      </label>
                                    )}
                                  </div>
                                </div>

                                <InputField label="Optional Link" type="url" value={batchAnnouncementForm.link_url} onChange={(v) => setBatchAnnouncementForm({ ...batchAnnouncementForm, link_url: v })} placeholder="https://..." />
                                <textarea rows={4} value={batchAnnouncementForm.body} onChange={(event) => setBatchAnnouncementForm({ ...batchAnnouncementForm, body: event.target.value })} placeholder="Announcement body..." required className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-red-600" />
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer">
                                  <input type="checkbox" checked={batchAnnouncementForm.pinned} onChange={(event) => setBatchAnnouncementForm({ ...batchAnnouncementForm, pinned: event.target.checked })} />
                                  <span>Pin this notice to top</span>
                                </label>
                                <button
                                  type="submit"
                                  disabled={announcementAttachment.uploading}
                                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition"
                                >
                                  {announcementAttachment.uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                  <span>{announcementAttachment.uploading ? "Uploading & Publishing..." : "Publish Announcement"}</span>
                                </button>
                              </form>
                            )}

                            <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 space-y-3 bg-white/50 dark:bg-transparent">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Batch Notice Board</h3>
                                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Announcements, rule changes, and notifications.</p>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                                  {totalAnnouncementsCount} Notices
                                </span>
                              </div>

                              {totalAnnouncementsCount === 0 ? (
                                <div className="text-center py-10 text-xs text-gray-400 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                                  No announcements posted in this batch yet.
                                </div>
                              ) : (
                                <>
                                  <div className="space-y-3">
                                    {paginatedAnnouncements.map((item) => {
                                      const isImg = item.attachment_url && (
                                        item.attachment_type?.startsWith("image") ||
                                        item.attachment_url.startsWith("data:image") ||
                                        item.attachment_url.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i) ||
                                        item.attachment_name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)
                                      );

                                      return (
                                        <div key={item.id} className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent space-y-2">
                                          <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-xs font-black text-gray-900 dark:text-white">{item.title}</span>
                                              {(item.pinned || item.category === "pinned") && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
                                                  Pinned
                                                </span>
                                              )}
                                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 uppercase">
                                                {item.category?.replaceAll("_", " ")}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {item.created_at && (
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                  {localDate(item.created_at)}
                                                </span>
                                              )}
                                              {(["super_admin", "hr", "admin"].includes(currentRole) || item.created_by === sessionUser?.id || item.creator?.id === sessionUser?.id) && (
                                                <div className="flex items-center gap-1 ml-1">
                                                  <button
                                                    type="button"
                                                    onClick={() => setEditingAnnouncement({
                                                      id: item.id,
                                                      title: item.title,
                                                      body: item.message || item.body,
                                                      category: item.category || "announcement",
                                                      link_url: item.link_url || "",
                                                      pinned: Boolean(item.pinned),
                                                      attachment_url: item.attachment_url || "",
                                                      attachment_name: item.attachment_name || "",
                                                      attachment_type: item.attachment_type || "",
                                                      file: null,
                                                      previewUrl: item.attachment_url || "",
                                                      uploading: false,
                                                    })}
                                                    className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                                                    title="Edit announcement"
                                                  >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleDeleteBatchAnnouncement(item)}
                                                    className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                                    title="Delete announcement"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Creator Chip if available */}
                                          {item.creator?.full_name && (
                                            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                                              <span className="font-bold text-gray-700 dark:text-slate-300">
                                                [{ROLE_LABELS[item.creator.role] || item.creator.role}]
                                              </span>
                                              <span>{item.creator.full_name}</span>
                                            </div>
                                          )}

                                          <div className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {item.message || item.body}
                                          </div>

                                          {/* Attachment Download / View Button (Unified for Images, PDFs, and Docs) */}
                                          {item.attachment_url && (
                                            <div className="pt-1">
                                              <a
                                                href={safeExternalUrl(item.attachment_url)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
                                              >
                                                {isImg ? <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-blue-600" />}
                                                <span className="truncate max-w-xs">{item.attachment_name || (isImg ? "Download / View Image" : "Download Document")}</span>
                                                <Download className="w-3 h-3 ml-1 text-blue-500" />
                                              </a>
                                            </div>
                                          )}

                                          {item.link_url && (
                                            <a
                                              href={safeExternalUrl(item.link_url)}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline pt-1"
                                            >
                                              <span>Open Link</span>
                                              <ExternalLink className="w-3 h-3" />
                                            </a>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <Pagination
                                    currentPage={safeAnnouncePage}
                                    totalItems={totalAnnouncementsCount}
                                    rowsPerPage={announcementsPerPage}
                                    onPageChange={setAnnouncementsPage}
                                    onRowsPerPageChange={(v) => {
                                      setAnnouncementsPerPage(v);
                                      setAnnouncementsPage(1);
                                    }}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    itemName="announcements"
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {batchWorkspaceTab === "activity" && (isAdminRole || isHrRole) && (
                        <div className="space-y-4">
                          {/* Batch Activity Header & Search/Filter Controls */}
                          <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-transparent space-y-3.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  <span>Batch Activity &amp; Audit Trail (A to Z)</span>
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                  Complete chronological record of all events, tasks, submissions, reports, files, meetings and changes for {selectedBatch?.name || "this cohort"}.
                                </p>
                              </div>
                              <div className="relative w-full sm:w-64 shrink-0">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  placeholder="Search batch activities..."
                                  value={batchActivitySearch}
                                  onChange={(e) => {
                                    setBatchActivitySearch(e.target.value);
                                    setBatchActivityPage(1);
                                  }}
                                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                                />
                              </div>
                            </div>

                            {/* Category Filter Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                              {[
                                ["all", "All Events", selectedBatchActivity.length],
                                ["announcements", "Announcements", selectedBatchActivity.filter((x) => x.category === "announcements").length],
                                ["files", "Files & Resources", selectedBatchActivity.filter((x) => x.category === "files").length],
                                ["tasks_and_work", "Tasks & Submissions", selectedBatchActivity.filter((x) => ["tasks", "submissions", "reviews"].includes(x.category)).length],
                                ["reports", "Daily Reports", selectedBatchActivity.filter((x) => x.category === "reports").length],
                                ["meetings", "Classes & Meets", selectedBatchActivity.filter((x) => x.category === "meetings").length],
                                ["governance", "Governance & History", selectedBatchActivity.filter((x) => ["escalations", "members", "audit", "batch"].includes(x.category)).length],
                              ].map(([catKey, catLabel, catCount]) => (
                                <button
                                  key={catKey}
                                  type="button"
                                  onClick={() => {
                                    setBatchActivityCategory(catKey);
                                    setBatchActivityPage(1);
                                  }}
                                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${batchActivityCategory === catKey
                                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                                    : "bg-gray-100/80 hover:bg-gray-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                                    }`}
                                >
                                  <span>{catLabel}</span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${batchActivityCategory === catKey
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                                    }`}>
                                    {catCount}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Activity Content Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Left Feed (2 cols) */}
                            <div className="lg:col-span-2 space-y-3">
                              {paginatedBatchActivities.length === 0 ? (
                                <div className="p-8 text-center rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/30 dark:bg-transparent">
                                  <Activity className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                                  <div className="text-xs font-bold text-gray-700 dark:text-slate-300">No batch activities found</div>
                                  <p className="text-[11px] text-gray-400 mt-1">
                                    {batchActivitySearch.trim() ? "Try modifying your search keywords or clearing filters." : "Activities will populate automatically as work happens in this batch."}
                                  </p>
                                </div>
                              ) : (
                                paginatedBatchActivities.map((item) => {
                                  return (
                                    <div
                                      key={item.id}
                                      className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-transparent hover:border-red-300 dark:hover:border-slate-700 transition space-y-2"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${item.badgeColor || "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 border-gray-200 dark:border-slate-700"}`}>
                                            {item.categoryLabel || "Activity"}
                                          </span>
                                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                            {item.title}
                                          </span>
                                        </div>
                                        <span className="text-[11px] font-mono text-gray-400 dark:text-slate-400 shrink-0 flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-gray-400" />
                                          {localDate(item.date)}
                                        </span>
                                      </div>

                                      {item.description && (
                                        <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 leading-relaxed pl-1">
                                          {item.description}
                                        </p>
                                      )}

                                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-slate-800/60 text-[11px] text-gray-500 dark:text-slate-400 flex-wrap">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="font-semibold text-gray-700 dark:text-slate-300 truncate">
                                            {item.meta}
                                          </span>
                                        </div>
                                        {item.file?.url && (
                                          <a
                                            href={safeExternalUrl(item.file.url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 hover:underline shrink-0"
                                          >
                                            <Paperclip className="w-3 h-3" />
                                            <span className="max-w-[130px] truncate">{item.file.name || "Attachment"}</span>
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}

                              {/* Batch Activity Pagination */}
                              <Pagination
                                currentPage={safeBatchActivityPage}
                                totalItems={totalBatchActivitiesCount}
                                rowsPerPage={batchActivityPerPage}
                                onPageChange={setBatchActivityPage}
                                onRowsPerPageChange={(v) => {
                                  setBatchActivityPerPage(v);
                                  setBatchActivityPage(1);
                                }}
                                rowsPerPageOptions={[10, 20, 50]}
                                itemName="activities"
                              />
                            </div>

                            {/* Right Column: Batch Intelligence & Review Center */}
                            <div className="space-y-4">
                              <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 bg-white/40 dark:bg-transparent space-y-3">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white">Batch Activity Breakdown</h3>
                                {[
                                  ["Total Recorded Events", selectedBatchActivity.length],
                                  ["Announcements", selectedBatchActivity.filter((x) => x.category === "announcements").length],
                                  ["Files & Technical Guides", selectedBatchActivity.filter((x) => x.category === "files").length],
                                  ["Batch Tasks", selectedBatchTasks.length],
                                  ["Student Submissions", selectedBatchActivity.filter((x) => x.category === "submissions").length],
                                  ["Daily Reports", selectedBatchDailyUpdates.length],
                                  ["Classes & Meetings", selectedBatchMeetings.length],
                                  ["Escalations / History", (batchWorkspaceData.escalations?.length || 0) + (batchWorkspaceData.history?.length || 0)],
                                ].map(([label, value]) => (
                                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800 last:border-0 text-xs">
                                    <span className="text-gray-500 dark:text-slate-400">{label}</span>
                                    <span className="font-black text-gray-900 dark:text-white">{value}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 bg-white/40 dark:bg-transparent space-y-3">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white">Review Center (Batch Level)</h3>
                                {[
                                  ["Daily Reports Pending", selectedBatchReviews.reports.length],
                                  ["Task Submissions Needing Review", selectedBatchReviews.submissions.length],
                                  ["Changes Requested", selectedBatchReviews.changes.length],
                                ].map(([label, value]) => (
                                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800 last:border-0 text-xs">
                                    <span className="text-gray-500 dark:text-slate-400">{label}</span>
                                    <span className={`font-black ${value > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Dedicated Batch Files & Knowledge Base Section */}
              {activeSection === "batch_files" && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Top Bar: Batch Switcher & Navigation */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900 shadow-2xs shrink-0">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-black text-gray-900 dark:text-white">Batch Files & Resources</h2>
                          {selectedBatch && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900 uppercase">
                              {selectedBatch.batch_type || "Internship"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          Official documents, guides, guidelines, and learning materials connected batch by batch.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {/* Batch Selector Dropdown */}
                      {accessibleFileBatches.length > 1 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Batch:</span>
                          <select
                            value={selectedBatch?.id || ""}
                            onChange={(e) => {
                              const newId = e.target.value;
                              setSelectedBatchId(newId);
                              setSelectedSidebarBatchId(newId);
                              loadBatchWorkspaceData(newId);
                            }}
                            className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 shadow-2xs cursor-pointer"
                          >
                            {accessibleFileBatches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name} ({b.domain?.replace("_", " ")})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : selectedBatch ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-xs font-bold text-red-700 dark:text-red-300">
                          <Folder className="w-3.5 h-3.5" />
                          <span>{selectedBatch.name}</span>
                        </div>
                      ) : null}

                      {selectedBatch && (
                        <button
                          type="button"
                          onClick={() => selectSection("batch_workspace")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-500 text-gray-700 dark:text-slate-200 transition cursor-pointer shadow-2xs shrink-0"
                        >
                          <span>Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {!selectedBatch ? (
                    <div className="text-center py-16 px-4 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-transparent">
                      <Folder className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <div className="text-sm font-bold text-gray-900 dark:text-white">No assigned batch found</div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Please contact an Administrator or HR Manager to assign you to an active batch.
                      </p>
                    </div>
                  ) : (() => {
                    // Combine workspace resources and task attachments
                    const allBatchFiles = [
                      ...(batchWorkspaceData.resources || []).map((r) => ({
                        id: r.id,
                        title: r.title,
                        category: r.category || "technical_guides",
                        description: r.description,
                        link_url: r.link_url,
                        file_url: r.file_url,
                        file_name: r.file_name,
                        creator: r.creator,
                        created_at: r.created_at,
                        is_task_reference: false,
                      })),
                      ...selectedBatchTasks.filter((task) => task.reference_url || task.file_name).map((task) => ({
                        id: `task-${task.id}`,
                        title: task.file_name || task.title,
                        category: "task_reference",
                        description: task.description,
                        link_url: task.reference_url,
                        file_url: task.reference_url,
                        file_name: task.file_name,
                        creator: null,
                        created_at: task.created_at,
                        is_task_reference: true,
                      })),
                    ];

                    const filteredFiles = allBatchFiles.filter((item) => {
                      if (filesCategoryFilter !== "all" && item.category !== filesCategoryFilter) return false;
                      if (filesSearch.trim()) {
                        const q = filesSearch.toLowerCase();
                        const matchTitle = item.title?.toLowerCase().includes(q);
                        const matchDesc = item.description?.toLowerCase().includes(q);
                        const matchFile = item.file_name?.toLowerCase().includes(q);
                        const matchAuthor = item.creator?.full_name?.toLowerCase().includes(q);
                        if (!matchTitle && !matchDesc && !matchFile && !matchAuthor) return false;
                      }
                      return true;
                    });

                    const totalFilesCount = filteredFiles.length;
                    const safeFilesPage = Math.min(Math.max(1, filesPage), Math.max(1, Math.ceil(totalFilesCount / filesPerPage)));
                    const startIdx = (safeFilesPage - 1) * filesPerPage;
                    const paginatedFiles = filteredFiles.slice(startIdx, startIdx + filesPerPage);

                    return (
                      <div className="space-y-4">
                        {/* View-only banner for TL & Intern */}
                        {!canPostBatchNotice && (
                          <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Batch Knowledge Base & File Archive</h4>
                                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                  Official materials, guidelines, and reference files shared by Admin, HR, and Mentors.
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                              View-Only Archive
                            </span>
                          </div>
                        )}

                        {/* Search & Category Filter Toolbar */}
                        <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-transparent space-y-3">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="relative flex-1">
                              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                value={filesSearch}
                                onChange={(e) => {
                                  setFilesSearch(e.target.value);
                                  setFilesPage(1);
                                }}
                                placeholder="Search files by title, description, filename, or author..."
                                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition"
                              />
                              {filesSearch && (
                                <button
                                  type="button"
                                  onClick={() => setFilesSearch("")}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                                {totalFilesCount} {totalFilesCount === 1 ? "File" : "Files"}
                              </span>
                            </div>
                          </div>

                          {/* Category Filter Pills */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                            {[
                              ["all", "All Files"],
                              ["technical_guides", "Technical Guides"],
                              ["task_guidelines", "Task Guidelines"],
                              ["git_guidelines", "Git Guidelines"],
                              ["learning_material", "Learning Material"],
                              ["important_documents", "Documents"],
                              ["useful_links", "Useful Links"],
                              ["task_reference", "Task References"],
                              ["other", "Other"],
                            ].map(([catKey, catLabel]) => {
                              const isActive = filesCategoryFilter === catKey;
                              return (
                                <button
                                  key={catKey}
                                  type="button"
                                  onClick={() => {
                                    setFilesCategoryFilter(catKey);
                                    setFilesPage(1);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer border text-[11px] ${
                                    isActive
                                      ? "bg-red-600 text-white border-red-600 shadow-2xs"
                                      : "bg-transparent text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                                  }`}
                                >
                                  {catLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Main Grid: Upload Form (Admin/HR/Mentor only) + Files Grid */}
                        <div className={`grid grid-cols-1 ${canPostBatchNotice ? "lg:grid-cols-[380px_1fr]" : "grid-cols-1"} gap-5`}>
                          {/* Upload Form - strictly for Admin, HR, Mentor */}
                          {canPostBatchNotice && (
                            <form onSubmit={handleCreateBatchResource} className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 space-y-3 bg-white/50 dark:bg-transparent h-fit sticky top-20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Upload className="w-4 h-4 text-red-600" />
                                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Upload / Add File</h3>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 uppercase">
                                  Manager
                                </span>
                              </div>
                              <InputField label="Title" value={batchResourceForm.title} onChange={(v) => setBatchResourceForm({ ...batchResourceForm, title: v })} placeholder="e.g. Git Workflow Guide" required />
                              <SelectField label="Category" value={batchResourceForm.category} onChange={(v) => setBatchResourceForm({ ...batchResourceForm, category: v })} options={[
                                ["technical_guides", "Technical Guides"],
                                ["task_guidelines", "Task Guidelines"],
                                ["git_guidelines", "Git Guidelines"],
                                ["learning_material", "Learning Material"],
                                ["important_documents", "Important Documents"],
                                ["useful_links", "Useful Links"],
                                ["other", "Other"],
                              ]} />

                              {/* Upload File (PDF, Image, Document) */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                                  <span>Attach File (PDF / Image / Doc)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept=".pdf,image/*,.doc,.docx,.txt,.xlsx,.zip"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
                                        setBatchResourceFile({
                                          file,
                                          previewUrl,
                                          fileName: file.name,
                                          fileType: file.type || file.name.split(".").pop(),
                                          uploading: false,
                                        });
                                      }
                                    }}
                                    className="hidden"
                                    id="batch-files-page-resource-file-input"
                                  />
                                  {batchResourceFile.file ? (
                                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs">
                                      <div className="flex items-center gap-2 min-w-0">
                                        {batchResourceFile.previewUrl ? (
                                          <img src={batchResourceFile.previewUrl} alt="Preview" className="w-7 h-7 rounded object-cover border" />
                                        ) : (
                                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                        )}
                                        <span className="font-bold text-indigo-950 dark:text-indigo-200 truncate">{batchResourceFile.fileName}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setBatchResourceFile({ file: null, previewUrl: "", fileName: "", fileType: "", uploading: false })}
                                        className="p-1 hover:text-red-600 text-gray-400"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label
                                      htmlFor="batch-files-page-resource-file-input"
                                      className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl hover:border-red-500 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition text-xs text-gray-500 dark:text-slate-400 font-medium"
                                    >
                                      <Upload className="w-4 h-4 text-gray-400" />
                                      <span>Click to attach PDF, doc or image</span>
                                    </label>
                                  )}
                                </div>
                              </div>

                              <InputField label="Or External Link URL" type="url" value={batchResourceForm.link_url} onChange={(v) => setBatchResourceForm({ ...batchResourceForm, link_url: v })} placeholder="https://..." />
                              <textarea
                                rows={3}
                                value={batchResourceForm.description}
                                onChange={(event) => setBatchResourceForm({ ...batchResourceForm, description: event.target.value })}
                                placeholder="Short description, guidelines or instructions for this file"
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition"
                              />
                              <button
                                type="submit"
                                disabled={batchResourceFile.uploading}
                                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-red-500/20 active:scale-95"
                              >
                                {batchResourceFile.uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                <span>{batchResourceFile.uploading ? "Uploading File..." : "Share with Batch"}</span>
                              </button>
                            </form>
                          )}

                          {/* Files List & Cards */}
                          <div className="space-y-4">
                            {paginatedFiles.length === 0 ? (
                              <div className="text-center py-16 px-4 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-transparent">
                                <Folder className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                  {filesSearch || filesCategoryFilter !== "all" ? "No matching files found" : "No files shared yet"}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                  {canPostBatchNotice
                                    ? "Upload technical guides, references, or study documents using the form."
                                    : "Files shared by your mentors and managers will appear here."}
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {paginatedFiles.map((item) => {
                                  const isImg = item.file_url && (
                                    item.file_url.startsWith("data:image") ||
                                    item.file_url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
                                    item.file_name?.match(/\.(jpeg|jpg|gif|png|webp)$/i)
                                  );
                                  const isPdf = item.file_url && (
                                    item.file_url.startsWith("data:application/pdf") ||
                                    item.file_url.match(/\.pdf($|\?)/i) ||
                                    item.file_name?.match(/\.pdf$/i)
                                  );

                                  return (
                                    <div
                                      key={item.id}
                                      className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 bg-white/50 dark:bg-transparent hover:border-red-300 dark:hover:border-red-900/60 transition flex flex-col justify-between gap-3 shadow-2xs group"
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex items-start gap-2.5 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                              isPdf
                                                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                                                : isImg
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                                                : item.is_task_reference
                                                ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900"
                                                : item.file_url
                                                ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
                                                : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
                                            }`}>
                                              {isPdf ? (
                                                <FileText className="w-4 h-4" />
                                              ) : isImg ? (
                                                <ImageIcon className="w-4 h-4" />
                                              ) : item.is_task_reference ? (
                                                <CheckSquare className="w-4 h-4" />
                                              ) : item.file_url ? (
                                                <File className="w-4 h-4" />
                                              ) : (
                                                <ExternalLink className="w-4 h-4" />
                                              )}
                                            </div>
                                            <div className="min-w-0">
                                              <h4 className="text-xs font-black text-gray-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" title={item.title}>
                                                {item.title}
                                              </h4>
                                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 uppercase">
                                                  {item.category?.replaceAll("_", " ")}
                                                </span>
                                                {item.is_task_reference && (
                                                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                                                    Task File
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {item.created_at && (
                                            <span className="text-[10px] text-gray-400 font-mono shrink-0">
                                              {localDate(item.created_at)}
                                            </span>
                                          )}
                                        </div>

                                        {/* Author Role Chip */}
                                        {item.creator?.full_name && (
                                          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                                            <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] border ${
                                              ["super_admin", "admin"].includes(item.creator.role)
                                                ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900"
                                                : item.creator.role === "mentor"
                                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900"
                                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                                            }`}>
                                              {ROLE_LABELS[item.creator.role] || item.creator.role}
                                            </span>
                                            <span className="truncate">{item.creator.full_name}</span>
                                          </div>
                                        )}

                                        {item.description && (
                                          <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                            {item.description}
                                          </p>
                                        )}

                                      </div>

                                      {/* Action Buttons: Download or Open External + Edit/Delete */}
                                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 flex-wrap">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {item.file_url && (
                                            <a
                                              href={safeExternalUrl(item.file_url)}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer shadow-2xs"
                                            >
                                              <Download className="w-3.5 h-3.5" />
                                              <span>Download / View</span>
                                            </a>
                                          )}
                                          {item.link_url && item.link_url !== item.file_url && (
                                            <a
                                              href={safeExternalUrl(item.link_url)}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer shadow-2xs"
                                            >
                                              <ExternalLink className="w-3.5 h-3.5" />
                                              <span>Open Link</span>
                                            </a>
                                          )}
                                        </div>

                                        {!item.is_task_reference && (["super_admin", "hr", "admin"].includes(currentRole) || item.created_by === sessionUser?.id || item.creator?.id === sessionUser?.id) && (
                                          <div className="flex items-center gap-1 ml-auto">
                                            <button
                                              type="button"
                                              onClick={() => setEditingResource({
                                                id: item.id,
                                                title: item.title,
                                                category: item.category || "technical_guides",
                                                description: item.description || "",
                                                link_url: item.link_url || "",
                                                file_url: item.file_url || "",
                                                file_name: item.file_name || "",
                                                file: null,
                                                previewUrl: item.file_url || "",
                                                uploading: false,
                                              })}
                                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
                                              title="Edit file details"
                                            >
                                              <Edit3 className="w-3 h-3" />
                                              <span>Edit</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteBatchResource(item)}
                                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
                                              title="Delete file"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                              <span>Delete</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Pagination */}
                            <Pagination
                              currentPage={safeFilesPage}
                              totalItems={totalFilesCount}
                              rowsPerPage={filesPerPage}
                              onPageChange={setFilesPage}
                              onRowsPerPageChange={(v) => {
                                setFilesPerPage(v);
                                setFilesPage(1);
                              }}
                              rowsPerPageOptions={[5, 10, 20, 50]}
                              itemName="files"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Dedicated Overview Panels for Intern, Team Leader, Mentor, and HR */}
              {activeSection === "overview" && isAdminRole && (
                <SupervisionPulsePanel
                  title="Workspace Risk & Escalation Panel"
                  subtitle="High-level view of open escalations, risk alerts, and pending daily updates across batches."
                  batches={batches}
                  profiles={profiles}
                  tasks={tasks}
                  submissions={submissions}
                  dailyUpdates={dailyUpdates}
                  escalations={accessibleEscalations}
                  attendanceRecords={attendance}
                  showSubmissions={false}
                  onOpenWorkspace={(batchId) => openBatchWorkspace(batchId)}
                  onOpenMemberProfile={(member) => setSelectedMemberModal(member)}
                  onNavigateSection={(section) => {
                    if (section === "review_center" || section === "at_risk_watchlist") return;
                    selectSection(section);
                  }}
                  isDark={isDark}
                  domainLabel={domainLabel}
                />
              )}

              {activeSection === "overview" && currentRole === "intern" && (
                <InternOverview
                  userProfile={userProfile}
                  batch={batches.find((b) => b.id === userProfile?.batch_id)}
                  mentor={profiles.find((p) => p.id === userProfile?.assigned_mentor_id)}
                  teamLeader={profiles.find((p) => p.id === userProfile?.assigned_tl_id || (p.batch_id === userProfile?.batch_id && p.role === "team_leader"))}
                  tasks={tasks}
                  submissions={submissions}
                  reviews={taskReviews}
                  meetings={meetings}
                  attendanceRecords={attendance.filter((a) => a.user_id === sessionUser?.id)}
                  onOpenTaskDetails={(task) => setTaskDetailsModal(task)}
                  onSubmitWork={(taskId) => setSubmissionModal(taskId)}
                  onOpenWorkspace={(batchId) => openBatchWorkspace(batchId)}
                  isDark={isDark}
                  domainLabel={domainLabel}
                  localDate={localDate}
                />
              )}

              {activeSection === "overview" && isTeamLeader && (
                <TeamLeaderOverview
                  userProfile={userProfile}
                  batch={batches.find((b) => b.id === userProfile?.batch_id) || ownedBatches[0]}
                  mentor={profiles.find((p) => p.id === userProfile?.assigned_mentor_id)}
                  interns={profiles.filter((p) => p.role === "intern" && p.batch_id === userProfile?.batch_id)}
                  tasks={tasks}
                  dailyUpdates={dailyUpdates}
                  meetings={meetings}
                  attendanceRecords={attendance}
                  onOpenDailyReportModal={() => setDailyReportModalOpen(true)}
                  onOpenMemberProfile={(member) => setSelectedMemberModal(member)}
                  onOpenTaskDetails={(task) => setTaskDetailsModal(task)}
                  onOpenWorkspace={(batchId) => openBatchWorkspace(batchId)}
                  onScheduleMeeting={openMeetingModal}
                  onOpenEscalationModal={() => {
                    openBatchWorkspace(userProfile?.batch_id);
                    setBatchWorkspaceTab("escalations");
                  }}
                  isDark={isDark}
                  domainLabel={domainLabel}
                  localDate={localDate}
                />
              )}

              {activeSection === "overview" && isMentor && (
                <MentorOverview
                  userProfile={userProfile}
                  batches={ownedBatches}
                  profiles={profiles}
                  tasks={tasks}
                  submissions={submissions}
                  dailyUpdates={dailyUpdates}
                  escalations={accessibleEscalations}
                  attendanceRecords={attendance}
                  onOpenWorkspace={(batchId) => openBatchWorkspace(batchId)}
                  onOpenMemberProfile={(member) => setSelectedMemberModal(member)}
                  onOpenTaskDetails={(task) => setTaskDetailsModal(task)}
                  onReviewSubmission={(task) => setReviewModal(task)}
                  onCommentDailyUpdate={(report) => setDailyCommentModal(report)}
                  onResolveEscalation={handleUpdateBatchEscalationStatus}
                  onAssignTask={openTaskModal}
                  onScheduleMeeting={openMeetingModal}
                  onNavigateSection={selectSection}
                  onOpenChatWithUser={openDirectChatWithUser}
                  isDark={isDark}
                  domainLabel={domainLabel}
                  localDate={localDate}
                />
              )}

              {activeSection === "overview" && isHrRole && (
                <div className="space-y-6">
                  <SupervisionPulsePanel
                    title="HR Risk & Escalation Panel"
                    subtitle="Track open escalations, risk alerts, and pending daily reports for HR-assigned batches."
                    batches={ownedBatches}
                    profiles={visibleProfiles}
                    tasks={tasks}
                    submissions={submissions}
                    dailyUpdates={dailyUpdates}
                    escalations={accessibleEscalations}
                    attendanceRecords={attendance}
                    showSubmissions={false}
                    onOpenWorkspace={(batchId) => openBatchWorkspace(batchId)}
                    onOpenMemberProfile={(member) => setSelectedMemberModal(member)}
                    onNavigateSection={(section) => {
                      if (section === "review_center" || section === "at_risk_watchlist") return;
                      selectSection(section);
                    }}
                    isDark={isDark}
                    domainLabel={domainLabel}
                  />
                  <HrOverview
                    userProfile={userProfile}
                    batches={ownedBatches}
                    profiles={visibleProfiles}
                    attendanceRecords={attendance}
                    certificates={certificates}
                    onOpenWorkspace={(batchId) => openBatchWorkspace(batchId)}
                    onOpenMemberProfile={(member) => setSelectedMemberModal(member)}
                    onAddMentor={() => openEnrollMemberModal("mentor")}
                    onAddIntern={() => openEnrollMemberModal("intern")}
                    onAssignMentor={(batch) => openAssignLeadsModal(batch)}
                    onSelectSection={selectSection}
                    isDark={isDark}
                    domainLabel={domainLabel}
                    localDate={localDate}
                  />
                </div>
              )}

              {/* 4.4. DEDICATED SUPERVISOR REVIEW & ESCALATION CENTER */}
              {activeSection === "review_center" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Escalation Review</h2>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Raise and track batch-wise blockers, alerts, and urgent issues.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openRaiseEscalationModal()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition self-start sm:self-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Raise Escalation</span>
                    </button>
                  </div>
                  {/* Top Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div
                      onClick={() => setReviewCenterTab("open")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${reviewCenterTab === "open" ? "border-amber-500 shadow-md ring-2 ring-amber-500/20" : "hover:border-amber-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-600">
                        <span>Open Escalations</span>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                        {mentorReviewCenterData.open.length}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Issues & roadblocks awaiting supervisor intervention</div>
                    </div>

                    <div
                      onClick={() => setReviewCenterTab("critical")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${reviewCenterTab === "critical" ? "border-red-500 shadow-md ring-2 ring-red-500/20" : "hover:border-red-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-red-600">
                        <span>Critical Priority</span>
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                        {mentorReviewCenterData.critical.length}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">High & urgent blockers needing immediate action</div>
                    </div>

                    <div
                      onClick={() => setReviewCenterTab("resolved")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${reviewCenterTab === "resolved" ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20" : "hover:border-emerald-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-600">
                        <span>Resolved Issues</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                        {mentorReviewCenterData.resolved.length}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Successfully addressed roadblocks</div>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className={`p-4 rounded-2xl border ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}>
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-bold overflow-x-auto">
                      <button
                        onClick={() => setReviewCenterTab("all")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${reviewCenterTab === "all" ? "bg-white dark:bg-slate-700 text-amber-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        All Escalations ({mentorReviewCenterData.all.length})
                      </button>
                      <button
                        onClick={() => setReviewCenterTab("open")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${reviewCenterTab === "open" ? "bg-white dark:bg-slate-700 text-amber-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Open Only ({mentorReviewCenterData.open.length})
                      </button>
                      <button
                        onClick={() => setReviewCenterTab("critical")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${reviewCenterTab === "critical" ? "bg-white dark:bg-slate-700 text-red-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Critical & High ({mentorReviewCenterData.critical.length})
                      </button>
                      <button
                        onClick={() => setReviewCenterTab("mine")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${reviewCenterTab === "mine" ? "bg-white dark:bg-slate-700 text-red-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Raised By Me ({mentorReviewCenterData.raisedByMe.length})
                      </button>
                      <button
                        onClick={() => setReviewCenterTab("assigned")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${reviewCenterTab === "assigned" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Assigned To Me ({mentorReviewCenterData.assignedToMe.length})
                      </button>
                      <button
                        onClick={() => setReviewCenterTab("resolved")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${reviewCenterTab === "resolved" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Resolved ({mentorReviewCenterData.resolved.length})
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 flex-1 max-w-md">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Filter by issue, description, batch..."
                          value={reviewCenterSearch}
                          onChange={(e) => setReviewCenterSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-amber-600 text-gray-900 dark:text-white"
                        />
                      </div>

                      <select
                        value={reviewCenterBatchFilter}
                        onChange={(e) => setReviewCenterBatchFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-amber-600 text-gray-700 dark:text-slate-200"
                      >
                        <option value="all">All Batches</option>
                        {ownedBatches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Escalations Section */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          Escalations ({filteredOpenEscalations.length})
                        </h3>
                      </div>
                      <span className="text-[11px] text-gray-400">Supervisor intervention & resolution</span>
                    </div>

                    {filteredOpenEscalations.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <span>No escalations matching this filter.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {paginatedReviewCenterEscalations.map((esc) => {
                          const batch = batches.find((b) => b.id === esc.batch_id);
                          const isResolved = esc.status === "resolved";
                          const isRaisedByMe = esc.created_by === sessionUser?.id;
                          const isAssignedToMe = esc.assigned_to === sessionUser?.id;
                          const priorityKey = (esc.priority || "medium").toLowerCase();
                          const canResolveEscalation = isAssignedToMe && !isRaisedByMe && !isResolved;

                          return (
                            <div
                              key={esc.id}
                              className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 text-xs ${isResolved
                                ? "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                                : "border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400"
                                }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                                    {esc.issue}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${["critical", "urgent"].includes(priorityKey)
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200"
                                      : priorityKey === "high"
                                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200"
                                        : priorityKey === "medium"
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                      }`}>
                                      {esc.priority || "Medium"}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isResolved ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                      }`}>
                                      {esc.status || "open"}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[11px] text-gray-400">
                                  Batch: <span className="font-semibold text-gray-600 dark:text-slate-300">{batch?.name || "Batch"}</span> • Category: <span className="uppercase font-semibold">{esc.category || "General"}</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                                  {isRaisedByMe && (
                                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200 font-bold">
                                      Raised by me
                                    </span>
                                  )}
                                  {isAssignedToMe && (
                                    <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 font-bold">
                                      Assigned to me
                                    </span>
                                  )}
                                  {esc.creator?.full_name && !isRaisedByMe && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                                      Raised by {esc.creator.full_name}
                                    </span>
                                  )}
                                  {esc.assignee?.full_name && !isAssignedToMe && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                                      Assigned to {esc.assignee.full_name}
                                    </span>
                                  )}
                                </div>

                                {esc.description && (
                                  <p className="text-gray-700 dark:text-slate-300 text-xs mt-1 leading-relaxed bg-white/70 dark:bg-transparent p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                    {esc.description}
                                  </p>
                                )}

                                {isResolved && esc.resolution && (
                                  <p className="text-emerald-800 dark:text-emerald-200 text-xs mt-1 leading-relaxed bg-emerald-50/80 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                                    <span className="font-bold">Resolution:</span> {esc.resolution}
                                  </p>
                                )}
                              </div>

                              {(canResolveEscalation || (isResolved && !isRaisedByMe)) && (
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                                  {isResolved ? (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateBatchEscalationStatus(esc, "open")}
                                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Re-open Issue</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEscalationResolutionModal(esc);
                                        setEscalationResolutionText(esc.resolution || "");
                                      }}
                                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs bg-emerald-600 hover:bg-emerald-500 text-white"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Mark as Resolved</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Escalations Pagination */}
                    <Pagination
                      currentPage={safeReviewCenterPage}
                      totalItems={totalReviewCenterItems}
                      rowsPerPage={reviewCenterRowsPerPage}
                      onPageChange={setReviewCenterPage}
                      onRowsPerPageChange={(n) => {
                        setReviewCenterRowsPerPage(n);
                        setReviewCenterPage(1);
                      }}
                      rowsPerPageOptions={[6, 10, 20, 50]}
                      itemName="escalations"
                    />
                  </div>
                </div>
              )}

              {/* 4.5. DEDICATED TASK SUBMISSIONS PAGE */}
              {activeSection === "task_submissions" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Top Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div
                      onClick={() => setTaskSubmissionsTab("pending")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${taskSubmissionsTab === "pending" ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/20" : "hover:border-indigo-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-600">
                        <span>Pending Review</span>
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                        {pendingSubmissionsCount}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Submitted deliverables awaiting evaluation</div>
                    </div>

                    <div
                      onClick={() => setTaskSubmissionsTab("approved")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${taskSubmissionsTab === "approved" ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20" : "hover:border-emerald-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-600">
                        <span>Approved Submissions</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                        {allSupervisedSubmissions.filter((s) => ["approved", "completed"].includes(tasks.find((t) => t.id === s.task_id)?.status)).length}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Successfully evaluated deliverables</div>
                    </div>

                    <div
                      onClick={() => setTaskSubmissionsTab("all")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${taskSubmissionsTab === "all" ? "border-slate-500 shadow-md ring-2 ring-slate-500/20" : "hover:border-slate-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                        <span>Total Submissions</span>
                        <Send className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                        {allSupervisedSubmissions.length}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">All student deliverables across batches</div>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className={`p-4 rounded-2xl border ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}>
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-bold overflow-x-auto">
                      <button
                        onClick={() => setTaskSubmissionsTab("pending")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${taskSubmissionsTab === "pending" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Pending Review ({pendingSubmissionsCount})
                      </button>
                      <button
                        onClick={() => setTaskSubmissionsTab("approved")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${taskSubmissionsTab === "approved" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Approved ({allSupervisedSubmissions.filter((s) => ["approved", "completed"].includes(tasks.find((t) => t.id === s.task_id)?.status)).length})
                      </button>
                      <button
                        onClick={() => setTaskSubmissionsTab("all")}
                        className={`px-3 py-1.5 rounded-lg transition shrink-0 ${taskSubmissionsTab === "all" ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        All Submissions ({allSupervisedSubmissions.length})
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 flex-1 max-w-md">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by student, task, link, notes..."
                          value={taskSubmissionsSearch}
                          onChange={(e) => setTaskSubmissionsSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white"
                        />
                      </div>

                      <select
                        value={taskSubmissionsBatchFilter}
                        onChange={(e) => setTaskSubmissionsBatchFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-indigo-600 text-gray-700 dark:text-slate-200"
                      >
                        <option value="all">All Batches</option>
                        {ownedBatches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submissions Cards */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          Submissions ({filteredTaskSubmissions.length})
                        </h3>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {taskSubmissionsTab === "pending" ? "Grading & approval required" : "Task evaluation track"}
                      </span>
                    </div>

                    {filteredTaskSubmissions.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <span>No task submissions found for this filter.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {paginatedTaskSubmissions.map((submission) => {
                          const task = tasks.find((t) => t.id === submission.task_id);
                          const batch = batches.find((b) => b.id === task?.batch_id);
                          const intern = submission.intern || profiles.find((p) => p.id === submission.user_id);
                          const isApproved = ["approved", "completed"].includes(task?.status);

                          return (
                            <div
                              key={submission.id}
                              className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 text-xs ${isApproved
                                ? "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                                : "border-gray-200/90 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:border-indigo-300"
                                }`}
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0">
                                      {(intern?.full_name || "I")[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-gray-900 dark:text-white truncate">
                                        {intern?.full_name || "Intern"}
                                      </div>
                                      <div className="text-[11px] text-gray-400 truncate">
                                        {batch?.name || "Batch"} • Submitted {localDate(submission.submitted_at || submission.created_at)}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${isApproved
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border border-indigo-200/60 dark:border-indigo-900/60 animate-pulse"
                                    }`}>
                                    {isApproved ? "Approved" : "Needs Grade"}
                                  </span>
                                </div>

                                <div className="p-3 rounded-xl bg-white dark:bg-transparent border border-gray-100 dark:border-slate-800 space-y-1.5">
                                  <div className="font-bold text-gray-900 dark:text-white text-xs">
                                    {task?.title || "Task Submission"}
                                  </div>
                                  {task?.deadline && (
                                    <div className="text-[11px] text-gray-400">
                                      Deadline: {localDate(task.deadline)}
                                    </div>
                                  )}
                                  {submission.notes && (
                                    <p className="text-gray-600 dark:text-slate-300 text-[11px] leading-relaxed italic bg-gray-50/80 dark:bg-slate-800/40 p-2 rounded-lg">
                                      &quot;{submission.notes}&quot;
                                    </p>
                                  )}
                                </div>

                                {(submission.submission_url || submission.file_path) && (
                                  <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                                    {submission.submission_url && (
                                      <a
                                        href={safeExternalUrl(submission.submission_url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] flex items-center gap-1.5 transition border border-indigo-200/60 dark:border-indigo-900/60"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Open Deliverable URL</span>
                                      </a>
                                    )}
                                    {submission.file_path && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenSubmissionFile(submission.file_path)}
                                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition"
                                      >
                                        <FileText className="w-3 h-3" />
                                        <span>Attached Deliverable</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5">
                                  {intern?.id && (
                                    <button
                                      type="button"
                                      onClick={() => openDirectChatWithUser(intern.id)}
                                      className="px-2.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                                      title={`Chat with ${intern?.full_name || 'intern'} in workspace chat`}
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>Chat with Student</span>
                                    </button>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => task && setReviewModal(task)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  <span>{isApproved ? "Re-evaluate Grade" : "Review & Grade"}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Submissions Pagination */}
                    <Pagination
                      currentPage={safeTaskSubmissionsPage}
                      totalItems={totalTaskSubmissions}
                      rowsPerPage={taskSubmissionsRowsPerPage}
                      onPageChange={setTaskSubmissionsPage}
                      onRowsPerPageChange={(n) => {
                        setTaskSubmissionsRowsPerPage(n);
                        setTaskSubmissionsPage(1);
                      }}
                      rowsPerPageOptions={[6, 10, 20, 50]}
                      itemName="submissions"
                    />
                  </div>
                </div>
              )}

              {/* 4.6. DEDICATED AT-RISK INTERN WATCHLIST */}
              {activeSection === "at_risk_watchlist" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className={`p-4 rounded-2xl border ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                        <span>Supervised Interns</span>
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                        {profiles.filter((p) => p.role === "intern" && ownedBatchIds.has(p.batch_id)).length}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Total trainees under mentorship</div>
                    </div>

                    <div
                      onClick={() => setAtRiskTab("critical")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${atRiskTab === "critical" ? "border-red-500 ring-2 ring-red-500/20" : "hover:border-red-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-red-600">
                        <span>Critical Risk</span>
                        <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-red-600">
                        {mentorAtRiskMembers.filter((m) => m.riskLevel === "critical").length}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Att &lt; 70% or 2+ overdue tasks</div>
                    </div>

                    <div
                      onClick={() => setAtRiskTab("warning")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${atRiskTab === "warning" ? "border-amber-500 ring-2 ring-amber-500/20" : "hover:border-amber-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-600">
                        <span>Warning Level</span>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-amber-600">
                        {mentorAtRiskMembers.filter((m) => m.riskLevel === "warning").length}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Att &lt; 85% or 1 overdue task</div>
                    </div>

                    <div
                      onClick={() => setAtRiskTab("all")}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${atRiskTab === "all" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "hover:border-emerald-300"
                        } ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-600">
                        <span>Healthy Standing</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-emerald-600">
                        {Math.max(0, profiles.filter((p) => p.role === "intern" && ownedBatchIds.has(p.batch_id)).length - mentorAtRiskMembers.length)}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Satisfactory attendance & progress</div>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className={`p-4 rounded-2xl border ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}>
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-bold">
                      <button
                        onClick={() => setAtRiskTab("all")}
                        className={`px-3 py-1.5 rounded-lg transition ${atRiskTab === "all" ? "bg-white dark:bg-slate-700 text-red-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        All Watchlist ({mentorAtRiskMembers.length})
                      </button>
                      <button
                        onClick={() => setAtRiskTab("critical")}
                        className={`px-3 py-1.5 rounded-lg transition ${atRiskTab === "critical" ? "bg-white dark:bg-slate-700 text-red-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Critical ({mentorAtRiskMembers.filter((m) => m.riskLevel === "critical").length})
                      </button>
                      <button
                        onClick={() => setAtRiskTab("warning")}
                        className={`px-3 py-1.5 rounded-lg transition ${atRiskTab === "warning" ? "bg-white dark:bg-slate-700 text-amber-600 shadow-xs" : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                          }`}
                      >
                        Warning ({mentorAtRiskMembers.filter((m) => m.riskLevel === "warning").length})
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 flex-1 max-w-md">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search intern name, email, phone, batch..."
                          value={atRiskSearch}
                          onChange={(e) => setAtRiskSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-red-600 text-gray-900 dark:text-white"
                        />
                      </div>

                      <select
                        value={atRiskBatchFilter}
                        onChange={(e) => setAtRiskBatchFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-red-600 text-gray-700 dark:text-slate-200"
                      >
                        <option value="all">All Batches</option>
                        {ownedBatches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Intern Cards Grid */}
                  {filteredAtRiskMembers.length === 0 ? (
                    <div className={`p-8 text-center rounded-2xl border ${isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"} flex flex-col items-center gap-2`}>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">All Supervised Interns On Track</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm">
                        No interns currently meet at-risk criteria in this filter. Everyone has regular attendance and tasks are on schedule.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedAtRiskMembers.map((member) => {
                        const batch = batches.find((b) => b.id === member.batch_id);

                        return (
                          <div
                            key={member.id}
                            className={`p-4 rounded-2xl border ${member.riskLevel === "critical"
                              ? "border-red-300 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/15"
                              : "border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/15"
                              } shadow-sm space-y-3.5`}
                          >
                            {/* Intern Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shrink-0 ${member.riskLevel === "critical"
                                  ? "bg-red-100 dark:bg-red-950 text-red-600"
                                  : "bg-amber-100 dark:bg-amber-950 text-amber-600"
                                  }`}>
                                  {member.avatar_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    (member.full_name || "I")[0]?.toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                    {member.full_name}
                                  </div>
                                  <div className="text-[11px] text-gray-400 truncate">
                                    {member.email} {member.phone ? `• ${member.phone}` : ""}
                                  </div>
                                  <div className="mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300">
                                      {batch?.name || "Unassigned Batch"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase shrink-0 ${member.riskLevel === "critical"
                                ? "bg-red-500/15 text-red-600 border border-red-500/30 animate-pulse"
                                : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                                }`}>
                                {member.riskLevel === "critical" ? "Critical Risk" : "Warning Level"}
                              </span>
                            </div>

                            {/* Signals: Attendance & Overdue Tasks */}
                            <div className="grid grid-cols-2 gap-2.5">
                              {/* Attendance Signal */}
                              <div className="p-2.5 rounded-xl bg-white dark:bg-transparent border border-gray-200/80 dark:border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-gray-400 font-semibold">Attendance</span>
                                  <span className={`font-bold ${member.attendanceRate < 70 ? "text-red-600" : "text-amber-600"
                                    }`}>
                                    {member.attendanceRate}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${member.attendanceRate < 70 ? "bg-red-500" : "bg-amber-500"
                                      }`}
                                    style={{ width: `${Math.max(5, Math.min(100, member.attendanceRate))}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {member.attendanceRate < 70 ? "Under 70% threshold" : "Under 85% recommended"}
                                </div>
                              </div>

                              {/* Overdue Tasks Signal */}
                              <div className="p-2.5 rounded-xl bg-white dark:bg-transparent border border-gray-200/80 dark:border-slate-800 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-gray-400 font-semibold">Overdue Tasks</span>
                                  <span className={`font-bold ${member.overdueCount > 0 ? "text-red-600" : "text-emerald-600"
                                    }`}>
                                    {member.overdueCount}
                                  </span>
                                </div>
                                <div className="text-[10.5px] text-gray-600 dark:text-slate-300 line-clamp-2">
                                  {member.overdueTasks?.length > 0 ? (
                                    member.overdueTasks.map((t) => t.title).join(", ")
                                  ) : (
                                    "No overdue tasks pending"
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Intervention Buttons */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-slate-800/80">
                              <div className="flex items-center gap-1.5">
                                {member.phone && (
                                  <button
                                    type="button"
                                    onClick={() => handleDirectWhatsapp(
                                      member.phone,
                                      member.full_name,
                                      `Hi ${member.full_name}, this is your mentor from TexWeb Solution. I noticed your attendance is at ${member.attendanceRate}% and there are ${member.overdueCount} pending tasks. Let's discuss how to get you back on track.`
                                    )}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                                    title="Intervene via WhatsApp"
                                  >
                                    <WhatsAppIcon className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openDirectChatWithUser(member.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                  title="Send Direct Workspace Message"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                                  <span>Chat</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedMemberModal(member)}
                                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-red-400 text-gray-700 dark:text-slate-200 hover:text-red-600 font-bold text-xs transition cursor-pointer"
                              >
                                Inspect Profile
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* At-Risk Members Pagination */}
                  <Pagination
                    currentPage={safeAtRiskPage}
                    totalItems={totalAtRiskItems}
                    rowsPerPage={atRiskRowsPerPage}
                    onPageChange={setAtRiskPage}
                    onRowsPerPageChange={(n) => {
                      setAtRiskRowsPerPage(n);
                      setAtRiskPage(1);
                    }}
                    rowsPerPageOptions={[6, 10, 20, 50]}
                    itemName="interns"
                  />
                </div>
              )}

              {/* 5. Main Data Table (for all list sections, plus admin overview) */}
              {activeSection !== "alerts" && activeSection !== "chat" && activeSection !== "settings" && activeSection !== "batch_workspace" && activeSection !== "batch_files" && activeSection !== "review_center" && activeSection !== "task_submissions" && activeSection !== "at_risk_watchlist" && (activeSection !== "overview" || isAdminRole) && (
                <div className="space-y-3 w-full max-w-full">
                  {/* Table header meta & horizontal scroll helper */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-slate-400 px-1 select-none">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">
                      Showing {paginatedRecords.length} of {totalRecords} {activeSection === "crm" ? "leads" : activeSection === "batches" ? "batches" : activeSection === "daily_updates" ? "daily updates" : activeSection === "members" ? "members" : "records"}
                    </span>
                    <span className="inline-flex xl:hidden items-center gap-1 font-mono text-[10.5px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200/70 dark:border-red-900/50 px-2.5 py-1 rounded-lg shadow-2xs">
                      <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0 animate-pulse" />
                      Scroll to view all columns
                    </span>
                  </div>

                  <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 bg-transparent dark:bg-transparent shadow-none overflow-hidden">
                    <div className="table-scroll w-full max-w-full overflow-x-auto pb-1">
                      <table className="w-full min-w-[1080px] sm:min-w-[1160px] text-left text-xs border-collapse whitespace-nowrap">
                        <thead className="bg-transparent dark:bg-transparent border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-bold text-[10.5px] uppercase tracking-wider whitespace-nowrap">
                          <tr className="whitespace-nowrap">
                            <th className="py-3.5 px-4 w-12 text-center">#</th>
                            {activeSection === "crm" ? (
                              <>
                                <th className="py-3.5 px-4">Client Name</th>
                                <th className="py-3.5 px-4">Contact</th>
                                <th className="py-3.5 px-4">Service</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                              </>
                            ) : activeSection === "members" || activeSection === "hr_mentors" || activeSection === "hr_interns" || (activeSection === "overview" && isAdminRole) ? (
                              <>
                                <th className="py-3.5 px-4">Full Name & Email</th>
                                <th className="py-3.5 px-4">Department</th>
                                <th className="py-3.5 px-4">{activeSection === "hr_mentors" ? "Batch" : "Batch & Mentor"}</th>
                                <th className="py-3.5 px-4">Role</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                              </>
                            ) : activeSection === "batches" ? (
                              <>
                                <th className="py-2.5 px-2.5">Batch Name</th>
                                <th className="py-2.5 px-2.5">Department</th>
                                <th className="py-2.5 px-2.5">Assigned HR</th>
                                <th className="py-2.5 px-2.5">Mentor & TL</th>
                                <th className="py-2.5 px-2.5">Start Date</th>
                                <th className="py-2.5 px-2 text-center">Status</th>
                                <th className="py-2.5 px-2.5 text-right">Actions</th>
                              </>
                            ) : activeSection === "daily_updates" ? (
                              <>
                                <th className="py-3.5 px-4">Member</th>
                                <th className="py-3.5 px-4">Task / Batch</th>
                                <th className="py-3.5 px-4">Progress</th>
                                <th className="py-3.5 px-4">Blockers</th>
                                <th className="py-3.5 px-4">TL/Mentor Comment</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                              </>
                            ) : activeSection === "cms" ? (
                              <>
                                <th className="py-3.5 px-4">Content Block</th>
                                <th className="py-3.5 px-4">Description</th>
                                <th className="py-3.5 px-4">Button</th>
                                <th className="py-3.5 px-4">Updated</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                              </>
                            ) : activeSection === "classes" ? (
                              <>
                                <th className="py-3.5 px-4">Session Title</th>
                                <th className="py-3.5 px-4">Topic</th>
                                <th className="py-3.5 px-4">Scheduled Date & Time</th>
                                <th className="py-3.5 px-4">Platform</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Join Link</th>
                              </>
                            ) : activeSection === "attendance" ? (
                              <>
                                <th className="py-3.5 px-4">Team Member</th>
                                <th className="py-3.5 px-4">Department</th>
                                <th className="py-3.5 px-4">Batch</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Verification</th>
                              </>
                            ) : activeSection === "certificates" ? (
                              <>
                                <th className="py-3.5 px-4">Candidate Name</th>
                                <th className="py-3.5 px-4">Department</th>
                                <th className="py-3.5 px-4">Certificate Code</th>
                                <th className="py-3.5 px-4">Grade</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Verify</th>
                              </>
                            ) : activeSection === "audit" ? (
                              <>
                                <th className="py-3.5 px-4">User</th>
                                <th className="py-3.5 px-4">Action</th>
                                <th className="py-3.5 px-4">Summary</th>
                                <th className="py-3.5 px-4">Date & Time</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Source</th>
                              </>
                            ) : (
                              <>
                                <th className="py-3.5 px-4">Task Title</th>
                                <th className="py-3.5 px-4">Department</th>
                                <th className="py-3.5 px-4">Assigned To</th>
                                <th className="py-3.5 px-4">Reference</th>
                                <th className="py-3.5 px-4">Deadline</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {/* SECTION: TASKS */}
                          {activeSection === "tasks" && !isAdminRole &&
                            paginatedRecords.map((t, idx) => (
                              <tr key={t.id || idx} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition-colors max-w-[140px] truncate block" title={t.title}>
                                    {t.title}
                                  </div>
                                  <div className="text-[11px] text-gray-400 dark:text-slate-400 font-normal max-w-[150px] truncate block mt-0.5" title={t.description}>
                                    {t.description}
                                  </div>
                                  {latestDailyUpdateByTaskId.get(t.id) && (
                                    <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold max-w-[180px] truncate mt-1" title={latestDailyUpdateByTaskId.get(t.id)?.summary}>
                                      Update: {latestDailyUpdateByTaskId.get(t.id)?.summary}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50/90 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/70 dark:border-red-500/20 shadow-2xs max-w-[130px] min-w-0" title={domainLabel(t.domain)}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <span className="truncate block">{domainLabel(t.domain)}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2 max-w-[130px] min-w-0">
                                    <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-700">
                                      {(t.assigned_to_profile?.full_name || "B")[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate block min-w-0" title={t.assigned_to_profile?.full_name || "Whole Batch"}>
                                      {t.assigned_to_profile?.full_name || "Whole Batch"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 max-w-[150px]">
                                    {t.reference_url ? (
                                      <a href={safeExternalUrl(t.reference_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                                        <ExternalLink className="w-3 h-3" />
                                        <span>URL</span>
                                      </a>
                                    ) : null}
                                    {t.file_name ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 truncate" title={t.file_name}>
                                        <FileText className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{t.file_name}</span>
                                      </span>
                                    ) : null}
                                    {!t.reference_url && !t.file_name ? <span className="text-gray-400 text-[11px]">-</span> : null}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 max-w-[130px] truncate block">
                                    <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                                    <span className="truncate">{localDate(t.deadline)}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10.5px] font-bold uppercase tracking-wider border shadow-2xs ${t.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" :
                                    t.status === "reviewed" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" :
                                      t.status === "submitted" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" :
                                        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === "approved" ? "bg-emerald-500 animate-pulse" :
                                      t.status === "reviewed" ? "bg-blue-500" :
                                        t.status === "submitted" ? "bg-purple-500" :
                                          "bg-amber-500"
                                      }`} />
                                    {t.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {canReviewTask(t) && (
                                      <button
                                        onClick={() => setReviewModal(t)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-gray-200/80 dark:border-slate-700"
                                      >
                                        <CheckSquare className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                                        <span>Review</span>
                                      </button>
                                    )}
                                    {canSendDailyTaskUpdate(t) && (
                                      <button
                                        onClick={() => setSubmissionModal(t.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95 cursor-pointer"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Submit</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setTaskDetailsModal(t)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-gray-200/80 dark:border-slate-700"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                                      <span>Details</span>
                                    </button>
                                    {canCommentDailyUpdate(latestDailyUpdateByTaskId.get(t.id)) && (
                                      <button
                                        onClick={() => {
                                          const update = latestDailyUpdateByTaskId.get(t.id);
                                          setDailyCommentModal(update);
                                          setDailyCommentText(update?.reviewer_comment || "");
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer border border-blue-200 dark:border-blue-800"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Comment</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}

                          {/* SECTION: DAILY UPDATES */}
                          {activeSection === "daily_updates" &&
                            paginatedRecords.map((update, idx) => {
                              const updateTl = update.tl || profiles.find((p) => p.id === update.tl_id);
                              const updateBatch = update.batch || batches.find((b) => b.id === update.batch_id);
                              const updateTask = update.task || tasks.find((t) => t.id === update.task_id);
                              const hasReviewed = Boolean(update.reviewer_comment);

                              return (
                                <tr key={update.id || idx} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                  <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
                                        {(updateTl?.full_name || "T")[0]?.toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition-colors max-w-[130px] truncate block" title={updateTl?.full_name || "Team Leader"}>
                                          {updateTl?.full_name || "Team Leader"}
                                        </div>
                                        <div className="text-[10.5px] text-amber-600 dark:text-amber-400 font-medium max-w-[130px] truncate block mt-0.5">
                                          {updateTl?.role === "team_leader" ? "Team Leader" : "Member Report"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="space-y-0.5">
                                      {updateBatch && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-w-[140px] truncate block" title={updateBatch.name}>
                                          <Folder className="w-3 h-3 text-red-500 shrink-0" />
                                          <span className="truncate block">{updateBatch.name}</span>
                                        </span>
                                      )}
                                      <div className="text-[11px] text-gray-500 dark:text-slate-400 max-w-[140px] truncate" title={updateTask?.title || update.assigned_tasks || "Daily Standup"}>
                                        {updateTask?.title || update.assigned_tasks || "Daily Standup"}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="max-w-[190px]">
                                      <p className="text-xs text-gray-800 dark:text-slate-200 font-medium truncate" title={update.summary}>
                                        {update.summary}
                                      </p>
                                      {(update.completed_count > 0 || update.pending_count > 0) && (
                                        <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                                          <span className="text-emerald-600 font-semibold">Done: {update.completed_count || 0}</span>
                                          <span>•</span>
                                          <span className="text-amber-600 font-semibold">Pending: {update.pending_count || 0}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {update.blockers ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 max-w-[160px] truncate block" title={update.blockers}>
                                        <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                                        <span className="truncate block">{update.blockers}</span>
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-xs">-</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {hasReviewed ? (
                                      <div className="max-w-[160px]">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          Reviewed
                                        </span>
                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5" title={update.reviewer_comment}>
                                          &quot;{update.reviewer_comment}&quot;
                                        </p>
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse shadow-2xs">
                                        <Clock className="w-3 h-3" />
                                        Pending Review
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className="font-mono text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-gray-400" />
                                      {localDate(update.created_at)}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {canCommentDailyUpdate(update) && (
                                        <button
                                          onClick={() => {
                                            setDailyCommentModal(update);
                                            setDailyCommentText(update.reviewer_comment || "");
                                          }}
                                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95 cursor-pointer"
                                          title="Review and provide feedback"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>{hasReviewed ? "Edit Feedback" : "Review"}</span>
                                        </button>
                                      )}
                                      {updateTl?.phone && (
                                        <button
                                          onClick={() => handleDirectWhatsapp(updateTl.phone, updateTl.full_name, `Hi ${updateTl.full_name}, regarding your daily report for ${updateBatch?.name || "batch"}...`)}
                                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-lg transition"
                                          title="WhatsApp Team Leader"
                                        >
                                          <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}

                          {/* SECTION: CRM LEADS */}
                          {activeSection === "crm" &&
                            paginatedRecords.map((lead, idx) => (
                              <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                  <div className="max-w-[130px] truncate block" title={lead.full_name}>{lead.full_name}</div>
                                  <div className="text-[11px] text-gray-400 font-normal max-w-[130px] truncate block" title={lead.email}>{lead.email}</div>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                                  <span className="max-w-[120px] truncate block" title={lead.phone || "-"}>{lead.phone || "-"}</span>
                                </td>
                                <td className="py-3.5 px-4 text-red-600 font-semibold whitespace-nowrap">
                                  <span className="max-w-[130px] truncate block" title={lead.service_interest}>{lead.service_interest}</span>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">{localDate(lead.created_at)}</td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <span className="px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                                    {lead.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => handleSendWhatsapp(lead)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow-md hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                                    title="Chat on WhatsApp"
                                  >
                                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                                    <span>WhatsApp</span>
                                  </button>
                                </td>
                              </tr>
                            ))}

                          {/* SECTION: MEMBERS or OVERVIEW (Admin) */}
                          {((activeSection === "members" || activeSection === "hr_mentors" || activeSection === "hr_interns") || (activeSection === "overview" && isAdminRole)) &&
                            paginatedRecords.map((m, idx) => (
                              <tr key={m.id} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    {m.avatar_url ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img
                                        src={m.avatar_url}
                                        alt={m.full_name || "Profile"}
                                        className="w-8 h-8 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10 shrink-0 shadow-2xs"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
                                        {m.full_name?.charAt(0)?.toUpperCase() || "U"}
                                      </div>
                                    )}
                                    <div className="min-w-0 cursor-pointer" onClick={() => setSelectedMemberModal(m)}>
                                      <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition-colors max-w-[130px] truncate block" title={m.full_name}>
                                        {m.full_name}
                                      </div>
                                      <div className="text-[11px] text-gray-400 dark:text-slate-400 font-normal max-w-[130px] truncate block mt-0.5" title={m.email}>
                                        {m.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50/90 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/70 dark:border-red-500/20 shadow-2xs max-w-[130px] min-w-0" title={domainLabel(m.domain)}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <span className="truncate block">{domainLabel(m.domain)}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {m.batch_id ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-2xs max-w-[120px] min-w-0" title={m.batch_name || "Assigned Batch"}>
                                      <Folder className="w-3 h-3 text-red-500 shrink-0" />
                                      <span className="truncate block">{m.batch_name || "Assigned Batch"}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-gray-400 dark:text-slate-500 bg-gray-100/60 dark:bg-slate-800/60 border border-dashed border-gray-200 dark:border-slate-700">
                                      Unassigned
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.8 rounded-lg text-[11px] font-bold border shadow-2xs max-w-[110px] truncate ${m.role === "super_admin" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900" :
                                    m.role === "hr" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900" :
                                      m.role === "mentor" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900" :
                                        m.role === "team_leader" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900" :
                                          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                                    }`} title={ROLE_LABELS[m.role] || m.role}>
                                    <span className="truncate">{ROLE_LABELS[m.role] || m.role}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10.5px] font-bold uppercase tracking-wider border shadow-2xs ${m.status === "paused" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" :
                                    m.status === "suspended" ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" :
                                      m.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" :
                                        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.status === "paused" ? "bg-amber-500" :
                                      m.status === "suspended" ? "bg-rose-500" :
                                        m.status === "completed" ? "bg-blue-500" :
                                          "bg-emerald-500 animate-pulse"
                                      }`} />
                                    {m.status || "active"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                    <button
                                      onClick={() => setSelectedMemberModal(m)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-gray-200/80 dark:border-slate-700"
                                      title="View Full Member Profile"
                                    >
                                      <User className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                                      <span>Profile</span>
                                    </button>
                                    {isMentor && m.role === "intern" && (
                                      <button
                                        onClick={() => handlePromoteInternToTl(m)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-amber-200 dark:border-amber-800"
                                        title="Make this intern the Team Leader for their batch"
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>Make TL</span>
                                      </button>
                                    )}
                                    {canManageCredentials && (
                                      <button
                                        onClick={() => openEditMemberModal(m)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-gray-200/80 dark:border-slate-700"
                                        title="Edit Member Details"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                                        <span>Edit</span>
                                      </button>
                                    )}
                                    {!isMentor && (
                                      <button
                                        onClick={() => handleSendWhatsapp(m)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow-md hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                                        title="Send WhatsApp Login Details"
                                      >
                                        <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                                        <span>WhatsApp</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}

                          {/* SECTION: BATCHES */}
                          {activeSection === "batches" &&
                            paginatedRecords.map((b, idx) => {
                              const assignedHr = resolveBatchLead(b, "hr");
                              const assignedMentor = resolveBatchLead(b, "mentor");
                              const assignedTl = resolveBatchLead(b, "team_leader");
                              return (
                                <tr key={b.id} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                  <td className="py-2.5 px-2 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                                    <div className="flex items-center gap-2 whitespace-nowrap min-w-0 max-w-[150px]">
                                      <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 flex items-center justify-center shrink-0">
                                        <Folder className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                      </div>
                                      <span className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition-colors max-w-[120px] truncate block" title={b.name}>
                                        {b.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap bg-red-50/90 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/70 dark:border-red-500/20 shadow-2xs max-w-[130px] min-w-0" title={domainLabel(b.domain)}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                      <span className="truncate block">{b.domain === "web_dev" ? "Web Development" : domainLabel(b.domain)}</span>
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                                    {assignedHr ? (
                                      <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0 max-w-[130px]" title={assignedHr.email ? `${assignedHr.full_name} (${assignedHr.email})` : assignedHr.full_name}>
                                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[10.5px] font-bold flex items-center justify-center shrink-0">
                                          {assignedHr.full_name?.charAt(0)?.toUpperCase() || "H"}
                                        </div>
                                        <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1 min-w-0">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                          <span className="truncate block">{assignedHr.full_name}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                                        Unassigned
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap max-w-[160px] min-w-0">
                                      <span className="text-gray-400 font-medium shrink-0">Mentor:</span>
                                      <span className="font-semibold text-gray-800 dark:text-slate-200 max-w-[50px] truncate inline-block align-middle" title={assignedMentor?.full_name || "None"}>
                                        {assignedMentor?.full_name?.split(" ")[0] || assignedMentor?.full_name || "None"}
                                      </span>
                                      <span className="text-gray-300 dark:text-slate-600 shrink-0">·</span>
                                      <span className="text-gray-400 font-medium shrink-0">TL:</span>
                                      <span className="font-semibold text-gray-800 dark:text-slate-200 max-w-[50px] truncate inline-block align-middle" title={assignedTl?.full_name || "None"}>
                                        {assignedTl?.full_name?.split(" ")[0] || assignedTl?.full_name || "None"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono whitespace-nowrap text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 max-w-[120px] truncate" title={b.starts_at || "Immediate"}>
                                      <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                                      <span className="truncate">{b.starts_at || "Immediate"}</span>
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs whitespace-nowrap ${b.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" :
                                      b.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" :
                                        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                      }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.status === "active" ? "bg-emerald-500 animate-pulse" :
                                        b.status === "completed" ? "bg-blue-500" : "bg-amber-500"
                                        }`} />
                                      {b.status || "active"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                      <button
                                        onClick={() => openBatchWorkspace(b.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-gray-200/80 dark:border-slate-700"
                                        title="Open batch workspace"
                                      >
                                        <LayoutDashboard className="w-3 h-3 text-red-600 dark:text-red-400" />
                                        <span>Workspace</span>
                                      </button>
                                      {isAdminRole && (
                                        <button
                                          onClick={() => handleToggleBatchStatus(b)}
                                          className={`inline-flex items-center gap-1 px-2.5 py-1 font-bold rounded-lg text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border ${b.status === "paused"
                                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                            : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                            }`}
                                          title={b.status === "paused" ? "Resume Batch" : "Pause Batch (Close/Hold)"}
                                        >
                                          {b.status === "paused" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                          <span>{b.status === "paused" ? "Resume" : "Pause"}</span>
                                        </button>
                                      )}
                                      {isAdminRole ? (
                                        <button
                                          onClick={() => openEditBatch(b)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-lg text-xs transition-all shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95 cursor-pointer"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                          <span>Edit</span>
                                        </button>
                                      ) : isHrRole || isMentor ? (
                                        <button
                                          onClick={() => openAssignLeads(b)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-lg text-xs transition-all shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95 cursor-pointer"
                                        >
                                          <Users className="w-3 h-3" />
                                          <span>{isHrRole ? "Assign Mentor" : "Assign TL"}</span>
                                        </button>
                                      ) : (
                                        <span className="text-gray-400 text-xs font-mono">Cohort #{startIndex + idx + 1}</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}

                          {/* SECTION: CMS */}
                          {activeSection === "cms" &&
                            paginatedRecords.map((c, idx) => (
                              <tr key={c.id || c.key} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition-colors max-w-[140px] truncate block" title={c.content_json?.title || "Untitled"}>
                                        {c.content_json?.title || "Untitled"}
                                      </div>
                                      <div className="text-[10.5px] text-red-600 dark:text-red-400 font-mono max-w-[110px] truncate block" title={c.key}>{c.key}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-slate-400 max-w-[150px] truncate block whitespace-nowrap" title={c.content_json?.subtitle || "-"}>
                                  {c.content_json?.subtitle || "-"}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 max-w-[100px] truncate block" title={c.content_json?.cta || "Standard CTA"}>
                                    <span className="truncate block">{c.content_json?.cta || "Standard CTA"}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="font-mono text-[11px] text-gray-400 dark:text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    {localDate(c.updated_at)}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                    PUBLISHED
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => openCmsEditor(c)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-gray-200/80 dark:border-slate-700"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                                    <span>Edit Block</span>
                                  </button>
                                </td>
                              </tr>
                            ))}

                          {/* SECTION: CLASSES */}
                          {activeSection === "classes" &&
                            paginatedRecords.map((m, idx) => (
                              <tr key={m.id || idx} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0">
                                      <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition-colors max-w-[140px] truncate block" title={m.title}>
                                      {m.title}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 max-w-[120px] truncate block" title={m.topic}>
                                    <span className="truncate block">{m.topic}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                                    <Calendar className="w-3 h-3 text-red-500 shrink-0" />
                                    {localDate(m.scheduled_at)}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    {m.attendee_id ? "1:1 Meet" : "Batch Meet"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 uppercase tracking-wider shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                                    SCHEDULED
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {canScheduleMeetings && m.batch_id && (
                                      <button
                                        onClick={() => copyAttendanceLink(m)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer border border-emerald-200 dark:border-emerald-800"
                                        title="Copy secure self-attendance link"
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Attendance</span>
                                      </button>
                                    )}
                                    <a
                                      href={safeExternalUrl(m.meeting_link)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95 cursor-pointer"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                      <span>Join</span>
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}

                          {/* SECTION: ATTENDANCE */}
                          {activeSection === "attendance" &&
                            paginatedRecords.map((a, idx) => (
                              <tr key={a.id} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-700">
                                      {(a.user?.full_name || "M")[0]?.toUpperCase()}
                                    </div>
                                    <span className="font-bold text-xs text-gray-900 dark:text-white max-w-[120px] truncate block" title={a.user?.full_name || "Member"}>
                                      {a.user?.full_name || "Member"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50/90 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/70 dark:border-red-500/20 shadow-2xs max-w-[120px] min-w-0" title={domainLabel(a.domain)}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <span className="truncate block">{domainLabel(a.domain)}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-w-[110px] min-w-0" title={a.batch?.name || "Cohort"}>
                                    <Folder className="w-3 h-3 text-red-500 shrink-0" />
                                    <span className="truncate block">{a.batch?.name || "Cohort"}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="font-mono text-[11px] text-gray-600 dark:text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    {a.attendance_date}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10.5px] font-bold uppercase tracking-wider border shadow-2xs ${a.status === "present" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" :
                                    a.status === "late" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" :
                                      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.status === "present" ? "bg-emerald-500 animate-pulse" :
                                      a.status === "late" ? "bg-amber-500" : "bg-rose-500"
                                      }`} />
                                    {a.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 max-w-[140px] truncate block" title={`Verified by ${a.marker?.full_name || "Lead"}`}>
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span className="truncate block">Verified by {a.marker?.full_name || "Lead"}</span>
                                  </span>
                                </td>
                              </tr>
                            ))}

                          {/* SECTION: CERTIFICATES */}
                          {activeSection === "certificates" &&
                            paginatedRecords.map((c, idx) => (
                              <tr key={c.id || c.certificate_code} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
                                      {c.intern_name?.charAt(0)?.toUpperCase() || "C"}
                                    </div>
                                    <span className="font-bold text-xs text-gray-900 dark:text-white max-w-[120px] truncate block" title={c.intern_name}>
                                      {c.intern_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50/90 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/70 dark:border-red-500/20 shadow-2xs max-w-[120px] min-w-0" title={c.domain}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <span className="truncate block">{c.domain}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 shadow-2xs max-w-[120px] truncate block" title={c.certificate_code}>
                                    <Award className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                    <span className="truncate block">{c.certificate_code}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.8 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                                    Grade: {c.performance_grade || "A+"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 uppercase tracking-wider shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    VERIFIED
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <Link
                                    href={`/verify/${c.certificate_code}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-gray-200/80 dark:border-slate-700"
                                  >
                                    <span>Verify</span>
                                    <ExternalLink className="w-3 h-3 text-gray-400" />
                                  </Link>
                                </td>
                              </tr>
                            ))}

                          {/* SECTION: AUDIT */}
                          {activeSection === "audit" &&
                            paginatedRecords.map((a, idx) => {
                              const sourceColor =
                                a.source === "Website"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900"
                                  : a.source === "Website CMS"
                                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900"
                                  : a.source === "Portal"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                                  : a.source === "Auth"
                                  ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900"
                                  : a.source === "Batches"
                                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                                  : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

                              return (
                                <tr key={a.id || idx} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                                  <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-700">
                                        {(a.actor?.full_name || "S")[0]?.toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="font-bold text-xs text-gray-900 dark:text-white max-w-[130px] truncate block" title={a.actor?.full_name || "System"}>
                                          {a.actor?.full_name || "System"}
                                        </span>
                                        <span className="text-[10.5px] text-gray-400 dark:text-slate-500 capitalize block">
                                          {ROLE_LABELS[a.actor_role || a.actor?.role] || a.actor_role || "User"}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-0.8 rounded-md font-mono text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/60 dark:border-red-500/20 max-w-[130px] truncate block" title={a.action}>
                                      <span className="truncate block">{(a.action || "activity").replaceAll("_", " ")}</span>
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-xs text-gray-700 dark:text-slate-300 max-w-[340px] truncate block whitespace-nowrap" title={a.summary}>
                                    {a.summary}
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className="font-mono text-[11px] text-gray-400 dark:text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                      {localDate(a.created_at)}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 uppercase tracking-wider shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                      RECORDED
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.8 rounded-md text-[10.5px] font-bold border ${sourceColor}`}>
                                      {a.source || "System"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                    {/* Table Pagination Bar */}
                    <Pagination
                      currentPage={safePage}
                      totalItems={totalRecords}
                      rowsPerPage={rowsPerPage}
                      onPageChange={setCurrentPage}
                      onRowsPerPageChange={setRowsPerPage}
                      rowsPerPageOptions={[5, 10, 20, 50, 100]}
                      itemName={activeSection === "crm" ? "leads" : activeSection === "classes" ? "sessions" : activeSection}
                    />
                  </div>
                </div>
              )}

              {/* Section Empty Check */}
              {activeSection !== "alerts" && activeSection !== "chat" && activeSection !== "settings" && activeSection !== "batch_workspace" && activeSection !== "batch_files" && activeSection !== "review_center" && activeSection !== "task_submissions" && activeSection !== "at_risk_watchlist" && (activeSection !== "overview" || isAdminRole) && totalRecords === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs">No records found in this section.</div>
              )}
            </div>
          </main>
        </div>
      ) : (
        /* Sign In Screen (When Logged Out) with Official Website Navbar & Footer */
        <div className="min-h-screen flex flex-col justify-between no-scrollbar">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-4 py-16 sm:py-20">
            <div
              className={`w-full max-w-sm p-6 sm:p-8 rounded-2xl border shadow-xl transition-colors ${isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
                }`}
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <Image
                    width={170}
                    height={48}
                    alt="TexWeb Solution Logo"
                    src="/texweb-full-logo-original.png"
                    className="h-11 w-auto max-w-[180px] object-contain"
                    style={{ width: "auto" }}
                    priority
                  />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">Enterprise Portal</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Unified Workspace Management Portal</p>
              </div>

              {authMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold mb-4 border ${authMessage.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"
                  }`}>
                  {authMessage.text}
                </div>
              )}

              {authMode === "signin" ? (
                <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Corporate Email ID</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@texwebsolution.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs focus:bg-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold">Password</label>
                      <button type="button" onClick={() => setAuthMode("forgot")} className="text-[11px] text-red-600 hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 pr-10 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs focus:bg-white focus:outline-none focus:border-red-600"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition text-xs sm:text-sm cursor-pointer mt-2"
                  >
                    {loading ? "Authenticating..." : "Sign In to Portal"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Registered Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="name@texwebsolution.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition text-xs">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <div className="text-center pt-2">
                    <button type="button" onClick={() => setAuthMode("signin")} className="text-xs text-gray-400 hover:underline">Back to Login</button>
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      )}

      {/* =========================================================================
          WORKSPACE MODALS
          ========================================================================= */}
      {authMode === "reset" && sessionUser && (
        <ModalWrapper isDark={isDark} title="Set New Password" subtitle="Complete secure setup for your TexWeb workspace account.">
          <form onSubmit={handleUpdateOwnPassword} className="space-y-3 text-xs">
            <InputField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              required
            />
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
              Use at least 12 characters. This replaces the setup link flow, so no reusable temporary password is shared.
            </p>
            {authMessage.text && (
              <p className={`text-[11px] font-semibold ${authMessage.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
                {authMessage.text}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 1. Enroll Member Modal */}
      {newMemberModal && (
        <ModalWrapper
          isDark={isDark}
          title={isAdminRole ? "Create HR Account" : `Create ${memberModalRoleLabel} Account`}
          subtitle={isAdminRole ? "Super Admin can create and manage HR accounts only." : `${memberModalRoleLabel} will be added inside an admin-assigned batch.`}
        >
          <form onSubmit={handleEnrollMember} className="space-y-3 text-xs">
            <InputField label="Full Name" value={memberForm.full_name} onChange={(v) => setMemberForm({ ...memberForm, full_name: v })} required />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="Email ID" type="email" value={memberForm.email} onChange={(v) => setMemberForm({ ...memberForm, email: v })} required />
              <InputField label="WhatsApp Phone" value={memberForm.phone} onChange={(v) => setMemberForm({ ...memberForm, phone: v })} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {isHrRole ? (
                <InputField label="Role Privilege" value={memberModalRoleLabel} onChange={() => { }} />
              ) : (
                <SelectField label="Role Privilege" value={memberForm.role} onChange={(v) => setMemberForm({ ...memberForm, role: v })} options={memberRoleOptions} />
              )}
              {isAdminRole && memberForm.role !== "hr" ? (
                <SelectField label="Department" value={memberForm.domain} onChange={(v) => setMemberForm({ ...memberForm, domain: v })} options={DOMAIN_OPTIONS.map((d) => [d.value, d.label])} />
              ) : isAdminRole ? (
                <InputField label="Department" value="HR Management" onChange={() => { }} />
              ) : (
                <InputField label="Department" value={domainLabel(batches.find((b) => b.id === memberForm.batch_id)?.domain || memberForm.domain)} onChange={() => { }} />
              )}
            </div>
            {isHrRole && (
              <>
                <SelectField label="Batch / Cohort" value={memberForm.batch_id} onChange={(v) => {
                  const selected = batches.find((batch) => batch.id === v);
                  setMemberForm({ ...memberForm, batch_id: v, domain: selected?.domain || "web_dev", assigned_tl_id: "", assigned_mentor_id: "" });
                }} options={[["", "Select assigned batch"], ...batches.map((b) => [b.id, `${b.name} - ${domainLabel(b.domain)}`])]} />
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3 text-[11px] text-gray-500 dark:text-slate-400">
                  HR department batch se auto-fill hoga. Mentor create karne ke baad wahi mentor batch row se interns ko TL assign karega.
                </div>
              </>
            )}
            <InputField label="Internal Initial Password (Not Shared)" value={memberForm.temp_password} onChange={(v) => setMemberForm({ ...memberForm, temp_password: v })} required />
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
              User ko WhatsApp par password nahi bheja jayega. Account create hone ke baad secure setup/reset link share hoga.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setNewMemberModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">{isAdminRole ? "Create HR" : `Create ${memberModalRoleLabel}`}</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 2. Assign Task Modal */}
      {newTaskModal && (
        <ModalWrapper isDark={isDark} title="Assign Work Order Task" subtitle="Select batch, target, and optional references.">
          <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
            <InputField label="Task Title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} required />
            <div>
              <label className="block font-bold mb-1">Description & Requirements</label>
              <textarea rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} required className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:border-red-600" />
            </div>
            {isMentor && (
              <SelectField
                label="Batch"
                value={taskForm.batch_id}
                onChange={(v) => {
                  const selected = ownedBatches.find((batch) => batch.id === v);
                  setTaskForm({ ...taskForm, batch_id: v, domain: selected?.domain || taskForm.domain, assign_target: "", assigned_to: "" });
                }}
                options={[["", "Select batch"], ...ownedBatches.map((batch) => [batch.id, `${batch.name} - ${domainLabel(batch.domain)}`])]}
              />
            )}
            <div className="grid grid-cols-2 gap-2">
              {isMentor ? (
                <InputField label="Domain" value={domainLabel(ownedBatches.find((batch) => batch.id === taskForm.batch_id)?.domain || taskForm.domain)} onChange={() => { }} />
              ) : (
                <SelectField label="Domain" value={taskForm.domain} onChange={(v) => setTaskForm({ ...taskForm, domain: v })} options={DOMAIN_OPTIONS.map((d) => [d.value, d.label])} />
              )}
              <SelectField label="Priority" value={taskForm.priority} onChange={(v) => setTaskForm({ ...taskForm, priority: v })} options={[["low", "Low"], ["medium", "Medium"], ["high", "High"], ["urgent", "Urgent"]]} />
            </div>
            <SelectField
              label="Assign To"
              value={isMentor ? taskForm.assign_target : taskForm.assigned_to}
              onChange={(v) => setTaskForm(isMentor ? { ...taskForm, assign_target: v } : { ...taskForm, assigned_to: v })}
              options={[["", isMentor ? "Select assignee" : "Select intern"], ...taskAssignmentOptions]}
            />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="Start Date" type="date" value={taskForm.start_date} onChange={(v) => setTaskForm({ ...taskForm, start_date: v })} />
              <InputField label="Deadline Date" type="date" value={taskForm.deadline} onChange={(v) => setTaskForm({ ...taskForm, deadline: v })} required />
            </div>
            <div>
              <label className="block font-bold mb-1">Expected Output</label>
              <textarea rows={2} value={taskForm.expected_output} onChange={(e) => setTaskForm({ ...taskForm, expected_output: e.target.value })} className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:border-red-600" />
            </div>
            <InputField label="Reference URL (optional)" type="url" value={taskForm.reference_url} onChange={(v) => setTaskForm({ ...taskForm, reference_url: v })} placeholder="https://..." />
            <div>
              <label className="block font-bold mb-1">Reference File (Image/PDF)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(e) => setTaskForm({ ...taskForm, reference_file: e.target.files?.[0] || null })}
                className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:border-red-600"
              />
              {taskForm.reference_file && <span className="text-[11px] text-emerald-600 mt-1 block">Selected: {taskForm.reference_file.name}</span>}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setNewTaskModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Assign Task</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 3. Schedule Meeting Modal */}
      {newMeetingModal && (
        <ModalWrapper isDark={isDark} title="Schedule Class / Meeting" subtitle="Create live Google Meet session.">
          <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
            <SelectField
              label="Meeting Type"
              value={meetingForm.meeting_type || "daily"}
              onChange={(v) => setMeetingForm({ ...meetingForm, meeting_type: v })}
              options={[
                ["daily", "Daily Standup (Whole batch)"],
                ["batch", "Batch Class / Training (Whole batch)"],
                ["personal", "Personal 1-on-1 (Specific member only)"],
              ]}
            />
            <InputField label="Meeting Title" value={meetingForm.title} onChange={(v) => setMeetingForm({ ...meetingForm, title: v })} required />
            <InputField label="Topic / Agenda" value={meetingForm.topic} onChange={(v) => setMeetingForm({ ...meetingForm, topic: v })} required />
            <InputField label="Google Meet Link" type="url" value={meetingForm.meeting_link} onChange={(v) => setMeetingForm({ ...meetingForm, meeting_link: v })} required />
            <InputField label="Date & Time" type="datetime-local" value={meetingForm.scheduled_at} onChange={(v) => setMeetingForm({ ...meetingForm, scheduled_at: v })} required />
            <SelectField
              label="Batch"
              value={meetingForm.batch_id}
              onChange={(v) => {
                setMeetingForm({ ...meetingForm, batch_id: v, attendee_id: "", attendance_token: meetingForm.attendance_token || createAttendanceToken() });
              }}
              options={[["", "Select batch"], ...(isHrRole || isMentor ? ownedBatches : batches.filter((b) => b.id === userProfile?.batch_id)).map((b) => [b.id, `${b.name} - ${domainLabel(b.domain)}`])]}
            />
            <SelectField label="Attendees" value={meetingForm.attendee_id} onChange={(v) => setMeetingForm({ ...meetingForm, attendee_id: v })} options={[["", "Whole selected batch"], ...meetingTargetProfiles.filter((p) => !meetingForm.batch_id || p.batch_id === meetingForm.batch_id).map((p) => [p.id, `${p.full_name} (${ROLE_LABELS[p.role] || p.role})`])]} />
            <p className="text-[11px] text-gray-500 dark:text-slate-400">
              Attendance link will mark only the logged-in member&apos;s own attendance for this batch.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setNewMeetingModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Schedule Meet</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 4. CMS Editor Modal */}
      {false && cmsModal && (
        <ModalWrapper isDark={isDark} title="Website CMS Block Editor" subtitle="Edit dynamic website copy and JSON schemas.">
          <form onSubmit={handleSaveCmsContent} className="space-y-3 text-xs">
            <SelectField label="Target CMS Key" value={cmsForm.key} onChange={(v) => setCmsForm({ ...cmsForm, key: v })} options={[
              ["homepage.hero", "Homepage Hero"],
              ["homepage.projects", "Homepage Projects"],
              ["about.hero", "About Hero"],
              ["about.services", "About Services"],
              ["about.stats", "About Stats"],
              ["pricing.hero", "Pricing Hero"],
              ["pricing.plans", "Pricing Plans Header"],
              ["pricing.industries", "Pricing Industries"],
              ["pricing.workflow", "Pricing Workflow"],
              ["pricing.comparison", "Pricing Comparison"],
              ["pricing.currencies", "Pricing Currencies"],
              ["pricing.faqs", "Pricing FAQs"],
              ["customized.hero", "Customized Hero"],
              ["customized.projects", "Customized Projects Header"],
              ["customized.websites", "Customized Websites"],
              ["customized.applications", "Customized Applications"],
              ["customized.faqs", "Customized FAQs"],
              ["prebuilt.hero", "Prebuilt Hero"],
              ["prebuilt.products", "Prebuilt Product List"],
              ["prebuilt.detail.slug", "Prebuilt Detail by Slug"],
              ["prebuilt.faqs", "Prebuilt FAQs"],
              ["ai.hero", "AI Hero"],
              ["ai.services", "AI Services"],
              ["ai.faqs", "AI FAQs"],
              ["digital.hero", "Digital Marketing Hero"],
              ["digital.services", "Digital Marketing Services"],
              ["digital.faqs", "Digital Marketing FAQs"],
              ["contact.hero", "Contact Hero"],
              ["contact.faqs", "Contact FAQs"],
              ["download.hero", "Download Hero"],
              ["legal.privacy", "Privacy Page"],
              ["legal.terms", "Terms Page"],
              ["legal.refund", "Refund Page"],
            ]} />
            <InputField label="Title" value={cmsForm.title} onChange={(v) => setCmsForm({ ...cmsForm, title: v })} />
            <InputField label="Subtitle" value={cmsForm.subtitle} onChange={(v) => setCmsForm({ ...cmsForm, subtitle: v })} />
            <div>
              <label className="block font-bold mb-1">Body Text / Copy</label>
              <textarea rows={2} value={cmsForm.body} onChange={(e) => setCmsForm({ ...cmsForm, body: e.target.value })} className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-red-600" />
            </div>
            <InputField label="CTA Button Label" value={cmsForm.cta} onChange={(v) => setCmsForm({ ...cmsForm, cta: v })} />
            <div>
              <label className="block font-bold mb-1">Full JSON Override (optional)</label>
              <textarea rows={2} value={cmsForm.raw_json} onChange={(e) => setCmsForm({ ...cmsForm, raw_json: e.target.value })} className="w-full p-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-red-600" />
            </div>
            <div className={`p-2 rounded border ${cmsPreview.valid ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-600"}`}>
              <div className="font-bold text-[10px]">{cmsPreview.valid ? "✓ JSON Validated" : "✗ JSON Syntax Error"}</div>
              <div className="text-[10px] opacity-80">{cmsPreview.message}</div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setCmsModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" disabled={!cmsPreview.valid || !cmsForm.key.trim()} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Save Block</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 5. Daily Task Update Modal */}
      {dailyUpdateModal && (
        <ModalWrapper isDark={isDark} title="Daily Task Update" subtitle="Share progress for the selected batch task.">
          <form onSubmit={handleCreateDailyUpdate} className="space-y-3 text-xs">
            <InputField label="Task / Assigned Work" value={dailyUpdateForm.assigned_tasks} onChange={(v) => setDailyUpdateForm({ ...dailyUpdateForm, assigned_tasks: v })} required />
            <div>
              <label className="block font-bold mb-1">Today&apos;s Progress</label>
              <textarea rows={3} value={dailyUpdateForm.summary} onChange={(e) => setDailyUpdateForm({ ...dailyUpdateForm, summary: e.target.value })} required className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:border-red-600" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InputField label="Completed Count" type="number" value={dailyUpdateForm.completed_count} onChange={(v) => setDailyUpdateForm({ ...dailyUpdateForm, completed_count: v })} />
              <InputField label="Pending Count" type="number" value={dailyUpdateForm.pending_count} onChange={(v) => setDailyUpdateForm({ ...dailyUpdateForm, pending_count: v })} />
            </div>
            <div>
              <label className="block font-bold mb-1">Completed Details</label>
              <textarea rows={2} value={dailyUpdateForm.completed_tasks} onChange={(e) => setDailyUpdateForm({ ...dailyUpdateForm, completed_tasks: e.target.value })} className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:border-red-600" />
            </div>
            <div>
              <label className="block font-bold mb-1">Pending / Blockers</label>
              <textarea rows={2} value={dailyUpdateForm.blockers} onChange={(e) => setDailyUpdateForm({ ...dailyUpdateForm, blockers: e.target.value })} className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:border-red-600" />
            </div>
            <div>
              <label className="block font-bold mb-1">Next Plan</label>
              <textarea rows={2} value={dailyUpdateForm.tomorrow_plan} onChange={(e) => setDailyUpdateForm({ ...dailyUpdateForm, tomorrow_plan: e.target.value })} className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:border-red-600" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setDailyUpdateModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Send Update</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Daily Update Comment Modal */}
      {dailyCommentModal && (
        <ModalWrapper isDark={isDark} title="Comment Daily Update" subtitle="Guide the member on today's progress.">
          <form onSubmit={handleDailyComment} className="space-y-3 text-xs">
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3">
              <div className="font-bold text-gray-900 dark:text-white">{dailyCommentModal.tl?.full_name || "Team member"}</div>
              <p className="mt-1 text-gray-600 dark:text-slate-300">{dailyCommentModal.summary}</p>
            </div>
            <div>
              <label className="block font-bold mb-1">TL / Mentor Comment</label>
              <textarea rows={3} value={dailyCommentText} onChange={(e) => setDailyCommentText(e.target.value)} required className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs focus:outline-none focus:border-red-600" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setDailyCommentModal(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Save Comment</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 5. Submit Work Modal */}
      {submissionModal && (
        <ModalWrapper isDark={isDark} title="Submit Task Deliverable" subtitle="Provide URL or upload file for review.">
          <form onSubmit={handleSubmitWork} className="space-y-3 text-xs">
            <InputField label="Project / GitHub Link" type="url" value={submissionForm.submission_url} onChange={(v) => setSubmissionForm({ ...submissionForm, submission_url: v })} />
            <div>
              <label className="block font-bold mb-1">Attach File (PDF/Zip/Image)</label>
              <input type="file" accept=".pdf,.zip,.txt,image/png,image/jpeg" onChange={(e) => setSubmissionForm({ ...submissionForm, file: e.target.files?.[0] || null })} className="w-full p-2 rounded-xl border border-gray-200 text-xs" />
              {submissionForm.file && <span className="text-[11px] text-emerald-600 mt-1 block">Selected: {submissionForm.file.name}</span>}
            </div>
            <div>
              <label className="block font-bold mb-1">Notes</label>
              <textarea rows={2} value={submissionForm.notes} onChange={(e) => setSubmissionForm({ ...submissionForm, notes: e.target.value })} className="w-full p-2 rounded-xl border border-gray-200 text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setSubmissionModal(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" disabled={!submissionForm.submission_url && !submissionForm.file} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Submit</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 6. Review Task Modal */}
      {reviewModal && (
        <ModalWrapper isDark={isDark} title="Task Review & Feedback" subtitle="Evaluate deliverable work.">
          <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
            {(() => {
              const submitted = latestSubmissionByTaskId.get(typeof reviewModal === "object" ? reviewModal.id : reviewModal);
              return submitted ? (
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3 space-y-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Submitted By</div>
                    <div className="font-bold text-gray-900 dark:text-white">{submitted.intern?.full_name || "Submitted member"}</div>
                  </div>
                  {submitted.submission_url && (
                    <a href={safeExternalUrl(submitted.submission_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-red-600 font-bold">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open submitted URL</span>
                    </a>
                  )}
                  {submitted.file_name && (
                    <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{submitted.file_name}</span>
                    </div>
                  )}
                  {submitted.notes && <p className="text-gray-600 dark:text-slate-300 leading-relaxed">{submitted.notes}</p>}
                </div>
              ) : null;
            })()}
            <SelectField label="Decision" value={reviewForm.status} onChange={(v) => setReviewForm({ ...reviewForm, status: v })} options={[["approved", "Approve"], ["rejected", "Reject"], ["changes_requested", "Request Changes"], ["reviewed", "Comment Only"]]} />
            <InputField label="Quality Rating (1 - 5)" type="number" value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
            <div>
              <label className="block font-bold mb-1">Comment / Feedback</label>
              <textarea rows={2} value={reviewForm.feedback} onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })} required className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-red-600" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setReviewModal(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Save Review</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 7. Create Batch Modal (Admin creates batch and assigns HR Manager) */}
      {newBatchModal && isAdminRole && (
        <ModalWrapper isDark={isDark} title="Create Batch" subtitle="Create a training batch and assign an HR Manager.">
          <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
            <InputField label="Batch Name" value={batchForm.name} onChange={(v) => setBatchForm({ ...batchForm, name: v })} required placeholder="e.g. Web Dev Batch Alpha" />
            <SelectField label="Batch Type" value={batchForm.batch_type} onChange={(v) => setBatchForm({ ...batchForm, batch_type: v })} options={[["internship", "Internship"], ["development", "Development"], ["sales", "Sales"], ["sql", "SQL"], ["marketing", "Marketing"], ["training", "Training"], ["other", "Other"]]} />
            <SelectField label="Domain" value={batchForm.domain} onChange={(v) => setBatchForm({ ...batchForm, domain: v })} options={DOMAIN_OPTIONS.map((d) => [d.value, d.label])} />
            <SelectField
              label="Assigned HR"
              value={batchForm.hr_id}
              onChange={(v) => setBatchForm({ ...batchForm, hr_id: v })}
              options={[["", "Select HR"], ...profiles.filter((p) => p.role === "hr").map((p) => [p.id, `${p.full_name} (${p.email})`])]}
            />
            <div>
              <InputField label="Batch Start Date" type="date" value={batchForm.starts_at} onChange={(v) => setBatchForm({ ...batchForm, starts_at: v })} />
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
                End date is not required. When closing or holding this batch, simply click &quot;Pause&quot; on the batch row.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setNewBatchModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 cursor-pointer">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer">Create Batch</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Edit Batch Modal (Admin updates batch details & assigned HR) */}
      {editBatchModal && isAdminRole && (
        <ModalWrapper isDark={isDark} title="Edit Batch" subtitle="Update batch details and Assigned HR.">
          <form onSubmit={handleUpdateBatch} className="space-y-3 text-xs">
            <InputField label="Batch Name" value={editBatchForm.name} onChange={(v) => setEditBatchForm({ ...editBatchForm, name: v })} required />
            <SelectField label="Batch Type" value={editBatchForm.batch_type} onChange={(v) => setEditBatchForm({ ...editBatchForm, batch_type: v })} options={[["internship", "Internship"], ["development", "Development"], ["sales", "Sales"], ["sql", "SQL"], ["marketing", "Marketing"], ["training", "Training"], ["other", "Other"]]} />
            <div className="grid grid-cols-2 gap-2">
              <SelectField label="Domain" value={editBatchForm.domain} onChange={(v) => setEditBatchForm({ ...editBatchForm, domain: v })} options={DOMAIN_OPTIONS.map((d) => [d.value, d.label])} />
              <SelectField label="Status" value={editBatchForm.status} onChange={(v) => setEditBatchForm({ ...editBatchForm, status: v })} options={[["active", "Active"], ["completed", "Completed"], ["paused", "Paused"]]} />
            </div>
            <SelectField
              label="Assigned HR"
              value={editBatchForm.hr_id}
              onChange={(v) => setEditBatchForm({ ...editBatchForm, hr_id: v })}
              options={[["", "Select HR"], ...profiles.filter((p) => p.role === "hr").map((p) => [p.id, `${p.full_name} (${p.email})`])]}
            />
            <div>
              <InputField label="Batch Start Date" type="date" value={editBatchForm.starts_at} onChange={(v) => setEditBatchForm({ ...editBatchForm, starts_at: v })} />
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
                Batches are ongoing cohorts; toggle Status to &quot;Paused&quot; or &quot;Completed&quot; when ending.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setEditBatchModal(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 cursor-pointer">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer">Save Changes</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Resolve Escalation Modal */}
      {escalationResolutionModal && (
        <ModalWrapper isDark={isDark} title="Resolve Escalation" subtitle={escalationResolutionModal.issue || "Add resolution note"}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleUpdateBatchEscalationStatus(escalationResolutionModal, "resolved");
            }}
            className="space-y-3 text-xs"
          >
            <textarea
              rows={4}
              value={escalationResolutionText}
              onChange={(event) => setEscalationResolutionText(event.target.value)}
              placeholder="Type what was done to resolve this issue."
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-emerald-600"
              required
            />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setEscalationResolutionModal(null);
                  setEscalationResolutionText("");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer">
                Mark Resolved
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Raise Escalation Modal */}
      {batchEscalationModalOpen && (
        <ModalWrapper isDark={isDark} title="Raise Escalation" subtitle="Open a batch-wise issue for mentor, HR, or admin review.">
          <form onSubmit={handleCreateBatchEscalation} className="space-y-3 text-xs">
            <SelectField
              label="Batch"
              value={batchEscalationForm.batch_id}
              onChange={(v) => setBatchEscalationForm({ ...batchEscalationForm, batch_id: v, assigned_to: "", related_member_id: "", related_task_id: "" })}
              options={[["", "Select batch"], ...escalationBatchOptions.map((batch) => [batch.id, `${batch.name} - ${domainLabel(batch.domain)}`])]}
              required
            />
            <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/25 p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">Raise To</div>
              <SelectField
                label="Escalation Owner"
                value={batchEscalationForm.assigned_to}
                onChange={(v) => setBatchEscalationForm({ ...batchEscalationForm, assigned_to: v })}
                options={[
                  ["", "Auto route / unassigned"],
                  ...escalationAssigneeOptions.map((profile) => [profile.id, `${profile.full_name} (${ROLE_LABELS[profile.role] || profile.role})`]),
                ]}
              />
              <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                Raised by {ROLE_LABELS[currentRole] || currentRole}. {selectedEscalationAssignee ? `Assigned to ${selectedEscalationAssignee.full_name}.` : "Choose anyone from allowed batch managers/admins, or leave auto."}
              </div>
            </div>
            <InputField
              label="Issue Title"
              value={batchEscalationForm.issue}
              onChange={(v) => setBatchEscalationForm({ ...batchEscalationForm, issue: v })}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Category"
                value={batchEscalationForm.category}
                onChange={(v) => setBatchEscalationForm({
                  ...batchEscalationForm,
                  category: v,
                  priority: v === "urgent" && !["high", "urgent"].includes(batchEscalationForm.priority) ? "urgent" : batchEscalationForm.priority,
                })}
                options={[["general", "General"], ["task", "Task Blocker"], ["attendance", "Attendance"], ["discipline", "Discipline"], ["access", "Access/Resource"], ["urgent", "Urgent Help"]]}
              />
              <SelectField
                label="Priority"
                value={batchEscalationForm.priority}
                onChange={(v) => setBatchEscalationForm({ ...batchEscalationForm, priority: v })}
                options={[["low", "Low"], ["medium", "Medium"], ["high", "High"], ["urgent", "Urgent"]]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <SelectField
                label="Related Member"
                value={batchEscalationForm.related_member_id}
                onChange={(v) => setBatchEscalationForm({ ...batchEscalationForm, related_member_id: v })}
                options={[["", "None"], ...escalationBatchMembers.map((member) => [member.id, `${member.full_name} (${ROLE_LABELS[member.role] || member.role})`])]}
              />
              <SelectField
                label="Related Task"
                value={batchEscalationForm.related_task_id}
                onChange={(v) => setBatchEscalationForm({ ...batchEscalationForm, related_task_id: v })}
                options={[["", "None"], ...tasks.filter((task) => task.batch_id === selectedEscalationBatch?.id).map((task) => [task.id, task.title])]}
              />
            </div>
            <textarea
              rows={4}
              value={batchEscalationForm.description}
              onChange={(event) => setBatchEscalationForm({ ...batchEscalationForm, description: event.target.value })}
              placeholder="Explain the blocker, who is affected, and what action is needed."
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-red-600"
            />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setBatchEscalationModalOpen(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 cursor-pointer">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer">Raise Escalation</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Assign Batch Leads Modal */}
      {assignLeadsModal && (isHrRole || isMentor) && (
        <ModalWrapper isDark={isDark} title={isHrRole ? "Assign Batch Mentor" : "Assign Team Leader"} subtitle={isHrRole ? `Assign Mentor for ${assignLeadsForm.batch_name}.` : `Promote an intern as TL for ${assignLeadsForm.batch_name}.`}>
          <form onSubmit={handleAssignBatchLeads} className="space-y-3 text-xs">
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <div className="text-[11px] text-gray-400">Batch Name</div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">{assignLeadsForm.batch_name}</div>
              <div className="text-xs text-red-600 font-semibold mt-0.5">{domainLabel(assignLeadsForm.domain)}</div>
            </div>
            {isHrRole && (
              <SelectField
                label="Supervisor Mentor (can manage multiple batches)"
                value={assignLeadsForm.mentor_id}
                onChange={(v) => setAssignLeadsForm({ ...assignLeadsForm, mentor_id: v })}
                options={[
                  ["", "Unassigned"],
                  ...hrAssignableMentors.map((p) => [
                    p.id,
                    `${p.full_name} (${p.email})${p.batch_id === assignLeadsForm.batch_id ? " - current batch" : ""}`,
                  ]),
                ]}
              />
            )}
            {isMentor && (
              <SelectField
                label="Promote Intern as TL"
                value={assignLeadsForm.tl_id}
                onChange={(v) => setAssignLeadsForm({ ...assignLeadsForm, tl_id: v })}
                options={[["", "Select batch intern"], ...profiles.filter((p) => p.role === "intern" && p.batch_id === assignLeadsForm.batch_id).map((p) => [p.id, `${p.full_name} (${p.email})`])]}
              />
            )}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setAssignLeadsModal(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 cursor-pointer">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer">{isHrRole ? "Assign Mentor" : "Assign TL"}</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 8. Issue Certificate Modal */}
      {newCertModal && canIssueCertificates && (
        <ModalWrapper isDark={isDark} title="Issue Verified Certificate" subtitle="Creates public verification ledger record.">
          <form onSubmit={handleCreateCert} className="space-y-3 text-xs">
            <SelectField label="Intern Profile" value={certForm.intern_id} onChange={(v) => {
              const profile = visibleProfiles.find((p) => p.id === v);
              setCertForm({ ...certForm, intern_id: v, intern_name: profile?.full_name || certForm.intern_name, domain: profile ? domainLabel(profile.domain) : certForm.domain });
            }} options={[["", "Manual Candidate"], ...profiles.filter((p) => p.role === "intern").map((p) => [p.id, p.full_name])]} />
            <InputField label="Candidate Full Name" value={certForm.intern_name} onChange={(v) => setCertForm({ ...certForm, intern_name: v })} required />
            <InputField label="Domain Specialization" value={certForm.domain} onChange={(v) => setCertForm({ ...certForm, domain: v })} required />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="Start Date" type="date" value={certForm.start_date} onChange={(v) => setCertForm({ ...certForm, start_date: v })} />
              <InputField label="End Date" type="date" value={certForm.end_date} onChange={(v) => setCertForm({ ...certForm, end_date: v })} />
            </div>
            <SelectField label="Performance Grade" value={certForm.performance_grade} onChange={(v) => setCertForm({ ...certForm, performance_grade: v })} options={[["A+ Outstanding", "A+ Outstanding"], ["A Excellent", "A Excellent"], ["B+ Good", "B+ Good"]]} />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setNewCertModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Issue Certificate</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 9. Edit Member Modal */}
      {editMemberModal && (
        <ModalWrapper isDark={isDark} title="Edit Personnel Record" subtitle="Update role, status, domain, and password.">
          <form onSubmit={handleUpdateMember} className="space-y-3 text-xs">
            <InputField label="Full Legal Name" value={editMemberForm.full_name} onChange={(v) => setEditMemberForm({ ...editMemberForm, full_name: v })} required />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="Email ID" type="email" value={editMemberForm.email} onChange={(v) => setEditMemberForm({ ...editMemberForm, email: v })} required />
              <InputField label="Phone" value={editMemberForm.phone} onChange={(v) => setEditMemberForm({ ...editMemberForm, phone: v })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SelectField label="Role" value={editMemberForm.role} onChange={(v) => setEditMemberForm({ ...editMemberForm, role: v })} options={memberRoleOptions} />
              <SelectField label="Status" value={editMemberForm.status} onChange={(v) => setEditMemberForm({ ...editMemberForm, status: v })} options={[["active", "Active"], ["paused", "Paused"], ["completed", "Completed"], ["suspended", "Suspended"]]} />
            </div>
            {isAdminRole ? (
              <SelectField label="Domain" value={editMemberForm.domain} onChange={(v) => setEditMemberForm({ ...editMemberForm, domain: v, batch_id: "", assigned_tl_id: "", assigned_mentor_id: "" })} options={DOMAIN_OPTIONS.map((d) => [d.value, d.label])} />
            ) : (
              <InputField label="Department" value={domainLabel(batches.find((b) => b.id === editMemberForm.batch_id)?.domain || editMemberForm.domain)} onChange={() => { }} />
            )}
            <SelectField label="Cohort Batch" value={editMemberForm.batch_id} onChange={(v) => {
              const selected = batches.find((batch) => batch.id === v);
              setEditMemberForm({ ...editMemberForm, batch_id: v, domain: selected?.domain || editMemberForm.domain, assigned_tl_id: "", assigned_mentor_id: "" });
            }} options={[["", "Unassigned"], ...batches.map((b) => [b.id, `${b.name} - ${domainLabel(b.domain)}`])]} />
            <InputField label="Reset Password (optional)" value={editMemberForm.password} onChange={(v) => setEditMemberForm({ ...editMemberForm, password: v })} />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setEditMemberModal(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Save Changes</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 10. Member Profile Modal */}
      {selectedMemberProfile && (
        <MemberProfileModal
          member={selectedMemberProfile}
          onClose={() => setSelectedMemberModal(null)}
          batch={selectedMemberBatch}
          assignedBatches={selectedMemberAssignedBatches}
          responsibilityMap={selectedMemberResponsibilityMap}
          tasks={selectedMemberTasks}
          submissions={selectedMemberSubmissions}
          reviews={selectedMemberReviews}
          attendanceRecords={selectedMemberAttendance}
          onPromoteToTl={async () => {
            await handlePromoteInternToTl(selectedMemberProfile);
            setSelectedMemberModal(null);
          }}
          canPromoteTl={isMentor && selectedMemberProfile.role === "intern" && ownedBatchIds.has(selectedMemberProfile.batch_id)}
          onSendWhatsapp={(member) => {
            if (!member?.phone) return;
            const cleanPhone = member.phone.replace(/[^0-9]/g, "");
            const text = encodeURIComponent(`Hi ${member.full_name || "there"}, this is ${userProfile?.full_name || "Team Member"} from TexWeb Solution.`);
            window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
          }}
          isDark={isDark}
          roleLabels={ROLE_LABELS}
          domainLabel={domainLabel}
        />
      )}

      {/* 11. TL Daily Report Modal */}
      {dailyReportModalOpen && (
        <DailyReportModal
          isOpen={dailyReportModalOpen}
          onClose={() => setDailyReportModalOpen(false)}
          batch={batches.find((b) => b.id === userProfile?.batch_id) || ownedBatches[0]}
          batchInterns={profiles.filter((p) => p.role === "intern" && p.batch_id === (userProfile?.batch_id || ownedBatches[0]?.id))}
          todayMeetings={meetings.filter((m) => m.scheduled_at?.startsWith(new Date().toISOString().slice(0, 10)))}
          onSubmit={async (formData) => {
            const selectedBatch = batches.find((b) => b.id === (formData.batch_id || userProfile?.batch_id));
            const mentorId = selectedBatch?.mentor_id || userProfile?.assigned_mentor_id || null;
            const update = {
              tl_id: sessionUser.id,
              mentor_id: mentorId,
              batch_id: selectedBatch?.id || null,
              domain: selectedBatch?.domain || userProfile?.domain || "web_dev",
              summary: formData.summary,
              blockers: formData.blockers,
              present_interns: formData.present_interns,
              absent_interns: formData.absent_interns,
              tomorrow_plan: formData.tomorrow_plan,
              assigned_tasks: formData.assigned_tasks,
              member_progress: formData.member_progress,
              completed_count: formData.member_progress?.filter((m) => m.progress?.toLowerCase().includes("done") || m.progress?.toLowerCase().includes("complete")).length || 0,
              pending_count: formData.member_progress?.filter((m) => m.blocker?.trim().length > 0).length || 0,
            };
            const saved = await createDailyUpdate(update);
            if (!saved) {
              setToast("Daily report submission failed.");
              return;
            }
            setDailyUpdates([saved, ...dailyUpdates]);
            setDailyReportModalOpen(false);
            setToast("Daily report submitted successfully!");
          }}
          isDark={isDark}
        />
      )}

      {/* 12. Task Details & Timeline Modal */}
      {taskDetailsModal && (
        <TaskDetailsModal
          task={taskDetailsModal}
          onClose={() => setTaskDetailsModal(null)}
          submissions={submissions}
          reviews={taskReviews}
          onSubmitWork={(taskId) => {
            setTaskDetailsModal(null);
            setSubmissionModal(taskId);
          }}
          onReviewTask={(task) => {
            setTaskDetailsModal(null);
            setReviewModal(task);
          }}
          currentUserId={sessionUser?.id}
          currentUserRole={currentRole}
          isDark={isDark}
          localDate={localDate}
        />
      )}

      {/* 13. Global Search Palette Modal (Ctrl + K) */}
      {globalSearchOpen && (
        <GlobalSearchModal
          isOpen={globalSearchOpen}
          onClose={() => setGlobalSearchOpen(false)}
          searchTerm={globalSearchTerm}
          onSearchChange={setGlobalSearchTerm}
          results={globalSearchResults}
          onSelectMember={(member) => {
            setGlobalSearchOpen(false);
            setSelectedMemberModal(member);
          }}
          onSelectBatch={(batch) => {
            setGlobalSearchOpen(false);
            openBatchWorkspace(batch.id);
          }}
          onSelectTask={(task) => {
            setGlobalSearchOpen(false);
            setTaskDetailsModal(task);
          }}
          onSelectMeeting={(meeting) => {
            setGlobalSearchOpen(false);
            if (meeting.meeting_link) {
              window.open(safeExternalUrl(meeting.meeting_link), "_blank");
            } else {
              selectSection("classes");
            }
          }}
          onSelectReport={(report) => {
            setGlobalSearchOpen(false);
            selectSection("daily_updates");
          }}
          isDark={isDark}
          roleLabels={ROLE_LABELS}
          domainLabel={domainLabel}
        />
      )}

      {/* 14. Edit Announcement Modal */}
      {editingAnnouncement && (
        <ModalWrapper isDark={isDark} title="Edit Announcement" subtitle="Update notice details, message, or change attachments.">
          <form onSubmit={handleUpdateBatchAnnouncement} className="space-y-3.5 text-xs">
            <InputField
              label="Title"
              value={editingAnnouncement.title}
              onChange={(v) => setEditingAnnouncement({ ...editingAnnouncement, title: v })}
              required
            />
            <SelectField
              label="Category"
              value={editingAnnouncement.category}
              onChange={(v) => setEditingAnnouncement({ ...editingAnnouncement, category: v })}
              options={[
                ["announcement", "Announcement"],
                ["important_link", "Important Link"],
                ["rule", "Rule"],
                ["pinned", "Pinned Information"],
              ]}
            />
            <InputField
              label="Optional Link"
              type="url"
              value={editingAnnouncement.link_url}
              onChange={(v) => setEditingAnnouncement({ ...editingAnnouncement, link_url: v })}
              placeholder="https://..."
            />
            <div className="space-y-1">
              <label className="block font-bold text-xs text-gray-700 dark:text-slate-300">Message / Body</label>
              <textarea
                rows={4}
                value={editingAnnouncement.body}
                onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, body: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs focus:bg-white focus:outline-none focus:border-red-600 transition"
              />
            </div>

            {/* Attachment preview / change */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                <span>Attachment (PDF / Image / Doc)</span>
                <span className="text-[10px] text-gray-400 font-normal">Optional</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx,.txt,.xlsx,.zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
                      setEditingAnnouncement((prev) => ({
                        ...prev,
                        file,
                        previewUrl,
                        attachment_name: file.name,
                        attachment_type: file.type || file.name.split(".").pop(),
                      }));
                    }
                  }}
                  className="hidden"
                  id="edit-announcement-file-input"
                />
                {editingAnnouncement.file || editingAnnouncement.attachment_url ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {editingAnnouncement.previewUrl ? (
                        <img src={editingAnnouncement.previewUrl} alt="Preview" className="w-7 h-7 rounded object-cover border" />
                      ) : (
                        <FileText className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span className="font-bold text-red-950 dark:text-red-200 truncate">
                        {editingAnnouncement.attachment_name || "Attached file"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingAnnouncement((prev) => ({
                        ...prev,
                        file: null,
                        previewUrl: "",
                        attachment_url: "",
                        attachment_name: "",
                        attachment_type: "",
                      }))}
                      className="p-1 hover:text-red-600 text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="edit-announcement-file-input"
                    className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl hover:border-red-500 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition text-xs text-gray-500 dark:text-slate-400 font-medium"
                  >
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span>Upload new or replacement file</span>
                  </label>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={editingAnnouncement.pinned}
                onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, pinned: e.target.checked })}
              />
              <span>Pin this notice to top</span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingAnnouncement(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editingAnnouncement.uploading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white disabled:opacity-50 flex items-center gap-2 shadow-md shadow-red-500/20 cursor-pointer transition"
              >
                {editingAnnouncement.uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{editingAnnouncement.uploading ? "Uploading & Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* 15. Edit Batch File / Resource Modal */}
      {editingResource && (
        <ModalWrapper isDark={isDark} title="Edit File / Resource" subtitle="Update title, category, link, or replacement file.">
          <form onSubmit={handleUpdateBatchResource} className="space-y-3.5 text-xs">
            <InputField
              label="Title"
              value={editingResource.title}
              onChange={(v) => setEditingResource({ ...editingResource, title: v })}
              required
            />
            <SelectField
              label="Category"
              value={editingResource.category}
              onChange={(v) => setEditingResource({ ...editingResource, category: v })}
              options={[
                ["technical_guides", "Technical Guides"],
                ["task_guidelines", "Task Guidelines"],
                ["git_guidelines", "Git Guidelines"],
                ["learning_material", "Learning Material"],
                ["important_documents", "Important Documents"],
                ["useful_links", "Useful Links"],
                ["other", "Other"],
              ]}
            />
            <InputField
              label="External Link URL"
              type="url"
              value={editingResource.link_url}
              onChange={(v) => setEditingResource({ ...editingResource, link_url: v })}
              placeholder="https://..."
            />
            <div className="space-y-1">
              <label className="block font-bold text-xs text-gray-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={editingResource.description}
                onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                placeholder="Short description or instructions..."
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs focus:bg-white focus:outline-none focus:border-red-600 transition"
              />
            </div>

            {/* File Replacement input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                <span>File (PDF / Image / Doc)</span>
                <span className="text-[10px] text-gray-400 font-normal">Optional</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx,.txt,.xlsx,.zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
                      setEditingResource((prev) => ({
                        ...prev,
                        file,
                        previewUrl,
                        file_name: file.name,
                      }));
                    }
                  }}
                  className="hidden"
                  id="edit-batch-resource-file-input"
                />
                {editingResource.file || editingResource.file_url ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {editingResource.previewUrl ? (
                        <img src={editingResource.previewUrl} alt="Preview" className="w-7 h-7 rounded object-cover border" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                      <span className="font-bold text-indigo-950 dark:text-indigo-200 truncate">
                        {editingResource.file_name || "Current attached file"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingResource((prev) => ({
                        ...prev,
                        file: null,
                        previewUrl: "",
                        file_url: "",
                        file_name: "",
                      }))}
                      className="p-1 hover:text-red-600 text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="edit-batch-resource-file-input"
                    className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl hover:border-red-500 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition text-xs text-gray-500 dark:text-slate-400 font-medium"
                  >
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span>Upload new or replacement file</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editingResource.uploading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white disabled:opacity-50 flex items-center gap-2 shadow-md shadow-red-500/20 cursor-pointer transition"
              >
                {editingResource.uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{editingResource.uploading ? "Uploading & Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Universal In-App Confirmation Modal (Replaces window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(confirmModal)}
        title={confirmModal?.title || "Confirm Action"}
        itemName={confirmModal?.itemName || ""}
        message={confirmModal?.message || "Are you sure you want to proceed?"}
        confirmText={confirmModal?.confirmText || "Confirm"}
        cancelText={confirmModal?.cancelText || "Cancel"}
        danger={confirmModal?.danger ?? false}
        loading={confirmModal?.loading ?? false}
        onConfirm={confirmModal?.onConfirm}
        onClose={() => setConfirmModal(null)}
        isDark={isDark}
      />

      {/* Universal In-App Share / Verification Link Modal (Replaces window.prompt) */}
      <ShareLinkModal
        isOpen={Boolean(shareLinkModal)}
        title={shareLinkModal?.title || "Share Link"}
        subtitle={shareLinkModal?.subtitle || "Copy the link below"}
        link={shareLinkModal?.link || ""}
        onClose={() => setShareLinkModal(null)}
        isDark={isDark}
      />
    </div>
  );
}

/* ==============================================================================
   SIMPLE, CLEAN REUSABLE COMPONENTS
   ============================================================================== */

function ModalWrapper({ isDark, title, subtitle, children, onClose, maxWidth = "max-w-lg" }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${maxWidth} w-full shadow-2xl relative my-auto max-h-[92dvh] flex flex-col overflow-hidden transition-all ${
          isDark ? "bg-[#18150f] border-[#3a3020] text-[#f4ead2]" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <div className="shrink-0 flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 pr-1">
            <div className="text-[10.5px] font-bold text-red-600 uppercase tracking-wider font-mono">TexWeb Workspace</div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 pr-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  isOpen,
  title,
  itemName = "",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
  isDark = false,
}) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-md my-auto rounded-3xl border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] p-6 sm:p-7 overflow-hidden transition-all ${
          isDark
            ? "bg-[#13151b] border-slate-800 text-slate-100"
            : "bg-white border-gray-200/90 text-gray-900"
        }`}
      >
        {/* Subtle Ambient Decorative Glow */}
        <div className="absolute -top-14 -right-14 w-36 h-36 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-red-500/10 dark:bg-red-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Tag & Close Button */}
        <div className="relative flex items-center justify-between gap-3 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
              danger
                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/50"
                : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${danger ? "bg-rose-500" : "bg-amber-500"}`} />
            <span>{danger ? "Action Required" : "Confirm"}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Icon & Title */}
        <div className="relative flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              danger
                ? "bg-gradient-to-br from-rose-500/15 via-red-500/10 to-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                : "bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25"
            }`}
          >
            {danger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-xs sm:text-[13px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Target Item Name Card */}
        {itemName && (
          <div className="relative mt-4 p-3 rounded-2xl bg-gray-50 dark:bg-transparent border border-gray-200/80 dark:border-slate-800/90 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider font-mono">Target Item</div>
              <div className="text-xs sm:text-[13px] font-semibold text-gray-900 dark:text-slate-200 truncate font-mono">{itemName}</div>
            </div>
          </div>
        )}

        {/* Danger Warning Note */}
        {danger && (
          <div className="relative mt-3 px-3.5 py-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex items-center gap-2 text-[11.5px] text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>This action cannot be undone and will be logged.</span>
          </div>
        )}

        {/* Buttons Footer */}
        <div className="relative flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-gray-100 dark:border-slate-800/80 shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              if (onConfirm) await onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-white flex items-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-95 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareLinkModal({
  isOpen,
  title = "Share Link",
  subtitle = "Copy the link below to share",
  link = "",
  onClose,
  isDark = false,
}) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-md my-auto rounded-3xl border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] p-6 sm:p-7 overflow-hidden transition-all ${
          isDark
            ? "bg-[#13151b] border-slate-800 text-slate-100"
            : "bg-white border-gray-200/90 text-gray-900"
        }`}
      >
        <div className="absolute -top-14 -right-14 w-36 h-36 bg-red-500/10 dark:bg-red-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-2 mb-4">
          <div>
            <div className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider font-mono">TexWeb Workspace Link</div>
            <h3 className="text-lg font-bold tracking-tight mt-0.5">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative mt-3 space-y-4">
          <div className="relative">
            <input
              type="text"
              readOnly
              value={link}
              className="w-full p-3 pr-28 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-transparent text-xs font-mono text-gray-800 dark:text-slate-200 focus:outline-none select-all"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/80">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in new tab</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <label className="block">
      <span className="block font-bold text-xs mb-1 text-gray-700 dark:text-slate-300">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs focus:bg-white focus:outline-none focus:border-red-600"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block font-bold text-xs mb-1 text-gray-700 dark:text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs focus:bg-white focus:outline-none focus:border-red-600"
      >
        {options.map(([val, labelText]) => (
          <option key={val || labelText} value={val}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}
