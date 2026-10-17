"use client";

import { Download, FileSignature, FileText, ReceiptText } from "lucide-react";
import { formatShortDate, getDocumentClient, getDocumentKind, getDocumentStatus, getDocumentTitle } from "./documentUtils";

const badgeStyles = {
  quotation: "bg-blue-50 text-blue-700 border-blue-100",
  agreement: "bg-purple-50 text-purple-700 border-purple-100",
  invoice: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function DocumentCard({ doc, deals = [], clients = [], leads = [], onOpen }) {
  const kind = getDocumentKind(doc);
  const title = getDocumentTitle(doc);
  const contact = getDocumentClient(doc, deals, clients, leads);
  const status = getDocumentStatus(doc);
  const Icon = kind === "agreement" ? FileSignature : kind === "invoice" ? ReceiptText : FileText;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(doc)}
      className="group text-left rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition overflow-hidden cursor-pointer"
    >
      <div className="p-3">
        <div className="relative h-52 rounded-xl bg-gray-100 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] overflow-hidden">
          <div className="absolute left-3 top-3 z-10">
            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase ${badgeStyles[kind] || badgeStyles.quotation}`}>
              {kind === "agreement" ? "Agreement" : kind === "invoice" ? "Invoice" : "Quotation"}
            </span>
          </div>
          <div className="absolute inset-x-8 top-3 bottom-3 rounded-sm bg-white shadow-sm border border-gray-200 overflow-hidden relative">
            <img
              src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-official-letterhead.png"
              alt="Letterhead Preview"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none opacity-90"
            />
            <div className="relative z-10 p-2.5 pt-8 space-y-1.5">
              <div className="h-1.5 w-16 rounded-full bg-orange-600/80" />
              <div className="h-1.5 w-24 rounded-full bg-slate-700/60" />
              <div className="mt-3 grid grid-cols-2 gap-1 opacity-70">
                <div className="h-3 rounded bg-slate-200/80" />
                <div className="h-3 rounded bg-slate-200/80" />
              </div>
              <div className="pt-2 space-y-1 opacity-60">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-1 rounded-full bg-slate-300" />
                ))}
              </div>
            </div>
          </div>

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150 backdrop-blur-2xs z-20">
            <span className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition">
              <Download className="w-3.5 h-3.5" />
              Open & Download PDF
            </span>
          </div>

          <div className="absolute bottom-3 right-3 h-9 w-9 rounded-xl bg-white dark:bg-slate-900 text-orange-600 flex items-center justify-center shadow-sm z-25">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="font-black text-gray-950 dark:text-white truncate group-hover:text-orange-600 transition">{title}</div>
        <div className="text-sm text-gray-500 dark:text-neutral-400 truncate mt-1">{contact.name}</div>
        <div className="flex items-center justify-between gap-3 mt-2">
          <span className="text-xs text-gray-400">Created {formatShortDate(doc.created_at)}</span>
          <span className="px-2 py-1 rounded-full bg-gray-50 dark:bg-slate-800 text-[10px] font-bold uppercase text-gray-500 dark:text-neutral-300">
            {status}
          </span>
        </div>
      </div>
    </button>
  );
}
