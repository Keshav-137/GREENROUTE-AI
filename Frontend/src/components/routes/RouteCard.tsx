import React from 'react';
import { RouteCandidate } from '@/types';
import {
  formatCurrencyINR,
  formatDistanceKm,
  formatDurationHours,
  formatFuel,
  formatCO2,
  formatRiskScore,
} from '@/utils/formatters';
import { ROUTE_COLORS } from '@/components/map/MapLegend';
import {
  Clock,
  Navigation,
  Fuel,
  CloudRain,
  IndianRupee,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface RouteCardProps {
  route: RouteCandidate;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  isRecommended,
  onSelect,
}) => {
  const riskInfo = formatRiskScore(route.risk_score);
  const routeColor = ROUTE_COLORS[route.id] || '#2f8a9d';

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
        isSelected
          ? 'bg-[#162c26] border-[#2f8a9d] shadow-lg shadow-[#2f8a9d]/15 ring-1 ring-[#2f8a9d]/40'
          : 'bg-forest-850/70 border-forest-750/60 hover:border-forest-650 hover:bg-forest-850'
      }`}
    >
      {/* Route Color Edge Accent */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1.5 transition-transform"
        style={{ backgroundColor: routeColor }}
      />

      {/* Card Header: Name, Pareto & Recommended Badges */}
      <div className="flex items-start justify-between gap-2 pl-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-forest-100 transition-colors">
              {route.name}
            </h3>
            {isSelected && (
              <CheckCircle2 className="w-4 h-4 text-[#2f8a9d] flex-shrink-0" />
            )}
          </div>
          {route.highlight_reason && (
            <p className="text-[11px] text-forest-300 font-medium mt-0.5 line-clamp-1">
              {route.highlight_reason}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {route.pareto_optimal ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1a5c47]/30 text-[#3ec99f] border border-[#267b5e]/40">
              Pareto Optimal
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-forest-800 text-forest-400 border border-forest-700">
              Dominated
            </span>
          )}

          {isRecommended && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#1a5c47] to-[#2f8a9d] text-white shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-300" />
              AI Rec
            </span>
          )}
        </div>
      </div>

      {/* Primary Logistics Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 pl-2">
        {/* Travel Time */}
        <div className="p-2 rounded-lg bg-forest-900/60 border border-forest-750/40">
          <div className="flex items-center gap-1 text-[10px] text-forest-400">
            <Clock className="w-3 h-3 text-forest-400" />
            <span>Duration</span>
          </div>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {formatDurationHours(route.duration_hours)}
          </div>
        </div>

        {/* Distance */}
        <div className="p-2 rounded-lg bg-forest-900/60 border border-forest-750/40">
          <div className="flex items-center gap-1 text-[10px] text-forest-400">
            <Navigation className="w-3 h-3 text-forest-400" />
            <span>Distance</span>
          </div>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {formatDistanceKm(route.distance_km)}
          </div>
        </div>

        {/* Estimated Fuel with Uncertainty */}
        <div className="p-2 rounded-lg bg-forest-900/60 border border-forest-750/40">
          <div className="flex items-center gap-1 text-[10px] text-forest-400">
            <Fuel className="w-3 h-3 text-forest-400" />
            <span>Fuel (±bounds)</span>
          </div>
          <div className="text-sm font-bold text-[#3ec99f] font-mono mt-0.5">
            {formatFuel(route.fuel_liters, route.fuel_uncertainty_pct)}
          </div>
        </div>

        {/* Carbon Emission */}
        <div className="p-2 rounded-lg bg-forest-900/60 border border-forest-750/40">
          <div className="flex items-center gap-1 text-[10px] text-forest-400">
            <CloudRain className="w-3 h-3 text-forest-400" />
            <span>CO₂ Footprint</span>
          </div>
          <div className="text-sm font-bold text-[#2f8a9d] font-mono mt-0.5">
            {formatCO2(route.co2_kg)}
          </div>
        </div>
      </div>

      {/* Secondary Bar: Cost, Toll & Ghat Climate Risk */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-forest-750/40 pl-2 text-xs text-forest-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-forest-400" />
            <span className="font-semibold text-forest-100">
              {formatCurrencyINR(route.cost_inr)}
            </span>
            <span className="text-[10px] text-forest-400 font-mono">
              (Toll: {formatCurrencyINR(route.toll_charges_inr)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-forest-400" />
          <span className="text-[11px] text-forest-300">Risk:</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskInfo.badgeBg}`}>
            {riskInfo.label} ({route.risk_score.toFixed(2)})
          </span>
        </div>
      </div>
    </div>
  );
};

