"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, ShieldCheck, ArrowLeft, ArrowUpRight } from "lucide-react";
import { trackMetaEvent } from "@/components/public/landing/landingTracking";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";
  const service = searchParams.get("service") || "Web / App Development";

  useEffect(() => {
    // Fire Meta pixel Lead event on thank-you page arrival for 100% URL-based conversion accuracy
    trackMetaEvent("Lead", {
      content_name: service,
      source: "thank_you_page",
      currency: "INR",
      value: 35000,
    });
    trackMetaEvent("CompleteRegistration", {
      status: "successful",
      service,
    });
  }, [service]);

  const whatsappMessage = `Hi TexWeb Solution, I just submitted a quote request for ${service}.${
    name ? ` My name is ${name}.` : ""
  } Can we discuss the architecture roadmap?`;

  const whatsappUrl = `https://wa.me/+917462827259?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-2.5 min-[375px]:p-3 sm:p-6 py-4 sm:py-10">
      {/* Background ambient blurs */}
      <div className="absolute top-1/4 left-1/3 w-64 sm:w-80 h-64 sm:h-80 bg-red-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 sm:w-80 h-64 sm:h-80 bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Card */}
      <div 
        className="w-full max-w-md bg-white border border-gray-100/90 rounded-2xl sm:rounded-3xl p-3.5 min-[375px]:p-4.5 sm:p-8 shadow-xl text-center space-y-3 sm:space-y-4 relative overflow-hidden animate-fadeIn"
        style={{ fontFamily: "Matter, sans-serif" }}
      >
        {/* Top Gradient Stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-red-500" />

        {/* Checkmark Icon & Success Badge */}
        <div className="space-y-1.5">
          <div className="w-11 h-11 min-[375px]:w-12 min-[375px]:h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-6 h-6 min-[375px]:w-6.5 min-[375px]:h-6.5 stroke-[2.5]" />
          </div>
          <span className="inline-block px-2.5 py-0.5 bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] min-[375px]:text-[11px] font-bold rounded-full font-[Matter] whitespace-nowrap">
            Inquiry Received Successfully
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-1 sm:space-y-1.5">
          <h1 className="text-lg min-[375px]:text-xl sm:text-2xl font-extrabold text-gray-950 font-[Matter] tracking-tight leading-tight">
            Thank You{name ? `, ${name}` : ""}!
          </h1>
          <p className="text-[11px] min-[375px]:text-xs text-gray-600 font-poppins max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            We have received your requirements for{" "}
            <strong className="text-gray-900 font-semibold">{service}</strong>. Our sales team will connect with you shortly.
          </p>
        </div>

        {/* 15-Min Response Guarantee Banner */}
        <div className="p-2.5 min-[375px]:p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-left space-y-1 text-xs font-poppins text-emerald-950">
          <div className="flex items-center gap-1.5 font-bold text-xs min-[375px]:text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="whitespace-nowrap">Response within 15 Minutes Guaranteed</span>
          </div>
          <p className="text-[10px] min-[375px]:text-[11px] text-emerald-800 leading-snug pl-5">
            Our team will review your requirements and reach out on your mobile number.
          </p>
        </div>

        {/* WhatsApp Action Button */}
        <div className="space-y-1.5 pt-0.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackMetaEvent("Contact", { method: "whatsapp_after_thank_you" })}
            className="w-full py-2.5 min-[375px]:py-3 px-2 min-[375px]:px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-bold text-[11px] min-[375px]:text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 min-[375px]:gap-2 cursor-pointer font-[Matter] whitespace-nowrap"
          >
            <Image
              src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
              alt="WhatsApp"
              width={18}
              height={18}
              className="w-4 h-4 min-[375px]:w-4.5 min-[375px]:h-4.5 object-contain shrink-0"
            />
            <span className="whitespace-nowrap">Chat on WhatsApp with Team ➔</span>
          </a>
          <p className="text-[9.5px] min-[375px]:text-[10px] text-gray-400 font-poppins">
            Need an urgent quote? Connect directly with us on WhatsApp
          </p>
        </div>

        {/* Secondary Navigation Actions (2-Col on all viewports) */}
        <div className="grid grid-cols-2 gap-2 pt-0.5 text-xs font-[Matter]">
          <Link
            href="/"
            className="py-2 px-1.5 min-[375px]:px-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold inline-flex items-center justify-center gap-1 transition border border-gray-200/80 text-[10.5px] min-[375px]:text-xs whitespace-nowrap"
          >
            <ArrowLeft className="w-3 h-3 text-gray-500 shrink-0" />
            <span className="whitespace-nowrap">Homepage</span>
          </Link>
          <Link
            href="/get-quote#portfolio-section"
            className="py-2 px-1.5 min-[375px]:px-2.5 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-700 font-semibold inline-flex items-center justify-center gap-1 transition border border-red-200/60 text-[10.5px] min-[375px]:text-xs whitespace-nowrap"
          >
            <span className="whitespace-nowrap">Live Portfolio</span>
            <ArrowUpRight className="w-3 h-3 text-red-600 shrink-0" />
          </Link>
        </div>

        {/* Trust Badges Footer */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-gray-500 font-poppins">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[10px] min-[375px]:text-[10.5px] text-gray-500 whitespace-nowrap">
            100% Privacy & Zero Spam Guarantee
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-sm text-gray-500">Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
