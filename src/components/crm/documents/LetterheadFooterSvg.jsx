"use client";

export default function LetterheadFooterSvg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 794 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Main Deep Black Footer Bar */}
      <polygon points="0,10 794,10 794,56 0,56" fill="#070A0F" />

      {/* Top Red Edge Line */}
      <polygon points="0,8 794,8 794,10 0,10" fill="#D3151D" />

      {/* Left Raised Red Polygon Tab */}
      <polygon points="0,0 72,0 90,10 0,10" fill="#D3151D" />
      <polygon points="0,8 150,8 160,10 0,10" fill="#E11D2A" />
    </svg>
  );
}
