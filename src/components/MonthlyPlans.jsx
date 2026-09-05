"use client";

import { useState } from "react";
import {
  Check,
  Minus,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  Calendar,
  CreditCard,
  Bell,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
  Globe,
  FileText,
  PhoneCall,
  Gift
} from "lucide-react";

const INDUSTRIES = [
  { id: "all", label: "🌟 Any Business / Industry", sub: "Tailored to your custom workflow" },
  { id: "health", label: "🏥 Health & Clinics", sub: "Physio, Dental, Ayurveda, Doctors" },
  { id: "edtech", label: "🎓 EdTech & Coaching", sub: "Institutes, Tutors, Academies" },
  { id: "fitness", label: "🏋️ Gym & Fitness", sub: "Fitness Studios, Yoga, Trainers" },
  { id: "salon", label: "💇 Salons & Spas", sub: "Beauty, Hair, Wellness Centers" },
  { id: "consulting", label: "🏢 Services & Firms", sub: "Real Estate, Legal, CA, Agencies" },
  { id: "retail", label: "🛍️ Retail & Wholesale", sub: "Stores, Distributors, Showrooms" },
];

const WORKFLOW_STEPS = [
  { step: "01", title: "Discovery", desc: "Customers find you on Google, Social Media, or Referral", icon: Globe },
  { step: "02", title: "Modern Website", desc: "High-converting, fast & mobile-friendly branded site", icon: FileText },
  { step: "03", title: "Easy Booking", desc: "Clients book appointments or send service inquiries 24/7", icon: Calendar },
  { step: "04", title: "Client Database", desc: "Centralized profiles, history, and communication logs", icon: Users },
  { step: "05", title: "Service Delivery", desc: "Track progress, sessions, treatments, or orders effortlessly", icon: TrendingUp },
  { step: "06", title: "Instant Invoicing", desc: "Collect payments via UPI, Cards, NetBanking with digital receipts", icon: CreditCard },
  { step: "07", title: "Automated Alerts", desc: "Instant WhatsApp confirmations & reminders to stop no-shows", icon: Bell },
  { step: "08", title: "Review & Retention", desc: "Automated 5-star Google review requests & re-engagement", icon: Star },
];

