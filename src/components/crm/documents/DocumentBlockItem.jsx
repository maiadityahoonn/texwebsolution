"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  GripVertical,
  Trash2,
} from "lucide-react";
import PricingBlockRenderer from "./blocks/PricingBlockRenderer";
import PaymentBlockRenderer from "./blocks/PaymentBlockRenderer";
import CustomTableBlockRenderer from "./blocks/CustomTableBlockRenderer";
import ImageBlockRenderer from "./blocks/ImageBlockRenderer";
import CanvasTransformBox from "./CanvasTransformBox";
import CanvasAlignmentToolbar from "./CanvasAlignmentToolbar";

export default function DocumentBlockItem({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onReorderBlocks,
  onStartMove,
  onStartResize,
  onStartRotate,
  zoom = 1,
  onShiftToPage,
  pageCount = 1,
  font = "Inter",
}) {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const textRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropPlacement, setDropPlacement] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);

  useEffect(() => {
    if (!isSelected) {
      setIsEditingText(false);
    }
  }, [isSelected]);

  // Dynamically auto-shrink / auto-grow textarea height to match EXACT content height
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.style.height = "0px";
      headingRef.current.style.height = `${headingRef.current.scrollHeight}px`;
    }
    if (textRef.current) {
      textRef.current.style.height = "0px";
      textRef.current.style.height = `${textRef.current.scrollHeight}px`;
    }
  }, [
    block.heading,
    block.body,
    block.text,
    block.width,
    block.fontSize,
    block.fontWeight,
    block.fontFamily,
    font,
  ]);

  function getElementRect() {
    if (!containerRef.current) return null;
    const parentCanvas =
      containerRef.current.closest(".a4-sheet-canvas") ||
      containerRef.current.parentElement;
    const canvasRect = parentCanvas?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: 794,
      height: 1123,
    };
    const elemRect = containerRef.current.getBoundingClientRect();
    return {
      x: (elemRect.left - canvasRect.left) / zoom,
      y: (elemRect.top - canvasRect.top) / zoom,
      width: elemRect.width / zoom,
      height: elemRect.height / zoom,
    };
  }

  function handleStartMove(e) {
    const rect = getElementRect();
    onStartMove?.(e, block, rect);
  }

  function handleStartResize(e, handle) {
    const rect = getElementRect();
    onStartResize?.(e, block, handle, rect);
  }

  function handleStartRotate(e) {
    const rect = getElementRect();
    onStartRotate?.(e, block, rect);
  }

  function handleAlignLeft() {
    const rect = getElementRect();
    if (!rect) return;
    const currentDx = Number(block.dx || 0);
    const originX = rect.x - currentDx;
    const targetX = 48; // Left margin
    const newDx = Math.round(targetX - originX);
    onUpdate?.({ dx: newDx });
  }

  function handleAlignCenter() {
    const rect = getElementRect();
    if (!rect) return;
    const currentDx = Number(block.dx || 0);
    const originX = rect.x - currentDx;
    const targetCenterX = 794 / 2;
    const targetLeft = targetCenterX - rect.width / 2;
    const newDx = Math.round(targetLeft - originX);
    onUpdate?.({ dx: newDx });
  }

  function handleAlignRight() {
    const rect = getElementRect();
    if (!rect) return;
    const currentDx = Number(block.dx || 0);
    const originX = rect.x - currentDx;
    const targetRight = 794 - 48;
    const targetLeft = targetRight - rect.width;
    const newDx = Math.round(targetLeft - originX);
    onUpdate?.({ dx: newDx });
  }

  function handleResetPosition() {
    onUpdate?.({ dx: 0, dy: 0, rotation: 0 });
  }

  function handleClick(e) {
    e.stopPropagation();
    onSelect?.();
    setIsEditingText(true);
  }

  function handleDoubleClick(e) {
    e.stopPropagation();
    onSelect?.();
    setIsEditingText(true);
  }

  function handleDragStart(e) {
    e.dataTransfer.setData("application/crm-block-id", block.id);
    e.dataTransfer.setData("text/plain", block.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
    setDropPlacement(null);
  }

  function handleDragOver(e) {
    if (
      e.dataTransfer.types.includes("application/crm-block-id") ||
      e.dataTransfer.types.includes("text/plain")
    ) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const placement = e.clientY < midY ? "before" : "after";
      if (placement !== dropPlacement) {
        setDropPlacement(placement);
      }
    }
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropPlacement(null);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const sourceId =
      e.dataTransfer.getData("application/crm-block-id") ||
      e.dataTransfer.getData("text/plain");

    if (sourceId && sourceId !== block.id) {
      onReorderBlocks?.(sourceId, block.id, dropPlacement || "before");
    }
    setDropPlacement(null);
    setIsDragging(false);
  }

  const blockStyle = {
    position: "relative",
    width: block.width ? `${block.width}px` : "100%",
    maxWidth: "100%",
    height: block.height ? `${block.height}px` : "auto",
    transform: `translate3d(${block.dx || 0}px, ${block.dy || 0}px, 0) rotate(${block.rotation || 0}deg)`,
    transformOrigin: "center center",
    zIndex: isSelected ? 30 : 1,
  };

  return (
    <div
      ref={containerRef}
      id={block.id}
      data-block-id={block.id}
      data-interactive-element="true"
      style={blockStyle}
      draggable={!isSelected}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`group relative rounded-2xs transition px-0.5 py-0.5 my-0.5 cursor-default select-text flex flex-col justify-center ${
        isDragging
          ? "opacity-40 border-dashed border-orange-500 bg-orange-50/30 scale-[0.99]"
          : isSelected
          ? "bg-orange-50/5 ring-1 ring-orange-400/40"
          : isHovered
          ? "ring-1 ring-gray-300 dark:ring-slate-700 bg-gray-50/20 dark:bg-slate-900/20"
          : ""
      }`}
    >
      {/* Top / Bottom Drop Reorder Insertion Indicators */}
      {dropPlacement === "before" && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-full shadow-md z-30 animate-pulse pointer-events-none" />
      )}
      {dropPlacement === "after" && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-full shadow-md z-30 animate-pulse pointer-events-none" />
      )}

      {/* Canva-style floating alignment toolbar when selected */}
      {isSelected && (
        <CanvasAlignmentToolbar
          blockId={block.id}
          elementTitle={block.type || "Block"}
          onAlignLeft={handleAlignLeft}
          onAlignCenter={handleAlignCenter}
          onAlignRight={handleAlignRight}
          onResetPosition={handleResetPosition}
          isText={["heading", "text", "box"].includes(block.type)}
          isEditingText={isEditingText}
          onToggleEditText={() => setIsEditingText((p) => !p)}
          lineColor={block.type === "divider" ? (block.color || "#ea580c") : undefined}
          onChangeLineColor={block.type === "divider" ? (c) => onUpdate?.({ color: c }) : undefined}
          lineWidth={block.type === "divider" ? (Number(block.lineWidth) || 2) : undefined}
          onChangeLineWidth={block.type === "divider" ? (w) => onUpdate?.({ lineWidth: w }) : undefined}
          lineHeight={block.type === "divider" ? (Number(block.lineHeight) || Number(block.height) || 12) : undefined}
          onChangeLineHeight={block.type === "divider" ? (h) => onUpdate?.({ lineHeight: h, height: h }) : undefined}
          onDeleteElement={onRemove}
        />
      )}

      {/* Canva / Clienter Style Transform Box (8 Resize handles + Rotation handle) */}
      <CanvasTransformBox
        isSelected={isSelected}
        isEditingText={isEditingText}
        onStartMove={handleStartMove}
        onStartResize={handleStartResize}
        onStartRotate={handleStartRotate}
        tooltipText={
          isEditingText
            ? "Click to select · click again to type"
            : "Click to type · drag to move"
        }
      />

      {/* Floating Action Controls on Hover */}
      {(isHovered || isSelected) && !isEditingText && (
        <div className="absolute right-1 -top-4 z-40 flex items-center gap-1 bg-white dark:bg-[#1f1a14] border border-gray-200 dark:border-slate-700 shadow-md rounded-lg px-1.5 py-0.5 text-gray-500 print:hidden text-[11px]">
          <div
            onMouseDown={handleStartMove}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:text-orange-600 rounded flex items-center gap-0.5 pointer-events-auto select-none"
            title="Drag with mouse to move block"
          >
            <GripVertical className="w-3.5 h-3.5" />
            <span className="font-bold uppercase text-[9px] text-orange-600 px-0.5">
              {block.type}
            </span>
          </div>

          <div className="h-3 w-px bg-gray-200 dark:bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.();
            }}
            className="p-1 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 rounded cursor-pointer"
            title="Move Up"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.();
            }}
            className="p-1 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 rounded cursor-pointer"
            title="Move Down"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.();
            }}
            className="p-1 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 rounded cursor-pointer"
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Shift to Previous Page */}
          {Number(block.page || 1) > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShiftToPage?.(Number(block.page || 1) - 1);
              }}
              className="px-1 py-0.5 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded cursor-pointer flex items-center text-[10px] font-bold gap-0.5"
              title={`Shift block to Page ${Number(block.page || 1) - 1}`}
            >
              <ChevronLeft className="w-3 h-3 text-blue-600" />
              <span>P{Number(block.page || 1) - 1}</span>
            </button>
          )}

          {/* Shift to Next Page */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShiftToPage?.(Number(block.page || 1) + 1);
            }}
            className="px-1 py-0.5 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 rounded cursor-pointer flex items-center text-[10px] font-bold gap-0.5"
            title={`Shift block to Page ${Number(block.page || 1) + 1}`}
          >
            <span>P{Number(block.page || 1) + 1}</span>
            <ChevronRight className="w-3 h-3 text-orange-600" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
            title="Delete Block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* BLOCK TYPE: HEADING (Tight height to content) */}
      {block.type === "heading" && (
        <div
          className="relative z-10 w-full flex items-center rounded"
          style={{
            height: block.height ? "100%" : "auto",
            backgroundColor: block.backgroundColor || "transparent",
          }}
        >
          <textarea
            ref={headingRef}
            value={block.heading || ""}
            onChange={(e) => {
              onUpdate({ heading: e.target.value });
              e.target.style.height = "0px";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            rows={1}
            placeholder="Heading Title..."
            className="w-full text-lg sm:text-xl border-0 bg-transparent outline-hidden p-0 resize-none overflow-hidden leading-tight block transition cursor-text focus:bg-orange-50/20"
            style={{
              height: block.height ? "100%" : "auto",
              fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
              fontWeight: block.fontWeight || "900",
              fontStyle: block.fontStyle || "normal",
              textDecoration: block.textDecoration || "none",
              color: block.color || "#0f172a",
              fontFamily: block.fontFamily || font,
              textAlign: block.textAlign || "left",
            }}
          />
        </div>
      )}

      {/* BLOCK TYPE: TEXT (Tight height to content - exact height match!) */}
      {block.type === "text" && (
        <div
          className="relative z-10 w-full flex items-center rounded"
          style={{
            height: block.height ? "100%" : "auto",
            backgroundColor: block.backgroundColor || "transparent",
          }}
        >
          <textarea
            ref={textRef}
            value={block.body || block.text || ""}
            onChange={(e) => {
              onUpdate({ body: e.target.value });
              e.target.style.height = "0px";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            rows={1}
            placeholder="Type your paragraph text here..."
            className="w-full text-xs sm:text-sm border-0 bg-transparent outline-hidden resize-none leading-relaxed p-0 overflow-hidden block transition cursor-text focus:bg-orange-50/20"
            style={{
              height: block.height ? "100%" : "auto",
              fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
              fontWeight: block.fontWeight || "normal",
              fontStyle: block.fontStyle || "normal",
              textDecoration: block.textDecoration || "none",
              color: block.color || "#1e293b",
              fontFamily: block.fontFamily || font,
              textAlign: block.textAlign || "left",
            }}
          />
        </div>
      )}

      {/* BLOCK TYPE: PRICING TABLE */}
      {block.type === "pricing" && (
        <div
          className="relative z-10 w-full"
          style={{
            height: block.height ? `${block.height}px` : "auto",
            fontFamily: block.fontFamily || font,
          }}
        >
          <PricingBlockRenderer block={block} onUpdate={onUpdate} />
        </div>
      )}

      {/* BLOCK TYPE: PAYMENT SCHEDULE */}
      {block.type === "payment" && (
        <div
          className="relative z-10 w-full"
          style={{
            height: block.height ? `${block.height}px` : "auto",
            fontFamily: block.fontFamily || font,
          }}
        >
          <PaymentBlockRenderer block={block} onUpdate={onUpdate} />
        </div>
      )}

      {/* BLOCK TYPE: CUSTOM TABLE */}
      {block.type === "table" && (
        <div
          className="relative z-10 w-full"
          style={{
            height: block.height ? `${block.height}px` : "auto",
            fontFamily: block.fontFamily || font,
          }}
        >
          <CustomTableBlockRenderer block={block} onUpdate={onUpdate} />
        </div>
      )}

      {/* BLOCK TYPE: DIVIDER (Tight height line) */}
      {block.type === "divider" && (
        <div
          className="cursor-pointer relative z-10 flex items-center justify-center w-full my-0.5"
          style={{
            height: block.height ? `${block.height}px` : "12px",
          }}
        >
          <hr
            className="w-full my-0 transition"
            style={{
              borderColor: block.color || "#ea580c",
              borderTopWidth: `${block.lineWidth || (block.height ? Math.min(12, Math.max(1, Math.round(block.height / 4))) : 2)}px`,
            }}
          />
        </div>
      )}

      {/* BLOCK TYPE: BOX (Callout card) */}
      {block.type === "box" && (
        <div
          className="relative z-10 rounded-xl border border-orange-200 dark:border-orange-900/50 p-3 space-y-1 w-full"
          style={{
            height: block.height ? `${block.height}px` : "auto",
            backgroundColor: block.backgroundColor || "rgba(255, 237, 213, 0.4)",
            fontFamily: block.fontFamily || font,
          }}
        >
          <input
            type="text"
            value={block.heading || "Important Note"}
            onChange={(e) => onUpdate({ heading: e.target.value })}
            className="w-full text-xs font-black uppercase tracking-wider border-0 bg-transparent outline-hidden cursor-text focus:bg-orange-100/50 rounded px-1"
            style={{
              fontSize: block.fontSize ? `${Math.max(11, block.fontSize)}px` : undefined,
              fontWeight: block.fontWeight || "800",
              fontStyle: block.fontStyle || "normal",
              textDecoration: block.textDecoration || "none",
              color: block.color || "#c2410c",
              textAlign: block.textAlign || "left",
              fontFamily: block.fontFamily || font,
            }}
          />
          <textarea
            value={block.body || ""}
            onChange={(e) => onUpdate({ body: e.target.value })}
            rows={1}
            placeholder="Add highlighted terms, notes, or acceptance criteria..."
            className="w-full text-xs border-0 bg-transparent outline-hidden resize-none leading-relaxed p-1 rounded block cursor-text focus:bg-orange-100/50"
            style={{
              fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
              fontWeight: block.fontWeight || "normal",
              fontStyle: block.fontStyle || "normal",
              textDecoration: block.textDecoration || "none",
              color: block.color || "#334155",
              textAlign: block.textAlign || "left",
              fontFamily: block.fontFamily || font,
            }}
          />
        </div>
      )}

      {/* BLOCK TYPE: IMAGE */}
      {block.type === "image" && (
        <div
          className="relative z-10 w-full"
          style={{ height: block.height ? `${block.height}px` : "auto" }}
        >
          <ImageBlockRenderer block={block} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}
