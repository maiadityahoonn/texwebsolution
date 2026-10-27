"use client";

import { useMemo, useState } from "react";
import DocumentPageSheet from "./DocumentPageSheet";
import CanvasSmartGuides from "./CanvasSmartGuides";
import { useCanvasTransform } from "./useCanvasTransform";
import { UploadCloud } from "lucide-react";

export default function DocumentCanvas({
  templateMode = "letterhead", // "letterhead" | "modern" | "blank"
  draftDoc = {},
  updateDraftDoc,
  brand = {},
  updateBrand,
  sections = [],
  updateSection,
  removeBlock,
  moveBlock,
  reorderBlocks,
  duplicateBlock,
  selectedBlockId,
  setSelectedBlockId,
  currentPage = 1,
  pageCount = 1,
  setCurrentPage = () => {},
  onAddPage = () => {},
  onRemovePage = () => {},
  zoom = 1,
  font = "Inter",
  accent = "#ea580c",
  clientInfo = {},
  onAddBlock,
  onAutoShiftPage = () => {},
  onShiftBlockToPage = () => {},
}) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const allBlocks = useMemo(() => {
    const lh = brand.letterhead || {};
    const letterheadVirtualBlocks = [
      {
        id: "letterhead-logo",
        dx: lh.logo?.dx || 0,
        dy: lh.logo?.dy || 0,
        width: lh.logo?.width || 240,
        height: lh.logo?.height || 52,
        rotation: lh.logo?.rotation || 0,
      },
      {
        id: "letterhead-tagline",
        dx: lh.tagline?.dx || 0,
        dy: lh.tagline?.dy || 0,
        width: lh.tagline?.width || 260,
        height: lh.tagline?.height || 24,
        rotation: lh.tagline?.rotation || 0,
      },
      {
        id: "letterhead-divider",
        dx: lh.divider?.dx || 0,
        dy: lh.divider?.dy || 0,
        width: lh.divider?.width || 1,
        height: lh.divider?.height || 64,
        rotation: lh.divider?.rotation || 0,
      },
      {
        id: "letterhead-contact",
        dx: lh.contact?.dx || 0,
        dy: lh.contact?.dy || 0,
        width: lh.contact?.width || 220,
        height: lh.contact?.height || 100,
        rotation: lh.contact?.rotation || 0,
      },
      {
        id: "letterhead-watermark",
        dx: lh.watermark?.dx || 0,
        dy: lh.watermark?.dy || 0,
        width: lh.watermark?.width || 280,
        height: lh.watermark?.height || 280,
        rotation: lh.watermark?.rotation || 0,
      },
      {
        id: "letterhead-footer-company",
        dx: lh.footerCompany?.dx || 0,
        dy: lh.footerCompany?.dy || 0,
        width: lh.footerCompany?.width || 280,
        height: lh.footerCompany?.height || 40,
        rotation: lh.footerCompany?.rotation || 0,
      },
      {
        id: "letterhead-footer-services",
        dx: lh.footerServices?.dx || 0,
        dy: lh.footerServices?.dy || 0,
        width: lh.footerServices?.width || 420,
        height: lh.footerServices?.height || 40,
        rotation: lh.footerServices?.rotation || 0,
      },
      {
        id: "letterhead-footer-divider",
        dx: lh.footerDivider?.dx || 0,
        dy: lh.footerDivider?.dy || 0,
        width: lh.footerDivider?.width || 1,
        height: lh.footerDivider?.height || 24,
        rotation: lh.footerDivider?.rotation || 0,
      },
      {
        id: "letterhead-footer-topline",
        dx: lh.footerTopLine?.dx || 0,
        dy: lh.footerTopLine?.dy || 0,
        width: lh.footerTopLine?.width || 794,
        height: lh.footerTopLine?.height || 2,
        rotation: lh.footerTopLine?.rotation || 0,
      },
    ];
    return [...sections, ...letterheadVirtualBlocks];
  }, [sections, brand.letterhead]);

  function handleUpdateBlock(id, updates) {
    if (typeof id === "string" && id.startsWith("letterhead-")) {
      const keyMap = {
        "letterhead-logo": "logo",
        "letterhead-tagline": "tagline",
        "letterhead-divider": "divider",
        "letterhead-contact": "contact",
        "letterhead-watermark": "watermark",
        "letterhead-footer-company": "footerCompany",
        "letterhead-footer-services": "footerServices",
        "letterhead-footer-divider": "footerDivider",
        "letterhead-footer-topline": "footerTopLine",
      };
      const key = keyMap[id] || id.replace("letterhead-", "");
      updateBrand?.({
        letterhead: {
          ...(brand.letterhead || {}),
          [key]: {
            ...(brand.letterhead?.[key] || {}),
            ...updates,
          },
        },
      });
    } else {
      updateSection?.(id, updates);
    }
  }

  const {
    activeTransform,
    activeGuides,
    startMove,
    startResize,
    startRotate,
  } = useCanvasTransform({
    blocks: allBlocks,
    onUpdateBlock: handleUpdateBlock,
    zoom,
    canvasWidth: 794,
    canvasHeight: 1123,
  });

  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let p = 1; p <= Math.max(1, pageCount); p++) {
      pages.push(p);
    }
    return pages;
  }, [pageCount]);

  function handleCanvasDragOver(e) {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setIsDraggingFile(true);
    }
  }

  function handleCanvasDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingFile(false);
    }
  }

  function handleCanvasDrop(e) {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      setIsDraggingFile(false);
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          onAddBlock?.("image", { imageUrl: ev.target?.result, body: file.name, page: currentPage });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  return (
    <div
      onClick={() => setSelectedBlockId("")}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
      data-canvas-zoom-wrapper="true"
      className="mx-auto my-6 transition-transform duration-150 origin-top flex flex-col items-center relative"
      style={{
        transform: `scale(${zoom})`,
        fontFamily: font,
      }}
    >
      {/* Pink / Magenta Smart Alignment Guidelines */}
      <CanvasSmartGuides activeGuides={activeGuides} />

      {/* Visual drop indicator when dragging desktop files/images onto canvas */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-orange-500/10 backdrop-blur-2xs flex flex-col items-center justify-center pointer-events-none border-4 border-dashed border-orange-500">
          <div className="p-5 rounded-2xl bg-white shadow-2xl flex flex-col items-center gap-2 text-orange-600">
            <UploadCloud className="w-10 h-10 animate-bounce" />
            <div className="text-base font-black">Drop image here to insert</div>
            <div className="text-xs text-gray-500">Will be added to Page {currentPage}</div>
          </div>
        </div>
      )}

      {/* Sequential Multi-Page Continuous Layout (Clienter / Word Style) */}
      {pageNumbers.map((pNum) => {
        const pageSections = sections.filter((s) => Number(s.page || 1) === pNum);
        return (
          <div key={`page-wrapper-${pNum}`} className="flex flex-col items-center">
            <DocumentPageSheet
              pageNum={pNum}
              pageCount={pageCount}
              isCurrentPage={currentPage === pNum}
              templateMode={templateMode}
              draftDoc={draftDoc}
              updateDraftDoc={updateDraftDoc}
              brand={brand}
              updateBrand={updateBrand}
              clientInfo={clientInfo}
              pageSections={pageSections}
              selectedBlockId={selectedBlockId}
              setSelectedBlockId={setSelectedBlockId}
              updateSection={updateSection}
              removeBlock={removeBlock}
              moveBlock={moveBlock}
              reorderBlocks={reorderBlocks}
              duplicateBlock={duplicateBlock}
              startMove={startMove}
              startResize={startResize}
              startRotate={startRotate}
              zoom={zoom}
              font={font}
              onAddBlock={onAddBlock}
              onAddPage={onAddPage}
              onRemovePage={onRemovePage}
              setCurrentPage={setCurrentPage}
              onAutoShiftPage={onAutoShiftPage}
              onShiftBlockToPage={onShiftBlockToPage}
            />

            {/* In-between Page Divider with Add Page Action */}
            {pNum < pageCount && (
              <div className="my-2 flex items-center gap-3 text-xs text-gray-400 print:hidden pdf-hide-on-export select-none">
                <div className="w-24 h-px bg-gray-300 dark:bg-[#3a3020]" />
                <span className="font-semibold text-[11px] uppercase tracking-wider text-gray-400">
                  Page Break · End of Page {pNum}
                </span>
                <div className="w-24 h-px bg-gray-300 dark:bg-[#3a3020]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
