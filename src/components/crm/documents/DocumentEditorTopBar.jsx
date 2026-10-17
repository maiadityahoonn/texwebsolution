"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileCheck2,
  FileText,
  Link2,
  Pencil,
  Printer,
  Save,
  Send,
  X,
} from "lucide-react";
import { getDocumentKind } from "./documentUtils";

export default function DocumentEditorTopBar({
  title,
  status,
  draftDoc,
  templateMode,
  setTemplateMode,
  updateDraftDoc,
  onClose,
  onSave,
  onSaveLetterheadAsDefault,
  onSaveTemplate,
  onDownload,
  onPrint,
  isExportingPdf = false,
  onShare,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  function commitTitle() {
    if (tempTitle.trim()) {
      updateDraftDoc({ title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  }

  const kind = getDocumentKind(draftDoc);

  return (
    <header className="h-14 bg-white dark:bg-[#18150f] border-b border-gray-200 dark:border-[#3a3020] flex items-center justify-between gap-3 px-3.5 shrink-0 select-none print:hidden z-30">
      {/* Left: Back + Editable Title + Status */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer transition"
          title="Back to Documents"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span className="hidden sm:inline">Back to Documents</span>
        </button>

        <div className="h-5 w-px bg-gray-200 dark:bg-[#3a3020] hidden sm:block" />

        {/* Editable Title */}
        <div className="flex items-center gap-2 min-w-0">
          <Pencil className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
              className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-orange-50/70 dark:bg-slate-800 border border-orange-400 rounded-lg px-2 py-0.5 outline-hidden min-w-[200px]"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate hover:text-orange-600 text-left cursor-pointer max-w-[240px] sm:max-w-[360px] md:max-w-[480px]"
              title="Click to rename document"
            >
              {title}
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusDropdown((p) => !p)}
            className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-[11px] font-bold capitalize text-gray-600 dark:text-neutral-300 flex items-center gap-1 hover:bg-gray-200 cursor-pointer"
          >
            {status}
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {showStatusDropdown && (
            <div className="absolute left-0 mt-1.5 w-32 bg-white dark:bg-[#1f1a14] rounded-xl shadow-xl border border-gray-100 dark:border-[#3a3020] p-1 z-50 text-xs font-semibold">
              {["draft", "sent", "accepted", "rejected"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    updateDraftDoc({ status: s });
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg capitalize cursor-pointer hover:bg-orange-50 dark:hover:bg-slate-800 ${
                    status === s ? "text-orange-600 font-bold bg-orange-50/50" : ""
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Template Mode Switcher */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setShowTemplateDropdown((p) => !p)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#3a3020] bg-white dark:bg-[#18150f] text-xs font-semibold text-gray-700 dark:text-neutral-200 flex items-center gap-1.5 cursor-pointer hover:bg-gray-50"
            title="Switch Document Style / Layout"
          >
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span>
              {templateMode === "letterhead"
                ? "TexWeb Letterhead"
                : templateMode === "modern"
                ? "Modern Proposal"
                : "Blank MS Word"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showTemplateDropdown && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#1f1a14] rounded-2xl shadow-xl border border-gray-100 dark:border-[#3a3020] p-1.5 z-50 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTemplateMode("letterhead");
                  setShowTemplateDropdown(false);
                }}
                className={`w-full text-left p-2 rounded-xl cursor-pointer hover:bg-orange-50 dark:hover:bg-slate-800 ${
                  templateMode === "letterhead" ? "bg-orange-50/70 text-orange-600 font-bold" : ""
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  🏢 TexWeb Letterhead
                  {templateMode === "letterhead" && <Check className="w-3.5 h-3.5 text-orange-600" />}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Official company branded header & footer</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateMode("modern");
                  setShowTemplateDropdown(false);
                }}
                className={`w-full text-left p-2 rounded-xl cursor-pointer hover:bg-orange-50 dark:hover:bg-slate-800 ${
                  templateMode === "modern" ? "bg-orange-50/70 text-orange-600 font-bold" : ""
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  📄 Modern Proposal
                  {templateMode === "modern" && <Check className="w-3.5 h-3.5 text-orange-600" />}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Clean Clienter-style minimalist white page</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateMode("blank");
                  setShowTemplateDropdown(false);
                }}
                className={`w-full text-left p-2 rounded-xl cursor-pointer hover:bg-orange-50 dark:hover:bg-slate-800 ${
                  templateMode === "blank" ? "bg-orange-50/70 text-orange-600 font-bold" : ""
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  📝 Blank Page (MS Word)
                  {templateMode === "blank" && <Check className="w-3.5 h-3.5 text-orange-600" />}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Completely clean canvas to build from tools</div>
              </button>
            </div>
          )}
        </div>

        {/* Save as template */}
        <button
          type="button"
          onClick={onSaveTemplate}
          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#3a3020] bg-white dark:bg-[#18150f] text-xs font-semibold text-gray-700 dark:text-neutral-200 flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
          title="Save as reusable template"
        >
          <Bookmark className="w-3.5 h-3.5 text-gray-500" />
          <span className="hidden sm:inline">Save as template</span>
        </button>

        {/* Download PDF (with Letterhead) */}
        <button
          type="button"
          onClick={onDownload}
          disabled={isExportingPdf}
          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Download Document with Official Letterhead as PDF"
        >
          <Download className={`w-3.5 h-3.5 ${isExportingPdf ? "animate-bounce" : ""}`} />
          <span>{isExportingPdf ? "Generating PDF..." : "Download PDF"}</span>
        </button>

        {/* Print Option */}
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-[#3a3020] bg-white dark:bg-[#18150f] text-gray-600 dark:text-neutral-300 hover:bg-gray-50 cursor-pointer"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Save Letterhead Design as Default */}
        {templateMode === "letterhead" && onSaveLetterheadAsDefault && (
          <button
            type="button"
            onClick={onSaveLetterheadAsDefault}
            className="px-3 py-1.5 rounded-xl border border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-bold flex items-center gap-1.5 hover:bg-orange-100 cursor-pointer shadow-2xs transition active:scale-95"
            title="Lock & Save this customized letterhead design permanently as the default for all pages and new documents"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden md:inline">Save Letterhead Design</span>
          </button>
        )}

        {/* Save changes */}
        <button
          type="button"
          onClick={onSave}
          className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 cursor-pointer"
          title="Save Document Changes"
        >
          <Save className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Share link (Orange button like in screenshot!) */}
        <button
          type="button"
          onClick={onShare}
          className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/25 cursor-pointer transition active:scale-95"
          title="Share document link with client"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Share link</span>
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-700 cursor-pointer transition"
          title="Close Editor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
