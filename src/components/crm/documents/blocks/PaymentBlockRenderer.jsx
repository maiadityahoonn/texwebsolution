"use client";

import { Plus, Trash2 } from "lucide-react";
import { createBlockId } from "../documentUtils";

export default function PaymentBlockRenderer({ block, onUpdate }) {
  function updateMilestone(milestoneId, field, value) {
    const milestones = (block.milestones || []).map((m) => {
      if (m.id === milestoneId) {
        return { ...m, [field]: value };
      }
      return m;
    });
    onUpdate({ milestones });
  }

  function addMilestoneRow() {
    const milestones = block.milestones || [];
    const newM = {
      id: createBlockId(),
      milestone: "Phase Milestone",
      percentage: 20,
      amount: 15000,
      dueDate: "Upon Milestone Completion",
    };
    onUpdate({ milestones: [...milestones, newM] });
  }

  function removeMilestoneRow(milestoneId) {
    const milestones = (block.milestones || []).filter((m) => m.id !== milestoneId);
    onUpdate({ milestones });
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={block.heading || "Payment Schedule"}
        onChange={(e) => onUpdate({ heading: e.target.value })}
        className="text-sm font-black uppercase tracking-wider text-orange-600 border-0 bg-transparent outline-hidden px-1"
      />
      <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100/80 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-neutral-300 font-bold">
              <th className="py-2.5 px-3">Milestone / Stage</th>
              <th className="py-2.5 px-2 text-center w-16">% Share</th>
              <th className="py-2.5 px-3 text-right w-24">Amount (₹)</th>
              <th className="py-2.5 px-3 w-40">Due / Trigger</th>
              <th className="py-2.5 px-2 w-8 print:hidden"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {(block.milestones || []).map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/50">
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={m.milestone}
                    onChange={(e) => updateMilestone(m.id, "milestone", e.target.value)}
                    className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-0 outline-hidden focus:bg-orange-50/40 px-1 rounded"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="number"
                    value={m.percentage}
                    onChange={(e) => updateMilestone(m.id, "percentage", Number(e.target.value))}
                    className="w-12 text-center font-bold bg-transparent border-0 outline-hidden focus:bg-orange-50/40 rounded"
                  />
                </td>
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    value={m.amount}
                    onChange={(e) => updateMilestone(m.id, "amount", Number(e.target.value))}
                    className="w-20 text-right font-mono font-bold bg-transparent border-0 outline-hidden focus:bg-orange-50/40 rounded"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={m.dueDate || ""}
                    onChange={(e) => updateMilestone(m.id, "dueDate", e.target.value)}
                    className="w-full text-xs text-gray-500 bg-transparent border-0 outline-hidden focus:bg-orange-50/40 px-1 rounded"
                  />
                </td>
                <td className="py-2 px-2 text-center print:hidden">
                  <button
                    type="button"
                    onClick={() => removeMilestoneRow(m.id)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer p-0.5"
                    title="Remove milestone"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addMilestoneRow}
        className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 text-xs font-bold text-orange-600 hover:bg-orange-50 cursor-pointer flex items-center gap-1.5 w-fit print:hidden"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Milestone
      </button>
    </div>
  );
}
