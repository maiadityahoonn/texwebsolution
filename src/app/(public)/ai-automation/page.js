"use client";

import Image from "next/image";
import { createStaticCms } from "@/lib/staticCms";
import Navbar from "@/components/public/Navbar";
import CommonMarquee from "@/components/public/CommonMarquee";
import AiAutomationReviews from "@/components/public/AiAutomationReviews";
import PricingCtaBanner from "@/components/public/PricingCtaBanner";
import FaqAccordion from "@/components/public/FaqAccordion";
import GetInTouchSection from "@/components/public/GetInTouchSection";
import Footer from "@/components/public/Footer";

const AI_FAQS = [
  {
    question: "What types of AI Automation solutions does TexWeb Solution build?",
    answer: "We build custom WhatsApp AI Bots, Voice AI Calling Assistants, Document AI & Invoice OCR extractors, RAG Knowledge Base Chatbots, CRM Lead Capture Automations, and end-to-end operational workflows (n8n, Make, Zapier, Python)."
  },
  {
    question: "How does a WhatsApp AI Automation bot help generate more leads?",
    answer: "A WhatsApp AI Bot operates 24/7 to instantly reply to incoming inquiries from social media, ads, or website forms. It qualifies potential leads by asking automated budget & requirement questions and schedules sales calls directly into your calendar."
  },
  {
    question: "Can your AI Voice Assistant handle inbound and outbound phone calls?",
    answer: "Yes! Our AI Voice Assistants handle round-the-clock inbound customer calls, answer FAQs with human-like voice clarity, take appointment bookings, and make automated outbound reminder calls to leads."
  },
  {
    question: "How long does it take to integrate AI Automation into existing systems?",
    answer: "Standard WhatsApp AI bots and document extractors take 3 to 7 days. Enterprise RAG chatbots and complex multi-platform CRM workflows take 1 to 2 weeks for complete setup, testing, and deployment."
  },
  {
    question: "Is our business data secure when training custom AI chatbots?",
    answer: "Absolutely. We enforce strict enterprise-grade data privacy. Your internal documents, customer databases, and proprietary business knowledge are processed securely without being used to train public LLM models."
  },
  {
    question: "Will the AI Automation require technical maintenance from our team?",
    answer: "No technical knowledge is required. We handle complete setup, API integrations, prompt engineering, server hosting, and provide continuous monitoring and maintenance to keep your AI workflows running smoothly."
  }
];

const SERVICES = [
  {
    title: "AI Chatbot & Assistant Integration",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/ai-automation/ai_chatbot_showcase.png",
    imageAlt: "AI Chatbot & Assistant Integration",
    desc: "Engage visitors, capture qualified leads, and answer support queries 24/7 with custom AI-powered chatbots integrated directly into your website.",
    bullets: [
      "Fully customizable chat interface matching your brand identity and website theme.",
      "Multi-turn conversation flows, context retention, and instant lead capture forms.",
      "Advanced API & CRM integrations to store chat histories and trigger follow-up tasks."
    ]
  },
  {
    title: "WhatsApp Business Automation",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/ai-automation/whatsapp_automation_showcase.png",
    imageAlt: "WhatsApp Business Automation",
    desc: "Optimize customer communication with automated WhatsApp flows. Set up smart auto-replies, bulk notifications, and interactive chat menus.",
    bullets: [
      "Official WhatsApp Cloud API integration and verified business setup support.",
      "Automated follow-up reminders, order updates, and customer nurturing funnels.",
      "Real-time lead synchronization with CRM platforms, Google Sheets, or internal databases."
    ]
  },
  {
    title: "AI Voice Calling Agents",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/ai-automation/voice_agent_showcase.png",
    imageAlt: "AI Voice Calling Agents",
    desc: "Deploy human-like AI voice bots to automate inbound and outbound phone calls, verify customer feedback, qualify leads, and schedule bookings.",
    bullets: [
      "High-fidelity real-time voice processing and natural human-like conversations.",
      "Automated call logging, analysis, sentiment tracking, and voice transcripts.",
      "Seamless calendar booking integrations and CRM updates for immediate sales team follow-up."
    ]
  }
];

