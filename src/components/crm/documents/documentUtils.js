"use client";

export const DOCUMENT_TABS = [
  { id: "all", label: "All" },
  { id: "quotation", label: "Quotations" },
  { id: "agreement", label: "Agreements" },
];

export function getDocumentKind(doc = {}) {
  if (doc.docType === "agreement" || doc.agreement_number) return "agreement";
  if (doc.docType === "invoice" || doc.invoice_number) return "invoice";
  return "quotation";
}

export function getDocumentTitle(doc = {}) {
  return (
    doc.title ||
    doc.quotation_number ||
    doc.agreement_number ||
    doc.invoice_number ||
    (getDocumentKind(doc) === "agreement" ? "New Agreement" : "New Quotation")
  );
}

export function getDocumentAmount(doc = {}) {
  return Number(doc.total_amount) || Number(doc.total) || Number(doc.amount) || Number(doc.subtotal) || 0;
}

export function getDocumentClient(doc = {}, deals = [], clients = [], leads = []) {
  const deal = deals.find((item) => item.id === doc.deal_id);
  const client = clients.find((item) => item.id === doc.client_id || item.id === deal?.client_id);
  const lead = leads.find((item) => item.id === doc.lead_id || item.id === deal?.lead_id);
  return {
    deal,
    client,
    lead,
    name: client?.company_name || client?.name || lead?.name || doc.client_name || "No client set",
    email: client?.email || lead?.email || "",
    phone: client?.phone || lead?.phone || "",
  };
}

export function getDocumentStatus(doc = {}) {
  return String(doc.status || "draft").toLowerCase();
}

export function getDocumentDate(doc = {}) {
  return (
    doc.sent_at ||
    doc.signed_at ||
    doc.accepted_at ||
    doc.valid_until ||
    doc.start_date ||
    doc.due_date ||
    doc.created_at ||
    new Date().toISOString()
  );
}

export function formatShortDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function buildDocumentSections(doc = {}, kind = getDocumentKind(doc)) {
  const isAgreement = kind === "agreement";
  const scope = doc.scope_of_work || "Project scope, timeline, deliverables, communication rhythm, and approval process will be finalized with the client.";
  const details = isAgreement
    ? doc.commercial_terms || doc.deliverables || "Commercial terms, payment milestones, responsibilities, revision limits, and handover terms will be listed here."
    : doc.deliverables || doc.commercial_terms || "Project deliverables, features, pages, integrations, testing, deployment support, and handover items will be listed here.";
  const amount = getDocumentAmount(doc);

  const initialSections = [
    // Page 1: Scope & Deliverables (cleanly within 879px letterhead content safe zone)
    { id: createBlockId(), type: "heading", page: 1, heading: isAgreement ? "AGREEMENT SUMMARY & SCOPE" : "PROJECT SUMMARY & SCOPE" },
    { id: createBlockId(), type: "text", page: 1, body: scope },
    { id: createBlockId(), type: "divider", page: 1, color: "#ea580c", lineWidth: 2, height: 12 },
    { id: createBlockId(), type: "heading", page: 1, heading: isAgreement ? "COMMERCIAL TERMS & SPECIFICATIONS" : "PROJECT DELIVERABLES & PHASES" },
    { id: createBlockId(), type: "text", page: 1, body: details },

    // Page 2: Pricing Table, Milestones & Acceptance
    {
      id: createBlockId(),
      type: "pricing",
      page: 2,
      heading: isAgreement ? "Commercial Value & Investment Breakdown" : "Cost Breakdown & Investment",
      body: amount
        ? `Total commercial value: Rs. ${amount.toLocaleString("en-IN")}. Suggested payment plan: 40% advance, 30% milestone, 30% before final handover.`
        : "Payment schedule and final costing will be confirmed before sharing with the client.",
      pricingItems: [
        { id: createBlockId(), item: "Design, Frontend & UI/UX", description: "Implementation of responsive user interface", qty: 1, rate: Math.round(amount * 0.55) || 45000, amount: Math.round(amount * 0.55) || 45000 },
        { id: createBlockId(), item: "Backend & Systems Integration", description: "APIs, database, workflows & deployment", qty: 1, rate: Math.round(amount * 0.45) || 35000, amount: Math.round(amount * 0.45) || 35000 },
      ],
      taxRate: 18,
      discount: 0,
    },
    {
      id: createBlockId(),
      type: "payment",
      page: 2,
      heading: "Milestone Payment Schedule",
      milestones: [
        { id: createBlockId(), milestone: "Contract Signing & Advance", percentage: 40, amount: Math.round(amount * 0.4) || 32000, dueDate: "Upon contract signing" },
        { id: createBlockId(), milestone: "Beta Development & Review", percentage: 30, amount: Math.round(amount * 0.3) || 24000, dueDate: "Week 3 / Beta milestone" },
        { id: createBlockId(), milestone: "Final Delivery & Handover", percentage: 30, amount: Math.round(amount * 0.3) || 24000, dueDate: "Prior to production deploy" },
      ],
    },
    {
      id: createBlockId(),
      type: "box",
      page: 2,
      heading: isAgreement ? "Acceptance & Legal Validity" : "Quotation Validity & Acceptance",
      body: isAgreement
        ? "This agreement becomes legally active once confirmed by TexWeb Solution and the client. All intellectual property transfers upon 100% final payment."
        : "This quotation is valid for 15 days from the date of issue. Changes in scope or external third-party API costs will be billed separately.",
    },
  ];

  return autoPaginateBlocks(initialSections, 940);
}

