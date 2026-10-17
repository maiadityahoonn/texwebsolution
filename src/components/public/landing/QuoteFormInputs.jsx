"use client";

import { User, Mail, Building2 } from "lucide-react";

export default function QuoteFormInputs({ formData, onChange }) {
  return (
    <div className="border-t border-gray-150/70 pt-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            Your Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Rahul Verma"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            Phone / WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3.5 text-xs font-bold bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-[Matter]">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="98765 43210"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            Email Address (Optional)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="name@business.com"
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition"
            />
          </div>
        </div>

        {/* City / Business */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-800 font-[Matter]">
            Business Name or City (Optional)
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Bhopal / Fitness Brand"
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition"
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-800 font-[Matter]">
          Brief Project Details or Reference Websites (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="Tell us what you want to build or share references..."
          value={formData.details}
          onChange={(e) => onChange("details", e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-sm font-poppins transition resize-none"
        />
      </div>
    </div>
  );
}
