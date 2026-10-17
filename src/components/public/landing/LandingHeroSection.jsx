"use client";

import Image from "next/image";
import Link from "next/link";
import { PhoneCall, Sparkles, ShieldCheck } from "lucide-react";
import AnimatedCounter from "@/components/public/AnimatedCounter";
import MarqueeStrip from "@/components/public/MarqueeStrip";
import { trackMetaEvent } from "./landingTracking";

export default function LandingHeroSection() {
  const handleScrollToQuote = (source = "hero_cta") => {
    trackMetaEvent("InitiateCheckout", { source });
    const el = document.getElementById("quote-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCall = () => {
    trackMetaEvent("Contact", { method: "phone_call", source: "hero_header" });
  };

  const handleWhatsApp = () => {
    trackMetaEvent("Contact", { method: "whatsapp", source: "hero_header" });
  };

  return (
    <div
      className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[70vh] sm:min-h-[75vh] md:min-h-screen font-poppins"
      style={{ backgroundImage: "url('https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/Bg2.png')" }}
    >
      {/* 1. Meta Ads Focused Clean Header */}
      <nav className="w-full relative z-20">
        {/* Top announcement badge */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white text-[11px] sm:text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          <span>⚡ <strong>Welcome from Meta:</strong> Get Free Project Architecture & Cost Estimate in 15 Minutes!</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-full-logo-original.png"
              alt="TexWeb Solution"
              width={180}
              height={44}
              priority
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* Center Trust Tag (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full text-xs font-semibold text-gray-800 shadow-xs font-[Matter]">
            <span className="text-amber-500">★★★★★</span>
            <span>4.9/5 Rating</span>
            <span className="text-gray-300">•</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>80+ Scaled Projects</span>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:07554601839"
              onClick={handleCall}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 bg-white/90 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all font-[Matter]"
              title="Call Calling Desk"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>0755-4601839</span>
            </a>

            <a
              href="https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20saw%20your%20Meta%20ad%20and%20want%20to%20discuss%20a%20project%20for%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all font-[Matter]"
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

            <button
              type="button"
              onClick={() => handleScrollToQuote("header_button")}
              className="px-4 sm:px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-red-600/15 hover:scale-105 active:scale-95 transition-all font-[Matter] cursor-pointer"
            >
              Get Free Quote
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Content Section (Inherited from Homepage) */}
      <div className="flex flex-col items-center text-center px-4 justify-start bg-transparent pt-1 sm:pt-2 pb-6 sm:pb-8">
        <h1 className="sr-only">TexWeb Solution - Custom Website, Mobile App Development & Digital Growth Agency</h1>

        {/* Hero Illustration */}
        <div className="relative w-full mx-auto -mt-1 sm:-mt-2 md:-mt-3 px-4 sm:px-8 max-w-full md:max-w-3xl lg:max-w-[740px]">
          <Image
            width={800}
            height={600}
            alt="TexWeb Solution - Custom Website and Mobile App Development Agency"
            className="w-full h-auto object-contain"
            src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/home/home.webp"
            loading="eager"
            fetchPriority="high"
          />
        </div>


        {/* Action Buttons matching Homepage */}
        <div className="flex space-x-3 sm:space-x-4 mt-[-3px] sm:mt-[-6px] lg:mt-[-9px] z-10">
          <button
            type="button"
            onClick={() => handleScrollToQuote("hero_primary_btn")}
            className="w-36 py-3.5 text-sm sm:w-48 sm:text-base lg:py-4 bg-red-600 text-white rounded-full transition-transform hover:scale-105 hover:bg-red-700 shadow-md shadow-red-600/15 cursor-pointer font-[Matter]"
            style={{ fontWeight: 500 }}
          >
            Get Free Quote ➔
          </button>
          <a
            href="https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20saw%20your%20Meta%20ad%20and%20want%20to%20discuss%20a%20project."
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            className="w-36 py-3.5 text-sm sm:w-48 sm:text-base lg:py-4 bg-white text-gray-900 rounded-full border border-gray-300 transition-transform hover:scale-105 hover:bg-green-50/30 hover:border-green-600 hover:text-green-700 flex items-center justify-center gap-2 font-[Matter]"
            style={{ fontWeight: 500 }}
          >
            <Image
              src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
              alt="WhatsApp"
              width={18}
              height={18}
              className="w-4 h-4 object-contain"
            />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Audience Trust Strip with AnimatedCounter */}
        <div className="inline-flex items-center gap-2 sm:gap-4 mt-4">
          <div className="flex -space-x-3 scale-[0.85] sm:scale-90 origin-left">
            <Image width={96} height={96} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-600 object-cover bg-white shadow-sm" src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/home/prof1.png" alt="Audience 1" />
            <Image width={96} height={96} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-600 object-cover bg-white shadow-sm" src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/home/prof2.png" alt="Audience 2" />
            <Image width={96} height={96} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-600 object-cover bg-white shadow-sm" src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/home/prof3.png" alt="Audience 3" />
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-none" style={{ fontFamily: "Matter" }}>
            Trusted by <AnimatedCounter target={90} suffix="k+" className="text-red-600 font-semibold" /> Audience
          </p>
        </div>

        {/* 3. Scrolling Marquee Strip */}
        <MarqueeStrip />
      </div>
    </div>
  );
}
