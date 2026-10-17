"use client";

import Image from "next/image";
import Link from "next/link";
import { PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";

export default function LandingHeader() {
  const handleScrollToForm = () => {
    trackMetaEvent("InitiateCheckout", { source: "header_quote_btn" });
    const el = document.getElementById("quote-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCallClick = () => {
    trackMetaEvent("Contact", { method: "phone_call", source: "header" });
  };

  const handleWhatsAppClick = () => {
    trackMetaEvent("Contact", { method: "whatsapp", source: "header" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      {/* Top micro alert strip */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white text-[11px] sm:text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
        <span>⚡ <strong>Limited Meta Offer:</strong> Get Free Project Architecture & Live Prototype with every inquiry!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-full-logo-original.png"
            alt="TexWeb Solution"
            width={170}
            height={42}
            priority
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </Link>

        {/* Center Trust Tag (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-50/80 border border-amber-200/60 rounded-full text-xs font-semibold text-amber-900">
          <span className="text-amber-500">★★★★★</span>
          <span>4.9/5 Rating</span>
          <span className="text-gray-300">•</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>80+ Scaled Projects</span>
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Calling Button */}
          <a
            href="tel:07554601839"
            onClick={handleCallClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
            title="Call Support Desk"
          >
            <PhoneCall className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>0755-4601839</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20saw%20your%20Meta%20ad%20and%20want%20to%20discuss%20a%20project%20for%20my%20business."
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all"
          >
            <Image
              src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
              alt="WhatsApp"
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
            />
            <span className="hidden min-[480px]:inline">WhatsApp</span>
          </a>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={handleScrollToForm}
            className="px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
          >
            Get Free Quote ➔
          </button>
        </div>
      </div>
    </header>
  );
}
