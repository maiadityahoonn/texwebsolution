"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";

import {
  getLeadLossReason,
  getLeadDisplayNotes,
  getLeadLocation,
  getLeadBudget,
  getLeadNextAction,
} from "../shared/leadUtils";
import { formatStatusLabel } from "../shared/meetingUtils";

import CrmModalHost from "./CrmModalHost";
import CrmActionButtons from "./CrmActionButtons";
import CrmStatusCards from "./CrmStatusCards";
import CrmDateFilterBar from "./CrmDateFilterBar";
import CrmWorkspaceViewSwitch from "./CrmWorkspaceViewSwitch";
import CrmPullToRefresh from "./CrmPullToRefresh";

import { useCrmCalculations } from "../hooks/useCrmCalculations";
import { useCrmWorkspaceModals } from "../hooks/useCrmWorkspaceModals";
import { useCrmServerSync } from "../hooks/useCrmServerSync";

export default function CrmWorkspaceView({
  leads = [],
  deals = [],
  dealPagination = null,
  clients = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  followUps = [],
  followUpPagination = null,
  salesMeetings = [],
  meetingPagination = null,
  initialViewMode = "leads",
  leadPagination = null,
  leadSummary = null,
  onRefreshLeadSummary = null,
  dealSummary = null,
  onRefreshDealSummary = null,
  followUpSummary = null,
  onRefreshFollowUpSummary = null,
  meetingSummary = null,
  onRefreshMeetingSummary = null,
  commercialSummary = null,
  onRefreshCommercialSummary = null,
  commercialScope = "all",
  isDark = false,
  onUpdateLeadStatus,
  onCreateLead,
  onAddLead,
  onImportBatchLeads,
  onUpdateLead,
  onDeleteLead,
  onConvertToClientAndProject,
  onCreateProposal,
  onUpdateProposal,
  onUpdateQuotation,
  onCreateAgreement,
  onUpdateAgreement,
  onCreateInvoice,
  onUpdateInvoice,
  onCreateFollowUp,
  onUpdateFollowUp,
  onDeleteFollowUp,
  onCreateSalesMeeting,
  onUpdateSalesMeeting,
  onDeleteSalesMeeting,
  onUpdateDealStage,
  onUpdateDeal,
  onMarkLeadLost,
  onCreateDeal,
  onOpenDirectWhatsapp,
  onOpenChatWithLead,
  onOpenChat,
  onNavigateSection,
  onRefresh,
  onFetchLeadsPage,
  onFetchDealsPage,
  onFetchFollowUpsPage,
  onFetchMeetingsPage,
  isLoading = false,
  showViewTabs = false,
  headerActionsSlotId = "",
  currentUser = null,
  currentProfile = null,
}) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [headerActionsTarget, setHeaderActionsTarget] = useState(null);

  // Filter and pagination state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [leadPage, setLeadPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [leadAlphabetFilter, setLeadAlphabetFilter] = useState("all");
  const [leadSortOrder, setLeadSortOrder] = useState("default");
  const [pipelinePage, setPipelinePage] = useState(1);
  const [pipelinePageSize, setPipelinePageSize] = useState(20);
  const [followUpPage, setFollowUpPage] = useState(1);
  const [followUpPageSize, setFollowUpPageSize] = useState(10);
  const [followUpScope, setFollowUpScope] = useState("all");
  const [meetingPage, setMeetingPage] = useState(1);
  const [meetingPageSize, setMeetingPageSize] = useState(50);
  const searchParams = useSearchParams();
  const urlDateFilter = searchParams?.get("dateFilter") || searchParams?.get("date") || "";
  const urlStatus = searchParams?.get("status") || "";
  const urlDateFrom = searchParams?.get("dateFrom") || "";
  const urlDateTo = searchParams?.get("dateTo") || "";
  const urlSelectedDate = searchParams?.get("selectedDate") || "";

  const [dateFilter, setDateFilter] = useState(() => urlDateFilter || "all");
  const [customDateRange, setCustomDateRange] = useState(() => ({
    from: urlDateFrom || "",
    to: urlDateTo || "",
  }));
  const [selectedDate, setSelectedDate] = useState(
    () => urlSelectedDate || new Date().toISOString().split("T")[0]
  );

  // Sync viewMode when initialViewMode prop changes
  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);

  useEffect(() => {
    setQuery("");
    setStatusFilter(urlStatus || (viewMode === "leads" ? "active" : "all"));
    if (urlDateFilter) {
      setDateFilter(urlDateFilter);
    } else {
      setDateFilter("all");
    }
    if (urlDateFrom || urlDateTo) {
      setCustomDateRange({ from: urlDateFrom || "", to: urlDateTo || "" });
      setDateFilter("custom");
    }
    if (urlSelectedDate) {
      setSelectedDate(urlSelectedDate);
      setDateFilter("date");
    }
    setLeadAlphabetFilter("all");
    setLeadSortOrder("default");
    setLeadPage(1);
  }, [viewMode, urlDateFilter, urlStatus, urlDateFrom, urlDateTo, urlSelectedDate]);

  useEffect(() => {
    if (!headerActionsSlotId) {
      setHeaderActionsTarget(null);
      return;
    }
    const updateTarget = () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const el = isMobile
        ? document.getElementById("crm-mobile-page-actions") || document.getElementById(headerActionsSlotId)
        : document.getElementById(headerActionsSlotId) || document.getElementById("crm-mobile-page-actions");
      if (el) setHeaderActionsTarget(el);
    };
    updateTarget();
    window.addEventListener("resize", updateTarget);
    const timer = setTimeout(updateTarget, 30);
    const timer2 = setTimeout(updateTarget, 100);
    return () => {
      window.removeEventListener("resize", updateTarget);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [headerActionsSlotId, viewMode]);

  // Calculations
  const calculations = useCrmCalculations({
    leads,
    deals,
    proposals,
    quotations,
    agreements,
    invoices,
    followUps,
    salesMeetings,
    leadSummary,
    leadPagination,
    dealPagination,
    dealSummary,
    followUpPagination,
    followUpSummary,
    meetingPagination,
    meetingSummary,
    commercialSummary,
    isLoading,
    viewMode,
    commercialScope,
    followUpScope,
    query,
    statusFilter,
    leadAlphabetFilter,
    leadSortOrder,
    leadPage,
    leadsPerPage,
    pipelinePage,
    pipelinePageSize,
    followUpPage,
    followUpPageSize,
    meetingPage,
    meetingPageSize,
    dateFilter,
    selectedDate,
    customDateRange,
    clients,
    onFetchMeetingsPage,
  });

  const {
    matchesDateFilter,
    getLeadServerDateRange,
    getServerDateRange,
    leadLetterCounts,
    totalLettersCount,
    filteredLeads,
    safeLeadPage,
    leadPageCount,
    leadTotalForPagination,
    paginatedLeads,
    stats,
    commercialDocs,
    filteredFollowUps,
    safeFollowUpPage,
    followUpPageCount,
    paginatedFollowUps,
    followUpTotal,
    filteredSalesMeetings,
    safeMeetingPage,
    meetingPageCount,
    paginatedSalesMeetings,
    meetingTotal,
    visiblePipelineDeals,
    safePipelinePage,
    pipelinePageCount,
    paginatedPipelineDeals,
    pipelineTotal,
    isLeadsLoading,
    isPipelineLoading,
    isFollowUpsLoading,
    isMeetingsLoading,
    isReportsLoading,
    isCommercialsLoading,
    pageStatusCards,
    aiInsights,
    salesReport,
  } = calculations;

  // Server fetch sync
  const { isRefreshing, refreshStatus, handleRefreshClick } = useCrmServerSync({
    viewMode,
    dateFilter,
    selectedDate,
    customDateRange,
    meetingPage,
    meetingPageSize,
    getLeadServerDateRange,
    getServerDateRange,
    onFetchLeadsPage,
    onFetchDealsPage,
    onFetchFollowUpsPage,
    onFetchMeetingsPage,
    onRefresh,
    onRefreshLeadSummary,
    onRefreshDealSummary,
    onRefreshFollowUpSummary,
    onRefreshMeetingSummary,
    onRefreshCommercialSummary,
    statusFilter,
  });

  // Modal handlers and state
  const modals = useCrmWorkspaceModals({
    leads,
    deals,
    clients,
    proposals,
    quotations,
    agreements,
    invoices,
    salesMeetings,
    followUps,
    onCreateLead,
    onAddLead,
    onUpdateLead,
    onDeleteLead,
    onUpdateLeadStatus,
    onMarkLeadLost,
    onCreateDeal,
    onUpdateDeal,
    onUpdateDealStage,
    onConvertToClientAndProject,
    onCreateProposal,
    onCreateAgreement,
    onCreateInvoice,
    onCreateFollowUp,
    onUpdateFollowUp,
    onCreateSalesMeeting,
    onUpdateSalesMeeting,
    onOpenDirectWhatsapp,
    onRefreshLeadSummary,
  });

  const isCurrentViewLoading =
    (viewMode === "dashboard" && isReportsLoading) ||
    (viewMode === "leads" && isLeadsLoading && filteredLeads.length === 0) ||
    (viewMode === "pipeline" && isPipelineLoading && visiblePipelineDeals.length === 0) ||
    (viewMode === "followups" && isFollowUpsLoading && filteredFollowUps.length === 0) ||
    (viewMode === "sales_meetings" && isMeetingsLoading && filteredSalesMeetings.length === 0) ||
    (viewMode === "commercials" && isCommercialsLoading && commercialDocs.length === 0) ||
    (viewMode === "reports" && isReportsLoading);

  const crmActionButtons = (
    <CrmActionButtons
      viewMode={viewMode}
      commercialScope={commercialScope}
      isRefreshing={isRefreshing}
      refreshStatus={refreshStatus}
      onRefresh={handleRefreshClick}
      onAddLead={() => modals.setShowAddLeadModal(true)}
      onAddDeal={() => modals.openAddDealModal()}
      onMetaImport={() => modals.setShowMetaImportModal(true)}
      onFollowUp={() => modals.setShowFollowUpModal(true)}
      onMeeting={() => modals.setShowSalesMeetingModal(true)}
      onMeetingSettings={() => modals.setShowMeetingSettingsModal(true)}
      onCommercial={() => {
        modals.setCommercialType(commercialScope === "agreement" ? "agreement" : "proposal");
        modals.setShowCommercialModal(true);
      }}
      onInvoice={() => {
        modals.setInvoiceDeal(null);
        modals.setShowInvoiceModal(true);
      }}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      customDateRange={customDateRange}
      setCustomDateRange={setCustomDateRange}
    />
  );

  return (
    <CrmPullToRefresh onRefresh={handleRefreshClick} isRefreshing={isRefreshing}>
      <div className="space-y-4">
      {/* Header Portal directly to top header line */}
      {headerActionsTarget
        ? createPortal(
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 flex-nowrap whitespace-nowrap ml-auto">
              {crmActionButtons}
            </div>,
            headerActionsTarget
          )
        : null}

      {/* Inline Header Actions (Only shown if NO headerActionsSlotId is configured) */}
      {!headerActionsSlotId && (
        <div className="flex items-center justify-end gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
          {showViewTabs && (
            <div className="flex shrink-0 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              {[
                ["leads", "Leads List"],
                ["pipeline", "Sales Pipeline"],
                ["commercials", "Commercials"],
                ["followups", "Follow-ups"],
                ["sales_meetings", "Meetings"],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === mode
                      ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                      : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {crmActionButtons}
        </div>
      )}

      {/* Metric summary status cards */}
      <CrmStatusCards
        pageStatusCards={pageStatusCards}
        isLoading={isReportsLoading || isLeadsLoading || isPipelineLoading || isFollowUpsLoading || isMeetingsLoading || isCommercialsLoading}
        viewMode={viewMode}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setLeadPage={setLeadPage}
        setPipelinePage={setPipelinePage}
        setFollowUpPage={setFollowUpPage}
        setMeetingPage={setMeetingPage}
      />

      {/* Search and Date filter bar */}
      <CrmDateFilterBar
        viewMode={viewMode}
        query={query}
        setQuery={setQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        isCurrentViewLoading={isCurrentViewLoading}
      />

      {/* Main View Mode Bodies */}
      <CrmWorkspaceViewSwitch
        viewMode={viewMode}
        // Leads
        isLeadsLoading={isLeadsLoading}
        paginatedLeads={paginatedLeads}
        filteredLeads={filteredLeads}
        leadAlphabetFilter={leadAlphabetFilter}
        query={query}
        setLeadAlphabetFilter={setLeadAlphabetFilter}
        setQuery={setQuery}
        leadSortOrder={leadSortOrder}
        setLeadSortOrder={setLeadSortOrder}
        totalLettersCount={totalLettersCount}
        leadLetterCounts={leadLetterCounts}
        leadPage={leadPage}
        setLeadPage={setLeadPage}
        leadsPerPage={leadsPerPage}
        setLeadsPerPage={setLeadsPerPage}
        leadTotal={leadTotalForPagination}
        leads={leads}
        deals={deals}
        followUps={followUps}
        salesMeetings={salesMeetings}
        safeLeadPage={safeLeadPage}
        leadPageCount={leadPageCount}
        leadPagination={leadPagination}
        getLeadNextAction={getLeadNextAction}
        getLeadLocation={getLeadLocation}
        getLeadBudget={getLeadBudget}
        getLeadDisplayNotes={getLeadDisplayNotes}
        getLeadLossReason={getLeadLossReason}
        formatStatusLabel={formatStatusLabel}
        handleWhatsAppClick={modals.handleWhatsAppClick}
        onOpenDirectWhatsapp={onOpenDirectWhatsapp}
        onOpenChatWithLead={onOpenChatWithLead}
        onOpenChat={onOpenChat}
        onUpdateLeadStatus={onUpdateLeadStatus}
        handleOpenEdit={modals.handleOpenEdit}
        setDeleteConfirmId={modals.setDeleteConfirmId}
        deleteConfirmId={modals.deleteConfirmId}
        handleDelete={modals.handleDelete}
        openAddDealModal={modals.openAddDealModal}
        openLeadFollowUpModal={modals.openLeadFollowUpModal}
        openLostModal={modals.openLostModal}
        handleReopenLead={modals.handleReopenLead}
        setSelectedLead={modals.setSelectedLead}
        // Pipeline
        isPipelineLoading={isPipelineLoading}
        visiblePipelineDeals={visiblePipelineDeals}
        statusFilter={statusFilter}
        paginatedPipelineDeals={paginatedPipelineDeals}
        dateFilter={dateFilter}
        matchesDateFilter={matchesDateFilter}
        draggedDealId={modals.draggedDealId}
        setDraggedDealId={modals.setDraggedDealId}
        handleDealDrop={modals.handleDealDrop}
        proposals={proposals}
        quotations={quotations}
        agreements={agreements}
        invoices={invoices}
        setSelectedDeal={modals.setSelectedDeal}
        handleOpenEditDeal={modals.handleOpenEditDeal}
        handleDealStageChange={modals.handleDealStageChange}
        openPipelineFollowUpModal={modals.openPipelineFollowUpModal}
        openMeetingWhatsApp={modals.openMeetingWhatsApp}
        openCommercialModal={modals.openCommercialModal}
        sendDealDocWhatsApp={modals.sendDealDocWhatsApp}
        openInvoiceModal={modals.openInvoiceModal}
        onNavigateSection={onNavigateSection}
        pipelineTotal={pipelineTotal}
        safePipelinePage={safePipelinePage}
        pipelinePageSize={pipelinePageSize}
        pipelinePageCount={pipelinePageCount}
        setPipelinePage={setPipelinePage}
        setPipelinePageSize={setPipelinePageSize}
        // Commercials
        isCommercialsLoading={isCommercialsLoading}
        commercialDocs={commercialDocs}
        sendDocWhatsApp={modals.sendDocWhatsApp}
        onUpdateAgreement={onUpdateAgreement}
        onUpdateQuotation={onUpdateQuotation}
        onUpdateProposal={onUpdateProposal}
        onUpdateInvoice={onUpdateInvoice}
        // FollowUps
        isFollowUpsLoading={isFollowUpsLoading}
        paginatedFollowUps={paginatedFollowUps}
        filteredFollowUps={filteredFollowUps}
        clients={clients}
        openStageModal={modals.openStageModal}
        openRescheduleModal={modals.openRescheduleModal}
        onDeleteFollowUp={onDeleteFollowUp}
        followUpTotal={followUpTotal}
        safeFollowUpPage={safeFollowUpPage}
        followUpPageSize={followUpPageSize}
        followUpPageCount={followUpPageCount}
        setFollowUpPage={setFollowUpPage}
        setFollowUpPageSize={setFollowUpPageSize}
        followUpScope={followUpScope}
        setFollowUpScope={(scope) => {
          setFollowUpScope(scope);
          setFollowUpPage(1);
        }}
        // Meetings
        isMeetingsLoading={isMeetingsLoading}
        paginatedSalesMeetings={paginatedSalesMeetings}
        filteredSalesMeetings={filteredSalesMeetings}
        defaultMeetLink={modals.defaultMeetLink}
        setDateFilter={setDateFilter}
        setMeetingPage={setMeetingPage}
        setSalesMeetingForm={modals.setSalesMeetingForm}
        setShowSalesMeetingModal={modals.setShowSalesMeetingModal}
        openSalesMeetingRescheduleModal={modals.openSalesMeetingRescheduleModal}
        onDeleteSalesMeeting={onDeleteSalesMeeting}
        meetingTotal={meetingTotal}
        safeMeetingPage={safeMeetingPage}
        meetingPageSize={meetingPageSize}
        meetingPageCount={meetingPageCount}
        setMeetingPageSize={setMeetingPageSize}
        // Reports & Dashboard
        isReportsLoading={isReportsLoading}
        stats={stats}
        salesReport={salesReport}
        aiInsights={aiInsights}
        selectedDate={selectedDate}
        customDateRange={customDateRange}
        onRefresh={handleRefreshClick || onRefresh}
      />

      {/* Host for all CRM Modals & Drawers */}
      <CrmModalHost
        selectedLead={modals.selectedLead}
        setSelectedLead={modals.setSelectedLead}
        selectedDeal={modals.selectedDeal}
        setSelectedDeal={modals.setSelectedDeal}
        deals={deals}
        leads={leads}
        clients={clients}
        proposals={proposals}
        quotations={quotations}
        agreements={agreements}
        invoices={invoices}
        followUps={followUps}
        salesMeetings={salesMeetings}
        isDark={isDark}
        currentUser={currentUser}
        currentProfile={currentProfile}
        defaultMeetLink={modals.defaultMeetLink}
        showAddLeadModal={modals.showAddLeadModal}
        setShowAddLeadModal={modals.setShowAddLeadModal}
        newLeadForm={modals.newLeadForm}
        setNewLeadForm={modals.setNewLeadForm}
        handleAddLeadSubmit={modals.handleAddLeadSubmit}
        editingLead={modals.editingLead}
        setEditingLead={modals.setEditingLead}
        editLeadForm={modals.editLeadForm}
        setEditLeadForm={modals.setEditLeadForm}
        handleSaveEdit={modals.handleSaveEdit}
        showLostModal={modals.showLostModal}
        setShowLostModal={modals.setShowLostModal}
        lostTarget={modals.lostTarget}
        lostForm={modals.lostForm}
        setLostForm={modals.setLostForm}
        handleMarkLostSubmit={modals.handleMarkLostSubmit}
        showFollowUpModal={modals.showFollowUpModal}
        setShowFollowUpModal={modals.setShowFollowUpModal}
        followUpForm={modals.followUpForm}
        setFollowUpForm={modals.setFollowUpForm}
        handleCreateFollowUpSubmit={modals.handleCreateFollowUpSubmit}
        showSalesMeetingModal={modals.showSalesMeetingModal}
        setShowSalesMeetingModal={modals.setShowSalesMeetingModal}
        salesMeetingForm={modals.salesMeetingForm}
        setSalesMeetingForm={modals.setSalesMeetingForm}
        handleCreateSalesMeetingSubmit={modals.handleCreateSalesMeetingSubmit}
        showMeetingSettingsModal={modals.showMeetingSettingsModal}
        setShowMeetingSettingsModal={modals.setShowMeetingSettingsModal}
        setDefaultMeetLink={modals.setDefaultMeetLink}
        handleSaveMeetingSettings={modals.handleSaveMeetingSettings}
        showRescheduleModal={modals.showRescheduleModal}
        setShowRescheduleModal={modals.setShowRescheduleModal}
        rescheduleTarget={modals.rescheduleTarget}
        salesMeetingRescheduleTarget={modals.salesMeetingRescheduleTarget}
        rescheduleForm={modals.rescheduleForm}
        setRescheduleForm={modals.setRescheduleForm}
        handleRescheduleSubmit={modals.handleRescheduleSubmit}
        stageModalTarget={modals.stageModalTarget}
        setStageModalTarget={modals.setStageModalTarget}
        stageModalStatus={modals.stageModalStatus}
        setStageModalStatus={modals.setStageModalStatus}
        stageModalNote={modals.stageModalNote}
        setStageModalNote={modals.setStageModalNote}
        handleSaveStageModal={modals.handleSaveStageModal}
        showAddDealModal={modals.showAddDealModal}
        setShowAddDealModal={modals.setShowAddDealModal}
        newDealForm={modals.newDealForm}
        setNewDealForm={modals.setNewDealForm}
        handleCreateDealSubmit={modals.handleCreateDealSubmit}
        editingDeal={modals.editingDeal}
        setEditingDeal={modals.setEditingDeal}
        editDealForm={modals.editDealForm}
        setEditDealForm={modals.setEditDealForm}
        handleSaveEditDeal={modals.handleSaveEditDeal}
        showCommercialModal={modals.showCommercialModal}
        setShowCommercialModal={modals.setShowCommercialModal}
        handleCommercialSubmit={modals.handleCommercialSubmit}
        commercialType={modals.commercialType}
        setCommercialType={modals.setCommercialType}
        commercialForm={modals.commercialForm}
        setCommercialForm={modals.setCommercialForm}
        aiDocInput={modals.aiDoc.aiDocInput}
        setAiDocInput={modals.aiDoc.setAiDocInput}
        aiDocAttachments={modals.aiDoc.aiDocAttachments}
        handleAiAttachmentChange={modals.aiDoc.handleAiAttachmentChange}
        aiDocLoading={modals.aiDoc.aiDocLoading}
        aiDocListening={modals.aiDoc.aiDocListening}
        startAiVoiceInput={modals.aiDoc.startAiVoiceInput}
        handleGenerateAiDocumentDraft={modals.aiDoc.handleGenerateAiDocumentDraft}
        aiDocMessages={modals.aiDoc.aiDocMessages}
        aiDocDraft={modals.aiDoc.aiDocDraft}
        applyAiDraftToCommercialForm={modals.aiDoc.applyAiDraftToCommercialForm}
        aiDocTracking={modals.aiDoc.aiDocTracking}
        setAiDocTracking={modals.aiDoc.setAiDocTracking}
        handlePreviewCommercialPdf={modals.handlePreviewCommercialPdf}
        onCreateProposal={onCreateProposal}
        onCreateAgreement={onCreateAgreement}
        onConvertToClientAndProject={onConvertToClientAndProject}
        sendDocWhatsApp={modals.sendDocWhatsApp}
        showInvoiceModal={modals.showInvoiceModal}
        setShowInvoiceModal={modals.setShowInvoiceModal}
        invoiceForm={modals.invoiceForm}
        setInvoiceForm={modals.setInvoiceForm}
        invoiceDeal={modals.invoiceDeal}
        setInvoiceDeal={modals.setInvoiceDeal}
        handleInvoiceSubmit={modals.handleInvoiceSubmit}
        showMetaImportModal={modals.showMetaImportModal}
        setShowMetaImportModal={modals.setShowMetaImportModal}
        onImportBatchLeads={onImportBatchLeads}
        handleOpenEdit={modals.handleOpenEdit}
        handleWhatsAppClick={modals.handleWhatsAppClick}
        handleReopenLead={modals.handleReopenLead}
        openLeadFollowUpModal={modals.openLeadFollowUpModal}
        openLeadMeetingModal={modals.openLeadMeetingModal}
        handleOpenEditDeal={modals.handleOpenEditDeal}
        handleDealStageChange={modals.handleDealStageChange}
        openDealMeetingModal={modals.openDealMeetingModal}
        openDealFollowUpModal={modals.openDealFollowUpModal}
        sendDealDocWhatsApp={modals.sendDealDocWhatsApp}
        openCommercialModal={modals.openCommercialModal}
        openInvoiceModal={modals.openInvoiceModal}
        openStageModal={modals.openStageModal}
        onDeleteLead={onDeleteLead || modals.handleDelete}
      />
    </div>
    </CrmPullToRefresh>
  );
}
