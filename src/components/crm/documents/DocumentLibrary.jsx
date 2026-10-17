"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FilePlus2, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import DocumentCard from "./DocumentCard";
import DocumentEditorModal from "./DocumentEditorModal";
import { DOCUMENT_TABS, getDocumentKind } from "./documentUtils";

export default function DocumentLibrary({
  isLoading = false,
  commercialDocs = [],
  deals = [],
  clients = [],
  leads = [],
  openCommercialModal = () => {},
  onUpdateAgreement = () => {},
  onUpdateQuotation = () => {},
  onUpdateProposal = () => {},
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState(null);

  const documentDocs = useMemo(() => commercialDocs, [commercialDocs]);
  const visibleTabs = useMemo(() => {
    const hasInvoices = commercialDocs.some((doc) => getDocumentKind(doc) === "invoice");
    return hasInvoices ? [...DOCUMENT_TABS, { id: "invoice", label: "Invoices" }] : DOCUMENT_TABS;
  }, [commercialDocs]);
  const counts = useMemo(() => {
    return documentDocs.reduce(
      (acc, doc) => {
        const kind = getDocumentKind(doc);
        acc.all += 1;
        acc[kind] = (acc[kind] || 0) + 1;
        return acc;
      },
      { all: 0, quotation: 0, agreement: 0, invoice: 0 }
    );
  }, [documentDocs]);
  const visibleDocs = useMemo(() => {
    if (activeTab === "all") return documentDocs;
    return documentDocs.filter((doc) => getDocumentKind(doc) === activeTab);
  }, [activeTab, documentDocs]);

  async function handleSaveDocument(doc, payload) {
    const kind = getDocumentKind(doc);
    if (kind === "agreement") return onUpdateAgreement?.(doc.id, payload);
    if (doc.quotation_number) return onUpdateQuotation?.(doc.id, payload);
    return onUpdateProposal?.(doc.id, payload);
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 w-56 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-80 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((item) => <div key={item} className="h-12 w-36 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-80 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-950 dark:text-white">Documents</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">Quotations, agreements, and handoffs your clients accept or sign.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setSelectedDoc({
                id: `letterhead-${Date.now()}`,
                title: "Website & Digital Solutions Quotation",
                docType: "proposal",
                quotation_number: `QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                is_blank: false,
                templateMode: "letterhead",
                created_at: new Date().toISOString(),
              })
            }
            className="px-4 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-black flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/25 transition active:scale-95"
            title="Create new quotation with official TexWeb Letterhead"
          >
            <FilePlus2 className="w-4 h-4 text-white" />
            New Letterhead Quotation
          </button>
          <button
            type="button"
            onClick={() =>
              setSelectedDoc({
                id: `blank-${Date.now()}`,
                title: "Untitled Document",
                docType: "proposal",
                quotation_number: `QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                is_blank: true,
                templateMode: "blank",
                created_at: new Date().toISOString(),
              })
            }
            className="px-3.5 py-3 rounded-2xl border border-gray-200 dark:border-[#3a3020] bg-white dark:bg-[#18150f] text-sm font-bold flex items-center gap-2 cursor-pointer hover:border-orange-500 transition text-gray-700 dark:text-neutral-200"
            title="Create blank document with MS Word style canvas"
          >
            <FilePlus2 className="w-4 h-4 text-gray-500" />
            Blank Canvas
          </button>
          <button
            type="button"
            onClick={() => openCommercialModal("proposal")}
            className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-[#3a3020] bg-white dark:bg-[#18150f] text-sm font-bold flex items-center gap-2 cursor-pointer hover:border-orange-500 transition"
          >
            <Plus className="w-4 h-4" />
            New Quotation
          </button>
          <button
            type="button"
            onClick={() => openCommercialModal("agreement")}
            className="px-4 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-black flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Agreement
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-sm font-black whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-orange-600 text-white shadow-md shadow-orange-500/25"
                : "bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] text-gray-700 dark:text-neutral-200"
            }`}
          >
            {tab.label} {counts[tab.id] || 0}
          </button>
        ))}
      </div>

      {visibleDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-[#3a3020] bg-white/70 dark:bg-[#18150f]/70 p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div className="mt-3 font-black text-gray-950 dark:text-white">No documents yet</div>
          <div className="mt-1 text-sm text-gray-500">Create a quotation or agreement from a pipeline deal.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {visibleDocs.map((doc) => (
            <DocumentCard
              key={`${getDocumentKind(doc)}-${doc.id}`}
              doc={doc}
              deals={deals}
              clients={clients}
              leads={leads}
              onOpen={setSelectedDoc}
            />
          ))}
        </div>
      )}

      <DocumentEditorModal
        doc={selectedDoc}
        deals={deals}
        clients={clients}
        leads={leads}
        onClose={() => setSelectedDoc(null)}
        onCreateFromType={openCommercialModal}
        onSaveDocument={handleSaveDocument}
      />
    </div>
  );
}
