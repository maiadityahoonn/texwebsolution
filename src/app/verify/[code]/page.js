"use client";

import { use, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Award, Calendar, CheckCircle2, Download, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyPage({ params }) {
  const unwrappedParams = use(params);
  const code = unwrappedParams.code;

  return (
    <div className="min-h-screen bg-slate-50 font-[Matter]">
      <Navbar />

      <main className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        {/* Verification Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border-2 border-red-100 shadow-xl relative overflow-hidden text-left">
          {/* Top Stamp / Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>OFFICIALLY VERIFIED CREDENTIAL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Certificate of Internship Completion
              </h1>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Verification ID: <span className="font-bold text-gray-800">{code}</span>
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20 text-white">
              <Award className="w-9 h-9" />
            </div>
          </div>

          {/* Body Content */}
          <div className="py-8 space-y-6">
            <p className="text-sm sm:text-base text-gray-600 font-poppins leading-relaxed">
              This document officially verifies that the candidate has successfully completed the structured industry internship at <strong>TexWeb Solution Pvt. Ltd.</strong> with outstanding performance and practical project contributions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200/60 font-poppins text-xs sm:text-sm">
              <div>
                <span className="text-gray-400 block text-xs mb-1">Candidate Name</span>
                <span className="font-bold text-gray-900 text-base">Vikramaditya Roy</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs mb-1">Domain / Specialization</span>
                <span className="font-bold text-red-600">Full Stack Web Development</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs mb-1">Tenure / Duration</span>
                <span className="font-semibold text-gray-800">June 01, 2026 — August 31, 2026</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs mb-1">Performance Grade</span>
                <span className="font-bold text-emerald-600">A+ Outstanding</span>
              </div>
            </div>
          </div>

          {/* Footer Signatures & QR Section */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-xs text-gray-500 font-poppins space-y-1">
              <div className="font-bold text-gray-900">Authorized by TexWeb Solution Pvt. Ltd.</div>
              <div>Digitally signed and cryptographically verified on Supabase Cloud.</div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Print / Download Certificate</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