export function createBlockId() {
  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createDocumentBlock(type = "text", page = 1) {
  const base = { id: createBlockId(), type, page };
  const blocks = {
    heading: { heading: "New Section Heading", body: "Write the section intro here." },
    text: { heading: "Text Section", body: "Add document text here." },
    pricing: { heading: "Pricing", body: "Item | Amount\nProject implementation | Rs. 50,000\nSupport | Included" },
    payment: { heading: "Payment Schedule", body: "40% advance\n30% milestone\n30% before final handover" },
    table: { heading: "Table", body: "Component | Details\nFrontend | Next.js\nBackend | Supabase" },
    divider: { heading: "", body: "", color: "#ea580c", lineWidth: 2, height: 12 },
    box: { heading: "Important Note", body: "Add highlighted terms, exclusions, or approval notes here." },
    image: { heading: "Image", body: "", imageUrl: "" },
  };
  return { ...base, ...(blocks[type] || blocks.text) };
}

export function estimateBlockHeight(block = {}) {
  if (block.height && Number(block.height) > 0) {
    return Number(block.height) + 16;
  }
  switch (block.type) {
    case "heading":
      return 46;
    case "divider":
      return 18;
    case "image":
      return (block.height ? Number(block.height) : 220) + 20;
    case "pricing": {
      const itemsCount = block.pricingItems?.length || 2;
      return 180 + itemsCount * 36;
    }
    case "payment": {
      const milestonesCount = block.milestones?.length || 3;
      return 150 + milestonesCount * 34;
    }
    case "table": {
      const rowCount = block.rows?.length || 3;
      return 120 + rowCount * 34;
    }
    case "box": {
      const textLen = (block.heading?.length || 0) + (block.body?.length || 0);
      return Math.max(90, Math.ceil(textLen / 70) * 20 + 50);
    }
    case "text":
    default: {
      const content = block.body || block.text || "";
      const lines = Math.max(1, Math.ceil(content.length / 85));
      return Math.max(40, lines * 22 + 16);
    }
  }
}

export function autoPaginateBlocks(blocks = [], maxPageHeight = 940) {
  let currentPage = 1;
  let currentHeight = 0;

  return blocks.map((block) => {
    const est = estimateBlockHeight(block);
    // If adding this block would exceed the safe printable height, shift to next page
    if (currentHeight > 0 && currentHeight + est > maxPageHeight) {
      currentPage += 1;
      currentHeight = 0;
    }
    currentHeight += est;
    return {
      ...block,
      page: block.page ? Math.max(Number(block.page), currentPage) : currentPage,
    };
  });
}

export function normalizeDocumentBlocks(blocks = []) {
  return blocks.map((block, index) => ({
    ...block,
    id: block.id || createBlockId(),
    type: block.type || (index === 0 ? "heading" : "text"),
    page: Number(block.page) || 1,
    heading: block.heading || "",
    body: block.body || "",
    imageUrl: block.imageUrl || "",
  }));
}

export const CORPORATE_LETTERHEAD_STORAGE_KEY = "texweb_corporate_letterhead_default_brand";

export function deepMergeLetterhead(baseLh = {}, overrideLh = {}) {
  return {
    ...baseLh,
    ...overrideLh,
    logo: { ...(baseLh.logo || {}), ...(overrideLh.logo || {}) },
    tagline: { ...(baseLh.tagline || {}), ...(overrideLh.tagline || {}) },
    divider: { ...(baseLh.divider || {}), ...(overrideLh.divider || {}) },
    contact: { ...(baseLh.contact || {}), ...(overrideLh.contact || {}) },
    watermark: { ...(baseLh.watermark || {}), ...(overrideLh.watermark || {}) },
    footerCompany: { ...(baseLh.footerCompany || {}), ...(overrideLh.footerCompany || {}) },
    footerServices: { ...(baseLh.footerServices || {}), ...(overrideLh.footerServices || {}) },
    footerDivider: { ...(baseLh.footerDivider || {}), ...(overrideLh.footerDivider || {}) },
    footerTopLine: { ...(baseLh.footerTopLine || {}), ...(overrideLh.footerTopLine || {}) },
    fontFamily: overrideLh.fontFamily || baseLh.fontFamily || "Inter",
  };
}

export function getDefaultBrand() {
  const base = {
    font: "Inter",
    accent: "#ea580c",
    logoUrl: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-header-logo.png",
    fullLogoUrl: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-header-logo.png",
    tagline: "Complete Digital Solutions for Your Business",
    phone: "0755-4601839",
    email: "info@texwebsolution.in",
    website: "www.texwebsolution.in",
    location: "Kolkata | Bhopal",
    locations: "Kolkata | Bhopal",
    companyName: "TexWeb Solution Private Limited",
    name: "TexWeb Solution Private Limited",
    cin: "CIN: U85500WB2026PTC287896",
    letterhead: {
      fontFamily: "Inter",
      logo: { dx: 0, dy: 0, width: 240, height: 52, rotation: 0 },
      tagline: { text: "Complete Digital Solutions for Your Business", dx: 0, dy: 0, rotation: 0, fontFamily: "Inter" },
      divider: { visible: true, dx: 0, dy: 0, width: 1, height: 64, color: "#e2e8f0", rotation: 0 },
      contact: {
        phone: "0755-4601839",
        email: "info@texwebsolution.in",
        website: "www.texwebsolution.in",
        locations: "Kolkata | Bhopal",
        dx: 0,
        dy: 0,
        rotation: 0,
        fontFamily: "Inter",
      },
      watermark: { dx: 0, dy: 0, width: 240, height: 240, rotation: 0, opacity: 0.2 },
      footerCompany: {
        companyName: "TexWeb Solution Private Limited",
        cin: "CIN: U85500WB2026PTC287896",
        dx: 0,
        dy: 0,
        rotation: 0,
        fontFamily: "Inter",
      },
      footerServices: { dx: 0, dy: 0, rotation: 0, fontFamily: "Inter" },
      footerDivider: { visible: true, dx: 0, dy: 0, width: 1, height: 24, color: "#334155", rotation: 0 },
      footerTopLine: { visible: true, dx: 0, dy: 0, width: 794, height: 2, color: "#D3151D", rotation: 0 },
    },
  };

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(CORPORATE_LETTERHEAD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const resolvedFont = parsed.font || parsed.letterhead?.fontFamily || base.font;
        return {
          ...base,
          ...parsed,
          font: resolvedFont,
          accent: parsed.accent || base.accent,
          letterhead: deepMergeLetterhead(base.letterhead, parsed.letterhead || {}),
        };
      }
    } catch {
      // Fallback to base
    }
  }

  return base;
}

export function saveCorporateLetterheadDefault(brand) {
  if (typeof window === "undefined" || !brand) return;
  try {
    const existing = getDefaultBrand();
    const mergedBrand = {
      ...existing,
      ...brand,
      letterhead: deepMergeLetterhead(existing.letterhead, brand.letterhead || {}),
    };
    localStorage.setItem(CORPORATE_LETTERHEAD_STORAGE_KEY, JSON.stringify(mergedBrand));
  } catch {
    // Storage quota or serialization safe
  }
}

export function resetCorporateLetterheadDefault() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CORPORATE_LETTERHEAD_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

