"use client";

import { useRef, useState, useEffect } from "react";
import {
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import LetterheadElementWrapper from "./LetterheadElementWrapper";

const DEFAULT_CONTACT_ITEMS = [
  { id: "phone", label: "Phone", value: "0755-4601839", icon: "phone" },
  { id: "email", label: "Email", value: "info@texwebsolution.in", icon: "email" },
  { id: "website", label: "Website", value: "www.texwebsolution.in", icon: "website" },
  { id: "location", label: "Location", value: "Kolkata | Bhopal", icon: "location" },
];

/**
 * Built-in Preset Contact Icons (Exact pixel-matched solid corporate vector paths)
 */
export const CONTACT_ICON_PRESETS = [
  { id: "phone", label: "Phone" },
  { id: "email", label: "Email / Msg" },
  { id: "website", label: "Website" },
  { id: "location", label: "Location / Map" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "office", label: "Office / Address" },
];

/**
 * Dedicated renderer for crisp, solid white contact icons
 */
export function renderContactBadgeIcon(iconType = "phone", customIconUrl = null) {
  if (customIconUrl) {
    return (
      <img
        src={customIconUrl}
        alt="Custom Icon"
        crossOrigin="anonymous"
        className="w-3.5 h-3.5 object-contain select-none pointer-events-none"
      />
    );
  }

  switch (iconType) {
    case "phone":
      return (
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-current shrink-0" fill="currentColor">
          <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
        </svg>
      );

    case "email":
    case "msg":
      return (
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0" fill="currentColor">
          {/* Solid white envelope with clean carved V fold flap */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 5a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2H3zm16.5 2.5L12 12.25 4.5 7.5h15zm-15 2.1l6.97 4.65a1 1 0 001.06 0l6.97-4.65V17H4.5V9.6z"
            fill="white"
          />
        </svg>
      );

    case "website":
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-2.5 h-2.5 text-white shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
          <path d="M2 12h20" />
        </svg>
      );

    case "location":
    case "map":
      return (
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white shrink-0" fill="currentColor">
          {/* Solid white location pin with clean circular hole cutout */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
          />
        </svg>
      );

    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white shrink-0" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.79 14.07c-.24.68-1.4 1.26-1.95 1.33-.51.07-1.17.1-3.41-.83-2.86-1.18-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.26-.28.57-.35.77-.35.2 0 .39.01.56.02.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.32.39-.46.52-.15.15-.31.31-.13.62.18.31.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.53.31.15.49.13.67-.08.19-.21.79-.92 1-1.24.21-.31.42-.26.7-.16.28.1.79.84 2.1 1.48.21.1.35.15.4.22.06.07.06.41-.18 1.09z" />
        </svg>
      );

    case "office":
    default:
      return (
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white shrink-0" fill="currentColor">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
        </svg>
      );
  }
}

/**
 * Interactive Contact Badges Section with Custom PNG Icon Replacement & Solid Icon Presets
 * - Features authentic solid white vector icons for Phone, Email, Website, Location
 * - Allows replacing each icon with custom uploaded PNG/SVG icon via FileReader Base64
 * - Allows selecting from solid vector presets
 * - Inline text editing and add/remove contact fields
 */
export default function LetterheadContactBadges({
  contactConfig = {},
  updateContact = () => {},
  selectedBlockId = "",
  setSelectedBlockId = () => {},
  startMove,
  startResize,
  startRotate,
  zoom = 1,
  font = "Inter",
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [activePickerIndex, setActivePickerIndex] = useState(null);
  const fileInputRefs = useRef({});
  const pickerRef = useRef(null);

  const items = contactConfig.items && contactConfig.items.length > 0
    ? contactConfig.items
    : DEFAULT_CONTACT_ITEMS.map((item) => ({
        ...item,
        value: contactConfig[item.id] || item.value,
        customIconUrl: contactConfig[`${item.id}IconUrl`] || null,
      }));

  // Close picker on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setActivePickerIndex(null);
      }
    }
    if (activePickerIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePickerIndex]);

  function handleUpdateItem(index, updates) {
    const nextItems = [...items];
    nextItems[index] = { ...nextItems[index], ...updates };
    const fieldMap = {
      phone: nextItems.find((i) => i.id === "phone")?.value,
      email: nextItems.find((i) => i.id === "email")?.value,
      website: nextItems.find((i) => i.id === "website")?.value,
      locations: nextItems.find((i) => i.id === "location")?.value,
    };
    updateContact({
      items: nextItems,
      ...fieldMap,
    });
  }

  function handleIconUpload(index, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleUpdateItem(index, { customIconUrl: e.target?.result });
      setActivePickerIndex(null);
    };
    reader.readAsDataURL(file);
  }

  function handleResetIcon(index) {
    handleUpdateItem(index, { customIconUrl: null, icon: DEFAULT_CONTACT_ITEMS[index]?.icon || "phone" });
    setActivePickerIndex(null);
  }

  function handleSelectPreset(index, presetId) {
    handleUpdateItem(index, { icon: presetId, customIconUrl: null });
    setActivePickerIndex(null);
  }

  function handleAddItem() {
    const newItem = {
      id: `contact-${Date.now()}`,
      label: "Custom",
      value: "Add details here",
      icon: "phone",
      customIconUrl: null,
    };
    updateContact({ items: [...items, newItem] });
  }

  function handleRemoveItem(index) {
    if (items.length <= 1) return;
    const nextItems = items.filter((_, i) => i !== index);
    updateContact({ items: nextItems });
  }

  return (
    <LetterheadElementWrapper
      id="letterhead-contact"
      elementTitle="Contact Info"
      transformData={contactConfig}
      isSelected={selectedBlockId === "letterhead-contact"}
      onSelect={() => setSelectedBlockId("letterhead-contact")}
      onUpdate={(updates) => updateContact(updates)}
      startMove={startMove}
      startResize={startResize}
      startRotate={startRotate}
      zoom={zoom}
      isText={true}
      isEditingText={isEditingText && selectedBlockId === "letterhead-contact"}
      onToggleEditText={() => setIsEditingText((p) => !p)}
      className="pt-0.5 pr-2"
    >
      <div
        className="flex flex-col items-start gap-1 relative"
        style={{
          fontSize: contactConfig.fontSize ? `${contactConfig.fontSize}px` : undefined,
          fontWeight: contactConfig.fontWeight || undefined,
          fontStyle: contactConfig.fontStyle || undefined,
          textDecoration: contactConfig.textDecoration || undefined,
          color: contactConfig.color || undefined,
          fontFamily: contactConfig.fontFamily || font || undefined,
        }}
      >
        {items.map((item, index) => (
          <div key={item.id || index} className="flex items-center gap-1.5 group/row relative">
            {/* Circular Red Badge with Click to Replace Icon / Upload PNG */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBlockId("letterhead-contact");
                  setActivePickerIndex((prev) => (prev === index ? null : index));
                }}
                className="w-[18px] h-[18px] rounded-full bg-[#D3151D] hover:bg-[#b50e15] flex items-center justify-center text-white shrink-0 shadow-xs cursor-pointer transition relative group/icon"
                title="Click to change icon or upload custom PNG"
              >
                {renderContactBadgeIcon(item.icon, item.customIconUrl)}

                {/* Upload hover overlay */}
                <span className="absolute inset-0 bg-black/60 rounded-full items-center justify-center text-white hidden group-hover/icon:flex print:hidden">
                  <Upload className="w-2.5 h-2.5" />
                </span>
              </button>

              {/* Hidden file input for uploading custom PNG icon */}
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

              {/* Icon Selection Popover */}
              {activePickerIndex === index && (
                <div
                  ref={pickerRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-6 -top-2 z-50 bg-slate-900/95 text-white p-2 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md w-48 print:hidden select-none animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      <span>Change Icon</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePickerIndex(null)}
                      className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Preset Vector Icons */}
                  <div className="text-[9px] font-semibold text-slate-400 mb-1">Authentic Solid Icons:</div>
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    {CONTACT_ICON_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(index, preset.id)}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition cursor-pointer ${
                          item.icon === preset.id && !item.customIconUrl
                            ? "bg-orange-600/30 border-orange-500 text-white"
                            : "bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300"
                        }`}
                        title={preset.label}
                      >
                        <div className="w-4 h-4 rounded-full bg-[#D3151D] flex items-center justify-center mb-0.5 shadow-2xs">
                          {renderContactBadgeIcon(preset.id)}
                        </div>
                        <span className="text-[7.5px] truncate w-full text-center">{preset.label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom PNG Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="w-full py-1 px-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition mb-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Custom PNG</span>
                  </button>

                  {/* Reset Button */}
                  {(item.customIconUrl || item.icon !== DEFAULT_CONTACT_ITEMS[index]?.icon) && (
                    <button
                      type="button"
                      onClick={() => handleResetIcon(index)}
                      className="w-full py-0.5 px-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-orange-400 text-[9px] font-medium flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset to Original</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Editable Contact Text */}
            {isEditingText && selectedBlockId === "letterhead-contact" ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={item.value || ""}
                  onChange={(e) => handleUpdateItem(index, { value: e.target.value })}
                  className="text-[10.5px] font-bold text-slate-900 bg-white border border-orange-300 rounded px-1 py-0.5 focus:outline-hidden min-w-[120px]"
                />
                {item.customIconUrl && (
                  <button
                    type="button"
                    onClick={() => handleResetIcon(index)}
                    className="p-0.5 text-gray-400 hover:text-orange-600 cursor-pointer"
                    title="Reset to default icon"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-0.5 text-gray-400 hover:text-red-600 cursor-pointer"
                    title="Delete this contact row"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <span
                onDoubleClick={() => {
                  setSelectedBlockId("letterhead-contact");
                  setIsEditingText(true);
                }}
                className="text-[10.5px] font-bold text-slate-900 tracking-tight select-text hover:text-orange-600 transition"
                title="Double click to edit text · click icon to change or upload PNG"
              >
                {item.value || ""}
              </span>
            )}
          </div>
        ))}

        {/* In edit mode, allow adding extra contact row */}
        {isEditingText && selectedBlockId === "letterhead-contact" && (
          <button
            type="button"
            onClick={handleAddItem}
            className="text-[9px] font-bold text-orange-600 hover:text-orange-700 mt-0.5 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>+ Add Contact Field</span>
          </button>
        )}
      </div>
    </LetterheadElementWrapper>
  );
}
