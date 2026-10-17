"use client";

import { Plus, Trash2 } from "lucide-react";
import { createBlockId } from "../documentUtils";

export default function PricingBlockRenderer({ block, onUpdate }) {
  function updatePricingItem(itemId, field, value) {
    const items = (block.pricingItems || []).map((row) => {
      if (row.id === itemId) {
        const updated = { ...row, [field]: value };
        if (field === "qty" || field === "rate") {
          const qty = Number(field === "qty" ? value : row.qty) || 0;
          const rate = Number(field === "rate" ? value : row.rate) || 0;
          updated.amount = qty * rate;
        }
        return updated;
      }
      return row;
    });
    onUpdate({ pricingItems: items });
  }

  function addPricingRow() {
    const items = block.pricingItems || [];
    const newRow = {
      id: createBlockId(),
      item: "New Item / Service",
      description: "Service specifications and deliverables",
      qty: 1,
      rate: 10000,
      amount: 10000,
    };
    onUpdate({ pricingItems: [...items, newRow] });
  }

  function removePricingRow(itemId) {
    const items = (block.pricingItems || []).filter((r) => r.id !== itemId);
    onUpdate({ pricingItems: items });
  }

  const subtotal = (block.pricingItems || []).reduce(
    (sum, r) => sum + (Number(r.amount) || 0),
    0
  );
  const taxRate = Number(block.taxRate ?? 18);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={block.heading || "Pricing"}
        onChange={(e) => onUpdate({ heading: e.target.value })}
        className="text-sm font-black uppercase tracking-wider text-orange-600 border-0 bg-transparent outline-hidden px-1"
      />
      <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100/80 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-neutral-300 font-bold">
              <th className="py-2.5 px-3">Item / Service</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Description</th>
              <th className="py-2.5 px-2 text-center w-16">Qty</th>
              <th className="py-2.5 px-3 text-right w-24">Rate (₹)</th>
              <th className="py-2.5 px-3 text-right w-24">Amount (₹)</th>
              <th className="py-2.5 px-2 w-8 print:hidden"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {(block.pricingItems || []).map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50">
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={row.item}
                    onChange={(e) => updatePricingItem(row.id, "item", e.target.value)}
                    className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-0 outline-hidden focus:bg-orange-50/40 px-1 rounded"
                  />
                </td>
                <td className="py-2 px-3 hidden sm:table-cell">
                  <input
                    type="text"
                    value={row.description || ""}
                    onChange={(e) => updatePricingItem(row.id, "description", e.target.value)}
                    className="w-full text-[11px] text-gray-500 bg-transparent border-0 outline-hidden focus:bg-orange-50/40 px-1 rounded"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={row.qty}
                    onChange={(e) => updatePricingItem(row.id, "qty", Number(e.target.value))}
                    className="w-12 text-center font-semibold bg-transparent border-0 outline-hidden focus:bg-orange-50/40 rounded"
                  />
                </td>
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    value={row.rate}
                    onChange={(e) => updatePricingItem(row.id, "rate", Number(e.target.value))}
                    className="w-20 text-right font-mono bg-transparent border-0 outline-hidden focus:bg-orange-50/40 rounded"
                  />
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                  ₹{(Number(row.amount) || 0).toLocaleString("en-IN")}
                </td>
                <td className="py-2 px-2 text-center print:hidden">
                  <button
                    type="button"
                    onClick={() => removePricingRow(row.id)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer p-0.5"
                    title="Remove row"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pricing Totals & Add Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={addPricingRow}
          className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 text-xs font-bold text-orange-600 hover:bg-orange-50 cursor-pointer flex items-center gap-1.5 w-fit print:hidden"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>

        <div className="w-56 space-y-1 text-xs border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-slate-700 sm:pl-4">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal:</span>
            <span className="font-mono font-bold text-gray-800 dark:text-neutral-200">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-gray-500 items-center">
            <span className="flex items-center gap-1">
              GST (
              <input
                type="number"
                value={taxRate}
                onChange={(e) => onUpdate({ taxRate: Number(e.target.value) })}
                className="w-7 text-center font-semibold bg-gray-100 dark:bg-slate-800 rounded text-[11px]"
              />
              %):
            </span>
            <span className="font-mono font-bold text-gray-800 dark:text-neutral-200">
              ₹{taxAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-slate-700">
            <span>Total:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
