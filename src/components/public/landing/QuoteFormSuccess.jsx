"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";

export default function QuoteFormSuccess({ formData, onReset }) {
  const whatsappUrl = `https://wa.me/+917462827259?text=Hi%20TexWeb%20Solution,%20I%20just%20submitted%20a%20quote%20request%20for%20${encodeURIComponent(
    formData.service || "Web / App Development"
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
          Thank you, <strong className="text-gray-900">{formData.name}</strong>. Our Lead Tech Architect is reviewing your requirements for <strong className="text-red-600">{formData.service}</strong>.
        </p>
      </div>

      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl max-w-md mx-auto text-xs text-emerald-900 font-medium space-y-1 font-poppins">
        <p>⚡ We will connect on WhatsApp / Phone within 15 minutes.</p>
        <p className="text-emerald-700">Project Budget: {formData.budget} | Timeline: {formData.timeline}</p>
      </div>

      <div className="space-y-3 max-w-md mx-auto pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackMetaEvent("Contact", { method: "whatsapp_after_lead" })}
          className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2.5 cursor-pointer font-[Matter]"
        >
          <Image
            src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg"
            alt="WhatsApp"
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
          />
          <span>Chat with Lead Architect on WhatsApp Now</span>
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
