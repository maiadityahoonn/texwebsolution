"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Check, History, RotateCcw, Trash2, X } from "lucide-react";
import TablePagination from "../shared/TablePagination";
import { TableSkeleton as DefaultTableSkeleton } from "../shared/CrmSkeletons";
import DefaultResponsiveTableContainer from "../shared/ResponsiveTableContainer";
import { resolveLinkedContact } from "../shared/meetingUtils";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function FollowUpsTable({
  isFollowUpsLoading,
  paginatedFollowUps,
  filteredFollowUps,
  leads = [],
  clients = [],
  deals = [],
  setSelectedLead = () => {},
  ResponsiveTableContainer = DefaultResponsiveTableContainer,
  TableSkeleton = DefaultTableSkeleton,
  formatStatusLabel,
  getLatestNoteSnippet,
  getFollowUpWhatsappMessage,
  openStageModal,
  openRescheduleModal,
  onDeleteFollowUp,
  pagination,
}) {
  const searchParams = useSearchParams();
  const highlightParam = searchParams?.get("highlight") || "";

  useEffect(() => {
    if (!highlightParam) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`followup-${highlightParam}`) || document.querySelector(`[data-followup-id="${highlightParam}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [highlightParam, paginatedFollowUps]);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
      {isFollowUpsLoading && paginatedFollowUps.length === 0 ? (
        <TableSkeleton rows={6} columns={6} />
      ) : filteredFollowUps.length === 0 ? (
        <div className="p-5 sm:p-8 text-center text-xs sm:text-sm text-gray-500 dark:text-neutral-400">No sales follow-up found.</div>
      ) : (
        <>
          <ResponsiveTableContainer>
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[980px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[200px]">Follow-up</th>
                  <th className="py-3 px-4 min-w-[140px]">Linked Account</th>
                  <th className="py-3 px-4 min-w-[120px]">Channel</th>
                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Due</th>
                  <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right min-w-[210px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                {paginatedFollowUps.map((item) => {
                  const resolved = resolveLinkedContact(item, { leads, clients, deals });
                  const lead = resolved.lead;
                  const client = resolved.client;
                  const contactName = resolved.name;
                  const contactType = resolved.type;
                  const contactPhone = resolved.phone;
                  const isOverdue = item.status === "pending" && new Date(item.due_at).getTime() < Date.now();
                  const isHighlighted = highlightParam && (
                    String(item.id) === String(highlightParam) ||
                    (item.deal_id && String(item.deal_id) === String(highlightParam)) ||
                    (item.lead_id && String(item.lead_id) === String(highlightParam)) ||
                    (highlightParam.length > 3 && item.title?.toLowerCase().includes(highlightParam.toLowerCase()))
                  );

                  return (
                    <tr
                      key={item.id}
                      id={`followup-${item.id}`}
                      data-followup-id={item.id}
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
                          <div className="font-bold text-gray-900 dark:text-white truncate" title={item.title}>{item.title}</div>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase shrink-0">Overdue</span>
                          )}
                        </div>
                        <div
                          title={`Stage: ${formatStatusLabel(item.status)}${getLatestNoteSnippet(item.notes) ? ` - ${getLatestNoteSnippet(item.notes)}` : ""}`}
                          className="text-[11px] text-gray-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5"
                        >
                          <span className="font-semibold text-gray-700 dark:text-neutral-300 shrink-0">
                            [{formatStatusLabel(item.status)}]:
                          </span>
                          <span className="truncate">
                            {getLatestNoteSnippet(item.notes) || "No notes"}
                          </span>
                        </div>
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
                        <div className="text-[11px] text-gray-500">{contactType}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="capitalize font-semibold text-gray-700 dark:text-neutral-200">{item.channel || "Phone"}</div>
                        {contactPhone ? (
                          <a
                            href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono hover:underline block mt-0.5"
                            title={`Click to call ${contactPhone}`}
                          >
                            {contactPhone}
                          </a>
                        ) : (
                          <div className="text-[11px] text-gray-400 font-mono">-</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">{new Date(item.due_at).toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === "done" ? "bg-emerald-50 text-emerald-600" : item.status === "missed" || isOverdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                        }`}>{item.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[210px]">
                        <div className="flex items-center justify-end gap-1.5 shrink-0">
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
                                title="Mark as Done (record completion note)"
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
                              onClick={() => openRescheduleModal(item)}
                              className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition shrink-0"
                              title="Reschedule Follow-up"
                              aria-label="Reschedule Follow-up"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this follow-up?")) {
                                onDeleteFollowUp?.(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                            title="Delete Follow-up"
                            aria-label="Delete Follow-up"
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
