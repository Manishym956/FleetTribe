"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { VehicleFeature } from "@/lib/types";
import { getHealthBadgeClass } from "@/lib/types";

interface VehicleHealthPreviewProps {
  vehicles: VehicleFeature[];
}

export default function VehicleHealthPreview({ vehicles }: VehicleHealthPreviewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return vehicles
      .filter(
        (v) =>
          v.Make.toLowerCase().includes(search.toLowerCase()) ||
          v.Model.toLowerCase().includes(search.toLowerCase()) ||
          v.Vehicle_ID.toLowerCase().includes(search.toLowerCase())
      )
      .filter((v) => statusFilter === "All" || v.health_status === statusFilter)
      .slice(0, 8);
  }, [vehicles, search, statusFilter]);

  return (
    <section
      id="vehicles"
      aria-label="Vehicle Health"
      className="py-28 px-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="section-label mb-3">Vehicle Health</p>
          <h2 className="text-[42px] sm:text-[52px] font-bold tracking-[-0.03em] leading-[1.05] mb-5 max-w-xl">
            See which vehicles are{" "}
            <span className="font-serif-italic font-normal">behaving differently.</span>
          </h2>
          <p className="text-[16px] text-muted-foreground max-w-md leading-relaxed font-light">
            Unusual sensor signatures surface vehicles that warrant
            inspection before issues escalate.
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vehicles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
              aria-label="Search vehicles"
            />
          </div>
          <div className="flex flex-wrap gap-2">
          {["All", "Maintenance Attention", "Monitor", "Healthy"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 text-[12.5px] font-medium rounded-full border transition-all duration-150 ${
                statusFilter === f
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background"
              }`}
            >
              {f === "Maintenance Attention" ? "Attention" : f}
            </button>
          ))}
          </div>
        </div>

        {/* Preview container */}
        <div className="preview-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2.5rem_1fr_6rem_8rem_5rem_5rem] gap-3 px-5 py-3 border-b border-border ft-surface-header">
            {["#", "Vehicle", "Health", "Status", "Vibration", "Gyro"].map((h) => (
              <p key={h} className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.07em] uppercase">
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          <ul>
            {filtered.map((v) => (
              <li
                key={v.Vehicle_ID}
                className={`grid grid-cols-[2.5rem_1fr_6rem_8rem_5rem_5rem] gap-3 items-center px-5 py-3.5 border-b border-border/50 last:border-0 transition-colors duration-100 ft-surface-row ${v.rank === 1 ? "ft-surface-row-highlight" : ""}`}
              >
                <span className="text-[12px] font-bold text-muted-foreground/50 tabular-nums">{v.rank}</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate text-foreground">{v.Make} {v.Model}</p>
                  <p className="text-[11px] text-muted-foreground">{v.Vehicle_ID}</p>
                </div>
                <span className="text-[15px] font-bold tabular-nums text-foreground">{Math.round(v.health_score)}</span>
                <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full w-fit ${getHealthBadgeClass(v.health_status)}`}>
                  {v.health_status === "Maintenance Attention" ? "Attention" : v.health_status}
                </span>
                <span className="text-[12.5px] tabular-nums text-muted-foreground">{Math.round(v.anomaly_vibration)}</span>
                <span className="text-[12.5px] tabular-nums text-muted-foreground">{Math.round(v.anomaly_gyro)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">Showing {filtered.length} of 30 vehicles</p>
          <Link
            href="/app/vehicles"
            className="group inline-flex items-center gap-2 text-[14px] font-semibold text-foreground hover:opacity-60 transition-opacity"
          >
            All vehicles
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
