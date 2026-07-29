"use client";

import Reviews3DCarousel from "@/components/Reviews3DCarousel";
import { Megaphone } from "lucide-react";

const MARKETING_REVIEWS = [
  {
    id: 1,
    name: "Dr. Bhuleshwar Patel",
    role: "Founder & Chairman, Sarvadnya Vidyapeeth",
    image: "/dr_bhuleshwar_patel.jpg",
    solution: "Social Media & Video Reels",
    roi: "+380% Admission Leads",
    rating: 5,
    quote: "TexWeb Solution managed our complete social media handling, produced high-quality promotional video reels, and ran targeted digital ad campaigns for Sarvadnya Vidyapeeth. Their strategy resulted in a tremendous surge in student admission inquiries!"
  },
  {
    id: 2,
    name: "Er. VK Gupta",
    role: "Founder, Er. VK Gupta Math Campus",
    image: "/avatars/er_vk_gupta.png",
    solution: "Instagram Growth & Reel Production",
    roi: "3k ➔ 18k+ Followers",
    rating: 5,
    quote: "TexWeb Solution handled our complete Instagram channel management, edited engaging educational video reels, and grew our organic followers from 3,000 to 18,000+. The viral reels converted directly into student leads and massive math course sales!"
  },
  {
    id: 3,
    name: "Mrs. Rakhi",
    role: "Founder, Anumeet Cutpiece",
    image: "/avatars/mrs_rakhi.png",
    solution: "Video Shooting & SMM Lead Conversion",
    roi: "+420% Direct Sales",
    rating: 5,
    quote: "TexWeb Solution handles our complete video shooting, reel editing, daily social media posting, and client lead conversions for Anumeet Cutpiece. Their viral reels and active channel management drove a massive boost in customer orders and direct sales!"
  },
  {
    id: 4,
    name: "Rajesh Malhotra",
    role: "Managing Director, AutoPrime Motors",
    image: "/avatars/vikramaditya_rao.png",
    solution: "Cinematic Video Shoot & Reels",
    roi: "10M+ Video Views",
    rating: 5,
    quote: "The team conducted a full cinematic video shoot at our showroom and edited viral short-form reels that crossed 10 Million organic views. Showroom footfalls and test-drive bookings doubled!"
  },
  {
    id: 5,
    name: "Tanvi Sharma",
    role: "Head of Brand, GlowAura Cosmetics",
    image: "/avatars/priya_nambiar.png",
    solution: "SMM & Influencer Growth",
    roi: "+150k Followers",
    rating: 5,
    quote: "They handled complete Instagram content strategy, influencer collaborations, and daily engagement. Our Instagram following exploded from 12k to 160k active followers with daily orders."
  },
  {
    id: 6,
    name: "Amitabh Joshi",
    role: "Founder, SkillMax EdTech",
    image: "/avatars/dr_ananya_roy.png",
    solution: "Ad Creatives & Conversion Funnel",
    roi: "-65% Cost Per Lead",
    rating: 5,
    quote: "TexWeb completely revamped our ad creatives, copywriting, and sales landing page. Our cost per student webinar signup dropped by 65% while course enrollment rates skyrocketed!"
  }
];

export default function DigitalMarketingReviews() {
  return (
    <Reviews3DCarousel
      badge="Digital Marketing Reviews"
      heading="Proven Growth Stories & Client Feedback"
      subheading="See how leading brands, educational institutions, and businesses scale revenue, dominate social media, and get high-converting ad leads."
      reviewsList={MARKETING_REVIEWS}
      tagIcon={Megaphone}
    />
  );
}
