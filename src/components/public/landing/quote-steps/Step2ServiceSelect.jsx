"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SERVICES_CONFIG, DYNAMIC_SERVICE_CONFIGS } from "../quoteModalConstants";
import ModalIcon from "../LandingModalIcons";

export default function Step2ServiceSelect({ formData, onChange, onBack, onNext }) {
  const activeServiceKey = formData.service in DYNAMIC_SERVICE_CONFIGS 
    ? formData.service 
    : "Website Development";

  const handleSelectService = (srvKey) => {
    onChange("service", srvKey);
    const cfg = DYNAMIC_SERVICE_CONFIGS[srvKey];
    if (cfg) {
      onChange("budget", `${cfg.budgets[0].amount} (${cfg.budgets[0].desc})`);
      onChange("specific_type", cfg.specificOptions[0].title);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Question Header */}
      <div className="shrink-0 flex items-center justify-between pb-2 gap-2">
        <div className="min-w-0 flex-1">
          <label className="block text-xs sm:text-sm font-bold text-gray-950 font-[Matter]">
            1. Main Service <span className="text-red-500">*</span>
          </label>
          <p className="text-[10px] min-[375px]:text-[11px] text-gray-500 font-poppins mt-0.5">
            Pehle apni main service chunein, agla sawal iske mutabik aayega.
          </p>
        </div>
        <span className="text-[10px] min-[375px]:text-[10.5px] text-red-600 font-bold font-poppins shrink-0 bg-red-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-red-100 whitespace-nowrap">
          Question 1 of 5
        </span>
      </div>

      {/* 8 Service Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto p-1 pr-1.5 scrollbar-thin overscroll-contain touch-pan-y">
        <div className="space-y-2">
          {SERVICES_CONFIG.map((srv) => {
            const isSelected = activeServiceKey === srv.key;
            return (
              <button
                type="button"
                key={srv.key}
                onClick={() => handleSelectService(srv.key)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-between border-2 ${
                  isSelected
                    ? "bg-red-50/90 text-red-950 border-red-600 shadow-sm"
                    : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-red-100 text-red-600 shadow-xs" : "bg-gray-100 text-gray-600"
                  }`}>
                    <ModalIcon name={srv.icon} className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-xs sm:text-sm leading-snug text-gray-950">
                      {srv.label}
                    </span>
                    <span className={`text-[10px] min-[375px]:text-[11px] leading-tight mt-0.5 ${
                      isSelected ? "text-red-700 font-medium" : "text-gray-500 font-normal"
                    }`}>
                      {srv.sub}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pl-1">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? "border-red-600 bg-red-600 text-white" : "border-gray-300 bg-white"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
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
          <span className="whitespace-nowrap">Next: Requirement (2/5)</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}
