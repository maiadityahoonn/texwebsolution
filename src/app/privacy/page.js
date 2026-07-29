"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
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
            Data Protection
          </div>
          <h1 
            className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-2" 
            style={{ fontFamily: "Matter, sans-serif" }}
          >
            Privacy Policy
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">1. Commitment to Privacy</h2>
            <p className="mb-4">
              At <strong>TexWeb Solution Pvt. Ltd.</strong> ("TexWeb Solution", "we", "our"), we take data privacy and intellectual confidentiality very seriously. This Privacy Policy details how we collect, handle, store, and protect your personal information, client project specifications, proprietary business data, and software source codes across our custom development, prebuilt SaaS, AI automation, and digital marketing services.
            </p>
            <p>
              By accessing our website (<a href="https://texwebsolution.in" className="text-red-600 font-medium hover:underline">texwebsolution.in</a>) or sharing project requirements with us, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">2. Information We Collect</h2>
            <p className="mb-4">
              We collect information to provide high-performance software engineering, AI workflow setup, and digital marketing services:
            </p>
            <ul className="list-disc pl-6 space-y-3 marker:text-red-600 text-sm sm:text-base">
              <li>
                <strong>Contact & Profile Identifiers:</strong> Name, business email address, phone number, company name, and WhatsApp contact details shared via contact forms or newsletter subscriptions.
              </li>
              <li>
                <strong>Project Specifications & Assets:</strong> Business requirements, workflow diagrams, database structures, brand logos, copy text, API credentials, and domain/hosting details shared for software development.
              </li>
              <li>
                <strong>Payment & Invoicing Information:</strong> Billing address, GST details, and transaction records (processed securely through PCI-DSS compliant third-party payment gateways; we do not store raw credit/debit card credentials on our servers).
              </li>
              <li>
                <strong>Technical & Usage Data:</strong> IP addresses, browser types, device information, and site analytics collected automatically to optimize website load speeds and user experience.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">3. How We Use Your Information</h2>
            <p className="mb-4">
              Your information is strictly utilized for core operational and project execution purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base">
              <li>Building, configuring, and deploying your custom or prebuilt software applications.</li>
              <li>Setting up AI automation bots (WhatsApp AI, Voice Assistants, Document OCR pipelines).</li>
              <li>Executing Meta/Google paid ad campaigns, video shoots, reel editing, and SEO campaigns.</li>
              <li>Providing project status updates, technical support, and post-deployment maintenance.</li>
              <li>Sending periodic updates or newsletters (only if explicitly opted-in via newsletter subscription).</li>
            </ul>
          </section>

          <section className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">4. AI Data Privacy & Proprietary Security</h2>
            <p className="mb-4">
              For businesses deploying our <strong>AI Automation Solutions</strong> (WhatsApp AI Bots, RAG Knowledge Base Chatbots, Document OCR):
            </p>
            <ul className="list-disc pl-6 space-y-3 marker:text-emerald-600 text-sm sm:text-base">
              <li>
                <strong>Zero Public Training:</strong> Your internal business documents, customer databases, FAQ manuals, and proprietary knowledge bases are processed securely. They are <strong>NEVER used to train public Large Language Models (LLMs)</strong>.
              </li>
              <li>
                <strong>Confidential Code Authority:</strong> Once full payment is received, complete source code authority is transferred to you. We do not reuse or resell your proprietary custom logic to competitors.
              </li>
              <li>
                <strong>Enterprise Data Encryption:</strong> All API interactions and database connections utilize SSL/TLS 256-bit encryption during transit and storage.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">5. Data Sharing & Third-Party Disclosure</h2>
            <p className="mb-4">
              We do not sell, rent, or trade your personal or business data to third-party advertisers. Data is shared strictly when required for service execution:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-600 text-sm sm:text-base">
              <li>With essential cloud hosting infrastructure (AWS, Google Cloud, Vercel, DigitalOcean).</li>
              <li>With official API providers (WhatsApp Cloud API, OpenAI API, Meta Ads, Google Ads).</li>
              <li>When mandated by applicable legal processes or law enforcement under Indian jurisdiction.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">6. Cookies & Site Analytics</h2>
            <p className="mb-4">
              Our website uses standard cookies and session storage to optimize page performance, remember user preferences, and collect anonymous traffic analytics. You can disable cookies at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">7. Your Data Rights</h2>
            <p className="mb-4">
              You have the right to request access to the personal data we hold about you, request corrections, opt-out of newsletter communications, or request the deletion of your contact records by emailing <a href="mailto:info@texwebsolution.in" className="text-red-600 font-medium hover:underline">info@texwebsolution.in</a>.
            </p>
          </section>

          <section className="bg-red-50/60 border border-red-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Matter]">8. Contact Us & Privacy Officer</h2>
            <p className="mb-4 font-light">
              If you have any questions or data privacy inquiries, please contact our privacy officer:
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
