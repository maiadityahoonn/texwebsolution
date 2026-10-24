"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, PhoneCall, MapPin, Sparkles, ShieldCheck } from "lucide-react";

export default function LandingFooter() {
  const handleOpenQuote = (serviceName = "Website Development") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("openQuoteModal", {
          detail: { service: serviceName, source: `footer_${serviceName}` },
        })
      );
    }
  };

  const handleScrollToSection = (id) => {
    if (typeof document !== "undefined") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer
      className="relative border-t border-gray-200 overflow-hidden w-full bg-white text-left"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Col 1: Direct Contact & Fast Quote Box (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold font-[Matter] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                <span>TexWeb Solution • Direct Calling & Support</span>
              </div>
              
              <div className="space-y-2.5 text-sm sm:text-base font-semibold text-gray-800">
                <p>
                  <a
                    href="tel:07554601839"
                    className="inline-flex items-center gap-2.5 hover:text-red-600 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
                    <span>0755-4601839 (Calling Desk)</span>
                  </a>
                </p>
                <p>
                  <a
                    href="https://wa.me/+917462827259"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 hover:text-emerald-600 transition-colors"
                  >
                    <Image
                      width={18}
                      height={18}
                      src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
                      alt="WhatsApp"
                      className="w-4.5 h-4.5 object-contain shrink-0"
                    />
                    <span>+91 7462827259 (WhatsApp Support)</span>
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:info@texwebsolution.in"
                    className="inline-flex items-center gap-2.5 hover:text-red-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700 font-normal">info@texwebsolution.in</span>
                  </a>
                </p>
                <div className="pt-2 flex items-start gap-2.5 text-xs text-gray-600 font-poppins leading-relaxed">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    A3-405, Kokta Bypass Rd, opposite Transport Nagar, PMAY, Bhopal, Madhya Pradesh 462028
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Services & Quick Quote Links (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-gray-950 text-sm font-bold tracking-tight uppercase font-[Matter] flex items-center gap-2">
              <span>Services & Quotes</span>
              <span className="w-8 h-[2px] bg-red-600 rounded-full" />
            </h4>
            <nav className="space-y-2.5">
              {[
                { name: "Website Development Quote", service: "Website Development" },
                { name: "Website Redesign & Speed Fix", service: "Website Redesign" },
                { name: "Mobile App Development (Android/iOS)", service: "App Development (iOS/Android)" },
                { name: "E-Commerce + Meta Ads Bundle", service: "E-Commerce + Meta Ads" },
                { name: "Meta Ads & Lead Generation", service: "Meta Ads & Digital Marketing" },
                { name: "AI Chatbot & WhatsApp Automation", service: "AI Chatbot & Automation" },
                { name: "ERP, CRM & Business Systems", service: "ERP, CRM & Business Systems" },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleOpenQuote(item.service)}
                  className="block text-left text-xs sm:text-sm text-gray-600 hover:text-red-600 hover:translate-x-1 transition-all duration-200 cursor-pointer font-poppins"
                >
                  {item.name} ➔
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleScrollToSection("portfolio-section")}
                className="block text-left text-xs sm:text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors pt-1 cursor-pointer font-poppins"
              >
                View Live Websites & Apps Portfolio ↗
              </button>
            </nav>
          </div>

          {/* Col 3: Legal & Trust Compliance (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-gray-950 text-sm font-bold tracking-tight uppercase font-[Matter] flex items-center gap-2">
              <span>Trust & Compliance</span>
              <span className="w-8 h-[2px] bg-emerald-600 rounded-full" />
            </h4>
            <nav className="space-y-2.5">
              {[
                { name: "Privacy Policy (Meta Ads Compliant)", href: "/privacy" },
                { name: "Terms & Conditions", href: "/terms" },
                { name: "Refund & Delivery Policy", href: "/refund" },
                { name: "Data Deletion Protocol", href: "/data-deletion" },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-xs sm:text-sm text-gray-600 hover:text-red-600 transition-colors font-poppins"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Badges */}
            <div className="pt-3 space-y-2 text-xs font-poppins text-gray-600 border-t border-gray-100">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Code Ownership</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                All delivered code, IP & databases are 100% owned by the client with zero vendor lock-in.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Large Watermark Typography */}
      <div className="w-full flex justify-center pb-2 overflow-hidden px-4">
        <svg viewBox="65 0 1070 120" className="w-full h-auto select-none pointer-events-none">
          <defs>
            <linearGradient id="landing-watermark-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(229, 231, 235, 0.9)" />
              <stop offset="100%" stopColor="rgba(229, 231, 235, 0.1)" />
            </linearGradient>
          </defs>
          <text
            x="600"
            y="95"
            textAnchor="middle"
            fill="url(#landing-watermark-grad)"
            fontWeight="900"
            fontSize="104"
            fontFamily="Matter, sans-serif"
            letterSpacing="1"
          >
            TEXWEB SOLUTION
          </text>
        </svg>
      </div>

      {/* Bottom Bar for Copyright and Corporate CIN */}
      <div className="border-t border-gray-150/65 w-full pt-6 pb-28 md:pb-6 text-center text-xs text-gray-500 bg-gray-50/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <p className="font-poppins font-light text-gray-600">
            © 2026 TexWeb Solution Pvt. Ltd. All rights reserved.
          </p>
          <p className="font-mono text-[11px] sm:text-xs text-gray-500 font-medium">
            CIN: <span className="text-gray-800 font-semibold select-all">U85500WB2026PTC287896</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
