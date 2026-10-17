"use client";

import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  ChevronDown,
  DollarSign,
  Heading1,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Redo2,
  Sparkles,
  Square,
  Table as TableIcon,
  Trash2,
  Type,
  Undo2,
  UploadCloud,
} from "lucide-react";

export default function DocumentEditorToolbar({
  onAddBlock,
  onImportFile,
  undo,
  redo,
  canUndo,
  canRedo,
  currentPage,
  pageCount,
  setCurrentPage,
  onAddPage,
  onRemovePage,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleAi,
  isAiActive,
  brand = {},
  updateBrand = () => {},
  templateMode = "letterhead",
  setTemplateMode = () => {},
  onSaveLetterheadAsDefault,
  font = "Inter",
}) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      onImportFile(file);
      event.target.value = "";
    }
  }

  function handleImageDirect(event) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onAddBlock("image", { imageUrl: e.target?.result, body: file.name });
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    }
  }

  return (
    <div className="h-11 bg-white dark:bg-[#18150f] border-b border-gray-200 dark:border-[#3a3020] flex items-center justify-between gap-1.5 px-3 shrink-0 overflow-x-auto print:hidden z-20 shadow-2xs">
      {/* Left: Tools List (Exact match to Clienter screenshot) */}
      <div className="flex items-center gap-0.5 sm:gap-1 min-w-max text-xs">
        {/* H1 Heading */}
        <button
          type="button"
          onClick={() => onAddBlock("heading")}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Insert Heading"
        >
          <Heading1 className="w-4 h-4 text-orange-600" />
          <span>Heading</span>
        </button>

        {/* T Text */}
        <button
          type="button"
          onClick={() => onAddBlock("text")}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Insert Paragraph Text"
        >
          <Type className="w-4 h-4 text-blue-600" />
          <span>Text</span>
        </button>

        {/* Pricing */}
        <button
          type="button"
          onClick={() => onAddBlock("pricing")}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Insert Pricing Table"
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Pricing</span>
        </button>

        {/* Payment schedule */}
        <button
          type="button"
          onClick={() => onAddBlock("payment")}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Insert Milestone Payment Schedule"
        >
          <Banknote className="w-4 h-4 text-indigo-600" />
          <span>Payment schedule</span>
        </button>

        {/* Table */}
        <button
          type="button"
          onClick={() => onAddBlock("table")}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Insert Custom Grid Table"
        >
          <TableIcon className="w-4 h-4 text-teal-600" />
          <span>Table</span>
        </button>

        {/* Divider */}
        <button
          type="button"
          onClick={() => onAddBlock("divider")}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Insert Horizontal Divider"
        >
          <Minus className="w-4 h-4 text-gray-500" />
          <span>Divider</span>
        </button>

        {/* Box */}
        <button
          type="button"
          onClick={() => onAddBlock("box")}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Insert Highlight Callout Box"
        >
          <Square className="w-3.5 h-3.5 text-amber-600" />
          <span>Box</span>
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Upload & Insert Image"
        >
          <ImageIcon className="w-4 h-4 text-rose-500" />
          <span>Image</span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageDirect}
        />

        {/* Import */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          title="Import Document (.txt, .md, .csv, image)"
        >
          <UploadCloud className="w-4 h-4 text-slate-600" />
          <span>Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv,image/*,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 1. Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition active:scale-95"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition active:scale-95"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Separator Divider */}
        <div className="h-5 w-px bg-gray-200 dark:bg-[#3a3020] mx-0.5" />

        {/* 2. Page Switcher & Direct Add Page Button (Matches user screenshot: [Page 1/1 ⌄] + [Add Page]) */}
        <div className="flex items-center gap-1 bg-gray-50/80 dark:bg-slate-900/80 border border-gray-200 dark:border-[#3a3020] rounded-xl p-0.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPageMenu((p) => !p)}
              className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 font-bold text-xs text-gray-800 dark:text-neutral-100 flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
              title="Click to view all pages, jump to page, or add pages"
            >
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              <span>Page {currentPage}/{pageCount}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showPageMenu && (
              <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-[#1f1a14] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3a3020] p-2 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center justify-between">
                  <span>Document Pages ({pageCount})</span>
                  <span className="text-orange-600 font-bold">P{currentPage} Active</span>
                </div>
                <div className="max-h-48 overflow-y-auto crm-modal-scroll space-y-1 py-1">
                  {Array.from({ length: pageCount }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <div
                        key={pageNum}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-xl transition ${
                          currentPage === pageNum
                            ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold border border-orange-200 dark:border-orange-900/50"
                            : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-neutral-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            setShowPageMenu(false);
                          }}
                          className="flex-1 text-left flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <Layers className={`w-3.5 h-3.5 ${currentPage === pageNum ? "text-orange-600" : "text-gray-400"}`} />
                          <span>Page {pageNum}</span>
                          {currentPage === pageNum && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-black">
                              Current
                            </span>
                          )}
                        </button>

                        {pageCount > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemovePage(pageNum);
                              setShowPageMenu(false);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition"
                            title={`Delete Page ${pageNum}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="my-1.5 border-t border-gray-100 dark:border-[#3a3020]" />
                <button
                  type="button"
                  onClick={() => {
                    onAddPage();
                    setShowPageMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/25 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Page {pageCount + 1}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Direct 1-Click "+ Add" button right in the toolbar */}
          <button
            type="button"
            onClick={onAddPage}
            className="p-1 px-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xs font-bold text-xs flex items-center gap-1 cursor-pointer transition active:scale-95"
            title={`Quick Add Page ${pageCount + 1}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black">Add</span>
          </button>
        </div>

        {/* 3. Zoom Controls (- 100% + ⤢) */}
        <div className="flex items-center gap-0.5 text-xs text-gray-600 dark:text-neutral-300 bg-gray-50/80 dark:bg-slate-900/80 border border-gray-200 dark:border-[#3a3020] rounded-xl p-0.5">
          <button
            type="button"
            onClick={onZoomOut}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-neutral-300 cursor-pointer transition active:scale-95"
            title="Zoom Out (-)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="px-1.5 font-bold cursor-pointer hover:text-orange-600 select-none min-w-[44px] text-center text-gray-800 dark:text-white"
            title="Click to Reset Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-neutral-300 cursor-pointer transition active:scale-95"
            title="Zoom In (+)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-neutral-300 hover:text-orange-600 cursor-pointer transition active:scale-95"
            title={isFullscreen ? "Exit Fullscreen (⤢)" : "Fullscreen / Expand (⤢)"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-orange-600" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Right: AI Builder Button (Purple gradient pill like in screenshot!) */}
      <button
        type="button"
        onClick={onToggleAi}
        className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-violet-500/25 shrink-0 ${
          isAiActive
            ? "bg-violet-700 text-white ring-2 ring-violet-400"
            : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white hover:opacity-95"
        }`}
        title="Open AI Quotation & Scope Generator"
      >
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span>AI Builder</span>
      </button>
    </div>
  );
}
