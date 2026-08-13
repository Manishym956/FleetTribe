"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DriverFeature, Methodology } from "@/lib/types";

// ─── EXPLAINABILITY ──────────────────────────────────────

function AnimatedBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    el.style.width = "0%";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = "width 1s cubic-bezier(0.16,1,0.3,1)";
            el.style.width = `${score}%`;
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [score, delay]);

  const color =
    score >= 65 ? "oklch(0.52 0.19 25)"
    : score >= 35 ? "oklch(0.62 0.14 55)"
    : "oklch(0.48 0.15 145)";

  return (
    <div className="h-1.5 bg-[oklch(0.93_0_0)] rounded-full overflow-hidden">
      <div ref={barRef} className="h-full rounded-full" style={{ background: color }} />
    </div>
  );
}

interface ExplainabilityProps {
  topDriver: DriverFeature;
  methodology: Methodology;
}

export function ExplainabilitySection({ topDriver, methodology }: ExplainabilityProps) {
  const w = methodology.scoring_weights_baseline;
  const components = [
    { label: "Speed Risk", score: topDriver.score_speed, weight: Math.round(w.speed * 100) },
    { label: "Acceleration Risk", score: topDriver.score_accel, weight: Math.round(w.acceleration * 100) },
    { label: "Gyroscope Risk", score: topDriver.score_gyro, weight: Math.round(w.gyro * 100) },
    { label: "Behavioural Variability", score: topDriver.score_variability, weight: Math.round(w.variability * 100) },
  ];

  return (
    <section
      id="explainability"
      aria-label="Explainability"
      className="py-28 px-6 bg-[oklch(0.988_0_0)] border-y border-border"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="section-label mb-3">Explainability</p>
            <h2 className="text-[42px] sm:text-[52px] font-bold tracking-[-0.03em] leading-[1.05] mb-6">
              A score is only useful if you{" "}
              <span className="font-serif-italic font-normal">know why.</span>
            </h2>
            <p className="text-[16px] text-muted-foreground leading-relaxed font-light mb-10 max-w-sm">
              Every risk score traces directly to the sensor signals that produced it.
              No black boxes.
            </p>
            <Link
              href="/app/methodology"
              className="group inline-flex items-center gap-2 text-[14px] font-semibold text-foreground hover:opacity-60 transition-opacity"
            >
              Explore the methodology
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Right: score card */}
          <div className="preview-card p-8">
            {/* Big score */}
            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-border">
              <div>
                <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-2">
                  {topDriver.Driver_Name} · {topDriver.Driver_ID}
                </p>
                <p className="text-[72px] font-bold tabular-nums tracking-[-0.05em] leading-none">
                  {Math.round(topDriver.risk_score)}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">/ 100 Risk Score</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full badge-risk-high mb-2">
                HIGH RISK
              </span>
            </div>

            {/* Component breakdown */}
            <div className="space-y-5">
              {components.map((c, i) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium">{c.label}</span>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {c.weight}%
                      </span>
                    </div>
                    <span className="text-[14px] font-bold tabular-nums">{Math.round(c.score)}</span>
                  </div>
                  <AnimatedBar score={c.score} delay={i * 80} />
                </div>
              ))}
            </div>

            <p className="mt-6 pt-5 border-t border-border text-[11px] text-muted-foreground italic">
              Fleet-relative Robust Z-score normalization (MAD). Analytical decision-support signal only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── METHODOLOGY PREVIEW ─────────────────────────────────

const METHODOLOGY_STEPS = [
  { num: "01", title: "Raw Telemetry", desc: "Speed, acceleration (X/Y/Z), and gyroscope (X/Y/Z) at 1-minute intervals across 450 trips." },
  { num: "02", title: "Feature Engineering", desc: "Vector magnitudes. Dynamic acceleration = |magnitude − 1g|. Event rates per trip-minute to remove length bias." },
  { num: "03", title: "Fleet Normalization", desc: "Robust Z-score (Median + MAD). MAD=0 protected. Clipped [−2, +3], scaled 0–100." },
  { num: "04", title: "Risk & Health Scoring", desc: "Driver: Speed 35% · Accel 30% · Gyro 25% · Variability 10%. Vehicle: sensor variance abnormality index." },
  { num: "05", title: "Sensitivity Analysis", desc: "Spearman ρ ≥ 0.97 across 5 weight perturbation runs. Rankings are robust to reasonable methodology changes." },
];

export function MethodologyPreview() {
  return (
    <section
      id="methodology"
      aria-label="Methodology overview"
      className="py-28 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">Methodology</p>
          <h2 className="text-[42px] sm:text-[52px] font-bold tracking-[-0.03em]">
            The pipeline at a glance.
          </h2>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Connector line */}
          <div
            className="hidden md:block absolute left-[1.375rem] top-6 bottom-6 w-px bg-border"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-4">
            {METHODOLOGY_STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-5 items-start">
                <div className="shrink-0 w-11 h-11 rounded-full border border-border bg-background flex items-center justify-center z-10">
                  <span className="text-[11px] font-bold text-muted-foreground">{step.num}</span>
                </div>
                <div className="flex-1 pt-2 pb-1">
                  <h3 className="text-[15px] font-semibold mb-1">{step.title}</h3>
                  <p className="text-[13.5px] text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/app/methodology"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-[14px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
          >
            Full methodology documentation
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────

export function CTASection() {
  return (
    <section
      id="cta"
      aria-label="Call to action"
      className="py-36 px-6 bg-[oklch(0.988_0_0)] border-t border-border text-center"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[52px] sm:text-[64px] font-bold tracking-[-0.04em] leading-[1.03] mb-5 text-balance">
          Your fleet already has{" "}
          <span className="font-serif-italic font-normal text-foreground/40">the signals.</span>
        </h2>
        <p className="text-[18px] font-light text-muted-foreground mb-12">
          FleetTribe helps you see them.
        </p>
        <Link
          href="/auth"
          className="group inline-flex items-center gap-2.5 px-8 py-4 bg-foreground text-background text-[15px] font-semibold rounded-full hover:opacity-80 transition-opacity"
        >
          Explore FleetTribe
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="text-[15px] font-bold tracking-tight mb-1">FleetTribe</p>
            <p className="text-[13px] text-muted-foreground">Fleet Intelligence Platform</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: "Overview", href: "/" },
              { label: "Drivers", href: "/app/drivers" },
              { label: "Vehicles", href: "/app/vehicles" },
              { label: "Methodology", href: "/app/methodology" },
              { label: "Sign in", href: "/auth" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-[12px] text-muted-foreground">
            © 2024 FleetTribe
          </p>
          <p className="text-[12px] text-muted-foreground">
            VexarDrive Technologies — Data Science Intern Assignment
          </p>
        </div>
      </div>
    </footer>
  );
}
