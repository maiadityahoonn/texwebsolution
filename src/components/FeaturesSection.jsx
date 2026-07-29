"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
      className="relative w-full flex flex-col items-center pt-4 pb-12 sm:pb-16 bg-transparent overflow-hidden" 
      id="features" 
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-10 left-10 sm:left-1/4 -translate-x-1/2 w-72 h-72 bg-red-100/30 rounded-full blur-[100px] pointer-events-none -z-10 animate-floatingSmooth" />
      <div className="absolute bottom-10 right-10 sm:right-1/4 translate-x-1/2 w-80 h-80 bg-rose-100/30 rounded-full blur-[120px] pointer-events-none -z-10 animate-floatingSmooth" style={{ animationDelay: '1.5s' }} />
 
      <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
        Our Offerings
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-8 sm:mb-10 px-3 leading-tight pb-1">
        Smart Tech Options<br />to Grow Your Business
      </h2>

      <div className="w-full max-w-6xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 justify-center">
        {/* Card 1: Custom Development (Red Theme Gradient Border) */}
        <div 
          className={`p-[2px] rounded-[32px] bg-gradient-to-b from-red-500/50 via-rose-200/40 to-gray-200/60 hover:from-red-600 hover:via-red-400 hover:to-red-600 transition-all duration-500 max-w-[500px] mx-auto w-full shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.2)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link 
            href="/customized"
            className="group bg-white/95 backdrop-blur-xl flex flex-col justify-between rounded-[30px] overflow-hidden p-5 sm:p-6 h-full transition-all duration-500 hover:-translate-y-1"
          >
            <div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-6 flex items-center justify-center mb-6 transition-all duration-500 group-hover:from-red-50/40 group-hover:to-rose-50/40">
                <img 
                  alt="Custom Development" 
                  className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1" 
                  src="/home/features1.png"
                />
              </div>
              
              <div className="w-full text-left px-2">
                <span className="inline-block px-3 py-1 site-label font-semibold text-xs sm:text-sm font-[Matter] tracking-wider text-red-600 bg-red-50 border border-red-100/50 rounded-full uppercase mb-3">
                  Tailor-Made Solutions
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2.5 group-hover:text-red-600 transition-colors duration-300">
                  Custom Development
                </h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-light font-poppins">
                  Get bespoke software crafted exactly to your business goals. High-performance, scalable web apps and platforms built from scratch with premium quality control.
                </p>
              </div>
            </div>

            <div className="w-full text-left px-2 mt-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600 group-hover:text-red-700">
                <span>Explore Custom Services</span>
                <svg className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Card 2: SaaS Prebuilt (Amber Theme Gradient Border) */}
        <div 
          className={`p-[2px] rounded-[32px] bg-gradient-to-b from-amber-500/50 via-amber-200/40 to-gray-200/60 hover:from-amber-600 hover:via-amber-400 hover:to-amber-600 transition-all duration-500 max-w-[500px] mx-auto w-full shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.2)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link 
            href="/prebuilt"
            className="group bg-white/95 backdrop-blur-xl flex flex-col justify-between rounded-[30px] overflow-hidden p-5 sm:p-6 h-full transition-all duration-500 hover:-translate-y-1"
          >
            <div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-6 flex items-center justify-center mb-6 transition-all duration-500 group-hover:from-amber-50/40 group-hover:to-yellow-50/40">
                <img 
                  alt="SaaS Prebuilt Solutions" 
                  className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1" 
                  src="/home/features2.png"
                />
              </div>
              
              <div className="w-full text-left px-2">
                <span className="inline-block px-3 py-1 site-label font-semibold text-xs sm:text-sm font-[Matter] tracking-wider text-amber-600 bg-amber-50 border border-amber-100/50 rounded-full uppercase mb-3">
                  Ready to Launch
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2.5 group-hover:text-amber-600 transition-colors duration-300">
                  SaaS Prebuilt Solutions
                </h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-light font-poppins">
                  Launch your business instantly with our feature-packed, ready-to-deploy SaaS applications. Fully tested, ready-to-run systems that save you time and cost.
                </p>
              </div>
            </div>

            <div className="w-full text-left px-2 mt-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 group-hover:text-amber-700">
                <span>View Prebuilt catalog</span>
                <svg className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Card 3: AI Automation (Indigo Theme Gradient Border) */}
        <div 
          className={`p-[2px] rounded-[32px] bg-gradient-to-b from-indigo-500/50 via-indigo-200/40 to-gray-200/60 hover:from-indigo-600 hover:via-indigo-400 hover:to-indigo-600 transition-all duration-500 max-w-[500px] mx-auto w-full shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.2)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link 
            href="/ai-automation"
            className="group bg-white/95 backdrop-blur-xl flex flex-col justify-between rounded-[30px] overflow-hidden p-5 sm:p-6 h-full transition-all duration-500 hover:-translate-y-1"
          >
            <div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-6 flex items-center justify-center mb-6 transition-all duration-500 group-hover:from-indigo-50/40 group-hover:to-violet-50/40">
                <img 
                  alt="AI & Automation" 
                  className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1" 
                  src="/home/features3.png"
                />
              </div>
              
              <div className="w-full text-left px-2">
                <span className="inline-block px-3 py-1 site-label font-semibold text-xs sm:text-sm font-[Matter] tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100/50 rounded-full uppercase mb-3">
                  Intelligent Systems
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2.5 group-hover:text-indigo-600 transition-colors duration-300">
                  AI & Automation
                </h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-light font-poppins">
                  Integrate smart AI models, workflow automation, and custom LLM solutions to optimize your business operations and save thousands of hours of manual labor.
                </p>
              </div>
            </div>

            <div className="w-full text-left px-2 mt-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                <span>Explore AI Solutions</span>
                <svg className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Card 4: Digital Marketing (Emerald Theme Gradient Border) */}
        <div 
          className={`p-[2px] rounded-[32px] bg-gradient-to-b from-emerald-500/50 via-emerald-200/40 to-gray-200/60 hover:from-emerald-600 hover:via-emerald-400 hover:to-emerald-600 transition-all duration-500 max-w-[500px] mx-auto w-full shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.2)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link 
            href="/digital-marketing"
            className="group bg-white/95 backdrop-blur-xl flex flex-col justify-between rounded-[30px] overflow-hidden p-5 sm:p-6 h-full transition-all duration-500 hover:-translate-y-1"
          >
            <div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-6 flex items-center justify-center mb-6 transition-all duration-500 group-hover:from-emerald-50/40 group-hover:to-teal-50/40">
                <img 
                  alt="Digital Marketing" 
                  className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1" 
                  src="/home/features4.png"
                />
              </div>
              
              <div className="w-full text-left px-2">
                <span className="inline-block px-3 py-1 site-label font-semibold text-xs sm:text-sm font-[Matter] tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100/50 rounded-full uppercase mb-3">
                  Growth & Reach
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2.5 group-hover:text-emerald-600 transition-colors duration-300">
                  Digital Marketing
                </h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-light font-poppins">
                  Scale your online presence with targeted SEO, social media marketing, paid ad management, and conversion rate optimization designed to drive real revenue.
                </p>
              </div>
            </div>

            <div className="w-full text-left px-2 mt-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                <span>Grow Your Brand</span>
                <svg className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
