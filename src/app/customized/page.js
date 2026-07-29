"use client";

import Navbar from "@/components/Navbar";
import CommonMarquee from "@/components/CommonMarquee";
import CustomizedTabs from "@/components/CustomizedTabs";
import CustomizedReviews from "@/components/CustomizedReviews";
import FaqAccordion from "@/components/FaqAccordion";
import GetInTouchSection from "@/components/GetInTouchSection";
import Footer from "@/components/Footer";

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

export default function CustomizedPage() {
  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[70vh] sm:min-h-[75vh] md:min-h-screen" 
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <img src="/common/customized_code.png" alt="" aria-hidden="true" className="hidden md:block absolute top-28 right-12 w-36 lg:w-48 opacity-80 animate-floatingSmooth pointer-events-none select-none" />
        <img src="/common/customized_gears.png" alt="" aria-hidden="true" className="hidden md:block absolute bottom-24 left-8 w-32 lg:w-44 opacity-70 animate-floatingSmooth pointer-events-none select-none" style={{ animationDelay: '1.5s' }} />

        <div className="flex-1 flex flex-col justify-start pt-12 md:justify-center md:pt-0">
          <section className="flex flex-1 items-start md:items-center justify-start md:justify-center text-center px-4 sm:px-6 pt-12 sm:pt-14 md:pt-0">
            <div className="w-full">
              <h1 
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-snug sm:leading-tight pb-2" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                Customized Development <br /> From Scratch
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-500/80 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed">
                We transform your unique ideas into powerful, scalable applications. Our team crafts tailor-made software solutions designed specifically for your business needs, from the first line of code to the final launch.
              </p>
            </div>
          </section>
        </div>


        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-6 sm:py-8 flex items-center shadow-inner group select-none">
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
      <div className="w-full flex flex-col items-center text-center pt-4 pb-2 px-4 sm:px-6 font-poppins">
        {/* Render the switcher and projects list */}
        <CustomizedTabs />
      </div>

      {/* Custom Development Dedicated Reviews */}
      <CustomizedReviews />

      {/* Custom Development FAQs */}
      <FaqAccordion faqs={CUSTOMIZED_FAQS} badge="Custom Dev FAQ" />

      {/* Get In Touch section */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
