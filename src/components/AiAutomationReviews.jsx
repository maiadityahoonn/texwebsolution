"use client";

import Reviews3DCarousel from "@/components/Reviews3DCarousel";
import { Bot } from "lucide-react";

const AI_REVIEWS = [
  {
    id: 1,
    name: "Dr. Bhuleshwar Patel",
    role: "Founder & Chairman, Sarvadnya Vidyapeeth",
    image: "/dr_bhuleshwar_patel.jpg",
    solution: "WhatsApp AI Lead Automation",
    roi: "+450% Admission Leads",
    rating: 5,
    quote: "TexWeb Solution implemented a custom WhatsApp AI Automation bot for Sarvadnya Vidyapeeth. It handles student & parent admission inquiries 24/7, captures qualified lead details, and boosted our enrollment conversions by 450%!"
  },
  {
    id: 2,
    name: "Dr. Ananya Roy",
    role: "Founder, Maa Nisha Seva Sadan",
    image: "/avatars/dr_ananya_roy.png",
    solution: "AI Voice & Appointment Agent",
    roi: "85% Auto Booking",
    rating: 5,
    quote: "The AI voice agent handles patient calls round-the-clock for Maa Nisha Seva Sadan, answers medical FAQs, and syncs with our appointment system. It feels like having a 24/7 receptionist team with zero payroll overhead."
  },
  {
    id: 3,
    name: "Siddharth Mehta",
    role: "Operations Lead, FinServe Capital",
    image: "/avatars/siddharth_mehta.png",
    solution: "Document AI & Invoice OCR",
    roi: "95% Faster Audits",
    rating: 5,
    quote: "We automated invoice data extraction and audit verification using TexWeb's custom AI OCR pipeline. What used to take 3 full-time accountants 5 hours now runs in under 45 seconds!"
  },
  {
    id: 4,
    name: "Priya Nambiar",
    role: "Head of Growth, Global Science Academy",
    image: "/avatars/priya_nambiar.png",
    solution: "Multi-Platform AI Lead Agent",
    roi: "4.8x Sales Pipeline",
    rating: 5,
    quote: "Their AI Agent captures incoming Instagram DMs, website chats, and email leads for Global Science Academy, qualifies student budget, and pushes warm leads straight to our sales team's WhatsApp. Phenomenal ROI!"
  },
  {
    id: 5,
    name: "Vikramaditya Rao",
    role: "CTO, CloudScale E-Com",
    image: "/avatars/vikramaditya_rao.png",
    solution: "RAG Knowledge Base Chatbot",
    roi: "$45k/yr Cost Saved",
    rating: 5,
    quote: "The custom AI chatbot trained on 10,000+ internal product manuals resolves 78% of customer support tickets instantly without human intervention. Extremely smooth Next.js integration!"
  },
  {
    id: 6,
    name: "Neha Kapoor",
    role: "Co-Founder, StyleCraft Apparel",
    image: "/avatars/neha_kapoor.png",
    solution: "AI Inventory & Order Workflow",
    roi: "100% Error Free",
    rating: 5,
    quote: "TexWeb connected our Shopify store with AI automation workflows for stock reordering and supplier alerts. Automated operations doubled our dispatch speed and eliminated human errors!"
  }
];

export default function AiAutomationReviews() {
  return (
    <Reviews3DCarousel
      badge="AI Automation Client Reviews"
      heading="Real Results Delivered By Our AI Agents"
      subheading="See how forward-thinking companies scale operations, automate customer support, and save thousands of hours with custom AI solutions."
      reviewsList={AI_REVIEWS}
      tagIcon={Bot}
    />
  );
}
