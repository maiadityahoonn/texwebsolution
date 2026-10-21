"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, Check, History, Phone, RotateCcw, Trash2, Video, X } from "lucide-react";
import TablePagination from "../shared/TablePagination";
import { TableSkeleton as DefaultTableSkeleton } from "../shared/CrmSkeletons";
import DefaultResponsiveTableContainer from "../shared/ResponsiveTableContainer";
import { resolveLinkedContact, isMeetingActive, isMeetingNoShow } from "../shared/meetingUtils";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function MeetingsTable({
  isMeetingsLoading,
  paginatedSalesMeetings,
  filteredSalesMeetings,
  leads = [],
  clients = [],
  deals = [],
  dateFilter,
  defaultMeetLink,
  ResponsiveTableContainer = DefaultResponsiveTableContainer,
  TableSkeleton = DefaultTableSkeleton,
  formatStatusLabel,
  getLatestMeetingSnippet,
  setSelectedLead,
  setDateFilter,
  setMeetingPage,
  setSalesMeetingForm,
  setShowSalesMeetingModal,
  openStageModal,
  openSalesMeetingRescheduleModal,
  onDeleteSalesMeeting,
  pagination,
}) {
  const searchParams = useSearchParams();
  const highlightParam = searchParams?.get("highlight") || "";

  useEffect(() => {
    if (!highlightParam) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`meeting-${highlightParam}`) || document.querySelector(`[data-meeting-id="${highlightParam}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [highlightParam, paginatedSalesMeetings]);
  return (
    <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
      {isMeetingsLoading && paginatedSalesMeetings.length === 0 ? (
        <TableSkeleton rows={6} columns={6} />
      ) : filteredSalesMeetings.length === 0 ? (
        <div className="p-6 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="font-bold text-gray-900 dark:text-white text-base">No sales meetings found</div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-sm mx-auto">
            {dateFilter !== "all"
              ? "No meetings match the selected date range."
              : "There are currently no sales meetings scheduled."}
          </p>
          <div className="flex flex-col min-[380px]:flex-row items-center justify-center gap-2 pt-2 w-full">
            {dateFilter !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter("all");
                  setMeetingPage(1);
                }}
                className="w-full min-[380px]:w-auto px-3 min-[360px]:px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 transition cursor-pointer whitespace-nowrap shrink-0 min-w-0"
              >
                <span className="truncate">Clear Filters</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSalesMeetingForm((prev) => ({
                  ...prev,
                  meeting_link: defaultMeetLink || "https://meet.google.com/new",
                }));
                setShowSalesMeetingModal(true);
              }}
              className="w-full min-[380px]:w-auto px-3 min-[360px]:px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white transition cursor-pointer whitespace-nowrap shrink-0 min-w-0"
            >
              <span className="truncate">Schedule Meeting</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveTableContainer>
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[1040px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[220px]">Meeting</th>
                  <th className="py-3 px-4 min-w-[140px]">Linked Account</th>
                  <th className="py-3 px-4 min-w-[100px]">Type</th>
                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Schedule</th>
                  <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right min-w-[260px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                {paginatedSalesMeetings.map((item) => {
                  const resolved = resolveLinkedContact(item, { leads, clients, deals });
                  const lead = resolved.lead;
                  const client = resolved.client;
                  const contactName = resolved.name;
                  const contactType = resolved.type;
                  const contactPhone = resolved.phone;
                  const scheduledTime = item.scheduled_at ? new Date(item.scheduled_at).getTime() : 0;
                  const isOverdue = item.status === "scheduled" && scheduledTime > 0 && scheduledTime < Date.now();
                  const isToday = item.scheduled_at && new Date(item.scheduled_at).toDateString() === new Date().toDateString();
                  const effectiveMeetLink = (item.meeting_link && item.meeting_link !== "https://meet.google.com/new")
                    ? item.meeting_link
                    : (defaultMeetLink || item.meeting_link || "https://meet.google.com/new");

                  const isHighlighted = highlightParam && (
                    String(item.id) === String(highlightParam) ||
                    (item.deal_id && String(item.deal_id) === String(highlightParam)) ||
                    (item.lead_id && String(item.lead_id) === String(highlightParam)) ||
                    (highlightParam.length > 3 && item.title?.toLowerCase().includes(highlightParam.toLowerCase()))
                  );

                  return (
                    <tr
                      key={item.id}
                      id={`meeting-${item.id}`}
                      data-meeting-id={item.id}
                      className={`transition-all duration-500 ${
                        isHighlighted
                          ? "bg-amber-100/90 dark:bg-amber-950/50 ring-2 ring-orange-500 shadow-lg scale-[1.008] z-10 relative"
                          : isOverdue
                          ? "bg-red-50/40 dark:bg-red-950/10 hover:bg-gray-50/60 dark:hover:bg-slate-800/40"
                          : "hover:bg-gray-50/60 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openStageModal(item, "meeting")}
                            className="font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition text-left cursor-pointer"
                            title={`Click to view meeting timeline & notes: ${item.title}`}
                          >
                            {item.title}
                          </button>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-black uppercase shrink-0">
                              Passed
                            </span>
                          )}
                          {!isOverdue && isToday && item.status === "scheduled" && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-black uppercase shrink-0">
                              Today
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => openStageModal(item, "meeting")}
                          title={`Stage: ${item.status === "no_show" ? "No Show" : formatStatusLabel(item.status)}${getLatestMeetingSnippet(item) ? ` - ${getLatestMeetingSnippet(item)}` : ""}`}
                          className="text-[11px] text-gray-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-neutral-200 transition text-left cursor-pointer w-full"
                        >
                          <span className="font-semibold text-gray-700 dark:text-neutral-300 shrink-0">
                            [{item.status === "no_show" ? "No Show" : formatStatusLabel(item.status)}]:
                          </span>
                          <span className="truncate">
                            {getLatestMeetingSnippet(item) || "Sales meeting (Click to view timeline)"}
                          </span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        {lead ? (
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            className="text-left font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer truncate max-w-[180px] block"
                            title={`View Lead: ${contactName}`}
                          >
                            {contactName}
                          </button>
                        ) : (
                          <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]" title={contactName}>
                            {contactName}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-500 mt-0.5">{contactType}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-semibold text-gray-700 dark:text-neutral-200">{item.meeting_type}</td>
                      <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                        <div>{new Date(item.scheduled_at).toLocaleString("en-IN")}</div>
                        <div className="text-[11px] text-gray-400">{item.duration_minutes || 30} mins</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                        <button
                          type="button"
                          onClick={() => openStageModal(item, "meeting")}
                          title="Click to view meeting timeline & change status"
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer hover:opacity-85 transition ${
                          item.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : item.status === "cancelled" || item.status === "no_show"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300"
                            : isOverdue
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}>
                          {item.status === "no_show" ? "No Show" : formatStatusLabel(item.status)}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[260px]">
                        <div className="flex items-center justify-end gap-1.5 shrink-0">
                          {contactPhone && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
                                  const name = contactName || "there";
                                  const linkNote = effectiveMeetLink ? ` Meeting link: ${effectiveMeetLink}` : "";
                                  const text = encodeURIComponent(`Hi ${name}, quick check regarding our sales meeting "${item.title}".${linkNote} Please let me know if you need any info before our discussion.`);
                                  window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
                                title={`Chat on WhatsApp (${contactPhone})`}
                                aria-label="Chat on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}
                                className="p-1.5 rounded-lg text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition shrink-0 inline-flex items-center justify-center cursor-pointer"
                                title={`Call Contact (${contactPhone})`}
                                aria-label="Call Contact"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                          {effectiveMeetLink && item.status !== "completed" && item.status !== "no_show" && item.status !== "cancelled" && (
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
                          <button
                            type="button"
                            onClick={() => openStageModal(item, "meeting")}
                            className="p-1.5 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition shrink-0 cursor-pointer"
                            title="Stage & Notes History"
                            aria-label="Stage & Notes History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          {isMeetingActive(item.status) && (
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
                                title="Mark as Completed (record outcome note)"
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
                          {isMeetingNoShow(item.status) && (
                            <button
                              type="button"
                              onClick={() => openSalesMeetingRescheduleModal(item)}
                              className="p-1.5 rounded-lg text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition shrink-0 cursor-pointer"
                              title="Reschedule No Show Meeting"
                              aria-label="Reschedule Meeting"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this sales meeting?")) {
                                onDeleteSalesMeeting?.(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                            title="Delete Meeting"
                            aria-label="Delete Meeting"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ResponsiveTableContainer>
          <TablePagination {...pagination} />
        </>
      )}
    </div>
  );
}
