"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { addLead } from "@/utils/leadStorage";

export default function LeadCaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "Custom Web & Mobile App"
  });

  useEffect(() => {
    // Show popup after 3 seconds on website load if not dismissed during current session
    const hasSeenModal = sessionStorage.getItem("texweb_lead_modal_dismissed");
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("texweb_lead_modal_dismissed", "true");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    // Store lead directly in Central Admin Database
    addLead({
      name: formData.name,
      phone: formData.phone,
      service: formData.service,
      source: "Popup Modal",
      notes: "Lead captured via landing popup modal."
    });

    setSubmitted(true);
    sessionStorage.setItem("texweb_lead_modal_dismissed", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-poppins">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-gray-900 max-h-[92vh] overflow-y-auto transform transition-all duration-300 animate-scaleUp"
        style={{ fontFamily: "Matter, sans-serif" }}
      >
        {/* Top Decorative Gradient Line */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shrink-0" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-[Matter]">
              Inquiry Received, {formData.name}!
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm font-poppins font-light leading-relaxed">
              Your request has been successfully registered in our Admin Panel. Our technical team will review your requirements and reach out on <strong>{formData.phone}</strong> shortly.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Get Free Project Consultation</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-1 font-[Matter]">
              Let&apos;s Build Something Great Together
            </h3>
            <p className="text-gray-500 text-xs font-poppins font-light leading-relaxed mb-4">
              Fill in your details to receive a custom quote and 1-on-1 strategy call with our senior developers.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 font-poppins text-left">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Service Interested In
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-colors font-medium text-gray-800"
                >
                  <option value="Custom Web & Mobile App">Custom Web & Mobile App Development</option>
                  <option value="Prebuilt SaaS Platform">Prebuilt SaaS Software Platform</option>
                  <option value="AI & Workflow Automation">AI & WhatsApp Workflow Automation</option>
                  <option value="Digital Marketing & Ads">Digital Marketing, Video Shoots & Ads</option>
                  <option value="Internship Catalyst">Internship Catalyst Courses & Programs</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-xs sm:text-sm hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 group mt-2"
              >
                <span>Submit Lead to Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="text-[10px] text-gray-400 text-center mt-3">
              🔒 We respect your privacy. No spam. 100% Confidential.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
