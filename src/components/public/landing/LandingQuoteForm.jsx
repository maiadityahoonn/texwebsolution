"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Send, 
  Lock,
  ArrowRight,
  Phone,
  Mail,
  User,
  Building2,
  PhoneCall
} from "lucide-react";
import { buildTrackingNotes, trackMetaEvent, getTrackingParams } from "./landingTracking";

const SERVICE_OPTIONS = [
  "Custom Web Development",
  "Mobile App (iOS / Android)",
  "Ready SaaS Software",
  "AI & WhatsApp Automation",
  "Digital Marketing & SEO",
  "Full-Stack Growth Partner"
];

const BUDGET_OPTIONS = [
  "Flexible / Need Advice",
  "₹15k - ₹35k",
  "₹35k - ₹75k",
  "₹75k - ₹2L+"
];

const TIMELINE_OPTIONS = [
  "⚡ Urgent (< 7 Days)",
  "🚀 2 - 3 Weeks",
  "📅 1 Month+",
  "💡 Exploring Ideas"
];

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

      // Submit to backend API (triggers internal CRM lead creation + server-side Meta CAPI)
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

      // Track Meta Pixel Client-Side Lead Event
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
      className="relative py-12 sm:py-16 text-center w-full overflow-hidden bg-gradient-to-b from-white via-gray-50/40 to-white"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Background glow accents matching website style */}
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-red-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-neutral-100/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
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
              
              {/* 1. Service Selection */}
              <div className="space-y-2">
                <label className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-800 block">
                  What service are you looking for? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {SERVICE_OPTIONS.map((srv) => {
                    const isSelected = formData.service === srv;
                    return (
                      <button
                        type="button"
                        key={srv}
                        onClick={() => handleFieldChange("service", srv)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold font-[Matter] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-red-600 text-white shadow-md shadow-red-600/20 scale-[1.02]"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {srv}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Budget Range */}
              <div className="space-y-2">
                <label className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-800 block">
                  Expected Project Budget <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {BUDGET_OPTIONS.map((bg) => {
                    const isSelected = formData.budget === bg;
                    return (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => handleFieldChange("budget", bg)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold font-[Matter] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gray-900 text-white shadow-md scale-[1.02]"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {bg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Timeline */}
              <div className="space-y-2">
                <label className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-800 block">
                  Target Launch Timeline
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {TIMELINE_OPTIONS.map((tm) => {
                    const isSelected = formData.timeline === tm;
                    return (
                      <button
                        type="button"
                        key={tm}
                        onClick={() => handleFieldChange("timeline", tm)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold font-[Matter] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-red-50 text-red-600 border border-red-300 font-bold"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {tm}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Contact Inputs */}
              <div className="border-t border-gray-150/70 pt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Verma"
                        value={formData.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition"
                      />
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                      Phone / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3.5 text-xs font-bold bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-[Matter]">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98765 43210"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="name@business.com"
                        value={formData.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition"
                      />
                    </div>
                  </div>

                  {/* City / Business Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                      Business Name or City (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Bhopal / Fitness Brand"
                        value={formData.city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 font-[Matter]">
                    Brief Project Details or Reference Websites (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell us what you want to build or share references..."
                    value={formData.details}
                    onChange={(e) => handleFieldChange("details", e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition resize-none"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium font-poppins">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA Button */}
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

                {/* Trust Microcopy */}
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
            /* Celebratory Success State */
            <div className="py-10 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 font-[Matter]">
                  Inquiry Received Successfully!
                </h3>
                <p className="text-sm text-gray-600 font-poppins max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-gray-900">{formData.name}</strong>. Our Lead Tech Architect is reviewing your requirements for <strong className="text-red-600">{formData.service}</strong>.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl max-w-md mx-auto text-xs text-emerald-900 font-medium space-y-1 font-poppins">
                <p>⚡ We will connect on WhatsApp / Phone within 15 minutes.</p>
                <p className="text-emerald-700">Project Budget: {formData.budget} | Timeline: {formData.timeline}</p>
              </div>

              <div className="space-y-3 max-w-md mx-auto pt-2">
                <a
                  href={`https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20just%20submitted%20a%20quote%20request%20for%20${encodeURIComponent(formData.service)}.%20My%20name%20is%20${encodeURIComponent(formData.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackMetaEvent("Contact", { method: "whatsapp_after_lead" })}
                  className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2.5 cursor-pointer font-[Matter]"
                >
                  <Image
                    src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain"
                  />
                  <span>Chat with Lead Architect on WhatsApp Now</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData((p) => ({ ...p, details: "" }));
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800 underline transition cursor-pointer font-poppins"
                >
                  Submit another inquiry
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
