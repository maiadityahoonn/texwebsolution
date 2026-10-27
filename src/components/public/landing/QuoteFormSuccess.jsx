"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";

export default function QuoteFormSuccess({ formData, onReset }) {
  const cleanService = (formData.service || "Web / App Development")
    .replace(/E-Commerce\s*\+\s*Meta\s*Ads/gi, "E-Commerce & Online Store")
    .replace(/Meta\s*Ads\s*(&|\+|and)?\s*(Digital\s*Marketing|Marketing)?/gi, "Digital Marketing & Growth")
    .replace(/Meta\s*Ads?/gi, "Digital Marketing")
    .trim();

  const whatsappUrl = `https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20just%20submitted%20a%20quote%20request%20for%20${encodeURIComponent(
    cleanService
  )}.%20My%20name%20is%20${encodeURIComponent(formData.name || "Client")}.`;

  return (
    <div className="py-10 text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 font-[Matter]">
          Inquiry Received Successfully!
        </h3>
        <p className="text-sm text-gray-600 font-poppins max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-gray-900">{formData.name}</strong>. Our sales team will connect with you shortly regarding <strong className="text-red-600">{formData.service}</strong>.
        </p>
      </div>

      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl max-w-md mx-auto text-xs text-emerald-900 font-medium space-y-1 font-poppins">
        <p>⚡ Our sales team will connect on WhatsApp / Phone within 15 minutes.</p>
        <p className="text-emerald-700">Project Budget: {formData.budget} | Timeline: {formData.timeline}</p>
      </div>

      <div className="space-y-3 max-w-md mx-auto pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackMetaEvent("Contact", { method: "whatsapp_after_lead" })}
          className="w-full py-3 min-[375px]:py-3.5 px-3 min-[375px]:px-6 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs min-[375px]:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer font-[Matter] whitespace-nowrap"
        >
          <Image
            src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
            alt="WhatsApp"
            width={20}
            height={20}
            className="w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 object-contain shrink-0"
          />
          <span className="whitespace-nowrap">Chat with Our Sales Team on WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-gray-800 underline transition cursor-pointer font-poppins"
        >
          Submit another inquiry
        </button>
      </div>
    </div>
  );
}
