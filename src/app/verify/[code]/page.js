"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Download, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCertificateByCode } from "@/services/supabaseService";

export default function VerifyPage({ params }) {
  const unwrappedParams = use(params);
  const code = unwrappedParams.code;
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificate() {
      const data = await getCertificateByCode(code);
      setCertificate(data);
      setLoading(false);
    }
    loadCertificate();
  }, [code]);

  const badgeText = loading ? "VERIFYING CREDENTIAL" : certificate ? "OFFICIALLY VERIFIED CREDENTIAL" : "CERTIFICATE NOT FOUND";
  const bodyText = loading
    ? "Checking this certificate code against TexWeb Solution cloud records."
    : certificate
      ? "This document officially verifies that the candidate has successfully completed the structured industry internship at TexWeb Solution Pvt. Ltd. with recorded performance and practical project contributions."
      : "We could not find a verified certificate with this code. Please check the code or contact TexWeb Solution support.";

  return (
    <div className="min-h-screen bg-slate-50 font-[Matter]">
      <Navbar />

      <main className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-12 border-2 border-red-100 shadow-xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${certificate || loading ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                <ShieldCheck className="w-4 h-4" />
                <span>{badgeText}</span>
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

          <div className="py-8 space-y-6">
            <p className="text-sm sm:text-base text-gray-600 font-poppins leading-relaxed">{bodyText}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200/60 font-poppins text-xs sm:text-sm">
              <Info label="Candidate Name" value={certificate?.intern_name || (loading ? "Loading..." : "Unavailable")} />
              <Info label="Domain / Specialization" value={certificate?.domain || "Unavailable"} accent />
              <Info label="Tenure / Duration" value={certificate ? `${certificate.start_date} to ${certificate.end_date}` : "Unavailable"} />
              <Info label="Performance Grade" value={certificate?.performance_grade || "Unavailable"} success />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-xs text-gray-500 font-poppins space-y-1">
              <div className="font-bold text-gray-900">Authorized by TexWeb Solution Pvt. Ltd.</div>
              <div>{certificate ? "Digitally verified on Supabase Cloud." : "Verification requires a valid certificate code."}</div>
            </div>

            <button
              onClick={() => window.print()}
              disabled={!certificate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
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

function Info({ label, value, accent = false, success = false }) {
  return (
    <div>
      <span className="text-gray-400 block text-xs mb-1">{label}</span>
      <span className={`font-bold text-base ${accent ? "text-red-600" : success ? "text-emerald-600" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}
