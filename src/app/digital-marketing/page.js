"use client";

import Navbar from "@/components/Navbar";
import CommonMarquee from "@/components/CommonMarquee";
import ReelsCarousel from "@/components/ReelsCarousel";
import DigitalMarketingReviews from "@/components/DigitalMarketingReviews";
import FaqAccordion from "@/components/FaqAccordion";
import GetInTouchSection from "@/components/GetInTouchSection";
import Footer from "@/components/Footer";
import { Star } from "lucide-react";

const DIGITAL_MARKETING_FAQS = [
  {
    question: "What digital marketing services does TexWeb Solution specialize in?",
    answer: "We offer end-to-end digital marketing services including professional video shooting & reel editing, Instagram/Facebook channel management, high-ROAS Meta & Google ad campaigns, search engine optimization (SEO), brand identity design, and lead conversion funnels."
  },
  {
    question: "How do promotional video shoots and Instagram reels help grow my business?",
    answer: "Short-form video reels generate 5x to 10x higher organic reach on social media. Our team shoots cinematic promotional videos and edits viral reels tailored for your brand, attracting targeted local & global customers and turning views into active inquiries."
  },
  {
    question: "How quickly can we see results from Meta & Google ad campaigns?",
    answer: "Paid ad campaigns (Facebook, Instagram, Google Search) start generating targeted customer leads within 24 to 48 hours of launch. We optimize ad copy, target demographics, and landing pages to ensure maximum Return On Ad Spend (ROAS)."
  },
  {
    question: "How long does SEO take to rank our website on the 1st page of Google?",
    answer: "SEO is a sustainable growth strategy. Initial ranking improvements appear within 4 to 8 weeks, while solid 1st page rankings for competitive industry keywords typically take 3 to 6 months of consistent on-page, technical, and backlink optimization."
  },
  {
    question: "Do you handle complete social media account management and daily posting?",
    answer: "Yes! We handle 100% of your social media operations including monthly content calendar planning, graphic post creation, reel editing, caption writing, daily posting, hashtag strategy, and audience DM/comment management."
  },
  {
    question: "How do you track and report campaign ROI for our marketing investment?",
    answer: "We provide transparent bi-weekly & monthly performance dashboards tracking total ad spend, impressions, click-through rates (CTR), lead conversion counts, cost per lead (CPL), and overall Return On Investment (ROI)."
  }
];

const SERVICES = [
  {
    title: "Video Shooting & Professional Editing",
    image: "/digital-marketing/video_editing_showcase.png",
    imageAlt: "Video Shooting & Professional Editing",
    desc: "High-quality brand video shoots, cinematic product shoots, trending reel editing, color grading, sound design, and viral short-form content production.",
    bullets: [
      "Professional product & brand video shoots with studio-grade lighting and camera gear.",
      "Cinematic video editing, trending Instagram Reel & YouTube Shorts hooks, transitions, and color grading.",
      "High-engagement video scripts, voiceover integration, and sound design tailored for viral reach."
    ]
  },
  {
    title: "Social Media Management & Account Handling",
    image: "/digital-marketing/smm_management_showcase.png",
    imageAlt: "Social Media Management & Account Handling",
    desc: "Complete end-to-end management of your social media profiles. We handle monthly content planning, graphic post creation, scheduling, caption writing, and active audience engagement.",
    bullets: [
      "Full account management across Instagram, Facebook, LinkedIn, YouTube, and X (Twitter).",
      "Monthly content calendars, custom graphic post designs, carousel infographics, and copywriting.",
      "Active community management, DM/comment responses, hashtag strategy, and growth analytics."
    ]
  },
  {
    title: "Brand Creation & Visual Identity",
    image: "/digital-marketing/brand_identity_showcase.png",
    imageAlt: "Brand Creation & Visual Identity",
    desc: "Build a premium, memorable brand identity. We craft custom logos, brand guidelines, visual templates, and storytelling that make your business stand out.",
    bullets: [
      "Custom logo design, brand color palettes, typography specifications, and brand style guides.",
      "High-quality graphic templates for social media, marketing collateral, brochures, and digital banners.",
      "Strategic brand positioning and narrative development to build customer trust and strong brand recall."
    ]
  },
  {
    title: "Paid Ads Setup & Performance Marketing",
    image: "/digital-marketing/paid_ads_showcase.png",
    imageAlt: "Paid Ads Setup & Performance Marketing",
    desc: "Launch high-converting advertising campaigns. We build, write, and manage ad funnels on Meta (Facebook & Instagram), Google Ads, YouTube, and LinkedIn.",
    bullets: [
      "Targeted audience setup, custom ad copy writing, and A/B tested creative variations.",
      "Daily bid & budget management, negative keyword filtering, and conversion funnel tuning.",
      "Meta Pixel & Google Conversion tracking integration to measure exact Return on Ad Spend (ROAS)."
    ]
  },
  {
    title: "Search Engine Optimization (SEO)",
    image: "/digital-marketing/seo_showcase.png",
    imageAlt: "Search Engine Optimization (SEO)",
    desc: "Dominate search engine rankings. We optimize your website's technical architecture, on-page content, and backlink profile to drive organic, high-intent leads.",
    bullets: [
      "In-depth keyword research, search intent mapping, and competitor content gap analysis.",
      "Technical SEO fixes, schema markup implementation, page speed optimization, and link building.",
      "Monthly search ranking reports, organic click traffic analytics, and continuous website health checks."
    ]
  }
];

