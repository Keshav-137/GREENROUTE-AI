import React from 'react';
import { useRouteStore } from '@/store/routeStore';
import { ParetoChart } from '@/components/analytics/ParetoChart';
import { DepartureChart } from '@/components/analytics/DepartureChart';
import { ExplainPanel } from '@/components/explainability/ExplainPanel';
import { BarChart3, TrendingUp, Sparkles, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { routes, selectedRouteId, recommendedRouteId, setSelectedRouteId, planResult } =
    useRouteStore();

  const recommendedRoute =
    routes.find((r) => r.id === recommendedRouteId) || routes[0];

  if (!planResult || routes.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-forest-850/80 border border-forest-750/70 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-forest-800 flex items-center justify-center text-[#2f8a9d] mx-auto">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Analytics Data Generated</h3>
        <p className="text-xs text-forest-300 leading-relaxed">
          The Pareto frontier, SHAP feature attributions, and temporal departure charts require an active corridor session.
        </p>
        <button
          onClick={() => navigate('/planner')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1a5c47] to-[#2f8a9d] text-white text-xs font-semibold shadow-md transition"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Go to Route Planner</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Pareto Analysis & Temporal Departure Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Pareto Frontier Scatter Chart */}
        <div className="h-full">
          <ParetoChart
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
          />
        </div>

        {/* Departure Time Weather Sensitivity Chart */}
        <div className="h-full">
          <DepartureChart
            departureSlots={planResult.departure_analysis}
            comparison={planResult.departure_comparison}
          />
        </div>
      </div>

      {/* Bottom Section: Physics-ML Decision Explainability & Counterfactual Panel */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d8993a]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Explainable AI (XAI) & Counterfactual Sensitivity
          </h2>
        </div>

        <ExplainPanel
          explainability={planResult.explainability}
          recommendedRouteName={recommendedRoute?.name}
          isMock={planResult.data_status.is_mock}
        />
      </div>
    </div>
  );
};
