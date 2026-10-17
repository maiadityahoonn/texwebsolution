"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, ShieldCheck } from "lucide-react";
import { buildTrackingNotes, trackMetaEvent, getTrackingParams } from "./landingTracking";
import { DYNAMIC_SERVICE_CONFIGS, validatePhoneNumber } from "./quoteModalConstants";
import QuoteModalStep1 from "./QuoteModalStep1";
import QuoteModalStep2 from "./QuoteModalStep2";
import QuoteFormSuccess from "./QuoteFormSuccess";

const INITIAL_FORM_STATE = {
  name: "",
  country_code: "+91",
  phone: "",
  email: "",
  state: "",
  city: "",
  service: "Website Development",
  what_best_describes_you: "Business Owner / Dukaandar",
  what_type_of_business_do_you_have: "Retail Shop, Showroom & Products",
  specific_type: "Company & Business Profile",
  budget: "₹25,000 - ₹45,000 (Standard Business & Profile Website)",
  timeline: "Immediately - Next 2 - 7 Days (Urgent)",
  details: "",
};

export default function LandingQuoteModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step1Error, setStep1Error] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Listen for global openQuoteModal event from any CTA button across the page
  useEffect(() => {
    const handleOpenModal = (e) => {
      setIsOpen(true);
      if (e.detail?.service) {
        const srv = e.detail.service;
        if (srv in DYNAMIC_SERVICE_CONFIGS) {
          const cfg = DYNAMIC_SERVICE_CONFIGS[srv];
          setFormData((prev) => ({
            ...prev,
            service: srv,
            budget: `${cfg.budgets[0].amount} (${cfg.budgets[0].desc})`,
            specific_type: cfg.specificOptions[0].title,
          }));
        }
      }
      trackMetaEvent("InitiateCheckout", { source: e.detail?.source || "modal_trigger" });
    };

    window.addEventListener("openQuoteModal", handleOpenModal);
    return () => window.removeEventListener("openQuoteModal", handleOpenModal);
  }, []);

  // Lock background page scroll completely across Desktop, iOS & Android
  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = prevBodyOverflow || "";
        document.documentElement.style.overflow = prevHtmlOverflow || "";
      };
    }
  }, [isOpen]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStep1Next = () => {
    setStep1Error("");

    if (!formData.name.trim()) {
      setStep1Error("Please enter your full name.");
      return;
    }

    const phoneValidation = validatePhoneNumber(formData.phone, formData.country_code);
    if (!phoneValidation.isValid) {
      setStep1Error(phoneValidation.message);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setStep1Error("Please enter a valid email address.");
      return;
    }

    if (!formData.state.trim()) {
      setStep1Error("Please select your state.");
      return;
    }

    if (!formData.city.trim()) {
      setStep1Error("Please enter your city.");
      return;
    }

    trackMetaEvent("LeadFormInteraction", {
      step: 1,
      name: formData.name,
      city: formData.city,
      state: formData.state,
    });

    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitError("");
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
          "City": formData.city,
          "State": formData.state,
          "Role": formData.what_best_describes_you,
          "Business Type": formData.what_type_of_business_do_you_have,
          "Specific Sub-Type": formData.specific_type,
          "Landing Page": "/get-quote",
        },
      });

      const response = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: `${formData.country_code || "+91"} ${formData.phone.replace(/\D/g, "")}`,
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
        content_category: formData.what_type_of_business_do_you_have,
        currency: "INR",
        value: 35000,
      });

      trackMetaEvent("CompleteRegistration", {
        status: "successful",
        service: formData.service,
        city: formData.city,
      });

      setIsOpen(false);
      const queryParams = new URLSearchParams({
        name: formData.name.trim(),
        service: formData.service || "Web / App Development",
      }).toString();
      router.push(`/thank-you?${queryParams}`);
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "Failed to submit. Please try again or WhatsApp us directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setStep(1);
    setFormData(INITIAL_FORM_STATE);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn overscroll-none">
      {/* Click outside backdrop to close */}
      <div 
        className="fixed inset-0 -z-10 cursor-pointer touch-none" 
        onClick={() => !loading && setIsOpen(false)}
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden animate-scaleUp text-left overscroll-contain"
        style={{ fontFamily: "Matter, sans-serif" }}
      >
        {/* Top Gradient Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => !loading && setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            {/* Modal Header */}
            <div className="pr-8 mb-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[11px] font-bold font-[Matter] mb-1">
                <Sparkles className="w-3 h-3 text-red-500" />
                <span>Get Free Architecture & Quote</span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-gray-950 font-[Matter] tracking-tight leading-snug">
                {step === 1 ? "Step 1 of 2: Your Contact & Business Location" : "Step 2 of 2: Define Your Project Scope & Requirements"}
              </h2>
              
              {/* Progress 2-Step Bar */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-red-600" : "bg-gray-200"}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-red-600" : "bg-gray-200"}`} />
                <span className="text-[11px] font-bold text-gray-500 shrink-0 font-[Matter]">
                  Step {step} of 2
                </span>
              </div>
            </div>

            {/* Step 1 or Step 2 */}
            {step === 1 && (
              <QuoteModalStep1
                formData={formData}
                onChange={handleFieldChange}
                onNext={handleStep1Next}
                error={step1Error}
              />
            )}

            {step === 2 && (
              <QuoteModalStep2
                formData={formData}
                onChange={handleFieldChange}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
                loading={loading}
                error={submitError}
              />
            )}

            {/* Trust Footer */}
            <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-poppins font-light">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                100% Privacy & Zero Spam Guarantee
              </span>
              <span>15-Min Response Time</span>
            </div>
          </div>
        ) : (
          <QuoteFormSuccess formData={formData} onReset={handleReset} />
        )}

      </div>
    </div>
  );
}
