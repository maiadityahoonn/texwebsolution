"use client";

import Image from "next/image";
import { useState } from "react";
import { createStaticCms } from "@/lib/staticCms";
import { safeExternalUrl } from "@/lib/safeUrl";

const WEBSITES = [
  {
    "title": "Sarvadnya Vidyapeeth : College Portal",
    "image": "/customized/sarvadnya.jpg",
    "imageAlt": "Sarvadnya Vidyapeeth : Modern College Admission Website",
    "bullets": [
      "Fostering academic excellence with a modern college admission & departmental portal built for higher education institutes.",
      "Explore BCA, BBA, and skill-based higher education with online admission enquiries, course curriculum, and Bihar Student Credit Card integration.",
      "Features fast responsive UI, interactive campus life galleries, NIRF/NAAC highlights, and instant WhatsApp support."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://www.sarvadnyavidyapeeth.in/",
    "imageOrder": 1
  },
  {
    "title": "Trend Kro Media : Digital Growth Platform",
    "image": "/customized/trendkromedia.jpg",
    "imageAlt": "Trend Kro Media : Digital Growth & Branding Platform",
    "bullets": [
      "Empower brands & entrepreneurs with custom digital growth management, personal branding, and high-impact media coverage.",
      "Explore TEDx speaker opportunities, podcast features, organic growth strategies, and strategic consulting booking.",
      "Built with high-converting dark-theme UI, interactive service showcases, case studies, and instant strategy call scheduling."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://www.trendkromedia.com/",
    "imageOrder": 2
  },
  {
    "title": "Meditation Magic : Spiritual Learning Platform",
    "image": "/customized/neelamarora.jpg",
    "imageAlt": "Meditation Magic : Spiritual Learning & Healing Platform",
    "bullets": [
      "Experience transformative guided meditation, angelic healing, Kriya Yoga, and spiritual wellness masterclasses by Neelam Arora.",
      "Explore curated online courses, guided audio meditations, books, and blog resources for inner peace and mindfulness.",
      "Integrated with secure online course enrollment, interactive video modules, instant consultation booking, and e-store."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://www.neelamarora.in/",
    "imageOrder": 1
  },
  {
    "title": "Ruchi Upadhyay Classes : EdTech Platform",
    "image": "/customized/ruchiupadhyay.jpg",
    "imageAlt": "Ruchi Upadhyay Classes : Chemistry Learning Platform",
    "bullets": [
      "Master Chemistry & Science with expert-led online coaching for Class 9th-12th, IIT-JEE, NEET, and Olympiad preparations.",
      "Access interactive live classes, downloadable study notes, practice test series, and board exam revision modules.",
      "Features student login dashboard, course progress tracking, performance analytics, and direct doubt resolution portal."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://www.ruchiupadhyayclasses.in/",
    "imageOrder": 2
  },
  {
    "title": "Team 360 : Spiritual & Mind Mentorship",
    "image": "/customized/team360.jpg",
    "imageAlt": "Team 360 with D.D. Sharma : Spiritual & Mind Mentorship Platform",
    "bullets": [
      "Empower your mind and spiritual growth with Team 360's signature programs, Gayatri mentorship, and peak mind training by D.D. Sharma Ji.",
      "Browse live and recorded video courses, spiritual literature books, workshop registrations, and center authorization modules.",
      "Integrated with user login, video streaming portal, digital book library, and seamless online booking systems."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://www.devendraduttsharma.com/",
    "imageOrder": 1
  },
  {
    "title": "Kirtilals : Luxury Jewellery E-commerce",
    "image": "/customized/kirtilals.jpg",
    "imageAlt": "Kirtilals : Luxury Jewellery E-commerce",
    "bullets": [
      "Discover fine diamond jewelry from Kirtilals with an online shopping portal built for luxury brands.",
      "Browse bridal sets, solitaire rings, and custom designs with high-res zoom and details.",
      "Integrated with secure booking options for virtual consults and store appointments."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://www.kirtilals.com/",
    "imageOrder": 2
  },
  {
    "title": "TradeScribe : Trading Journal Platform",
    "image": "/customized/tradescribe.jpg",
    "imageAlt": "TradeScribe : Trading Journal Platform",
    "bullets": [
      "Empower your trading journey with Tradescribe's custom analytics platform built for active traders.",
      "Analyze stock patterns, crypto trends, and futures with custom charts and live metrics.",
      "Integrated with advanced security protocols and lightning-fast load times for real-time tracking."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://tradescribe.in/",
    "imageOrder": 1
  },
  {
    "title": "Momentz : Home Decor & Luxury Gifting",
    "image": "/customized/momentz.jpg",
    "imageAlt": "Momentz : Home Decor & Luxury Gifting",
    "bullets": [
      "Create lasting memories with Momentz's custom photo printing portal built for shutterbugs.",
      "Upload pictures, select frames, and order personalized gifts with drag-and-drop crop tools.",
      "Integrated with secure bulk uploads, custom filters, and fast door-to-door delivery."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://momentz.in/",
    "imageOrder": 2
  },
  {
    "title": "Heal Stride : Physiotherapy & Wellness",
    "image": "/customized/healstride.jpg",
    "imageAlt": "Heal Stride : Advanced Physiotherapy & Rehabilitation Clinic",
    "bullets": [
      "Bhopal's premier non-surgical pain management and advanced physiotherapy rehabilitation clinic.",
      "Specialized in sports injury rehab, certified cupping therapy, dry needling, and non-invasive orthopedic care.",
      "Integrated with instant doctor callbacks, online appointment booking, doctor profile showcase, and bilingual support."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://www.healstride-physiotherapy.in/",
    "imageOrder": 1
  },
  {
    "title": "Siwan City Hospital : Multi-Speciality Healthcare",
    "image": "/customized/siwancityhospital.jpg",
    "imageAlt": "Siwan City Hospital : Premier Multi-Speciality Healthcare Website",
    "bullets": [
      "Premier multi-speciality hospital in Siwan, Bihar led by Dr. Sohail Abbas, providing 24/7 emergency & intensive care.",
      "Specialized in advanced orthopaedic surgery, maternity & neonatal care, diagnostic lab, and cashless mediclaim facility.",
      "Integrated with online doctor appointment booking, Ayushman Bharat (PM-JAY) schemes, and instant emergency helpline."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://www.siwancityhospital.com/",
    "imageOrder": 2
  },
  {
    "title": "Samay Hospital : Multi-Speciality Hospital",
    "image": "/customized/samayhospital.jpg",
    "imageAlt": "Samay Hospital : Multi-Speciality Hospital Website",
    "bullets": [
      "Leading multi-speciality hospital network in Patna & Ara, Bihar, offering 24/7 ICU and emergency trauma services.",
      "Equipped with 50+ hospital beds, 11+ expert specialists, advanced diagnostics, and dedicated patient support desk.",
      "Integrated with online OPD appointment booking, doctor profiles, department showcases, and instant emergency calls."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://samayhospitals.org/",
    "imageOrder": 1
  },
  {
    "title": "Anikara : Luxury Fashion E-commerce",
    "image": "/customized/anikara.jpg",
    "imageAlt": "Anikara : Luxury Fashion E-commerce Website",
    "bullets": [
      "Sophisticated online boutique for modern women featuring designer dresses, co-ords, footwear, and luxury bags.",
      "Engineered with fast visual filtering, size selectors, dynamic wishlist, coupon discounts, and 100% luxe fabric highlights.",
      "Integrated with secure checkout gateways, automated tracking, hassle-free 15-day exchange flow, and instant customer support."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://anikara-e-commerce-websites.vercel.app/?page=home",
    "imageOrder": 2
  }
];

const APPLICATIONS = [
  {
    "title": "MinitPe : On-Demand Grocery & Food Delivery",
    "image": "/customized/minitpe.jpg",
    "imageAlt": "MinitPe : On-Demand Grocery & Food Delivery App",
    "bullets": [
      "A feature-rich on-demand grocery & food delivery app built to make daily shopping faster and effortless.",
      "Explore endless dishes from top local restaurants and order fresh groceries delivered right to your doorstep.",
      "Integrated with multi-payment options (COD, cards, UPI), real-time order tracking, and 24x7 live chat support."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.ghiniba.customer&pcampaignid=web_share",
    "imageOrder": 1
  },
  {
    "title": "Threadclothes : Fashion Shopping Mobile App",
    "image": "/customized/threadclothes.jpg",
    "imageAlt": "Threadclothes : Fashion Shopping Mobile App",
    "bullets": [
      "A modern fashion shopping app designed for a stylish and comfortable shopping experience for women.",
      "Explore exclusive designer ethnic wear, anarkalis, dresses, and sets with smooth wishlist sharing.",
      "Integrated with secure checkout, automated order tracking, and hassle-free easy returns within 7 days."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.threadclothes.android&pcampaignid=web_share",
    "imageOrder": 2
  },
  {
    "title": "Uoons : Electronics Shopping Mobile App",
    "image": "/customized/uoons.jpg",
    "imageAlt": "Uoons : Electronics Shopping Mobile App",
    "bullets": [
      "A modern, user-friendly electronics shopping app built to browse and buy mobiles, laptops, and gadgets.",
      "Compare specs, choose languages (English/Hindi), explore daily deals, and enjoy smooth EMI & payment options.",
      "Integrated with multiple payment options (COD, debit/credit, UPI, wallet), order tracking, and fast delivery."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.uoons.india&pcampaignid=web_share",
    "imageOrder": 1
  },
  {
    "title": "Women Plus : Luxury Ethnic Indian Fashion",
    "image": "/customized/womenplus.jpg",
    "imageAlt": "Women Plus : Luxury Ethnic Indian Fashion App",
    "bullets": [
      "A premium ethnic fashion shopping app featuring suits, kurtas, co-ords, and dresses for every occasion.",
      "Discover latest festive collections with inclusive sizing (L to 5XL), size guides, and visual search.",
      "Integrated with smooth shopping experience, secure multiple payment options, and instant WhatsApp updates."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.womenplusindia&pcampaignid=web_share",
    "imageOrder": 2
  },
  {
    "title": "Twin Leaves : Fresh Groceries Delivered to You",
    "image": "/customized/twinleaves.jpg",
    "imageAlt": "Twin Leaves : On-Demand Fresh Grocery Shopping App",
    "bullets": [
      "A convenient grocery app offering fresh fruits, vegetables, daily essentials, and doorstep delivery.",
      "Explore 9,000+ products across categories with wide product range, exclusive offers, and discounts.",
      "Integrated with user-friendly UI, instant UPI/card/COD checkout, and fast & reliable doorstep delivery."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.twinleaves",
    "imageOrder": 1
  },
  {
    "title": "Reeta Fashion : Women's Ethnic Wear Shopping App",
    "image": "/customized/reetafashion.jpg",
    "imageAlt": "Reeta Fashion : Women's Ethnic Wear & Indian Fashion App",
    "bullets": [
      "A complete fashion destination for women's ethnic wear, designer kurtis, sarees, suits, and men's wear.",
      "Explore latest collections, exclusive festive styles, wishlist & share with friends, and size guides.",
      "Integrated with easy shopping UI, secure multi-payment options, exclusive deals, and fast delivery."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.reetafashion&pcampaignid=web_share",
    "imageOrder": 2
  },
  {
    "title": "Tracks by Truckoom : Fleet Management & GPS Tracking",
    "image": "/customized/truckoom.jpg",
    "imageAlt": "Tracks by Truckoom : Fleet Management & Real-Time GPS Tracking App",
    "bullets": [
      "Simplifies fleet management hurdles by providing full control over fleets in all stages of delivery.",
      "Live vehicle GPS tracking, route map visualization, speed & distance insights, and job monitoring.",
      "Integrated with fleet dashboard, vehicle ETA insights, and reliable cloud analytics platform."
    ],
    "buttonText": "View App",
    "buttonLink": "https://apps.apple.com/in/app/tracks-by-truckoom/id1608130603",
    "imageOrder": 1
  }
];

export default function CustomizedTabs() {
  const cms = createStaticCms();
  const [activeTab, setActiveTab] = useState("websites"); // "websites" or "applications"

  const websites = cms.list("customized.websites", "websites", WEBSITES);
  const applications = cms.list("customized.applications", "applications", APPLICATIONS);
  const section = cms.block("customized.projects", {
    badge: "Customized Solutions",
    title: "Tailored to your needs",
  });
  const currentList = activeTab === "websites" ? websites : applications;

  return (
    <section className="mt-4 w-full font-[Matter]" id="customized">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
          {section.badge}
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-10 px-3 leading-tight pb-1">
          {section.title}
        </h2>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-16">
          <div className="relative flex bg-gray-100 p-1 rounded-full border border-gray-200 shadow-inner">
            {/* Sliding highlight overlay */}
            <div 
              className={`absolute top-1 bottom-1 rounded-full bg-red-600 shadow-md transition-all duration-300 ease-out ${
                activeTab === "websites" 
                  ? "left-1 w-[100px] sm:w-[120px]" 
                  : "left-[104px] sm:left-[124px] w-[120px] sm:w-[140px]"
              }`}
            />
            
            <button 
              onClick={() => setActiveTab("websites")}
              className={`relative rounded-full px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 z-10 w-[100px] sm:w-[120px] ${
                activeTab === "websites" ? "text-white" : "text-gray-500 hover:text-black"
              }`}
            >
              Websites
            </button>
            <button 
              onClick={() => setActiveTab("applications")}
              className={`relative rounded-full px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 z-10 w-[120px] sm:w-[140px] ${
                activeTab === "applications" ? "text-white" : "text-gray-500 hover:text-black"
              }`}
            >
              Applications
            </button>
          </div>
        </div>

        {/* Staggered detailed grid list */}
        <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 md:px-12 space-y-14 sm:space-y-20 md:space-y-24">
          {currentList.map((project, index) => {
            const isImageLeft = index % 2 === 0;

            return (
              <div 
                key={project.title}
                className="grid md:grid-cols-2 gap-8 md:gap-12 items-center px-0 md:px-6"
              >
                {/* Image Side */}
                <div 
                  className={`flex justify-center items-center rounded-3xl bg-[#F3F3F3] w-full max-w-md aspect-[4/3] overflow-hidden p-3 sm:p-4 md:p-6 shadow-inner mx-auto ${
                    isImageLeft ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <Image width={800} height={600} 
                    alt={project.imageAlt} 
                    className="rounded-2xl max-h-full max-w-full h-auto w-auto object-contain hover:scale-[1.03] transition-all duration-150" 
                    src={project.image ? (project.image.startsWith("/") || project.image.startsWith("http") ? project.image : `/${project.image}`) : "/placeholder.png"}
                    loading="lazy"
                  />
                </div>

                {/* Text / Details Side */}
                <div 
                  className={`rounded-xl p-4 text-left ${
                    isImageLeft ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <h3 
                    className="text-2xl md:text-3xl text-gray-900 mb-6 text-center md:text-left font-medium" 
                    style={{ fontFamily: "Matter" }}
                  >
                    {project.title}
                  </h3>
                  
                  <ul className="space-y-4 mb-6 font-poppins">
                    {project.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm md:text-sm">
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="flex-1 mt-1">{bullet}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-center md:justify-start">
                    <a href={safeExternalUrl(project.buttonLink)} target="_blank" rel="noopener noreferrer">
                      <button 
                        className="px-6 py-2 bg-red-600 text-white rounded-full shadow-md hover:scale-[1.05] hover:bg-red-700 active:scale-[0.96] transition-all duration-100 shadow-red-600/10" 
                        style={{ fontFamily: "Matter" }}
                      >
                        {project.buttonText}
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
