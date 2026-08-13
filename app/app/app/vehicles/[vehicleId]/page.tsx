import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import vehiclesRaw from "@/lib/data/vehicle_features.json";
import driversRaw from "@/lib/data/driver_features.json";
import type { VehicleFeature, DriverFeature } from "@/lib/types";
import { getHealthBadgeClass } from "@/lib/types";

const vehicles = vehiclesRaw as VehicleFeature[];
const drivers = driversRaw as DriverFeature[];

function ScoreBar({ score }: { score: number }) {
  const color =
    score < 35 ? "oklch(0.52 0.19 25)"
    : score < 65 ? "oklch(0.62 0.14 55)"
    : "oklch(0.48 0.15 145)";
  return (
    <div className="h-1.5 ft-bar-track rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

export function generateStaticParams() {
  return vehicles.map((v) => ({ vehicleId: v.Vehicle_ID }));
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const vehicle = vehicles.find((v) => v.Vehicle_ID === vehicleId);
  if (!vehicle) notFound();

  const driver = drivers.find((d) => d.Primary_Vehicle_ID === vehicle.Vehicle_ID);
  const percentile = Math.round(((30 - vehicle.rank) / 29) * 100);

  return (
    <div className="px-8 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href="/app/vehicles"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mb-7"
      >
        <ArrowLeft size={13} /> Vehicles
      </Link>

      {/* Identity + score block */}
      <div className="mb-8 pb-8 border-b border-border">
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-3">
          Vehicle Health Profile
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.025em] leading-none mb-1.5">
              {vehicle.Make} {vehicle.Model}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              {vehicle.Vehicle_ID} · {vehicle.Vehicle_Type} · Rank {vehicle.rank} of 30
            </p>
          </div>
          <div className="flex items-end gap-4 shrink-0">
            <div>
              <p className="text-[64px] font-bold tabular-nums tracking-[-0.05em] leading-none">
                {Math.round(vehicle.health_score)}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">/ 100 Health Score</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${getHealthBadgeClass(vehicle.health_status)}`}>
              {vehicle.health_status === "Maintenance Attention" ? "ATTENTION" : vehicle.health_status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Three cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-7">
        {/* Vehicle info — clearly labelled as contextual */}
        <div className="ft-card p-5">
          <div className="mb-3.5">
            <h2 className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">Vehicle Info</h2>
            <p className="text-[10px] text-muted-foreground/60 italic mt-0.5">Contextual — not scored</p>
          </div>
          <dl className="space-y-2.5">
            {[
              ["Year", vehicle.Manufacture_Year],
              ["Registered", vehicle.Registration_Date],
              ["Odometer", `${vehicle.Odometer_KM_Start_of_Week.toLocaleString()} km`],
              ["Last Service", vehicle.Last_Service_Date],
              ["Trips this week", vehicle.trips_count],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between items-baseline gap-2">
                <dt className="text-[12px] text-muted-foreground shrink-0">{String(k)}</dt>
                <dd className="text-[12.5px] font-medium text-right">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Fleet position */}
        <div className="ft-card p-5 flex flex-col gap-4">
          <h2 className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">Fleet Position</h2>
          <div className="text-center flex-1 flex flex-col items-center justify-center gap-1">
            <p className="text-[44px] font-bold tabular-nums tracking-[-0.04em] leading-none">#{vehicle.rank}</p>
            <p className="text-[12px] text-muted-foreground">of 30 vehicles</p>
          </div>
          <div>
            <div className="flex justify-between text-[11.5px] text-muted-foreground mb-1.5">
              <span>More abnormal than</span>
              <span className="font-semibold text-foreground">{percentile}%</span>
            </div>
            <div className="h-1.5 ft-bar-track rounded-full overflow-hidden">
              <div className="h-full bg-foreground/25 rounded-full" style={{ width: `${percentile}%` }} />
            </div>
          </div>
        </div>

        {/* Assigned driver */}
        <div className="ft-card p-5">
          <h2 className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-3.5">Primary Driver</h2>
          {driver ? (
            <div className="flex flex-col gap-2">
              <p className="text-[15px] font-semibold">{driver.Driver_Name}</p>
              <p className="text-[12px] text-muted-foreground">{driver.Driver_ID}</p>
              <p className="text-[12px] text-muted-foreground">Risk: {Math.round(driver.risk_score)} · {driver.risk_level}</p>
              <Link href={`/app/drivers/${driver.Driver_ID}`} className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors mt-1">
                Driver profile →
              </Link>
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">No driver assigned</p>
          )}
        </div>
      </div>

      {/* Sensor signal */}
      <div className="ft-card p-6 mb-5">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-[12.5px] font-semibold tracking-[-0.01em]">Maintenance Inspection Signal</h2>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
            Sensor-derived
          </span>
        </div>
        <p className="text-[12px] text-muted-foreground mb-5 leading-relaxed">
          Derived from sensor variance relative to fleet. Indicates abnormal physical behaviour patterns.
          Does not predict mechanical failure.
        </p>
        <div className="space-y-5">
          {[
            {
              label: "Vibration Anomaly Index",
              score: vehicle.anomaly_vibration,
              desc: "Acceleration vector variance vs fleet baseline. Elevated = unusual vibration.",
            },
            {
              label: "Gyroscope Anomaly Index",
              score: vehicle.anomaly_gyro,
              desc: "Angular velocity variance vs fleet. Elevated = unusual rotational dynamics.",
            },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex items-start justify-between mb-1.5 gap-4">
                <div className="flex-1">
                  <p className="text-[13.5px] font-medium mb-0.5">{s.label}</p>
                  <p className="text-[11.5px] text-muted-foreground">{s.desc}</p>
                </div>
                <span className="text-[16px] font-bold tabular-nums shrink-0">{Math.round(s.score)}</span>
              </div>
              <ScoreBar score={s.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Analysis explanation */}
      <div className="ft-card p-6 mb-5">
        <h2 className="text-[12.5px] font-semibold mb-3 tracking-[-0.01em]">Analysis Explanation</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{vehicle.explanation}</p>
        {vehicle.top_signals.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {vehicle.top_signals.map((s) => (
              <span key={s} className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-border bg-muted text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Raw metrics */}
      <div className="ft-card p-6">
        <h2 className="text-[12.5px] font-semibold mb-4 tracking-[-0.01em]">Raw Sensor Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Vibration Variance", value: vehicle.vibration_variance.toFixed(6) },
            { label: "Gyro Variance", value: vehicle.gyro_variance.toFixed(2) },
            { label: "Mean Dynamic Accel", value: vehicle.mean_dynamic_accel.toFixed(4) },
            { label: "Mean Gyro Speed", value: `${vehicle.mean_gyro_speed.toFixed(2)} dps` },
            { label: "Sensor Abnormality", value: `${vehicle.sensor_abnormality_score.toFixed(1)}/100` },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-muted p-3.5">
              <p className="text-[10.5px] text-muted-foreground font-medium tracking-[0.06em] uppercase mb-1.5">{s.label}</p>
              <p className="text-[14px] font-semibold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
