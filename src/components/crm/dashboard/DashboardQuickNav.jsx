"use client";

import React from "react";
import {
  Users,
  TrendingUp,
  PhoneCall,
  Calendar,
  FileText,
  ShieldCheck,
  ReceiptText,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "./dashboardUtils";

export default function DashboardQuickNav({
  metrics,
  dateFilter = "all",
  onNavigateSection = () => {},
}) {
  const {
    filteredLeads,
    filteredDeals,
    activePipelineValue,
    filteredFollowUps,
    filteredMeetings,
  } = metrics;

  const modules = [
    {
      section: "crm",
      title: "Inbound Leads Engine",
      sub: `${filteredLeads.length} leads in view`,
      icon: Users,
      badge: `${filteredLeads.length} Leads`,
      tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    },
    {
      section: "pipeline",
      title: "Sales Pipeline & Deals",
      sub: `${formatINR(activePipelineValue)} in progress`,
      icon: TrendingUp,
      badge: `${filteredDeals.length} Deals`,
      tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    },
    {
      section: "sales_followups",
      title: "Follow-ups & WhatsApp",
      sub: `${filteredFollowUps.length} scheduled actions`,
      icon: PhoneCall,
      badge: `${filteredFollowUps.length} Scheduled`,
      tone: "text-teal-600 bg-teal-50 dark:bg-teal-950/30",
    },
    {
      section: "sales_meetings",
      title: "Client Video Meetings",
      sub: `${filteredMeetings.length} calls & demos`,
      icon: Calendar,
      badge: `${filteredMeetings.length} Calls`,
      tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      section: "sales_commercials",
      title: "Quotations & Proposals",
      sub: "Generate instant client quotes",
      icon: FileText,
      badge: "Docs",
      tone: "text-orange-600 bg-orange-50 dark:bg-orange-950/30",
    },
    {
      section: "invoices",
      title: "Invoices & Payments",
      sub: "Track billing and client receipts",
      icon: ReceiptText,
      badge: "Billing",
      tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3.5 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            Quick Workspaces
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
            Direct datewise shortcuts to active sales and delivery modules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.section}
              onClick={() => onNavigateSection(m.section, { dateFilter })}
              className="group p-2.5 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] hover:border-orange-300 dark:hover:border-orange-800/40 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${m.tone}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-[#18150f] text-gray-600 dark:text-neutral-300 border border-gray-100 dark:border-[#3a3020]">
                    {m.badge}
                  </span>
                </div>
                <div className="font-bold text-[11px] sm:text-xs text-gray-900 dark:text-white group-hover:text-orange-600 transition truncate">
                  {m.title}
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">{m.sub}</div>
              </div>

              <div className="mt-3 flex items-center justify-end text-[10px] font-bold text-gray-400 group-hover:text-orange-600 transition">
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
