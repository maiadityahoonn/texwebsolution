"use client";

import { useState } from "react";

const WEBSITES = [
  {
    "title": "Sarvadnya Vidyapeeth : College Portal",
    "image": "customized/sarvadnya.jpg",
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
    "image": "customized/trendkromedia.jpg",
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
    "image": "customized/neelamarora.jpg",
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
    "image": "customized/ruchiupadhyay.jpg",
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
    "image": "customized/team360.jpg",
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
    "title": "Kirtilals : Luxury Website",
    "image": "customized/project2.webp",
    "imageAlt": "Kirtilals : Luxury Website",
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
    "title": "Tradescribe: Trading Platform",
    "image": "customized/project3.webp",
    "imageAlt": "Tradescribe: Trading Platform",
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
    "title": "Momentz",
    "image": "customized/project6.webp",
    "imageAlt": "Momentz",
    "bullets": [
      "Create lasting memories with Momentz's custom photo printing portal built for shutterbugs.",
      "Upload pictures, select frames, and order personalized gifts with drag-and-drop crop tools.",
      "Integrated with secure bulk uploads, custom filters, and fast door-to-door delivery."
    ],
    "buttonText": "View Website",
    "buttonLink": "https://momentz.in/",
    "imageOrder": 2
  }
];

const APPLICATIONS = [
  {
    "title": "MinitPe: Food Taxi and Grocery",
    "image": "customized/app1.webp",
    "imageAlt": "MinitPe: Food Taxi and Grocery",
    "bullets": [
      "Get food, rides, and groceries delivered with MinitPe's custom all-in-one super app.",
      "Order from local spots, book quick cab rides, and buy fresh milk with live tracking.",
      "Integrated with secure digital wallet, multiple payment options, and route optimization."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.ghiniba.customer&pcampaignid=web_share",
    "imageOrder": 1
  },
  {
    "title": "Threadclothes Women's Fashion",
    "image": "customized/app2.webp",
    "imageAlt": "Threadclothes Women's Fashion",
    "bullets": [
      "Shop women's fashion wear with Threadclothes' custom mobile shopping app.",
      "Browse ethnic wear, dresses, and sets with dynamic filters and high-res zoom.",
      "Integrated with easy cash-on-delivery options, wallet points, and simple return flows."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.threadclothes.android&pcampaignid=web_share",
    "imageOrder": 2
  },
  {
    "title": "Uoons Electronics Shopping App",
    "image": "customized/app3.webp",
    "imageAlt": "Uoons Electronics Shopping App",
    "bullets": [
      "Buy smart TVs, mobiles, and accessories with Uoons' custom online shopping app.",
      "Compare price points, check ratings, and buy products with secure payment gateways.",
      "Integrated with automated coupons, seller chat support, and live parcel tracking."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.uoons.india&pcampaignid=web_share",
    "imageOrder": 1
  },
  {
    "title": "Women Plus by Monika",
    "image": "customized/app4.webp",
    "imageAlt": "Women Plus by Monika",
    "bullets": [
      "Explore plus-size fashion wear with Women Plus' custom mobile shopping app.",
      "Browse catalog, select sizes, and place orders with instant WhatsApp confirmation.",
      "Integrated with size guides, dynamic pricing models, and secure UPI payment."
    ],
    "buttonText": "View App",
    "buttonLink": "https://play.google.com/store/apps/details?id=com.womenplusindia&pcampaignid=web_share",
    "imageOrder": 2
  }
];

export default function CustomizedTabs() {
  const [activeTab, setActiveTab] = useState("websites"); // "websites" or "applications"

  const currentList = activeTab === "websites" ? WEBSITES : APPLICATIONS;

  return (
    <section className="mt-4 w-full font-[Matter]" id="customized">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
          Customized Solutions
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-10 px-3 leading-tight pb-1">
          Tailored to your needs
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
                  <img 
                    alt={project.imageAlt} 
                    className="rounded-2xl max-h-full max-w-full h-auto w-auto object-contain hover:scale-[1.03] transition-all duration-150" 
                    src={project.image}
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
                    <a href={project.buttonLink} target="_blank" rel="noopener noreferrer">
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
