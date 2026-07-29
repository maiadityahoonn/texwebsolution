"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
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
            Legal Information
          </div>
          <h1 
            className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-2" 
            style={{ fontFamily: "Matter, sans-serif" }}
          >
            Terms & Conditions
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-xl mx-auto font-poppins font-light">
            Last updated: February 2026 • TexWeb Solution Pvt. Ltd.
          </p>
        </div>
      </div>

      {/* Main Legal Content */}
      <main className="w-full py-16 px-6 max-w-4xl mx-auto font-poppins text-gray-700 leading-relaxed">
        <div className="space-y-12">
          
          <section className="bg-slate-50/70 border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">1. Introduction & Acceptance</h2>
            <p className="mb-4">
              Welcome to <strong>TexWeb Solution Pvt. Ltd.</strong> ("TexWeb Solution", "we", "our", or "us"). These Terms and Conditions govern your access to and use of our website (<a href="https://texwebsolution.in" className="text-red-600 font-medium hover:underline">texwebsolution.in</a>), mobile applications, custom software solutions, prebuilt SaaS products, AI automation services, and digital marketing offerings.
            </p>
            <p>
              By engaging our services, making a payment, or accessing our platforms, you agree to be legally bound by these Terms. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">2. Scope of Services</h2>
            <p className="mb-4">
              TexWeb Solution provides end-to-end technology and digital expansion services grouped into four core pillars:
            </p>
            <ul className="list-disc pl-6 space-y-3 marker:text-red-600 text-sm sm:text-base">
              <li>
                <strong>Custom Web & Mobile Development:</strong> Tailor-made web applications, native/cross-platform mobile apps (iOS & Android), custom CRM/ERP platforms, and enterprise software built according to client specifications.
              </li>
              <li>
                <strong>Prebuilt SaaS & Software Platforms:</strong> Ready-to-deploy digital products (multi-vendor marketplaces, food delivery, ride-sharing, e-commerce, healthcare apps) delivered with 100% source code ownership.
              </li>
              <li>
                <strong>AI & Workflow Automation:</strong> Custom WhatsApp AI Bots, AI Voice Calling Assistants, Document AI OCR extractors, RAG Knowledge Chatbots, and automated n8n/Make/Python operational workflows.
              </li>
              <li>
                <strong>Digital Marketing & Growth:</strong> Cinematic video shooting, viral reel/shorts editing, Meta & Google Paid Ad campaigns, Search Engine Optimization (SEO), and Brand Identity Creation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">3. Code Ownership & Intellectual Property</h2>
            <p className="mb-4">
              Intellectual Property (IP) rights and source code authority are transferred to the client as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base mb-4">
              <li>
                <strong>100% Source Code Transfer:</strong> Upon 100% completion of payment, complete source code ownership, intellectual property rights, and code authority for the customized or prebuilt platform are transferred to the client.
              </li>
              <li>
                <strong>Pre-Payment Ownership:</strong> Until final payment is received in full, all draft codes, designs, repository commits, and software assets remain the exclusive property of TexWeb Solution Pvt. Ltd.
              </li>
              <li>
                <strong>Third-Party Components:</strong> Open-source libraries, third-party APIs, framework licenses, and stock visual assets retain their respective author licenses.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">4. Payment Terms & Invoicing</h2>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base">
              <li>Project milestones and fee structures are outlined in the official quote, invoice, or agreement provided to the client.</li>
              <li>Invoices must be paid according to the agreed milestone schedule.</li>
              <li>TexWeb Solution reserves the right to pause active development, withhold app deployment, or delay source code delivery if payments are overdue.</li>
              <li>All payments are processed securely in Indian Rupees (INR) or agreed international currencies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">5. Client Responsibilities & Materials</h2>
            <p className="mb-4">
              Smooth project execution relies on timely collaboration. Clients are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base">
              <li>Providing necessary brand assets, API credentials, domain access, hosting credentials, and project requirements promptly.</li>
              <li>Providing feedback and approvals on design wireframes and development milestones within 3 to 5 business days.</li>
              <li>Delays caused by unresponsiveness or delayed client inputs will extend the estimated project completion timeline accordingly.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">6. Third-Party Integrations & Expenses</h2>
            <p className="mb-4">
              Our software solutions may integrate third-party APIs and services (e.g. OpenAI, WhatsApp Cloud API, AWS, Google Cloud, Razorpay, Stripe, Twilio, Play Store/App Store developer accounts).
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base">
              <li>Third-party subscription fees, API consumption charges, server hosting fees, and ad spend are paid directly by the client to the respective providers.</li>
              <li>TexWeb Solution is not liable for service outages, policy changes, or price revisions imposed by third-party platforms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">7. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by applicable law, TexWeb Solution Pvt. Ltd. and its directors, officers, employees, and partners shall not be liable for any indirect, incidental, punitive, or consequential damages (including loss of profits, data loss, or business interruption) arising from the use of our services or software deliverables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">8. Governing Law & Jurisdiction</h2>
            <p className="mb-4">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in West Bengal, India.
            </p>
          </section>

          <section className="bg-red-50/60 border border-red-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">9. Contact & Official Info</h2>
            <p className="mb-4 font-light">
              If you have any questions or require legal clarification regarding these Terms & Conditions, please reach out to us:
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
