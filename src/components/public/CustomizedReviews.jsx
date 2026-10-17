"use client";

import Reviews3DCarousel from "@/components/public/Reviews3DCarousel";
import { Code2 } from "lucide-react";

const CUSTOMIZED_REVIEWS = [
  {
    id: 1,
    name: "Dr. Bhuleshwar Patel",
    role: "Founder & Chairman, Sarvadnya Vidyapeeth",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/dr_bhuleshwar_patel.jpg",
    solution: "College Admission & Campus Portal",
    roi: "+250% Online Admissions",
    rating: 5,
    quote: "TexWeb Solution engineered an outstanding student admission and academic portal for Sarvadnya Vidyapeeth. The online application flow, department highlights, and credit card guidance features are fast, secure, and user-friendly!"
  },
  {
    id: 2,
    name: "Atul Kumar",
    role: "Founder & Director, Trend Kro Media",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/atul_kumar.png",
    solution: "Digital Growth & Media Platform",
    roi: "96M+ Organic Views",
    rating: 5,
    quote: "TexWeb built a high-converting, sleek dark-themed web platform for Trend Kro Media. It perfectly showcases our media coverage, TEDx speaker opportunities, and strategy consultation bookings!"
  },
  {
    id: 3,
    name: "Neelam Arora",
    role: "Founder, Meditation Magic",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/neelam_arora.jpg",
    solution: "Spiritual Learning & Healing Platform",
    roi: "10k+ Active Learners",
    rating: 5,
    quote: "Our spiritual courses, guided audio meditations, and masterclass bookings run seamlessly on the custom platform developed by TexWeb Solution. Our students love the calm UI and smooth checkout experience!"
  },
  {
    id: 4,
    name: "Ruchi Upadhyay",
    role: "Founder & Educator, Ruchi Upadhyay Classes",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/ruchi_upadhyay.png",
    solution: "Chemistry EdTech & Test Portal",
    roi: "5x Student Growth",
    rating: 5,
    quote: "TexWeb created a top-notch educational platform for our Chemistry classes. From live session schedules and study note downloads to test series integration, everything works flawlessly for our students!"
  },
  {
    id: 5,
    name: "D.D. Sharma Ji",
    role: "Founder, Team 360 Mind Mentorship",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/dd_sharma.jpg",
    solution: "Mind Mentorship & Learning Portal",
    roi: "50k+ Mind Training Members",
    rating: 5,
    quote: "TexWeb Solution built a comprehensive portal for our Team 360 workshops, recorded courses, and spiritual literature. The platform performance, video streaming, and registration tools are exceptional!"
  },
  {
    id: 6,
    name: "Siddharth Mehta",
    role: "Managing Director, Kirtilals Luxury",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/siddharth_mehta.png",
    solution: "Luxury E-Commerce Shopping Portal",
    roi: "+180% Virtual Consults",
    rating: 5,
    quote: "The luxury shopping portal designed by TexWeb elevated our online brand presence. High-definition diamond jewelry galleries, virtual consult bookings, and store locator perform with zero latency!"
  },
  {
    id: 7,
    name: "Dr. Gaurav Sharma",
    role: "Founder, Heal Stride Physiotherapy & Wellness",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/vikramaditya_rao.png",
    solution: "Clinic Website & GMB Local SEO",
    roi: "+320% Patient Inquiries",
    rating: 5,
    quote: "TexWeb Solution built an elegant, fast appointment booking website for Heal Stride and optimized our Google My Business (GMB) profile. Our local search visibility and monthly clinic walk-ins grew tremendously!"
  },
  {
    id: 8,
    name: "Ananya Singhania",
    role: "Founder, Anikara Luxury Fashion",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/priya_nambiar.png",
    solution: "Luxury Fashion E-Commerce Website",
    roi: "+350% Online Sales",
    rating: 5,
    quote: "TexWeb designed and launched a stunning luxury e-commerce store for Anikara. The fast visual filtering, intuitive cart checkout, and mobile responsiveness have scaled our designer fashion sales nationwide!"
  },
  {
    id: 9,
    name: "Dr. Sohail Abbas",
    role: "Director & Chief Surgeon, Siwan City Hospital",
    image: "https://qfbsszbgmipbercujiak.supabase.co/storage/v1/object/public/site-assets/avatars/siddharth_mehta.png",
    solution: "Multi-Speciality Hospital Website",
    roi: "+280% OPD Inquiries",
    rating: 5,
    quote: "TexWeb developed a modern, comprehensive healthcare portal for Siwan City Hospital with doctor schedules, Ayushman Bharat scheme guidance, and instant 24/7 emergency helpline integration. Exceptional work!"
  }
];

export default function CustomizedReviews() {
  return (
    <Reviews3DCarousel
      badge="Custom Development Reviews"
      heading="Tailored Web & App Engineering Stories"
      subheading="See how businesses transform ideas into custom, enterprise-grade digital products built to exact specifications."
      reviewsList={CUSTOMIZED_REVIEWS}
      tagIcon={Code2}
    />
  );
}
