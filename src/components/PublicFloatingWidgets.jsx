"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import AiChatbotWidget from "@/components/AiChatbotWidget";

const PORTAL_ROUTES = ["/login", "/admin", "/crm", "/cms", "/portal"];

export default function PublicFloatingWidgets() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if current path is a private or auth/portal route
  const isPortalRoute = PORTAL_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    let isMounted = true;

    async function checkCurrentSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isMounted) {
          setIsLoggedIn(Boolean(session?.user));
          setIsCheckingAuth(false);
        }
      } catch {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    checkCurrentSession();

    // Listen to real-time auth events (SIGNED_IN, SIGNED_OUT, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setIsLoggedIn(Boolean(session?.user));
        setIsCheckingAuth(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Do not render anything on portal/internal routes
  if (isPortalRoute) {
    return null;
  }

  // If user is logged in, hide floating widgets (Insta, Chatbot, WhatsApp, Lead Capture)
  if (isLoggedIn) {
    return null;
  }

  // Prevent flash while checking auth on initial client hydration
  if (isCheckingAuth) {
    return null;
  }

  return (
    <>
      {/* Global Lead Capture Popup Modal (Public only) */}
      <LeadCaptureModal />

      {/* Global Interactive AI Chatbot Widget (Public only) */}
      <AiChatbotWidget />

      {/* Floating Instagram Social Button (Public only) */}
      <a
        className="fixed left-3 bottom-4 z-50 sm:left-5 sm:bottom-6 md:left-6 md:bottom-8 transition-transform duration-300 hover:scale-125 hover:-translate-y-2 hover:rotate-6 animate-floatingSmooth"
        href="https://www.instagram.com/texwebsolution.in/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow TexWeb Solution on Instagram"
      >
        <div className="relative w-13 h-13 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-14 lg:h-14">
          <Image
            width={240}
            height={240}
            alt="Instagram"
            className="object-contain drop-shadow-[0_0_8px_rgba(255,0,150,0.25)] hover:drop-shadow-[0_0_15px_rgba(255,50,180,0.45)] transition-all duration-300"
            src="/common/Insta.svg"
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              color: "transparent",
            }}
          />
        </div>
      </a>

      {/* Floating WhatsApp Quick Action Button (Public only) */}
      <a
        className="fixed right-3 bottom-4 z-50 sm:right-5 sm:bottom-6 md:right-6 md:bottom-8 transition-transform duration-300 hover:scale-125 hover:-translate-y-2 hover:rotate-6 animate-floatingSmooth"
        href="https://wa.me/+917462827259"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with TexWeb Solution on WhatsApp"
      >
        <div className="relative w-15 h-15 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16">
          <Image
            width={64}
            height={64}
            alt="WhatsApp"
            className="object-contain drop-shadow-[0_0_8px_rgba(0,255,70,0.25)] hover:drop-shadow-[0_0_15px_rgba(0,255,100,0.45)] transition-all duration-300"
            src="/common/WhatsApp.svg"
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              color: "transparent",
            }}
          />
        </div>
      </a>
    </>
  );
}
