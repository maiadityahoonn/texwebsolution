"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Force browser to NOT auto-restore old scroll positions
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetToTop = () => {
      if (typeof window === "undefined") return;

      const html = document.documentElement;
      const originalBehavior = html ? html.style.scrollBehavior : "";

      // Temporarily disable smooth scroll so the reset is instantaneous and not cancelled midway
      if (html) html.style.scrollBehavior = "auto";

      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;

      // Restore original scroll behavior after DOM has settled
      setTimeout(() => {
        if (html) html.style.scrollBehavior = originalBehavior;
      }, 50);
    };

    // Execute immediately
    resetToTop();

    // Re-verify on animation frame and short delay to override layout shifts from images or async CMS data
    const rAf = requestAnimationFrame(resetToTop);
    const timer = setTimeout(resetToTop, 80);

    return () => {
      cancelAnimationFrame(rAf);
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on internal links to guarantee page opens from top (0, 0)
    const handleLinkClick = (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Handle internal routes (starting with / but not external, mailto, tel, or whatsapp)
      if (href.startsWith("/") && !href.startsWith("/#") && !link.target) {
        const targetPath = href.split("?")[0].split("#")[0];
        const currentPath = window.location.pathname;

        if (targetPath !== currentPath) {
          window.scrollTo(0, 0);
          if (document.documentElement) document.documentElement.scrollTop = 0;
          if (document.body) document.body.scrollTop = 0;
        }
      }
    };

    document.addEventListener("click", handleLinkClick, { passive: true });
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  return null;
}
