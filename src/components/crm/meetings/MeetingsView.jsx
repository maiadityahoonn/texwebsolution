"use client";

import React from "react";
import MeetingsTable from "./MeetingsTable";
import ResponsiveTableContainer from "../shared/ResponsiveTableContainer";
import { TablePageSkeleton, TableSkeleton } from "../shared/CrmSkeletons";
import { formatStatusLabel, getLatestMeetingSnippet } from "../shared/meetingUtils";

export default function MeetingsView({
  isMeetingsLoading = false,
  paginatedSalesMeetings = [],
  filteredSalesMeetings = [],
  leads = [],
  clients = [],
  deals = [],
  dateFilter = "all",
  defaultMeetLink = "https://meet.google.com/new",
  setSelectedLead = () => {},
  setDateFilter = () => {},
  setMeetingPage = () => {},
  setSalesMeetingForm = () => {},
  setShowSalesMeetingModal = () => {},
  openStageModal = () => {},
  openSalesMeetingRescheduleModal = () => {},
  onDeleteSalesMeeting = () => {},
  pagination = null,
}) {
  if (isMeetingsLoading && filteredSalesMeetings.length === 0 && paginatedSalesMeetings.length === 0) {
    return <TablePageSkeleton columns={6} rows={8} toolbar={false} />;
  }

  return (
    <MeetingsTable
      isMeetingsLoading={isMeetingsLoading}
      paginatedSalesMeetings={paginatedSalesMeetings}
      filteredSalesMeetings={filteredSalesMeetings}
      leads={leads}
      clients={clients}
      deals={deals}
      dateFilter={dateFilter}
      defaultMeetLink={defaultMeetLink}
      ResponsiveTableContainer={ResponsiveTableContainer}
      TableSkeleton={TableSkeleton}
      formatStatusLabel={formatStatusLabel}
      getLatestMeetingSnippet={getLatestMeetingSnippet}
      setSelectedLead={setSelectedLead}
      setDateFilter={setDateFilter}
      setMeetingPage={setMeetingPage}
      setSalesMeetingForm={setSalesMeetingForm}
      setShowSalesMeetingModal={setShowSalesMeetingModal}
      openStageModal={openStageModal}
      openSalesMeetingRescheduleModal={openSalesMeetingRescheduleModal}
      onDeleteSalesMeeting={onDeleteSalesMeeting}
      pagination={pagination}
    />
  );
}
