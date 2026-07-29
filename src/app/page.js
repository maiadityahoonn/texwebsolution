"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import CommonMarquee from "@/components/CommonMarquee";
import FeaturesSection from "@/components/FeaturesSection";
import MarqueeStrip from "@/components/MarqueeStrip";
import ReelsCarousel from "@/components/ReelsCarousel";
import TeamSection from "@/components/TeamSection";
import TestimonialsSwiper from "@/components/TestimonialsSwiper";
import FaqAccordion from "@/components/FaqAccordion";
import GetInTouchSection from "@/components/GetInTouchSection";
import Footer from "@/components/Footer";
const FEATURED_CUSTOM_PROJECTS = [
  {
    title: "Sarvadnya Vidyapeeth",
    image: "customized/sarvadnya.jpg",
    bullets: ["Fostering academic excellence with a modern college admission & departmental portal built for higher education."],
    buttonLink: "https://www.sarvadnyavidyapeeth.in/",
    tags: ["Education", "College Portal", "Admissions"]
  },
  {
    title: "Trend Kro Media",
    image: "customized/trendkromedia.jpg",
    bullets: ["Premium digital growth partner for brands & entrepreneurs with personal branding & PR coverage."],
    buttonLink: "https://www.trendkromedia.com/",
    tags: ["Digital Marketing", "Branding", "PR & Media"]
  },
  {
    title: "Meditation Magic",
    image: "customized/neelamarora.jpg",
    bullets: ["Spiritual learning & guided meditation platform featuring online courses, books, and healing masterclasses."],
    buttonLink: "https://www.neelamarora.in/",
    tags: ["E-Learning", "Spiritual & Wellness", "Courses"]
  },
  {
    title: "Ruchi Upadhyay Classes",
    image: "customized/ruchiupadhyay.jpg",
    bullets: ["Comprehensive Chemistry learning platform featuring live classes, test series, and board preparation."],
    buttonLink: "https://www.ruchiupadhyayclasses.in/",
    tags: ["EdTech", "Coaching & Classes", "E-Learning"]
  },
  {
    title: "Team 360 (D.D. Sharma)",
    image: "customized/team360.jpg",
    bullets: ["Spiritual learning & mind mentorship platform with recorded courses, literature, and live workshops."],
    buttonLink: "https://www.devendraduttsharma.com/",
    tags: ["Mind Training", "Spiritual & Mentorship", "E-Learning"]
  },
  {
    title: "Kirtilals : Luxury Website",
    image: "customized/project2.webp",
    bullets: ["Discover fine diamond jewelry from Kirtilals with an online shopping portal built for luxury brands."],
    buttonLink: "https://www.kirtilals.com/",
    tags: ["Luxury", "Jewelry", "E-Commerce"]
  },
  {
    title: "Tradescribe: Trading Platform",
    image: "customized/project3.webp",
    bullets: ["Empower your trading journey with Tradescribe's custom analytics platform built for active traders."],
    buttonLink: "https://tradescribe.in/",
    tags: ["Fintech", "Trading", "Analytics"]
  },
  {
    title: "Momentz",
    image: "customized/project6.webp",
    bullets: ["Create lasting memories with Momentz's custom photo printing portal built for shutterbugs."],
    buttonLink: "https://momentz.in/",
    tags: ["Custom Portal", "Photo Print", "Interactive"]
  }
];

