"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Plus,
  TrendingUp,
  LogOut,
  Video,
  ExternalLink,
  Sparkles,
  Users,
  Send,
  Phone,
  Layers,
  Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getCloudLeads,
  getTasks,
  createCloudTask,
  getMeetings,
  createMeeting,
  getCertificates,
  issueCertificate
} from "@/services/supabaseService";

export default function LoginPage() {
  const [authMode, setAuthMode] = useState("signin"); // "signin" | "forgot"
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState("tasks");

  // Realtime Data states
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // Enrolled Members (Managed by TL & Admin)
  const [enrolledMembers, setEnrolledMembers] = useState([
    {
      id: "MEM-101",
      full_name: "Aman Sharma",
      email: "aman.dev@texwebsolution.in",
      phone: "919876543210",
      role: "intern",
      domain: "Web Development",
      temp_password: "TexWeb@2026",
      status: "Active",
      batch: "Batch-01 (Next.js Pod)",
      assigned_tl: "Rahul Mehta (TL Dev)"
    },
    {
      id: "MEM-102",
      full_name: "Priya Patel",
      email: "priya.sales@texwebsolution.in",
      phone: "919876543211",
      role: "intern",
      domain: "Sales & Outreach",
      temp_password: "TexWeb@2026",
      status: "Active",
      batch: "Batch-02 (Sales Pod)",
      assigned_tl: "Sneha Kapoor (TL Sales)"
    },
    {
      id: "MEM-103",
      full_name: "Vikas Dubey",
      email: "vikas.design@texwebsolution.in",
      phone: "919876543212",
      role: "intern",
      domain: "UI/UX Design",
      temp_password: "TexWeb@2026",
      status: "Active",
      batch: "Batch-01 (Design Pod)",
      assigned_tl: "Rahul Mehta (TL Dev)"
    }
  ]);

  // Modals
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [newMeetingModal, setNewMeetingModal] = useState(false);
  const [newCertModal, setNewCertModal] = useState(false);
  const [newMemberModal, setNewMemberModal] = useState(false);
  const [submissionModal, setSubmissionModal] = useState(null);

  // Forms
  const [memberForm, setMemberForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "intern",
    domain: "Web Development",
    batch: "Batch-01 (Next.js Pod)",
    assigned_tl: "Assigned by Admin",
    temp_password: `TexWeb@${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    domain: "web_dev",
    assigned_to_email: "",
    priority: "medium",
    deadline: ""
  });

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    topic: "",
    scheduled_at: "",
    meeting_link: "https://meet.google.com/new"
  });

  const [certForm, setCertForm] = useState({
    intern_name: "",
    intern_email: "",
    domain: "Full Stack Web Development",
    start_date: "",
    end_date: "",
    performance_grade: "A+ Outstanding"
  });

  // 1. Listen to Supabase Realtime Auth state
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSessionUser(session.user);
        await fetchProfile(session.user.id, session.user.email);
      }
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setSessionUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch or initialize profile
  const fetchProfile = async (userId, userEmail) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setUserProfile(data);
      } else {
        const isAdmin = userEmail?.toLowerCase().includes("admin") || userEmail === "admin@texwebsolution.in";
        const newProf = {
          id: userId,
          full_name: userEmail?.split("@")[0] || "Team Member",
          email: userEmail,
          role: isAdmin ? "super_admin" : "intern",
          domain: "web_dev"
        };
        setUserProfile(newProf);
      }
      await loadDashboardData();
    } catch (err) {
      console.warn("Profile fetch fallback:", err.message);
    }
  };

  const loadDashboardData = async () => {
    const [leadsData, tasksData, meetingsData, certsData] = await Promise.all([
      getCloudLeads(),
      getTasks(),
      getMeetings(),
      getCertificates()
    ]);
    if (leadsData) setLeads(leadsData);
    if (tasksData && tasksData.length > 0) setTasks(tasksData);
    if (meetingsData && meetingsData.length > 0) setMeetings(meetingsData);
    if (certsData && certsData.length > 0) setCertificates(certsData);
  };

  // Auth Handler: Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage({ type: "", text: "" });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setAuthMessage({ type: "error", text: "Invalid email or password. Please check your credentials sent by your TL on WhatsApp." });
        } else {
          setAuthMessage({ type: "error", text: error.message });
        }
      } else if (data?.user) {
        setSessionUser(data.user);
        await fetchProfile(data.user.id, data.user.email);
        setAuthMessage({ type: "success", text: "Successfully signed in! Opening your workspace..." });
      }
    } catch (err) {
      setAuthMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Auth Handler: Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage({ type: "", text: "" });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setAuthMessage({ type: "error", text: error.message });
      } else {
        setAuthMessage({ type: "success", text: "Password reset link sent to your registered email!" });
      }
    } catch (err) {
      setAuthMessage({ type: "error", text: "Error sending reset email." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
    setUserProfile(null);
    setEmail("");
    setPassword("");
    setAuthMessage({ type: "", text: "" });
  };

  // Actions in Dashboard
  const handleEnrollMember = (e) => {
    e.preventDefault();
    const newMember = {
      id: `MEM-${Math.floor(100 + Math.random() * 900)}`,
      full_name: memberForm.full_name,
      email: memberForm.email,
      phone: memberForm.phone.replace(/[^0-9]/g, ""),
      role: memberForm.role,
      domain: memberForm.domain,
      batch: memberForm.batch,
      assigned_tl: memberForm.assigned_tl,
      temp_password: memberForm.temp_password,
      status: "Active"
    };

    setEnrolledMembers([newMember, ...enrolledMembers]);
    setNewMemberModal(false);
    setMemberForm({
      full_name: "",
      email: "",
      phone: "",
      role: "intern",
      domain: "Web Development",
      batch: "Batch-01 (Next.js Pod)",
      assigned_tl: "Assigned by Admin",
      temp_password: `TexWeb@${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const handleSendWhatsapp = (member) => {
    const cleanPhone = member.phone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `*Welcome to TexWeb Solution Workspace!* 🎉\n\n` +
      `Hello *${member.full_name}*,\nYour account has been enrolled in *${member.batch}*.\n\n` +
      `🔗 *Login URL:* https://texwebsolution.in/login\n` +
      `📧 *Work Email:* ${member.email}\n` +
      `🔑 *Temporary Password:* ${member.temp_password}\n\n` +
      `📌 *Domain:* ${member.domain}\n` +
      `👤 *Assigned TL:* ${member.assigned_tl}\n\n` +
      `Please login and review your assigned tasks and sprint meetings.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const newTask = {
      title: taskForm.title,
      description: taskForm.description,
      domain: taskForm.domain,
      priority: taskForm.priority,
      deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : new Date().toISOString(),
      status: "pending"
    };
    await createCloudTask(newTask);
    setTasks([newTask, ...tasks]);
    setNewTaskModal(false);
    setTaskForm({ title: "", description: "", domain: "web_dev", assigned_to_email: "", priority: "medium", deadline: "" });
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    const newMtg = {
      title: meetingForm.title,
      topic: meetingForm.topic,
      scheduled_at: meetingForm.scheduled_at ? new Date(meetingForm.scheduled_at).toISOString() : new Date().toISOString(),
      meeting_link: meetingForm.meeting_link,
      status: "scheduled"
    };
    await createMeeting(newMtg);
    setMeetings([newMtg, ...meetings]);
    setNewMeetingModal(false);
    setMeetingForm({ title: "", topic: "", scheduled_at: "", meeting_link: "https://meet.google.com/new" });
  };

  const handleCreateCert = async (e) => {
    e.preventDefault();
    const code = `TEX-2026-${certForm.domain.includes("Web") ? "DEV" : "SALES"}-${Math.floor(100 + Math.random() * 900)}`;
    const newCert = {
      certificate_code: code,
      intern_name: certForm.intern_name,
      domain: certForm.domain,
      start_date: certForm.start_date || "2026-06-01",
      end_date: certForm.end_date || "2026-09-01",
      performance_grade: certForm.performance_grade,
      verification_status: "verified"
    };
    await issueCertificate(newCert);
    setCertificates([newCert, ...certificates]);
    setNewCertModal(false);
  };

  const currentRole = userProfile?.role || (sessionUser?.email?.includes("admin") ? "super_admin" : "intern");

  return (
    <div
      className={`w-full bg-white text-gray-900 font-poppins relative flex flex-col justify-between ${sessionUser ? "min-h-screen overflow-x-hidden" : "h-screen max-h-screen overflow-hidden"
        }`}
      style={{ backgroundImage: "url('/common/Bg2.png')", backgroundRepeat: "no-repeat", backgroundPosition: "top center", backgroundSize: "cover" }}
    >
      {/* Top Standalone Header Bar with exact Navbar Logo & Stacked Text on the Left */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4.5 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-[1px] group shrink-0">
          <img
            alt="TexWebSolution Logo"
            className="h-[38px] sm:h-[46px] w-auto rounded-xl transition-transform duration-300 group-hover:scale-105"
            src="/logo.png"
          />
          <div
            className="flex flex-col text-left justify-center ml-[-5px] sm:ml-[-6px]"
            style={{ fontFamily: "Matter" }}
          >
            <span className="text-gray-900 font-black text-lg sm:text-[22px] tracking-[-0.08em] leading-none relative z-10">
              TEXWEB
            </span>
            <span className="text-red-600 font-black text-[14.5px] sm:text-[17.5px] tracking-[-0.08em] uppercase leading-none mt-[-3px] sm:mt-[-4.5px] select-none relative z-0">
              SOLUTION
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-red-600 bg-white/90 hover:bg-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-200 shadow-sm transition-all"
          style={{ fontFamily: "Matter" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* ========================================================================= */}
      {/* 1. AUTHENTICATED WORKSPACE DASHBOARD */}
      {/* ========================================================================= */}
      {sessionUser ? (
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 pb-20">
          {/* Top User Profile Header Card */}
          <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/40 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="uppercase tracking-wider font-mono font-bold">
                    {currentRole.replace("_", " ")} WORKSPACE
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "Matter" }}>
                  Welcome, {userProfile?.full_name || sessionUser.email}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-poppins mt-1">
                  Connected to Realtime Cloud • Domain: <span className="text-red-600 font-semibold uppercase">{userProfile?.domain || "Web Development"}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 transition-all cursor-pointer"
                  style={{ fontFamily: "Matter" }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-2 sm:gap-4 pb-1" style={{ fontFamily: "Matter" }}>
            {/* Tab: Enrolled Members & Batches (For Super Admin, TL & HR) */}
            {(currentRole === "super_admin" || currentRole === "team_leader" || currentRole === "hr" || sessionUser?.email?.includes("admin")) && (
              <button
                onClick={() => setActiveTab("members")}
                className={`pb-3 px-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "members"
                    ? "border-red-600 text-red-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
              >
                <Users className="w-4 h-4" />
                <span>Enrolled Members & Batches ({enrolledMembers.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("tasks")}
              className={`pb-3 px-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "tasks"
                  ? "border-red-600 text-red-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tasks & Assignments ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("meetings")}
              className={`pb-3 px-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "meetings"
                  ? "border-red-600 text-red-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Meetings & Standups ({meetings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`pb-3 px-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "certificates"
                  ? "border-red-600 text-red-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              <Award className="w-4 h-4" />
              <span>Verified Certificates ({certificates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("crm")}
              className={`pb-3 px-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "crm"
                  ? "border-red-600 text-red-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Cloud CRM Leads ({leads.length})</span>
            </button>
          </div>

          {/* TAB 0: ENROLLED MEMBERS */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Matter" }}>
                    Student & Developer Enrollment
                  </h2>
                  <p className="text-xs text-gray-500 font-poppins">
                    Team Leaders & Admins enroll new members, assign batches/teams, and dispatch login credentials directly via WhatsApp.
                  </p>
                </div>

                <button
                  onClick={() => setNewMemberModal(true)}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                  style={{ fontFamily: "Matter" }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll New Member</span>
                </button>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="p-4 font-semibold">Member Name & ID</th>
                      <th className="p-4 font-semibold">Assigned Batch</th>
                      <th className="p-4 font-semibold">Domain</th>
                      <th className="p-4 font-semibold">Team Leader</th>
                      <th className="p-4 font-semibold">Login Email</th>
                      <th className="p-4 font-semibold">Auto Password</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrolledMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{m.full_name}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{m.id} • {m.role.toUpperCase()}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                            <Layers className="w-3 h-3" />
                            {m.batch}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-700">{m.domain}</td>
                        <td className="p-4 text-gray-600">{m.assigned_tl}</td>
                        <td className="p-4 font-mono text-gray-600">{m.email}</td>
                        <td className="p-4 font-mono text-red-600 font-semibold">{m.temp_password}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleSendWhatsapp(m)}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all text-[11px] cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send on WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 1: TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Matter" }}>
                    Task Management
                  </h2>
                  <p className="text-xs text-gray-500 font-poppins">
                    {currentRole === "intern"
                      ? "Your active sprint tasks, deadlines and project submission portal."
                      : "Assign work, track deadlines, and review submissions in real-time."}
                  </p>
                </div>

                {currentRole !== "intern" && (
                  <button
                    onClick={() => setNewTaskModal(true)}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                    style={{ fontFamily: "Matter" }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign New Task</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tasks.length > 0 ? (
                  tasks.map((task, idx) => (
                    <div
                      key={task.id || idx}
                      className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between hover:border-red-300 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${task.priority === "urgent" ? "bg-red-50 text-red-600 border border-red-200" :
                              task.priority === "high" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-blue-50 text-blue-600 border border-blue-200"
                            }`}>
                            {task.priority || "Medium"} Priority
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            {(task.status || "pending").replace("_", " ").toUpperCase()}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "Matter" }}>
                          {task.title}
                        </h3>
                        <p className="text-xs text-gray-600 font-poppins mb-4 leading-relaxed line-clamp-3">
                          {task.description}
                        </p>

                        <div className="text-xs space-y-1.5 text-gray-500 font-poppins pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span>Domain:</span>
                            <span className="font-semibold text-gray-900 uppercase font-mono">{task.domain}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Deadline:</span>
                            <span className="font-semibold text-red-600">{task.deadline?.slice(0, 10) || "Open"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                        {currentRole === "intern" ? (
                          <button
                            onClick={() => setSubmissionModal(task.id || idx)}
                            className="w-full bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-semibold py-2.5 rounded-xl transition-colors text-center cursor-pointer border border-red-200"
                            style={{ fontFamily: "Matter" }}
                          >
                            Submit Project Work
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-poppins">Realtime active task</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-500">
                    No active tasks found. Click &quot;Assign New Task&quot; to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MEETINGS */}
          {activeTab === "meetings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Matter" }}>
                    Meetings & Standups
                  </h2>
                  <p className="text-xs text-gray-500 font-poppins">
                    Live 1-on-1 feedback and sprint standups with direct Google Meet links.
                  </p>
                </div>

                {currentRole !== "intern" && (
                  <button
                    onClick={() => setNewMeetingModal(true)}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                    style={{ fontFamily: "Matter" }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule Meeting</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {meetings.map((meeting, idx) => (
                  <div
                    key={meeting.id || idx}
                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{meeting.scheduled_at?.slice(0, 16) || "Scheduled"}</span>
                        </span>
                        <span className="text-xs text-gray-500 font-mono">15 Mins</span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-1.5" style={{ fontFamily: "Matter" }}>
                        {meeting.title}
                      </h3>
                      <p className="text-xs text-gray-600 font-poppins mb-4">{meeting.topic}</p>
                    </div>

                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                      style={{ fontFamily: "Matter" }}
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Live Meeting</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Matter" }}>
                    Verifiable Certificates
                  </h2>
                  <p className="text-xs text-gray-500 font-poppins">
                    Cryptographically verifiable certificates issued for completed internships.
                  </p>
                </div>

                {currentRole !== "intern" && (
                  <button
                    onClick={() => setNewCertModal(true)}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                    style={{ fontFamily: "Matter" }}
                  >
                    <Award className="w-4 h-4" />
                    <span>Issue Certificate</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {certificates.map((cert, idx) => (
                  <div
                    key={cert.id || idx}
                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                        {cert.certificate_code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "Matter" }}>
                      {cert.intern_name}
                    </h3>
                    <p className="text-xs text-red-600 font-semibold mb-3">{cert.domain}</p>

                    <div className="text-xs space-y-1 text-gray-500 font-poppins pt-3 border-t border-gray-100 mb-4">
                      <div>Grade: <span className="font-bold text-emerald-600">{cert.performance_grade}</span></div>
                    </div>

                    <Link
                      href={`/verify/${cert.certificate_code}`}
                      className="block text-center bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-semibold py-2 rounded-xl transition-colors border border-gray-200"
                      style={{ fontFamily: "Matter" }}
                    >
                      Public Verify Page ↗
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CRM LEADS */}
          {activeTab === "crm" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Matter" }}>
                  Realtime Cloud CRM Leads
                </h2>
                <p className="text-xs text-gray-500 font-poppins">
                  Direct client inquiries synchronized from website lead capture forms.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="p-4 font-semibold">Client Name</th>
                      <th className="p-4 font-semibold">Phone Number</th>
                      <th className="p-4 font-semibold">Service</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.length > 0 ? (
                      leads.map((lead, idx) => (
                        <tr key={lead.id || idx} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-4 font-bold text-gray-900">{lead.name}</td>
                          <td className="p-4 text-gray-600 font-mono">
                            <a href={`tel:${lead.phone}`} className="hover:text-red-600">
                              {lead.phone}
                            </a>
                          </td>
                          <td className="p-4 text-gray-600">{lead.service}</td>
                          <td className="p-4">
                            <span className="bg-red-50 text-red-600 border border-red-200 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500">{lead.source}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 font-poppins">
                          No leads in database yet. New form submissions will sync live.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* ========================================================================= */
        /* 2. REALTIME LOGIN CARD (FIXED 1-PAGE SCREEN FIT - NO SCROLL) */
        /* ========================================================================= */
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-2 min-h-0">
          <div className="w-full max-w-[410px] bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-gray-200/50 text-left relative overflow-hidden">
            {/* Top Brand Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

            {/* Title Header */}
            <div className="text-center mb-4 sm:mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-[11.5px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TexWeb Solution Cloud Work Space</span>
              </div>
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight" style={{ fontFamily: "Matter" }}>
                {authMode === "signin" && "Sign In to Cloud Work Space"}
                {authMode === "forgot" && "Reset Your Password"}
              </h2>
              <p className="text-[11.5px] text-gray-500 font-poppins mt-1">
                {authMode === "signin" && "Enter the login credentials provided by your Team Leader or Admin."}
                {authMode === "forgot" && "Enter your registered email to receive a password reset link."}
              </p>
            </div>

            {/* Status Messages */}
            {authMessage.text && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold mb-3.5 border ${authMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-600"
                }`}>
                {authMessage.text}
              </div>
            )}

            {/* AUTH FORMS */}
            {authMode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-gray-800 mb-1 text-[11.5px]" style={{ fontFamily: "Matter" }}>
                    Official Email / User ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@texwebsolution.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-poppins text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-gray-800 text-[11.5px]" style={{ fontFamily: "Matter" }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-[11px] text-red-600 hover:text-red-700 font-medium transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 transition-all duration-300 text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
                  style={{ fontFamily: "Matter" }}
                >
                  <span>{loading ? "Authenticating..." : "Sign In to Cloud Work Space"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {authMode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-gray-800 mb-1" style={{ fontFamily: "Matter" }}>
                    Registered Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@texwebsolution.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white font-poppins text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 transition text-xs sm:text-sm cursor-pointer"
                  style={{ fontFamily: "Matter" }}
                >
                  {loading ? "Sending..." : "Send Password Reset Link"}
                </button>

                <div className="text-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => { setAuthMode("signin"); setAuthMessage({ type: "", text: "" }); }}
                    className="text-xs text-gray-500 hover:text-gray-900 font-medium underline cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Helper Notice */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-center text-[11px] text-gray-500 font-poppins">
              <span className="text-gray-400">New intern or developer? </span>
              <span className="text-gray-700 font-medium">Your Team Leader or HR will enroll your account and send credentials directly to your WhatsApp.</span>
            </div>
          </div>
        </main>
      )}

      {/* Standalone Bottom Copyright */}
      <footer className="relative z-20 py-2.5 text-center text-[11px] text-gray-400 font-poppins border-t border-gray-200/60 shrink-0">
        © {new Date().getFullYear()} TexWeb Solution Pvt. Ltd. • All rights reserved.
      </footer>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* MODAL: ENROLL NEW MEMBER (FOR TL / ADMIN) */}
      {newMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-gray-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "Matter" }}>
              Enroll New Student / Developer
            </h3>
            <p className="text-xs text-gray-500 font-poppins mb-4">
              Create student profile, assign batch/TL and send instant login details on WhatsApp.
            </p>

            <form onSubmit={handleEnrollMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Kumar"
                  value={memberForm.full_name}
                  onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rohit@texwebsolution.in"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="919876543210"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Domain</label>
                  <select
                    value={memberForm.domain}
                    onChange={(e) => setMemberForm({ ...memberForm, domain: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Sales & Outreach">Sales & Outreach</option>
                    <option value="Marketing & Reels">Marketing & Reels</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assign Batch</label>
                  <select
                    value={memberForm.batch}
                    onChange={(e) => setMemberForm({ ...memberForm, batch: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900"
                  >
                    <option value="Batch-01 (Next.js Pod)">Batch-01 (Next.js Pod)</option>
                    <option value="Batch-02 (Sales Pod)">Batch-02 (Sales Pod)</option>
                    <option value="Batch-03 (Design Pod)">Batch-03 (Design Pod)</option>
                    <option value="Batch-04 (Marketing Pod)">Batch-04 (Marketing Pod)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Team Leader (TL)</label>
                  <input
                    type="text"
                    required
                    value={memberForm.assigned_tl}
                    onChange={(e) => setMemberForm({ ...memberForm, assigned_tl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Auto Password</label>
                  <input
                    type="text"
                    required
                    value={memberForm.temp_password}
                    onChange={(e) => setMemberForm({ ...memberForm, temp_password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-red-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNewMemberModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 shadow-md transition cursor-pointer"
                  style={{ fontFamily: "Matter" }}
                >
                  Enroll & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TASK */}
      {newTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-gray-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "Matter" }}>
              Assign New Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build Gym SaaS Dashboard"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specifications, endpoints and guidelines..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600 font-poppins"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Domain</label>
                  <select
                    value={taskForm.domain}
                    onChange={(e) => setTaskForm({ ...taskForm, domain: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900"
                  >
                    <option value="web_dev">Web Development</option>
                    <option value="sales">Sales & Outreach</option>
                    <option value="marketing">Marketing & Reels</option>
                    <option value="design">UI/UX Design</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deadline Date</label>
                <input
                  type="date"
                  required
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNewTaskModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 shadow-md transition cursor-pointer"
                  style={{ fontFamily: "Matter" }}
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE MEETING */}
      {newMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-gray-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "Matter" }}>
              Schedule Meeting
            </h3>
            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1-on-1 Sprint Review"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Agenda / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. API Integration review"
                  value={meetingForm.topic}
                  onChange={(e) => setMeetingForm({ ...meetingForm, topic: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Google Meet / Video Link</label>
                <input
                  type="url"
                  required
                  value={meetingForm.meeting_link}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meeting_link: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNewMeetingModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 shadow-md transition cursor-pointer"
                  style={{ fontFamily: "Matter" }}
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE CERTIFICATE */}
      {newCertModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-gray-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "Matter" }}>
              Issue Verified Certificate
            </h3>
            <form onSubmit={handleCreateCert} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Kumar"
                  value={certForm.intern_name}
                  onChange={(e) => setCertForm({ ...certForm, intern_name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Domain</label>
                <input
                  type="text"
                  required
                  value={certForm.domain}
                  onChange={(e) => setCertForm({ ...certForm, domain: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Grade</label>
                <select
                  value={certForm.performance_grade}
                  onChange={(e) => setCertForm({ ...certForm, performance_grade: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-900"
                >
                  <option value="A+ Outstanding">A+ Outstanding</option>
                  <option value="A Excellent">A Excellent</option>
                  <option value="B+ Good">B+ Good</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNewCertModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 shadow-md transition cursor-pointer"
                  style={{ fontFamily: "Matter" }}
                >
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
