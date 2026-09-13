"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

let topBannerListeners = [];
const subscribeTopBanner = (callback) => {
  topBannerListeners.push(callback);
  window.addEventListener("storage", callback);
  return () => {
    topBannerListeners = topBannerListeners.filter((l) => l !== callback);
    window.removeEventListener("storage", callback);
  };
};

const notifyTopBanner = () => {
  topBannerListeners.forEach((l) => l());
};

const getTopBannerSnapshot = () => {
  if (typeof window === "undefined") return false;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (typeof navigator !== "undefined" && navigator.standalone);
  if (isStandalone) return false;
  return !sessionStorage.getItem("texweb_top_banner_dismissed");
};

const getTopBannerServerSnapshot = () => false;

export default function TopAppBanner() {
  const isVisible = useSyncExternalStore(
    subscribeTopBanner,
    getTopBannerSnapshot,
    getTopBannerServerSnapshot
  );

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    sessionStorage.setItem("texweb_top_banner_dismissed", "true");
    notifyTopBanner();
  };

  if (!isVisible) return null;

  return (
    <div className="relative z-[110] w-full pt-2 sm:pt-3 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 bg-[#FFFDFB] border border-stone-200/90 rounded-full px-4 py-2 sm:py-2.5 shadow-sm hover:shadow transition-all">
        {/* Empty left spacer */}
        <div className="w-5 hidden sm:block shrink-0" aria-hidden="true" />

        {/* Center Text Link */}
        <Link
          href="/download"
          className="group flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-red-600 transition-colors"
          style={{ fontFamily: "Matter" }}
        >
          <span className="text-orange-600 font-bold">📱</span>
          <span className="text-gray-800">The TexWeb mobile app is here.</span>
          <span className="font-bold text-orange-600 flex items-center gap-1 group-hover:underline underline-offset-2">
            Download it now <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </Link>

        {/* Right close button */}
        <button
          onClick={handleDismiss}
          className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
