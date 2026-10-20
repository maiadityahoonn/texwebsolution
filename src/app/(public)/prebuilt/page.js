"use client";

import Image from "next/image";
import { createStaticCms } from "@/lib/staticCms";
import Navbar from "@/components/public/Navbar";
import CommonMarquee from "@/components/public/CommonMarquee";
import PrebuiltSection from "@/components/public/PrebuiltSection";
import PrebuiltReviews from "@/components/public/PrebuiltReviews";
import PricingCtaBanner from "@/components/public/PricingCtaBanner";
import FaqAccordion from "@/components/public/FaqAccordion";
import GetInTouchSection from "@/components/public/GetInTouchSection";
import Footer from "@/components/public/Footer";

const PREBUILT_FAQS = [
  {
    question: "What is a \"Prebuilt Solution\"?",
    answer: "A prebuilt solution is a fully developed, launch-ready software platform (like an e-commerce marketplace, ride-sharing app, or food delivery system) that we deploy, brand, and configure for your business within days, bypassing months of custom coding."
  },
  {
    question: "Can I customize a prebuilt SaaS platform?",
    answer: "Yes, absolutely. Once we deploy the initial version, you own the complete source code, allowing us or your in-house developers to customize features, designs, and integrations according to your specific needs."
  },
  {
    question: "What is the typical deployment timeline?",
    answer: "Most of our prebuilt platforms are configured, branded with your assets, and deployed to your live server or app store within 1 to 2 weeks."
  },
  {
    question: "Is there any monthly subscription or licensing fee?",
    answer: "No. You pay a one-time setup fee, and the complete source code ownership is transferred to you. There are no recurring monthly licensing fees or mandatory platform cuts on your sales."
  },
  {
    question: "Do you assist with App Store and Play Store submissions?",
    answer: "Yes! Our team handles the entire deployment process, including publishing the customer and driver/provider apps directly onto your Google Play Store and Apple Store developer accounts."
  }
];

export default function PrebuiltPage() {
  const cms = createStaticCms();
  const hero = cms.block("prebuilt.hero", {
    title: "Prebuilt Saas Software for Startups",
    subtitle: "Skip the long wait and high costs. Our prebuilt platforms help you go digital faster without compromising on quality.",
  });
  const faqs = cms.list("prebuilt.faqs", "faqs", PREBUILT_FAQS);

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-0 md:min-h-[500px] lg:min-h-[560px]" 
        style={{ backgroundImage: "url('https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/prebuilt_db.png" alt="" aria-hidden="true" width={192} height={192} className="hidden md:block absolute top-28 right-12 w-36 lg:w-48 h-auto opacity-80 animate-floatingSmooth pointer-events-none select-none" />
        <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/prebuilt_analytics.png" alt="" aria-hidden="true" width={176} height={176} className="hidden md:block absolute bottom-24 left-8 w-32 lg:w-44 h-auto opacity-70 animate-floatingSmooth pointer-events-none select-none" style={{ animationDelay: '1.2s' }} />

        <div className="flex-1 flex flex-col justify-center pt-0 pb-3 min-[360px]:pb-3.5 sm:py-6 md:py-8">
          <section className="flex items-center justify-center text-center px-3 min-[360px]:px-4 sm:px-6">
            <div className="w-full">
              <h1 
                className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                {hero.title}
              </h1>
              <p className="mt-2.5 sm:mt-4 text-xs min-[360px]:text-sm sm:text-base md:text-lg text-gray-500/85 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed px-2">
                {hero.subtitle}
              </p>
            </div>
          </section>
        </div>


        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-4 sm:py-5 flex items-center shadow-inner group select-none">
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Launch Ready SaaS</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>24-Hour Instant Deployment</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>100% Scalable Code</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Turnkey Software Solutions</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Launch Ready SaaS</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>24-Hour Instant Deployment</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>100% Scalable Code</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Turnkey Software Solutions</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Check our SaaS Products (staggered list) */}
      <div className="w-full flex flex-col items-center text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-2.5 min-[360px]:px-4 sm:px-6" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="inline-block px-3.5 min-[360px]:px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-[11px] min-[360px]:text-xs sm:text-sm font-[Matter] mb-2.5 sm:mb-3">
          SaaS
        </div>
        <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
          Explore Our SaaS Products
        </h2>
        
        {/* Render the 8 prebuilt products staggered */}
        <PrebuiltSection />
      </div>

      {/* Prebuilt Software Dedicated Reviews */}
      <PrebuiltReviews />

      {/* Pricing CTA Banner */}
      <PricingCtaBanner
        badge="SaaS & Prebuilt Pricing"
        title={hero.ctaTitle || "Ready to Launch Your SaaS at Unbeatable Prices?"}
        subtitle={hero.ctaSubtitle || "Explore our transparent ready-to-deploy software packages or calculate your custom turnkey solution cost."}
        customWhatsappText={hero.whatsappText || "Hi TexWeb Solution, I'd like to discuss pricing for Prebuilt SaaS platforms."}
      />

      {/* Frequently Asked Questions */}
      <FaqAccordion faqs={faqs} badge={hero.faqBadge || "SaaS FAQ"} />

      {/* Get In Touch section */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