const COMPARISON_ROWS = [
  { feature: "Custom Responsive Website", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Free Domain & Cloud Hosting Included", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "SSL Certificate & Daily Cloud Backups", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Online Appointment Booking & Calendar", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Customer / Patient Database & History", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Owner Admin Dashboard (Mobile + Web)", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Click-to-WhatsApp Communication", basic: "Manual", standard: "Automated", premium: "AI-Powered" },
  { feature: "Website Maintenance, Bug Fixes & Security", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Real-time Slot Booking (Prevents double bookings)", basic: "-", standard: "✓", premium: "✓" },
  { feature: "Custom Business Records & Workflow Tracking", basic: "-", standard: "✓", premium: "✓" },
  { feature: "Payment Gateway Integration (UPI / Cards / NetBanking)", basic: "-", standard: "✓", premium: "✓" },
  { feature: "Instant Digital Billing & Invoicing Receipts", basic: "Basic", standard: "Automated", premium: "Advanced" },
  { feature: "WhatsApp Automation (Booking, Reminders & Alerts)", basic: "-", standard: "✓", premium: "Advanced" },
  { feature: "Customer Follow-Up & Re-engagement System", basic: "-", standard: "✓", premium: "✓" },
  { feature: "Staff & Employee Management with Role Access", basic: "-", standard: "✓", premium: "✓" },
  { feature: "Business Reports & Revenue Analytics", basic: "Basic", standard: "Advanced", premium: "Full AI Insights" },
  { feature: "SEO & Google Business Profile (GMB) Optimization", basic: "-", standard: "✓", premium: "Advanced Local SEO" },
  { feature: "24/7 Smart AI Chatbot (Lead Capture & Instant Q&A)", basic: "-", standard: "-", premium: "✓" },
  { feature: "Google Reviews Automation (Boost 5-Star Ratings)", basic: "-", standard: "-", premium: "✓" },
  { feature: "Advanced WhatsApp Drip Campaigns & Funnels", basic: "-", standard: "-", premium: "✓" },
  { feature: "Multi-Branch & Multi-Location Management", basic: "-", standard: "-", premium: "✓" },
  { feature: "AEO (Answer Engine Optimization for ChatGPT/AI Search)", basic: "-", standard: "-", premium: "✓" },
  { feature: "Custom API & Third-party CRM/ERP Integrations", basic: "-", standard: "-", premium: "✓" },
  { feature: "Dedicated VIP Account Manager & Priority SLA", basic: "Standard Support", standard: "Priority Support", premium: "VIP Dedicated" },
];

const CURRENCIES = {
  inr: {
    code: "INR",
    symbol: "₹",
    label: "🇮🇳 INR (₹)",
    monthly: {
      basic: { price: "999", display: "₹999", period: "/ month", subText: "Billed monthly" },
      standard: { price: "2,499", display: "₹2,499", period: "/ month", subText: "Billed monthly" },
      premium: { price: "8,499", display: "₹8,499", period: "/ month", subText: "Billed monthly" },
    },
    yearly: {
      basic: { price: "9,999", display: "₹9,999", period: "/ year", equivalent: "₹833/mo", savings: "Save ₹1,989 (2 Mos Free)", subText: "Billed annually" },
      standard: { price: "24,999", display: "₹24,999", period: "/ year", equivalent: "₹2,083/mo", savings: "Save ₹4,989 (2 Mos Free)", subText: "Billed annually" },
      premium: { price: "84,999", display: "₹84,999", period: "/ year", equivalent: "₹7,083/mo", savings: "Save ₹16,989 (2 Mos Free)", subText: "Billed annually" },
    },
  },
  usd: {
    code: "USD",
    symbol: "$",
    label: "🇺🇸 USD ($)",
    monthly: {
      basic: { price: "29", display: "$29", period: "/ month", subText: "Billed monthly" },
      standard: { price: "49", display: "$49", period: "/ month", subText: "Billed monthly" },
      premium: { price: "169", display: "$169", period: "/ month", subText: "Billed monthly" },
    },
    yearly: {
      basic: { price: "290", display: "$290", period: "/ year", equivalent: "$24/mo", savings: "Save $58 (2 Mos Free)", subText: "Billed annually" },
      standard: { price: "490", display: "$490", period: "/ year", equivalent: "$40/mo", savings: "Save $98 (2 Mos Free)", subText: "Billed annually" },
      premium: { price: "1,690", display: "$1,690", period: "/ year", equivalent: "$140/mo", savings: "Save $338 (2 Mos Free)", subText: "Billed annually" },
    },
  },
};

export default function MonthlyPlans() {
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState("inr");
  const [selectedBilling, setSelectedBilling] = useState("monthly"); // "monthly" | "yearly"

  const curr = CURRENCIES[selectedCurrency] || CURRENCIES.inr;
  const activePlans = selectedBilling === "yearly" ? curr.yearly : curr.monthly;

  const getWhatsAppLink = (planName, planKey) => {
    const plan = activePlans[planKey];
    const billingText = selectedBilling === "yearly" ? "Yearly Offer (2 Months Free)" : "Monthly Subscription";
    const industryText = selectedIndustry !== "all" 
      ? ` for my ${INDUSTRIES.find(i => i.id === selectedIndustry)?.label.replace(/^[^\w\s]+/, "").trim()}` 
      : "";
    const msg = `Hi TexWeb Team! I am interested in the ${planName} Plan (${plan.display} - ${billingText})${industryText}. Please share more details and help me get started.`;
    return `https://wa.me/917462827259?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section 
      id="monthly-plans" 
      className="relative w-full pt-8 sm:pt-10 pb-12 sm:pb-16 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 text-gray-900 overflow-hidden font-poppins"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-100/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
            {selectedBilling === "yearly" ? "Annual Value Packages" : "Subscription Packages"}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1 mb-3">
            Tailored To Your Business
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-500/80 max-w-md sm:max-w-xl md:max-w-2xl mx-auto font-poppins font-light leading-relaxed">
            Zero heavy upfront development costs. Complete website, client management, automation, and ongoing support with flexible billing options.
          </p>

          {/* Industry Pills Selector */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {INDUSTRIES.map((ind) => {
              const active = selectedIndustry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border ${
                    active
                      ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20 scale-105"
                      : "bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                  }`}
                >
                  {ind.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-xs text-gray-500 italic">
            *Have a custom business model? We customize all features, forms, and workflows according to your specific requirements.
          </p>

          {/* Billing Cycle & Currency Switcher Controls - Directly above Cards */}
          <div className="mt-8 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            
            {/* Monthly / Yearly Billing Toggle */}
            <div className="flex items-center p-1 bg-neutral-100 border border-gray-200 rounded-full shadow-inner">
              <button
                type="button"
                onClick={() => setSelectedBilling("monthly")}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  selectedBilling === "monthly"
                    ? "bg-white text-gray-900 shadow-md scale-[1.02]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setSelectedBilling("yearly")}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  selectedBilling === "yearly"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/25 scale-[1.02]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full transition-colors ${
                  selectedBilling === "yearly"
                    ? "bg-white text-red-600"
                    : "bg-red-100 text-red-700"
                }`}>
                  2 Mos Free
                </span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Currency:</span>
              <div className="inline-flex p-1 bg-neutral-100 border border-gray-200 rounded-full shadow-inner gap-1">
                {Object.entries(CURRENCIES).map(([key, c]) => {
                  const active = selectedCurrency === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCurrency(key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                        active
                          ? "bg-red-600 text-white shadow-md shadow-red-600/25 scale-[1.03]"
                          : "text-gray-700 hover:text-black hover:bg-white/70"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 items-stretch mb-16">
          
          {/* 1. BASIC PLAN */}
          <div className="relative rounded-[32px] bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  Basic Plan
                </span>
                {selectedBilling === "yearly" && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Gift className="w-3 h-3 text-emerald-600" />
                    2 Mos Free
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-950 transition-all">{activePlans.basic.display}</span>
                <span className="text-sm font-medium text-gray-500">{activePlans.basic.period}</span>
              </div>

              {selectedBilling === "yearly" ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="font-bold text-emerald-600">{activePlans.basic.savings}</span>
                  <span>• Equivalent to {activePlans.basic.equivalent}</span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-400">{activePlans.basic.subText}</p>
              )}

              <p className="mt-3 text-xs font-semibold text-red-600 uppercase tracking-wide">
                Digital Presence + Basic Management
              </p>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                Best for small businesses, clinics &amp; individual professionals who want to establish a credible online presence without upfront costs.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-xs sm:text-sm text-gray-700 mb-8">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Custom Branded Website</strong> (Speed &amp; Mobile-optimized)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Domain &amp; Cloud Hosting Included</strong> ({selectedBilling === "yearly" ? "Full 1 Year Free" : "Active with monthly"})</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Online Appointment / Inquiry Booking</strong> System</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Interactive Calendar</strong> for viewing schedules</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Customer / Patient Database</strong> &amp; Records</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Service &amp; Order History</strong> Management</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Basic Digital Invoicing</strong> &amp; Reports</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Owner Admin Dashboard</strong> (Phone &amp; Laptop)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Direct WhatsApp Chat Integration</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Ongoing Maintenance</strong>, Backups &amp; Security</span>
                </li>
              </ul>

              <a
                href={getWhatsAppLink("Basic", "basic")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-gray-900 text-white font-semibold text-center text-sm hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-red-600/20 flex items-center justify-center gap-2 group"
              >
                <img src="/common/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Start Basic at {activePlans.basic.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* 2. STANDARD PLAN (MOST POPULAR) */}
          <div className="relative rounded-[32px] bg-gradient-to-b from-red-600 to-red-700 p-[2px] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col transform md:-translate-y-2">
            <div className="bg-white rounded-[30px] p-6 sm:p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
              
              {/* Popular Ribbon */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-6 rounded-bl-2xl shadow-sm flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  Most Popular
                </div>
              </div>

              <div>
                <div className="mb-6 pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Standard Plan
                    </span>
                    {selectedBilling === "yearly" && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Gift className="w-3 h-3 text-emerald-600" />
                        2 Mos Free
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-gray-950 transition-all">{activePlans.standard.display}</span>
                    <span className="text-sm font-medium text-gray-500">{activePlans.standard.period}</span>
                  </div>

                  {selectedBilling === "yearly" ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <span className="font-bold text-emerald-600">{activePlans.standard.savings}</span>
                      <span>• Equivalent to {activePlans.standard.equivalent}</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">{activePlans.standard.subText}</p>
                  )}

                  <p className="mt-3 text-xs font-semibold text-red-600 uppercase tracking-wide">
                    Digital + Automation + Operations
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Best for growing businesses, clinics &amp; institutes that want to automate everyday operations, reduce no-shows, and accept online payments.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-red-600 stroke-[3]" />
                    <span>Everything in Basic Plan, plus:</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-700 mb-8">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>24/7 Automated Online Slot Booking</strong> (Prevents overlaps)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Custom Workflow &amp; Assessment Records</strong> (Tailored forms)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Service &amp; Project Progress Tracking</strong> for clients</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Payment Gateway Integration</strong> (UPI, Cards, NetBanking)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>WhatsApp Automation</strong> (Instant booking &amp; reminder alerts)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Automated Customer Follow-Up</strong> &amp; Re-engagement</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Staff / Employee Management</strong> with role access control</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Revenue Reports &amp; Business Analytics</strong></span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Google Business Profile (GMB)</strong> &amp; Local SEO setup</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>Priority Technical Support</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              <a
                href={getWhatsAppLink("Standard", "standard")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-red-600 text-white font-semibold text-center text-sm hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 group"
              >
                <img src="/common/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Get Standard at {activePlans.standard.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* 3. PREMIUM PLAN */}
          <div className="relative rounded-[32px] bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  Premium Plan
                </span>
                {selectedBilling === "yearly" && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Gift className="w-3 h-3 text-emerald-600" />
                    2 Mos Free
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-950 transition-all">{activePlans.premium.display}</span>
                <span className="text-sm font-medium text-gray-500">{activePlans.premium.period}</span>
              </div>

              {selectedBilling === "yearly" ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="font-bold text-emerald-600">{activePlans.premium.savings}</span>
                  <span>• Equivalent to {activePlans.premium.equivalent}</span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-400">{activePlans.premium.subText}</p>
              )}

              <p className="mt-3 text-xs font-semibold text-red-600 uppercase tracking-wide">
                Digital + Automation + Growth + AI
              </p>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                Best for established clinics, high-volume centers &amp; ambitious brands that want aggressive growth, automated reviews, and intelligent AI automation.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-red-600 stroke-[3]" />
                  <span>Everything in Standard Plan, plus:</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700 mb-8">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>24/7 Smart AI Chatbot &amp; Agent</strong> (Answers queries &amp; captures leads)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Google Review Automation</strong> (Auto WhatsApp requests to boost 5-star rating)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Advanced WhatsApp Marketing Funnels</strong> (Drip campaigns &amp; broadcasts)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Multi-Branch &amp; Multi-Staff Management</strong> (Single centralized dashboard)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Advanced SEO + AEO</strong> (AI Engine Optimization for ChatGPT/Perplexity)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Custom Business Workflows</strong> &amp; Third-party API Integrations</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Advanced Profit &amp; Retention Analytics</strong> Dashboards</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>VIP Dedicated Account Manager</strong> &amp; Priority SLA</span>
                  </li>
                </ul>
              </div>

              <a
                href={getWhatsAppLink("Premium", "premium")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-gray-900 text-white font-semibold text-center text-sm hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-red-600/20 flex items-center justify-center gap-2 group"
              >
                <img src="/common/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Start Premium at {activePlans.premium.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* 8-Step Business Workflow Strip */}
        <div className="mt-8 mb-16 p-6 sm:p-10 bg-white rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
              Workflow System
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1 mb-2">
              How Your Automated Workflow Runs
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto font-light">
              From first discovery to 5-star Google review, every touchpoint is seamless and automated.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-3">
            {WORKFLOW_STEPS.map((wf, idx) => {
              const Icon = wf.icon;
              return (
                <div 
                  key={idx} 
                  className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-neutral-50/80 border border-gray-100 hover:border-red-200 hover:bg-red-50/20 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-red-600 shadow-xs mb-3 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-red-600 tracking-wider mb-0.5">STEP {wf.step}</span>
                  <h4 className="text-xs font-bold text-gray-900 mb-1">{wf.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-tight line-clamp-3">{wf.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="py-5 px-6 sm:px-8 bg-neutral-50/70 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Detailed Feature Comparison Matrix
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Compare Basic ({activePlans.basic.display}), Standard ({activePlans.standard.display}), and Premium ({activePlans.premium.display}) side-by-side
              </p>
            </div>
            {selectedBilling === "yearly" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto">
                <Gift className="w-3.5 h-3.5 text-emerald-600" />
                Annual Plan: 2 Months Free Applied
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-neutral-100/60 text-xs font-bold uppercase tracking-wider text-gray-700">
                  <th className="py-3.5 px-4 sm:px-6">Feature &amp; Capabilities</th>
                  <th className="py-3.5 px-4 text-center text-gray-900">
                    Basic<br />
                    <span className="text-[11px] font-normal text-gray-500">
                      {activePlans.basic.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}
                    </span>
                  </th>
                  <th className="py-3.5 px-4 text-center text-red-600 bg-red-50/50">
                    Standard<br />
                    <span className="text-[11px] font-normal text-red-500">
                      {activePlans.standard.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}
                    </span>
                  </th>
                  <th className="py-3.5 px-4 text-center text-gray-900">
                    Premium<br />
                    <span className="text-[11px] font-normal text-gray-500">
                      {activePlans.premium.display}{selectedBilling === "yearly" ? "/yr" : "/mo"}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-medium text-gray-800 text-xs sm:text-sm">
                      {row.feature}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-700">
                      {row.basic === "✓" ? (
                        <Check className="w-4 h-4 text-red-600 mx-auto" />
                      ) : row.basic === "-" ? (
                        <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                      ) : (
                        <span className="font-medium text-gray-600">{row.basic}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-red-700 bg-red-50/30 font-medium">
                      {row.standard === "✓" ? (
                        <Check className="w-4 h-4 text-red-600 stroke-[2.5] mx-auto" />
                      ) : row.standard === "-" ? (
                        <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                      ) : (
                        <span className="font-semibold text-red-600">{row.standard}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-900 font-medium">
                      {row.premium === "✓" ? (
                        <Check className="w-4 h-4 text-red-600 stroke-[2.5] mx-auto" />
                      ) : (
                        <span className="font-semibold text-gray-900">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Important Terms & Information Card (From Poster 3/3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Third-Party API Costs Note */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-50 border border-gray-200">
            <div className="flex items-center gap-2.5 mb-3 text-red-600">
              <CreditCard className="w-5 h-5" />
              <h4 className="text-base font-bold text-gray-900">Third-Party / API Costs (Paid by Client)</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
              To keep subscription costs minimal, external provider charges are billed directly as per actual usage:
            </p>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>WhatsApp API / Meta charges (official message templates)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>Payment Gateway convenience/transaction charges (per txn)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>SMS / OTP gateway charges (if applicable)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>AI API tokens (OpenAI, Gemini, etc. for custom AI bot)</span>
              </li>
            </ul>
          </div>

          {/* Pricing & Service Terms */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-50 border border-gray-200">
            <div className="flex items-center gap-2.5 mb-3 text-red-600">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-base font-bold text-gray-900">Transparent Pricing &amp; Service Terms</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>
                  {selectedBilling === "yearly"
                    ? "Annual billing includes 2 Months Free (Pay for 10 months, get 12 months full service)."
                    : "Monthly subscription must be paid 100% in advance for each billing month."}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>Zero lock-in period — you retain full ownership of your data and customer records.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>All cloud hosting, security patches, backups, and maintenance remain active during subscription.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>Custom feature expansions or unique workflow additions can be integrated anytime.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner: Custom Requirements Callout */}
        <div className="relative rounded-3xl bg-gradient-to-r from-gray-950 via-red-950 to-gray-950 p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/30 text-red-300 border border-red-500/30 rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Custom Business Architecture</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              Have specific requirements for your business?
            </h3>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Every business is unique. Whether you need multi-branch operations, specific appointment slots, customized intake forms, or ERP integration — we tailor the entire system to match your daily workflow.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="https://wa.me/917462827259?text=Hi%20TexWeb%2C%20I%20want%20to%20discuss%20custom%20monthly%20requirements%20for%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2.5 group"
            >
              <img src="/common/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 object-contain" />
              <span>Discuss on WhatsApp</span>
            </a>
            <a
              href="tel:07554601839"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/20 text-center flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>Call: 0755-4601839</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
