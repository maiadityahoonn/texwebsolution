"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Crown,
  ArrowRight,
  Gift,
  Calculator,
  Sparkles
} from "lucide-react";

const CURRENCIES = {
  inr: {
    code: "INR",
    symbol: "₹",
    label: "🇮🇳 INR (₹)",
    monthly: {
      basic: { price: "999", display: "₹999", period: "/ month", subText: "Billed monthly" },
      standard: { price: "2,499", display: "₹2,499", period: "/ month", subText: "Billed monthly" },
      premium: { price: "8,499", display: "₹8,499", period: "/ month", subText: "Billed monthly" },
    },
    yearly: {
      basic: { price: "9,999", display: "₹9,999", period: "/ year", equivalent: "₹833/mo", savings: "Save ₹1,989 (2 Mos Free)", subText: "Billed annually" },
      standard: { price: "24,999", display: "₹24,999", period: "/ year", equivalent: "₹2,083/mo", savings: "Save ₹4,989 (2 Mos Free)", subText: "Billed annually" },
      premium: { price: "84,999", display: "₹84,999", period: "/ year", equivalent: "₹7,083/mo", savings: "Save ₹16,989 (2 Mos Free)", subText: "Billed annually" },
    },
  },
  usd: {
    code: "USD",
    symbol: "$",
    label: "🇺🇸 USD ($)",
    monthly: {
      basic: { price: "29", display: "$29", period: "/ month", subText: "Billed monthly" },
      standard: { price: "49", display: "$49", period: "/ month", subText: "Billed monthly" },
      premium: { price: "169", display: "$169", period: "/ month", subText: "Billed monthly" },
    },
    yearly: {
      basic: { price: "290", display: "$290", period: "/ year", equivalent: "$24/mo", savings: "Save $58 (2 Mos Free)", subText: "Billed annually" },
      standard: { price: "490", display: "$490", period: "/ year", equivalent: "$40/mo", savings: "Save $98 (2 Mos Free)", subText: "Billed annually" },
      premium: { price: "1,690", display: "$1,690", period: "/ year", equivalent: "$140/mo", savings: "Save $338 (2 Mos Free)", subText: "Billed annually" },
    },
  },
};

