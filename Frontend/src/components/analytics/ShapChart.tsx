import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { ShapValue } from '@/types';
import { Brain, HelpCircle } from 'lucide-react';

interface ShapChartProps {
  shapValues: ShapValue[];
  available?: boolean;
}

interface ShapTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ShapValue }>;
}

const CustomShapTooltip: React.FC<ShapTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    const isMitigation = item.impact < 0;

    return (
      <div className="p-3 rounded-xl bg-forest-900 border border-forest-700 shadow-2xl text-xs space-y-1 z-50 max-w-xs">
        <div className="font-bold text-white border-b border-forest-750 pb-1">
          {item.feature}
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-forest-400">SHAP Impact Value:</span>
          <span
            className={`font-mono font-bold ${
              isMitigation ? 'text-[#3ec99f]' : 'text-greenroute-riskRedLight'
            }`}
          >
            {item.impact > 0 ? `+${item.impact.toFixed(3)}` : item.impact.toFixed(3)}
          </span>
        </div>
        <p className="text-[11px] text-forest-300 leading-relaxed pt-1">
          {item.description}
        </p>
      </div>
    );
  }
  return null;
};

export const ShapChart: React.FC<ShapChartProps> = ({ shapValues, available = true }) => {
  if (!available) {
    return (
      <div className="p-6 rounded-xl bg-forest-850/80 border border-forest-750/70 text-center text-xs text-forest-400">
        SHAP attribution is hidden for mock data. Run the planner with the live backend and a trained model artifact.
      </div>
    );
  }
  if (!shapValues || shapValues.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-forest-850/80 border border-forest-750/70 text-center text-xs text-forest-400">
        No SHAP attribution values available for this planning session.
      </div>
    );
  }

  // Sorted by magnitude of impact
  const sorted = [...shapValues].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-forest-750/50 pb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#2f8a9d]" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              SHAP Feature Attribution (Physics-ML Explainability)
            </h3>
            <p className="text-xs text-forest-300">
              Contribution of the trained fuel model features to residual fuel prediction
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-forest-300">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#3ec99f]" /> Green: Mitigates Drag
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#c0504d]" /> Red: Adds Drag
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sorted}
            margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#23453c" opacity={0.6} horizontal={false} />
            <XAxis
              type="number"
              domain={[-0.5, 0.4]}
              tick={{ fill: '#8ba89f', fontSize: 11 }}
              tickLine={{ stroke: '#23453c' }}
              axisLine={{ stroke: '#23453c' }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={140}
              tick={{ fill: '#daf0e8', fontSize: 11 }}
              tickLine={{ stroke: '#23453c' }}
              axisLine={{ stroke: '#23453c' }}
            />
            <Tooltip content={<CustomShapTooltip />} />
            <ReferenceLine x={0} stroke="#8ba89f" strokeWidth={1.5} />
            <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
              {sorted.map((entry, index) => {
                const isFavorable = entry.impact < 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isFavorable ? '#3ec99f' : '#c0504d'}
                    fillOpacity={0.85}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-lg bg-forest-900/60 border border-forest-750/50 flex items-center justify-between text-xs text-forest-300">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-forest-400" />
          Negative values indicate factors that favorably reduce fuel consumption and GHG emissions.
        </span>
        <span className="text-[11px] font-mono text-forest-400">
          Features: load, mass, speed variance, gradient, rain, temperature and wind
        </span>
      </div>
    </div>
  );
};
