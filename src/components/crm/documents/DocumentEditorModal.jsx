"use client";

import { useState } from "react";
import { useDocumentEditor } from "./useDocumentEditor";
import DocumentEditorTopBar from "./DocumentEditorTopBar";
import DocumentEditorToolbar from "./DocumentEditorToolbar";
import DocumentRichTextBar from "./DocumentRichTextBar";
import DocumentCanvas from "./DocumentCanvas";
import DocumentAiBuilderPanel from "./DocumentAiBuilderPanel";
import { downloadDocumentAsPdf } from "./documentPdfExport";

export default function DocumentEditorModal({
  doc,
  deals = [],
  clients = [],
  leads = [],
  onClose,
  onCreateFromType,
  onSaveDocument,
}) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const editor = useDocumentEditor({
    doc,
    deals,
    clients,
    leads,
    onSaveDocument,
  });

  if (!doc) return null;

  function handleImportFile(file) {
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.addBlock("image", { imageUrl: e.target?.result, body: file.name });
        editor.flashNotice(`✓ Imported image: ${file.name}`);
      };
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result || "";
      if (file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            parsed.forEach((b) => editor.addBlock(b.type || "text", b));
            editor.flashNotice(`✓ Imported ${parsed.length} blocks from ${file.name}`);
            return;
          }
        } catch {
          // fallback to text
        }
      }
      editor.addBlock("text", { body: text });
      editor.flashNotice(`✓ Imported text from ${file.name}`);
    };
    reader.readAsText(file);
  }

  async function handleDownloadPdf() {
    await downloadDocumentAsPdf({
      draftDoc: editor.draftDoc,
      onStart: () => {
        setIsExportingPdf(true);
        editor.flashNotice("Generating high-resolution PDF with official letterhead...");
      },
      onSuccess: (fileName) => {
        setIsExportingPdf(false);
        editor.flashNotice(`Downloaded ${fileName}`);
      },
      onError: (err) => {
        setIsExportingPdf(false);
        editor.flashNotice(`PDF export error: ${err?.message || "Please try again"}`);
      },
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#f4f1ef] dark:bg-[#100d0a] flex flex-col print:static print:block print:bg-white overflow-hidden"
      data-modal-overlay="true"
    >
      {/* 1. Clienter Top Header Bar */}
      <DocumentEditorTopBar
        title={editor.title}
        status={editor.status}
        draftDoc={editor.draftDoc}
        templateMode={editor.templateMode}
        setTemplateMode={editor.setTemplateMode}
        updateDraftDoc={editor.updateDraftDoc}
        onClose={onClose}
        onSave={editor.saveDocumentChanges}
        onDownload={handleDownloadPdf}
        isExportingPdf={isExportingPdf}
        onShare={editor.copyShareLink}
      />

      {/* 2. Clienter Document Tools Sub-header */}
      <DocumentEditorToolbar
        onAddBlock={editor.addBlock}
        onImportFile={handleImportFile}
        undo={editor.undo}
        redo={editor.redo}
        canUndo={editor.history.length > 0}
        canRedo={editor.future.length > 0}
        currentPage={editor.currentPage}
        pageCount={editor.pageCount}
        setCurrentPage={editor.navigateToPage}
        onAddPage={editor.addPage}
        onRemovePage={editor.removeCurrentPage}
        zoom={editor.zoom}
        onZoomIn={editor.zoomIn}
        onZoomOut={editor.zoomOut}
        onResetZoom={editor.resetZoom}
        onToggleAi={() =>
          editor.setActivePanel((p) => (p === "ai" ? null : "ai"))
        }
        isAiActive={editor.activePanel === "ai"}
        brand={editor.brand}
        updateBrand={editor.updateBrand}
        templateMode={editor.templateMode}
        setTemplateMode={editor.setTemplateMode}
        onSaveLetterheadAsDefault={editor.saveLetterheadAsDefault}
        font={editor.font}
      />

      {/* 3. MS Word Style Rich Text Formatting Bar */}
      <DocumentRichTextBar
        font={editor.font}
        setFont={editor.setFont}
        accent={editor.accent}
        setAccent={editor.setAccent}
        selectedBlockId={editor.selectedBlockId}
        sections={editor.sections}
        updateSection={editor.updateSection}
        brand={editor.brand}
        updateBrand={editor.updateBrand}
      />

      {/* 4. Canvas & Side Panels */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* Floating Toast Notification */}
        {editor.notice && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[140] px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold shadow-2xl animate-fade-in border border-slate-800 print:hidden">
            {editor.notice}
          </div>
        )}

        {/* Scrollable Document Canvas Viewport */}
        <main className="flex-1 min-w-0 overflow-auto crm-modal-scroll p-4 sm:p-8 bg-[#e8e4df] dark:bg-[#0c0a08] print:p-0 print:bg-white print:overflow-visible">
          <DocumentCanvas
            templateMode={editor.templateMode}
            draftDoc={editor.draftDoc}
            updateDraftDoc={editor.updateDraftDoc}
            brand={editor.brand}
            updateBrand={editor.updateBrand}
            sections={editor.sections}
            updateSection={editor.updateSection}
            removeBlock={editor.removeBlock}
            moveBlock={editor.moveBlock}
            reorderBlocks={editor.reorderBlocks}
            duplicateBlock={editor.duplicateBlock}
            selectedBlockId={editor.selectedBlockId}
            setSelectedBlockId={editor.setSelectedBlockId}
            currentPage={editor.currentPage}
            pageCount={editor.pageCount}
            setCurrentPage={editor.setCurrentPage}
            onAddPage={editor.addPage}
            onRemovePage={editor.removeCurrentPage}
            zoom={editor.zoom}
            font={editor.font}
            accent={editor.accent}
            clientInfo={editor.clientInfo}
            onAddBlock={editor.addBlock}
            onAutoShiftPage={editor.autoShiftPage}
            onShiftBlockToPage={editor.shiftBlockToPage}
          />
        </main>

        {/* 5. AI Builder Side Panel Drawer */}
        {editor.activePanel === "ai" && (
          <div className="w-[360px] border-l border-gray-200 dark:border-[#3a3020] bg-white dark:bg-[#18150f] h-full shadow-2xl z-40 print:hidden animate-slide-left">
            <DocumentAiBuilderPanel
              doc={editor.draftDoc}
              deals={deals}
              clients={clients}
              leads={leads}
              onApply={(draft, mode) => {
                editor.applyAiDraft(draft, mode);
              }}
              onClose={() => editor.setActivePanel(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
