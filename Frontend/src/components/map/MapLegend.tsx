import React from 'react';
import { RouteCandidate } from '@/types';
import { ShieldAlert, Layers } from 'lucide-react';

interface MapLegendProps {
  routes: RouteCandidate[];
  selectedRouteId: string | null;
  recommendedRouteId: string | null;
  showRiskHeatmap: boolean;
  onToggleRiskHeatmap: (show: boolean) => void;
  onSelectRoute: (id: string) => void;
}

export const ROUTE_COLORS: Record<string, string> = {
  'route-opt-1': '#3ec99f', // Recommended / primary green
  'route-opt-2': '#c0504d', // Old ghat / high risk red
  'route-opt-3': '#2f8a9d', // Secondary teal alternative
  fallback_0: '#3ec99f',
  fallback_1: '#2f8a9d',
  fallback_2: '#d8993a',
};

export const MapLegend: React.FC<MapLegendProps> = ({
  routes,
  selectedRouteId,
  recommendedRouteId,
  showRiskHeatmap,
  onToggleRiskHeatmap,
  onSelectRoute,
}) => {
  return (
    <div className="absolute top-4 right-4 z-10 p-3 rounded-xl bg-forest-900/95 backdrop-blur-md border border-forest-750/80 shadow-2xl space-y-3 max-w-xs text-xs">
      <div className="flex items-center justify-between border-b border-forest-750/50 pb-2">
        <span className="font-semibold text-forest-100 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#2f8a9d]" /> Map Layers
        </span>
        <button
          onClick={() => onToggleRiskHeatmap(!showRiskHeatmap)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
            showRiskHeatmap
              ? 'bg-[#c0504d]/20 text-[#d96966] border border-[#c0504d]/40'
              : 'bg-forest-800 text-forest-400 border border-forest-700'
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          {showRiskHeatmap ? 'Risk Heatmap On' : 'Risk Heatmap Off'}
        </button>
      </div>

      {/* Route Color List */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-semibold text-forest-400">
          Route Alternatives
        </div>
        {routes.map((r, idx) => {
          const color = ROUTE_COLORS[r.id] || ROUTE_COLORS[`fallback_${idx % 3}`];
          const isSelected = r.id === selectedRouteId;
          const isRec = r.id === recommendedRouteId;

          return (
            <button
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition ${
                isSelected
                  ? 'bg-forest-800 border border-forest-650'
                  : 'hover:bg-forest-850/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-forest-200 text-xs">
                  {r.name.split(' (')[0]}
                </span>
              </div>

              {isRec && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#1a5c47] text-white flex-shrink-0 ml-1">
                  AI Pick
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Segment Risk Scale */}
      {showRiskHeatmap && (
        <div className="pt-2 border-t border-forest-750/50 space-y-1.5">
          <span className="text-[10px] uppercase font-semibold text-forest-400 block">
            Ghat Segment Hazard Index
          </span>
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#3ec99f] via-[#d8993a] to-[#c0504d]" />
          <div className="flex justify-between text-[10px] text-forest-400">
            <span>Low (&lt;0.3)</span>
            <span>Moderate</span>
            <span>High (&gt;0.6)</span>
          </div>
        </div>
      )}
    </div>
  );
};
