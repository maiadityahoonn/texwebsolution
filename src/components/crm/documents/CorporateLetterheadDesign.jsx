"use client";

import { useState } from "react";
import LetterheadElementWrapper from "./LetterheadElementWrapper";
import LetterheadHeaderSvg from "./LetterheadHeaderSvg";
import LetterheadWavesSvg from "./LetterheadWavesSvg";
import LetterheadFooterSvg from "./LetterheadFooterSvg";
import LetterheadDividerLine from "./LetterheadDividerLine";
import LetterheadContactBadges from "./LetterheadContactBadges";
import LetterheadFooterServices from "./LetterheadFooterServices";

/**
 * 100% Pure Vector & CSS Corporate Letterhead Design
 * Exact Pixel-by-Pixel Replica of TexWeb Solution's Official Corporate Letterhead
 * with Full Canva-Style Element Interactivity & Alignment:
 * - 0% PNG background image — pure vector SVG paths, polygons, gradients, and halftone dots
 * - Every single element (Logo, Tagline, Contact Info, Watermark, Footer Legal Info, Services)
 *   is interactive: selectable, movable, resizable, rotatable, alignable (Left/Center/Right/Reset),
 *   and has inline text editing!
 */
export default function CorporateLetterheadDesign({
  companyName = "TexWeb Solution Private Limited",
  cin = "CIN: U85500WB2026PTC287896",
  phone = "0755-4601839",
  email = "info@texwebsolution.in",
  website = "www.texwebsolution.in",
  locations = "Kolkata | Bhopal",
  tagline = "Complete Digital Solutions for Your Business",
  logoUrl = "/texweb-header-logo.png",
  iconUrl = "/texweb-official-icon.png",
  letterheadConfig = {},
  updateLetterhead = () => {},
  selectedBlockId = "",
  setSelectedBlockId = () => {},
  startMove,
  startResize,
  startRotate,
  zoom = 1,
  font = "Inter",
}) {
  const [isEditingText, setIsEditingText] = useState(false);

  const lhConfig = letterheadConfig || {};

  const currentCompanyName = lhConfig.footerCompany?.companyName || companyName;
  const currentCin = lhConfig.footerCompany?.cin || cin;
  const currentPhone = lhConfig.contact?.phone || phone;
  const currentEmail = lhConfig.contact?.email || email;
  const currentWebsite = lhConfig.contact?.website || website;
  const currentLocations = lhConfig.contact?.locations || locations;
  const currentTagline = lhConfig.tagline?.text || tagline;
  const currentLogoUrl = lhConfig.logo?.logoUrl || logoUrl;
  const currentIconUrl = lhConfig.watermark?.iconUrl || iconUrl;
  const activeFont = font || lhConfig.fontFamily || "Inter";

  return (
    <div
      className="corporate-letterhead-vector absolute inset-0 w-full h-full select-none z-0 overflow-hidden bg-white text-slate-900 pointer-events-none"
      style={{
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
        fontFamily: activeFont,
      }}
    >
      {/* ======================================================== */}
      {/* 1. TOP HEADER SECTION (Pure Vector SVG + Content)        */}
      {/* ======================================================== */}
      <header className="absolute top-0 left-0 right-0 h-[104px] overflow-visible">
        {/* Background Geometric Angular Polygons & Halftone Dot Matrix */}
        <LetterheadHeaderSvg />

        {/* Header Content Container (Aligned with Millimeter Accuracy) */}
        <div className="relative z-10 w-full h-full px-12 pt-2 flex items-start justify-between">
          {/* Left: Official Wide Logo & Tagline (Individually Editable & Alignable) */}
          <div className="flex flex-col items-start pt-0.5 pl-2 gap-0.5">
            {/* 1. Editable Logo */}
            <LetterheadElementWrapper
              id="letterhead-logo"
              elementTitle="Logo"
              transformData={lhConfig.logo || {}}
              isSelected={selectedBlockId === "letterhead-logo"}
              onSelect={() => setSelectedBlockId("letterhead-logo")}
              onUpdate={(updates) => updateLetterhead("logo", updates)}
              startMove={startMove}
              startResize={startResize}
              startRotate={startRotate}
              zoom={zoom}
              onUploadImage={(file) => {
                const url = URL.createObjectURL(file);
                updateLetterhead("logo", { logoUrl: url });
              }}
            >
              <img
                src={currentLogoUrl || "/texweb-header-logo.png"}
                alt="TexWeb Solution"
                crossOrigin="anonymous"
                className="h-[46px] w-auto max-w-[260px] object-contain drop-shadow-2xs pointer-events-none"
                style={{
                  imageRendering: "crisp-edges",
                  height: lhConfig.logo?.height ? `${lhConfig.logo.height}px` : "46px",
                  width: lhConfig.logo?.width ? `${lhConfig.logo.width}px` : "auto",
                }}
              />
            </LetterheadElementWrapper>

            {/* 2. Editable Tagline */}
            <LetterheadElementWrapper
              id="letterhead-tagline"
              elementTitle="Tagline"
              transformData={lhConfig.tagline || {}}
              isSelected={selectedBlockId === "letterhead-tagline"}
              onSelect={() => setSelectedBlockId("letterhead-tagline")}
              onUpdate={(updates) => updateLetterhead("tagline", updates)}
              startMove={startMove}
              startResize={startResize}
              startRotate={startRotate}
              zoom={zoom}
              isText={true}
              isEditingText={isEditingText && selectedBlockId === "letterhead-tagline"}
              onToggleEditText={() => setIsEditingText((p) => !p)}
            >
              {isEditingText && selectedBlockId === "letterhead-tagline" ? (
                <input
                  type="text"
                  value={currentTagline}
                  onChange={(e) => updateLetterhead("tagline", { text: e.target.value })}
                  style={{
                    fontSize: lhConfig.tagline?.fontSize ? `${lhConfig.tagline.fontSize}px` : "10px",
                    fontWeight: lhConfig.tagline?.fontWeight || "600",
                    fontStyle: lhConfig.tagline?.fontStyle || "normal",
                    textDecoration: lhConfig.tagline?.textDecoration || "none",
                    color: lhConfig.tagline?.color || undefined,
                    fontFamily: lhConfig.tagline?.fontFamily || undefined,
                    textAlign: lhConfig.tagline?.textAlign || "left",
                  }}
                  className="font-semibold text-slate-800 tracking-tight bg-white border border-orange-400 rounded px-1.5 py-0.5 w-auto min-w-[200px] max-w-fit focus:outline-hidden"
                  autoFocus
                />
              ) : (
                <p
                  onDoubleClick={() => {
                    setSelectedBlockId("letterhead-tagline");
                    setIsEditingText(true);
                  }}
                  style={{
                    fontSize: lhConfig.tagline?.fontSize ? `${lhConfig.tagline.fontSize}px` : "10px",
                    fontWeight: lhConfig.tagline?.fontWeight || "600",
                    fontStyle: lhConfig.tagline?.fontStyle || "normal",
                    textDecoration: lhConfig.tagline?.textDecoration || "none",
                    color: lhConfig.tagline?.color || undefined,
                    fontFamily: lhConfig.tagline?.fontFamily || undefined,
                    textAlign: lhConfig.tagline?.textAlign || "left",
                  }}
                  className="font-semibold text-slate-800 tracking-tight mt-0.5 pl-0.5 select-text hover:text-orange-600 transition"
                  title="Double click to edit tagline"
                >
                  {currentTagline}
                </p>
              )}
            </LetterheadElementWrapper>
          </div>

          {/* Center Vertical Divider Line (Fully Editable Size, Length, Color, Delete, Add) */}
          <LetterheadDividerLine
            dividerConfig={lhConfig.divider || {}}
            updateDivider={(updates) => updateLetterhead("divider", updates)}
            selectedBlockId={selectedBlockId}
            setSelectedBlockId={setSelectedBlockId}
            startMove={startMove}
            startResize={startResize}
            startRotate={startRotate}
            zoom={zoom}
          />

          {/* Right: Contact Information Badges (Custom PNG Icon Upload, Text Edit, Add/Delete) */}
          <LetterheadContactBadges
            contactConfig={{
              ...lhConfig.contact,
              phone: currentPhone,
              email: currentEmail,
              website: currentWebsite,
              locations: currentLocations,
            }}
            updateContact={(updates) => updateLetterhead("contact", updates)}
            selectedBlockId={selectedBlockId}
            setSelectedBlockId={setSelectedBlockId}
            startMove={startMove}
            startResize={startResize}
            startRotate={startRotate}
            zoom={zoom}
            font={activeFont}
          />
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. CENTER WATERMARK (Canva Move, Resize, Opacity Control) */}
      {/* ======================================================== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <LetterheadElementWrapper
          id="letterhead-watermark"
          elementTitle="Watermark"
          transformData={lhConfig.watermark || {}}
          isSelected={selectedBlockId === "letterhead-watermark"}
          onSelect={() => setSelectedBlockId("letterhead-watermark")}
          onUpdate={(updates) => updateLetterhead("watermark", updates)}
          startMove={startMove}
          startResize={startResize}
          startRotate={startRotate}
          zoom={zoom}
          watermarkOpacity={lhConfig.watermark?.opacity ?? 0.22}
          onChangeOpacity={(val) => updateLetterhead("watermark", { opacity: val })}
          onUploadImage={(file) => {
            const url = URL.createObjectURL(file);
            updateLetterhead("watermark", { iconUrl: url });
          }}
        >
          <div
            className="relative flex items-center justify-center pointer-events-none select-none"
            style={{
              width: lhConfig.watermark?.width ? `${lhConfig.watermark.width}px` : "240px",
              height: lhConfig.watermark?.height ? `${lhConfig.watermark.height}px` : "240px",
            }}
          >
            <img
              src={currentIconUrl || "/texweb-official-icon.png"}
              alt="Watermark"
              crossOrigin="anonymous"
              className="w-full h-full object-contain mix-blend-multiply pointer-events-none select-none"
              style={{
                opacity: lhConfig.watermark?.opacity ?? 0.2,
              }}
            />
          </div>
        </LetterheadElementWrapper>
      </div>

      {/* ======================================================== */}
      {/* 3. LOWER FLOWING RIBBON WAVES & CONTOUR LINES            */}
      {/* ======================================================== */}
      <LetterheadWavesSvg />

      {/* ======================================================== */}
      {/* 4. FOOTER SECTION (Canva Move, Align & Inline Edit)      */}
      {/* ======================================================== */}
      <footer className="absolute bottom-0 left-0 right-0 h-[56px] overflow-visible">
        {/* Geometric Polygon Layer */}
        <LetterheadFooterSvg />

        {/* Content Layer (Company Legal Info + 6 Core Digital Services) */}
        <div className="relative z-10 w-full h-full px-5 pt-2.5 flex items-center justify-between text-white">
          {/* Left: Company Legal Name & CIN (Editable & Alignable) */}
          <LetterheadElementWrapper
            id="letterhead-footer-company"
            elementTitle="Company & CIN"
            transformData={lhConfig.footerCompany || {}}
            isSelected={selectedBlockId === "letterhead-footer-company"}
            onSelect={() => setSelectedBlockId("letterhead-footer-company")}
            onUpdate={(updates) => updateLetterhead("footerCompany", updates)}
            startMove={startMove}
            startResize={startResize}
            startRotate={startRotate}
            zoom={zoom}
            isText={true}
            isEditingText={isEditingText && selectedBlockId === "letterhead-footer-company"}
            onToggleEditText={() => setIsEditingText((p) => !p)}
          >
            <div
              className="flex flex-col items-start pr-3 shrink-0"
              style={{
                fontSize: lhConfig.footerCompany?.fontSize ? `${lhConfig.footerCompany.fontSize}px` : undefined,
                fontWeight: lhConfig.footerCompany?.fontWeight || undefined,
                fontStyle: lhConfig.footerCompany?.fontStyle || undefined,
                textDecoration: lhConfig.footerCompany?.textDecoration || undefined,
                color: lhConfig.footerCompany?.color || undefined,
                fontFamily: lhConfig.footerCompany?.fontFamily || undefined,
              }}
            >
              {isEditingText && selectedBlockId === "letterhead-footer-company" ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={currentCompanyName}
                    onChange={(e) =>
                      updateLetterhead("footerCompany", { companyName: e.target.value })
                    }
                    className="text-[10px] font-extrabold text-white bg-slate-800 border border-orange-400 rounded px-1.5 py-0.5 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={currentCin}
                    onChange={(e) =>
                      updateLetterhead("footerCompany", { cin: e.target.value })
                    }
                    className="text-[8px] font-semibold text-slate-300 bg-slate-800 border border-orange-400 rounded px-1.5 py-0.5 focus:outline-hidden"
                  />
                </div>
              ) : (
                <>
                  <span
                    onDoubleClick={() => {
                      setSelectedBlockId("letterhead-footer-company");
                      setIsEditingText(true);
                    }}
                    className="text-[10px] font-extrabold text-white tracking-wide uppercase select-text leading-tight hover:text-orange-400 transition"
                    title="Double click to edit company name"
                  >
                    {currentCompanyName}
                  </span>
                  <span
                    onDoubleClick={() => {
                      setSelectedBlockId("letterhead-footer-company");
                      setIsEditingText(true);
                    }}
                    className="text-[7.5px] font-semibold text-slate-300 tracking-wider select-text mt-0.5 leading-none hover:text-orange-400 transition"
                    title="Double click to edit CIN"
                  >
                    {currentCin}
                  </span>
                </>
              )}
            </div>
          </LetterheadElementWrapper>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-slate-700 shrink-0 mx-2 pointer-events-none" />

          {/* Right: 6 Core Digital Services with Custom PNG Icon Replacement */}
          <LetterheadFooterServices
            footerServicesConfig={lhConfig.footerServices || {}}
            updateFooterServices={(updates) => updateLetterhead("footerServices", updates)}
            selectedBlockId={selectedBlockId}
            setSelectedBlockId={setSelectedBlockId}
            startMove={startMove}
            startResize={startResize}
            startRotate={startRotate}
            zoom={zoom}
            font={activeFont}
          />
        </div>
      </footer>
    </div>
  );
}
