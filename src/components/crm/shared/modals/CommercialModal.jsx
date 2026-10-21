"use client";

import { FileText, Sparkles, Mic, Paperclip, Eye, X } from "lucide-react";
import WhatsAppIcon from "../WhatsAppIcon";
import CommercialDocumentPreview from "../CommercialDocumentPreview";

export default function CommercialModal({
  show,
  onClose,
  onSubmit,
  commercialType,
  setCommercialType,
  commercialForm,
  setCommercialForm,
  deals = [],
  leads = [],
  proposals = [],
  onPreviewPdf,
  aiDocTracking,
  aiDocInput,
  setAiDocInput,
  aiDocListening,
  startAiVoiceInput,
  handleAiAttachmentChange,
  aiDocAttachments,
  setAiDocAttachments,
  handleGenerateAiDocumentDraft,
  aiDocLoading,
  aiDocMessages,
  aiDocDraft,
  applyAiDraftToCommercialForm,
}) {
  if (!show) return null;

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-2 min-[360px]:p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-6xl max-h-[85vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 min-[360px]:px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-orange-50/70 via-amber-50/25 to-transparent dark:from-orange-950/25 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-2.5 min-[360px]:gap-3">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <FileText className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Sales Quotation / Agreement</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Quotation is the sales document; agreement is final signing before deal won</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs">
            {[
              ["proposal", "Quotation"],
              ["agreement", "Agreement"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCommercialType(id)}
                className={`flex-1 rounded-lg px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 font-bold transition whitespace-nowrap min-w-0 cursor-pointer ${
                  commercialType === id ? "bg-white dark:bg-slate-900 text-orange-600 shadow-2xs" : "text-gray-500"
                }`}
              >
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-orange-100 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/10 p-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  AI Draft Assistant
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                  Isolated history for this deal and {commercialType === "agreement" ? "agreement" : "quotation"} only.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 text-orange-700 dark:text-orange-300">
                  {aiDocTracking?.status || "draft"}
                </span>
                {aiDocTracking?.sent_at && (
                  <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                    Sent tracked
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-3">
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={aiDocInput}
                  onChange={(e) => setAiDocInput(e.target.value)}
                  placeholder="Type requirement notes, meeting summary, pricing instruction, special terms..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={startAiVoiceInput}
                    className={`px-2.5 min-[360px]:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer whitespace-nowrap shrink-0 min-w-0 ${
                      aiDocListening
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-white dark:bg-slate-900 text-gray-700 dark:text-neutral-200 border-orange-100 dark:border-orange-900/40"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{aiDocListening ? "Listening..." : "Voice"}</span>
                  </button>
                  <label className="px-2.5 min-[360px]:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-slate-900 text-gray-700 dark:text-neutral-200 border border-orange-100 dark:border-orange-900/40 cursor-pointer whitespace-nowrap shrink-0 min-w-0">
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Upload Doc/Image</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.doc,.docx,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => handleAiAttachmentChange(e.target.files)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDocumentDraft}
                    disabled={aiDocLoading || !commercialForm.deal_id}
                    className="px-2.5 min-[360px]:px-3 py-1.5 rounded-xl text-xs font-black bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 min-w-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{aiDocLoading ? "Generating..." : "Generate Draft"}</span>
                  </button>
                </div>
                {aiDocAttachments?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {aiDocAttachments.map((item, index) => (
                      <span key={`${item.name}-${index}`} className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 text-[10px] font-semibold text-gray-600 dark:text-neutral-300">
                        {item.name}
                      </span>
                    ))}
                    <button type="button" onClick={() => setAiDocAttachments([])} className="text-[10px] font-bold text-red-600 px-2">
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 p-2.5 min-h-[150px] max-h-[240px] overflow-y-auto space-y-2">
                {(!aiDocMessages || aiDocMessages.length === 0) && !aiDocDraft ? (
                  <div className="h-full min-h-[120px] flex items-center justify-center text-center text-[11px] text-gray-400 px-4">
                    Client-specific AI chat history will appear here. It will not mix with other deals.
                  </div>
                ) : (
                  <>
                    {(aiDocMessages || []).slice(-6).map((msg, index) => (
                      <div key={msg.id || index} className={`p-2 rounded-lg text-[11px] ${
                        msg.role === "assistant"
                          ? "bg-orange-50 dark:bg-orange-950/30 text-gray-700 dark:text-neutral-200"
                          : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-neutral-200"
                      }`}>
                        <div className="font-black uppercase text-[9px] text-gray-400 mb-1">{msg.role}</div>
                        <div className="whitespace-pre-wrap line-clamp-5">{msg.content}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {aiDocDraft && (
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-black text-gray-900 dark:text-white">Editable AI Draft Preview</div>
                  <button
                    type="button"
                    onClick={() => applyAiDraftToCommercialForm()}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black cursor-pointer"
                  >
                    Insert Again
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-neutral-300">
                  <div><span className="font-bold">Title:</span> {aiDocDraft.title}</div>
                  <div><span className="font-bold">Terms:</span> {aiDocDraft.commercial_terms}</div>
                  <div className="sm:col-span-2"><span className="font-bold">Scope:</span> {aiDocDraft.scope_of_work}</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Linked Deal *</label>
                <div className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-200 font-semibold">
                  {deals.find((deal) => deal.id === commercialForm?.deal_id)?.title || "No deal available"}
                </div>
              </div>

              {commercialType === "agreement" && (
                <>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Agreement Number</label>
                    <input
                      type="text"
                      value={commercialForm?.agreement_number || ""}
                      onChange={(e) => setCommercialForm({ ...(commercialForm || {}), agreement_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Quotation Ref</label>
                    <select
                      value={commercialForm?.proposal_id || ""}
                      onChange={(e) => setCommercialForm({ ...(commercialForm || {}), proposal_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                    >
                      <option value="">No quotation ref</option>
                      {proposals.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                    </select>
                  </div>
                </>
              )}

              {commercialType !== "agreement" && (
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Commercial Value *</label>
                  <input
                    type="number"
                    required
                    value={commercialForm?.amount ?? ""}
                    onChange={(e) => setCommercialForm({ ...(commercialForm || {}), amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  {commercialType === "agreement" ? "Start Date" : "Valid Until"}
                </label>
                <input
                  type="date"
                  value={commercialType === "agreement" ? (commercialForm?.start_date || "") : (commercialForm?.valid_until || "")}
                  onChange={(e) =>
                    setCommercialForm({
                      ...(commercialForm || {}),
                      [commercialType === "agreement" ? "start_date" : "valid_until"]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              {commercialType === "agreement" && (
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">End Date</label>
                  <input
                    type="date"
                    value={commercialForm?.end_date || ""}
                    onChange={(e) => setCommercialForm({ ...(commercialForm || {}), end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Status</label>
                <select
                  value={commercialForm?.status || "draft"}
                  onChange={(e) => setCommercialForm({ ...(commercialForm || {}), status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  {commercialType === "agreement" ? <option value="signed">Signed</option> : <option value="accepted">Accepted</option>}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Title *</label>
                <input
                  type="text"
                  required
                  value={commercialForm?.title || ""}
                  onChange={(e) => setCommercialForm({ ...(commercialForm || {}), title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Scope of Work</label>
                <textarea
                  rows={3}
                  value={commercialForm?.scope_of_work || ""}
                  onChange={(e) => setCommercialForm({ ...(commercialForm || {}), scope_of_work: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  {commercialType === "agreement" ? "Commercial Terms" : "Deliverables"}
                </label>
                <textarea
                  rows={3}
                  value={commercialType === "agreement" ? (commercialForm?.commercial_terms || "") : (commercialForm?.deliverables || "")}
                  onChange={(e) =>
                    setCommercialForm({
                      ...(commercialForm || {}),
                      [commercialType === "agreement" ? "commercial_terms" : "deliverables"]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            <CommercialDocumentPreview
              form={commercialForm}
              type={commercialType}
              deal={deals.find((deal) => deal.id === commercialForm?.deal_id)}
              lead={leads.find((lead) => lead.id === deals.find((deal) => deal.id === commercialForm?.deal_id)?.lead_id)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5 px-3.5 min-[360px]:px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 min-[360px]:px-4 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer whitespace-nowrap min-w-0"
          >
            <span className="truncate">Cancel</span>
          </button>
          <button
            type="button"
            onClick={onPreviewPdf}
            className="px-3 min-[360px]:px-4 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm cursor-pointer shrink-0 min-w-0 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Preview PDF</span>
          </button>
          <button
            type="submit"
            className="px-3 min-[360px]:px-5 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 min-w-0 whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Save {commercialType === "agreement" ? "Agreement" : "Quotation"}</span>
          </button>
          <button
            type="button"
            onClick={(e) => onSubmit(e, true)}
            className="px-3 min-[360px]:px-5 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 min-w-0 whitespace-nowrap"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Save & WhatsApp</span>
          </button>
        </div>
      </form>
    </div>
  );
}
