"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Target,
  Globe,
} from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function cleanMetaPhone(val) {
  if (!val) return "";
  let p = String(val).replace(/^p:/i, "").trim();
  p = p.replace(/[^0-9+]/g, "");
  if (p.startsWith("+91") && p.length === 13) {
    return `+91 ${p.slice(3, 8)} ${p.slice(8)}`;
  }
  return p;
}

function cleanMetaService(val) {
  if (!val) return "Website Development";
  const s = String(val).toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();
  if (s.includes("website") || s.includes("web")) return "Website Development";
  if (s.includes("ai") || s.includes("bot") || s.includes("automation")) return "AI Automation & Bots";
  if (s.includes("mobile") || s.includes("app")) return "Mobile App Development";
  if (s.includes("marketing") || s.includes("digital")) return "Digital Marketing & Ads";
  if (s.includes("software") || s.includes("custom")) return "Custom Software";
  return val.replace(/_/g, " ");
}

function cleanMetaBudget(val) {
  if (!val) return "";
  const b = String(val).toLowerCase().replace(/_/g, " ").trim();
  if (b.includes("below") && b.includes("40")) return "Below ₹40,000";
  if (b.includes("80") && b.includes("100")) return "₹80,000 - ₹1,00,000";
  if (b.includes("40") && b.includes("80")) return "₹40,000 - ₹80,000";
  if (b.includes("above") || b.includes("100")) return "Above ₹1,00,000";
  return val.replace(/_/g, " ");
}

