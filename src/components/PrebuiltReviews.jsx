"use client";

import Reviews3DCarousel from "@/components/Reviews3DCarousel";
import { Layers } from "lucide-react";

const PREBUILT_REVIEWS = [
  {
    id: 1,
    name: "Dr. Bhuleshwar Patel",
    role: "Founder & Chairman, Sarvadnya Vidyapeeth",
    image: "/dr_bhuleshwar_patel.jpg",
    solution: "College Admission & Campus Portal",
    roi: "+250% Online Admissions",
    rating: 5,
    quote: "TexWeb Solution engineered an outstanding student admission and academic portal for Sarvadnya Vidyapeeth. The online application flow, department highlights, and credit card guidance features are fast, secure, and user-friendly!"
  },
  {
    id: 2,
    name: "Atul Kumar",
    role: "Founder & Director, Trend Kro Media",
    image: "/avatars/atul_kumar.png",
    solution: "Digital Growth & Media Platform",
    roi: "96M+ Organic Views",
    rating: 5,
    quote: "TexWeb built a high-converting, sleek dark-themed web platform for Trend Kro Media. It perfectly showcases our media coverage, TEDx speaker opportunities, and strategy consultation bookings!"
  },
  {
    id: 3,
    name: "Neelam Arora",
    role: "Founder, Meditation Magic",
    image: "/avatars/neelam_arora.jpg",
    solution: "Spiritual Learning & Healing Platform",
    roi: "10k+ Active Learners",
    rating: 5,
    quote: "Our spiritual courses, guided audio meditations, and masterclass bookings run seamlessly on the custom platform developed by TexWeb Solution. Our students love the calm UI and smooth checkout experience!"
  },
  {
    id: 4,
    name: "Ruchi Upadhyay",
    role: "Founder & Educator, Ruchi Upadhyay Classes",
    image: "/avatars/ruchi_upadhyay.png",
    solution: "Chemistry EdTech & Test Portal",
    roi: "5x Student Growth",
    rating: 5,
    quote: "TexWeb created a top-notch educational platform for our Chemistry classes. From live session schedules and study note downloads to test series integration, everything works flawlessly for our students!"
  },
  {
    id: 5,
    name: "D.D. Sharma Ji",
    role: "Founder, Team 360 Mind Mentorship",
    image: "/avatars/dd_sharma.jpg",
    solution: "Mind Mentorship & Learning Portal",
    roi: "50k+ Mind Training Members",
    rating: 5,
    quote: "TexWeb Solution built a comprehensive portal for our Team 360 workshops, recorded courses, and spiritual literature. The platform performance, video streaming, and registration tools are exceptional!"
  },
  {
    id: 6,
    name: "Siddharth Mehta",
    role: "Managing Director, Kirtilals Luxury",
    image: "/avatars/siddharth_mehta.png",
    solution: "Luxury E-Commerce Shopping Portal",
    roi: "+180% Virtual Consults",
    rating: 5,
    quote: "The luxury shopping portal designed by TexWeb elevated our online brand presence. High-definition diamond jewelry galleries, virtual consult bookings, and store locator perform with zero latency!"
  }
];

export default function PrebuiltReviews() {
  return (
    <Reviews3DCarousel
      badge="Pre-Built Software Reviews"
      heading="Turnkey Software & SaaS Success Stories"
      subheading="See how businesses launch instantly and scale revenue with our ready-to-deploy prebuilt software solutions."
      reviewsList={PREBUILT_REVIEWS}
      tagIcon={Layers}
    />
  );
}
