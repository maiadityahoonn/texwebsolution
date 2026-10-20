"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if page is scrolled
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // At top of page: always visible
      if (currentScrollY <= 20) {
        setIsVisible(true);
      }
      // If mobile dropdown menu is open, don't hide
      else if (isOpen) {
        setIsVisible(true);
      }
      // Scrolling down: hide smoothly
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }
      // Scrolling up (mouse wheel or swipe): reveal immediately
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    // If mouse hovers near the top edge of screen, reveal navbar
    const onMouseMove = (e) => {
      if (e.clientY <= 60) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isOpen]);

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/" || href === "/home") {
      return pathname === "/" || pathname === "/home";
    }
    if (href === "/customized" || href === "/customized/websites") {
      return pathname.startsWith("/customized");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinks = [
    { name: "Prebuilt", href: "/prebuilt" },
    { name: "Customized", href: "/customized/websites" },
    { name: "AI Automation", href: "/ai-automation" },
    { name: "Digital Marketing", href: "/digital-marketing" },
    { name: "Pricing", href: "/pricing", badge: "₹1,999/mo" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      {/* Dynamic Spacer to preserve natural layout height with zero overlapping */}
      <div 
        className="w-full shrink-0 transition-all duration-300 h-[70px] sm:h-[79px] xl:h-[96px]" 
        aria-hidden="true" 
      />

      <header
        className={`fixed top-0 left-0 right-0 w-full flex flex-col items-center justify-center z-[100] transition-all duration-300 ease-in-out ${
          isScrolled ? "py-1.5 sm:py-2.5" : "py-2 sm:py-3.5"
        } ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ fontFamily: "Matter" }}
      >

        {/* Desktop Navigation with Perfectly Centered Logo & Evenly Distributed Sides */}
        <div
          className={`hidden xl:grid grid-cols-[1fr_auto_1fr] items-center rounded-full px-8 xl:px-12 py-3.5 xl:py-4 border transition-all duration-300 w-max max-w-[95vw] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.08)] ${
            isScrolled
              ? "bg-white/95 backdrop-blur-md border-gray-200/90 shadow-lg shadow-black/5"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          {/* Left 3 Items (Evenly Distributed across Left Half) */}
          <div className="flex items-center justify-between gap-6 xl:gap-8 pr-2">
            <Link
              href="/prebuilt"
              className={`font-semibold text-[14.5px] lg:text-[15px] transition-colors whitespace-nowrap ${isActive("/prebuilt")
                  ? "text-red-600 font-bold"
                  : "text-gray-800 hover:text-red-600"
                }`}
            >
              Prebuilt
            </Link>
            <Link
              href="/customized/websites"
              className={`font-semibold text-[14.5px] lg:text-[15px] transition-colors whitespace-nowrap ${isActive("/customized")
                  ? "text-red-600 font-bold"
                  : "text-gray-800 hover:text-red-600"
                }`}
            >
              Customized
            </Link>
            <Link
              href="/ai-automation"
              className={`font-semibold text-[14.5px] lg:text-[15px] transition-colors whitespace-nowrap ${isActive("/ai-automation")
                  ? "text-red-600 font-bold"
                  : "text-gray-800 hover:text-red-600"
                }`}
            >
              AI Automation
            </Link>
          </div>

          {/* Center Column: 100% Dead Center Logo */}
          <div className="flex items-center justify-center px-6 xl:px-8 shrink-0">
            <Link href="/" className="flex items-center group shrink-0">
              <Image
                width={185}
                height={52}
                alt="TexWeb Solution"
                className="h-[42px] md:h-[46px] lg:h-[50px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-full-logo-original.png"
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          {/* Right 3 Items (Evenly Distributed across Right Half) */}
          <div className="flex items-center justify-between gap-6 xl:gap-8 pl-2">
            <Link
              href="/digital-marketing"
              className={`font-semibold text-[14.5px] lg:text-[15px] transition-colors whitespace-nowrap ${isActive("/digital-marketing")
                  ? "text-red-600 font-bold"
                  : "text-gray-800 hover:text-red-600"
                }`}
            >
              Digital Marketing
            </Link>
            <Link
              href="/pricing"
              className={`relative font-semibold text-[14.5px] lg:text-[15px] transition-colors whitespace-nowrap flex items-center gap-1.5 ${isActive("/pricing")
                  ? "text-red-600 font-bold"
                  : "text-gray-800 hover:text-red-600"
                }`}
            >
              <span>Pricing</span>
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border transition-colors ${isActive("/pricing")
                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                    : "bg-red-50 text-red-600 border-red-200"
                  }`}
              >
                ₹1,999/mo
              </span>
            </Link>
            <Link
              href="/contact"
              className={`font-semibold text-[14.5px] lg:text-[15px] transition-colors whitespace-nowrap ${isActive("/contact")
                  ? "text-red-600 font-bold"
                  : "text-gray-800 hover:text-red-600"
                }`}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Wrapper */}
        <div className="relative xl:hidden w-[94%] max-w-3xl">
          {/* Mobile Navigation Bar */}
          <div
            className={`flex w-full justify-between items-center px-3 min-[360px]:px-4 sm:px-6 py-2 min-[360px]:py-2.5 border rounded-full transition-all duration-300 z-50 ${isScrolled
                ? "bg-white/95 backdrop-blur-md border-gray-200/90 shadow-lg shadow-black/5"
                : "bg-white border-gray-200 shadow-sm"
              }`}
          >
            <Link href="/home" className="flex items-center shrink-0">
              <Image
                width={140}
                height={40}
                alt="TexWeb Solution"
                className="h-[28px] min-[360px]:h-[32px] min-[375px]:h-[36px] min-[425px]:h-[40px] md:h-[44px] w-auto object-contain"
                src="https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/texweb-full-logo-original.png"
                style={{ width: "auto" }}
                priority
              />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-black focus:outline-none p-1 transition-transform duration-300 active:scale-90"
              aria-label="Toggle menu"
            >
              <div className="transition-transform duration-300 ease-out transform">
                {isOpen ? <X size={24} className="rotate-90 transition-transform duration-300" /> : <Menu size={24} />}
              </div>
            </button>
          </div>

          {/* Mobile Dropdown Menu with snug spacing and slick animation */}
          <div
            className={`absolute top-full mt-2 left-0 right-0 w-full bg-white/98 backdrop-blur-xl border border-gray-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/5 flex flex-col items-center p-3 sm:p-4 space-y-1.5 z-40 transition-all duration-300 ease-out origin-top ${isOpen
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 -translate-y-3 scale-95 pointer-events-none"
              }`}
          >
            {navLinks.map((link, idx) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    transitionDelay: isOpen ? `${idx * 40}ms` : "0ms",
                  }}
                  className={`font-medium text-base sm:text-lg w-full text-center py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 transform ${
                    isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  } ${active
                      ? "bg-red-50 text-red-600 font-bold border border-red-100 shadow-xs"
                      : "text-gray-800 hover:text-red-600 hover:bg-neutral-50 active:bg-neutral-100"
                    }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-colors ${active
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-red-50 text-red-600 border-red-200"
                        }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
}