export default function HomePricingSection() {
  const [selectedCurrency, setSelectedCurrency] = useState("inr");
  const [selectedBilling, setSelectedBilling] = useState("monthly"); // "monthly" | "yearly"

  const curr = CURRENCIES[selectedCurrency] || CURRENCIES.inr;
  const activePlans = selectedBilling === "yearly" ? curr.yearly : curr.monthly;

  const getWhatsAppLink = (planName, planKey) => {
    const plan = activePlans[planKey];
    const billingText = selectedBilling === "yearly" ? "Yearly Offer (2 Months Free)" : "Monthly Subscription";
    const msg = `Hi TexWeb Team! I am interested in the ${planName} Plan (${plan.display} - ${billingText}). Please share more details and help me get started.`;
    return `https://wa.me/917462827259?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section 
      id="home-pricing" 
      className="relative w-full py-10 sm:py-12 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 text-gray-900 overflow-hidden font-poppins"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Background Tech Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-100/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Pricing Plans</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1 mb-2">
            Transparent Pricing &amp; Flexible Plans
          </h2>

          <p className="text-sm sm:text-base text-gray-500 font-light font-poppins max-w-xl mx-auto">
            Choose the perfect system for your business with zero hidden fees and no heavy upfront capital.
          </p>
        </div>

        {/* Billing & Currency Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-10">
          
          {/* Monthly / Yearly Switch */}
          <div className="inline-flex p-1.5 bg-neutral-100 border border-gray-200 rounded-full shadow-inner gap-1">
            <button
              onClick={() => setSelectedBilling("monthly")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                selectedBilling === "monthly"
                  ? "bg-white text-gray-950 shadow-md shadow-black/5"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setSelectedBilling("yearly")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${
                selectedBilling === "yearly"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <span>Yearly Offer</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                selectedBilling === "yearly" ? "bg-white text-red-600" : "bg-emerald-100 text-emerald-700"
              }`}>
                2 Mos Free
              </span>
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-neutral-100 border border-gray-200 rounded-full shadow-inner gap-1">
              {Object.entries(CURRENCIES).map(([key, c]) => {
                const active = selectedCurrency === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCurrency(key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      active
                        ? "bg-red-600 text-white shadow-md shadow-red-600/25 scale-[1.03]"
                        : "text-gray-700 hover:text-black hover:bg-white/70"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 items-stretch mb-12">
          
          {/* 1. BASIC PLAN */}
          <div className="relative rounded-[32px] bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  Basic Plan
                </span>
                {selectedBilling === "yearly" && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Gift className="w-3 h-3 text-emerald-600" />
                    2 Mos Free
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-950 transition-all">{activePlans.basic.display}</span>
                <span className="text-sm font-medium text-gray-500">{activePlans.basic.period}</span>
              </div>

              {selectedBilling === "yearly" ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="font-bold text-emerald-600">{activePlans.basic.savings}</span>
                  <span>• Equivalent to {activePlans.basic.equivalent}</span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-400">{activePlans.basic.subText}</p>
              )}

              <p className="mt-3 text-xs font-semibold text-red-600 uppercase tracking-wide">
                Digital Presence + Basic Management
              </p>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                Best for small businesses &amp; clinics who want a credible online presence without upfront costs.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-xs sm:text-sm text-gray-700 mb-8">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Custom Branded Website</strong> (Fast &amp; Mobile-optimized)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Domain &amp; Cloud Hosting Included</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Online Appointment / Inquiry Booking</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Customer / Patient Database</strong> &amp; Records</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Owner Admin Dashboard</strong> (Phone &amp; Laptop)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Ongoing Maintenance</strong>, Backups &amp; Security</span>
                </li>
              </ul>

              <a
                href={getWhatsAppLink("Basic", "basic")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-gray-900 text-white font-semibold text-center text-sm hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-red-600/20 flex items-center justify-center gap-2 group"
              >
                <img src="/common/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Start Basic at {activePlans.basic.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* 2. STANDARD PLAN (MOST POPULAR) */}
          <div className="relative rounded-[32px] bg-gradient-to-b from-red-600 to-red-700 p-[2px] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col transform md:-translate-y-2">
            <div className="bg-white rounded-[30px] p-6 sm:p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
              
              {/* Popular Ribbon */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-6 rounded-bl-2xl shadow-sm flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  Most Popular
                </div>
              </div>

              <div>
                <div className="mb-6 pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Standard Plan
                    </span>
                    {selectedBilling === "yearly" && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Gift className="w-3 h-3 text-emerald-600" />
                        2 Mos Free
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-gray-950 transition-all">{activePlans.standard.display}</span>
                    <span className="text-sm font-medium text-gray-500">{activePlans.standard.period}</span>
                  </div>

                  {selectedBilling === "yearly" ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <span className="font-bold text-emerald-600">{activePlans.standard.savings}</span>
                      <span>• Equivalent to {activePlans.standard.equivalent}</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">{activePlans.standard.subText}</p>
                  )}

                  <p className="mt-3 text-xs font-semibold text-red-600 uppercase tracking-wide">
                    Digital + Automation + Operations
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Best for growing businesses &amp; institutes wanting to automate daily operations and payments.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-red-600 stroke-[3]" />
                    <span>Everything in Basic, plus:</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-700 mb-8">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>24/7 Automated Online Slot Booking</strong></span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Payment Gateway Integration</strong> (UPI, Cards)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>WhatsApp Automation</strong> (Instant alerts &amp; reminders)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Staff / Employee Management</strong> with roles</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Google Business Profile (GMB)</strong> &amp; Local SEO</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Priority Technical Support</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              <a
                href={getWhatsAppLink("Standard", "standard")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-red-600 text-white font-semibold text-center text-sm hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 group"
              >
                <img src="/common/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Get Standard at {activePlans.standard.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* 3. PREMIUM PLAN */}
          <div className="relative rounded-[32px] bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  Premium Plan
                </span>
                {selectedBilling === "yearly" && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Gift className="w-3 h-3 text-emerald-600" />
                    2 Mos Free
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-950 transition-all">{activePlans.premium.display}</span>
                <span className="text-sm font-medium text-gray-500">{activePlans.premium.period}</span>
              </div>

              {selectedBilling === "yearly" ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="font-bold text-emerald-600">{activePlans.premium.savings}</span>
                  <span>• Equivalent to {activePlans.premium.equivalent}</span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-400">{activePlans.premium.subText}</p>
              )}

              <p className="mt-3 text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Full AI Powerhouse &amp; Expansion
              </p>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                Complete enterprise-grade solution with 24/7 AI Chatbot, review automations, and multi-location management.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>Everything in Standard, plus:</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700 mb-8">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>24/7 Smart AI Chatbot</strong> for instant lead capture</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Google 5-Star Reviews Automation</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Multi-Branch &amp; Multi-Staff</strong> Management</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Advanced WhatsApp Funnels</strong> &amp; Drips</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>AEO (ChatGPT &amp; AI Search)</strong> Optimization</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Dedicated VIP Account Manager</strong></span>
                  </li>
                </ul>
              </div>

              <a
                href={getWhatsAppLink("Premium", "premium")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-gray-900 text-white font-semibold text-center text-sm hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-red-600/20 flex items-center justify-center gap-2 group"
              >
                <img src="/common/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Start Premium at {activePlans.premium.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* See More / View All Pricing Plans & Cost Calculator CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 hover:scale-105 active:scale-95 group"
          >
            <span>See More Plans &amp; Comparison Table</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <Link
            href="/pricing#pricing-calculator"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 hover:text-red-600 text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-sm"
          >
            <Calculator className="w-4 h-4 text-red-600" />
            <span>Interactive Cost Calculator</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
