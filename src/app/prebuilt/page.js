"use client";

import Navbar from "@/components/Navbar";
import CommonMarquee from "@/components/CommonMarquee";
import PrebuiltSection from "@/components/PrebuiltSection";
import PrebuiltReviews from "@/components/PrebuiltReviews";
import FaqAccordion from "@/components/FaqAccordion";
import GetInTouchSection from "@/components/GetInTouchSection";
import Footer from "@/components/Footer";

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
  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[70vh] sm:min-h-[75vh] md:min-h-screen" 
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <img src="/common/prebuilt_db.png" alt="" aria-hidden="true" className="hidden md:block absolute top-28 right-12 w-36 lg:w-48 opacity-80 animate-floatingSmooth pointer-events-none select-none" />
        <img src="/common/prebuilt_analytics.png" alt="" aria-hidden="true" className="hidden md:block absolute bottom-24 left-8 w-32 lg:w-44 opacity-70 animate-floatingSmooth pointer-events-none select-none" style={{ animationDelay: '1.2s' }} />

        <div className="flex-1 flex flex-col justify-start pt-12 md:justify-center md:pt-0">
          <section className="flex flex-1 items-start md:items-center justify-start md:justify-center text-center px-4 sm:px-6 pt-12 sm:pt-14 md:pt-0">
            <div className="w-full">
              <h1 
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-snug sm:leading-tight pb-2" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                Prebuilt Saas Software for <br /> Startups
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-500/80 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed">
                Skip the long wait and high costs. Our prebuilt platforms help you go digital faster without compromising on quality.
              </p>
            </div>
          </section>
        </div>


        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-6 sm:py-8 flex items-center shadow-inner group select-none">
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
      <div className="w-full flex flex-col items-center text-center pt-12 pb-2 px-4 sm:px-6" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter]">
          SaaS
        </div>
        <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
          Explore Our SaaS Products
        </h2>
        
        {/* Render the 8 prebuilt products staggered */}
        <PrebuiltSection />
      </div>

      {/* Prebuilt Software Dedicated Reviews */}
      <PrebuiltReviews />

      {/* Frequently Asked Questions */}
      <FaqAccordion faqs={PREBUILT_FAQS} badge="SaaS FAQ" />

      {/* Get In Touch section */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
