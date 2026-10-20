"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAppMode } from "@/lib/isAppMode";
import { supabase } from "@/lib/supabase";

export default function AppSplashScreen() {
  const pathname = usePathname();
  const router = useRouter();

  const [inApp, setInApp] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const isApp = isAppMode();
    setInApp(isApp);

    if (!isApp) {
      // If not in App Mode (regular desktop/mobile web browser), do not show splash screen
      setIsVisible(false);
      setShouldRender(false);
      return;
    }

    let isMounted = true;

    // Check session & enforce: Splash -> Login -> CRM Only flow
    async function checkSessionAndRoute() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        const currentPath = window.location.pathname;

        if (session?.user) {
          // User is authenticated: ensure they go to CRM
          if (!currentPath.startsWith("/crm")) {
            router.replace("/crm/dashboard");
          }
        } else {
          // User is NOT authenticated: ensure they go to /login
          if (currentPath !== "/login") {
            router.replace("/login");
          }
        }
      } catch (err) {
        console.warn("Splash auth route check warning:", err);
      }
    }

    checkSessionAndRoute();

    // Native app launch splash animation duration
    const timer = setTimeout(() => {
      if (isMounted) setIsVisible(false);
    }, 1200);

    const removeTimer = setTimeout(() => {
      if (isMounted) setShouldRender(false);
    }, 1700);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [pathname, router]);

  // If in App Mode and user lands on a public route, keep splash up while redirecting so marketing pages never show
  const isPublicRouteInApp = inApp && !pathname?.startsWith("/crm") && pathname !== "/login";

  if (!shouldRender && !isPublicRouteInApp) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white text-gray-900 transition-opacity duration-500 ease-out select-none overflow-hidden ${
        isVisible || isPublicRouteInApp ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        backgroundImage: "url('https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/common/Bg2.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        backgroundSize: "cover",
        fontFamily: "Matter",
      }}
      aria-hidden={!isVisible && !isPublicRouteInApp}
    >
      {/* Ambient soft red radial glow behind the logo */}
      <div className="absolute w-80 h-80 rounded-full bg-red-500/10 blur-3xl pointer-events-none -z-0 animate-pulse" />

      {/* Center Brand Icon & Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        {/* Full-size clean App Logo */}
        <div className="relative mb-6 transition-transform hover:scale-105 duration-300">
          <Image
            width={72}
            height={72}
            src="/logo.png"
            alt="TexWeb Solution"
            priority
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-contain shadow-2xl shadow-red-600/20"
          />
        </div>

        {/* Brand Name (Red TEXWEB + Black SOLUTION) */}
        <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-[-0.04em] text-center leading-none mb-2.5">
          <span className="text-red-600">TEXWEB</span>
          <span className="text-gray-900">SOLUTION</span>
        </div>

        {/* Tagline */}
        <p className="text-xs sm:text-sm font-medium text-gray-500 tracking-wide font-poppins text-center max-w-sm mx-auto mb-10 leading-relaxed">
          Web · Apps · SaaS · AI Automation · Digital Marketing
        </p>

        {/* Animated 3 Red Loading Dots matching brand */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-bounce [animation-delay:0ms] shadow-sm shadow-red-600/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce [animation-delay:180ms] shadow-sm shadow-red-500/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-bounce [animation-delay:360ms] shadow-sm shadow-red-400/30" />
        </div>
      </div>
    </div>
  );
}
