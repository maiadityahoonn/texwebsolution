"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const OFFERINGS = [
  {
    id: "custom-dev",
    title: "Custom Development",
    badge: "Tailor-Made",
    desc: "Get bespoke software crafted exactly to your business goals. High-performance, scalable web apps and platforms built from scratch with premium quality control.",
    link: "/customized",
    linkText: "Explore Custom Services",
    image: "/home/features1.png",
    borderGradient: "from-red-500/40 via-rose-200/30 to-gray-200/50 hover:from-red-500 hover:via-rose-400 hover:to-red-500",
    badgeClass: "bg-red-50/80 text-red-600 border-red-200/60",
    accentColor: "text-red-600 group-hover:text-red-700",
    imgBgHover: "group-hover:from-red-50/40 group-hover:to-rose-50/40",
    shadowHover: "hover:shadow-[0_12px_24px_-8px_rgba(220,38,38,0.15)]"
  },
  {
    id: "saas-prebuilt",
    title: "SaaS Prebuilt Solutions",
    badge: "Ready to Launch",
    desc: "Launch your business instantly with our feature-packed, ready-to-deploy SaaS applications. Fully tested, ready-to-run systems that save you time and cost.",
    link: "/prebuilt",
    linkText: "View Prebuilt Catalog",
    image: "/home/features2.png",
    borderGradient: "from-amber-500/40 via-amber-200/30 to-gray-200/50 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500",
    badgeClass: "bg-amber-50/80 text-amber-600 border-amber-200/60",
    accentColor: "text-amber-600 group-hover:text-amber-700",
    imgBgHover: "group-hover:from-amber-50/40 group-hover:to-yellow-50/40",
    shadowHover: "hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.15)]"
  },
  {
    id: "ai-automation",
    title: "AI & Automation",
    badge: "Intelligent Systems",
    desc: "Integrate smart AI models, workflow automation, and custom LLM solutions to optimize your business operations and save thousands of hours of manual labor.",
    link: "/ai-automation",
    linkText: "Explore AI Solutions",
    image: "/home/features3.png",
    borderGradient: "from-indigo-500/40 via-indigo-200/30 to-gray-200/50 hover:from-indigo-500 hover:via-indigo-400 hover:to-indigo-500",
    badgeClass: "bg-indigo-50/80 text-indigo-600 border-indigo-200/60",
    accentColor: "text-indigo-600 group-hover:text-indigo-700",
    imgBgHover: "group-hover:from-indigo-50/40 group-hover:to-violet-50/40",
    shadowHover: "hover:shadow-[0_12px_24px_-8px_rgba(99,102,241,0.15)]"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    badge: "Growth & Reach",
    desc: "Scale your online presence with targeted SEO, social media marketing, paid ad management, and conversion rate optimization designed to drive real revenue.",
    link: "/digital-marketing",
    linkText: "Grow Your Brand",
    image: "/home/features4.png",
    borderGradient: "from-emerald-500/40 via-emerald-200/30 to-gray-200/50 hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-500",
    badgeClass: "bg-emerald-50/80 text-emerald-600 border-emerald-200/60",
    accentColor: "text-emerald-600 group-hover:text-emerald-700",
    imgBgHover: "group-hover:from-emerald-50/40 group-hover:to-teal-50/40",
    shadowHover: "hover:shadow-[0_12px_24px_-8px_rgba(16,185,129,0.15)]"
  }
];

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full flex flex-col items-center py-10 sm:py-12 bg-transparent overflow-hidden"
      id="features"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-10 left-10 sm:left-1/4 -translate-x-1/2 w-72 h-72 bg-red-100/25 rounded-full blur-[100px] pointer-events-none -z-10 animate-floatingSmooth" />
      <div className="absolute bottom-10 right-10 sm:right-1/4 translate-x-1/2 w-80 h-80 bg-rose-100/25 rounded-full blur-[120px] pointer-events-none -z-10 animate-floatingSmooth" style={{ animationDelay: '1.5s' }} />

      <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full font-semibold text-xs sm:text-sm font-[Matter] mb-3">
        Our Offerings
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-3 px-3 leading-tight pb-1">
        Smart Tech Options to Grow Your Business
      </h2>
      <p className="text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto px-4 mb-8 sm:mb-10 text-center leading-relaxed">
        Choose the right software path for your venture — from bespoke custom coding and ready SaaS to AI automation.
      </p>

      <div className="w-full max-w-7xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 justify-center">
        {OFFERINGS.map((item, index) => (
          <div
            key={item.id}
            className={`p-[1.5px] rounded-[24px] bg-gradient-to-b ${item.borderGradient} transition-all duration-500 w-full shadow-sm ${item.shadowHover} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            <Link
              href={item.link}
              className="group bg-white/95 backdrop-blur-xl flex flex-col justify-between rounded-[22.5px] overflow-hidden p-4 sm:p-5 h-full transition-all duration-500 hover:-translate-y-1"
            >
              <div>
                {/* Balanced Thumbnail Container */}
                <div className={`relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100/70 p-2.5 flex items-center justify-center mb-3.5 transition-all duration-500 ${item.imgBgHover}`}>
                  <img
                    alt={item.title}
                    className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
                    src={item.image}
                  />
                </div>

                <div className="w-full text-left px-0.5">
                  {/* Refined chip badge */}
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold font-[Matter] border rounded-full uppercase tracking-wider mb-2 ${item.badgeClass}`}>
                    {item.badge}
                  </span>

                  {/* Balanced Title */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-1 font-[Matter]">
                    {item.title}
                  </h3>

                  {/* Complete Full Paragraph Text without any line-clamp */}
                  <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed font-normal font-poppins">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Action Link */}
              <div className="w-full text-left px-0.5 mt-3.5 pt-3 border-t border-gray-100">
                <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${item.accentColor} transition-colors duration-300`}>
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
