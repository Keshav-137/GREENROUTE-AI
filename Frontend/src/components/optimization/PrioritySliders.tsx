import React, { useEffect, useRef } from 'react';
import { useOptimizationStore } from '@/store/optimizationStore';
import { useRouteStore } from '@/store/routeStore';
import { useRerank } from '@/hooks/useRerank';
import { PriorityWeights } from '@/types';
import {
  SlidersHorizontal,
  RotateCcw,
  Clock,
  Fuel,
  CloudRain,
  IndianRupee,
  ShieldAlert,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export const PrioritySliders: React.FC = () => {
  const { weights, setWeight, resetWeights, getNormalizedWeights } =
    useOptimizationStore();
  const planResult = useRouteStore((state) => state.planResult);
  const rerankMutation = useRerank();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sliderConfigs: {
    key: keyof PriorityWeights;
    label: string;
    icon: React.ElementType;
    color: string;
    description: string;
  }[] = [
    {
      key: 'time',
      label: 'Transit Time',
      icon: Clock,
      color: 'accent-teal',
      description: 'Prioritize minimal transit duration and delivery speed',
    },
    {
      key: 'fuel',
      label: 'Fuel Economy',
      icon: Fuel,
      color: 'accent-green',
      description: 'Minimize aerodynamic & elevation engine throttling burn',
    },
    {
      key: 'co2',
      label: 'CO₂ Mitigation',
      icon: CloudRain,
      color: 'accent-teal',
      description: 'Mitigate direct Scope-1 GHG carbon intensity',
    },
    {
      key: 'cost',
      label: 'Total Cost (Tolls)',
      icon: IndianRupee,
      color: 'accent-amber',
      description: 'Factor expressway toll charges against diesel savings',
    },
    {
      key: 'risk',
      label: 'Climate & Ghat Risk',
      icon: ShieldAlert,
      color: 'accent-risk',
      description: 'Avert fog, landslides, and runaway brake gradient zones',
    },
  ];

  // Debounced trigger to /rerank whenever weights change
  useEffect(() => {
    if (!planResult || !planResult.trip_id) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      rerankMutation.mutate({
        trip_id: planResult.trip_id,
        weights: weights,
      });
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [weights, planResult?.trip_id]);

  const totalWeight =
    weights.time + weights.fuel + weights.co2 + weights.cost + weights.risk;
  const normalized = getNormalizedWeights();

  return (
    <div className="p-4 rounded-xl bg-forest-850/80 border border-forest-750/70 shadow-lg space-y-4">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between border-b border-forest-750/50 pb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#2f8a9d]" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Multi-Objective Priority Sliders
          </h3>
          {rerankMutation.isPending && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#2f8a9d] font-medium animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Re-ranking...
            </span>
          )}
          {rerankMutation.isSuccess && !rerankMutation.isPending && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#3ec99f] font-medium">
              <CheckCircle className="w-3 h-3" />
              Reranked
            </span>
          )}
        </div>

        <button
          onClick={resetWeights}
          className="inline-flex items-center gap-1 text-xs text-forest-300 hover:text-white hover:bg-forest-800 px-2 py-1 rounded-lg border border-forest-750 transition"
          title="Reset to balanced defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-3.5">
        {sliderConfigs.map((cfg) => {
          const Icon = cfg.icon;
          const val = weights[cfg.key];
          const normPct = Math.round(
            totalWeight > 0 ? (val / totalWeight) * 100 : 20
          );

          return (
            <div key={cfg.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-forest-300" />
                  <span className="font-semibold text-forest-100">
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-forest-400 text-[11px]">
                    raw: {val}
                  </span>
                  <span className="font-bold text-white text-xs px-1.5 py-0.5 rounded bg-forest-800 border border-forest-700">
                    {normPct}%
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={val}
                onChange={(e) => setWeight(cfg.key, parseFloat(e.target.value))}
                className="w-full"
              />

              <p className="text-[10px] text-forest-400 leading-tight">
                {cfg.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Normalized Weights Summary Footer */}
      <div className="pt-2 border-t border-forest-750/50 flex items-center justify-between text-[11px] text-forest-300">
        <span>Active Normalized Vector:</span>
        <span className="font-mono text-forest-200">
          [{normalized.time}, {normalized.fuel}, {normalized.co2}, {normalized.cost}, {normalized.risk}]
        </span>
      </div>
    </div>
  );
};
