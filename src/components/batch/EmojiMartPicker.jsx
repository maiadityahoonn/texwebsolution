"use client";

import { useEffect, useRef } from "react";
import appleData from "@emoji-mart/data/sets/15/apple.json";
import { Picker } from "emoji-mart";

const WHATSAPP_CATEGORY_ICONS = {
  frequent: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="none"/><polyline points="12 7 12 12 15.5 13.5" fill="none"/></svg>`,
  },
  people: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="none"/><circle cx="9" cy="9.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="9.5" r="1.2" fill="currentColor" stroke="none"/><path d="M8 13.5c1 2.2 2.8 3.5 4 3.5s3-1.3 4-3.5" fill="none"/></svg>`,
  },
  nature: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="13.5" r="1.8" fill="none"/><path d="M9.5 9a2.2 2.2 0 0 1 0 4.5 2.2 2.2 0 0 1 0-4.5z" fill="none"/><path d="M13.8 11a2.2 2.2 0 0 1-2.2 3.9 2.2 2.2 0 0 1 2.2-3.9z" fill="none"/><path d="M12.2 17.5a2.2 2.2 0 0 1-3.6-2.6 2.2 2.2 0 0 1 3.6 2.6z" fill="none"/><path d="M6.8 17.5a2.2 2.2 0 0 1 1-4.3 2.2 2.2 0 0 1-1 4.3z" fill="none"/><path d="M5.2 11a2.2 2.2 0 0 1 3.6-2.6 2.2 2.2 0 0 1-3.6 2.6z" fill="none"/><path d="M18.5 4v4m-2-2h4" fill="none"/><circle cx="21" cy="4" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  },
  foods: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" fill="none"/><path d="M5 7h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7z" fill="none"/><line x1="4" y1="20" x2="18" y2="20"/></svg>`,
  },
  activity: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="none"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M5.6 5.6a9 9 0 0 1 0 12.8" fill="none"/><path d="M18.4 5.6a9 9 0 0 0 0 12.8" fill="none"/></svg>`,
  },
  places: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11L8.5 6h7L17 11" fill="none"/><rect x="5" y="11" width="14" height="6.5" rx="1.5" fill="none"/><circle cx="8" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/><path d="M6.5 17.5v1.5m11-1.5v1.5" fill="none"/></svg>`,
  },
  objects: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6" fill="none"/><path d="M10 21h4" fill="none"/><path d="M12 3a6.5 6.5 0 0 0-4.5 11.2c.7.7 1 1.6 1 2.3v.5h7v-.5c0-.7.3-1.6 1-2.3A6.5 6.5 0 0 0 12 3z" fill="none"/></svg>`,
  },
  symbols: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M3 4.5h6v1.5H6.8V10H5.2V6H3V4.5z"/><path d="M14 4.5h5v1.5h-3.5v3.2a1.4 1.4 0 1 1-1.5-1.4c.3 0 .5.1.7.2V4.5z"/><circle cx="14" cy="9.2" r="1.3"/><circle cx="18" cy="8.2" r="1.3"/><path d="M14 8.5V4.5h4.5v4"/><path d="M6.5 13.5c-.8 0-1.5.6-1.5 1.3 0 .5.3.9.7 1.1-.6.5-1 1.1-1 1.9 0 1.2 1 2.2 2.3 2.2 1.3 0 2.2-.9 2.5-1.8l1 1h1.3l-1.4-1.4c.5-.7.8-1.5.8-2.2 0-1.2-1-2.1-2.2-2.1zm-.3 1.2c.4 0 .7.3.7.6 0 .4-.3.7-.7.7s-.7-.3-.7-.7c0-.3.3-.6.7-.6zm.8 4.3c-.7 0-1.3-.5-1.3-1.1 0-.5.3-.9.7-1.2l1.6 1.6c-.2.5-.5.7-1 .7zm1.6-2.1l-.9-.9c.4-.3.6-.7.6-1.1 0-.5-.4-.9-.9-.9-.3 0-.6.2-.8.5l-.8-.8c.4-.5.9-.8 1.6-.8 1.1 0 2 .8 2 1.9 0 .8-.4 1.5-.8 2.1z"/><circle cx="15.2" cy="14.8" r="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="18.8" cy="18.8" r="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="19.5" y1="13.5" x2="14.5" y2="20" stroke="currentColor" stroke-width="1.3"/></svg>`,
  },
  flags: {
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4" fill="none"/><path d="M5 5h11.5a1 1 0 0 1 .8 1.6L16 9l1.3 2.4a1 1 0 0 1-.8 1.6H5" fill="none"/></svg>`,
  },
};

