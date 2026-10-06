"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Briefcase,
  X,
  Download,
  Calendar,
} from "lucide-react";
import { playNotificationSound } from "@/lib/notificationSound";

export default function FinanceModule({
  invoices = [],
  proposals = [],
  quotations = [],
  clients = [],
  deals = [],
  projects = [],
  isDark = false,
  onCreateInvoice,
  onUpdateInvoice,
  onRecordPayment,
  onCreateProposal,
  onUpdateProposal,
  onCreateQuotation,
  onUpdateQuotation,
}) {
  const [activeView, setActiveView] = useState("invoices");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [commercialType, setCommercialType] = useState("proposal");
  const [recordPaymentModal, setRecordPaymentModal] = useState(null); // invoice to pay
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "bank_transfer",
    reference_id: "",
    payment_date: new Date().toISOString().split("T")[0],
  });

  const [newInvoiceForm, setNewInvoiceForm] = useState({
    invoice_number: `TEX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    client_id: "",
    project_id: "",
    title: "",
    amount: "",
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    milestone_type: "advance",
    status: "sent",
    payment_terms: "Due upon receipt / Net 15 days",
    notes: "Bank transfer or UPI accepted.",
  });
  const [commercialForm, setCommercialForm] = useState({
    title: "Website + CRM Implementation Proposal",
    quotation_number: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    client_id: "",
    deal_id: "",
    amount: "120000",
    valid_until: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    scope_of_work: "Discovery, UI/UX, Next.js development, Supabase setup, QA, deployment, and handover.",
    deliverables: "Admin panel, client portal, responsive website, source handover, and support.",
    notes: "Advance payment required before project kickoff.",
    status: "sent",
  });

  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      const matchQuery =
        !q ||
        [inv.invoice_number, inv.title, inv.milestone_type].some((v) =>
          String(v || "").toLowerCase().includes(q)
        );
      return matchStatus && matchQuery;
    });
  }, [invoices, query, statusFilter]);

  const filteredCommercialDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = [
      ...proposals.map((item) => ({ ...item, docType: "proposal" })),
      ...quotations.map((item) => ({ ...item, docType: "quotation" })),
    ];
    return rows.filter((item) => {
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchQuery =
        !q ||
        [
          item.title,
          item.quotation_number,
          item.scope_of_work,
          item.notes,
          clients.find((client) => client.id === item.client_id)?.name,
        ].some((value) => String(value || "").toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [clients, proposals, query, quotations, statusFilter]);

  // Financial aggregates
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let collected = 0;
    let pending = 0;
    let overdue = 0;

    const now = new Date().toISOString().split("T")[0];

    invoices.forEach((inv) => {
      const val = Number(inv.total_amount) || Number(inv.amount) || 0;
      totalInvoiced += val;
      if (inv.status === "paid") {
        collected += val;
      } else {
        pending += val;
        if (inv.due_date && inv.due_date < now) {
          overdue += val;
        }
      }
    });

    const openCommercialValue = [...proposals, ...quotations]
      .filter((item) => !["accepted", "rejected", "expired", "declined"].includes(item.status))
      .reduce((sum, item) => sum + (Number(item.total) || Number(item.amount) || 0), 0);

    return { totalInvoiced, collected, pending, overdue: openCommercialValue, openCommercialValue };
  }, [invoices, proposals, quotations]);

  function handleCreateInvoiceSubmit(e) {
    e.preventDefault();
    if (!newInvoiceForm.client_id || !newInvoiceForm.amount) return;
    const baseAmt = parseFloat(newInvoiceForm.amount) || 0;
    const taxAmt = Math.round(baseAmt * 0.18); // 18% GST standard
    const payload = {
      ...newInvoiceForm,
      amount: baseAmt,
      tax_amount: taxAmt,
      total_amount: baseAmt + taxAmt,
    };
    onCreateInvoice?.(payload);
    setShowAddInvoiceModal(false);
  }

  function handleCreateCommercialSubmit(e) {
    e.preventDefault();
    if (!commercialForm.client_id || !commercialForm.amount) return;
    const amount = parseFloat(commercialForm.amount) || 0;
    if (commercialType === "proposal") {
      onCreateProposal?.({
        client_id: commercialForm.client_id,
        deal_id: commercialForm.deal_id || null,
        title: commercialForm.title,
        amount,
        status: commercialForm.status,
        scope_of_work: commercialForm.scope_of_work,
        deliverables: commercialForm.deliverables,
        sent_at: commercialForm.status === "sent" ? new Date().toISOString() : null,
        notes: commercialForm.notes,
      });
    } else {
      const tax = Math.round(amount * 0.18);
      onCreateQuotation?.({
        quotation_number: commercialForm.quotation_number,
        client_id: commercialForm.client_id,
        deal_id: commercialForm.deal_id || null,
        subtotal: amount,
        discount: 0,
        tax,
        total: amount + tax,
        status: commercialForm.status === "accepted" ? "accepted" : "sent",
        valid_until: commercialForm.valid_until,
        notes: commercialForm.notes,
        items: [
          {
            title: commercialForm.title,
            description: commercialForm.scope_of_work,
            amount,
          },
        ],
      });
    }
    setShowCommercialModal(false);
  }

  function handleRecordPaymentSubmit(e) {
    e.preventDefault();
    if (!recordPaymentModal) return;
    const amt = parseFloat(paymentForm.amount) || recordPaymentModal.total_amount;
    onRecordPayment?.({
      invoice_id: recordPaymentModal.id,
      client_id: recordPaymentModal.client_id,
      amount: amt,
      ...paymentForm,
    });
    onUpdateInvoice?.(recordPaymentModal.id, { status: "paid" });
    playNotificationSound("payment");
    setRecordPaymentModal(null);
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Finance & Milestone Invoicing
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Quotations → Invoices → Advance Payments → Sprint Milestones → Final Handover Payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setCommercialType("proposal");
              setCommercialForm((prev) => ({
                ...prev,
                client_id: clients[0]?.id || "",
                deal_id: deals[0]?.id || "",
                quotation_number: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              }));
              setShowCommercialModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold text-xs transition shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Proposal / Quote</span>
          </button>

          <button
            onClick={() => {
              setNewInvoiceForm({
                invoice_number: `TEX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                client_id: clients[0]?.id || "",
                project_id: projects[0]?.id || "",
                title: "Software Development Sprint Milestone",
                amount: "50000",
                due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
                milestone_type: "milestone",
                status: "sent",
                payment_terms: "Due within 15 days",
                notes: "TexWeb Solution Bank Account Details attached.",
              });
              setShowAddInvoiceModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. Financial Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Total Invoiced</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2 font-mono">
            ₹{stats.totalInvoiced.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Across all contracts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Collected Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2 font-mono text-emerald-600 dark:text-emerald-400">
            ₹{stats.collected.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Successfully settled</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Pending Receivables</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2 font-mono text-amber-600 dark:text-amber-400">
            ₹{stats.pending.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Awaiting payment</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Open Proposals</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2 font-mono text-purple-600 dark:text-purple-400">
            ₹{stats.overdue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-purple-600 mt-1 font-medium">Proposal and quotation pipeline</div>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] w-full sm:w-fit overflow-x-auto no-scrollbar">
        {[
          { id: "invoices", label: "Invoices & Payments" },
          { id: "commercial", label: "Proposals & Quotations" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              setStatusFilter("all");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeView === item.id
                ? "bg-orange-600 text-white shadow-2xs"
                : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 3. Search and Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by invoice number, client title, milestone type..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All" },
            { id: "sent", label: "Sent / Unpaid" },
            { id: "paid", label: "Paid" },
            { id: "overdue", label: "Overdue" },
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

      {activeView === "commercial" && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          {filteredCommercialDocs.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No proposal or quotation found for the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto table-scroll">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Validity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {filteredCommercialDocs.map((doc) => {
                    const client = clients.find((item) => item.id === doc.client_id);
                    const amount = Number(doc.total) || Number(doc.amount) || Number(doc.subtotal) || 0;
                    const docLabel = doc.docType === "quotation" ? doc.quotation_number : doc.title;
                    const acceptedStatus = doc.docType === "quotation" ? "accepted" : "accepted";
                    const rejectedStatus = doc.docType === "quotation" ? "declined" : "rejected";

                    return (
                      <tr key={`${doc.docType}-${doc.id}`} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 dark:text-white">{docLabel || "Commercial Document"}</div>
                          <div className="text-[11px] text-gray-500 capitalize">{doc.docType}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{client?.name || "Client Account"}</div>
                          <div className="text-[11px] text-gray-500">{client?.company_name || client?.email || "Central client entity"}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                          Rs. {amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            doc.status === "accepted"
                              ? "bg-emerald-50 text-emerald-600"
                              : ["rejected", "declined", "expired"].includes(doc.status)
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {doc.status || "draft"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs">
                          {doc.valid_until || doc.sent_at?.slice(0, 10) || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!["accepted", "declined", "rejected"].includes(doc.status) && (
                              <button
                                onClick={() =>
                                  doc.docType === "quotation"
                                    ? onUpdateQuotation?.(doc.id, { status: acceptedStatus })
                                    : onUpdateProposal?.(doc.id, { status: acceptedStatus, accepted_at: new Date().toISOString() })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                              >
                                Accept
                              </button>
                            )}
                            {!["accepted", "declined", "rejected"].includes(doc.status) && (
                              <button
                                onClick={() =>
                                  doc.docType === "quotation"
                                    ? onUpdateQuotation?.(doc.id, { status: rejectedStatus })
                                    : onUpdateProposal?.(doc.id, { status: rejectedStatus })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-200 transition"
                              >
                                Reject
                              </button>
                            )}
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
      )}

      {/* 4. Invoices Table */}
      {activeView === "invoices" && (
      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No invoices found matching current filter.
          </div>
        ) : (
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client & Project</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Total (Inc. GST)</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                {filteredInvoices.map((inv) => {
                  const client = clients.find((c) => c.id === inv.client_id);
                  const project = projects.find((p) => p.id === inv.project_id);
                  const isPaid = inv.status === "paid";

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        {inv.invoice_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {client?.name || "Client Account"}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {project?.name || inv.title}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-300">
                          {inv.milestone_type || "milestone"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        ₹{(Number(inv.total_amount) || Number(inv.amount) || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 text-xs">
                        {inv.due_date || "-"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-600"
                              : inv.status === "overdue"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {inv.status?.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid ? (
                            <button
                              onClick={() => {
                                setRecordPaymentModal(inv);
                                setPaymentForm({
                                  amount: String(inv.total_amount || inv.amount),
                                  payment_method: "bank_transfer",
                                  reference_id: `TXN-${Date.now().toString(36).toUpperCase()}`,
                                  payment_date: new Date().toISOString().split("T")[0],
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </span>
                          )}
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
      )}

      {/* 5. Add Proposal / Quotation Modal */}
      {showCommercialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateCommercialSubmit}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Create Commercial Document</h3>
                <p className="text-[11px] text-gray-400">Proposal or quotation before agreement and invoice.</p>
              </div>
              <button type="button" onClick={() => setShowCommercialModal(false)} className="p-1 rounded-lg text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs">
              {[
                ["proposal", "Proposal"],
                ["quotation", "Quotation"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCommercialType(id)}
                  className={`flex-1 rounded-lg px-3 py-2 font-bold transition ${
                    commercialType === id ? "bg-white dark:bg-slate-900 text-orange-600 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Client Account *</label>
                <select
                  required
                  value={commercialForm.client_id}
                  onChange={(e) => setCommercialForm({ ...commercialForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold"
                >
                  <option value="">Select Client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Linked Deal</label>
                <select
                  value={commercialForm.deal_id}
                  onChange={(e) => setCommercialForm({ ...commercialForm, deal_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="">No linked deal</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>{deal.title}</option>
                  ))}
                </select>
              </div>

              {commercialType === "quotation" && (
                <div>
                  <label className="block font-medium mb-1">Quotation Number</label>
                  <input
                    type="text"
                    value={commercialForm.quotation_number}
                    onChange={(e) => setCommercialForm({ ...commercialForm, quotation_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium mb-1">Commercial Value *</label>
                <input
                  type="number"
                  required
                  value={commercialForm.amount}
                  onChange={(e) => setCommercialForm({ ...commercialForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Valid Until</label>
                <input
                  type="date"
                  value={commercialForm.valid_until}
                  onChange={(e) => setCommercialForm({ ...commercialForm, valid_until: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Status</label>
                <select
                  value={commercialForm.status}
                  onChange={(e) => setCommercialForm({ ...commercialForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={commercialForm.title}
                  onChange={(e) => setCommercialForm({ ...commercialForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Scope of Work</label>
                <textarea
                  rows={3}
                  value={commercialForm.scope_of_work}
                  onChange={(e) => setCommercialForm({ ...commercialForm, scope_of_work: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Deliverables / Notes</label>
                <textarea
                  rows={3}
                  value={commercialForm.deliverables}
                  onChange={(e) => setCommercialForm({ ...commercialForm, deliverables: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button type="button" onClick={() => setShowCommercialModal(false)} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                Save Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Add Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateInvoiceSubmit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Generate Invoice</h3>
              <button
                type="button"
                onClick={() => setShowAddInvoiceModal(false)}
                className="p-1 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={newInvoiceForm.invoice_number}
                    onChange={(e) =>
                      setNewInvoiceForm({ ...newInvoiceForm, invoice_number: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Milestone Type</label>
                  <select
                    value={newInvoiceForm.milestone_type}
                    onChange={(e) =>
                      setNewInvoiceForm({ ...newInvoiceForm, milestone_type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="advance">Advance (Initial 40%)</option>
                    <option value="milestone">Sprint Milestone (30%)</option>
                    <option value="final">Final Delivery (30%)</option>
                    <option value="monthly_retainer">Monthly Retainer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Client Account *</label>
                <select
                  required
                  value={newInvoiceForm.client_id}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold"
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
                <label className="block font-medium mb-1">Invoice Title / Description *</label>
                <input
                  type="text"
                  required
                  value={newInvoiceForm.title}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, title: e.target.value })}
                  placeholder="e.g. Milestone 1 - SaaS Backend Architecture"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Subtotal (Excl. Tax) ₹ *</label>
                  <input
                    type="number"
                    required
                    value={newInvoiceForm.amount}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                    placeholder="50000"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newInvoiceForm.due_date}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowAddInvoiceModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                Issue Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Record Payment Modal */}
      {recordPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleRecordPaymentSubmit}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Record Payment</h3>
                <span className="text-[11px] text-gray-400 font-mono">
                  {recordPaymentModal.invoice_number}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRecordPaymentModal(null)}
                className="p-1 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Transaction Ref / UTR *</label>
                <input
                  type="text"
                  required
                  value={paymentForm.reference_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_id: e.target.value })}
                  placeholder="e.g. UTR-9823482741"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setRecordPaymentModal(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                Confirm Settlement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
