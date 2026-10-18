export { DYNAMIC_SERVICE_CONFIGS } from "./serviceConfigs";

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

export const DESCRIBES_YOU_OPTIONS = [
  {
    title: "Business Owner / Dukaandar",
    sub: "Apna Retail, Shop ya Business Run Karta Hoon",
    icon: "Briefcase"
  },
  {
    title: "Factory / Manufacturer / Wholesaler",
    sub: "B2B Production, Supply ya Bulk Wholesale",
    icon: "Factory"
  },
  {
    title: "Startup Founder / Entrepreneur",
    sub: "Naya Business ya Tech Platform Shuru Kar Raha Hoon",
    icon: "Rocket"
  },
  {
    title: "Doctor / Clinic / Hospital Director",
    sub: "Healthcare Clinic, Patient OPD ya Hospital Management",
    icon: "Stethoscope"
  },
  {
    title: "School / Coaching Director",
    sub: "Student Admissions, Online Classes ya Fees Management",
    icon: "GraduationCap"
  },
  {
    title: "Online Brand / D2C Seller",
    sub: "Website ya Social Media par Product Selling",
    icon: "ShoppingBag"
  },
  {
    title: "Service Contractor / Agency Owner",
    sub: "Consulting, Real Estate, Repair ya Professional Service",
    icon: "Wrench"
  },
  {
    title: "Marketing / Sales Manager",
    sub: "Company ke liye Website, App ya Ads Lead Generation",
    icon: "Users"
  },
  {
    title: "Other / Individual Profile",
    sub: "Freelancer, Consultant, Creator ya Any Other Professional",
    icon: "Users"
  }
];

export const BUSINESS_TYPE_OPTIONS = [
  {
    title: "Retail Shop, Showroom & Products",
    sub: "Clothing, Electronics, Grocery ya Consumer Products",
    icon: "ShoppingCart"
  },
  {
    title: "Manufacturing, Factory & Wholesale",
    sub: "Production, B2B Supplies & Industrial Goods",
    icon: "Factory"
  },
  {
    title: "Doctor, Clinic & Healthcare",
    sub: "Dental, Eye, Clinic, Pharmacy ya Hospital",
    icon: "Stethoscope"
  },
  {
    title: "School, College & Coaching Institute",
    sub: "Classes, Academy, College ya Competition Coaching",
    icon: "GraduationCap"
  },
  {
    title: "Real Estate, Builders & Construction",
    sub: "Flats, Plots, Township ya Architecture Interior",
    icon: "Building"
  },
  {
    title: "Restaurant, Cafe, Food & Grocery",
    sub: "Dining, Bakery, Sweet Shop ya Cloud Kitchen",
    icon: "Coffee"
  },
  {
    title: "Professional Services & Agency",
    sub: "CA, Legal, Travel, Security ya Consultant Agency",
    icon: "Briefcase"
  },
  {
    title: "Logistics, Transport & Fleet",
    sub: "Trucking, Courier, Transport ya Vehicle Fleet",
    icon: "Truck"
  },
  {
    title: "Tech Startup / New Online Idea",
    sub: "Mobile App, SaaS Portal ya On-Demand Service Idea",
    icon: "Lightbulb"
  },
  {
    title: "Other Business / Emerging Industry",
    sub: "Meri business category alag hai ya naya concept/idea hai",
    icon: "Sparkles"
  }
];

export const TIMELINE_OPTIONS = [
  {
    id: "immediately",
    label: "Immediately",
    sub: "Next 2 - 7 Days (Urgent)",
    icon: "Zap"
  },
  {
    id: "2_3_weeks",
    label: "In 2 - 3 Weeks",
    sub: "Isi Mahine Shuru Karna Hai",
    icon: "Rocket"
  },
  {
    id: "1_month",
    label: "In Next 1 Month",
    sub: "Planning Stage",
    icon: "Calendar"
  },
  {
    id: "just_inquiring",
    label: "Just Inquiring",
    sub: "Pehle Price & Advice Chahiye",
    icon: "HelpCircle"
  }
];

export const SERVICES_CONFIG = [
  { 
    key: "Website Development", 
    label: "Website Development", 
    sub: "Nayi Business ya Brand Website Banwani Hai",
    icon: "Globe" 
  },
  { 
    key: "Website Redesign", 
    label: "Website Redesign", 
    sub: "Purani Website ko Fast & Modern Look Dena Hai",
    icon: "RefreshCw" 
  },
  { 
    key: "App Development (iOS/Android)", 
    label: "Mobile App Development", 
    sub: "Android & iOS Mobile Application Banwani Hai",
    icon: "Smartphone" 
  },
  { 
    key: "E-Commerce + Meta Ads", 
    label: "E-Commerce + Meta Ads", 
    sub: "Online Store Launch + Pehle Din se Sales Setup",
    icon: "ShoppingBag" 
  },
  { 
    key: "Meta Ads & Digital Marketing", 
    label: "Meta Ads & Marketing", 
    sub: "Instagram & Facebook Ads se Leads/Orders Chahiye",
    icon: "TrendingUp" 
  },
  { 
    key: "AI Chatbot & Automation", 
    label: "AI Chatbot & Automation", 
    sub: "WhatsApp 24/7 Auto-Reply & Smart Automation",
    icon: "Bot" 
  },
  { 
    key: "ERP, CRM & Business Systems", 
    label: "ERP, CRM & Software", 
    sub: "Lead Management, Staff Haziri & Billing System",
    icon: "Layers" 
  },
  { 
    key: "Other / Custom Software Requirement", 
    label: "Other / Custom Software", 
    sub: "Naya Unique Idea, Custom Software ya Koi Aur Tech Kaam",
    icon: "Sparkles" 
  }
];
