"use client";

import {
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  FileText,
  DollarSign,
  AlertCircle,
  Briefcase,
  Users,
} from "lucide-react";

export default function ActivityTimeline({ events = [], isDark = false }) {
  if (!events || events.length === 0) {
    return (
      <div className={`p-4 text-center rounded-xl text-xs ${isDark ? "text-neutral-500 bg-[#18150f]" : "text-gray-400 bg-gray-50"}`}>
        No timeline activities recorded yet.
      </div>
    );
  }

  function getEventIcon(type) {
    switch (type) {
      case "lead_created":
      case "created":
        return <Users className="w-3.5 h-3.5 text-blue-500" />;
      case "contacted":
      case "call":
        return <Send className="w-3.5 h-3.5 text-indigo-500" />;
      case "meeting":
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "proposal":
      case "quotation":
        return <FileText className="w-3.5 h-3.5 text-purple-500" />;
      case "payment":
      case "advance":
        return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      case "project":
        return <Briefcase className="w-3.5 h-3.5 text-orange-500" />;
      case "chat":
        return <MessageSquare className="w-3.5 h-3.5 text-teal-500" />;
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />;
    }
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-[#3a3020]">
      {events.map((evt, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-[#18150f] border border-neutral-200 dark:border-[#3a3020] flex items-center justify-center shadow-2xs">
            {getEventIcon(evt.type)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-semibold ${isDark ? "text-neutral-200" : "text-gray-900"}`}>
                {evt.title}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-neutral-500 shrink-0">
                {evt.time || "Recently"}
              </span>
            </div>
            {evt.description && (
              <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-gray-600"}`}>
                {evt.description}
              </p>
            )}
            {evt.actor && (
              <span className="inline-block mt-1 text-[10px] text-gray-400 dark:text-neutral-500">
                By: {evt.actor}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
