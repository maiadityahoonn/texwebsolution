"use client";

import { useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { renderContactBadgeIcon } from "./LetterheadContactBadges";

export default function TexWebLetterheadHeader({ brand = {}, onUpdateBrand }) {
  const logoInputRef = useRef(null);
  const fullLogoInputRef = useRef(null);
  const [isEditingContact, setIsEditingContact] = useState(false);

  function handleLogoUpload(type, files) {
    const file = files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "logo") onUpdateBrand?.({ logoUrl: url });
    if (type === "fullLogo") onUpdateBrand?.({ fullLogoUrl: url });
  }

  return (
    <header className="relative h-[146px] border-b-[6px] border-slate-950 overflow-hidden bg-white select-none">
      {/* Background Graphic Accents */}
      <div className="absolute -left-8 -top-8 grid grid-cols-7 gap-2 opacity-20 pointer-events-none">
        {Array.from({ length: 56 }).map((_, index) => (
          <span key={index} className="h-2 w-2 rounded-full bg-slate-400" />
        ))}
      </div>
      <div className="absolute left-0 bottom-0 h-14 w-52 bg-slate-950 -skew-x-35 origin-bottom-left pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-7 w-60 bg-red-600 -skew-x-35 origin-bottom-left translate-y-2 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-40 bg-slate-950 skew-x-35 translate-x-16 pointer-events-none" />
      <div className="absolute right-0 top-16 h-7 w-56 bg-red-600 -skew-x-35 translate-x-8 pointer-events-none" />

      {/* Header Content Bar */}
      <div className="relative z-10 flex h-full items-center justify-between gap-6 px-12">
        {/* Left: Interactive Logos + Tagline */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            onClick={() => logoInputRef.current?.click()}
            className="group/logo relative h-20 w-20 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-1.5 cursor-pointer shadow-xs hover:border-orange-500 shrink-0"
            title="Click to change logo icon"
          >
            <img
              src={brand.logoUrl || "/logo.png"}
              alt="Logo"
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition text-white text-[10px] font-bold">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleLogoUpload("logo", e.target.files)}
          />

          <div className="min-w-0">
            <div
              onClick={() => fullLogoInputRef.current?.click()}
              className="group/full relative cursor-pointer inline-block"
              title="Click to change full logo image"
            >
              <img
                src={brand.fullLogoUrl || "/texweb-full-logo-cropped.png"}
                alt="TexWeb Solution"
                className="h-12 w-auto object-contain"
              />
              <span className="text-[9px] text-gray-400 opacity-0 group-hover/full:opacity-100 block">
                Change logo
              </span>
            </div>
            <input
              ref={fullLogoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleLogoUpload("fullLogo", e.target.files)}
            />

            <input
              type="text"
              value={brand.tagline || ""}
              onChange={(e) => onUpdateBrand?.({ tagline: e.target.value })}
              placeholder="Company tagline..."
              className="text-xs font-semibold text-slate-700 border-0 bg-transparent outline-hidden block w-full focus:bg-orange-50/50 rounded px-1"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="h-16 w-px bg-slate-800/60 hidden sm:block" />

        {/* Right: Contact Pills */}
        <div className="grid gap-1.5 text-xs font-semibold text-slate-800 shrink-0 pr-4">
          {[
            ["phone", brand.phone || "0755-4601839"],
            ["email", brand.email || "info@texwebsolution.in"],
            ["website", brand.website || "www.texwebsolution.in"],
            ["location", brand.location || "Kolkata | Bhopal"],
          ].map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-[#D3151D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                {renderContactBadgeIcon(key)}
              </span>
              <input
                type="text"
                value={val}
                onChange={(e) => onUpdateBrand?.({ [key]: e.target.value })}
                className="text-xs font-bold text-slate-800 border-0 bg-transparent outline-hidden focus:bg-orange-50/60 rounded px-1 py-0.5 w-36 sm:w-44"
              />
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
