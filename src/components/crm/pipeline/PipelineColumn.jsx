"use client";

import React from "react";
import { Plus } from "lucide-react";
import PipelineDealCard from "./PipelineDealCard";

export default function PipelineColumn({
  col,
  colDeals = [],
  draggedDealId = null,
  handleDealDrop = () => {},
  openAddDealModal = () => {},
  leads = [],
  followUps = [],
  salesMeetings = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  setDraggedDealId = () => {},
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
}) {
  const colTotal = colDeals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDealDrop(col.id)}
      className={`flex flex-col rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3 shadow-2xs min-h-[350px] transition ${
        draggedDealId ? "ring-1 ring-orange-400/40" : ""
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#3a3020]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.color}`} />
          <span className="font-semibold text-xs text-gray-800 dark:text-neutral-200">
            {col.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
            {colDeals.length}
          </span>
          {col.id !== "closed_lost" && (
            <button
              type="button"
              onClick={() => openAddDealModal(col.id)}
              className="p-0.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={`Add Deal in ${col.label}`}
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="text-[10px] text-gray-400 mt-1 mb-2 font-mono">
        ₹{colTotal.toLocaleString("en-IN")}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {colDeals.map((deal) => (
          <PipelineDealCard
            key={deal.id}
            deal={deal}
            col={col}
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
        ))}
      </div>
    </div>
  );
}
