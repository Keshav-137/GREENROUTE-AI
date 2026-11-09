import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteStore } from '@/store/routeStore';
import { useTripStore } from '@/store/tripStore';
import { usePlan } from '@/hooks/usePlan';
import {
  formatCurrencyINR,
  formatDistanceKm,
  formatDurationHours,
  formatFuel,
  formatCO2,
  formatRiskScore,
} from '@/utils/formatters';
import {
  Compass,
  Sparkles,
  Leaf,
  Cpu,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  Fuel,
  Server,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const planResult = useRouteStore((state) => state.planResult);
  const selectedRouteId = useRouteStore((state) => state.selectedRouteId);
  const loadDemoScenario = useTripStore((state) => state.loadDemoScenario);
  const origin = useTripStore((state) => state.origin);
  const destination = useTripStore((state) => state.destination);
  const selectedVehicle = useTripStore((state) => state.selectedVehicle);
  const cargoLoadTons = useTripStore((state) => state.cargoLoadTons);
  const planMutation = usePlan();

  const activeRoute =
    planResult?.routes.find((r) => r.id === selectedRouteId) ||
    planResult?.routes[0];

  const handleQuickDemoPlan = () => {
    loadDemoScenario();
    if (origin && destination) {
      planMutation.mutate(
        {
          origin,
          destination,
          vehicle_type: selectedVehicle.type,
          cargo_load_tons: cargoLoadTons,
          departure_time: new Date().toISOString(),
          deadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        },
        {
          onSuccess: () => {
            navigate('/planner');
          },
        }
      );
    } else {
      navigate('/planner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Introduction & Quick Action */}
      <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-forest-850 via-[#162c26] to-[#143026] border border-forest-750/80 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#1a5c47]/30 via-[#2f8a9d]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a5c47]/40 text-[#3ec99f] border border-[#267b5e]/50 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Climate-Aware Freight Route Optimization Engine</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Decarbonizing Heavy Freight with Physics-Informed Gradient Intelligence
          </h1>

          <p className="text-sm text-forest-200 leading-relaxed max-w-2xl">
            GreenRoute AI predicts real-world commercial vehicle fuel burn, evaluates Western Ghats terrain elevation gradients, monitors monsoon climate hazards, and computes Pareto-optimal freight trajectories to minimize Scope-1 greenhouse gas emissions.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/planner')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1a5c47] to-[#2f8a9d] hover:from-[#267b5e] hover:to-[#42a7bc] text-white text-sm font-semibold shadow-lg shadow-[#1a5c47]/30 transition group"
            >
              <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span>Launch Route Planner</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={handleQuickDemoPlan}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-750 text-amber-300 hover:text-amber-200 text-sm font-semibold border border-amber-500/30 transition"
            >
              <span>Run Pune–Mumbai Benchmark Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Corridor Telemetry / Session Summary Cards */}
      {planResult && activeRoute ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3ec99f] animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Current Corridor Telemetry ({planResult.origin.name.split(',')[0]} → {planResult.destination.name.split(',')[0]})
              </h2>
            </div>
            <button
              onClick={() => navigate('/planner')}
              className="text-xs text-[#2f8a9d] hover:text-[#42a7bc] font-semibold flex items-center gap-1"
            >
              <span>View On Interactive Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Travel Time */}
            <div className="p-4 rounded-xl bg-forest-850/90 border border-forest-750/70 space-y-1">
              <div className="flex items-center justify-between text-xs text-forest-400">
                <span>Estimated Transit</span>
                <Clock className="w-4 h-4 text-forest-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {formatDurationHours(activeRoute.duration_hours)}
              </div>
              <div className="text-[11px] text-forest-300">
                Corridor: {formatDistanceKm(activeRoute.distance_km)}
              </div>
            </div>

            {/* Fuel Consumption */}
            <div className="p-4 rounded-xl bg-forest-850/90 border border-forest-750/70 space-y-1">
              <div className="flex items-center justify-between text-xs text-forest-400">
                <span>Diesel Fuel Burn</span>
                <Fuel className="w-4 h-4 text-[#3ec99f]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#3ec99f]">
                {formatFuel(activeRoute.fuel_liters, activeRoute.fuel_uncertainty_pct)}
              </div>
              <div className="text-[11px] text-forest-300">
                Payload: {planResult.cargo_load_tons} tonnes
              </div>
            </div>

            {/* Scope-1 CO2 */}
            <div className="p-4 rounded-xl bg-forest-850/90 border border-forest-750/70 space-y-1">
              <div className="flex items-center justify-between text-xs text-forest-400">
                <span>Scope-1 GHG Carbon</span>
                <Leaf className="w-4 h-4 text-[#2f8a9d]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#2f8a9d]">
                {formatCO2(activeRoute.co2_kg)}
              </div>
              <div className="text-[11px] text-forest-300">
                GLEC v3.0 / IPCC Tier 2
              </div>
            </div>

            {/* Climate Hazard Risk */}
            <div className="p-4 rounded-xl bg-forest-850/90 border border-forest-750/70 space-y-1">
              <div className="flex items-center justify-between text-xs text-forest-400">
                <span>Ghat Risk Index</span>
                <ShieldCheck className="w-4 h-4 text-[#d8993a]" />
              </div>
              <div className={`text-xl font-bold font-mono ${formatRiskScore(activeRoute.risk_score).color}`}>
                {formatRiskScore(activeRoute.risk_score).label} ({activeRoute.risk_score.toFixed(2)})
              </div>
              <div className="text-[11px] text-forest-300">
                Cost: {formatCurrencyINR(activeRoute.cost_inr)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-forest-850/60 border border-forest-750/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white">No active planning session in memory</h3>
            <p className="text-xs text-forest-300">
              Set origin, destination, and vehicle specifications to calculate multi-objective route candidates.
            </p>
          </div>
          <button
            onClick={() => navigate('/planner')}
            className="px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-750 text-forest-100 text-xs font-semibold border border-forest-700 transition"
          >
            Open Planner
          </button>
        </div>
      )}

      {/* How GreenRoute AI Works: Architecture & Scientific Pillars */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Engineering Architecture & Scientific Foundations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="p-5 rounded-xl bg-forest-850/80 border border-forest-750/60 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#1a5c47]/30 border border-[#267b5e]/40 flex items-center justify-center text-[#3ec99f]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              1. Open-Meteo Copernicus GLO-90 Elevation
            </h3>
            <p className="text-xs text-forest-300 leading-relaxed">
              Calculates gradient percentage along Western Ghats switchbacks. Quantifies gravitational rolling resistance and engine thermal load on steep climbs.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-xl bg-forest-850/80 border border-forest-750/60 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#2f8a9d]/30 border border-[#2f8a9d]/40 flex items-center justify-center text-[#42a7bc]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              2. Physics-ML Fuel Model
            </h3>
            <p className="text-xs text-forest-300 leading-relaxed">
              Calibrated against telematics from multi-axle freight carriers. Predicts instantaneous fuel burn with empirical confidence intervals (± bounds).
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-xl bg-forest-850/80 border border-forest-750/60 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#d8993a]/30 border border-[#d8993a]/40 flex items-center justify-center text-[#eab055]">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              3. Pareto Multi-Objective Frontier
            </h3>
            <p className="text-xs text-forest-300 leading-relaxed">
              Simultaneously optimizes transit duration, diesel burn, GHG intensity, toll economics, and weather/terrain risk using non-dominated sorting.
            </p>
          </div>
        </div>
      </div>

      {/* System Data Sources & Platform Status */}
      <div className="p-5 rounded-xl bg-forest-850/80 border border-forest-750/70 space-y-3">
        <div className="flex items-center justify-between border-b border-forest-750/50 pb-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#2f8a9d]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Data Pipeline & Model Registry Status
            </h3>
          </div>
          <span className="text-[10px] text-forest-300 font-mono">
            Environment: {import.meta.env.VITE_USE_MOCK_DATA !== 'false' ? 'Demonstration Mode' : 'Production Live'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-forest-900/60 border border-forest-750/40">
            <span className="text-forest-400 text-[10px] block">Road Network</span>
            <span className="font-semibold text-white">OpenFreeMap Vector Tiles</span>
          </div>
          <div className="p-2.5 rounded-lg bg-forest-900/60 border border-forest-750/40">
            <span className="text-forest-400 text-[10px] block">Digital Elevation</span>
            <span className="font-semibold text-white">Copernicus GLO-90 Elevation</span>
          </div>
          <div className="p-2.5 rounded-lg bg-forest-900/60 border border-forest-750/40">
            <span className="text-forest-400 text-[10px] block">Atmospheric Feed</span>
            <span className="font-semibold text-white">Open-Meteo Weather</span>
          </div>
          <div className="p-2.5 rounded-lg bg-forest-900/60 border border-forest-750/40">
            <span className="text-forest-400 text-[10px] block">Carbon Standard</span>
            <span className="font-semibold text-[#3ec99f]">GLEC Framework v3.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
