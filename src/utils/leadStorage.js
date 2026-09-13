import { createCloudLead } from "@/services/supabaseService";

// Central Lead Management Utility for TexWeb Solution

const INITIAL_SAMPLE_LEADS = [];

export function getLeads() {
  if (typeof window === "undefined") return INITIAL_SAMPLE_LEADS;
  const stored = localStorage.getItem("texweb_admin_leads");
  if (!stored) {
    localStorage.setItem("texweb_admin_leads", JSON.stringify(INITIAL_SAMPLE_LEADS));
    return INITIAL_SAMPLE_LEADS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_SAMPLE_LEADS;
  }
}

export function addLead({ name, phone, email = "", service = "Custom Web & Mobile App", source = "Website Form", notes = "", syncCloud = true }) {
  const currentLeads = getLeads();
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const newLead = {
    id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
    date: formattedDate,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    service,
    source,
    status: "New",
    notes: notes.trim()
  };

  const updated = [newLead, ...currentLeads];
  if (typeof window !== "undefined") {
    localStorage.setItem("texweb_admin_leads", JSON.stringify(updated));
    if (syncCloud) createCloudLead(newLead).catch(() => {});
  }
  return newLead;
}

export async function addLeadConfirmed(leadInput) {
  const leadPayload = {
    name: (leadInput.name || "").trim(),
    phone: (leadInput.phone || "").trim(),
    email: (leadInput.email || "").trim(),
    service: leadInput.service || "Custom Web & Mobile App",
    source: leadInput.source || "Website Form",
    status: "New",
    notes: (leadInput.notes || "").trim(),
  };
  if (typeof window === "undefined") return leadPayload;
  const cloudLead = await createCloudLead(leadPayload);
  if (!cloudLead) throw new Error("Cloud lead sync failed");
  return cloudLead;
}

export function updateLeadStatus(leadId, newStatus) {
  const leads = getLeads();
  const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
  if (typeof window !== "undefined") {
    localStorage.setItem("texweb_admin_leads", JSON.stringify(updated));
  }
  return updated;
}

export function deleteLead(leadId) {
  const leads = getLeads();
  const updated = leads.filter(l => l.id !== leadId);
  if (typeof window !== "undefined") {
    localStorage.setItem("texweb_admin_leads", JSON.stringify(updated));
  }
  return updated;
}

export function exportLeadsCSV(leads) {
  if (!leads || leads.length === 0) return;

  const headers = ["Lead ID", "Date", "Name", "Phone", "Email", "Service", "Source", "Status", "Notes"];
  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${l.date}"`,
    `"${l.name}"`,
    `"${l.phone}"`,
    `"${l.email || ''}"`,
    `"${l.service}"`,
    `"${l.source}"`,
    `"${l.status}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `TexWeb_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
