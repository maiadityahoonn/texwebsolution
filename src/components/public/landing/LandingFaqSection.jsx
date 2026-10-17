"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How quickly can my website or mobile app go live?",
    a: "Standard business websites and e-commerce portals are typically launched within 7 to 14 days. For custom mobile apps and complex SaaS platforms, we provide agile milestone deliveries where you can preview functional working modules every 5 days."
  },
  {
    q: "How does the ₹1,999/month pricing work? Are there hidden costs?",
    a: "Zero hidden costs. The ₹1,999/mo plan includes full website development, high-speed cloud hosting, .in/.com domain, SSL certificate, daily automated backups, and ongoing technical maintenance. You don't have to pay tens of thousands upfront."
  },
  {
    q: "Do I get full ownership of the source code and database?",
    a: "Yes, 100%. Once completed, you own all source code, design assets, databases, and domain registrations. There are no proprietary lock-ins or hostage fees."
  },
  {
    q: "Will my website be optimized for Google Search and Meta Ads?",
    a: "Absolutely. All our websites are built on modern Next.js with server-side rendering, JSON-LD schema, 95+ Google PageSpeed performance, and built-in Meta Pixel & Google Analytics event tracking."
  },
  {
    q: "What if I don't have technical knowledge? Who will maintain it?",
    a: "You don't need any technical knowledge. Our team handles server configurations, security patches, backups, and content updates. You get a dedicated WhatsApp support desk for any instant change requests."
  },
  {
    q: "How do we get started after I submit the quote form?",
    a: "Within 15 minutes of submitting the form, our Lead Technical Architect will review your requirements, prepare a customized architecture roadmap with fixed pricing, and connect with you on WhatsApp or phone to finalize the project scope."
  }
];

export default function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-150" style={{ fontFamily: "Matter, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold mb-3">
            Got Questions?
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-base text-gray-500 font-poppins mt-2 font-light">
            Everything you need to know about working with TexWeb Solution.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen ? "border-red-600/30 bg-red-50/20 shadow-xs" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                    {faq.q}
                  </span>
                  <div className={`p-1.5 rounded-full transition-transform duration-200 ${isOpen ? "bg-red-100 text-red-600 rotate-180" : "bg-gray-100 text-gray-500"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-gray-600 font-poppins leading-relaxed font-light border-t border-red-100/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
