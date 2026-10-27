"use client";

import Image from "next/image";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  Globe,
  Smartphone,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Bot,
  Layers,
  Sparkles,
  ShoppingCart,
  Factory,
  Stethoscope,
  GraduationCap,
  Building,
  Coffee,
  Briefcase,
  Rocket,
  AlertCircle,
  Loader2,
  IndianRupee,
  Check,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  BUSINESS_TYPE_OPTIONS,
  TEXWEB_SERVICES,
  TIMELINE_OPTIONS,
  getBudgetsForService,
} from "./quoteModalConstants";

// Icon mapping helper
const ICON_MAP = {
  Globe,
  Smartphone,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Bot,
  Layers,
  Sparkles,
  ShoppingCart,
  Factory,
  Stethoscope,
  GraduationCap,
  Building,
  Coffee,
  Briefcase,
  Rocket,
};

export default function QuoteModalStep2({
  formData,
  onChange,
  onBack,
  onSubmit,
  loading,
  error,
}) {
  const currentServiceKey = formData.service || "Website Development";
  const serviceBudgets = getBudgetsForService(currentServiceKey);

  const handleServiceSelect = (srvKey) => {
    onChange("service", srvKey);
    const newBudgets = getBudgetsForService(srvKey);
    if (newBudgets && newBudgets.length > 0) {
      const firstB = newBudgets[0];
      const defaultBudgetVal = firstB.desc ? `${firstB.amount} (${firstB.desc})` : firstB.amount;
      onChange("budget", defaultBudgetVal);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Scrollable Form Body (Smooth on 320px, 375px, 425px, 768px+) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-0.5 min-[375px]:p-1 pr-1 space-y-3 min-[375px]:space-y-3.5 scrollbar-thin overscroll-contain touch-pan-y">
        
        {/* Step Context Pill */}
        <div className="p-2 min-[375px]:p-2.5 bg-red-50/70 border border-red-100 rounded-xl flex flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-1 text-xs font-poppins">
          <span className="text-gray-700 font-medium text-[10.5px] min-[375px]:text-xs">
            Define project scope to generate architecture & cost
          </span>
          <span className="text-red-600 font-bold font-[Matter] text-[10px] min-[375px]:text-[11px] px-2 py-0.5 bg-white rounded-full border border-red-200 shrink-0">
            Step 2 of 2
          </span>
        </div>

        {/* 1. Business / Company Name */}
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
              onChange={(e) => onChange("business_name", e.target.value)}
              className="w-full pl-9 min-[375px]:pl-10 pr-3.5 py-2 min-[375px]:py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-xs sm:text-sm font-poppins transition"
            />
          </div>
        </div>

        {/* 2. What type of business do you run? */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            What type of business do you run? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-1.5 min-[375px]:gap-2">
            {BUSINESS_TYPE_OPTIONS.map((bt) => {
              const IconComp = ICON_MAP[bt.icon] || Briefcase;
              const isSelected = (formData.business_type || "") === bt.title;
              return (
                <button
                  type="button"
                  key={bt.id}
                  onClick={() => onChange("business_type", bt.title)}
                  className={`p-2 min-[375px]:p-2.5 rounded-xl border text-left flex items-start gap-2 min-[375px]:gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-red-50/80 border-red-600 text-gray-950 shadow-xs ring-1 ring-red-600/30"
                      : "bg-gray-50/70 hover:bg-gray-100 border-gray-200 text-gray-700"
                  }`}
                >
                  <div
                    className={`p-1 min-[375px]:p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isSelected ? "bg-red-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-snug">{bt.title}</p>
                    <p className="text-[9.5px] min-[375px]:text-[10px] text-gray-500 leading-snug mt-0.5">{bt.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. What do you need? (Our Official Services) */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className="block text-xs font-bold text-gray-800 font-[Matter]">
              What do you need? (Our Services) <span className="text-red-500">*</span>
            </label>
            <span className="text-[9.5px] min-[375px]:text-[10px] text-red-600 font-semibold font-[Matter]">
              Select to customize budget
            </span>
          </div>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-1.5 min-[375px]:gap-2">
            {TEXWEB_SERVICES.map((srv) => {
              const IconComp = ICON_MAP[srv.icon] || Sparkles;
              const isSelected = (formData.service || "") === srv.key || (formData.service || "") === srv.title;
              return (
                <button
                  type="button"
                  key={srv.key}
                  onClick={() => handleServiceSelect(srv.key)}
                  className={`p-2 min-[375px]:p-2.5 rounded-xl border text-left flex items-start gap-2 min-[375px]:gap-2.5 transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-600 text-gray-950 shadow-xs ring-1 ring-red-600/40"
                      : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <div
                    className={`p-1 min-[375px]:p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isSelected ? "bg-red-600 text-white shadow-xs" : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4" />
                  </div>
                  <div className="min-w-0 pr-1 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold leading-tight">{srv.title}</p>
                      {srv.badge && (
                        <span
                          className={`text-[8.5px] min-[375px]:text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                            isSelected ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {srv.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[9.5px] min-[375px]:text-[10px] text-gray-500 leading-snug mt-0.5">{srv.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Expected Budget (Dynamic based on selected service) */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className="block text-xs font-bold text-gray-800 font-[Matter]">
              Expected Budget for {currentServiceKey} <span className="text-red-500">*</span>
            </label>
            <span className="text-[9.5px] min-[375px]:text-[10px] text-emerald-700 font-semibold font-[Matter] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Live estimate per service
            </span>
          </div>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-1.5 min-[375px]:gap-2">
            {serviceBudgets.map((b) => {
              const budgetValue = b.desc ? `${b.amount} (${b.desc})` : b.amount;
              const isSelected =
                formData.budget === budgetValue ||
                (formData.budget && (formData.budget === b.amount || formData.budget.startsWith(b.amount)));

              return (
                <button
                  type="button"
                  key={b.amount}
                  onClick={() => onChange("budget", budgetValue)}
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

        {/* 5. Target Timeline (Click Cards - exactly like Budget) */}
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
                  onClick={() => onChange("timeline", labelVal)}
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

        {/* Error message */}
        {error && (
          <div className="p-2.5 min-[375px]:p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium font-poppins animate-shake flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Pinned at Bottom (Responsive across 320px, 375px, 425px, 768px+) */}
      <div className="shrink-0 pt-2.5 min-[375px]:pt-3 mt-auto border-t border-gray-100 flex items-center gap-2 sm:gap-3">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-2.5 min-[375px]:px-3.5 py-2.5 min-[375px]:py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1 font-[Matter] shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4" />
          <span>Back</span>
        </button>

        {/* Submit & Continue on WhatsApp Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 min-w-0 py-2.5 min-[375px]:py-3 sm:py-3.5 px-2 min-[375px]:px-3.5 sm:px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 min-[375px]:gap-2 cursor-pointer font-[Matter] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span className="whitespace-nowrap">Connecting...</span>
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
    </div>
  );
}
