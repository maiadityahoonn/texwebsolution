"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Sparkles } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";

const LANDING_FAQS = [
  {
    category: "Website Development",
    question: "How long does it take to build a custom website, and what tech stack do you use?",
    answer: "Our custom websites and high-converting landing pages are delivered in 7 to 14 days. We engineer every project using Next.js & React with clean code, ensuring lightning-fast loading speeds, complete mobile responsiveness, Core Web Vitals compliance, and built-in technical SEO so your site ranks high on Google."
  },
  {
    category: "Website Development",
    question: "Do I get 100% source code ownership, and can I manage content myself?",
    answer: "Yes, 100%! Once delivered, you receive full intellectual property and source code ownership with zero vendor lock-in. We also provide an intuitive, easy-to-use custom admin CMS panel so you can update text, banners, products, and blogs without needing a developer."
  },
  {
    category: "App Development",
    question: "Do you publish our mobile app to both Google Play Store and Apple App Store?",
    answer: "Yes! We handle the entire end-to-end lifecycle from design and development to store listing, compliance, and guaranteed approval on both Google Play Store and Apple App Store. Our Flutter and React Native architecture ensures high-performance execution on both Android and iOS devices."
  },
  {
    category: "App Development",
    question: "What features are included in custom mobile apps (e.g. notifications, payments)?",
    answer: "Every custom mobile app comes equipped with secure cloud API backends, real-time push notifications, payment gateway integration (Razorpay, Stripe, UPI), secure user authentication, live tracking, and role-based admin controls designed to effortlessly handle thousands of active users."
  },
  {
    category: "Meta Ads",
    question: "How do your Meta Ads drive leads, and what ROAS can we expect?",
    answer: "We design hyper-targeted, high-CTR visual and video ad creatives, build audience retargeting funnels, and optimize daily to achieve the lowest Cost-Per-Lead (CPL). While results depend on your offer and industry, our clients typically see a 3x to 7x Return On Ad Spend (ROAS) with consistent qualified inbound leads."
  },
  {
    category: "Meta Ads",
    question: "How does ad budget management, Meta Pixel, and Conversions API (CAPI) work?",
    answer: "You pay your ad spend directly to Meta via your own business ad account for 100% financial transparency. We set up server-side Meta Conversions API (CAPI) and Pixel to bypass iOS privacy blocks, prevent ad budget leakage, and provide real-time conversion and lead attribution reporting."
  }
];

export default function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    const isOpening = openIndex !== index;
    setOpenIndex(isOpening ? index : null);
    if (isOpening) {
      trackMetaEvent("ViewContent", { content_type: "faq", faq_index: index });
    }
  };

  return (
    <section 
      id="landing-faq" 
      className="relative py-12 sm:py-16 bg-white overflow-hidden"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-neutral-100/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-xs rounded-full font-semibold text-xs sm:text-sm font-[Matter] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-950 via-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-poppins font-light leading-relaxed">
            Everything you need to know about our Website Development, Mobile Apps, and Meta Ads growth services.
          </p>
        </div>

        {/* 6 FAQs Accordion List */}
        <div className="space-y-3.5">
          {LANDING_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-red-600/40 bg-white shadow-md shadow-red-500/5 ring-1 ring-red-600/20"
                    : "border-gray-200 bg-white hover:border-gray-300 shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1 pr-2">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <h3 className={`text-sm sm:text-base font-bold transition-colors ${
                      isOpen ? "text-red-600" : "text-gray-900 hover:text-red-600"
                    }`}>
                      {faq.question}
                    </h3>
                  </div>

                  <span className={`p-2 rounded-full shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 font-poppins font-light leading-relaxed border-t border-gray-100">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Direct Query CTA */}
        <div className="mt-8 sm:mt-10 text-center p-5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-gray-700 font-medium">
            Have a custom requirement or question not listed here?
          </p>
          <a
            href="https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20have%20a%20question%20about%20my%20website/app/meta%20ads%20project."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackMetaEvent("Contact", { method: "whatsapp", source: "faq_bottom" })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 shadow-xs cursor-pointer"
          >
            <Image
              src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
              alt="WhatsApp"
              width={16}
              height={16}
              className="w-4 h-4 object-contain brightness-0 invert"
            />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
