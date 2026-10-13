"use client";

import React from "react";
import TablePagination from "../shared/TablePagination";
import { PIPELINE_STAGES } from "../shared/leadUtils";
import { PipelineSkeleton } from "../shared/CrmSkeletons";
import PipelineColumn from "./PipelineColumn";

export default function PipelineView({
  isPipelineLoading = false,
  visiblePipelineDeals = [],
  statusFilter = "all",
  paginatedPipelineDeals = [],
  dateFilter = "all",
  matchesDateFilter = () => true,
  draggedDealId = null,
  setDraggedDealId = () => {},
  handleDealDrop = () => {},
  openAddDealModal = () => {},
  followUps = [],
  salesMeetings = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  leads = [],
  setSelectedDeal = () => {},
  setDealModalTab = () => {},
  handleOpenEditDeal = () => {},
  handleDealStageChange = () => {},
  openPipelineFollowUpModal = () => {},
  openMeetingWhatsApp = () => {},
  openCommercialModal = () => {},
  sendDealDocWhatsApp = () => {},
  openInvoiceModal = () => {},
  onNavigateSection = () => {},
  pagination = null,
}) {
  if (isPipelineLoading && visiblePipelineDeals.length === 0) {
    return <PipelineSkeleton />;
  }

  const {
    start: pipelinePageStart = 1,
    end: pipelinePageEnd = paginatedPipelineDeals.length,
    total: pipelineTotal = paginatedPipelineDeals.length,
    page: safePipelinePage = 1,
    pageCount: pipelinePageCount = 1,
    pageSize: pipelinePageSize = 20,
    setPage: setPipelinePage = () => {},
    setPageSize: setPipelinePageSize = () => {},
  } = pagination || {};

  const stages =
    statusFilter === "lost"
      ? [{ id: "closed_lost", label: "Closed Lost Deals", color: "bg-rose-500" }]
      : PIPELINE_STAGES;

  return (
    <>
      <div
        className={`grid grid-cols-1 ${
          statusFilter === "lost"
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        } gap-3`}
      >
        {stages.map((col) => {
          const colDeals = paginatedPipelineDeals.filter(
            (d) =>
              (d.pipeline_stage || "contacted") === col.id &&
              (dateFilter === "all" || matchesDateFilter(d, "created_at") || matchesDateFilter(d, "updated_at"))
          );

          return (
            <PipelineColumn
              key={col.id}
              col={col}
              colDeals={colDeals}
              draggedDealId={draggedDealId}
              handleDealDrop={handleDealDrop}
              openAddDealModal={openAddDealModal}
              leads={leads}
              followUps={followUps}
              salesMeetings={salesMeetings}
              proposals={proposals}
              quotations={quotations}
              agreements={agreements}
              invoices={invoices}
              setDraggedDealId={setDraggedDealId}
              setSelectedDeal={setSelectedDeal}
              setDealModalTab={setDealModalTab}
              handleOpenEditDeal={handleOpenEditDeal}
              handleDealStageChange={handleDealStageChange}
              openPipelineFollowUpModal={openPipelineFollowUpModal}
              openMeetingWhatsApp={openMeetingWhatsApp}
              openCommercialModal={openCommercialModal}
              sendDealDocWhatsApp={sendDealDocWhatsApp}
              openInvoiceModal={openInvoiceModal}
              onNavigateSection={onNavigateSection}
            />
          );
        })}
      </div>

      {/* Pagination Bar */}
      {pipelineTotal > 0 && (
        <div className="mt-3 rounded-2xl border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          <TablePagination
            label="deals"
            start={pipelinePageStart}
            end={pipelinePageEnd}
            total={pipelineTotal}
            page={safePipelinePage}
            pageCount={pipelinePageCount}
            pageSize={pipelinePageSize}
            setPage={setPipelinePage}
            setPageSize={setPipelinePageSize}
            pageSizeLabel="Deals per page:"
          />
        </div>
      )}
    </>
  );
}
