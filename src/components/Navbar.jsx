"use client";

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
    if (href === "/" || href === "/#home") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinks = [
    { name: "Prebuilt", href: "/prebuilt" },
    { name: "Customized", href: "/customized" },
    { name: "AI Automation", href: "/ai-automation" },
    { name: "Digital Marketing", href: "/digital-marketing" },
    { name: "Pricing", href: "/pricing", badge: "₹999/mo" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      {/* Spacer to preserve natural layout height across all pages */}
      <div className="w-full h-[76px] sm:h-[84px] shrink-0" aria-hidden="true" />

      <header
        className={`fixed top-0 left-0 right-0 w-full flex justify-center items-center z-[100] transition-all duration-300 ease-in-out ${isScrolled ? "py-2 sm:py-3" : "py-3.5 sm:py-4.5"
          } ${isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        style={{ fontFamily: "Matter" }}
      >
        {/* Desktop Navigation */}
        <div
          className={`hidden xl:flex items-center justify-center rounded-full px-10 xl:px-14 py-2.5 border transition-all duration-300 gap-7 xl:gap-9 ${isScrolled
              ? "bg-white/95 backdrop-blur-md border-gray-200/90 shadow-lg shadow-black/5"
              : "bg-white border-gray-200 shadow-sm"
            }`}
        >
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
            href="/customized"
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

          <Link href="/#home" className="flex items-center gap-[1px] group mx-3 lg:mx-5 shrink-0">
            <img
              alt="TexWebSolution Logo"
              className="h-[40px] md:h-[48px] lg:h-[54px] w-auto rounded-xl transition-transform duration-300 group-hover:scale-105"
              src="/logo.png"
            />
            <div
              className="flex flex-col text-left justify-center ml-[-5px] md:ml-[-6px] lg:ml-[-6.5px]"
              style={{ fontFamily: "Matter" }}
            >
              <span className="text-gray-900 font-black text-xl md:text-[23px] lg:text-[26px] tracking-[-0.08em] leading-none relative z-10">
                TEXWEB
              </span>
              <span className="text-red-600 font-black text-[16px] md:text-[18.5px] lg:text-[21.5px] tracking-[-0.08em] uppercase leading-none mt-[-4px] md:mt-[-5px] lg:mt-[-6px] select-none relative z-0">
                SOLUTION
              </span>
            </div>
          </Link>

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
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${isActive("/pricing")
                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-red-50 text-red-600 border-red-200"
                }`}
            >
              ₹999/mo
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

        {/* Mobile Navigation Bar */}
        <div
          className={`flex xl:hidden w-[94%] max-w-3xl justify-between items-center px-4 sm:px-6 py-2.5 border rounded-full transition-all duration-300 z-50 ${isScrolled
              ? "bg-white/95 backdrop-blur-md border-gray-200/90 shadow-lg shadow-black/5"
              : "bg-white border-gray-200 shadow-sm"
            }`}
        >
          <Link href="/#home" className="flex items-center gap-[1px]">
            <img
              alt="TexWebSolution Logo"
              className="h-[36px] min-w-[36px] min-[375px]:h-[40px] min-[375px]:min-w-[40px] min-[425px]:h-[44px] min-[425px]:min-w-[44px] md:h-[48px] md:min-w-[48px] w-auto rounded-xl"
              src="/logo.png"
            />
            <div
              className="flex flex-col text-left justify-center ml-[-4px] min-[375px]:ml-[-4.5px] min-[425px]:ml-[-5px] md:ml-[-5.5px]"
              style={{ fontFamily: "Matter" }}
            >
              <span className="text-gray-900 font-black text-[18px] min-[375px]:text-[20px] min-[425px]:text-[22px] md:text-[24px] tracking-[-0.08em] leading-none relative z-10">
                TEXWEB
              </span>
              <span className="text-red-600 font-black text-[14.5px] min-[375px]:text-[16px] min-[425px]:text-[18px] md:text-[19.5px] tracking-[-0.08em] uppercase leading-none mt-[-3px] min-[375px]:mt-[-3.5px] min-[425px]:mt-[-4px] md:mt-[-4.5px] select-none relative z-0">
                SOLUTION
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-black focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`absolute ${isScrolled
              ? "top-[76px] min-[375px]:top-[82px] min-[425px]:top-[88px] md:top-[94px]"
              : "top-[96px] min-[375px]:top-[102px] min-[425px]:top-[108px] md:top-[114px]"
            } left-1/2 -translate-x-1/2 w-[94%] max-w-3xl bg-white/98 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl flex flex-col items-center p-4 space-y-2 xl:hidden z-40 transition-all duration-300 ease-out ${isOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            }`}
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`font-medium text-base sm:text-lg w-full text-center py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${active
                    ? "bg-red-50 text-red-600 font-bold border border-red-100 shadow-xs"
                    : "text-gray-800 hover:text-red-600 hover:bg-neutral-50"
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
      </header>
    </>
  );
}
