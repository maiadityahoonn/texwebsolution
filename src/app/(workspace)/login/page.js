"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isPrimaryCrmUser } from "@/lib/crmAccess";

function workspaceHref() {
  if (typeof window === "undefined") return "/crm/dashboard";
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (redirect && redirect.startsWith("/")) return redirect;
  const section = params.get("section");
  const crmSectionRedirects = {
    overview: "/crm/dashboard",
    dashboard: "/crm/dashboard",
    crm: "/crm/leads",
    leads: "/crm/leads",
    pipeline: "/crm/pipeline",
    followups: "/crm/followups",
    sales_followups: "/crm/followups",
    meetings: "/crm/meetings",
    sales_meetings: "/crm/meetings",
    quotation: "/crm/quotation",
    sales_commercials: "/crm/quotation",
    agreements: "/crm/agreements",
    invoices: "/crm/invoices",
    payments: "/crm/payments",
    clients: "/crm/clients",
    reports: "/crm/reports",
    sales_reports: "/crm/reports",
    chat: "/crm/chat",
    alerts: "/crm/alerts",
    settings: "/crm/settings",
  };
  return section ? crmSectionRedirects[section] || "/crm/dashboard" : "/crm/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState("signin"); // "signin" | "forgot" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let mounted = true;

    // Detect recovery token in URL hash
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      if (hash.includes("type=recovery") || hash.includes("access_token=")) {
        setAuthMode("reset");
        setMessage({ type: "success", text: "Please enter your new password below." });
      }
    }

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return;
        if (data?.session) {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (!mounted) return;
          if (error || !user) {
            await supabase.auth.signOut({ scope: "local" });
            setMessage({ type: "error", text: "Session expire ho gaya hai. Please login again." });
            setLoading(false);
            return;
          }

          // Check if user is suspended/paused
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("status")
              .eq("id", user.id)
              .maybeSingle();
            if (!isPrimaryCrmUser(profile || {}, user)) {
              await supabase.auth.signOut({ scope: "local" });
              setMessage({ type: "error", text: "CRM access abhi sirf Sales Head Priyank Patel ke liye enabled hai." });
              setLoading(false);
              return;
            }
            if (["suspended", "paused"].includes(profile?.status)) {
              await supabase.auth.signOut({ scope: "local" });
              setMessage({
                type: "error",
                text: profile.status === "suspended" ? "Your account is suspended." : "Your account is paused.",
              });
              setLoading(false);
              return;
            }
          } catch {}

          router.replace(workspaceHref());
          return;
        }
        setLoading(false);
      })
      .catch(async () => {
        if (!mounted) return;
        await supabase.auth.signOut({ scope: "local" });
        setLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("reset");
        setMessage({ type: "success", text: "Please enter your new password to reset account access." });
        setLoading(false);
        return;
      }

      if (session) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error || !user) {
          await supabase.auth.signOut({ scope: "local" });
          setMessage({ type: "error", text: "Session expire ho gaya hai. Please login again." });
          setLoading(false);
          return;
        }
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id,email")
            .eq("id", user.id)
            .maybeSingle();
          if (!isPrimaryCrmUser(profile || {}, user)) {
            await supabase.auth.signOut({ scope: "local" });
            setMessage({ type: "error", text: "CRM access abhi sirf Sales Head Priyank Patel ke liye enabled hai." });
            setLoading(false);
            return;
          }
        } catch {}
        router.replace(workspaceHref());
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  async function handleSignInSubmit(event) {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage({
        type: "error",
        text: error.message.includes("Invalid login credentials")
          ? "Invalid email or password. Please check your credentials or reset your password."
          : error.message,
      });
      setLoading(false);
      return;
    }

    if (data?.user) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", data.user.id)
          .maybeSingle();
        if (!isPrimaryCrmUser(profile || {}, data.user)) {
          await supabase.auth.signOut({ scope: "local" });
          setMessage({ type: "error", text: "CRM access abhi sirf Sales Head Priyank Patel ke liye enabled hai." });
          setLoading(false);
          return;
        }
        if (["suspended", "paused"].includes(profile?.status)) {
          await supabase.auth.signOut({ scope: "local" });
          setMessage({
            type: "error",
            text: profile.status === "suspended" ? "Your account is suspended." : "Your account is paused.",
          });
          setLoading(false);
          return;
        }
      } catch {}
    }

    router.replace(workspaceHref());
  }

  async function handleForgotSubmit(event) {
    event.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your corporate email." });
      return;
    }
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : "https://texwebsolution.in/login";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Password reset link sent! Please check your email inbox to proceed.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send reset email. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(event) {
    event.preventDefault();
    if (!newPassword.trim() || newPassword.trim().length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }
      setMessage({
        type: "success",
        text: "Password updated successfully! Redirecting to workspace...",
      });
      setTimeout(() => {
        router.replace(workspaceHref());
      }, 1000);
    } catch {
      setMessage({ type: "error", text: "Failed to update password. Please try again." });
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10">
        <section className="grid w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 lg:grid-cols-[1fr_420px]">
          {/* Left Hero Graphic Section */}
          <div className="hidden min-h-[560px] flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.35),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.9),_rgba(2,6,23,0.95))] p-10 lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md">
                  <Image src="/texweb-logo.png" alt="TexWeb" width={34} height={34} priority />
                </div>
                <div>
                  <p className="text-lg font-black tracking-tight">TexWeb Solution</p>
                  <p className="text-sm text-slate-300">Internal Workspace</p>
                </div>
              </div>
              <h1 className="mt-14 max-w-xl text-5xl font-black leading-tight">
                Secure login for sales, tech, SMM, HR, and client operations.
              </h1>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">Role based access</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">Live CRM updates</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">Private workspace</div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="bg-white p-6 text-slate-950 sm:p-10">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <Image src="/texweb-logo.png" alt="TexWeb" width={38} height={38} priority />
              <div>
                <p className="text-lg font-black tracking-tight">TexWeb Solution</p>
                <p className="text-sm text-slate-500">Internal Workspace</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                {authMode === "reset" ? <KeyRound size={24} /> : <ShieldCheck size={24} />}
              </div>
              <h2 className="text-3xl font-black tracking-tight">
                {authMode === "signin"
                  ? "Login"
                  : authMode === "reset"
                  ? "New Password"
                  : "Reset Password"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {authMode === "signin"
                  ? "Auth verify hone ke baad aapke role ke hisaab se workspace open hoga."
                  : authMode === "reset"
                  ? "Enter your new password to secure and restore your workspace access."
                  : "Enter your registered corporate email to receive a password recovery link."}
              </p>
            </div>

            {/* Error or Success notification message */}
            {message.text ? (
              <div
                className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold border ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-100 bg-red-50 text-red-600"
                }`}
              >
                {message.text}
              </div>
            ) : null}

            {/* Mode 1: Sign In Form */}
            {authMode === "signin" && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Corporate Email</span>
                  <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-orange-400 focus-within:bg-white transition">
                    <Mail size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                      placeholder="name@texwebsolution.in"
                      autoComplete="email"
                      required
                    />
                  </span>
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Password</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMessage({ type: "", text: "" });
                        setAuthMode("forgot");
                      }}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-orange-400 focus-within:bg-white transition">
                    <Lock size={18} className="text-slate-400 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                      placeholder="Enter password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Checking..." : "Open Workspace"}
                </button>
              </form>
            )}

            {/* Mode 2: Forgot Password Form */}
            {authMode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Registered Work Email</span>
                  <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-orange-400 focus-within:bg-white transition">
                    <Mail size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                      placeholder="name@texwebsolution.in"
                      autoComplete="email"
                      required
                    />
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Sending link..." : "Send Reset Link"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMessage({ type: "", text: "" });
                      setAuthMode("signin");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* Mode 3: Set New Password Form */}
            {authMode === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">New Password (Min 8 characters)</span>
                  <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-orange-400 focus-within:bg-white transition">
                    <Lock size={18} className="text-slate-400 shrink-0" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                      placeholder="Enter at least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Updating..." : "Update Password & Open"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMessage({ type: "", text: "" });
                      setAuthMode("signin");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
