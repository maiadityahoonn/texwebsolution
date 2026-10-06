"use client";

import React from "react";
import {
  Target,
  TrendingUp,
  Building2,
  DollarSign,
  ArrowRight,
  Phone,
  Mail,
  RefreshCw,
  Clock,
  Sparkles,
  Users,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function SalesHeadOverview({
  userProfile,
  leads = [],
  deals = [],
  clients = [],
  onNavigate,
  onRefresh,
  onDirectWhatsapp,
  isDark = false,
}) {
  const newLeadsCount = leads.filter(
    (l) => (l.status || "").toLowerCase() === "new"
  ).length;

  const qualifiedLeadsCount = leads.filter(
    (l) => (l.status || "").toLowerCase().includes("qualif")
  ).length;

  const wonDealsCount = deals.filter(
    (d) => d.stage === "closed_won"
  ).length;

  const totalPipelineValue = deals.reduce((sum, d) => {
    const val = Number(d.value) || 0;
    return sum + val;
  }, 0);

  const formattedValue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalPipelineValue);

  const recentLeads = leads.slice(0, 5);

  const STAGES = [
    { key: "new", label: "New", color: "bg-blue-500", count: deals.filter((d) => d.stage === "new").length },
    { key: "contacted", label: "Contacted", color: "bg-cyan-500", count: deals.filter((d) => d.stage === "contacted").length },
    { key: "qualified", label: "Qualified", color: "bg-indigo-500", count: deals.filter((d) => d.stage === "qualified").length },
    { key: "proposal", label: "Proposal", color: "bg-purple-500", count: deals.filter((d) => d.stage === "proposal").length },
    { key: "negotiation", label: "Negotiation", color: "bg-amber-500", count: deals.filter((d) => d.stage === "negotiation").length },
    { key: "closed_won", label: "Won", color: "bg-emerald-500", count: wonDealsCount },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sales & Inbound Lead Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {userProfile?.full_name || "Sales Head"}!
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Track active inquiries, supervise deal stages, connect with qualified prospects, and guide your sales team to revenue targets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.("crm")}
              className="px-4 py-2.5 rounded-xl bg-white text-red-600 hover:bg-white/90 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>View All Leads ({leads.length})</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("pipeline")}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales Pipeline</span>
            </button>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition cursor-pointer"
                title="Refresh Live Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Leads */}
        <div
          onClick={() => onNavigate?.("crm")}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-red-300 dark:hover:border-red-800 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            {newLeadsCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                {newLeadsCount} New
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {leads.length}
            </div>
            <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-0.5">
              Inbound Leads
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-slate-800/80 pt-2.5">
            <span>{qualifiedLeadsCount} Qualified</span>
            <span className="text-red-600 font-bold group-hover:underline flex items-center gap-0.5">
              Inspect <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Pipeline Deals */}
        <div
          onClick={() => onNavigate?.("pipeline")}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              {deals.length} Active
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {deals.length}
            </div>
            <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-0.5">
              Pipeline Deals
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-slate-800/80 pt-2.5">
            <span>{wonDealsCount} Won</span>
            <span className="text-emerald-600 font-bold group-hover:underline flex items-center gap-0.5">
              Kanban <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Clients */}
        <div
          onClick={() => onNavigate?.("clients")}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-800 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              Active Accounts
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {clients.length}
            </div>
            <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-0.5">
              Client Accounts
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-slate-800/80 pt-2.5">
            <span>Enterprise & SME</span>
            <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
              Directory <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Pipeline Value */}
        <div
          onClick={() => onNavigate?.("pipeline")}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              Estimated
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 dark:text-white truncate" title={formattedValue}>
              {formattedValue}
            </div>
            <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-0.5">
              Pipeline Value
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-slate-800/80 pt-2.5">
            <span>Forecast</span>
            <span className="text-purple-600 font-bold group-hover:underline flex items-center gap-0.5">
              Details <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Recent Leads & Pipeline Stage Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Leads List (2 Columns on large screens) */}
        <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-red-600" />
                <span>Recent Inbound Leads</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Latest client inquiries and prospects from website & campaigns
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.("crm")}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-xs">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No leads available yet. Inbound inquiries from the website will automatically appear here.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2.5 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {lead.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lead.status === "New"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                            : lead.status === "Qualified"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {lead.status || "New"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-slate-400">
                      {lead.service && (
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {lead.service}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{lead.phone}</span>
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {lead.phone && (
                      <button
                        type="button"
                        onClick={() => onDirectWhatsapp?.(lead.phone, lead.name)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="Open WhatsApp chat with prospect"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate?.("crm")}
                      className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Open Lead
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pipeline Stages Breakdown & Fast Actions */}
        <div className="space-y-6">
          {/* Deal Stages Distribution */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Pipeline Stage Summary</span>
              </h2>
              <button
                type="button"
                onClick={() => onNavigate?.("pipeline")}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Kanban
              </button>
            </div>

            <div className="space-y-2.5">
              {STAGES.map((s) => (
                <div
                  key={s.key}
                  onClick={() => onNavigate?.("pipeline")}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 sm:p-6 shadow-sm space-y-3.5">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">
              Sales Quick Actions
            </h2>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate?.("crm")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-red-400" />
                  <span>Lead Management & Statuses</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.("pipeline")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Visual Kanban Pipeline</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.("clients")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Client Company Accounts</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
