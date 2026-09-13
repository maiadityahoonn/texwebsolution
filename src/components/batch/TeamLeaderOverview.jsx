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
} from "lucide-react";
import { safeExternalUrl } from "@/lib/safeUrl";

function WhatsAppIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.972.531 1.777.817 2.796.817 3.18 0 5.767-2.587 5.767-5.768.001-3.181-2.584-5.767-5.767-5.767zm3.364 8.163c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.072-.497-1.756-.728-2.883-2.518-2.97-2.634-.087-.116-.711-.945-.711-1.8 0-.855.449-1.275.609-1.449.16-.174.348-.217.464-.217.116 0 .232.002.333.007.106.005.249-.04.39.299.144.348.492 1.203.535 1.29.043.087.072.189.014.305-.058.116-.087.188-.174.29-.087.102-.183.228-.261.306-.088.087-.179.182-.077.357.102.174.453.747.971 1.209.669.596 1.233.78 1.407.868.174.087.276.072.377-.044.102-.116.435-.508.551-.682.116-.174.232-.145.39-.087.16.058 1.014.478 1.188.565.174.087.29.13.333.203.044.072.044.42-.1.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.178L2 22l4.981-1.306C8.423 21.524 10.158 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.632 0-3.149-.49-4.417-1.332l-.317-.212-2.964.777.791-2.89-.233-.371C3.968 14.869 3.5 13.486 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z"/>
    </svg>
  );
}

