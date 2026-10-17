"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, ShieldCheck, ArrowLeft } from "lucide-react";
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16">
      {/* Background ambient blurs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-red-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Card */}
      <div 
        className="w-full max-w-lg bg-white border border-gray-100 rounded-3xl p-7 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden animate-fadeIn"
        style={{ fontFamily: "Matter, sans-serif" }}
      >
        {/* Top Gradient Stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-red-500" />

        {/* Checkmark Icon */}
        <div className="w-20 h-20 bg-emerald-100/80 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-11 h-11" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2.5">
          <span className="inline-block px-3.5 py-1 bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold rounded-full font-[Matter]">
            Inquiry Received Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 font-[Matter] tracking-tight">
            Thank You{name ? `, ${name}` : ""}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-poppins max-w-md mx-auto leading-relaxed">
            We have received your requirements for{" "}
            <strong className="text-gray-900 font-semibold">{service}</strong>. Our sales team will connect with you shortly.
          </p>
        </div>

        {/* 15-Min Response Guarantee Banner */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-left space-y-2 text-xs font-poppins text-emerald-950">
          <div className="flex items-center gap-2 font-semibold">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Response within 15 Minutes Guaranteed</span>
          </div>
          <p className="text-[11.5px] text-emerald-800 leading-relaxed pl-6">
            Our sales team will review your requirements and reach out on your mobile number shortly.
          </p>
        </div>

        {/* WhatsApp Action Button */}
        <div className="space-y-3 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackMetaEvent("Contact", { method: "whatsapp_after_thank_you" })}
            className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer font-[Matter]"
          >
            <Image
              src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
              alt="WhatsApp"
              width={22}
              height={22}
              className="w-5 h-5 object-contain"
            />
            <span>Chat with Our Sales Team on WhatsApp</span>
          </a>
          <p className="text-[11px] text-gray-400 font-poppins">
            Need an urgent quote? Connect directly with our sales team on WhatsApp
          </p>
        </div>

        {/* Trust Badges & Return Link */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-poppins">
          <span className="inline-flex items-center gap-1.5 text-[11.5px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            100% Privacy & Zero Spam
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-gray-600 hover:text-red-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
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
