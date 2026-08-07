import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import AiChatbotWidget from "@/components/AiChatbotWidget";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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

export const metadata = {
  metadataBase: new URL("https://texwebsolution.in"),
  title: {
    default: "TexWeb Solution | Tailor-Made Website & Mobile App Development",
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
    canonical: "https://texwebsolution.in",
  },
  openGraph: {
    title: "TexWeb Solution | Tailor-Made Website & Mobile App Development",
    description:
      "From idea to launch, TexWeb Solution designs and develops tailor-made websites, custom mobile apps, AI automation, and digital marketing strategies.",
    url: "https://texwebsolution.in",
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
    title: "TexWeb Solution | Tailor-Made Website & Mobile App Development",
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
      "url": "https://texwebsolution.in",
      "name": "TexWeb Solution",
      "alternateName": ["TexWebSolution", "TexWeb Solution India"],
      "publisher": {
        "@id": "https://texwebsolution.in/#organization"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://texwebsolution.in/#organization",
      "name": "TexWeb Solution",
      "url": "https://texwebsolution.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://texwebsolution.in/logo.png",
        "width": 1024,
        "height": 1024
      },
      "image": "https://texwebsolution.in/logo.png",
      "description":
        "From idea to launch, TexWeb Solution designs and develops tailor-made websites, custom mobile apps, AI automation, and digital marketing strategies.",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+91-7462827259",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        }
      ],
      "sameAs": [
        "https://www.instagram.com/texwebsolution.in/",
        "https://wa.me/+917462827259"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      "@id": "https://texwebsolution.in/#sitelinks",
      "name": "TexWeb Solution Sitelinks",
      "hasPart": [
        {
          "@type": "WebPage",
          "name": "About Us",
          "url": "https://texwebsolution.in/about-us",
          "description": "We specialize in custom web apps, prebuilt software, AI automation, and digital marketing solutions."
        },
        {
          "@type": "WebPage",
          "name": "Contact Us",
          "url": "https://texwebsolution.in/contact",
          "description": "Contact Us. From idea to launch, we design and develop tailor-made websites & apps."
        },
        {
          "@type": "WebPage",
          "name": "Digital Marketing",
          "url": "https://texwebsolution.in/digital-marketing",
          "description": "Strategic SEO, social media marketing, PPC campaigns, and brand growth strategies."
        },
        {
          "@type": "WebPage",
          "name": "AI Automation",
          "url": "https://texwebsolution.in/ai-automation",
          "description": "Custom AI chatbots, automated business workflows, and intelligent software integration."
        },
        {
          "@type": "WebPage",
          "name": "Prebuilt SaaS Software",
          "url": "https://texwebsolution.in/prebuilt",
          "description": "Empower your business with ready-to-launch prebuilt web and SaaS software solutions."
        },
        {
          "@type": "WebPage",
          "name": "Customized Solutions",
          "url": "https://texwebsolution.in/customized",
          "description": "Tailor-made full-stack web and mobile application engineering built to scale."
        }
      ]
    }
  ];

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${matter.variable} ${clashDisplay.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-48x48.png" type="image/png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="TexWeb Solution" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans" suppressHydrationWarning>
        {children}
        
        {/* Global Lead Capture Popup Modal */}
        <LeadCaptureModal />

        {/* Global Interactive AI Chatbot Widget */}
        <AiChatbotWidget />

        {/* Floating Social Media Buttons */}
        <a 
          className="fixed left-3 bottom-4 z-50 sm:left-5 sm:bottom-6 md:left-6 md:bottom-8 transition-transform duration-300 hover:scale-125 hover:-translate-y-2 hover:rotate-6 animate-floatingSmooth" 
          href="https://www.instagram.com/texwebsolution.in/" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="relative w-13 h-13 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-14 lg:h-14">
            <img 
              alt="Instagram" 
              className="object-contain drop-shadow-[0_0_8px_rgba(255,0,150,0.25)] hover:drop-shadow-[0_0_15px_rgba(255,50,180,0.45)] transition-all duration-300" 
              src="/common/Insta.svg" 
              style={{ position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0, color: "transparent" }}
            />
          </div>
        </a>

        <a 
          className="fixed right-3 bottom-4 z-50 sm:right-5 sm:bottom-6 md:right-6 md:bottom-8 transition-transform duration-300 hover:scale-125 hover:-translate-y-2 hover:-rotate-6 animate-floatingSmooth" 
          href="https://wa.me/+917462827259" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="relative w-15 h-15 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16">
            <img 
              alt="WhatsApp" 
              className="object-contain drop-shadow-[0_0_8px_rgba(0,255,70,0.25)] hover:drop-shadow-[0_0_15px_rgba(0,255,100,0.45)] transition-all duration-300" 
              src="/common/WhatsApp.svg" 
              style={{ position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0, color: "transparent" }}
            />
          </div>
        </a>
      </body>
    </html>
  );
}

