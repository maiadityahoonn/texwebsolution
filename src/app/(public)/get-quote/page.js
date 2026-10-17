import MetaPixelTracker from "@/components/public/landing/MetaPixelTracker";
import LandingHeader from "@/components/public/landing/LandingHeader";
import LandingHeroSection from "@/components/public/landing/LandingHeroSection";
import LandingPortfolioSection from "@/components/public/landing/LandingPortfolioSection";
import LandingFeaturesSection from "@/components/public/landing/LandingFeaturesSection";
import LandingPricingPreview from "@/components/public/landing/LandingPricingPreview";
import LandingTestimonials from "@/components/public/landing/LandingTestimonials";
import LandingFaqSection from "@/components/public/landing/LandingFaqSection";
import LandingMobileStickyBar from "@/components/public/landing/LandingMobileStickyBar";
import Footer from "@/components/public/Footer";

export default function GetQuotePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-red-600 selection:text-white">
      {/* 1. Client-side Meta Ads Pixel & UTM Parameter Tracker */}
      <MetaPixelTracker />

      {/* 2. Focused Meta Ads Header */}
      <LandingHeader />

      {/* 3. Hero Section with Integrated Interactive Quote Form */}
      <LandingHeroSection />

      {/* 4. Live Verified Client Portfolio & Social Proof */}
      <LandingPortfolioSection />

      {/* 5. Key Advantages (Why TexWeb vs Others) */}
      <LandingFeaturesSection />

      {/* 6. Transparent Pricing Plans Preview */}
      <LandingPricingPreview />

      {/* 7. Client Reviews & Video Testimonials */}
      <LandingTestimonials />

      {/* 8. Conversion FAQ Section */}
      <LandingFaqSection />

      {/* 9. Mobile Sticky Floating Bottom Bar */}
      <LandingMobileStickyBar />

      {/* 10. Site Footer */}
      <Footer />
    </main>
  );
}
