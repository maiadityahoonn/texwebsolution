"use client";

import { AlertCircle, AlertTriangle, CheckSquare, ChevronRight, FileText, Folder, Send, Users } from "lucide-react";

export default function SupervisionPulsePanel({
  title = "Supervision Pulse",
  subtitle = "Open escalations, risk alerts, and reports needing attention.",
  batches = [],
  profiles = [],
  tasks = [],
  submissions = [],
  dailyUpdates = [],
  escalations = [],
  attendanceRecords = [],
  showSubmissions = false,
  onNavigateSection,
  onOpenWorkspace,
  onOpenMemberProfile,
  isDark = false,
  domainLabel = (d) => d,
}) {
  const batchIds = new Set(batches.map((batch) => batch.id).filter(Boolean));
  const batchInterns = profiles.filter((profile) => profile.role === "intern" && batchIds.has(profile.batch_id));
  const pendingReports = dailyUpdates.filter((update) => batchIds.has(update.batch_id) && !update.reviewer_comment);
  const pendingSubmissions = submissions.filter((submission) => {
    const task = tasks.find((item) => item.id === submission.task_id);
    return task && batchIds.has(task.batch_id) && !["approved", "completed"].includes(task.status);
  });
  const openEscalations = escalations.filter((item) => batchIds.has(item.batch_id) && item.status === "open");
  const atRiskMembers = batchInterns
    .map((intern) => {
      const memberAttendance = attendanceRecords.filter((item) => item.user_id === intern.id);
      const attendanceRate = memberAttendance.length
        ? Math.round((memberAttendance.filter((item) => item.status === "present" || item.status === "late").length / memberAttendance.length) * 100)
        : 100;
      const overdueTasks = tasks.filter(
        (task) =>
          (task.assigned_to === intern.id || (task.visible_to_interns && task.batch_id === intern.batch_id)) &&
          task.deadline &&
          new Date(task.deadline).getTime() < Date.now() &&
          !["approved", "completed"].includes(task.status)
      );
      const riskLevel = attendanceRate < 70 || overdueTasks.length >= 2 ? "critical" : attendanceRate < 85 || overdueTasks.length >= 1 ? "warning" : "good";
      return { ...intern, attendanceRate, overdueCount: overdueTasks.length, riskLevel };
    })
    .filter((member) => member.riskLevel !== "good")
    .sort((a, b) => (a.riskLevel === "critical" ? -1 : 1));

  const cards = [
    {
      label: "Open Escalations",
      value: openEscalations.length,
      helper: "Needs owner action",
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-transparent",
      border: "border-amber-200 dark:border-slate-800/80",
      section: "review_center",
    },
    {
      label: "Risk Alerts",
      value: atRiskMembers.length,
      helper: "Attendance / overdue",
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-transparent",
      border: "border-rose-200 dark:border-slate-800/80",
      section: "at_risk_watchlist",
    },
    {
      label: "Pending Reports",
      value: pendingReports.length,
      helper: "Daily updates waiting",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-transparent",
      border: "border-blue-200 dark:border-slate-800/80",
      section: "daily_updates",
    },
    ...(showSubmissions
      ? [
          {
            label: "Task Submissions",
            value: pendingSubmissions.length,
            helper: "Pending evaluation",
            icon: Send,
            color: "text-indigo-600",
            bg: "bg-indigo-50 dark:bg-transparent",
            border: "border-indigo-200 dark:border-slate-800/80",
            section: "task_submissions",
          },
        ]
      : []),
  ];

  return (
    <div className={`p-5 rounded-2xl border ${isDark ? "bg-transparent border-slate-800/80 dark:border-slate-800/80" : "bg-white border-gray-200/80"} shadow-sm`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-red-600" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-slate-800/80 font-bold">
            <Folder className="w-3.5 h-3.5 text-red-600" />
            {batches.length} batches
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-slate-800/80 font-bold">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            {batchInterns.length} interns
          </span>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${showSubmissions ? "xl:grid-cols-4" : "xl:grid-cols-3"} gap-3`}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onNavigateSection?.(card.section)}
              className={`text-left p-3.5 rounded-xl border ${card.border} ${card.bg} transition ${onNavigateSection ? "hover:shadow-md cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                  <div className="text-xs font-black text-gray-900 dark:text-white mt-1">{card.label}</div>
                  <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{card.helper}</div>
                </div>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </button>
          );
        })}
      </div>

      {(openEscalations.length > 0 || atRiskMembers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl border border-gray-200 dark:border-slate-800/80 bg-transparent dark:bg-transparent p-3">
            <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Open Escalations</div>
            {openEscalations.slice(0, 3).map((item) => {
              const batch = batches.find((b) => b.id === item.batch_id);
              return (
                <button key={item.id} type="button" onClick={() => onOpenWorkspace?.(item.batch_id)} className="w-full flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-slate-800/80 last:border-0 text-left">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-gray-900 dark:text-white truncate">{item.issue || "Escalation"}</div>
                    <div className="text-[11px] text-gray-400 truncate">{batch?.name || "Batch"} - {item.priority || "normal"}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
              );
            })}
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-800/80 bg-transparent dark:bg-transparent p-3">
            <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Risk Alerts</div>
            {atRiskMembers.slice(0, 3).map((member) => {
              const batch = batches.find((b) => b.id === member.batch_id);
              return (
                <button key={member.id} type="button" onClick={() => onOpenMemberProfile?.(member)} className="w-full flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-slate-800/80 last:border-0 text-left">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-gray-900 dark:text-white truncate">{member.full_name}</div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {batch?.name || domainLabel(member.domain)} - {member.attendanceRate}% attendance - {member.overdueCount} overdue
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
