"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  autoPaginateBlocks,
  buildDocumentSections,
  createBlockId,
  deepMergeLetterhead,
  estimateBlockHeight,
  getDefaultBrand,
  getDocumentAmount,
  getDocumentClient,
  getDocumentKind,
  getDocumentStatus,
  getDocumentTitle,
  normalizeDocumentBlocks,
  saveCorporateLetterheadDefault,
} from "./documentUtils";

export function useDocumentEditor({
  doc,
  deals = [],
  clients = [],
  leads = [],
  onSaveDocument,
}) {
  const [templateMode, setTemplateMode] = useState(() => {
    return doc?.templateMode || "letterhead"; // "letterhead" | "modern" | "blank"
  });

  const [draftDoc, setDraftDoc] = useState(() => {
    const stored = loadStoredEditorState(doc);
    return stored?.draftDoc || doc || {};
  });

  const [brand, setBrand] = useState(() => {
    const stored = loadStoredEditorState(doc);
    const defaultB = getDefaultBrand();
    const b = stored?.brand
      ? {
          ...defaultB,
          ...stored.brand,
          letterhead: deepMergeLetterhead(
            defaultB.letterhead,
            stored.brand.letterhead || {}
          ),
        }
      : defaultB;
    if (!b.logoUrl || b.logoUrl === "/logo.png") {
      b.logoUrl =
        "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-header-logo.png";
    }
    return b;
  });

  const [sections, setSections] = useState(() => {
    const stored = loadStoredEditorState(doc);
    if (stored?.sections) return stored.sections;
    if (doc?.sections && Array.isArray(doc.sections)) {
      return normalizeDocumentBlocks(doc.sections);
    }
    // Clean blank canvas so user can inspect and work on the letterhead design without clutter
    return [];
  });

  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [explicitPageCount, setExplicitPageCount] = useState(() => {
    const stored = loadStoredEditorState(doc);
    const fromStored = stored?.pageCount || 1;
    const fromDoc = doc?.pageCount || 1;
    const fromSections = (doc?.sections || []).map((s) => Number(s.page || 1));
    return Math.max(1, fromStored, fromDoc, ...fromSections);
  });
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [notice, setNotice] = useState("");
  const lastHistoryPushRef = useRef(0);
  const [font, setFont] = useState(() => {
    const stored = loadStoredEditorState(doc);
    const defaultB = getDefaultBrand();
    return (
      stored?.font ||
      stored?.brand?.font ||
      stored?.brand?.letterhead?.fontFamily ||
      defaultB?.font ||
      defaultB?.letterhead?.fontFamily ||
      "Inter"
    );
  });
  const [accent, setAccent] = useState(() => {
    const stored = loadStoredEditorState(doc);
    const defaultB = getDefaultBrand();
    return (
      stored?.accent ||
      stored?.brand?.accent ||
      defaultB?.accent ||
      "#ea580c"
    );
  });
  const [activePanel, setActivePanel] = useState(null); // null | "ai" | "design"

  const title = getDocumentTitle(draftDoc);
  const status = getDocumentStatus(draftDoc);
  const clientInfo = getDocumentClient(draftDoc, deals, clients, leads);

  const pageCount = Math.max(
    1,
    explicitPageCount,
    ...sections.map((section) => Number(section.page || 1))
  );

  // Auto-save brand as default corporate letterhead and auto-save active draft to localStorage
  // This guarantees that exiting the page ("bahar jana pa"), refreshing, or returning ("back aaya to") retains this design & font!
  // And live content updates stay synchronized and saved in real time ("jo content likha jaya ga leeterhead ma wo update hota raha")!
  useEffect(() => {
    if (typeof window === "undefined" || !brand) return;
    try {
      const livePayload = {
        scope_of_work:
          sections.find((item) => !["divider", "image"].includes(item.type))?.body ||
          draftDoc.scope_of_work ||
          "",
        deliverables:
          sections
            .filter((item) => !["divider", "image"].includes(item.type))
            .map((item) => `${item.heading || item.type}\n${item.body || ""}`)
            .join("\n\n") ||
          draftDoc.deliverables ||
          "",
        commercial_terms:
          sections
            .filter((item) => !["divider", "image"].includes(item.type))
            .map((item) => `${item.heading || item.type}: ${item.body || ""}`)
            .join("\n") ||
          draftDoc.commercial_terms ||
          "",
      };

      const updatedDraft = {
        ...draftDoc,
        ...livePayload,
      };

      const brandWithFont = {
        ...brand,
        font: font || brand.font || "Inter",
        accent: accent || brand.accent || "#ea580c",
        letterhead: {
          ...(brand.letterhead || {}),
          fontFamily: font || brand.letterhead?.fontFamily || "Inter",
        },
      };

      saveCorporateLetterheadDefault(brandWithFont);
      const storageKey = getEditorStorageKey(draftDoc);
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          draftDoc: updatedDraft,
          brand: brandWithFont,
          sections,
          templateMode,
          font,
          accent,
          pageCount,
        })
      );
    } catch {
      // Safe storage
    }
  }, [brand, sections, draftDoc, templateMode, font, accent, pageCount]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev.slice(-25),
      { draftDoc, brand, sections, templateMode, pageCount: explicitPageCount },
    ]);
    setFuture([]);
  }, [draftDoc, brand, sections, templateMode, explicitPageCount]);

  const recordSectionEdit = useCallback(() => {
    const now = Date.now();
    if (now - lastHistoryPushRef.current > 600) {
      pushHistory();
      lastHistoryPushRef.current = now;
    }
  }, [pushHistory]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      setFuture((next) => [
        { draftDoc, brand, sections, templateMode, pageCount: explicitPageCount },
        ...next.slice(0, 25),
      ]);
      setDraftDoc(last.draftDoc);
      setBrand(last.brand);
      setSections(last.sections);
      if (last.pageCount) setExplicitPageCount(last.pageCount);
      if (last.templateMode) setTemplateMode(last.templateMode);
      return prev.slice(0, -1);
    });
  }, [draftDoc, brand, sections, templateMode, explicitPageCount]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      const next = prev[0];
      if (!next) return prev;
      setHistory((old) => [
        ...old.slice(-25),
        { draftDoc, brand, sections, templateMode, pageCount: explicitPageCount },
      ]);
      setDraftDoc(next.draftDoc);
      setBrand(next.brand);
      setSections(next.sections);
      if (next.pageCount) setExplicitPageCount(next.pageCount);
      if (next.templateMode) setTemplateMode(next.templateMode);
      return prev.slice(1);
    });
  }, [draftDoc, brand, sections, templateMode, explicitPageCount]);

  // Global Keyboard shortcuts: Ctrl+Z (Undo) and Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    function handleKeyDown(e) {
      const isZ = e.key && e.key.toLowerCase() === "z";
      const isY = e.key && e.key.toLowerCase() === "y";
      if ((e.ctrlKey || e.metaKey) && isZ) {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && isY) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const flashNotice = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }, []);

  const updateDraftDoc = useCallback(
    (updates) => {
      pushHistory();
      setDraftDoc((prev) => ({ ...prev, ...updates }));
    },
    [pushHistory]
  );

  const updateBrand = useCallback(
    (updates) => {
      pushHistory();
      setBrand((prev) => ({ ...prev, ...updates }));
    },
    [pushHistory]
  );

  const updateSection = useCallback(
    (id, updates) => {
      recordSectionEdit();
      setSections((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    [recordSectionEdit]
  );

  const addBlock = useCallback(
    (type, initialData = {}) => {
      pushHistory();
      const targetPage = Number(initialData?.page || currentPage || 1);
      let newBlock = {
        id: createBlockId(),
        type,
        page: targetPage,
        heading: "",
        body: "",
        ...initialData,
      };

      if (type === "heading" && !initialData?.heading) {
        newBlock.heading = "New Heading";
      } else if (type === "text" && !initialData?.body) {
        newBlock.body = "Type your text content here. You can edit this directly on the page.";
      } else if (type === "pricing" && !initialData?.pricingItems) {
        newBlock.heading = "Investment / Pricing Details";
        newBlock.pricingItems = [
          { id: createBlockId(), item: "Design & Development", description: "UI/UX & Frontend implementation", qty: 1, rate: 45000, amount: 45000 },
          { id: createBlockId(), item: "API & Backend Integration", description: "Supabase & Database setup", qty: 1, rate: 25000, amount: 25000 },
        ];
        newBlock.taxRate = 18;
        newBlock.discount = 0;
      } else if (type === "payment" && !initialData?.milestones) {
        newBlock.heading = "Payment Schedule";
        newBlock.milestones = [
          { id: createBlockId(), milestone: "Project Kickoff", percentage: 40, amount: 28000, dueDate: "Upon Contract Signing" },
          { id: createBlockId(), milestone: "Beta Review & Approval", percentage: 30, amount: 21000, dueDate: "Week 3" },
          { id: createBlockId(), milestone: "Final Launch & Handover", percentage: 30, amount: 21000, dueDate: "Before Production Deploy" },
        ];
      } else if (type === "table" && !initialData?.columns) {
        newBlock.heading = "Deliverables & Scope";
        newBlock.columns = ["Module", "Specifications", "Timeline"];
        newBlock.rows = [
          ["User Authentication", "NextAuth / Supabase Auth with Google login", "3 Days"],
          ["Admin Dashboard", "Manage leads, quotations, invoices & reports", "5 Days"],
          ["Payment Gateway", "Razorpay / Stripe Webhook integration", "2 Days"],
        ];
      } else if (type === "divider") {
        newBlock.heading = "";
        newBlock.body = "";
        newBlock.color = "#ea580c";
        newBlock.lineWidth = 2;
        newBlock.height = 12;
      } else if (type === "box" && !initialData?.body) {
        newBlock.heading = "Terms & Exclusions";
        newBlock.body = "Additional revisions beyond the 3 included review rounds will be billed at standard hourly rates.";
      } else if (type === "image" && !initialData?.imageUrl) {
        newBlock.heading = "";
        newBlock.imageUrl = "";
        newBlock.body = "Image description or caption";
      }

      setSections((prev) => [...prev, newBlock]);
      setCurrentPage(targetPage);
      setSelectedBlockId(newBlock.id);
      flashNotice(`✓ Added ${type} to Page ${targetPage}`);

      if (typeof window !== "undefined") {
        setTimeout(() => {
          const el = document.getElementById(newBlock.id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 50);
      }
    },
    [currentPage, pushHistory, flashNotice]
  );

  const removeBlock = useCallback(
    (id) => {
      pushHistory();
      setSections((prev) => prev.filter((item) => item.id !== id));
      if (selectedBlockId === id) setSelectedBlockId("");
      flashNotice("Block deleted");
    },
    [selectedBlockId, pushHistory, flashNotice]
  );

  const moveBlock = useCallback(
    (id, direction) => {
      pushHistory();
      setSections((prev) => {
        const index = prev.findIndex((item) => item.id === id);
        if (index === -1) return prev;
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(index, 1);
        const neighbor = copy[newIndex];
        if (neighbor && neighbor.page) {
          moved.page = neighbor.page;
        }
        copy.splice(newIndex, 0, moved);
        return copy;
      });
    },
    [pushHistory]
  );

  const reorderBlocks = useCallback(
    (sourceId, targetId, placement = "before") => {
      if (!sourceId || !targetId || sourceId === targetId) return;
      pushHistory();
      setSections((prev) => {
        const sourceIndex = prev.findIndex((item) => item.id === sourceId);
        const targetIndex = prev.findIndex((item) => item.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return prev;

        const copy = [...prev];
        const [sourceItem] = copy.splice(sourceIndex, 1);
        const newTargetIndex = copy.findIndex((item) => item.id === targetId);
        const insertIndex = placement === "after" ? newTargetIndex + 1 : newTargetIndex;

        const targetItem = copy[newTargetIndex];
        if (targetItem && targetItem.page) {
          sourceItem.page = targetItem.page;
        }

        copy.splice(insertIndex, 0, sourceItem);
        return copy;
      });
      flashNotice("Block moved");
    },
    [pushHistory, flashNotice]
  );


  const duplicateBlock = useCallback(
    (id) => {
      pushHistory();
      setSections((prev) => {
        const index = prev.findIndex((item) => item.id === id);
        if (index === -1) return prev;
        const source = prev[index];
        const clone = {
          ...JSON.parse(JSON.stringify(source)),
          id: createBlockId(),
          heading: source.heading ? `${source.heading} (Copy)` : "",
        };
        const copy = [...prev];
        copy.splice(index + 1, 0, clone);
        return copy;
      });
      flashNotice("Block duplicated");
    },
    [pushHistory, flashNotice]
  );

  const navigateToPage = useCallback(
    (targetPage) => {
      const p = Math.max(1, Math.min(pageCount, Number(targetPage)));
      setCurrentPage(p);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          const pageEl = document.getElementById(`document-page-${p}`);
          if (pageEl) {
            pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 50);
      }
    },
    [pageCount]
  );

  const addPage = useCallback(() => {
    pushHistory();
    const nextPage = pageCount + 1;
    setExplicitPageCount(nextPage);
    setCurrentPage(nextPage);
    flashNotice(`✓ Added Page ${nextPage}`);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const pageEl = document.getElementById(`document-page-${nextPage}`);
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 70);
    }
  }, [pageCount, pushHistory, flashNotice]);

  const removeCurrentPage = useCallback(
    (targetPage) => {
      const pageToDelete = Number(targetPage || currentPage);
      if (pageCount <= 1) {
        flashNotice("Cannot delete the only page");
        return;
      }
      pushHistory();
      setSections((prev) => {
        const filtered = prev.filter((item) => Number(item.page || 1) !== pageToDelete);
        return filtered.map((item) => {
          const p = Number(item.page || 1);
          return p > pageToDelete ? { ...item, page: p - 1 } : item;
        });
      });
      const newCount = Math.max(1, pageCount - 1);
      setExplicitPageCount(newCount);
      const targetP = Math.min(newCount, Math.max(1, currentPage >= pageToDelete ? currentPage - 1 : currentPage));
      setCurrentPage(targetP);
      flashNotice(`Page ${pageToDelete} deleted`);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          const pageEl = document.getElementById(`document-page-${targetP}`);
          if (pageEl) {
            pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 70);
      }
    },
    [pageCount, currentPage, pushHistory, flashNotice]
  );

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(2.0, Number((prev + 0.1).toFixed(1))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(1))));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const saveDocumentChanges = useCallback(async () => {
    const payload = {
      title: draftDoc.title || title,
      scope_of_work:
        sections.find((item) => !["divider", "image"].includes(item.type))?.body || "",
      deliverables: sections
        .map((item) => `${item.heading || item.type}\n${item.body || item.imageUrl || ""}`)
        .join("\n\n"),
      commercial_terms: sections
        .map((item) => `${item.heading || item.type}: ${item.body || item.imageUrl || ""}`)
        .join("\n"),
      notes: `Edited in document builder on ${new Date().toISOString()}`,
    };

    const brandWithFont = {
      ...brand,
      font: font || brand.font || "Inter",
      accent: accent || brand.accent || "#ea580c",
      letterhead: {
        ...(brand.letterhead || {}),
        fontFamily: font || brand.letterhead?.fontFamily || "Inter",
      },
    };

    saveCorporateLetterheadDefault(brandWithFont);

    localStorage.setItem(
      getEditorStorageKey(draftDoc),
      JSON.stringify({
        draftDoc: { ...draftDoc, ...payload },
        brand: brandWithFont,
        sections,
        templateMode,
        font,
        accent,
      })
    );

    if (onSaveDocument) {
      await onSaveDocument(draftDoc, payload);
    }
    setDraftDoc((prev) => ({ ...prev, ...payload }));
    flashNotice("✓ Document & Letterhead design saved successfully!");
  }, [draftDoc, title, sections, brand, templateMode, font, accent, onSaveDocument, flashNotice]);

  const saveLetterheadAsDefault = useCallback(() => {
    const brandWithFont = {
      ...brand,
      font: font || brand.font || "Inter",
      accent: accent || brand.accent || "#ea580c",
      letterhead: {
        ...(brand.letterhead || {}),
        fontFamily: font || brand.letterhead?.fontFamily || "Inter",
      },
    };
    saveCorporateLetterheadDefault(brandWithFont);
    saveDocumentChanges();
    flashNotice("✓ Official Letterhead design locked & saved as permanent CRM default!");
  }, [brand, font, accent, saveDocumentChanges, flashNotice]);

  const saveTemplate = useCallback(() => {
    try {
      const templates = JSON.parse(
        localStorage.getItem("texweb_document_templates") || "[]"
      );
      const brandWithFont = {
        ...brand,
        font: font || brand.font || "Inter",
        accent: accent || brand.accent || "#ea580c",
        letterhead: {
          ...(brand.letterhead || {}),
          fontFamily: font || brand.letterhead?.fontFamily || "Inter",
        },
      };
      const payload = {
        id: `template-${Date.now()}`,
        title: draftDoc.title || title,
        kind: getDocumentKind(draftDoc),
        templateMode,
        brand: brandWithFont,
        font,
        accent,
        sections,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(
        "texweb_document_templates",
        JSON.stringify([payload, ...templates].slice(0, 30))
      );
      flashNotice("Template saved to library.");
    } catch {
      flashNotice("Failed to save template.");
    }
  }, [draftDoc, title, templateMode, brand, font, accent, sections, flashNotice]);

  const copyShareLink = useCallback(async () => {
    const url = `${window.location.origin}/crm/quotation?document=${draftDoc.id || ""}`;
    try {
      await navigator.clipboard?.writeText(url);
      flashNotice("Share link copied to clipboard!");
    } catch {
      flashNotice(url);
    }
  }, [draftDoc.id, flashNotice]);

  const shiftBlockToPage = useCallback(
    (blockId, targetPage) => {
      if (!blockId || targetPage < 1) return;
      pushHistory();
      setSections((prev) =>
        prev.map((item) =>
          item.id === blockId ? { ...item, page: targetPage } : item
        )
      );
      setCurrentPage(targetPage);
      flashNotice(`✓ Shifted block to Page ${targetPage}`);
    },
    [pushHistory, flashNotice]
  );

  const autoShiftPage = useCallback(
    (pageToShift) => {
      pushHistory();
      setSections((prev) => {
        let currentH = 0;
        const targetNext = pageToShift + 1;
        return prev.map((item) => {
          if (Number(item.page || 1) !== pageToShift) return item;
          const est = estimateBlockHeight(item);
          currentH += est;
          if (currentH > 940) {
            return { ...item, page: targetNext };
          }
          return item;
        });
      });
      flashNotice(`✓ Overflowing content shifted to Page ${pageToShift + 1}`);
    },
    [pushHistory, flashNotice]
  );

  const autoPaginateAll = useCallback(() => {
    pushHistory();
    setSections((prev) => autoPaginateBlocks(prev, 940));
    flashNotice("✓ All pages auto-balanced & paginated cleanly!");
  }, [pushHistory, flashNotice]);

  const applyAiDraft = useCallback(
    (draft = {}, mode = "replace") => {
      pushHistory();
      setDraftDoc((prev) => ({
        ...prev,
        title: draft.title || prev.title,
        scope_of_work: draft.scope_of_work || prev.scope_of_work,
        deliverables: draft.deliverables || prev.deliverables,
        commercial_terms: draft.commercial_terms || prev.commercial_terms,
      }));

      let rawBlocks = [];
      if (Array.isArray(draft.blocks) && draft.blocks.length > 0) {
        rawBlocks = draft.blocks.map((b) => ({
          ...b,
          id: b.id || createBlockId(),
          page: b.page ? Number(b.page) : currentPage,
        }));
      } else {
        rawBlocks = buildDocumentSections(
          { ...draftDoc, ...draft },
          getDocumentKind(draftDoc)
        );
      }

      if (mode === "append") {
        setSections((prev) =>
          autoPaginateBlocks(
            normalizeDocumentBlocks([...prev, ...rawBlocks]),
            940
          )
        );
        flashNotice("✓ AI content added to page & auto-paginated!");
      } else {
        setSections(
          autoPaginateBlocks(
            normalizeDocumentBlocks(rawBlocks),
            940
          )
        );
        flashNotice("✓ Full AI document generated & auto-paginated!");
      }
    },
    [draftDoc, currentPage, pushHistory, flashNotice]
  );

  const handleSetTemplateMode = useCallback((mode) => {
    setTemplateMode(mode);
    if (mode === "letterhead") {
      const defaultB = getDefaultBrand();
      setBrand((prev) => ({
        ...prev,
        ...defaultB,
        letterhead: deepMergeLetterhead(defaultB.letterhead, prev?.letterhead || {}),
      }));
    }
  }, []);

  return {
    templateMode,
    setTemplateMode: handleSetTemplateMode,
    draftDoc,
    setDraftDoc,
    updateDraftDoc,
    brand,
    setBrand,
    updateBrand,
    sections,
    setSections,
    updateSection,
    selectedBlockId,
    setSelectedBlockId,
    currentPage,
    setCurrentPage,
    pageCount,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    font,
    setFont,
    accent,
    setAccent,
    activePanel,
    setActivePanel,
    history,
    future,
    undo,
    redo,
    notice,
    flashNotice,
    title,
    status,
    clientInfo,
    addBlock,
    removeBlock,
    moveBlock,
    reorderBlocks,
    duplicateBlock,
    addPage,
    removeCurrentPage,
    navigateToPage,
    saveDocumentChanges,
    saveLetterheadAsDefault,
    saveTemplate,
    copyShareLink,
    applyAiDraft,
    shiftBlockToPage,
    autoShiftPage,
    autoPaginateAll,
  };
}

function getEditorStorageKey(doc = {}) {
  return `texweb_document_editor:${doc.id || doc.quotation_number || doc.agreement_number || "draft"}`;
}

function loadStoredEditorState(doc = {}) {
  if (typeof window === "undefined" || !doc) return null;
  try {
    const value = localStorage.getItem(getEditorStorageKey(doc));
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
