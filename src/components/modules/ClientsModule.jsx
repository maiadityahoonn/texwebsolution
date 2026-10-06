"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Globe,
  Briefcase,
  FileText,
  DollarSign,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  Share2,
} from "lucide-react";
import ActivityTimeline from "./ActivityTimeline";

export default function ClientsModule({
  clients = [],
  projects = [],
  invoices = [],
  supportTickets = [],
  isDark = false,
  onCreateClient,
  onOpenClientChat,
  onCreateProjectForClient,
  onCreateInvoiceForClient,
  onCreateTicketForClient,
}) {
  const [query, setQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, projects, invoices, tickets, timeline
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    website: "",
    industry: "Technology & SaaS",
    status: "active",
    notes: "",
  });

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.company_name, c.email, c.phone, c.industry].some((val) =>
        String(val || "").toLowerCase().includes(q)
      )
    );
  }, [clients, query]);

  function handleCreateClientSubmit(e) {
    e.preventDefault();
    if (!newClientForm.name) return;
    onCreateClient?.(newClientForm);
    setShowAddClientModal(false);
    setNewClientForm({
      name: "",
      company_name: "",
      email: "",
      phone: "",
      website: "",
      industry: "Technology & SaaS",
      status: "active",
      notes: "",
    });
  }

  // Linked items for selected client
  const clientProjects = useMemo(() => {
    if (!selectedClient) return [];
    return projects.filter((p) => p.client_id === selectedClient.id);
  }, [selectedClient, projects]);

  const clientInvoices = useMemo(() => {
    if (!selectedClient) return [];
    return invoices.filter((i) => i.client_id === selectedClient.id);
  }, [selectedClient, invoices]);

  const clientTickets = useMemo(() => {
    if (!selectedClient) return [];
    return supportTickets.filter((t) => t.client_id === selectedClient.id);
  }, [selectedClient, supportTickets]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Central Client Directory</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Single central entity connecting Deals, Projects, SMM, Invoicing, Support, and Team Communication.
          </p>
        </div>

        <button
          onClick={() => setShowAddClientModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* 2. Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients by name, company, email, phone, or industry..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="text-xs font-semibold text-gray-500 dark:text-neutral-400 px-2 shrink-0">
          Showing <span className="text-orange-600 dark:text-orange-400 font-bold">{filteredClients.length}</span> active client accounts
        </div>
      </div>

      {/* 3. Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const projs = projects.filter((p) => p.client_id === client.id);
          const invs = invoices.filter((i) => i.client_id === client.id);
          const totalBilled = invs.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);

          return (
            <div
              key={client.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] hover:border-orange-500/60 transition shadow-2xs space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {client.name}
                    </h3>
                    {client.company_name && (
                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium mt-0.5">
                        {client.company_name}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50">
                    {client.status || "active"}
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-xs text-gray-600 dark:text-neutral-300">
                  {client.phone && (
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.industry && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      <span>{client.industry}</span>
                    </div>
                  )}
                </div>

                {/* Quick stats badges */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-[#211d14] text-center">
                    <span className="text-[10px] text-gray-400 block">Projects</span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                      {projs.length} Active
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-[#211d14] text-center">
                    <span className="text-[10px] text-gray-400 block">Total Billed</span>
                    <span className="font-bold text-xs text-orange-600 dark:text-orange-400">
                      ₹{totalBilled.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => onOpenClientChat?.(client)}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                  title="Open Client Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Team Chat</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setActiveTab("overview");
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 transition flex items-center justify-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {selectedClient.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {selectedClient.company_name || selectedClient.industry || "Client Overview"}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 border-b border-gray-100 dark:border-[#3a3020] pb-2 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: "overview", label: "Overview" },
                { id: "projects", label: `Projects (${clientProjects.length})` },
                { id: "invoices", label: `Invoices (${clientInvoices.length})` },
                { id: "tickets", label: `Support (${clientTickets.length})` },
                { id: "timeline", label: "Timeline" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                    activeTab === t.id
                      ? "bg-orange-600 text-white shadow-2xs"
                      : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 text-[10px] block">Primary Phone</span>
                    <span className="font-semibold text-gray-800 dark:text-white font-mono">
                      {selectedClient.phone || "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 text-[10px] block">Email</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {selectedClient.email || "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 text-[10px] block">Website</span>
                    <span className="font-semibold text-gray-800 dark:text-white truncate block">
                      {selectedClient.website || "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 text-[10px] block">Industry</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {selectedClient.industry || "General"}
                    </span>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-1">
                      Account Notes
                    </span>
                    <p className="text-gray-700 dark:text-neutral-300">{selectedClient.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      onOpenClientChat?.(selectedClient);
                      setSelectedClient(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Team Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      onCreateProjectForClient?.(selectedClient);
                      setSelectedClient(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Create Project</span>
                  </button>

                  <button
                    onClick={() => {
                      onCreateInvoiceForClient?.(selectedClient);
                      setSelectedClient(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition flex items-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Generate Invoice</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Projects */}
            {activeTab === "projects" && (
              <div className="space-y-2 text-xs">
                {clientProjects.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">No projects created for this client yet.</div>
                ) : (
                  clientProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{proj.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">Status: {proj.status}</div>
                      </div>
                      <span className="font-mono text-orange-600 font-bold">
                        ₹{(Number(proj.budget) || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Invoices */}
            {activeTab === "invoices" && (
              <div className="space-y-2 text-xs">
                {clientInvoices.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">No invoices issued for this client yet.</div>
                ) : (
                  clientInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{inv.invoice_number}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{inv.title}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-gray-900 dark:text-white font-bold block">
                          ₹{(Number(inv.total_amount) || 0).toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            inv.status === "paid" ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {inv.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Tickets */}
            {activeTab === "tickets" && (
              <div className="space-y-2 text-xs">
                {clientTickets.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">No support tickets reported.</div>
                ) : (
                  clientTickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{tkt.ticket_number}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{tkt.subject}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                        {tkt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Timeline */}
            {activeTab === "timeline" && (
              <div className="pt-2">
                <ActivityTimeline
                  isDark={isDark}
                  events={[
                    {
                      type: "created",
                      title: "Account Provisioned",
                      description: "Client account onboarded to TexWeb platform.",
                      time: new Date(selectedClient.created_at || Date.now()).toLocaleDateString(),
                    },
                    {
                      type: "project",
                      title: "Project Engagements",
                      description: `${clientProjects.length} active technology projects in pipeline.`,
                      time: "Recent",
                    },
                  ]}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateClientSubmit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Add New Client Account</h3>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Client / Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  placeholder="e.g. John Doe / Acme Corp"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={newClientForm.company_name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, company_name: e.target.value })}
                  placeholder="e.g. Acme Technologies Ltd"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    placeholder="contact@acme.com"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={newClientForm.website}
                    onChange={(e) => setNewClientForm({ ...newClientForm, website: e.target.value })}
                    placeholder="https://acme.com"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={newClientForm.industry}
                    onChange={(e) => setNewClientForm({ ...newClientForm, industry: e.target.value })}
                    placeholder="e.g. Healthcare, Fintech"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
