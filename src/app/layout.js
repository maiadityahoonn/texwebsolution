import { Suspense } from "react";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import PublicFloatingWidgets from "@/components/public/PublicFloatingWidgets";
import AppSplashScreen from "@/components/public/AppSplashScreen";
import AppBackButtonHandler from "@/components/crm/shell/AppBackButtonHandler";
import ScrollToTop from "@/components/public/ScrollToTop";
import MetaPixelTracker from "@/components/public/landing/MetaPixelTracker";

const poppins = localFont({
  src: [
    { path: "../../public/fonts/Poppins/Poppins-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const matter = localFont({
  src: [
    { path: "../../public/fonts/Matter/Matter-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Matter/Matter-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Matter/Matter-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-matter",
});

const clashDisplay = localFont({
  src: "../../public/fonts/ClashDisplay/ClashDisplay-Regular.woff2",
  variable: "--font-clash",
  weight: "400",
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata = {
  metadataBase: new URL("https://texwebsolution.in"),
  title: {
    default: "TexWeb Solution",
    template: "%s | TexWeb Solution",
  },
  description:
    "From idea to launch, TexWeb Solution designs and develops tailor-made websites, custom mobile apps, AI automation, and digital marketing strategies that scale with your business.",
  keywords: [
    "TexWeb Solution",
    "TexWeb",
    "TexWebSolution",
    "texwebsolution.in",
    "Web Development Company India",
    "Custom Mobile App Development",
    "AI Automation Services",
    "Digital Marketing Agency",
    "Prebuilt SaaS Software",
    "SEO Services India",
    "UI UX Design Agency",
    "Full Stack Web Development"
  ],
  authors: [{ name: "TexWeb Solution", url: "https://texwebsolution.in" }],
  creator: "TexWeb Solution",
  publisher: "TexWeb Solution",
  applicationName: "TexWeb Solution",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "https://texwebsolution.in/",
  },
  openGraph: {
    title: "TexWeb Solution",
    description:
      "From idea to launch, TexWeb Solution designs and develops tailor-made websites, custom mobile apps, AI automation, and digital marketing strategies.",
    url: "https://texwebsolution.in/",
    siteName: "TexWeb Solution",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "TexWeb Solution Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TexWeb Solution",
    description:
      "From idea to launch, TexWeb Solution designs and develops tailor-made websites, custom mobile apps, AI automation, and digital marketing strategies.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://texwebsolution.in/#website",
      "url": "https://texwebsolution.in/",
      "name": "TexWeb Solution",
      "alternateName": [
        "TexWeb",
        "TexWeb Solution",
        "TexWebSolution",
        "TexWeb Solution India",
        "TexWeb Solution Pvt Ltd"
      ],
      "description":
        "We specialize in end-to-end digital solutions including Custom Web & Mobile App Development, Ready SaaS Products, AI & Workflow Automation, and Digital Marketing.",
      "publisher": {
        "@id": "https://texwebsolution.in/#organization"
      },
      "inLanguage": "en-IN"
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://texwebsolution.in/#organization",
      "name": "TexWeb Solution",
      "legalName": "TexWeb Solution",
      "url": "https://texwebsolution.in/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://texwebsolution.in/logo.png",
        "width": 1024,
        "height": 1024
      },
      "image": "https://texwebsolution.in/logo.png",
      "email": "info@texwebsolution.in",
      "telephone": "+91-7462827259",
      "priceRange": "₹1,999 - ₹1,00,000+",
      "description":
        "From idea to launch, TexWeb Solution designs and develops tailor-made websites, custom mobile apps, AI automation, and digital marketing strategies.",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+91-7462827259",
          "contactType": "customer service",
          "email": "info@texwebsolution.in",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        }
      ],
      "address": [
        {
          "@type": "PostalAddress",
          "streetAddress": "A3-405, Kokta Bypass Rd, opposite Transport Nagar, PMAY",
          "addressLocality": "Bhopal",
          "addressRegion": "Madhya Pradesh",
          "postalCode": "462028",
          "addressCountry": "IN"
        },
        {
          "@type": "PostalAddress",
          "streetAddress": "24/A Beniatola Lane",
          "addressLocality": "Kolkata",
          "addressRegion": "West Bengal",
          "postalCode": "700009",
          "addressCountry": "IN"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/texwebsolution.in/",
        "https://wa.me/+917462827259"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": "https://texwebsolution.in/#sitelinks",
      "name": "TexWeb Solution Core Navigation Sitelinks",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Customized Solutions",
          "url": "https://texwebsolution.in/customized/websites",
          "description": "Tailor-made full-stack web and mobile application engineering built to scale."
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Prebuilt SaaS Software",
          "url": "https://texwebsolution.in/prebuilt",
          "description": "Ready-to-launch prebuilt SaaS software, business templates, and CRM systems."
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "AI Automation",
          "url": "https://texwebsolution.in/ai-automation",
          "description": "Custom AI chatbots, intelligent workflows, and automated business integrations."
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Digital Marketing & SEO",
          "url": "https://texwebsolution.in/digital-marketing",
          "description": "Strategic SEO, Google ads PPC, social media management, and branding campaigns."
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "Pricing & Monthly Plans",
          "url": "https://texwebsolution.in/pricing",
          "description": "Transparent web development pricing, SaaS packages & starter plans from ₹1,999/mo ($49/mo)."
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "About Us",
          "url": "https://texwebsolution.in/about-us",
          "description": "Learn about TexWeb Solution — leadership, engineering team, vision & agency history."
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact Us",
          "url": "https://texwebsolution.in/contact",
          "description": "Get in touch with TexWeb Solution via phone, email or 1-on-1 WhatsApp consultation."
        }
      ]
    }
  ];

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${matter.variable} ${clashDisplay.variable} h-full scroll-smooth antialiased no-scrollbar`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-48x48.png" type="image/png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="application-name" content="TexWeb Solution" />
        <meta property="og:site_name" content="TexWeb Solution" />
        <meta name="apple-mobile-web-app-title" content="TexWeb Solution" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        <Script
          id="texweb-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              process.env.NODE_ENV === "production"
                ? `
                  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').catch(function() {});
                    });
                  }
                `
                : `
                  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.getRegistrations().then(function(regs) {
                        regs.forEach(function(r) { r.unregister(); });
                      }).catch(function() {});
                      if ('caches' in window) {
                        caches.keys().then(function(keys) {
                          keys.forEach(function(k) { caches.delete(k); });
                        }).catch(function() {});
                      }
                    });
                  }
                `,
          }}
        />
        <Script
          id="texweb-pointer-safety"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                if (typeof Element !== 'undefined' && Element.prototype && Element.prototype.releasePointerCapture) {
                  var origRelease = Element.prototype.releasePointerCapture;
                  Element.prototype.releasePointerCapture = function(pointerId) {
                    try {
                      if (!this.hasPointerCapture || this.hasPointerCapture(pointerId)) {
                        return origRelease.call(this, pointerId);
                      }
                    } catch (err) {}
                  };
                }
                window.addEventListener('error', function(e) {
                  if (e && e.message && e.message.indexOf('releasePointerCapture') !== -1) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans no-scrollbar" suppressHydrationWarning>
        {/* Global Scroll To Top Controller */}
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>

        {/* Global Meta Pixel Tracker for Public Website Conversion Tracking */}
        <Suspense fallback={null}>
          <MetaPixelTracker />
        </Suspense>

        {/* Native Mobile / Web App Animated Brand Splash Screen */}
        <AppSplashScreen />

        {/* Android Hardware Back Button & Exit App Handler */}
        <AppBackButtonHandler />

        {children}
        
        {/* Floating Public Widgets (Instagram, AI Chatbot, WhatsApp, Lead Modal) - Only displayed on public website for non-logged-in visitors */}
        <PublicFloatingWidgets />
      </body>
    </html>
  );
}
