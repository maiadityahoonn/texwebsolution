"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, PhoneCall, ShieldCheck, Trash2 } from "lucide-react";

export default function DataDeletionPage() {
  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      <div
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[42vh]"
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-12 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full font-semibold text-xs sm:text-sm font-[Matter] mb-4">
            <Trash2 className="w-4 h-4" />
            Data Deletion Request
          </div>
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-2"
            style={{ fontFamily: "Matter, sans-serif" }}
          >
            User Data Deletion Instructions
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-poppins font-light">
            This page explains how users can request deletion of personal data collected through TexWeb Solution forms, Meta Lead Ads, CRM, website inquiries, or support channels.
          </p>
        </div>
      </div>

      <main className="w-full py-10 sm:py-12 px-4 sm:px-6 max-w-4xl mx-auto font-poppins text-gray-700 leading-relaxed">
        <div className="space-y-8 sm:space-y-10">
          <section className="bg-slate-50/80 border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-2xl bg-red-50 text-red-600">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 font-[Matter]">How to Request Data Deletion</h2>
                <p className="mb-4">
                  To request deletion of your personal information, email us with the subject line <strong>&quot;Data Deletion Request&quot;</strong> and include the phone number or email address you used while submitting the form.
                </p>
                <p>
                  We will verify the request and delete or anonymize matching records from our CRM and internal systems, unless retention is required for legal, security, billing, or fraud-prevention obligations.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">Data Covered by This Request</h2>
            <ul className="list-disc pl-6 space-y-3 marker:text-red-600 text-sm sm:text-base">
              <li>Meta Lead Ads form submissions and CRM lead records.</li>
              <li>Website contact form inquiries and project consultation requests.</li>
              <li>Name, email, phone number, city/state, service interest, budget range, and form answers.</li>
              <li>Internal CRM notes connected to your inquiry, where deletion is legally permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">Deletion Timeline</h2>
            <p>
              We normally process verified deletion requests within <strong>7 business days</strong>. After completion, we will send a confirmation email or WhatsApp message to the contact detail used for the request.
            </p>
          </section>

          <section className="bg-red-50/60 border border-red-100 rounded-3xl p-5 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">Contact for Data Deletion</h2>
            <div className="space-y-3 text-sm sm:text-base text-gray-800 font-medium">
              <p><strong>Company:</strong> TexWeb Solution Pvt. Ltd.</p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:aditya963141@gmail.com?subject=Data%20Deletion%20Request" className="text-red-600 hover:underline">
                    aditya963141@gmail.com
                  </a>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Phone / WhatsApp:</strong>{" "}
                  <a href="https://wa.me/917462827259?text=Data%20Deletion%20Request" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                    +91 7462827259
                  </a>
                </span>
              </p>
            </div>
          </section>

          <section className="text-xs sm:text-sm text-gray-500">
            <p>
              Public Data Deletion URL: <strong>https://www.texwebsolution.in/data-deletion</strong>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
