"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BUSINESS_TYPE_OPTIONS } from "../quoteModalConstants";
import ModalIcon from "../LandingModalIcons";

export default function Step2CategorySelect({ formData, onChange, onBack, onNext }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Header */}
      <div className="shrink-0 space-y-1 pb-2">
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs sm:text-sm font-bold text-gray-950 font-[Matter] flex-1 min-w-0">
            4. Business Category <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] min-[375px]:text-[10.5px] text-red-600 font-bold font-poppins shrink-0 bg-red-50 px-2 py-0.5 sm:px-2.5 rounded-full border border-red-100 whitespace-nowrap">
            Question 4 of 5
          </span>
        </div>
        <p className="text-[10px] min-[375px]:text-[11px] text-gray-500 font-poppins">
          Chunein aapka business kis category ya field me kaam karta hai.
        </p>
      </div>

      {/* Grid of Clickable Category Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto p-1 pr-1.5 scrollbar-thin overscroll-contain touch-pan-y">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BUSINESS_TYPE_OPTIONS.map((opt) => {
            const isSelected = formData.what_type_of_business_do_you_have === opt.title || formData.what_type_of_business_do_you_have.startsWith(opt.title);
            return (
              <button
                type="button"
                key={opt.title}
                onClick={() => onChange("what_type_of_business_do_you_have", opt.title)}
                className={`text-left p-2.5 sm:p-3 rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-between border-2 ${
                  isSelected
                    ? "bg-red-50/90 text-red-950 border-red-600 shadow-sm"
                    : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-red-100 text-red-600 shadow-xs" : "bg-gray-100 text-gray-600"
                  }`}>
                    <ModalIcon name={opt.icon} className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-xs leading-snug text-gray-950">
                      {opt.title}
                    </span>
                    <span className={`text-[10px] min-[375px]:text-[10.5px] leading-tight mt-0.5 ${
                      isSelected ? "text-red-700 font-medium" : "text-gray-500 font-normal"
                    }`}>
                      {opt.sub}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pl-1">
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? "border-red-600 bg-red-600 text-white" : "border-gray-300 bg-white"
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons: Pinned at bottom */}
      <div className="shrink-0 pt-2.5 mt-auto border-t border-gray-100 flex items-center gap-2 min-[375px]:gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-2.5 min-[375px]:px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer font-[Matter]"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="whitespace-nowrap">Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 px-2.5 min-[375px]:px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-[1.01] active:scale-98 shadow-md shadow-red-600/25 cursor-pointer whitespace-nowrap font-[Matter]"
        >
          <span className="whitespace-nowrap">Next: Budget & Plan (5/5)</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}
