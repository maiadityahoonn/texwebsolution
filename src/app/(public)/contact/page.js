"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/public/Navbar";
import { createStaticCms } from "@/lib/staticCms";
import FaqAccordion from "@/components/public/FaqAccordion";
import Footer from "@/components/public/Footer";
import {
  Mail,
  Copy,
  Check,
  Clock,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  MapPin,
  Globe,
  Smartphone,
  Bot,
  TrendingUp,
  Layers,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const CONTACT_FAQS = [
  {
    question: "How quickly will your team respond to my project inquiry?",
    answer: "We guarantee a response within 15 to 30 minutes during business hours. Our technical consultants will review your project requirements and reach out with a clear consultation plan."
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

const CONSULTATION_SERVICES = [
  {
    key: "Website Development",
    title: "Website Development",
    subtitle: "Custom Business Sites, E-Commerce & Portals",
    icon: Globe,
    badge: "Popular",
  },
  {
    key: "App Development (iOS/Android)",
    title: "Mobile App Development",
    subtitle: "Android, iOS & Hybrid Native Apps",
    icon: Smartphone,
    badge: "High Growth",
  },
  {
    key: "AI Chatbot & Automation",
    title: "AI Chatbot & Automation",
    subtitle: "WhatsApp Auto-Reply & Business Bots",
    icon: Bot,
    badge: "Trending",
  },
  {
    key: "Meta Ads & Digital Marketing",
    title: "Meta Ads & Growth",
    subtitle: "Verified Lead Generation & Scaling",
    icon: TrendingUp,
    badge: "High ROI",
  },
  {
    key: "ERP, CRM & Business Systems",
    title: "ERP, CRM & Software",
    subtitle: "Lead CRM, Billing, HMS & Systems",
    icon: Layers,
    badge: "Enterprise",
  },
  {
    key: "Website Redesign",
    title: "Website Redesign",
    subtitle: "UI/UX Revamp & Mobile Speed Fix",
    icon: RefreshCw,
    badge: "Speed Boost",
  },
];

export default function ContactPage() {
  const cms = createStaticCms();
  const hero = cms.block("contact.hero", {
    title: "Let's Build Something Great",
    subtitle: "Whether you need AI Automation, custom software engineering, high-ROI digital marketing, or ready-to-deploy prebuilt SaaS, our team is ready to scale your business.",
  });
  const faqs = cms.list("contact.faqs", "faqs", CONTACT_FAQS);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("info@texwebsolution.in");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenModal = (serviceName = null) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("openQuoteModal", {
          detail: {
            service: serviceName || "Website Development",
            source: "contact_page",
          },
        })
      );
    }
  };

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-0 md:min-h-[500px] lg:min-h-[560px]" 
        style={{ backgroundImage: "url('https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/contact_mail.png" alt="" aria-hidden="true" width={192} height={192} className="hidden md:block absolute top-28 right-12 w-36 lg:w-48 h-auto opacity-80 animate-floatingSmooth pointer-events-none select-none mix-blend-multiply" />
        <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/contact_chat.png" alt="" aria-hidden="true" width={176} height={176} className="hidden md:block absolute bottom-24 left-8 w-32 lg:w-44 h-auto opacity-70 animate-floatingSmooth pointer-events-none select-none mix-blend-multiply" style={{ animationDelay: '1s' }} />

        <div className="flex-1 flex flex-col justify-center pt-0 pb-3 min-[360px]:pb-3.5 sm:py-6 md:py-8">
          <section className="flex items-center justify-center text-center px-3 min-[360px]:px-4 sm:px-6">
            <div className="w-full">
              <h1 
                className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                {hero.title}
              </h1>
              <p className="mt-2.5 sm:mt-4 text-xs min-[360px]:text-sm sm:text-base md:text-lg text-gray-500/85 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed px-2">
                {hero.subtitle}
              </p>

            </div>
          </section>
        </div>

        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-4 sm:py-5 flex items-center shadow-inner group select-none">
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

      {/* Contact Hub & Form Modal Trigger Section */}
      <section className="py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 max-w-7xl mx-auto w-full" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Info Side (Left Column) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-left">
            <div>
              <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3 sm:mb-4">
                Reach Out Directly
              </div>
              <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
                Connect directly with our team
              </h2>
              <p className="mt-3 sm:mt-4 text-gray-500 leading-relaxed text-xs min-[360px]:text-sm sm:text-base font-poppins font-light">
                Whether you prefer email, instant WhatsApp chat, or submitting a detailed inquiry, we are ready to analyze your requirements and deliver tailored results.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-3 sm:space-y-4 font-poppins text-left">
              
              {/* Email Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 min-[360px]:p-5 shadow-sm hover:shadow-md transition-all duration-300 text-left">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 sm:p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
                      <Mail size={20} className="sm:w-[22px] sm:h-[22px]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base font-[Matter]">Email Us</h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium break-all">info@texwebsolution.in</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCopyEmail}
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors shrink-0 cursor-pointer"
                    title="Copy Email"
                    type="button"
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
                className="block bg-white border border-gray-100 rounded-2xl p-4 min-[360px]:p-5 shadow-sm hover:shadow-md hover:border-green-500/20 transition-all duration-300 group text-left"
              >
                <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 sm:p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors flex items-center justify-center shrink-0">
                      <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/WhatsApp.svg" alt="WhatsApp" width={22} height={22} className="w-5 h-5 sm:w-[22px] sm:h-[22px] object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base font-[Matter]">WhatsApp Support</h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">+91 7462827259</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-green-600 px-3 py-1 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors font-[Matter] self-start min-[420px]:self-auto">
                    Chat Now
                  </span>
                </div>
              </a>

              {/* Calling Desk Card */}
              <a 
                href="tel:07554601839" 
                className="block bg-white border border-gray-100 rounded-2xl p-4 min-[360px]:p-5 shadow-sm hover:shadow-md hover:border-blue-500/20 transition-all duration-300 group text-left"
              >
                <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 sm:p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors flex items-center justify-center text-blue-600 shrink-0">
                      <PhoneCall size={20} className="sm:w-[22px] sm:h-[22px]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base font-[Matter]">Calling Desk</h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">0755-4601839</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors font-[Matter] self-start min-[420px]:self-auto">
                    Call Now
                  </span>
                </div>
              </a>

              {/* HQ Office Address Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 min-[360px]:p-5 shadow-sm hover:shadow-md transition-all duration-300 text-left">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 sm:p-3 bg-red-50 text-red-600 rounded-xl mt-0.5 shrink-0">
                    <MapPin size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
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
              <div className="bg-white border border-gray-100 rounded-2xl p-4 min-[360px]:p-5 shadow-sm hover:shadow-md transition-all duration-300 text-left">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 sm:p-3 bg-rose-50 text-rose-600 rounded-xl mt-0.5 shrink-0">
                    <MapPin size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base font-[Matter]">Branch Office</h4>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full font-[Matter]">Madhya Pradesh</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-poppins leading-relaxed">
                      A3-405, Kokta Bypass Rd, opposite Transport Nagar, PMAY, Bhopal, Madhya Pradesh 462028
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Form Modal Hub Side (Right Column) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-100 rounded-2xl min-[360px]:rounded-3xl p-4 min-[360px]:p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"></div>
              
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-semibold font-[Matter]">
                  <Sparkles size={13} className="text-red-500" />
                  Instant Project Consultation & Quote
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Architects Online Now
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                Request a Custom Proposal & Timeline
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-poppins font-light mb-6 leading-relaxed">
                Click any service below to open our interactive 2-step inquiry form. Our solution architects will analyze your requirements, prepare a milestone estimate, and connect with you.
              </p>

              {/* Service Cards Grid */}
              <div className="space-y-2.5 sm:space-y-3 mb-6">
                <label className="site-label font-semibold text-xs sm:text-sm font-[Matter] text-gray-700 block">
                  Select your required service to get started:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {CONSULTATION_SERVICES.map((srv) => {
                    const IconComponent = srv.icon;
                    return (
                      <button
                        key={srv.key}
                        type="button"
                        onClick={() => handleOpenModal(srv.key)}
                        className="group flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-red-400 hover:shadow-md transition-all duration-200 text-left cursor-pointer active:scale-[0.98]"
                      >
                        <div className="p-2 bg-white rounded-lg border border-gray-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0 shadow-2xs mt-0.5">
                          <IconComponent size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm font-[Matter] truncate group-hover:text-red-600 transition-colors">
                              {srv.title}
                            </h4>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100/60 text-red-700 shrink-0 font-[Matter]">
                              {srv.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-poppins line-clamp-1">
                            {srv.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Launch Action Card */}
              <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white rounded-2xl p-5 sm:p-6 shadow-lg shadow-red-600/20 text-left relative overflow-hidden mb-6">
                <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-yellow-300" />
                      <h4 className="font-bold text-base sm:text-lg font-[Matter]">
                        Launch 2-Step Project Inquiry
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-red-100 font-poppins font-light leading-snug">
                      Get instant budget estimates, timeline roadmap & dedicated technical support.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 bg-white text-red-600 hover:bg-neutral-100 font-bold text-xs sm:text-sm rounded-full transition-all shadow-md active:scale-95 shrink-0 cursor-pointer font-[Matter]"
                  >
                    <span>Fill Inquiry Form</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Trust & Guarantee Highlights */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3 font-poppins text-left">
                <div className="flex items-center gap-2 text-gray-700 text-[11px] sm:text-xs">
                  <Clock size={15} className="text-red-500 shrink-0" />
                  <span>15-Min Response</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-[11px] sm:text-xs">
                  <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                  <span>100% NDA Protected</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-[11px] sm:text-xs col-span-2 sm:col-span-1">
                  <CheckCircle2 size={15} className="text-blue-500 shrink-0" />
                  <span>Transparent Pricing</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Contact FAQs */}
      <div className="bg-neutral-50 border-y border-gray-100">
        <FaqAccordion faqs={faqs} badge={hero.faqBadge || "Contact FAQ"} />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
