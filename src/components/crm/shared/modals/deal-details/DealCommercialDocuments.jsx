"use client";

import { FileText } from "lucide-react";

export default function DealCommercialDocuments({
  selectedDeal,
  dealProposals = [],
  dealAgreements = [],
  dealInvoices = [],
  openCommercialModal,
  openInvoiceModal,
}) {
  const totalDocuments = dealProposals.length + dealAgreements.length + dealInvoices.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-900 dark:text-white uppercase text-[11px] tracking-wide flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-500" />
          <span>Commercial Documents ({totalDocuments})</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openCommercialModal("proposal", selectedDeal)}
            className="px-2 py-0.5 rounded text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition cursor-pointer"
          >
            + Quotation
          </button>
          <button
            type="button"
            onClick={() => openCommercialModal("agreement", selectedDeal)}
            className="px-2 py-0.5 rounded text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition cursor-pointer"
          >
            + Agreement
          </button>
          <button
            type="button"
            onClick={() => openInvoiceModal(selectedDeal)}
            className="px-2 py-0.5 rounded text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 transition cursor-pointer"
          >
            + Invoice
          </button>
        </div>
      </div>
      {totalDocuments === 0 ? (
        <div className="p-3 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 text-center text-gray-400 text-xs">
          No commercial documents attached to this deal yet.
        </div>
      ) : (
        <div className="space-y-1.5">
          {dealProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">{proposal.title || "Quotation"}</span>
                <span className="text-[10px] text-gray-500">
                  {proposal.quotation_number || "QT"} · ₹
                  {(Number(proposal.total || proposal.amount) || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 uppercase">
                {proposal.status || "sent"}
              </span>
            </div>
          ))}
          {dealAgreements.map((agreement) => (
            <div
              key={agreement.id}
              className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">{agreement.title || "Agreement"}</span>
                <span className="text-[10px] text-gray-500">
                  {agreement.agreement_number || "AGR"} · ₹
                  {(Number(agreement.amount) || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 uppercase">
                {agreement.status || "active"}
              </span>
            </div>
          ))}
          {dealInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">{invoice.title || "Invoice"}</span>
                <span className="text-[10px] text-gray-500">
                  {invoice.invoice_number || "INV"} · ₹
                  {(Number(invoice.total_amount || invoice.amount) || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 uppercase">
                {invoice.status || "unpaid"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
