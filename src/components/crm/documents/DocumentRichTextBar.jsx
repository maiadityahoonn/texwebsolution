"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Palette,
  Strikethrough,
  Underline,
  X,
} from "lucide-react";

const KEY_MAP = {
  "letterhead-logo": "logo",
  "letterhead-tagline": "tagline",
  "letterhead-divider": "divider",
  "letterhead-footer-divider": "footerDivider",
  "letterhead-footer-topline": "footerTopLine",
  "letterhead-contact": "contact",
  "letterhead-watermark": "watermark",
  "letterhead-footer-company": "footerCompany",
  "letterhead-footer-services": "footerServices",
};

const SIZE_MAP = {
  "1": 10,
  "2": 12,
  "3": 14,
  "4": 16,
  "5": 18,
  "6": 24,
  "7": 32,
};

const QUICK_COLORS = [
  { label: "Dark", value: "#0f172a" },
  { label: "Slate", value: "#475569" },
  { label: "Orange", value: "#ea580c" },
  { label: "Blue", value: "#2563eb" },
  { label: "Green", value: "#16a34a" },
  { label: "Red", value: "#dc2626" },
];

const QUICK_HIGHLIGHTS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
];

/**
 * Rich Text & Element Formatting Toolbar (MS Word / Canva Style)
 * Fully interactive for selected blocks and letterhead elements.
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
  const selectedBlock = sections.find((s) => s.id === selectedBlockId);

  function getActiveStyle(property) {
    if (!selectedBlockId) return null;
    if (selectedBlockId.startsWith("letterhead-")) {
      const key = KEY_MAP[selectedBlockId] || selectedBlockId.replace("letterhead-", "");
      return brand.letterhead?.[key]?.[property];
    }
    return selectedBlock?.[property];
  }

  function applyStyleToSelection(styleUpdates) {
    if (!selectedBlockId) {
      if (styleUpdates.fontFamily) {
        setFont?.(styleUpdates.fontFamily);
        updateBrand?.({
          font: styleUpdates.fontFamily,
          letterhead: {
            ...(brand.letterhead || {}),
            fontFamily: styleUpdates.fontFamily,
          },
        });
      }
      return;
    }

    if (selectedBlockId.startsWith("letterhead-")) {
      const key = KEY_MAP[selectedBlockId] || selectedBlockId.replace("letterhead-", "");
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

  // --- Font Size calculation & handler ---
  function getCurrentSizeOption() {
    const raw = getActiveStyle("fontSize");
    if (raw) {
      const num = Number(raw);
      if (num <= 11) return "1";
      if (num <= 13) return "2";
      if (num <= 15) return "3";
      if (num <= 17) return "4";
      if (num <= 20) return "5";
      if (num <= 28) return "6";
      return "7";
    }
    if (selectedBlock?.type === "heading") return "6";
    if (selectedBlock?.type === "box") return "2";
    return "3";
  }

  function handleFontSizeChange(e) {
    const val = e.target.value;
    const px = SIZE_MAP[val] || 14;
    applyStyleToSelection({ fontSize: px });
  }

  // --- Font Family handler ---
  function handleFontFamilyChange(e) {
    const val = e.target.value;
    setFont?.(val);
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

  // --- Bold ---
  const currentWeight = getActiveStyle("fontWeight");
  const isHeading = selectedBlock?.type === "heading";
  const isCurrentBold = currentWeight
    ? currentWeight === "bold" || Number(currentWeight) >= 700
    : isHeading;

  function handleToggleBold(e) {
    e.preventDefault();
    if (!selectedBlockId) return;
    applyStyleToSelection({ fontWeight: isCurrentBold ? "normal" : "bold" });
  }

  // --- Italic ---
  const isCurrentItalic = getActiveStyle("fontStyle") === "italic";

  function handleToggleItalic(e) {
    e.preventDefault();
    if (!selectedBlockId) return;
    applyStyleToSelection({ fontStyle: isCurrentItalic ? "normal" : "italic" });
  }

  // --- Underline & Strike ---
  const currentDecoration = getActiveStyle("textDecoration") || "";
  const isCurrentUnderline = currentDecoration.includes("underline");
  const isCurrentStrike = currentDecoration.includes("line-through");

  function handleToggleUnderline(e) {
    e.preventDefault();
    if (!selectedBlockId) return;
    if (isCurrentUnderline) {
      const next = currentDecoration.replace("underline", "").trim() || "none";
      applyStyleToSelection({ textDecoration: next });
    } else {
      const next =
        currentDecoration === "none" || !currentDecoration
          ? "underline"
          : `${currentDecoration} underline`.trim();
      applyStyleToSelection({ textDecoration: next });
    }
  }

  function handleToggleStrike(e) {
    e.preventDefault();
    if (!selectedBlockId) return;
    if (isCurrentStrike) {
      const next = currentDecoration.replace("line-through", "").trim() || "none";
      applyStyleToSelection({ textDecoration: next });
    } else {
      const next =
        currentDecoration === "none" || !currentDecoration
          ? "line-through"
          : `${currentDecoration} line-through`.trim();
      applyStyleToSelection({ textDecoration: next });
    }
  }

  // --- Alignment ---
  const currentAlign = getActiveStyle("textAlign") || "left";

  function handleAlign(e, align) {
    e.preventDefault();
    if (!selectedBlockId) return;
    applyStyleToSelection({ textAlign: align });
  }

  // --- Lists ---
  function handleToggleBulletList(e) {
    e.preventDefault();
    if (!selectedBlockId) return;
    const block = sections.find((s) => s.id === selectedBlockId);
    if (!block) return;

    const raw = block.body || block.text || "";
    if (!raw.trim()) return;

    const lines = raw.split("\n");
    const allBulleted = lines.every(
      (l) => !l.trim() || l.trim().startsWith("• ") || l.trim().startsWith("- ")
    );

    let updated = "";
    if (allBulleted) {
      updated = lines
        .map((l) => l.replace(/^(\s*)(•\s*|-\s*)/, "$1"))
        .join("\n");
    } else {
      updated = lines
        .map((l) => {
          if (!l.trim()) return l;
          const cleaned = l.replace(/^(\s*)(•\s*|-\s*|\d+\.\s*)/, "");
          return `• ${cleaned.trim()}`;
        })
        .join("\n");
    }
    applyStyleToSelection({ body: updated, text: updated });
  }

  function handleToggleNumberedList(e) {
    e.preventDefault();
    if (!selectedBlockId) return;
    const block = sections.find((s) => s.id === selectedBlockId);
    if (!block) return;

    const raw = block.body || block.text || "";
    if (!raw.trim()) return;

    const lines = raw.split("\n");
    const allNumbered = lines.every((l) => !l.trim() || /^\d+\.\s*/.test(l.trim()));

    let updated = "";
    if (allNumbered) {
      updated = lines
        .map((l) => l.replace(/^(\s*)\d+\.\s*/, "$1"))
        .join("\n");
    } else {
      let counter = 1;
      updated = lines
        .map((l) => {
          if (!l.trim()) return l;
          const cleaned = l.replace(/^(\s*)(•\s*|-\s*|\d+\.\s*)/, "");
          const res = `${counter}. ${cleaned.trim()}`;
          counter += 1;
          return res;
        })
        .join("\n");
    }
    applyStyleToSelection({ body: updated, text: updated });
  }

  // --- Colors ---
  const currentColor =
    getActiveStyle("color") ||
    (selectedBlock?.type === "heading" ? "#0f172a" : "#1e293b");
  const currentBgColor = getActiveStyle("backgroundColor") || "";

  function handleColorChange(val) {
    if (selectedBlockId) {
      applyStyleToSelection({ color: val });
    } else {
      setAccent?.(val);
      updateBrand?.({ accent: val });
    }
  }

  function handleBgColorChange(val) {
    if (selectedBlockId) {
      applyStyleToSelection({ backgroundColor: val });
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="h-9 bg-gray-50/95 dark:bg-[#14110c] border-b border-gray-200 dark:border-[#3a3020] flex items-center gap-1.5 px-3 overflow-x-auto print:hidden text-xs z-20 shadow-2xs select-none"
    >
      {/* 1. Font Family selector */}
      <select
        value={getActiveStyle("fontFamily") || font || "Inter"}
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

      {/* 2. Font Size selector */}
      <select
        value={getCurrentSizeOption()}
        onChange={handleFontSizeChange}
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

      {/* 3. Bold (B) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleBold}
        className={`p-1 rounded font-black cursor-pointer transition ${
          isCurrentBold
            ? "bg-orange-500 text-white shadow-2xs"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white"
        }`}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* 4. Italic (I) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleItalic}
        className={`p-1 rounded cursor-pointer transition ${
          isCurrentItalic
            ? "bg-orange-500 text-white shadow-2xs"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white"
        }`}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* 5. Underline (U) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleUnderline}
        className={`p-1 rounded cursor-pointer transition ${
          isCurrentUnderline
            ? "bg-orange-500 text-white shadow-2xs"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white"
        }`}
        title="Underline"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      {/* 6. Strikethrough (S) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleStrike}
        className={`p-1 rounded cursor-pointer transition ${
          isCurrentStrike
            ? "bg-orange-500 text-white shadow-2xs"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-gray-200 dark:bg-[#3a3020] mx-0.5" />

      {/* 7. Text Alignments (Left / Center / Right / Justify) */}
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

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleAlign(e, "justify")}
        className={`p-1 rounded cursor-pointer transition ${
          currentAlign === "justify"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 font-bold"
            : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-white"
        }`}
        title="Justify Text"
      >
        <AlignJustify className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-gray-200 dark:bg-[#3a3020] mx-0.5" />

      {/* 8. Lists (Bullet List & Numbered List) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleBulletList}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer text-gray-700 dark:text-white transition"
        title="Toggle Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleNumberedList}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer text-gray-700 dark:text-white transition"
        title="Toggle Numbered List"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-gray-200 dark:bg-[#3a3020] mx-0.5" />

      {/* 9. Text Color Palette + Swatches */}
      <div className="flex items-center gap-1">
        <label className="flex items-center gap-1 cursor-pointer" title="Custom Text Color">
          <Palette className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <div className="hidden sm:flex items-center gap-0.5">
          {QUICK_COLORS.slice(0, 4).map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => handleColorChange(c.value)}
              className="w-3 h-3 rounded-full border border-gray-300 dark:border-slate-600 cursor-pointer transition hover:scale-125"
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* 10. Background / Highlight Color */}
      <div className="flex items-center gap-1 ml-1">
        <label className="flex items-center gap-1 cursor-pointer" title="Highlight / Background Color">
          <Highlighter className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          <input
            type="color"
            value={currentBgColor || "#fef08a"}
            onChange={(e) => handleBgColorChange(e.target.value)}
            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <div className="hidden sm:flex items-center gap-0.5">
          {QUICK_HIGHLIGHTS.map((h) => (
            <button
              key={h.value}
              type="button"
              onClick={() => handleBgColorChange(h.value)}
              className="w-3 h-3 rounded-full border border-gray-300 dark:border-slate-600 cursor-pointer transition hover:scale-125"
              style={{ backgroundColor: h.value }}
              title={h.label}
            />
          ))}
          {currentBgColor && (
            <button
              type="button"
              onClick={() => handleBgColorChange("")}
              className="p-0.5 text-gray-400 hover:text-red-500 rounded cursor-pointer"
              title="Remove Highlight"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {selectedBlockId ? (
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900/50">
          <span>Active: {selectedBlockId.replace("letterhead-", "")}</span>
        </div>
      ) : (
        <div className="ml-auto hidden md:flex items-center text-[10px] text-gray-400 font-medium">
          <span>Click any block to format</span>
        </div>
      )}
    </div>
  );
}
