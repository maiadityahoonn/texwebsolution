export const CRM_ROUTE_DEFINITIONS = [
  { slug: "dashboard", section: "overview", viewMode: "dashboard", label: "CRM Dashboard" },
  { slug: "leads", section: "crm", viewMode: "leads", label: "Leads" },
  { slug: "pipeline", section: "pipeline", viewMode: "pipeline", label: "Sales Pipeline" },
  { slug: "followups", section: "sales_followups", viewMode: "followups", label: "Follow-ups" },
  { slug: "meetings", section: "sales_meetings", viewMode: "sales_meetings", label: "Meetings" },
  { slug: "quotation", section: "sales_commercials", viewMode: "commercials", commercialScope: "proposal_quote", label: "Quotation" },
  { slug: "agreements", section: "agreements", viewMode: "commercials", commercialScope: "agreement", label: "Agreements" },
  { slug: "invoices", section: "invoices", viewMode: "invoices", label: "Invoices" },
  { slug: "payments", section: "payments", viewMode: "payments", label: "Payments" },
  { slug: "clients", section: "clients", viewMode: "clients", label: "Clients" },
  { slug: "reports", section: "sales_reports", viewMode: "reports", label: "Sales Reports" },
];

export const CRM_DEFAULT_SLUG = "leads";

const CRM_SECTION_TO_ROUTE = CRM_ROUTE_DEFINITIONS.reduce((acc, item) => {
  acc[item.section] = item;
  return acc;
}, {});

const CRM_SLUG_TO_ROUTE = CRM_ROUTE_DEFINITIONS.reduce((acc, item) => {
  acc[item.slug] = item;
  return acc;
}, {});

export function getCrmPathForSection(section) {
  const route = CRM_SECTION_TO_ROUTE[section];
  return route ? `/crm/${route.slug}` : null;
}

export function getCrmRouteBySlug(slug) {
  return CRM_SLUG_TO_ROUTE[slug] || CRM_SLUG_TO_ROUTE[CRM_DEFAULT_SLUG];
}

export function getCrmSectionFromSlug(slug) {
  return getCrmRouteBySlug(slug).section;
}

export function getCrmSectionFromPath(pathname = "") {
  const match = String(pathname || "").match(/^\/crm(?:\/([^/?#]+))?/);
  if (!match) return "";
  const slug = match[1] || CRM_DEFAULT_SLUG;
  return getCrmSectionFromSlug(slug);
}
