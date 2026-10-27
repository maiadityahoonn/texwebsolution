"use client";

import { User, Phone, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { COUNTRY_CODES, validatePhoneNumber } from "./quoteModalConstants";

export default function QuoteModalStep1({ formData, onChange, onNext, error }) {
  const phoneValidation = formData.phone ? validatePhoneNumber(formData.phone, formData.country_code) : null;
  const isIndia = !formData.country_code || formData.country_code === "+91";
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === (formData.country_code || "+91")) || COUNTRY_CODES[0];

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Form Fields Container (Optimized for 320px, 375px, 425px, 768px) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-0.5 min-[375px]:p-1 pr-1 space-y-3 min-[375px]:space-y-3.5 scrollbar-thin overscroll-contain touch-pan-y">
        
        {/* Step Context Pill */}
        <div className="p-2 min-[375px]:p-2.5 bg-red-50/70 border border-red-100 rounded-xl flex flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-1 text-xs font-poppins">
          <span className="text-gray-700 font-medium text-[10.5px] min-[375px]:text-xs">
            Enter your details for instant architecture & pricing
          </span>
          <span className="text-red-600 font-bold font-[Matter] text-[10px] min-[375px]:text-[11px] px-2 py-0.5 bg-white rounded-full border border-red-200 shrink-0">
            Step 1 of 2
          </span>
        </div>

        {/* 1. Full Name Input */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 min-[375px]:pl-10 pr-3.5 py-2.5 min-[375px]:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
            />
          </div>
        </div>

        {/* 2. WhatsApp / Mobile Number Input */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className="block text-xs font-bold text-gray-800 font-[Matter]">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            {phoneValidation && (
              <span
                className={`inline-flex items-center gap-1 text-[9.5px] min-[375px]:text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                  phoneValidation.isValid
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}
              >
                {phoneValidation.isValid ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Verified Format</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{phoneValidation.message}</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="relative flex">
            {/* Country Code Dropdown */}
            <div className="relative shrink-0 flex items-center">
              <div className="flex items-center gap-1 h-full pl-2.5 pr-1.5 min-[375px]:pl-3 min-[375px]:pr-2 py-2.5 min-[375px]:py-3 bg-gray-100 hover:bg-gray-200/80 border border-r-0 border-gray-200 rounded-l-xl text-gray-900 font-bold text-xs sm:text-sm font-[Matter] select-none pointer-events-none whitespace-nowrap transition">
                <span className="text-xs min-[375px]:text-sm leading-none">{selectedCountry.flag}</span>
                <span className="leading-none text-gray-800 text-xs sm:text-sm">{formData.country_code || "+91"}</span>
                <span className="text-gray-400 text-[8px] leading-none ml-0.5">▼</span>
              </div>

              <select
                value={formData.country_code || "+91"}
                onChange={(e) => onChange("country_code", e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                aria-label="Select Country Code"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.country} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Number Input */}
            <input
              type="tel"
              required
              maxLength={isIndia ? 10 : 15}
              placeholder={isIndia ? "98765 43210 (10 Digits)" : "Enter Mobile Number"}
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDown}
              className="w-full min-w-0 px-2.5 min-[375px]:px-3.5 py-2.5 min-[375px]:py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
            />
          </div>

          <p className="text-[10px] min-[375px]:text-[11px] text-emerald-700 font-medium font-poppins flex items-center gap-1.5 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Direct WhatsApp par architecture roadmap bhejenge (Zero spam)</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-2.5 min-[375px]:p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium font-poppins animate-shake flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Next Step Button (Pinned at bottom, responsive for 320px to 768px) */}
      <div className="shrink-0 pt-2.5 min-[375px]:pt-3 mt-auto border-t border-gray-100">
        <button
          type="button"
          onClick={onNext}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 min-[375px]:py-3 sm:py-3.5 px-3 min-[375px]:px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-red-600/25 cursor-pointer font-[Matter]"
        >
          <span className="hidden min-[360px]:inline">Continue to Step 2: Project Scope</span>
          <span className="min-[360px]:hidden">Continue to Step 2</span>
          <ArrowRight className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}