export default function DigitalMarketingPage() {
  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[70vh] sm:min-h-[75vh] md:min-h-screen"
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <img
          src="/common/about_target.png"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute top-24 right-10 w-40 lg:w-52 opacity-90 animate-floatingSmooth pointer-events-none select-none drop-shadow-md"
        />
        <img
          src="/common/about_chart.png"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute bottom-20 left-8 w-36 lg:w-48 opacity-90 animate-floatingSmooth pointer-events-none select-none drop-shadow-md"
          style={{ animationDelay: '1.2s' }}
        />

        <div className="flex-1 flex flex-col justify-start pt-12 md:justify-center md:pt-0">
          <section className="flex flex-1 items-start md:items-center justify-start md:justify-center text-center px-4 sm:px-6 pt-12 sm:pt-14 md:pt-0">
            <div className="w-full">
              <h1 
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-snug sm:leading-tight pb-2" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                Full-Service Digital Marketing <br className="hidden sm:inline" /> & Social Media Growth
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed font-poppins">
                From high-converting Meta & Google ad campaigns to cinematic video shooting, reel editing, brand identity creation, and full-scale social media management — we drive measurable revenue growth for your business.
              </p>
            </div>
          </section>
        </div>

        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-6 sm:py-8 flex items-center shadow-inner group select-none">
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Video Shooting & Production</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Reel Editing & Shorts</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Social Media Handling</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Brand Identity & Design</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Meta & Google Paid Ads</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Search Engine Optimization</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Video Shooting & Production</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Reel Editing & Shorts</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Social Media Handling</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Brand Identity & Design</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Meta & Google Paid Ads</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Search Engine Optimization</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Services List Section */}
      <div className="w-full flex flex-col items-center text-center pt-16 pb-24 px-6" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
          Our Marketing Catalog
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1 mb-16">
          Explore Our Marketing Solutions
        </h2>

        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-28">
          {SERVICES.map((service, index) => {
            const isImageLeft = index % 2 === 0;

            return (
              <div
                key={service.title}
                className="grid md:grid-cols-2 gap-12 items-center px-2 md:px-6"
              >
                {/* Image Side */}
                <div
                  className={`flex justify-center items-center rounded-3xl bg-[#F6FBF9] border border-gray-100 w-full max-w-md aspect-[4/3] overflow-hidden p-3 md:p-4 shadow-sm ${
                    isImageLeft ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <img
                    alt={service.imageAlt}
                    className="rounded-2xl w-full h-full object-cover hover:scale-[1.03] transition-all duration-300"
                    src={service.image}
                    loading="lazy"
                  />
                </div>

                {/* Text Side */}
                <div
                  className={`rounded-xl p-4 text-left ${isImageLeft ? "md:order-2" : "md:order-1"
                    }`}
                >
                  <h3
                    className="text-2xl md:text-3xl text-gray-900 mb-4 font-medium"
                  >
                    {service.title}
                  </h3>

                  <p className="text-gray-500 font-poppins font-light text-sm md:text-base leading-relaxed mb-6">
                    {service.desc}
                  </p>

                  <ul className="space-y-4 mb-8 font-poppins">
                    {service.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm md:text-sm">
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="flex-1 mt-1">{bullet}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-start">
                    <a
                      href={`https://wa.me/+917462827259?text=${encodeURIComponent(
                        `Hi, I'm interested in ${service.title} (Digital Marketing)`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-red-600 text-white rounded-full shadow-md hover:scale-[1.05] hover:bg-red-700 active:scale-[0.96] transition-all duration-100 shadow-red-600/10 font-medium inline-block"
                    >
                      Enquire Now
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* Digital Marketing Dedicated Reviews */}
      <DigitalMarketingReviews />

      {/* Digital Marketing Frequently Asked Questions (6 FAQs) */}
      <FaqAccordion faqs={DIGITAL_MARKETING_FAQS} badge="Marketing FAQ" />

      {/* Get In Touch section */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
