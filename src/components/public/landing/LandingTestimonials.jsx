"use client";

import Image from "next/image";
import { Star, Quote, CheckCircle2 } from "lucide-react";

const REVIEWS = [
  {
    name: "Dr. MD Rashid (PT)",
    role: "Founder, Heal Stride Physiotherapy",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/team/dr-md-rashid-pt.jpg",
    content: "TexWeb Solution built an outstanding clinical web portal for Heal Stride with doctor booking and Google Business profile optimization. Our patient inquiries in Bhopal grew over 240% in just two months. Their WhatsApp support is immediate!",
    rating: 5,
    tag: "Healthcare Portal",
  },
  {
    name: "Dr. Sohail Abbas",
    role: "Founder & Director, Siwan City Hospital",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/team/dr_sohail_abbas.jpg",
    content: "We needed a modern, trustworthy hospital website for patient appointments and department emergency listings. The team delivered our entire multi-department portal within 10 days. Extremely professional and courteous.",
    rating: 5,
    tag: "Hospital & Emergency",
  },
  {
    name: "Neelam Arora",
    role: "Spiritual Mentor, Meditation Magic",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/customized/neelamarora.jpg",
    content: "Our online courses, guided meditation audio masterclasses, and book sales have seen seamless growth. The mobile layout is buttery smooth and student feedback has been 100% positive.",
    rating: 5,
    tag: "E-Learning & Wellness",
  },
];

export default function LandingTestimonials() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50/60 border-t border-gray-150" style={{ fontFamily: "Matter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold mb-3">
            Client Success Stories
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Trusted by Doctors, Founders & Businesses
          </h2>
          <p className="text-xs sm:text-base text-gray-500 font-poppins mt-2 font-light">
            Read how leaders transformed their business with our engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REVIEWS.map((rev, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating Stars & Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {rev.tag}
                  </span>
                </div>

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-gray-700 font-poppins leading-relaxed italic">
                  &ldquo;{rev.content}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                  <Image
                    src={rev.image}
                    alt={rev.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-950 flex items-center gap-1">
                    <span>{rev.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </h4>
                  <p className="text-[11px] text-gray-500 font-poppins">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
