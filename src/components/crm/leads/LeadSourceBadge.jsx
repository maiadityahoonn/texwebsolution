"use client";

import {
  Globe,
  Mail,
  MessageCircle,
  Sparkles,
  Target,
  User,
  Users,
} from "lucide-react";

export function getSourceBadgeConfig(rawSource = "") {
  const source = String(rawSource || "").trim().toLowerCase();

  if (source.includes("instagram")) {
    return {
      label: "Instagram",
      colorClass:
        "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/60 dark:border-pink-900/50",
      icon: Sparkles,
      iconColor: "text-pink-500",
    };
  }

  if (source.includes("meta") || source.includes("facebook")) {
    return {
      label: "Meta Ads",
      colorClass:
        "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/60 dark:border-pink-900/50",
      icon: Sparkles,
      iconColor: "text-pink-500",
    };
  }

  if (source.includes("google")) {
    return {
      label: "Google Ads",
      colorClass:
        "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/50",
      icon: Target,
      iconColor: "text-sky-500",
    };
  }

  if (source.includes("whatsapp")) {
    return {
      label: "WhatsApp",
      colorClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/50",
      icon: MessageCircle,
      iconColor: "text-emerald-500",
    };
  }

  if (source.includes("referral")) {
    return {
      label: "Referral",
      colorClass:
        "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/60 dark:border-teal-900/50",
      icon: Users,
      iconColor: "text-teal-500",
    };
  }

  if (source.includes("outreach") || source.includes("cold")) {
    return {
      label: "Outreach",
      colorClass:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/50",
      icon: Mail,
      iconColor: "text-amber-500",
    };
  }

  if (source.includes("manual")) {
    return {
      label: "Manual",
      colorClass:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/50",
      icon: User,
      iconColor: "text-slate-500",
    };
  }

  if (source.includes("newsletter")) {
    return {
      label: "Newsletter",
      colorClass:
        "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200/60 dark:border-violet-900/50",
      icon: Mail,
      iconColor: "text-violet-500",
    };
  }

  if (source.includes("openai")) {
    return {
      label: "OpenAI Ads",
      colorClass:
        "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-900/50",
      icon: Sparkles,
      iconColor: "text-cyan-500",
    };
  }

  // Default / Website Form
  return {
    label: rawSource ? (rawSource.length > 18 ? "Website" : rawSource) : "Website",
    colorClass:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/50",
    icon: Globe,
    iconColor: "text-indigo-500",
  };
}

export default function LeadSourceBadge({ source, className = "" }) {
  const config = getSourceBadgeConfig(source);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold border shrink-0 select-none ${config.colorClass} ${className}`}
      title={`Lead Source: ${source || config.label}`}
    >
      <Icon className={`w-2.5 h-2.5 ${config.iconColor} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
}
