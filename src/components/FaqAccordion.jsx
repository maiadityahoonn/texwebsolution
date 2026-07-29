"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const DEFAULT_FAQS = [
  {
    question: "What core services does TexWeb Solution provide?",
    answer: "We specialize in end-to-end digital solutions including Custom Web & Mobile App Development, Ready SaaS Products, AI & Workflow Automation, Digital Marketing (SEO & Paid Ads), High-Impact Video Editing, Brand Identity Design, and Complete Social Media Management."
  },
  {
    question: "How can your AI & Automation services benefit my business?",
    answer: "We integrate custom AI models, intelligent chatbots, CRM workflow automation, and LLM-powered business tools into your stack. This eliminates repetitive manual work, streamlines operations, and dramatically speeds up lead handling and customer support."
  },
  {
    question: "What is included in your Digital Marketing services?",
    answer: "Our digital marketing strategy includes targeted Search Engine Optimization (SEO), high-ROI Paid Ad Campaigns (Meta Ads, Google Ads), Conversion Rate Optimization (CRO), and detailed analytics tracking to drive qualified leads and revenue growth."
  },
  {
    question: "Do you handle complete Social Media Management & Growth?",
    answer: "Yes! We build and manage your complete social media presence across Instagram, LinkedIn, YouTube, and Facebook. This covers strategic content calendars, brand aesthetic design, reel scripting, audience growth, and community management."
  },
  {
    question: "What kind of Video Editing & Media Creation do you offer?",
    answer: "We create viral short-form reels/shorts, promotional brand ads, corporate videos, motion graphics, and podcast edits. Our team handles scripting, color grading, sound design, engaging dynamic captions, and visual effects built for max retention."
  },
  {
    question: "Can you help design a new Brand Identity for our company?",
    answer: "Yes! We craft full brand identity packages including logo design, color palettes, brand typography, design systems, UI/UX mockups, social media templates, and brand style guidelines that make your business stand out."
  },
  {
    question: "How long does it take to deliver a project?",
    answer: "Our pre-built SaaS solutions are deployed within 1 to 2 weeks. Custom website and app development timelines range from 2 to 6 weeks depending on scope. Social media, marketing, and video creation operate on flexible monthly retainers."
  },
  {
    question: "Will my website show up on Google, Google Analytics, and ChatGPT AI Search?",
    answer: "Yes, 100%! All our websites and web platforms come pre-configured with Google Analytics 4 (GA4), Google Search Console indexing, complete SEO meta tags, and structured schema data so your business is discoverable across Google Search, ChatGPT, Perplexity, and AI search engines."
  },
  {
    question: "Who owns the source code, media assets, and designs?",
    answer: "Once full payment is completed, 100% complete ownership and intellectual property rights of all custom source code, brand designs, raw video files, and campaign assets are transferred directly to you."
  },
  {
    question: "What is the difference between your Custom and Prebuilt SaaS options?",
    answer: "Our Prebuilt SaaS solutions are ready-to-launch platforms pre-tested for immediate market entry within 1 to 2 weeks. Custom Development is built entirely from scratch to match your unique enterprise requirements and workflow."
  },
  {
    question: "Do you offer post-launch support and monthly retainers?",
    answer: "Yes, every custom project includes 30 days of free technical support and bug fixes post-launch. For continuous growth, video production, and social media handling, we provide dedicated monthly retainer plans."
  }
];

export default function FaqAccordion({ faqs, badge = "Common Inquiries" }) {
  const [openIndex, setOpenIndex] = useState(null);
  const displayFaqs = faqs || DEFAULT_FAQS;

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Split FAQs into two independent columns for 2-column grid layout
  const leftCol = displayFaqs.filter((_, i) => i % 2 === 0);
  const rightCol = displayFaqs.filter((_, i) => i % 2 === 1);

  const renderFaqCard = (faq) => {
    const originalIndex = displayFaqs.indexOf(faq);
    const isOpen = openIndex === originalIndex;

    return (
      <div 
        key={originalIndex} 
        className={`relative border rounded-2xl bg-white overflow-hidden transition-all duration-300 group ${
          isOpen 
            ? "border-red-200 shadow-[0_12px_30px_-10px_rgba(220,38,38,0.06)]" 
            : "border-gray-150/70 hover:border-red-100 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.03)]"
        }`}
      >
        {/* Active Left Indicator Strip */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-[4px] bg-red-600 transition-transform duration-300 ${
            isOpen ? "scale-y-100" : "scale-y-0"
          }`} 
        />

        <button
          onClick={() => toggleFaq(originalIndex)}
          className={`w-full flex justify-between items-center px-6 py-5 text-left font-semibold transition-colors focus:outline-none ${
            isOpen ? "text-red-600 bg-red-50/5" : "text-gray-800 hover:text-red-600"
          }`}
        >
          <div className="flex items-center pr-4">
            {/* Number Index */}
            <span 
              className={`font-mono text-xs sm:text-sm mr-3.5 transition-colors duration-300 ${
                isOpen ? "text-red-600 font-bold" : "text-gray-400 group-hover:text-red-500/70"
              }`}
            >
              {String(originalIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-base sm:text-lg tracking-tight">{faq.question}</span>
          </div>
          <div className={`p-1.5 rounded-full transition-all duration-300 shrink-0 ${
            isOpen ? "bg-red-50 text-red-600 rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-600"
          }`}>
            <ChevronDown size={18} />
          </div>
        </button>
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-[300px] border-t border-gray-50" : "max-h-0"
          }`}
        >
          <p className="px-6 py-5 text-gray-600 text-sm sm:text-base leading-relaxed bg-neutral-50/20 pl-[48px] sm:pl-[56px]">
            {faq.answer}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section className="relative py-16 sm:py-20 w-full font-[Matter]" id="faq">
      {/* Background Dotted Grid Overlay & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:16px_28px] -z-10" />
      <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-red-50/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-neutral-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
            {badge}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full items-start">
          {/* Left Column Stack */}
          <div className="space-y-5 flex flex-col w-full">
            {leftCol.map((faq) => renderFaqCard(faq))}
          </div>

          {/* Right Column Stack */}
          <div className="space-y-5 flex flex-col w-full">
            {rightCol.map((faq) => renderFaqCard(faq))}
          </div>
        </div>
      </div>
    </section>
  );
}
