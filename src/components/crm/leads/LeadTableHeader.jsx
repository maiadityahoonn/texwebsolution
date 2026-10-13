"use client";

import { ArrowDownAZ } from "lucide-react";

export default function LeadTableHeader({ leadSortOrder, setLeadSortOrder }) {
  return (
    <thead>
      <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
        <th
          onClick={() => setLeadSortOrder(leadSortOrder === "asc" ? "desc" : "asc")}
          className="py-3 px-4 min-w-[220px] cursor-pointer hover:text-orange-600 transition select-none"
          title="Click to sort alphabetically"
        >
          <div className="flex items-center gap-1.5">
            <span>Full Name</span>
            <ArrowDownAZ className={`w-3.5 h-3.5 ${leadSortOrder !== "default" ? "text-orange-500" : "text-gray-400"}`} />
            {leadSortOrder === "asc" && <span className="text-[9px] font-bold text-orange-600 lowercase">a-z</span>}
            {leadSortOrder === "desc" && <span className="text-[9px] font-bold text-orange-600 lowercase">z-a</span>}
          </div>
        </th>
        <th className="py-3 px-4 min-w-[210px] whitespace-nowrap">Contact (Phone & Email)</th>
        <th className="py-3 px-3 min-w-[160px] whitespace-nowrap">Service Needed</th>
        <th className="py-3 px-3 min-w-[130px] whitespace-nowrap">Budget Range</th>
        <th className="py-3 px-4 text-right min-w-[250px] whitespace-nowrap">Actions</th>
      </tr>
    </thead>
  );
}
