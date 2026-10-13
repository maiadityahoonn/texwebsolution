"use client";

import TablePagination from "../shared/TablePagination";

export default function LeadPagination({
  leadPageStart,
  leadPageEnd,
  leadTotalForPagination,
  leadsPerPage,
  setLeadsPerPage,
  setLeadPage,
  safeLeadPage,
  leadPageCount,
  label = "leads",
  ...rest
}) {
  return (
    <TablePagination
      label={label}
      start={leadPageStart ?? rest.start ?? 0}
      end={leadPageEnd ?? rest.end ?? 0}
      total={leadTotalForPagination ?? rest.total ?? 0}
      page={safeLeadPage ?? rest.page ?? 1}
      pageCount={leadPageCount ?? rest.pageCount ?? 1}
      pageSize={leadsPerPage ?? rest.pageSize ?? 10}
      setPage={setLeadPage ?? rest.setPage}
      setPageSize={setLeadsPerPage ?? rest.setPageSize}
      pageSizeLabel="Rows per page:"
      {...rest}
    />
  );
}
