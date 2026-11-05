import React from 'react';
import { ExplainabilityData } from '@/types';
import { CounterfactualCard } from './CounterfactualCard';
import { ShapChart } from '@/components/analytics/ShapChart';
import { Sparkles, CheckCircle2, ArrowRightLeft, Info } from 'lucide-react';

interface ExplainPanelProps {
  explainability?: ExplainabilityData | null;
  recommendedRouteName?: string;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({
  explainability,
  recommendedRouteName = 'Optimal Route',
}) => {
  if (!explainability) {
    return (
      <div className="p-8 rounded-xl bg-forest-850/80 border border-forest-750/70 text-center text-xs text-forest-400 space-y-2">
        <Info className="w-6 h-6 text-forest-400 mx-auto" />
        <p>No explainability data available yet.</p>
        <p className="text-[11px] text-forest-500">
          Run the route planner to generate physics-ML feature attributions and counterfactual trade-offs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Narrative Section */}
      <div className="p-5 rounded-xl bg-forest-850/90 border border-forest-750/80 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3ec99f]">
          <Sparkles className="w-4 h-4 text-[#d8993a]" />
          <span>Decision Intelligence Narrative</span>
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">
          Why {recommendedRouteName} was selected as #1
        </h3>

        <p className="text-sm text-forest-100 leading-relaxed bg-forest-900/60 p-3.5 rounded-lg border border-forest-750/50">
          {explainability.recommendation_narrative}
        </p>

        {/* Key Trade-Offs Bullet List */}
        {explainability.trade_offs && explainability.trade_offs.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-200">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#2f8a9d]" />
              <span>Evaluated Multi-Objective Trade-Offs:</span>
            </div>
            <ul className="space-y-1.5 pl-2">
              {explainability.trade_offs.map((tradeoff, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-forest-300 leading-relaxed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2f8a9d] flex-shrink-0 mt-0.5" />
                  <span>{tradeoff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SHAP Chart */}
      <ShapChart shapValues={explainability.shap_values} />

      {/* Counterfactual Scenario */}
      <CounterfactualCard counterfactual={explainability.counterfactual} />
    </div>
  );
};

