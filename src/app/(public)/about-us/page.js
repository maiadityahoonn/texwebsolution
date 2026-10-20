"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Navbar from "@/components/public/Navbar";
import TeamSection from "@/components/public/TeamSection";
import TestimonialsSwiper from "@/components/public/TestimonialsSwiper";
import PricingCtaBanner from "@/components/public/PricingCtaBanner";
import GetInTouchSection from "@/components/public/GetInTouchSection";
import Footer from "@/components/public/Footer";
import Link from "next/link";
import { createStaticCms } from "@/lib/staticCms";
import { 
  Code2, 
  Sparkles, 
  Bot, 
  TrendingUp, 
  GraduationCap, 
  Briefcase, 
  Wand2, 
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  Compass,
  HeartHandshake,
  Zap,
  Key,
  ShieldCheck,
  Paintbrush,
  Layers,
  Search,
  Rocket,
  Server,
  Layout,
  Cpu,
  Smartphone,
  Check
} from "lucide-react";

function AnimatedCounter({ value, label }) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef(null);

  const animateCount = useCallback(() => {
    const match = value.match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const target = parseFloat(match[1]);
    const suffix = match[2] || "";
    const hasDecimal = match[1].includes(".");

    const duration = 1600;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * easeProgress;

      if (hasDecimal) {
        setDisplayValue(currentVal.toFixed(1) + suffix);
      } else {
        setDisplayValue(Math.floor(currentVal) + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (hasDecimal) {
          setDisplayValue(target.toFixed(1) + suffix);
        } else {
          setDisplayValue(target + suffix);
        }
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount();
          } else {
            setDisplayValue("0");
          }
        });
      },
      { threshold: 0.3 }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, [animateCount]);

  return (
    <div 
      ref={ref} 
      className="bg-white border border-red-100/70 shadow-sm rounded-2xl p-3 min-[360px]:p-4 sm:p-6 text-center hover:shadow-md hover:border-red-300 transition-all duration-300 select-none"
    >
      <span className="block text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold text-red-600 mb-1 sm:mb-2 tabular-nums">
        {displayValue}
      </span>
      <span className="text-gray-600 font-medium text-xs min-[360px]:text-sm sm:text-base font-poppins leading-tight block">
        {label}
      </span>
    </div>
  );
}

