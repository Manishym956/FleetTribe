import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import FleetSnapshot from "@/components/landing/fleet-snapshot";
import TelemetryStory from "@/components/landing/telemetry-story";
import DriverIntelligencePreview from "@/components/landing/driver-intelligence-preview";
import VehicleHealthPreview from "@/components/landing/vehicle-health-preview";
import {
  ExplainabilitySection,
  MethodologyPreview,
  CTASection,
  Footer,
} from "@/components/landing/cta-footer";

import driversRaw from "@/lib/data/driver_features.json";
import vehiclesRaw from "@/lib/data/vehicle_features.json";
import methodologyRaw from "@/lib/data/methodology.json";

import type { DriverFeature, VehicleFeature, Methodology } from "@/lib/types";

const drivers = driversRaw as DriverFeature[];
const vehicles = vehiclesRaw as VehicleFeature[];
const methodology = methodologyRaw as Methodology;

export default function LandingPage() {
  const topDriver = drivers[0];
  const topVehicle = vehicles[0];

  return (
    <div className="landing-gradient min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero topDrivers={drivers} topVehicles={vehicles} />
        <FleetSnapshot />
        <TelemetryStory topDriver={topDriver} topVehicle={topVehicle} />
        <DriverIntelligencePreview drivers={drivers} />
        <VehicleHealthPreview vehicles={vehicles} />
        <ExplainabilitySection topDriver={topDriver} methodology={methodology} />
        <MethodologyPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
