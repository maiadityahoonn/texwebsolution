"use client";

import { Plus } from "lucide-react";
import LetterheadElementWrapper from "./LetterheadElementWrapper";

/**
 * Interactive, Fully Editable Footer Top Accent Line
 * - Exact vector replica of official TexWeb Corporate Letterhead's top red edge line
 * - Selectable with Canva orange bounding box
 * - Drag to reposition anywhere (dx, dy)
 * - Resize handles to adjust length/height and thickness
 * - Floating toolbar with color presets, thickness, length, and delete
 * - Re-add / restore button if deleted
 */
export default function LetterheadFooterTopLine({
  footerTopLineConfig = {},
  updateFooterTopLine = () => {},
  selectedBlockId = "",
  setSelectedBlockId = () => {},
  startMove,
  startResize,
  startRotate,
  zoom = 1,
}) {
  const isVisible = footerTopLineConfig.visible !== false;
  const lineThickness = Number(footerTopLineConfig.height) || 2;
  const lineWidth = Number(footerTopLineConfig.width) || 794;
  const lineColor = footerTopLineConfig.color || "#D3151D";

  if (!isVisible) {
    return (
      <div className="absolute top-0 right-4 z-30 print:hidden pdf-hide-on-export">
        <button
          type="button"
          onClick={() =>
            updateFooterTopLine({
              visible: true,
              height: 2,
              width: 794,
              color: "#D3151D",
              dx: 0,
              dy: 0,
            })
          }
          className="px-2 py-0.5 rounded-md border border-dashed border-red-400 hover:border-red-500 bg-slate-900/90 hover:bg-slate-800 text-[9px] font-bold text-red-400 hover:text-red-300 shadow-2xs transition flex items-center gap-1 cursor-pointer pointer-events-auto"
          title="Restore / Add Footer Top Accent Line"
        >
          <Plus className="w-2.5 h-2.5 text-red-400" />
          <span>+ Add Footer Top Line</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-[8px] left-0 right-0 z-20 flex items-center justify-center pointer-events-auto overflow-visible">
      <LetterheadElementWrapper
        id="letterhead-footer-topline"
        elementTitle="Footer Top Line"
        isHorizontal={true}
        transformData={{
          dx: footerTopLineConfig.dx || 0,
          dy: footerTopLineConfig.dy || 0,
          width: lineWidth,
          height: Math.max(10, lineThickness + 8),
          rotation: footerTopLineConfig.rotation || 0,
        }}
        isSelected={selectedBlockId === "letterhead-footer-topline"}
        onSelect={() => setSelectedBlockId("letterhead-footer-topline")}
        onUpdate={(updates) => updateFooterTopLine(updates)}
        startMove={startMove}
        startResize={startResize}
        startRotate={startRotate}
        zoom={zoom}
        lineColor={lineColor}
        onChangeLineColor={(c) => updateFooterTopLine({ color: c })}
        lineWidth={lineWidth}
        onChangeLineWidth={(w) =>
          updateFooterTopLine({ width: Math.max(50, Math.min(794, w)) })
        }
        lineHeight={lineThickness}
        onChangeLineHeight={(h) =>
          updateFooterTopLine({ height: Math.max(1, Math.min(20, h)) })
        }
        onDeleteElement={() => updateFooterTopLine({ visible: false })}
        className="w-full flex items-center justify-center cursor-pointer py-1"
        style={{
          width: `${lineWidth}px`,
          maxWidth: "100%",
        }}
      >
        <div
          className="w-full transition-colors pointer-events-none"
          style={{
            height: `${lineThickness}px`,
            backgroundColor: lineColor,
          }}
          title={`Footer Top Line (${lineWidth}px × ${lineThickness}px)`}
        />
      </LetterheadElementWrapper>
    </div>
  );
}
