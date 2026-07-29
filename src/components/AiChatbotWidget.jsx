"use client";

import { useState, useEffect, useRef } from "react";
import { 
  UserCheck, 
  X, 
  Send, 
  Sparkles, 
  User, 
  MessageSquare, 
  PhoneCall, 
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  ThumbsUp,
  HelpCircle
} from "lucide-react";
import { addLead } from "@/utils/leadStorage";

// Helper function to format **bold** markdown cleanly without showing raw ** asterisks
function formatChatMessage(text) {
  if (!text) return "";
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Country Code Options for Lead Capture Dropdown
const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91 (India)" },
  { code: "+1", label: "🇺🇸 +1 (USA/Canada)" },
  { code: "+44", label: "🇬🇧 +44 (UK)" },
  { code: "+971", label: "🇦🇪 +971 (UAE)" },
  { code: "+966", label: "🇸🇦 +966 (Saudi Arabia)" },
  { code: "+61", label: "🇦🇺 +61 (Australia)" },
  { code: "+65", label: "🇸🇬 +65 (Singapore)" },
  { code: "+49", label: "🇩🇪 +49 (Germany)" }
];

// Master Section Chips Registry for Dynamic Sibling Chips Suggestion
const SECTION_CHIPS = {
  ai: [
    { label: "💬 WhatsApp AI Bot & API Automations", query: "Tell me about WhatsApp AI Bot & API Automations" },
    { label: "🎙️ AI Voice Calling Assistant", query: "How does AI Voice Calling work?" },
    { label: "📄 Document AI & Invoice OCR", query: "Tell me about Document AI & Invoice OCR" },
    { label: "🧠 Private RAG Knowledge Base AI", query: "What is RAG Knowledge Base Chatbot?" },
    { label: "⚡ n8n & Python Workflow Automation", query: "Tell me about n8n & Python Workflow Automation" },
    { label: "🔒 How is business data secured?", query: "How is my business data secured in AI automations?" },
    { label: "📋 Request Free AI Proposal / Callback", type: "lead" }
  ],
  saas: [
    { label: "🛒 Multi-Vendor E-Commerce Marketplace", query: "Tell me about Multi-Vendor E-Commerce Marketplace" },
    { label: "🍔 Food & Grocery Delivery App", query: "Tell me about Food & Grocery Delivery App" },
    { label: "🚗 Uber-Clone Ride Sharing System", query: "What features are included in the Uber clone ride sharing app?" },
    { label: "🏥 Healthcare & Doctor Booking SaaS", query: "Tell me about Healthcare & Doctor Booking SaaS" },
    { label: "📚 LMS Learning Platform SaaS", query: "Tell me about LMS Learning Platform SaaS" },
    { label: "🔑 Do I get 100% source code?", query: "Do I get complete 100% source code ownership?" },
    { label: "🛒 Request Prebuilt SaaS Demo & Quote", type: "lead" }
  ],
  custom: [
    { label: "⚛️ Custom Full-Stack Web App Development", query: "Tell me about Custom Web App Development" },
    { label: "🏬 Which industries do you build web apps for?", query: "Which industries do you build custom web apps for?" },
    { label: "🤖 Will my website rank on Google, ChatGPT & AI Search?", query: "Will my website rank on Google, ChatGPT & AI Search Engine Optimizations?" },
    { label: "📱 Cross-Platform Mobile Apps (iOS & Android)", query: "What technologies do you use for mobile app development?" },
    { label: "🏢 Custom Enterprise ERP & CRM Software", query: "Tell me about Custom ERP & CRM Development" },
    { label: "⚡ Development Timeline & Sprints", query: "What is the typical custom web app development timeline?" },
    { label: "☁️ AWS Cloud Hosting & Infrastructure", query: "Tell me about AWS Cloud Infrastructure & Hosting" },
    { label: "💻 Request Custom Website & App Quote", type: "lead" }
  ],
  media: [
    { label: "🔴 YouTube Long-Form Video Editing", query: "Tell me about YouTube Long-Form Video Editing" },
    { label: "📱 Instagram Reels & YouTube Shorts Editing", query: "Tell me about Reel & Shorts Editing Services" },
    { label: "✨ Motion Graphics & VFX Video Editing", query: "Tell me about Motion Graphics & VFX Video Editing" },
    { label: "🎙️ Podcast & Multi-Cam Video Editing", query: "Tell me about Podcast & Interview Video Editing" },
    { label: "🏢 Corporate & Brand Video Editing", query: "Tell me about Corporate & Brand Video Editing" },
    { label: "🛒 E-Commerce UGC Ad Video Editing", query: "Tell me about E-Commerce & UGC Ad Video Editing" },
    { label: "🎬 Request Video Editing Quote & Callback", type: "lead" }
  ],
  marketing: [
    { label: "🎬 Cinematic Brand Video Shoots", query: "Tell me about Brand Video Shoots & Commercials" },
    { label: "📲 Video Editing (YouTube, Reels & Ads)", query: "Tell me about Video Editing" },
    { label: "🎯 Meta & Google Paid Ad Campaigns", query: "How do you run Meta and Google ad campaigns?" },
    { label: "🔍 Technical SEO & Google Ranking", query: "What is included in Technical SEO packages?" },
    { label: "🎨 Brand Identity & Graphic Design", query: "Tell me about Brand Identity & Graphic Design" },
    { label: "📈 Request Digital Marketing Audit & Quote", type: "lead" }
  ]
};

