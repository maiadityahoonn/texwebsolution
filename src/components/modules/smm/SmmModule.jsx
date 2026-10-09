"use client";

import { useState, useMemo } from "react";
import {
  Share2,
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Video,
  Image as ImageIcon,
  MessageSquare,
  AlertCircle,
  X,
  Send,
  Eye,
  Check,
} from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function TwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

const PLATFORM_ICONS = {
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  twitter: TwitterIcon,
  other: Share2,
};

export default function SmmModule({
  smmClients = [],
  contentItems = [],
  clients = [],
  isDark = false,
  onCreateSmmClient,
  onCreateContentItem,
  onUpdateContentItem,
  onOpenSmmChat,
}) {
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar', 'clients', 'approvals'
  const [query, setQuery] = useState("");
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [newContentForm, setNewContentForm] = useState({
    smm_client_id: "",
    title: "",
    platform: "instagram",
    content_type: "carousel",
    copy_text: "",
    scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    status: "draft",
  });

  const [newClientForm, setNewClientForm] = useState({
    client_id: "",
    package_tier: "Growth Tier (12 Posts + 4 Reels/mo)",
    monthly_fee: 35000,
    target_audience: "B2B Founders & Tech Leaders",
    status: "active",
  });

  const filteredContent = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contentItems.filter((item) => {
      if (!q) return true;
      return [item.title, item.copy_text, item.platform, item.content_type].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [contentItems, query]);

  const approvalItems = useMemo(() => {
    return contentItems.filter((i) => ["internal_review", "client_review"].includes(i.status));
  }, [contentItems]);

  function handleCreateContentSubmit(e) {
    e.preventDefault();
    if (!newContentForm.title) return;
    onCreateContentItem?.(newContentForm);
    setShowAddContentModal(false);
    setNewContentForm({
      smm_client_id: "",
      title: "",
      platform: "instagram",
      content_type: "carousel",
      copy_text: "",
      scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      status: "draft",
    });
  }

  function handleCreateClientSubmit(e) {
    e.preventDefault();
    if (!newClientForm.client_id) return;
    onCreateSmmClient?.(newClientForm);
    setShowAddClientModal(false);
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Share2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Social Media Marketing (SMM)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Strategy, creative content pipeline, internal reviews, client approvals, and publishing schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddClientModal(true)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            + SMM Client Tier
          </button>
          <button
            onClick={() => setShowAddContentModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Content</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "calendar", label: "Content Calendar" },
            { id: "approvals", label: `Approvals Queue (${approvalItems.length})` },
            { id: "clients", label: `Retainer Clients (${smmClients.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === t.id
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
          />
        </div>
      </div>

      {/* 3. Tab: Content Calendar */}
      {activeTab === "calendar" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => {
            const Icon = PLATFORM_ICONS[item.platform] || Share2;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-200">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {item.content_type}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "published"
                          ? "bg-emerald-50 text-emerald-600"
                          : item.status === "approved"
                          ? "bg-blue-50 text-blue-600"
                          : item.status === "client_review"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status?.replace("_", " ")?.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-2 line-clamp-1">
                    {item.title}
                  </h3>

                  {item.copy_text && (
                    <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2 mt-1">
                      {item.copy_text}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 dark:border-[#3a3020]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(item.scheduled_at || Date.now()).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-[#3a3020]">
                  <select
                    value={item.status || "draft"}
                    onChange={(e) => onUpdateContentItem?.(item.id, { status: e.target.value })}
                    className="flex-1 py-1 px-2 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_creation">In Creation</option>
                    <option value="internal_review">Internal Review</option>
                    <option value="client_review">Client Review</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>

                  <button
                    onClick={() => onOpenSmmChat?.(item)}
                    className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition"
                    title="SMM Team Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Tab: Approvals Queue */}
      {activeTab === "approvals" && (
        <div className="space-y-3">
          {approvalItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
              All content items are approved and scheduled! No pending review items.
            </div>
          ) : (
            approvalItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-amber-200/60 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                      {item.status === "internal_review" ? "Awaiting SMM Head Review" : "Awaiting Client Sign-off"}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{item.platform}</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">{item.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
                    {item.copy_text}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onUpdateContentItem?.(item.id, { status: "approved" })}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => onOpenSmmChat?.(item)}
                    className="p-1.5 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100"
                    title="Discuss with Creative Team"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. Tab: SMM Clients Directory */}
      {activeTab === "clients" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {smmClients.map((client) => {
            const rawClient = clients.find((c) => c.id === client.client_id);
            return (
              <div
                key={client.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {rawClient?.name || "Client Account"}
                    </h3>
                    <span className="text-xs text-orange-600 font-medium">{client.package_tier}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                    {client.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Retainer Fee:</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      ₹{(Number(client.monthly_fee) || 0).toLocaleString("en-IN")}/mo
                    </span>
                  </div>
                  <div className="text-gray-500">
                    <span className="block font-medium">Target Audience:</span>
                    <span className="text-gray-700 dark:text-neutral-300">{client.target_audience}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenSmmChat?.(client)}
                  className="w-full py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMM Team Chat</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Add Content Modal */}
      {showAddContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateContentSubmit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create Content Item</h3>
              <button
                type="button"
                onClick={() => setShowAddContentModal(false)}
                className="p-1 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Content Title / Hook *</label>
                <input
                  type="text"
                  required
                  value={newContentForm.title}
                  onChange={(e) => setNewContentForm({ ...newContentForm, title: e.target.value })}
                  placeholder="e.g. 5 Growth Hacks for Modern SaaS"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Platform</label>
                  <select
                    value={newContentForm.platform}
                    onChange={(e) => setNewContentForm({ ...newContentForm, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter / X</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Format</label>
                  <select
                    value={newContentForm.content_type}
                    onChange={(e) =>
                      setNewContentForm({ ...newContentForm, content_type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  >
                    <option value="post">Single Post</option>
                    <option value="reel">Reel / Short</option>
                    <option value="carousel">Carousel</option>
                    <option value="video">Full Video</option>
                    <option value="article">Article / Newsletter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={newContentForm.scheduled_at}
                  onChange={(e) =>
                    setNewContentForm({ ...newContentForm, scheduled_at: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Copy / Caption</label>
                <textarea
                  rows={3}
                  value={newContentForm.copy_text}
                  onChange={(e) => setNewContentForm({ ...newContentForm, copy_text: e.target.value })}
                  placeholder="Draft caption, hashtags, and CTA..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowAddContentModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                Save Content
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Add SMM Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateClientSubmit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">New SMM Client Tier</h3>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
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
                  value={newClientForm.client_id}
                  onChange={(e) => setNewClientForm({ ...newClientForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="">Select Client Account...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Package Tier</label>
                <input
                  type="text"
                  value={newClientForm.package_tier}
                  onChange={(e) => setNewClientForm({ ...newClientForm, package_tier: e.target.value })}
                  placeholder="e.g. Growth Tier (12 Posts + 4 Reels/mo)"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Monthly Retainer (₹)</label>
                <input
                  type="number"
                  value={newClientForm.monthly_fee}
                  onChange={(e) => setNewClientForm({ ...newClientForm, monthly_fee: e.target.value })}
                  placeholder="35000"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Target Audience</label>
                <textarea
                  rows={2}
                  value={newClientForm.target_audience}
                  onChange={(e) =>
                    setNewClientForm({ ...newClientForm, target_audience: e.target.value })
                  }
                  placeholder="e.g. Tech Founders in India & USA..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#3a3020]">
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                Save SMM Client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
