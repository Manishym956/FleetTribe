import fleetSummaryRaw from "@/lib/data/fleet_summary.json";
import methodologyRaw from "@/lib/data/methodology.json";
import type { FleetSummary, Methodology } from "@/lib/types";

const fleet = fleetSummaryRaw as FleetSummary;
const methodology = methodologyRaw as Methodology;
const w = methodology.scoring_weights_baseline;

const PIPELINE = [
  {
    num: "01",
    title: "Raw Telemetry Ingestion",
    desc: "Excel workbook parsed with pandas (header=2 to skip title blocks). Three sheets joined on Driver_ID and Vehicle_ID keys.",
    details: ["12,987 telemetry records", "450 trips", "30 drivers, 30 vehicles", "0 missing values validated"],
  },
  {
    num: "02",
    title: "Feature Engineering",
    desc: "Vector magnitudes computed from multi-axis sensor readings. Rates normalized per trip duration to eliminate length bias.",
    details: [
      "Acceleration magnitude: √(X² + Y² + Z²)",
      "Dynamic acceleration: |magnitude − 1g|",
      "Gyroscope magnitude: √(X² + Y² + Z²) in dps",
      "Event rates per minute of telemetry",
    ],
  },
  {
    num: "03",
    title: "Fleet-Relative Normalization",
    desc: "Each metric normalized relative to the fleet using robust statistics. Protects against outlier distortion.",
    details: [
      "Robust Z-score: 0.6745 × (x − median) / MAD",
      "MAD = 0 fallback: use standard deviation",
      "Final fallback: Z = 0 (no information)",
      "Clipped to [−2, +3] → scaled 0–100",
    ],
  },
  {
    num: "04",
    title: "Driver Risk Scoring",
    desc: "Four component scores combined with analytical weights. Sensitivity analysis confirms ranking stability.",
    details: [
      `Speed Risk: ${Math.round(w.speed * 100)}%`,
      `Acceleration Risk: ${Math.round(w.acceleration * 100)}%`,
      `Gyroscope Risk: ${Math.round(w.gyro * 100)}%`,
      `Behavioural Variability: ${Math.round(w.variability * 100)}%`,
    ],
  },
  {
    num: "05",
    title: "Vehicle Health Scoring",
    desc: "Sensor variance analyzed to detect abnormal physical behaviour. Contextual metadata displayed separately.",
    details: [
      "Vibration anomaly: acceleration variance Z-score",
      "Gyro anomaly: angular velocity variance Z-score",
      "50/50 composite health score",
      "Does not predict mechanical failure",
    ],
  },
  {
    num: "06",
    title: "Sensitivity Analysis",
    desc: "Weights perturbed across 5 runs to verify ranking stability. Results confirm robust methodology.",
    details: [
      `Mean Spearman correlation: 0.981`,
      `Max rank shift: 1.4 places`,
      "Rankings stable under reasonable weight variations",
      "Assumptions documented explicitly",
    ],
  },
];

const ASSUMPTIONS = [
  "Acceleration threshold (0.3g) and gyroscope threshold (30 dps) are analytical assumptions based on typical two-wheeler telemetry ranges. These are documented as hypotheses, not established ground truth.",
  "Scoring weights (35/30/25/10) are expert-informed starting points, validated by sensitivity analysis. They should be recalibrated with domain expert input for production deployment.",
  "Vehicle health scores represent sensor-derived abnormality signals, not mechanical failure predictions. Scores above the threshold indicate inspection priority, not confirmed faults.",
  "The robust Z-score normalization is fleet-relative. A driver in a consistently aggressive fleet will appear less risky than they might in a broader context.",
];

const LIMITATIONS = [
  "No ground truth failure labels — vehicle health model is unsupervised.",
  "Week-long snapshot only — longitudinal trend analysis not possible with current data.",
  "Fleet is homogeneous (two-wheelers in one city) — scores may not generalize across vehicle types or geographies.",
  "Gyroscope magnitude represents angular velocity (dps), not angular acceleration — documented explicitly.",
];

export default function MethodologyPage() {
  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Methodology</h1>
        <p className="text-[14px] text-muted-foreground mt-1 max-w-xl">
          Technical documentation of the FleetTribe analytical pipeline. All scores are traceable to specific
          formulas and data inputs.
        </p>
      </div>

      {/* Pipeline */}
      <div className="mb-10">
        <h2 className="text-[13px] font-semibold text-muted-foreground tracking-widest uppercase mb-5">Pipeline</h2>
        <div className="relative">
          <div className="hidden md:block absolute left-[1.375rem] top-5 bottom-5 w-px bg-border" aria-hidden="true" />
          <div className="flex flex-col gap-5">
            {PIPELINE.map((step) => (
              <div key={step.num} className="flex gap-5 items-start">
                <div className="shrink-0 w-11 h-11 rounded-full border border-border bg-background flex items-center justify-center z-10 text-[11px] font-bold text-muted-foreground">
                  {step.num}
                </div>
                <div className="flex-1 ft-card p-5">
                  <h3 className="text-[14px] font-semibold mb-1">{step.title}</h3>
                  <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">{step.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {step.details.map((d) => (
                      <li key={d} className="text-[12px] text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sensitivity analysis table */}
      <div className="mb-10">
        <h2 className="text-[13px] font-semibold text-muted-foreground tracking-widest uppercase mb-4">Sensitivity Analysis</h2>
        <div className="ft-card overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border ft-surface-header">
                {["Run", "Speed", "Accel", "Gyro", "Variability", "Spearman ρ", "Avg Rank Shift"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fleet.sensitivity_analysis.map((r) => (
                <tr key={r.run} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium">{r.run}</td>
                  <td className="px-4 py-3 tabular-nums">{Math.round(r.weights_perturbed.speed * 100)}%</td>
                  <td className="px-4 py-3 tabular-nums">{Math.round(r.weights_perturbed.acceleration * 100)}%</td>
                  <td className="px-4 py-3 tabular-nums">{Math.round(r.weights_perturbed.gyro * 100)}%</td>
                  <td className="px-4 py-3 tabular-nums">{Math.round(r.weights_perturbed.variability * 100)}%</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{r.spearman_rank_correlation.toFixed(4)}</td>
                  <td className="px-4 py-3 tabular-nums">{r.avg_rank_shift.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions */}
      <div className="mb-10">
        <h2 className="text-[13px] font-semibold text-muted-foreground tracking-widest uppercase mb-4">Analytical Assumptions</h2>
        <div className="space-y-3">
          {ASSUMPTIONS.map((a, i) => (
            <div key={i} className="flex gap-3 p-4 ft-card ft-assumption-surface">
              <span className="shrink-0 text-[10.5px] font-bold text-[oklch(0.55_0.14_60)] mt-0.5">ASSUMPTION</span>
              <p className="text-[13px] text-foreground/80 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="mb-8">
        <h2 className="text-[13px] font-semibold text-muted-foreground tracking-widest uppercase mb-4">Limitations</h2>
        <div className="ft-card overflow-hidden divide-y divide-border">
          {LIMITATIONS.map((l, i) => (
            <div key={i} className="flex gap-3 px-5 py-4">
              <span className="shrink-0 text-[10.5px] font-bold text-[oklch(0.50_0.19_25)] mt-0.5">LIMIT</span>
              <p className="text-[13px] text-foreground/80 leading-relaxed">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
