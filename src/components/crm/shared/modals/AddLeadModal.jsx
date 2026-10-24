"use client";

import { useState } from "react";
import {
  Users,
  Phone,
  Mail,
  Target,
  MessageSquare,
  Building2,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import {
  SERVICE_OPTIONS,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/components/public/landing/quoteFormConstants";
import {
  ALL_COUNTRY_CODES,
  validateInternationalPhone,
} from "@/components/crm/shared/countryCodes";
import AddLeadServiceSelect from "./add-lead/AddLeadServiceSelect";
import AddLeadBudgetTimeline from "./add-lead/AddLeadBudgetTimeline";

const LEAD_SOURCES = [
  "Manual Entry",
  "Website Form",
  "Meta Ads",
  "Google Ads",
  "Instagram DM",
  "WhatsApp Inquiry",
  "Referral",
  "Cold Outreach",
];

export default function AddLeadModal({
  show,
  onClose,
  onSubmit,
  form = {},
  setForm,
}) {
  const [customService, setCustomService] = useState("");
  const [isCustomService, setIsCustomService] = useState(false);
  const [customBudget, setCustomBudget] = useState("");
  const [isCustomBudget, setIsCustomBudget] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  if (!show) return null;

  const currentService = form?.service || SERVICE_OPTIONS[0];
  const currentBudget = form?.budget || BUDGET_OPTIONS[2];
  const currentTimeline = form?.timeline || TIMELINE_OPTIONS[1];
  const currentSource = form?.source || "Manual Entry";
  const currentCountryCode = form?.country_code || "+91";
  const selectedCountry =
    ALL_COUNTRY_CODES.find((c) => c.code === currentCountryCode) ||
    ALL_COUNTRY_CODES[0];
  const isIndia = selectedCountry.code === "+91";

  const handleFieldChange = (field, value) => {
    setForm?.((prev) => ({
      ...(prev || {}),
      [field]: value,
    }));
  };

  const handleServiceSelect = (srv) => {
    setIsCustomService(false);
    handleFieldChange("service", srv);
  };

  const handleCustomServiceToggle = () => {
    setIsCustomService(true);
    if (customService.trim()) {
      handleFieldChange("service", customService.trim());
    }
  };

  const handleBudgetSelect = (bgt) => {
    setIsCustomBudget(false);
    handleFieldChange("budget", bgt);
  };

  const handleCustomBudgetToggle = () => {
    setIsCustomBudget(true);
    if (customBudget.trim()) {
      handleFieldChange("budget", customBudget.trim());
    }
  };

  const phoneValidation = form?.phone
    ? validateInternationalPhone(form.phone, selectedCountry.code)
    : null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setPhoneError("");

    const rawPhone = String(form?.phone || "").replace(/\D/g, "");
    if (!rawPhone) {
      setPhoneError("Please enter phone / WhatsApp number.");
      return;
    }

    if (isIndia && rawPhone.length !== 10) {
      setPhoneError("Indian mobile number must be 10 digits.");
      return;
    }

    if (!isIndia && rawPhone.length < 6) {
      setPhoneError("International number must be at least 6 digits.");
      return;
    }

    if (!form?.name?.trim()) {
      return;
    }

    const resolvedService = isCustomService && customService.trim()
      ? customService.trim()
      : currentService;

    const resolvedBudget = isCustomBudget && customBudget.trim()
      ? customBudget.trim()
      : currentBudget;

    const formattedPhone = `${selectedCountry.code} ${rawPhone}`;

    const payload = {
      ...(form || {}),
      phone: formattedPhone,
      country_code: selectedCountry.code,
      service: resolvedService,
      budget: resolvedBudget,
      timeline: currentTimeline,
      source: currentSource,
    };

    onSubmit?.(e, payload);
  };

  return (
    <div
      data-modal-overlay="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-2 min-[360px]:p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
    >
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Top Accent Gradient Line */}
        <div className="w-full h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-3.5 min-[360px]:px-5 py-3 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-red-50/60 via-amber-50/20 to-transparent dark:from-red-950/20 dark:via-transparent dark:to-transparent shrink-0">
          <div className="flex items-center gap-2.5 min-[360px]:gap-3">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
              <Sparkles className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                  Add New Lead
                </h3>
                <span className="hidden min-[460px]:inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200/60 dark:border-red-900/40 text-[10px] font-bold text-red-600 dark:text-red-400">
                  Get Quote Style
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Capture service, budget, timeline, and client specifications
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-3.5 min-[360px]:p-5 space-y-4 text-xs flex-1 overflow-y-auto no-scrollbar">
          {/* 1. Required Service Selection */}
          <AddLeadServiceSelect
            currentService={currentService}
            isCustomService={isCustomService}
            customService={customService}
            onServiceSelect={handleServiceSelect}
            onCustomServiceToggle={handleCustomServiceToggle}
            onCustomServiceChange={(val) => {
              setCustomService(val);
              handleFieldChange("service", val);
            }}
          />

          {/* 2. Budget Range & Timeline */}
          <AddLeadBudgetTimeline
            currentBudget={currentBudget}
            isCustomBudget={isCustomBudget}
            customBudget={customBudget}
            currentTimeline={currentTimeline}
            onBudgetSelect={handleBudgetSelect}
            onCustomBudgetToggle={handleCustomBudgetToggle}
            onCustomBudgetChange={(val) => {
              setCustomBudget(val);
              handleFieldChange("budget", val);
            }}
            onTimelineSelect={(tml) => handleFieldChange("timeline", tml)}
          />

          {/* 3. Contact Details */}
          <div className="pt-2 border-t border-gray-150/70 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Users className="w-3.5 h-3.5 text-red-500" />
                  <span>Full Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form?.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WhatsApp / Mobile</span>
                    <span className="text-red-500">*</span>
                  </label>
                  {phoneValidation && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        phoneValidation.isValid
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}
                    >
                      {phoneValidation.isValid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{phoneValidation.message}</span>
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
                  {/* Interactive Country Code Dropdown */}
                  <div className="relative shrink-0 flex items-center">
                    <div className="flex items-center gap-1.5 h-full pl-2.5 pr-2 py-2.5 bg-gray-100 hover:bg-gray-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 border border-r-0 border-gray-200 dark:border-slate-700 rounded-l-xl text-gray-900 dark:text-neutral-100 font-bold text-xs select-none pointer-events-none whitespace-nowrap transition cursor-pointer shadow-2xs">
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span className="leading-none font-mono text-gray-800 dark:text-neutral-200 text-xs font-bold">
                        {selectedCountry.code}
                      </span>
                      <span className="text-gray-400 dark:text-neutral-400 text-[8px] leading-none ml-0.5">▼</span>
                    </div>

                    <select
                      value={selectedCountry.code}
                      onChange={(e) => handleFieldChange("country_code", e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                      aria-label="Select Country Code"
                    >
                      {ALL_COUNTRY_CODES.map((c, i) => (
                        <option
                          key={`${c.code}-${c.country}-${i}`}
                          value={c.code}
                          className="text-gray-900 bg-white dark:bg-slate-900 dark:text-white py-1"
                        >
                          {c.flag} {c.country} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="tel"
                    required
                    maxLength={isIndia ? 10 : 15}
                    value={form?.phone || ""}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, "");
                      handleFieldChange("phone", clean);
                    }}
                    placeholder={isIndia ? "98765 43210 (10 Digits)" : "Enter mobile number"}
                    className="w-full px-3.5 py-2.5 rounded-r-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-900 dark:text-white transition shadow-2xs font-mono font-medium"
                  />
                </div>
                {phoneError && <p className="text-[10.5px] text-red-500 font-medium">{phoneError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>Email Address (Optional)</span>
                </label>
                <input
                  type="email"
                  value={form?.email || ""}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="e.g. rahul@business.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                />
              </div>

              {/* Lead Source */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Target className="w-3.5 h-3.5 text-purple-500" />
                  <span>Lead Source</span>
                </label>
                <select
                  value={currentSource}
                  onChange={(e) => handleFieldChange("source", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-900 dark:text-white font-medium transition shadow-2xs cursor-pointer"
                >
                  {LEAD_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* City / Location */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>City / Location</span>
                </label>
                <input
                  type="text"
                  value={form?.city || ""}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  placeholder="e.g. Bhopal, MP or Mumbai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                />
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Business or Brand Name</span>
                </label>
                <input
                  type="text"
                  value={form?.business_name || ""}
                  onChange={(e) => handleFieldChange("business_name", e.target.value)}
                  placeholder="e.g. Verma Enterprises / Fitness App"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* 4. Requirements & Brief Notes */}
          <div className="space-y-1.5 pt-1">
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>Project Requirements / Brief Notes (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={form?.details || form?.notes || ""}
              onChange={(e) => {
                handleFieldChange("details", e.target.value);
                handleFieldChange("notes", e.target.value);
              }}
              placeholder="Tell us what the client wants to build, references shared, features discussed..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-900 dark:text-white transition shadow-2xs font-normal text-xs resize-y"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 min-[360px]:gap-2.5 px-3 min-[360px]:px-5 py-2.5 min-[360px]:py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial text-center justify-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer whitespace-nowrap min-w-0"
          >
            <span className="truncate">Cancel</span>
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-initial text-center justify-center px-3 min-[360px]:px-5 py-2 min-[360px]:py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-md shadow-red-500/25 hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Save Lead</span>
          </button>
        </div>
      </form>
    </div>
  );
}
