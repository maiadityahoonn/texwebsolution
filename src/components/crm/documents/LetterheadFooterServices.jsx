"use client";

import { useRef, useState } from "react";
import {
  Smartphone,
  ShoppingCart,
  TrendingUp,
  Users2,
  Cpu,
  Code2,
  Upload,
  RotateCcw,
} from "lucide-react";
import LetterheadElementWrapper from "./LetterheadElementWrapper";

const DEFAULT_SERVICES = [
  { id: "web", title: "Website", subtitle: "Development", icon: "code" },
  { id: "mobile", title: "Mobile App", subtitle: "Development", icon: "mobile" },
  { id: "ecommerce", title: "E-commerce", subtitle: "Solutions", icon: "ecommerce" },
  { id: "marketing", title: "Digital", subtitle: "Marketing", icon: "marketing" },
  { id: "smm", title: "SMM", subtitle: "(Social Media)", icon: "smm" },
  { id: "ai", title: "AI &", subtitle: "Automation", icon: "ai" },
];

/**
 * Interactive Footer Services Bar with Custom PNG Icon Replacement
 * - Allows replacing each service icon with a custom PNG/SVG icon
 * - Allows inline text editing for services
 * - Canva transform handles (move, resize, rotate, align)
 */
export default function LetterheadFooterServices({
  footerServicesConfig = {},
  updateFooterServices = () => {},
  selectedBlockId = "",
  setSelectedBlockId = () => {},
  startMove,
  startResize,
  startRotate,
  zoom = 1,
  font = "Inter",
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const fileInputRefs = useRef({});

  const services = footerServicesConfig.services && footerServicesConfig.services.length > 0
    ? footerServicesConfig.services
    : DEFAULT_SERVICES.map((s) => ({
        ...s,
        customIconUrl: footerServicesConfig[`${s.id}IconUrl`] || null,
      }));

  function handleUpdateService(index, updates) {
    const nextServices = [...services];
    nextServices[index] = { ...nextServices[index], ...updates };
    updateFooterServices({ services: nextServices });
  }

  function handleIconUpload(index, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleUpdateService(index, { customIconUrl: e.target?.result });
    };
    reader.readAsDataURL(file);
  }

  function handleResetIcon(index) {
    handleUpdateService(index, { customIconUrl: null });
  }

  function renderServiceIcon(service) {
    if (service.customIconUrl) {
      return (
        <img
          src={service.customIconUrl}
          alt={service.title}
          crossOrigin="anonymous"
          className="w-3.5 h-3.5 object-contain shrink-0"
        />
      );
    }

    switch (service.icon) {
      case "code":
        return <span className="text-[#E11D2A] font-black text-[12px] leading-none shrink-0 pointer-events-none">&lt;/&gt;</span>;
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5 text-[#E11D2A] stroke-[2.5] shrink-0 pointer-events-none" />;
      case "ecommerce":
        return <ShoppingCart className="w-3.5 h-3.5 text-[#E11D2A] stroke-[2.5] shrink-0 pointer-events-none" />;
      case "marketing":
        return <TrendingUp className="w-3.5 h-3.5 text-[#E11D2A] stroke-[2.5] shrink-0 pointer-events-none" />;
      case "smm":
        return <Users2 className="w-3.5 h-3.5 text-[#E11D2A] stroke-[2.5] shrink-0 pointer-events-none" />;
      case "ai":
      default:
        return <Cpu className="w-3.5 h-3.5 text-[#E11D2A] stroke-[2.5] shrink-0 pointer-events-none" />;
    }
  }

  return (
    <LetterheadElementWrapper
      id="letterhead-footer-services"
      elementTitle="Footer Services"
      transformData={footerServicesConfig}
      isSelected={selectedBlockId === "letterhead-footer-services"}
      onSelect={() => setSelectedBlockId("letterhead-footer-services")}
      onUpdate={(updates) => updateFooterServices(updates)}
      startMove={startMove}
      startResize={startResize}
      startRotate={startRotate}
      zoom={zoom}
      isText={true}
      isEditingText={isEditingText && selectedBlockId === "letterhead-footer-services"}
      onToggleEditText={() => setIsEditingText((p) => !p)}
    >
      <div
        className="flex items-center gap-3 text-[8.5px] font-semibold text-slate-200 shrink-0"
        style={{
          fontFamily: footerServicesConfig.fontFamily || font || undefined,
        }}
      >
        {services.map((service, index) => (
          <div key={service.id || index} className="flex items-center gap-1.5 group/service relative">
            {/* Click to Replace Icon with Custom PNG */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRefs.current[index]?.click();
                }}
                className="p-0.5 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer transition relative group/icon"
                title="Click to replace service icon with custom PNG"
              >
                {renderServiceIcon(service)}
                {/* Upload overlay hover indicator */}
                <span className="absolute inset-0 bg-black/70 rounded items-center justify-center text-white hidden group-hover/icon:flex print:hidden">
                  <Upload className="w-2.5 h-2.5" />
                </span>
              </button>

              {/* Hidden file input */}
              <input
                ref={(el) => (fileInputRefs.current[index] = el)}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleIconUpload(index, file);
                    e.target.value = "";
                  }
                }}
              />
            </div>

            {/* Service Label Text */}
            {isEditingText && selectedBlockId === "letterhead-footer-services" ? (
              <div className="flex flex-col gap-0.5">
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => handleUpdateService(index, { title: e.target.value })}
                  className="text-[7.5px] font-bold text-white bg-slate-800 border border-orange-400 rounded px-1 py-0 w-16 focus:outline-hidden"
                />
                <input
                  type="text"
                  value={service.subtitle}
                  onChange={(e) => handleUpdateService(index, { subtitle: e.target.value })}
                  className="text-[6.5px] text-slate-300 bg-slate-800 border border-orange-400 rounded px-1 py-0 w-16 focus:outline-hidden"
                />
                {service.customIconUrl && (
                  <button
                    type="button"
                    onClick={() => handleResetIcon(index)}
                    className="text-[6px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5 cursor-pointer mt-0.5"
                    title="Reset to default icon"
                  >
                    <RotateCcw className="w-2 h-2" />
                    <span>Reset Icon</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                onDoubleClick={() => {
                  setSelectedBlockId("letterhead-footer-services");
                  setIsEditingText(true);
                }}
                className="leading-tight pointer-events-none"
              >
                <span className="text-white font-bold block text-[8px]">{service.title}</span>
                <span className="text-slate-300 font-medium block text-[7px]">{service.subtitle}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </LetterheadElementWrapper>
  );
}
