"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Bell, 
  Wifi, 
  Share, 
  PlusSquare, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  FolderDown
} from "lucide-react";

export default function DownloadPage() {
  const [activeTab, setActiveTab] = useState("android"); // "android" | "ios" | "desktop"

  useEffect(() => {
    // Detect OS for default tab
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActiveTab("ios");
      } else if (/android/.test(ua)) {
        setActiveTab("android");
      } else {
        setActiveTab("desktop");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-poppins selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Background Graphic Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 -z-10"
        style={{ backgroundImage: "url('/common/Bg2.png')", backgroundRepeat: "no-repeat", backgroundPosition: "top center", backgroundSize: "cover" }}
      />

      <Navbar />

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="pt-6 sm:pt-10 pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-1.5 text-xs text-gray-500 font-poppins">
          <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="font-semibold text-gray-800">Download</span>
        </nav>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-xs font-semibold mb-6">
          <Smartphone className="w-4 h-4" />
          <span>Android & iOS Mobile App</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-5" style={{ fontFamily: "Matter" }}>
          TexWeb, now on your <span className="text-red-600">phone</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Run your whole client business from your pocket — leads, projects, invoices and payments. Free download, straight from us.
        </p>

        {/* Direct Download CTA */}
        <div className="flex flex-col items-center justify-center gap-3">
          <a
            href="/texwebsolution.apk"
            download="TexWebSolution.apk"
            className="inline-flex items-center gap-3 bg-gray-950 hover:bg-gray-800 text-white font-bold px-8 sm:px-10 py-4 rounded-full text-base shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            style={{ fontFamily: "Matter" }}
          >
            <Download className="w-5 h-5 text-white" />
            <span>Download APK</span>
          </a>

          <p className="text-xs sm:text-sm text-gray-500 font-poppins mt-1">
            Version 1.3.3 · 4.6 MB · Android 7.0 and newer
          </p>
          <p className="text-[11px] text-gray-400 font-poppins">
            Updated September 2026
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* WHY DIRECT DOWNLOAD SECTION */}
      {/* ========================================================================= */}
      <section className="px-4 pb-12 max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-red-50/60 via-white to-gray-50 border border-red-200/70 rounded-3xl p-6 sm:p-9 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5" style={{ fontFamily: "Matter" }}>
            Why is this a direct download?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-poppins">
            We&apos;re publishing to the Play Store soon. Rather than make you wait for review, you can install the app today straight from us. It&apos;s the same TexWeb Solution you already use — a signed, secure app around <span className="font-semibold text-gray-900">texwebsolution.in</span>, with the same account, the same data and the same privacy rules.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* HOW TO INSTALL IT (STEP-BY-STEP) */}
      {/* ========================================================================= */}
      <section className="px-4 pb-16 max-w-3xl mx-auto">
        <div className="text-left mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "Matter" }}>
            How to install it
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-poppins mt-1.5">
            Takes about a minute. Android shows a couple of security warnings along the way — that&apos;s normal for any app installed outside the Play Store, and here&apos;s exactly what they look like.
          </p>
        </div>

        <ol className="space-y-4 font-poppins">
          <li className="flex gap-4 items-start bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">1</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Tap Download APK</h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
                Chrome will warn that &quot;this type of file can harm your device&quot;. That message appears for every APK on the internet. Choose <strong>Download anyway</strong>.
              </p>
            </div>
          </li>

          <li className="flex gap-4 items-start bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">2</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Open the downloaded file</h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
                Tap the download notification, or find <strong>TexWebSolution.apk</strong> in Files → Downloads and tap it.
              </p>
            </div>
          </li>

          <li className="flex gap-4 items-start bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">3</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Allow installs from this source</h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
                Android will say your phone &quot;isn&apos;t allowed to install unknown apps from this source&quot;. Tap <strong>Settings</strong>, turn on <strong>Allow from this source</strong>, then press back.
              </p>
            </div>
          </li>

          <li className="flex gap-4 items-start bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">4</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Install</h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
                Tap <strong>Install</strong>. If Play Protect offers to scan the app or says it wasn&apos;t recognised, choose <strong>Install anyway</strong> — it flags everything that doesn&apos;t come from the Play Store.
              </p>
            </div>
          </li>

          <li className="flex gap-4 items-start bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">5</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Sign in</h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
                Open TexWeb Solution and sign in with the same email credentials provided by your Team Leader or Admin. All your workspace data is right there.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* ========================================================================= */}
      {/* WHAT YOU GET (3 CARDS) */}
      {/* ========================================================================= */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-center font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-9" style={{ fontFamily: "Matter" }}>
          What you get
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="h-full rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Smartphone className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-bold text-gray-900 text-base" style={{ fontFamily: "Matter" }}>Built for your phone</h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600 font-poppins">
              Bottom navigation, swipeable sprint pipelines and full-screen workspace — sized perfectly for one-hand use.
            </p>
          </div>

          <div className="h-full rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <FolderDown className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-bold text-gray-900 text-base" style={{ fontFamily: "Matter" }}>Real file downloads</h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600 font-poppins">
              Invoices, verified certificates and task attachments save straight into your Downloads folder like any other app.
            </p>
          </div>

          <div className="h-full rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-bold text-gray-900 text-base" style={{ fontFamily: "Matter" }}>Same secure account</h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600 font-poppins">
              The app is a signed, secure wrapper around texwebsolution.in. Your data lives safely in your TexWeb account on Supabase Cloud.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* IF SOMETHING GOES WRONG */}
      {/* ========================================================================= */}
      <section className="px-4 pb-20 max-w-3xl mx-auto">
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-6 sm:p-8 font-poppins">
          <h2 className="flex items-center gap-2 font-bold text-lg text-gray-900 mb-4" style={{ fontFamily: "Matter" }}>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>If something goes wrong</span>
          </h2>
          
          <dl className="space-y-4 text-xs sm:text-sm">
            <div>
              <dt className="font-bold text-gray-900">&ldquo;Install blocked&rdquo; or &ldquo;unknown apps&rdquo;</dt>
              <dd className="mt-1 leading-relaxed text-gray-600">Step 3 above — turn on <em>Allow from this source</em> for whichever app you opened the file with (usually Chrome or Files).</dd>
            </div>
            <div>
              <dt className="font-bold text-gray-900">&ldquo;App not installed&rdquo;</dt>
              <dd className="mt-1 leading-relaxed text-gray-600">You likely have an older build installed. Uninstall it and try again — your data is safe in your account, not on the phone.</dd>
            </div>
            <div>
              <dt className="font-bold text-gray-900">Need support?</dt>
              <dd className="mt-1 leading-relaxed text-gray-600">Contact our support desk at <a href="mailto:info@texwebsolution.in" className="text-red-600 font-semibold underline">info@texwebsolution.in</a> or WhatsApp at <a href="https://wa.me/+917462827259" className="text-red-600 font-semibold underline">+91 7462827259</a>.</dd>
            </div>
          </dl>
        </div>
      </section>

      <Footer />
    </div>
  );
}
