"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AuthContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const setupRequired = searchParams.get("setup") === "required";
  const nextPath = searchParams.get("next") || "/app";
  const configured = isSupabaseConfigured();

  const handleGoogleSignIn = async () => {
    if (!configured) {
      setError("Supabase is not configured. Add credentials to app/.env.local first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", nextPath);
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl.toString() },
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    } catch {
      setError("Could not connect to Supabase. Check your .env.local credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: "radial-gradient(oklch(0.88 0 0) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.45,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="text-[15px] font-bold tracking-tight hover:opacity-70 transition-opacity">
            FleetTribe
          </Link>
          <p className="text-[12px] text-muted-foreground">Fleet Intelligence Platform</p>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-[-0.025em]">Welcome back.</h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Sign in to access the FleetTribe dashboard.
          </p>
        </div>

        <div className="w-full ft-card-lg p-8">
          {!configured && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[oklch(0.97_0.02_80)] border border-[oklch(0.88_0.06_80)] text-left">
              <p className="text-[13px] font-semibold text-foreground mb-1.5">Supabase not configured</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-2">
                Copy <code className="text-[11px] bg-muted px-1 py-0.5 rounded">app/.env.example</code> to{" "}
                <code className="text-[11px] bg-muted px-1 py-0.5 rounded">app/.env.local</code> and add your
                Supabase URL and anon key. Restart the dev server after saving.
              </p>
              <p className="text-[11px] text-muted-foreground">
                In development, you can preview the dashboard at{" "}
                <Link href="/app" className="underline underline-offset-2 hover:text-foreground">
                  /app
                </Link>{" "}
                without signing in.
              </p>
            </div>
          )}

          {setupRequired && configured && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[oklch(0.97_0.02_80)] border border-[oklch(0.88_0.06_80)] text-[13px] text-muted-foreground">
              Sign in to access the dashboard.
            </div>
          )}

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[oklch(0.97_0.03_25)] border border-[oklch(0.88_0.07_25)] text-[13px] text-[oklch(0.50_0.19_25)] font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !configured}
            className="group w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-background text-[14px] font-semibold text-foreground hover:bg-[oklch(0.975_0_0)] hover:border-foreground/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? "Redirecting…" : "Continue with Google"}
          </button>

          <p className="mt-5 text-[12px] text-muted-foreground leading-relaxed">
            Authentication is managed by Supabase OAuth.
            Your data is protected by row-level security.
          </p>
        </div>

        <p className="text-[12px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-2">
            ← Back to FleetTribe
          </Link>
        </p>
      </div>

      <p className="relative z-10 mt-12 text-[11px] text-muted-foreground/60">
        VexarDrive Technologies — Data Science Intern Assignment
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-[14px] text-muted-foreground">Loading…</p>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
