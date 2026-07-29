"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPage() {
  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[45vh] sm:min-h-[50vh]" 
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-12 pb-16">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full font-semibold text-xs sm:text-sm font-[Matter] mb-4">
            Payment & Cancellation Policy
          </div>
          <h1 
            className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-2" 
            style={{ fontFamily: "Matter, sans-serif" }}
          >
            Refund Policy
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-xl mx-auto font-poppins font-light">
            Effective Date: January 2026 • TexWeb Solution Pvt. Ltd.
          </p>
        </div>
      </div>

      {/* Main Legal Content */}
      <main className="w-full py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto font-poppins text-gray-700 leading-relaxed">
        <div className="space-y-8 sm:space-y-12">
          
          <section className="bg-slate-50/70 border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">1. Overview</h2>
            <p className="mb-4">
              At <strong>TexWeb Solution Pvt. Ltd.</strong> (&quot;TexWeb Solution&quot;, &quot;we&quot;, &quot;our&quot;), we are dedicated to delivering world-class software development, prebuilt SaaS platforms, custom AI automation agents, and high-conversion digital marketing solutions.
            </p>
            <p>
              This Refund Policy outlines the terms regarding payments, milestone deposits, project cancellations, and refunds for all services provided by TexWeb Solution Pvt. Ltd.
            </p>
          </section>

          <section className="bg-red-50/50 border border-red-100 rounded-3xl p-5 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">2. No Refund Policy</h2>
            <p className="mb-4 font-medium text-gray-900">
              All payments, milestone deposits, and fees paid to TexWeb Solution Pvt. Ltd. are strictly non-refundable.
            </p>
            <p className="mb-4 font-light">
              Once a payment is received and project development, source code configuration, AI bot setup, or digital marketing execution has been initiated, no refund requests will be entertained under any circumstances, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base">
              <li>Change of mind or internal strategy change after payment initiation.</li>
              <li>Alterations in client business goals, funding status, or operational timelines.</li>
              <li>Delays caused by the client in providing required content, branding assets, or API credentials.</li>
              <li>Voluntary decision by the client to pause or cancel the project mid-way.</li>
              <li>Dissatisfaction after custom engineering or design milestones have been approved and developed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">3. Our Service & Delivery Commitment</h2>
            <p className="mb-4">
              While payments are non-refundable, TexWeb Solution guarantees 100% completion of all deliverables agreed upon at the time of quotation or invoice sign-off:
            </p>
            <ul className="list-disc pl-6 space-y-3 marker:text-red-600 text-sm sm:text-base">
              <li>
                <strong>Custom Development:</strong> Complete build and deployment of mobile apps (iOS/Android), web platforms, admin panels, and backend APIs according to project specifications.
              </li>
              <li>
                <strong>Prebuilt SaaS Platforms:</strong> Configuration, branding, and deployment of launch-ready software within agreed timelines (typically 1 to 2 weeks), including 100% source code transfer upon final payment.
              </li>
              <li>
                <strong>AI & Workflow Automation:</strong> Deployment of functional WhatsApp AI bots, AI phone assistants, Document OCR pipelines, and workflow integrations.
              </li>
              <li>
                <strong>Digital Marketing:</strong> Completion of video shooting, reel editing, paid ad funnel setup, or SEO deliverables as outlined in the monthly campaign scope.
              </li>
              <li>
                <strong>Post-Launch Bug Fixes:</strong> Free technical maintenance and bug fixing support during the agreed post-deployment warranty period.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">4. Third-Party Costs & Subscription Fees</h2>
            <p className="mb-4">
              TexWeb Solution project fees do not include external third-party subscriptions or infrastructure costs:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base">
              <li>Fees paid for domain registration, cloud servers (AWS, Google Cloud), payment gateways, or third-party APIs (OpenAI, WhatsApp API, Twilio) are non-refundable and paid directly to third-party vendors.</li>
              <li>Meta and Google ad spend budgets are managed directly on client ad accounts and are subject to respective platform policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">5. Project Cancellation</h2>
            <p className="mb-4">
              If a client requests project cancellation after development has commenced:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base">
              <li>The project will be marked as voluntarily terminated.</li>
              <li>No refund for prior milestone payments or advance deposits will be issued.</li>
              <li>Partial work modules or source code developed up to the point of cancellation may be handed over at TexWeb Solution&apos;s sole discretion, provided all accrued costs are cleared.</li>
            </ul>
          </section>

          <section className="bg-slate-50/70 border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-[Matter]">6. Contact Information</h2>
            <p className="mb-4 font-light">
              For any questions regarding our Refund Policy or payment terms, please contact our billing desk:
            </p>
            <div className="space-y-2 text-sm sm:text-base text-gray-800 font-medium font-poppins">
              <p><strong>Company Name:</strong> TexWeb Solution Pvt. Ltd.</p>
              <p><strong>CIN:</strong> U85500WB2026PTC287896</p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:info@texwebsolution.in" className="text-red-600 hover:underline">
                  info@texwebsolution.in
                </a>
              </p>
              <p>
                <strong>Phone / WhatsApp:</strong>{" "}
                <a href="https://wa.me/+917462827259" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                  +91 7462827259
                </a>
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
