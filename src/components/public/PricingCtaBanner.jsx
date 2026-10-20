"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Calculator, ShieldCheck } from "lucide-react";

export default function PricingCtaBanner({
  badge = "Transparent & Scalable Plans",
  title = "Looking for Transparent & Affordable Pricing?",
  subtitle = "Choose from ready-to-deploy monthly plans starting at just ₹1,999/mo or calculate your custom project estimate in seconds.",
  serviceTag = "All Services",
  customWhatsappText = "Hi TexWeb Solution, I'd like to know more about your pricing and plans."
}) {
  return (
    <section className="w-full py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 font-[Matter] relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Main Banner Card */}
        <div className="relative rounded-2xl min-[360px]:rounded-3xl p-4 min-[360px]:p-6 sm:p-12 md:p-14 bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white border border-red-500/20 shadow-2xl shadow-red-950/30 overflow-hidden">
          {/* Tech Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 lg:gap-12 text-left">
            {/* Left Content */}
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 min-[360px]:px-3.5 min-[360px]:py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-semibold text-[11px] min-[360px]:text-xs sm:text-sm mb-3 sm:mb-4">
                <Sparkles className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{badge}</span>
              </div>

              <h3 className="text-xl min-[360px]:text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight text-left">
                {title}
              </h3>

              <p className="mt-2.5 sm:mt-4 text-gray-300 text-xs min-[360px]:text-sm sm:text-base font-light font-poppins leading-relaxed text-left">
                {subtitle}
              </p>

              {/* Highlights */}
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-start gap-2.5 min-[360px]:gap-4 sm:gap-6 text-xs sm:text-sm text-gray-300 text-left">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                  Plans from <strong className="text-white font-bold">₹1,999/month</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                  100% Zero Hidden Fees
                </span>
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-red-400 shrink-0" />
                  Instant Cost Calculator
                </span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-stretch gap-2.5 min-[360px]:gap-3.5 w-full sm:w-auto shrink-0">
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 min-[360px]:gap-2 px-4 min-[360px]:px-8 py-3 min-[360px]:py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs min-[360px]:text-sm sm:text-base transition-all duration-300 shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 group text-center whitespace-nowrap"
              >
                <span className="whitespace-nowrap">Explore All Pricing Plans</span>
                <ArrowRight className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href={`https://wa.me/+917462827259?text=${encodeURIComponent(customWhatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 min-[360px]:gap-2 px-3.5 min-[360px]:px-7 py-2.5 min-[360px]:py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs min-[360px]:text-sm font-medium transition-all duration-200 hover:scale-105 text-center whitespace-nowrap"
              >
                <Image width={64} height={64} src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg" alt="WhatsApp" className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 object-contain shrink-0" />
                <span className="whitespace-nowrap">Get Custom Quote</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
