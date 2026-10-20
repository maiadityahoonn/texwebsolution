"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, PhoneCall } from "lucide-react";

export default function GetInTouchSection() {
  return (
    <section className="w-full flex flex-col items-center py-10 sm:py-12 bg-neutral-50 border-y border-gray-100" id="get-in-touch" style={{ fontFamily: "Matter, sans-serif" }}>
      <div className="max-w-4xl mx-auto text-center px-3 min-[360px]:px-6">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
          Get In Touch
        </div>
        <h2 className="text-xl min-[360px]:text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-3 leading-tight pb-1">
          Let&apos;s build something great together
        </h2>
        <p className="text-xs min-[360px]:text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto mb-6 sm:mb-10 leading-relaxed">
          Have a custom project or need a pre-built solution? Reach out to us, and we&apos;ll help you bring your vision to life.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2.5 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto">
          <a
            href="mailto:info@texwebsolution.in"
            className="w-full sm:w-auto px-4 min-[360px]:px-7 py-2.5 sm:py-3 bg-red-600 text-white font-semibold text-xs min-[360px]:text-sm rounded-full hover:bg-red-700 transition-colors shadow-md shadow-red-600/15 text-center flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 shrink-0" />
            <span className="whitespace-nowrap">Email Us</span>
          </a>
          <a
            href="https://wa.me/+917462827259"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 min-[360px]:px-7 py-2.5 sm:py-3 bg-white text-gray-800 font-semibold text-xs min-[360px]:text-sm border border-gray-200 rounded-full hover:border-green-600 hover:text-green-600 hover:bg-green-50/20 transition-all shadow-sm text-center flex items-center justify-center gap-2 min-[360px]:gap-2.5 whitespace-nowrap"
          >
            <Image width={64} height={64} src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg" alt="WhatsApp" className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 object-contain shrink-0" />
            <span className="whitespace-nowrap">Chat on WhatsApp</span>
          </a>
          <a
            href="tel:07554601839"
            className="w-full sm:w-auto px-4 min-[360px]:px-7 py-2.5 sm:py-3 bg-white text-gray-800 font-semibold text-xs min-[360px]:text-sm border border-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/20 transition-all shadow-sm text-center flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <PhoneCall className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-blue-600 shrink-0" />
            <span className="whitespace-nowrap">Call: 0755-4601839</span>
          </a>
        </div>
      </div>
    </section>
  );
}