export default function MetaLeadsImportModal({ isOpen, onClose, onImport, isDark = false }) {
  const [tab, setTab] = useState("paste"); // "paste" | "upload" | "webhook"
  const [rawText, setRawText] = useState("");
  const [parsedLeads, setParsedLeads] = useState([]);
  const [parseError, setParseError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen) return null;

  function parseDelimitedData(text) {
    setParseError("");
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setParseError("Please provide at least a header row and one lead row.");
      setParsedLeads([]);
      return;
    }

    // Detect delimiter: tab or comma
    const headerLine = lines[0];
    const delimiter = headerLine.includes("\t") ? "\t" : ",";

    // Helper to split CSV line safely handling quotes
    const splitLine = (line) => {
      if (delimiter === "\t") return line.split("\t").map((c) => c.trim());
      // Simple CSV split
      const tokens = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          tokens.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      tokens.push(current.trim());
      return tokens;
    };

    const headers = splitLine(headerLine).map((h) => h.toLowerCase().trim());

    // Map column index
    const findIdx = (patterns) => {
      return headers.findIndex((h) => patterns.some((p) => h.includes(p)));
    };

    const nameIdx = findIdx(["full_name", "name", "customer"]);
    const emailIdx = findIdx(["email", "mail"]);
    const phoneIdx = findIdx(["phone_number", "phone", "mobile"]);
    const serviceIdx = findIdx(["what_service_are_you_looking_for", "service"]);
    const budgetIdx = findIdx(["choose_your_budget_range", "budget"]);
    const platformIdx = findIdx(["platform"]);
    const campaignIdx = findIdx(["campaign_name", "campaign"]);
    const adIdx = findIdx(["ad_name", "ad"]);
    const cityIdx = findIdx(["city"]);
    const stateIdx = findIdx(["state"]);
    const idIdx = findIdx(["id"]);

    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length < 2) continue;

      const rawName = nameIdx !== -1 ? cols[nameIdx] : "";
      const rawEmail = emailIdx !== -1 ? cols[emailIdx] : "";
      const rawPhone = phoneIdx !== -1 ? cols[phoneIdx] : "";
      const rawService = serviceIdx !== -1 ? cols[serviceIdx] : "";
      const rawBudget = budgetIdx !== -1 ? cols[budgetIdx] : "";
      const rawPlatform = platformIdx !== -1 ? cols[platformIdx] : "ig";
      const rawCampaign = campaignIdx !== -1 ? cols[campaignIdx] : "";
      const rawAd = adIdx !== -1 ? cols[adIdx] : "";
      const rawCity = cityIdx !== -1 ? cols[cityIdx] : "";
      const rawState = stateIdx !== -1 ? cols[stateIdx] : "";
      const rawMetaId = idIdx !== -1 ? cols[idIdx] : "";

      if (!rawName && !rawPhone && !rawEmail) continue;

      const cleanedPhone = cleanMetaPhone(rawPhone);
      const cleanedService = cleanMetaService(rawService);
      const cleanedBudget = cleanMetaBudget(rawBudget);

      const platformLabel = rawPlatform === "fb" ? "Facebook" : "Instagram";

      const notesParts = [
        rawCampaign ? `Campaign: ${rawCampaign}` : null,
        rawAd ? `Ad: ${rawAd}` : null,
        cleanedBudget ? `Budget: ${cleanedBudget}` : null,
        rawCity || rawState ? `Location: ${[rawCity, rawState].filter(Boolean).join(", ")}` : null,
        rawMetaId ? `Meta Lead ID: ${rawMetaId}` : null,
      ].filter(Boolean);

      results.push({
        name: rawName || rawEmail?.split("@")[0] || "Meta Lead",
        phone: cleanedPhone || "Not provided",
        email: rawEmail || "",
        service: cleanedService,
        source: `Meta Ads (${platformLabel})`,
        status: "New",
        notes: notesParts.join(" | ") || "Inbound inquiry via Meta Ads",
        // for preview display
        city: rawCity,
        state: rawState,
        budget: cleanedBudget,
        campaign: rawCampaign,
        ad: rawAd,
      });
    }

    if (results.length === 0) {
      setParseError("Could not extract leads. Please check column headers.");
    } else {
      setParsedLeads(results);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setRawText(content);
        parseDelimitedData(content);
        setTab("paste");
      }
    };
    reader.readAsText(file);
  }

  async function handleConfirmImport() {
    if (!parsedLeads.length) return;
    setIsImporting(true);
    try {
      await onImport?.(parsedLeads);
      onClose();
    } catch (err) {
      alert("Error importing leads: " + err.message);
    } finally {
      setIsImporting(false);
    }
  }

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhooks/meta-leads`
    : "https://texwebsolution.in/api/webhooks/meta-leads";
  const verifyToken = "texweb_meta_leads_secret";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>Meta Ads Lead Ingestion</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                  Instagram & Facebook
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Directly import Meta Ads Manager exports or setup automated real-time webhooks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 px-6 bg-gray-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setTab("paste")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 cursor-pointer ${
              tab === "paste"
                ? "border-pink-600 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Paste Export (CSV / TSV)</span>
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 cursor-pointer ${
              tab === "upload"
                ? "border-pink-600 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV File</span>
          </button>
          <button
            onClick={() => setTab("webhook")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 cursor-pointer ${
              tab === "webhook"
                ? "border-pink-600 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Automated Live Webhook (Zero Manual Work)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === "paste" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  Paste Raw Export Text from Meta Ads Manager (CSV or TSV rows):
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    if (e.target.value.trim()) {
                      parseDelimitedData(e.target.value);
                    } else {
                      setParsedLeads([]);
                      setParseError("");
                    }
                  }}
                  placeholder="Paste headers and rows here (e.g. id, created_time, ad_name, full_name, email, phone_number, what_service_are_you_looking_for?...)"
                  className="w-full p-3 rounded-2xl text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-pink-500 text-gray-900 dark:text-white"
                />
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedLeads.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{parsedLeads.length} Leads Detected & Ready to Import</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRawText("");
                        setParsedLeads([]);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 transition"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Lead Name</th>
                          <th className="py-2.5 px-3">Phone</th>
                          <th className="py-2.5 px-3">Service</th>
                          <th className="py-2.5 px-3">Budget</th>
                          <th className="py-2.5 px-3">Location</th>
                          <th className="py-2.5 px-3">Campaign / Ad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {parsedLeads.map((lead, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                              {lead.name}
                              {lead.email && (
                                <div className="text-[10px] text-gray-400">{lead.email}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-gray-700 dark:text-slate-300">
                              {lead.phone}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
                                {lead.service}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                              {lead.budget || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 dark:text-slate-400 text-[11px]">
                              {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 dark:text-slate-400 text-[11px]">
                              {lead.campaign ? `${lead.campaign} / ${lead.ad}` : "Meta Ad"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "upload" && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-pink-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition cursor-pointer text-center bg-gray-50/50 dark:bg-slate-800/40">
                <Upload className="w-10 h-10 text-pink-500" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    Drop Meta Leads CSV here, or click to browse
                  </div>
                  <div className="text-xs text-gray-400">
                    Supports exports directly from Meta Ads Manager Lead Center (.csv, .tsv)
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {tab === "webhook" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Real-Time Meta Lead Ads Webhook Setup</span>
                </div>
                <p>
                  Jab bhi koi user aapke Instagram ya Facebook Ad par form submit karega, woh 0 second ke andar automatic website ke Leads panel me add ho jayega! Koi CSV download karne ki zaroorat nahi padegi.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">
                    Callback URL (Meta App Developer Dashboard me paste karein):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 p-2.5 rounded-xl font-mono text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">
                    Verify Token:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={verifyToken}
                      className="flex-1 p-2.5 rounded-xl font-mono text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(verifyToken);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedToken ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Step Setup Guide */}
              <div className="space-y-2 border-t border-gray-100 dark:border-slate-800 pt-4">
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  3 Simple Steps to Connect:
                </div>
                <ol className="list-decimal list-inside text-xs text-gray-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                  <li>
                    Go to <strong>Meta App Dashboard</strong> (developers.facebook.com) → Webhooks → Subscribe to <strong>Leadgen</strong>.
                  </li>
                  <li>
                    Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> above, then click Verify and Save.
                  </li>
                  <li>
                    Apne Facebook Page ko Webhook se subscribe kar dijiye. Ab Instagram & Facebook Ads ke sabhi leads live display honge!
                  </li>
                </ol>
                <div className="mt-2 text-xs text-gray-400">
                  💡 <em>Alternative: Agar aap Zapier, Pabbly ya Make.com use karte hain, toh woh bhi directly is Callback URL par POST bhej sakte hain!</em>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 dark:text-slate-400">
            {parsedLeads.length > 0 && `${parsedLeads.length} leads extracted`}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            {parsedLeads.length > 0 && (
              <button
                type="button"
                disabled={isImporting}
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isImporting ? "Importing..." : `Import ${parsedLeads.length} Leads`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