// Deeply Categorized Knowledge Base for AI & WhatsApp Automations, SaaS, Custom Dev, Video Editing, Marketing & Lead Conversion
const KNOWLEDGE_BASE = [
  // ==========================================
  // --- 1. AI & WHATSAPP AUTOMATION BRANCH ---
  // ==========================================
  {
    section: "ai",
    keywords: ["what ai automations do you build", "ai & whatsapp automations", "ai automation"],
    answer: "We engineer enterprise-grade AI Automations across 5 core specialized domains:\n\n1. WhatsApp AI Bots & WhatsApp Business API Automations\n2. Human-like AI Voice Calling Assistants (Inbound/Outbound)\n3. Document AI & Invoice OCR Extractor\n4. Private RAG Knowledge Base Chatbots (Zero Data Leakage)\n5. n8n, Make.com & Python Workflow Automations\n\nWhich AI automation service would you like to explore?"
  },
  {
    section: "ai",
    keywords: ["tell me about whatsapp ai bot & api automations", "whatsapp ai bot", "whatsapp automation"],
    answer: "Our WhatsApp AI Bots integrate directly with WhatsApp Business API to automatically answer customer inquiries, send interactive product catalogs, book appointments, broadcast marketing campaigns, and sync leads to CRM 24/7 without manual staff."
  },
  {
    section: "ai",
    keywords: ["how does ai voice calling work?", "how ai voice calling works", "voice ai calling", "voice assistant"],
    answer: "Our AI Voice Calling Assistants use natural Speech-to-Speech LLMs to handle inbound customer calls, confirm appointments, conduct survey calls, and answer FAQs in real-time with realistic human voice tone and zero latency."
  },
  {
    section: "ai",
    keywords: ["tell me about document ai & invoice ocr", "document ai", "invoice ocr", "ocr extraction"],
    answer: "Document AI extracts structured JSON data from PDF invoices, receipts, contracts, and IDs with 99%+ accuracy using custom Vision AI models, auto-entering data directly into your ERP/CRM system."
  },
  {
    section: "ai",
    keywords: ["what is rag knowledge base chatbot?", "rag knowledge base", "private data ai", "rag chatbot"],
    answer: "RAG (Retrieval-Augmented Generation) connects an AI chatbot to your company's private PDF manuals, Notion docs, and database records so it answers internal employee or customer questions with zero hallucination."
  },
  {
    section: "ai",
    keywords: ["tell me about n8n & python workflow automation", "n8n", "make automation", "python workflow"],
    answer: "We build automated cross-platform pipelines linking Google Sheets, Airtable, HubSpot, Stripe, and Email with custom Python scripts and n8n webhooks to automate repetitive back-office tasks."
  },
  {
    section: "ai",
    keywords: ["how is my business data secured in ai automations?", "how is my business data secured", "data secured", "security", "privacy", "llm models"],
    answer: "We deploy isolated enterprise API endpoints and custom RAG Vector databases. Your client records, document PDFs, and internal databases are strictly isolated and never accessible by public models."
  },

  // ==========================================
  // --- 2. PREBUILT SAAS CATALOG BRANCH ---
  // ==========================================
  {
    section: "saas",
    keywords: ["what prebuilt saas platforms are ready?", "ready prebuilt saas catalog", "prebuilt saas", "saas platform", "ready marketplace"],
    answer: "Our ready-to-deploy prebuilt SaaS catalog includes 5 production-grade software solutions:\n\n1. Multi-Vendor E-Commerce Marketplace (Amazon/Flipkart style)\n2. On-Demand Food & Grocery Delivery System (Zomato/Swiggy style)\n3. Uber-Clone Ride Sharing App & Dispatch System\n4. Healthcare Doctor Booking & EMR SaaS\n5. LMS Learning & Video Course Platform\n\nAll platforms include 100% complete source code ownership upon delivery!"
  },
  {
    section: "saas",
    keywords: ["tell me about multi-vendor e-commerce marketplace", "multi-vendor marketplace", "e-commerce marketplace"],
    answer: "Our Multi-Vendor E-Commerce Marketplace includes Vendor Admin Dashboards, Super Admin Commission Controller, Mobile Buyer iOS/Android App, Payment Gateways (Razorpay/Stripe), and Automated Payout calculation."
  },
  {
    section: "saas",
    keywords: ["tell me about food & grocery delivery app", "food delivery app", "grocery delivery"],
    answer: "The Food & Grocery Delivery SaaS contains 3 live apps: Customer Ordering App, Restaurant/Store Partner Tablet App, and Driver Partner App with turn-by-turn live GPS tracking."
  },
  {
    section: "saas",
    keywords: ["what features are included in the uber clone ride sharing app?", "uber clone", "ride sharing app", "driver partner"],
    answer: "Our Uber-clone system comes with 3 ready modules: iOS/Android Rider App, Driver Partner App, and Super Admin Dispatch Portal with real-time GPS tracking and wallet payouts."
  },
  {
    section: "saas",
    keywords: ["tell me about healthcare & doctor booking saas", "doctor booking", "healthcare saas"],
    answer: "Includes Doctor Schedule Manager, Video Consultation Room, Patient Digital EMR Records, Prescription Generator, and Online Slot Booking System."
  },
  {
    section: "saas",
    keywords: ["tell me about lms learning platform saas", "lms platform", "video course saas"],
    answer: "Our LMS SaaS features Video Course Player with DRM protection, Quiz & Assignment Evaluator, Automated PDF Certificate Generator, and Student Analytics Dashboard."
  },
  {
    section: "saas",
    keywords: ["do i get complete 100% source code ownership?", "source code ownership", "100% source code", "sourcecode"],
    answer: "Yes! 100% full source code ownership is transferred directly to your team upon delivery. No monthly licensing fees or mandatory platform cuts."
  },

  // ==========================================
  // --- 3. CUSTOM WEB & MOBILE APPS BRANCH ---
  // ==========================================
  {
    section: "custom",
    keywords: ["tell me about custom web and mobile app development", "custom web & mobile apps", "custom web", "mobile app development", "full-stack"],
    answer: "We engineer custom high-performance web applications and native/cross-platform mobile apps built specifically for your business specs:\n\n• Next.js 15 & React 19 Full-Stack Web Apps\n• React Native & Flutter Mobile Apps (iOS & Android)\n• Custom Enterprise ERP & CRM Software\n• Scalable AWS Cloud Infrastructure\n\nWhat type of custom application are you planning to build?"
  },
  {
    section: "custom",
    keywords: ["tell me about custom web app development", "full-stack web app", "next.js development"],
    answer: "We architect custom, scalable, and high-performance Web Applications engineered specifically for your business model. Built using Next.js 15, React 19, Server Components, SSR for instant sub-second page loads, Node.js REST/GraphQL microservices, and PostgreSQL.\n\nEvery custom website includes mobile responsiveness, enterprise security, and Generative Engine Optimization (GEO) so your brand ranks high on Google, ChatGPT, and AI Search engines!"
  },
  {
    section: "custom",
    keywords: ["which industries do you build custom web apps for?", "which industries", "industries build web apps"],
    answer: "We build custom websites, web applications, and digital platforms for ALL major industries including:\n\n• E-Commerce & Retail Marketplaces\n• Real Estate & Property Portals\n• Healthcare, Clinics & Medical Diagnostics\n• Education, EdTech & Online Schools\n• Finance, FinTech & Banking Portals\n• Logistics, Supply Chain & Transport\n• Media, Entertainment & News Portals\n• Professional B2B/B2C Services & SaaS Companies"
  },
  {
    section: "custom",
    keywords: ["will my website rank on google, chatgpt & ai search engine optimizations?", "chatgpt search", "google search ai", "ai search ranking", "geo optimization"],
    answer: "Yes, 100%! We engineer every custom website with Generative Engine Optimization (GEO) & Schema JSON-LD Data Markup. This ensures that when users ask about your services on Google Search, Google AI Overviews, ChatGPT Search, Perplexity, or Bing AI, your website content is accurately indexed, cited, and recommended by AI engines!"
  },
  {
    section: "custom",
    keywords: ["what technologies do you use for mobile app development?", "technologies do you use for mobile", "mobile app tech stack"],
    answer: "We build native and cross-platform mobile apps using React Native and Flutter, connected to Node.js/Python microservice backends, Docker containers, and AWS Cloud infrastructure."
  },
  {
    section: "custom",
    keywords: ["tell me about custom erp & crm development", "custom erp", "custom crm"],
    answer: "We design tailored ERP/CRM systems with custom inventory tracking, HR payroll, multi-branch billing, role-based access controls, and automated PDF export reports."
  },
  {
    section: "custom",
    keywords: ["what is the typical custom web app development timeline?", "timeline", "development sprints"],
    answer: "Prebuilt SaaS launches take 1-2 weeks. Custom full-stack web and mobile apps typically take 3-5 weeks from design sprint to App Store / Cloud deployment."
  },
  {
    section: "custom",
    keywords: ["tell me about aws cloud infrastructure & hosting", "aws cloud", "cloud hosting"],
    answer: "We architect AWS EC2, S3, RDS PostgreSQL, CloudFront CDN, SSL security, automated daily backups, and auto-scaling to ensure 99.99% uptime for your app."
  },

  // =========================================================
  // --- 4. VIDEO EDITING & MEDIA PRODUCTION (ALL TYPES) ---
  // =========================================================
  {
    section: "media",
    keywords: ["tell me about video editing", "yt video editing", "video editing services", "all video editing"],
    answer: "We provide end-to-end post-production & video editing for creators, brands, and businesses across 6 specialized formats:\n\n1. YouTube Long-Form Video Editing (Podcasts, Vlogs, Documentaries)\n2. Short-Form Viral Editing (Instagram Reels, YouTube Shorts, TikTok)\n3. 2D/3D Motion Graphics & VFX Visual Effects\n4. Corporate & Brand Commercial Video Editing\n5. Multi-Cam Podcast & Interview Editing\n6. E-Commerce UGC & High-ROAS Video Ad Editing\n\nWhich type of video editing package do you need?"
  },
  {
    section: "media",
    keywords: ["tell me about youtube long-form video editing", "youtube video editing", "yt video editing", "long form editing"],
    answer: "Our YouTube Long-Form editing includes talking-head retention cuts, documentary-style B-roll insertion, animated motion graphics, Alex Hormozi style captions, sound design, and click-worthy custom YouTube thumbnails."
  },
  {
    section: "media",
    keywords: ["tell me about reel & shorts editing services", "reels editing", "shorts editing", "tiktok editing"],
    answer: "We turn raw footage into high-engagement viral Reels & Shorts using eye-catching captions, motion graphics, sound effects, dynamic cuts, and trending audio sync to maximize watch time."
  },
  {
    section: "media",
    keywords: ["tell me about motion graphics & vfx video editing", "motion graphics", "vfx video editing", "vfx editing", "visual effects"],
    answer: "We design high-end 2D/3D Motion Graphics, animated logo intros, title openers, kinetic typography, green screen compositing, object tracking, and cinematic visual effects (VFX) for commercials, YouTube videos, and social media ads."
  },
  {
    section: "media",
    keywords: ["tell me about podcast & interview video editing", "podcast editing", "interview video editing", "multi-cam editing"],
    answer: "We edit multi-camera podcast setups with automated speaker switching, studio audio noise reduction & EQ, chapter timestamps, and extract viral 60-second highlight clips for social media promotion."
  },
  {
    section: "media",
    keywords: ["tell me about corporate & brand video editing", "corporate video editing", "brand promo editing"],
    answer: "We edit professional corporate intro films, office culture tours, SaaS product walkthrough videos, event recap highlights, and customer testimonial stories with 4K color grading and custom soundtrack licensing."
  },
  {
    section: "media",
    keywords: ["tell me about e-commerce & ugc ad video editing", "ugc video editing", "ad video editing", "e-commerce video"],
    answer: "We craft high-converting Facebook, Instagram, and TikTok video ads using UGC creator hooks, fast-paced product benefit callouts, price discount graphics, and strong Call-To-Action overlays."
  },

  // ==========================================
  // --- 5. 360° DIGITAL GROWTH & MARKETING ---
  // ==========================================
  {
    section: "marketing",
    keywords: ["tell me about digital marketing", "360° digital growth & marketing", "digital marketing", "marketing"],
    answer: "We drive performance marketing growth through 5 core media and advertising services:\n\n1. 4K Cinematic Brand Video Shoots & Commercials\n2. Viral Instagram Reels & YouTube Shorts Editing\n3. High-ROAS Meta (FB/IG) & Google Paid Ad Campaigns\n4. Technical SEO & 1st-Page Google Ranking\n5. Brand Identity & Creative Design\n\nWhich growth service are you interested in?"
  },
  {
    section: "marketing",
    keywords: ["tell me about brand video shoots & commercials", "brand video shoot", "commercial video"],
    answer: "We shoot 4K cinematic brand films, corporate office tours, customer testimonial videos, and product showcase commercials with professional lighting, drone shots, and color grading."
  },
  {
    section: "marketing",
    keywords: ["how do you run meta and google ad campaigns?", "meta ads", "google ads", "paid ads"],
    answer: "We design high-converting landing pages, write persuasive copy, target high-intent audiences on Facebook, Instagram & Google Search, and optimize daily to deliver max ROAS."
  },
  {
    section: "marketing",
    keywords: ["what is included in technical seo packages?", "technical seo", "google ranking"],
    answer: "Our SEO service includes Core Web Vitals page speed optimization, schema markup, keyword architecture, Google Search Console indexing, backlink acquisition, and monthly ranking reports."
  },
  {
    section: "marketing",
    keywords: ["tell me about brand identity & graphic design", "brand identity", "graphic design"],
    answer: "We design premium logos, brand color guidelines, typography systems, social media design templates, marketing banners, and investor pitch decks."
  },

  // ==========================================
  // --- 6. PRICING & SOURCE CODE TERMS ---
  // ==========================================
  {
    section: "saas",
    keywords: ["price", "cost", "pricing", "quote", "fee"],
    answer: "We offer transparent, fixed project pricing. For all prebuilt software and custom developments, you receive **100% complete source code authority** upon payment with zero recurring licensing fees."
  }
];