export default function Home() {
  const gridRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (gridRef.current) {
      observer.observe(gridRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full bg-white overflow-hidden" id="home">

      {/* Top Section with Bg2.png background */}
      <div
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[70vh] sm:min-h-[75vh] md:min-h-screen font-poppins"
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        {/* Nav bar */}
        <Navbar />

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center px-4 justify-start bg-transparent pt-4 pb-6 sm:pb-8">
          <div className="relative w-full mx-auto mt-[-35px] md:mt-[-15px] lg:mt-[-25px] px-4 sm:px-8 max-w-full md:max-w-3xl lg:max-w-[740px]">
            <img
              alt="Hero"
              className="w-full h-auto object-contain"
              src="/home/home.webp"
            />
          </div>

          <div className="flex space-x-3 sm:space-x-4 mt-[-3px] sm:mt-[-6px] lg:mt-[-9px] z-10">
            <a href="/customized">
              <button
                className="w-32 py-3.5 text-sm sm:w-44 sm:text-base lg:py-4 bg-red-600 text-white rounded-full transition-transform hover:scale-105 hover:bg-red-700 shadow-md shadow-red-600/15"
                style={{ fontFamily: "Matter", fontWeight: 500 }}
              >
                Let's Explore
              </button>
            </a>
            <a href="/contact">
              <button
                className="w-32 py-3.5 text-sm sm:w-44 sm:text-base lg:py-4 bg-white text-black rounded-full border border-gray-300 transition-transform hover:scale-105 hover:bg-red-50/20 hover:border-red-600 hover:text-red-600"
                style={{ fontFamily: "Matter", fontWeight: 500 }}
              >
                Contact Us
              </button>
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 mt-3">
            <div className="flex -space-x-3 scale-[0.85] sm:scale-90 origin-left">
              <img className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-600 object-cover bg-white" src="/home/prof1.png" alt="Audience 1" />
              <img className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-600 object-cover bg-white" src="/home/prof2.png" alt="Audience 2" />
              <img className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-600 object-cover bg-white" src="/home/prof3.png" alt="Audience 3" />
            </div>
            <p className="text-gray-700 text-sm sm:text-lg leading-none" style={{ fontFamily: "Matter" }}>
              Trusted by <span className="text-red-600 font-semibold">90k+</span> Audience
            </p>
          </div>

          {/* Scrolling Marquee Strips */}
          <MarqueeStrip />
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">

        {/* Features Section */}
        <FeaturesSection />

        {/* Reels stack cards section (Trusted by 90k+ People) */}
        <ReelsCarousel />





        {/* Turning Visions Into Digital Reality (Featured Customized Websites) */}
        <section
          ref={gridRef}
          className="relative py-16 sm:py-20 text-center w-full overflow-hidden bg-gradient-to-b from-white to-gray-50/30"
          style={{ fontFamily: "Matter, sans-serif" }}
        >
          {/* Dotted Grid Overlay & Accent Glows */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_28px] -z-10" />
          <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-red-50/30 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[35rem] h-[35rem] bg-neutral-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center px-4 mb-8 sm:mb-10">
            <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
              Featured Projects
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1">
              Transforming Concepts Into Live Platforms
            </h2>
          </div>

          <div className="max-w-6xl mx-auto px-4">
            <div className="grid gap-8 md:gap-10 justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_CUSTOM_PROJECTS.slice(0, 6).map((project) => (
                <a
                  key={project.title}
                  href={project.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex"
                >
                  <div className="p-[2px] rounded-[26px] sm:rounded-[30px] bg-gradient-to-b from-red-500/40 via-red-200/30 to-gray-200/50 hover:from-red-600 hover:via-red-400 hover:to-red-600 transition-all duration-500 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.2)] w-full max-w-sm mx-auto group">
                    <div className="relative flex flex-col h-full bg-white/95 backdrop-blur-xl rounded-[24px] sm:rounded-[28px] overflow-hidden text-left">
                      {/* Image Section */}
                      <div className="relative w-full overflow-hidden bg-gray-50">
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-end p-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 px-3.5 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                            Visit Live Site
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </span>
                        </div>
                        <img
                          src={`/${project.image}`}
                          alt={project.title}
                          className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700 ease-out"
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
                          <span className="text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300 transform">
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
              ))}
            </div>
          </div>

          {/* View All CTA */}
          <div className="flex justify-center mt-12">
            <a href="/customized" className="relative inline-flex items-center group">
              <button className="relative z-10 px-8 py-3.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-600/15 hover:shadow-lg hover:shadow-red-600/25 hover:scale-105 transition-all duration-300 flex items-center gap-2 transform">
                View All Projects
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
            </a>
          </div>
        </section>

        {/* Marquee Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-6 sm:py-8 flex items-center shadow-inner group select-none">
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
            {[...Array(14)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Develop it from Best</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Develop it Once</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(14)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Develop it from Best</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Develop it Once</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>



        {/* Team section mobile/desktop layout */}
        <TeamSection />

        {/* FAQ Accordion */}
        <FaqAccordion />

        {/* Get In Touch section */}
        <GetInTouchSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