export default function AiAutomationPage() {
  const cms = createStaticCms();
  const hero = cms.block("ai.hero", {
    title: "AI & Workflow Automation Solutions",
    subtitle: "Supercharge your business productivity. We design, build, and deploy smart AI agents, automated workflows, and custom LLM integrations tailored for your operations.",
  });
  const cmsServices = cms.list("ai.services", "services", []);
  const services = SERVICES.map((service, index) => ({ ...service, ...(cmsServices[index] || {}) }));
  const faqs = cms.list("ai.faqs", "faqs", AI_FAQS);

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-0 md:min-h-[500px] lg:min-h-screen" 
        style={{ backgroundImage: "url('https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <Image width={800} height={600} 
          src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/ai-automation/ai_ornament_right.webp" 
          alt="" 
          aria-hidden="true" 
          className="hidden md:block absolute top-28 right-8 w-36 lg:w-48 opacity-80 animate-floatingSmooth pointer-events-none select-none" 
        />
        <Image width={800} height={600} 
          src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/ai-automation/ai_ornament_left.webp" 
          alt="" 
          aria-hidden="true" 
          className="hidden md:block absolute bottom-20 left-8 w-36 lg:w-48 opacity-95 animate-floatingSmooth pointer-events-none select-none drop-shadow-lg" 
          style={{ animationDelay: '1.2s' }} 
        />

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
            {[...Array(18)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Automate with AI</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Work Smarter</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(18)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Automate with AI</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Work Smarter</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Services List Section */}
      <div className="w-full flex flex-col items-center text-center pt-8 sm:pt-12 pb-12 sm:pb-16 px-2.5 min-[360px]:px-4 sm:px-6" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="inline-block px-3.5 min-[360px]:px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-[11px] min-[360px]:text-xs sm:text-sm font-[Matter] mb-2.5 sm:mb-3">
          Our AI Catalog
        </div>
        <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1 mb-8 sm:mb-12">
          Explore Our AI Automations
        </h2>

        <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 md:px-12 space-y-10 min-[360px]:space-y-12 sm:space-y-16 md:space-y-20">
          {services.map((service, index) => {
            const isImageLeft = index % 2 === 0;

            return (
              <div 
                key={service.title}
                className="grid md:grid-cols-2 gap-5 min-[360px]:gap-6 sm:gap-8 md:gap-12 items-center px-0 md:px-6 text-left"
              >
                {/* Image Side */}
                <div 
                  className={`flex justify-center items-center rounded-2xl min-[360px]:rounded-[32px] bg-[#F8F9FD] border border-gray-200/80 w-full max-w-md aspect-[4/3] overflow-hidden p-2 shadow-md hover:shadow-lg transition-all duration-300 mx-auto ${
                    isImageLeft ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <Image width={800} height={600} 
                    alt={service.imageAlt} 
                    className="rounded-xl min-[360px]:rounded-[24px] w-full h-full object-contain scale-[1.04] sm:scale-[1.06] hover:scale-[1.08] sm:hover:scale-[1.10] transition-transform duration-300" 
                    src={service.image}
                    loading="lazy"
                  />
                </div>

                {/* Text Side */}
                <div 
                  className={`rounded-xl p-1.5 min-[360px]:p-3 sm:p-4 text-left ${
                    isImageLeft ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <h3 
                    className="text-xl min-[360px]:text-2xl md:text-3xl text-gray-900 mb-2.5 sm:mb-4 text-left font-medium leading-snug" 
                  >
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-500 font-poppins font-light text-xs min-[360px]:text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 text-left">
                    {service.desc}
                  </p>
                  
                  <ul className="space-y-3 sm:space-y-4 mb-5 sm:mb-8 font-poppins text-left">
                    {service.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-gray-600 text-xs min-[360px]:text-sm text-left">
                        <span className="shrink-0 w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs min-[360px]:text-sm font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="flex-1 mt-0.5 min-[360px]:mt-1 leading-relaxed text-left">{bullet}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-start text-left">
                    <a
                      href={`https://wa.me/+917462827259?text=${encodeURIComponent(
                        `Hi, I'm interested in ${service.title} (AI Automation)`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 min-[360px]:px-6 py-2.5 bg-red-600 text-white rounded-full shadow-md hover:scale-[1.05] hover:bg-red-700 active:scale-[0.96] transition-all duration-100 shadow-red-600/10 font-medium inline-flex items-center gap-2 text-xs min-[360px]:text-sm max-w-full truncate"
                    >
                      <Image width={64} height={64} src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                      <span className="truncate">Enquire on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Automation Dedicated Reviews */}
      <AiAutomationReviews />

      {/* Pricing CTA Banner */}
      <PricingCtaBanner
        badge="AI Automation Pricing"
        title="Automate Your Business Workflows at Predictable Costs"
        subtitle="Deploy AI Voice Agents, WhatsApp Bots, and RAG systems with transparent, ROI-driven pricing starting ₹1,999/mo."
        customWhatsappText="Hi TexWeb Solution, I'd like to discuss pricing for AI & Workflow Automation."
      />

      {/* AI Automation Frequently Asked Questions (6 FAQs) */}
      <FaqAccordion faqs={faqs} badge={hero.faqBadge || "AI Automation FAQ"} />

      {/* Get In Touch section */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
