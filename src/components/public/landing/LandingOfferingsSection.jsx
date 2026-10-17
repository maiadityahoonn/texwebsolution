"use client";

import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles, PhoneCall } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";
import { CORE_OFFERINGS } from "./offeringsConstants";

export default function LandingOfferingsSection() {
  const handleSelectService = (serviceName, title) => {
    trackMetaEvent("LeadInterest", { service: title });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openQuoteModal", { detail: { service: serviceName, source: `offering_${title}` } }));
    }
  };

  return (
    <section 
      id="core-offerings" 
      className="relative py-8 sm:py-12 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-red-100/25 rounded-full blur-[90px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-rose-100/25 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-red-50 text-red-600 border border-red-100 shadow-xs rounded-full font-semibold text-xs sm:text-sm font-[Matter] mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Core Digital Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold bg-gradient-to-r from-gray-950 via-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-0.5 mb-2">
            What We Build & Scale for Businesses
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-poppins font-light leading-relaxed">
            High-performance custom engineering and ROI-driven marketing. Delivered in 7–14 days with 100% source code ownership.
          </p>
        </div>

        {/* Compact 6 Core Services Grid (3x2 on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CORE_OFFERINGS.map((item) => {
            const IconComponent = item.icon;
            const whatsappUrl = `https://wa.me/+917462827259?text=${encodeURIComponent(
              `Hi TexWeb Solution, I saw your Meta ad and want to enquire about ${item.title} for my business.`
            )}`;

            return (
              <div
                key={item.id}
                className="group relative bg-white border border-gray-200/90 hover:border-red-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/5 flex flex-col justify-between"
              >
                {/* Top Row: Icon + Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2.5 mb-3">
                    <div className={`p-2 sm:p-2.5 rounded-xl border ${item.iconBg} shadow-xs transition-transform duration-300 group-hover:scale-105`}>
                      <IconComponent className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 font-poppins font-light leading-relaxed mb-3">
                    {item.desc}
                  </p>

                  {/* Feature Highlights */}
                  <div className="space-y-1 mb-4 pt-1.5 border-t border-gray-100">
                    {item.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-700 font-poppins">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions: Primary Enquire + WhatsApp */}
                <div className="pt-2.5 border-t border-gray-150 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectService(item.formService, item.title)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-xs shadow-red-600/20 cursor-pointer"
                  >
                    <span>Get Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackMetaEvent("Contact", { method: "whatsapp", service: item.title, source: "offerings_card" })}
                    className="p-2 rounded-full border border-gray-200 hover:border-emerald-300 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-all shrink-0 cursor-pointer"
                    title={`Chat on WhatsApp about ${item.title}`}
                  >
                    <Image
                      src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
                      alt="WhatsApp"
                      width={16}
                      height={16}
                      className="w-4 h-4 object-contain"
                    />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Advisory Bar */}
        <div className="mt-6 sm:mt-8 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
              Need a custom software or marketing plan?
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-500 font-poppins font-light">
              Speak directly with our Lead Tech Architect. Free 15-minute scope & architecture review with 0 sales pressure.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectService("Custom Tech Architecture", "Custom Architecture")}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-full text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
            >
              Fill Enquiry Form ➔
            </button>
            <a
              href="tel:07554601839"
              onClick={() => trackMetaEvent("Contact", { method: "phone_call", source: "offerings_banner" })}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:text-blue-600 text-xs font-semibold text-gray-700"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>0755-4601839</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
