"use client";

import { useEffect, useRef } from "react";

const METRICS = [
  { value: 30, label: "Drivers", suffix: "" },
  { value: 30, label: "Vehicles", suffix: "" },
  { value: 450, label: "Trips", suffix: "" },
  { value: 12987, label: "Telemetry Records", suffix: "" },
];

function useCountUp(target: number, duration = 1200) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = "0";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            // Ease-out cubic
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return ref;
}

function MetricItem({ value, label }: { value: number; label: string }) {
  const ref = useCountUp(value);
  return (
    <div className="flex flex-col items-center justify-center py-14 px-8 gap-3">
      <p className="text-[56px] sm:text-[68px] font-bold tracking-[-0.05em] leading-none tabular-nums">
        <span ref={ref}>0</span>
      </p>
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export default function FleetSnapshot() {
  return (
    <section
      id="snapshot"
      aria-label="Fleet metrics"
      className="border-y border-border"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
        {METRICS.map((m) => (
          <MetricItem key={m.label} value={m.value} label={m.label} />
        ))}
      </div>
    </section>
  );
}
