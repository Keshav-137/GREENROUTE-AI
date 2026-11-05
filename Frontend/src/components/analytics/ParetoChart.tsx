import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { RouteCandidate } from '@/types';
import {
  formatDurationHours,
  formatFuel,
  formatCO2,
  formatCurrencyINR,
  formatRiskScore,
} from '@/utils/formatters';
import { TrendingDown, Sparkles } from 'lucide-react';

interface ParetoChartProps {
  routes: RouteCandidate[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RouteCandidate & { fuel: number; time: number; zSize: number };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const risk = formatRiskScore(data.risk_score);

    return (
      <div className="p-3 rounded-xl bg-forest-900 border border-forest-700 shadow-2xl text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between gap-2 border-b border-forest-750 pb-1">
          <span className="font-bold text-white">{data.name}</span>
          {data.pareto_optimal ? (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1a5c47] text-[#3ec99f] font-semibold">
              Pareto Frontier
            </span>
          ) : (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-forest-800 text-forest-400">
              Dominated
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-forest-200">
          <div>Fuel: <strong className="text-[#3ec99f]">{formatFuel(data.fuel_liters)}</strong></div>
          <div>Time: <strong className="text-white">{formatDurationHours(data.duration_hours)}</strong></div>
          <div>CO₂: <strong className="text-[#2f8a9d]">{formatCO2(data.co2_kg)}</strong></div>
          <div>Cost: <strong className="text-white">{formatCurrencyINR(data.cost_inr)}</strong></div>
        </div>
        <div className="pt-1 border-t border-forest-800 flex items-center justify-between text-[11px]">
          <span className="text-forest-400">Ghat Climate Risk:</span>
          <span className={`font-semibold ${risk.color}`}>{risk.label} ({data.risk_score.toFixed(2)})</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ParetoChart: React.FC<ParetoChartProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  if (!routes || routes.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-forest-850/80 border border-forest-750/70 text-center text-xs text-forest-400">
        No routes available for Pareto analysis. Plan a route to inspect trade-offs.
      </div>
    );
  }

  // Format dataset for Recharts Scatter
  const data = routes.map((r) => ({
    ...r,
    fuel: r.fuel_liters,
    time: r.duration_hours,
    zSize: r.co2_kg,
  }));

  // Min / Max for bounds
  const fuels = routes.map((r) => r.fuel_liters);
  const times = routes.map((r) => r.duration_hours);
  const minFuel = Math.floor(Math.min(...fuels) - 2);
  const maxFuel = Math.ceil(Math.max(...fuels) + 3);
  const minTime = Number((Math.min(...times) - 0.3).toFixed(1));
  const maxTime = Number((Math.max(...times) + 0.4).toFixed(1));

  return (
    <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-forest-750/50 pb-2">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-[#3ec99f]" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Pareto Efficiency Frontier (Fuel vs Duration)
            </h3>
            <p className="text-xs text-forest-300">
              Non-dominated solutions optimal across energy consumption and delivery deadline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-forest-300">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3ec99f]" /> Pareto Optimal
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-600" /> Dominated
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 25, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#23453c" opacity={0.6} />
            <XAxis
              type="number"
              dataKey="fuel"
              name="Fuel"
              unit=" L"
              domain={[minFuel, maxFuel]}
              tick={{ fill: '#8ba89f', fontSize: 11 }}
              tickLine={{ stroke: '#23453c' }}
              axisLine={{ stroke: '#23453c' }}
              label={{
                value: 'Fuel Burn (Liters) →',
                position: 'insideBottom',
                offset: -10,
                fill: '#8ba89f',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="time"
              name="Duration"
              unit=" h"
              domain={[minTime, maxTime]}
              tick={{ fill: '#8ba89f', fontSize: 11 }}
              tickLine={{ stroke: '#23453c' }}
              axisLine={{ stroke: '#23453c' }}
              label={{
                value: '↑ Transit Duration (Hours)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#8ba89f',
                fontSize: 11,
              }}
            />
            <ZAxis
              type="number"
              dataKey="zSize"
              range={[120, 260]}
              name="CO2 kg"
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={data}
              onClick={(node) => {
                if (node && node.id) onSelectRoute(node.id);
              }}
              cursor="pointer"
            >
              {data.map((entry) => {
                const isSelected = entry.id === selectedRouteId;
                let fillColor = entry.pareto_optimal ? '#3ec99f' : '#4e9583';
                if (entry.risk_score > 0.5) {
                  fillColor = entry.pareto_optimal ? '#d8993a' : '#c0504d';
                }

                return (
                  <Cell
                    key={entry.id}
                    fill={fillColor}
                    stroke={isSelected ? '#ffffff' : entry.pareto_optimal ? '#3ec99f' : '#23453c'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    style={{
                      filter: isSelected ? 'drop-shadow(0 0 8px rgba(62,201,159,0.8))' : 'none',
                    }}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-lg bg-forest-900/60 border border-forest-750/50 flex items-center justify-between text-xs text-forest-300">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#d8993a]" />
          Points toward bottom-left maximize both fuel economy and speed.
        </span>
        <span className="text-[11px] font-mono text-forest-400">
          Point radius correlates with Scope-1 CO₂ kg
        </span>
      </div>
    </div>
  );
};

