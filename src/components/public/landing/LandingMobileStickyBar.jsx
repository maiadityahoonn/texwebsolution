"use client";

import Image from "next/image";
import { PhoneCall, Sparkles } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";

export default function LandingMobileStickyBar() {
  const handleScrollToForm = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openQuoteModal", { detail: { source: "mobile_sticky_bar" } }));
    }
  };

  const handleWhatsApp = () => {
    trackMetaEvent("Contact", { method: "whatsapp", source: "mobile_sticky_bar" });
  };

  const handleCall = () => {
    trackMetaEvent("Contact", { method: "phone_call", source: "mobile_sticky_bar" });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2 min-[375px]:p-2.5 px-2.5 min-[375px]:px-3 shadow-2xl flex items-center justify-between gap-2 min-[375px]:gap-3 safe-area-bottom">

      {/* Call Quick Icon */}
      <a
        href="tel:07554601839"
        onClick={handleCall}
        className="p-2 min-[375px]:p-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl flex items-center justify-center shrink-0 active:scale-95"
        title="Call Support Desk"
      >
        <PhoneCall className="w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 text-blue-600 shrink-0" />
      </a>

      {/* Big Free Quote CTA */}
      <button
        type="button"
        onClick={handleScrollToForm}
        className="flex-1 min-w-0 py-2.5 min-[375px]:py-3 px-3 min-[375px]:px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] min-[375px]:text-xs shadow-md shadow-red-600/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap font-[Matter]"
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate whitespace-nowrap">Get Free Quote & Architecture ➔</span>
      </button>
    </div>
  );
}
