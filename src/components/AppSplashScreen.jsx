"use client";

import { useEffect, useState } from "react";

export default function AppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Show splash on initial mount, then smooth fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 850);

    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 1450);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white text-gray-900 transition-opacity duration-600 ease-out select-none overflow-hidden ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        backgroundImage: "url('/common/Bg2.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        backgroundSize: "cover",
        fontFamily: "Matter",
      }}
      aria-hidden={!isVisible}
    >
      {/* Ambient soft red radial glow behind the logo */}
      <div className="absolute w-80 h-80 rounded-full bg-red-500/10 blur-3xl pointer-events-none -z-0 animate-pulse" />

      {/* Center Brand Icon & Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        <div className="relative p-4 bg-white rounded-3xl border border-gray-150 shadow-2xl shadow-red-500/15 mb-6 transition-transform hover:scale-105 duration-300">
          <img
            src="/logo.png"
            alt="TexWeb Solution"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
        </div>

        {/* Brand Name (Black TEXWEB + Red SOLUTION) */}
        <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-[-0.04em] text-center leading-none mb-2.5">
          <span className="text-gray-900">TEXWEB</span>
          <span className="text-red-600">SOLUTION</span>
        </div>

        {/* Tagline */}
        <p className="text-xs sm:text-sm font-medium text-gray-500 tracking-wide font-poppins text-center max-w-sm mx-auto mb-10 leading-relaxed">
          Web · Apps · SaaS · AI Automation · Digital Marketing
        </p>

        {/* Animated 3 Red Loading Dots matching brand */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-bounce [animation-delay:0ms] shadow-sm shadow-red-600/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce [animation-delay:180ms] shadow-sm shadow-red-500/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-bounce [animation-delay:360ms] shadow-sm shadow-red-400/30" />
        </div>
      </div>
    </div>
  );
}
