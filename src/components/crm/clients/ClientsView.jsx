"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import ResponsiveTableContainer from "@/components/crm/shared/ResponsiveTableContainer";

export default function ClientsView({
  clients = [],
  deals = [],
  onOpenDirectWhatsapp = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.company_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    );
  }, [clients, searchQuery]);

  function handleCopyToken(token, id) {
    if (!token) return;
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/portal?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-4">
      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#111113] border border-gray-200/90 dark:border-neutral-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Total Clients
            </p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
              {clients.length}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
              Converted paying accounts
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#111113] border border-gray-200/90 dark:border-neutral-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Active Accounts
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {clients.filter((c) => c.status === "active" || !c.status).length}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
              In ongoing delivery
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#111113] border border-gray-200/90 dark:border-neutral-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Client Portal
            </p>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {clients.filter((c) => c.portal_token).length}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
              Secured token access
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* 2. Search Filter Bar */}
      {clients.length > 0 && (
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#111113] p-2.5 rounded-2xl border border-gray-200/90 dark:border-neutral-800 shadow-2xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients by name, company, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium px-2">
            Showing {filteredClients.length} of {clients.length}
          </span>
        </div>
      )}

      {/* 3. Empty State (When no deals are Closed Won yet) */}
      {clients.length === 0 ? (
        <div className="bg-white dark:bg-[#111113] rounded-3xl border border-gray-200/90 dark:border-neutral-800 p-8 sm:p-12 text-center shadow-2xs">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.75]" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white font-[Matter]">
            No Clients Converted Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 max-w-md mx-auto mt-1.5 leading-relaxed">
            Client accounts are automatically created when a pipeline deal is marked as{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">“Closed Won”</span>. Currently, all inquiries are managed as active Leads.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link
              href="/crm/pipeline"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-md hover:from-red-700 hover:to-rose-700 transition active:scale-95"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Go to Sales Pipeline</span>
            </Link>
            <Link
              href="/crm/leads"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-semibold hover:bg-gray-100 transition active:scale-95"
            >
              <Briefcase className="w-4 h-4" />
              <span>View Inbound Leads</span>
            </Link>
          </div>
        </div>
      ) : (
        /* 4. Client Records Table */
        <ResponsiveTableContainer>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200/90 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900/60 text-gray-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Client / Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Portal Access</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
              {filteredClients.map((client) => {
                const linkedDealCount = deals.filter((d) => d.client_id === client.id).length;
                return (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/40 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {(client.company_name || client.name || "C")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {client.company_name || client.name}
                          </p>
                          {client.company_name && client.name && (
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                              {client.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-600 dark:text-neutral-300">
                      <div className="space-y-0.5">
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[140px]">{client.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-600 dark:text-neutral-300 text-[11px]">
                      {client.industry || "Technology"}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                        {client.status || "Active"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {client.portal_token ? (
                        <button
                          type="button"
                          onClick={() => handleCopyToken(client.portal_token, client.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[11px] font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 transition cursor-pointer"
                          title="Copy Client Portal Access Link"
                        >
                          {copiedId === client.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-500" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {client.phone && (
                        <button
                          type="button"
                          onClick={() => onOpenDirectWhatsapp(client.phone, `Hello ${client.name || ""}`)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                          title="WhatsApp Client"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ResponsiveTableContainer>
      )}
    </div>
  );
}
