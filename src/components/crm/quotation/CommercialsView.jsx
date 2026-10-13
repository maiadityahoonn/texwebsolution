"use client";

import React from "react";
import { Plus, Check, X } from "lucide-react";
import ResponsiveTableContainer from "../shared/ResponsiveTableContainer";
import TablePagination from "../shared/TablePagination";
import { CommercialsSkeleton } from "../shared/CrmSkeletons";
import WhatsAppIcon from "../shared/WhatsAppIcon";

export default function CommercialsView({
  isCommercialsLoading = false,
  commercialDocs = [],
  deals = [],
  openCommercialModal = () => {},
  openInvoiceModal = () => {},
  sendDocWhatsApp = () => {},
  onUpdateAgreement = () => {},
  onUpdateQuotation = () => {},
  onUpdateProposal = () => {},
  onUpdateInvoice = () => {},
}) {
  const [docPage, setDocPage] = React.useState(1);
  const [docsPerPage, setDocsPerPage] = React.useState(10);

  const total = commercialDocs.length;
  const pageCount = Math.max(1, Math.ceil(total / docsPerPage));
  const safePage = Math.min(Math.max(1, docPage), pageCount);
  const start = total === 0 ? 0 : (safePage - 1) * docsPerPage + 1;
  const end = Math.min(total, safePage * docsPerPage);
  const paginatedDocs = React.useMemo(() => {
    const s = (safePage - 1) * docsPerPage;
    return commercialDocs.slice(s, s + docsPerPage);
  }, [commercialDocs, safePage, docsPerPage]);

  if (isCommercialsLoading && commercialDocs.length === 0) {
    return <CommercialsSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          ["proposal", "Create Quotation", "Prepare project quotation with scope and deliverables"],
          ["agreement", "Create Agreement", "Draft commercial agreement and payment milestones"],
          ["invoice", "Create Invoice", "Generate tax invoice linked to pipeline deal"],
        ].map(([type, title, desc]) => (
          <button
            key={type}
            type="button"
            onClick={() => (type === "invoice" ? openInvoiceModal() : openCommercialModal(type))}
            className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] text-left hover:border-orange-500/50 hover:shadow-xs transition cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{title}</span>
              <Plus className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{desc}</p>
          </button>
        ))}
      </div>

      {/* Commercial Documents Table */}
      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
        {commercialDocs.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">
            No quotation, agreement, or invoice found.
          </div>
        ) : (
          <>
            <ResponsiveTableContainer>
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[960px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[180px]">Document</th>
                  <th className="py-3 px-4 min-w-[150px]">Deal</th>
                  <th className="py-3 px-4 min-w-[160px]">Value / Terms</th>
                  <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 text-right min-w-[160px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                {paginatedDocs.map((doc) => {
                  const deal = deals.find((item) => item.id === doc.deal_id);
                  const amount = Number(doc.total_amount) || Number(doc.total) || Number(doc.amount) || Number(doc.subtotal) || 0;
                  const label = doc.invoice_number || doc.agreement_number || doc.quotation_number || doc.title;
                  const isFinal = ["accepted", "signed", "rejected", "declined", "cancelled", "paid"].includes(doc.status);

                  return (
                    <tr
                      key={`${doc.docType}-${doc.id}`}
                      className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {label || "Commercial Document"}
                        </div>
                        <div className="text-[11px] text-gray-500 capitalize">{doc.docType === "invoice" ? "Invoice" : doc.docType}</div>
                      </td>
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {deal?.title || "Linked Deal"}
                        </div>
                        <div className="text-[11px] text-gray-500">{deal?.pipeline_stage || "Pipeline deal"}</div>
                      </td>
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="font-mono font-bold text-gray-900 dark:text-white">
                          {doc.docType === "agreement"
                            ? doc.commercial_terms || "Payment milestones"
                            : `₹${amount.toLocaleString("en-IN")}`}
                        </div>
                        {doc.milestone_type && (
                          <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 capitalize">
                            Milestone: {doc.milestone_type}
                          </div>
                        )}
                        {doc.scope_of_work && (
                          <div className="text-[11px] text-gray-500 dark:text-neutral-400 whitespace-pre-line break-words mt-0.5 leading-relaxed">
                            {doc.scope_of_work}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            ["accepted", "signed", "paid"].includes(doc.status)
                              ? "bg-emerald-50 text-emerald-600"
                              : ["rejected", "declined", "cancelled"].includes(doc.status)
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {doc.status || "draft"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[110px] whitespace-nowrap text-gray-500 text-xs">
                        {doc.due_date ||
                          doc.valid_until ||
                          doc.start_date ||
                          doc.sent_at?.slice(0, 10) ||
                          doc.created_at?.slice(0, 10) ||
                          "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right min-w-[160px] whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 shrink-0 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => sendDocWhatsApp(doc, doc.docType)}
                            className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/50 dark:border-emerald-800/40 transition shrink-0 cursor-pointer"
                            title="Send on WhatsApp"
                            aria-label="Send on WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          </button>
                          {!isFinal && (
                            <>
                              <button
                                onClick={() => {
                                  if (doc.docType === "agreement")
                                    onUpdateAgreement?.(doc.id, {
                                      status: "signed",
                                      signed_at: new Date().toISOString(),
                                    });
                                  else if (doc.docType === "invoice")
                                    onUpdateInvoice?.(doc.id, {
                                      status: "paid",
                                      paid_at: new Date().toISOString(),
                                    });
                                  else if (doc.quotation_number)
                                    onUpdateQuotation?.(doc.id, { status: "accepted" });
                                  else
                                    onUpdateProposal?.(doc.id, {
                                      status: "accepted",
                                      accepted_at: new Date().toISOString(),
                                    });
                                }}
                                className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                                title={doc.docType === "agreement" ? "Sign Agreement" : doc.docType === "invoice" ? "Mark as Paid" : "Accept Document"}
                                aria-label={doc.docType === "agreement" ? "Sign Agreement" : doc.docType === "invoice" ? "Mark as Paid" : "Accept Document"}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (doc.docType === "agreement")
                                    onUpdateAgreement?.(doc.id, { status: "cancelled" });
                                  else if (doc.docType === "invoice")
                                    onUpdateInvoice?.(doc.id, { status: "cancelled" });
                                  else if (doc.quotation_number)
                                    onUpdateQuotation?.(doc.id, { status: "declined" });
                                  else onUpdateProposal?.(doc.id, { status: "rejected" });
                                }}
                                className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                                title="Reject / Cancel"
                                aria-label="Reject / Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ResponsiveTableContainer>
          <TablePagination
            label="documents"
            start={start}
            end={end}
            total={total}
            page={safePage}
            pageCount={pageCount}
            pageSize={docsPerPage}
            setPage={setDocPage}
            setPageSize={setDocsPerPage}
            pageSizeLabel="Documents per page:"
          />
        </>
      )}
      </div>
    </div>
  );
}
