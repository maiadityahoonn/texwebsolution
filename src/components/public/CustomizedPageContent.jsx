"use client";

import Image from "next/image";
import { createStaticCms } from "@/lib/staticCms";
import Navbar from "@/components/public/Navbar";
import CustomizedTabs from "@/components/public/CustomizedTabs";
import CustomizedReviews from "@/components/public/CustomizedReviews";
import PricingCtaBanner from "@/components/public/PricingCtaBanner";
import FaqAccordion from "@/components/public/FaqAccordion";
import GetInTouchSection from "@/components/public/GetInTouchSection";
import Footer from "@/components/public/Footer";

const CUSTOMIZED_FAQS = [
  {
    question: "What is the process for custom website & application development?",
    answer: "Our custom development workflow follows a structured 5-phase process: Requirement Analysis & Scoping, UI/UX Wireframing & Design, Agile Core Development, Rigorous Testing & QA, and Final Cloud/App Store Deployment."
  },
  {
    question: "How long does it take to build a custom website or app from scratch?",
    answer: "Timeline depends on project complexity. Custom websites typically take 2 to 4 weeks, while complex web applications or mobile apps (iOS & Android) generally take 4 to 8 weeks from initial design to launch."
  },
  {
    question: "What tech stack do you use for custom development?",
    answer: "We utilize modern, scalable, and high-performance tech stacks including React, Next.js, Node.js, Python, TailwindCSS, React Native, and Flutter, backed by secure cloud infrastructure (AWS/Vercel/Firebase)."
  },
  {
    question: "Will I get complete source code ownership and intellectual property rights?",
    answer: "Yes! Upon full project completion and final payment, 100% of the custom source code, design assets, and intellectual property rights are legally transferred to your company."
  },
  {
    question: "Do you provide maintenance and updates after the custom application is live?",
    answer: "Yes, every custom project includes 30 days of complimentary post-launch support and bug fixes. We also offer ongoing monthly maintenance retainers for continuous feature additions, performance optimization, and security updates."
  }
];

export default function CustomizedPageContent({ activeTab = "websites" }) {
  const cms = createStaticCms();
  const hero = cms.block("customized.hero", {
    title: "Customized Development From Scratch",
    subtitle: "We transform your unique ideas into powerful, scalable applications. Our team crafts tailor-made software solutions designed specifically for your business needs, from the first line of code to the final launch.",
  });
  const faqs = cms.list("customized.faqs", "faqs", CUSTOMIZED_FAQS);

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-0 md:min-h-[500px] lg:min-h-screen" 
        style={{ backgroundImage: "url('https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/customized_code.png" alt="" aria-hidden="true" width={192} height={192} className="hidden md:block absolute top-28 right-12 w-36 lg:w-48 h-auto opacity-80 animate-floatingSmooth pointer-events-none select-none" />
        <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/customized_gears.png" alt="" aria-hidden="true" width={176} height={176} className="hidden md:block absolute bottom-24 left-8 w-32 lg:w-44 h-auto opacity-70 animate-floatingSmooth pointer-events-none select-none" style={{ animationDelay: '1.5s' }} />

        <div className="flex-1 flex flex-col justify-center pt-0 pb-3 min-[360px]:pb-3.5 sm:py-6 md:py-8 lg:py-0 lg:justify-center">
          <section className="flex items-center justify-center text-center px-3 min-[360px]:px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <h1 
                className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight lg:leading-tight pb-1 lg:pb-2" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                {hero.title}
              </h1>
              <p className="mt-2.5 sm:mt-4 lg:mt-6 text-xs min-[360px]:text-sm sm:text-base md:text-lg text-gray-500/85 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed px-2 lg:px-0">
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
                <span>Tailor-Made Engineering</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Custom Web & Mobile Apps</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>100% Unique Architecture</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Enterprise Scalability</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Tailor-Made Engineering</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Custom Web & Mobile Apps</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>100% Unique Architecture</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Enterprise Scalability</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Customized Projects Tab Switcher */}
      <div className="w-full flex flex-col items-center text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-2.5 min-[360px]:px-4 sm:px-6 font-poppins">
        <CustomizedTabs activeTab={activeTab} />
      </div>

      {/* Custom Development Dedicated Reviews */}
      <CustomizedReviews />

      {/* Pricing CTA Banner */}
      <PricingCtaBanner
        badge="Custom Development Pricing"
        title={hero.ctaTitle || "Need a Custom Website or App Tailored to Your Budget?"}
        subtitle={hero.ctaSubtitle || "Get a transparent breakdown of development costs or use our instant interactive pricing calculator."}
        customWhatsappText={hero.whatsappText || "Hi TexWeb Solution, I'd like to get an estimate for a custom software project."}
      />

      {/* Custom Development FAQs */}
      <FaqAccordion faqs={faqs} badge={hero.faqBadge || "Custom Dev FAQ"} />

      {/* Get In Touch section */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
