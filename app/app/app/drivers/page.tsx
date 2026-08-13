"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import driversRaw from "@/lib/data/driver_features.json";
import type { DriverFeature } from "@/lib/types";
import { getRiskBadgeClass } from "@/lib/types";

const drivers = driversRaw as DriverFeature[];

type SortKey = keyof Pick<DriverFeature, "rank" | "risk_score" | "score_speed" | "score_accel" | "score_gyro" | "score_variability">;

export default function DriversDashboard() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    return drivers
      .filter((d) =>
        (d.Driver_Name.toLowerCase().includes(search.toLowerCase()) ||
          d.Driver_ID.toLowerCase().includes(search.toLowerCase()))
      )
      .filter((d) => riskFilter === "All" || d.risk_level === riskFilter)
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        return (a[sortKey] - b[sortKey]) * dir;
      });
  }, [search, riskFilter, sortKey, sortDir]);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="opacity-20 ml-1">↕</span>;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="inline ml-0.5" />
      : <ChevronDown size={12} className="inline ml-0.5" />;
  }

  const highRisk = drivers.filter((d) => d.risk_level === "High Risk").length;
  const moderate = drivers.filter((d) => d.risk_level === "Moderate Risk").length;
  const low = drivers.filter((d) => d.risk_level === "Low Risk").length;

  return (
    <div className="px-8 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Driver Intelligence</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          30 drivers · {highRisk} high risk · {moderate} moderate · {low} low risk
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "High Risk", count: highRisk, color: "oklch(0.55 0.19 25)" },
          { label: "Moderate Risk", count: moderate, color: "oklch(0.65 0.14 60)" },
          { label: "Low Risk", count: low, color: "oklch(0.50 0.15 145)" },
        ].map((k) => (
          <button
            key={k.label}
            onClick={() => setRiskFilter(riskFilter === k.label ? "All" : k.label)}
            className={`ft-card p-4 text-left transition-all cursor-pointer hover:border-foreground/30 ${
              riskFilter === k.label ? "border-foreground" : "border-border"
            }`}
          >
            <p className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase mb-1">{k.label}</p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: k.color }}>{k.count}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search drivers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
            aria-label="Search drivers"
          />
        </div>
        {riskFilter !== "All" && (
          <button
            onClick={() => setRiskFilter("All")}
            className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors self-center"
          >
            Clear filter ×
          </button>
        )}
      </div>

      {/* Table */}
      <div className="ft-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border ft-surface-header">
                {[
                  { label: "Rank", key: "rank" as SortKey },
                  { label: "Driver", key: null },
                  { label: "Risk Score", key: "risk_score" as SortKey },
                  { label: "Risk Level", key: null },
                  { label: "Speed", key: "score_speed" as SortKey },
                  { label: "Acceleration", key: "score_accel" as SortKey },
                  { label: "Gyroscope", key: "score_gyro" as SortKey },
                  { label: "Variability", key: "score_variability" as SortKey },
                  { label: "", key: null },
                ].map((col) => (
                  <th
                    key={col.label}
                    className={`text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground tracking-widest uppercase whitespace-nowrap select-none ${col.key ? "cursor-pointer hover:text-foreground" : ""}`}
                    onClick={col.key ? () => handleSort(col.key as SortKey) : undefined}
                  >
                    {col.label}
                    {col.key && <SortIcon k={col.key as SortKey} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.Driver_ID}
                  className={`border-b border-border/50 transition-colors ft-surface-row ${d.rank === 1 ? "ft-surface-row-highlight" : ""}`}
                >
                  <td className="px-4 py-3 font-bold tabular-nums text-muted-foreground">{d.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{d.Driver_Name}</p>
                    <p className="text-[11px] text-muted-foreground">{d.Driver_ID} · {d.Home_Hub}</p>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-foreground">{Math.round(d.risk_score)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getRiskBadgeClass(d.risk_level)}`}>
                      {d.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{Math.round(d.score_speed)}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{Math.round(d.score_accel)}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{Math.round(d.score_gyro)}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{Math.round(d.score_variability)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/drivers/${d.Driver_ID}`}
                      className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">Showing {filtered.length} of {drivers.length} drivers</p>
    </div>
  );
}
