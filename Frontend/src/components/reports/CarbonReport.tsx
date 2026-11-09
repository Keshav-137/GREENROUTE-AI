import React from 'react';
import { PlanResponse, RouteCandidate } from '@/types';
import { useReport } from '@/hooks/useReport';
import {
  formatCurrencyINR,
  formatDistanceKm,
  formatDurationHours,
  formatFuel,
  formatCO2,
  formatRiskScore,
  formatDateString,
} from '@/utils/formatters';
import {
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Leaf,
  ShieldCheck,
  Building2,
  Truck,
  Calendar,
  Layers,
} from 'lucide-react';

interface CarbonReportProps {
  planResult: PlanResponse | null;
  selectedRoute?: RouteCandidate;
}

export const CarbonReport: React.FC<CarbonReportProps> = ({
  planResult,
  selectedRoute,
}) => {
  const {
    downloadReport,
    isDownloading,
    downloadError,
    downloadSuccess,
    resetStatus,
  } = useReport();

  if (!planResult) {
    return (
      <div className="p-12 rounded-2xl bg-forest-850/80 border border-forest-750/70 text-center space-y-3">
        <FileText className="w-10 h-10 text-forest-400 mx-auto" />
        <h3 className="text-base font-bold text-white">No Carbon Report Generated</h3>
        <p className="text-xs text-forest-300 max-w-md mx-auto">
          Please run a route optimization session in the Route Planner to create an auditable Scope-1 emissions report.
        </p>
      </div>
    );
  }

  const route =
    selectedRoute ||
    planResult.routes.find((r) => r.id === planResult.recommended_route_id) ||
    planResult.routes[0];

  const riskInfo = formatRiskScore(route.risk_score);

  const handleDownload = () => {
    resetStatus();
    downloadReport(planResult.trip_id, planResult, route);
  };

  return (
    <div className="space-y-6">
      {/* Report Header Card */}
      <div className="p-6 rounded-2xl bg-forest-850 border border-forest-750/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#1a5c47]/20 via-[#2f8a9d]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-750/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1a5c47] text-[#3ec99f]">
                <Leaf className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Scope-1 Freight Carbon & Fuel Audit
              </h2>
            </div>
            <p className="text-xs text-forest-300 font-mono">
              Trip Identifier: {planResult.trip_id} · Generated: {formatDateString(planResult.created_at)}
            </p>
          </div>

          {/* Download Report Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1a5c47] to-[#2f8a9d] hover:from-[#267b5e] hover:to-[#42a7bc] text-white text-xs font-semibold shadow-lg shadow-[#1a5c47]/20 transition disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling Audit Report...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Report (.txt / .pdf)</span>
              </>
            )}
          </button>
        </div>

        {/* Download Feedback Messages */}
        {downloadSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Audit report downloaded successfully.</span>
          </div>
        )}

        {downloadError && (
          <div className="mt-3 p-3 rounded-xl bg-greenroute-riskRed/15 border border-greenroute-riskRed/40 text-xs text-forest-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-greenroute-riskRed flex-shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Dispatch Profile Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Origin & Destination */}
          <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-750/50 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-forest-400 font-semibold">
              <Building2 className="w-3.5 h-3.5 text-forest-400" />
              <span>Corridor Terminals</span>
            </div>
            <div className="text-xs text-white font-medium">
              <div>From: <strong>{planResult.origin.name}</strong></div>
              <div>To: <strong>{planResult.destination.name}</strong></div>
            </div>
          </div>

          {/* Vehicle & Payload */}
          <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-750/50 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-forest-400 font-semibold">
              <Truck className="w-3.5 h-3.5 text-forest-400" />
              <span>Allocated Fleet Asset</span>
            </div>
            <div className="text-xs text-white font-medium">
              <div>{planResult.vehicle.name}</div>
              <div className="text-forest-300 font-mono">
                Cargo Load: {planResult.cargo_load_tons} tonnes (Max {planResult.vehicle.max_payload_tons}t)
              </div>
            </div>
          </div>

          {/* Regulatory Benchmark */}
          <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-750/50 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-forest-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-400" />
              <span>GHG Methodology Standard</span>
            </div>
            <div className="text-xs text-white font-medium">
              <div>GLEC Framework v3.0 / IPCC Tier 2</div>
              <div className="text-forest-300 font-mono text-[11px]">
                EF: 2.68 kg CO₂e / L HSD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Trajectory Key Findings */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Fuel Card */}
        <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 space-y-1.5">
          <span className="text-[11px] font-semibold text-forest-400 uppercase tracking-wider">
            Total Fuel Consumption
          </span>
          <div className="text-2xl font-bold font-mono text-[#3ec99f]">
            {formatFuel(route.fuel_liters, route.fuel_uncertainty_pct)}
          </div>
          <p className="text-[11px] text-forest-400">
            Uncertainty bound includes road roughness & hill resistance
          </p>
        </div>

        {/* Carbon Footprint Card */}
        <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 space-y-1.5">
          <span className="text-[11px] font-semibold text-forest-400 uppercase tracking-wider">
            Calculated Scope-1 GHG
          </span>
          <div className="text-2xl font-bold font-mono text-[#2f8a9d]">
            {formatCO2(route.co2_kg)}
          </div>
          <p className="text-[11px] text-forest-400">
            Direct combustion exhaust tailpipe emissions
          </p>
        </div>

        {/* Duration & Distance */}
        <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 space-y-1.5">
          <span className="text-[11px] font-semibold text-forest-400 uppercase tracking-wider">
            Transit Time & Span
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {formatDurationHours(route.duration_hours)}
          </div>
          <p className="text-[11px] text-forest-400">
            Across {formatDistanceKm(route.distance_km)} corridor distance
          </p>
        </div>

        {/* Risk & Cost */}
        <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 space-y-1.5">
          <span className="text-[11px] font-semibold text-forest-400 uppercase tracking-wider">
            Corridor Financial & Risk
          </span>
          <div className="text-2xl font-bold font-mono text-forest-100">
            {formatCurrencyINR(route.cost_inr)}
          </div>
          <p className={`text-[11px] font-semibold ${riskInfo.color}`}>
            Risk: {riskInfo.label} index ({route.risk_score.toFixed(2)})
          </p>
        </div>
      </div>

      {/* Methodology & Data-Source Limitations Section */}
      <div className="p-5 rounded-xl bg-forest-850/70 border border-forest-750/60 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Layers className="w-4 h-4 text-[#d8993a]" />
          <span>Scientific Methodology & Limitations Disclosure</span>
        </div>
        <ul className="space-y-2 text-xs text-forest-300 leading-relaxed list-disc list-inside">
          <li>
            <strong>Fuel Modeling:</strong> Baseline calculations integrate vehicle mass, rolling resistance, aerodynamic drag, rain adjustment, and road gradients from Open-Meteo Copernicus GLO-90 elevation.
          </li>
          <li>
            <strong>Emission Coefficients:</strong> Tailpipe greenhouse gas calculations apply standard IPCC Tier 2 factors (2.68 kg CO₂ per liter for automotive diesel fuel).
          </li>
          <li>
            <strong>Weather Ingestion:</strong> Wind shear, precipitation rate, and Ghat fog conditions are sampled periodically from regional radar and atmospheric forecast streams.
          </li>
          <li>
            <strong>Data Status:</strong> This report identifies whether route, weather, and model inputs are live, historical, cached, simulated, or what-if.
          </li>
        </ul>
      </div>
    </div>
  );
};
