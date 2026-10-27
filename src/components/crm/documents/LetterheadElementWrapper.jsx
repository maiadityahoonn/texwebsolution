"use client";

import { useRef, useState } from "react";
import CanvasTransformBox from "./CanvasTransformBox";
import CanvasAlignmentToolbar from "./CanvasAlignmentToolbar";

/**
 * Interactive Canva-Style Wrapper for Letterhead Design Elements
 * Enables:
 * - Click to select with orange bounding box
 * - Drag to move with smart snap lines
 * - 8 resize handles for resizing
 * - Rotation handle for free rotating
 * - Canva alignment toolbar (Align Left, Align Center, Align Right, Reset)
 * - In-place text editing or property adjustments
 */
export default function LetterheadElementWrapper({
  id,
  elementTitle = "Element",
  transformData = {},
  isSelected = false,
  onSelect = () => {},
  onUpdate = () => {},
  startMove,
  startResize,
  startRotate,
  zoom = 1,
  canvasWidth = 794,
  children,
  isText = false,
  isEditingText = false,
  onToggleEditText,
  watermarkOpacity,
  onChangeOpacity,
  onUploadImage,
  lineColor,
  onChangeLineColor,
  lineWidth,
  onChangeLineWidth,
  lineHeight,
  onChangeLineHeight,
  onDeleteElement,
  isHorizontal = false,
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  function getElementRect() {
    if (!containerRef.current) return null;
    const parentCanvas =
      containerRef.current.closest(".a4-sheet-canvas") ||
      containerRef.current.parentElement;
    const canvasRect = parentCanvas?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: canvasWidth,
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
    startMove?.(
      e,
      {
        id,
        ...transformData,
        width: transformData.width || rect?.width || 200,
        height: transformData.height || rect?.height || 40,
      },
      rect
    );
  }

  function handleStartResize(e, handle) {
    const rect = getElementRect();
    startResize?.(
      e,
      {
        id,
        ...transformData,
        width: transformData.width || rect?.width || 200,
        height: transformData.height || rect?.height || 40,
      },
      handle,
      rect
    );
  }

  function handleStartRotate(e) {
    const rect = getElementRect();
    startRotate?.(
      e,
      {
        id,
        ...transformData,
        width: transformData.width || rect?.width || 200,
        height: transformData.height || rect?.height || 40,
      },
      rect
    );
  }

  // Canva Alignment: Snap to Left Margin (48px)
  function handleAlignLeft() {
    const rect = getElementRect();
    if (!rect) return;
    const currentDx = Number(transformData.dx || 0);
    const originX = rect.x - currentDx;
    const targetX = 48; // Standard 48px page margin
    const newDx = Math.round(targetX - originX);
    onUpdate({ dx: newDx });
  }

  // Canva Alignment: Snap to Page Center (canvasWidth / 2 = 397px)
  function handleAlignCenter() {
    const rect = getElementRect();
    if (!rect) return;
    const currentDx = Number(transformData.dx || 0);
    const originX = rect.x - currentDx;
    const elemWidth = rect.width;
    const targetCenterX = canvasWidth / 2;
    const targetLeft = targetCenterX - elemWidth / 2;
    const newDx = Math.round(targetLeft - originX);
    onUpdate({ dx: newDx });
  }

  // Canva Alignment: Snap to Right Margin (canvasWidth - 48px = 746px)
  function handleAlignRight() {
    const rect = getElementRect();
    if (!rect) return;
    const currentDx = Number(transformData.dx || 0);
    const originX = rect.x - currentDx;
    const elemWidth = rect.width;
    const targetRight = canvasWidth - 48;
    const targetLeft = targetRight - elemWidth;
    const newDx = Math.round(targetLeft - originX);
    onUpdate({ dx: newDx });
  }

  // Canva: Reset position back to default 0,0,0
  function handleResetPosition() {
    onUpdate({ dx: 0, dy: 0, rotation: 0 });
  }

  const dx = transformData.dx || 0;
  const dy = transformData.dy || 0;
  const rotation = transformData.rotation || 0;
  const customWidth = transformData.width ? `${transformData.width}px` : undefined;
  const customHeight = transformData.height ? `${transformData.height}px` : undefined;

  return (
    <div
      ref={containerRef}
      data-interactive-element="true"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${rotation}deg)`,
        transformOrigin: "center center",
        width: customWidth || "fit-content",
        maxWidth: customWidth || "fit-content",
        height: customHeight || "fit-content",
        zIndex: isSelected ? 40 : 10,
        ...style,
      }}
      className={`inline-flex w-fit max-w-fit relative pointer-events-auto transition-shadow select-none group cursor-pointer ${
        isSelected
          ? "ring-1 ring-orange-500/80"
          : isHovered
          ? "ring-1 ring-orange-300/60 ring-dashed"
          : ""
      } ${className}`}
    >
      {/* Canva-style floating alignment toolbar when selected */}
      {isSelected && (
        <CanvasAlignmentToolbar
          blockId={id}
          elementTitle={elementTitle}
          isHorizontal={isHorizontal}
          onAlignLeft={handleAlignLeft}
          onAlignCenter={handleAlignCenter}
          onAlignRight={handleAlignRight}
          onResetPosition={handleResetPosition}
          watermarkOpacity={watermarkOpacity}
          onChangeOpacity={onChangeOpacity}
          onUploadImage={onUploadImage}
          isText={isText}
          isEditingText={isEditingText}
          onToggleEditText={onToggleEditText}
          lineColor={lineColor}
          onChangeLineColor={onChangeLineColor}
          lineWidth={lineWidth}
          onChangeLineWidth={onChangeLineWidth}
          lineHeight={lineHeight}
          onChangeLineHeight={onChangeLineHeight}
          onDeleteElement={onDeleteElement}
        />
      )}

      {/* Canva Selection Box & 8 Transform Handles */}
      <CanvasTransformBox
        isSelected={isSelected}
        isEditingText={isEditingText}
        onStartMove={handleStartMove}
        onStartResize={handleStartResize}
        onStartRotate={handleStartRotate}
        tooltipText={
          isEditingText
            ? "Click text to edit · click toolbar to finish"
            : "Drag to move · Canva handles to resize/rotate"
        }
      />

      {/* Element Content - Tight to content boundaries */}
      <div className="w-fit h-fit max-w-fit relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}
