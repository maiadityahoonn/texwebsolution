"use client";

import DocumentLibrary from "../documents/DocumentLibrary";

export default function CommercialsView({
  isCommercialsLoading = false,
  commercialDocs = [],
  deals = [],
  clients = [],
  leads = [],
  openCommercialModal = () => {},
  onUpdateAgreement = () => {},
  onUpdateQuotation = () => {},
  onUpdateProposal = () => {},
}) {
  return (
    <DocumentLibrary
      isLoading={isCommercialsLoading}
      commercialDocs={commercialDocs}
      deals={deals}
      clients={clients}
      leads={leads}
      openCommercialModal={openCommercialModal}
      onUpdateAgreement={onUpdateAgreement}
      onUpdateQuotation={onUpdateQuotation}
      onUpdateProposal={onUpdateProposal}
    />
  );
}
