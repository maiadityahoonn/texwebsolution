"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";
import { getCloudLeads, updateCloudLeadStatus } from "@/services/supabaseService";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const STATUSES = ["New", "Contacted", "Proposal Sent", "Converted", "Lost"];

function localDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CrmPage() {
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const canUseCrm = profile?.role === "super_admin" || profile?.role === "hr" || profile?.domain === "sales";

  async function loadCrm() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setSessionUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setSessionUser(session.user);
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      setProfile(profileData || null);
      const leadData = await getCloudLeads();
      setLeads(leadData || []);
    } catch (err) {
      console.warn("Failed to load CRM data:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadCrm, 0);
    const channel = supabase
      .channel("crm-leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => loadCrm())
      .subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesQuery =
        !q ||
        [lead.name, lead.phone, lead.email, lead.service, lead.source].some((value) =>
          String(value || "").toLowerCase().includes(q)
        );
      return matchesStatus && matchesQuery;
    });
  }, [leads, query, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [prevFilterKey, setPrevFilterKey] = useState(`${query}:${statusFilter}`);
  const currentFilterKey = `${query}:${statusFilter}`;
  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setCurrentPage(1);
  }

  const totalLeads = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalLeads / rowsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalLeads === 0 ? 0 : (safePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalLeads);

  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, startIndex, endIndex]);

  const metrics = useMemo(() => {
    const converted = leads.filter((lead) => lead.status === "Converted").length;
    const active = leads.filter((lead) => !["Converted", "Lost"].includes(lead.status)).length;
    return [
      { label: "Total Leads", value: leads.length, sub: "Inbound website inquiries", icon: Users, color: "text-gray-900 dark:text-white" },
      { label: "Active Pipeline", value: active, sub: "Open discussions & proposals", icon: TrendingUp, color: "text-red-600" },
      { label: "Converted", value: converted, sub: "Successful project closures", icon: CheckCircle2, color: "text-emerald-600" },
      {
        label: "Conversion Rate",
        value: leads.length ? `${Math.round((converted / leads.length) * 100)}%` : "0%",
        sub: "Lead to customer ratio",
        icon: Target,
        color: "text-blue-600",
      },
    ];
  }, [leads]);

  async function changeStatus(leadId, status) {
    const saved = await updateCloudLeadStatus(leadId, status);
    if (!saved) {
      setMessage("Lead status update failed.");
      return;
    }
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));
    setMessage("Lead status updated successfully.");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b101b] text-gray-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col gap-4 border-b border-gray-200/80 dark:border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/login"
              className="mb-2.5 inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Workspace</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Sales CRM Pipeline
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              Real-time website leads, client follow-ups, proposal movement, and WhatsApp conversion tracking.
            </p>
          </div>
          <button
            onClick={loadCrm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-slate-200 shadow-2xs hover:shadow-xs active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-red-600" />
            <span>Refresh Leads</span>
          </button>
        </div>

        {!sessionUser && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 p-5 text-sm font-semibold text-red-700 dark:text-red-300">
            Please login first to access the Sales CRM pipeline.
          </div>
        )}

        {sessionUser && !loading && !canUseCrm && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 p-5 text-sm font-semibold text-red-700 dark:text-red-300">
            CRM pipeline access is restricted to Super Admin, HR, and Sales team accounts.
          </div>
        )}

        {sessionUser && canUseCrm && (
          <div className="space-y-6">
            {message && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}

            {/* Elevated Stat Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => {
                const IconComp = m.icon;
                return (
                  <div
                    key={m.label}
                    className="relative overflow-hidden p-5 rounded-2xl border border-gray-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider font-sans">
                          {m.label}
                        </div>
                        <div className={`text-3xl font-black tracking-tight my-1.5 font-sans ${m.color}`}>
                          {m.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-sans truncate">{m.sub}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <IconComp className="w-5 h-5 stroke-[1.75]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search client name, phone number, email or service..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition shadow-2xs"
                />
              </div>
              <div className="sm:w-60 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition shadow-2xs cursor-pointer appearance-none"
                >
                  <option value="all">All Lead Statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Elevated Leads Data Table */}
            <div className="table-scroll w-full max-w-full overflow-x-auto rounded-2xl border border-gray-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-sm pb-1">
              <table className="w-full min-w-[960px] sm:min-w-[1020px] text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-gray-50/80 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-bold text-[10.5px] uppercase tracking-wider whitespace-nowrap">
                  <tr className="whitespace-nowrap">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Client Name & Email</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Service Interest</th>
                    <th className="py-3.5 px-4">Source & Date</th>
                    <th className="py-3.5 px-4 text-center">Pipeline Status</th>
                    <th className="py-3.5 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {paginatedLeads.map((lead, idx) => (
                    <tr key={lead.id} className="hover:bg-red-50/15 dark:hover:bg-slate-800/40 transition group whitespace-nowrap">
                      <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs whitespace-nowrap">{startIndex + idx + 1}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
                            {lead.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition-colors max-w-[140px] truncate" title={lead.name}>
                              {lead.name}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-slate-400 font-normal max-w-[150px] truncate mt-0.5" title={lead.email || "No email provided"}>
                              {lead.email || "No email provided"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a
                          href={`tel:${lead.phone}`}
                          className="font-mono text-xs font-semibold text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition"
                        >
                          {lead.phone || "-"}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50/90 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/70 dark:border-red-500/20 shadow-2xs max-w-[150px]" title={lead.service || "General Inquiry"}>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span className="truncate">{lead.service || "General Inquiry"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-gray-800 dark:text-slate-200 max-w-[120px] truncate" title={lead.source || "Website"}>{lead.source || "Website"}</div>
                          <div className="font-mono text-[11px] text-gray-400 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{localDate(lead.created_at)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={lead.status || "New"}
                          onChange={(e) => changeStatus(lead.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs cursor-pointer focus:outline-none ${
                            lead.status === "Converted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : lead.status === "Proposal Sent"
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                              : lead.status === "Contacted"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                              : lead.status === "Lost"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`https://wa.me/${String(lead.phone || "").replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow-md hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                          title="Chat on WhatsApp"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                  {!filteredLeads.length && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-xs font-sans">
                        No CRM leads found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Table Pagination Bar */}
              <Pagination
                currentPage={safePage}
                totalItems={totalLeads}
                rowsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setRowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                itemName="leads"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
