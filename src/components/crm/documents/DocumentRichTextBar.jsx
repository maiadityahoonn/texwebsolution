"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Palette,
  Strikethrough,
  Underline,
} from "lucide-react";

/**
 * Rich Text & Element Formatting Toolbar (MS Word / Canva Style)
 * Formats:
 * 1. Active cursor/text selection within inputs / contenteditables
 * 2. Currently selected element (letterhead elements or document blocks)
 */
export default function DocumentRichTextBar({
  font = "Inter",
  setFont = () => {},
  accent = "#ea580c",
  setAccent = () => {},
  selectedBlockId = "",
  sections = [],
  updateSection = () => {},
  brand = {},
  updateBrand = () => {},
}) {
  function applyCommand(cmd, val = null) {
    if (typeof document !== "undefined") {
      try {
        document.execCommand(cmd, false, val);
      } catch (err) {
        // Silently continue if execCommand not supported for current target
      }
    }
  }

  function getActiveStyle(property) {
    if (!selectedBlockId) return null;
    if (selectedBlockId.startsWith("letterhead-")) {
      const keyMap = {
        "letterhead-logo": "logo",
        "letterhead-tagline": "tagline",
        "letterhead-divider": "divider",
        "letterhead-contact": "contact",
        "letterhead-watermark": "watermark",
        "letterhead-footer-company": "footerCompany",
        "letterhead-footer-services": "footerServices",
      };
      const key = keyMap[selectedBlockId] || selectedBlockId.replace("letterhead-", "");
      return brand.letterhead?.[key]?.[property];
    }
    const block = sections.find((s) => s.id === selectedBlockId);
    return block?.[property];
  }

  function applyStyleToSelection(styleUpdates) {
    if (!selectedBlockId) return;
    if (selectedBlockId.startsWith("letterhead-")) {
      const keyMap = {
        "letterhead-logo": "logo",
        "letterhead-tagline": "tagline",
        "letterhead-divider": "divider",
        "letterhead-contact": "contact",
        "letterhead-watermark": "watermark",
        "letterhead-footer-company": "footerCompany",
        "letterhead-footer-services": "footerServices",
      };
      const key = keyMap[selectedBlockId] || selectedBlockId.replace("letterhead-", "");
      updateBrand?.({
        letterhead: {
          ...(brand.letterhead || {}),
          [key]: {
            ...(brand.letterhead?.[key] || {}),
            ...styleUpdates,
          },
        },
      });
    } else {
      updateSection?.(selectedBlockId, styleUpdates);
    }
  }

  function handleToggleBold(e) {
    e.preventDefault();
    applyCommand("bold");
    if (selectedBlockId) {
      const current = getActiveStyle("fontWeight");
      const isBold = current === "bold" || Number(current) >= 700;
      applyStyleToSelection({ fontWeight: isBold ? "normal" : "bold" });
    }
  }

  function handleToggleItalic(e) {
    e.preventDefault();
    applyCommand("italic");
    if (selectedBlockId) {
      const current = getActiveStyle("fontStyle");
      applyStyleToSelection({ fontStyle: current === "italic" ? "normal" : "italic" });
    }
  }

  function handleToggleUnderline(e) {
    e.preventDefault();
    applyCommand("underline");
    if (selectedBlockId) {
      const current = getActiveStyle("textDecoration");
      applyStyleToSelection({ textDecoration: current === "underline" ? "none" : "underline" });
    }
  }

  function handleToggleStrike(e) {
    e.preventDefault();
    applyCommand("strikeThrough");
    if (selectedBlockId) {
      const current = getActiveStyle("textDecoration");
      applyStyleToSelection({ textDecoration: current === "line-through" ? "none" : "line-through" });
    }
  }

  function handleFontSizeChange(e) {
    const val = e.target.value;
    applyCommand("fontSize", val);
    const sizeMap = {
      "1": 10,
      "2": 12,
      "3": 14,
      "4": 16,
      "5": 18,
      "6": 24,
      "7": 32,
    };
    if (selectedBlockId) {
      const px = sizeMap[val] || 14;
      applyStyleToSelection({ fontSize: px });
    }
  }

  function handleFontFamilyChange(e) {
    const val = e.target.value;
    setFont(val);
    applyCommand("fontName", val);
    updateBrand?.({
      font: val,
      letterhead: {
        ...(brand.letterhead || {}),
        fontFamily: val,
      },
    });
    if (selectedBlockId) {
      applyStyleToSelection({ fontFamily: val });
    }
  }

  function handleAlign(e, align) {
    e.preventDefault();
    const cmdMap = {
      left: "justifyLeft",
      center: "justifyCenter",
      right: "justifyRight",
    };
    applyCommand(cmdMap[align]);
    if (selectedBlockId) {
      applyStyleToSelection({ textAlign: align });
    }
  }

  function handleColorChange(e) {
    const val = e.target.value;
    setAccent(val);
    applyCommand("foreColor", val);
    updateBrand?.({
      accent: val,
    });
    if (selectedBlockId) {
      applyStyleToSelection({ color: val });
    }
  }

  const isCurrentBold = getActiveStyle("fontWeight") === "bold" || Number(getActiveStyle("fontWeight")) >= 700;
  const isCurrentItalic = getActiveStyle("fontStyle") === "italic";
  const isCurrentUnderline = getActiveStyle("textDecoration") === "underline";
  const isCurrentStrike = getActiveStyle("textDecoration") === "line-through";
  const currentAlign = getActiveStyle("textAlign") || "left";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="h-9 bg-gray-50/95 dark:bg-[#14110c] border-b border-gray-200 dark:border-[#3a3020] flex items-center gap-1 px-4 overflow-x-auto print:hidden text-xs z-20 shadow-2xs select-none"
    >
      {/* Font selector */}
      <select
        value={getActiveStyle("fontFamily") || font}
        onChange={handleFontFamilyChange}
        className="px-2 py-0.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-gray-700 dark:text-neutral-200 cursor-pointer focus:outline-hidden"
        title="Font Family"
      >
        <option value="Inter">Inter (Default Modern)</option>
        <option value="Poppins">Poppins (Clean Geometric)</option>
        <option value="Arial">Arial (Standard)</option>
        <option value="Helvetica">Helvetica (Corporate)</option>
        <option value="Georgia">Georgia (Classic Serif)</option>
        <option value="Times New Roman">Times New Roman (Formal)</option>
        <option value="Verdana">Verdana (Readable)</option>
        <option value="Trebuchet MS">Trebuchet MS (Tech)</option>
        <option value="Courier New">Courier (Monospace)</option>
      </select>

      {/* Font Size */}
      <select
        onChange={handleFontSizeChange}
        defaultValue="3"
        className="px-2 py-0.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-gray-700 dark:text-neutral-200 cursor-pointer focus:outline-hidden"
        title="Font Size"
      >
        <option value="1">Small (10px)</option>
        <option value="2">Normal (12px)</option>
        <option value="3">Regular (14px)</option>
        <option value="4">Medium (16px)</option>
        <option value="5">Large (18px)</option>
        <option value="6">Heading (24px)</option>
        <option value="7">Display (32px)</option>
      </select>

      <div className="h-4 w-px bg-gray-200 dark:bg-[#3a3020] mx-0.5" />

      {/* Bold (Ctrl+B) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleBold}
        className={`p-1 rounded font-black cursor-pointer transition ${
          isCurrentBold
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white"
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* Italic (Ctrl+I) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleItalic}
        className={`p-1 rounded cursor-pointer transition ${
          isCurrentItalic
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white"
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* Underline (Ctrl+U) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleUnderline}
        className={`p-1 rounded cursor-pointer transition ${
          isCurrentUnderline
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white"
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      {/* Strikethrough */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleStrike}
        className={`p-1 rounded cursor-pointer transition ${
          isCurrentStrike
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-gray-200 dark:bg-[#3a3020] mx-0.5" />

      {/* Text Alignments */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleAlign(e, "left")}
        className={`p-1 rounded cursor-pointer transition ${
          currentAlign === "left"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 font-bold"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-white"
        }`}
        title="Align Left"
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleAlign(e, "center")}
        className={`p-1 rounded cursor-pointer transition ${
          currentAlign === "center"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 font-bold"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-white"
        }`}
        title="Align Center"
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleAlign(e, "right")}
        className={`p-1 rounded cursor-pointer transition ${
          currentAlign === "right"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 font-bold"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-white"
        }`}
        title="Align Right"
      >
        <AlignRight className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-gray-200 dark:bg-[#3a3020] mx-0.5" />

      {/* Lists */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applyCommand("insertUnorderedList")}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer text-gray-700 dark:text-white"
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applyCommand("insertOrderedList")}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer text-gray-700 dark:text-white"
        title="Numbered List"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-gray-200 dark:bg-[#3a3020] mx-0.5" />

      {/* Text Color / Highlight */}
      <div className="flex items-center gap-1">
        <label className="flex items-center gap-1 cursor-pointer" title="Text Color">
          <Palette className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          <input
            type="color"
            value={getActiveStyle("color") || accent}
            onChange={handleColorChange}
            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
          />
        </label>
        <label className="flex items-center gap-1 cursor-pointer" title="Highlight Color">
          <Highlighter className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          <input
            type="color"
            defaultValue="#fef08a"
            onChange={(e) => applyCommand("hiliteColor", e.target.value)}
            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
          />
        </label>
      </div>

      {selectedBlockId && (
        <div className="ml-auto flex items-center gap-2 text-[11px] text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900/50">
          <span>Editing: {selectedBlockId.replace("letterhead-", "")}</span>
        </div>
      )}
    </div>
  );
}
