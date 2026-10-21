"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export default function DealPipelineProgress({ stages = [], currentStageIndex = -1, isWon = false, isLost = false }) {
  return (
    <div className="p-2.5 min-[360px]:p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-700/60 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] min-[360px]:text-[11px] font-bold text-gray-700 dark:text-neutral-300 uppercase tracking-wide">
          Pipeline Progression
        </span>
        {isWon ? (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Deal Won
          </span>
        ) : isLost ? (
          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Closed Lost
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-gray-500">Step {currentStageIndex + 1} of 5</span>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1 min-[360px]:gap-1.5">
        {stages.map((stage, index) => {
          const isCompleted = !isLost && currentStageIndex >= index;
          const isCurrent = !isLost && currentStageIndex === index;

          return (
            <div
              key={stage.id}
              title={stage.label}
              className={`text-center py-1 min-[360px]:py-1.5 px-0.5 min-[360px]:px-1 rounded-md min-[360px]:rounded-lg text-[8.5px] min-[360px]:text-[9.5px] sm:text-[10px] font-bold transition-all truncate ${
                isCurrent
                  ? "bg-orange-500 text-white shadow-xs"
                  : isCompleted
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-neutral-500"
              }`}
            >
              {stage.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
