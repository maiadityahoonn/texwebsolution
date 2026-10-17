"use client";

import { Check, Sparkles, ArrowRight } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";

const PRICING_TIERS = [
  {
    name: "Starter Business",
    price: "₹1,999",
    period: "/month",
    usdPrice: "$49 /mo",
    badge: "Popular for Local Business",
    desc: "Everything you need to launch a modern, high-converting professional web presence with zero upfront headaches.",
    features: [
      "5–8 Mobile-Responsive Pages",
      "Free .in/.com Domain & Cloud Hosting",
      "Free SSL Certificate & Security Guard",
      "Google Business (GMB) & Local SEO",
      "WhatsApp & Direct Call Integration",
      "Daily Backups & 99.9% Uptime",
    ],
    highlight: false,
    ctaText: "Get Starter Quote",
  },
  {
    name: "Growth & E-Commerce",
    price: "₹4,999",
    period: "/month",
    usdPrice: "$99 /mo",
    badge: "Most Popular for Scaling",
    desc: "Complete dynamic business platform with online payments, customer lead forms, and marketing automation.",
    features: [
      "Full Dynamic E-Commerce or Portal",
      "Payment Gateway (Razorpay/Stripe)",
      "Automated WhatsApp Notifications",
      "Meta Ads & Google Analytics Pixel Ready",
      "Priority Tech Support & Updates",
      "Content Management & Admin Panel",
    ],
    highlight: true,
    ctaText: "Claim Growth Plan",
  },
  {
    name: "Custom App & SaaS",
    price: "Custom",
    period: "Fixed or Monthly",
    usdPrice: "From $299 /mo",
    badge: "Enterprise & Startups",
    desc: "Bespoke full-stack web and mobile application engineering built from scratch for scale and high traffic.",
    features: [
      "Custom iOS & Android Mobile Apps",
      "Full Database Architecture (Postgres/Supabase)",
      "AI Chatbot & Workflow Automation",
      "100% Source Code Ownership",
      "Dedicated Senior Solutions Architect",
      "Custom API Integrations & Webhooks",
    ],
    highlight: false,
    ctaText: "Discuss Custom App",
  },
];

export default function LandingPricingPreview() {
  const handleSelectPlan = (planName) => {
    trackMetaEvent("InitiateCheckout", { source: `pricing_plan_${planName}` });
    const el = document.getElementById("quote-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100" style={{ fontFamily: "Matter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Hidden Charges</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Transparent Pricing Plans For Every Stage
          </h2>
          <p className="text-xs sm:text-base text-gray-500 font-poppins mt-2 font-light">
            Choose a predictable monthly subscription or a fixed-price custom milestone contract.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                tier.highlight
                  ? "bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white shadow-2xl ring-2 ring-red-500 md:-translate-y-2"
                  : "bg-white border border-gray-200 text-gray-900 shadow-xs hover:shadow-lg"
              }`}
            >
              {tier.badge && (
                <div className={`inline-block self-start px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-4 ${
                  tier.highlight ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
                }`}>
                  {tier.badge}
                </div>
              )}

              <div className="space-y-4">
                <h3 className={`text-xl font-bold ${tier.highlight ? "text-white" : "text-gray-950"}`}>
                  {tier.name}
                </h3>
                <p className={`text-xs font-poppins font-light leading-relaxed ${tier.highlight ? "text-gray-300" : "text-gray-500"}`}>
                  {tier.desc}
                </p>

                <div className="py-2 border-y border-gray-150/20">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black">{tier.price}</span>
                    <span className={`text-xs ${tier.highlight ? "text-gray-400" : "text-gray-500"}`}>{tier.period}</span>
                  </div>
                  <div className={`text-[11px] font-medium mt-0.5 ${tier.highlight ? "text-red-400" : "text-gray-400"}`}>
                    International: {tier.usdPrice}
                  </div>
                </div>

                <ul className="space-y-2.5 pt-2">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs font-medium">
                      <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${tier.highlight ? "bg-red-500/20 text-red-400" : "bg-emerald-50 text-emerald-600"}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className={tier.highlight ? "text-gray-200" : "text-gray-700"}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-6 border-t border-gray-150/15">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(tier.name)}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tier.highlight
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-600/30"
                      : "bg-gray-900 hover:bg-black text-white"
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
