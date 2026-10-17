"use client";

import { 
  Zap, 
  ShieldCheck, 
  BadgePercent, 
  Code2, 
  Headphones, 
  TrendingUp 
} from "lucide-react";

const ADVANTAGES = [
  {
    icon: <BadgePercent className="w-6 h-6 text-red-600" />,
    title: "Flexible Monthly Plans (₹1,999/mo)",
    desc: "No massive upfront investment required. Get custom websites and business automation on affordable monthly plans with domain, SSL & cloud server included."
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    title: "Rapid 7–14 Days Deployment",
    desc: "Agile modular delivery sprints. While other agencies take 3–6 months, we build, test, and take your software live in under 2 weeks."
  },
  {
    icon: <Code2 className="w-6 h-6 text-blue-600" />,
    title: "100% Full Code Ownership",
    desc: "You own full rights to your software, database, and domain. Zero vendor lock-in and zero hidden renewal royalties."
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
    title: "Conversion & SEO Built-in",
    desc: "Every website is engineered with Next.js App Router for 95+ Google PageSpeed score, mobile responsiveness, and Meta Ads pixel readiness."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
    title: "High-Security Cloud Hosting",
    desc: "Enterprise DDoS protection, automatic daily backups, SSL encryption, and 99.9% guaranteed uptime on modern AWS & Supabase cloud infrastructure."
  },
  {
    icon: <Headphones className="w-6 h-6 text-rose-600" />,
    title: "Dedicated Direct Tech Desk",
    desc: "Direct communication with senior engineers and founders over WhatsApp and calling desk. No call center delays or automated ticketing loops."
  }
];

export default function LandingFeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50/50 border-t border-gray-150" style={{ fontFamily: "Matter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold mb-3">
            Why TexWeb Solution
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Built Different Than Traditional Agencies
          </h2>
          <p className="text-xs sm:text-base text-gray-500 font-poppins mt-2 font-light">
            We combine high-speed engineering with transparent pricing so you get world-class software without the enterprise agency overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {ADVANTAGES.map((adv, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                {adv.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {adv.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-poppins font-light leading-relaxed">
                {adv.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
