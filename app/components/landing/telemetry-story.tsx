"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { DriverFeature, VehicleFeature } from "@/lib/types";
import { getHealthBadgeClass } from "@/lib/types";

const PANEL_HEIGHT = 560;

// ─── STORY PANEL VISUALS ─────────────────────────────────

function TelemetryPanel() {
  const seed = [
    0.72, 0.45, 0.88, 0.31, 0.65, 0.92, 0.38, 0.78, 0.55, 0.82, 0.29, 0.67, 0.94,
    0.41, 0.73, 0.58, 0.86, 0.33, 0.76, 0.49, 0.91, 0.37, 0.62, 0.85, 0.44, 0.79,
    0.53, 0.68, 0.95, 0.26, 0.71, 0.87, 0.42, 0.64, 0.93, 0.35, 0.77, 0.51, 0.88, 0.6,
  ];

  return (
    <div className="flex flex-col gap-7 h-full justify-center">
      <div className="flex items-baseline gap-3">
        <span className="text-[48px] font-bold tracking-[-0.04em] leading-none">12,987</span>
        <span className="text-[14px] text-muted-foreground font-light">telemetry records</span>
      </div>

      <div>
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-2.5">
          Speed · km/h
        </p>
        <div className="flex items-end gap-[3px] h-14">
          {seed.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-foreground/[0.14]"
              style={{ height: `${(0.35 + v * 0.65) * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-2.5">
          Acceleration · g
        </p>
        <div className="flex items-end gap-[3px] h-10">
          {seed.map((v, i) => {
            const val = Math.abs(Math.sin(i * 0.7) * v);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-foreground/[0.10]"
                style={{ height: `${(0.1 + val * 0.9) * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-2.5">
          Gyroscope · dps
        </p>
        <div className="flex items-end gap-[3px] h-7">
          {seed.map((v, i) => {
            const val = Math.abs(Math.cos(i * 1.1) * v * 0.7);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-foreground/[0.07]"
                style={{ height: `${(0.05 + val) * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-[12px] text-muted-foreground">
          <span className="font-semibold text-foreground">450 trips</span>
          {" · "}
          <span className="font-semibold text-foreground">30 drivers</span>
          {" · "}
          <span className="font-semibold text-foreground">30 vehicles</span>
        </p>
      </div>
    </div>
  );
}

function DriverBehaviourPanel({ driver }: { driver: DriverFeature }) {
  const components = [
    { label: "Speed", score: driver.score_speed, weight: 35 },
    { label: "Acceleration", score: driver.score_accel, weight: 30 },
    { label: "Gyroscope", score: driver.score_gyro, weight: 25 },
    { label: "Behavioural Variability", score: driver.score_variability, weight: 10 },
  ];

  return (
    <div className="flex flex-col gap-7 h-full justify-center">
      <div>
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-2">
          Highest Risk Driver
        </p>
        <h3 className="text-[28px] font-bold tracking-[-0.03em] leading-none mb-1">
          {driver.Driver_Name}
        </h3>
        <p className="text-[13px] text-muted-foreground">{driver.Driver_ID}</p>
      </div>

      <div className="flex items-end gap-3 pb-2 border-b border-border">
        <p className="text-[56px] font-bold tabular-nums tracking-[-0.04em] leading-none">
          {Math.round(driver.risk_score)}
        </p>
        <p className="text-[14px] text-muted-foreground mb-2">/ 100</p>
        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full badge-risk-high mb-2 ml-auto">
          HIGH RISK
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
          Component Signals
        </p>
        {components.map((c) => {
          const color =
            c.score >= 60
              ? "oklch(0.52 0.19 25)"
              : c.score >= 35
              ? "oklch(0.62 0.14 55)"
              : "oklch(0.48 0.15 145)";
          return (
            <div key={c.label}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground/80">{c.label}</span>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {c.weight}%
                  </span>
                </div>
                <span className="text-[14px] font-bold tabular-nums">{Math.round(c.score)}</span>
              </div>
              <div className="h-1.5 bg-[oklch(0.93_0_0)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.score}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RiskScoringPanel({ driver }: { driver: DriverFeature }) {
  const steps = [
    { label: "Telemetry", sub: "Speed · Acceleration (X/Y/Z) · Gyroscope (X/Y/Z)" },
    { label: "Feature Engineering", sub: "Vector magnitudes · dynamic accel · event rates per trip-minute" },
    { label: "Fleet-relative Normalization", sub: "Robust Z-score (MAD) · clip [−2, +3] → 0–100" },
    { label: "Risk Score", sub: "35% Speed · 30% Accel · 25% Gyro · 10% Variability" },
  ];

  return (
    <div className="flex flex-col gap-6 h-full justify-center">
      <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
        Scoring Pipeline
      </p>

      <div className="space-y-1">
        {steps.map((step, i) => (
          <div key={step.label}>
            <div
              className={`rounded-xl border px-4 py-3 ${
                i === steps.length - 1
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-[oklch(0.985_0_0)]"
              }`}
            >
              <p className="text-[13.5px] font-semibold">{step.label}</p>
              <p className={`text-[11.5px] mt-0.5 ${i === steps.length - 1 ? "opacity-70" : "text-muted-foreground"}`}>
                {step.sub}
              </p>
              {i === steps.length - 1 && (
                <div className="flex items-end justify-between mt-3 pt-3 border-t border-background/20">
                  <p className="text-[12px] opacity-70">
                    {driver.Driver_Name} · {driver.Driver_ID}
                  </p>
                  <p className="text-[36px] font-bold tabular-nums tracking-[-0.04em] leading-none">
                    {Math.round(driver.risk_score)}
                  </p>
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1" aria-hidden="true">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                  <path
                    d="M6 0v12M1 7l5 5 5-5"
                    stroke="oklch(0.70 0 0)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VehicleHealthPanel({ vehicle }: { vehicle: VehicleFeature }) {
  return (
    <div className="flex flex-col gap-6 h-full justify-center">
      <div>
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase mb-2">
          Highest Priority Vehicle
        </p>
        <h3 className="text-[28px] font-bold tracking-[-0.03em] leading-none mb-1">
          {vehicle.Make} {vehicle.Model}
        </h3>
        <p className="text-[13px] text-muted-foreground">{vehicle.Vehicle_ID}</p>
      </div>

      <div className="flex items-end gap-3 pb-2 border-b border-border">
        <p className="text-[56px] font-bold tabular-nums tracking-[-0.04em] leading-none">
          {Math.round(vehicle.health_score)}
        </p>
        <p className="text-[14px] text-muted-foreground mb-2">/ 100</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ml-auto ${getHealthBadgeClass(vehicle.health_status)}`}>
          {vehicle.health_status === "Maintenance Attention" ? "ATTENTION" : vehicle.health_status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
          Sensor-derived Signal
        </p>
        {[
          { label: "Vibration Anomaly Index", score: vehicle.anomaly_vibration },
          { label: "Gyroscope Anomaly Index", score: vehicle.anomaly_gyro },
        ].map((s) => {
          const color = s.score >= 60 ? "oklch(0.52 0.19 25)" : "oklch(0.62 0.14 55)";
          return (
            <div key={s.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[13px] font-medium">{s.label}</span>
                <span className="text-[14px] font-bold tabular-nums">{Math.round(s.score)}</span>
              </div>
              <div className="h-1.5 bg-[oklch(0.93_0_0)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-border space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
          Contextual — not used in health score
        </p>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div>
            <span className="text-muted-foreground">Type</span>
            <p className="font-medium">{vehicle.Vehicle_Type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Odometer</span>
            <p className="font-medium">{vehicle.Odometer_KM_Start_of_Week.toLocaleString()} km</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground italic">
          Sensor-derived signal. Does not predict mechanical failure.
        </p>
      </div>
    </div>
  );
}

function ExplainabilityPanel({ driver }: { driver: DriverFeature }) {
  return (
    <div className="flex flex-col gap-6 h-full justify-center">
      <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
        Why is this flagged?
      </p>

      <div className="rounded-xl border border-border px-5 py-4 bg-[oklch(0.985_0_0)]">
        <p className="text-[13.5px] font-medium leading-relaxed text-foreground/85">
          {driver.explanation}
        </p>
      </div>

      <div className="space-y-2">
        {driver.top_factors.map((f, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-border bg-background">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[oklch(0.52_0.19_25)] shrink-0" />
            <span className="text-[13px] font-medium leading-snug">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STORY STEP CONFIG ───────────────────────────────────
function getSteps(driver: DriverFeature, vehicle: VehicleFeature) {
  return [
    {
      num: "01",
      title: "Telemetry",
      desc: "12,987 raw sensor records across speed, acceleration, and gyroscope channels.",
      panel: <TelemetryPanel />,
    },
    {
      num: "02",
      title: "Driver Behaviour",
      desc: "Trip-level behavioural signals aggregated per driver, compared fleet-wide.",
      panel: <DriverBehaviourPanel driver={driver} />,
    },
    {
      num: "03",
      title: "Risk Scoring",
      desc: "Robust Z-score normalization maps each driver into a fleet-relative 0–100 risk score.",
      panel: <RiskScoringPanel driver={driver} />,
    },
    {
      num: "04",
      title: "Vehicle Health",
      desc: "Sensor variance patterns flag vehicles with abnormal physical behaviour.",
      panel: <VehicleHealthPanel vehicle={vehicle} />,
    },
    {
      num: "05",
      title: "Explainable Insights",
      desc: "Every score traces back to the actual sensor signals that produced it.",
      panel: <ExplainabilityPanel driver={driver} />,
    },
  ];
}

// ─── MAIN COMPONENT ──────────────────────────────────────
interface TelemetryStoryProps {
  topDriver: DriverFeature;
  topVehicle: VehicleFeature;
}

export default function TelemetryStory({ topDriver, topVehicle }: TelemetryStoryProps) {
  const steps = getSteps(topDriver, topVehicle);
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gsapCtx = useRef<{ revert: () => void } | null>(null);
  const prevStepRef = useRef(0);
  const reducedMotion = useRef(false);

  const goToStep = useCallback((i: number) => {
    const el = stepRefs.current[i];
    el?.scrollIntoView({ behavior: reducedMotion.current ? "auto" : "smooth", block: "center" });
  }, []);

  // GSAP ScrollTrigger setup (desktop pin + step triggers)
  useEffect(() => {
    let cancelled = false;

    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsapCtx.current = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
          if (pinTargetRef.current && leftColumnRef.current) {
            ScrollTrigger.create({
              trigger: leftColumnRef.current,
              start: "top top+=7rem",
              end: "bottom bottom",
              pin: pinTargetRef.current,
              pinSpacing: true,
              invalidateOnRefresh: true,
            });
          }

          steps.forEach((_, i) => {
            const el = stepRefs.current[i];
            if (!el) return;
            ScrollTrigger.create({
              trigger: el,
              start: "top 55%",
              end: "bottom 45%",
              onEnter: () => setActiveStep(i),
              onEnterBack: () => setActiveStep(i),
            });
          });
        });

        mm.add("(max-width: 767px)", () => {
          steps.forEach((_, i) => {
            const el = stepRefs.current[i];
            if (!el) return;
            ScrollTrigger.create({
              trigger: el,
              start: "top 60%",
              end: "bottom 40%",
              onEnter: () => setActiveStep(i),
              onEnterBack: () => setActiveStep(i),
            });
          });
        });
      }, sectionRef);
    };

    loadGSAP();
    return () => {
      cancelled = true;
      gsapCtx.current?.revert();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Panel crossfade on step change
  useEffect(() => {
    let cancelled = false;

    const animatePanels = async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const prev = panelRefs.current[prevStepRef.current];
      const next = panelRefs.current[activeStep];
      if (!next) return;

      if (reducedMotion.current) {
        panelRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.opacity = i === activeStep ? "1" : "0";
          el.style.pointerEvents = i === activeStep ? "auto" : "none";
        });
        prevStepRef.current = activeStep;
        return;
      }

      gsap.set(next, { opacity: 0, y: 6, pointerEvents: "none" });
      gsap.to(next, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
        onStart: () => {
          next.style.pointerEvents = "auto";
        },
      });

      if (prev && prev !== next) {
        gsap.to(prev, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            prev.style.pointerEvents = "none";
          },
        });
      }

      prevStepRef.current = activeStep;
    };

    animatePanels();
    return () => {
      cancelled = true;
    };
  }, [activeStep]);

  // Initial panel visibility
  useEffect(() => {
    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = i === 0 ? "1" : "0";
      el.style.pointerEvents = i === 0 ? "auto" : "none";
    });
  }, []);

  return (
    <section
      id="story"
      ref={sectionRef}
      aria-label="How FleetTribe works"
      className="relative bg-background"
    >
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="section-label mb-3">How it works</p>
        <h2 className="text-[44px] sm:text-[54px] font-bold tracking-[-0.03em] leading-[1.05]">
          From raw signals to{" "}
          <span className="font-serif-italic font-normal">clarity.</span>
        </h2>
      </div>

      {/* Desktop: pinned storytelling */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 pb-48">
        <div className="flex gap-16 xl:gap-20 items-start">
          {/* Left: scrollable step nav (~40%) */}
          <div ref={leftColumnRef} className="w-[40%] flex flex-col shrink-0">
            {steps.map((step, i) => (
              <div
                key={step.num}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="py-[4.5rem] cursor-pointer"
                onClick={() => goToStep(i)}
              >
                <p
                  className={`text-[11px] font-semibold tracking-[0.08em] uppercase mb-2 transition-colors duration-300 ${
                    activeStep === i ? "text-muted-foreground" : "text-muted-foreground/40"
                  }`}
                >
                  {step.num}
                </p>
                <h3
                  className={`text-[28px] font-bold tracking-[-0.025em] mb-2.5 transition-all duration-300 ${
                    activeStep === i ? "text-foreground" : "text-foreground/20"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-[14px] leading-relaxed max-w-[280px] transition-all duration-300 ${
                    activeStep === i ? "text-muted-foreground" : "text-muted-foreground/30"
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right: pinned visual panel (~60%) */}
          <div className="w-[60%] shrink-0">
            <div ref={pinTargetRef}>
              <div
                className="preview-card overflow-hidden"
                style={{ height: PANEL_HEIGHT }}
              >
                <div className="h-full flex flex-col">
                  <div className="px-7 py-4 border-b border-[oklch(0.92_0_0)] bg-[oklch(0.985_0_0)] flex items-center justify-between shrink-0">
                    <p className="text-[11px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
                      {steps[activeStep].num} — {steps[activeStep].title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {steps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goToStep(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            i === activeStep
                              ? "bg-foreground scale-110"
                              : "bg-[oklch(0.85_0_0)] hover:bg-[oklch(0.75_0_0)]"
                          }`}
                          aria-label={`Go to step ${steps[i].num}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative flex-1 overflow-hidden">
                    {steps.map((step, i) => (
                      <div
                        key={step.num}
                        ref={(el) => {
                          panelRefs.current[i] = el;
                        }}
                        className="absolute inset-0 px-7 py-7 overflow-auto"
                        aria-hidden={activeStep !== i}
                      >
                        {step.panel}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden max-w-xl mx-auto px-5 pb-20 flex flex-col gap-4">
        {steps.map((step, i) => (
          <div
            key={step.num}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="preview-card overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[oklch(0.92_0_0)] bg-[oklch(0.985_0_0)]">
              <p className="text-[10.5px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
                {step.num} — {step.title}
              </p>
            </div>
            <div className="px-5 py-6 min-h-[320px]">{step.panel}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
