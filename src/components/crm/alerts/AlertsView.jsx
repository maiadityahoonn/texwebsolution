"use client";

import {
  ArrowRight,
  Award,
  Bell,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  Folder,
  Paperclip,
  Trash2,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/shared/Pagination";
import { ROLE_LABELS, localDate } from "@/components/crm/shared/crmConstants";

export default function AlertsView({
  notifications = [],
  unreadCount = 0,
  alertsFilter = "all",
  setAlertsFilter,
  handleMarkAllAsRead,
  handleReadNotification,
  handleDeleteNotification,
  currentPage = 1,
  setCurrentPage,
  rowsPerPage = 10,
  setRowsPerPage,
}) {
  const [localAlertsFilter, setLocalAlertsFilter] = useState("all");
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(10);
  const activeAlertsFilter = alertsFilter || localAlertsFilter;
  const updateAlertsFilter = setAlertsFilter || setLocalAlertsFilter;
  const activeCurrentPage = currentPage || localCurrentPage;
  const updateCurrentPage = setCurrentPage || setLocalCurrentPage;
  const activeRowsPerPage = rowsPerPage || localRowsPerPage;
  const updateRowsPerPage = setRowsPerPage || setLocalRowsPerPage;

  const filteredNotifications = notifications.filter((n) => {
    if (activeAlertsFilter === "unread") return !n.is_read;
    return true;
  });

  const totalRecords = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / activeRowsPerPage));
  const safePage = Math.min(Math.max(1, activeCurrentPage), totalPages);
  const startIndex = (safePage - 1) * activeRowsPerPage;
  const paginatedRecords = filteredNotifications.slice(startIndex, startIndex + activeRowsPerPage);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Filter & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-transparent dark:bg-transparent border border-gray-200/80 dark:border-slate-800/80 shadow-none">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => updateAlertsFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAlertsFilter === "all"
                ? "bg-transparent dark:bg-transparent text-red-600 dark:text-red-400 shadow-none"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span>All</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                activeAlertsFilter === "all"
                  ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
              }`}
            >
              {notifications.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => updateAlertsFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAlertsFilter === "unread"
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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            unreadCount > 0
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
              {activeAlertsFilter === "unread" ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <Bell className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="text-sm font-bold text-gray-800 dark:text-white">
              {activeAlertsFilter === "unread" ? "You're all caught up!" : "No notifications yet"}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {activeAlertsFilter === "unread"
                ? "There are no unread notifications right now. Check back later for updates."
                : "System alerts, announcements, and task updates will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {paginatedRecords.map((n) => {
              const isUnread = !n.is_read;
              const typeStyles = {
                meeting: {
                  icon: Video,
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
                  badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900",
                  label: "Meeting",
                },
                class: {
                  icon: Video,
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
                  badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900",
                  label: "Class",
                },
                task: {
                  icon: CheckSquare,
                  color: "text-purple-600 dark:text-purple-400",
                  bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900",
                  badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900",
                  label: "Task",
                },
                submission: {
                  icon: FileText,
                  color: "text-indigo-600 dark:text-indigo-400",
                  bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900",
                  badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900",
                  label: "Submission",
                },
                certificate: {
                  icon: Award,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
                  badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900",
                  label: "Certificate",
                },
                lead: {
                  icon: Users,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900",
                  badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
                  label: "Lead",
                },
                announcement: {
                  icon: Bell,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
                  badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900",
                  label: "Announcement",
                },
                file: {
                  icon: Folder,
                  color: "text-indigo-600 dark:text-indigo-400",
                  bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900",
                  badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900",
                  label: "Batch File",
                },
              }[n.type] || {
                icon: Bell,
                color: "text-red-600 dark:text-red-400",
                bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900",
                badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900",
                label: "Alert",
              };
              const IconComp = typeStyles.icon;

              return (
                <div
                  key={n.id}
                  className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 shadow-2xs group ${
                    isUnread
                      ? "bg-transparent dark:bg-transparent border-red-300 dark:border-red-900/80 border-l-4 border-l-red-600 shadow-none"
                      : "bg-transparent dark:bg-transparent border-gray-200/80 dark:border-slate-800/80 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${typeStyles.bg} ${typeStyles.color} shadow-2xs`}
                    >
                      <IconComp className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${typeStyles.badge}`}
                        >
                          {typeStyles.label}
                        </span>
                        <h3
                          className={`font-bold text-xs sm:text-[13px] ${
                            isUnread ? "text-gray-950 dark:text-white" : "text-gray-800 dark:text-slate-200"
                          }`}
                        >
                          {n.title}
                        </h3>
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                            New
                          </span>
                        )}
                      </div>

                      {(n.metadata?.creator_name || n.metadata?.batch_name) && (
                        <div className="flex items-center gap-1.5 flex-wrap w-full mt-1 mb-1.5">
                          {n.metadata?.creator_name && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                                ["super_admin", "admin"].includes(n.metadata.creator_role)
                                  ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900"
                                  : n.metadata.creator_role === "mentor"
                                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                              }`}
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>
                                [{ROLE_LABELS[n.metadata.creator_role] || n.metadata.creator_role || "Author"}]{" "}
                                {n.metadata.creator_name}
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
                            onClick={() => handleReadNotification?.(n)}
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
                        onClick={() => handleReadNotification?.(n)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95 cursor-pointer shrink-0"
                        title="Mark as Read"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteNotification?.(n)}
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
            rowsPerPage={activeRowsPerPage}
            onPageChange={updateCurrentPage}
            onRowsPerPageChange={updateRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            itemName="notifications"
          />
        </div>
      </div>
    </div>
  );
}
