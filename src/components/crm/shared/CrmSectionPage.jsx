"use client";

import CrmWorkspaceView from "../shell/CrmWorkspaceView";
import { useCrmShell } from "../shell/CrmShellContext";

const SECTION_VIEW = {
  overview: { initialViewMode: "dashboard" },
  crm: { initialViewMode: "leads" },
  pipeline: { initialViewMode: "pipeline" },
  sales_followups: { initialViewMode: "followups" },
  sales_meetings: { initialViewMode: "sales_meetings" },
  sales_reports: { initialViewMode: "reports" },
  sales_commercials: { initialViewMode: "commercials", commercialScope: "proposal_quote" },
  agreements: { initialViewMode: "commercials", commercialScope: "agreement" },
  invoices: { initialViewMode: "invoices" },
  payments: { initialViewMode: "payments" },
  clients: { initialViewMode: "clients" },
};

export default function CrmSectionPage({ section = "crm" }) {
  const { workspaceViewProps } = useCrmShell();
  const config = SECTION_VIEW[section] || SECTION_VIEW.crm;
  return (
    <CrmWorkspaceView
      {...workspaceViewProps}
      initialViewMode={config.initialViewMode}
      commercialScope={config.commercialScope || "all"}
      showViewTabs={false}
      headerActionsSlotId="crm-top-header-actions"
    />
  );
}
