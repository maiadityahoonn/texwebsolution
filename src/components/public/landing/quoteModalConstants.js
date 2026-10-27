import { DYNAMIC_SERVICE_CONFIGS } from "./serviceConfigs";
export { DYNAMIC_SERVICE_CONFIGS };

export const COUNTRY_CODES = [
  { code: "+91", country: "India", label: "India (+91)", flag: "🇮🇳" },
  { code: "+971", country: "UAE", label: "UAE (+971)", flag: "🇦🇪" },
  { code: "+1", country: "USA / Canada", label: "USA/Canada (+1)", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", label: "UK (+44)", flag: "🇬🇧" },
  { code: "+966", country: "Saudi Arabia", label: "Saudi Arabia (+966)", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", label: "Qatar (+974)", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", label: "Kuwait (+965)", flag: "🇰🇼" },
  { code: "+968", country: "Oman", label: "Oman (+968)", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", label: "Bahrain (+973)", flag: "🇧🇭" },
  { code: "+65", country: "Singapore", label: "Singapore (+65)", flag: "🇸🇬" },
  { code: "+61", country: "Australia", label: "Australia (+61)", flag: "🇦🇺" },
  { code: "+49", country: "Germany", label: "Germany (+49)", flag: "🇩🇪" },
  { code: "+977", country: "Nepal", label: "Nepal (+977)", flag: "🇳🇵" },
  { code: "+880", country: "Bangladesh", label: "Bangladesh (+880)", flag: "🇧🇩" },
  { code: "+60", country: "Malaysia", label: "Malaysia (+60)", flag: "🇲🇾" },
  { code: "+other", country: "Other Country", label: "Other Country", flag: "🌐" }
];

/**
 * Validates phone number based on country code with strict Indian telecom formatting & dummy filters.
 */
export function validatePhoneNumber(phone, countryCode = "+91") {
  const clean = (phone || "").replace(/\D/g, "");
  const isIndia = !countryCode || countryCode === "+91";

  if (!clean) {
    return { isValid: false, message: "Please enter your WhatsApp/mobile number" };
  }

  if (isIndia) {
    if (clean.length < 10) {
      return { isValid: false, message: `10 digits required (${10 - clean.length} more needed)` };
    }
    if (clean.length > 10) {
      return { isValid: false, message: "Indian mobile numbers must be 10 digits" };
    }
    // Indian mobile numbers strictly start with 6, 7, 8, or 9
    if (!/^[6-9]/.test(clean)) {
      return { isValid: false, message: "Indian numbers must start with 6, 7, 8, or 9" };
    }
    // Repeating digits check (0000000000, 1111111111, 9999999999, etc.)
    if (/^(\d)\1{9}$/.test(clean)) {
      return { isValid: false, message: "Please enter a genuine, active mobile number" };
    }
    // Common fake number patterns
    const dummyPatterns = ["1234567890", "9876543210", "0123456789", "9898989898", "9988776655", "9123456789"];
    if (dummyPatterns.includes(clean)) {
      return { isValid: false, message: "Please enter your real WhatsApp number" };
    }
    return { isValid: true, message: "Valid mobile number" };
  }

  // Non-India validation (7 to 15 digits according to E.164 standard)
  if (clean.length < 7 || clean.length > 15) {
    return { isValid: false, message: "Please enter a valid 7 to 15-digit number" };
  }
  return { isValid: true, message: "Valid mobile number" };
}

/**
 * What type of business do you run?
 */
export const BUSINESS_TYPE_OPTIONS = [
  { id: "retail", title: "Retail Shop, Showroom & Products", icon: "ShoppingCart", sub: "Clothing, Electronics, Grocery ya Consumer Products" },
  { id: "healthcare", title: "Doctor, Clinic & Healthcare", icon: "Stethoscope", sub: "Dental, Eye, Clinic, Pharmacy ya Hospital" },
  { id: "manufacturing", title: "Manufacturing, Factory & Wholesale", icon: "Factory", sub: "Production, B2B Supplies & Industrial Goods" },
  { id: "education", title: "School, College & Coaching", icon: "GraduationCap", sub: "Classes, Academy, College ya Competition Coaching" },
  { id: "realestate", title: "Real Estate, Builder & Construction", icon: "Building", sub: "Flats, Plots, Township ya Architecture Interior" },
  { id: "food", title: "Restaurant, Cafe & Food", icon: "Coffee", sub: "Dining, Bakery, Sweet Shop ya Cloud Kitchen" },
  { id: "services", title: "Professional Services & Agency", icon: "Briefcase", sub: "CA, Legal, Travel, Security ya Consultant Agency" },
  { id: "startup", title: "Tech Startup / Online Brand", icon: "Rocket", sub: "Mobile App, SaaS Portal ya D2C Online Brand" },
  { id: "other", title: "Other / Custom Business", icon: "Sparkles", sub: "Meri business category alag hai ya naya concept hai" }
];

/**
 * What do you need? (TexWeb Solution's Core Official Services)
 */
export const TEXWEB_SERVICES = [
  {
    key: "Website Development",
    title: "Website Development",
    sub: "Custom Business Sites, Portals & Fast Landing Pages",
    badge: "⚡ 7-10 Days",
    icon: "Globe"
  },
  {
    key: "App Development (iOS/Android)",
    title: "Mobile App Development",
    sub: "Android & iOS Native or Hybrid Mobile Apps",
    badge: "📱 Mobile Live",
    icon: "Smartphone"
  },
  {
    key: "Website Redesign",
    title: "Website Redesign",
    sub: "Modern UI/UX Revamp, Mobile Speed & Conversion Fix",
    badge: "🚀 Speed Revamp",
    icon: "RefreshCw"
  },
  {
    key: "E-Commerce + Meta Ads",
    title: "E-Commerce + Meta Ads",
    sub: "Online Store Setup + High-Converting Ads for Sales",
    badge: "🔥 High Sales",
    icon: "ShoppingBag"
  },
  {
    key: "Meta Ads & Digital Marketing",
    title: "Meta Ads & Marketing",
    sub: "Targeted Instagram & Facebook Ads for Verified Leads",
    badge: "🎯 High ROAS",
    icon: "TrendingUp"
  },
  {
    key: "AI Chatbot & Automation",
    title: "AI Chatbot & Automation",
    sub: "WhatsApp 24/7 Smart Auto-Reply & Business Workflows",
    badge: "🤖 24/7 Bot",
    icon: "Bot"
  },
  {
    key: "ERP, CRM & Business Systems",
    title: "ERP, CRM & Software",
    sub: "Custom Lead Pipelines, Staff Attendance & Billing",
    badge: "🏢 Enterprise",
    icon: "Layers"
  },
  {
    key: "Other / Custom Software Requirement",
    title: "Other / Custom Software",
    sub: "Custom Tech Architecture, SaaS Portal or Unique Idea",
    badge: "✨ Custom Idea",
    icon: "Sparkles"
  }
];

/**
 * Expected Project Budget (Dynamic per service helper)
 */

export function getBudgetsForService(serviceKey) {
  const normalizedKey = serviceKey in DYNAMIC_SERVICE_CONFIGS ? serviceKey : "Website Development";
  const cfg = DYNAMIC_SERVICE_CONFIGS[normalizedKey];
  const list = cfg?.budgets || [];
  return [
    ...list,
    { amount: "Flexible", desc: "Need Advice / Discuss Scope" }
  ];
}

export const BUDGET_OPTIONS = [
  { id: "under_25k", label: "Under ₹25,000", sub: "Starter / Basic" },
  { id: "25k_50k", label: "₹25,000 - ₹50,000", sub: "Standard Business" },
  { id: "50k_1lakh", label: "₹50,000 - ₹1,00,000", sub: "Advanced / Custom" },
  { id: "above_1lakh", label: "₹1,00,000+", sub: "Scalable Platform" },
  { id: "flexible", label: "Flexible", sub: "Need Advice" }
];

/**
 * Target Project Timeline
 */
export const TIMELINE_OPTIONS = [
  { id: "urgent", label: "⚡ Urgent (2 - 7 Days)", desc: "Immediate start & rapid deployment" },
  { id: "weeks", label: "🚀 2 - 3 Weeks", desc: "Optimal pace for quality & testing" },
  { id: "month", label: "📅 Within 1 Month", desc: "Planned launch with phased rollout" },
  { id: "exploring", label: "💡 Exploring / Planning Stage", desc: "Need architecture & scope guidance" }
];

/**
 * Builds formatted WhatsApp Quote direct-chat URL with all lead inputs.
 */
export function buildWhatsAppQuoteUrl(formData) {
  const name = (formData.name || "").trim();
  const phone = `${formData.country_code || "+91"} ${(formData.phone || "").replace(/\D/g, "")}`.trim();
  const businessName = (formData.business_name || "").trim() || "Not Specified";
  const businessType = formData.business_type || "General Business";
  const service = formData.service || "Tech Development";
  const budget = formData.budget || "Flexible";
  const timeline = formData.timeline || "Exploring";

  const lines = [
    "Hi TexWeb Solution, I want a project quote & architecture roadmap!",
    "",
    `👤 *Name:* ${name}`,
    `📱 *WhatsApp:* ${phone}`,
    `🏢 *Business Name:* ${businessName}`,
    `🏷️ *Business Type:* ${businessType}`,
    `💻 *What I Need (Service):* ${service}`,
    `💰 *Expected Budget:* ${budget}`,
    `⏱️ *Target Timeline:* ${timeline}`,
    "",
    "Please share the project scope, timeline, and cost estimate. Thanks!"
  ];

  return `https://wa.me/+917462827259?text=${encodeURIComponent(lines.join("\n"))}`;
}

// Backward-compatible exports
export const SERVICES_CONFIG = TEXWEB_SERVICES.map((s) => ({
  key: s.key,
  label: s.title,
  sub: s.sub,
  icon: s.icon
}));

export const DESCRIBES_YOU_OPTIONS = BUSINESS_TYPE_OPTIONS.map((b) => ({
  title: b.title,
  sub: b.sub,
  icon: b.icon
}));

export const INDIAN_STATES = [
  "Madhya Pradesh",
  "Maharashtra",
  "Delhi NCR",
  "Uttar Pradesh",
  "Gujarat",
  "Rajasthan",
  "Karnataka",
  "Bihar",
  "Chhattisgarh",
  "Punjab & Haryana",
  "West Bengal",
  "Tamil Nadu",
  "Telangana",
  "Jharkhand",
  "Odisha",
  "Kerala",
  "Andhra Pradesh",
  "Uttarakhand",
  "Assam & North East",
  "Goa",
  "Himachal Pradesh",
  "Other State / Outside India"
];
