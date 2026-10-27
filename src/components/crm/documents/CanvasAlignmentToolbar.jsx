"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  RotateCcw,
  Upload,
  Trash2,
  Palette,
  Minus,
  Plus,
} from "lucide-react";

/**
 * Canva-style floating alignment & transform toolbar.
 * Appears directly above/near the selected canvas element, divider, or block.
 * Allows instant alignment (Left, Center, Right), position reset,
 * and quick adjustments like:
 * - Line length / height, thickness / width, and color
 * - Watermark opacity
 * - Image replacement
 * - Element deletion / removal
 */
export default function CanvasAlignmentToolbar({
  blockId = "",
  elementTitle = "Element",
  isHorizontal = false,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onResetPosition,
  watermarkOpacity,
  onChangeOpacity,
  onUploadImage,
  isText = false,
  isEditingText = false,
  onToggleEditText,
  lineColor,
  onChangeLineColor,
  lineWidth,
  onChangeLineWidth,
  lineHeight,
  onChangeLineHeight,
  onDeleteElement,
}) {
  return (
    <div
      data-canvas-alignment-toolbar="true"
      onClick={(e) => e.stopPropagation()}
      className="absolute -top-11 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1 bg-slate-900/95 text-white rounded-lg shadow-2xl border border-slate-700/80 backdrop-blur-md text-[11px] font-medium pointer-events-auto select-none print:hidden pdf-hide-on-export animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Title badge */}
      <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400 border-r border-slate-700 pr-1.5 mr-0.5">
        {elementTitle}
      </span>

      {/* Align Left Button */}
      {onAlignLeft && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAlignLeft();
          }}
          className="p-1 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-1"
          title="Canva Align Left (snap to left margin)"
        >
          <AlignLeft className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline text-[9.5px]">Left</span>
        </button>
      )}

      {/* Align Center Button */}
      {onAlignCenter && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAlignCenter();
          }}
          className="p-1 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-1"
          title="Canva Align Center (snap to page center)"
        >
          <AlignCenter className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline text-[9.5px]">Center</span>
        </button>
      )}

      {/* Align Right Button */}
      {onAlignRight && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAlignRight();
          }}
          className="p-1 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-1"
          title="Canva Align Right (snap to right margin)"
        >
          <AlignRight className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline text-[9.5px]">Right</span>
        </button>
      )}

      {/* Divider / Line Controls (Color, Thickness, Length) */}
      {onChangeLineColor && (
        <div className="flex items-center gap-1.5 px-1 border-l border-slate-700 ml-0.5">
          {/* Color Picker & Quick Swatches */}
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-1 cursor-pointer" title="Custom line color">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              <input
                type="color"
                value={lineColor || "#e2e8f0"}
                onChange={(e) => onChangeLineColor(e.target.value)}
                className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
              />
            </label>
            {/* Quick Palette Swatches */}
            {[
              { color: "#e2e8f0", title: "Subtle Gray" },
              { color: "#334155", title: "Slate 700" },
              { color: "#D3151D", title: "TexWeb Red" },
              { color: "#0F172A", title: "Navy Slate" },
              { color: "#F97316", title: "Orange" },
              { color: "#2563EB", title: "Blue" },
              { color: "#ffffff", title: "White" },
            ].map((swatch) => (
              <button
                key={swatch.color}
                type="button"
                onClick={() => onChangeLineColor(swatch.color)}
                style={{ backgroundColor: swatch.color }}
                className={`w-3 h-3 rounded-full border cursor-pointer transition ${
                  lineColor === swatch.color ? "ring-1 ring-white scale-110 border-white" : "border-slate-600 hover:scale-110"
                }`}
                title={swatch.title}
              />
            ))}
          </div>

          {/* Thickness adjuster */}
          {(isHorizontal
            ? typeof lineHeight === "number" && onChangeLineHeight
            : typeof lineWidth === "number" && onChangeLineWidth) && (
            <div className="flex items-center gap-0.5 bg-slate-800/80 px-1 py-0.5 rounded">
              <span className="text-[9px] text-slate-400">Thick:</span>
              <button
                type="button"
                onClick={() =>
                  isHorizontal
                    ? onChangeLineHeight(Math.max(1, lineHeight - 1))
                    : onChangeLineWidth(Math.max(1, lineWidth - 1))
                }
                className="w-3.5 h-3.5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-[10px]"
                title="Decrease thickness"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-[9.5px] font-mono text-orange-300 w-4 text-center">
                {isHorizontal ? lineHeight : lineWidth}px
              </span>
              <button
                type="button"
                onClick={() =>
                  isHorizontal
                    ? onChangeLineHeight(Math.min(20, lineHeight + 1))
                    : onChangeLineWidth(Math.min(20, lineWidth + 1))
                }
                className="w-3.5 h-3.5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-[10px]"
                title="Increase thickness"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Length adjuster */}
          {(isHorizontal
            ? typeof lineWidth === "number" && onChangeLineWidth
            : typeof lineHeight === "number" && onChangeLineHeight) && (
            <div className="flex items-center gap-0.5 bg-slate-800/80 px-1 py-0.5 rounded">
              <span className="text-[9px] text-slate-400">Length:</span>
              <button
                type="button"
                onClick={() =>
                  isHorizontal
                    ? onChangeLineWidth(Math.max(50, lineWidth - 20))
                    : onChangeLineHeight(Math.max(6, lineHeight - 10))
                }
                className="w-3.5 h-3.5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-[10px]"
                title="Decrease length"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-[9.5px] font-mono text-orange-300 min-w-7 text-center">
                {isHorizontal ? lineWidth : lineHeight}px
              </span>
              <button
                type="button"
                onClick={() =>
                  isHorizontal
                    ? onChangeLineWidth(Math.min(794, lineWidth + 20))
                    : onChangeLineHeight(Math.min(400, lineHeight + 10))
                }
                className="w-3.5 h-3.5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-[10px]"
                title="Increase length"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Watermark opacity adjuster */}
      {typeof watermarkOpacity === "number" && onChangeOpacity && (
        <div className="flex items-center gap-1 px-1 bg-slate-800/80 rounded border-l border-slate-700 ml-0.5">
          <span className="text-[9px] text-slate-400">Opacity:</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangeOpacity(Math.max(0.05, Number((watermarkOpacity - 0.05).toFixed(2))));
            }}
            className="w-4 h-4 rounded bg-slate-700 hover:bg-slate-600 text-center leading-none text-xs font-bold"
            title="Decrease opacity"
          >
            -
          </button>
          <span className="text-[10px] font-mono text-orange-300 w-7 text-center">
            {Math.round(watermarkOpacity * 100)}%
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangeOpacity(Math.min(1, Number((watermarkOpacity + 0.05).toFixed(2))));
            }}
            className="w-4 h-4 rounded bg-slate-700 hover:bg-slate-600 text-center leading-none text-xs font-bold"
            title="Increase opacity"
          >
            +
          </button>
        </div>
      )}

      {/* Upload image for logo or icon */}
      {onUploadImage && (
        <label
          className="p-1 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-1 border-l border-slate-700 ml-0.5"
          title="Upload / Change Image"
          onClick={(e) => e.stopPropagation()}
        >
          <Upload className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[9.5px]">Replace</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadImage(file);
                e.target.value = "";
              }
            }}
          />
        </label>
      )}

      {/* Text edit toggle */}
      {isText && onToggleEditText && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleEditText();
          }}
          className={`p-1 rounded transition cursor-pointer flex items-center gap-1 ${
            isEditingText ? "bg-orange-600 text-white" : "hover:bg-slate-800 text-slate-200"
          }`}
          title="Toggle inline text edit mode"
        >
          <span className="text-[9.5px]">
            {isEditingText ? "Done" : "Edit"}
          </span>
        </button>
      )}

      {/* Delete button (for divider or optional elements) */}
      {onDeleteElement && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteElement();
          }}
          className="p-1 rounded hover:bg-red-900/60 text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
          title="Delete / Remove Divider"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-[9.5px]">Delete</span>
        </button>
      )}

      {/* Reset position button */}
      {onResetPosition && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onResetPosition();
          }}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 border-l border-slate-700 ml-0.5"
          title="Reset back to default position"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span className="text-[9.5px]">Reset</span>
        </button>
      )}
    </div>
  );
}
