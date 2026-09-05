"use client";

import Navbar from "@/components/Navbar";
import MonthlyPlans from "@/components/MonthlyPlans";
import FaqAccordion from "@/components/FaqAccordion";
import GetInTouchSection from "@/components/GetInTouchSection";
import Footer from "@/components/Footer";

const PRICING_FAQS = [
  {
    question: "What is included in the monthly website & management plan?",
    answer: "Every monthly plan includes your custom branded website, high-speed cloud hosting, free SSL certificate, regular maintenance, technical updates, and our centralized business management dashboard. Higher tiers include automated WhatsApp alerts, online payment gateway, review automations, and AI chatbots."
  },
  {
    question: "Can I customize the features and workflows according to my business?",
    answer: "Yes, 100%! Whether you run a healthcare clinic, coaching institute, gym, salon, real estate firm, or retail shop, we customize all booking calendars, customer intake forms, invoice formats, and staff roles to match your exact daily operations."
  },
  {
    question: "How do Third-Party API charges (WhatsApp Meta, SMS, AI) work?",
    answer: "To keep our subscription fees low and transparent, third-party services like official WhatsApp Meta Cloud API, SMS gateway, AI tokens (OpenAI/Gemini), and payment gateway transaction fees are billed directly to your accounts based on actual usage."
  },
  {
    question: "Are there any long-term contracts or lock-in periods?",
    answer: "No. You pay a transparent 100% advance monthly subscription. You can renew month-to-month as long as you want your website, dashboard, and systems to remain active."
  },
  {
    question: "What if I need custom features or enterprise multi-branch modules?",
    answer: "We build custom enterprise solutions! You can talk or DM our solutions team directly on WhatsApp or call us to discuss custom requirements, custom integrations, and get a tailored quotation."
  },
  {
    question: "How long does it take to build and launch my monthly system?",
    answer: "Once you share your business requirements, logo, and content, we typically configure, design, and deploy your live website and management portal within 3 to 7 business days."
  }
];

export default function PricingPage() {
  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper (Matching Customized / Prebuilt / AI-Automation pages) */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[70vh] sm:min-h-[75vh] md:min-h-screen" 
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <img 
          src="/common/pricing_tag.webp" 
          alt="Pricing Plan Badge" 
          aria-hidden="true" 
          className="hidden md:block absolute top-24 right-10 w-40 lg:w-52 opacity-95 animate-floatingSmooth pointer-events-none select-none drop-shadow-xl" 
        />
        <img 
          src="/common/pricing_calc.webp" 
          alt="Pricing Savings & Calculator" 
          aria-hidden="true" 
          className="hidden md:block absolute bottom-20 left-8 w-40 lg:w-52 opacity-95 animate-floatingSmooth pointer-events-none select-none drop-shadow-xl" 
          style={{ animationDelay: '1.5s' }} 
        />

        <div className="flex-1 flex flex-col justify-start pt-12 md:justify-center md:pt-0">
          <section className="flex flex-1 items-start md:items-center justify-start md:justify-center text-center px-4 sm:px-6 pt-12 sm:pt-14 md:pt-0">
            <div className="w-full">
              <h1 
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-snug sm:leading-tight pb-2" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                Transparent Pricing &amp; <br /> Flexible Monthly Plans
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-500/80 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed">
                Choose the perfect digital &amp; operations system for your business. From custom websites to complete automation and AI, scale without heavy upfront capital.
              </p>
            </div>
          </section>
        </div>

        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-4 sm:py-5 flex items-center shadow-inner group select-none">
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Zero Hidden Costs</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>100% Custom Workflows</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Cancel Anytime</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>No Heavy Upfront Fees</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Zero Hidden Costs</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>100% Custom Workflows</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Cancel Anytime</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>No Heavy Upfront Fees</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Main Pricing Tiers + Industry Selector + Workflow Strip + Comparison Table + Terms */}
      <MonthlyPlans />

      {/* Pricing FAQs */}
      <FaqAccordion faqs={PRICING_FAQS} badge="Pricing FAQ" />

      {/* Get In Touch */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
