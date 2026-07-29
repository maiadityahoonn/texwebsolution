"use client";

import Reviews3DCarousel from "@/components/Reviews3DCarousel";
import { Sparkles } from "lucide-react";

const HOMEPAGE_MIXED_REVIEWS = [
  {
    id: 1,
    name: "Dr. Bhuleshwar Patel",
    role: "Founder & Chairman, Sarvadnya Vidyapeeth",
    image: "/dr_bhuleshwar_patel.jpg",
    solution: "Institutional Growth & Video Reels",
    roi: "+380% Lead Growth",
    rating: 5,
    quote: "TexWeb Solution managed our complete social media handling and promotional video reels for Sarvadnya Vidyapeeth. Their strategy resulted in a tremendous surge in student admission inquiries!"
  },
  {
    id: 2,
    name: "Er. VK Gupta",
    role: "Founder, Er. VK Gupta Math Campus",
    image: "/avatars/er_vk_gupta.png",
    solution: "Instagram Growth & Reel Production",
    roi: "3k ➔ 18k+ Followers",
    rating: 5,
    quote: "TexWeb Solution handled our complete Instagram channel management, edited engaging educational reels, and grew our followers from 3,000 to 18,000+. The viral reels converted directly into course sales!"
  },
  {
    id: 3,
    name: "Mrs. Rakhi",
    role: "Founder, Anumeet Cutpiece",
    image: "/avatars/mrs_rakhi.png",
    solution: "Video Shooting & SMM Lead Conversion",
    roi: "+420% Direct Sales",
    rating: 5,
    quote: "TexWeb Solution handles our complete video shooting, reel editing, daily social media posting, and client lead conversions for Anumeet Cutpiece. Outstanding ROI and channel management!"
  },
  {
    id: 4,
    name: "Dr. Ananya Roy",
    role: "Founder, Maa Nisha Seva Sadan",
    image: "/avatars/dr_ananya_roy.png",
    solution: "AI Voice & Appointment Agent",
    roi: "85% Auto Booking",
    rating: 5,
    quote: "The AI voice agent handles patient calls round-the-clock for Maa Nisha Seva Sadan, answers medical FAQs, and syncs with our appointment system. It feels like having a 24/7 receptionist team!"
  },
  {
    id: 5,
    name: "Priya Nambiar",
    role: "Head of Growth, Global Science Academy",
    image: "/avatars/priya_nambiar.png",
    solution: "Multi-Platform AI Lead Agent",
    roi: "4.8x Sales Pipeline",
    rating: 5,
    quote: "Their AI Agent captures incoming Instagram DMs, website chats, and email leads for Global Science Academy, qualifies student budget, and pushes warm leads straight to our sales team's WhatsApp!"
  },
  {
    id: 6,
    name: "Muktesh Narula",
    role: "Founder, Dovesoft Tech",
    image: "/avatars/siddharth_mehta.png",
    solution: "Custom SaaS & Web Platform",
    roi: "99.9% System Uptime",
    rating: 5,
    quote: "TexWeb delivered our custom SaaS platform ahead of schedule with flawless UI/UX, turbo-fast loading speed, and ultra-secure backend integration. Outstanding engineering team!"
  },
  {
    id: 7,
    name: "Siddharth Mehta",
    role: "Operations Lead, FinServe Capital",
    image: "/avatars/siddharth_mehta.png",
    solution: "Document AI & Invoice OCR",
    roi: "95% Faster Audits",
    rating: 5,
    quote: "We automated invoice data extraction and audit verification using TexWeb's custom AI OCR pipeline. What used to take 3 full-time accountants 5 hours now runs in under 45 seconds!"
  },
  {
    id: 8,
    name: "Shriya Sadneni",
    role: "Managing Director, Murzban",
    image: "/avatars/priya_nambiar.png",
    solution: "Custom Mobile App & E-Com Ads",
    roi: "4.5x Revenue Growth",
    rating: 5,
    quote: "Their team built a high-converting e-commerce mobile application and ran targeted marketing campaigns that multiplied our online order revenue by 4.5x in less than 3 months!"
  },
  {
    id: 9,
    name: "Vikramaditya Rao",
    role: "CTO, CloudScale E-Com",
    image: "/avatars/vikramaditya_rao.png",
    solution: "Prebuilt SaaS & RAG AI Chatbot",
    roi: "$45k/yr Cost Saved",
    rating: 5,
    quote: "We deployed TexWeb's prebuilt SaaS e-commerce system with custom RAG AI chatbot integration. It resolves 78% of customer tickets instantly without human intervention!"
  }
];

export default function TestimonialsSwiper({
  badge = "Client Testimonials",
  heading = "What Our Clients Say About Us",
  subheading = "Hear directly from industry leaders, educational institutions, and business owners who transformed their growth with TexWeb Solution."
}) {
  return (
    <Reviews3DCarousel
      badge={badge}
      heading={heading}
      subheading={subheading}
      reviewsList={HOMEPAGE_MIXED_REVIEWS}
      tagIcon={Sparkles}
    />
  );
}