export default function EmojiMartPicker({
  onEmojiSelect,
  isDark = false,
  previewPosition = "none",
  searchPosition = "top",
  navPosition = "top",
  perLine = 10,
  maxFrequentRows = 1,
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Ensure 'frequently' category is pre-seeded so the Clock icon always appears
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("emoji-mart.frequently");
        if (!stored || stored === "{}" || stored === "[]") {
          const defaultFrequent = {
            "+1": 10,
            "grinning": 9,
            "heart": 8,
            "joy": 7,
            "pray": 6,
            "fire": 5,
            "smile": 4,
            "sob": 3,
            "kissing_heart": 2,
            "sunglasses": 1,
          };
          window.localStorage.setItem("emoji-mart.frequently", JSON.stringify(defaultFrequent));
        }
      } catch {}
    }

    try {
      const picker = new Picker({
        data: appleData,
        set: "apple",
        categoryIcons: WHATSAPP_CATEGORY_ICONS,
        skinTonePosition: "none",
        onEmojiSelect: (emoji) => {
          if (onEmojiSelect) {
            onEmojiSelect(emoji?.native || emoji);
          }
        },
        theme: isDark ? "dark" : "light",
        previewPosition,
        searchPosition,
        navPosition,
        perLine,
        maxFrequentRows,
        autoFocus: false,
        dynamicWidth: false,
        emojiSize: 24,
        emojiButtonSize: 34,
        i18n: {
          search: "Search emoji",
          search_no_results_1: "Oh no!",
          search_no_results_2: "That emoji couldn’t be found",
          pick: "Pick an emoji…",
          add_custom: "Add custom emoji",
          categories: {
            activity: "Activity",
            custom: "Custom",
            flags: "Flags",
            foods: "Food & Drink",
            frequent: "Frequently used",
            nature: "Animals & Nature",
            objects: "Objects",
            people: "Smileys & People",
            places: "Travel & Places",
            search: "Search Results",
            symbols: "Symbols",
          },
          skins: {
            1: "Default",
            2: "Light",
            3: "Medium-Light",
            4: "Medium",
            5: "Medium-Dark",
            6: "Dark",
            choose: "Choose default skin tone",
          },
        },
      });

      // Inject custom WhatsApp Web styling into picker's shadowRoot
      if (picker.shadowRoot) {
        const styleTag = document.createElement("style");
        styleTag.textContent = `
          :host, #root, *, input, button, select, span, div, h2, h3, p {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          :host {
            --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            --em-rgb-accent: 220, 38, 38 !important;
            --em-rgb-background: ${isDark ? "24, 21, 15" : "255, 255, 255"} !important;
            --em-color-border: ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"} !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          #root {
            width: 100% !important;
            height: 100% !important;
            background-color: ${isDark ? "#18150f" : "#ffffff"} !important;
            border: none !important;
          }
          #nav {
            width: 100% !important;
            padding: 8px 14px 0 !important;
            border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"} !important;
            box-sizing: border-box !important;
          }
          #nav > div {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            position: relative !important;
          }
          #nav button {
            flex: 1 !important;
            width: auto !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 8px 0 10px !important;
            color: ${isDark ? "#9d9178" : "#6b7280"} !important;
            opacity: 0.8 !important;
            transition: opacity 0.15s, color 0.15s !important;
            cursor: pointer !important;
            background: transparent !important;
            border: none !important;
          }
          #nav button:hover {
            opacity: 1 !important;
            color: ${isDark ? "#f87171" : "#dc2626"} !important;
          }
          #nav button[aria-selected="true"] {
            color: ${isDark ? "#f87171" : "#dc2626"} !important;
            opacity: 1 !important;
          }
          #nav .bar {
            background-color: transparent !important;
            height: 3px !important;
            bottom: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          #nav .bar::after {
            content: "" !important;
            display: block !important;
            width: 24px !important;
            height: 3px !important;
            background-color: ${isDark ? "#f87171" : "#dc2626"} !important;
            border-radius: 9999px !important;
            margin: 0 auto !important;
          }
          #nav svg {
            width: 20px !important;
            height: 20px !important;
            display: block !important;
          }
          .search {
            margin: 8px 14px 6px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
          }
          .search input[type="search"] {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            border: 1.5px solid #ef4444 !important;
            border-radius: 9999px !important;
            background-color: ${isDark ? "#211d14" : "#ffffff"} !important;
            padding: 7px 16px 7px 38px !important;
            font-size: 14.5px !important;
            font-weight: 400 !important;
            color: ${isDark ? "#f4ead2" : "#111827"} !important;
            outline: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .search input[type="search"]::placeholder {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            color: ${isDark ? "#9d9178" : "#6b7280"} !important;
            font-size: 14.5px !important;
            font-weight: 400 !important;
          }
          .search input[type="search"]:focus {
            box-shadow: 0 0 0 1px #ef4444 !important;
          }
          .search .loupe {
            left: 12px !important;
            color: ${isDark ? "#9d9178" : "#6b7280"} !important;
            width: 16px !important;
            height: 16px !important;
          }
          .search .clear {
            right: 12px !important;
            color: ${isDark ? "#9d9178" : "#6b7280"} !important;
          }
          .category > div.sticky, .category h2, .category-title {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            color: ${isDark ? "#9d9178" : "#6b7280"} !important;
            background-color: ${isDark ? "#18150f" : "#ffffff"} !important;
            padding: 8px 0 4px 0 !important;
            letter-spacing: -0.01em !important;
            text-transform: none !important;
          }
          .category {
            padding: 0 14px !important;
          }
          .category button .background,
          .category button:hover .background,
          .category button:focus .background,
          .category button[aria-selected] .background {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            background: transparent !important;
            background-color: transparent !important;
          }
          .category button,
          .category button:hover,
          .category button:focus,
          .category button:active {
            background: transparent !important;
            background-color: transparent !important;
            outline: none !important;
            box-shadow: none !important;
          }
          .scroll {
            padding-bottom: 30px !important;
            overflow-x: hidden !important;
            scrollbar-width: thin !important;
            scrollbar-color: ${isDark ? "rgba(255, 255, 255, 0.16) transparent" : "rgba(0, 0, 0, 0.16) transparent"} !important;
          }
          .scroll::-webkit-scrollbar {
            width: 5px !important;
          }
          .scroll::-webkit-scrollbar-thumb {
            background-color: ${isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.16)"} !important;
            border-radius: 9999px !important;
          }
          .scroll::-webkit-scrollbar-track {
            background: transparent !important;
          }
        `;
        picker.shadowRoot.appendChild(styleTag);

        // Remove browser title tooltips from emoji buttons
        const stripEmojiTooltips = () => {
          if (!picker.shadowRoot) return;
          const emojiButtons = picker.shadowRoot.querySelectorAll("button[aria-label][title]");
          emojiButtons.forEach((btn) => {
            btn.removeAttribute("title");
          });
        };

        stripEmojiTooltips();

        const tooltipObserver = new MutationObserver(() => {
          stripEmojiTooltips();
        });

        tooltipObserver.observe(picker.shadowRoot, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["title"],
        });

        picker.__tooltipObserver = tooltipObserver;
      }

      if (containerRef.current) {
        containerRef.current.replaceChildren(picker);
      }
    } catch (e) {
      console.error("EmojiMart initialization error:", e);
    }

    return () => {
      if (containerRef.current) {
        try {
          const pickerEl = containerRef.current.querySelector("em-emoji-picker");
          if (pickerEl?.__tooltipObserver) {
            pickerEl.__tooltipObserver.disconnect();
          }
          containerRef.current.innerHTML = "";
        } catch {}
      }
    };
  }, [isDark, onEmojiSelect, previewPosition, searchPosition, navPosition, perLine, maxFrequentRows]);

  return (
    <div
      ref={containerRef}
      className={`emoji-mart-wrapper w-full h-full flex-1 overflow-hidden ${className}`}
      style={style}
    />
  );
}
