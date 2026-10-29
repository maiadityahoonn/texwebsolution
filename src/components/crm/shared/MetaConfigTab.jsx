"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  ExternalLink,
} from "lucide-react";

export default function MetaConfigTab({ onConfigSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [form, setForm] = useState({
    dataset_id: "",
    pixel_id: "",
    capi_access_token: "",
    page_access_token: "",
    webhook_verify_token: "texweb_meta_leads_secret",
    test_event_code: "",
  });

  const [metadata, setMetadata] = useState({
    is_from_db: false,
    updated_at: null,
    has_capi_token: false,
    has_page_token: false,
    capi_access_token_masked: "",
    page_access_token_masked: "",
  });

  const [showCapiToken, setShowCapiToken] = useState(false);
  const [showPageToken, setShowPageToken] = useState(false);

  async function loadConfig() {
    setLoading(true);
    setStatusMsg(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const res = await fetch("/api/meta/config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load Meta configuration");

      const cfg = data.config || {};
      setForm({
        dataset_id: cfg.dataset_id || "",
        pixel_id: cfg.pixel_id || cfg.dataset_id || "",
        capi_access_token: cfg.has_capi_token ? cfg.capi_access_token_masked : "",
        page_access_token: cfg.has_page_token ? cfg.page_access_token_masked : "",
        webhook_verify_token: cfg.webhook_verify_token || "texweb_meta_leads_secret",
        test_event_code: cfg.test_event_code || "",
      });

      setMetadata({
        is_from_db: Boolean(cfg.is_from_db),
        updated_at: cfg.updated_at,
        has_capi_token: cfg.has_capi_token,
        has_page_token: cfg.has_page_token,
        capi_access_token_masked: cfg.capi_access_token_masked,
        page_access_token_masked: cfg.page_access_token_masked,
      });
    } catch (err) {
      setStatusMsg({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Authentication required.");

      const payload = {
        dataset_id: form.dataset_id.trim(),
        pixel_id: (form.pixel_id || form.dataset_id).trim(),
        webhook_verify_token: form.webhook_verify_token.trim(),
        test_event_code: form.test_event_code.trim(),
      };

      // Only update tokens if user actually typed a new one (not the masked placeholder)
      if (form.capi_access_token && !form.capi_access_token.includes("...")) {
        payload.capi_access_token = form.capi_access_token.trim();
      }
      if (form.page_access_token && !form.page_access_token.includes("...")) {
        payload.page_access_token = form.page_access_token.trim();
      }

      const res = await fetch("/api/meta/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save configuration.");

      setStatusMsg({
        type: "success",
        message: "Settings saved! Meta Ads & Dataset updated in real-time.",
      });

      if (onConfigSaved) onConfigSaved(result.config);
      await loadConfig();
    } catch (err) {
      setStatusMsg({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/20 text-xs text-gray-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-black text-sm flex items-center gap-1.5 text-gray-900 dark:text-white">
            <Sliders className="w-4 h-4 text-pink-500" />
            <span>Real-Time Meta Ads & Dataset Configuration</span>
          </div>
          <p className="text-gray-500 dark:text-slate-400">
            Jab bhi aap Ads Account ya Dataset change karein, yahan update karein. Bina redeploy kiye website tracking aur CRM CAPI turant naye account par shift ho jayenge.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
              metadata.is_from_db
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{metadata.is_from_db ? "Live Database Config" : "Environment Fallback"}</span>
          </span>

          <button
            type="button"
            onClick={loadConfig}
            disabled={loading}
            title="Refresh current settings"
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMsg.message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dataset ID / Pixel ID */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
              Dataset ID / Pixel ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 1234567890123456"
              value={form.dataset_id}
              onChange={(e) => setForm({ ...form, dataset_id: e.target.value, pixel_id: e.target.value })}
              className="w-full p-2.5 rounded-xl font-mono text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Events Manager me Dataset ke header par jo number hai woh yahan dalein.
            </p>
          </div>

          {/* Webhook Verify Token */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
              Webhook Verify Token
            </label>
            <input
              type="text"
              required
              value={form.webhook_verify_token}
              onChange={(e) => setForm({ ...form, webhook_verify_token: e.target.value })}
              className="w-full p-2.5 rounded-xl font-mono text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Meta Developers webhook configuration me same yahi token paste karein.
            </p>
          </div>
        </div>

        {/* Conversions API (CAPI) Access Token */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-700 dark:text-slate-300">
              Conversions API Access Token (CAPI)
            </label>
            {metadata.has_capi_token && (
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                Token Configured
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showCapiToken ? "text" : "password"}
              placeholder={metadata.has_capi_token ? "Leave unchanged or paste new token" : "EAAYmp..."}
              value={form.capi_access_token}
              onChange={(e) => setForm({ ...form, capi_access_token: e.target.value })}
              className="w-full p-2.5 pr-10 rounded-xl font-mono text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
            <button
              type="button"
              onClick={() => setShowCapiToken(!showCapiToken)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showCapiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Events Manager → Settings → Conversions API → &quot;Generate access token&quot; se generate karein.
          </p>
        </div>

        {/* Page Access Token (For Instant Lead Gen Forms) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-700 dark:text-slate-300">
              Facebook Page Access Token (Lead Ads Form Auto-Fetch)
            </label>
            {metadata.has_page_token && (
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                Token Configured
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showPageToken ? "text" : "password"}
              placeholder={metadata.has_page_token ? "Leave unchanged or paste new token" : "EAAYmp..."}
              value={form.page_access_token}
              onChange={(e) => setForm({ ...form, page_access_token: e.target.value })}
              className="w-full p-2.5 pr-10 rounded-xl font-mono text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
            <button
              type="button"
              onClick={() => setShowPageToken(!showPageToken)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPageToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Instant Forms ke fields (Name, Phone, Email, Questions) automatically fetch karne ke liye zaroori hai.
          </p>
        </div>

        {/* Test Event Code */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-700 dark:text-slate-300">
              Test Event Code (Optional)
            </label>
            {form.test_event_code && (
              <button
                type="button"
                onClick={() => setForm({ ...form, test_event_code: "" })}
                className="text-[11px] text-red-500 hover:underline font-semibold cursor-pointer"
              >
                Clear for Live Production Ads
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. TEST73709 (leave blank for live ads)"
            value={form.test_event_code}
            onChange={(e) => setForm({ ...form, test_event_code: e.target.value })}
            className="w-full p-2.5 rounded-xl font-mono text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Meta Events Manager me &quot;Test Events&quot; tab me verification ke liye code paste karein. Live ads chalane par ise blank chhod dein.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
          <div className="text-[11px] text-gray-400">
            {metadata.updated_at && (
              <span>Last updated: {new Date(metadata.updated_at).toLocaleString()}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 hover:opacity-90 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving in Real-Time...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Real-Time Config</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
