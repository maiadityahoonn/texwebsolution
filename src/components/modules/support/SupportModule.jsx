"use client";

import { useState, useMemo } from "react";
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Briefcase,
  X,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function SupportModule({
  tickets = [],
  clients = [],
  projects = [],
  isDark = false,
  onCreateTicket,
  onUpdateTicket,
  onOpenSupportChat,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [resolutionText, setResolutionText] = useState("");

  const [newTicketForm, setNewTicketForm] = useState({
    ticket_number: `TCK-2026-${Math.floor(100 + Math.random() * 900)}`,
    client_id: "",
    project_id: "",
    subject: "",
    description: "",
    priority: "medium",
    status: "open",
  });

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchQuery =
        !q ||
        [t.ticket_number, t.subject, t.description].some((v) =>
          String(v || "").toLowerCase().includes(q)
        );
      return matchStatus && matchQuery;
    });
  }, [tickets, query, statusFilter]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const resolved = tickets.filter((t) => ["resolved", "closed"].includes(t.status)).length;
    return { total, open, inProgress, resolved };
  }, [tickets]);

  function handleCreateSubmit(e) {
    e.preventDefault();
    if (!newTicketForm.client_id || !newTicketForm.subject) return;
    onCreateTicket?.(newTicketForm);
    setShowAddTicketModal(false);
    setNewTicketForm({
      ticket_number: `TCK-2026-${Math.floor(100 + Math.random() * 900)}`,
      client_id: "",
      project_id: "",
      subject: "",
      description: "",
      priority: "medium",
      status: "open",
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Client Support & SLA Maintenance
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Project Handover → Issue Resolution → Bug Tracking → Client Satisfaction & SLA compliance.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTicketForm({
              ticket_number: `TCK-2026-${Math.floor(100 + Math.random() * 900)}`,
              client_id: clients[0]?.id || "",
              project_id: projects[0]?.id || "",
              subject: "",
              description: "",
              priority: "medium",
              status: "open",
            });
            setShowAddTicketModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* 2. Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Total Tickets</span>
            <LifeBuoy className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">{stats.total}</div>
          <div className="text-[11px] text-gray-400 mt-1">Logged tickets</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Awaiting Action</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">
            {stats.open}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">New tickets</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>In Engineering</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">{stats.inProgress}</div>
          <div className="text-[11px] text-purple-600 mt-1 font-medium">Under investigation</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
            {stats.resolved}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Closed satisfactorily</div>
        </div>
      </div>

      {/* 3. Search and Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets by ID, subject, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st.id
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tickets Table */}
      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No support tickets found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Client & Project</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                {filteredTickets.map((tkt) => {
                  const client = clients.find((c) => c.id === tkt.client_id);
                  const project = projects.find((p) => p.id === tkt.project_id);

                  return (
                    <tr
                      key={tkt.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        {tkt.ticket_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {client?.name || "Client Account"}
                        </div>
                        <div className="text-[11px] text-gray-500">{project?.name || "Support"}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {tkt.subject}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tkt.priority === "urgent" || tkt.priority === "high"
                              ? "bg-red-50 text-red-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {tkt.priority?.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tkt.status === "resolved"
                              ? "bg-emerald-50 text-emerald-600"
                              : tkt.status === "in_progress"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {tkt.status?.replace("_", " ")?.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenSupportChat?.(tkt)}
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition"
                            title="Discuss on Team Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedTicket(tkt)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 transition"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Manage Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {selectedTicket.ticket_number}
                </h3>
                <span className="text-xs text-gray-500">{selectedTicket.subject}</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  Issue Description
                </span>
                <p className="text-gray-700 dark:text-neutral-300">{selectedTicket.description}</p>
              </div>

              <div>
                <label className="block font-medium mb-1">Update Ticket Status</label>
                <select
                  value={selectedTicket.status || "open"}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSelectedTicket({ ...selectedTicket, status: st });
                    onUpdateTicket?.(selectedTicket.id, { status: st });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_client">Waiting for Client</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Resolution Summary / Fix Notes</label>
                <textarea
                  rows={2}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Steps taken to diagnose and resolve..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateTicket?.(selectedTicket.id, {
                    status: "resolved",
                    resolution_notes: resolutionText,
                    resolved_at: new Date().toISOString(),
                  });
                  setSelectedTicket(null);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Ticket Modal */}
      {showAddTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowAddTicketModal(false)}
                className="p-1 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Client Account *</label>
                <select
                  required
                  value={newTicketForm.client_id}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="">Select Client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  placeholder="e.g. SSL Renewal / Mobile Safari Display Glitch"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Priority</label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Blocker</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Issue Details</label>
                <textarea
                  rows={3}
                  required
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  placeholder="Provide bug steps, URL, expected vs actual behavior..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowAddTicketModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                Log Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
