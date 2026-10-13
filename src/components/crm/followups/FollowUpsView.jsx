"use client";

import React from "react";
import FollowUpsTable from "./FollowUpsTable";
import ResponsiveTableContainer from "../shared/ResponsiveTableContainer";
import { TablePageSkeleton, TableSkeleton } from "../shared/CrmSkeletons";
import { formatStatusLabel, getLatestNoteSnippet, getFollowUpWhatsappMessage } from "../shared/meetingUtils";

export default function FollowUpsView({
  isFollowUpsLoading = false,
  paginatedFollowUps = [],
  filteredFollowUps = [],
  leads = [],
  clients = [],
  deals = [],
  setSelectedLead = () => {},
  openStageModal = () => {},
  openRescheduleModal = () => {},
  onDeleteFollowUp = () => {},
  pagination = null,
}) {
  if (isFollowUpsLoading && filteredFollowUps.length === 0 && paginatedFollowUps.length === 0) {
    return <TablePageSkeleton columns={6} rows={8} toolbar={false} />;
  }

  return (
    <FollowUpsTable
      isFollowUpsLoading={isFollowUpsLoading}
      paginatedFollowUps={paginatedFollowUps}
      filteredFollowUps={filteredFollowUps}
      leads={leads}
      clients={clients}
      deals={deals}
      setSelectedLead={setSelectedLead}
      ResponsiveTableContainer={ResponsiveTableContainer}
      TableSkeleton={TableSkeleton}
      formatStatusLabel={formatStatusLabel}
      getLatestNoteSnippet={getLatestNoteSnippet}
      getFollowUpWhatsappMessage={getFollowUpWhatsappMessage}
      openStageModal={openStageModal}
      openRescheduleModal={openRescheduleModal}
      onDeleteFollowUp={onDeleteFollowUp}
      pagination={pagination}
    />
  );
}
