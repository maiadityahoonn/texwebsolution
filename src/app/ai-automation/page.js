"use client";

import Navbar from "@/components/Navbar";
import CommonMarquee from "@/components/CommonMarquee";
import AiAutomationReviews from "@/components/AiAutomationReviews";
import FaqAccordion from "@/components/FaqAccordion";
import GetInTouchSection from "@/components/GetInTouchSection";
import Footer from "@/components/Footer";

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
    image: "/ai-automation/ai_chatbot_showcase.png",
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
    image: "/ai-automation/whatsapp_automation_showcase.png",
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
    image: "/ai-automation/voice_agent_showcase.png",
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
  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[70vh] sm:min-h-[75vh] md:min-h-screen" 
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <img 
          src="/ai-automation/ai_ornament_right.webp" 
          alt="" 
          aria-hidden="true" 
          className="hidden md:block absolute top-28 right-8 w-36 lg:w-48 opacity-80 animate-floatingSmooth pointer-events-none select-none" 
        />
        <img 
          src="/ai-automation/ai_ornament_left.webp" 
          alt="" 
          aria-hidden="true" 
          className="hidden md:block absolute bottom-20 left-8 w-36 lg:w-48 opacity-95 animate-floatingSmooth pointer-events-none select-none drop-shadow-lg" 
          style={{ animationDelay: '1.2s' }} 
        />

        <div className="flex-1 flex flex-col justify-start pt-12 md:justify-center md:pt-0">
          <section className="flex flex-1 items-start md:items-center justify-start md:justify-center text-center px-4 sm:px-6 pt-12 sm:pt-14 md:pt-0">
            <div className="w-full">
              <h1 
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-snug sm:leading-tight pb-2" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                AI & Workflow <br /> Automation Solutions
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-500/80 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed">
                Supercharge your business productivity. We design, build, and deploy smart AI agents, automated workflows, and custom LLM integrations tailored for your operations.
              </p>
            </div>
          </section>
        </div>

        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-6 sm:py-8 flex items-center shadow-inner group select-none">
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
      <div className="w-full flex flex-col items-center text-center pt-14 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
          Our AI Catalog
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1 mb-16">
          Explore Our AI Automations
        </h2>

        <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 md:px-12 space-y-14 sm:space-y-20 md:space-y-28">
          {SERVICES.map((service, index) => {
            const isImageLeft = index % 2 === 0;

            return (
              <div 
                key={service.title}
                className="grid md:grid-cols-2 gap-8 md:gap-12 items-center px-0 md:px-6"
              >
                {/* Image Side */}
                <div 
                  className={`flex justify-center items-center rounded-[32px] bg-[#F8F9FD] border border-gray-200/80 w-full max-w-md aspect-[4/3] overflow-hidden p-2 shadow-md hover:shadow-lg transition-all duration-300 ${
                    isImageLeft ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <img 
                    alt={service.imageAlt} 
                    className="rounded-[24px] w-full h-full object-contain scale-[1.06] hover:scale-[1.10] transition-transform duration-300" 
                    src={service.image}
                    loading="lazy"
                  />
                </div>

                {/* Text Side */}
                <div 
                  className={`rounded-xl p-4 text-left ${
                    isImageLeft ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <h3 
                    className="text-2xl md:text-3xl text-gray-900 mb-4 font-medium" 
                  >
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-500 font-poppins font-light text-sm md:text-base leading-relaxed mb-6">
                    {service.desc}
                  </p>
                  
                  <ul className="space-y-4 mb-8 font-poppins">
                    {service.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm md:text-sm">
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="flex-1 mt-1">{bullet}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-start">
                    <a
                      href={`https://wa.me/+917462827259?text=${encodeURIComponent(
                        `Hi, I'm interested in ${service.title} (AI Automation)`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-red-600 text-white rounded-full shadow-md hover:scale-[1.05] hover:bg-red-700 active:scale-[0.96] transition-all duration-100 shadow-red-600/10 font-medium inline-block"
                    >
                      Enquire Now
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

      {/* AI Automation Frequently Asked Questions (6 FAQs) */}
      <FaqAccordion faqs={AI_FAQS} badge="AI Automation FAQ" />

      {/* Get In Touch section */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
