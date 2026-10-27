"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, ShieldCheck } from "lucide-react";
import { buildTrackingNotes, getTrackingParams, hasMetaAdAttribution, trackMetaEvent } from "./landingTracking";
import { trackOpenAiAdsEvent } from "./openAiAdsTracking";
import { buildWhatsAppQuoteUrl, validatePhoneNumber, getBudgetsForService } from "./quoteModalConstants";
import QuoteModalStep1 from "./QuoteModalStep1";
import QuoteModalStep2 from "./QuoteModalStep2";
import QuoteFormSuccess from "./QuoteFormSuccess";

const INITIAL_FORM_STATE = {
  name: "",
  country_code: "+91",
  phone: "",
  business_name: "",
  business_type: "Retail Shop, Showroom & Products",
  service: "Website Development",
  budget: "₹25,000 - ₹45,000 (Standard Business & Profile Website)",
  timeline: "⚡ Urgent (2 - 7 Days)",
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

  // Auto-open modal after 3.5 seconds on website load if not dismissed in current session
  useEffect(() => {
    const hasSeenModal = typeof window !== "undefined" && sessionStorage.getItem("texweb_quote_modal_dismissed");
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        trackMetaEvent("ViewContent", { source: "auto_popup_timer" });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("texweb_quote_modal_dismissed", "true");
      }
    }
  };

  // Listen for global openQuoteModal event from any CTA button across the page
  useEffect(() => {
    const handleOpenModal = (e) => {
      setIsOpen(true);
      if (e.detail?.service) {
        const srv = e.detail.service;
        const bList = getBudgetsForService(srv);
        const defaultBudget = bList && bList[0]
          ? (bList[0].desc ? `${bList[0].amount} (${bList[0].desc})` : bList[0].amount)
          : "₹25,000 - ₹45,000";
        setFormData((prev) => ({
          ...prev,
          service: srv,
          budget: defaultBudget,
        }));
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

    trackMetaEvent("LeadFormInteraction", {
      step: 1,
      country_code: formData.country_code,
    });

    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitError("");

    if (!formData.business_name?.trim()) {
      setSubmitError("Please enter your business or company name.");
      return;
    }

    setLoading(true);

    try {
      const trackingParams = getTrackingParams();
      const sourceLabel = hasMetaAdAttribution(trackingParams)
        ? `Meta Ads (${trackingParams.utm_source || "paid"})`
        : "Website Form";

      const notes = buildTrackingNotes({
        service: formData.service,
        budget: formData.budget,
        timeline: formData.timeline,
        extra: {
          "Business Name": formData.business_name.trim(),
          "Business Type": formData.business_type,
          "WhatsApp Number": `${formData.country_code || "+91"} ${formData.phone.replace(/\D/g, "")}`,
          "Landing Page": "/get-quote",
        },
      });

      const eventId = "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);

      const response = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: `${formData.country_code || "+91"} ${formData.phone.replace(/\D/g, "")}`,
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

      if (typeof window !== "undefined") {
        sessionStorage.setItem("texweb_quote_modal_dismissed", "true");
      }

      // Open WhatsApp directly with full quote summary
      const whatsappUrl = buildWhatsAppQuoteUrl(formData);
      try {
        window.open(whatsappUrl, "_blank");
      } catch (_) {}

      setIsOpen(false);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 min-[375px]:p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn overscroll-none">
      {/* Click outside backdrop to close */}
      <div 
        className="fixed inset-0 -z-10 cursor-pointer touch-none" 
        onClick={handleClose}
      />

      {/* Modal Dialog Card (Optimized for 320px, 375px, 425px, 768px+) */}
      <div 
        className="relative w-full max-w-xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-2.5 min-[375px]:p-4 sm:p-6 shadow-2xl overflow-hidden animate-scaleUp text-left overscroll-contain"
        style={{ fontFamily: "Matter, sans-serif" }}
      >
        {/* Top Gradient Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2 right-2 min-[375px]:top-3 min-[375px]:right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {!submitted ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Modal Header */}
            <div className="pr-8 min-[375px]:pr-10 mb-2 sm:mb-2.5 shrink-0">
              <div className="inline-flex items-center gap-1 px-2 min-[375px]:px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] min-[375px]:text-[11px] font-bold font-[Matter] mb-0.5 min-[375px]:mb-1">
                <Sparkles className="w-3 h-3 text-red-500 shrink-0" />
                <span>Get Free Architecture & Quote</span>
              </div>
              <h2 className="text-xs min-[360px]:text-sm sm:text-base md:text-lg font-bold text-gray-950 font-[Matter] tracking-tight leading-snug">
                {step === 1 ? "Step 1 of 2: Your Name & WhatsApp" : "Step 2 of 2: Business & Project Scope"}
              </h2>
              
              {/* Progress 2-Step Bar */}
              <div className="flex items-center gap-1.5 min-[375px]:gap-2 mt-1 sm:mt-1.5">
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-red-600" : "bg-gray-200"}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-red-600" : "bg-gray-200"}`} />
                <span className="text-[9.5px] min-[375px]:text-[10.5px] font-bold text-gray-500 shrink-0 font-[Matter] whitespace-nowrap">
                  Step {step} of 2
                </span>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 min-h-0 flex flex-col">
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
            </div>

            {/* Trust Footer (Responsive across 320px to 768px+) */}
            <div className="mt-1.5 min-[375px]:mt-2 pt-1.5 min-[375px]:pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] min-[375px]:text-[10px] text-gray-500 font-poppins shrink-0 gap-1">
              <span className="inline-flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3 min-[375px]:w-3.5 min-[375px]:h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Spam Guarantee</span>
              </span>
              <span className="shrink-0 text-emerald-600 font-semibold whitespace-nowrap">⚡ 15-Min Response</span>
            </div>
          </div>
        ) : (
          <QuoteFormSuccess formData={formData} onReset={handleReset} />
        )}

      </div>
    </div>
  );
}
