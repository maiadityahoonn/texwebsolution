"use client";

import React from "react";
import LeadsView from "../leads/LeadsView";
import PipelineView from "../pipeline/PipelineView";
import CommercialsView from "../quotation/CommercialsView";
import FollowUpsView from "../followups/FollowUpsView";
import MeetingsView from "../meetings/MeetingsView";
import ReportsView from "../reports/ReportsView";
import DashboardView from "../dashboard/DashboardView";

export default function CrmWorkspaceViewSwitch({
  viewMode,
  // Leads View Props
  isLeadsLoading,
  paginatedLeads,
  filteredLeads,
  leadAlphabetFilter,
  query,
  setLeadAlphabetFilter,
  setQuery,
  leadSortOrder,
  setLeadSortOrder,
  totalLettersCount,
  leadLetterCounts,
  leadPage,
  setLeadPage,
  leadsPerPage,
  setLeadsPerPage,
  leads,
  deals,
  followUps,
  salesMeetings,
  safeLeadPage,
  leadPageCount,
  leadPagination,
  getLeadNextAction,
  getLeadLocation,
  getLeadBudget,
  getLeadDisplayNotes,
  getLeadLossReason,
  formatStatusLabel,
  handleWhatsAppClick,
  onOpenDirectWhatsapp,
  onOpenChatWithLead,
  onOpenChat,
  onUpdateLeadStatus,
  handleOpenEdit,
  setDeleteConfirmId,
  deleteConfirmId,
  handleDelete,
  openAddDealModal,
  openLeadFollowUpModal,
  openLostModal,
  handleReopenLead,
  setSelectedLead,
  // Pipeline View Props
  isPipelineLoading,
  visiblePipelineDeals,
  statusFilter,
  paginatedPipelineDeals,
  dateFilter,
  matchesDateFilter,
  draggedDealId,
  setDraggedDealId,
  handleDealDrop,
  proposals,
  quotations,
  agreements,
  invoices,
  setSelectedDeal,
  handleOpenEditDeal,
  handleDealStageChange,
  openPipelineFollowUpModal,
  openMeetingWhatsApp,
  openCommercialModal,
  sendDealDocWhatsApp,
  openInvoiceModal,
  onNavigateSection,
  pipelineTotal = 0,
  safePipelinePage = 1,
  pipelinePageSize = 20,
  pipelinePageCount = 1,
  setPipelinePage = () => {},
  setPipelinePageSize = () => {},
  // Commercials View Props
  isCommercialsLoading,
  commercialDocs,
  sendDocWhatsApp,
  onUpdateAgreement,
  onUpdateQuotation,
  onUpdateProposal,
  onUpdateInvoice,
  // FollowUps View Props
  isFollowUpsLoading,
  paginatedFollowUps,
  filteredFollowUps,
  clients,
  openStageModal,
  openRescheduleModal,
  onDeleteFollowUp,
  followUpTotal,
  safeFollowUpPage,
  followUpPageCount,
  followUpPageSize,
  setFollowUpPage,
  setFollowUpPageSize,
  // Meetings View Props
  isMeetingsLoading,
  paginatedSalesMeetings,
  filteredSalesMeetings,
  defaultMeetLink,
  setDateFilter,
  setMeetingPage,
  setSalesMeetingForm,
  setShowSalesMeetingModal,
  openSalesMeetingRescheduleModal,
  onDeleteSalesMeeting,
  meetingTotal,
  safeMeetingPage,
  meetingPageCount,
  meetingPageSize,
  setMeetingPageSize,
  // Reports View Props
  isReportsLoading,
  stats,
  salesReport,
  aiInsights,
  selectedDate,
  customDateRange,
  onRefresh,
}) {
  switch (viewMode) {
    case "leads":
      return (
        <LeadsView
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
          leads={leads}
          deals={deals}
          followUps={followUps}
          salesMeetings={salesMeetings}
          safeLeadPage={safeLeadPage}
          totalLeadPages={leadPageCount}
          pagination={leadPagination}
          getLeadNextAction={getLeadNextAction}
          getLeadLocation={getLeadLocation}
          getLeadBudget={getLeadBudget}
          getLeadDisplayNotes={getLeadDisplayNotes}
          getLeadLossReason={getLeadLossReason}
          formatStatusLabel={formatStatusLabel}
          handleWhatsAppClick={handleWhatsAppClick}
          onOpenDirectWhatsapp={onOpenDirectWhatsapp}
          onOpenChatWithLead={onOpenChatWithLead}
          onOpenChat={onOpenChat}
          onUpdateLeadStatus={onUpdateLeadStatus}
          handleOpenEdit={handleOpenEdit}
          setDeleteConfirmId={setDeleteConfirmId}
          deleteConfirmId={deleteConfirmId}
          handleDelete={handleDelete}
          openAddDealModal={openAddDealModal}
          openLeadFollowUpModal={openLeadFollowUpModal}
          openLostModal={openLostModal}
          handleReopenLead={handleReopenLead}
          setSelectedLead={setSelectedLead}
        />
      );

    case "pipeline":
      return (
        <PipelineView
          isPipelineLoading={isPipelineLoading}
          visiblePipelineDeals={visiblePipelineDeals}
          statusFilter={statusFilter}
          paginatedPipelineDeals={paginatedPipelineDeals}
          dateFilter={dateFilter}
          matchesDateFilter={matchesDateFilter}
          draggedDealId={draggedDealId}
          setDraggedDealId={setDraggedDealId}
          handleDealDrop={handleDealDrop}
          openAddDealModal={openAddDealModal}
          followUps={followUps}
          salesMeetings={salesMeetings}
          proposals={proposals}
          quotations={quotations}
          agreements={agreements}
          invoices={invoices}
          leads={leads}
          setSelectedDeal={setSelectedDeal}
          setDealModalTab={() => {}}
          handleOpenEditDeal={handleOpenEditDeal}
          handleDealStageChange={handleDealStageChange}
          openPipelineFollowUpModal={openPipelineFollowUpModal}
          openMeetingWhatsApp={openMeetingWhatsApp}
          openCommercialModal={openCommercialModal}
          sendDealDocWhatsApp={sendDealDocWhatsApp}
          openInvoiceModal={openInvoiceModal}
          onNavigateSection={onNavigateSection}
          pagination={{
            start: pipelineTotal === 0 ? 0 : (safePipelinePage - 1) * pipelinePageSize + 1,
            end: Math.min(pipelineTotal, safePipelinePage * pipelinePageSize),
            total: pipelineTotal,
            page: safePipelinePage,
            pageCount: pipelinePageCount || Math.ceil((pipelineTotal || 0) / (pipelinePageSize || 20)) || 1,
            pageSize: pipelinePageSize,
            setPage: setPipelinePage,
            setPageSize: setPipelinePageSize,
          }}
        />
      );

    case "commercials":
      return (
        <CommercialsView
          isCommercialsLoading={isCommercialsLoading}
          commercialDocs={commercialDocs}
          deals={deals}
          openCommercialModal={openCommercialModal}
          openInvoiceModal={openInvoiceModal}
          sendDocWhatsApp={sendDocWhatsApp}
          onUpdateAgreement={onUpdateAgreement}
          onUpdateQuotation={onUpdateQuotation}
          onUpdateProposal={onUpdateProposal}
          onUpdateInvoice={onUpdateInvoice}
        />
      );

    case "followups":
      return (
        <FollowUpsView
          isFollowUpsLoading={isFollowUpsLoading}
          paginatedFollowUps={paginatedFollowUps}
          filteredFollowUps={filteredFollowUps}
          leads={leads}
          clients={clients}
          deals={deals}
          setSelectedLead={setSelectedLead}
          openStageModal={openStageModal}
          openRescheduleModal={openRescheduleModal}
          onDeleteFollowUp={onDeleteFollowUp}
          pagination={{
            label: "follow-ups",
            start: followUpTotal === 0 ? 0 : (safeFollowUpPage - 1) * followUpPageSize + 1,
            end: Math.min(followUpTotal, safeFollowUpPage * followUpPageSize),
            total: followUpTotal,
            page: safeFollowUpPage,
            pageCount: followUpPageCount,
            pageSize: followUpPageSize,
            setPage: setFollowUpPage,
            setPageSize: setFollowUpPageSize,
          }}
        />
      );

    case "sales_meetings":
      return (
        <MeetingsView
          isMeetingsLoading={isMeetingsLoading}
          paginatedSalesMeetings={paginatedSalesMeetings}
          filteredSalesMeetings={filteredSalesMeetings}
          leads={leads}
          clients={clients}
          deals={deals}
          dateFilter={dateFilter}
          defaultMeetLink={defaultMeetLink}
          setSelectedLead={setSelectedLead}
          setDateFilter={setDateFilter}
          setMeetingPage={setMeetingPage}
          setSalesMeetingForm={setSalesMeetingForm}
          setShowSalesMeetingModal={setShowSalesMeetingModal}
          openStageModal={openStageModal}
          openSalesMeetingRescheduleModal={openSalesMeetingRescheduleModal}
          onDeleteSalesMeeting={onDeleteSalesMeeting}
          pagination={{
            label: "meetings",
            start: meetingTotal === 0 ? 0 : (safeMeetingPage - 1) * meetingPageSize + 1,
            end: Math.min(meetingTotal, safeMeetingPage * meetingPageSize),
            total: meetingTotal,
            page: safeMeetingPage,
            pageCount: meetingPageCount,
            pageSize: meetingPageSize,
            setPage: setMeetingPage,
            setPageSize: setMeetingPageSize,
          }}
        />
      );

    case "dashboard":
      return (
        <DashboardView
          isReportsLoading={isReportsLoading}
          leads={leads}
          clients={clients}
          deals={deals}
          followUps={followUps}
          salesMeetings={salesMeetings}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          selectedDate={selectedDate}
          customDateRange={customDateRange}
          matchesDateFilter={matchesDateFilter}
          openAddDealModal={openAddDealModal}
          openLeadFollowUpModal={openLeadFollowUpModal}
          openLostModal={openLostModal}
          openStageModal={openStageModal}
          openRescheduleModal={openRescheduleModal}
          openSalesMeetingRescheduleModal={openSalesMeetingRescheduleModal}
          setSelectedLead={setSelectedLead}
          setSelectedDeal={setSelectedDeal}
          onOpenDirectWhatsapp={onOpenDirectWhatsapp}
          onNavigateSection={onNavigateSection}
          onRefresh={onRefresh}
        />
      );

    case "reports":
      return (
        <ReportsView
          isReportsLoading={isReportsLoading}
          stats={stats}
          salesReport={salesReport}
          aiInsights={aiInsights}
          openAddDealModal={openAddDealModal}
          openLostModal={openLostModal}
        />
      );

    case "invoices":
    case "payments":
      return (
        <CommercialsView
          isCommercialsLoading={isCommercialsLoading}
          commercialDocs={commercialDocs}
          deals={deals}
          openCommercialModal={openCommercialModal}
          openInvoiceModal={openInvoiceModal}
          sendDocWhatsApp={sendDocWhatsApp}
          onUpdateAgreement={onUpdateAgreement}
          onUpdateQuotation={onUpdateQuotation}
          onUpdateProposal={onUpdateProposal}
          onUpdateInvoice={onUpdateInvoice}
        />
      );

    case "clients":
    default:
      return (
        <LeadsView
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
          leads={leads}
          deals={deals}
          followUps={followUps}
          salesMeetings={salesMeetings}
          safeLeadPage={safeLeadPage}
          totalLeadPages={leadPageCount}
          pagination={leadPagination}
          getLeadNextAction={getLeadNextAction}
          getLeadLocation={getLeadLocation}
          getLeadBudget={getLeadBudget}
          getLeadDisplayNotes={getLeadDisplayNotes}
          getLeadLossReason={getLeadLossReason}
          formatStatusLabel={formatStatusLabel}
          handleWhatsAppClick={handleWhatsAppClick}
          onOpenDirectWhatsapp={onOpenDirectWhatsapp}
          onOpenChatWithLead={onOpenChatWithLead}
          onOpenChat={onOpenChat}
          onUpdateLeadStatus={onUpdateLeadStatus}
          handleOpenEdit={handleOpenEdit}
          setDeleteConfirmId={setDeleteConfirmId}
          deleteConfirmId={deleteConfirmId}
          handleDelete={handleDelete}
          openAddDealModal={openAddDealModal}
          openLeadFollowUpModal={openLeadFollowUpModal}
          openLostModal={openLostModal}
          handleReopenLead={handleReopenLead}
          setSelectedLead={setSelectedLead}
        />
      );
  }
}
