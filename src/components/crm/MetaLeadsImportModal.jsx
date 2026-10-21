"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { parseDelimitedData, decodeLeadFile } from "./shared/metaLeadsImportUtils";
import MetaLeadsPreviewTable from "./shared/MetaLeadsPreviewTable";
import MetaLeadsWebhookTab from "./shared/MetaLeadsWebhookTab";

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function MetaLeadsImportModal({ isOpen, onClose, onImport, onImportBatch, isDark = false }) {
  const [tab, setTab] = useState("paste"); // "paste" | "upload" | "webhook"
  const [rawText, setRawText] = useState("");
  const [parsedLeads, setParsedLeads] = useState([]);
  const [parseError, setParseError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  function handleDataParse(text) {
    const result = parseDelimitedData(text);
    setParseError(result.error);
    setParsedLeads(result.leads);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const decoded = content instanceof ArrayBuffer ? decodeLeadFile(content) : typeof content === "string" ? content : "";
      if (decoded) {
        setRawText(decoded);
        handleDataParse(decoded);
        setTab("paste");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleConfirmImport() {
    if (!parsedLeads.length) return;
    setIsImporting(true);
    try {
      const importFn = onImport || onImportBatch;
      await importFn?.(parsedLeads);
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
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn overscroll-contain"
    >
      <div className="relative w-full max-w-4xl max-h-[82vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>Excel / Meta Leads Import</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                  Instagram & Facebook
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Excel, Google Sheet, ya Meta exports ko import karo; save hone ke baad Meta CAPI event auto-send hota hai.
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
        <div className="flex border-b border-gray-100 dark:border-slate-800 px-3 min-[360px]:px-6 bg-gray-50/50 dark:bg-slate-900/50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab("paste")}
            className={`py-2.5 min-[360px]:py-3 px-2.5 min-[360px]:px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
              tab === "paste"
                ? "border-pink-600 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="truncate">Paste Excel / Sheet Rows</span>
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`py-2.5 min-[360px]:py-3 px-2.5 min-[360px]:px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
              tab === "upload"
                ? "border-pink-600 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400"
            }`}
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span className="truncate">Upload CSV / TSV File</span>
          </button>
          <button
            onClick={() => setTab("webhook")}
            className={`py-2.5 min-[360px]:py-3 px-2.5 min-[360px]:px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
              tab === "webhook"
                ? "border-pink-600 text-pink-600 dark:text-pink-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">Automated Live Webhook</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === "paste" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  Paste Excel / Google Sheet / Meta export rows:
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    if (e.target.value.trim()) {
                      handleDataParse(e.target.value);
                    } else {
                      setParsedLeads([]);
                      setParseError("");
                    }
                  }}
                  placeholder="Paste headers and rows here, e.g. id, created_time, form_name, what_service_are_you_looking_for?, पूरा_नाम, ईमेल, मोबाइल, city, state..."
                  className="w-full p-3 rounded-2xl text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-pink-500 text-gray-900 dark:text-white"
                />
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <MetaLeadsPreviewTable
                parsedLeads={parsedLeads}
                onClear={() => {
                  setRawText("");
                  setParsedLeads([]);
                }}
              />
            </div>
          )}

          {tab === "upload" && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-pink-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition cursor-pointer text-center bg-gray-50/50 dark:bg-slate-800/40">
                <Upload className="w-10 h-10 text-pink-500" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    Drop Excel/Google Sheet export here, or click to browse
                  </div>
                  <div className="text-xs text-gray-400">
                    Supports CSV/TSV/Text exports. Native .xlsx should be saved/exported as CSV first.
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
            <MetaLeadsWebhookTab
              webhookUrl={webhookUrl}
              verifyToken={verifyToken}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 min-[360px]:px-6 py-3 min-[360px]:py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2 shrink-0 min-w-0">
          <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
            {parsedLeads.length > 0 && `${parsedLeads.length} leads extracted`}
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 min-[360px]:px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 transition cursor-pointer whitespace-nowrap min-w-0"
            >
              <span className="truncate">Cancel</span>
            </button>
            {parsedLeads.length > 0 && (
              <button
                type="button"
                disabled={isImporting}
                onClick={handleConfirmImport}
                className="px-3.5 min-[360px]:px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap min-w-0 shrink-0"
              >
                <span className="truncate">{isImporting ? "Importing..." : `Import ${parsedLeads.length} Leads`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
