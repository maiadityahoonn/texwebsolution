"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCode,
  FileText,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { getCmsContent, getCmsVersions, upsertCmsContent } from "@/services/supabaseService";

const CMS_KEYS = [
  ["homepage.hero", "Homepage Hero"],
  ["homepage.projects", "Homepage Projects"],
  ["about.hero", "About Hero"],
  ["about.services", "About Services"],
  ["about.stats", "About Stats"],
  ["pricing.hero", "Pricing Hero"],
  ["pricing.plans", "Pricing Plans Header"],
  ["pricing.industries", "Pricing Industries"],
  ["pricing.workflow", "Pricing Workflow"],
  ["pricing.comparison", "Pricing Comparison"],
  ["pricing.currencies", "Pricing Currencies"],
  ["pricing.faqs", "Pricing FAQs"],
  ["customized.hero", "Customized Hero"],
  ["prebuilt.hero", "Prebuilt Hero"],
  ["services.ai", "AI Automation Page"],
  ["services.marketing", "Digital Marketing Page"],
];

function formatJson(value) {
  try {
    return JSON.stringify(value || {}, null, 2);
  } catch {
    return "{}";
  }
}

export default function CmsPage() {
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedKey, setSelectedKey] = useState("homepage.hero");
  const [rawJson, setRawJson] = useState("{}");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const canEditCms = profile?.role === "super_admin" || profile?.role === "hr";

  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { valid: false, data: null, message: "JSON object required." };
      }
      return { valid: true, data: parsed, message: "Valid JSON schema." };
    } catch (error) {
      return { valid: false, data: null, message: error.message || "Invalid JSON syntax." };
    }
  }, [rawJson]);

  async function loadCms() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setSessionUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    setSessionUser(session.user);
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    setProfile(profileData || null);
    const [cmsData, versionData] = await Promise.all([getCmsContent(), getCmsVersions()]);
    setContent(cmsData || []);
    setVersions(versionData || []);
    const block = (cmsData || []).find((item) => item.key === selectedKey);
    setRawJson(formatJson(block?.content_json));
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(loadCms, 0);
    const channel = supabase
      .channel("public-cms-editor")
      .on("postgres_changes", { event: "*", schema: "public", table: "cms_content" }, () => loadCms())
      .subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveBlock() {
    if (!preview.valid) return;
    const saved = await upsertCmsContent({ key: selectedKey, content_json: preview.data, updated_by: sessionUser?.id });
    if (!saved) {
      setMessage("CMS save failed.");
      return;
    }
    setContent((prev) => [saved, ...prev.filter((item) => item.key !== saved.key)].sort((a, b) => a.key.localeCompare(b.key)));
    setVersions(await getCmsVersions());
    setMessage("Public page content published live!");
    setTimeout(() => setMessage(""), 3500);
  }

  function restoreVersion(version) {
    setSelectedKey(version.cms_key);
    setRawJson(formatJson(version.content_json));
    setMessage(`Version #${version.version_no} loaded in editor. Review and click Save to restore.`);
  }

  function selectBlock(key) {
    setSelectedKey(key);
    const block = content.find((item) => item.key === key);
    setRawJson(formatJson(block?.content_json));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b101b] text-gray-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 border-b border-gray-200/80 dark:border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/login"
              className="mb-2.5 inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Workspace</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Website CMS Management
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              Homepage, About, Pricing, Services, and live website dynamic content updates.
            </p>
          </div>
          <button
            onClick={loadCms}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-slate-200 shadow-2xs hover:shadow-xs active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-red-600" />
            <span>Refresh Content</span>
          </button>
        </div>

        {!sessionUser && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 p-5 text-sm font-semibold text-red-700 dark:text-red-300">
            Please login first to access website CMS content management.
          </div>
        )}

        {sessionUser && !loading && !canEditCms && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 p-5 text-sm font-semibold text-red-700 dark:text-red-300">
            CMS access is restricted to Super Admin and HR manager accounts.
          </div>
        )}

        {sessionUser && canEditCms && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
            {/* Sidebar: Public Pages List */}
            <aside className="rounded-2xl border border-gray-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-4 shadow-2xs h-fit">
              <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                <span>Public Page Blocks</span>
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 text-[10px] font-bold">
                  {CMS_KEYS.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
                {CMS_KEYS.map(([key, label]) => {
                  const isSelected = selectedKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => selectBlock(key)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-left transition-all cursor-pointer group ${
                        isSelected
                          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs font-bold"
                          : "hover:bg-red-50/20 dark:hover:bg-slate-800/60 text-gray-700 dark:text-slate-300 border border-transparent"
                      }`}
                    >
                      <div className="text-xs flex items-center justify-between">
                        <span className="truncate">{label}</span>
                        {isSelected && <Sparkles className="w-3 h-3 text-red-200 shrink-0" />}
                      </div>
                      <div
                        className={`font-mono text-[10px] truncate mt-0.5 ${
                          isSelected ? "text-red-100" : "text-gray-400 dark:text-slate-500"
                        }`}
                      >
                        {key}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Main Center: JSON Live Editor */}
            <section className="rounded-2xl border border-gray-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileCode className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                      Live Block Editor
                    </div>
                    <h2 className="text-base font-black text-gray-900 dark:text-white font-mono">{selectedKey}</h2>
                  </div>
                </div>

                <button
                  onClick={saveBlock}
                  disabled={!preview.valid}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:shadow-md hover:shadow-red-500/20 active:scale-95 transition cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Publish Live</span>
                </button>
              </div>

              {message && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{message}</span>
                </div>
              )}

              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-[#0d1117] shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800 text-[11px] text-gray-400 font-mono">
                  <span>{selectedKey}.json</span>
                  <span className={preview.valid ? "text-emerald-400" : "text-rose-400"}>
                    {preview.valid ? "● Valid Schema" : "▲ Syntax Error"}
                  </span>
                </div>
                <textarea
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  spellCheck={false}
                  rows={20}
                  className="w-full p-4 font-mono text-xs leading-relaxed text-emerald-300 bg-transparent outline-none resize-none selection:bg-red-900"
                />
              </div>

              <div
                className={`rounded-xl border p-3 text-xs font-bold flex items-center gap-2 ${
                  preview.valid
                    ? "border-emerald-200/80 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 dark:border-emerald-800"
                    : "border-rose-200/80 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 dark:border-rose-800"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${preview.valid ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span>{preview.message}</span>
              </div>
            </section>

            {/* Right Aside: Version History */}
            <aside className="rounded-2xl border border-gray-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-4 shadow-2xs h-fit space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Version History</span>
                </div>
                <span className="text-[10.5px] font-mono font-normal">Auto-Backup</span>
              </div>

              <div className="max-h-[580px] space-y-2 overflow-y-auto pr-1">
                {versions
                  .filter((version) => version.cms_key === selectedKey)
                  .map((version) => (
                    <button
                      key={version.id}
                      onClick={() => restoreVersion(version)}
                      className="w-full rounded-xl border border-gray-200/80 dark:border-slate-800 p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800/60 transition cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                          Version #{version.version_no}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 group-hover:underline">
                          <RotateCcw className="h-3 w-3" />
                          <span>Load</span>
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{version.editor?.full_name || "System Automated"}</span>
                      </div>
                    </button>
                  ))}
                {!versions.filter((version) => version.cms_key === selectedKey).length && (
                  <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                    No prior version snapshots recorded for this block.
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
