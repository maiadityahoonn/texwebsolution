"use client";

import CanvasTransformBox from "./CanvasTransformBox";
import DocumentBlockItem from "./DocumentBlockItem";
import CorporateLetterheadDesign from "./CorporateLetterheadDesign";
import { estimateBlockHeight, formatShortDate, getDocumentAmount, getDocumentKind } from "./documentUtils";
import { AlertTriangle, FilePlus2, Plus, Trash2 } from "lucide-react";

export default function DocumentPageSheet({
  pageNum = 1,
  pageCount = 1,
  isCurrentPage = true,
  templateMode = "letterhead", // "letterhead" | "modern" | "blank"
  draftDoc = {},
  updateDraftDoc = () => {},
  brand = {},
  updateBrand = () => {},
  clientInfo = {},
  pageSections = [],
  selectedBlockId = "",
  setSelectedBlockId = () => {},
  updateSection = () => {},
  removeBlock = () => {},
  moveBlock = () => {},
  reorderBlocks = () => {},
  duplicateBlock = () => {},
  startMove,
  startResize,
  startRotate,
  zoom = 1,
  font = "Inter",
  onAddBlock = () => {},
  onAddPage = () => {},
  onRemovePage = () => {},
  setCurrentPage = () => {},
  onAutoShiftPage = () => {},
  onShiftBlockToPage = () => {},
}) {
  const totalPageHeight = pageSections.reduce((sum, block) => sum + estimateBlockHeight(block), 0);
  const isOverflowing = totalPageHeight > 940;
  const kind = getDocumentKind(draftDoc);
  const isAgreement = kind === "agreement";
  const amount = getDocumentAmount(draftDoc);
  const letterheadSrc = brand.letterheadUrl || "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-official-letterhead.png";

  function updateLetterhead(key, updates) {
    updateBrand?.({
      letterhead: {
        ...(brand.letterhead || {}),
        [key]: {
          ...(brand.letterhead?.[key] || {}),
          ...updates,
        },
      },
      ...(key === "contact" && updates.phone ? { phone: updates.phone } : {}),
      ...(key === "contact" && updates.email ? { email: updates.email } : {}),
      ...(key === "contact" && updates.website ? { website: updates.website } : {}),
      ...(key === "contact" && updates.locations ? { locations: updates.locations } : {}),
      ...(key === "tagline" && updates.text ? { tagline: updates.text } : {}),
      ...(key === "logo" && updates.logoUrl ? { logoUrl: updates.logoUrl } : {}),
      ...(key === "footerCompany" && updates.companyName ? { companyName: updates.companyName } : {}),
      ...(key === "footerCompany" && updates.cin ? { cin: updates.cin } : {}),
    });
  }

  return (
    <div
      id={`document-page-${pageNum}`}
      onClick={(e) => {
        if (
          !e.target.closest("[data-interactive-element='true']") &&
          !e.target.closest("[data-canvas-alignment-toolbar='true']") &&
          !e.target.closest("[data-canvas-transform='true']")
        ) {
          setSelectedBlockId("");
        }
        setCurrentPage(pageNum);
      }}
      className={`a4-sheet-canvas w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl rounded-sm border relative flex flex-col justify-between overflow-hidden print:shadow-none print:border-0 print:m-0 print:w-full print:min-h-[1123px] print:h-[1123px] transition-all mb-8 ${
        isCurrentPage ? "ring-2 ring-orange-500/60 border-orange-300" : "border-gray-200 hover:border-gray-300"
      }`}
      style={{
        pageBreakAfter: "always",
        breakAfter: "page",
        fontFamily: font || brand.font || "Inter",
      }}
    >
      {/* Page Badge Indicator on top right */}
      <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 print:hidden pdf-hide-on-export">
        <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
          Page {pageNum} of {pageCount}
        </span>
        {pageCount > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemovePage(pageNum);
            }}
            className="p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition cursor-pointer"
            title={`Delete Page ${pageNum}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* TEMPLATE 1: TEXWEB CORPORATE LETTERHEAD                  */}
      {/* ======================================================== */}
      {templateMode === "letterhead" && (
        <div className="flex-1 flex flex-col justify-between relative overflow-hidden select-text min-h-[1123px]">
          {/* Authentic Vector & CSS Corporate Letterhead Design */}
          <CorporateLetterheadDesign
            customImageUrl={brand.letterheadUrl}
            logoUrl={brand.logoUrl || "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-header-logo.png"}
            iconUrl="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-official-icon.png"
            phone={brand.phone || "0755-4601839"}
            email={brand.email || "info@texwebsolution.in"}
            website={brand.website || "www.texwebsolution.in"}
            locations={brand.locations || "Kolkata | Bhopal"}
            companyName={brand.name || brand.companyName || "TexWeb Solution Private Limited"}
            cin={brand.cin || "CIN: U85500WB2026PTC287896"}
            tagline={brand.tagline || "Complete Digital Solutions for Your Business"}
            letterheadConfig={brand.letterhead || {}}
            updateLetterhead={updateLetterhead}
            selectedBlockId={selectedBlockId}
            setSelectedBlockId={setSelectedBlockId}
            startMove={startMove}
            startResize={startResize}
            startRotate={startRotate}
            zoom={zoom}
            font={font || brand.font || "Inter"}
          />

          {/* Top Header Clearance (115px) to clear official header banner */}
          <div className="h-[115px] w-full shrink-0 relative pointer-events-none z-10">
            {/* Visual Content Start Guideline sitting directly on clearance boundary (0 flow height) */}
            <div className="absolute -bottom-1 left-12 right-12 flex items-center gap-2 border-b border-dashed border-orange-400/60 print:hidden pdf-hide-on-export select-none pointer-events-none">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-orange-600 bg-orange-50/95 dark:bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/60 flex items-center gap-1 shadow-2xs translate-y-1/2">
                <span>▲ Content Start Area</span>
                <span className="text-gray-400 font-normal">· Header Clearance 115px</span>
              </span>
              <div className="flex-1" />
            </div>
          </div>

          {/* Main Content Area */}
          <main className="relative flex-1 px-12 pt-1 pb-1 z-10 min-h-[500px]">
            {/* Page 2+ Subtle Continuation Notice (Optional) */}
            {pageNum > 1 && (
              <div className="border-b border-gray-200/80 pb-1 mb-2 flex justify-between items-center text-xs text-gray-500">
                <span className="font-bold text-slate-900 uppercase">
                  {draftDoc.title || (isAgreement ? "Project Agreement" : "Commercial Quotation")} (Contd.)
                </span>
                <span className="font-semibold text-gray-400">Page {pageNum} of {pageCount}</span>
              </div>
            )}

            {/* Directly Editable Blocks */}
            <div className="space-y-2">
              {pageSections.map((section) => (
                <DocumentBlockItem
                  key={section.id}
                  block={section}
                  isSelected={selectedBlockId === section.id}
                  onSelect={() => setSelectedBlockId(section.id)}
                  onUpdate={(updates) => updateSection(section.id, updates)}
                  onRemove={() => removeBlock(section.id)}
                  onMoveUp={() => moveBlock(section.id, "up")}
                  onMoveDown={() => moveBlock(section.id, "down")}
                  onDuplicate={() => duplicateBlock(section.id)}
                  onReorderBlocks={reorderBlocks}
                  onStartMove={startMove}
                  onStartResize={startResize}
                  onStartRotate={startRotate}
                  zoom={zoom}
                  pageCount={pageCount}
                  onShiftToPage={(targetPage) => onShiftBlockToPage?.(section.id, targetPage)}
                  font={font || brand.font || "Inter"}
                />
              ))}
            </div>

            {/* Live Content Height Overflow Indicator */}
            {isOverflowing && (
              <div className="my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 z-30 print:hidden pdf-hide-on-export backdrop-blur-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
                  <span>Page {pageNum} Overflows Limit ({totalPageHeight}px / 940px safe zone)</span>
                </div>
                <button
                  type="button"
                  onClick={() => onAutoShiftPage?.(pageNum)}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-xs cursor-pointer shadow-xs transition active:scale-95 shrink-0 flex items-center gap-1"
                  title="Automatically move overflowing blocks to next page"
                >
                  <span>Auto-Shift to Page {pageNum + 1} ➔</span>
                </button>
              </div>
            )}
          </main>

          {/* Bottom Footer Clearance (70px) with integrated top guideline (0 flow height) */}
          <div className="h-[70px] w-full shrink-0 relative pointer-events-none z-10">
            {/* Visual Content Safe Limit Guideline sitting directly on top of footer boundary */}
            <div className="absolute -top-1 left-12 right-12 flex items-center gap-2 border-t border-dashed border-orange-400/60 print:hidden pdf-hide-on-export select-none pointer-events-none">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-orange-600 bg-orange-50/95 dark:bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/60 flex items-center gap-1 shadow-2xs -translate-y-1/2">
                <span>▼ Content Safe Limit</span>
                <span className="text-gray-400 font-normal">· Footer Clearance 70px</span>
              </span>
              <div className="flex-1" />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TEMPLATE 2: MODERN CLEAN PROPOSAL                        */}
      {/* ======================================================== */}
      {templateMode === "modern" && (
        <main className="flex-1 p-12 flex flex-col justify-between">
          <div>
            {pageNum === 1 && (
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={brand.logoUrl || "/logo.png"}
                    alt="Brand"
                    className="h-10 w-10 object-contain rounded-xl"
                  />
                  <div>
                    <div className="font-black text-sm text-gray-900">{brand.companyName}</div>
                    <div className="text-xs text-gray-400">{brand.tagline}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div className="font-mono font-bold text-gray-900">
                    {draftDoc.quotation_number || draftDoc.agreement_number || "PROP-001"}
                  </div>
                  <div>{formatShortDate(draftDoc.created_at || new Date())}</div>
                </div>
              </div>
            )}

            {pageNum === 1 && (
              <div className="mb-4">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBlockId("modern-title");
                  }}
                  className={`relative p-0.5 rounded-2xs transition cursor-default ${
                    selectedBlockId === "modern-title" ? "ring-1 ring-orange-500 bg-orange-50/5" : "hover:ring-1 hover:ring-gray-200"
                  }`}
                >
                  <CanvasTransformBox
                    isSelected={selectedBlockId === "modern-title"}
                    tooltipText="Click to type · drag to move"
                  />
                  <textarea
                    value={draftDoc.title || ""}
                    onChange={(e) => {
                      updateDraftDoc({ title: e.target.value });
                      e.target.style.height = "0px";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    rows={1}
                    placeholder="Document Title..."
                    className="text-2xl font-black text-gray-900 w-full border-0 bg-transparent outline-hidden hover:bg-orange-50/40 rounded px-0.5 resize-none overflow-hidden leading-tight block"
                  />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBlockId("modern-client");
                  }}
                  className={`text-xs text-gray-500 mt-0.5 relative p-0.5 rounded-2xs transition cursor-default ${
                    selectedBlockId === "modern-client" ? "ring-1 ring-orange-500 bg-orange-50/5" : "hover:ring-1 hover:ring-gray-200"
                  }`}
                >
                  <CanvasTransformBox
                    isSelected={selectedBlockId === "modern-client"}
                    tooltipText="Click to type · drag to move"
                  />
                  Prepared for: <span className="font-bold text-gray-800">{clientInfo.name}</span>
                </div>
              </div>
            )}

            {pageNum > 1 && (
              <div className="border-b border-gray-100 pb-2 mb-4 flex justify-between text-xs text-gray-400">
                <span className="font-bold text-gray-700">{draftDoc.title || "Project Proposal"}</span>
                <span>Page {pageNum} of {pageCount}</span>
              </div>
            )}

            <div className="space-y-4">
              {pageSections.map((section) => (
                <DocumentBlockItem
                  key={section.id}
                  block={section}
                  isSelected={selectedBlockId === section.id}
                  onSelect={() => setSelectedBlockId(section.id)}
                  onUpdate={(updates) => updateSection(section.id, updates)}
                  onRemove={() => removeBlock(section.id)}
                  onMoveUp={() => moveBlock(section.id, "up")}
                  onMoveDown={() => moveBlock(section.id, "down")}
                  onDuplicate={() => duplicateBlock(section.id)}
                  onReorderBlocks={reorderBlocks}
                  onStartMove={startMove}
                  onStartResize={startResize}
                  onStartRotate={startRotate}
                  zoom={zoom}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-8 flex justify-between text-xs text-gray-400">
            <div>{brand.website || "www.texwebsolution.in"}</div>
            <div>Page {pageNum} of {pageCount}</div>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* TEMPLATE 3: BLANK DOCUMENT (MS Word Style Canvas)        */}
      {/* ======================================================== */}
      {templateMode === "blank" && (
        <main className="flex-1 p-12 flex flex-col justify-between relative">
          <div>
            <div className="absolute inset-8 border border-dashed border-gray-200 pointer-events-none opacity-40 print:hidden" />
            <div className="space-y-4 relative z-10">
              {pageSections.length === 0 ? (
                <div className="py-20 text-center text-gray-400 space-y-3">
                  <p className="text-sm font-semibold">Blank Document Canvas - Page {pageNum}</p>
                  <p className="text-xs">Add headings, text, tables, or boxes to design your quotation.</p>
                  <button
                    type="button"
                    onClick={() => onAddBlock?.("heading", { page: pageNum })}
                    className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Heading
                  </button>
                </div>
              ) : (
                pageSections.map((section) => (
                  <DocumentBlockItem
                    key={section.id}
                    block={section}
                    isSelected={selectedBlockId === section.id}
                    onSelect={() => setSelectedBlockId(section.id)}
                    onUpdate={(updates) => updateSection(section.id, updates)}
                    onRemove={() => removeBlock(section.id)}
                    onMoveUp={() => moveBlock(section.id, "up")}
                    onMoveDown={() => moveBlock(section.id, "down")}
                    onDuplicate={() => duplicateBlock(section.id)}
                    onReorderBlocks={reorderBlocks}
                    onStartMove={startMove}
                    onStartResize={startResize}
                    onStartRotate={startRotate}
                    zoom={zoom}
                  />
                ))
              )}
            </div>
          </div>

          <div className="pt-8 text-right text-xs text-gray-400 select-none">
            Page {pageNum} of {pageCount}
          </div>
        </main>
      )}
    </div>
  );
}
