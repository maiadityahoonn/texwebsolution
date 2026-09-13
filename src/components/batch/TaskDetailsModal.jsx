"use client";

import { X, CheckSquare, Clock, Calendar, ExternalLink, Star, ArrowRight, User, Send, Award, FileText, Folder, Globe } from "lucide-react";
import { safeExternalUrl } from "@/lib/safeUrl";

export default function TaskDetailsModal({
  task,
  onClose,
  submissions = [],
  reviews = [],
  onSubmitWork,
  onReviewTask,
  currentUserId,
  currentUserRole,
  isDark = false,
  localDate = (d) => d,
}) {
  if (!task) return null;

  const taskSubmissions = submissions.filter((s) => s.task_id === task.id || s.task?.id === task.id);
  const latestSubmission = taskSubmissions[0] || null;
  const taskReviews = reviews.filter((r) => r.task_id === task.id);

  const isAssignedToMe = task.assigned_to === currentUserId || (currentUserRole === "intern" && task.visible_to_interns);
  const canSubmit = isAssignedToMe && !["approved", "completed"].includes(task.status);
  const canReview = ["mentor", "team_leader", "super_admin", "hr"].includes(currentUserRole) && latestSubmission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-200 text-gray-900"
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black truncate">{task.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase border ${
                  ["approved", "completed"].includes(task.status)
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : task.status === "changes_requested"
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                }`}>
                  {task.status?.replace("_", " ") || "Pending"}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Priority: {task.priority || "Medium"} · Deadline: {localDate(task.deadline)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Description & Requirements */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
              Description & Work Requirements
            </div>
            <p className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Expected Output */}
          {task.expected_output && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                Expected Output
              </div>
              <p className="p-3 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 leading-relaxed text-emerald-950 dark:text-emerald-200">
                {task.expected_output}
              </p>
            </div>
          )}

          {/* Attachments & References (PRD §26: File / Link Sharing) */}
          {(task.reference_url || task.file_url) && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
                Shared Files & Reference Links
              </div>
              <div className="flex flex-wrap gap-2">
                {task.reference_url && (() => {
                  const url = task.reference_url.toLowerCase();
                  const isGithub = url.includes("github.com");
                  const isFigma = url.includes("figma.com");
                  const isDrive = url.includes("drive.google.com") || url.includes("docs.google.com");
                  return (
                    <a
                      href={safeExternalUrl(task.reference_url)}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition shadow-2xs ${
                        isGithub
                          ? "bg-gray-900 text-white border-gray-900 dark:bg-slate-800 dark:border-slate-700 hover:bg-black"
                          : isFigma
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 hover:bg-purple-100"
                          : isDrive
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      {isGithub ? (
                        <Folder className="w-3.5 h-3.5" />
                      ) : isFigma ? (
                        <Globe className="w-3.5 h-3.5" />
                      ) : isDrive ? (
                        <FileText className="w-3.5 h-3.5" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isGithub
                          ? "GitHub Repository"
                          : isFigma
                          ? "Figma Design"
                          : isDrive
                          ? "Google Drive Asset"
                          : "Live Project Link"}
                      </span>
                    </a>
                  );
                })()}
                {task.file_url && (
                  <a
                    href={safeExternalUrl(task.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{task.file_name || "Attached PDF / Document"}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Chronological Activity Timeline (PRD Section 12) */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">
              Task Activity Timeline
            </div>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-slate-800">
              {/* Event 1: Creation */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-white dark:ring-slate-900" />
                <div className="font-bold text-gray-900 dark:text-white">Task Assigned</div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Created by Mentor/Supervisor · {localDate(task.created_at)}
                </div>
              </div>

              {/* Event 2: Submissions */}
              {taskSubmissions.map((sub, i) => (
                <div key={sub.id || i} className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                  <div className="font-bold text-gray-900 dark:text-white">
                    Work Submitted {taskSubmissions.length > 1 ? `(#${taskSubmissions.length - i})` : ""}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {sub.intern?.full_name || "Intern"} · {localDate(sub.submitted_at || sub.created_at)}
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
                        <span>Project / GitHub Link</span>
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
                        <span>{sub.file_name || "Attachment"}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* Event 3: Reviews */}
              {taskReviews.map((rev, i) => (
                <div key={rev.id || i} className="relative">
                  <span className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                    rev.status === "approved" ? "bg-emerald-600" : "bg-amber-500"
                  }`} />
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Reviewed by Mentor: {rev.status === "approved" ? "Approved" : "Changes Requested"}</span>
                    {rev.rating && (
                      <span className="inline-flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-black text-[11px]">{rev.rating}/5</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{localDate(rev.created_at)}</div>
                  {rev.feedback && (
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 mt-1.5 text-gray-700 dark:text-slate-300">
                      &quot;{rev.feedback}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-2">
          {canSubmit && (
            <button
              onClick={() => {
                onClose();
                onSubmitWork(task.id);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Work</span>
            </button>
          )}
          {canReview && (
            <button
              onClick={() => {
                onClose();
                onReviewTask(task);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Review Submission</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
