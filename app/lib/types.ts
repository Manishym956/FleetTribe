// ─── FleetTribe Shared Types ──────────────────────────────────
export interface DriverFeature {
  Driver_ID: string;
  Driver_Name: string;
  Age: number;
  Gender: string;
  License_Experience_Years: number;
  Date_Joined_Fleet: string;
  Primary_Vehicle_ID: string;
  Home_Hub: string;
  trips_count: number;
  avg_speed: number;
  p95_speed: number;
  mean_accel_rate: number;
  mean_gyro_rate: number;
  speed_variability: number;
  accel_variability: number;
  z_avg_speed: number;
  z_p95_speed: number;
  z_accel_rate: number;
  z_gyro_rate: number;
  z_speed_var: number;
  z_accel_var: number;
  score_speed: number;
  score_accel: number;
  score_gyro: number;
  score_variability: number;
  risk_score: number;
  risk_level: "Low Risk" | "Moderate Risk" | "High Risk";
  rank: number;
  explanation: string;
  top_factors: string[];
}

export interface VehicleFeature {
  Vehicle_ID: string;
  Vehicle_Type: string;
  Make: string;
  Model: string;
  Manufacture_Year: number;
  Registration_Date: string;
  Odometer_KM_Start_of_Week: number;
  Last_Service_Date: string;
  trips_count: number;
  vibration_variance: number;
  gyro_variance: number;
  mean_dynamic_accel: number;
  mean_gyro_speed: number;
  z_vibration: number;
  z_gyro: number;
  anomaly_vibration: number;
  anomaly_gyro: number;
  sensor_abnormality_score: number;
  health_score: number;
  health_status: "Healthy" | "Monitor" | "Maintenance Attention";
  rank: number;
  explanation: string;
  top_signals: string[];
}

export interface FleetSummary {
  total_drivers: number;
  total_vehicles: number;
  total_trips: number;
  total_distance_km: number;
  avg_driver_risk_score: number;
  avg_vehicle_health_score: number;
  drivers_by_risk_level: { "Low Risk": number; "Moderate Risk": number; "High Risk": number };
  vehicles_by_health_status: { Healthy: number; Monitor: number; "Maintenance Attention": number };
  highest_risk_drivers: Array<{
    Driver_ID: string;
    Driver_Name: string;
    risk_score: number;
    risk_level: string;
    explanation: string;
  }>;
  vehicles_requiring_attention: Array<{
    Vehicle_ID: string;
    Make: string;
    Model: string;
    health_score: number;
    health_status: string;
    explanation: string;
  }>;
  sensitivity_analysis: Array<{
    run: number;
    weights_perturbed: { speed: number; acceleration: number; gyro: number; variability: number };
    spearman_rank_correlation: number;
    avg_rank_shift: number;
  }>;
}

export interface Methodology {
  scoring_formulas: {
    acceleration_magnitude: string;
    dynamic_acceleration: string;
    gyroscope_magnitude: string;
  };
  scoring_weights_baseline: {
    speed: number;
    acceleration: number;
    gyro: number;
    variability: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────
export function getRiskBadgeClass(level: string): string {
  if (level === "High Risk") return "badge-risk-high";
  if (level === "Low Risk") return "badge-risk-low";
  return "badge-risk-moderate";
}

export function getHealthBadgeClass(status: string): string {
  if (status === "Maintenance Attention") return "badge-health-attention";
  if (status === "Healthy") return "badge-health-healthy";
  return "badge-health-monitor";
}

export function scoreColor(score: number): string {
  if (score >= 65) return "oklch(0.55 0.19 25)";    // high risk red
  if (score >= 40) return "oklch(0.65 0.14 60)";    // moderate amber
  return "oklch(0.50 0.15 145)";                    // low risk green
}

export function healthScoreColor(score: number): string {
  if (score < 40) return "oklch(0.55 0.19 25)";
  if (score < 70) return "oklch(0.65 0.14 60)";
  return "oklch(0.50 0.15 145)";
}

export function fmt(n: number, decimals = 0): string {
  return n.toFixed(decimals);
}
