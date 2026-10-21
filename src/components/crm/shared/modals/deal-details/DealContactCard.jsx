"use client";

import { Phone, Users } from "lucide-react";
import WhatsAppIcon from "../../WhatsAppIcon";

export default function DealContactCard({
  selectedDeal,
  lead,
  client,
  contactName,
  contactCompany,
  contactPhone,
  contactEmail,
  handleWhatsAppClick,
  sendDealDocWhatsApp,
}) {
  return (
    <div className="p-2.5 min-[360px]:p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2 min-[360px]:space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 font-bold text-xs min-[360px]:text-sm text-gray-900 dark:text-white">
          <Users className="w-4 h-4 text-orange-500 shrink-0" />
          <span>Contact & Client Details</span>
        </div>
        {contactPhone && (
          <div className="flex items-center gap-1 min-[360px]:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (lead) handleWhatsAppClick(lead);
                else sendDealDocWhatsApp(selectedDeal);
              }}
              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-100 transition cursor-pointer"
            >
              <WhatsAppIcon className="w-3 h-3" />
              <span>WhatsApp</span>
            </button>
            <a
              href={`tel:${contactPhone}`}
              className="px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 font-bold text-[10px] flex items-center gap-1 hover:bg-orange-100 transition"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400 text-[10px] block">Name / Entity</span>
          <span className="font-semibold text-gray-800 dark:text-neutral-200">
            {contactName} {contactCompany ? `(${contactCompany})` : ""}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Phone Number</span>
          <span className="font-semibold text-gray-800 dark:text-neutral-200 font-mono">
            {contactPhone || "Not provided"}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Email</span>
          <span className="font-semibold text-gray-800 dark:text-neutral-200 truncate block">
            {contactEmail || "Not provided"}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Relationship</span>
          <span className="font-semibold text-gray-800 dark:text-neutral-200">
            {client ? "Existing Client" : lead ? "Inbound Lead" : "Direct Deal"}
          </span>
        </div>
      </div>
    </div>
  );
}
