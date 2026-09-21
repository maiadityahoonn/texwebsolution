"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  RotateCw,
  Maximize2,
  Minimize2,
  MapPin,
  X,
  Loader2,
  Check,
} from "lucide-react";

// Crisp custom SVG icons matching WhatsApp location designs
function RecenterGpsIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
    </svg>
  );
}

function LivePulseIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="2.8" fill="currentColor" />
      <path d="M7.5 7.5a6.5 6.5 0 0 0 0 9" />
      <path d="M16.5 7.5a6.5 6.5 0 0 1 0 9" />
      <path d="M4.5 4.5a11 11 0 0 0 0 15" />
      <path d="M19.5 4.5a11 11 0 0 1 0 15" />
    </svg>
  );
}

function CurrentLocationTargetIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    </svg>
  );
}

function TexAppSendArrowIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export default function TexAppLocationShareModal({
  isOpen,
  onClose,
  onSendLocation,
  currentUser,
  currentProfile,
  isDark = false,
}) {
  // Navigation mode: "main" (Send location) or "live" (Share live location duration)
  const [viewMode, setViewMode] = useState("main");
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

  // GPS Coordinates & Status
  const [coords, setCoords] = useState({
    lat: 23.2599,
    lng: 77.4126,
    accuracy: 17,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationName, setLocationName] = useState("Current Location");
  const [locationAddress, setLocationAddress] = useState("Locating nearby area...");

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // Live Location Duration & Comment
  const [liveDuration, setLiveDuration] = useState("1h"); // "15m" | "1h" | "8h"
  const [liveComment, setLiveComment] = useState("");

  // Nearby Places
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  const userAvatarUrl = currentProfile?.avatar_url || currentUser?.avatar_url || null;
  const userFullName = currentProfile?.full_name || currentUser?.full_name || "You";
  const userInitial = (userFullName?.charAt(0) || "U").toUpperCase();

  // 1. Fetch GPS location on open
  useEffect(() => {
    if (!isOpen) {
      setViewMode("main");
      setIsFullscreenMap(false);
      setIsSearchOpen(false);
      setSearchQuery("");
      setLiveComment("");
      return;
    }

    refreshLocation();
  }, [isOpen]);

  const refreshLocation = () => {
    if (!navigator?.geolocation) return;
    setIsLocating(true);
    setIsRefreshing(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newCoords = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 15),
        };
        setCoords(newCoords);
        setIsLocating(false);
        setIsRefreshing(false);
        fetchAddressAndPlaces(newCoords.lat, newCoords.lng);
      },
      (err) => {
        console.warn("High accuracy GPS failed, trying fallback:", err);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const newCoords = {
              lat: latitude,
              lng: longitude,
              accuracy: Math.round(accuracy || 35),
            };
            setCoords(newCoords);
            setIsLocating(false);
            setIsRefreshing(false);
            fetchAddressAndPlaces(newCoords.lat, newCoords.lng);
          },
          () => {
            setIsLocating(false);
            setIsRefreshing(false);
            // Default Bhopal fallback if geolocation is completely denied
            fetchAddressAndPlaces(coords.lat, coords.lng);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // 2. Reverse geocode address and nearby landmark places
  const fetchAddressAndPlaces = async (lat, lng) => {
    setIsLoadingPlaces(true);
    try {
      const revRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (revRes.ok) {
        const data = await revRes.json();
        const addr = data.address || {};
        const road = addr.road || addr.suburb || addr.neighbourhood || addr.city_district || "";
        const city = addr.city || addr.town || addr.village || addr.county || "";
        const state = addr.state || "";
        const postcode = addr.postcode || "";

        const detectedName = data.name || road || city || "Current Location";
        const detectedFull = [road, city, postcode, state, addr.country]
          .filter(Boolean)
          .join(", ");

        setLocationName(detectedName);
        setLocationAddress(detectedFull || data.display_name || "Location pinned on map");

        // Build list of contextual nearby places
        const places = [
          {
            id: "p1",
            name: road ? `${road} Junction` : `${city} Main Center`,
            address: detectedFull,
            distance: "60 m",
            lat: lat + 0.0004,
            lng: lng + 0.0003,
          },
          {
            id: "p2",
            name: `${city || "Local"} Transport Point`,
            address: `${road || "Bypass Rd"}, ${city}, ${postcode}, ${state}, IN`,
            distance: "180 m",
            lat: lat - 0.0007,
            lng: lng + 0.0005,
          },
          {
            id: "p3",
            name: `${city || "City"} Commercial Complex`,
            address: `Near ${road || "Sector A"}, ${city}, ${state}, IN`,
            distance: "290 m",
            lat: lat + 0.0011,
            lng: lng - 0.0008,
          },
          {
            id: "p4",
            name: `${road || city} Technology Park & Campus`,
            address: `Kokta Bypass, ${city}, ${postcode || "462021"}, MP, IN`,
            distance: "410 m",
            lat: lat - 0.0015,
            lng: lng - 0.0012,
          },
          {
            id: "p5",
            name: `${city || "Regional"} Administrative Office`,
            address: `${road || "Main Avenue"}, ${city}, ${state}, IN`,
            distance: "550 m",
            lat: lat + 0.002,
            lng: lng + 0.0018,
          },
        ];
        setNearbyPlaces(places);
      }
    } catch (e) {
      console.warn("Geocoding fetch error:", e);
      // Fallback places
      setNearbyPlaces([
        {
          id: "p1",
          name: "MIG flats Nagar Nigam",
          address: "A-4Kokta, Bhopal Byp, Bhopal, 462028, MP, IN",
          distance: "95 m",
          lat: lat + 0.0005,
          lng: lng + 0.0004,
        },
        {
          id: "p2",
          name: "Bhopal Guwahati Road Lines",
          address: "Plot No. 224, Bhopal Byp, Near Bansal College, Bhopal",
          distance: "220 m",
          lat: lat - 0.0006,
          lng: lng + 0.0008,
        },
        {
          id: "p3",
          name: "Bansal Institute Of Research And Tech",
          address: "Kokta Bypass Rd, Bhopal, 462021, MP, IN",
          distance: "350 m",
          lat: lat + 0.0012,
          lng: lng - 0.0006,
        },
        {
          id: "p4",
          name: "Transport nagar bhopal",
          address: "transport Nagar kokta Bhopal Madhya Pradesh, Bhopal",
          distance: "480 m",
          lat: lat - 0.0015,
          lng: lng - 0.0014,
        },
      ]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // Filtered places according to search query
  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return nearbyPlaces;
    const q = searchQuery.toLowerCase();
    return nearbyPlaces.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    );
  }, [nearbyPlaces, searchQuery]);

  // Recenter map handler
  const handleRecenter = () => {
    refreshLocation();
  };

  // Handlers for sending location
  const handleSendCurrentLocation = () => {
    if (!onSendLocation) return;
    onSendLocation({
      type: "location_static",
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
      placeName: locationName || "Current Location",
      address: locationAddress || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
    });
    onClose();
  };

  const handleSendSpecificPlace = (place) => {
    if (!onSendLocation) return;
    onSendLocation({
      type: "location_static",
      lat: place.lat || coords.lat,
      lng: place.lng || coords.lng,
      accuracy: coords.accuracy,
      placeName: place.name,
      address: place.address,
    });
    onClose();
  };

  const handleSendLiveLocation = () => {
    if (!onSendLocation) return;
    // Calculate live expiration timestamp
    let durationMs = 60 * 60 * 1000; // 1 hour default
    if (liveDuration === "15m") durationMs = 15 * 60 * 1000;
    if (liveDuration === "8h") durationMs = 8 * 60 * 60 * 1000;

    const expiresAt = Date.now() + durationMs;
    const expiryDate = new Date(expiresAt);
    const liveUntilTime = expiryDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    onSendLocation({
      type: "location_live",
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
      liveUntil: liveUntilTime,
      expiresAt,
      comment: liveComment.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 select-none animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="w-full h-full sm:h-[92vh] sm:max-w-md bg-[#111b21] dark:bg-[#111b21] text-[#e9edef] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10 relative">
        {/* ===================================================================
            TOP HEADER BAR (Matches Screenshot 1 & 2)
            =================================================================== */}
        <div className="shrink-0 h-14 bg-[#1f2c34] dark:bg-[#1f2c34] px-4 flex items-center justify-between border-b border-white/10 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (viewMode === "live") {
                  setViewMode("main");
                } else {
                  onClose();
                }
              }}
              className="p-1.5 -ml-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {viewMode === "live" ? "Share live location" : "Send location"}
            </h2>
          </div>

          {viewMode === "main" && (
            <div className="flex items-center gap-1 text-gray-300">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen((prev) => !prev);
                  if (!isSearchOpen) {
                    setTimeout(() => searchInputRef.current?.focus(), 150);
                  }
                }}
                className={`p-2 rounded-full transition cursor-pointer ${
                  isSearchOpen ? "bg-white/20 text-white" : "hover:bg-white/10 hover:text-white"
                }`}
                title="Search places"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Refresh GPS */}
              <button
                type="button"
                onClick={handleRecenter}
                disabled={isRefreshing}
                className="p-2 rounded-full hover:bg-white/10 hover:text-white transition cursor-pointer disabled:opacity-50"
                title="Refresh location"
              >
                <RotateCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Search Input Row */}
        {viewMode === "main" && isSearchOpen && (
          <div className="px-4 py-2 bg-[#1f2c34]/95 border-b border-white/10 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address or nearby places..."
              className="w-full bg-transparent text-sm text-white placeholder:text-gray-400 outline-none border-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* ===================================================================
            MAP AREA (Top Half or Fullscreen)
            =================================================================== */}
        <div
          className={`relative transition-all duration-300 overflow-hidden bg-[#182229] ${
            isFullscreenMap ? "flex-1" : viewMode === "live" ? "h-[50%]" : "h-[44%]"
          }`}
        >
          {/* Interactive Google Maps Iframe */}
          <iframe
            title="Location Map"
            src={mapEmbedUrl}
            className="w-full h-full border-0 pointer-events-auto filter contrast-105"
            loading="eager"
          />

          {/* Top-Left: Fullscreen Map View Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreenMap((prev) => !prev)}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#1f2c34]/90 hover:bg-[#2a3942] text-white flex items-center justify-center shadow-lg border border-white/10 backdrop-blur-xs transition cursor-pointer z-10"
            title={isFullscreenMap ? "Collapse map" : "Expand map"}
          >
            {isFullscreenMap ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Top-Right: GPS Recenter Crosshair Button (Matches Screenshot 1 & 2) */}
          <button
            type="button"
            onClick={handleRecenter}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#1f2c34]/95 hover:bg-[#2a3942] active:scale-95 text-white flex items-center justify-center shadow-lg border border-white/10 backdrop-blur-xs transition cursor-pointer z-10"
            title="Recenter on my location"
          >
            <RecenterGpsIcon className={`w-5 h-5 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
          </button>

          {/* Center Map Overlay Pin */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            {viewMode === "live" ? (
              /* Live Location Mode: User's circular avatar right on the map! (Matches Screenshot 2) */
              <div className="relative flex items-center justify-center">
                {/* Radar ripple rings */}
                <div className="absolute w-16 h-16 rounded-full bg-red-500/30 animate-ping" />
                <div className="absolute w-12 h-12 rounded-full bg-red-600/40" />
                {/* User avatar circle */}
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-2xl relative z-10 bg-red-700 flex items-center justify-center text-white font-bold text-sm">
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={userFullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
              </div>
            ) : (
              /* Main Mode: GPS pulsing target marker */
              <div className="relative flex items-center justify-center -translate-y-2">
                <div className="absolute w-10 h-10 rounded-full bg-red-500/25 animate-ping" />
                <div className="w-5 h-5 rounded-full bg-red-600 border-[3px] border-white shadow-xl flex items-center justify-center" />
              </div>
            )}
          </div>

          {/* Google Logo / Attribution Watermark at bottom left */}
          <div className="absolute bottom-2 left-3 pointer-events-none z-10">
            <span className="text-[11px] font-bold text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Google
            </span>
          </div>
        </div>

        {/* ===================================================================
            BOTTOM CONTENT AREA (Matches Screenshot 1 or Screenshot 2)
            =================================================================== */}
        {!isFullscreenMap && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#111b21] overflow-hidden">
            {viewMode === "main" ? (
              /* -----------------------------------------------------------
                 SCREENSHOT 1: "Send location" Main Drawer & Nearby Places
                 ----------------------------------------------------------- */
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                {/* 1. Share Live Location Option */}
                <button
                  type="button"
                  onClick={() => setViewMode("live")}
                  className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-white/5 active:bg-white/10 transition cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1f2c34] border border-white/10 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <LivePulseIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[14px] sm:text-[15px] text-white">
                      Share live location
                    </div>
                  </div>
                </button>

                {/* 2. Nearby Places Header */}
                <div className="px-4 py-2.5 bg-[#111b21]">
                  <span className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">
                    Nearby places
                  </span>
                </div>

                {/* 3. Send Your Current Location Option */}
                <button
                  type="button"
                  onClick={handleSendCurrentLocation}
                  className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-white/5 active:bg-white/10 transition cursor-pointer text-left"
                >
                  {/* Bullseye target circle (Theme Preserved: Brand Red) */}
                  <div className="w-10 h-10 rounded-full bg-red-600/15 border-2 border-red-500 text-red-500 flex items-center justify-center shrink-0 shadow-xs">
                    <CurrentLocationTargetIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[14px] sm:text-[15px] text-white">
                      Send your current location
                    </div>
                    <div className="text-[11.5px] text-gray-400 mt-0.5">
                      Accurate to {coords.accuracy || 15} meters
                    </div>
                  </div>
                </button>

                {/* 4. Scrollable List of Nearby Places */}
                {isLoadingPlaces ? (
                  <div className="p-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    <span>Loading nearby places...</span>
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    No places found.
                  </div>
                ) : (
                  filteredPlaces.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSendSpecificPlace(place)}
                      className="w-full px-4 py-3 flex items-start gap-3.5 hover:bg-white/5 active:bg-white/10 transition cursor-pointer text-left"
                    >
                      {/* Gray Pin Circle */}
                      <div className="w-9 h-9 rounded-full bg-white/10 text-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>

                      {/* Place Info */}
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-medium text-[13.5px] text-white truncate leading-snug">
                          {place.name}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5 leading-snug">
                          {place.address}
                        </div>
                      </div>

                      {/* Distance */}
                      {place.distance && (
                        <div className="text-[11px] font-mono text-gray-500 shrink-0 mt-0.5">
                          {place.distance}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            ) : (
              /* -----------------------------------------------------------
                 SCREENSHOT 2: "Share live location" Duration Sheet
                 ----------------------------------------------------------- */
              <div className="flex-1 p-5 flex flex-col justify-between bg-[#111b21]">
                <div className="space-y-4">
                  <h3 className="text-[15px] font-bold text-white">
                    Share live location
                  </h3>

                  {/* 3 Duration Selection Tabs (15 min, 1 hour, 8 hours) */}
                  {/* Theme Preserved: Brand Red for selected button */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "15m", label: "15 minutes" },
                      { id: "1h", label: "1 hour" },
                      { id: "8h", label: "8 hours" },
                    ].map((item) => {
                      const isSelected = liveDuration === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLiveDuration(item.id)}
                          className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer text-center ${
                            isSelected
                              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                              : "bg-[#1f2c34] hover:bg-[#2a3942] text-gray-300 border border-white/5"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Input: Add Comment + Circular Red Send Button */}
                <div className="pt-4 flex items-center gap-3">
                  <div className="flex-1 bg-[#1f2c34] rounded-2xl px-4 py-3 border border-white/10 focus-within:border-red-500 transition">
                    <input
                      type="text"
                      value={liveComment}
                      onChange={(e) => setLiveComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSendLiveLocation();
                        }
                      }}
                      placeholder="Add comment"
                      className="w-full bg-transparent text-sm text-white placeholder:text-gray-400 outline-none border-none"
                    />
                  </div>

                  {/* Circular Send Action Button (Theme Preserved: Brand Red) */}
                  <button
                    type="button"
                    onClick={handleSendLiveLocation}
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-600/30 transition cursor-pointer shrink-0"
                    title="Share live location"
                  >
                    <TexAppSendArrowIcon className="w-5 h-5 translate-x-0.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
