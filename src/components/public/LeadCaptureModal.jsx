"use client";

import LandingQuoteModal from "./landing/LandingQuoteModal";

/**
 * LeadCaptureModal is superseded by LandingQuoteModal (the high-converting Meta 2-step interactive quote modal).
 * This component re-exports LandingQuoteModal to ensure 100% backward compatibility across all routes.
 */
export default function LeadCaptureModal() {
  return <LandingQuoteModal />;
}
