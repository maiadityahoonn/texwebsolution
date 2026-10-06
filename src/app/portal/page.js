"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Layers,
  LifeBuoy,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function money(value) {
  return `₹${(Number(value) || 0).toLocaleString("en-IN")}`;
}

function dateLabel(value) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status) {
  if (["completed", "paid", "published", "resolved", "approved"].includes(status)) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (["in_progress", "client_review", "scheduled", "sent"].includes(status)) return "text-blue-700 bg-blue-50 border-blue-200";
  if (["overdue", "urgent", "rejected"].includes(status)) return "text-red-700 bg-red-50 border-red-200";
  return "text-amber-700 bg-amber-50 border-amber-200";
}

export default function PortalPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Missing client portal token.");
      return;
    }

    let cancelled = false;
    async function loadPortal() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/client-portal?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Unable to load client portal.");
        if (!cancelled) setData(body);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load client portal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPortal();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = useMemo(() => {
    const projects = data?.projects || [];
    const invoices = data?.invoices || [];
    const tickets = data?.supportTickets || [];
    return [
      { label: "Projects", value: projects.length, icon: Layers, sub: "Active delivery items" },
      { label: "Completed", value: projects.filter((p) => p.status === "completed").length, icon: CheckCircle2, sub: "Delivered milestones" },
      { label: "Invoices", value: invoices.length, icon: CreditCard, sub: money(invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0)) },
      { label: "Support", value: tickets.filter((t) => !["resolved", "closed"].includes(t.status)).length, icon: LifeBuoy, sub: "Open tickets" },
    ];
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf5] text-gray-900 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm font-bold text-orange-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading client portal...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#fffaf5] text-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h1 className="mt-3 text-lg font-black">Portal Link Not Available</h1>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </main>
    );
  }

  const client = data?.client || {};
  const projects = data?.projects || [];
  const invoices = data?.invoices || [];
  const tickets = data?.supportTickets || [];
  const smmClients = data?.smmClients || [];

  return (
    <main className="min-h-screen bg-[#fffaf5] text-gray-900">
      <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Image src="/texweb-full-logo-original.png" width={150} height={42} alt="TexWeb Solution" className="h-8 w-auto object-contain" priority />
            <div className="hidden sm:block min-w-0">
              <div className="text-xs font-black uppercase tracking-wider text-orange-600">Client Portal</div>
              <div className="text-sm font-bold truncate">{client.company_name || client.name}</div>
            </div>
          </div>
          <a
            href="https://wa.me/+917462827259"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact TexWeb</span>
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-orange-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Client View
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{client.company_name || client.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                Track your TexWeb projects, approvals, invoices, SMM calendar, and support tickets in one place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[520px]">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-gray-100 bg-[#fffaf5] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Icon className="w-4 h-4 text-orange-600" />
                      <span className="text-xl font-black">{item.value}</span>
                    </div>
                    <div className="mt-2 text-xs font-bold">{item.label}</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">{item.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <section className="space-y-5">
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black">Projects & Delivery</h2>
                  <p className="text-xs text-gray-500">Live status from planning to deployment and handover.</p>
                </div>
                <Layers className="w-5 h-5 text-orange-600" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {projects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 md:col-span-2">No project visible yet.</div>
                ) : (
                  projects.map((project) => (
                    <article key={project.id} className="rounded-2xl border border-gray-100 bg-[#fffdf9] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-black truncate">{project.name}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{project.description || "Project scope and delivery milestones are being prepared."}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${statusTone(project.status)}`}>
                          {project.status?.replaceAll("_", " ") || "planning"}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-white p-2">
                          <div className="text-[10px] uppercase text-gray-400 font-bold">Tech Lead</div>
                          <div className="mt-0.5 font-bold truncate">{project.tech_lead?.full_name || "TexWeb Team"}</div>
                        </div>
                        <div className="rounded-xl bg-white p-2">
                          <div className="text-[10px] uppercase text-gray-400 font-bold">Target</div>
                          <div className="mt-0.5 font-bold">{dateLabel(project.target_date)}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.staging_url && (
                          <a href={project.staging_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Staging
                          </a>
                        )}
                        {project.live_url && (
                          <a href={project.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Live
                          </a>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black">Support Tickets</h2>
                  <p className="text-xs text-gray-500">Post-delivery handover, issue resolution, and SLA status.</p>
                </div>
                <LifeBuoy className="w-5 h-5 text-orange-600" />
              </div>
              <div className="mt-4 space-y-2">
                {tickets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">No support ticket yet.</div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-2xl border border-gray-100 bg-[#fffdf9] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm">{ticket.subject}</div>
                          <div className="mt-1 text-[11px] text-gray-500">{ticket.ticket_number} · SLA {dateLabel(ticket.sla_deadline)}</div>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${statusTone(ticket.status)}`}>{ticket.status}</span>
                      </div>
                      {ticket.resolution_notes && <p className="mt-2 text-xs text-gray-500">{ticket.resolution_notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                <h2 className="font-black">Account Details</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400">Primary Contact</div>
                  <div className="font-bold">{client.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400">Email</div>
                  <div className="font-bold break-all">{client.email || "Not available"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400">Phone</div>
                  <div className="font-bold">{client.phone || "Not available"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <h2 className="font-black">Billing</h2>
              </div>
              <div className="mt-4 space-y-2">
                {invoices.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">No invoice yet.</div>
                ) : (
                  invoices.map((invoice) => (
                    <div key={invoice.id} className="rounded-2xl border border-gray-100 bg-[#fffdf9] p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold truncate">{invoice.invoice_number}</div>
                          <div className="text-[11px] text-gray-500 truncate">{invoice.title}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black">{money(invoice.total_amount)}</div>
                          <span className={`text-[10px] font-black uppercase ${invoice.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{invoice.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h2 className="font-black">SMM Calendar</h2>
              </div>
              <div className="mt-4 space-y-2">
                {smmClients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">No SMM retainer linked.</div>
                ) : (
                  smmClients.flatMap((smm) => smm.content_calendar || []).slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-100 bg-[#fffdf9] p-3">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="font-bold truncate">{item.title}</div>
                        <ArrowRight className="w-4 h-4 text-orange-500 shrink-0" />
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.platform} · {dateLabel(item.scheduled_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

