"use client";

import Image from "next/image";
import { PhoneCall, Sparkles } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";

export default function LandingMobileStickyBar() {
  const handleScrollToForm = () => {
    trackMetaEvent("InitiateCheckout", { source: "mobile_sticky_quote_btn" });
    const el = document.getElementById("quote-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWhatsApp = () => {
    trackMetaEvent("Contact", { method: "whatsapp", source: "mobile_sticky_bar" });
  };

  const handleCall = () => {
    trackMetaEvent("Contact", { method: "phone_call", source: "mobile_sticky_bar" });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2.5 px-3 shadow-2xl flex items-center justify-between gap-2 safe-area-bottom">
      {/* WhatsApp Quick Icon */}
      <a
        href="https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20saw%20your%20Meta%20ad%20and%20want%20to%20discuss%20a%20project."
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsApp}
        className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0 active:scale-95"
        title="WhatsApp Direct"
      >
        <Image
          src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
          alt="WhatsApp"
          width={22}
          height={22}
          className="w-5 h-5 object-contain"
        />
      </a>

      {/* Call Quick Icon */}
      <a
        href="tel:07554601839"
        onClick={handleCall}
        className="p-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl flex items-center justify-center shrink-0 active:scale-95"
        title="Call Support Desk"
      >
        <PhoneCall className="w-5 h-5 text-blue-600" />
      </a>

      {/* Big Free Quote CTA */}
      <button
        type="button"
        onClick={handleScrollToForm}
        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-md shadow-red-600/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Get Free Quote & Architecture ➔</span>
      </button>
    </div>
  );
}
