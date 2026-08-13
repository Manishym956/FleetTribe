"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { DriverFeature, VehicleFeature } from "@/lib/types";
import { getRiskBadgeClass, getHealthBadgeClass } from "@/lib/types";

interface HeroProps {
  topDrivers: DriverFeature[];
  topVehicles: VehicleFeature[];
}

// ─── Inline score bar for the preview ────────────────────
function ScoreBar({ score, level }: { score: number; level: string }) {
  const color =
    level === "High Risk" || level === "Maintenance Attention"
      ? "oklch(0.52 0.19 25)"
      : level === "Low Risk" || level === "Healthy"
      ? "oklch(0.48 0.15 145)"
      : "oklch(0.62 0.14 55)";
  return (
    <div className="h-[3px] w-full bg-[oklch(0.93_0_0)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(score, 100)}%`, background: color }}
      />
    </div>
  );
}

// ─── The product preview panel ────────────────────────────
function ProductPreview({
  topDrivers,
  topVehicles,
}: {
  topDrivers: DriverFeature[];
  topVehicles: VehicleFeature[];
}) {
  return (
    <div className="preview-card w-full max-w-3xl mx-auto overflow-hidden select-none">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[oklch(0.91_0_0)] bg-[oklch(0.985_0_0)]">
        <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.85_0_0)]" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.85_0_0)]" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.85_0_0)]" aria-hidden="true" />
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-0.5 rounded bg-[oklch(0.93_0_0)] text-[11px] font-medium text-muted-foreground tracking-wide">
            FleetTribe — Fleet Overview
          </div>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-4 divide-x divide-[oklch(0.92_0_0)] border-b border-[oklch(0.92_0_0)] bg-white">
        {[
          { label: "Drivers", value: "30" },
          { label: "Vehicles", value: "30" },
          { label: "Trips", value: "450" },
          { label: "Records", value: "12,987" },
        ].map((k) => (
          <div key={k.label} className="px-5 py-4">
            <p className="text-[10px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-1.5">
              {k.label}
            </p>
            <p className="text-[22px] font-bold tracking-[-0.04em] text-foreground leading-none">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column data area */}
      <div className="grid md:grid-cols-2 divide-x divide-[oklch(0.92_0_0)] bg-white">
        {/* Driver risk */}
        <div>
          <div className="px-5 py-3 border-b border-[oklch(0.92_0_0)] bg-[oklch(0.985_0_0)]">
            <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
              Driver Risk · Top 5
            </p>
          </div>
          <ul>
            {topDrivers.slice(0, 5).map((d, i) => (
              <li
                key={d.Driver_ID}
                className={`px-5 py-3 ${i < 4 ? "border-b border-[oklch(0.93_0_0)]" : ""} ${i === 0 ? "bg-[oklch(0.995_0.005_25)]" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums w-3 shrink-0">
                      {d.rank}
                    </span>
                    <p className="text-[12.5px] font-semibold truncate">{d.Driver_Name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[13px] font-bold tabular-nums">{Math.round(d.risk_score)}</span>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${getRiskBadgeClass(d.risk_level)}`}>
                      {d.risk_level === "High Risk" ? "HIGH" : d.risk_level === "Low Risk" ? "LOW" : "MOD"}
                    </span>
                  </div>
                </div>
                <ScoreBar score={d.risk_score} level={d.risk_level} />
              </li>
            ))}
          </ul>
        </div>

        {/* Vehicle health */}
        <div>
          <div className="px-5 py-3 border-b border-[oklch(0.92_0_0)] bg-[oklch(0.985_0_0)]">
            <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
              Vehicle Health · Top 5
            </p>
          </div>
          <ul>
            {topVehicles.slice(0, 5).map((v, i) => (
              <li
                key={v.Vehicle_ID}
                className={`px-5 py-3 ${i < 4 ? "border-b border-[oklch(0.93_0_0)]" : ""} ${i === 0 ? "bg-[oklch(0.995_0.005_25)]" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums w-3 shrink-0">
                      {v.rank}
                    </span>
                    <p className="text-[12.5px] font-semibold truncate">{v.Make} {v.Model}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[13px] font-bold tabular-nums">{Math.round(v.health_score)}</span>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${getHealthBadgeClass(v.health_status)}`}>
                      {v.health_status === "Maintenance Attention" ? "ATTN" : v.health_status === "Healthy" ? "OK" : "MON"}
                    </span>
                  </div>
                </div>
                <ScoreBar score={v.health_score} level={v.health_status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-5 py-2.5 border-t border-[oklch(0.92_0_0)] bg-[oklch(0.985_0_0)] flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          VexarDrive Technologies · Data Science Intern Assignment
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_145)] inline-block" />
          <p className="text-[11px] text-muted-foreground">Live</p>
        </div>
      </div>
    </div>
  );
}

// ─── Hero section ────────────────────────────────────────
export default function Hero({ topDrivers, topVehicles }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const children = el.querySelectorAll("[data-fade]");
    children.forEach((child, i) => {
      const el = child as HTMLElement;
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 100 + i * 80);
    });
  }, []);

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-6 overflow-hidden bg-background"
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(oklch(0.86 0 0) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div ref={containerRef} className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center gap-7 text-center">
        {/* Context label */}
        <div data-fade className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-background/60 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/25 inline-block" />
          <span className="text-[11.5px] font-medium text-muted-foreground tracking-wide">
            VexarDrive Technologies — Data Science Intern Assignment
          </span>
        </div>

        {/* Headline */}
        <h1 data-fade className="text-[52px] sm:text-[64px] md:text-[76px] font-bold tracking-[-0.035em] leading-[1.02] max-w-3xl text-balance">
          Turn Fleet Telemetry{" "}
          <span className="font-serif-italic font-normal">Into Decisions.</span>
        </h1>

        {/* Sub-headline */}
        <p data-fade className="text-[17px] sm:text-[18px] text-muted-foreground max-w-lg leading-[1.65] font-light text-balance">
          FleetTribe transforms driver behaviour and vehicle telemetry into
          explainable risk and maintenance insights.
        </p>

        {/* CTAs */}
        <div data-fade className="flex flex-col sm:flex-row items-center gap-3 mt-1">
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-[14px] font-semibold rounded-full hover:opacity-80 transition-opacity duration-200"
          >
            Explore FleetTribe
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
          <a
            href="#story"
            className="inline-flex items-center gap-1.5 px-5 py-3 text-[14px] font-medium text-muted-foreground hover:text-foreground border border-border/80 rounded-full transition-colors duration-200"
          >
            See how it works
            <ChevronDown size={13} />
          </a>
        </div>

        {/* Product preview */}
        <div data-fade className="mt-12 w-full">
          <ProductPreview topDrivers={topDrivers} topVehicles={topVehicles} />
        </div>
      </div>
    </section>
  );
}
