"use client";

export default function CanvasTransformBox({
  isSelected,
  isEditingText,
  onStartMove,
  onStartResize,
  onStartRotate,
  tooltipText,
}) {
  if (!isSelected) return null;

  return (
    <div
      data-canvas-transform="true"
      className="absolute inset-0 pointer-events-none select-none z-30 print:hidden pdf-hide-on-export"
    >
      {/* Orange Boundary Box */}
      <div className="absolute inset-0 border-[1.5px] border-orange-500 rounded-2xs pointer-events-none" />

      {/* 4 Draggable Edge Strips (Top, Bottom, Left, Right edges) */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartMove?.(e);
        }}
        className="absolute -top-1 left-2 right-2 h-2 cursor-move pointer-events-auto"
        title="Drag edge to move element"
      />
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartMove?.(e);
        }}
        className="absolute -bottom-1 left-2 right-2 h-2 cursor-move pointer-events-auto"
        title="Drag edge to move element"
      />
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartMove?.(e);
        }}
        className="absolute top-2 bottom-2 -left-1 w-2 cursor-move pointer-events-auto"
        title="Drag edge to move element"
      />
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartMove?.(e);
        }}
        className="absolute top-2 bottom-2 -right-1 w-2 cursor-move pointer-events-auto"
        title="Drag edge to move element"
      />

      {/* Top Rotation Handle with Stem */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
        <button
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartRotate?.(e);
          }}
          className="w-3.5 h-3.5 rounded-full bg-white border-2 border-orange-500 hover:bg-orange-50 shadow-xs cursor-grab active:cursor-grabbing transition"
          title="Drag to rotate element"
        />
        <div className="w-[1.5px] h-3.5 bg-orange-500" />
      </div>

      {/* 8 Resize Handles (Squares with orange border) */}
      {/* Top-Left */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(e, "nw");
        }}
        className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-orange-500 rounded-2xs cursor-nwse-resize pointer-events-auto hover:bg-orange-500 hover:scale-125 transition"
        title="Resize"
      />
      {/* Top-Center */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(e, "n");
        }}
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-orange-500 rounded-2xs cursor-ns-resize pointer-events-auto hover:bg-orange-500 hover:scale-125 transition"
        title="Resize"
      />
      {/* Top-Right */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(e, "ne");
        }}
        className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-orange-500 rounded-2xs cursor-nesw-resize pointer-events-auto hover:bg-orange-500 hover:scale-125 transition"
        title="Resize"
      />

      {/* Middle-Left */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(e, "w");
        }}
        className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-white border border-orange-500 rounded-2xs cursor-ew-resize pointer-events-auto hover:bg-orange-500 hover:scale-125 transition"
        title="Resize width"
      />
      {/* Middle-Right */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(e, "e");
        }}
        className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-white border border-orange-500 rounded-2xs cursor-ew-resize pointer-events-auto hover:bg-orange-500 hover:scale-125 transition"
        title="Resize width"
      />

      {/* Bottom-Left */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(e, "sw");
        }}
        className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-orange-500 rounded-2xs cursor-nesw-resize pointer-events-auto hover:bg-orange-500 hover:scale-125 transition"
        title="Resize"
      />
      {/* Bottom-Center */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(e, "s");
        }}
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-orange-500 rounded-2xs cursor-ns-resize pointer-events-auto hover:bg-orange-500 hover:scale-125 transition"
        title="Resize height"
      />
      {/* Bottom-Right */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(e, "se");
        }}
        className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-orange-500 rounded-2xs cursor-nwse-resize pointer-events-auto hover:bg-orange-500 hover:scale-125 transition"
        title="Resize"
      />

      {/* Move Area (when not actively editing text) */}
      {!isEditingText && (
        <div
          onMouseDown={onStartMove}
          className="absolute inset-0 cursor-move pointer-events-auto bg-transparent"
          title="Drag with mouse to move anywhere on canvas"
        />
      )}

      {/* Tooltip Badge (Exact match to Clienter screenshot) */}
      <div className="absolute -bottom-7 right-4 pointer-events-none">
        <div className="bg-white border border-gray-900/80 text-gray-900 text-[10px] font-semibold px-2 py-0.5 shadow-sm whitespace-nowrap">
          {tooltipText || (isEditingText ? "Click to select · click again to type" : "Click to type · drag to move")}
        </div>
      </div>
    </div>
  );
}
