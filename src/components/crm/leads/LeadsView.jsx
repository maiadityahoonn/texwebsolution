"use client";

import React from "react";
import LeadFilters from "./LeadFilters";
import LeadTable from "./LeadTable";
import ResponsiveTableContainer from "../shared/ResponsiveTableContainer";
import { LeadPageSkeleton, TableSkeleton } from "../shared/CrmSkeletons";

export default function LeadsView({
  isLeadsLoading = false,
  paginatedLeads = [],
  filteredLeads = [],
  sourceFilter = "all",
  setSourceFilter = () => {},
  leadAlphabetFilter = "all",
  query = "",
  setLeadAlphabetFilter = () => {},
  setQuery = () => {},
  leadSortOrder = "default",
  setLeadSortOrder = () => {},
  totalLettersCount = 0,
  leadLetterCounts = {},
  leadPage = 1,
  setLeadPage = () => {},
  leadsPerPage = 10,
  setLeadsPerPage = () => {},
  leads = [],
  deals = [],
  followUps = [],
  salesMeetings = [],
  safeLeadPage = 1,
  totalLeadPages = 1,
  pagination = null,
  getLeadNextAction = () => "",
  getLeadLocation = () => "-",
  getLeadBudget = () => "-",
  getLeadDisplayNotes = () => "",
  getLeadLossReason = () => null,
  formatStatusLabel = (s) => s,
  handleWhatsAppClick = () => {},
  onOpenDirectWhatsapp = null,
  onOpenChatWithLead = null,
  onOpenChat = null,
  onUpdateLeadStatus = () => {},
  handleOpenEdit = () => {},
  setDeleteConfirmId = () => {},
  deleteConfirmId = null,
  handleDelete = () => {},
  openAddDealModal = () => {},
  openLeadFollowUpModal = () => {},
  openRescheduleModal = () => {},
  openLostModal = () => {},
  handleReopenLead = () => {},
  setSelectedLead = () => {},
}) {
  if (isLeadsLoading && filteredLeads.length === 0 && paginatedLeads.length === 0) {
    return <LeadPageSkeleton />;
  }

  return (
    <div className="space-y-3">
      <LeadFilters
        query={query}
        setQuery={setQuery}
        leadSortOrder={leadSortOrder}
        setLeadSortOrder={setLeadSortOrder}
        leadAlphabetFilter={leadAlphabetFilter}
        setLeadAlphabetFilter={setLeadAlphabetFilter}
        setLeadPage={setLeadPage}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        leadTotal={pagination?.total || filteredLeads.length}
        totalLettersCount={totalLettersCount}
        leadLetterCounts={leadLetterCounts}
      />
      <LeadTable
        isLeadsLoading={isLeadsLoading}
        paginatedLeads={paginatedLeads}
        filteredLeads={filteredLeads}
        leadAlphabetFilter={leadAlphabetFilter}
        query={query}
        setLeadAlphabetFilter={setLeadAlphabetFilter}
        setQuery={setQuery}
        leadSortOrder={leadSortOrder}
        setLeadSortOrder={setLeadSortOrder}
        ResponsiveTableContainer={ResponsiveTableContainer}
        TableSkeleton={TableSkeleton}
        deals={deals}
        followUps={followUps}
        salesMeetings={salesMeetings}
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
        openRescheduleModal={openRescheduleModal}
        openLostModal={openLostModal}
        handleReopenLead={handleReopenLead}
        setSelectedLead={setSelectedLead}
        pagination={pagination}
      />
    </div>
  );
}
