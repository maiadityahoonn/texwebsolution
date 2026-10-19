"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LeadTableHeader from "./LeadTableHeader";
import LeadTableRow from "./LeadTableRow";
import TablePagination from "../shared/TablePagination";
import { TableSkeleton as DefaultTableSkeleton } from "../shared/CrmSkeletons";
import DefaultResponsiveTableContainer from "../shared/ResponsiveTableContainer";

export default function LeadTable({
  isLeadsLoading,
  paginatedLeads,
  filteredLeads,
  leadAlphabetFilter,
  query,
  setLeadAlphabetFilter,
  setQuery,
  leadSortOrder,
  setLeadSortOrder,
  ResponsiveTableContainer = DefaultResponsiveTableContainer,
  TableSkeleton = DefaultTableSkeleton,
  deals,
  salesMeetings,
  followUps,
  pipelineStages,
  closedPipelineStages,
  getLeadBudget,
  getLeadLossReason,
  setSelectedLead,
  setViewMode,
  setStatusFilter,
  handleWhatsAppClick,
  handleReopenLead,
  openAddDealModal,
  openLeadFollowUpModal,
  openLostModal,
  handleOpenEdit,
  handleDelete,
  pagination,
}) {
  const searchParams = useSearchParams();
  const highlightParam = searchParams?.get("highlight") || "";

  useEffect(() => {
    if (!highlightParam) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`lead-${highlightParam}`) || document.querySelector(`[data-lead-id="${highlightParam}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [highlightParam, filteredLeads, paginatedLeads]);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
      {isLeadsLoading && (filteredLeads?.length === 0 || paginatedLeads?.length === 0) ? (
        <TableSkeleton rows={6} columns={6} />
      ) : filteredLeads.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">
          <p>No leads found matching your search and filter criteria{leadAlphabetFilter !== "all" && ` starting with "${leadAlphabetFilter}"`}.</p>
          {(leadAlphabetFilter !== "all" || query) && (
            <button
              onClick={() => {
                setLeadAlphabetFilter("all");
                setQuery("");
              }}
              className="mt-2 text-xs font-semibold text-orange-600 hover:underline inline-block cursor-pointer"
            >
              Clear search & letter filter
            </button>
          )}
        </div>
      ) : (
        <>
          <ResponsiveTableContainer>
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[1020px]">
              <LeadTableHeader
                leadSortOrder={leadSortOrder}
                setLeadSortOrder={setLeadSortOrder}
              />
              <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                {(paginatedLeads && paginatedLeads.length > 0 ? paginatedLeads : filteredLeads).map((lead) => (
                  <LeadTableRow
                    key={lead.id}
                    lead={lead}
                    highlightParam={highlightParam}
                    deals={deals}
                    salesMeetings={salesMeetings}
                    followUps={followUps}
                    pipelineStages={pipelineStages}
                    closedPipelineStages={closedPipelineStages}
                    getLeadBudget={getLeadBudget}
                    getLeadLossReason={getLeadLossReason}
                    setSelectedLead={setSelectedLead}
                    setViewMode={setViewMode}
                    setStatusFilter={setStatusFilter}
                    handleWhatsAppClick={handleWhatsAppClick}
                    handleReopenLead={handleReopenLead}
                    openAddDealModal={openAddDealModal}
                    openLeadFollowUpModal={openLeadFollowUpModal}
                    openLostModal={openLostModal}
                    handleOpenEdit={handleOpenEdit}
                    handleDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </ResponsiveTableContainer>
          <TablePagination {...pagination} />
        </>
      )}
    </div>
  );
}
