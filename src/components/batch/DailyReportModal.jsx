"use client";

import { useState } from "react";
import { X, FileText, CheckCircle2, AlertCircle, Plus, Users, Calendar, Video } from "lucide-react";

export default function DailyReportModal({
  isOpen,
  onClose,
  onSubmit,
  batch,
  batchInterns = [],
  todayMeetings = [],
  initialData = {},
  isDark = false,
}) {
  const [formData, setFormData] = useState(() => ({
    date: initialData.date || new Date().toISOString().slice(0, 10),
    batch_id: batch?.id || initialData.batch_id || "",
    meeting_id: initialData.meeting_id || (todayMeetings[0]?.id || ""),
    summary: initialData.summary || "",
    blockers: initialData.blockers || "",
    tomorrow_plan: initialData.tomorrow_plan || "",
    assigned_tasks: initialData.assigned_tasks || (todayMeetings[0]?.title || "Daily Standup"),
    present_interns: initialData.present_interns || "",
    absent_interns: initialData.absent_interns || "",
    member_progress: (initialData.member_progress && initialData.member_progress.length > 0)
      ? initialData.member_progress
      : batchInterns.map((intern) => ({
          id: intern.id,
          name: intern.full_name || intern.email,
          progress: "",
          blocker: "",
          remark: "",
        })),
  }));

  const [activeStep, setActiveStep] = useState("members"); // "members" | "overall"

  if (!isOpen) return null;

  const handleMemberChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.member_progress];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, member_progress: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-3xl my-auto max-h-[92dvh] flex flex-col rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-200 text-gray-900"
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">TL Daily Report</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Batch: <span className="font-bold text-gray-900 dark:text-white">{batch?.name || "Assigned Batch"}</span> · Standup Check-in
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-gray-100 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveStep("members")}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeStep === "members" ? "border-red-600 text-red-600 dark:text-red-400" : "border-transparent text-gray-400"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Member-Wise Progress ({formData.member_progress.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("overall")}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeStep === "overall" ? "border-red-600 text-red-600 dark:text-red-400" : "border-transparent text-gray-400"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Overall Summary & Actions</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeStep === "members" && (
            <div className="space-y-4">
              {/* Meeting & Attendance Metadata Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-slate-300">Daily Standup Meeting</label>
                  <select
                    value={formData.meeting_id}
                    onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600"
                  >
                    <option value="">Today&apos;s Batch Meeting (Auto)</option>
                    {todayMeetings.map((m) => (
                      <option key={m.id} value={m.id}>{m.title} ({new Date(m.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-slate-300">Report Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
              </div>

              {/* Attendance quick tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-emerald-700 dark:text-emerald-400">Present Members</label>
                  <input
                    type="text"
                    value={formData.present_interns}
                    onChange={(e) => setFormData({ ...formData, present_interns: e.target.value })}
                    placeholder="e.g. Rahul, Neha, Amit"
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-rose-700 dark:text-rose-400">Absent Members</label>
                  <input
                    type="text"
                    value={formData.absent_interns}
                    onChange={(e) => setFormData({ ...formData, absent_interns: e.target.value })}
                    placeholder="e.g. Priya, Karan"
                    className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-xs focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Member-Wise Progress Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Member Verbal Updates & Progress
                  </span>
                  <span className="text-gray-400 font-mono text-[11px]">{formData.member_progress.length} Batch Members</span>
                </div>

                <div className="space-y-3">
                  {formData.member_progress.map((intern, index) => (
                    <div key={intern.id || index} className="p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white text-xs">{intern.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">Member #{index + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-500 mb-0.5">Progress</label>
                          <input
                            type="text"
                            value={intern.progress}
                            onChange={(e) => handleMemberChange(index, "progress", e.target.value)}
                            placeholder="e.g. Completed navbar, testing API"
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10.5px] font-semibold text-amber-600 mb-0.5">Problem / Blocker</label>
                          <input
                            type="text"
                            value={intern.blocker}
                            onChange={(e) => handleMemberChange(index, "blocker", e.target.value)}
                            placeholder="e.g. Auth token issue, None"
                            className="w-full p-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-transparent text-xs focus:outline-none focus:border-amber-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-500 mb-0.5">TL Remark</label>
                          <input
                            type="text"
                            value={intern.remark}
                            onChange={(e) => handleMemberChange(index, "remark", e.target.value)}
                            placeholder="e.g. Good progress / Guide on Git"
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep("overall")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Continue to Overall Summary →
                </button>
              </div>
            </div>
          )}

          {activeStep === "overall" && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-slate-300">
                  Overall Batch Progress Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Summarize the batch standup: what did the team accomplish today, team velocity, overall trajectory..."
                  required
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-amber-700 dark:text-amber-400">
                  Important Issues & Escalations to Mentor
                </label>
                <textarea
                  rows={2}
                  value={formData.blockers}
                  onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                  placeholder="Any critical technical blockers or issues that require Mentor guidance or escalation..."
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-slate-300">
                  Action Items & Tomorrow&apos;s Plan
                </label>
                <textarea
                  rows={2}
                  value={formData.tomorrow_plan}
                  onChange={(e) => setFormData({ ...formData, tomorrow_plan: e.target.value })}
                  placeholder="Key deliverables planned for tomorrow's standup..."
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep("members")}
                  className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                >
                  ← Back to Members
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/20 active:scale-95 transition cursor-pointer"
                  >
                    Submit Daily Report to Mentor
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
