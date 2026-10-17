"use client";

import {
  Bot,
  Code2,
  Megaphone,
  MonitorSmartphone,
  ShoppingCart,
  Users,
} from "lucide-react";

const footerServices = [
  ["Website Development", Code2],
  ["Mobile App Development", MonitorSmartphone],
  ["E-commerce Solutions", ShoppingCart],
  ["Digital Marketing", Megaphone],
  ["SMM", Users],
  ["AI & Automation", Bot],
];

export default function TexWebLetterheadFooter({ brand = {}, onUpdateBrand }) {
  return (
    <footer className="relative h-[92px] bg-slate-950 text-white overflow-hidden select-none">
      <div className="absolute left-0 top-0 h-10 w-44 bg-red-600 -skew-x-35 -translate-x-7 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-28 bg-red-600 skew-x-35 translate-x-10 pointer-events-none" />

      <div className="relative z-10 h-full flex items-center justify-between gap-3 px-8 text-[10px]">
        {/* Company and CIN */}
        <div className="min-w-[190px]">
          <input
            type="text"
            value={brand.companyName || "TexWeb Solution Private Limited"}
            onChange={(e) => onUpdateBrand?.({ companyName: e.target.value })}
            className="text-[11px] font-black text-white border-0 bg-transparent outline-hidden w-full focus:bg-white/10 rounded px-1"
          />
          <div className="flex items-center text-white/70 font-semibold px-1">
            <span>CIN:</span>
            <input
              type="text"
              value={brand.cin || "U85500WB2026PTC287896"}
              onChange={(e) => onUpdateBrand?.({ cin: e.target.value })}
              className="text-[10px] text-white/80 font-mono border-0 bg-transparent outline-hidden ml-1 w-36 focus:bg-white/10 rounded"
            />
          </div>
        </div>

        {/* 6 Services */}
        <div className="hidden sm:flex items-center gap-2.5">
          {footerServices.map(([label, Icon]) => (
            <div
              key={label}
              className="flex items-center gap-1 border-l border-red-600/70 pl-2.5 font-bold leading-tight text-white/90"
            >
              <Icon className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate max-w-[85px]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
