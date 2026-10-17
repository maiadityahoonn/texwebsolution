"use client";

export default function CanvasSmartGuides({ activeGuides = { xGuides: [], yGuides: [] } }) {
  const { xGuides = [], yGuides = [] } = activeGuides;

  if (xGuides.length === 0 && yGuides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden print:hidden">
      {/* Vertical Pink Alignment Lines */}
      {xGuides.map((x, idx) => (
        <div
          key={`x-${idx}-${x}`}
          className="absolute top-0 bottom-0 w-px bg-pink-500 shadow-[0_0_4px_rgba(236,72,153,0.8)] pointer-events-none"
          style={{ left: `${x}px` }}
        />
      ))}

      {/* Horizontal Pink Alignment Lines */}
      {yGuides.map((y, idx) => (
        <div
          key={`y-${idx}-${y}`}
          className="absolute left-0 right-0 h-px bg-pink-500 shadow-[0_0_4px_rgba(236,72,153,0.8)] pointer-events-none"
          style={{ top: `${y}px` }}
        />
      ))}
    </div>
  );
}
