"use client";

import {
  FollowUpModal,
  SalesMeetingModal,
  MeetingSettingsModal,
  RescheduleModal,
  StageChangeModal,
  AddDealModal,
  EditDealModal,
  AddLeadModal,
  EditLeadModal,
  LostModal,
  CommercialModal,
  InvoiceModal,
  LeadDetailsDrawer,
  DealDetailsDrawer,
} from "../shared/modals";
import MetaLeadsImportModal from "../MetaLeadsImportModal";

export default function CrmModalHost({
  selectedLead,
  setSelectedLead,
  selectedDeal,
  setSelectedDeal,
  deals,
  leads,
  clients,
  proposals,
  quotations,
  agreements,
  invoices,
  followUps,
  salesMeetings,
  isDark,
  currentUser,
  currentProfile,
  defaultMeetLink,
  showAddLeadModal,
  setShowAddLeadModal,
  newLeadForm,
  setNewLeadForm,
  handleAddLeadSubmit,
  editingLead,
  setEditingLead,
  editLeadForm,
  setEditLeadForm,
  handleSaveEdit,
  showLostModal,
  setShowLostModal,
  lostTarget,
  lostForm,
  setLostForm,
  handleMarkLostSubmit,
  showFollowUpModal,
  setShowFollowUpModal,
  followUpForm,
  setFollowUpForm,
  handleCreateFollowUpSubmit,
  showSalesMeetingModal,
  setShowSalesMeetingModal,
  salesMeetingForm,
  setSalesMeetingForm,
  handleCreateSalesMeetingSubmit,
  showMeetingSettingsModal,
  setShowMeetingSettingsModal,
  setDefaultMeetLink,
  handleSaveMeetingSettings,
  showRescheduleModal,
  setShowRescheduleModal,
  rescheduleTarget,
  salesMeetingRescheduleTarget,
  rescheduleForm,
  setRescheduleForm,
  handleRescheduleSubmit,
  stageModalTarget,
  setStageModalTarget,
  stageModalStatus,
  setStageModalStatus,
  stageModalNote,
  setStageModalNote,
  handleSaveStageModal,
  showAddDealModal,
  setShowAddDealModal,
  newDealForm,
  setNewDealForm,
  handleCreateDealSubmit,
  editingDeal,
  setEditingDeal,
  editDealForm,
  setEditDealForm,
  handleSaveEditDeal,
  showCommercialModal,
  setShowCommercialModal,
  handleCommercialSubmit,
  commercialType,
  setCommercialType,
  commercialForm,
  setCommercialForm,
  aiDocInput,
  setAiDocInput,
  aiDocAttachments,
  handleAiAttachmentChange,
  aiDocLoading,
  aiDocListening,
  startAiVoiceInput,
  handleGenerateAiDocumentDraft,
  aiDocMessages,
  aiDocDraft,
  applyAiDraftToCommercialForm,
  aiDocTracking,
  setAiDocTracking,
  handlePreviewCommercialPdf,
  onCreateProposal,
  onCreateAgreement,
  onConvertToClientAndProject,
  sendDocWhatsApp,
  showInvoiceModal,
  setShowInvoiceModal,
  invoiceForm,
  setInvoiceForm,
  invoiceDeal,
  setInvoiceDeal,
  handleInvoiceSubmit,
  showMetaImportModal,
  setShowMetaImportModal,
  onImportBatchLeads,
  handleOpenEdit,
  handleWhatsAppClick,
  handleReopenLead,
  openLeadFollowUpModal,
  openLeadMeetingModal,
  handleOpenEditDeal,
  handleDealStageChange,
  openDealMeetingModal,
  openDealFollowUpModal,
  sendDealDocWhatsApp,
  openCommercialModal,
  openInvoiceModal,
  openStageModal,
}) {
  return (
    <>
      <LeadDetailsDrawer
        selectedLead={selectedLead}
        onClose={() => setSelectedLead(null)}
        deals={deals}
        followUps={followUps}
        salesMeetings={salesMeetings}
        isDark={isDark}
        onOpenEdit={handleOpenEdit}
        onWhatsAppClick={handleWhatsAppClick}
        onReopenLead={handleReopenLead}
        onOpenLeadFollowUp={openLeadFollowUpModal}
        onOpenSalesMeeting={openLeadMeetingModal}
        currentUser={currentUser}
        currentProfile={currentProfile}
        defaultMeetLink={defaultMeetLink}
      />

      <DealDetailsDrawer
        selectedDeal={selectedDeal}
        setSelectedDeal={setSelectedDeal}
        leads={leads}
        clients={clients}
        proposals={proposals}
        quotations={quotations}
        agreements={agreements}
        invoices={invoices}
        salesMeetings={salesMeetings}
        followUps={followUps}
        isDark={isDark}
        handleOpenEditDeal={handleOpenEditDeal}
        handleDealStageChange={handleDealStageChange}
        openDealMeetingModal={openDealMeetingModal}
        openDealFollowUpModal={openDealFollowUpModal}
        handleWhatsAppClick={handleWhatsAppClick}
        sendDealDocWhatsApp={sendDealDocWhatsApp}
        openCommercialModal={openCommercialModal}
        openInvoiceModal={openInvoiceModal}
        setSelectedLead={setSelectedLead}
        openStageModal={openStageModal}
        currentUser={currentUser}
        currentProfile={currentProfile}
      />

      <AddLeadModal
        show={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSubmit={handleAddLeadSubmit}
        form={newLeadForm}
        setForm={setNewLeadForm}
      />

      <EditLeadModal
        lead={editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={handleSaveEdit}
        form={editLeadForm}
        setForm={setEditLeadForm}
      />

      <LostModal
        show={showLostModal}
        target={lostTarget}
        onClose={() => setShowLostModal(false)}
        onSubmit={handleMarkLostSubmit}
        form={lostForm}
        setForm={setLostForm}
      />

      <FollowUpModal
        show={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        onSubmit={handleCreateFollowUpSubmit}
        form={followUpForm}
        setForm={setFollowUpForm}
        leads={leads}
        deals={deals}
      />

      <SalesMeetingModal
        show={showSalesMeetingModal}
        onClose={() => setShowSalesMeetingModal(false)}
        onSubmit={handleCreateSalesMeetingSubmit}
        form={salesMeetingForm}
        setForm={setSalesMeetingForm}
        leads={leads}
        deals={deals}
        setShowMeetingSettingsModal={setShowMeetingSettingsModal}
      />

      <MeetingSettingsModal
        show={showMeetingSettingsModal}
        onClose={() => setShowMeetingSettingsModal(false)}
        defaultMeetLink={defaultMeetLink}
        setDefaultMeetLink={setDefaultMeetLink}
        onSave={handleSaveMeetingSettings}
      />

      <RescheduleModal
        show={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onSubmit={handleRescheduleSubmit}
        rescheduleTarget={rescheduleTarget}
        salesMeetingRescheduleTarget={salesMeetingRescheduleTarget}
        form={rescheduleForm}
        setForm={setRescheduleForm}
      />

      <StageChangeModal
        target={stageModalTarget}
        onClose={() => setStageModalTarget(null)}
        status={stageModalStatus}
        setStatus={setStageModalStatus}
        note={stageModalNote}
        setNote={setStageModalNote}
        onSave={handleSaveStageModal}
        leads={leads}
        clients={clients}
      />

      <AddDealModal
        show={showAddDealModal}
        onClose={() => setShowAddDealModal(false)}
        onSubmit={handleCreateDealSubmit}
        form={newDealForm}
        setForm={setNewDealForm}
        leads={leads}
        setShowMeetingSettingsModal={setShowMeetingSettingsModal}
      />

      <EditDealModal
        deal={editingDeal}
        onClose={() => setEditingDeal(null)}
        onSubmit={handleSaveEditDeal}
        form={editDealForm}
        setForm={setEditDealForm}
      />

      <CommercialModal
        show={showCommercialModal}
        onClose={() => setShowCommercialModal(false)}
        onSubmit={handleCommercialSubmit}
        commercialType={commercialType}
        setCommercialType={setCommercialType}
        commercialForm={commercialForm}
        setCommercialForm={setCommercialForm}
        deals={deals}
        leads={leads}
        clients={clients}
        aiDocInput={aiDocInput}
        setAiDocInput={setAiDocInput}
        aiDocAttachments={aiDocAttachments}
        handleAiAttachmentChange={handleAiAttachmentChange}
        aiDocLoading={aiDocLoading}
        aiDocListening={aiDocListening}
        startAiVoiceInput={startAiVoiceInput}
        handleGenerateAiDocumentDraft={handleGenerateAiDocumentDraft}
        aiDocMessages={aiDocMessages}
        aiDocDraft={aiDocDraft}
        applyAiDraftToCommercialForm={applyAiDraftToCommercialForm}
        aiDocTracking={aiDocTracking}
        setAiDocTracking={setAiDocTracking}
        onPreviewPdf={handlePreviewCommercialPdf}
        onCreateProposal={onCreateProposal}
        onCreateAgreement={onCreateAgreement}
        onConvertToClientAndProject={onConvertToClientAndProject}
        sendDocWhatsApp={sendDocWhatsApp}
      />

      <InvoiceModal
        show={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setInvoiceDeal(null);
        }}
        onSubmit={handleInvoiceSubmit}
        form={invoiceForm}
        setForm={setInvoiceForm}
        deal={invoiceDeal}
        deals={deals}
        clients={clients}
        leads={leads}
        onMilestoneChange={(milestoneType) => {
          const baseAmount = Number(invoiceDeal?.deal_value || invoiceForm.amount || 0);
          const ratios = {
            advance: 0.4,
            milestone: 0.3,
            final: 0.3,
            full: 1,
          };
          setInvoiceForm((prev) => ({
            ...prev,
            milestone_type: milestoneType,
            amount: ratios[milestoneType] ? String(Math.round(baseAmount * ratios[milestoneType])) : prev.amount,
          }));
        }}
      />

      <MetaLeadsImportModal
        isOpen={showMetaImportModal}
        onClose={() => setShowMetaImportModal(false)}
        onImport={onImportBatchLeads}
        onImportBatch={onImportBatchLeads}
        existingLeads={leads}
      />
    </>
  );
}
