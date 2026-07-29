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
  title: "TexWebSolution",
  description: "From idea to launch, we design and develop tailor-made websites & apps that scale with your business.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${matter.variable} ${clashDisplay.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
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
