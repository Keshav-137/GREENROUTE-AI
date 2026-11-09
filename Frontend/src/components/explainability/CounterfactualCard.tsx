import React from 'react';
import { CounterfactualData } from '@/types';
import { Sparkles, TrendingDown, Leaf, Sliders } from 'lucide-react';

interface CounterfactualCardProps {
  counterfactual?: CounterfactualData | null;
}

export const CounterfactualCard: React.FC<CounterfactualCardProps> = ({
  counterfactual,
}) => {
  if (!counterfactual) {
    return (
      <div className="p-4 rounded-xl bg-forest-850/60 border border-forest-750/50 text-xs text-forest-400 text-center">
        No counterfactual scenario generated for this query.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-forest-850 to-[#143026] border border-[#267b5e]/40 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-forest-750/50 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1a5c47] text-[#3ec99f]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Counterfactual "What-If" Analysis
            </h4>
            <span className="text-[11px] text-forest-300">
              Sensitivity: {counterfactual.parameter_adjusted} ({counterfactual.percent_change}%)
            </span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-forest-800 text-forest-200 border border-forest-700 font-mono">
          Physics Simulation
        </span>
      </div>

      <p className="text-xs text-forest-100 leading-relaxed font-medium">
        "{counterfactual.description}"
      </p>

      {/* Counterfactual Key Savings Badges */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-2.5 rounded-lg bg-forest-900/80 border border-forest-750/50 flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#1a5c47]/30 text-[#3ec99f]">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-forest-400 block uppercase font-semibold">
              Fuel Reduction
            </span>
            <span className="text-sm font-bold text-[#3ec99f] font-mono">
              -{counterfactual.fuel_saved_liters.toFixed(1)} Liters
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-forest-900/80 border border-forest-750/50 flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#2f8a9d]/30 text-[#42a7bc]">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-forest-400 block uppercase font-semibold">
              Scope-1 CO₂ Eliminated
            </span>
            <span className="text-sm font-bold text-[#2f8a9d] font-mono">
              -{counterfactual.co2_reduced_kg.toFixed(1)} kg CO₂
            </span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-forest-400 flex items-center gap-1.5 pt-1">
        <Sliders className="w-3 h-3" />
        <span>Derived from the calibrated physics fuel model and diesel emission factor.</span>
      </div>
    </div>
  );
};
