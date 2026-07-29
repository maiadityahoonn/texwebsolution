"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import PrebuiltReviews from "@/components/PrebuiltReviews";
import FaqAccordion from "@/components/FaqAccordion";
import GetInTouchSection from "@/components/GetInTouchSection";
import { Sparkles, ArrowUpRight } from "lucide-react";

const PREBUILT_FAQS = [
  {
    question: "What is a \"Prebuilt Solution\"?",
    answer: "A prebuilt solution is a fully developed, launch-ready software platform (like an e-commerce marketplace, ride-sharing app, or food delivery system) that we deploy, brand, and configure for your business within days, bypassing months of custom coding."
  },
  {
    question: "Can I customize a prebuilt SaaS platform?",
    answer: "Yes, absolutely. Once we deploy the initial version, you own the complete source code, allowing us or your in-house developers to customize features, designs, and integrations according to your specific needs."
  },
  {
    question: "What is the typical deployment timeline?",
    answer: "Most of our prebuilt platforms are configured, branded with your assets, and deployed to your live server or app store within 1 to 2 weeks."
  },
  {
    question: "Is there any monthly subscription or licensing fee?",
    answer: "No. You pay a one-time setup fee, and the complete source code ownership is transferred to you. There are no recurring monthly licensing fees or mandatory platform cuts on your sales."
  },
  {
    question: "Do you assist with App Store and Play Store submissions?",
    answer: "Yes! Our team handles the entire deployment process, including publishing the customer and driver/provider apps directly onto your Google Play Store and Apple Store developer accounts."
  }
];

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const res = await fetch("/api/prebuilt_details.json?v=6");
        const data = await res.json();
        // Match the product using slug
        const matched = data[params.slug];
        setProduct(matched);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params?.slug) {
      fetchProductDetails();
    }
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Matter" }}>
            Product Not Found
          </h2>
          <p className="text-gray-500 mb-8 max-w-md">
            The prebuilt solution you are looking for does not exist or has been moved.
          </p>
          <Link href="/prebuilt">
            <button className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Prebuilt Solutions
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-white overflow-x-hidden">
      {/* Hero Header Area */}
      <div
        className="relative w-full flex flex-col bg-no-repeat bg-center bg-cover min-h-[75vh] md:min-h-screen pb-12"
        style={{ backgroundImage: "url('/common/Bg2.png')" }}
      >
        <Navbar />

        <div className="flex-1 flex flex-col justify-center px-6 py-8 md:py-16">
          <div className="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-8 md:gap-12 items-center">

            {/* Left side: Heading and Subtitle */}
            <div className="md:col-span-7 text-left">

              {/* Hero Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter]">
                  Launch Ready SaaS
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter]">
                  Prebuilt Solution
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-red-600 bg-clip-text text-transparent leading-tight pb-2"
                style={{ fontFamily: "Matter, sans-serif" }}
              >
                {product.title}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600/90 max-w-2xl font-poppins font-light leading-relaxed">
                {product.subtitle}
              </p>

              {/* Action Buttons in Hero */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link href={`/contact?product=${encodeURIComponent(product.title)}`}>
                  <button className="px-8 py-3.5 bg-red-600 text-white rounded-full shadow-lg shadow-red-600/15 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold font-[Matter]">
                    Request a Demo
                  </button>
                </Link>
                <a
                  href={`https://wa.me/+917462827259?text=Hi,%20I'm%20interested%20in%20the%20${encodeURIComponent(product.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="px-8 py-3.5 bg-white border border-gray-200 text-gray-950 rounded-full shadow-sm hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold font-[Matter] flex items-center gap-2">
                    <img src="/common/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" /> WhatsApp Live
                  </button>
                </a>
              </div>
            </div>

            {/* Right side: Mockup Phone Animation / Video */}
            <div className="md:col-span-5 flex justify-center items-center">
              {product.phoneGif && product.phoneGif.endsWith(".mp4") ? (
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-auto hover:scale-[1.03] transition-all duration-300 pointer-events-none select-none">
                  {/* Crisp Solid White Background strictly fitted inside phone screen bezel */}
                  <div className="absolute inset-x-[6.5%] inset-y-[2.8%] bg-white rounded-[30px] sm:rounded-[36px]" />
                  
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    disableRemotePlayback
                    controlsList="nodownload nofullscreen noremoteplayback"
                    className="relative z-10 w-full h-auto object-contain pointer-events-none select-none"
                    style={{ mixBlendMode: "multiply" }}
                  >
                    <source src={product.phoneGif} type="video/mp4" />
                  </video>
                </div>
              ) : product.phoneGif ? (
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-auto hover:scale-[1.03] transition-all duration-300">
                  <div className="absolute inset-x-[6.5%] inset-y-[2.8%] bg-white rounded-[30px] sm:rounded-[36px]" />
                  <img
                    src={product.phoneGif}
                    alt={`${product.title} Demo`}
                    className="relative z-10 w-full h-auto object-contain"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </div>
              ) : null}
            </div>

          </div>
        </div>


      </div>

      {/* What All We Offer Section */}
      <section className="py-20 md:py-28 bg-white font-poppins border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-5 py-2 bg-red-50 text-red-600 border border-red-100/80 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter]">
            Features & Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight mt-6 mb-16" style={{ fontFamily: "Matter" }}>
            What All We Offer
          </h2>

          <div className="space-y-24">
            {product.offers.map((offer, index) => {
              const isImageLeft = index % 2 === 0;
              return (
                <div
                  key={offer.title}
                  className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center text-left"
                >
                  {/* Image Side */}
                  <div
                    className={`flex justify-center items-center rounded-3xl bg-[#F5F5F5] w-full max-w-lg aspect-4/3 overflow-hidden p-6 shadow-inner relative group border border-neutral-100/50 ${isImageLeft ? "md:order-1" : "md:order-2"
                      }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 via-rose-500/5 to-transparent rounded-3xl pointer-events-none"></div>
                    {offer.image ? (
                      <img
                        alt={offer.title}
                        className="rounded-xl w-[95%] h-auto object-contain hover:scale-[1.03] transition-all duration-300 shadow-xl relative z-10"
                        src={offer.image}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-[90%] aspect-video rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-200/50 flex flex-col items-center justify-center p-6 text-center relative z-10 shadow-lg">
                        <Sparkles className="w-12 h-12 text-red-500 mb-3" />
                        <h4 className="font-semibold text-gray-900 font-[Matter]">{offer.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Production-ready interface mockup loading...</p>
                      </div>
                    )}
                  </div>

                  {/* Text Side */}
                  <div
                    className={`p-2 lg:p-6 ${isImageLeft ? "md:order-2" : "md:order-1"
                      }`}
                  >
                    <div className="flex items-center gap-3.5 mb-5">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold font-[Matter]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className="text-2xl md:text-3xl font-bold text-gray-900 font-[Matter]"
                      >
                        {offer.title}
                      </h3>
                    </div>

                    <p className="text-base text-gray-600/90 leading-relaxed font-light mb-6">
                      {offer.desc}
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Fully Integrated Component</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Solution Section */}
      {product.whyChooseUs && product.whyChooseUs.length > 0 && (
        <section className="py-20 md:py-28 bg-gradient-to-b from-neutral-50 to-white border-y border-gray-100 font-poppins">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <span className="inline-block px-5 py-2 bg-red-50 text-red-600 border border-red-100/80 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter]">
              Strategic Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent leading-tight mt-6 mb-16" style={{ fontFamily: "Matter" }}>
              Why Choose Our Solution?
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {product.whyChooseUs.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-3xl border border-neutral-100/80 hover:border-red-200/80 shadow-sm hover:shadow-lg hover:shadow-red-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col relative group overflow-hidden"
                >
                  {/* Subtle Top Border Glow */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500/0 via-red-500/40 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6 shrink-0 shadow-sm group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    {item.icon ? (
                      <img src={item.icon} alt={item.title} className="w-6 h-6 object-contain group-hover:invert transition-all duration-300" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 font-[Matter] group-hover:text-red-600 transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed font-light flex-1">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Client Testimonials */}
      {/* Prebuilt Software Reviews */}
      <PrebuiltReviews />

      {/* FAQ Accordion */}
      <FaqAccordion faqs={PREBUILT_FAQS} badge="SaaS FAQ" />

      {/* Get In Touch section */}
      <GetInTouchSection />

      <Footer />
    </div>
  );
}
