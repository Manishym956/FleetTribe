"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import vehiclesRaw from "@/lib/data/vehicle_features.json";
import type { VehicleFeature } from "@/lib/types";
import { getHealthBadgeClass } from "@/lib/types";

const vehicles = vehiclesRaw as VehicleFeature[];

type SortKey = keyof Pick<VehicleFeature, "rank" | "health_score" | "anomaly_vibration" | "anomaly_gyro">;

export default function VehiclesDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    return vehicles
      .filter((v) => `${v.Make} ${v.Model} ${v.Vehicle_ID}`.toLowerCase().includes(search.toLowerCase()))
      .filter((v) => statusFilter === "All" || v.health_status === statusFilter)
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        return (a[sortKey] - b[sortKey]) * dir;
      });
  }, [search, statusFilter, sortKey, sortDir]);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="opacity-20 ml-1">↕</span>;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="inline ml-0.5" />
      : <ChevronDown size={12} className="inline ml-0.5" />;
  }

  const counts = {
    attention: vehicles.filter((v) => v.health_status === "Maintenance Attention").length,
    monitor: vehicles.filter((v) => v.health_status === "Monitor").length,
    healthy: vehicles.filter((v) => v.health_status === "Healthy").length,
  };

  return (
    <div className="px-8 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Vehicle Health</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          30 vehicles · {counts.attention} maintenance attention · {counts.monitor} monitor · {counts.healthy} healthy
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Maintenance Attention", count: counts.attention, color: "oklch(0.55 0.19 25)", key: "Maintenance Attention" },
          { label: "Monitor", count: counts.monitor, color: "oklch(0.65 0.14 60)", key: "Monitor" },
          { label: "Healthy", count: counts.healthy, color: "oklch(0.50 0.15 145)", key: "Healthy" },
        ].map((k) => (
          <button
            key={k.label}
            onClick={() => setStatusFilter(statusFilter === k.key ? "All" : k.key)}
            className={`ft-card p-4 text-left transition-all cursor-pointer hover:border-foreground/30 ${
              statusFilter === k.key ? "border-foreground" : "border-border"
            }`}
          >
            <p className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase mb-1">{k.label}</p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: k.color }}>{k.count}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vehicles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
            aria-label="Search vehicles"
          />
        </div>
        {statusFilter !== "All" && (
          <button
            onClick={() => setStatusFilter("All")}
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
                  { label: "Vehicle", key: null },
                  { label: "Health Score", key: "health_score" as SortKey },
                  { label: "Status", key: null },
                  { label: "Vibration", key: "anomaly_vibration" as SortKey },
                  { label: "Gyroscope", key: "anomaly_gyro" as SortKey },
                  { label: "Last Service", key: null },
                  { label: "Odometer", key: null },
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
              {filtered.map((v) => (
                <tr
                  key={v.Vehicle_ID}
                  className={`border-b border-border/50 transition-colors ft-surface-row ${v.rank === 1 ? "ft-surface-row-highlight" : ""}`}
                >
                  <td className="px-4 py-3 font-bold tabular-nums text-muted-foreground">{v.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{v.Make} {v.Model}</p>
                    <p className="text-[11px] text-muted-foreground">{v.Vehicle_ID} · {v.Vehicle_Type}</p>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-foreground">{Math.round(v.health_score)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getHealthBadgeClass(v.health_status)}`}>
                      {v.health_status === "Maintenance Attention" ? "Attention" : v.health_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{Math.round(v.anomaly_vibration)}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{Math.round(v.anomaly_gyro)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{v.Last_Service_Date}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{v.Odometer_KM_Start_of_Week.toLocaleString()} km</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/vehicles/${v.Vehicle_ID}`}
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
      <p className="mt-3 text-[12px] text-muted-foreground">Showing {filtered.length} of {vehicles.length} vehicles</p>
    </div>
  );
}
