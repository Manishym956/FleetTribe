import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import driversRaw from "@/lib/data/driver_features.json";
import vehiclesRaw from "@/lib/data/vehicle_features.json";
import type { DriverFeature, VehicleFeature } from "@/lib/types";
import { getRiskBadgeClass } from "@/lib/types";

const drivers = driversRaw as DriverFeature[];
const vehicles = vehiclesRaw as VehicleFeature[];

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 65 ? "oklch(0.52 0.19 25)"
    : score >= 35 ? "oklch(0.62 0.14 55)"
    : "oklch(0.48 0.15 145)";
  return (
    <div className="h-1.5 bg-[oklch(0.93_0_0)] rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

export function generateStaticParams() {
  return drivers.map((d) => ({ driverId: d.Driver_ID }));
}

export default function DriverDetailPage({ params }: { params: { driverId: string } }) {
  const driver = drivers.find((d) => d.Driver_ID === params.driverId);
  if (!driver) notFound();

  const vehicle = vehicles.find((v) => v.Vehicle_ID === driver.Primary_Vehicle_ID);
  const percentile = Math.round(((30 - driver.rank) / 29) * 100);

  const components = [
    {
      label: "Speed Risk",
      score: driver.score_speed,
      weight: 35,
      desc: "Avg speed and 95th-percentile speed vs fleet baseline.",
    },
    {
      label: "Acceleration Risk",
      score: driver.score_accel,
      weight: 30,
      desc: "Harsh acceleration event rate per telemetry minute.",
    },
    {
      label: "Gyroscope Risk",
      score: driver.score_gyro,
      weight: 25,
      desc: "Angular velocity event rate — lateral and cornering behaviour.",
    },
    {
      label: "Behavioural Variability",
      score: driver.score_variability,
      weight: 10,
      desc: "Trip-to-trip consistency in speed and acceleration patterns.",
    },
  ];

  return (
    <div className="px-8 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href="/app/drivers"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mb-7"
      >
        <ArrowLeft size={13} /> Drivers
      </Link>

      {/* Identity + score block */}
      <div className="mb-8 pb-8 border-b border-border">
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-3">
          Driver Intelligence Profile
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.025em] leading-none mb-1.5">
              {driver.Driver_Name}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              {driver.Driver_ID} · {driver.Home_Hub} · Rank {driver.rank} of 30
            </p>
          </div>
          <div className="flex items-end gap-4 shrink-0">
            <div>
              <p className="text-[64px] font-bold tabular-nums tracking-[-0.05em] leading-none">
                {Math.round(driver.risk_score)}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">/ 100 Risk Score</p>
            </div>
            <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full mb-2 ${getRiskBadgeClass(driver.risk_level)}`}>
              {driver.risk_level.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Three cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-7">
        {/* Profile */}
        <div className="rounded-xl border border-border p-5">
          <h2 className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-3.5">Profile</h2>
          <dl className="space-y-2.5">
            {[
              ["Age", driver.Age],
              ["Gender", driver.Gender],
              ["Experience", `${driver.License_Experience_Years} yrs`],
              ["Joined", driver.Date_Joined_Fleet],
              ["Trips this week", driver.trips_count],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between items-baseline gap-2">
                <dt className="text-[12px] text-muted-foreground shrink-0">{String(k)}</dt>
                <dd className="text-[12.5px] font-medium text-right">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Fleet position */}
        <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
          <h2 className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">Fleet Position</h2>
          <div className="text-center flex-1 flex flex-col items-center justify-center gap-1">
            <p className="text-[44px] font-bold tabular-nums tracking-[-0.04em] leading-none">#{driver.rank}</p>
            <p className="text-[12px] text-muted-foreground">of 30 drivers</p>
          </div>
          <div>
            <div className="flex justify-between text-[11.5px] text-muted-foreground mb-1.5">
              <span>Higher risk than</span>
              <span className="font-semibold text-foreground">{percentile}%</span>
            </div>
            <div className="h-1.5 bg-[oklch(0.93_0_0)] rounded-full overflow-hidden">
              <div className="h-full bg-foreground/25 rounded-full" style={{ width: `${percentile}%` }} />
            </div>
          </div>
        </div>

        {/* Primary vehicle */}
        <div className="rounded-xl border border-border p-5">
          <h2 className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-3.5">Primary Vehicle</h2>
          {vehicle ? (
            <div className="flex flex-col gap-2">
              <p className="text-[15px] font-semibold">{vehicle.Make} {vehicle.Model}</p>
              <p className="text-[12px] text-muted-foreground">{vehicle.Vehicle_ID} · {vehicle.Manufacture_Year}</p>
              <p className="text-[12px] text-muted-foreground">{vehicle.health_status}</p>
              <Link href={`/app/vehicles/${vehicle.Vehicle_ID}`} className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors mt-1">
                Vehicle profile →
              </Link>
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">No vehicle assigned</p>
          )}
        </div>
      </div>

      {/* Why this matters */}
      <div className="rounded-xl border border-border p-6 mb-5">
        <h2 className="text-[12.5px] font-semibold mb-3 tracking-[-0.01em]">Why This Matters</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{driver.explanation}</p>
        {driver.top_factors.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {driver.top_factors.map((f) => (
              <span key={f} className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-border bg-[oklch(0.975_0_0)] text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Score breakdown */}
      <div className="rounded-xl border border-border p-6 mb-5">
        <h2 className="text-[12.5px] font-semibold mb-5 tracking-[-0.01em]">Score Breakdown</h2>
        <div className="space-y-5">
          {components.map((c, i) => (
            <div key={c.label}>
              <div className="flex items-start justify-between mb-1.5 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13.5px] font-medium">{c.label}</span>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{c.weight}%</span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground">{c.desc}</p>
                </div>
                <span className="text-[16px] font-bold tabular-nums shrink-0">{Math.round(c.score)}</span>
              </div>
              <ScoreBar score={c.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Raw telemetry */}
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-[12.5px] font-semibold mb-4 tracking-[-0.01em]">Trip Telemetry Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Avg Speed", value: `${driver.avg_speed.toFixed(1)} km/h` },
            { label: "P95 Speed", value: `${driver.p95_speed.toFixed(1)} km/h` },
            { label: "Speed Variability", value: driver.speed_variability.toFixed(3) },
            { label: "Accel Event Rate", value: driver.mean_accel_rate.toFixed(4) },
            { label: "Gyro Event Rate", value: driver.mean_gyro_rate.toFixed(4) },
            { label: "Accel Variability", value: driver.accel_variability.toFixed(4) },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-[oklch(0.97_0_0)] p-3.5">
              <p className="text-[10.5px] text-muted-foreground font-medium tracking-[0.06em] uppercase mb-1.5">{s.label}</p>
              <p className="text-[14px] font-semibold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
