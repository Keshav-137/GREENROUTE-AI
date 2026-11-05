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
import { Sparkles, ArrowRight } from 'lucide-react';

interface RouteComparisonProps {
  routes: RouteCandidate[];
  selectedRouteId: string | null;
  recommendedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

export const RouteComparison: React.FC<RouteComparisonProps> = ({
  routes,
  selectedRouteId,
  recommendedRouteId,
  onSelectRoute,
}) => {
  const recommended =
    routes.find((r) => r.id === recommendedRouteId) || routes[0];

  return (
    <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-forest-750/50 pb-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Corridor Alternative Trade-Off Matrix
          </h3>
          <p className="text-xs text-forest-300">
            Comparative performance across physics-evaluated routes
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-forest-800 text-forest-300 border border-forest-700">
          {routes.length} Trajectories Evaluated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-forest-750/60 text-forest-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2 px-2.5">Route Profile</th>
              <th className="py-2 px-2.5">Duration</th>
              <th className="py-2 px-2.5">Distance</th>
              <th className="py-2 px-2.5">Fuel Burn</th>
              <th className="py-2 px-2.5">CO₂ Emissions</th>
              <th className="py-2 px-2.5">Toll & Fuel Cost</th>
              <th className="py-2 px-2.5">Ghat Risk</th>
              <th className="py-2 px-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-800/80">
            {routes.map((r) => {
              const isSelected = r.id === selectedRouteId;
              const isRec = r.id === recommendedRouteId;
              const color = ROUTE_COLORS[r.id] || '#2f8a9d';
              const riskInfo = formatRiskScore(r.risk_score);

              // Calculate fuel delta vs recommended
              const fuelDelta = r.fuel_liters - recommended.fuel_liters;
              const timeDeltaHours = r.duration_hours - recommended.duration_hours;

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRoute(r.id)}
                  className={`hover:bg-forest-800/60 cursor-pointer transition ${
                    isSelected ? 'bg-forest-800/80' : ''
                  }`}
                >
                  <td className="py-3 px-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <span className="font-semibold text-white block">
                          {r.name}
                        </span>
                        {isRec && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-[#3ec99f] font-bold">
                            <Sparkles className="w-2.5 h-2.5" /> Optimal Multi-Objective
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-2.5 font-mono text-forest-100">
                    <div>{formatDurationHours(r.duration_hours)}</div>
                    {timeDeltaHours !== 0 && (
                      <span
                        className={`text-[10px] ${
                          timeDeltaHours > 0
                            ? 'text-greenroute-riskRedLight'
                            : 'text-[#3ec99f]'
                        }`}
                      >
                        {timeDeltaHours > 0
                          ? `+${Math.round(timeDeltaHours * 60)}m`
                          : `${Math.round(timeDeltaHours * 60)}m`}
                      </span>
                    )}
                  </td>

                  {/* Distance */}
                  <td className="py-3 px-2.5 font-mono text-forest-200">
                    {formatDistanceKm(r.distance_km)}
                  </td>

                  {/* Fuel */}
                  <td className="py-3 px-2.5 font-mono text-[#3ec99f]">
                    <div>{formatFuel(r.fuel_liters)}</div>
                    {fuelDelta !== 0 && (
                      <span
                        className={`text-[10px] ${
                          fuelDelta > 0
                            ? 'text-greenroute-riskRedLight'
                            : 'text-[#3ec99f]'
                        }`}
                      >
                        {fuelDelta > 0
                          ? `+${fuelDelta.toFixed(1)}L`
                          : `${fuelDelta.toFixed(1)}L`}
                      </span>
                    )}
                  </td>

                  {/* CO2 */}
                  <td className="py-3 px-2.5 font-mono text-[#2f8a9d]">
                    {formatCO2(r.co2_kg)}
                  </td>

                  {/* Cost */}
                  <td className="py-3 px-2.5 font-mono text-forest-200">
                    {formatCurrencyINR(r.cost_inr)}
                  </td>

                  {/* Risk */}
                  <td className="py-3 px-2.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskInfo.badgeBg}`}
                    >
                      {riskInfo.label}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoute(r.id);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-[#2f8a9d] text-white shadow-sm'
                          : 'bg-forest-800 text-forest-300 hover:text-white hover:bg-forest-750 border border-forest-700'
                      }`}
                    >
                      <span>{isSelected ? 'Active' : 'Inspect'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

