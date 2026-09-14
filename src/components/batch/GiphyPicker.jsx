"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";

const GIPHY_API_KEY =
  process.env.NEXT_PUBLIC_GIPHY_API_KEY || "naMCxzd6guuHHfku9aQyTypvALd8uYz1";

// WhatsApp Web GIF Category Navigation Icons (7 Tabs)
const GIF_CATEGORIES = [
  {
    id: "trending",
    label: "TRENDING",
    query: "trending",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: "haha",
    label: "HAHA",
    query: "haha",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9.5" />
        <path d="M8 9.5c.6-.8 1.4-.8 2 0" />
        <path d="M14 9.5c.6-.8 1.4-.8 2 0" />
        <path d="M8 13.5c.8 2.2 2.2 2.8 4 2.8s3.2-.6 4-2.8H8z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "sad",
    label: "SAD",
    query: "sad",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9.5" />
        <circle cx="9" cy="9.5" r="1.2" fill="currentColor" />
        <circle cx="15" cy="9.5" r="1.2" fill="currentColor" />
        <path d="M16 16c-.9-1.6-2.3-2.3-4-2.3s-3.1.7-4 2.3" />
      </svg>
    ),
  },
  {
    id: "love",
    label: "LOVE",
    query: "love",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    id: "reactions",
    label: "REACTIONS",
    query: "reactions",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    ),
  },
  {
    id: "sports",
    label: "SPORTS",
    query: "sports",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9.5" />
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="21.5" y2="12" />
        <path d="M4.8 5.2c3.2 2.2 5.2 5.2 5.2 13.6" />
        <path d="M19.2 5.2c-3.2 2.2-5.2 5.2-5.2 13.6" />
      </svg>
    ),
  },
  {
    id: "tv",
    label: "TV",
    query: "tv",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <line x1="9" y1="21" x2="15" y2="21" />
        <line x1="12" y1="19" x2="12" y2="21" />
      </svg>
    ),
  },
];

export default function GiphyPicker({ onSelectGif, isDark = false, onClose }) {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("TRENDING");
  const [error, setError] = useState(null);
  const debounceTimeout = useRef(null);
  const inputRef = useRef(null);
  const lastActiveCategoryRef = useRef("trending");

  const fetchGifs = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const q = query.trim();
      const endpoint =
        q && q.toLowerCase() !== "trending"
          ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
              q
            )}&limit=30&rating=g`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=30&rating=g`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.data) {
        setGifs(data.data);
      } else {
        setGifs([]);
      }
    } catch (err) {
      console.error("Giphy fetch error:", err);
      setError("Failed to load GIFs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchGifs("trending"), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat.id);
    lastActiveCategoryRef.current = cat.id;
    setSearchQuery(cat.label);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    fetchGifs(cat.query);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (!val.trim()) {
      const targetCatId = lastActiveCategoryRef.current || "trending";
      setActiveCategory(targetCatId);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        const catObj = GIF_CATEGORIES.find((c) => c.id === targetCatId);
        fetchGifs(catObj?.query || "trending");
      }, 300);
      return;
    }

    const matchedCat = GIF_CATEGORIES.find(
      (c) => c.label.toLowerCase() === val.trim().toLowerCase()
    );
    if (matchedCat) {
      setActiveCategory(matchedCat.id);
      lastActiveCategoryRef.current = matchedCat.id;
    } else {
      setActiveCategory(null);
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchGifs(val);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    // Preserve active category tab so the underline/link does not disappear
    const targetCatId = activeCategory || lastActiveCategoryRef.current || "trending";
    setActiveCategory(targetCatId);
    lastActiveCategoryRef.current = targetCatId;
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    const catObj = GIF_CATEGORIES.find((c) => c.id === targetCatId);
    fetchGifs(catObj?.query || "trending");
  };

  return (
    <div className="flex flex-col w-full h-full flex-1 bg-white dark:bg-[#18150f] text-gray-900 dark:text-[#f4ead2] overflow-hidden select-none">
      {/* 1. WhatsApp Web GIF Top Category Navigation Bar */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 border-b border-red-100 dark:border-[#3a3020] shrink-0 select-none">
        {GIF_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat)}
              className={`relative flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-[#9d9178] hover:text-red-600 dark:hover:text-red-400"
              }`}
              title={cat.label}
              aria-label={cat.label}
            >
              {cat.icon}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-red-600 dark:bg-red-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. WhatsApp Web Search Header */}
      <div className="p-2.5 px-4 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search GIFs..."
            className="w-full pl-10 pr-9 py-1.5 rounded-full text-xs sm:text-sm bg-white dark:bg-[#211d14] border-[1.5px] border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-gray-900 dark:text-[#f4ead2] placeholder-gray-400 font-medium tracking-wide transition"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearSearch();
            }}
            className={`absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer transition-opacity ${
              searchQuery ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. GIFs 3-Column Masonry Grid */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 texapp-message-scroll">
        {loading && gifs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-red-600 dark:text-red-400" />
            <span className="text-xs">Loading GIFs...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-xs text-red-500">
            {error}
          </div>
        ) : gifs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No GIFs found
          </div>
        ) : (
          <div className="columns-3 gap-1.5 space-y-1.5">
            {gifs.map((gif) => {
              const previewUrl =
                gif.images?.fixed_width_downsampled?.url ||
                gif.images?.fixed_height_small?.url ||
                gif.images?.fixed_height?.url ||
                gif.images?.original?.url;

              const fullUrl =
                gif.images?.original?.url || gif.images?.fixed_height?.url;

              return (
                <div
                  key={gif.id}
                  onClick={() => {
                    if (onSelectGif) {
                      onSelectGif({
                        url: fullUrl,
                        previewUrl,
                        title: gif.title || "GIF",
                        width: gif.images?.original?.width,
                        height: gif.images?.original?.height,
                      });
                    }
                  }}
                  className="group relative break-inside-avoid rounded-lg overflow-hidden cursor-pointer bg-gray-100 dark:bg-slate-800 hover:opacity-95 transition-all transform active:scale-95 shadow-2xs hover:shadow-md"
                >
                  <img
                    src={previewUrl}
                    alt={gif.title || "GIF"}
                    loading="lazy"
                    className="w-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                    <span className="text-[9px] text-white font-medium truncate drop-shadow-md">
                      {gif.title || "Send GIF"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
