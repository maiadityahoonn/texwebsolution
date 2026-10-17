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
  FileText
} from "lucide-react";
import { buildTrackingNotes, trackMetaEvent, getTrackingParams } from "./landingTracking";

const SERVICE_OPTIONS = [
  { id: "custom_web", label: "Custom Website", icon: "🌐", desc: "Corporate, E-Commerce, Portal" },
  { id: "mobile_app", label: "Mobile App (iOS/Android)", icon: "📱", desc: "Flutter, React Native, Native" },
  { id: "prebuilt_saas", label: "Ready SaaS Software", icon: "⚡", desc: "CRM, LMS, Booking & Billing" },
  { id: "ai_automation", label: "AI & Chatbots", icon: "🤖", desc: "WhatsApp AI, Workflows" },
  { id: "digital_marketing", label: "Digital Marketing & SEO", icon: "📈", desc: "Meta Ads, Google PPC, SEO" },
  { id: "full_package", label: "Complete Tech Partner", icon: "🚀", desc: "Web + App + Marketing" },
];

const BUDGET_OPTIONS = [
  "₹10k - ₹25k",
  "₹25k - ₹50k",
  "₹50k - ₹1.5L",
  "₹1.5L - ₹5L+"
];

const TIMELINE_OPTIONS = [
  "⚡ Urgent (< 7 Days)",
  "🚀 2 - 3 Weeks",
  "📅 1 Month+",
  "💡 Just Exploring"
];

export default function LandingQuoteForm() {
  const [formData, setFormData] = useState({
    service: "Custom Website",
    budget: "₹25k - ₹50k",
    timeline: "🚀 2 - 3 Weeks",
    name: "",
    phone: "",
    email: "",
    businessName: "",
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

    // Validations
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
          "Business Name": formData.businessName || "Not specified",
          "Landing Page": "/get-quote",
        }
      });

      // Submit to internal CRM backend API (this triggers Meta Conversions API server-side too!)
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

      // Track Meta Pixel Client-Side Event
      trackMetaEvent("Lead", {
        content_name: formData.service,
        content_category: "Quote Request",
        currency: "INR",
        value: formData.budget.includes("₹1.5L") ? 150000 : formData.budget.includes("₹50k") ? 50000 : 25000,
        predicted_ltv: 50000,
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
    <div 
      id="quote-form-section" 
      className="w-full bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-100 relative overflow-hidden"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

      {!submitted ? (
        <>
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Architecture & Estimate in 15 Mins</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              Get Your Custom Project Quote
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-poppins mt-1.5 leading-relaxed">
              Tell us what you need. Our Lead Technical Architect will analyze your idea and share a fixed-price proposal with timeline.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Service Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2.5">
                1. Select the service you are looking for <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SERVICE_OPTIONS.map((srv) => {
                  const isSelected = formData.service === srv.label;
                  return (
                    <button
                      type="button"
                      key={srv.id}
                      onClick={() => handleFieldChange("service", srv.label)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-red-600 bg-red-50/50 text-red-950 shadow-sm ring-2 ring-red-600/20"
                          : "border-gray-200 bg-gray-50/40 hover:bg-white hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="text-lg mb-1">{srv.icon}</div>
                      <div className="text-xs font-bold leading-tight">{srv.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate">{srv.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Budget Range */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                2. Approximate Project Budget <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_OPTIONS.map((bg) => {
                  const isSelected = formData.budget === bg;
                  return (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => handleFieldChange("budget", bg)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Timeline */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                3. Expected Delivery Timeline
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIMELINE_OPTIONS.map((tm) => {
                  const isSelected = formData.timeline === tm;
                  return (
                    <button
                      type="button"
                      key={tm}
                      onClick={() => handleFieldChange("timeline", tm)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {tm}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Contact Information */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 text-xs font-bold bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@business.com"
                      value={formData.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
                    />
                  </div>
                </div>

                {/* Business Name / City */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Business Name or City (Optional)
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Bhopal / Fitness Clinic"
                      value={formData.businessName}
                      onChange={(e) => handleFieldChange("businessName", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Requirement Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Briefly describe your project or goal (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us what features or reference website you have in mind..."
                  value={formData.details}
                  onChange={(e) => handleFieldChange("details", e.target.value)}
                  className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition resize-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-red-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating Your Estimate...</span>
                ) : (
                  <>
                    <span>Get Free Proposal & Price Breakdown</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 font-poppins pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  100% Privacy & No Spam
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Response in 15 Minutes
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Free Tech Consultation
                </span>
              </div>
            </div>
          </form>
        </>
      ) : (
        /* Celebratory Success State */
        <div className="py-10 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
              Inquiry Received Successfully!
            </h3>
            <p className="text-sm text-gray-600 font-poppins max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-gray-900">{formData.name}</strong>. Our Lead Tech Architect is reviewing your requirements for <strong className="text-red-600">{formData.service}</strong>.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl max-w-md mx-auto text-xs text-emerald-900 font-medium space-y-1">
            <p>⚡ We will connect on WhatsApp / Phone within 15 minutes.</p>
            <p className="text-emerald-700">Project Budget: {formData.budget} | Timeline: {formData.timeline}</p>
          </div>

          <div className="space-y-3 max-w-md mx-auto pt-2">
            <a
              href={`https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20just%20submitted%20a%20quote%20request%20for%20${encodeURIComponent(formData.service)}.%20My%20name%20is%20${encodeURIComponent(formData.name)}.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackMetaEvent("Contact", { method: "whatsapp_after_lead" })}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2.5 cursor-pointer"
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
              className="text-xs text-gray-500 hover:text-gray-800 underline transition cursor-pointer"
            >
              Submit another inquiry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
