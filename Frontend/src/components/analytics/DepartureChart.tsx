import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { DepartureSlot } from '@/types';
import { Clock, Sparkles } from 'lucide-react';

interface DepartureChartProps {
  departureSlots: DepartureSlot[];
}

interface DepartureTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DepartureSlot }>;
}

const CustomDepartureTooltip: React.FC<DepartureTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length > 0) {
    const slot = payload[0].payload;

    return (
      <div className="p-3 rounded-xl bg-forest-900 border border-forest-700 shadow-2xl text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between border-b border-forest-750 pb-1">
          <span className="font-bold text-white">{slot.time_slot}</span>
          {slot.is_recommended && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1a5c47] text-[#3ec99f] font-semibold">
              Best Departure Window
            </span>
          )}
        </div>
        <div className="space-y-1 text-forest-200">
          <div>CO₂ Emissions: <strong className="text-[#3ec99f] font-mono">{slot.co2_kg} kg</strong></div>
          <div>Ghat Hazard Risk: <strong className="text-[#d8993a] font-mono">{slot.risk_score.toFixed(2)}</strong></div>
          <div>Congestion Delay Prob: <strong className="text-white font-mono">{slot.delay_probability_pct}%</strong></div>
          <div>Traffic Level: <span className="capitalize text-forest-300 font-medium">{slot.traffic_level}</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export const DepartureChart: React.FC<DepartureChartProps> = ({
  departureSlots,
}) => {
  if (!departureSlots || departureSlots.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-forest-850/80 border border-forest-750/70 text-center text-xs text-forest-400">
        No departure temporal analysis available.
      </div>
    );
  }

  const bestSlot = departureSlots.find((s) => s.is_recommended) || departureSlots[0];

  return (
    <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-forest-750/50 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#d8993a]" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Departure Time Sensitivity & Weather Risk Window
            </h3>
            <p className="text-xs text-forest-300">
              Correlating diurnal Khandala fog patterns & commuter choke points against carbon footprint
            </p>
          </div>
        </div>
        {bestSlot && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a5c47]/30 text-[#3ec99f] border border-[#267b5e]/40 text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-[#3ec99f]" />
            Best Window: {bestSlot.time_slot}
          </div>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={departureSlots}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#23453c" opacity={0.6} />
            <XAxis
              dataKey="departure_hour"
              tick={{ fill: '#8ba89f', fontSize: 11 }}
              tickLine={{ stroke: '#23453c' }}
              axisLine={{ stroke: '#23453c' }}
            />
            {/* Left Axis: CO2 kg */}
            <YAxis
              yAxisId="co2"
              orientation="left"
              domain={[100, 140]}
              unit=" kg"
              tick={{ fill: '#3ec99f', fontSize: 11 }}
              tickLine={{ stroke: '#23453c' }}
              axisLine={{ stroke: '#23453c' }}
            />
            {/* Right Axis: Risk Score (0-1) */}
            <YAxis
              yAxisId="risk"
              orientation="right"
              domain={[0, 0.8]}
              unit=""
              tick={{ fill: '#d8993a', fontSize: 11 }}
              tickLine={{ stroke: '#23453c' }}
              axisLine={{ stroke: '#23453c' }}
            />
            <Tooltip content={<CustomDepartureTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(val) => <span className="text-forest-200">{val}</span>}
            />

            <Bar
              yAxisId="co2"
              dataKey="co2_kg"
              name="CO₂ Emissions (kg)"
              radius={[4, 4, 0, 0]}
            >
              {departureSlots.map((entry, index) => (
                <Cell
                  key={`cell-bar-${index}`}
                  fill={entry.is_recommended ? '#3ec99f' : '#2f8a9d'}
                  fillOpacity={entry.is_recommended ? 0.95 : 0.65}
                />
              ))}
            </Bar>

            <Line
              yAxisId="risk"
              type="monotone"
              dataKey="risk_score"
              name="Ghat Climate Risk Score"
              stroke="#d8993a"
              strokeWidth={2.5}
              dot={{ fill: '#d8993a', r: 4 }}
              activeDot={{ r: 6, fill: '#eab055' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-lg bg-forest-900/60 border border-forest-750/50 flex items-center justify-between text-xs text-forest-300">
        <span>Early morning slots (04:00 - 06:00) avert peak thermal cooling fog and save ~18.6 kg CO₂.</span>
        <span className="text-[11px] font-mono text-forest-400">Weather feed: Open-Meteo forecast/archive</span>
      </div>
    </div>
  );
};
