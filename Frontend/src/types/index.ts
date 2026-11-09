export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationItem extends Coordinates {
  name: string;
  address?: string;
}

export type VehicleCategory =
  | 'heavy_duty_diesel'
  | 'medium_duty_diesel'
  | 'electric_truck'
  | 'cng_freight';

export interface VehiclePreset {
  id: string;
  name: string;
  type: VehicleCategory;
  categoryLabel: string;
  maxPayloadTons: number;
  fuelType: 'Diesel' | 'Electric' | 'CNG';
  baseConsumptionRate: string; // e.g. "32.5 L/100km" or "1.2 kWh/km"
  emptyWeightTons: number;
  emissionFactorKgPerUnit: number; // kg CO2 per liter or kWh
  description: string;
}

export interface PriorityWeights {
  time: number;
  fuel: number;
  co2: number;
  cost: number;
  risk: number;
}

export interface RouteSegment {
  id: string;
  start_coord: [number, number]; // [lon, lat]
  end_coord: [number, number]; // [lon, lat]
  distance_km: number;
  risk_score: number; // 0 to 1
  risk_level: 'low' | 'medium' | 'high';
  hazard_type?: string;
  elevation_change_m?: number;
  gradient_pct?: number;
}

export interface RouteCandidate {
  id: string;
  name: string;
  distance_km: number;
  duration_hours: number;
  fuel_liters: number;
  fuel_uncertainty_pct: number; // e.g. 4.2 for ±4.2%
  co2_kg: number;
  cost_inr: number;
  risk_score: number; // 0 to 1
  pareto_optimal: boolean;
  toll_charges_inr: number;
  average_speed_kmh: number;
  weather_condition: string;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lon, lat][]
  };
  segments: RouteSegment[];
  highlight_reason?: string;
}

export interface ShapValue {
  feature: string;
  impact: number; // positive = increased fuel/co2, negative = reduced
  description: string;
}

export interface CounterfactualData {
  description: string;
  fuel_saved_liters: number;
  co2_reduced_kg: number;
  parameter_adjusted: string;
  percent_change: number;
}

export interface ExplainabilityData {
  recommendation_narrative: string;
  trade_offs: string[];
  shap_values: ShapValue[];
  counterfactual: CounterfactualData;
}

export interface DepartureSlot {
  time_slot: string; // e.g. "04:00 - 06:00"
  departure_hour: string; // "04:00"
  co2_kg: number;
  risk_score: number;
  is_recommended: boolean;
  delay_probability_pct: number;
  traffic_level: 'low' | 'moderate' | 'heavy';
}

export interface DataStatus {
  routes: 'live' | 'cached' | 'simulated';
  weather: 'live' | 'cached' | 'historical' | 'what-if' | 'simulated';
  elevation: 'live' | 'cached' | 'simulated';
  fuel_model: 'calibrated' | 'simulated-trained';
  is_mock: boolean;
}

export interface PlanRequest {
  origin: LocationItem;
  destination: LocationItem;
  vehicle_type: VehicleCategory | string;
  cargo_load_tons: number;
  departure_time: string;
  deadline: string;
  priority_weights?: PriorityWeights;
  what_if_rain?: boolean;
}

export interface PlanResponse {
  trip_id: string;
  created_at: string;
  origin: LocationItem;
  destination: LocationItem;
  vehicle: {
    id: string;
    name: string;
    type: string;
    max_payload_tons: number;
  };
  cargo_load_tons: number;
  recommended_route_id: string;
  routes: RouteCandidate[];
  pareto_frontier: string[];
  explainability: ExplainabilityData;
  departure_analysis: DepartureSlot[];
  data_status: DataStatus;
}

export interface RouteRanking {
  route_id: string;
  rank: number;
  total_score: number;
  score_breakdown: PriorityWeights;
}

export interface RerankRequest {
  trip_id: string;
  weights: PriorityWeights;
}

export interface RerankResponse {
  trip_id: string;
  recommended_route_id: string;
  rankings: RouteRanking[];
  recommendation_narrative: string;
  data_status: DataStatus;
}

export interface ReportMetadata {
  trip_id: string;
  generated_at: string;
  origin_name: string;
  destination_name: string;
  selected_route: RouteCandidate;
  co2_savings_vs_fastest_kg: number;
  fuel_savings_vs_fastest_liters: number;
  compliance_standard: string;
  data_status: DataStatus;
}