export default function TeamLeaderOverview({
  userProfile,
  batch,
  mentor,
  interns = [],
  tasks = [],
  dailyUpdates = [],
  meetings = [],
  attendanceRecords = [],
  onOpenDailyReportModal,
  onOpenMemberProfile,
  onOpenTaskDetails,
  onOpenWorkspace,
  onScheduleMeeting,
  onOpenEscalationModal,
  isDark = false,
  domainLabel = (d) => d,
  localDate = (d) => d,
}) {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Check if daily report already submitted today
  const todayDailyReport = dailyUpdates.find((u) => {
    const reportDate = u.created_at ? u.created_at.slice(0, 10) : "";
    return reportDate === todayStr && (u.batch_id === batch?.id || u.tl_id === userProfile?.id);
  });

  // Today's meetings
  const todayMeetings = meetings.filter((m) => {
    if (!m.scheduled_at) return false;
    return m.scheduled_at.startsWith(todayStr);
  });

  const batchTasks = tasks.filter((t) => t.batch_id === batch?.id || !t.batch_id);
  const overdueTasks = batchTasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date() && !["approved", "completed"].includes(t.status)
  );

  const handleWhatsapp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(`Hi ${name}, this is ${userProfile?.full_name || "TL"} from batch ${batch?.name || ""}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Batch Info Card */}
        <div className={`md:col-span-2 p-5 rounded-2xl border ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
        } shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                    Team Leader Panel
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {domainLabel(batch?.domain || userProfile?.domain)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {batch?.name || "Assigned Batch"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Supervisor Mentor: <span className="font-semibold text-gray-800 dark:text-slate-200">{mentor?.full_name || "Unassigned"}</span> • Team Size: <span className="font-bold text-red-600">{interns.length} Interns</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {batch && (
                  <button
                    onClick={() => onOpenWorkspace(batch.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-700 dark:text-slate-200 hover:text-red-600 transition flex items-center gap-1.5"
                  >
                    <span>Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick TL Actions */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenDailyReportModal()}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm active:scale-95 ${
                todayDailyReport
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/20"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{todayDailyReport ? "Daily Report Submitted (Edit)" : "Submit Today's Daily Report"}</span>
            </button>

            <button
              onClick={onScheduleMeeting}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 flex items-center gap-1.5 transition"
            >
              <Video className="w-3.5 h-3.5 text-red-600" />
              <span>Schedule Standup</span>
            </button>

            <button
              onClick={onOpenEscalationModal}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 text-amber-700 dark:text-amber-300 flex items-center gap-1.5 transition ml-auto"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Raise Escalation</span>
            </button>
          </div>
        </div>

        {/* Daily Report Status Banner */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
        } shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Daily Report Status
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                todayDailyReport
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200 animate-pulse"
              }`}>
                {todayDailyReport ? "Submitted" : "Pending Today"}
              </span>
            </div>

            <div className="mt-4">
              {todayDailyReport ? (
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Summary submitted
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {todayDailyReport.summary}
                  </p>
                  {todayDailyReport.reviewer_comment && (
                    <div className="mt-2 text-[11px] p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                      <span className="font-bold">Mentor Comment:</span> {todayDailyReport.reviewer_comment}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-sm font-bold text-red-600">
                    Action required today
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Conduct your daily standup meeting and submit member progress, blockers, and plans.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-gray-500">Overdue Batch Tasks</span>
            <span className={`font-bold ${overdueTasks.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {overdueTasks.length} {overdueTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S MEETING BANNER */}
      {todayMeetings.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600/10 via-rose-600/5 to-transparent border border-red-200/80 dark:border-red-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Today's Standup</div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {todayMeetings[0].title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{new Date(todayMeetings[0].scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <a
              href={safeExternalUrl(todayMeetings[0].meeting_link || "https://meet.google.com/new")}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm justify-center flex-1 sm:flex-none"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Meeting</span>
            </a>
          </div>
        </div>
      )}

      {/* 3. MY TEAM TABLE (PRD Section 40) */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
      } shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              <span>My Team Members ({interns.length})</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Click any member to open their complete responsibility map, attendance, and task history.
            </p>
          </div>
        </div>

        {interns.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            No interns currently in this batch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Responsibility / Role</th>
                  <th className="py-3 px-3 text-center">Attendance %</th>
                  <th className="py-3 px-3 text-center">Pending Tasks</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {interns.map((intern) => {
                  const internAtt = attendanceRecords.filter((a) => a.user_id === intern.id);
                  const attRate = internAtt.length > 0
                    ? Math.round((internAtt.filter((a) => a.status === "present").length / internAtt.length) * 100)
                    : 100;

                  const internPendingTasks = tasks.filter(
                    (t) => (t.assigned_to === intern.id || t.visible_to_interns) && !["approved", "completed"].includes(t.status)
                  );

                  return (
                    <tr
                      key={intern.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => onOpenMemberProfile(intern)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 font-bold flex items-center justify-center text-xs shrink-0">
                            {(intern.full_name || "I")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition">
                              {intern.full_name}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
                              {intern.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-gray-700 dark:text-slate-300">
                          {domainLabel(intern.domain)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          attRate >= 85
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : attRate >= 70
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}>
                          {attRate}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-gray-700 dark:text-slate-300">
                          {internPendingTasks.length}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {intern.phone && (
                            <button
                              onClick={() => handleWhatsapp(intern.phone, intern.full_name)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                              title="Chat on WhatsApp"
                            >
                              <WhatsAppIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onOpenMemberProfile(intern)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-700 dark:text-slate-200 hover:text-red-600 transition"
                          >
                            Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. RECENT DAILY REPORTS SECTION */}
      {dailyUpdates.length > 0 && (
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>Recent Daily Reports ({dailyUpdates.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {dailyUpdates.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {report.created_at ? localDate(report.created_at) : "Recent Report"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    report.reviewer_comment
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}>
                    {report.reviewer_comment ? "Mentor Feedback Received" : "Awaiting Mentor Review"}
                  </span>
                </div>

                <div className="text-gray-600 dark:text-slate-300">
                  <span className="font-semibold text-gray-800 dark:text-white">Summary:</span> {report.summary}
                </div>

                {report.blockers && (
                  <div className="text-amber-600 dark:text-amber-400">
                    <span className="font-semibold">Blockers:</span> {report.blockers}
                  </div>
                )}

                {report.reviewer_comment && (
                  <div className="mt-2 p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                    <span className="font-bold">Mentor Comment:</span> "{report.reviewer_comment}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
