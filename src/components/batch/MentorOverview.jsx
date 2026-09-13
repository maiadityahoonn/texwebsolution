"use client";

import { useState } from "react";
import {
  Folder,
  Calendar,
  Clock,
  Video,
  CheckSquare,
  AlertCircle,
  Award,
  ExternalLink,
  Send,
  Star,
  User,
  Users,
  ShieldCheck,
  ChevronRight,
  Plus,
  FileText,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { safeExternalUrl } from "@/lib/safeUrl";

function WhatsAppIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.972.531 1.777.817 2.796.817 3.18 0 5.767-2.587 5.767-5.768.001-3.181-2.584-5.767-5.767-5.767zm3.364 8.163c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.072-.497-1.756-.728-2.883-2.518-2.97-2.634-.087-.116-.711-.945-.711-1.8 0-.855.449-1.275.609-1.449.16-.174.348-.217.464-.217.116 0 .232.002.333.007.106.005.249-.04.39.299.144.348.492 1.203.535 1.29.043.087.072.189.014.305-.058.116-.087.188-.174.29-.087.102-.183.228-.261.306-.088.087-.179.182-.077.357.102.174.453.747.971 1.209.669.596 1.233.78 1.407.868.174.087.276.072.377-.044.102-.116.435-.508.551-.682.116-.174.232-.145.39-.087.16.058 1.014.478 1.188.565.174.087.29.13.333.203.044.072.044.42-.1.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.178L2 22l4.981-1.306C8.423 21.524 10.158 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.632 0-3.149-.49-4.417-1.332l-.317-.212-2.964.777.791-2.89-.233-.371C3.968 14.869 3.5 13.486 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z"/>
    </svg>
  );
}

