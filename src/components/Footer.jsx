"use client";

import Link from "next/link";

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Subscribed successfully!");
  };

  return (
    <footer className="relative border-t border-gray-200 overflow-hidden w-full bg-cover bg-center" style={{ fontFamily: "Matter" }}>
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
          {/* Newsletter / Contact Section */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-3">Contact us at</h3>
              <div className="space-y-2 text-sm sm:text-base font-semibold text-gray-800">
                <p>
                  <a href="mailto:info@texwebsolution.in" className="hover:text-red-600 transition-colors">
                    info@texwebsolution.in
                  </a>
                </p>
                <p>
                  <a href="https://wa.me/+917462827259" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">
                    +91 7462827259 (WhatsApp)
                  </a>
                </p>
              </div>
            </div>

            <form className="relative w-full max-w-lg" onSubmit={handleSubscribe}>
              <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center bg-white rounded-3xl min-[420px]:rounded-full shadow-md overflow-hidden border border-gray-100 p-1">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full min-w-0 pl-4 pr-2 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none md:px-7 md:py-4"
                  required
                />
                <button
                  type="submit"
                  className="w-full min-[420px]:w-auto bg-red-600 text-white px-5 py-3 rounded-full hover:bg-red-700 transition-colors shrink-0 text-sm md:px-8 shadow-sm shadow-red-600/10"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Links Grid */}
          <div className="lg:col-span-2 flex justify-start lg:justify-end">
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-8 sm:gap-16 text-left min-[420px]:text-right">
              <div>
                <h4 className="text-gray-400 text-base font-medium mb-4">Links</h4>
                <nav className="space-y-3">
                  {[
                    { name: "Home", href: "/" },
                    { name: "Prebuilt", href: "/prebuilt" },
                    { name: "Customized", href: "/customized" },
                    { name: "AI Automation", href: "/ai-automation" },
                    { name: "Digital Marketing", href: "/digital-marketing" },
                    { name: "About Us", href: "/about-us" },
                    { name: "Contact", href: "/contact" }
                  ].map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div>
                <h4 className="text-gray-400 text-base font-medium mb-4">More Resources</h4>
                <nav className="space-y-3">
                  {[
                    { name: "Terms & Conditions", href: "/terms" },
                    { name: "Privacy Policy", href: "/privacy" },
                    { name: "Refund Policy", href: "/refund" }
                  ].map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <a
                    href="https://internshipcatalyst.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Internship Catalyst ↗
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large watermark typography at the bottom */}
      <div className="w-full flex justify-center pb-2 overflow-hidden px-4">
        <svg viewBox="65 0 1070 120" width="100%" height="auto" className="select-none pointer-events-none">
          <defs>
            <linearGradient id="watermark-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(229, 231, 235, 0.9)" />
              <stop offset="100%" stopColor="rgba(229, 231, 235, 0.1)" />
            </linearGradient>
          </defs>
          <text 
            x="600" 
            y="95" 
            textAnchor="middle" 
            fill="url(#watermark-grad)" 
            fontWeight="900" 
            fontSize="104"
            fontFamily="Matter, sans-serif"
            letterSpacing="1"
          >
            TEXWEB SOLUTION
          </text>
        </svg>
      </div>

      {/* Bottom Bar for Copyright and CIN */}
      <div className="border-t border-gray-150/65 w-full py-6 text-center text-xs text-gray-500 bg-gray-50/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-poppins font-light">
            © 2026 TexWeb Solution Pvt. Ltd. All rights reserved.
          </p>
          <p className="font-mono text-gray-400">
            CIN: U85500WB2026PTC287896
          </p>
        </div>
      </div>
    </footer>
  );
}
