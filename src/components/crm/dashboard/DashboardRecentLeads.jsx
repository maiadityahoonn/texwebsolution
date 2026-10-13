"use client";

import React from "react";
import { Users, ArrowRight, Layers, Globe } from "lucide-react";
import WhatsAppIcon from "../shared/WhatsAppIcon";
import { formatINR } from "./dashboardUtils";

export default function DashboardRecentLeads({
  metrics,
  dateFilter = "all",
  onNavigateSection = () => {},
  onOpenDirectWhatsapp = () => {},
  openAddDealModal = () => {},
  setSelectedLead = () => {},
}) {
  const { filteredLeads } = metrics;
  const displayLeads = filteredLeads.slice(0, 6);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Recent Inbound Leads</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Live inquiries matching date filter ({filteredLeads.length} total captured)
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateSection("crm", { dateFilter })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition cursor-pointer self-start sm:self-auto"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayLeads.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-gray-50/50 dark:bg-[#211d14] border border-dashed border-gray-200 dark:border-[#3a3020]">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
            <div className="text-xs font-bold text-gray-700 dark:text-neutral-300">
              No inbound leads captured
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              No leads match this date filter range. Adjust filter or add an inbound lead manually.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayLeads.map((lead) => {
              const createdDateStr = lead.created_at
                ? new Date(lead.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent";

              const sourceName = lead.source || lead.lead_source || "Website Inbound";
              const isMeta = sourceName.toLowerCase().includes("meta") || sourceName.toLowerCase().includes("facebook");
              const isGoogle = sourceName.toLowerCase().includes("google");

              return (
                <div
                  key={lead.id}
                  className="p-3 rounded-xl bg-gray-50/70 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 dark:hover:border-blue-900/30 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => setSelectedLead(lead)}
                        className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:text-orange-600 transition cursor-pointer truncate"
                      >
                        {lead.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                          lead.status === "Converted"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : lead.status === "Lost"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}
                      >
                        {lead.status || "New"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                      <span className="font-semibold text-gray-700 dark:text-neutral-300">
                        {lead.service || "Tech Development"}
                      </span>
                      {lead.budget && (
                        <span className="font-mono text-orange-600 font-bold">
                          {formatINR(lead.budget)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px]">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <span
                          className={`font-semibold ${
                            isMeta
                              ? "text-blue-600"
                              : isGoogle
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {sourceName}
                        </span>
                      </span>
                      <span className="text-[10px] text-gray-400">· {createdDateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {lead.phone && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenDirectWhatsapp(
                            lead.phone,
                            lead.name,
                            `Hi ${lead.name}, thank you for contacting TexWeb Solution regarding ${lead.service || "our services"}.`
                          )
                        }
                        className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0 cursor-pointer shadow-2xs"
                        title={`Chat on WhatsApp (${lead.phone})`}
                        aria-label="Chat on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openAddDealModal("contacted", lead)}
                      className="p-1.5 rounded-lg text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition shrink-0 cursor-pointer shadow-2xs"
                      title="Convert to Pipeline Deal"
                      aria-label="Convert to Pipeline Deal"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2a2215] flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-neutral-400 text-[11px]">
          Showing latest {displayLeads.length} leads
        </span>
        <button
          type="button"
          onClick={() => onNavigateSection("crm", { dateFilter })}
          className="inline-flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition cursor-pointer"
        >
          <span>Open Full Leads Table (Datewise)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
