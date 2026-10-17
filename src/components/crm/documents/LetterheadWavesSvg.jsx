"use client";

export default function LetterheadWavesSvg() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[500px] pointer-events-none z-0 overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 794 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Lower Dot Matrix Pattern */}
          <pattern
            id="footerDotsWavePattern"
            x="0"
            y="0"
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2.5" cy="2.5" r="1.15" fill="#94A3B8" fillOpacity="0.35" />
          </pattern>

          {/* Soft Metallic Gradients */}
          <linearGradient id="silverWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#F8FAFC" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FEE2E2" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="coralWave" x1="0%" y1="20%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FED7AA" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FECDD3" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="rosyWave" x1="0%" y1="50%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1F2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Lower Left Halftone Dots */}
        <rect x="0" y="200" width="160" height="220" fill="url(#footerDotsWavePattern)" opacity="0.35" />

        {/* Lower Right Triangular Halftone Dot Matrix */}
        <rect x="650" y="260" width="144" height="190" fill="url(#footerDotsWavePattern)" opacity="0.45" />

        {/* Flowing Curved Ribbon 1 (Silver Base Wave) */}
        <path
          d="M -30 320 C 140 390, 260 460, 520 450 C 650 445, 740 395, 830 340 L 830 500 L -30 500 Z"
          fill="url(#silverWave)"
        />

        {/* Flowing Curved Ribbon 2 (Coral Tint Wave) */}
        <path
          d="M -20 355 C 180 415, 300 485, 560 470 C 680 460, 760 415, 825 365 L 825 500 L -20 500 Z"
          fill="url(#coralWave)"
        />

        {/* Flowing Curved Ribbon 3 (Rosy Accent Wave) */}
        <path
          d="M -10 385 C 195 435, 320 495, 570 482 C 690 470, 770 435, 825 390 L 825 500 L -10 500 Z"
          fill="url(#rosyWave)"
        />

        {/* Architectural Fine Curved Contour Lines */}
        <path
          d="M -20 332 C 150 400, 270 470, 530 460 C 660 452, 750 405, 830 352"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M -10 346 C 160 410, 280 478, 540 468 C 670 458, 755 414, 830 362"
          stroke="#E2E8F0"
          strokeWidth="1.0"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M 0 362 C 175 422, 295 486, 550 474 C 675 464, 760 422, 830 375"
          stroke="#FCA5A5"
          strokeWidth="1.0"
          fill="none"
          opacity="0.65"
        />
        <path
          d="M 10 378 C 190 432, 310 494, 560 480 C 680 468, 765 430, 830 388"
          stroke="#F87171"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
