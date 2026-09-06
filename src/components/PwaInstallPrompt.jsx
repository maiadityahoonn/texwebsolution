"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Share, PlusSquare, Monitor, CheckCircle2 } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // 1. Immediate Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("TexWeb PWA Service Worker Active:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker registration error:", err);
        });
    }

    // 2. Check if already running in standalone mode (installed)
    const isStandalone = 
      (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) ||
      (typeof navigator !== "undefined" && navigator.standalone);

    if (isStandalone) {
      return;
    }

    // 3. Detect iOS Safari
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Capture native beforeinstallprompt (Chrome / Android / Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Timer: Show floating banner after 2s if not dismissed in session
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("texweb_pwa_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show smooth in-app instruction modal instead of browser alert
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("texweb_pwa_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating PWA Install Banner */}
      <aside 
        aria-label="Install App" 
        className="fixed bottom-20 left-4 sm:left-6 z-[9999] transition-all duration-500 transform translate-y-0"
        style={{ fontFamily: "Matter" }}
      >
        <div className="flex items-center gap-3.5 bg-white/95 backdrop-blur-xl text-gray-900 px-4 py-3.5 rounded-2xl shadow-2xl shadow-black/15 border border-gray-200/90 max-w-sm sm:max-w-md relative overflow-hidden">
          {/* Top Brand Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="text-left flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-900 leading-tight">Install TexWeb App</span>
              <span className="bg-red-50 text-red-600 border border-red-200 font-bold px-1.5 py-0.2 rounded-full text-[9px]">PWA</span>
            </div>
            <div className="text-[11px] text-gray-500 font-poppins leading-tight mt-0.5 truncate">
              Fast 1-click mobile access & alerts
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-red-600/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* In-App Installation Guide Modal (No raw alert popup) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 max-w-md w-full text-center shadow-2xl text-gray-900 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
            
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-3.5 border border-red-200">
              {isIos ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "Matter" }}>
              {isIos ? "Install on iPhone / iPad" : "Install TexWeb Solution App"}
            </h3>
            <p className="text-xs text-gray-500 font-poppins mb-4">
              Get seamless 1-click access to your projects & dashboard.
            </p>

            {isIos ? (
              <div className="space-y-3 text-xs text-left bg-gray-50 p-4 rounded-2xl border border-gray-200/80 mb-5 font-poppins">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span>Safari bottom bar me <strong>Share button (<Share className="w-3.5 h-3.5 inline" />)</strong> par tap karein.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span>List me niche scroll karke <strong>Add to Home Screen (<PlusSquare className="w-3.5 h-3.5 inline" />)</strong> select karein.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-left bg-gray-50 p-4 rounded-2xl border border-gray-200/80 mb-5 font-poppins">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Browser URL / Address bar ke right side me <strong>Install Icon (⊕ / 📥)</strong> par click karein.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Ya Browser ke top-right <strong>3-Dots Menu (⋮)</strong> me jakar <strong>&quot;Install TexWeb Solution&quot;</strong> select karein.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
              style={{ fontFamily: "Matter" }}
            >
              Got it, Done!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
