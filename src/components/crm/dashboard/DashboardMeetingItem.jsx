"use client";

import React from "react";
import {
  Clock,
  Users,
  Video,
  History,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import WhatsAppIcon from "../shared/WhatsAppIcon";
import {
  resolveLinkedContact,
  formatStatusLabel,
} from "../shared/meetingUtils";

export default function DashboardMeetingItem({
  item,
  leads = [],
  clients = [],
  deals = [],
  setSelectedLead = () => {},
  openStageModal = () => {},
  openSalesMeetingRescheduleModal = () => {},
}) {
  const resolved = resolveLinkedContact(item, { leads, clients, deals });
  const lead = resolved.lead;
  const contactName = resolved.name || item.lead_name || "Client Contact";
  const contactPhone = resolved.phone || "";
  const effectiveMeetLink = item.meeting_link || item.meet_link || "";

  const isOverdue =
    (item.status === "scheduled" || item.status === "rescheduled") &&
    item.scheduled_at &&
    new Date(item.scheduled_at).getTime() < Date.now();
  const isToday =
    item.scheduled_at &&
    new Date(item.scheduled_at).toDateString() === new Date().toDateString();

  const stageLabel =
    item.status === "no_show" ? "No Show" : formatStatusLabel(item.status);
  const meetDateStr = item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No date";

  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] flex flex-col justify-between gap-1.5 hover:border-indigo-200 dark:hover:border-indigo-900/30 transition min-w-0">
      {/* Row 1: Title on left, Action buttons on right */}
      <div className="flex items-center justify-between gap-2 min-w-0 flex-nowrap">
        <span
          className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate min-w-0 flex-1"
          title={item.title || "Sales Meeting"}
        >
          {item.title || "Sales Meeting"}
        </span>

        {/* Action Icon Buttons */}
        <div className="flex items-center justify-end gap-1 shrink-0 flex-nowrap">
          {contactPhone && (
            <button
              type="button"
              onClick={() => {
                const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
                const name = contactName || "there";
                const linkNote = effectiveMeetLink ? ` Meeting link: ${effectiveMeetLink}` : "";
                const text = encodeURIComponent(
                  `Hi ${name}, quick check regarding our sales meeting "${item.title}".${linkNote} Please let me know if you need any info before our discussion.`
                );
                window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
              }}
              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
              title={`Chat on WhatsApp (${contactPhone})`}
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {effectiveMeetLink &&
            item.status !== "completed" &&
            item.status !== "no_show" &&
            item.status !== "cancelled" && (
              <a
                href={effectiveMeetLink.startsWith("http") ? effectiveMeetLink : `https://${effectiveMeetLink}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition shrink-0 inline-flex items-center justify-center cursor-pointer shadow-2xs"
                title={`Join Meeting (${effectiveMeetLink})`}
                aria-label="Join Meeting"
              >
                <Video className="w-3.5 h-3.5" />
              </a>
            )}

          {/* Stage & Notes History button */}
          <button
            type="button"
            onClick={() => openStageModal(item, "meeting")}
            className="p-1.5 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition shrink-0 cursor-pointer"
            title="Stage & Notes History"
            aria-label="Stage & Notes History"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {["scheduled", "rescheduled"].includes(item.status) && (
            <>
              <button
                type="button"
                onClick={() => openSalesMeetingRescheduleModal(item)}
                className="p-1.5 rounded-lg text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition shrink-0 cursor-pointer"
                title="Reschedule Meeting"
                aria-label="Reschedule Meeting"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openStageModal(item, "meeting", "completed")}
                className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                title="Mark as Completed"
                aria-label="Mark as Completed"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openStageModal(item, "meeting", "no_show")}
                className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                title="Mark as No Show"
                aria-label="Mark as No Show"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Status/Overdue/Today Chips, Lead Name, Date & Time, Channel */}
      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400 min-w-0 flex-nowrap overflow-hidden">
        {/* Chips */}
        {isOverdue && (item.status === "scheduled" || item.status === "rescheduled") ? (
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50">
            Overdue
          </span>
        ) : (
          <span
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 border ${
              item.status === "completed"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50"
                : item.status === "no_show" || item.status === "cancelled"
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/50"
                : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200/50"
            }`}
          >
            {stageLabel}
          </span>
        )}

        {isToday && !isOverdue && (
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50">
            Today
          </span>
        )}

        {/* Lead Contact Name */}
        <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-neutral-300 truncate shrink-0 max-w-[120px] sm:max-w-[150px]">
          <Users className="w-3 h-3 text-indigo-500 shrink-0" />
          {lead ? (
            <button
              type="button"
              onClick={() => setSelectedLead(lead)}
              className="hover:text-indigo-600 dark:hover:text-orange-400 hover:underline truncate cursor-pointer text-left"
              title={`View lead: ${contactName}`}
            >
              {contactName}
            </button>
          ) : (
            <span className="truncate" title={contactName}>
              {contactName}
            </span>
          )}
        </span>

        <span className="text-gray-300 dark:text-neutral-600 shrink-0">·</span>

        {/* Date & Time */}
        <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-neutral-400 whitespace-nowrap shrink-0">
          <Clock className="w-3 h-3 text-gray-400 shrink-0" />
          <span>{meetDateStr}</span>
        </span>

        {/* Channel / Duration */}
        <span className="hidden sm:inline text-[10px] text-gray-400 dark:text-neutral-500 whitespace-nowrap shrink-0 capitalize">
          · {item.channel === "google_meet" || effectiveMeetLink ? "Meet" : "Call"} · {item.duration_minutes || 30}m
        </span>
      </div>
    </div>
  );
}
