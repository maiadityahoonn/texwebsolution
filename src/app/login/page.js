"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

function workspaceHref() {
  if (typeof window === "undefined") return "/workspace";
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");
  return section ? `/workspace?section=${encodeURIComponent(section)}` : "/workspace";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data?.session) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error || !user) {
          await supabase.auth.signOut({ scope: "local" });
          setMessage("Session expire ho gaya hai. Please login again.");
          setLoading(false);
          return;
        }
        router.replace(workspaceHref());
        return;
      }
      setLoading(false);
    }).catch(async () => {
      if (!mounted) return;
      await supabase.auth.signOut({ scope: "local" });
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error || !user) {
          await supabase.auth.signOut({ scope: "local" });
          setMessage("Session expire ho gaya hai. Please login again.");
          setLoading(false);
          return;
        }
        router.replace(workspaceHref());
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message || "Login failed. Please check your credentials.");
      setLoading(false);
      return;
    }

    router.replace(workspaceHref());
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10">
        <section className="grid w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 lg:grid-cols-[1fr_420px]">
          <div className="hidden min-h-[560px] flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.35),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.9),_rgba(2,6,23,0.95))] p-10 lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                  <Image src="/texweb-logo.png" alt="TexWeb" width={34} height={34} priority />
                </div>
                <div>
                  <p className="text-lg font-black">TexWeb Solution</p>
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

          <div className="bg-white p-6 text-slate-950 sm:p-10">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <Image src="/texweb-logo.png" alt="TexWeb" width={38} height={38} priority />
              <div>
                <p className="text-lg font-black">TexWeb Solution</p>
                <p className="text-sm text-slate-500">Internal Workspace</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-3xl font-black">Login</h2>
              <p className="mt-2 text-sm text-slate-500">
                Auth verify hone ke baad aapke role ke hisaab se workspace open hoga.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
                <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-orange-400 focus-within:bg-white">
                  <Mail size={18} className="text-slate-400" />
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
                <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
                <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-orange-400 focus-within:bg-white">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold outline-none"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                </span>
              </label>

              {message ? (
                <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Checking..." : "Open Workspace"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
