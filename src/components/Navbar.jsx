"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Prebuilt", href: "/prebuilt" },
    { name: "Customized", href: "/customized" },
    { name: "AI Automation", href: "/ai-automation" },
    { name: "Digital Marketing", href: "/digital-marketing" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="relative flex justify-center items-center py-6 bg-transparent z-50" style={{ fontFamily: "Matter" }}>
      {/* Desktop Navigation */}
      <div className="hidden xl:flex items-center justify-center rounded-full px-8 py-2.5 border border-gray-200 bg-white shadow-sm gap-6">
        <Link href="/prebuilt" className="text-gray-900 hover:text-red-600 font-semibold text-[14px] lg:text-[15px] transition-colors whitespace-nowrap">
          Prebuilt
        </Link>
        <Link href="/customized" className="text-gray-900 hover:text-red-600 font-semibold text-[14px] lg:text-[15px] transition-colors whitespace-nowrap">
          Customized
        </Link>
        <Link href="/ai-automation" className="text-gray-900 hover:text-red-600 font-semibold text-[14px] lg:text-[15px] transition-colors whitespace-nowrap">
          AI Automation
        </Link>

        <Link href="/#home" className="flex items-center gap-[1px] group mx-2 lg:mx-4 shrink-0">
          <img alt="TexWebSolution Logo" className="h-[46px] md:h-[60px] lg:h-[72px] w-auto rounded-xl transition-transform duration-300 group-hover:scale-105" src="/logo.png" />
          <div className="flex flex-col text-left justify-center ml-[-6px] md:ml-[-7px] lg:ml-[-8px]" style={{ fontFamily: "Matter" }}>
            <span className="text-gray-900 font-black text-2xl md:text-[28px] lg:text-[34px] tracking-[-0.08em] leading-none relative z-10">TEXWEB</span>
            <span className="text-red-600 font-black text-[20px] md:text-[23px] lg:text-[28.5px] tracking-[-0.08em] uppercase leading-none mt-[-5px] md:mt-[-6px] lg:mt-[-8px] select-none relative z-0">SOLUTION</span>
          </div>
        </Link>

        <Link href="/digital-marketing" className="text-gray-900 hover:text-red-600 font-semibold text-[14px] lg:text-[15px] transition-colors whitespace-nowrap">
          Digital Marketing
        </Link>
        <Link href="/about-us" className="text-gray-900 hover:text-red-600 font-semibold text-[14px] lg:text-[15px] transition-colors whitespace-nowrap">
          About Us
        </Link>
        <Link href="/contact" className="text-gray-900 hover:text-red-600 font-semibold text-[14px] lg:text-[15px] transition-colors whitespace-nowrap">
          Contact Us
        </Link>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex xl:hidden w-[94%] max-w-3xl justify-between items-center px-4 sm:px-6 py-3 border border-gray-200 rounded-full bg-white z-50 shadow-sm">
        <Link href="/#home" className="flex items-center gap-[1px]">
          <img alt="TexWebSolution Logo" className="h-[42px] min-w-[42px] min-[375px]:h-[48px] min-[375px]:min-w-[48px] min-[425px]:h-[54px] min-[425px]:min-w-[54px] md:h-[60px] md:min-w-[60px] w-auto rounded-xl" src="/logo.png" />
          <div className="flex flex-col text-left justify-center ml-[-4px] min-[375px]:ml-[-5px] min-[425px]:ml-[-6px] md:ml-[-7px]" style={{ fontFamily: "Matter" }}>
            <span className="text-gray-900 font-black text-[20px] min-[375px]:text-[22px] min-[425px]:text-[25px] md:text-[28px] tracking-[-0.08em] leading-none relative z-10">TEXWEB</span>
            <span className="text-red-600 font-black text-[16px] min-[375px]:text-[18px] min-[425px]:text-[20.5px] md:text-[23px] tracking-[-0.08em] uppercase leading-none mt-[-3.5px] min-[375px]:mt-[-4.5px] min-[425px]:mt-[-5.5px] md:mt-[-6px] select-none relative z-0">SOLUTION</span>
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
        className={`absolute top-[96px] min-[375px]:top-[102px] min-[425px]:top-[108px] md:top-[114px] left-1/2 -translate-x-1/2 w-[94%] max-w-3xl bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center py-6 space-y-6 xl:hidden z-40 transition-all duration-300 ease-out ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
          }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="text-gray-900 hover:text-red-600 font-medium text-lg w-full text-center py-2 transition-colors"
          >
            {link.name}
          </Link>
        ))}
   