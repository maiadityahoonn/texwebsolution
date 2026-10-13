"use client";

import React from "react";
import {
  Clock,
  Users,
  History,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import WhatsAppIcon from "../shared/WhatsAppIcon";
import {
  resolveLinkedContact,
  formatStatusLabel,
  getFollowUpWhatsappMessage,
} from "../shared/meetingUtils";

export default function DashboardFollowUpItem({
  item,
  leads = [],
  clients = [],
  deals = [],
  setSelectedLead = () => {},
  openStageModal = () => {},
  openRescheduleModal = () => {},
}) {
  const resolved = resolveLinkedContact(item, { leads, clients, deals });
  const lead = resolved.lead;
  const client = resolved.client;
  const contactName = resolved.name || "Lead Contact";
  const contactPhone = resolved.phone || "";

  const isOverdue =
    item.status === "pending" &&
    item.due_at &&
    new Date(item.due_at).getTime() < Date.now();
  const isToday =
    item.due_at &&
    new Date(item.due_at).toDateString() === new Date().toDateString();

  const stageLabel = formatStatusLabel(item.status);
  const dueStr = item.due_at
    ? new Date(item.due_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No date set";

  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] flex flex-col justify-between gap-1.5 hover:border-orange-200 dark:hover:border-orange-900/30 transition min-w-0">
      {/* Row 1: Title on left, Action buttons on right */}
      <div className="flex items-center justify-between gap-2 min-w-0 flex-nowrap">
        <span
          className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate min-w-0 flex-1"
          title={item.title || "Sales Follow-up"}
        >
          {item.title || "Sales Follow-up"}
        </span>

        {/* Action Icon Buttons */}
        <div className="flex items-center justify-end gap-1 shrink-0 flex-nowrap">
          {contactPhone && (
            <button
              type="button"
              onClick={() => {
                const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
                const text = encodeURIComponent(getFollowUpWhatsappMessage(item, lead, client));
                window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
              }}
              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
              title={`Chat on WhatsApp (${contactPhone})`}
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Stage & Notes History button */}
          <button
            type="button"
            onClick={() => openStageModal(item, "followup")}
            className="p-1.5 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition shrink-0 cursor-pointer"
            title="Stage & Notes History"
            aria-label="Stage & Notes History"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {item.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => openStageModal(item, "followup", "done")}
                className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                title="Mark as Done"
                aria-label="Mark as Done"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openStageModal(item, "followup", "missed")}
                className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                title="Mark as Missed"
                aria-label="Mark as Missed"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {["pending", "missed"].includes(item.status) && (
            <button
              type="button"
              onClick={() => openRescheduleModal(item)}
              className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition shrink-0 cursor-pointer"
              title="Reschedule Follow-up"
              aria-label="Reschedule Follow-up"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Status/Overdue/Today Chips, Lead Name, Date & Time, Channel */}
      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400 min-w-0 flex-nowrap overflow-hidden">
        {/* Chips */}
        {isOverdue && item.status === "pending" ? (
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50">
            Overdue
          </span>
        ) : (
          <span
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 border ${
              item.status === "done" || item.status === "completed"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50"
                : item.status === "missed"
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/50"
                : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/50"
            }`}
          >
            {stageLabel}
          </span>
        )}

        {isToday && !isOverdue && (
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50">
            Today
          </span>
        )}

        {/* Lead Contact Name */}
        <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-neutral-300 truncate shrink-0 max-w-[120px] sm:max-w-[150px]">
          <Users className="w-3 h-3 text-orange-500 shrink-0" />
          {lead ? (
            <button
              type="button"
              onClick={() => setSelectedLead(lead)}
              className="hover:text-orange-600 dark:hover:text-orange-400 hover:underline truncate cursor-pointer text-left"
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
          <span>{dueStr}</span>
        </span>

        {/* Channel */}
        <span className="hidden sm:inline text-[10px] text-gray-400 dark:text-neutral-500 whitespace-nowrap shrink-0 capitalize">
          · Via {item.channel || "Phone"}
        </span>
      </div>
    </div>
  );
}
