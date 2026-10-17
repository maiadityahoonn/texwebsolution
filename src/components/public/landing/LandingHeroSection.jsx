"use client";

import Image from "next/image";
import Link from "next/link";
import { PhoneCall, ShieldCheck } from "lucide-react";
import AnimatedCounter from "@/components/public/AnimatedCounter";
import MarqueeStrip from "@/components/public/MarqueeStrip";
import { trackMetaEvent } from "./landingTracking";

export default function LandingHeroSection() {
  const handleScrollToQuote = (source = "hero_cta") => {
    trackMetaEvent("InitiateCheckout", { source });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openQuoteModal", { detail: { source } }));
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
      {/* 1. Meta Ads Focused Cohesive Centered Floating Capsule */}
      <header className="w-full relative z-20 pt-1.5 sm:pt-2 md:pt-2.5 px-3 sm:px-6">
        <div className="flex items-center justify-center">
          
          {/* Desktop & Tablet Floating Capsule (Symmetric, No Shadow, 100% Dead-Center Logo) */}
          <nav 
            className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center rounded-full px-8 md:px-10 lg:px-12 py-3.5 md:py-4 lg:py-4.5 bg-white/95 backdrop-blur-xl border border-gray-200/90 transition-all duration-300 w-auto"
            style={{ fontFamily: "Matter, sans-serif" }}
          >
            {/* Left Items: Direct Calling Desk & Rating Badge (Evenly Distributed from Far Left) */}
            <div className="flex items-center justify-between gap-6 md:gap-8 lg:gap-10">
              {/* Left Item 1: Direct Calling Desk (Placed right at the left capsule padding) */}
              <a
                href="tel:07554601839"
                onClick={handleCall}
                className="inline-flex items-center gap-2 text-[13px] md:text-sm lg:text-[15px] font-semibold text-gray-800 hover:text-red-600 transition-colors whitespace-nowrap cursor-pointer"
                title="Call Calling Desk: 0755-4601839"
              >
                <PhoneCall className="w-4 h-4 md:w-4.5 md:h-4.5 text-blue-600 shrink-0" />
                <span>0755-4601839</span>
              </a>

              {/* Left Item 2: Rating & Verified Badge (Placed adjacent to the center logo) */}
              <div className="inline-flex items-center gap-2 text-[13px] md:text-sm lg:text-[15px] font-semibold text-gray-800 whitespace-nowrap">
                <span className="text-amber-500 font-bold">★ 4.9</span>
                <span className="text-gray-300 font-light">•</span>
                <span className="text-gray-600">80+ Projects</span>
              </div>
            </div>

            {/* Center Column: Official TexWeb Solution Logo (100% Dead Center) */}
            <div className="flex items-center justify-center px-6 md:px-8 lg:px-10 shrink-0">
              <Link 
                href="/get-quote" 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center group shrink-0 transition-transform duration-300 hover:scale-105 cursor-pointer"
                title="TexWeb Solution - Stay on Get Quote"
              >
                <Image
                  src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-full-logo-original.png"
                  alt="TexWeb Solution"
                  width={220}
                  height={55}
                  priority
                  className="h-8 sm:h-9 md:h-11 lg:h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Right Items: WhatsApp Direct Contact & Primary Free Quote CTA (Evenly Distributed to Far Right) */}
            <div className="flex items-center justify-between gap-6 md:gap-8 lg:gap-10">
              {/* Right Item 1: Direct WhatsApp Chat (Placed adjacent to the center logo) */}
              <a
                href="https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20saw%20your%20Meta%20ad%20and%20want%20to%20discuss%20a%20project%20for%20my%20business."
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 text-[13px] md:text-sm lg:text-[15px] font-semibold text-gray-800 hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
                title="Chat with us on WhatsApp"
              >
                <Image
                  src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
                  alt="WhatsApp"
                  width={18}
                  height={18}
                  className="w-4 h-4 md:w-4.5 md:h-4.5 object-contain shrink-0"
                />
                <span>WhatsApp</span>
              </a>

              {/* Right Item 2: Primary Free Quote CTA (Placed right at the right capsule padding) */}
              <button
                type="button"
                onClick={() => handleScrollToQuote("header_capsule_btn")}
                className="px-5 md:px-7 py-2.5 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs md:text-sm lg:text-[15px] font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Get Free Quote ➔</span>
              </button>
            </div>
          </nav>

          {/* Mobile Clean Capsule (< 640px) */}
          <div className="flex sm:hidden w-[95%] max-w-md items-center justify-between px-4 py-2.5 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full">
            <a
              href="tel:07554601839"
              onClick={handleCall}
              className="p-2.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100"
              title="Call 0755-4601839"
            >
              <PhoneCall className="w-4 h-4" />
            </a>

            <Link 
              href="/get-quote" 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center px-1"
            >
              <Image
                src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-full-logo-original.png"
                alt="TexWeb Solution"
                width={160}
                height={40}
                priority
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={() => handleScrollToQuote("mobile_header_btn")}
              className="px-3.5 py-2 bg-red-600 text-white rounded-full text-xs font-semibold shadow-xs"
            >
              Free Quote
            </button>
          </div>

        </div>
      </header>

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
            src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/home/home_v4.webp"
            loading="eager"
            fetchPriority="high"
          />
        </div>


        {/* Action Buttons matching Homepage */}
        <div className="flex space-x-3 sm:space-x-4 mt-1 sm:mt-2 lg:mt-2.5 z-10">
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
