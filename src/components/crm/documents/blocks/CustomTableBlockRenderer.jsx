"use client";

import { Plus } from "lucide-react";

export default function CustomTableBlockRenderer({ block, onUpdate }) {
  function updateTableCell(rowIndex, colIndex, val) {
    const rows = (block.rows || []).map((r, rIdx) => {
      if (rIdx === rowIndex) {
        const newR = [...r];
        newR[colIndex] = val;
        return newR;
      }
      return r;
    });
    onUpdate({ rows });
  }

  function updateTableColumn(colIndex, val) {
    const cols = [...(block.columns || [])];
    cols[colIndex] = val;
    onUpdate({ columns: cols });
  }

  function addTableRow() {
    const cols = block.columns || ["Col 1", "Col 2"];
    const rows = block.rows || [];
    const newR = cols.map(() => "New entry");
    onUpdate({ rows: [...rows, newR] });
  }

  function addTableCol() {
    const cols = block.columns || ["Col 1", "Col 2"];
    const rows = block.rows || [];
    const newCols = [...cols, `Column ${cols.length + 1}`];
    const newRows = rows.map((r) => [...r, "-"]);
    onUpdate({ columns: newCols, rows: newRows });
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={block.heading || "Scope Table"}
        onChange={(e) => onUpdate({ heading: e.target.value })}
        className="text-sm font-black uppercase tracking-wider text-orange-600 border-0 bg-transparent outline-hidden px-1"
      />
      <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100/80 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              {(block.columns || ["Col 1", "Col 2"]).map((col, cIdx) => (
                <th key={cIdx} className="py-2 px-3">
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => updateTableColumn(cIdx, e.target.value)}
                    className="w-full font-bold text-gray-700 dark:text-neutral-200 bg-transparent border-0 outline-hidden focus:bg-orange-50/40 rounded"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {(block.rows || []).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-gray-50/40">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2 px-3">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateTableCell(rIdx, cIdx, e.target.value)}
                      className="w-full text-gray-800 dark:text-neutral-200 bg-transparent border-0 outline-hidden focus:bg-orange-50/40 rounded"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 print:hidden">
        <button
          type="button"
          onClick={addTableRow}
          className="px-2.5 py-1 rounded-lg border border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Row
        </button>
        <button
          type="button"
          onClick={addTableCol}
          className="px-2.5 py-1 rounded-lg border border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Column
        </button>
      </div>
    </div>
  );
}
