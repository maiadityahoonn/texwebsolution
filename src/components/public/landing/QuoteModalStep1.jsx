"use client";

import { User, Phone, Mail, MapPin, Building, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { INDIAN_STATES, COUNTRY_CODES, validatePhoneNumber } from "./quoteModalConstants";

export default function QuoteModalStep1({ formData, onChange, onNext, error }) {
  const phoneValidation = formData.phone ? validatePhoneNumber(formData.phone, formData.country_code) : null;
  const isIndia = !formData.country_code || formData.country_code === "+91";
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === (formData.country_code || "+91")) || COUNTRY_CODES[0];

  return (
    <div className="space-y-3.5 pt-1 overscroll-contain">
      {/* 1. Full Name Input (Full Row) */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-800 font-[Matter]">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
          />
        </div>
      </div>

      {/* 2. WhatsApp / Mobile Number (Full Width Row) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            WhatsApp / Mobile Number <span className="text-red-500">*</span>
          </label>
          {phoneValidation && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] min-[375px]:text-[10.5px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                phoneValidation.isValid
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}
            >
              {phoneValidation.isValid ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified Format</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{phoneValidation.message}</span>
                </>
              )}
            </span>
          )}
        </div>

        <div className="relative flex">
          {/* Compact Country Code Dropdown */}
          <div className="relative shrink-0 flex items-center">
            {/* Visual compact badge showing flag + code */}
            <div className="flex items-center gap-1 h-full pl-2.5 pr-2 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200/80 border border-r-0 border-gray-200 rounded-l-xl text-gray-900 font-bold text-xs sm:text-sm font-[Matter] select-none pointer-events-none whitespace-nowrap transition">
              <span className="text-sm leading-none">{selectedCountry.flag}</span>
              <span className="leading-none text-gray-800">{formData.country_code || "+91"}</span>
              <span className="text-gray-400 text-[8px] leading-none ml-0.5">▼</span>
            </div>

            {/* Invisible native select overlay for full accessible picker list */}
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

          {/* Number Input with live formatting - gets all remaining space */}
          <input
            type="tel"
            required
            maxLength={isIndia ? 10 : 15}
            placeholder={isIndia ? "98765 43210 (10 Digits)" : "Enter Mobile Number"}
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, ""))}
            className="w-full min-w-0 px-3 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
          />
        </div>

        <p className="text-[10px] min-[375px]:text-[10.5px] text-emerald-700 font-medium font-poppins flex items-center gap-1 pt-0.5">
          <span>🔒 Direct WhatsApp par architecture & quote bhejenge (Zero spam)</span>
        </p>
      </div>

      {/* 3. Email Address (Full Width Row Below WhatsApp) */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-800 font-[Matter]">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            required
            placeholder="name@business.com"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
          />
        </div>
      </div>

      {/* 4. State & City Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* State */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            State <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              required
              value={formData.state}
              onChange={(e) => onChange("state", e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition appearance-none cursor-pointer"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Bhopal, Indore, Delhi"
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium font-poppins animate-shake">
          {error}
        </div>
      )}

      {/* Next Step Button */}
      <div className="pt-1.5">
        <button
          type="button"
          onClick={onNext}
          className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-[375px]:py-3 sm:py-3.5 px-3 min-[375px]:px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-[1.01] active:scale-98 shadow-md shadow-red-600/25 cursor-pointer font-[Matter]"
        >
          <span className="whitespace-nowrap text-xs sm:text-sm">Continue to Project Scope (Step 2 of 2)</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}
