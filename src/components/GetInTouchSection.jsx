"use client";

import Link from "next/link";

export default function GetInTouchSection() {
  return (
    <section className="w-full flex flex-col items-center py-12 sm:py-16 bg-neutral-50 border-y border-gray-100" id="contact" style={{ fontFamily: "Matter, sans-serif" }}>
      <div className="max-w-4xl mx-auto text-center px-6">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
          Get In Touch
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mt-2 mb-6 leading-tight pb-1">
          Let&apos;s build something great together
        </h2>
        <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
          Have a custom project or need a pre-built solution? Reach out to us, and we&apos;ll help you bring your vision to life.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="mailto:info@texwebsolution.in"
            className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-md shadow-red-600/15 text-center"
          >
            Email Us
          </a>
          <a
            href="https://wa.me/+917462827259"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 bg-white text-gray-800 font-semibold border border-gray-200 rounded-full hover:border-green-600 hover:text-green-600 hover:bg-green-50/20 transition-all shadow-sm text-center"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
