"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
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
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] text-xs shadow-2xs">
        <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
          <span>Showing</span>
          <span className="font-bold text-gray-800 dark:text-white">{pipelinePageStart}</span>
          <span>to</span>
          <span className="font-bold text-gray-800 dark:text-white">{pipelinePageEnd}</span>
          <span>of</span>
          <span className="font-bold text-gray-800 dark:text-white">{pipelineTotal}</span>
          <span>deals</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
            <span className="hidden xs:inline">Deals per page:</span>
            <select
              value={pipelinePageSize}
              onChange={(e) => {
                setPipelinePageSize(Number(e.target.value));
                setPipelinePage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              aria-label="Pipeline deals per page"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePipelinePage <= 1}
              onClick={() => setPipelinePage(safePipelinePage - 1)}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-600 dark:text-neutral-300" />
            </button>
            <span className="px-2 font-bold text-gray-800 dark:text-white text-xs">
              {safePipelinePage} / {pipelinePageCount}
            </span>
            <button
              type="button"
              disabled={safePipelinePage >= pipelinePageCount}
              onClick={() => setPipelinePage(safePipelinePage + 1)}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Next Page"
              aria-label="Next Page"
            >
              <ChevronLeft className="w-3.5 h-3.5 rotate-180 text-gray-600 dark:text-neutral-300" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
