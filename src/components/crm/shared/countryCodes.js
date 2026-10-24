// Comprehensive country codes with flags, dial codes, and telecom validation rules
export const ALL_COUNTRY_CODES = [
  // Primary / Most Frequent Countries
  { code: "+91", country: "India", flag: "🇮🇳", label: "India (+91)" },
  { code: "+971", country: "UAE", flag: "🇦🇪", label: "UAE (+971)" },
  { code: "+1", country: "USA", flag: "🇺🇸", label: "USA (+1)" },
  { code: "+44", country: "UK", flag: "🇬🇧", label: "United Kingdom (+44)" },
  { code: "+1", country: "Canada", flag: "🇨🇦", label: "Canada (+1)" },
  { code: "+61", country: "Australia", flag: "🇦🇺", label: "Australia (+61)" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", label: "Saudi Arabia (+966)" },
  { code: "+65", country: "Singapore", flag: "🇸🇬", label: "Singapore (+65)" },
  { code: "+974", country: "Qatar", flag: "🇶🇦", label: "Qatar (+974)" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼", label: "Kuwait (+965)" },
  { code: "+968", country: "Oman", flag: "🇴🇲", label: "Oman (+968)" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭", label: "Bahrain (+973)" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", label: "Malaysia (+60)" },
  { code: "+49", country: "Germany", flag: "🇩🇪", label: "Germany (+49)" },
  { code: "+33", country: "France", flag: "🇫🇷", label: "France (+33)" },
  { code: "+39", country: "Italy", flag: "🇮🇹", label: "Italy (+39)" },
  { code: "+34", country: "Spain", flag: "🇪🇸", label: "Spain (+34)" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱", label: "Netherlands (+31)" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭", label: "Switzerland (+41)" },
  { code: "+46", country: "Sweden", flag: "🇸🇪", label: "Sweden (+46)" },
  { code: "+47", country: "Norway", flag: "🇳🇴", label: "Norway (+47)" },
  { code: "+45", country: "Denmark", flag: "🇩🇰", label: "Denmark (+45)" },
  { code: "+353", country: "Ireland", flag: "🇮🇪", label: "Ireland (+353)" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿", label: "New Zealand (+64)" },
  { code: "+27", country: "South Africa", flag: "🇿🇦", label: "South Africa (+27)" },
  { code: "+977", country: "Nepal", flag: "🇳🇵", label: "Nepal (+977)" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩", label: "Bangladesh (+880)" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", label: "Sri Lanka (+94)" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", label: "Pakistan (+92)" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", label: "Indonesia (+62)" },
  { code: "+63", country: "Philippines", flag: "🇵🇭", label: "Philippines (+63)" },
  { code: "+66", country: "Thailand", flag: "🇹🇭", label: "Thailand (+66)" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳", label: "Vietnam (+84)" },
  { code: "+81", country: "Japan", flag: "🇯🇵", label: "Japan (+81)" },
  { code: "+82", country: "South Korea", flag: "🇰🇷", label: "South Korea (+82)" },
  { code: "+86", country: "China", flag: "🇨🇳", label: "China (+86)" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰", label: "Hong Kong (+852)" },
  { code: "+886", country: "Taiwan", flag: "🇹🇼", label: "Taiwan (+886)" },
  { code: "+90", country: "Turkey", flag: "🇹🇷", label: "Turkey (+90)" },
  { code: "+20", country: "Egypt", flag: "🇪🇬", label: "Egypt (+20)" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬", label: "Nigeria (+234)" },
  { code: "+254", country: "Kenya", flag: "🇰🇪", label: "Kenya (+254)" },
  { code: "+233", country: "Ghana", flag: "🇬🇭", label: "Ghana (+233)" },
  { code: "+55", country: "Brazil", flag: "🇧🇷", label: "Brazil (+55)" },
  { code: "+52", country: "Mexico", flag: "🇲🇽", label: "Mexico (+52)" },
  { code: "+54", country: "Argentina", flag: "🇦🇷", label: "Argentina (+54)" },
  { code: "+56", country: "Chile", flag: "🇨🇱", label: "Chile (+56)" },
  { code: "+57", country: "Colombia", flag: "🇨🇴", label: "Colombia (+57)" },
  { code: "+51", country: "Peru", flag: "🇵🇪", label: "Peru (+51)" },
  { code: "+48", country: "Poland", flag: "🇵🇱", label: "Poland (+48)" },
  { code: "+351", country: "Portugal", flag: "🇵🇹", label: "Portugal (+351)" },
  { code: "+30", country: "Greece", flag: "🇬🇷", label: "Greece (+30)" },
  { code: "+43", country: "Austria", flag: "🇦🇹", label: "Austria (+43)" },
  { code: "+32", country: "Belgium", flag: "🇧🇪", label: "Belgium (+32)" },
  { code: "+420", country: "Czech Republic", flag: "🇨🇿", label: "Czech Republic (+420)" },
  { code: "+36", country: "Hungary", flag: "🇭🇺", label: "Hungary (+36)" },
  { code: "+40", country: "Romania", flag: "🇷🇴", label: "Romania (+40)" },
  { code: "+972", country: "Israel", flag: "🇮🇱", label: "Israel (+972)" },
  { code: "+962", country: "Jordan", flag: "🇯🇴", label: "Jordan (+962)" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧", label: "Lebanon (+961)" },
  { code: "+964", country: "Iraq", flag: "🇮🇶", label: "Iraq (+964)" },
  { code: "+7", country: "Russia / Kazakhstan", flag: "🇷🇺", label: "Russia / Kazakhstan (+7)" },
  { code: "+380", country: "Ukraine", flag: "🇺🇦", label: "Ukraine (+380)" },
  { code: "+358", country: "Finland", flag: "🇫🇮", label: "Finland (+358)" },
  { code: "+354", country: "Iceland", flag: "🇮🇸", label: "Iceland (+354)" },
  { code: "+212", country: "Morocco", flag: "🇲🇦", label: "Morocco (+212)" },
  { code: "+230", country: "Mauritius", flag: "🇲🇺", label: "Mauritius (+230)" },
  { code: "+975", country: "Bhutan", flag: "🇧🇹", label: "Bhutan (+975)" },
  { code: "+960", country: "Maldives", flag: "🇲🇻", label: "Maldives (+960)" },
  { code: "+other", country: "Other Country", flag: "🌐", label: "Other Country (+other)" },
];

export function validateInternationalPhone(phone, countryCode = "+91") {
  const clean = (phone || "").replace(/\D/g, "");
  const isIndia = !countryCode || countryCode === "+91";

  if (!clean) {
    return { isValid: false, message: "Please enter phone/WhatsApp number" };
  }

  if (isIndia) {
    if (clean.length < 10) {
      return { isValid: false, message: `10 digits required (${10 - clean.length} more)` };
    }
    if (clean.length > 10) {
      return { isValid: false, message: "Indian numbers must be 10 digits" };
    }
    if (!/^[6-9]/.test(clean)) {
      return { isValid: false, message: "Indian mobile must start with 6, 7, 8, or 9" };
    }
    if (/^(\d)\1{9}$/.test(clean)) {
      return { isValid: false, message: "Please enter a genuine mobile number" };
    }
    const dummyPatterns = ["1234567890", "9876543210", "0123456789", "9898989898", "9988776655"];
    if (dummyPatterns.includes(clean)) {
      return { isValid: false, message: "Please enter active number" };
    }
    return { isValid: true, message: "Valid 10 digits" };
  }

  // Non-India validation (6 to 15 digits according to E.164 standard)
  if (clean.length < 6 || clean.length > 15) {
    return { isValid: false, message: "Must be 6 to 15 digits" };
  }
  return { isValid: true, message: "Valid International Format" };
}
