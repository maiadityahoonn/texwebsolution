"use client";

import React from "react";
import { PIPELINE_STAGES } from "../shared/leadUtils";
import PipelineColumn from "./PipelineColumn";
import { PipelineSkeleton } from "../shared/CrmSkeletons";

export default function PipelineView({
  isPipelineLoading = false,
  visiblePipelineDeals = [],
  statusFilter = "all",
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
  clients = [],
  setSelectedDeal = () => {},
  setDealModalTab = () => {},
  handleOpenEditDeal = () => {},
  handleDealStageChange = () => {},
  openPipelineFollowUpModal = () => {},
  openDealMeetingModal = () => {},
  openCommercialModal = () => {},
  sendDealDocWhatsApp = () => {},
  openInvoiceModal = () => {},
  onNavigateSection = () => {},
}) {
  const closedLostStage = { id: "closed_lost", label: "Closed Lost", color: "bg-rose-500" };
  const closedWonStage = PIPELINE_STAGES.find((stage) => stage.id === "closed_won");
  const isClosedOnlyView = ["lost", "won", "converted", "win_rate"].includes(statusFilter);
  const stages =
    statusFilter === "lost"
      ? [closedLostStage]
      : ["won", "converted", "win_rate"].includes(statusFilter)
        ? [closedWonStage]
        : PIPELINE_STAGES;

  if (isPipelineLoading && visiblePipelineDeals.length === 0) {
    return <PipelineSkeleton />;
  }

  return (
    <div
      className={`flex overflow-x-auto pb-4 sm:pb-0 gap-2.5 min-[360px]:gap-3 snap-x snap-mandatory touch-pan-x no-scrollbar overscroll-x-contain ${
        isClosedOnlyView
          ? "sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-x-visible"
          : statusFilter === "all"
            ? "sm:flex sm:overflow-x-auto"
            : "sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:overflow-x-visible"
      }`}
    >
      {stages.map((col) => {
        const colDeals = visiblePipelineDeals.filter(
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
            clients={clients}
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
            openDealMeetingModal={openDealMeetingModal}
            openCommercialModal={openCommercialModal}
            sendDealDocWhatsApp={sendDealDocWhatsApp}
            openInvoiceModal={openInvoiceModal}
            onNavigateSection={onNavigateSection}
            preserveBoardWidth={statusFilter === "all"}
          />
        );
      })}
    </div>
  );
}
