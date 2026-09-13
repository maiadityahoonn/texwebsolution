"use client";

import { useEffect, useRef } from "react";
import { Search, X, Users, Folder, CheckSquare, Video, FileText, ArrowRight, CornerDownLeft } from "lucide-react";

export default function GlobalSearchModal({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  results,
  onSelectMember,
  onSelectBatch,
  onSelectTask,
  onSelectMeeting,
  onSelectReport,
  isDark = false,
  roleLabels = {},
  domainLabel = (d) => d,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasResults = results && results.totalCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className={`relative w-full max-w-2xl flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-200 text-gray-900"
      }`}>
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search members, batches, tasks, meetings, daily reports..."
            className="flex-1 bg-transparent text-sm font-semibold focus:outline-none placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {!searchTerm.trim() ? (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-slate-700" />
              <p className="font-semibold text-xs text-gray-500">Search across the entire workspace</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Find people, active batches, assigned tasks, and meetings</p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-gray-400">
              <p className="font-semibold text-xs text-gray-500">No matching records found for &quot;{searchTerm}&quot;</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Try searching by member name, email, batch title, or task keyword</p>
            </div>
          ) : (
            <>
              {/* Category 1: Members */}
              {results.members?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <Users className="w-3.5 h-3.5 text-red-600" />
                    <span>Members ({results.members.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectMember(member);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {member.full_name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 dark:text-white truncate group-hover:text-red-600 transition">
                              {member.full_name}
                            </div>
                            <div className="text-[10.5px] text-gray-400 truncate">
                              {member.email} · {roleLabels[member.role] || member.role} · {domainLabel(member.domain)}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10.5px] text-gray-400 font-semibold group-hover:text-red-600 flex items-center gap-1">
                          View Profile <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: Batches */}
              {results.batches?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <Folder className="w-3.5 h-3.5 text-blue-600" />
                    <span>Batches ({results.batches.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.batches.map((batch) => (
                      <button
                        key={batch.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectBatch(batch.id);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-left cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                            {batch.name}
                          </div>
                          <div className="text-[10.5px] text-gray-400">
                            {domainLabel(batch.domain)} · {batch.batch_type || "internship"}
                          </div>
                        </div>
                        <span className="text-[10.5px] text-gray-400 font-semibold group-hover:text-blue-600 flex items-center gap-1">
                          Open Workspace <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Tasks */}
              {results.tasks?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span>Tasks ({results.tasks.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectTask(task);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-left cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition truncate">
                            {task.title}
                          </div>
                          <div className="text-[10.5px] text-gray-400 truncate">
                            {task.priority || "Medium"} · Status: {task.status}
                          </div>
                        </div>
                        <span className="text-[10.5px] text-gray-400 font-semibold group-hover:text-purple-600 flex items-center gap-1">
                          Details <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 4: Meetings */}
              {results.meetings?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <Video className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Meetings ({results.meetings.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.meetings.map((meeting) => (
                      <button
                        key={meeting.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectMeeting(meeting);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-left cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition">
                            {meeting.title}
                          </div>
                          <div className="text-[10.5px] text-gray-400">
                            {meeting.topic} · {new Date(meeting.scheduled_at).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                        <span className="text-[10.5px] text-gray-400 font-semibold group-hover:text-emerald-600 flex items-center gap-1">
                          Join / Link <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 5: Daily Reports */}
              {results.reports?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Daily Reports ({results.reports.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.reports.map((report) => (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectReport(report);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-left cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition truncate">
                            {report.assigned_tasks || "Daily Report"} ({report.update_date})
                          </div>
                          <div className="text-[10.5px] text-gray-400 truncate">
                            {report.summary}
                          </div>
                        </div>
                        <span className="text-[10.5px] text-gray-400 font-semibold group-hover:text-amber-600 flex items-center gap-1">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 text-[11px] text-gray-400 flex items-center justify-between">
          <span>Navigate with mouse or touch</span>
          <span className="flex items-center gap-1">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px]">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
