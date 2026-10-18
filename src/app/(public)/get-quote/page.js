"use client";

import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Clock } from "lucide-react";
import LandingHeroSection from "@/components/public/landing/LandingHeroSection";
import LandingQuoteModal from "@/components/public/landing/LandingQuoteModal";
import LandingOfferingsSection from "@/components/public/landing/LandingOfferingsSection";
import LandingPortfolioSection from "@/components/public/landing/LandingPortfolioSection";
import TestimonialsSwiper from "@/components/public/TestimonialsSwiper";
import ReelsCarousel from "@/components/public/ReelsCarousel";
import LandingFaqSection from "@/components/public/landing/LandingFaqSection";
import LandingMobileStickyBar from "@/components/public/landing/LandingMobileStickyBar";
import LandingFooter from "@/components/public/landing/LandingFooter";

export default function GetQuotePage() {
  const handleOpenModal = (source = "bottom_banner") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openQuoteModal", { detail: { source } }));
    }
  };

  return (
    <div className="relative w-full bg-white overflow-hidden selection:bg-red-600 selection:text-white">
      {/* 1. Interactive 2-Step Quote & Architecture Modal (Opens on Click) */}
      <LandingQuoteModal />

      {/* 3. Hero Section (Hook & Primary CTA) */}
      <LandingHeroSection />

      {/* 4. Main Body - Logical High-Converting Order */}
      <main className="relative z-10">
        
        {/* Step 1: Featured Work & Mobile Apps (Websites & Apps Showcase) */}
        <LandingPortfolioSection />

        {/* Step 2: Core Digital Solutions - "What We Build & Scale" (Below Featured Mobile Apps) */}
        <LandingOfferingsSection />

        {/* Step 3: Social Proof Part A - Real Client Reviews & Testimonials */}
        <div className="bg-white border-y border-gray-100">
          <TestimonialsSwiper />
        </div>

        {/* Step 4: Social Proof Part B - Real Video Reels & Social Presence */}
        <ReelsCarousel />

        {/* Step 5: Marquee Brand Authority Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-4 sm:py-5 flex items-center shadow-inner group select-none">
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
            {[...Array(14)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Develop it from Best</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Develop it Once</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>100% Code Ownership</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(14)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Develop it from Best</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Develop it Once</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>100% Code Ownership</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Step 6: Objection Handling & FAQs (Answers before final decision) */}
        <LandingFaqSection />

        {/* Step 7: Unique Luxury Horizontal Conversion Hub (Before Footer) */}
        <section 
          className="relative py-10 sm:py-14 bg-white overflow-hidden"
          style={{ fontFamily: "Matter, sans-serif" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-gray-950 via-neutral-950 to-gray-900 border border-gray-800/80 shadow-[0_20px_50px_-15px_rgba(220,38,38,0.25)] p-6 sm:p-10 lg:p-12 overflow-hidden">
              
              {/* Top Accent Glow Line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80" />

              {/* Ambient Glowing Orbs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-[90px] pointer-events-none -z-0" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -z-0" />

              {/* 1-Line Flex Layout on Desktop (Text on Left, Single-Line Buttons on Right) */}
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                
                {/* Left Side: Badge + Heading + Subtitle + Trust Pills */}
                <div className="max-w-2xl text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Free Technical Consultation & Roadmap</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white tracking-tight leading-tight">
                    Ready to Build Your Website, App, or Scale Meta Ads?
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-300 font-poppins mt-2.5 leading-relaxed max-w-xl">
                    Get an instant architecture roadmap, delivery timeline, and customized cost estimate in 15 minutes. 100% source code ownership.
                  </p>

                  {/* Trust Highlights */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-400 font-poppins mt-5">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      100% Code Ownership
                    </span>
                    <span className="text-gray-700 hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5 text-blue-400 font-medium">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                      15-Minute Response Time
                    </span>
                    <span className="text-gray-700 hidden sm:inline">•</span>
                    <span className="text-gray-300 font-medium">
                      ⚡ 7–14 Days Delivery
                    </span>
                  </div>
                </div>

                {/* Right Side: Strictly 1-Line Buttons (Zero Wrapping) */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 shrink-0 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenModal("bottom_banner")}
                    className="w-full sm:w-auto px-4 min-[375px]:px-6 sm:px-7 py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap font-[Matter]"
                  >
                    <span className="truncate whitespace-nowrap">Get Free Architecture & Quote</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>

                  <a
                    href="https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20want%20to%20discuss%20a%20new%20project%20for%20my%20business."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 min-[375px]:px-6 sm:px-7 py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap font-[Matter]"
                  >
                    <Image
                      src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
                      alt="WhatsApp"
                      width={18}
                      height={18}
                      className="w-4 h-4 object-contain brightness-0 invert shrink-0"
                    />
                    <span className="truncate whitespace-nowrap">Chat on WhatsApp</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        </section>
      </main>

      {/* 5. Mobile Sticky Conversion Bar */}
      <LandingMobileStickyBar />

      {/* 6. Dedicated Get-Quote Landing Footer */}
      <LandingFooter />
    </div>
  );
}