export default function MentorOverview({
  userProfile,
  batches = [],
  profiles = [],
  tasks = [],
  submissions = [],
  dailyUpdates = [],
  escalations = [],
  attendanceRecords = [],
  onOpenWorkspace,
  onOpenMemberProfile,
  onOpenTaskDetails,
  onReviewSubmission,
  onCommentDailyUpdate,
  onResolveEscalation,
  onAssignTask,
  onScheduleMeeting,
  onNavigateSection,
  onOpenChatWithUser,
  isDark = false,
  domainLabel = (d) => d,
  localDate = (d) => d,
}) {
  // Batch IDs supervised by mentor
  const supervisedBatchIds = new Set(batches.map((b) => b.id));

  // Interns in these batches
  const batchInterns = profiles.filter(
    (p) => p.role === "intern" && supervisedBatchIds.has(p.batch_id)
  );

  // Review Center Items:
  // 1. Pending TL reports (no reviewer comment yet)
  const pendingReports = dailyUpdates.filter(
    (u) => supervisedBatchIds.has(u.batch_id) && !u.reviewer_comment
  );

  // 2. Pending Submissions (latest submissions whose task is not approved yet)
  const pendingSubmissions = submissions.filter((s) => {
    const task = tasks.find((t) => t.id === s.task_id);
    return task && supervisedBatchIds.has(task.batch_id) && !["approved", "completed"].includes(task.status);
  });

  // 3. Open Escalations
  const openEscalations = escalations.filter(
    (e) => supervisedBatchIds.has(e.batch_id) && e.status === "open"
  );

  const totalNeedsReview = pendingReports.length + pendingSubmissions.length + openEscalations.length;

  // At-Risk Members (<70% attendance or with overdue tasks)
  const atRiskMembers = batchInterns
    .map((intern) => {
      const userAtt = attendanceRecords.filter((a) => a.user_id === intern.id);
      const attRate = userAtt.length > 0
        ? Math.round((userAtt.filter((a) => a.status === "present").length / userAtt.length) * 100)
        : 100;

      const overdueCount = tasks.filter(
        (t) => (t.assigned_to === intern.id || t.visible_to_interns) &&
          t.deadline && new Date(t.deadline) < new Date() &&
          !["approved", "completed"].includes(t.status)
      ).length;

      let riskLevel = "good";
      if (attRate < 70 || overdueCount >= 2) riskLevel = "critical";
      else if (attRate < 85 || overdueCount >= 1) riskLevel = "warning";

      return {
        ...intern,
        attendanceRate: attRate,
        overdueCount,
        riskLevel,
      };
    })
    .filter((m) => m.riskLevel !== "good")
    .sort((a, b) => (a.riskLevel === "critical" ? -1 : 1));

  const handleWhatsapp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(`Hi ${name}, this is ${userProfile?.full_name || "Mentor"}. I wanted to check in on your batch progress.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* 0. BRANDED HERO WELCOME CARD - MENTOR SUPERVISION MODE */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 dark:border-slate-800 bg-gradient-to-r from-red-50/70 via-rose-50/40 to-amber-50/30 dark:from-red-950/25 dark:via-slate-900 dark:to-slate-900/90 p-4 sm:p-5 backdrop-blur-xs transition-all shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  Welcome back, {userProfile?.full_name || "Mentor"} 👋
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supervisor Mode
                </span>
                {pendingSubmissions.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {pendingSubmissions.length} Pending Submissions
                  </span>
                )}
                {openEscalations.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                    {openEscalations.length} Open Escalations
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Supervising {batches.length} active batches and {batchInterns.length} batch interns. Review student task submissions, track escalations, and monitor at-risk interns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-gray-200/80 dark:border-slate-800 flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span className="font-semibold text-[11px]">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {onNavigateSection && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateSection("task_submissions")}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submissions ({pendingSubmissions.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection("review_center")}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Escalations ({openEscalations.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection("at_risk_watchlist")}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Watchlist ({atRiskMembers.length})</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 1. TOP METRICS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>My Batches</span>
            <Folder className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">
            {batches.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Active supervised batches</div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Interns Supervised</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">
            {batchInterns.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Total batch members</div>
        </div>

        <div
          onClick={() => onNavigateSection?.("task_submissions")}
          className={`p-4 rounded-2xl border transition ${
            onNavigateSection ? "cursor-pointer hover:border-indigo-400 hover:shadow-md group" : ""
          } ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
          } shadow-sm relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-xs text-indigo-600 font-bold uppercase tracking-wider">
            <span>Task Submissions</span>
            <Send className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">
            {pendingSubmissions.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-0.5">
            <span>Pending evaluation</span>
            {onNavigateSection && (
              <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Review <ChevronRight className="w-3 h-3 inline" />
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => onNavigateSection?.("review_center")}
          className={`p-4 rounded-2xl border transition ${
            onNavigateSection ? "cursor-pointer hover:border-amber-400 hover:shadow-md group" : ""
          } ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
          } shadow-sm relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-xs text-amber-600 font-bold uppercase tracking-wider">
            <span>Open Escalations</span>
            <AlertCircle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            {openEscalations.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-0.5">
            <span>Action required</span>
            {onNavigateSection && (
              <span className="text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Resolve <ChevronRight className="w-3 h-3 inline" />
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => onNavigateSection?.("at_risk_watchlist")}
          className={`p-4 rounded-2xl border transition ${
            onNavigateSection ? "cursor-pointer hover:border-rose-400 hover:shadow-md group" : ""
          } ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
          } shadow-sm`}
        >
          <div className="flex items-center justify-between text-xs text-rose-600 font-bold uppercase tracking-wider">
            <span>At-Risk Members</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600">
            {atRiskMembers.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-0.5">
            <span>Low attendance / overdue</span>
            {onNavigateSection && (
              <span className="text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Watchlist <ChevronRight className="w-3 h-3 inline" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. AT-RISK MEMBERS ("NEEDS ATTENTION") */}
      {atRiskMembers.length > 0 && (
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>At-Risk Members ({atRiskMembers.length})</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Interns requiring mentor intervention due to low attendance (&lt;70%) or multiple overdue tasks.
              </p>
            </div>

            {onNavigateSection && (
              <button
                type="button"
                onClick={() => onNavigateSection("at_risk_watchlist")}
                className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer self-start sm:self-center"
              >
                <span>Full Watchlist Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskMembers.map((member) => {
              const b = batches.find((item) => item.id === member.batch_id);

              return (
                <div
                  key={member.id}
                  onClick={() => onOpenMemberProfile(member)}
                  className="p-3.5 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:border-red-300 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-red-600 font-bold flex items-center justify-center text-xs shrink-0">
                      {(member.full_name || "I")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">
                        {member.full_name}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">
                        {b?.name || "Batch"} • Att: <span className={member.attendanceRate < 70 ? "text-red-500 font-bold" : "text-amber-500 font-bold"}>{member.attendanceRate}%</span> • Overdue: <span className="text-red-500 font-bold">{member.overdueCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onOpenChatWithUser ? onOpenChatWithUser(member.id) : handleWhatsapp(member.phone, member.full_name)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition"
                      title="Chat in Workspace"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenMemberProfile(member)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:text-red-600"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MY SUPERVISED BATCHES */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
      } shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-red-600" />
              <span>Supervised Batches ({batches.length})</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Batches assigned to you for mentorship and quality oversight.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAssignTask}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Task</span>
            </button>
            <button
              onClick={onScheduleMeeting}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 flex items-center gap-1.5 transition"
            >
              <Video className="w-3.5 h-3.5 text-red-600" />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {batches.map((batch) => {
            const internsCount = profiles.filter((p) => p.batch_id === batch.id && p.role === "intern").length;
            const tlProfile = profiles.find((p) => (p.batch_id === batch.id && p.role === "team_leader") || p.id === batch.tl_id);

            return (
              <div
                key={batch.id}
                className="p-4 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/30 hover:border-red-300 transition flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/50 dark:border-red-900">
                      {batch.batch_type || "Internship"}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {domainLabel(batch.domain)}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {batch.name}
                  </h4>

                  <div className="mt-3 space-y-1 text-gray-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Team Leader:</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200">
                        {tlProfile?.full_name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Interns Count:</span>
                      <span className="font-bold text-red-600">{internsCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Started {batch.starts_at ? localDate(batch.starts_at) : "Recently"}
                  </span>
                  <button
                    onClick={() => onOpenWorkspace(batch.id)}
                    className="px-3 py-1.5 rounded-xl font-bold bg-gray-100 dark:bg-slate-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-1"
                  >
                    <span>Workspace</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
