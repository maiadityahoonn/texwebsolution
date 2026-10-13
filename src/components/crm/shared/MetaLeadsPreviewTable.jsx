"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function MetaLeadsPreviewTable({
  parsedLeads = [],
  onClear = () => {},
}) {
  if (parsedLeads.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{parsedLeads.length} leads ready for CRM + Meta CAPI</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-red-500 transition cursor-pointer"
        >
          Clear
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase text-[10px] font-bold sticky top-0">
            <tr>
              <th className="py-2.5 px-3">Lead Name</th>
              <th className="py-2.5 px-3">Phone</th>
              <th className="py-2.5 px-3">Service</th>
              <th className="py-2.5 px-3">Budget</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Campaign / Ad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {parsedLeads.map((lead, idx) => (
              <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                  {lead.name}
                  {lead.email && (
                    <div className="text-[10px] text-gray-400">{lead.email}</div>
                  )}
                </td>
                <td className="py-2.5 px-3 font-mono text-gray-700 dark:text-slate-300">
                  {lead.phone}
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
                    {lead.service}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  {lead.budget || "—"}
                </td>
                <td className="py-2.5 px-3 text-gray-500 dark:text-slate-400 text-[11px]">
                  {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="py-2.5 px-3 text-gray-500 dark:text-slate-400 text-[11px]">
                  {lead.campaign ? `${lead.campaign} / ${lead.ad}` : "Meta Ad"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
