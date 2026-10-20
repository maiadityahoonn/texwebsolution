"use client";

import { useState, useRef } from "react";

export default function ResponsiveTableContainer({ children, className = "" }) {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasMoved: false });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const target = e.target;
    if (target.closest("button, a, input, select, textarea, [role='button']")) return;
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.isDown) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5;
    if (Math.abs(walk) > 3) {
      dragState.current.hasMoved = true;
      e.preventDefault();
    }
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    dragState.current.isDown = false;
    setIsDragging(false);
  };

  return (
    <div className="relative group/table-wrapper">

      {/* The Scrollable Viewport */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`overflow-x-auto table-scroll ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"} ${className}`}
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}
