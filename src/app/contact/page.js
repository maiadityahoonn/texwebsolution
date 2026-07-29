"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { addLead } from "@/utils/leadStorage";
import CommonMarquee from "@/components/CommonMarquee";
import FaqAccordion from "@/components/FaqAccordion";
import GetInTouchSection from "@/components/GetInTouchSection";
import Footer from "@/components/Footer";
import { Mail, Copy, Check, MessageSquare, Clock, Send, Sparkles, PhoneCall, ShieldCheck, MapPin } from "lucide-react";

const CONTACT_FAQS = [
  {
    question: "How quickly will your team respond to my project inquiry?",
    answer: "We guarantee a response within 24 business hours. Our technical consultants will review your project requirements and reach out with a clear consultation plan."
  },
  {
    question: "Can we schedule a live strategy call or product demo?",
    answer: "Yes! Once you submit the contact form or message us on WhatsApp, our team will share an interactive calendar link to schedule a 1-on-1 Zoom or Google Meet session."
  },
  {
    question: "Do you sign Non-Disclosure Agreements (NDAs) before discussing custom ideas?",
    answer: "Absolutely. We respect client confidentiality. We are happy to sign a standard NDA before diving into your proprietary business logic, custom web app, or AI workflow specifications."
  },
  {
    question: "Can we combine multiple services (e.g., AI Automation + Digital Marketing + Custom Web App)?",
    answer: "Yes! In fact, most of our growth partners leverage an integrated tech & marketing stack—such as combining a custom Next.js web application with WhatsApp AI automation and targeted promotional video reels."
  },
  {
    question: "What is the typical workflow from inquiry to project launch?",
    answer: "Our streamlined workflow: 1) Initial Requirements Consultation ➔ 2) Custom Scope & Cost Estimate Proposal ➔ 3) Architecture Design & Milestone Roadmap ➔ 4) Agile Development & Daily Updates ➔ 5) Testing, Deployment & 24/7 Support."
  },
  {
    question: "Do you work with both Indian and international clients?",
    answer: "Yes, TexWeb Solution serves businesses, educational institutions, healthcare providers, and startups across India and internationally with seamless online collaboration and multi-currency billing support."
  }
];

const SERVICE_OPTIONS = [
  "AI Automation & Bots",
  "Digital Marketing & Reels",
  "Custom Web / Mobile App",
  "Prebuilt Software Solution",
  "Full-Stack Growth Package"
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "AI Automation & Bots",
    subject: "",
    message: ""
  });
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("info@texwebsolution.in");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceName) => {
    setFormData((prev) => ({ ...prev, service: serviceName }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Save lead to central Admin storage
    addLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      source: "Contact Form",
      notes: `${formData.subject ? `Subject: ${formData.subject}. ` : ''}${formData.message}`
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "AI Automation & Bots",
        subject: "",
        message: ""
      });
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[70vh] sm:min-h-[75vh] md:min-h-screen" 
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <img src="/common/contact_mail.png" alt="" aria-hidden="true" className="hidden md:block absolute top-28 right-12 w-36 lg:w-48 opacity-80 animate-floatingSmooth pointer-events-none select-none mix-blend-multiply" />
        <img src="/common/contact_chat.png" alt="" aria-hidden="true" className="hidden md:block absolute bottom-24 left-8 w-32 lg:w-44 opacity-70 animate-floatingSmooth pointer-events-none select-none mix-blend-multiply" style={{ animationDelay: '1s' }} />

        <div className="flex-1 flex flex-col justify-start pt-12 md:justify-center md:pt-0">
          <section className="flex flex-1 items-start md:items-center justify-start md:justify-center text-center px-4 sm:px-6 pt-12 sm:pt-14 md:pt-0">
            <div className="w-full">
              <h1 
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-red-600 bg-clip-text text-transparent leading-snug sm:leading-tight pb-2" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                Let's Build Something <br /> Extraordinary Together
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-500/80 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed">
                Whether you need AI Automation, custom software engineering, high-ROI digital marketing, or ready-to-deploy prebuilt SaaS, our team is ready to scale your business.
              </p>
            </div>
          </section>
        </div>

        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-6 sm:py-8 flex items-center shadow-inner group select-none">
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>AI Automation & Bots</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Custom Web & Mobile Apps</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Digital Marketing & Reels</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Prebuilt SaaS Software</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>AI Automation & Bots</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Custom Web & Mobile Apps</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Digital Marketing & Reels</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Prebuilt SaaS Software</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Info Side (Left Column) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
                Reach Out Directly
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
                Connect directly with our team
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed text-sm sm:text-base font-poppins font-light">
                Whether you prefer email, instant WhatsApp chat, or submitting a detailed inquiry, we are ready to analyze your requirements and deliver tailored results.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4 font-poppins">
              
              {/* Email Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                      <Mail size={22} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base font-[Matter]">Email Us</h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">info@texwebsolution.in</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCopyEmail}
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy Email"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* WhatsApp Card */}
              <a 
                href="https://wa.me/+917462827259" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-500/20 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors">
                      <MessageSquare size={22} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base font-[Matter]">WhatsApp Support</h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">+91 7462827259</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-green-600 px-3 py-1 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors font-[Matter]">
                    Chat Now
                  </span>
                </div>
              </a>

              {/* HQ Office Address Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl mt-0.5 shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base font-[Matter]">HQ Office</h4>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full font-[Matter]">Headquarters</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-poppins leading-relaxed">
                      24/A Beniatola Lane, Kolkata, West Bengal - 700009
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch Office Address Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl mt-0.5 shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base font-[Matter]">Branch Office</h4>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full font-[Matter]">Madhya Pradesh</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-poppins leading-relaxed">
                      A3-405, PMAY, Near RTO Office, Transport Nagar, Kokta, Bhopal, Madhya Pradesh - 462028
                    </p>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Form Side (Right Column) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"></div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Send us a Message</h3>
              <p className="text-xs sm:text-sm text-gray-500 font-poppins font-light mb-6">Fill in your requirements below and our team will get back to you with a personalized proposal.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Service Interest Selector */}
                <div className="space-y-2">
                  <label className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-700 block">
                    What service are you looking for?
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SERVICE_OPTIONS.map((opt) => {
                      const isSelected = formData.service === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleServiceSelect(opt)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-[Matter] transition-all duration-200 border ${
                            isSelected
                              ? "bg-red-600 text-white border-red-600 shadow-sm"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Dr. Bhuleshwar Patel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-poppins"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-700">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-poppins"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-700">Phone / WhatsApp Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-poppins"
                    />
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-700">Subject</label>
                    <input 
                      type="text" 
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. AI Automation & Web Development Inquiry"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-poppins"
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label htmlFor="message" className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-700">Message & Project Details</label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us about your project goals, preferred timelines, or any specific requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none font-poppins"
                  ></textarea>
                </div>

                {/* Submit button & feedback */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  
                  {submitStatus === "success" && (
                    <span className="text-xs sm:text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-2 font-[Matter]">
                      <Check size={16} /> Thank you! Our team will reach out within 24 hours.
                    </span>
                  )}
                  {submitStatus === "error" && (
                    <span className="text-xs sm:text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl font-[Matter]">
                      Failed to send message. Please try again or WhatsApp us directly.
                    </span>
                  )}
                  <div></div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full font-semibold transition-all shadow-md shadow-red-600/15 active:scale-95 text-sm sm:text-base shrink-0 font-[Matter]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message <Send size={16} />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Contact FAQs */}
      <div className="bg-neutral-50 border-y border-gray-100">
        <FaqAccordion faqs={CONTACT_FAQS} badge="Contact FAQ" />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
