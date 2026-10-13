"use client";

import React, { useState } from "react";
import { Sparkles, Check, Copy } from "lucide-react";

export default function MetaLeadsWebhookTab({ webhookUrl, verifyToken }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Real-Time Meta Lead Ads Webhook Setup</span>
        </div>
        <p>
          Jab bhi koi user aapke Instagram ya Facebook Ad par form submit karega, woh 0 second ke andar automatic website ke Leads panel me add ho jayega! Koi CSV download karne ki zaroorat nahi padegi.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">
            Callback URL (Meta App Developer Dashboard me paste karein):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 p-2.5 rounded-xl font-mono text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white select-all"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
              }}
              className="px-3 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUrl ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">
            Verify Token:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={verifyToken}
              className="flex-1 p-2.5 rounded-xl font-mono text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white select-all"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(verifyToken);
                setCopiedToken(true);
                setTimeout(() => setCopiedToken(false), 2000);
              }}
              className="px-3 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedToken ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Step Setup Guide */}
      <div className="space-y-2 border-t border-gray-100 dark:border-slate-800 pt-4">
        <div className="text-xs font-bold text-gray-900 dark:text-white">
          3 Simple Steps to Connect:
        </div>
        <ol className="list-decimal list-inside text-xs text-gray-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
          <li>
            Go to <strong>Meta App Dashboard</strong> (developers.facebook.com) → Webhooks → Subscribe to <strong>Leadgen</strong>.
          </li>
          <li>
            Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> above, then click Verify and Save.
          </li>
          <li>
            Apne Facebook Page ko Webhook se subscribe kar dijiye. Ab Instagram & Facebook Ads ke sabhi leads live display honge!
          </li>
        </ol>
        <div className="mt-2 text-xs text-gray-400">
          💡 <em>Alternative: Agar aap Zapier, Pabbly ya Make.com use karte hain, toh woh bhi directly is Callback URL par POST bhej sakte hain!</em>
        </div>
      </div>
    </div>
  );
}
