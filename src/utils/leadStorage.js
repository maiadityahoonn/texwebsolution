// Central Lead Management Utility for TexWeb Solution

const INITIAL_SAMPLE_LEADS = [
  {
    id: "LEAD-1001",
    date: "2026-07-24 14:30",
    name: "Vikramaditya Roy",
    phone: "+91 9830123456",
    email: "vikram.roy@fintechsolutions.in",
    service: "Custom Web & Mobile App",
    source: "Popup Modal",
    status: "New",
    notes: "Requires custom Next.js web application and iOS mobile app for fintech portal."
  },
  {
    id: "LEAD-1002",
    date: "2026-07-24 16:15",
    name: "Dr. Ananya Das",
    phone: "+91 9748567890",
    email: "ananya@healthclinic.org",
    service: "AI & Workflow Automation",
    source: "Chatbot (Ananya)",
    status: "Contacted",
    notes: "Interested in 24/7 WhatsApp AI Bot for appointment booking and automated patient follow-ups."
  },
  {
    id: "LEAD-1003",
    date: "2026-07-24 18:45",
    name: "Rajesh Agarwal",
    phone: "+91 9433098765",
    email: "rajesh@retailmart.com",
    service: "Prebuilt SaaS Platform",
    source: "Contact Form",
    status: "Converted",
    notes: "Wants turnkey multi-vendor e-commerce software platform with 100% source code ownership."
  },
  {
    id: "LEAD-1004",
    date: "2026-07-25 01:10",
    name: "Saurav Mukherjee",
    phone: "+91 9874123987",
    email: "saurav@growthmedia.co",
    service: "Digital Marketing & Ads",
    source: "Chatbot (Ananya)",
    status: "In Progress",
    notes: "Inquired about Meta ads management, Instagram Reels editing, and SEO optimizations."
  }
];

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

export function addLead({ name, phone, email = "", service = "Custom Web & Mobile App", source = "Website Form", notes = "" }) {
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
  }
  return newLead;
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
