"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Phone,
  Calendar,
  Layers,
} from "lucide-react";

export default function MandatoryNotificationModal({
  unreadNotifications = [],
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  isDark = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Keep index within bounds if notifications array shrinks
  useEffect(() => {
    if (currentIndex >= unreadNotifications.length && unreadNotifications.length > 0) {
      setCurrentIndex(unreadNotifications.length - 1);
    }
  }, [unreadNotifications.length, currentIndex]);

  // Lock background page scroll strictly when mandatory notification is active
  useEffect(() => {
    if (!unreadNotifications || unreadNotifications.length === 0) return;

    const { body, documentElement } = document;
    const scrollY = window.scrollY || documentElement.scrollTop || 0;
    const scrollbarWidth = Math.max(0, window.innerWidth - documentElement.clientWidth);

    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
      htmlOverflow: documentElement.style.overflow,
      touchAction: body.style.touchAction,
    };

    body.classList.add("modal-open");
    documentElement.classList.add("modal-open");
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.touchAction = "none";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    documentElement.style.overflow = "hidden";

    const handleWheel = (e) => {
      const card = document.getElementById("mandatory-notif-dialog");
      if (card && card.contains(e.target)) {
        if (card.scrollHeight > card.clientHeight) {
          return;
        }
      }
      e.preventDefault();
    };

    const handleTouchMove = (e) => {
      const card = document.getElementById("mandatory-notif-dialog");
      if (card && card.contains(e.target)) {
        if (card.scrollHeight > card.clientHeight) {
          return;
        }
      }
      e.preventDefault();
    };

    document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });

    return () => {
      document.removeEventListener("wheel", handleWheel, { capture: true });
      document.removeEventListener("touchmove", handleTouchMove, { capture: true });
      body.classList.remove("modal-open");
      documentElement.classList.remove("modal-open");
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.right = previous.bodyRight;
      body.style.width = previous.bodyWidth;
      body.style.paddingRight = previous.bodyPaddingRight;
      body.style.touchAction = previous.touchAction;
      documentElement.style.overflow = previous.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [unreadNotifications]);

  if (!unreadNotifications || unreadNotifications.length === 0) {
    return null;
  }

  const current = unreadNotifications[currentIndex] || unreadNotifications[0];
  const total = unreadNotifications.length;

  const handleMarkCurrent = async () => {
    if (!current || processing) return;
    setProcessing(true);
    try {
      if (onMarkRead) await onMarkRead(current);
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAll = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      if (onMarkAllRead) await onMarkAllRead();
    } finally {
      setProcessing(false);
    }
  };

  const type = String(current?.type || current?.metadata?.source_type || "general").toLowerCase();

  const getTypeBadge = () => {
    if (type.includes("lead")) {
      return { label: "New Lead Inquiry", icon: Sparkles, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    }
    if (type.includes("meeting")) {
      return { label: "Client Meeting", icon: Calendar, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
    }
    if (type.includes("followup") || type.includes("follow_up")) {
      return { label: "Sales Follow-up", icon: Phone, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
    if (type.includes("deal") || type.includes("pipeline")) {
      return { label: "Pipeline Deal", icon: Layers, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    }
    return { label: "Action Required", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
  };

  const badge = getTypeBadge();
  const BadgeIcon = badge.icon;

  const formattedDate = current?.created_at
    ? new Date(current.created_at).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Just now";

  return (
    <div
      data-modal-overlay="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200 touch-none overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mandatory-notif-title"
    >
      <div
        id="mandatory-notif-dialog"
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain touch-auto rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all ${
          isDark
            ? "bg-slate-900/95 border-slate-700/70 text-slate-100 shadow-cyan-950/40"
            : "bg-white border-slate-200 text-slate-800 shadow-slate-900/20"
        }`}
      >
        {/* Top Header Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 dark:bg-amber-500/20 border border-amber-500/30">
              <Bell className="w-5 h-5 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500" />
              </span>
            </div>
            <div>
              <h2 id="mandatory-notif-title" className="text-lg font-bold tracking-tight">
                Mandatory Notification
              </h2>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Mark complete to unlock CRM workspace
              </p>
            </div>
          </div>

          {/* Stepper Count if Multiple */}
          {total > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <span>{currentIndex + 1}</span>
              <span className="opacity-50">/</span>
              <span>{total}</span>
            </div>
          )}
        </div>

        {/* Content Card */}
        <div className="my-5 space-y-4">
          {/* Badge & Timestamp */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border ${badge.color}`}
            >
              <BadgeIcon className="w-3.5 h-3.5" />
              {badge.label}
            </span>
            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          {/* Notification Title */}
          <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {current?.title || "New CRM Alert"}
            </h3>
            {current?.message && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                {current.message}
              </p>
            )}
          </div>

          {/* Stepper Controls if multiple notifications */}
          {total > 1 && (
            <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                disabled={currentIndex === 0 || processing}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-[11px] font-medium opacity-80">
                Review all {total} unread alerts
              </span>

              <button
                type="button"
                disabled={currentIndex === total - 1 || processing}
                onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={processing}
            onClick={handleMarkCurrent}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Complete & Acknowledge</span>
          </button>

          {total > 1 && (
            <button
              type="button"
              disabled={processing}
              onClick={handleMarkAll}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              <span>Mark All ({total}) as Complete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
