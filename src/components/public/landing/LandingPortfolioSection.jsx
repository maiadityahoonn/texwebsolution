"use client";

import Image from "next/image";
import { safeExternalUrl } from "@/lib/safeUrl";
import { trackMetaEvent } from "./landingTracking";
import { FEATURED_WEBSITES, FEATURED_APPLICATIONS } from "./portfolioConstants";

function ProjectCard({ project, isApp }) {
  return (
    <a
      href={safeExternalUrl(project.buttonLink)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex"
    >
      <div className="p-[2px] rounded-[26px] sm:rounded-[30px] bg-gradient-to-b from-red-500/40 via-red-200/30 to-gray-200/50 hover:from-red-600 hover:via-red-400 hover:to-red-600 transition-all duration-500 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.2)] w-full max-w-sm mx-auto group">
        <div className="relative flex flex-col h-full bg-white/95 backdrop-blur-xl rounded-[24px] sm:rounded-[28px] overflow-hidden text-left">
          {/* Image Section */}
          <div className="relative w-full overflow-hidden bg-gray-50 aspect-[4/3]">
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-end p-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 px-3.5 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                {project.buttonText || (isApp ? "View Live App" : "Visit Live Site")}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
            <Image 
              width={800} 
              height={600}
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col flex-grow">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider group-hover:bg-red-50 group-hover:text-red-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors flex items-center justify-between mb-2">
              <span className="line-clamp-1">{project.title}</span>
              <span className="text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300 transform shrink-0 ml-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-grow">
              {project.bullets[0]}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function LandingPortfolioSection() {
  const handleScrollToQuote = (source) => {
    trackMetaEvent("InitiateCheckout", { source: `landing_portfolio_${source}` });
    if (typeof window !== "undefined") {
      const isApp = source.includes("apps");
      window.dispatchEvent(new CustomEvent("openQuoteModal", { 
        detail: { 
          service: isApp ? "App Development (iOS/Android)" : "Website Development", 
          source: `landing_portfolio_${source}` 
        } 
      }));
    }
  };

  return (
    <section
      className="relative py-12 sm:py-16 text-center w-full overflow-hidden bg-gradient-to-b from-white via-gray-50/20 to-white"
      style={{ fontFamily: "Matter, sans-serif" }}
    >
      {/* Dotted Grid Overlay & Accent Glows (Exact Homepage Pattern) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_28px] -z-10" />
      <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-red-50/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[35rem] h-[35rem] bg-neutral-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* 1. Featured Custom Websites Section */}
      <div className="max-w-5xl mx-auto text-center px-4 mb-8 sm:mb-10">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
          Featured Websites
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1 mb-3">
          Transforming Concepts Into Live Platforms
        </h2>
        <p className="text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto leading-relaxed">
          Explore some of our most impactful custom platforms, websites, and web portals built for client growth.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-8 sm:mb-10">
        <div className="grid gap-8 md:gap-10 justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_WEBSITES.map((project) => (
            <ProjectCard key={project.title} project={project} isApp={false} />
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-16 sm:mb-20">
        <button
          type="button"
          onClick={() => handleScrollToQuote("websites_cta")}
          className="px-8 py-3.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-600/15 hover:shadow-lg hover:shadow-red-600/25 hover:scale-105 transition-all duration-300 flex items-center gap-2 transform cursor-pointer font-[Matter]"
        >
          <span>Get a Similar Website Built For Your Business ➔</span>
        </button>
      </div>

      {/* 2. Featured Customized Mobile Apps Section (Exact Same Aesthetic Structure) */}
      <div className="max-w-5xl mx-auto text-center px-4 mb-8 sm:mb-10 pt-4 sm:pt-6">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
          Featured Mobile Apps
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1 mb-3">
          Native & Cross-Platform Mobile Applications
        </h2>
        <p className="text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto leading-relaxed">
          Explore our high-performance iOS and Android mobile apps published live on Google Play Store and Apple App Store.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-8 sm:mb-10">
        <div className="grid gap-8 md:gap-10 justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_APPLICATIONS.map((project) => (
            <ProjectCard key={project.title} project={project} isApp={true} />
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => handleScrollToQuote("apps_cta")}
          className="px-8 py-3.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-600/15 hover:shadow-lg hover:shadow-red-600/25 hover:scale-105 transition-all duration-300 flex items-center gap-2 transform cursor-pointer font-[Matter]"
        >
          <span>Get a Similar Mobile App Built For Your Business ➔</span>
        </button>
      </div>
    </section>
  );
}
