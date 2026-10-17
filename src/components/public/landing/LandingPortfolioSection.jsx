"use client";

import Image from "next/image";
import { ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import { trackMetaEvent } from "./landingTracking";

const FEATURED_PROJECTS = [
  {
    title: "Heal Stride : Physiotherapy & Wellness",
    category: "Healthcare & Clinic Web Portal",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/customized/healstride.jpg",
    link: "https://www.healstride-physiotherapy.in/",
    tags: ["Doctor Booking", "GMB SEO", "Next.js"],
    impact: "+240% Patient Inquiries in 60 Days",
  },
  {
    title: "Sarvadnya Vidyapeeth",
    category: "Higher Education & College Admissions",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/customized/sarvadnya.jpg",
    link: "https://www.sarvadnyavidyapeeth.in/",
    tags: ["Admissions Portal", "Department LMS", "Fast Speed"],
    impact: "10,000+ Students Enrolled",
  },
  {
    title: "Trend Kro Media",
    category: "Digital Growth & Celebrity PR Agency",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/customized/trendkromedia.jpg",
    link: "https://www.trendkromedia.com/",
    tags: ["Personal Branding", "Media Kit", "Ultra-Modern UI"],
    impact: "Featured in Top National PR Outlets",
  },
  {
    title: "Anikara : Luxury Fashion",
    category: "High-End E-Commerce Boutique",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/customized/anikara.jpg",
    link: "https://anikara-e-commerce-websites.vercel.app/?page=home",
    tags: ["Shopify / Custom Cart", "Payment Gateway", "Luxury UI"],
    impact: "Smooth Checkout & Zero Cart Abandonment",
  },
  {
    title: "MinitPe & Uoons Apps",
    category: "iOS & Android Mobile Applications",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/customized/minitpe.png",
    link: "https://play.google.com/store/apps/details?id=com.uoons.india&pcampaignid=web_share",
    tags: ["React Native", "Play Store", "Fast APIs"],
    impact: "50,000+ Mobile Downloads",
  },
  {
    title: "Kirtilals Diamond Jewellery",
    category: "Fine Jewellery & Luxury Catalog",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/customized/kirtilals.jpg",
    link: "https://www.kirtilals.com/",
    tags: ["Product Showcase", "Luxury Branding", "High Security"],
    impact: "Prestigious Brand Transformation",
  },
];

export default function LandingPortfolioSection() {
  const handleScrollToQuote = (projectName) => {
    trackMetaEvent("InitiateCheckout", { source: `portfolio_card_${projectName}` });
    const el = document.getElementById("quote-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100" style={{ fontFamily: "Matter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proven Track Record</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Real Results Built For Real Businesses
          </h2>
          <p className="text-xs sm:text-base text-gray-500 font-poppins mt-2 font-light">
            We don&apos;t just build templates — we engineer revenue-generating digital products with clean code and high Google scores.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURED_PROJECTS.map((proj, idx) => (
            <div 
              key={idx}
              className="group bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {proj.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    {proj.title}
                  </h3>

                  {/* Impact Metric Badge */}
                  <div className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                    📈 {proj.impact}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tags.map((t, i) => (
                      <span key={i} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 sm:p-6 pt-0 border-t border-gray-50 mt-2 flex items-center justify-between gap-3">
                <a
                  href={proj.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-red-600 transition"
                >
                  <span>Live Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleScrollToQuote(proj.title)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Build Similar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-to-r from-gray-950 via-gray-900 to-red-950 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-bold">Have a custom business requirement?</h4>
            <p className="text-xs sm:text-sm text-gray-400 font-poppins">Get a tailored architecture roadmap and fixed-price quote today.</p>
          </div>
          <button
            type="button"
            onClick={() => handleScrollToQuote("bottom_banner")}
            className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Get Free Project Quote ➔
          </button>
        </div>

      </div>
    </section>
  );
}
