"use client";

import Image from "next/image";
import { Check, ShieldCheck, Zap, Sparkles, Award, Star } from "lucide-react";
import LandingQuoteForm from "./LandingQuoteForm";

export default function LandingHeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 bg-gradient-to-b from-gray-50/70 via-white to-gray-50/30">
      {/* Background glow orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Conversion Copy & Proof */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100/80 shadow-xs text-xs font-bold">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span>⚡ #1 Custom Web & App Engineering in India</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-gray-950 tracking-tight leading-[1.15]" style={{ fontFamily: "ClashDisplay, Matter, sans-serif" }}>
              Scale Your Business With High-Performance{" "}
              <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                Websites & Mobile Apps
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-gray-600 font-poppins leading-relaxed font-light">
              Stop losing customers to outdated software. From high-converting corporate websites and e-commerce stores to custom mobile apps and automated SaaS — delivered in <strong>7–14 days</strong> with transparent monthly plans from <strong>₹1,999/mo</strong>.
            </p>

            {/* 3 Core Value Bullet Points */}
            <div className="space-y-3 pt-1">
              {[
                { title: "7–14 Days Express Delivery", desc: "No endless delays. Guaranteed on-time launch with agile sprints." },
                { title: "Zero Heavy Upfront Cost", desc: "Flexible monthly packages starting at ₹1,999/mo with domain, hosting & SSL included." },
                { title: "100% Source Code & Database Ownership", desc: "You own full rights to your tech. Zero vendor lock-in." },
                { title: "Dedicated Full-Stack Tech Architect", desc: "Direct 1-on-1 WhatsApp & call communication with your lead developer." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">{item.title}</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-poppins font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Proof Counters */}
            <div className="pt-4 border-t border-gray-150 grid grid-cols-3 gap-3 text-center sm:text-left">
              <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-gray-900">80+</div>
                <div className="text-[11px] text-gray-500 font-medium">Delivered Projects</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-red-600">4.9★</div>
                <div className="text-[11px] text-gray-500 font-medium">Google & Meta Rating</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-600">99.8%</div>
                <div className="text-[11px] text-gray-500 font-medium">On-Time Delivery</div>
              </div>
            </div>

            {/* Trust logos preview strip */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-[11px] text-gray-400 font-medium">Trusted by leaders at:</span>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <span className="px-2 py-0.5 bg-gray-100 rounded-md">Heal Stride</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-md">Sarvadnya</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-md">Trend Kro</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-md">Anikara</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Converting Interactive Form */}
          <div className="lg:col-span-7 w-full">
            <LandingQuoteForm />
          </div>

        </div>
      </div>
    </section>
  );
}
