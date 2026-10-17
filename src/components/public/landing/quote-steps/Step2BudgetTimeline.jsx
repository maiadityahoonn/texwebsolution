"use client";

import { ArrowLeft, Check, Sparkles, Loader2, IndianRupee } from "lucide-react";
import { TIMELINE_OPTIONS, DYNAMIC_SERVICE_CONFIGS } from "../quoteModalConstants";
import ModalIcon from "../LandingModalIcons";

export default function Step2BudgetTimeline({ formData, onChange, onBack, onSubmit, loading, error }) {
  const activeServiceKey = formData.service in DYNAMIC_SERVICE_CONFIGS 
    ? formData.service 
    : "Website Development";

  const serviceConfig = DYNAMIC_SERVICE_CONFIGS[activeServiceKey];

  return (
    <div className="space-y-3.5 max-h-[66vh] overflow-y-auto p-1.5 scrollbar-thin overscroll-contain touch-pan-y">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-950 font-[Matter]">
            5. Budget & Timeline for {serviceConfig.label} <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-gray-500 font-poppins mt-0.5">
            Expected investment aur project start karne ka timeline chunein.
          </p>
        </div>
        <span className="text-[10.5px] text-red-600 font-bold font-poppins shrink-0 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
          Final 5 of 5
        </span>
      </div>

      {/* Conditional Budget for Chosen Service */}
      <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50/80 border border-gray-200/90">
        <label className="block text-xs font-bold text-gray-900 font-[Matter]">
          Expected Investment Range <span className="text-red-500">*</span>
        </label>
        
        <div className="space-y-1.5">
          {serviceConfig.budgets.map((b) => {
            const budgetValue = `${b.amount} (${b.desc})`;
            const isSelected = formData.budget === budgetValue || formData.budget.startsWith(b.amount);
            return (
              <button
                type="button"
                key={b.amount}
                onClick={() => onChange("budget", budgetValue)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between border-2 ${
                  isSelected
                    ? "bg-red-50/90 text-red-950 border-red-600 shadow-sm"
                    : "bg-white text-gray-800 hover:bg-gray-100/70 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-gray-950">{b.amount}</span>
                    <span className={`text-[11px] leading-tight ${isSelected ? "text-red-700 font-medium" : "text-gray-500"}`}>
                      {b.desc}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pl-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-red-600 bg-red-600 text-white" : "border-gray-300"
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Selector (With Lucide Icons) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-900 font-[Matter]">
          Kaam kab shuru karna chahte hain? (Timeline) <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {TIMELINE_OPTIONS.map((time) => {
            const isSelected = formData.timeline === time.label || formData.timeline.includes(time.label);
            return (
              <button
                type="button"
                key={time.id}
                onClick={() => onChange("timeline", `${time.label} - ${time.sub}`)}
                className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer border-2 flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-red-50 text-red-950 border-red-600 shadow-sm"
                    : "bg-white text-gray-800 hover:bg-gray-100 border-gray-200"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                }`}>
                  <ModalIcon name={time.icon} className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold leading-tight">{time.label}</span>
                  <span className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">{time.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Extra Notes / Details */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-900 font-[Matter]">
          Koi specific requirement ya reference link? (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Koi competitor website link, ya must-have features..."
          value={formData.details}
          onChange={(e) => onChange("details", e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-poppins focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 resize-none transition"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium font-poppins">
          {error}
        </div>
      )}

      {/* Navigation Buttons: Back to Question 4 + Submit */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer font-[Matter]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-[1.01] active:scale-98 shadow-md shadow-red-600/25 cursor-pointer disabled:opacity-60 font-[Matter]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Your Requirements...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Submit & Get Free Quote & Architecture ➔</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
