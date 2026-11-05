import React from 'react';
import { useRouteStore } from '@/store/routeStore';
import { CarbonReport } from '@/components/reports/CarbonReport';
import { FileSpreadsheet, Layers } from 'lucide-react';

export const CarbonReports: React.FC = () => {
  const { planResult, routes, selectedRouteId, setSelectedRouteId } =
    useRouteStore();

  const selectedRoute =
    routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6">
      {/* Route Switcher Pills if routes exist */}
      {routes.length > 1 && (
        <div className="p-3 rounded-xl bg-forest-850/80 border border-forest-750/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2f8a9d]" />
            <span className="font-semibold text-white">Select Route Profile for Audit:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {routes.map((r) => {
              const isSelected = r.id === selectedRouteId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isSelected
                      ? 'bg-[#1a5c47] text-white border border-[#267b5e]'
                      : 'bg-forest-800 text-forest-300 hover:text-white border border-forest-700'
                  }`}
                >
                  {r.name.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Carbon Report Component */}
      <CarbonReport planResult={planResult} selectedRoute={selectedRoute} />
    </div>
  );
};

