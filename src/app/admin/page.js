"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  RefreshCw, 
  Phone, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Bot, 
  Layout, 
  Mail,
  ChevronDown,
  ArrowUpRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  getLeads, 
  addLead, 
  updateLeadStatus, 
  deleteLead, 
  exportLeadsCSV 
} from "@/utils/leadStorage";

export default function AdminPage() {
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Custom Web & Mobile App",
    source: "Admin Manual",
    notes: ""
  });

  // Load leads on mount
  useEffect(() => {
    refreshLeads();
  }, []);

  const refreshLeads = () => {
    const data = getLeads();
    setLeads(data);
  };

  const handleStatusChange = (leadId, newStatus) => {
    const updated = updateLeadStatus(leadId, newStatus);
    setLeads(updated);
  };

  const handleDelete = (leadId) => {
    if (confirm("Are you sure you want to delete this lead record?")) {
      const updated = deleteLead(leadId);
      setLeads(updated);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    addLead({
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email,
      service: newLeadForm.service,
      source: newLeadForm.source,
      notes: newLeadForm.notes
    });

    setIsAddModalOpen(false);
    setNewLeadForm({
      name: "",
      phone: "",
      email: "",
      service: "Custom Web & Mobile App",
      source: "Admin Manual",
      notes: ""
    });
    refreshLeads();
  };

  // Filtered Leads Calculation
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = selectedSource === "All" || lead.source === selectedSource;
    const matchesStatus = selectedStatus === "All" || lead.status === selectedStatus;

    return matchesSearch && matchesSource && matchesStatus;
  });

  // Analytics Metrics
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter(l => l.status === "New").length;
  const chatbotLeadsCount = leads.filter(l => l.source.includes("Chatbot")).length;
  const popupLeadsCount = leads.filter(l => l.source.includes("Popup")).length;
  const contactFormLeadsCount = leads.filter(l => l.source.includes("Contact")).length;
  const convertedLeadsCount = leads.filter(l => l.status === "Converted").length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((convertedLeadsCount / totalLeadsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-poppins flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12" style={{ fontFamily: "Matter, sans-serif" }}>
        
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TexWeb Central CRM</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-[Matter]">
              Lead Management Dashboard
            </h1>
            <p className="mt-2 text-gray-400 text-xs sm:text-sm font-poppins font-light">
              Real-time ingestion of leads captured from Chatbot, Popup Modals, Contact forms & Service pages.
            </p>
          </div>

          <div className="flex items-center gap-3 font-poppins">
            <button
              onClick={() => refreshLeads()}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-300 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold flex items-center gap-2"
              title="Refresh leads"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => exportLeadsCSV(filteredLeads)}
              className="px-4 py-3 bg-white/10 border border-white/15 rounded-2xl text-white hover:bg-white/20 transition-all text-xs font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-red-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl hover:from-red-500 hover:to-orange-500 transition-all text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Analytics Overview Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10 font-poppins">
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Total Leads</span>
              <Users className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-[Matter]">
              {totalLeadsCount}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">All registered leads</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">New Leads</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-400 font-[Matter]">
              {newLeadsCount}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">Requires action</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Chatbot Leads</span>
              <Bot className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-[Matter]">
              {chatbotLeadsCount}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">Ananya Assistant</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Popup Modal</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-[Matter]">
              {popupLeadsCount}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">Landing Popup</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Contact Form</span>
              <Mail className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-[Matter]">
              {contactFormLeadsCount}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">/contact page</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Conversion Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-[Matter]">
              {conversionRate}%
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">{convertedLeadsCount} Converted</span>
          </div>

        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 mb-8 font-poppins">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, phone, email or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Source Filter Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="All" className="bg-gray-900 text-white">All Lead Sources</option>
                <option value="Chatbot (Ananya)" className="bg-gray-900 text-white">Chatbot (Ananya)</option>
                <option value="Popup Modal" className="bg-gray-900 text-white">Popup Modal</option>
                <option value="Contact Form" className="bg-gray-900 text-white">Contact Form</option>
                <option value="Admin Manual" className="bg-gray-900 text-white">Admin Manual</option>
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="All" className="bg-gray-900 text-white">All Statuses</option>
                <option value="New" className="bg-gray-900 text-white">New</option>
                <option value="Contacted" className="bg-gray-900 text-white">Contacted</option>
                <option value="In Progress" className="bg-gray-900 text-white">In Progress</option>
                <option value="Converted" className="bg-gray-900 text-white">Converted</option>
                <option value="Rejected" className="bg-gray-900 text-white">Rejected</option>
              </select>
            </div>

          </div>
        </div>

        {/* Leads Table Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-poppins">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-[Matter] flex items-center gap-2">
              <span>Recorded Leads</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-normal">
                {filteredLeads.length} Items
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-300">
              <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">Lead ID & Date</th>
                  <th className="py-4 px-6">Client Details</th>
                  <th className="py-4 px-6">Service Interested</th>
                  <th className="py-4 px-6">Source</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Quick Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                      No leads match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const waMessage = `Hi ${lead.name}! 👋 Thank you for inquiring about ${lead.service} with TexWeb Solution. How can we help you today?`;
                    const waUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`;

                    return (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                        
                        {/* ID & Date */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-bold text-white font-[Matter]">{lead.id}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{lead.date}</div>
                        </td>

                        {/* Client Info */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-white font-[Matter]">{lead.name}</div>
                          <div className="text-xs text-red-400 font-medium">{lead.phone}</div>
                          {lead.email && <div className="text-[11px] text-gray-400 truncate max-w-[180px]">{lead.email}</div>}
                        </td>

                        {/* Service */}
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-200 block">{lead.service}</span>
                          {lead.notes && (
                            <span className="text-[11px] text-gray-400 line-clamp-1 max-w-[200px]" title={lead.notes}>
                              {lead.notes}
                            </span>
                          )}
                        </td>

                        {/* Source Badge */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            lead.source.includes("Chatbot") 
                              ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                              : lead.source.includes("Popup")
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}>
                            {lead.source}
                          </span>
                        </td>

                        {/* Status Select */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                              lead.status === "New"
                                ? "bg-red-500/20 text-red-300 border-red-500/40"
                                : lead.status === "Contacted"
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                : lead.status === "In Progress"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : lead.status === "Converted"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/40"
                            }`}
                          >
                            <option value="New" className="bg-gray-900 text-white">New</option>
                            <option value="Contacted" className="bg-gray-900 text-white">Contacted</option>
                            <option value="In Progress" className="bg-gray-900 text-white">In Progress</option>
                            <option value="Converted" className="bg-gray-900 text-white">Converted</option>
                            <option value="Rejected" className="bg-gray-900 text-white">Rejected</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* WhatsApp Direct Chat */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>

                            {/* Direct Phone Call */}
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors"
                              title="Call Lead"
                            >
                              <Phone className="w-4 h-4" />
                            </a>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="p-2 bg-red-500/15 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Lead Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <h3 className="text-xl font-bold font-[Matter]">Manually Add New Lead</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 font-poppins">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="client@gmail.com"
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Service</label>
                  <select
                    value={newLeadForm.service}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Custom Web & Mobile App">Custom Web & Mobile App</option>
                    <option value="Prebuilt SaaS Platform">Prebuilt SaaS Software</option>
                    <option value="AI & Workflow Automation">AI & WhatsApp Automation</option>
                    <option value="Digital Marketing & Ads">Digital Marketing & Ads</option>
                    <option value="Internship Catalyst">Internship Catalyst</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Inquiry notes..."
                    value={newLeadForm.notes}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-500 hover:to-orange-500 transition-colors text-sm mt-2"
                >
                  Save Lead Record
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