export default function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ name: "", countryCode: "+91", phone: "", service: "AI & Workflow Automation" });
  const [phoneError, setPhoneError] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [likedMessages, setLikedMessages] = useState({});
  const [askedQueries, setAskedQueries] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "bot",
      text: "Hello! I'm **Ananya Sharma**, AI & Business Solutions Lead at TexWeb Solution.\nHow can I assist you today? Select a topic below or type your question!",
      followUps: [
        { label: "🤖 AI & WhatsApp Automations", query: "What AI Automations do you build?" },
        { label: "📦 Ready Prebuilt SaaS Catalog", query: "What Prebuilt SaaS platforms are ready?" },
        { label: "💻 Custom Web & Mobile Apps", query: "Tell me about Custom Web and Mobile App Development" },
        { label: "🎬 Video Editing (YouTube, Reels & Ads)", query: "Tell me about Video Editing" },
        { label: "📈 360° Digital Growth & Marketing", query: "Tell me about Digital Marketing" },
        { label: "📞 Get Free Project Quote", type: "lead" }
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showLeadForm]);

  const generateBotReply = (userQuery) => {
    const query = userQuery.toLowerCase();

    // Trigger lead capture form ONLY on explicit buying/quote intent keywords
    if (query.includes("get quote") || query.includes("request quote") || query.includes("price proposal") || query.includes("callback") || query.includes("contact team")) {
      setTimeout(() => setShowLeadForm(true), 500);
    }

    let bestMatch = null;
    let maxScore = 0;

    // Advanced Best-Match Scoring Algorithm: Exact longer keyphrase match always wins!
    for (const item of KNOWLEDGE_BASE) {
      for (const kw of item.keywords) {
        const kwLower = kw.toLowerCase();
        if (query.includes(kwLower) || kwLower.includes(query)) {
          const score = kwLower.length;
          if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
          }
        }
      }
    }

    if (bestMatch && maxScore > 0) {
      // DYNAMICALLY GENERATE FOLLOW-UPS FROM SECTION SIBLINGS!
      const sectionName = bestMatch.section || "ai";
      const siblingChips = SECTION_CHIPS[sectionName] || SECTION_CHIPS["ai"];

      return {
        answer: bestMatch.answer,
        followUps: siblingChips
      };
    }

    // Default Fallback
    return {
      answer: "I'm happy to assist you with that! TexWeb Solution provides Custom Web/Mobile Development, Prebuilt SaaS Platforms, AI & WhatsApp Automations, Video Editing, and Digital Marketing.\n\nWould you like to request a **free project quote** or submit your inquiry to our team?",
      followUps: [
        { label: "🤖 AI & WhatsApp Automations", query: "What AI Automations do you build?" },
        { label: "📦 Ready Prebuilt SaaS Catalog", query: "What Prebuilt SaaS platforms are ready?" },
        { label: "📋 Request Free Quote / Callback", type: "lead" }
      ]
    };
  };

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    // Track asked question so it is never shown again in follow-up chips
    setAskedQueries((prev) => [...prev, text.toLowerCase()]);

    const msgId = `msg-${Date.now()}`;
    const newMessages = [...messages, { id: msgId, sender: "user", text }];
    setMessages(newMessages);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    // Simulate natural Airtel-style bot response delay
    setTimeout(() => {
      setIsTyping(false);
      const replyData = generateBotReply(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "bot",
          text: replyData.answer,
          followUps: replyData.followUps || []
        }
      ]);
    }, 600);
  };

  const handleFollowUpClick = (fItem) => {
    if (fItem.type === "lead") {
      setShowLeadForm(true);
    } else if (fItem.type === "link") {
      window.open(fItem.url, "_blank", "noopener,noreferrer");
    } else if (fItem.query) {
      handleSendMessage(fItem.query);
    }
  };

  const handleLike = (msgId) => {
    setLikedMessages((prev) => ({ ...prev, [msgId]: true }));
  };

  const handlePhoneChange = (e) => {
    // Only allow numeric digits and limit to 10 digits
    const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setLeadInfo({ ...leadInfo, phone: cleaned });
    if (cleaned.length === 10) {
      setPhoneError("");
    }
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadInfo.name) return;

    // Validate exactly 10 digits
    if (!leadInfo.phone || leadInfo.phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }

    setPhoneError("");
    const formattedPhone = `${leadInfo.countryCode} ${leadInfo.phone}`;

    // Store lead in Admin Database
    addLead({
      name: leadInfo.name,
      phone: formattedPhone,
      service: leadInfo.service,
      source: "Chatbot (Ananya)",
      notes: `Inquired via Ananya Chatbot for ${leadInfo.service}.`
    });

    setLeadSubmitted(true);
    setShowLeadForm(false);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "bot",
        text: `✓ **Thank you, ${leadInfo.name}!**\nYour request has been received. Our team will reach out to you at **${formattedPhone}** shortly to discuss your ${leadInfo.service} project.`
      }
    ]);
  };

  const resetChat = () => {
    setMessages([
      {
        id: "msg-1",
        sender: "bot",
        text: "Conversation restarted. Hello! I'm **Ananya Sharma**, AI & Business Solutions Lead at TexWeb Solution.\nHow can I assist you today? Select a topic below or type your question!",
        followUps: [
          { label: "🤖 AI & WhatsApp Automations", query: "What AI Automations do you build?" },
          { label: "📦 Ready Prebuilt SaaS Catalog", query: "What Prebuilt SaaS platforms are ready?" },
          { label: "💻 Custom Web & Mobile Apps", query: "Tell me about Custom Web and Mobile App Development" },
          { label: "🎬 Video Editing (YouTube, Reels & Ads)", query: "Tell me about Video Editing" },
          { label: "📈 360° Digital Growth & Marketing", query: "Tell me about Digital Marketing" },
          { label: "📞 Get Free Project Quote", type: "lead" }
        ]
      }
    ]);
    setAskedQueries([]);
    setShowLeadForm(false);
    setLeadSubmitted(false);
  };

  return (
    <div className="font-poppins">
      
      {/* Futuristic Floating Circle Trigger Button with Ananya Photo & WhatsApp-Style Movement */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-3.5 bottom-24 z-50 sm:right-5 sm:bottom-28 md:right-6 md:bottom-32 transition-transform duration-300 hover:scale-110 active:scale-95 animate-floatingSmooth group"
        aria-label="Open Ananya AI Assistant"
      >
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-gray-950 via-red-950 to-red-600 p-0.5 shadow-2xl border border-white/20 backdrop-blur-md flex items-center justify-center">
          
          {/* Avatar Image inside Circle */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/40">
            <img src="/images/ananya_avatar.png" alt="Ananya Sharma" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>

          {/* Active Online Green Dot */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-gray-950 rounded-full shadow-md z-10" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping pointer-events-none z-0" />

          {/* Sparkles Badge Icon at bottom right */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white flex items-center justify-center shadow-lg border border-white/40 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          {/* Tooltip on hover */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-gray-950 text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:flex items-center gap-1.5">
            <span>Ask Ananya AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </button>

      {/* Airtel-Style Advanced Chatbot Window */}
      {isOpen && (
        <div 
          className="fixed inset-x-3 bottom-4 sm:right-6 sm:left-auto sm:bottom-32 z-50 w-auto sm:w-[420px] h-[540px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-scaleUp font-poppins"
          style={{ fontFamily: "Matter, sans-serif" }}
        >
          {/* Top Header Bar with Real Ananya Avatar Photo */}
          <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-red-950 text-white p-4 shrink-0 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-red-500/60 shadow-md shrink-0">
                <img src="/images/ananya_avatar.png" alt="Ananya Sharma" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-gray-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-[Matter] flex items-center gap-1.5">
                  <span>Ananya Sharma</span>
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-normal">Active Now</span>
                </h4>
                <p className="text-[11px] text-gray-300 font-poppins font-light">
                  AI & Business Solutions Lead • TexWeb Solution
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={resetChat}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 text-xs sm:text-sm">
            {messages.map((msg) => {
              // Filter out follow-ups that have already been asked by the user
              const filteredFollowUps = msg.followUps ? msg.followUps.filter((fItem) => {
                if (!fItem.query) return true;
                const qLower = fItem.query.toLowerCase();
                return !askedQueries.some((asked) => asked.includes(qLower) || qLower.includes(asked));
              }) : [];

              return (
                <div key={msg.id} className="space-y-2.5">
                  
                  {/* Main Message Bubble */}
                  <div className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 shrink-0 mt-1 shadow-xs">
                        <img src="/images/ananya_avatar.png" alt="Ananya" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-red-600 text-white rounded-br-none shadow-sm"
                          : "bg-white border border-gray-200/80 text-gray-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {formatChatMessage(msg.text)}
                    </div>
                  </div>

                  {/* AIRTEL-STYLE CONTEXTUAL FOLLOW-UP CHIPS (Shows section siblings, hiding selected ones) */}
                  {msg.sender === "bot" && filteredFollowUps.length > 0 && (
                    <div className="ml-9 pt-1 space-y-1.5 animate-fadeIn">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Next Suggested Steps:</p>
                      <div className="flex flex-col gap-1.5">
                        {filteredFollowUps.map((fItem, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleFollowUpClick(fItem)}
                            className="px-3.5 py-2 bg-white border border-gray-200 hover:border-red-500 hover:bg-red-50/50 rounded-xl text-xs text-gray-800 font-semibold flex items-center justify-between transition-all shadow-2xs group text-left"
                          >
                            <span className="group-hover:text-red-600">{fItem.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>

                      {/* Helpful Rating Line */}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-200/60 mt-2">
                        <span>Was this response helpful?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLike(msg.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                              likedMessages[msg.id] ? "bg-emerald-100 text-emerald-700 font-bold" : "hover:bg-gray-100 text-gray-600"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{likedMessages[msg.id] ? "Thank you!" : "Yes"}</span>
                          </button>
                          <button
                            onClick={() => setShowLeadForm(true)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <HelpCircle className="w-3 h-3" />
                            <span>Need Human Help</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {/* Animated Typing Dots Indicator with Ananya Avatar */}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 text-xs italic">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 shrink-0 shadow-xs">
                  <img src="/images/ananya_avatar.png" alt="Ananya" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white border border-gray-200 px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-gray-400 ml-1 font-normal font-poppins">Ananya is analyzing...</span>
                </div>
              </div>
            )}

            {/* Inline Lead Capture Form (Shows ONLY when user reaches the LAST step lead action!) */}
            {showLeadForm && !leadSubmitted && (
              <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-md font-poppins animate-fadeIn ml-9">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 mb-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>Request a Free Quote / Callback</span>
                </div>
                <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={leadInfo.name}
                    onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-red-600"
                  />
                  
                  {/* Separate Country Code Dropdown + 10-Digit Numeric Phone Input */}
                  <div className="flex gap-2">
                    <select
                      value={leadInfo.countryCode}
                      onChange={(e) => setLeadInfo({ ...leadInfo, countryCode: e.target.value })}
                      className="w-1/3 px-2 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-red-600"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10-Digit Phone Number *"
                      value={leadInfo.phone}
                      onChange={handlePhoneChange}
                      className="w-2/3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-red-600 font-mono tracking-wider"
                    />
                  </div>

                  {phoneError && (
                    <p className="text-[11px] text-red-600 font-medium pl-1">{phoneError}</p>
                  )}

                  <select
                    value={leadInfo.service}
                    onChange={(e) => setLeadInfo({ ...leadInfo, service: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-red-600 font-medium text-gray-800"
                  >
                    <option value="AI & Workflow Automation">AI & WhatsApp Automations</option>
                    <option value="Custom Web & Mobile App">Custom Web & App Dev</option>
                    <option value="Prebuilt SaaS Platform">Prebuilt SaaS Software</option>
                    <option value="Video Editing & Media">Video Editing & Media</option>
                    <option value="Digital Marketing & Ads">Digital Marketing & Ads</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-xs hover:from-red-700 hover:to-orange-700 transition-colors shadow-sm"
                  >
                    Submit Request / Request Callback
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 bg-white border-t border-gray-200 shrink-0 font-poppins">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Ananya anything about our services..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-red-500"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center shrink-0 shadow-md shadow-red-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
