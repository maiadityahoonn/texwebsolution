"use client";

import { useState } from "react";
import { Clock, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { buildTrackingNotes, trackMetaEvent, getTrackingParams } from "./landingTracking";
import { SERVICE_OPTIONS, BUDGET_OPTIONS, TIMELINE_OPTIONS } from "./quoteFormConstants";
import QuoteFormSuccess from "./QuoteFormSuccess";
import QuoteFormInputs from "./QuoteFormInputs";

export default function LandingQuoteForm() {
  const [formData, setFormData] = useState({
    service: "Custom Web Development",
    budget: "₹35k - ₹75k",
    timeline: "🚀 2 - 3 Weeks",
    name: "",
    phone: "",
    email: "",
    city: "",
    details: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    trackMetaEvent("LeadFormInteraction", { field, value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanPhoneDigits = formData.phone.replace(/\D/g, "");
    if (cleanPhoneDigits.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      const trackingParams = getTrackingParams();
      const utmSource = trackingParams.utm_source || "Meta Ads";
      const sourceLabel = `Meta Ads (${utmSource})`;

      const notes = buildTrackingNotes({
        service: formData.service,
        budget: formData.budget,
        timeline: formData.timeline,
        message: formData.details,
        extra: {
          "City / Business": formData.city || "Not specified",
          "Landing Page": "/get-quote",
        }
      });

      const response = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: cleanPhoneDigits,
          email: formData.email.trim() || undefined,
          service: formData.service,
          source: sourceLabel,
          notes: notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to submit your quote request right now.");
      }

      trackMetaEvent("Lead", {
        content_name: formData.service,
        content_category: "Meta Ads Quote Request",
        currency: "INR",
        value: formData.budget.includes("₹75k") ? 75000 : formData.budget.includes("₹35k") ? 35000 : 20000,
      });

      trackMetaEvent("CompleteRegistration", {
        status: "successful",
        service: formData.service,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage(err.message || "Failed to submit. Please try again or WhatsApp us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      id="quote-form-section" 
      className="relative pt-6 sm:pt-8 pb-12 sm:pb-16 text-center w-full overflow-hidden bg-gradient-to-b from-white via-gray-50/40 to-white"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-red-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-neutral-100/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
            Get Free Quote & Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1 mb-2">
            Let&apos;s Build Your Next Digital Platform
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-poppins font-light leading-relaxed">
            Fill in your project details below. Our Lead Technical Architect will review your requirements and share a personalized scope, timeline, and cost estimate.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <label className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-800 block">
                  What service are you looking for? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {SERVICE_OPTIONS.map((srv) => (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => handleFieldChange("service", srv)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold font-[Matter] transition-all cursor-pointer ${
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

              {/* Budget Range */}
              <div className="space-y-2">
                <label className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-800 block">
                  Expected Project Budget <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {BUDGET_OPTIONS.map((bg) => (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => handleFieldChange("budget", bg)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold font-[Matter] transition-all cursor-pointer ${
                        formData.budget === bg
                          ? "bg-gray-900 text-white shadow-md scale-[1.02]"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <label className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-800 block">
                  Target Launch Timeline
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {TIMELINE_OPTIONS.map((tm) => (
                    <button
                      type="button"
                      key={tm}
                      onClick={() => handleFieldChange("timeline", tm)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold font-[Matter] transition-all cursor-pointer ${
                        formData.timeline === tm
                          ? "bg-red-50 text-red-600 border border-red-300 font-bold"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {tm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Inputs */}
              <QuoteFormInputs formData={formData} onChange={handleFieldChange} />

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium font-poppins">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg shadow-red-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-[Matter] text-base cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Your Requirements...</span>
                  ) : (
                    <>
                      <span>Get Free Project Architecture & Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-gray-500 font-poppins pt-1">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    100% Privacy & NDA Protected
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Response in 15 Minutes
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Free Tech Consultation
                  </span>
                </div>
              </div>
            </form>
          ) : (
            <QuoteFormSuccess
              formData={formData}
              onReset={() => {
                setSubmitted(false);
                setFormData((p) => ({ ...p, details: "" }));
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
