"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { DriverFeature } from "@/lib/types";
import { getRiskBadgeClass } from "@/lib/types";

interface DriverIntelligencePreviewProps {
  drivers: DriverFeature[];
}

export default function DriverIntelligencePreview({ drivers }: DriverIntelligencePreviewProps) {
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return drivers
      .filter(
        (d) =>
          d.Driver_Name.toLowerCase().includes(search.toLowerCase()) ||
          d.Driver_ID.toLowerCase().includes(search.toLowerCase())
      )
      .filter((d) => riskFilter === "All" || d.risk_level === riskFilter)
      .slice(0, 8);
  }, [drivers, search, riskFilter]);

  return (
    <section
      id="drivers"
      aria-label="Driver Intelligence"
      className="py-28 px-6 border-y border-border bg-secondary/50"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="section-label mb-3">Driver Intelligence</p>
          <h2 className="text-[42px] sm:text-[52px] font-bold tracking-[-0.03em] leading-[1.05] mb-5 max-w-xl">
            Know which drivers{" "}
            <span className="font-serif-italic font-normal">need attention.</span>
          </h2>
          <p className="text-[16px] text-muted-foreground max-w-md leading-relaxed font-light">
            Fleet-relative risk scores make it easy to compare, prioritize,
            and explain driver behaviour.
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drivers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
              aria-label="Search drivers"
            />
          </div>
          <div className="flex flex-wrap gap-2">
          {["All", "High Risk", "Moderate Risk", "Low Risk"].map((f) => (
            <button
              key={f}
              onClick={() => setRiskFilter(f)}
              className={`px-3.5 py-1.5 text-[12.5px] font-medium rounded-full border transition-all duration-150 ${
                riskFilter === f
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background"
              }`}
            >
              {f}
            </button>
          ))}
          </div>
        </div>

        {/* Preview container */}
        <div className="preview-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2.5rem_1fr_6rem_7rem_4rem_4rem_4rem_4rem] gap-3 px-5 py-3 border-b border-border ft-surface-header">
            {["#", "Driver", "Risk", "Level", "Speed", "Accel", "Gyro", "Var"].map((h) => (
              <p key={h} className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.07em] uppercase">
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          <ul>
            {filtered.map((d, i) => (
              <li
                key={d.Driver_ID}
                className={`grid grid-cols-[2.5rem_1fr_6rem_7rem_4rem_4rem_4rem_4rem] gap-3 items-center px-5 py-3.5 border-b border-border/50 last:border-0 transition-colors duration-100 ft-surface-row ${d.rank === 1 ? "ft-surface-row-highlight" : ""}`}
              >
                <span className="text-[12px] font-bold text-muted-foreground/50 tabular-nums">{d.rank}</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate text-foreground">{d.Driver_Name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.Driver_ID}</p>
                </div>
                <span className="text-[15px] font-bold tabular-nums text-foreground">{Math.round(d.risk_score)}</span>
                <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full w-fit ${getRiskBadgeClass(d.risk_level)}`}>
                  {d.risk_level === "High Risk" ? "High" : d.risk_level === "Low Risk" ? "Low" : "Moderate"}
                </span>
                <span className="text-[12.5px] tabular-nums text-muted-foreground">{Math.round(d.score_speed)}</span>
                <span className="text-[12.5px] tabular-nums text-muted-foreground">{Math.round(d.score_accel)}</span>
                <span className="text-[12.5px] tabular-nums text-muted-foreground">{Math.round(d.score_gyro)}</span>
                <span className="text-[12.5px] tabular-nums text-muted-foreground">{Math.round(d.score_variability)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">Showing {filtered.length} of 30 drivers</p>
          <Link
            href="/app/drivers"
            className="group inline-flex items-center gap-2 text-[14px] font-semibold text-foreground hover:opacity-60 transition-opacity"
          >
            All drivers
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
