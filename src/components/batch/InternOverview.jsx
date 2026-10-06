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
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { safeExternalUrl } from "@/lib/safeUrl";

export default function InternOverview({
  userProfile,
  batch,
  mentor,
  teamLeader,
  tasks = [],
  submissions = [],
  reviews = [],
  meetings = [],
  attendanceRecords = [],
  onOpenTaskDetails,
  onSubmitWork,
  onOpenWorkspace,
  onMarkAttendance,
  onStartChat,
  isDark = false,
  domainLabel = (d) => d,
  localDate = (d) => d,
}) {
  const myTasks = tasks.filter(
    (t) => t.assigned_to === userProfile?.id || t.visible_to_interns
  );

  const pendingTasks = myTasks.filter((t) => !["approved", "completed"].includes(t.status));
  const completedTasks = myTasks.filter((t) => ["approved", "completed"].includes(t.status));

  // Today's meetings
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMeetings = meetings.filter((m) => {
    if (!m.scheduled_at) return false;
    return m.scheduled_at.startsWith(todayStr);
  });

  // Attendance stats
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === "present").length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

  // Latest feedback
  const latestReview = reviews[0] || null;
  const latestTaskReviewed = latestReview ? tasks.find((t) => t.id === latestReview.task_id) : null;

  const handleWhatsapp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(`Hi ${name}, this is ${userProfile?.full_name || "Intern"} from batch ${batch?.name || ""}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="workspace-overview space-y-4 sm:space-y-6">
      {/* 1. TOP CARDS: My Batch & Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Batch Info Card */}
        <div className={`md:col-span-2 p-5 rounded-2xl border ${
          isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
        } shadow-sm relative overflow-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
                  {batch?.batch_type || "Internship"} Batch
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  {domainLabel(batch?.domain || userProfile?.domain)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {batch?.name || "Assigned Batch"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Started {batch?.starts_at ? localDate(batch.starts_at) : "Recently"} • Status: <span className="text-emerald-600 font-bold capitalize">{batch?.status || "Active"}</span>
              </p>
            </div>

            {batch && (
              <button
                onClick={() => onOpenWorkspace(batch.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-700 dark:text-slate-200 hover:text-red-600 transition flex items-center gap-1.5 self-start sm:self-center"
              >
                <span>Batch Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Leaders section */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  TL
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400 dark:text-slate-400 font-medium">Team Leader</div>
                  <div className="font-bold text-gray-900 dark:text-white truncate">
                    {teamLeader?.full_name || "Unassigned"}
                  </div>
                </div>
              </div>
              {teamLeader?.id && onStartChat && (
                <button
                  onClick={() => onStartChat(teamLeader.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                  title="Chat with Team Leader"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                  M
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400 dark:text-slate-400 font-medium">Supervisor Mentor</div>
                  <div className="font-bold text-gray-900 dark:text-white truncate">
                    {mentor?.full_name || "Unassigned"}
                  </div>
                </div>
              </div>
              {mentor?.id && onStartChat && (
                <button
                  onClick={() => onStartChat(mentor.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                  title="Chat with Mentor"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
        } shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                My Attendance
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                attendanceRate >= 85
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : attendanceRate >= 70
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {attendanceRate >= 85 ? "🟢 Excellent" : attendanceRate >= 70 ? "🟡 Needs Attention" : "🔴 At Risk"}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{attendanceRate}%</span>
              <span className="text-xs text-gray-400 dark:text-slate-400 font-medium">overall rate</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  attendanceRate >= 85 ? "bg-emerald-500" : attendanceRate >= 70 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, attendanceRate)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800/40">
              <div className="font-extrabold text-emerald-600">{presentCount}</div>
              <div className="text-[10px] text-gray-400">Present Days</div>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800/40">
              <div className="font-extrabold text-red-500">{totalAttendance - presentCount}</div>
              <div className="text-[10px] text-gray-400">Absent Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S MEETING BANNER */}
      {todayMeetings.length > 0 && (() => {
        const currentMeeting = todayMeetings[0];
        const isMeetingEnded = currentMeeting?.status === "completed" || currentMeeting?.status === "cancelled";
        const isMeetingLive = !isMeetingEnded && (
          Boolean(currentMeeting?.attendance_token?.includes("#live:")) ||
          currentMeeting?.status === "in_progress" ||
          currentMeeting?.status === "live"
        );
        const isAttendanceMarkedToday = attendanceRecords.some((a) => {
          if (currentMeeting?.id && a.meeting_id === currentMeeting.id) return true;
          const todayStr = new Date().toISOString().slice(0, 10);
          return a.attendance_date === todayStr && a.user_id === userProfile?.id;
        });

        return (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600/10 via-rose-600/5 to-transparent border border-red-200/80 dark:border-red-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-md ${
                isMeetingEnded ? "bg-gray-400 dark:bg-slate-700" : isMeetingLive ? "bg-red-600 shadow-red-500/20" : "bg-blue-600 shadow-blue-500/20"
              }`}>
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Today's Daily Standup</span>
                  {isMeetingEnded ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                      Ended
                    </span>
                  ) : isMeetingLive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Live Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <Clock className="w-2.5 h-2.5" />
                      Scheduled
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
                  {currentMeeting.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(currentMeeting.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {currentMeeting.topic && <span>• Topic: {currentMeeting.topic}</span>}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
              {/* Attendance Button: ONLY active between meeting start and end */}
              {isMeetingEnded ? (
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-800 bg-gray-100/80 dark:bg-slate-800/80 text-gray-400 dark:text-slate-500 cursor-not-allowed opacity-60 flex items-center gap-1.5 select-none"
                  title="Meeting has ended. Attendance is closed."
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Attendance Closed</span>
                </button>
              ) : isMeetingLive ? (
                isAttendanceMarkedToday ? (
                  <span className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attendance Marked</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onMarkAttendance && onMarkAttendance(currentMeeting)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 transition shadow-sm hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                    title="Mark your attendance for this live meeting"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Mark Attendance</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-800 bg-gray-100/70 dark:bg-slate-800/70 text-gray-400 dark:text-slate-500 cursor-not-allowed opacity-60 flex items-center gap-1.5 select-none"
                  title="Attendance opens only during the live meeting."
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Opens on Meeting Start</span>
                </button>
              )}

              {/* Join Button: ONLY enabled when meeting has started */}
              {isMeetingEnded ? (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-not-allowed opacity-60 justify-center select-none"
                  title="This meeting has ended."
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Meeting Ended</span>
                </button>
              ) : isMeetingLive ? (
                <a
                  href={safeExternalUrl(currentMeeting.meeting_link || "https://meet.google.com/new")}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-red-500/20 self-stretch sm:self-auto justify-center active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Meeting</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-not-allowed opacity-60 justify-center select-none"
                  title="Meeting has not started yet. Button will enable when host starts the meeting."
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Waiting for Host to Start</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* 3. MY TASKS & DEADLINES (PRD Section 39) */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
      } shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-red-600" />
              <span>My Tasks & Deadlines</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Tasks assigned to you. Submit your work directly for review.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-bold">
              {pendingTasks.length} Pending
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold">
              {completedTasks.length} Done
            </span>
          </div>
        </div>

        {myTasks.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-xs">
            No tasks assigned yet. Your Team Leader or Mentor will assign tasks soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {myTasks.map((task) => {
              const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !["approved", "completed"].includes(task.status);
              const isApproved = ["approved", "completed"].includes(task.status);
              const isSubmitted = task.status === "submitted" || task.status === "reviewed";

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                    isOverdue
                      ? "border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10"
                      : isDark
                      ? "bg-slate-800/40 border-slate-700/80 hover:border-slate-600"
                      : "bg-gray-50/60 border-gray-200/80 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : isSubmitted
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : isOverdue
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 animate-pulse"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}>
                        {isOverdue ? "Overdue" : task.status.replace("_", " ")}
                      </span>

                      <span className={`text-[11px] font-bold flex items-center gap-1 ${
                        isOverdue ? "text-red-600" : "text-gray-500 dark:text-slate-400"
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>Due: {localDate(task.deadline)}</span>
                      </span>
                    </div>

                    <h4
                      onClick={() => onOpenTaskDetails(task)}
                      className="font-bold text-sm text-gray-900 dark:text-white hover:text-red-600 transition cursor-pointer"
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {task.description}
                      </p>
                    )}

                    {task.expected_output && (
                      <div className="mt-2 text-[11px] text-gray-600 dark:text-slate-300 bg-white/70 dark:bg-transparent p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                        <span className="font-bold text-red-600">Expected:</span> {task.expected_output}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-slate-700/60 text-xs">
                    <button
                      onClick={() => onOpenTaskDetails(task)}
                      className="font-bold text-gray-600 dark:text-slate-300 hover:text-red-600 flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    {!isApproved && (
                      <button
                        onClick={() => onSubmitWork(task.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center gap-1.5 shadow-xs transition active:scale-95"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isSubmitted ? "Re-submit" : "Submit Work"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RECENT FEEDBACK SECTION */}
      {latestReview && (
        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Latest Mentor Feedback</span>
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{latestReview.rating || 5} / 5</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-xs">
            <div className="font-semibold text-gray-900 dark:text-white mb-1">
              Task: {latestTaskReviewed?.title || "Project Task"}
            </div>
            <p className="text-gray-600 dark:text-slate-300 italic">
              "{latestReview.feedback || "Good progress, keep it up!"}"
            </p>
            <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
              <span>Reviewed by Mentor</span>
              <span>{localDate(latestReview.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
