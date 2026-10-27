"use client";

import { Plus } from "lucide-react";
import LetterheadElementWrapper from "./LetterheadElementWrapper";

/**
 * Interactive, Fully Editable Header Divider Line
 * - Selectable with Canva orange bounding box
 * - Comfortable hit area for effortless clicking
 * - Drag to reposition anywhere (dx, dy)
 * - Resize handles to adjust length/height and thickness/width
 * - Floating toolbar with color presets, thickness, length, and delete
 * - Re-add / restore button if deleted
 */
export default function LetterheadDividerLine({
  id = "letterhead-divider",
  elementTitle = "Divider Line",
  dividerConfig = {},
  updateDivider = () => {},
  selectedBlockId = "",
  setSelectedBlockId = () => {},
  startMove,
  startResize,
  startRotate,
  zoom = 1,
  defaultWidth = 1,
  defaultHeight = 54,
  defaultColor = "#e2e8f0",
  minHeight = 6,
  maxHeight = 300,
  minWidth = 1,
  maxWidth = 20,
  addLabel = "+ Add Divider Line",
  className = "self-center mx-2 shrink-0 flex items-center justify-center pointer-events-auto",
}) {
  const isVisible = dividerConfig.visible !== false;
  const lineWidth = Number(dividerConfig.width) || defaultWidth;
  const lineHeight = Number(dividerConfig.height) || defaultHeight;
  const lineColor = dividerConfig.color || defaultColor;
  const lineStyle = dividerConfig.lineStyle || "solid"; // solid, dashed, dotted

  if (!isVisible) {
    return (
      <div className="self-center mx-2 print:hidden pdf-hide-on-export">
        <button
          type="button"
          onClick={() =>
            updateDivider({
              visible: true,
              width: defaultWidth,
              height: defaultHeight,
              color: defaultColor,
              lineStyle: "solid",
              dx: 0,
              dy: 0,
            })
          }
          className="px-2.5 py-1 rounded-md border border-dashed border-gray-300 hover:border-orange-500 bg-white/80 hover:bg-orange-50 text-[10px] font-bold text-gray-600 hover:text-orange-600 shadow-2xs transition flex items-center gap-1.5 cursor-pointer pointer-events-auto"
          title={`Restore / Add ${elementTitle}`}
        >
          <Plus className="w-3 h-3 text-orange-500" />
          <span>{addLabel}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <LetterheadElementWrapper
        id={id}
        elementTitle={elementTitle}
        transformData={{
          dx: dividerConfig.dx || 0,
          dy: dividerConfig.dy || 0,
          width: Math.max(16, lineWidth + 12),
          height: lineHeight,
          rotation: dividerConfig.rotation || 0,
        }}
        isSelected={selectedBlockId === id}
        onSelect={() => setSelectedBlockId(id)}
        onUpdate={(updates) => updateDivider(updates)}
        startMove={startMove}
        startResize={startResize}
        startRotate={startRotate}
        zoom={zoom}
        lineColor={lineColor}
        onChangeLineColor={(c) => updateDivider({ color: c })}
        lineWidth={lineWidth}
        onChangeLineWidth={(w) => updateDivider({ width: Math.max(minWidth, Math.min(maxWidth, w)) })}
        lineHeight={lineHeight}
        onChangeLineHeight={(h) => updateDivider({ height: Math.max(minHeight, Math.min(maxHeight, h)) })}
        onDeleteElement={() => updateDivider({ visible: false })}
        className="px-2 py-0.5 flex items-center justify-center cursor-pointer"
        style={{
          minWidth: "16px",
        }}
      >
        <div
          className="rounded-full shadow-2xs transition-colors pointer-events-none"
          style={{
            width: `${lineWidth}px`,
            height: `${lineHeight}px`,
            backgroundColor: lineColor,
            borderStyle: lineStyle,
          }}
          title={`${elementTitle} (${lineWidth}px × ${lineHeight}px)`}
        />
      </LetterheadElementWrapper>
    </div>
  );
}
