"use client";

import { Bot, Code2, Megaphone, MonitorSmartphone, ShoppingCart, Users } from "lucide-react";
import { buildDocumentSections, formatShortDate, getDefaultBrand, getDocumentAmount, getDocumentClient, getDocumentKind, getDocumentTitle } from "./documentUtils";
import { renderContactBadgeIcon } from "./LetterheadContactBadges";

const footerServices = [
  ["Website Development", Code2],
  ["Mobile App Development", MonitorSmartphone],
  ["E-commerce Solutions", ShoppingCart],
  ["Digital Marketing", Megaphone],
  ["SMM", Users],
  ["AI & Automation", Bot],
];

export default function TexWebLetterheadPage({
  doc,
  deals = [],
  clients = [],
  leads = [],
  sections,
  brand = getDefaultBrand(),
  page = 1,
  selectedBlockId = "",
  onSelectBlock,
}) {
  const kind = getDocumentKind(doc);
  const isAgreement = kind === "agreement";
  const contact = getDocumentClient(doc, deals, clients, leads);
  const amount = getDocumentAmount(doc);
  const title = getDocumentTitle(doc);
  const contentSections = (sections?.length ? sections : buildDocumentSections(doc, kind)).filter((section) => Number(section.page || 1) === page);

  return (
    <div className="mx-auto w-[794px] min-h-[1123px] bg-white text-slate-950 shadow-xl border border-gray-200 relative overflow-hidden print:shadow-none print:border-0">
      <header className="relative h-[146px] border-b-[6px] border-slate-950 overflow-hidden">
        <div className="absolute -left-8 -top-8 grid grid-cols-7 gap-2 opacity-20">
          {Array.from({ length: 56 }).map((_, index) => (
            <span key={index} className="h-2 w-2 rounded-full bg-slate-400" />
          ))}
        </div>
        <div className="absolute left-0 bottom-0 h-14 w-52 bg-slate-950 -skew-x-35 origin-bottom-left" />
        <div className="absolute left-0 bottom-0 h-7 w-60 bg-red-600 -skew-x-35 origin-bottom-left translate-y-2" />
        <div className="absolute right-0 top-0 h-full w-40 bg-slate-950 skew-x-35 translate-x-16" />
        <div className="absolute right-0 top-16 h-7 w-56 bg-red-600 -skew-x-35 translate-x-8" />
        <div className="relative z-10 flex h-full items-center justify-between gap-7 px-16">
          <div className="flex items-center gap-4 min-w-0">
            <img src={brand.logoUrl || "/logo.png"} alt="TexWeb Solution" className="h-24 w-24 rounded-2xl object-contain shrink-0" />
            <div className="min-w-0">
              <img src={brand.fullLogoUrl || "/texweb-full-logo-cropped.png"} alt="TexWeb Solution" className="h-16 w-auto object-contain" />
              <div className="text-sm font-semibold text-slate-700 mt-1">{brand.tagline}</div>
            </div>
          </div>
          <div className="h-20 w-px bg-slate-900/80" />
          <div className="grid gap-2 text-[15px] font-semibold text-slate-800 shrink-0 pr-7">
            {[
              ["phone", brand.phone],
              ["email", brand.email],
              ["website", brand.website],
              ["location", brand.location],
            ].map(([iconKey, value]) => (
              <div key={iconKey} className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-[#D3151D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  {renderContactBadgeIcon(iconKey)}
                </span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="relative px-16 pt-12 pb-32 min-h-[884px] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-[45%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-red-500/8 flex items-center justify-center text-white font-black text-8xl">
            TW
          </div>
          <div className="absolute -left-36 bottom-12 h-56 w-[900px] rounded-[50%] border-t border-slate-200 rotate-[-13deg]" />
          <div className="absolute -left-20 bottom-4 h-42 w-[820px] rounded-[50%] border-t border-red-200 rotate-[-10deg]" />
          <div className="absolute right-2 bottom-14 grid grid-cols-7 gap-2 opacity-25">
            {Array.from({ length: 56 }).map((_, index) => (
              <span key={index} className="h-2 w-2 rounded-full bg-slate-400" />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="text-right text-xs text-slate-500 mb-8">
            <div className="font-bold text-slate-900">{doc.quotation_number || doc.agreement_number || doc.invoice_number || "DRAFT"}</div>
            <div>Created: {formatShortDate(doc.created_at)}</div>
            {!isAgreement && <div>Valid until: {formatShortDate(doc.valid_until)}</div>}
          </div>
          <h1 className="text-2xl font-black tracking-[0.18em] uppercase text-center border-b-2 border-orange-500 pb-4">
            {isAgreement ? "Project Agreement" : "Commercial Quotation"}
          </h1>
          <h2 className="text-lg font-black text-center mt-4 uppercase tracking-wide">{title}</h2>

          <div className="grid grid-cols-2 gap-3 mt-8 text-xs">
            <div className="border border-slate-200 bg-white/80 p-3">
              <div className="font-black uppercase tracking-wider text-orange-600 mb-2">Client</div>
              <div className="font-bold">{contact.name}</div>
              <div className="text-slate-500 break-words">{contact.email || "Email not set"}</div>
              <div className="text-slate-500">{contact.phone || "Phone not set"}</div>
            </div>
            <div className="border border-slate-200 bg-white/80 p-3">
              <div className="font-black uppercase tracking-wider text-orange-600 mb-2">Commercial</div>
              <div className="font-bold">{contact.deal?.service || doc.service || "Technology Services"}</div>
              <div className="text-slate-500">{contact.deal?.title || title}</div>
              {amount > 0 && <div className="font-black text-emerald-700 mt-1">Rs. {amount.toLocaleString("en-IN")}</div>}
            </div>
          </div>

          <div className="mt-10 space-y-7 text-[13px] leading-relaxed">
            {contentSections.map((section, index) => (
              <DocumentBlockPreview
                key={section.id || `${section.heading}-${index}`}
                section={section}
                selected={selectedBlockId === section.id}
                onSelect={() => onSelectBlock?.(section.id)}
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-0 h-[92px] bg-slate-950 text-white overflow-hidden">
        <div className="absolute left-0 top-0 h-10 w-44 bg-red-600 -skew-x-35 -translate-x-7" />
        <div className="absolute right-0 top-0 h-full w-28 bg-red-600 skew-x-35 translate-x-10" />
        <div className="relative z-10 h-full flex items-center justify-between gap-3 px-10 text-[10px]">
          <div className="font-black leading-tight min-w-[190px]">
            <div>{brand.companyName}</div>
            <div className="font-semibold text-white/70">CIN: {brand.cin}</div>
          </div>
          {footerServices.map(([label, Icon]) => (
            <div key={label} className="flex items-center gap-1.5 border-l border-red-600/70 pl-3 font-bold leading-tight">
              <Icon className="w-5 h-5 text-red-500 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

function DocumentBlockPreview({ section, selected, onSelect }) {
  const baseClass = `rounded-sm transition ${selected ? "outline outline-2 outline-orange-500 outline-offset-4" : "outline outline-0"}`;

  if (section.type === "divider") {
    return <hr onClick={onSelect} className={`border-orange-500 cursor-pointer ${selected ? "outline outline-2 outline-orange-500 outline-offset-4" : ""}`} />;
  }

  if (section.type === "image") {
    return (
      <section onClick={onSelect} className={`${baseClass} cursor-pointer`}>
        {section.heading && <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-orange-600 mb-2">{section.heading}</h3>}
        {section.imageUrl ? (
          <img src={section.imageUrl} alt={section.heading || "Document image"} className="max-h-52 rounded-lg border border-slate-200 object-contain" />
        ) : (
          <div className="h-28 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">Image placeholder</div>
        )}
      </section>
    );
  }

  if (section.type === "pricing" || section.type === "payment" || section.type === "table") {
    const rows = String(section.body || "")
      .split("\n")
      .map((row) => row.split("|").map((cell) => cell.trim()));
    return (
      <section onClick={onSelect} className={`${baseClass} cursor-pointer`}>
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-orange-600 mb-2">{section.heading}</h3>
        <table className="w-full border border-slate-300 text-[11px]">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex === 0 ? "bg-slate-100 font-black" : ""}>
                {(row.length > 1 ? row : [row[0], ""]).map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-slate-300 px-2 py-1.5 align-top">
                    {cell || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  return (
    <section onClick={onSelect} className={`${baseClass} cursor-pointer ${section.type === "box" ? "border border-orange-200 bg-orange-50/60 p-3" : ""}`}>
      {section.heading && <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-orange-600 mb-2">{section.heading}</h3>}
      <p className="whitespace-pre-wrap text-slate-700">{section.body}</p>
    </section>
  );
}
