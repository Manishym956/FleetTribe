import Link from "next/link";
import { ArrowRight, AlertTriangle, Activity } from "lucide-react";
import fleetSummaryRaw from "@/lib/data/fleet_summary.json";
import driversRaw from "@/lib/data/driver_features.json";
import vehiclesRaw from "@/lib/data/vehicle_features.json";
import type { FleetSummary, DriverFeature, VehicleFeature } from "@/lib/types";
import { getRiskBadgeClass, getHealthBadgeClass } from "@/lib/types";

const fleet = fleetSummaryRaw as FleetSummary;
const topDrivers = (driversRaw as DriverFeature[]).slice(0, 6);
const topVehicles = (vehiclesRaw as VehicleFeature[]).slice(0, 6);

function StatCard({
  label,
  value,
  sub,
  warn,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className={`p-5 ft-card ${warn ? "ft-warn-surface" : ""}`}>
      <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-2">
        {label}
      </p>
      <p className={`text-[28px] font-bold tabular-nums tracking-[-0.03em] leading-none ${warn ? "text-[oklch(0.52_0.19_25)]" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-[11.5px] text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}

function DistBar({ count, total, color }: { count: number; total: number; color: string }) {
  return (
    <div className="h-1.5 ft-bar-track rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full"
        style={{ width: `${(count / total) * 100}%`, background: color }}
      />
    </div>
  );
}

export default function FleetOverviewPage() {
  const avgRisk = Math.round(fleet.avg_driver_risk_score);
  const avgHealth = Math.round(fleet.avg_vehicle_health_score);

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-[-0.02em] mb-1 text-foreground">Fleet Overview</h1>
        <p className="text-[13.5px] text-muted-foreground">
          Avg driver risk{" "}
          <span className="font-semibold text-foreground">{avgRisk}/100</span>
          {" · "}Avg vehicle health{" "}
          <span className="font-semibold text-foreground">{avgHealth}/100</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <StatCard label="Total Drivers" value="30" />
        <StatCard label="Total Vehicles" value="30" />
        <StatCard label="Total Trips" value="450" />
        <StatCard label="Telemetry Records" value="12,987" />
        <StatCard
          label="High Risk Drivers"
          value={String(fleet.drivers_by_risk_level["High Risk"])}
          sub="Require coaching attention"
          warn
        />
        <StatCard
          label="Vehicles — Attention"
          value={String(fleet.vehicles_by_health_status["Maintenance Attention"])}
          sub="Inspection priority"
          warn
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="ft-card p-5">
          <h2 className="text-[12px] font-semibold mb-4 tracking-[-0.01em] text-foreground">Driver Risk Distribution</h2>
          <div className="space-y-3">
            {[
              { label: "High Risk", count: fleet.drivers_by_risk_level["High Risk"], color: "oklch(0.52 0.19 25)" },
              { label: "Moderate Risk", count: fleet.drivers_by_risk_level["Moderate Risk"], color: "oklch(0.62 0.14 55)" },
              { label: "Low Risk", count: fleet.drivers_by_risk_level["Low Risk"], color: "oklch(0.48 0.15 145)" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="text-[12px] text-muted-foreground w-26 shrink-0">{r.label}</span>
                <DistBar count={r.count} total={30} color={r.color} />
                <span className="text-[12px] font-bold tabular-nums w-4 text-right shrink-0 text-foreground">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ft-card p-5">
          <h2 className="text-[12px] font-semibold mb-4 tracking-[-0.01em] text-foreground">Vehicle Health Distribution</h2>
          <div className="space-y-3">
            {[
              { label: "Attention", count: fleet.vehicles_by_health_status["Maintenance Attention"], color: "oklch(0.52 0.19 25)" },
              { label: "Monitor", count: fleet.vehicles_by_health_status["Monitor"], color: "oklch(0.62 0.14 55)" },
              { label: "Healthy", count: fleet.vehicles_by_health_status["Healthy"], color: "oklch(0.48 0.15 145)" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="text-[12px] text-muted-foreground w-20 shrink-0">{r.label}</span>
                <DistBar count={r.count} total={30} color={r.color} />
                <span className="text-[12px] font-bold tabular-nums w-4 text-right shrink-0 text-foreground">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="ft-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border ft-surface-header">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-[oklch(0.52_0.19_25)]" />
              <h2 className="text-[12px] font-semibold text-foreground">Top Risk Drivers</h2>
            </div>
            <Link href="/app/drivers" className="text-[11.5px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <ul>
            {topDrivers.map((d, i) => (
              <li
                key={d.Driver_ID}
                className={`flex items-center px-5 py-3 border-b border-border/50 last:border-0 transition-colors ft-surface-row ${i === 0 ? "ft-surface-row-highlight" : ""}`}
              >
                <span className="text-[11px] font-bold text-muted-foreground w-5 shrink-0">{d.rank}</span>
                <div className="flex-1 min-w-0 mx-3">
                  <Link href={`/app/drivers/${d.Driver_ID}`} className="text-[12.5px] font-semibold text-foreground hover:underline truncate block">
                    {d.Driver_Name}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">{d.Driver_ID}</p>
                </div>
                <span className="text-[13px] font-bold tabular-nums mr-3 text-foreground">{Math.round(d.risk_score)}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${getRiskBadgeClass(d.risk_level)}`}>
                  {d.risk_level === "High Risk" ? "HIGH" : d.risk_level === "Low Risk" ? "LOW" : "MOD"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ft-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border ft-surface-header">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-[oklch(0.52_0.19_25)]" />
              <h2 className="text-[12px] font-semibold text-foreground">Vehicles Requiring Inspection</h2>
            </div>
            <Link href="/app/vehicles" className="text-[11.5px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <ul>
            {topVehicles.map((v, i) => (
              <li
                key={v.Vehicle_ID}
                className={`flex items-center px-5 py-3 border-b border-border/50 last:border-0 transition-colors ft-surface-row ${i === 0 ? "ft-surface-row-highlight" : ""}`}
              >
                <span className="text-[11px] font-bold text-muted-foreground w-5 shrink-0">{v.rank}</span>
                <div className="flex-1 min-w-0 mx-3">
                  <Link href={`/app/vehicles/${v.Vehicle_ID}`} className="text-[12.5px] font-semibold text-foreground hover:underline truncate block">
                    {v.Make} {v.Model}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">{v.Vehicle_ID}</p>
                </div>
                <span className="text-[13px] font-bold tabular-nums mr-3 text-foreground">{Math.round(v.health_score)}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${getHealthBadgeClass(v.health_status)}`}>
                  {v.health_status === "Maintenance Attention" ? "ATTN" : v.health_status === "Healthy" ? "OK" : "MON"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
