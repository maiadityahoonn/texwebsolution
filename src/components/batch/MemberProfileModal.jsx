"use client";

import { useState } from "react";
import {
  X,
  User,
  ShieldCheck,
  CheckSquare,
  Clock,
  Calendar,
  ExternalLink,
  Star,
  Activity,
  Award,
  AlertTriangle,
  Folder,
} from "lucide-react";
import { safeExternalUrl } from "@/lib/safeUrl";

function WhatsAppIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.972.531 1.777.817 2.796.817 3.18 0 5.767-2.587 5.767-5.768.001-3.181-2.584-5.767-5.767-5.767zm3.364 8.163c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.072-.497-1.756-.728-2.883-2.518-2.97-2.634-.087-.116-.711-.945-.711-1.8 0-.855.449-1.275.609-1.449.16-.174.348-.217.464-.217.116 0 .232.002.333.007.106.005.249-.04.39.299.144.348.492 1.203.535 1.29.043.087.072.189.014.305-.058.116-.087.188-.174.29-.087.102-.183.228-.261.306-.088.087-.179.182-.077.357.102.174.453.747.971 1.209.669.596 1.233.78 1.407.868.174.087.276.072.377-.044.102-.116.435-.508.551-.682.116-.174.232-.145.39-.087.16.058 1.014.478 1.188.565.174.087.29.13.333.203.044.072.044.42-.1.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.178L2 22l4.981-1.306C8.423 21.524 10.158 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.632 0-3.149-.49-4.417-1.332l-.317-.212-2.964.777.791-2.89-.233-.371C3.968 14.869 3.5 13.486 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z"/>
    </svg>
  );
}