export default function AboutUsPage() {
  const cms = createStaticCms();
  const aboutHero = cms.block("about.hero", {
    title: "We Architect Digital Products",
    subtitle: "TexWeb Solution is a 360° technology firm specializing in custom web/app development, prebuilt SaaS platforms, AI automation workflows, and high-performance digital marketing — backed by our sister EdTech entity, Internship Catalyst.",
  });
  const stats = cms.list("about.stats", "stats", [
    { number: "20+", label: "Projects Delivered" },
    { number: "1.3L+", label: "Audience Reach" },
    { number: "15+", label: "Tech Experts" },
    { number: "99%", label: "Client Satisfaction" },
  ]);

  const defaultServices = [
    {
      title: "Custom Web & App Development",
      category: "Tailor-Made Solutions",
      icon: Code2,
      desc: "We build high-performance, scalable web applications, mobile apps (iOS & Android), and custom enterprise platforms tailored specifically to your business workflows.",
      bullets: [
        "Modern Stack: Next.js, React, Node.js, Python & Cloud Native Architecture",
        "Tailor-made CRM, ERP, SaaS & E-commerce Applications",
        "Pixel-perfect UI/UX design with smooth micro-interactions"
      ],
      link: "/customized/websites",
      linkText: "Explore Custom Services",
      gradient: "from-red-600/10 via-orange-500/5 to-transparent",
      borderColor: "border-red-100 hover:border-red-400",
      accentColor: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Prebuilt SaaS & Software Platforms",
      category: "Launch-Ready Software",
      icon: Sparkles,
      desc: "Bypass months of development time with our prebuilt, ready-to-deploy digital products — from multi-vendor marketplaces and food delivery to ride-sharing & healthcare apps.",
      bullets: [
        "100% Complete Source Code Ownership transferred to you",
        "Zero recurring monthly licensing or subscription fees",
        "Configured, branded & published to App Stores in 1 to 2 weeks"
      ],
      link: "/prebuilt",
      linkText: "Browse Prebuilt Catalog",
      gradient: "from-amber-600/10 via-orange-500/5 to-transparent",
      borderColor: "border-amber-100 hover:border-amber-400",
      accentColor: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "AI & Workflow Automation",
      category: "Smart Business AI",
      icon: Bot,
      desc: "Supercharge your business productivity by deploying 24/7 WhatsApp AI bots, human-like voice agents, document OCR extractors, and automated n8n/Make workflows.",
      bullets: [
        "WhatsApp AI Sales & Customer Support Bots (24/7 Lead Capture)",
        "AI Voice Assistants for automated inbound/outbound phone calls",
        "Document AI, Invoice OCR & RAG Knowledge Base Chatbots"
      ],
      link: "/ai-automation",
      linkText: "Explore AI Automations",
      gradient: "from-rose-600/10 via-red-500/5 to-transparent",
      borderColor: "border-rose-100 hover:border-rose-400",
      accentColor: "text-rose-600",
      bgColor: "bg-rose-50"
    },
    {
      title: "Digital Marketing & Brand Growth",
      category: "Performance Marketing",
      icon: TrendingUp,
      desc: "Drive targeted traffic and measurable revenue growth with cinematic video shooting, viral reel editing, high-ROAS Meta & Google ad campaigns, and strategic SEO.",
      bullets: [
        "Studio-grade Video Shoots, Trending Reel & Shorts Editing",
        "High-Converting Meta & Google Paid Ad Funnels",
        "Search Engine Optimization (SEO) & Brand Identity Design"
      ],
      link: "/digital-marketing",
      linkText: "Explore Marketing Solutions",
      gradient: "from-orange-600/10 via-red-500/5 to-transparent",
      borderColor: "border-orange-100 hover:border-orange-400",
      accentColor: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];
  const cmsServices = cms.list("about.services", "services", []);
  const services = defaultServices.map((service, index) => ({ ...service, ...(cmsServices[index] || {}) }));

  const advantageItems = [
    {
      icon: Zap,
      title: "Rapid 1-Week Launch",
      desc: "Launch prebuilt SaaS, turnkey software platforms, or MVP prototypes within 7 to 14 days, skipping months of custom coding."
    },
    {
      icon: Key,
      title: "100% Source Code Ownership",
      desc: "Full code authority transferred upon payment. No mandatory monthly licensing fees, lock-ins, or mandatory platform cuts."
    },
    {
      icon: Bot,
      title: "AI-First Infrastructure",
      desc: "Pre-integrated 24/7 WhatsApp AI bots, Voice Assistants, and automated workflows engineered directly into your software."
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Data Privacy",
      desc: "Strict data confidentiality. Your internal documents, database records, and AI prompts are NEVER used to train public LLM models."
    },
    {
      icon: Paintbrush,
      title: "Modern UI/UX Aesthetics",
      desc: "Vibrant, state-of-the-art visual design built with Next.js, Tailwind CSS, fluid gradients, and engaging micro-animations."
    },
    {
      icon: Layers,
      title: "360° Tech & Growth Ecosystem",
      desc: "Development + SaaS + AI Agents + Performance Marketing + EdTech upskilling all handled under one unified roof."
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Discovery & Strategy",
      desc: "In-depth requirement mapping, tech stack selection, wireframe planning, and setting a clear execution roadmap.",
      icon: Search,
      badgeColor: "bg-red-50 text-red-600 border-red-100"
    },
    {
      step: "02",
      title: "Agile Engineering & AI Setup",
      desc: "Modular clean-code development, backend API creation, custom LLM prompt tuning, and active sprint updates.",
      icon: Code2,
      badgeColor: "bg-orange-50 text-orange-600 border-orange-100"
    },
    {
      step: "03",
      title: "Rigorous QA & Security Audit",
      desc: "Cross-device testing, mobile responsiveness checks, speed optimization, and vulnerability security audits.",
      icon: ShieldCheck,
      badgeColor: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      step: "04",
      title: "Live Launch & Code Handover",
      desc: "Deployment on cloud servers / App Stores + complete source code authority transfer & post-launch warranty.",
      icon: Rocket,
      badgeColor: "bg-rose-50 text-rose-600 border-rose-100"
    }
  ];

  const techCategories = [
    {
      title: "Frontend & UI Engineering",
      subtitle: "High-performance web apps & reactive interfaces",
      icon: Layout,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100/80 hover:border-red-400",
      badgeColor: "bg-red-100/70 text-red-700",
      gradient: "from-red-600/10 via-orange-500/5 to-transparent",
      skills: [
        { name: "Next.js 15", tag: "Framework" },
        { name: "React 19", tag: "Library" },
        { name: "Tailwind CSS v4", tag: "Styling" },
        { name: "TypeScript", tag: "Type Safety" },
        { name: "HTML5 / CSS3", tag: "Core Web" },
        { name: "Framer Motion", tag: "Animations" }
      ]
    },
    {
      title: "Backend & Cloud Architecture",
      subtitle: "Scalable APIs, microservices & databases",
      icon: Server,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100/80 hover:border-orange-400",
      badgeColor: "bg-orange-100/70 text-orange-700",
      gradient: "from-orange-600/10 via-amber-500/5 to-transparent",
      skills: [
        { name: "Node.js", tag: "Runtime" },
        { name: "Python", tag: "AI/Backend" },
        { name: "AWS Cloud", tag: "DevOps" },
        { name: "Google Cloud", tag: "Hosting" },
        { name: "Docker", tag: "Containers" },
        { name: "MongoDB & Postgres", tag: "Databases" }
      ]
    },
    {
      title: "AI & Intelligent Workflows",
      subtitle: "24/7 AI bots, LLM agents & OCR pipelines",
      icon: Cpu,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100/80 hover:border-rose-400",
      badgeColor: "bg-rose-100/70 text-rose-700",
      gradient: "from-rose-600/10 via-red-500/5 to-transparent",
      skills: [
        { name: "WhatsApp Cloud API", tag: "24/7 Chatbot" },
        { name: "OpenAI & LLMs", tag: "Smart Agents" },
        { name: "AI Voice Agents", tag: "Phone Calls" },
        { name: "Document OCR AI", tag: "Extraction" },
        { name: "n8n & Make", tag: "Workflows" },
        { name: "RAG Vector Search", tag: "Knowledge Base" }
      ]
    },
    {
      title: "Mobile & Growth Marketing",
      subtitle: "Cross-platform mobile apps & ad funnels",
      icon: Smartphone,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100/80 hover:border-amber-400",
      badgeColor: "bg-amber-100/70 text-amber-700",
      gradient: "from-amber-600/10 via-orange-500/5 to-transparent",
      skills: [
        { name: "React Native", tag: "iOS & Android" },
        { name: "Flutter", tag: "Cross-Platform" },
        { name: "Meta Ads Manager", tag: "High-ROAS Ads" },
        { name: "Google Search Ads", tag: "Lead Generation" },
        { name: "Technical SEO", tag: "Google Ranking" },
        { name: "Figma Systems", tag: "UI/UX Design" }
      ]
    }
  ];

  const internshipCatalystFeatures = [
    {
      icon: Briefcase,
      title: "Verified MNC Jobs & Internships",
      desc: "Direct access to curated job and internship openings from top global companies like Google, Amazon, Microsoft, Meta, Flipkart, and Infosys."
    },
    {
      icon: GraduationCap,
      title: "Premium Tech Upskilling Courses",
      desc: "Hands-on, job-ready training programs in Web Development, AI Automation, Machine Learning, UI/UX Design, and Data Analytics."
    },
    {
      icon: Wand2,
      title: "AI-Powered Career Tools",
      desc: "Suite of smart career utilities including an AI Resume Builder, ATS Score Checker, Skill Gap Analyzer, and AI Cover Letter Generator."
    }
  ];

  const values = [
    {
      title: "Our Mission",
      description: "To empower businesses with cutting-edge software, AI automation, and digital growth strategies, while nurturing the next generation of tech talent through accessible upskilling.",
      gradient: "from-red-500/10 to-orange-500/10",
      border: "hover:border-red-500/30",
      icon: Target
    },
    {
      title: "Our Vision",
      description: "To be a global technology powerhouse known for software craftsmanship, innovation in AI workflows, and creating impactful educational pathways for tomorrow's engineers.",
      gradient: "from-red-500/10 to-pink-500/10",
      border: "hover:border-red-500/30",
      icon: Compass
    },
    {
      title: "Our Core Values",
      description: "Precision engineering, transparent client communication, continuous innovation, and a commitment to delivering tangible ROI in every digital product we ship.",
      gradient: "from-orange-500/10 to-red-500/10",
      border: "hover:border-orange-500/30",
      icon: HeartHandshake
    },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Hero Header Wrapper */}
      <div 
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-0 md:min-h-[500px] lg:min-h-[560px]" 
        style={{ backgroundImage: "url('https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/Bg2.png')" }}
      >
        <Navbar />

        {/* Floating Ornaments */}
        <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/about_target.png" alt="" aria-hidden="true" width={192} height={192} className="hidden md:block absolute top-28 right-12 w-36 lg:w-48 h-auto opacity-80 animate-floatingSmooth pointer-events-none select-none" />
        <Image src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/about_chart.png" alt="" aria-hidden="true" width={176} height={176} className="hidden md:block absolute bottom-24 left-8 w-32 lg:w-44 h-auto opacity-70 animate-floatingSmooth pointer-events-none select-none" style={{ animationDelay: '1.8s' }} />

        <div className="flex-1 flex flex-col justify-center pt-0 pb-3 min-[360px]:pb-3.5 sm:py-6 md:py-8">
          <section className="flex items-center justify-center text-center px-3 min-[360px]:px-4 sm:px-6">
            <div className="w-full">
              <h1 
                className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight pb-1" 
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                {aboutHero.title}
              </h1>
              <p className="mt-2.5 sm:mt-4 text-xs min-[360px]:text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-poppins font-light leading-relaxed px-2">
                {aboutHero.subtitle}
              </p>
            </div>
          </section>
        </div>

        {/* Marquee Strip Separator */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-950 via-red-900 to-gray-950 py-4 sm:py-5 flex items-center shadow-inner group select-none">
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep1 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Custom Software</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>AI Automation</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Prebuilt SaaS</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Digital Marketing</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Internship Catalyst</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full flex shrink-0 items-center gap-8 whitespace-nowrap animate-marquee-sep2 pr-8">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-base sm:text-2xl font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-8 font-[Matter]">
                <span>Custom Software</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>AI Automation</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Prebuilt SaaS</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Digital Marketing</span>
                <span className="text-red-200/60 font-normal">•</span>
                <span>Internship Catalyst</span>
                <span className="text-red-200/60 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 max-w-7xl mx-auto w-full" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-[360px]:gap-4 md:gap-8">
          {stats.map((stat, idx) => (
            <AnimatedCounter key={idx} value={stat.number} label={stat.label} />
          ))}
        </div>
      </section>

      {/* Mission, Vision, Values Grid */}
      <section className="py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 max-w-7xl mx-auto w-full" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-block px-3.5 min-[360px]:px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full font-semibold text-[11px] min-[360px]:text-xs sm:text-sm font-[Matter] mb-2.5 sm:mb-3">
            Our Foundation
          </div>
          <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
            Our Guiding Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-[360px]:gap-6 sm:gap-8">
          {values.map((item, idx) => {
            const ValIcon = item.icon;
            return (
              <div 
                key={idx} 
                className={`bg-gradient-to-br ${item.gradient} border border-gray-100 p-5 min-[360px]:p-6 sm:p-8 rounded-2xl min-[360px]:rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.border} text-left`}
              >
                <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 rounded-xl min-[360px]:rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 sm:mb-6 shadow-sm">
                  <ValIcon className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6" />
                </div>
                <h3 className="text-xl min-[360px]:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-4 text-left">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs min-[360px]:text-sm sm:text-base font-poppins font-light text-left">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services Showcase Section */}
      <section className="py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 bg-slate-50/60 border-y border-gray-100 w-full" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-block px-3.5 min-[360px]:px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full font-semibold text-[11px] min-[360px]:text-xs sm:text-sm font-[Matter] mb-2.5 sm:mb-3">
              What We Do
            </div>
            <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
              Our Core Services & Solutions
            </h2>
            <p className="mt-2.5 sm:mt-3 text-gray-600 text-xs min-[360px]:text-sm sm:text-base font-poppins font-light leading-relaxed">
              We cover every phase of digital growth — from building custom web applications and instant prebuilt software to implementing cutting-edge AI bots and driving revenue with performance marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-[360px]:gap-6 sm:gap-8">
            {services.map((service, idx) => {
              const IconComp = service.icon;
              return (
                <div 
                  key={idx}
                  className={`bg-white border ${service.borderColor} rounded-2xl min-[360px]:rounded-3xl p-4 min-[360px]:p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden text-left`}
                >
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${service.gradient} rounded-bl-full pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100`} />
                  
                  <div>
                    <div className="flex items-center gap-3.5 min-[360px]:gap-4 mb-4 sm:mb-6">
                      <div className={`w-12 h-12 min-[360px]:w-14 min-[360px]:h-14 rounded-xl min-[360px]:rounded-2xl ${service.bgColor} ${service.accentColor} flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComp className="w-6 h-6 min-[360px]:w-7 min-[360px]:h-7" />
                      </div>
                      <div className="text-left">
                        <span className="text-[11px] min-[360px]:text-xs font-semibold uppercase tracking-wider text-gray-400 font-poppins block text-left">
                          {service.category}
                        </span>
                        <h3 className="text-lg min-[360px]:text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors text-left leading-snug">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs min-[360px]:text-sm sm:text-base font-poppins leading-relaxed mb-4 sm:mb-6 font-light text-left">
                      {service.desc}
                    </p>

                    <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 font-poppins text-xs min-[360px]:text-sm text-gray-600 text-left">
                      {service.bullets.map((b, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-2.5 text-left">
                          <CheckCircle2 className={`w-4 h-4 ${service.accentColor} shrink-0 mt-0.5`} />
                          <span className="text-left">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={service.link} className="w-full">
                    <button className="w-full py-2.5 min-[360px]:py-3 px-4 min-[360px]:px-6 rounded-xl min-[360px]:rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-xs min-[360px]:text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 flex items-center justify-center gap-2 group/btn">
                      <span>{service.linkText}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 1: The TexWeb Advantage */}
      <section className="py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 max-w-7xl mx-auto w-full font-poppins" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-block px-3.5 min-[360px]:px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full font-semibold text-[11px] min-[360px]:text-xs sm:text-sm font-[Matter] mb-2.5 sm:mb-3">
            The TexWeb Advantage
          </div>
          <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
            Why Businesses Partner With Us
          </h2>
          <p className="mt-2.5 sm:mt-3 text-gray-600 text-xs min-[360px]:text-sm sm:text-base font-light leading-relaxed">
            Engineered for speed, security, and total code ownership — built to scale your business with zero technical compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-[360px]:gap-6 sm:gap-8">
          {advantageItems.map((item, idx) => {
            const AdvIcon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white border border-gray-150 p-5 min-[360px]:p-6 sm:p-8 rounded-2xl min-[360px]:rounded-3xl shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 flex flex-col justify-start group text-left"
              >
                <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 rounded-xl min-[360px]:rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <AdvIcon className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6" />
                </div>
                <h3 className="text-lg min-[360px]:text-xl font-bold text-gray-900 mb-2 sm:mb-3 font-[Matter] group-hover:text-red-600 transition-colors text-left">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-xs min-[360px]:text-sm leading-relaxed font-light text-left">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Our 4-Step Working & Delivery Process */}
      <section className="py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 bg-neutral-900 text-white w-full font-poppins relative overflow-hidden" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-block px-3.5 min-[360px]:px-4 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full font-semibold text-[11px] min-[360px]:text-xs sm:text-sm font-[Matter] mb-2.5 sm:mb-3">
              How We Work
            </div>
            <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight pb-1">
              Our Proven 4-Step Delivery Process
            </h2>
            <p className="mt-2.5 sm:mt-3 text-gray-400 text-xs min-[360px]:text-sm sm:text-base font-light leading-relaxed">
              A transparent, streamlined engineering methodology from initial concept to live market deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-[360px]:gap-5 sm:gap-6">
            {processSteps.map((stepItem, idx) => {
              const StepIcon = stepItem.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl min-[360px]:rounded-3xl p-5 min-[360px]:p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between group relative text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <span className="text-2xl min-[360px]:text-3xl font-bold text-red-500/80 font-[Matter]">
                        {stepItem.step}
                      </span>
                      <div className="w-8 h-8 min-[360px]:w-10 min-[360px]:h-10 rounded-lg min-[360px]:rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <StepIcon className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 text-red-400" />
                      </div>
                    </div>

                    <h3 className="text-lg min-[360px]:text-xl font-bold text-white mb-2 sm:mb-3 font-[Matter] text-left">
                      {stepItem.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm font-light leading-relaxed text-left">
                      {stepItem.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Tech Stack & Tools We Master */}
      <section className="py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 max-w-7xl mx-auto w-full font-poppins" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-block px-3.5 min-[360px]:px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full font-semibold text-[11px] min-[360px]:text-xs sm:text-sm font-[Matter] mb-2.5 sm:mb-3">
            Our Technology Stack
          </div>
          <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
            Powered by World-Class Tech Infrastructure
          </h2>
          <p className="mt-2.5 sm:mt-3 text-gray-600 text-xs min-[360px]:text-sm sm:text-base font-light leading-relaxed">
            We leverage battle-tested frameworks, modern cloud platforms, and cutting-edge AI engines to build enterprise software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-[360px]:gap-6 sm:gap-8">
          {techCategories.map((cat, idx) => {
            const CatIcon = cat.icon;
            return (
              <div 
                key={idx}
                className={`bg-white border ${cat.borderColor} rounded-2xl min-[360px]:rounded-3xl p-4 min-[360px]:p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 flex flex-col justify-between text-left`}
              >
                {/* Subtle Gradient Glow Accent */}
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${cat.gradient} rounded-bl-full pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100`} />

                <div>
                  {/* Category Header */}
                  <div className="flex items-center gap-3.5 min-[360px]:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 relative z-10 text-left">
                    <div className={`w-12 h-12 min-[360px]:w-14 min-[360px]:h-14 rounded-xl min-[360px]:rounded-2xl ${cat.bgColor} ${cat.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                      <CatIcon className="w-5 h-5 min-[360px]:w-6 sm:w-7 min-[360px]:h-6 sm:h-7" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg min-[360px]:text-xl sm:text-2xl font-bold text-gray-900 font-[Matter] group-hover:text-red-600 transition-colors text-left leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-poppins font-light mt-0.5 text-left">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Skills Grid of Interactive Pill Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 relative z-10 font-poppins text-left">
                    {cat.skills.map((skill, sIdx) => (
                      <div 
                        key={sIdx}
                        className="px-3 min-[360px]:px-3.5 py-2 min-[360px]:py-2.5 bg-slate-50/80 border border-slate-200/70 rounded-xl min-[360px]:rounded-2xl flex items-center justify-between hover:bg-white hover:border-red-400 hover:shadow-md transition-all duration-200 group/pill text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0 text-left">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 group-hover/pill:scale-125 transition-transform" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate text-left">
                            {skill.name}
                          </span>
                        </div>
                        <span className={`text-[9.5px] min-[360px]:text-[10px] uppercase font-bold tracking-wider px-1.5 min-[360px]:px-2 py-0.5 rounded-md ${cat.badgeColor} shrink-0`}>
                          {skill.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Count Badge */}
                <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-poppins relative z-10">
                  <span className="flex items-center gap-1.5 font-medium text-gray-600 text-[11px] min-[360px]:text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">Production-Ready Infrastructure</span>
                  </span>
                  <span className="font-semibold text-gray-400 font-[Matter] text-[11px] min-[360px]:text-xs shrink-0">
                    {cat.skills.length} Technologies
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sister Company Highlight: Internship Catalyst */}
      <section className="py-8 sm:py-12 px-2.5 min-[360px]:px-4 sm:px-6 max-w-7xl mx-auto w-full" style={{ fontFamily: "Matter, sans-serif" }}>
        <div className="relative rounded-2xl min-[360px]:rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white p-4 min-[360px]:p-6 sm:p-12 md:p-16 overflow-hidden shadow-2xl border border-gray-800 text-left">
          
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 text-left">
            {/* Header Badge & Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-white/10 text-left">
              <div className="max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 backdrop-blur-sm">
                  <GraduationCap className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Our Sister Company & EdTech Branch</span>
                </div>
                <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight text-left">
                  Internship Catalyst
                </h2>
                <p className="mt-2.5 sm:mt-4 text-gray-300 text-xs min-[360px]:text-sm sm:text-base font-poppins font-light leading-relaxed text-left">
                  <strong>Internship Catalyst</strong> (a branch company of TexWeb Solution) is an EdTech & Career Acceleration platform empowering students, freshers, and professionals with real-world skills, verified MNC opportunities, and AI-driven career tools.
                </p>
              </div>

              <div className="shrink-0 flex justify-start text-left">
                <a
                  href="https://www.internshipcatalyst.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 min-[360px]:px-8 py-3 min-[360px]:py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-full hover:from-red-500 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 text-xs min-[360px]:text-sm sm:text-base max-w-full truncate"
                >
                  <span className="truncate">Visit Internship Catalyst</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>
            </div>

            {/* 3 Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-[360px]:gap-6 mb-8 sm:mb-12 font-poppins text-left">
              {internshipCatalystFeatures.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-white/5 backdrop-blur-md border border-white/10 p-4 min-[360px]:p-6 rounded-xl min-[360px]:rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 text-left"
                  >
                    <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3 sm:mb-4 border border-red-500/30">
                      <ItemIcon className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6" />
                    </div>
                    <h4 className="text-base min-[360px]:text-lg font-bold text-white mb-1.5 sm:mb-2 font-[Matter] text-left">
                      {item.title}
                    </h4>
                    <p className="text-gray-300 text-xs min-[360px]:text-sm leading-relaxed font-light text-left">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Info Banner */}
            <div className="bg-white/5 border border-white/10 rounded-xl min-[360px]:rounded-2xl p-4 min-[360px]:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 font-poppins text-xs sm:text-sm text-gray-300 text-left">
              <div className="flex items-center gap-2.5 sm:gap-3 text-left">
                <div className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="leading-relaxed">Join thousands of students and freshers building career-ready skills on Internship Catalyst.</span>
              </div>
              <a 
                href="https://www.internshipcatalyst.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-400 font-semibold hover:text-red-300 underline underline-offset-4 shrink-0 transition-colors"
              >
                internshipcatalyst.in ↗
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Team Showcase */}
      <div className="bg-neutral-50/50 border-t border-gray-100">
        <TeamSection />
      </div>

      {/* Testimonials */}
      <div className="bg-white border-y border-gray-100">
        <TestimonialsSwiper />
      </div>

      {/* Pricing CTA Banner */}
      <PricingCtaBanner
        badge="Enterprise & Startup Packages"
        title="Ready to Scale Your Project with TexWeb Solution?"
        subtitle="Explore our transparent pricing tiers, custom quotation models, or speak directly with our solutions architect."
        customWhatsappText="Hi TexWeb Solution, I'd like to discuss pricing and solutions for my company."
      />

      {/* Get In Touch section */}
      <GetInTouchSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
