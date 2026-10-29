"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

export default function CrmPullToRefresh({
  children,
  onRefresh,
  isRefreshing = false,
  threshold = 60,
}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef(0);
  const isEligibleRef = useRef(false);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback(
    (e) => {
      // Don't intercept touches that start on clickable/interactive elements
      const target = e.target;
      if (
        target?.closest?.(
          "button, a, input, select, textarea, [role='button'], [data-no-pull='true']"
        )
      ) {
        isEligibleRef.current = false;
        return;
      }

      // Only eligible if at the very top of the page on mobile
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollTop <= 2 && e.touches.length === 1 && !isRefreshing) {
        startYRef.current = e.touches[0].clientY;
        isEligibleRef.current = true;
      } else {
        isEligibleRef.current = false;
      }
    },
    [isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isEligibleRef.current || isRefreshing) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollTop > 2) {
        isEligibleRef.current = false;
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Require at least 12px pull slop so small tap tremors don't cause React re-render cycles
      if (deltaY > 12) {
        const pullDelta = deltaY - 12;
        // Apply diminishing resistance curve
        const distance = Math.min(Math.pow(pullDelta, 0.82) * 1.6, 95);
        setPullDistance(distance);
        setIsPulling(true);
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    },
    [isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isEligibleRef.current) return;
    isEligibleRef.current = false;

    if (pullDistance >= threshold && !isRefreshing && onRefresh) {
      setPullDistance(48); // Keep visible during active refresh
      setIsPulling(false);
      try {
        await onRefresh();
      } catch (err) {
        console.error("Pull-to-refresh failed", err);
      } finally {
        setTimeout(() => setPullDistance(0), 300);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  // Reset pull distance when external refresh finishes
  useEffect(() => {
    if (!isRefreshing && !isPulling) {
      setPullDistance(0);
    }
  }, [isRefreshing, isPulling]);

  useEffect(() => {
    const options = { passive: true };
    window.addEventListener("touchstart", handleTouchStart, options);
    window.addEventListener("touchmove", handleTouchMove, options);
    window.addEventListener("touchend", handleTouchEnd, options);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const showIndicator = pullDistance > 0 || isRefreshing;
  const isPastThreshold = pullDistance >= threshold;

  return (
    <div ref={containerRef} className="relative w-full min-w-0 [overscroll-behavior-y:contain]">
      {/* Floating Pull-to-Refresh Indicator Pill (Mobile native style) */}
      {showIndicator && (
        <div
          className="fixed inset-x-0 flex justify-center pointer-events-none z-50 transition-opacity duration-200"
          style={{
            top: "calc(3.75rem + max(env(safe-area-inset-top, 0px), 1rem))",
            opacity: isRefreshing ? 1 : Math.min(pullDistance / 25, 1),
          }}
        >
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-xl transition-all duration-150 ${
              isPastThreshold || isRefreshing
                ? "bg-white dark:bg-[#1a1711] border-orange-500/80 text-orange-600 dark:text-orange-400 ring-4 ring-orange-500/15"
                : "bg-white/95 dark:bg-[#1a1711]/95 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-neutral-200"
            }`}
            style={{
              transform: `translateY(${Math.min(pullDistance, 60)}px)`,
            }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 shrink-0 ${
                isRefreshing ? "animate-spin text-orange-600 dark:text-orange-400" : ""
              }`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${pullDistance * 4.5}deg)`,
              }}
            />
            <span className="text-[11px] font-bold whitespace-nowrap">
              {isRefreshing
                ? "Refreshing data..."
                : isPastThreshold
                ? "Release to refresh"
                : "Pull down to refresh"}
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
