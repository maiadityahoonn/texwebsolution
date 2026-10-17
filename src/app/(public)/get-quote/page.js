"use client";

import MetaPixelTracker from "@/components/public/landing/MetaPixelTracker";
import LandingHeroSection from "@/components/public/landing/LandingHeroSection";
import LandingQuoteForm from "@/components/public/landing/LandingQuoteForm";
import FeaturesSection from "@/components/public/FeaturesSection";
import ReelsCarousel from "@/components/public/ReelsCarousel";
import LandingPortfolioSection from "@/components/public/landing/LandingPortfolioSection";
import TestimonialsSwiper from "@/components/public/TestimonialsSwiper";
import TeamSection from "@/components/public/TeamSection";
import FaqAccordion from "@/components/public/FaqAccordion";
import LandingMobileStickyBar from "@/components/public/landing/LandingMobileStickyBar";
import Footer from "@/components/public/Footer";

export default function GetQuotePage() {
  return (
    <div className="relative w-full bg-white overflow-hidden selection:bg-red-600 selection:text-white">
      {/* 1. Client-side Meta Ads Pixel & Full UTM Parameter Tracker */}
      <MetaPixelTracker />

      {/* 2. Homepage-Inherited Hero Section with Meta Ads Conversion Hooks */}
      <LandingHeroSection />

      {/* 3. Main Body */}
      <main className="relative z-10">
        
        {/* Quote Form Section (Styled with exact Website Theme & Full Tracking) */}
        <LandingQuoteForm />

        {/* Features Section (Directly Inherited from Website) */}
        <FeaturesSection />

        {/* Reels Stack Carousel (Trusted by 90k+ People & Real Project Videos) */}
        <ReelsCarousel />

        {/* Featured Projects Section (Directly Inherited from Website) */}
        <LandingPortfolioSection />

        {/* Marquee Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-4 sm:py-5 flex items-center shadow-inner group select-none">
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
            {[...Array(14)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Develop it from Best</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Develop it Once</span>
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
              </span>
            ))}
          </div>
        </div>

        {/* Client Testimonials Swiper (Inherited from Website: Dr. MD Rashid, Siwan City Hospital, etc.) */}
        <div className="bg-white border-y border-gray-100">
          <TestimonialsSwiper />
        </div>

        {/* Core Team Section (Inherited from Website to build 100% human authenticity & trust) */}
        <TeamSection limit={4} showSeeMore={false} />

        {/* FAQ Accordion (Inherited from Website) */}
        <FaqAccordion />
      </main>

      {/* 4. Mobile Sticky Conversion Bar */}
      <LandingMobileStickyBar />

      {/* 5. Official Website Footer with Real Bhopal & Kolkata Addresses */}
      <Footer />
    </div>
  );
}