export default function MemberProfileModal({
  member,
  onClose,
  batch,
  responsibilityMap,
  tasks = [],
  submissions = [],
  reviews = [],
  attendanceRecords = [],
  onPromoteToTl,
  canPromoteTl = false,
  onSendWhatsapp,
  isDark = false,
  roleLabels = {},
  domainLabel = (d) => d,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!member) return null;

  const memberTasks = tasks.filter((t) => t.assigned_to === member.id || t.assigned_to_profile?.id === member.id);
  const completedTasks = memberTasks.filter((t) => ["approved", "completed"].includes(t.status));
  const overdueTasks = memberTasks.filter((t) => t.deadline && !["approved", "completed"].includes(t.status) && new Date(t.deadline).getTime() < Date.now());
  const memberSubmissions = submissions.filter((s) => s.intern_id === member.id || s.intern?.id === member.id);
  const memberAttendance = attendanceRecords.filter((a) => a.user_id === member.id);
  const presentAttendance = memberAttendance.filter((a) => a.status === "present" || a.status === "late");
  const attendanceRate = memberAttendance.length ? Math.round((presentAttendance.length / memberAttendance.length) * 100) : 100;
  const completionRate = memberTasks.length ? Math.round((completedTasks.length / memberTasks.length) * 100) : 100;

  let attentionStatus = { label: "On Track", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800", icon: "🟢" };
  if (overdueTasks.length >= 2 || (memberAttendance.length >= 2 && attendanceRate < 60)) {
    attentionStatus = { label: "At Risk", badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800", icon: "🔴" };
  } else if (overdueTasks.length === 1 || (memberAttendance.length >= 2 && attendanceRate < 80) || (memberTasks.length >= 3 && completionRate < 50)) {
    attentionStatus = { label: "Needs Attention", badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800", icon: "🟡" };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-200 text-gray-900"
      }`}>
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-lg font-black flex items-center justify-center shrink-0 shadow-md shadow-red-500/20 overflow-hidden">
              {member.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={member.avatar_url} alt={member.full_name || "Profile"} className="w-full h-full object-cover" />
              ) : (
                member.full_name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black truncate">{member.full_name}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${attentionStatus.badge}`}>
                  <span>{attentionStatus.icon}</span>
                  <span>{attentionStatus.label}</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{member.email} {member.phone ? `· ${member.phone}` : ""}</p>
              <div className="flex flex-wrap gap-1.5 mt-1 text-[10.5px]">
                <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {roleLabels[member.role] || member.role}
                </span>
                <span className="px-2 py-0.5 rounded-md font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                  {domainLabel(member.domain)}
                </span>
                <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {member.status || "active"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 px-4 pt-2 border-b border-gray-100 dark:border-slate-800 overflow-x-auto text-xs font-bold">
          {[
            ["overview", "Overview & Team"],
            ["tasks", `Tasks (${memberTasks.length})`],
            ["submissions", `Submissions (${memberSubmissions.length})`],
            ["attendance", `Attendance (${attendanceRate}%)`],
          ].map(([tabKey, label]) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-3 py-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === tabKey
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Responsibility Map */}
              <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-4 bg-gray-50/50 dark:bg-slate-800/30">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2.5">
                  Responsibility Map (Batch: {batch?.name || member.batch_name || "Unassigned"})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Assigned HR</div>
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                      {responsibilityMap?.hr?.full_name || "Unassigned HR"}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{responsibilityMap?.hr?.email || "—"}</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Supervisor Mentor</div>
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                      {responsibilityMap?.mentor?.full_name || "Unassigned Mentor"}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{responsibilityMap?.mentor?.email || "—"}</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Team Leader</div>
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                      {responsibilityMap?.tl?.full_name || "Unassigned TL"}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{responsibilityMap?.tl?.email || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Performance & Health Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 text-center">
                  <div className="text-lg font-black text-gray-900 dark:text-white">{memberTasks.length}</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Total Tasks</div>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 text-center">
                  <div className="text-lg font-black text-emerald-600">{completedTasks.length}</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Completed</div>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 text-center">
                  <div className={`text-lg font-black ${overdueTasks.length ? "text-rose-600" : "text-gray-900 dark:text-white"}`}>
                    {overdueTasks.length}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Overdue Tasks</div>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 text-center">
                  <div className="text-lg font-black text-blue-600">{attendanceRate}%</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Attendance</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                {onSendWhatsapp && member.phone && (
                  <button
                    onClick={() => onSendWhatsapp(member)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    <span>Send WhatsApp Details</span>
                  </button>
                )}
                {canPromoteTl && member.role === "intern" && onPromoteToTl && (
                  <button
                    onClick={() => onPromoteToTl(member)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Make Team Leader</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-2.5">
              {memberTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-slate-500">No tasks assigned to this member yet.</div>
              ) : (
                memberTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-xl border border-gray-200 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-gray-900 dark:text-white">{task.title}</div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        ["approved", "completed"].includes(task.status)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          : task.status === "changes_requested"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    {task.expected_output && (
                      <div className="text-emerald-700 dark:text-emerald-300 mt-1">Expected: {task.expected_output}</div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10.5px] text-gray-400 font-mono">
                      <span>Priority: {task.priority || "Medium"}</span>
                      <span>Due: {task.deadline ? new Date(task.deadline).toLocaleDateString("en-IN") : "Open"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-2.5">
              {memberSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-slate-500">No work submissions yet.</div>
              ) : (
                memberSubmissions.map((sub) => (
                  <div key={sub.id} className="p-3 rounded-xl border border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{sub.task?.title || "Task Work"}</span>
                      <span className="text-[10.5px] text-gray-400 font-mono">
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString("en-IN") : "Recent"}
                      </span>
                    </div>
                    {sub.notes && <p className="text-gray-600 dark:text-slate-300 mt-1">{sub.notes}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sub.submission_url && (
                        <a
                          href={safeExternalUrl(sub.submission_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-red-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Project URL</span>
                        </a>
                      )}
                      {sub.file_url && (
                        <a
                          href={safeExternalUrl(sub.file_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{sub.file_name || "Download Attached File"}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900 dark:text-blue-200">Attendance Rate: {attendanceRate}%</div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-300">
                    Present: {presentAttendance.length} / {memberAttendance.length} recorded sessions
                  </div>
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{attendanceRate}%</div>
              </div>
              {memberAttendance.length === 0 ? (
                <div className="text-center py-6 text-gray-400 dark:text-slate-500">No attendance records found.</div>
              ) : (
                memberAttendance.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{item.attendance_date}</div>
                      <div className="text-[11px] text-gray-400">{item.meeting?.title || item.notes || "Live session attendance"}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                      {item.status || "present"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
