"use client";

import { useState, useCallback, useRef } from "react";

export function useCanvasTransform({
  blocks = [],
  onUpdateBlock,
  zoom = 1,
  canvasWidth = 794,
  canvasHeight = 1123,
}) {
  const [activeTransform, setActiveTransform] = useState(null);
  const [activeGuides, setActiveGuides] = useState({ xGuides: [], yGuides: [] });
  const transformRef = useRef(null);

  const startMove = useCallback(
    (e, block, initialRect) => {
      e.preventDefault();
      e.stopPropagation();

      const startClientX = e.clientX;
      const startClientY = e.clientY;

      const initDx = Number(block.dx ?? 0);
      const initDy = Number(block.dy ?? 0);
      const initX = Number(initialRect?.x ?? 48);
      const initY = Number(initialRect?.y ?? 100);
      const initW = Number(block.width ?? initialRect?.width ?? (canvasWidth - 96));
      const initH = Number(block.height ?? initialRect?.height ?? 30);

      transformRef.current = {
        type: "move",
        blockId: block.id,
        startClientX,
        startClientY,
        initDx,
        initDy,
        initX,
        initY,
        initW,
        initH,
      };
      setActiveTransform("move");

      function onMouseMove(moveEvent) {
        if (!transformRef.current) return;
        const mouseDx = (moveEvent.clientX - startClientX) / zoom;
        const mouseDy = (moveEvent.clientY - startClientY) / zoom;

        let newDx = Math.round(initDx + mouseDx);
        let newDy = Math.round(initDy + mouseDy);

        const currentVisualX = initX - initDx + newDx;
        const currentVisualCenterX = currentVisualX + initW / 2;
        const pageCenterX = canvasWidth / 2;

        const xGuides = [];
        const yGuides = [];
        const SNAP_THRESHOLD = 6;

        // Smart snap to page center
        if (Math.abs(currentVisualCenterX - pageCenterX) < SNAP_THRESHOLD) {
          newDx = Math.round(pageCenterX - (initX - initDx + initW / 2));
          xGuides.push(pageCenterX);
        }

        // Smart snap to left margin (48px)
        if (Math.abs(currentVisualX - 48) < SNAP_THRESHOLD) {
          newDx = Math.round(48 - (initX - initDx));
          xGuides.push(48);
        }

        // Smart snap to right margin (canvasWidth - 48)
        if (Math.abs(currentVisualX + initW - (canvasWidth - 48)) < SNAP_THRESHOLD) {
          newDx = Math.round(canvasWidth - 48 - (initX - initDx + initW));
          xGuides.push(canvasWidth - 48);
        }

        setActiveGuides({ xGuides, yGuides });
        // Use translate dx/dy so other elements NEVER jump or collapse their position!
        onUpdateBlock?.(block.id, { dx: newDx, dy: newDy });
      }

      function onMouseUp() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        transformRef.current = null;
        setActiveTransform(null);
        setActiveGuides({ xGuides: [], yGuides: [] });
      }

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [zoom, canvasWidth, onUpdateBlock]
  );

  const startResize = useCallback(
    (e, block, handle, initialRect) => {
      e.preventDefault();
      e.stopPropagation();

      const startClientX = e.clientX;
      const startClientY = e.clientY;

      const initW = Number(block.width ?? initialRect?.width ?? (canvasWidth - 96));
      const initH = Number(block.height ?? initialRect?.height ?? 24);
      const initX = Number(initialRect?.x ?? 48);

      transformRef.current = {
        type: "resize",
        handle,
        blockId: block.id,
        startClientX,
        startClientY,
        initX,
        initW,
        initH,
      };
      setActiveTransform("resize");

      function onMouseMove(moveEvent) {
        if (!transformRef.current) return;
        const dx = (moveEvent.clientX - startClientX) / zoom;
        const dy = (moveEvent.clientY - startClientY) / zoom;

        let newW = initW;
        let newH = initH;

        const isDivider =
          block.id === "letterhead-divider" ||
          block.id === "letterhead-footer-divider" ||
          block.type === "divider";
        const isHorizontalLine =
          block.id === "letterhead-footer-topline" ||
          block.orientation === "horizontal";

        const minW = isDivider ? 10 : isHorizontalLine ? 40 : 50;
        const maxW = canvasWidth - 48;

        // Width adjustment (Right "e", Left "w")
        if (handle.includes("e")) {
          newW = Math.max(minW, Math.min(maxW, initW + dx));
        }
        if (handle.includes("w")) {
          newW = Math.max(minW, Math.min(maxW, initW - dx));
        }

        // Height adjustment (Bottom "s", Top "n")
        const minH = isHorizontalLine ? 1 : isDivider ? 4 : 16;
        const maxH = isHorizontalLine ? 30 : isDivider ? 120 : 2000;
        if (handle.includes("s")) {
          newH = Math.max(minH, Math.min(maxH, initH + dy));
        }
        if (handle.includes("n")) {
          newH = Math.max(minH, Math.min(maxH, initH - dy));
        }

        // Snapping lines when resizing (only for non-divider and non-line blocks)
        const xGuides = [];
        if (!isDivider && !isHorizontalLine) {
          const pageCenterX = canvasWidth / 2;
          if (Math.abs(initX + newW / 2 - pageCenterX) < 5) {
            xGuides.push(pageCenterX);
          }
          if (Math.abs(newW - (canvasWidth - 96)) < 6) {
            newW = canvasWidth - 96;
            xGuides.push(48);
            xGuides.push(canvasWidth - 48);
          }
        }
        setActiveGuides({ xGuides, yGuides: [] });

        onUpdateBlock?.(block.id, {
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }

      function onMouseUp() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        transformRef.current = null;
        setActiveTransform(null);
        setActiveGuides({ xGuides: [], yGuides: [] });
      }

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [zoom, canvasWidth, onUpdateBlock]
  );

  const startRotate = useCallback(
    (e, block, initialRect) => {
      e.preventDefault();
      e.stopPropagation();

      const elCenterX = (initialRect?.x ?? 48) + (block.width ?? 300) / 2;
      const elCenterY = (initialRect?.y ?? 100) + (block.height ?? 30) / 2;

      function onMouseMove(moveEvent) {
        const mouseX = moveEvent.clientX;
        const mouseY = moveEvent.clientY;
        const radians = Math.atan2(mouseY - elCenterY, mouseX - elCenterX);
        let degrees = Math.round((radians * 180) / Math.PI + 90);
        if (degrees < 0) degrees += 360;

        if (Math.abs(degrees) < 4 || Math.abs(degrees - 360) < 4) degrees = 0;
        if (Math.abs(degrees - 90) < 4) degrees = 90;
        if (Math.abs(degrees - 180) < 4) degrees = 180;
        if (Math.abs(degrees - 270) < 4) degrees = 270;

        onUpdateBlock?.(block.id, { rotation: degrees });
      }

      function onMouseUp() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        setActiveTransform(null);
      }

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [onUpdateBlock]
  );

  return {
    activeTransform,
    activeGuides,
    startMove,
    startResize,
    startRotate,
  };
}
