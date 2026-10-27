"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  User,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  Check,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { buildTrackingNotes, getTrackingParams, hasMetaAdAttribution, trackMetaEvent } from "./landingTracking";
import { trackOpenAiAdsEvent } from "./openAiAdsTracking";
import {
  SERVICE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
} from "./quoteFormConstants";
import { COUNTRY_CODES, validatePhoneNumber, buildWhatsAppQuoteUrl, getBudgetsForService } from "./quoteModalConstants";
import QuoteFormSuccess from "./QuoteFormSuccess";

export default function LandingQuoteForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    country_code: "+91",
    phone: "",
    business_name: "",
    business_type: "Retail Shop, Showroom & Products",
    service: "Website Development",
    budget: "₹25,000 - ₹45,000 (Standard Business & Profile Website)",
    timeline: "⚡ Urgent (2 - 7 Days)",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleServiceSelect = (e) => {
      if (e.detail) {
        const srv = e.detail;
        const bList = getBudgetsForService(srv);
        const defaultBudget = bList && bList[0]
          ? (bList[0].desc ? `${bList[0].amount} (${bList[0].desc})` : bList[0].amount)
          : "";
        setFormData((prev) => ({ ...prev, service: srv, budget: defaultBudget }));
      }
    };
    window.addEventListener("selectLandingService", handleServiceSelect);
    return () => window.removeEventListener("selectLandingService", handleServiceSelect);
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceSelect = (srv) => {
    const bList = getBudgetsForService(srv);
    const defaultBudget = bList && bList[0]
      ? (bList[0].desc ? `${bList[0].amount} (${bList[0].desc})` : bList[0].amount)
      : "";
    setFormData((prev) => ({ ...prev, service: srv, budget: defaultBudget }));
  };

  const handleStep1Next = (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const phoneValidation = validatePhoneNumber(formData.phone, formData.country_code);
    if (!phoneValidation.isValid) {
      setErrorMessage(phoneValidation.message);
      return;
    }

    trackMetaEvent("LeadFormInteraction", { step: 1 });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!formData.business_name?.trim()) {
      setErrorMessage("Please enter your business or company name.");
      return;
    }

    setLoading(true);

    try {
      const trackingParams = getTrackingParams();
      const sourceLabel = hasMetaAdAttribution(trackingParams)
        ? `Meta Ads (${trackingParams.utm_source || "paid"})`
        : "Website Form";

      const cleanPhoneDigits = formData.phone.replace(/\D/g, "");
      const fullPhone = `${formData.country_code || "+91"} ${cleanPhoneDigits}`;

      const notes = buildTrackingNotes({
        service: formData.service,
        budget: formData.budget,
        timeline: formData.timeline,
        extra: {
          "Business Name": formData.business_name.trim(),
          "Business Type": formData.business_type,
          "WhatsApp Number": fullPhone,
          "Landing Page": "/get-quote",
        },
      });

      const eventId = "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);

      const response = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: fullPhone,
          service: formData.service,
          source: sourceLabel,
          notes: notes,
          event_id: eventId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to submit your quote request right now.");
      }

      trackMetaEvent(
        "Lead",
        {
          content_name: formData.service,
          content_category: formData.business_type,
        },
        eventId
      );
      trackOpenAiAdsEvent("lead_created", { type: "customer_action" }, eventId);

      // Launch WhatsApp with prefilled quote details
      const whatsappUrl = buildWhatsAppQuoteUrl(formData);
      try {
        window.open(whatsappUrl, "_blank");
      } catch (_) {}

      const queryParams = new URLSearchParams({
        name: formData.name.trim(),
        service: formData.service || "Web / App Development",
        business: formData.business_name.trim(),
        budget: formData.budget || "",
        timeline: formData.timeline || "",
      }).toString();
      router.push(`/thank-you?${queryParams}`);
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage(err.message || "Failed to submit. Please try again or WhatsApp us directly.");
    } finally {
      setLoading(false);
    }
  };

  const phoneValidation = formData.phone ? validatePhoneNumber(formData.phone, formData.country_code) : null;
  const isIndia = !formData.country_code || formData.country_code === "+91";
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === (formData.country_code || "+91")) || COUNTRY_CODES[0];

  return (
    <section 
      id="quote-form-section" 
      className="relative pt-8 min-[375px]:pt-10 sm:pt-14 pb-10 min-[375px]:pb-12 sm:pb-16 text-center w-full overflow-hidden bg-gradient-to-b from-white via-gray-50/40 to-white"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-red-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-neutral-100/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Container: responsive padding for 320px, 375px, 425px, 768px */}
      <div className="max-w-3xl mx-auto px-2.5 min-[375px]:px-4 sm:px-6 lg:px-8 text-left">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
          <div className="inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-100 shadow-xs rounded-full font-semibold text-[11px] min-[375px]:text-xs sm:text-sm font-[Matter] mb-2 min-[375px]:mb-3">
            Get Free Architecture & Quote
          </div>
          <h2 className="text-xl min-[360px]:text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1 mb-1.5 sm:mb-2">
            Let&apos;s Build Your Next Digital Platform
          </h2>
          <p className="text-[11px] min-[375px]:text-xs sm:text-sm text-gray-500 font-poppins font-light leading-relaxed">
            Fill in your project details below. Our Lead Technical Architect will review your requirements and connect with a personalized scope, delivery timeline, and estimate.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto mt-3 sm:mt-4">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-red-600" : "bg-gray-200"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-red-600" : "bg-gray-200"}`} />
            <span className="text-[10px] min-[375px]:text-xs font-bold text-gray-500 font-[Matter]">Step {step} of 2</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-100 rounded-2xl min-[375px]:rounded-3xl p-3 min-[360px]:p-4 sm:p-8 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

          {!submitted ? (
            <div>
              {step === 1 ? (
                /* Step 1: Name & WhatsApp */
                <form onSubmit={handleStep1Next} className="space-y-4 sm:space-y-5">
                  <div className="p-2 min-[375px]:p-2.5 bg-red-50/70 border border-red-100 rounded-xl flex flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-1 text-xs font-poppins">
                    <span className="text-gray-700 font-medium text-[10.5px] min-[375px]:text-xs">
                      Step 1: Your Name & WhatsApp Number
                    </span>
                    <span className="text-red-600 font-bold font-[Matter] text-[10px] min-[375px]:text-[11px] px-2 py-0.5 bg-white rounded-full border border-red-200 shrink-0">
                      Step 1 of 2
                    </span>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        className="w-full pl-9 min-[375px]:pl-10 pr-3.5 py-2.5 min-[375px]:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
                      />
                    </div>
                  </div>

                  {/* WhatsApp / Phone Input */}
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
                      <div className="relative shrink-0 flex items-center">
                        <div className="flex items-center gap-1 h-full pl-2.5 pr-1.5 min-[375px]:pl-3 min-[375px]:pr-2 py-2.5 min-[375px]:py-3 bg-gray-100 hover:bg-gray-200/80 border border-r-0 border-gray-200 rounded-l-xl text-gray-900 font-bold text-xs sm:text-sm font-[Matter] select-none pointer-events-none whitespace-nowrap transition">
                          <span className="text-xs min-[375px]:text-sm leading-none">{selectedCountry.flag}</span>
                          <span className="leading-none text-gray-800 text-xs sm:text-sm">{formData.country_code || "+91"}</span>
                          <span className="text-gray-400 text-[8px] leading-none ml-0.5">▼</span>
                        </div>

                        <select
                          value={formData.country_code || "+91"}
                          onChange={(e) => handleFieldChange("country_code", e.target.value)}
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

                      <input
                        type="tel"
                        required
                        maxLength={isIndia ? 10 : 15}
                        placeholder={isIndia ? "98765 43210 (10 Digits)" : "Enter Mobile Number"}
                        value={formData.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value.replace(/\D/g, ""))}
                        className="w-full min-w-0 px-2.5 min-[375px]:px-3.5 py-2.5 min-[375px]:py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
                      />
                    </div>

                    <p className="text-[10px] min-[375px]:text-[11px] text-emerald-700 font-medium font-poppins flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Direct WhatsApp par architecture & quotation bhejenge (Zero spam)</span>
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 min-[375px]:p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium font-poppins flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="pt-1 sm:pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 min-[375px]:py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer font-[Matter]"
                    >
                      <span className="hidden min-[360px]:inline">Continue to Step 2: Project Scope</span>
                      <span className="min-[360px]:hidden">Continue to Step 2</span>
                      <ArrowRight className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 shrink-0" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Business & Project Scope */
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="p-2 min-[375px]:p-2.5 bg-red-50/70 border border-red-100 rounded-xl flex flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-1 text-xs font-poppins">
                    <span className="text-gray-700 font-medium text-[10.5px] min-[375px]:text-xs">
                      Step 2: Business & Project Scope
                    </span>
                    <span className="text-red-600 font-bold font-[Matter] text-[10px] min-[375px]:text-[11px] px-2 py-0.5 bg-white rounded-full border border-red-200 shrink-0">
                      Step 2 of 2
                    </span>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                      Business / Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Retail, Dr. Sharma Clinic"
                        value={formData.business_name || ""}
                        onChange={(e) => handleFieldChange("business_name", e.target.value)}
                        className="w-full pl-9 min-[375px]:pl-10 pr-3.5 py-2.5 min-[375px]:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
                      />
                    </div>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                      What type of business do you run? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1 min-[375px]:gap-1.5 sm:gap-2 pt-0.5">
                      {BUSINESS_TYPE_OPTIONS.map((bt) => (
                        <button
                          type="button"
                          key={bt}
                          onClick={() => handleFieldChange("business_type", bt)}
                          className={`px-2.5 min-[375px]:px-3 py-1.5 rounded-xl text-[10.5px] min-[375px]:text-xs font-semibold font-[Matter] transition-all cursor-pointer ${
                            formData.business_type === bt
                              ? "bg-gray-900 text-white shadow-xs"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Services Selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                      What do you need? (Our Services) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1 min-[375px]:gap-1.5 sm:gap-2 pt-0.5">
                      {SERVICE_OPTIONS.map((srv) => (
                        <button
                          type="button"
                          key={srv}
                          onClick={() => handleServiceSelect(srv)}
                          className={`px-2.5 min-[375px]:px-3.5 py-1.5 min-[375px]:py-2 rounded-xl text-[10.5px] min-[375px]:text-xs font-semibold font-[Matter] transition-all cursor-pointer ${
                            formData.service === srv
                              ? "bg-red-600 text-white shadow-md shadow-red-600/20 scale-[1.02]"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {srv}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget (Dynamic based on selected service) */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                        Expected Budget for {formData.service || "Website Development"} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9.5px] min-[375px]:text-[10px] text-emerald-700 font-semibold font-[Matter] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        Tailored for {formData.service || "selected service"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-1.5 min-[375px]:gap-2 pt-0.5">
                      {getBudgetsForService(formData.service).map((b) => {
                        const budgetValue = b.desc ? `${b.amount} (${b.desc})` : b.amount;
                        const isSelected =
                          formData.budget === budgetValue ||
                          (formData.budget && (formData.budget === b.amount || formData.budget.startsWith(b.amount)));
                        return (
                          <button
                            type="button"
                            key={b.amount}
                            onClick={() => handleFieldChange("budget", budgetValue)}
                            className={`p-2 min-[375px]:p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-red-50/90 border-red-600 text-gray-950 shadow-xs ring-1 ring-red-600/30"
                                : "bg-gray-50/70 hover:bg-gray-100 border-gray-200 text-gray-700"
                            }`}
                          >
                            <div className="min-w-0 pr-1 flex-1">
                              <div className="flex items-center gap-1 font-bold text-xs font-[Matter] text-gray-900">
                                <IndianRupee className="w-3 h-3 min-[375px]:w-3.5 min-[375px]:h-3.5 text-red-600 shrink-0" />
                                <span>{b.amount}</span>
                              </div>
                              {b.desc && (
                                <p
                                  className={`text-[9.5px] min-[375px]:text-[10px] leading-snug mt-0.5 ${
                                    isSelected ? "text-red-700 font-medium" : "text-gray-500"
                                  }`}
                                >
                                  {b.desc}
                                </p>
                              )}
                            </div>
                            <div
                              className={`w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                                isSelected
                                  ? "border-red-600 bg-red-600 text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Timeline (Click Cards - exactly like Budget) */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                        Target Timeline <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9.5px] min-[375px]:text-[10px] text-gray-500 font-medium font-[Matter]">
                        Select expected delivery
                      </span>
                    </div>

                    <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-1.5 min-[375px]:gap-2">
                      {TIMELINE_OPTIONS.map((tm) => {
                        const labelVal = typeof tm === "string" ? tm : (tm.label || tm.title);
                        const isSelected =
                          formData.timeline === labelVal ||
                          (formData.timeline && (formData.timeline === tm.id || formData.timeline.startsWith(labelVal)));

                        return (
                          <button
                            type="button"
                            key={tm.id || labelVal}
                            onClick={() => handleFieldChange("timeline", labelVal)}
                            className={`p-2 min-[375px]:p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-red-50/90 border-red-600 text-gray-950 shadow-xs ring-1 ring-red-600/30"
                                : "bg-gray-50/70 hover:bg-gray-100 border-gray-200 text-gray-700"
                            }`}
                          >
                            <div className="min-w-0 pr-1 flex-1">
                              <p className="text-xs font-bold font-[Matter] text-gray-900 leading-tight">
                                {labelVal}
                              </p>
                              {tm.desc && (
                                <p
                                  className={`text-[9.5px] min-[375px]:text-[10px] leading-snug mt-0.5 ${
                                    isSelected ? "text-red-700 font-medium" : "text-gray-500"
                                  }`}
                                >
                                  {tm.desc}
                                </p>
                              )}
                            </div>
                            <div
                              className={`w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                                isSelected
                                  ? "border-red-600 bg-red-600 text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 min-[375px]:p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium font-poppins flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="px-3 min-[375px]:px-5 py-3 min-[375px]:py-3.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1 font-[Matter] shrink-0"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 min-w-0 py-3 min-[375px]:py-3.5 sm:py-4 px-2.5 min-[375px]:px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 min-[375px]:gap-2 cursor-pointer font-[Matter] disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Image
                            src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
                            alt="WhatsApp"
                            width={18}
                            height={18}
                            className="w-4 h-4 min-[375px]:w-4.5 min-[375px]:h-4.5 object-contain brightness-0 invert shrink-0"
                          />
                          <span className="hidden min-[400px]:inline whitespace-nowrap">
                            Complete & Continue on WhatsApp
                          </span>
                          <span className="min-[400px]:hidden whitespace-nowrap">
                            Continue on WhatsApp
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 shrink-0" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[10px] min-[375px]:text-[11px] text-gray-500 font-poppins pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 min-[375px]:w-3.5 min-[375px]:h-3.5 text-emerald-600" />
                  100% Privacy & Zero Spam
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 min-[375px]:w-3.5 min-[375px]:h-3.5 text-blue-600" />
                  Response in 15 Minutes
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 min-[375px]:w-3.5 min-[375px]:h-3.5 text-amber-600" />
                  Free Tech Architecture
                </span>
              </div>
            </div>
          ) : (
            <QuoteFormSuccess
              formData={formData}
              onReset={() => {
                setSubmitted(false);
                setStep(1);
                setFormData((p) => ({ ...p, business_name: "" }));
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
