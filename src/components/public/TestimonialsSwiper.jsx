"use client";

import Reviews3DCarousel from "@/components/public/Reviews3DCarousel";
import { Sparkles } from "lucide-react";

const HOMEPAGE_MIXED_REVIEWS = [
  {
    id: 1,
    name: "Dr. Bhuleshwar Patel",
    role: "Founder & Chairman, Sarvadnya Vidyapeeth",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/dr_bhuleshwar_patel.jpg",
    solution: "Institutional Growth & Video Reels",
    roi: "+380% Lead Growth",
    rating: 5,
    quote: "TexWeb Solution managed our complete social media handling and promotional video reels for Sarvadnya Vidyapeeth. Their strategy resulted in a tremendous surge in student admission inquiries!"
  },
  {
    id: 2,
    name: "Mrs. Rakhi",
    role: "Founder, Anumeet Cutpiece",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/mrs_rakhi.png",
    solution: "Video Shooting & SMM Lead Conversion",
    roi: "+420% Direct Sales",
    rating: 5,
    quote: "TexWeb Solution handles our complete video shooting, reel editing, daily social media posting, and client lead conversions for Anumeet Cutpiece. Outstanding ROI and channel management!"
  },
  {
    id: 3,
    name: "Er. VK Gupta",
    role: "Founder, Er. VK Gupta Math Campus",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/er_vk_gupta.png",
    solution: "Instagram Growth & Reel Production",
    roi: "3k ➔ 18k+ Followers",
    rating: 5,
    quote: "TexWeb Solution handled our complete Instagram channel management, edited engaging educational reels, and grew our followers from 3,000 to 18,000+. The viral reels converted directly into course sales!"
  },
  {
    id: 4,
    name: "Atul Kumar",
    role: "Founder & Director, Trend Kro Media",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/atul_kumar.png",
    solution: "Digital Growth & Media Platform",
    roi: "96M+ Organic Views",
    rating: 5,
    quote: "TexWeb built a high-converting, sleek dark-themed web platform for Trend Kro Media. It perfectly showcases our media coverage, TEDx speaker opportunities, and strategy consultation bookings!"
  },
  {
    id: 5,
    name: "Neelam Arora",
    role: "Founder, Meditation Magic",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/neelam_arora.jpg",
    solution: "Spiritual Learning & Healing Platform",
    roi: "10k+ Active Learners",
    rating: 5,
    quote: "Our spiritual courses, guided audio meditations, and masterclass bookings run seamlessly on the custom platform developed by TexWeb Solution. Our students love the calm UI and smooth checkout experience!"
  },
  {
    id: 6,
    name: "D.D. Sharma Ji",
    role: "Founder, Team 360 Mind Mentorship",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/dd_sharma.jpg",
    solution: "Mind Mentorship & Learning Portal",
    roi: "50k+ Mind Training Members",
    rating: 5,
    quote: "TexWeb Solution built a comprehensive portal for our Team 360 workshops, recorded courses, and spiritual literature. The platform performance, video streaming, and registration tools are exceptional!"
  },
  {
    id: 7,
    name: "Ruchi Upadhyay",
    role: "Founder & Educator, Ruchi Upadhyay Classes",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/ruchi_upadhyay.png",
    solution: "Chemistry EdTech & Test Portal",
    roi: "5x Student Growth",
    rating: 5,
    quote: "TexWeb created a top-notch educational platform for our Chemistry classes. From live session schedules and study note downloads to test series integration, everything works flawlessly for our students!"
  },
  {
    id: 8,
    name: "Dr. Gaurav Sharma",
    role: "Founder, Heal Stride Physiotherapy & Wellness",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/vikramaditya_rao.png",
    solution: "Clinic Website & GMB Local SEO",
    roi: "+320% Patient Inquiries",
    rating: 5,
    quote: "TexWeb Solution built an elegant, fast appointment booking website for Heal Stride and optimized our Google My Business (GMB) profile. Our local search visibility and monthly clinic walk-ins grew tremendously!"
  },
  {
    id: 9,
    name: "Ananya Singhania",
    role: "Founder, Anikara Luxury Fashion",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/priya_nambiar.png",
    solution: "Luxury Fashion E-Commerce Website",
    roi: "+350% Online Sales",
    rating: 5,
    quote: "TexWeb designed and launched a stunning luxury e-commerce store for Anikara. The fast visual filtering, intuitive cart checkout, and mobile responsiveness have scaled our designer fashion sales nationwide!"
  },
  {
    id: 10,
    name: "Dr. Sohail Abbas",
    role: "Director & Chief Surgeon, Siwan City Hospital",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/siddharth_mehta.png",
    solution: "Multi-Speciality Hospital Website",
    roi: "+280% OPD Inquiries",
    rating: 5,
    quote: "TexWeb developed a modern, comprehensive healthcare portal for Siwan City Hospital with doctor schedules, Ayushman Bharat scheme guidance, and instant 24/7 emergency helpline integration. Exceptional work!"
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
