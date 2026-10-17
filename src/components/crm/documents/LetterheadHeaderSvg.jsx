"use client";

export default function LetterheadHeaderSvg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 794 104"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Top Halftone Dot Pattern */}
        <pattern
          id="headerDotsPattern"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.15" fill="#94A3B8" fillOpacity="0.4" />
        </pattern>

        {/* Red Stripe Gradient */}
        <linearGradient id="headerRedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D3151D" />
          <stop offset="100%" stopColor="#E11D2A" />
        </linearGradient>
      </defs>

      {/* Top Left Halftone Dotted Area */}
      <rect x="0" y="12" width="180" height="80" fill="url(#headerDotsPattern)" opacity="0.6" />

      {/* Top Left Deep Black Angular Wedge */}
      <polygon points="0,0 78,0 26,100 0,66" fill="#080C14" />
      {/* Top Left Red Diagonal Accent Stripe */}
      <polygon points="0,54 42,100 28,100 0,66" fill="url(#headerRedGrad)" />

      {/* Top Right Halftone Dotted Area */}
      <rect x="630" y="12" width="164" height="80" fill="url(#headerDotsPattern)" opacity="0.6" />

      {/* Top Right Deep Black Angular Wedge */}
      <polygon points="794,0 716,0 768,100 794,66" fill="#080C14" />
      {/* Top Right Red Diagonal Accent Stripe */}
      <polygon points="794,54 752,100 766,100 794,66" fill="url(#headerRedGrad)" />

      {/* Red Horizontal Divider with Sharp Angled Right Cut */}
      <polygon points="0,99 440,99 432,103 0,103" fill="#D3151D" />
      <polygon points="440,99 794,99 794,103 448,103" fill="#080C14" />
    </svg>
  );
}
